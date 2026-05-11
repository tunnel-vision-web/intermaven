# MongoDB Authentication Fix - Final Steps

## What We've Tried (All Failed)
1. ✅ URL-encoded the password (`@` → `%40`)
2. ✅ Confirmed IP whitelist is set to `0.0.0.0/0`
3. ✅ Verified database name is `intermaven`
4. ✅ Verified cluster name is `intermaven-c`
5. ✅ Confirmed user has full admin privileges
6. ✅ Tried `authSource=admin` parameter
7. ✅ Restarted backend server multiple times

## The Real Issue

Despite all these fixes, we're still getting:
```
OperationFailure: bad auth : authentication failed
```

This error **only occurs when**:
- The username/password combination is incorrect, OR
- The user doesn't exist, OR
- The user exists but with a different password

## Definitive Solution

You need to **reset the password** in MongoDB Atlas to ensure you have the correct one:

### Step 1: Reset Password in MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Database Access** (under Security)
3. Find user `tunnelandvision_db_user`
4. Click **Edit** → **Edit Password**
5. Set a **new, simple password** (e.g., `Test123!@#`)
   - Avoid special characters that need URL encoding for testing
6. Click **Update User**

### Step 2: Update `.env` File
Edit `backend/.env` and replace the password:

**Current:**
```
MONGO_URL=mongodb+srv://tunnelandvision_db_user:Alphablak%40888@intermaven-c.vjbwldo.mongodb.net/intermaven?retryWrites=true&w=majority&authSource=admin
```

**New (example with Test123!@#):**
```
MONGO_URL=mongodb+srv://tunnelandvision_db_user:Test123%21%40%23@intermaven-c.vjbwldo.mongodb.net/intermaven?retryWrites=true&w=majority
```

Note: Special characters in the new password must also be URL-encoded:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`

### Step 3: Test Connection
Run the test script:
```bash
cd backend
python test_connection.py
```

You should see:
```
✓ SUCCESS! Connected to MongoDB
```

### Step 4: Restart Backend
```bash
python server.py
```

Look for:
```
✓ Successfully connected to MongoDB: intermaven
```

## Alternative: Get Connection String Directly from Atlas

If resetting the password seems risky, you can get the exact connection string from MongoDB Atlas:

1. Go to your cluster `intermaven-c`
2. Click **Connect**
3. Choose **Connect your application**
4. Copy the connection string provided
5. Replace the `<password>` placeholder with your actual password (URL-encoded)
6. Update `backend/.env` with this exact string

This ensures the cluster name and format are 100% correct.

## After MongoDB is Working

Once the backend connects successfully, the registration and login will work. Then you can:

1. Start the frontend (if not already running):
   ```bash
   cd frontend
   npm start
   ```

2. Go to `http://localhost:3000/auth`

3. Test registration with a test account

4. Verify you can log in

## Summary

The issue is definitely the password. Please reset it in MongoDB Atlas and update the `.env` file accordingly.