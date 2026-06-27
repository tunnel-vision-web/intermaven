from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from config import db
from utils import get_current_user

router = APIRouter(prefix="/api/distro")

class DistroReleaseCreate(BaseModel):
    title: str
    artist: str
    upc: Optional[str] = ""
    release_date: str
    platforms: List[str]

def serialize_release(r: dict) -> dict:
    return {
        "id": str(r["_id"]),
        "title": r.get("title", ""),
        "artist": r.get("artist", ""),
        "upc": r.get("upc", ""),
        "release_date": r.get("release_date", ""),
        "platforms": r.get("platforms", []),
        "status": r.get("status", {}),
        "created_at": r.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(r.get("created_at"), datetime) else str(r.get("created_at"))
    }

@router.get("/releases")
async def get_releases(current_user: dict = Depends(get_current_user)):
    releases = list(db.distributions.find({"user_id": current_user["_id"]}))
    
    # If no records exist, seed a sample release for immediate premium experience
    if len(releases) == 0:
        sample = {
            "user_id": current_user["_id"],
            "title": "Afrobeats Symphony Vol. 1",
            "artist": current_user.get("brand_name") or "Various Artists",
            "upc": "5060853489211",
            "release_date": "2026-07-15",
            "platforms": ["spotify", "apple", "youtube", "amazon"],
            "status": {
                "spotify": "scheduled",
                "apple": "pending",
                "youtube": "live",
                "amazon": "action_required"
            },
            "created_at": datetime.now(timezone.utc)
        }
        db.distributions.insert_one(sample)
        releases = [sample]

    return {"releases": [serialize_release(r) for r in releases]}

@router.post("/releases")
async def create_release(req: DistroReleaseCreate, current_user: dict = Depends(get_current_user)):
    status_map = {}
    for p in req.platforms:
        # Default mock state: first platform live, rest pending
        if len(status_map) == 0:
            status_map[p] = "live"
        elif len(status_map) == 1:
            status_map[p] = "scheduled"
        else:
            status_map[p] = "pending"

    new_release = {
        "user_id": current_user["_id"],
        "title": req.title,
        "artist": req.artist,
        "upc": req.upc or f"5060{datetime.now().strftime('%y%m%d%H%M')}",
        "release_date": req.release_date,
        "platforms": req.platforms,
        "status": status_map,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.distributions.insert_one(new_release)
    new_release["_id"] = result.inserted_id
    
    return {
        "success": True,
        "release": serialize_release(new_release)
    }
