"""
Mother-CMS router — region-aware, portal-aware content management.

Resolution priority (most specific wins):
  1. doc.portals[portal][region]   (e.g. business.US)
  2. doc.portals[portal]["default"] (e.g. business default)
  3. doc.regions[region]            (e.g. US)
  4. doc.default                    (fallback)

Versioning: every PUT pushes the previous value onto doc.history with
timestamp + actor. Rollback re-applies a historic value as the current.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from config import db
from utils import get_current_user

router = APIRouter(tags=["cms"])


# ============== MODELS ==============

class CmsKeyUpsert(BaseModel):
    default: Optional[str] = None
    regions: Optional[Dict[str, str]] = None
    portals: Optional[Dict[str, Dict[str, str]]] = None
    description: Optional[str] = None  # admin-facing label


# ============== HELPERS ==============

def _require_admin(user: dict):
    admin_roles = {"super_admin", "admin", "support", "finance"}
    if not (user.get("is_admin") or user.get("role") == "admin" or user.get("admin_role") in admin_roles):
        raise HTTPException(status_code=403, detail="Admin only")


def _strip(doc: dict) -> dict:
    if not doc:
        return doc
    out = {k: v for k, v in doc.items()}
    if "_id" in out:
        out["_id"] = str(out["_id"])
        out["key"] = out["_id"]
    for k in ("created_at", "updated_at"):
        if isinstance(out.get(k), datetime):
            out[k] = out[k].isoformat()
    if "history" in out and isinstance(out["history"], list):
        for h in out["history"]:
            if isinstance(h.get("at"), datetime):
                h["at"] = h["at"].isoformat()
    return out


def _resolve(doc: dict, region: Optional[str], portal: Optional[str]) -> Optional[str]:
    if not doc:
        return None
    region = (region or "").upper()
    portals = doc.get("portals") or {}
    if portal and portal in portals:
        p_overrides = portals[portal] or {}
        if region and region in p_overrides:
            return p_overrides[region]
        if "default" in p_overrides:
            return p_overrides["default"]
    regions = doc.get("regions") or {}
    if region and region in regions:
        return regions[region]
    return doc.get("default")


# ============== PUBLIC LOOKUP ==============

@router.get("/api/cms/{key}")
async def cms_get(key: str, region: Optional[str] = Query(None), portal: Optional[str] = Query(None)):
    doc = db.cms_keys.find_one({"_id": key})
    if not doc:
        return {"key": key, "value": None, "found": False}
    value = _resolve(doc, region, portal)
    return {"key": key, "value": value, "found": True, "resolved_for": {"region": (region or "").upper(), "portal": portal}}


@router.get("/api/cms/bulk/lookup")
async def cms_bulk(
    keys: str = Query(..., description="Comma-separated CMS keys"),
    region: Optional[str] = Query(None),
    portal: Optional[str] = Query(None),
):
    key_list = [k.strip() for k in keys.split(",") if k.strip()]
    if not key_list:
        return {"values": {}}
    docs = {d["_id"]: d for d in db.cms_keys.find({"_id": {"$in": key_list}})}
    out = {}
    for k in key_list:
        out[k] = _resolve(docs.get(k), region, portal)
    return {"values": out, "resolved_for": {"region": (region or "").upper(), "portal": portal}}


# ============== ADMIN MANAGEMENT ==============

class SiteMediaUpload(BaseModel):
    name: str
    data_url: str
    file_type: Optional[str] = "image"
    category: Optional[str] = "site-assets"


BUILTIN_SITE_ASSETS = [
    {"id": "builtin-hero-1", "name": "Hero Background 1 (Business)", "url": "/images/hero/intermaven/hero-1.jpg", "category": "hero", "file_type": "image"},
    {"id": "builtin-hero-2", "name": "Hero Background 2 (Business)", "url": "/images/hero/intermaven/hero-2.jpg", "category": "hero", "file_type": "image"},
    {"id": "builtin-hero-3", "name": "Hero Background 3 (Business)", "url": "/images/hero/intermaven/hero-3.jpg", "category": "hero", "file_type": "image"},
    {"id": "builtin-music-hero-1", "name": "Hero Background 1 (Music)", "url": "/images/hero/intermavenmusic/hero-1.jpg", "category": "hero", "file_type": "image"},
    {"id": "builtin-music-hero-2", "name": "Hero Background 2 (Music)", "url": "/images/hero/intermavenmusic/hero-2.jpg", "category": "hero", "file_type": "image"},
    {"id": "builtin-music-hero-3", "name": "Hero Background 3 (Music)", "url": "/images/hero/intermavenmusic/hero-3.jpg", "category": "hero", "file_type": "image"},
    {"id": "builtin-hdr-tools", "name": "Tools Page Header Banner", "url": "/images/headers/intermaven/header-tools.jpg", "category": "headers", "file_type": "image"},
    {"id": "builtin-hdr-apps", "name": "Apps Page Header Banner", "url": "/images/headers/intermaven/header-apps.jpg", "category": "headers", "file_type": "image"},
    {"id": "builtin-hdr-pricing", "name": "Pricing Page Header Banner", "url": "/images/headers/intermaven/header-pricing.jpg", "category": "headers", "file_type": "image"},
    {"id": "builtin-hdr-about", "name": "About Page Header Banner", "url": "/images/headers/intermaven/header-about.jpg", "category": "headers", "file_type": "image"},
    {"id": "builtin-hdr-help", "name": "Help Page Header Banner", "url": "/images/headers/intermaven/header-help.jpg", "category": "headers", "file_type": "image"},
    {"id": "builtin-hdr-forum", "name": "Forum Page Header Banner", "url": "/images/headers/intermaven/header-forum.jpg", "category": "headers", "file_type": "image"},
    {"id": "builtin-logo-web", "name": "Intermaven Primary Logo (Web)", "url": "/images/logos/intermaven/intermaven-logo-web.png", "category": "logos", "file_type": "image"},
    {"id": "builtin-logo-footer", "name": "Intermaven Footer Logo", "url": "/images/logos/intermaven/intermaven-logo-footer.png", "category": "logos", "file_type": "image"},
    {"id": "builtin-icon-brandkit", "name": "Brand Kit AI Icon", "url": "./icons/brandkit.png", "category": "icons", "file_type": "image"},
    {"id": "builtin-icon-musicbio", "name": "Music Bio AI Icon", "url": "./icons/musicbio.png", "category": "icons", "file_type": "image"},
    {"id": "builtin-icon-social", "name": "Social AI Icon", "url": "./icons/social.png", "category": "icons", "file_type": "image"},
    {"id": "builtin-icon-epk", "name": "EPK Builder Icon", "url": "./icons/epk.png", "category": "icons", "file_type": "image"},
    {"id": "builtin-icon-crm", "name": "Smart CRM Icon", "url": "./icons/crm.png", "category": "icons", "file_type": "image"},
    {"id": "builtin-icon-pos", "name": "Intermaven POS Icon", "url": "./icons/pos.png", "category": "icons", "file_type": "image"}
]


@router.get("/api/admin/cms/media")
async def cms_media_list(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    uploaded = []
    if db is not None:
        for d in db.site_media.find({}).sort("created_at", -1):
            d["id"] = str(d["_id"])
            del d["_id"]
            if isinstance(d.get("created_at"), datetime):
                d["created_at"] = d["created_at"].isoformat()
            uploaded.append(d)
    combined = uploaded + BUILTIN_SITE_ASSETS
    return {"media": combined, "total": len(combined)}


@router.post("/api/admin/cms/media")
async def cms_media_upload(body: SiteMediaUpload, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    now = datetime.now(timezone.utc)
    doc = {
        "name": body.name,
        "url": body.data_url,
        "file_type": body.file_type or "image",
        "category": body.category or "site-assets",
        "created_at": now,
        "created_by": str(current_user["_id"])
    }
    res = db.site_media.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    del doc["_id"]
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.delete("/api/admin/cms/media/{asset_id}")
async def cms_media_delete(asset_id: str, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    from bson import ObjectId
    try:
        res = db.site_media.delete_one({"_id": ObjectId(asset_id)})
    except Exception:
        res = db.site_media.delete_one({"_id": asset_id})

    return {"deleted": res.deleted_count > 0, "id": asset_id}


@router.get("/api/admin/cms")
async def cms_list(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    items = [_strip(d) for d in db.cms_keys.find({}).sort("_id", 1)]
    return {"keys": items, "total": len(items)}


@router.get("/api/admin/cms/{key}")
async def cms_get_admin(key: str, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    doc = db.cms_keys.find_one({"_id": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Key not found")
    return _strip(doc)


@router.put("/api/admin/cms/{key}")
async def cms_upsert(key: str, body: CmsKeyUpsert, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    now = datetime.now(timezone.utc)
    existing = db.cms_keys.find_one({"_id": key})
    history_entry = {
        "revision_id": str(uuid.uuid4()),
        "at": now,
        "by": str(current_user["_id"]),
        "by_name": (current_user.get("first_name") or "") + " " + (current_user.get("last_name") or ""),
        "snapshot": {
            "default": (existing or {}).get("default"),
            "regions": (existing or {}).get("regions") or {},
            "portals": (existing or {}).get("portals") or {},
        } if existing else None,
    }

    update: Dict[str, Any] = {"updated_at": now, "updated_by": str(current_user["_id"])}
    if body.default is not None:
        update["default"] = body.default
    if body.regions is not None:
        update["regions"] = body.regions
    if body.portals is not None:
        update["portals"] = body.portals
    if body.description is not None:
        update["description"] = body.description
    set_on_insert = {"created_at": now}
    if not existing:
        set_on_insert["history"] = []

    db.cms_keys.update_one(
        {"_id": key},
        {
            "$set": update,
            "$setOnInsert": set_on_insert,
            "$push": {"history": history_entry} if existing else {"history": {"$each": []}},
        },
        upsert=True,
    )
    saved = db.cms_keys.find_one({"_id": key})
    return _strip(saved)


@router.get("/api/admin/cms/{key}/history")
async def cms_history(key: str, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    doc = db.cms_keys.find_one({"_id": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Key not found")
    hist = doc.get("history") or []
    for h in hist:
        if isinstance(h.get("at"), datetime):
            h["at"] = h["at"].isoformat()
    return {"key": key, "history": hist}


@router.post("/api/admin/cms/{key}/rollback/{revision_id}")
async def cms_rollback(key: str, revision_id: str, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    doc = db.cms_keys.find_one({"_id": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Key not found")
    rev = next((h for h in (doc.get("history") or []) if h.get("revision_id") == revision_id), None)
    if not rev or not rev.get("snapshot"):
        raise HTTPException(status_code=404, detail="Revision not found or has no snapshot")
    now = datetime.now(timezone.utc)
    # Push current state to history before rolling back
    pre_rollback_entry = {
        "revision_id": str(uuid.uuid4()),
        "at": now,
        "by": str(current_user["_id"]),
        "by_name": (current_user.get("first_name") or "") + " " + (current_user.get("last_name") or ""),
        "snapshot": {
            "default": doc.get("default"),
            "regions": doc.get("regions") or {},
            "portals": doc.get("portals") or {},
        },
        "rollback_to": revision_id,
    }
    snap = rev["snapshot"]
    db.cms_keys.update_one(
        {"_id": key},
        {
            "$set": {
                "default": snap.get("default"),
                "regions": snap.get("regions") or {},
                "portals": snap.get("portals") or {},
                "updated_at": now,
                "updated_by": str(current_user["_id"]),
            },
            "$push": {"history": pre_rollback_entry},
        },
    )
    saved = db.cms_keys.find_one({"_id": key})
    return _strip(saved)


@router.delete("/api/admin/cms/{key}")
async def cms_delete(key: str, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    res = db.cms_keys.delete_one({"_id": key})
    return {"deleted": res.deleted_count > 0, "key": key}
