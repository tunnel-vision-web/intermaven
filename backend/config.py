import logging
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("intermaven")

MONGO_URL = os.environ.get("MONGO_URL")

# Validate MongoDB URL
if not MONGO_URL:
    logger.error("MONGO_URL environment variable is not set!")
    logger.warning("MongoDB connection will fail. Please set MONGO_URL in environment variables.")
    MONGO_URL = "mongodb://localhost:27017"

DB_NAME = os.environ.get("DB_NAME", "intermaven")

# Create MongoDB client with error handling
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000, connectTimeoutMS=10000, retryWrites=True)
    # Verify connection
    client.admin.command('ping')
    logger.info(f"✓ Successfully connected to MongoDB: {DB_NAME}")
except (ServerSelectionTimeoutError, ConnectionFailure) as e:
    logger.error(f"✗ Failed to connect to MongoDB: {e}")
    logger.error(f"MONGO_URL used: {MONGO_URL}")
    # Continue anyway - connection may be established later
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000, connectTimeoutMS=10000, retryWrites=True)

db = client[DB_NAME]

JWT_SECRET = os.environ.get("JWT_SECRET", "intermaven_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET")
STORAGE_REGION = os.environ.get("STORAGE_REGION", "us-east-1")
STORAGE_ENDPOINT_URL = os.environ.get("STORAGE_ENDPOINT_URL")
STORAGE_BASE_URL = os.environ.get("STORAGE_BASE_URL")

PLAN_CREDITS = {"free": 150, "creator": 600, "pro": 2500}