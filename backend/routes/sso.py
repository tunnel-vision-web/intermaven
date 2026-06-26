import base64
import datetime
from datetime import timedelta, timezone
import hashlib
import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from jose import jwt
from pydantic import BaseModel
from bson import ObjectId

from config import db, JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from utils import get_current_user, create_access_token, serialize_user

router = APIRouter(prefix="/api/auth/sso", tags=["sso"])
logger = logging.getLogger("intermaven.sso")

# Pre-configured list of allowed partner clients (first-party/partner domains)
ALLOWED_CLIENTS = {
    "atltvmount": {
        "client_secret": "atltvmount_secret_secure_2026",
        "redirect_uris": [
            "http://localhost:3000/auth/callback",
            "http://localhost:5000/auth/callback",
            "http://localhost:5173/auth/callback",
            "http://127.0.0.1:8090/api/oauth2-callback/intermaven",
            "https://atltvmountpro.com/api/oauth2-callback/intermaven"
        ]
    }
}

class AuthorizeRequest(BaseModel):
    client_id: str
    redirect_uri: str
    state: str | None = None
    code_challenge: str | None = None
    code_challenge_method: str | None = None  # "S256" or "plain"

class AuthorizeResponse(BaseModel):
    redirect_url: str

def verify_pkce(verifier: str, challenge: str, method: str) -> bool:
    if not challenge:
        return True
    if method == "plain" or not method:
        return verifier == challenge
    if method == "S256":
        # SHA256 hashing of verifier code
        sha = hashlib.sha256(verifier.encode('ascii')).digest()
        # base64url encoding without padding
        calculated = base64.urlsafe_b64encode(sha).decode('ascii').rstrip('=')
        return calculated == challenge
    return False

@router.post("/authorize", response_model=AuthorizeResponse)
async def sso_authorize(req: AuthorizeRequest, current_user: dict = Depends(get_current_user)):
    """
    Called by the frontend authorization screen once the user approves (or auto-approved).
    Generates a short-lived authorization code and returns the redirect URL.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    client = ALLOWED_CLIENTS.get(req.client_id)
    if not client:
        raise HTTPException(status_code=400, detail="Invalid client_id")

    if req.redirect_uri not in client["redirect_uris"]:
        raise HTTPException(status_code=400, detail="Invalid redirect_uri")

    # Generate a secure short-lived authorization code
    auth_code = f"ac_{uuid.uuid4().hex}"
    expires_at = datetime.datetime.now(timezone.utc) + timedelta(minutes=5)

    # Store authorization code state in MongoDB
    db.oauth_codes.insert_one({
        "code": auth_code,
        "client_id": req.client_id,
        "user_id": current_user["_id"],
        "redirect_uri": req.redirect_uri,
        "code_challenge": req.code_challenge,
        "code_challenge_method": req.code_challenge_method,
        "expires_at": expires_at
    })

    # Build standard OAuth2 redirect callback URL
    query_params = f"code={auth_code}"
    if req.state:
        query_params += f"&state={req.state}"
        
    redirect_url = f"{req.redirect_uri}?{query_params}" if "?" not in req.redirect_uri else f"{req.redirect_uri}&{query_params}"

    return AuthorizeResponse(redirect_url=redirect_url)

@router.post("/token")
async def sso_token(
    request: Request,
    grant_type: str = Form(...),
    code: str = Form(...),
    redirect_uri: str = Form(...),
    client_id: str = Form(...),
    code_verifier: str | None = Form(None),
    client_secret: str | None = Form(None)
):
    """
    Token exchange endpoint (Form urlencoded). Validates auth code & PKCE verifiers,
    returning standard access_token + OpenID Connect id_token.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if grant_type != "authorization_code":
        raise HTTPException(status_code=400, detail="Unsupported grant_type")

    client = ALLOWED_CLIENTS.get(client_id)
    if not client:
        raise HTTPException(status_code=400, detail="Invalid client_id")

    # Validate client credentials if secret is provided (PocketBase often passes it)
    if client_secret and client_secret != client["client_secret"]:
        raise HTTPException(status_code=401, detail="Invalid client_secret")

    # Find the authorization code
    code_record = db.oauth_codes.find_one({"code": code, "client_id": client_id})
    if not code_record:
        raise HTTPException(status_code=400, detail="Invalid or expired authorization code")

    # Ensure code hasn't expired
    if code_record["expires_at"].replace(tzinfo=timezone.utc) < datetime.datetime.now(timezone.utc):
        db.oauth_codes.delete_one({"_id": code_record["_id"]})
        raise HTTPException(status_code=400, detail="Authorization code expired")

    # Verify redirect_uri matches authorization request
    if redirect_uri != code_record["redirect_uri"]:
        raise HTTPException(status_code=400, detail="redirect_uri mismatch")

    # Verify PKCE if a challenge was stored
    stored_challenge = code_record.get("code_challenge")
    if stored_challenge:
        if not code_verifier:
            raise HTTPException(status_code=400, detail="code_verifier required for PKCE")
        method = code_record.get("code_challenge_method") or "S256"
        if not verify_pkce(code_verifier, stored_challenge, method):
            raise HTTPException(status_code=400, detail="Invalid code_verifier")

    # Auth code can only be used once, delete it immediately
    db.oauth_codes.delete_one({"_id": code_record["_id"]})

    # Fetch target user profile
    user = db.users.find_one({"_id": ObjectId(code_record["user_id"])})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # Issue standard JWT access token
    access_token = create_access_token(data={"sub": str(user["_id"])})

    # Build OIDC id_token containing profile claims
    base_url = str(request.base_url).rstrip("/")
    now = datetime.datetime.now(timezone.utc)
    id_token_payload = {
        "iss": base_url,
        "sub": str(user["_id"]),
        "aud": client_id,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": now,
        "auth_time": int(now.timestamp()),
        "email": user.get("email", ""),
        "email_verified": True,
        "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get("email"),
        "given_name": user.get("first_name", ""),
        "family_name": user.get("last_name", "")
    }
    id_token = jwt.encode(id_token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "access_token": access_token,
        "id_token": id_token,
        "token_type": "Bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/userinfo")
async def sso_userinfo(current_user: dict = Depends(get_current_user)):
    """
    Standard OIDC UserInfo endpoint. Returns verified profile details.
    """
    return {
        "sub": str(current_user["_id"]),
        "email": current_user.get("email", ""),
        "email_verified": True,
        "name": f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip() or current_user.get("email"),
        "given_name": current_user.get("first_name", ""),
        "family_name": current_user.get("last_name", ""),
        "portal": current_user.get("portal", "music"),
        "plan": current_user.get("plan", "free")
    }
