from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI(title="Intermaven API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "intermaven")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "intermaven_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Credit allocations by plan
PLAN_CREDITS = {"free": 150, "creator": 600, "pro": 2500}

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: Optional[str] = ""
    phone: Optional[str] = ""
    portal: Optional[str] = "music"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    portal: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    plan: str
    credits: int
    apps: List[str]
    portal: str
    brand_name: str
    bio: str
    created_at: str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AppToggle(BaseModel):
    app_id: str

class AIGenerateRequest(BaseModel):
    tool_id: str
    inputs: dict

class PlanUpgrade(BaseModel):
    plan: str
    payment_method: str

# ============== HELPER FUNCTIONS ==============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user.get("email", ""),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "phone": user.get("phone", ""),
        "plan": user.get("plan", "free"),
        "credits": user.get("credits", 150),
        "apps": user.get("apps", []),
        "portal": user.get("portal", "music"),
        "brand_name": user.get("brand_name", ""),
        "bio": user.get("bio", ""),
        "created_at": user.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", ""))
    }

# ============== AUTH ROUTES ==============

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing_user = db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "email": user_data.email.lower(),
        "password": hashed_password,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "plan": "free",
        "credits": PLAN_CREDITS["free"],
        "apps": ["brandkit", "social"],
        "portal": user_data.portal,
        "brand_name": "",
        "bio": "",
        "channels": {"email": True, "whatsapp": True, "sms": False, "push": False},
        "ai_runs": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    # Create welcome notification
    db.notifications.insert_one({
        "user_id": result.inserted_id,
        "icon": "🎉",
        "title": "Welcome to Intermaven!",
        "text": "Your account is set up. Start exploring your tools.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(new_user))
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(user))
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**serialize_user(current_user))

# ============== USER ROUTES ==============

@app.put("/api/user/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        db.users.update_one({"_id": current_user["_id"]}, {"$set": update_dict})
    
    updated_user = db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**serialize_user(updated_user))

@app.post("/api/user/apps/toggle", response_model=UserResponse)
async def toggle_app(app_data: AppToggle, current_user: dict = Depends(get_current_user)):
    apps = current_user.get("apps", [])
    if app_data.app_id in apps:
        apps.remove(app_data.app_id)
    else:
        apps.append(app_data.app_id)
    
    db.users.update_one({"_id": current_user["_id"]}, {"$set": {"apps": apps}})
    updated_user = db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**serialize_user(updated_user))

@app.get("/api/user/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    # Get AI runs this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    ai_runs = db.ai_runs.count_documents({
        "user_id": current_user["_id"],
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "credits": current_user.get("credits", 0),
        "plan": current_user.get("plan", "free"),
        "ai_runs_week": ai_runs,
        "active_apps": len(current_user.get("apps", [])),
        "scheduled_posts": 0
    }

# ============== NOTIFICATIONS ==============

@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = list(db.notifications.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20))
    
    for n in notifications:
        if isinstance(n.get("created_at"), datetime):
            n["created_at"] = n["created_at"].isoformat()
    
    unread_count = db.notifications.count_documents({
        "user_id": current_user["_id"],
        "read": False
    })
    
    return {"notifications": notifications, "unread_count": unread_count}

@app.post("/api/notifications/mark-read")
async def mark_notifications_read(current_user: dict = Depends(get_current_user)):
    db.notifications.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"read": True}}
    )
    return {"success": True}

# ============== AI GENERATION ==============

TOOL_COSTS = {
    "brandkit": 10,
    "musicbio": 15,
    "social": 0,
    "syncpitch": 20,
    "bizpitch": 18
}

