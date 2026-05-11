from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import json
import os
import uuid

from config import db, PLAN_CREDITS
from schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from utils import create_access_token, get_current_user, serialize_user, get_password_hash, verify_password

router = APIRouter(prefix="/api/auth")

# region agent log
_DEBUG_LOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "debug-4d502b.log"))

def _debug_log(hypothesis_id: str, location: str, message: str, data: dict, run_id: str = "pre-fix"):
    try:
        with open(_DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps({
                "sessionId": "4d502b",
                "runId": run_id,
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

# region agent log
_debug_log(
    "H6",
    "backend/routes/auth.py:module-import",
    "Auth routes module loaded",
    {"log_path": _DEBUG_LOG_PATH},
)
# endregion


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable. Check MONGO_URL and Atlas IP whitelist.")
    # region agent log
    _debug_log(
        "H3",
        "backend/routes/auth.py:register:start",
        "Register endpoint invoked",
        {
            "email_domain": user_data.email.split("@")[1] if "@" in user_data.email else "invalid",
            "has_first_name": bool(user_data.first_name),
            "has_last_name": bool(user_data.last_name),
            "has_phone": bool(user_data.phone),
            "portal": user_data.portal,
            "password_length": len(user_data.password),
        },
    )
    # endregion
    existing_user = db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        # region agent log
        _debug_log(
            "H4",
            "backend/routes/auth.py:register:duplicate-email",
            "Duplicate email blocked registration",
            {"email_domain": user_data.email.split("@")[1] if "@" in user_data.email else "invalid"},
        )
        # endregion
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
        "apps": ["brandkit", "musicbio", "social", "syncpitch", "bizpitch"],
        "portal": user_data.portal,
        "brand_name": "",
        "bio": "",
        "channels": {"email": True, "whatsapp": True, "sms": False, "push": False},
        "ai_runs": 0,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    # region agent log
    _debug_log(
        "H4",
        "backend/routes/auth.py:register:inserted",
        "User inserted successfully",
        {"user_id": str(result.inserted_id), "plan": new_user["plan"], "portal": new_user["portal"]},
    )
    # endregion

    access_token = create_access_token(data={"sub": str(result.inserted_id)})

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


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable. Check MONGO_URL and Atlas IP whitelist.")
    # region agent log
    _debug_log(
        "H5",
        "backend/routes/auth.py:login:start",
        "Login endpoint invoked",
        {"email_domain": user_data.email.split("@")[1] if "@" in user_data.email else "invalid"},
    )
    # endregion
    user = db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        # region agent log
        _debug_log(
            "H5",
            "backend/routes/auth.py:login:invalid-credentials",
            "Login rejected due to invalid credentials",
            {"user_found": bool(user)},
        )
        # endregion
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user["_id"])})
    # region agent log
    _debug_log(
        "H5",
        "backend/routes/auth.py:login:success",
        "Login succeeded",
        {"user_id": str(user["_id"])},
    )
    # endregion
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(user))
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**serialize_user(current_user))
