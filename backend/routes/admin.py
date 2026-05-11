from datetime import datetime, timedelta, timezone
from typing import Optional, List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import db
from utils import get_admin_user, log_audit, serialize_user

router = APIRouter(tags=["admin"])


# ============== ADMIN — USER MANAGEMENT ==============

class AdminUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    plan: Optional[str] = None
    portal: Optional[str] = None
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    admin_role: Optional[str] = None
    audit_changes: Optional[dict] = None


class BulkAction(BaseModel):
    user_ids: List[str]
    action: str  # export, suspend, delete, plan_change
    value: Optional[str] = None


class CreditGrant(BaseModel):
    method: str  # preset, custom
    preset_label: Optional[str] = None
    credits: int
    note: Optional[str] = None


class AdminNote(BaseModel):
    note: str


@router.get("/api/admin/users")
async def admin_list_users(
    page: int = 1, per_page: int = 25,
    search: Optional[str] = None,
    plan: Optional[str] = None,
    portal: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    admin: dict = Depends(get_admin_user)
):
    query = {}
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    if plan:
        query["plan"] = plan
    if portal:
        query["portal"] = portal
    if status == "suspended":
        query["suspended"] = True
    elif status == "active":
        query["suspended"] = {"$ne": True}

    sort_order = 1 if sort_dir == "asc" else -1
    total = db.users.count_documents(query)
    skip = (page - 1) * per_page
    users_cursor = db.users.find(query).sort(sort_by, sort_order).skip(skip).limit(per_page)

    users = []
    for u in users_cursor:
        users.append({
            **serialize_user(u),
            "ai_runs": u.get("ai_runs", 0),
            "suspended": u.get("suspended", False),
            "admin_role": u.get("admin_role", ""),
            "admin_notes": u.get("admin_notes", []),
        })
    return {"users": users, "total": total, "page": page, "per_page": per_page}


@router.get("/api/admin/users/{user_id}")
async def admin_get_user(user_id: str, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(404, "User not found")
    return {**serialize_user(u), "ai_runs": u.get("ai_runs", 0), "admin_role": u.get("admin_role", ""), "admin_notes": u.get("admin_notes", [])}


@router.put("/api/admin/users/{user_id}")
async def admin_update_user(user_id: str, data: AdminUserUpdate, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(404, "User not found")

    update = {k: v for k, v in data.model_dump(exclude={"audit_changes"}).items() if v is not None}
    if update:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})

    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    target_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "user_edit", u["_id"], target_name, data.audit_changes or update)

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    return {**serialize_user(updated), "admin_role": updated.get("admin_role", "")}


@router.post("/api/admin/users/{user_id}/grant-credits")
async def admin_grant_credits(user_id: str, data: CreditGrant, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(404, "User not found")

    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"credits": data.credits}})

    db.admin_credit_grants.insert_one({
        "user_id": ObjectId(user_id),
        "admin_id": admin["_id"],
        "method": data.method,
        "preset_label": data.preset_label,
        "credits": data.credits,
        "note": data.note,
        "created_at": datetime.now(timezone.utc)
    })

    db.transactions.insert_one({
        "user_id": ObjectId(user_id),
        "type": "credit_grant",
        "plan": "credit_grant",
        "amount": 0,
        "credits": data.credits,
        "note": data.note,
        "granted_by": str(admin["_id"]),
        "status": "completed",
        "created_at": datetime.now(timezone.utc)
    })

    db.notifications.insert_one({
        "user_id": ObjectId(user_id),
        "icon": "⚡",
        "title": f"{data.credits} credits added!",
        "text": data.note or "Credits have been added to your account.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })

    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    target_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "credit_grant", u["_id"], target_name, {"credits": data.credits, "note": data.note})

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    return {"success": True, "credits": updated.get("credits", 0)}


@router.post("/api/admin/users/{user_id}/notes")
async def admin_add_note(user_id: str, data: AdminNote, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(404, "User not found")

    note_entry = {"note": data.note, "admin_id": str(admin["_id"]), "created_at": datetime.now(timezone.utc)}
    db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"admin_notes": note_entry}})

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    notes = updated.get("admin_notes", [])
    for n in notes:
        if isinstance(n.get("created_at"), datetime):
            n["created_at"] = n["created_at"].isoformat()
    return {"notes": notes}


