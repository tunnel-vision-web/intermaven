"""
Avatar upload — accepts an image, stores as base64 data-URL on the user's
profile, and creates a record in the File Manager (`files` collection) for
visibility. Designed to work without external S3 — small payload only (<500 KB).
"""
import base64
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from bson import ObjectId

from config import db
from utils import get_current_user

router = APIRouter(tags=["avatar"])

MAX_AVATAR_BYTES = 500 * 1024  # 500 KB
ALLOWED_MIME = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"}


@router.post("/api/user/avatar/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, WebP, GIF images allowed.")
    raw = await file.read()
    if len(raw) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=413, detail=f"Avatar too large. Max {MAX_AVATAR_BYTES // 1024} KB.")
    if len(raw) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    encoded = base64.b64encode(raw).decode("ascii")
    data_url = f"data:{file.content_type};base64,{encoded}"

    now = datetime.now(timezone.utc)
    user_id = current_user["_id"]

    # Update the user's avatar to the data URL (lightweight inline image)
    db.users.update_one(
        {"_id": user_id},
        {"$set": {"avatar": data_url, "updated_at": now}},
    )

    # Ensure an "Avatars" folder exists, then add a file record so File Manager shows it
    avatars_folder = db.folders.find_one({"user_id": user_id, "name": "Avatars"})
    if not avatars_folder:
        folder_id = ObjectId()
        db.folders.insert_one({
            "_id": folder_id,
            "user_id": user_id,
            "name": "Avatars",
            "color": "#22d3ee",
            "created_at": now,
            "updated_at": now,
        })
    else:
        folder_id = avatars_folder["_id"]

    file_record = {
        "_id": ObjectId(),
        "user_id": user_id,
        "filename": file.filename or f"avatar-{uuid.uuid4().hex[:8]}",
        "mime_type": file.content_type,
        "size": len(raw),
        "storage_url": data_url,   # inline data-URL (works without S3)
        "folder_id": folder_id,
        "is_favorite": False,
        "is_public": False,
        "share_token": None,
        "deleted_at": None,
        "tag": "avatar",
        "created_at": now,
        "updated_at": now,
    }
    db.files.insert_one(file_record)

    return {
        "ok": True,
        "avatar": data_url,
        "file_id": str(file_record["_id"]),
        "folder_id": str(folder_id),
    }
