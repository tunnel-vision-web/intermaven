from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId

from config import db
from utils import get_current_user

router = APIRouter(tags=["notifications"])


def _serialize_notif(n: dict, source: str = "notifications") -> dict:
    created = n.get("created_at")
    if isinstance(created, datetime):
        created = created.isoformat()
    elif created is None:
        created = datetime.now(timezone.utc).isoformat()
    return {
        "id": str(n.get("_id", n.get("id", ""))),
        "title": n.get("title") or n.get("subject") or "Notification",
        "message": n.get("message") or n.get("body") or "",
        "category": n.get("category") or n.get("event_type") or "system",
        "priority": n.get("priority") or "normal",
        "icon": n.get("icon") or "bell",
        "action_url": n.get("action_url") or n.get("cta_url") or "",
        "action_label": n.get("action_label") or n.get("cta_label") or "",
        "read": bool(n.get("read", False)),
        "archived": bool(n.get("archived", False)),
        "source": source,
        "created_at": str(created),
    }


@router.get("/api/notifications")
async def get_notifications(
    category: str | None = None,
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        return {"notifications": [], "unread_count": 0}

    uid = current_user["_id"]
    uid_str = str(uid)

    notif_query = {"user_id": {"$in": [uid, uid_str]}, "archived": {"$ne": True}}
    inbox_query = {"user_id": {"$in": [uid, uid_str]}, "archived": {"$ne": True}}

    if category and category != "all":
        notif_query["category"] = category
        inbox_query["category"] = category
    if unread_only:
        notif_query["read"] = False
        inbox_query["read"] = False

    raw_notifs = list(db.notifications.find(notif_query).sort("created_at", -1).limit(30))
    raw_inbox = list(db.user_inbox.find(inbox_query).sort("created_at", -1).limit(20))

    items = [_serialize_notif(n, "notifications") for n in raw_notifs] + [
        _serialize_notif(m, "inbox") for m in raw_inbox
    ]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    items = items[:40]

    unread_count = db.notifications.count_documents(
        {"user_id": {"$in": [uid, uid_str]}, "read": False, "archived": {"$ne": True}}
    ) + db.user_inbox.count_documents(
        {"user_id": {"$in": [uid, uid_str]}, "read": False, "archived": {"$ne": True}}
    )

    return {"notifications": items, "unread_count": unread_count}


@router.post("/api/notifications/{notif_id}/read")
async def mark_single_notification_read(
    notif_id: str, current_user: dict = Depends(get_current_user)
):
    if db is None:
        return {"success": True}
    uid = current_user["_id"]
    uid_str = str(uid)
    query_ids = [notif_id]
    try:
        query_ids.append(ObjectId(notif_id))
    except Exception:
        pass

    db.notifications.update_one(
        {"_id": {"$in": query_ids}, "user_id": {"$in": [uid, uid_str]}},
        {"$set": {"read": True}},
    )
    db.user_inbox.update_one(
        {"_id": {"$in": query_ids}, "user_id": {"$in": [uid, uid_str]}},
        {"$set": {"read": True}},
    )
    return {"success": True}


@router.post("/api/notifications/mark-read")
async def mark_notifications_read(current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"success": True}
    uid = current_user["_id"]
    uid_str = str(uid)
    db.notifications.update_many(
        {"user_id": {"$in": [uid, uid_str]}}, {"$set": {"read": True}}
    )
    db.user_inbox.update_many(
        {"user_id": {"$in": [uid, uid_str]}}, {"$set": {"read": True}}
    )
    return {"success": True}


@router.delete("/api/notifications/{notif_id}")
async def archive_notification(
    notif_id: str, current_user: dict = Depends(get_current_user)
):
    if db is None:
        return {"success": True}
    uid = current_user["_id"]
    uid_str = str(uid)
    query_ids = [notif_id]
    try:
        query_ids.append(ObjectId(notif_id))
    except Exception:
        pass
    db.notifications.update_one(
        {"_id": {"$in": query_ids}, "user_id": {"$in": [uid, uid_str]}},
        {"$set": {"archived": True, "read": True}},
    )
    db.user_inbox.update_one(
        {"_id": {"$in": query_ids}, "user_id": {"$in": [uid, uid_str]}},
        {"$set": {"archived": True, "read": True}},
    )
    return {"success": True}


@router.get("/api/activities")
async def get_activities(current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"activities": []}
    activities = list(
        db.activities.find(
            {"user_id": current_user["_id"]}, {"_id": 0, "user_id": 0}
        )
        .sort("created_at", -1)
        .limit(10)
    )

    for a in activities:
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()

    return {"activities": activities}
