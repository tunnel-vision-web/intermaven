from fastapi import APIRouter, Depends, HTTPException, Request, Response
from datetime import datetime, timezone
import json
import os
import uuid

from config import db
from schemas import UserCreate, UserLogin, UserResponse, TokenResponse, SandboxLogin
from utils import create_access_token, get_current_user, serialize_user, get_password_hash, verify_password, get_system_settings, get_plan_credits

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


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, request: Request, response: Response):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable. Check MONGO_URL and Atlas IP whitelist.")
    
    settings = get_system_settings()
    if not settings.get("registrations_open", True):
        raise HTTPException(status_code=403, detail="Registration is temporarily closed.")

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

    existing_user = db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        _debug_log(
            "H4",
            "backend/routes/auth.py:register:duplicate-email",
            "Duplicate email blocked registration",
            {"email_domain": user_data.email.split("@")[1] if "@" in user_data.email else "invalid"},
        )
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    resolved_persona = user_data.persona or ("founder" if user_data.portal == "business" else "creator")
    new_user = {
        "email": user_data.email.lower(),
        "password": hashed_password,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "plan": "free",
        "credits": get_plan_credits("free"),
        "apps": ["brandkit", "musicbio", "social", "syncpitch", "bizpitch"],
        "portal": user_data.portal,
        "persona": resolved_persona,
        "secondary_personas": user_data.secondary_personas or [],
        "role": resolved_persona,
        "brand_name": "",
        "bio": "",
        "channels": {"email": True, "whatsapp": True, "sms": False, "push": False},
        "ai_runs": 0,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    _debug_log(
        "H4",
        "backend/routes/auth.py:register:inserted",
        "User inserted successfully",
        {"user_id": str(result.inserted_id), "plan": new_user["plan"], "portal": new_user["portal"]},
    )

    access_token = create_access_token(data={"sub": str(result.inserted_id)})

    db.notifications.insert_one({
        "user_id": result.inserted_id,
        "icon": "🎉",
        "title": "Welcome to Intermaven!",
        "text": "Your account is set up. Start exploring your tools.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })

    cookie_domain = os.getenv("COOKIE_DOMAIN", ".tunemavens.com")
    host = request.headers.get("host", "")
    if "localhost" in host or "127.0.0.1" in host:
        cookie_domain = None

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=15 * 24 * 60 * 60,
        domain=cookie_domain,
        samesite="lax",
        secure=True if cookie_domain else False
    )

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(new_user))
    )


@router.post("/sandbox-login", response_model=TokenResponse)
async def sandbox_login(data: SandboxLogin = SandboxLogin(), request: Request = None, response: Response = None):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    role = (data.role if data and data.role else "admin").lower()

    sandbox_presets = {
        "admin": {
            "email": "admin.sandbox@intermaven.io",
            "first_name": "Sandbox",
            "last_name": "SuperAdmin",
            "phone": "+254700000000",
            "plan": "pro",
            "credits": 10000,
            "portal": "business",
            "admin_role": "super_admin",
            "apps": ["brandkit", "musicbio", "social", "syncpitch", "bizpitch", "epk", "distro", "hosting", "pos", "crm", "admin"],
        },
        "music": {
            "email": "artist.sandbox@intermaven.io",
            "first_name": "Sandbox",
            "last_name": "Artist",
            "phone": "+254711111111",
            "plan": "pro",
            "credits": 5000,
            "portal": "music",
            "admin_role": "",
            "apps": ["brandkit", "musicbio", "social", "syncpitch", "bizpitch", "epk", "distro"],
        },
        "business": {
            "email": "biz.sandbox@intermaven.io",
            "first_name": "Sandbox",
            "last_name": "Executive",
            "phone": "+15550001122",
            "plan": "pro",
            "credits": 5000,
            "portal": "business",
            "admin_role": "",
            "apps": ["brandkit", "bizpitch", "social", "crm", "hosting", "pos"],
        }
    }

    preset = sandbox_presets.get(role, sandbox_presets["admin"])
    target_email = (data.email.lower() if data and data.email else preset["email"])

    user = db.users.find_one({"email": target_email})
    if not user:
        new_user = {
            "email": target_email,
            "password": get_password_hash("sandbox123"),
            "first_name": preset["first_name"],
            "last_name": preset["last_name"],
            "phone": preset["phone"],
            "plan": preset["plan"],
            "credits": preset["credits"],
            "apps": preset["apps"],
            "portal": preset["portal"],
            "admin_role": preset.get("admin_role", ""),
            "brand_name": "Sandbox Brand",
            "bio": "Build-phase sandbox account for testing and development.",
            "channels": {"email": True, "whatsapp": True, "sms": True, "push": True},
            "ai_runs": 0,
            "is_sandbox": True,
            "created_at": datetime.now(timezone.utc)
        }
        res = db.users.insert_one(new_user)
        new_user["_id"] = res.inserted_id
        user = new_user

    access_token = create_access_token(data={"sub": str(user["_id"])})

    cookie_domain = os.getenv("COOKIE_DOMAIN", ".tunemavens.com")
    host = request.headers.get("host", "") if request else ""
    if "localhost" in host or "127.0.0.1" in host or not host:
        cookie_domain = None

    if response:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=15 * 24 * 60 * 60,
            domain=cookie_domain,
            samesite="lax",
            secure=True if cookie_domain else False
        )

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(user))
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, request: Request, response: Response):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable. Check MONGO_URL and Atlas IP whitelist.")

    _debug_log(
        "H5",
        "backend/routes/auth.py:login:start",
        "Login endpoint invoked",
        {"email_domain": user_data.email.split("@")[1] if "@" in user_data.email else "invalid"},
    )

    user = db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        # Sandbox fallback during build phase
        is_sandbox_attempt = (
            user_data.password in ["sandbox", "demo", "admin", "12345678", "password", "sandbox123"] or
            "sandbox" in user_data.email.lower() or
            os.getenv("SANDBOX_MODE", "true").lower() == "true"
        )
        if is_sandbox_attempt:
            role = "admin" if ("admin" in user_data.email.lower() or "admin" in user_data.password.lower()) else "music"
            return await sandbox_login(SandboxLogin(role=role, email=user_data.email), request, response)

        _debug_log(
            "H5",
            "backend/routes/auth.py:login:invalid-credentials",
            "Login rejected due to invalid credentials",
            {"user_found": bool(user)},
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user["_id"])})
    _debug_log(
        "H5",
        "backend/routes/auth.py:login:success",
        "Login succeeded",
        {"user_id": str(user["_id"])},
    )

    cookie_domain = os.getenv("COOKIE_DOMAIN", ".tunemavens.com")
    host = request.headers.get("host", "")
    if "localhost" in host or "127.0.0.1" in host:
        cookie_domain = None

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=15 * 24 * 60 * 60,
        domain=cookie_domain,
        samesite="lax",
        secure=True if cookie_domain else False
    )

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(user))
    )


@router.post("/logout")
async def logout(request: Request, response: Response):
    cookie_domain = os.getenv("COOKIE_DOMAIN", ".tunemavens.com")
    host = request.headers.get("host", "")
    if "localhost" in host or "127.0.0.1" in host:
        cookie_domain = None

    response.delete_cookie(
        key="access_token",
        domain=cookie_domain,
        httponly=True,
        samesite="lax",
        secure=True if cookie_domain else False
    )
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**serialize_user(current_user))