@router.get("/api/admin/users/{user_id}/activity")
async def admin_user_activity(user_id: str, admin: dict = Depends(get_admin_user)):
    activities = list(db.activities.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(50))
    for a in activities:
        a.pop("_id", None)
        a.pop("user_id", None)
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()
    return {"activities": activities}


@router.get("/api/admin/users/{user_id}/transactions")
async def admin_user_transactions(user_id: str, admin: dict = Depends(get_admin_user)):
    txs = list(db.transactions.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(50))
    for t in txs:
        t.pop("_id", None)
        t.pop("user_id", None)
        if isinstance(t.get("created_at"), datetime):
            t["created_at"] = t["created_at"].isoformat()
        if isinstance(t.get("completed_at"), datetime):
            t["completed_at"] = t["completed_at"].isoformat()
    return {"transactions": txs}


@router.post("/api/admin/users/{user_id}/suspend")
async def admin_suspend_user(user_id: str, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u:
        raise HTTPException(404, "User not found")
    suspended = not u.get("suspended", False)
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"suspended": suspended}})
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    target_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "suspend" if suspended else "unsuspend", u["_id"], target_name)
    return {"success": True, "suspended": suspended}


@router.post("/api/admin/users/bulk")
async def admin_bulk_action(data: BulkAction, admin: dict = Depends(get_admin_user)):
    results = []
    for uid in data.user_ids:
        try:
            oid = ObjectId(uid)
            if data.action == "suspend":
                db.users.update_one({"_id": oid}, {"$set": {"suspended": True}})
            elif data.action == "delete":
                db.users.update_one({"_id": oid}, {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc)}})
            elif data.action == "plan_change" and data.value:
                db.users.update_one({"_id": oid}, {"$set": {"plan": data.value}})
            results.append({"id": uid, "success": True})
        except Exception as e:
            results.append({"id": uid, "success": False, "error": str(e)})
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, f"bulk_{data.action}", details={"count": len(data.user_ids)})
    return {"results": results}


@router.get("/api/admin/users/export")
async def admin_export_users(admin: dict = Depends(get_admin_user)):
    from fastapi.responses import StreamingResponse
    import csv
    import io
    users = list(db.users.find({"deleted": {"$ne": True}}))
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "first_name", "last_name", "email", "phone", "plan", "credits", "portal", "ai_runs", "created_at"])
    for u in users:
        writer.writerow([str(u["_id"]), u.get("first_name", ""), u.get("last_name", ""), u.get("email", ""), u.get("phone", ""), u.get("plan", ""), u.get("credits", 0), u.get("portal", ""), u.get("ai_runs", 0), u.get("created_at", "").isoformat() if isinstance(u.get("created_at"), datetime) else ""])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=users.csv"})


# ============== ADMIN — ANALYTICS ==============

