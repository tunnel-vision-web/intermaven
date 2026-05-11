import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
print(f"Testing connection with URL: {MONGO_URL[:50]}...")

try:
    # Try connecting with more detailed error reporting
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
    
    # Try to ping
    print("Attempting to ping server...")
    client.admin.command('ping')
    print("✓ SUCCESS! Connected to MongoDB")
    
    # Try to list databases
    print("\nDatabases available:")
    for db_name in client.list_database_names():
        print(f"  - {db_name}")
    
    # Try to use our database
    db = client['intermaven']
    print(f"\n✓ Using database: intermaven")
    
    # Try to list collections
    print("Collections in 'intermaven':")
    for coll in db.list_collection_names():
        print(f"  - {coll}")
    
except Exception as e:
    print(f"✗ FAILED: {type(e).__name__}: {e}")
    print("\nPossible issues:")
    print("1. Wrong username or password")
    print("2. User doesn't have access to this database")
    print("3. Database name is incorrect")
    print("4. Cluster name in URL is wrong")
    print("\nPlease verify:")
    print("- Username: tunnelandvision_db_user")
    print("- Password: Alphablak@888 (URL encoded as Alphablak%40888)")
    print("- Cluster: intermaven-c.vjbwldo.mongodb.net")
    print("- Database: intermaven")