from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from config import db
from schemas import UserUpdate, UserResponse, AppToggle
from utils import get_current_user, serialize_user

router = APIRouter(prefix="/api/user")


@router.put("/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        db.users.update_one({"_id": current_user["_id"]}, {"$set": update_dict})

    updated_user = db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**serialize_user(updated_user))


@router.post("/apps/toggle", response_model=UserResponse)
async def toggle_app(app_data: AppToggle, current_user: dict = Depends(get_current_user)):
    apps = current_user.get("apps", [])
    if app_data.app_id in apps:
        apps.remove(app_data.app_id)
    else:
        apps.append(app_data.app_id)

    db.users.update_one({"_id": current_user["_id"]}, {"$set": {"apps": apps}})
    updated_user = db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**serialize_user(updated_user))


@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    ai_runs = db.ai_runs.count_documents({
        "user_id": current_user["_id"],
        "created_at": {"$gte": week_ago}
    })

    return {
        "credits": current_user.get("credits", 0),
        "plan": current_user.get("plan", "free"),
        "ai_runs_week": ai_runs,
        "active_apps": len(current_user.get("apps", [])),
        "scheduled_posts": 0
    }


# ============== USER APPS ==============
# Note: these endpoints live on /api/users/* (plural) and /api/apps/* — separate from
# the /api/user/* router prefix above. They're exposed via the second router below.

apps_router = APIRouter(tags=["apps"])


class AddAppRequest(BaseModel):
    app_id: str


AVAILABLE_APPS = ['brandkit', 'musicbio', 'social', 'syncpitch', 'bizpitch']


@apps_router.post("/api/users/apps")
async def add_user_app(data: AddAppRequest, current_user: dict = Depends(get_current_user)):
    if data.app_id not in AVAILABLE_APPS:
        raise HTTPException(status_code=400, detail="Invalid app ID")

    current_apps = current_user.get("apps", [])
    if data.app_id in current_apps:
        return {"success": True, "message": "App already added", "apps": current_apps}

    new_apps = current_apps + [data.app_id]
    db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"apps": new_apps}}
    )

    return {"success": True, "message": f"Added {data.app_id}", "apps": new_apps}


@apps_router.delete("/api/users/apps/{app_id}")
async def remove_user_app(app_id: str, current_user: dict = Depends(get_current_user)):
    current_apps = current_user.get("apps", [])
    if app_id not in current_apps:
        return {"success": True, "message": "App not in user's list", "apps": current_apps}

    new_apps = [a for a in current_apps if a != app_id]
    db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"apps": new_apps}}
    )

    return {"success": True, "message": f"Removed {app_id}", "apps": new_apps}


@apps_router.get("/api/users/apps")
async def get_user_apps(current_user: dict = Depends(get_current_user)):
    return {"apps": current_user.get("apps", [])}


@apps_router.get("/api/apps/available")
async def get_available_apps():
    """Get list of all available apps with their details"""
    apps = {
        "brandkit": {"id": "brandkit", "name": "Brand Kit AI", "icon": "brandkit", "color": "#10b981", "desc": "Brand names, taglines, tone of voice", "cost": 10, "status": "live"},
        "musicbio": {"id": "musicbio", "name": "Music Bio & Press Kit", "icon": "musicbio", "color": "#22d3ee", "desc": "Artist bios and press materials", "cost": 15, "status": "live"},
        "social": {"id": "social", "name": "Social AI", "icon": "social", "color": "#f43f5e", "desc": "Multi-platform social management", "cost": 0, "status": "live"},
        "syncpitch": {"id": "syncpitch", "name": "Sync Pitch AI", "icon": "syncpitch", "color": "#f59e0b", "desc": "Film, TV and advertising pitches", "cost": 20, "status": "live"},
        "bizpitch": {"id": "bizpitch", "name": "Pitch Deck AI", "icon": "pitchdeck", "color": "#8b5cf6", "desc": "Investor and grant pitch decks", "cost": 18, "status": "live"},
        "epk": {"id": "epk", "name": "Electronic Press Kit", "icon": "epk", "color": "#ec4899", "desc": "Hosted EPK pages for artists", "cost": 25, "status": "coming_soon"},
        "pos": {"id": "pos", "name": "Intermaven POS", "icon": "pos", "color": "#0e9499", "desc": "M-Pesa native point of sale", "cost": 0, "status": "coming_soon"},
        "distro": {"id": "distro", "name": "Distribution Tracker", "icon": "distro", "color": "#0ea5e9", "desc": "Track music across platforms", "cost": 10, "status": "coming_soon"}
    }
    return {"apps": apps}
