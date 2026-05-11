import logging
import os
import json
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure, ConfigurationError, OperationFailure

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
DB_NAME = os.environ.get("DB_NAME", "intermaven")

# Diagnostic: holds the *actual* connection error so /api/health/db can surface it.
DB_STARTUP_ERROR = None

# region agent log
_debug_log(
    "H3",
    "backend/config.py:mongo-env",
    "Mongo env detected at startup",
    {"has_mongo_url": bool(MONGO_URL), "db_name": DB_NAME},
)
# endregion

# Validate MONGO_URL
if not MONGO_URL:
    DB_STARTUP_ERROR = "MONGO_URL environment variable is not set"
    logger.error("MONGO_URL environment variable is not set!")
    logger.error("Please set a valid MongoDB connection string in your .env file or environment.")
    db = None
    # region agent log
    _debug_log("H4", "backend/config.py:mongo-missing", "MONGO_URL missing", {})
    # endregion
else:
    # Check for placeholder password (common mistake)
    if "<db_password>" in MONGO_URL or "placeholder" in MONGO_URL.lower():
        DB_STARTUP_ERROR = "MONGO_URL still contains a placeholder password. Replace it with the actual password."
        logger.error("MONGO_URL contains a placeholder password. Please replace it with your actual password.")
        logger.error("Example: mongodb+srv://username:actualpassword@cluster.mongodb.net/dbname")
        db = None
        _debug_log("H4", "backend/config.py:mongo-placeholder", "MONGO_URL has placeholder", {"url": MONGO_URL[:50]})
    else:
        # Attempt to connect
        try:
            client = MongoClient(
                MONGO_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                retryWrites=True
            )
            # Verify connection with a ping (handles auth errors)
            client.admin.command('ping')
            db = client[DB_NAME]
            logger.info(f"✓ Successfully connected to MongoDB: {DB_NAME}")
            _debug_log("H4", "backend/config.py:mongo-ping", "Mongo ping succeeded", {"db_name": DB_NAME})
        except (ServerSelectionTimeoutError, ConnectionFailure, ConfigurationError, OperationFailure) as e:
            DB_STARTUP_ERROR = f"{type(e).__name__}: {str(e)[:500]}"
            logger.error(f"✗ Failed to connect to MongoDB: {e}")
            logger.error("Check your MONGO_URL, network, and IP whitelist (if using Atlas).")
            db = None
            _debug_log("H4", "backend/config.py:mongo-ping-failed", "Mongo connection failed", {"error": str(e), "db_name": DB_NAME})
        except Exception as e:
            # Catch unexpected errors too (e.g., missing dnspython for mongodb+srv://, DNS SRV resolution failures)
            DB_STARTUP_ERROR = f"{type(e).__name__}: {str(e)[:500]}"
            logger.error(f"✗ Unexpected MongoDB connection error: {e}")
            db = None
            _debug_log("H4", "backend/config.py:mongo-ping-unexpected", "Unexpected error", {"error": str(e)})

# Other configuration values (safe even if db is None)
JWT_SECRET = os.environ.get("JWT_SECRET", "intermaven_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET")
STORAGE_REGION = os.environ.get("STORAGE_REGION", "us-east-1")
STORAGE_ENDPOINT_URL = os.environ.get("STORAGE_ENDPOINT_URL")
STORAGE_BASE_URL = os.environ.get("STORAGE_BASE_URL")

PLAN_CREDITS = {"free": 150, "creator": 600, "pro": 2500}