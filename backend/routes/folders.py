from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

from ..config import db
from ..schemas import FolderCreate
from ..utils import get_current_user

router = APIRouter(prefix="/api/folders")


@router.get("")
async def list_folders(
    parent_id: Optional[str] = None,
    root: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["_id"]}
    if root or parent_id is None:
        query["parent_id"] = None
    elif parent_id:
        query["parent_id"] = ObjectId(parent_id)

    folders = list(db.folders.find(query).sort("name", 1))
    result = []
    for f in folders:
        f["id"] = str(f.pop("_id"))
        f.pop("user_id", None)
        if f.get("parent_id"): f["parent_id"] = str(f["parent_id"])
        if isinstance(f.get("created_at"), datetime): f["created_at"] = f["created_at"].isoformat()
        result.append(f)
    return {"folders": result}


@router.get("/{folder_id}")
async def get_folder(folder_id: str, current_user: dict = Depends(get_current_user)):
    f = db.folders.find_one({"_id": ObjectId(folder_id), "user_id": current_user["_id"]})
    if not f:
        raise HTTPException(404, "Folder not found")
    return {"id": str(f["_id"]), "name": f["name"], "parent_id": str(f.get("parent_id", "")) or None}


@router.post("")
async def create_folder(data: FolderCreate, current_user: dict = Depends(get_current_user)):
    folder = {
        "user_id": current_user["_id"],
        "name": data.name,
        "parent_id": ObjectId(data.parent_id) if data.parent_id else None,
        "color": data.color,
        "created_at": datetime.now(timezone.utc),
    }
    result = db.folders.insert_one(folder)
    return {"id": str(result.inserted_id), "name": data.name}


@router.put("/{folder_id}")
async def update_folder(folder_id: str, data: FolderCreate, current_user: dict = Depends(get_current_user)):
    db.folders.update_one(
        {"_id": ObjectId(folder_id), "user_id": current_user["_id"]},
        {"$set": {"name": data.name}}
    )
    return {"success": True}


@router.delete("/{folder_id}")
async def delete_folder(folder_id: str, current_user: dict = Depends(get_current_user)):
    db.folders.delete_one({"_id": ObjectId(folder_id), "user_id": current_user["_id"]})
    db.files.update_many(
        {"folder_id": ObjectId(folder_id), "user_id": current_user["_id"]},
        {"$set": {"deleted_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}