@router.get("/api/admin/analytics/overview")
async def admin_analytics(range: str = "30d", admin: dict = Depends(get_admin_user)):
    now = datetime.now(timezone.utc)
    delta_map = {"7d": 7, "30d": 30, "90d": 90, "all": 36500}
    days = delta_map.get(range, 30)
    since = now - timedelta(days=days)

    total_users = db.users.count_documents({"deleted": {"$ne": True}})
    new_users = db.users.count_documents({"created_at": {"$gte": since}, "deleted": {"$ne": True}})
    active_users = db.activities.distinct("user_id", {"created_at": {"$gte": now - timedelta(days=30)}})

    by_plan = {
        "free": db.users.count_documents({"plan": "free", "deleted": {"$ne": True}}),
        "creator": db.users.count_documents({"plan": "creator", "deleted": {"$ne": True}}),
        "pro": db.users.count_documents({"plan": "pro", "deleted": {"$ne": True}}),
    }
    by_portal = {
        "music": db.users.count_documents({"portal": "music", "deleted": {"$ne": True}}),
        "business": db.users.count_documents({"portal": "business", "deleted": {"$ne": True}}),
    }

    total_ai_runs = db.ai_runs.count_documents({"created_at": {"$gte": since}})

    credit_grants = list(db.admin_credit_grants.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {"_id": None, "total": {"$sum": "$credits"}}}
    ]))
    credits_granted = credit_grants[0]["total"] if credit_grants else 0

    revenue_result = list(db.transactions.aggregate([
        {"$match": {"status": "completed", "created_at": {"$gte": since}, "amount": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]))
    revenue = revenue_result[0]["total"] if revenue_result else 0

    tool_usage = list(db.ai_runs.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {"_id": "$tool_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 5},
        {"$project": {"tool_id": "$_id", "count": 1, "_id": 0}}
    ]))

    recent_signups_cursor = db.users.find({"deleted": {"$ne": True}}).sort("created_at", -1).limit(10)
    recent_signups = []
    for u in recent_signups_cursor:
        recent_signups.append({
            "first_name": u.get("first_name", ""),
            "last_name": u.get("last_name", ""),
            "email": u.get("email", ""),
            "plan": u.get("plan", ""),
            "portal": u.get("portal", ""),
            "created_at": u.get("created_at", "").isoformat() if isinstance(u.get("created_at"), datetime) else ""
        })

    return {
        "total_users": total_users,
        "new_users": new_users,
        "active_users": len(active_users),
        "by_plan": by_plan,
        "by_portal": by_portal,
        "total_ai_runs": total_ai_runs,
        "credits_granted": credits_granted,
        "revenue": revenue,
        "top_tools": tool_usage,
        "recent_signups": recent_signups,
        "user_growth": 0,
        "revenue_trend": 0,
        "new_user_trend": 0,
    }


# ============== ADMIN — AUDIT LOG ==============

@router.get("/api/admin/audit-log")
async def admin_audit_log(page: int = 1, per_page: int = 50, admin: dict = Depends(get_admin_user)):
    total = db.audit_log.count_documents({})
    skip = (page - 1) * per_page
    logs = list(db.audit_log.find({}).sort("created_at", -1).skip(skip).limit(per_page))
    for l in logs:
        l.pop("_id", None)
        if isinstance(l.get("created_at"), datetime):
            l["created_at"] = l["created_at"].isoformat()
    return {"logs": logs, "total": total}


# ============== ADMIN — SETTINGS ==============

class SystemSettings(BaseModel):
    default_plan: Optional[str] = "free"
    free_credits: Optional[int] = 150
    creator_credits: Optional[int] = 600
    pro_credits: Optional[int] = 2500
    brandkit_cost: Optional[int] = 10
    musicbio_cost: Optional[int] = 15
    syncpitch_cost: Optional[int] = 20
    bizpitch_cost: Optional[int] = 18
    maintenance_mode: Optional[bool] = False
    registrations_open: Optional[bool] = True
    hero_content_overrides: Optional[dict] = {}


@router.get("/api/admin/settings")
async def get_admin_settings(admin: dict = Depends(get_admin_user)):
    settings = db.system_settings.find_one({"key": "global"})
    if not settings:
        return SystemSettings().model_dump()
    settings.pop("_id", None)
    settings.pop("key", None)
    return settings


@router.put("/api/admin/settings")
async def update_admin_settings(data: SystemSettings, admin: dict = Depends(get_admin_user)):
    if admin.get("admin_role") != "super_admin":
        raise HTTPException(403, "Super admin required for settings changes")
    db.system_settings.update_one({"key": "global"}, {"$set": {"key": "global", **data.model_dump()}}, upsert=True)
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "settings_update", details=data.model_dump())
    return {"success": True}


@router.get("/api/settings")
async def get_public_settings():
    settings = db.system_settings.find_one({"key": "global"}) or {}
    hero_overrides = settings.get("hero_content_overrides", {})
    return {"hero_content_overrides": hero_overrides}
