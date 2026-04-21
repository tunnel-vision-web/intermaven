from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional
from datetime import datetime
from bson import ObjectId

from config import db, STORAGE_BUCKET
from utils import build_storage_url, get_current_user, get_s3_client

router = APIRouter(prefix="/api/files")


@router.get("")
async def list_files(
    folder_id: Optional[str] = None,
    search: Optional[str] = None,
    favorites: Optional[bool] = None,
    recent: Optional[bool] = None,
    trash: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["_id"]}
    if trash:
        query["deleted_at"] = {"$ne": None}
    else:
        query["deleted_at"] = None
        if folder_id:
            query["folder_id"] = ObjectId(folder_id)
        elif not search and not favorites and not recent:
            query["folder_id"] = None

    if search:
        query["filename"] = {"$regex": search, "$options": "i"}
    if favorites:
        query["is_favorite"] = True

    sort = [("created_at", -1)] if recent else [("filename", 1)]
    limit = 20 if recent else 200

    files = list(db.files.find(query).sort(sort).limit(limit))
    result = []
    for f in files:
        f["id"] = str(f.pop("_id"))
        f.pop("user_id", None)
        if f.get("folder_id"): f["folder_id"] = str(f["folder_id"])
        if isinstance(f.get("created_at"), datetime): f["created_at"] = f["created_at"].isoformat()
        if isinstance(f.get("updated_at"), datetime): f["updated_at"] = f["updated_at"].isoformat()
        result.append(f)
    return {"files": result}


@router.get("/storage")
async def get_storage_info(current_user: dict = Depends(get_current_user)):
    result = list(db.files.aggregate([
        {"$match": {"user_id": current_user["_id"], "deleted_at": None}},
        {"$group": {"_id": None, "total": {"$sum": "$size"}}}
    ]))
    used = result[0]["total"] if result else 0
    return {"used": used}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if not STORAGE_BUCKET:
        raise HTTPException(500, "Storage is not configured. Set STORAGE_BUCKET and storage credentials.")

    if folder_id:
        try:
            folder_obj = db.folders.find_one({"_id": ObjectId(folder_id), "user_id": current_user["_id"]})
        except Exception:
            folder_obj = None
        if not folder_obj:
            raise HTTPException(404, "Folder not found")

    filename = file.filename.split("/")[-1]
    if not filename:
        raise HTTPException(400, "Invalid file name")

    object_key = f"{current_user['_id']}/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"

    try:
        s3_client = get_s3_client()
        upload_obj = file.file
        upload_obj.seek(0, 2)
        size = upload_obj.tell()
        upload_obj.seek(0)

        s3_client.upload_fileobj(
            upload_obj,
            STORAGE_BUCKET,
            object_key,
            ExtraArgs={"ContentType": file.content_type or "application/octet-stream"}
        )
    except Exception as err:
        raise HTTPException(500, f"File upload failed: {err}")

    storage_url = build_storage_url(object_key)
    file_record = {
        "user_id": current_user["_id"],
        "filename": filename,
        "mime_type": file.content_type or "application/octet-stream",
        "size": size,
        "storage_url": storage_url,
        "folder_id": ObjectId(folder_id) if folder_id else None,
        "is_favorite": False,
        "is_public": False,
        "share_token": None,
        "deleted_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = db.files.insert_one(file_record)
    file_record["id"] = str(result.inserted_id)
    file_record.pop("_id", None)
    file_record["folder_id"] = str(file_record["folder_id"]) if file_record["folder_id"] else None

    return {"success": True, "file": file_record}


@router.get("/{file_id}/download")
async def get_download_url(file_id: str, current_user: dict = Depends(get_current_user)):
    f = db.files.find_one({"_id": ObjectId(file_id), "user_id": current_user["_id"]})
    if not f:
        raise HTTPException(404, "File not found")
    return {"url": f.get("storage_url", "#")}


@router.post("/{file_id}/share")
async def share_file(file_id: str, current_user: dict = Depends(get_current_user)):
    import secrets
    f = db.files.find_one({"_id": ObjectId(file_id), "user_id": current_user["_id"]})
    if not f:
        raise HTTPException(404, "File not found")
    token = f.get("share_token") or secrets.token_urlsafe(16)
    db.files.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_public": True, "share_token": token}})
    return {"share_url": f"https://intermaven.io/files/shared/{token}"}


@router.delete("/{file_id}")
async def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    db.files.update_one(
        {"_id": ObjectId(file_id), "user_id": current_user["_id"]},
        {"$set": {"deleted_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}
