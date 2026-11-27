from fastapi import APIRouter, Depends, HTTPException, Request, Response
from datetime import datetime, timedelta, timezone
import hashlib
import logging
import os
import secrets
import httpx

from config import db
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse, SandboxLogin,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
)
from utils import create_access_token, get_current_user, serialize_user, get_password_hash, verify_password, get_system_settings, get_plan_credits

router = APIRouter(prefix="/api/auth")
logger = logging.getLogger("intermaven.auth")

RESET_TOKEN_TTL_MINUTES = 60
RESET_COOLDOWN_SECONDS = 60


def _hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


async def _send_password_reset_email(to_email: str, reset_url: str, first_name: str = "") -> None:
    """Send password reset email via Resend if configured; otherwise log for local dev."""
    resend_key = os.getenv("RESEND_API_KEY", "").strip()
    from_email = os.getenv("RESEND_FROM_EMAIL", "Intermaven <noreply@intermaven.io>")
    if not resend_key:
        logger.info("RESEND_API_KEY not set — password reset link for %s: %s", to_email, reset_url)
        return

    greeting = f"Hi {first_name}," if first_name else "Hi,"
    html_body = (
        f"<p>{greeting}</p>"
        "<p>We received a request to reset your Intermaven password. "
        f"<a href=\"{reset_url}\">Click here to reset your password</a> (valid for {RESET_TOKEN_TTL_MINUTES} minutes).</p>"
        "<p>If you didn't request this, you can safely ignore this email.</p>"
    )
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                json={
                    "from": from_email,
                    "to": [to_email],
                    "subject": "Reset your Intermaven password",
                    "html": html_body,
                },
            )
            if resp.status_code >= 400:
                logger.warning("Resend password reset email failed (%s): %s", resp.status_code, resp.text)
    except Exception as exc:
        logger.warning("Failed to send password reset email via Resend: %s", exc)


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, request: Request, response: Response):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable. Check MONGO_URL and Atlas IP whitelist.")
    
    settings = get_system_settings()
    if not settings.get("registrations_open", True):
        raise HTTPException(status_code=403, detail="Registration is temporarily closed.")

    existing_user = db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
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

        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user["_id"])})

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


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, request: Request):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    email = payload.email.lower().strip()
    generic_response = {
        "success": True,
        "message": "If an account with that email exists, a password reset link has been sent.",
    }

    user = db.users.find_one({"email": email})
    if not user:
        return generic_response

    now = datetime.now(timezone.utc)
    recent_cutoff = now - timedelta(seconds=RESET_COOLDOWN_SECONDS)
    recent_request = db.password_resets.find_one({
        "user_id": user["_id"],
        "created_at": {"$gte": recent_cutoff},
    })
    if recent_request:
        return generic_response

    # Invalidate any prior unused tokens for this user
    db.password_resets.update_many(
        {"user_id": user["_id"], "used": False},
        {"$set": {"used": True, "invalidated_at": now}},
    )

    raw_token = secrets.token_urlsafe(32)
    db.password_resets.insert_one({
        "user_id": user["_id"],
        "email": email,
        "token_hash": _hash_reset_token(raw_token),
        "used": False,
        "created_at": now,
        "expires_at": now + timedelta(minutes=RESET_TOKEN_TTL_MINUTES),
    })

    frontend_origin = request.headers.get("origin") or os.getenv("FRONTEND_URL", "https://intermaven.io")
    reset_url = f"{frontend_origin.rstrip('/')}/auth?mode=reset&token={raw_token}"
    await _send_password_reset_email(email, reset_url, user.get("first_name", ""))
    return generic_response


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    now = datetime.now(timezone.utc)
    token_doc = db.password_resets.find_one({
        "token_hash": _hash_reset_token(payload.token),
        "used": False,
    })
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    expires_at = token_doc.get("expires_at")
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if not expires_at or expires_at < now:
        db.password_resets.update_one({"_id": token_doc["_id"]}, {"$set": {"used": True}})
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    db.users.update_one(
        {"_id": token_doc["user_id"]},
        {"$set": {"password": get_password_hash(payload.new_password), "updated_at": now}},
    )
    db.password_resets.update_one(
        {"_id": token_doc["_id"]},
        {"$set": {"used": True, "used_at": now}},
    )
    return {"success": True, "message": "Password has been reset. You can now sign in."}


@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    if not verify_password(payload.current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": get_password_hash(payload.new_password), "updated_at": datetime.now(timezone.utc)}},
    )
    return {"success": True, "message": "Password updated successfully."}
