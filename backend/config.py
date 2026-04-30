import logging
import os
import json
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure, ConfigurationError

load_dotenv()

# region agent log
def _debug_log(hypothesis_id: str, location: str, message: str, data: dict):
    try:
        with open("debug-ef0398.log", "a", encoding="utf-8") as _f:
            _f.write(json.dumps({
                "sessionId": "ef0398",
                "runId": os.environ.get("RENDER_GIT_COMMIT", "local"),
                "hypothesisId": hypothesis_id,
                "id": f"log_{uuid.uuid4().hex}",
                "location": location,
                "message": message,
                "data": data,
                "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
            }) + "\n")
    except Exception:
        pass
# endregion

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("intermaven")

MONGO_URL = os.environ.get("MONGO_URL")
# region agent log
_debug_log(
    "H3",
    "backend/config.py:mongo-env",
    "Mongo env detected at startup",
    {"has_mongo_url": bool(MONGO_URL), "db_name": os.environ.get("DB_NAME", "intermaven")},
)
# endregion

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
    # region agent log
    _debug_log("H4", "backend/config.py:mongo-ping", "Mongo ping succeeded", {"db_name": DB_NAME})
    # endregion
except (ServerSelectionTimeoutError, ConnectionFailure, ConfigurationError) as e:
    logger.error(f"✗ Failed to connect to MongoDB: {e}")
    logger.error(f"MONGO_URL used: {MONGO_URL}")
    # region agent log
    _debug_log("H4", "backend/config.py:mongo-ping-failed", "Mongo ping failed at startup", {"error": str(e), "db_name": DB_NAME})
    # endregion
    # Continue anyway - connection may be established later
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000, connectTimeoutMS=10000, retryWrites=True)
    except Exception as fallback_error:
        logger.error(f"✗ Invalid MongoDB URL; using local fallback client: {fallback_error}")
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000, connectTimeoutMS=10000, retryWrites=True)

db = client[DB_NAME]

JWT_SECRET = os.environ.get("JWT_SECRET", "intermaven_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET")
STORAGE_REGION = os.environ.get("STORAGE_REGION", "us-east-1")
STORAGE_ENDPOINT_URL = os.environ.get("STORAGE_ENDPOINT_URL")
STORAGE_BASE_URL = os.environ.get("STORAGE_BASE_URL")

PLAN_CREDITS = {"free": 150, "creator": 600, "pro": 2500}