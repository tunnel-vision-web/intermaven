from fastapi import APIRouter, Depends
from datetime import datetime

from config import db
from utils import get_current_user

router = APIRouter(tags=["notifications"])


@router.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = list(db.notifications.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20))

    for n in notifications:
        if isinstance(n.get("created_at"), datetime):
            n["created_at"] = n["created_at"].isoformat()

    unread_count = db.notifications.count_documents({
        "user_id": current_user["_id"],
        "read": False
    })

    return {"notifications": notifications, "unread_count": unread_count}


@router.post("/api/notifications/mark-read")
async def mark_notifications_read(current_user: dict = Depends(get_current_user)):
    db.notifications.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"read": True}}
    )
    return {"success": True}


@router.get("/api/activities")
async def get_activities(current_user: dict = Depends(get_current_user)):
    activities = list(db.activities.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(10))

    for a in activities:
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()

    return {"activities": activities}
