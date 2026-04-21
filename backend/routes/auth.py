from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from config import db, PLAN_CREDITS
from schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from utils import create_access_token, get_current_user, serialize_user, get_password_hash, verify_password

router = APIRouter(prefix="/api/auth")


@router.post("/register", response_model=TokenResponse)
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
    user = db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user["_id"])})
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(user))
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**serialize_user(current_user))
