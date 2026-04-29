import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import (
    db,
    JWT_SECRET,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    STORAGE_BUCKET,
    STORAGE_REGION,
    STORAGE_ENDPOINT_URL,
    STORAGE_BASE_URL,
)

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_ROLES = {"super_admin", "admin", "support", "finance"}


def get_s3_client():
    session = boto3.session.Session()
    client_kwargs = {
        "region_name": STORAGE_REGION,
    }

    aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID")
    aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
    aws_session_token = os.environ.get("AWS_SESSION_TOKEN")

    if aws_access_key_id and aws_secret_access_key:
        client_kwargs["aws_access_key_id"] = aws_access_key_id
        client_kwargs["aws_secret_access_key"] = aws_secret_access_key
    if aws_session_token:
        client_kwargs["aws_session_token"] = aws_session_token
    if STORAGE_ENDPOINT_URL:
        client_kwargs["endpoint_url"] = STORAGE_ENDPOINT_URL

    return session.client("s3", **client_kwargs)


def build_storage_url(object_key: str) -> str:
    if STORAGE_BASE_URL:
        return STORAGE_BASE_URL.rstrip("/") + "/" + object_key

    if STORAGE_ENDPOINT_URL:
        return STORAGE_ENDPOINT_URL.rstrip("/") + "/" + STORAGE_BUCKET + "/" + object_key

    if STORAGE_REGION == "us-east-1":
        return f"https://{STORAGE_BUCKET}.s3.amazonaws.com/{object_key}"

    return f"https://{STORAGE_BUCKET}.s3.{STORAGE_REGION}.amazonaws.com/{object_key}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
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


def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = get_current_user(credentials)
    if not user.get("admin_role") or user["admin_role"] not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def log_audit(admin_id, admin_name: str, action: str, target_user_id=None, target_user_name: str = "", details: dict = None):
    db.audit_log.insert_one({
        "admin_id": str(admin_id),
        "admin_name": admin_name,
        "action": action,
        "target_user_id": str(target_user_id) if target_user_id else None,
        "target_user_name": target_user_name,
        "details": details or {},
        "created_at": datetime.now(timezone.utc)
    })