TOOL_PROMPTS = {
    "brandkit": lambda v: f"""Senior brand strategist for African creative businesses.
Name: {v.get('name', '')} Industry: {v.get('industry', '')} Audience: {v.get('audience', '')} Vibe: {v.get('vibe', '')} Extra: {v.get('extra', '')}

Create a complete brand kit with:
1. BRAND NAME ANALYSIS
2. TAGLINE OPTIONS (3+ with rationale)
3. TONE OF VOICE (3-4 principles)
4. COLOUR DIRECTION
5. POSITIONING STATEMENT
6. BRAND PERSONALITY (5 adjectives + anti-adjective)
Be specific to African/Nairobi market.""",
    
    "musicbio": lambda v: f"""Music PR professional placing African artists internationally.
Artist: {v.get('artist', '')} Genre: {v.get('genre', '')} Origin: {v.get('origin', '')} Story: {v.get('story', '')} Tone: {v.get('tone', '')} Extra: {v.get('extra', '')}

Create:
1. SHORT BIO (100 words)
2. FULL BIO (250 words)
3. PRESS NARRATIVE (3 paragraphs)
4. MEDIA PITCH (150 words)
5. 3 INTERVIEW ANGLES""",
    
    "social": lambda v: f"""Social media strategist for African creatives.
Topic: {v.get('topic', '')} Platform: {v.get('platform', '')} Goal: {v.get('goal', '')} Tone: {v.get('tone', '')} Extra: {v.get('extra', '')}

Create:
1. 3 caption variations for {v.get('platform', 'the platform')}
2. 8 relevant hashtags
3. Best posting time for Nairobi audiences
4. One engagement tip""",
    
    "syncpitch": lambda v: f"""Sync licensing agent placing African music globally.
Artist: {v.get('artist', '')} Track: {v.get('track', '')} Target: {v.get('target', '')} Mood: {v.get('mood', '')} Extra: {v.get('extra', '')}

Create:
1. SUBJECT LINE (3 options)
2. PITCH EMAIL (200-250 words for {v.get('target', 'the target')})
3. TRACK DESCRIPTION (60 words)
4. USAGE SUGGESTIONS (3 scenarios)
5. RIGHTS SUMMARY""",
    
    "bizpitch": lambda v: f"""Startup pitch consultant, East African investment landscape.
Business: {v.get('business', '')} Sector: {v.get('sector', '')} Problem: {v.get('problem', '')} Audience: {v.get('audience', '')} Extra: {v.get('extra', '')}

Create:
1. PROBLEM STATEMENT
2. SOLUTION SLIDE COPY
3. MARKET OPPORTUNITY
4. TRACTION SECTION
5. CALL TO ACTION"""
}

