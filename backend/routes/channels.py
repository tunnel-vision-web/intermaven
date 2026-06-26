"""
Channels router — connectable accounts (social, Google, messaging) used by
each app to publish, message, or fetch leads. OAuth is currently stubbed —
the UI flows are complete but providers return "coming soon"; users can use
"manual mode" to record an identifier today.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import db
from utils import get_current_user

router = APIRouter(tags=["channels"])


# ============== CHANNEL CATALOG ==============
# Single source of truth. Frontend renders cards based on this.
CHANNEL_CATALOG: List[Dict[str, Any]] = [
    # ---- Social ----
    {"id": "instagram", "name": "Instagram", "group": "Social", "color": "#e1306c",
     "supports_oauth": True, "oauth_provider": "meta",
     "supports_manual": True, "manual_label": "Instagram handle",
     "stub_reason": "Meta OAuth approval pending — manual mode available."},
    {"id": "facebook", "name": "Facebook Page", "group": "Social", "color": "#1877f2",
     "supports_oauth": True, "oauth_provider": "meta",
     "supports_manual": True, "manual_label": "Facebook Page URL",
     "stub_reason": "Meta OAuth approval pending — manual mode available."},
    {"id": "threads", "name": "Threads", "group": "Social", "color": "#000000",
     "supports_oauth": True, "oauth_provider": "meta",
     "supports_manual": True, "manual_label": "Threads handle",
     "stub_reason": "Meta OAuth approval pending — manual mode available."},
    {"id": "tiktok", "name": "TikTok", "group": "Social", "color": "#00f2ea",
     "supports_oauth": True, "oauth_provider": "tiktok",
     "supports_manual": True, "manual_label": "TikTok handle",
     "stub_reason": "TikTok for Business OAuth in review — manual mode available."},
    {"id": "x", "name": "X (Twitter)", "group": "Social", "color": "#1d9bf0",
     "supports_oauth": True, "oauth_provider": "x",
     "supports_manual": True, "manual_label": "X (@handle)",
     "stub_reason": "X API tier pending — manual mode available."},
    {"id": "linkedin", "name": "LinkedIn", "group": "Social", "color": "#0a66c2",
     "supports_oauth": True, "oauth_provider": "linkedin",
     "supports_manual": True, "manual_label": "LinkedIn page URL",
     "stub_reason": "LinkedIn Marketing API approval pending — manual mode available."},
    {"id": "youtube", "name": "YouTube", "group": "Social", "color": "#ff0000",
     "supports_oauth": True, "oauth_provider": "google",
     "supports_manual": True, "manual_label": "YouTube channel URL",
     "stub_reason": "Google OAuth approval pending — manual mode available."},

    # ---- Google ----
    {"id": "google_lsa", "name": "Google Local Services Ads", "group": "Google", "color": "#4285f4",
     "supports_oauth": False, "oauth_provider": None,
     "supports_manual": True, "manual_label": "LSA Advertiser ID",
     "external_setup_url": "https://ads.google.com/local-services-ads/",
     "stub_reason": "LSA onboarding happens directly on Google — paste your Advertiser ID once approved."},
    {"id": "google_business_profile", "name": "Google Business Profile", "group": "Google", "color": "#34a853",
     "supports_oauth": True, "oauth_provider": "google",
     "supports_manual": True, "manual_label": "GBP Place ID",
     "external_setup_url": "https://business.google.com/",
     "stub_reason": "Google OAuth approval pending — manual mode available."},
    {"id": "google_search_ads", "name": "Google Search Ads", "group": "Google", "color": "#fbbc04",
     "supports_oauth": True, "oauth_provider": "google",
     "supports_manual": True, "manual_label": "Google Ads Customer ID",
     "external_setup_url": "https://ads.google.com/",
     "stub_reason": "Google Ads API access pending — manual mode available."},

    # ---- Messaging ----
    {"id": "whatsapp_business", "name": "WhatsApp Business", "group": "Messaging", "color": "#25d366",
     "supports_oauth": False, "oauth_provider": None,
     "supports_manual": True, "manual_label": "WhatsApp Business phone",
     "stub_reason": "Connect via your verified WhatsApp Business number."},
    {"id": "email_resend", "name": "Email (Resend)", "group": "Messaging", "color": "#000000",
     "supports_oauth": False, "oauth_provider": None,
     "supports_manual": True, "manual_label": "Sender email + verified domain",
     "stub_reason": "Add your verified sender domain to enable broadcasts."},
    {"id": "sms_twilio", "name": "SMS (Twilio)", "group": "Messaging", "color": "#f22f46",
     "supports_oauth": False, "oauth_provider": None,
     "supports_manual": True, "manual_label": "Twilio phone number",
     "stub_reason": "Add your Twilio number to enable SMS campaigns."},
]

CATALOG_BY_ID = {c["id"]: c for c in CHANNEL_CATALOG}

# Loose mapping of strategy-channel names → channel catalog IDs.
# Lets us identify "required" channels from a user's strategy.
STRATEGY_NAME_MAP = {
    "instagram": "instagram",
    "facebook": "facebook",
    "facebook page": "facebook",
    "threads": "threads",
    "tiktok": "tiktok",
    "x": "x",
    "twitter": "x",
    "x (twitter)": "x",
    "linkedin": "linkedin",
    "youtube": "youtube",
    "youtube shorts": "youtube",
    "google local services ads": "google_lsa",
    "google lsa": "google_lsa",
    "lsa": "google_lsa",
    "google business profile": "google_business_profile",
    "gbp": "google_business_profile",
    "google search ads": "google_search_ads",
    "google search": "google_search_ads",
    "whatsapp": "whatsapp_business",
    "whatsapp business": "whatsapp_business",
    "email": "email_resend",
    "email (resend)": "email_resend",
    "sms": "sms_twilio",
}


def _strategy_name_to_channel_id(name: str) -> Optional[str]:
    if not name:
        return None
    key = name.lower().strip()
    if key in STRATEGY_NAME_MAP:
        return STRATEGY_NAME_MAP[key]
    # fuzzy substring match
    for k, v in STRATEGY_NAME_MAP.items():
        if k in key or key in k:
            return v
    return None


# ============== MODELS ==============

class ConnectRequest(BaseModel):
    mode: str  # "oauth_stub" | "manual"
    identifier: Optional[str] = None  # account handle / page id / advertiser id


def _strip(doc: dict) -> dict:
    if not doc:
        return doc
    out = {k: v for k, v in doc.items() if k != "_id"}
    if "_id" in doc:
        out["id"] = str(doc["_id"])
    if "user_id" in out:
        out["user_id"] = str(out["user_id"])
    for k in ("connected_at", "last_sync"):
        if isinstance(out.get(k), datetime):
            out[k] = out[k].isoformat()
    return out


def _user_connections(user_id) -> Dict[str, dict]:
    return {c["channel_id"]: _strip(c) for c in db.user_channels.find({"user_id": user_id})}


# ============== ENDPOINTS ==============

@router.get("/api/channels")
async def list_channels(current_user: dict = Depends(get_current_user)):
    """Returns every channel in the catalog merged with the user's connection status."""
    user_conns = _user_connections(current_user["_id"])
    items = []
    for c in CHANNEL_CATALOG:
        conn = user_conns.get(c["id"])
        items.append({
            **c,
            "connected": bool(conn and conn.get("status") == "connected"),
            "status": (conn or {}).get("status", "disconnected"),
            "mode": (conn or {}).get("mode"),
            "identifier": (conn or {}).get("identifier"),
            "connected_at": (conn or {}).get("connected_at"),
        })
    return {"channels": items, "total": len(items)}


