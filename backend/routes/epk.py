from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId

from config import db
from utils import get_current_user

epk_router = APIRouter(prefix="/api/epk", tags=["epk"])
router = epk_router

class EPKCreate(BaseModel):
    username: Optional[str] = None
    artist_name: str
    tagline: Optional[str] = ""
    genres: Optional[List[str]] = []
    location: Optional[str] = ""
    bio_short: Optional[str] = ""
    bio_full: Optional[str] = ""
    highlights: Optional[List[dict]] = []
    music: Optional[dict] = {}
    social_links: Optional[dict] = {}
    contact: Optional[dict] = {}
    press_quotes: Optional[List[dict]] = []
    press_links: Optional[List[dict]] = []
    events_upcoming: Optional[List[dict]] = []
    design: Optional[dict] = {}
    is_published: Optional[bool] = False
    hosting: Optional[dict] = {}

def serialize_epk(epk: dict) -> dict:
    epk["id"] = str(epk.pop("_id", ""))
    epk.pop("user_id", None)
    for f in ["created_at", "updated_at"]:
        if isinstance(epk.get(f), datetime):
            epk[f] = epk[f].isoformat()
    return epk

@router.get("/my")
async def get_my_epk(current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "No EPK found")
    return {"epk": serialize_epk(epk)}

@router.post("/create")
async def create_epk(data: EPKCreate, current_user: dict = Depends(get_current_user)):
    existing = db.epk_profiles.find_one({"user_id": current_user["_id"]})
    if existing:
        raise HTTPException(400, "EPK already exists — use PUT to update")
    
    if data.username:
        taken = db.epk_profiles.find_one({"username": data.username})
        if taken:
            raise HTTPException(400, "Username already taken")
    
    epk = {
        "user_id": current_user["_id"],
        **data.model_dump(),
        "analytics": {"total_views": 0, "unique_visitors": 0},
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = db.epk_profiles.insert_one(epk)
    epk["_id"] = result.inserted_id
    return {"epk": serialize_epk(epk)}

@router.put("/{epk_id}")
async def update_epk(epk_id: str, data: EPKCreate, current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"_id": ObjectId(epk_id), "user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "EPK not found")
    
    if data.username and data.username != epk.get("username"):
        taken = db.epk_profiles.find_one({"username": data.username, "_id": {"$ne": ObjectId(epk_id)}})
        if taken:
            raise HTTPException(400, "Username already taken")
    
    update = {**data.model_dump(), "updated_at": datetime.now(timezone.utc)}
    db.epk_profiles.update_one({"_id": ObjectId(epk_id)}, {"$set": update})
    updated = db.epk_profiles.find_one({"_id": ObjectId(epk_id)})
    return {"epk": serialize_epk(updated)}

@router.post("/{epk_id}/publish")
async def toggle_publish_epk(epk_id: str, current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"_id": ObjectId(epk_id), "user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "EPK not found")
    published = not epk.get("is_published", False)
    db.epk_profiles.update_one({"_id": ObjectId(epk_id)}, {"$set": {"is_published": published}})
    return {"is_published": published}

@router.get("/check-username")
async def check_username(username: str, epk_id: Optional[str] = None):
    query = {"username": username}
    if epk_id:
        try:
            query["_id"] = {"$ne": ObjectId(epk_id)}
        except:
            pass
    taken = db.epk_profiles.find_one(query)
    return {"available": taken is None}

@router.get("/public/{username}")
async def get_public_epk(username: str):
    epk = db.epk_profiles.find_one({"username": username, "is_published": True})
    if not epk:
        raise HTTPException(404, "EPK not found")
    db.epk_profiles.update_one({"_id": epk["_id"]}, {"$inc": {"analytics.total_views": 1}})
    db.epk_analytics.insert_one({"epk_id": epk["_id"], "event_type": "view", "timestamp": datetime.now(timezone.utc)})
    return serialize_epk(epk)

@router.get("/{epk_id}/analytics")
async def get_epk_analytics(epk_id: str, current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"_id": ObjectId(epk_id), "user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "EPK not found")
    
    events = list(db.epk_analytics.find({"epk_id": ObjectId(epk_id)}))
    referrers = {}
    for e in events:
        ref = e.get("referrer", "Direct")
        referrers[ref] = referrers.get(ref, 0) + 1
    
    total = sum(referrers.values()) or 1
    top_referrers = sorted([{"source": k, "count": v, "pct": round(v/total*100)} for k, v in referrers.items()], key=lambda x: -x["count"])[:5]
    
    return {
        "total_views": epk.get("analytics", {}).get("total_views", 0),
        "unique_visitors": epk.get("analytics", {}).get("unique_visitors", 0),
        "link_clicks": len([e for e in events if e.get("event_type") == "click"]),
        "form_submissions": len([e for e in events if e.get("event_type") == "form_submit"]),
        "top_referrers": top_referrers,
    }