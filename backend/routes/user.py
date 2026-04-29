from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone

from ..config import db
from ..schemas import UserUpdate, UserResponse, AppToggle
from ..utils import get_current_user, serialize_user

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