@router.get("/api/channels/required")
async def required_channels(current_user: dict = Depends(get_current_user)):
    """List channels mentioned in the user's strategy that aren't yet connected."""
    profile = db.business_profiles.find_one({"user_id": current_user["_id"]}) or {}
    strategy = profile.get("strategy") or {}
    user_conns = _user_connections(current_user["_id"])
    required: List[Dict[str, Any]] = []
    seen = set()
    for ch in (strategy.get("channels") or []):
        cid = _strategy_name_to_channel_id(ch.get("name", ""))
        if not cid or cid in seen:
            continue
        seen.add(cid)
        catalog = CATALOG_BY_ID.get(cid)
        if not catalog:
            continue
        conn = user_conns.get(cid)
        required.append({
            **catalog,
            "priority": ch.get("priority", "secondary"),
            "why": ch.get("why", ""),
            "connected": bool(conn and conn.get("status") == "connected"),
            "status": (conn or {}).get("status", "disconnected"),
        })
    return {
        "required": required,
        "total": len(required),
        "connected_count": sum(1 for r in required if r["connected"]),
    }


@router.post("/api/channels/{channel_id}/connect")
async def connect_channel(channel_id: str, req: ConnectRequest, current_user: dict = Depends(get_current_user)):
    catalog = CATALOG_BY_ID.get(channel_id)
    if not catalog:
        raise HTTPException(status_code=404, detail="Unknown channel")
    if req.mode not in ("oauth_stub", "manual"):
        raise HTTPException(status_code=400, detail="Invalid mode")
    if req.mode == "manual" and not (req.identifier or "").strip():
        raise HTTPException(status_code=400, detail=f"{catalog['manual_label']} is required")

    now = datetime.now(timezone.utc)
    status = "pending_oauth" if req.mode == "oauth_stub" else "connected"
    doc = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "channel_id": channel_id,
        "mode": req.mode,
        "identifier": (req.identifier or "").strip() or None,
        "status": status,
        "connected_at": now if status == "connected" else None,
        "created_at": now,
        "updated_at": now,
    }
    db.user_channels.update_one(
        {"user_id": current_user["_id"], "channel_id": channel_id},
        {"$set": {k: v for k, v in doc.items() if k != "_id"}, "$setOnInsert": {"_id": doc["_id"]}},
        upsert=True,
    )
    saved = db.user_channels.find_one({"user_id": current_user["_id"], "channel_id": channel_id})
    return _strip(saved)


@router.delete("/api/channels/{channel_id}")
async def disconnect_channel(channel_id: str, current_user: dict = Depends(get_current_user)):
    res = db.user_channels.delete_one({"user_id": current_user["_id"], "channel_id": channel_id})
    return {"deleted": res.deleted_count > 0, "channel_id": channel_id}
