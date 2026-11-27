from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from config import db
from utils import get_current_user

router = APIRouter(prefix="/api/events", tags=["events"])


SEED_NETWORK_EVENTS: List[Dict[str, Any]] = [
    {
        "id": "tm-nairobi-showcase-2026",
        "title": "TuneMavens East Africa Creator Showcase",
        "category": "Live Showcase",
        "date": "2026-12-12",
        "time": "19:00",
        "city": "Nairobi",
        "country": "KE",
        "venue": "Alchemist Bar, Westlands",
        "payment_mode": "paid_ticket",
        "ticket_price": 1500,
        "currency": "KES",
        "is_public": True,
        "source": "tunemavens_network",
    },
    {
        "id": "tm-sync-summit-2026",
        "title": "SyncMavens Film & Brand Licensing Mixer",
        "category": "Industry Mixer",
        "date": "2026-12-19",
        "time": "17:30",
        "city": "Lagos",
        "country": "NG",
        "venue": "Victoria Island Creative Hub",
        "payment_mode": "free_rsvp",
        "ticket_price": 0,
        "currency": "NGN",
        "is_public": True,
        "source": "tunemavens_network",
    },
]


def _serialize_event(doc: dict) -> dict:
    ev_id = doc.get("id") or str(doc.get("_id", ""))
    return {
        "id": ev_id,
        "title": doc.get("title", ""),
        "category": doc.get("category", "Tour Stop"),
        "date": doc.get("date", ""),
        "time": doc.get("time", ""),
        "city": doc.get("city", ""),
        "country": doc.get("country", "KE"),
        "venue": doc.get("venue", ""),
        "hotel": doc.get("hotel", ""),
        "routing_notes": doc.get("routing_notes", ""),
        "ticket_url": doc.get("ticket_url", ""),
        "payment_mode": doc.get("payment_mode", "free_rsvp"),
        "ticket_price": doc.get("ticket_price", 0),
        "currency": doc.get("currency", "KES"),
        "capacity": doc.get("capacity", 0),
        "status": doc.get("status", "confirmed"),
        "is_public": bool(doc.get("is_public", True)),
        "sync_to_epk": bool(doc.get("sync_to_epk", False)),
        "guest_list": doc.get("guest_list", []),
        "source": doc.get("source", "tour_manager"),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", "")),
    }


def get_or_seed_events() -> List[Dict[str, Any]]:
    """Shared TuneMavens Events Network helper used by Smart CRM & Tour Manager."""
    if db is None:
        return list(SEED_NETWORK_EVENTS)
    existing = list(db.events.find({}).sort("date", 1).limit(200))
    if not existing:
        now = datetime.now(timezone.utc)
        for ev in SEED_NETWORK_EVENTS:
            db.events.insert_one({**ev, "created_at": now, "updated_at": now})
        existing = list(db.events.find({}).sort("date", 1).limit(200))
    return [_serialize_event(e) for e in existing]


def _enrich_event_with_rsvp(raw_ev: Dict[str, Any], include_lists: bool = False) -> Dict[str, Any]:
    """Attach RSVP count metadata for TuneMavens Smart CRM event links."""
    ev = dict(raw_ev)
    if db is not None:
        rsvp_count = db.event_rsvps.count_documents({"event_id": ev.get("id")})
        ev["rsvp_count"] = rsvp_count
        if include_lists:
            ev["rsvps"] = list(db.event_rsvps.find({"event_id": ev.get("id")}, {"_id": 0}).limit(100))
    else:
        ev["rsvp_count"] = 0
    return ev


class TourEventCreate(BaseModel):
    title: str
    category: str = "Tour Stop"
    date: str
    time: Optional[str] = "20:00"
    city: str
    country: str = "KE"
    venue: str
    hotel: Optional[str] = ""
    routing_notes: Optional[str] = ""
    ticket_url: Optional[str] = ""
    payment_mode: str = "free_rsvp"
    ticket_price: float = Field(0, ge=0)
    currency: str = "KES"
    capacity: int = Field(0, ge=0)
    is_public: bool = True
    sync_to_epk: bool = True


class TourEventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    city: Optional[str] = None
    venue: Optional[str] = None
    hotel: Optional[str] = None
    routing_notes: Optional[str] = None
    ticket_url: Optional[str] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None


class GuestEntryCreate(BaseModel):
    name: str
    email: Optional[str] = ""
    plus_ones: int = Field(0, ge=0, le=10)


@router.get("")
async def list_events(
    mine: bool = False,
    city: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        return {"events": list(SEED_NETWORK_EVENTS)}

    get_or_seed_events()
    query: Dict[str, Any] = {}
    if mine:
        query["user_id"] = current_user["_id"]
    else:
        query["$or"] = [{"is_public": True}, {"user_id": current_user["_id"]}]
    if city and city.strip():
        query["city"] = {"$regex": city.strip(), "$options": "i"}

    docs = list(db.events.find(query).sort("date", 1).limit(200))
    return {"events": [_enrich_event_with_rsvp(_serialize_event(d)) for d in docs]}


@router.post("")
async def create_tour_event(payload: TourEventCreate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    now = datetime.now(timezone.utc)
    ev_id = f"ev-{uuid.uuid4().hex[:10]}"
    doc = {
        "id": ev_id,
        "user_id": current_user["_id"],
        "title": payload.title.strip(),
        "category": payload.category,
        "date": payload.date,
        "time": payload.time or "20:00",
        "city": payload.city.strip(),
        "country": payload.country.upper(),
        "venue": payload.venue.strip(),
        "hotel": (payload.hotel or "").strip(),
        "routing_notes": (payload.routing_notes or "").strip(),
        "ticket_url": (payload.ticket_url or "").strip(),
        "payment_mode": payload.payment_mode,
        "ticket_price": payload.ticket_price,
        "currency": payload.currency.upper(),
        "capacity": payload.capacity,
        "status": "confirmed",
        "is_public": payload.is_public,
        "sync_to_epk": payload.sync_to_epk,
        "guest_list": [],
        "source": "tour_manager",
        "created_at": now,
        "updated_at": now,
    }
    db.events.insert_one(doc)

    # Sync to artist EPK upcoming events if requested and EPK exists
    if payload.sync_to_epk:
        db.epk_profiles.update_one(
            {"user_id": current_user["_id"]},
            {
                "$push": {
                    "events_upcoming": {
                        "event_id": ev_id,
                        "title": doc["title"],
                        "date": doc["date"],
                        "venue": doc["venue"],
                        "city": doc["city"],
                        "ticket_url": doc["ticket_url"],
                    }
                },
                "$set": {"updated_at": now},
            },
        )

    return {"success": True, "event": _serialize_event(doc)}


@router.put("/{event_id}")
async def update_tour_event(event_id: str, payload: TourEventUpdate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    for field in ("title", "date", "time", "city", "venue", "hotel", "routing_notes", "ticket_url", "status", "is_public"):
        val = getattr(payload, field)
        if val is not None:
            updates[field] = val

    doc = db.events.find_one_and_update(
        {"id": event_id, "user_id": current_user["_id"]},
        {"$set": updates},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Tour event not found")
    return {"success": True, "event": _serialize_event(doc)}


@router.post("/{event_id}/guests")
async def add_guest_to_event(event_id: str, payload: GuestEntryCreate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    guest = {
        "guest_id": uuid.uuid4().hex[:8],
        "name": payload.name.strip(),
        "email": (payload.email or "").strip(),
        "plus_ones": payload.plus_ones,
        "checked_in": False,
    }
    doc = db.events.find_one_and_update(
        {"id": event_id, "user_id": current_user["_id"]},
        {"$push": {"guest_list": guest}, "$set": {"updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Tour event not found")
    return {"success": True, "event": _serialize_event(doc)}


@router.delete("/{event_id}")
async def delete_tour_event(event_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    res = db.events.delete_one({"id": event_id, "user_id": current_user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tour event not found")
    db.epk_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$pull": {"events_upcoming": {"event_id": event_id}}},
    )
    return {"success": True}