@app.post("/api/ai/generate")
async def generate_ai_content(request: AIGenerateRequest, current_user: dict = Depends(get_current_user)):
    tool_id = request.tool_id
    inputs = request.inputs
    
    if tool_id not in TOOL_COSTS:
        raise HTTPException(status_code=400, detail="Invalid tool ID")
    
    cost = TOOL_COSTS[tool_id]
    if cost > 0 and current_user.get("credits", 0) < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    prompt = TOOL_PROMPTS[tool_id](inputs)
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"intermaven-{str(current_user['_id'])}-{tool_id}",
            system_message="You are a helpful AI assistant specialized in African creative and business markets."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Deduct credits
        if cost > 0:
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$inc": {"credits": -cost, "ai_runs": 1}}
            )
        
        # Log AI run
        db.ai_runs.insert_one({
            "user_id": current_user["_id"],
            "tool_id": tool_id,
            "cost": cost,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Log activity
        db.activities.insert_one({
            "user_id": current_user["_id"],
            "type": "ai_generation",
            "tool_id": tool_id,
            "created_at": datetime.now(timezone.utc)
        })
        
        updated_user = db.users.find_one({"_id": current_user["_id"]})
        
        return {
            "success": True,
            "content": response,
            "credits_used": cost,
            "credits_remaining": updated_user.get("credits", 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# ============== ACTIVITY ==============

@app.get("/api/activities")
async def get_activities(current_user: dict = Depends(get_current_user)):
    activities = list(db.activities.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(10))
    
    for a in activities:
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()
    
    return {"activities": activities}

# ============== PESAPAL PAYMENTS ==============

PESAPAL_ENV = os.environ.get("PESAPAL_ENVIRONMENT", "sandbox")
PESAPAL_BASE_URL = os.environ.get("PESAPAL_SANDBOX_BASE_URL") if PESAPAL_ENV == "sandbox" else os.environ.get("PESAPAL_PROD_BASE_URL")
PESAPAL_CONSUMER_KEY = os.environ.get("PESAPAL_CONSUMER_KEY", "")
PESAPAL_CONSUMER_SECRET = os.environ.get("PESAPAL_CONSUMER_SECRET", "")

async def get_pesapal_token():
    if not PESAPAL_CONSUMER_KEY or not PESAPAL_CONSUMER_SECRET:
        raise HTTPException(status_code=500, detail="Pesapal credentials not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PESAPAL_BASE_URL}/api/Auth/RequestToken",
            json={
                "consumer_key": PESAPAL_CONSUMER_KEY,
                "consumer_secret": PESAPAL_CONSUMER_SECRET
            },
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        raise HTTPException(status_code=500, detail="Failed to get Pesapal token")

class PaymentInitiate(BaseModel):
    plan: str
    amount: int
    phone: Optional[str] = None
    callback_url: str

@app.post("/api/payments/initiate")
async def initiate_payment(payment: PaymentInitiate, current_user: dict = Depends(get_current_user)):
    if payment.plan not in PLAN_CREDITS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Create pending transaction
    transaction = {
        "user_id": current_user["_id"],
        "plan": payment.plan,
        "amount": payment.amount,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    result = db.transactions.insert_one(transaction)
    transaction_id = str(result.inserted_id)
    
    # If Pesapal is not configured, return mock response
    if not PESAPAL_CONSUMER_KEY:
        return {
            "success": True,
            "transaction_id": transaction_id,
            "message": "Payment integration pending configuration. Contact support.",
            "mock": True
        }
    
    try:
        token = await get_pesapal_token()
        
        async with httpx.AsyncClient() as client:
            order_data = {
                "id": transaction_id,
                "currency": "KES",
                "amount": payment.amount,
                "description": f"Intermaven {payment.plan.capitalize()} Plan",
                "callback_url": payment.callback_url,
                "notification_id": "",
                "billing_address": {
                    "email_address": current_user.get("email"),
                    "phone_number": payment.phone or current_user.get("phone", ""),
                    "first_name": current_user.get("first_name", ""),
                    "last_name": current_user.get("last_name", "")
                }
            }
            
            response = await client.post(
                f"{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest",
                json=order_data,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                db.transactions.update_one(
                    {"_id": result.inserted_id},
                    {"$set": {"order_tracking_id": data.get("order_tracking_id")}}
                )
                return {
                    "success": True,
                    "transaction_id": transaction_id,
                    "redirect_url": data.get("redirect_url"),
                    "order_tracking_id": data.get("order_tracking_id")
                }
            
            raise HTTPException(status_code=500, detail="Payment initiation failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payments/callback")
async def payment_callback(data: dict):
    order_tracking_id = data.get("OrderTrackingId")
    
    transaction = db.transactions.find_one({"order_tracking_id": order_tracking_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Verify payment status with Pesapal
    if PESAPAL_CONSUMER_KEY:
        try:
            token = await get_pesapal_token()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    status_data = response.json()
                    payment_status = status_data.get("payment_status_description", "").lower()
                    
                    if payment_status == "completed":
                        # Update transaction
                        db.transactions.update_one(
                            {"_id": transaction["_id"]},
                            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
                        )
                        
                        # Update user plan and credits
                        plan = transaction["plan"]
                        db.users.update_one(
                            {"_id": transaction["user_id"]},
                            {"$set": {"plan": plan, "credits": PLAN_CREDITS[plan]}}
                        )
                        
                        # Create notification
                        db.notifications.insert_one({
                            "user_id": transaction["user_id"],
                            "icon": "💳",
                            "title": "Payment Successful!",
                            "text": f"Your {plan.capitalize()} plan is now active.",
                            "read": False,
                            "created_at": datetime.now(timezone.utc)
                        })
                        
                        return {"success": True, "status": "completed"}
        except Exception as e:
            pass
    
    return {"success": False, "status": "pending"}

@app.get("/api/payments/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    transactions = list(db.transactions.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20))
    
    for t in transactions:
        if isinstance(t.get("created_at"), datetime):
            t["created_at"] = t["created_at"].isoformat()
        if isinstance(t.get("completed_at"), datetime):
            t["completed_at"] = t["completed_at"].isoformat()
    
    return {"transactions": transactions}

# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Intermaven API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
