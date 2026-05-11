import os
from datetime import datetime, timezone
from typing import Optional, List

import httpx
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from config import db
from utils import get_current_user

router = APIRouter(tags=["crm"])


# ============== CRM WAITLIST ==============

class WaitlistSignup(BaseModel):
    list_type: str  # 'general', 'epk', 'pos', 'lead_gen', 'partner', 'enterprise'
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    preferred_channel: str = "email"
    source: Optional[str] = None
    notes: Optional[str] = None


@router.post("/api/crm/waitlist")
async def add_to_waitlist(data: WaitlistSignup):
    if data.preferred_channel == 'email' and not data.email:
        raise HTTPException(status_code=400, detail="Email required for email notifications")
    if data.preferred_channel in ['whatsapp', 'sms'] and not data.phone:
        raise HTTPException(status_code=400, detail="Phone required for WhatsApp/SMS notifications")

    query = {"list_type": data.list_type}
    if data.email:
        query["email"] = data.email.lower()
    elif data.phone:
        query["phone"] = data.phone

    existing = db.crm_waitlist.find_one(query)
    if existing:
        return {"success": True, "message": "Already on this waitlist", "already_exists": True}

    waitlist_entry = {
        "list_type": data.list_type,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "name": data.name,
        "company": data.company,
        "preferred_channel": data.preferred_channel,
        "source": data.source,
        "notes": data.notes,
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "contacted": False,
        "converted": False
    }

    db.crm_waitlist.insert_one(waitlist_entry)

    return {"success": True, "message": f"Added to {data.list_type} waitlist"}


@router.get("/api/crm/waitlist/{list_type}")
async def get_waitlist(list_type: str):
    entries = list(db.crm_waitlist.find(
        {"list_type": list_type, "status": "active"},
        {"_id": 0}
    ).sort("created_at", -1))

    for entry in entries:
        if isinstance(entry.get("created_at"), datetime):
            entry["created_at"] = entry["created_at"].isoformat()

    return {"waitlist": entries, "count": len(entries)}


# ============== CRM — CONTACTS ==============

class ContactCreate(BaseModel):
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = ""
    job_title: Optional[str] = ""
    tags: Optional[List[str]] = []
    source: Optional[str] = "manual"
    notes_text: Optional[str] = None


@router.get("/api/crm/contacts")
async def crm_list_contacts(
    page: int = 1, per_page: int = 25,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"owner_id": current_user["_id"], "deleted": {"$ne": True}}
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    if tag:
        query["tags"] = tag

    total = db.contacts.count_documents(query)
    skip = (page - 1) * per_page
    contacts_cursor = db.contacts.find(query).sort("created_at", -1).skip(skip).limit(per_page)
    contacts = []
    for c in contacts_cursor:
        c["id"] = str(c.pop("_id"))
        c.pop("owner_id", None)
        if isinstance(c.get("created_at"), datetime):
            c["created_at"] = c["created_at"].isoformat()
        if isinstance(c.get("updated_at"), datetime):
            c["updated_at"] = c["updated_at"].isoformat()
        contacts.append(c)
    return {"contacts": contacts, "total": total}


@router.post("/api/crm/contacts")
async def crm_create_contact(data: ContactCreate, current_user: dict = Depends(get_current_user)):
    if not data.email and not data.phone:
        raise HTTPException(400, "Email or phone required")
    contact = {
        "owner_id": current_user["_id"],
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "company": data.company,
        "job_title": data.job_title,
        "tags": data.tags or [],
        "source": data.source,
        "notes": [{"text": data.notes_text, "created_at": datetime.now(timezone.utc)}] if data.notes_text else [],
        "engagement": {"emails_sent": 0, "emails_opened": 0, "emails_clicked": 0, "whatsapp_messages": 0, "sms_messages": 0},
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = db.contacts.insert_one(contact)
    return {"id": str(result.inserted_id), "success": True}


@router.put("/api/crm/contacts/{contact_id}")
async def crm_update_contact(contact_id: str, data: ContactCreate, current_user: dict = Depends(get_current_user)):
    c = db.contacts.find_one({"_id": ObjectId(contact_id), "owner_id": current_user["_id"]})
    if not c:
        raise HTTPException(404, "Contact not found")
    update = {k: v for k, v in data.model_dump(exclude={"notes_text"}).items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    db.contacts.update_one({"_id": ObjectId(contact_id)}, {"$set": update})
    return {"success": True}


@router.delete("/api/crm/contacts/{contact_id}")
async def crm_delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    db.contacts.update_one({"_id": ObjectId(contact_id), "owner_id": current_user["_id"]}, {"$set": {"deleted": True}})
    return {"success": True}


@router.post("/api/crm/contacts/import")
async def crm_import_contacts(file: bytes = None, current_user: dict = Depends(get_current_user)):
    # Handled via multipart — simplified endpoint
    return {"imported": 0, "message": "Import endpoint ready — connect file upload"}


@router.post("/api/crm/contacts/export")
async def crm_export_contacts(body: dict = {}, current_user: dict = Depends(get_current_user)):
    from fastapi.responses import StreamingResponse
    import csv
    import io
    query = {"owner_id": current_user["_id"], "deleted": {"$ne": True}}
    if body.get("contact_ids"):
        query["_id"] = {"$in": [ObjectId(x) for x in body["contact_ids"]]}
    contacts = list(db.contacts.find(query))
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["first_name", "last_name", "email", "phone", "company", "job_title", "tags", "source"])
    for c in contacts:
        writer.writerow([c.get("first_name", ""), c.get("last_name", ""), c.get("email", ""), c.get("phone", ""), c.get("company", ""), c.get("job_title", ""), ",".join(c.get("tags", [])), c.get("source", "")])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=contacts.csv"})


@router.get("/api/crm/contacts/{contact_id}/messages")
async def crm_contact_messages(contact_id: str, current_user: dict = Depends(get_current_user)):
    msgs = list(db.crm_messages.find({"contact_id": ObjectId(contact_id), "owner_id": current_user["_id"]}).sort("created_at", -1).limit(100))
    for m in msgs:
        m["id"] = str(m.pop("_id"))
        m.pop("owner_id", None)
        m.pop("contact_id", None)
        if isinstance(m.get("created_at"), datetime):
            m["created_at"] = m["created_at"].isoformat()
    return {"messages": list(reversed(msgs))}


# ============== CRM — CAMPAIGNS ==============

class CampaignCreate(BaseModel):
    channel: str  # email, whatsapp, sms
    subject: Optional[str] = None
    body: str
    campaign_type: Optional[str] = "custom"
    recipient_type: str = "all"  # all, tag, plan
    tag_filter: Optional[str] = None
    plan_filter: Optional[str] = None
    scheduled_at: Optional[str] = None
    scheduled: Optional[bool] = False


@router.get("/api/crm/campaigns")
async def crm_list_campaigns(current_user: dict = Depends(get_current_user)):
    campaigns = list(db.crm_campaigns.find({"owner_id": current_user["_id"]}).sort("created_at", -1).limit(50))
    for c in campaigns:
        c["id"] = str(c.pop("_id"))
        c.pop("owner_id", None)
        for field in ["created_at", "sent_at", "scheduled_at"]:
            if isinstance(c.get(field), datetime):
                c[field] = c[field].isoformat()
    return {"campaigns": campaigns}


@router.post("/api/crm/campaigns")
async def crm_create_campaign(data: CampaignCreate, current_user: dict = Depends(get_current_user)):
    contact_query = {"owner_id": current_user["_id"], "deleted": {"$ne": True}, "status": "active"}
    if data.recipient_type == "tag" and data.tag_filter:
        contact_query["tags"] = data.tag_filter

    recipient_count = db.contacts.count_documents(contact_query)
    status = "scheduled" if data.scheduled and data.scheduled_at else "sent"

    campaign = {
        "owner_id": current_user["_id"],
        "channel": data.channel,
        "subject": data.subject,
        "body": data.body,
        "campaign_type": data.campaign_type,
        "recipient_type": data.recipient_type,
        "tag_filter": data.tag_filter,
        "recipients": recipient_count,
        "status": status,
        "stats": {"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "failed": 0},
        "created_at": datetime.now(timezone.utc),
        "sent_at": datetime.now(timezone.utc) if status == "sent" else None,
        "scheduled_at": datetime.fromisoformat(data.scheduled_at) if data.scheduled_at else None,
    }
    result = db.crm_campaigns.insert_one(campaign)
    campaign_id = result.inserted_id

    if status == "sent":
        db.crm_campaigns.update_one({"_id": campaign_id}, {"$set": {"stats.sent": recipient_count}})

    return {"id": str(campaign_id), "success": True, "recipients": recipient_count, "status": status}


@router.delete("/api/crm/campaigns/{campaign_id}")
async def crm_delete_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    db.crm_campaigns.delete_one({"_id": ObjectId(campaign_id), "owner_id": current_user["_id"]})
    return {"success": True}


# ============== CRM — MESSAGING ==============

class DirectMessage(BaseModel):
    contact_id: Optional[str] = None
    channel: str  # whatsapp, sms, email
    body: str
    subject: Optional[str] = None


class DirectMessageDirect(BaseModel):
    channel: str
    to: str  # phone or email
    body: str
    subject: Optional[str] = None


async def send_twilio_message(to: str, body: str, channel: str):
    """Send via Twilio - requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN"""
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    if not account_sid or not auth_token:
        return {"success": False, "error": "Twilio credentials not configured"}
    try:
        from_number = os.environ.get("TWILIO_WHATSAPP_NUMBER") if channel == "whatsapp" else os.environ.get("TWILIO_SMS_NUMBER")
        to_number = f"whatsapp:{to}" if channel == "whatsapp" else to
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
                data={"From": from_number, "To": to_number, "Body": body},
                auth=(account_sid, auth_token)
            )
            if response.status_code in [200, 201]:
                data = response.json()
                return {"success": True, "sid": data.get("sid"), "status": data.get("status")}
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/api/crm/messages/send")
async def crm_send_message(data: DirectMessage, current_user: dict = Depends(get_current_user)):
    contact = db.contacts.find_one({"_id": ObjectId(data.contact_id), "owner_id": current_user["_id"]})
    if not contact:
        raise HTTPException(404, "Contact not found")

    to = contact.get("phone") if data.channel in ["whatsapp", "sms"] else contact.get("email")
    if not to:
        raise HTTPException(400, f"Contact has no {data.channel} address")

    result = await send_twilio_message(to, data.body, data.channel)

    msg_record = {
        "owner_id": current_user["_id"],
        "contact_id": ObjectId(data.contact_id),
        "channel": data.channel,
        "direction": "outbound",
        "to": to,
        "body": data.body,
        "status": "sent" if result.get("success") else "failed",
        "twilio_sid": result.get("sid"),
        "created_at": datetime.now(timezone.utc)
    }
    db.crm_messages.insert_one(msg_record)

    if result.get("success"):
        inc_field = "engagement.whatsapp_messages" if data.channel == "whatsapp" else f"engagement.{data.channel}_messages"
        db.contacts.update_one({"_id": ObjectId(data.contact_id)}, {"$inc": {inc_field: 1}})

    return {"success": result.get("success"), "error": result.get("error")}


@router.post("/api/crm/messages/send-direct")
async def crm_send_direct(data: DirectMessageDirect, current_user: dict = Depends(get_current_user)):
    result = await send_twilio_message(data.to, data.body, data.channel)

    db.crm_messages.insert_one({
        "owner_id": current_user["_id"],
        "contact_id": None,
        "channel": data.channel,
        "direction": "outbound",
        "to": data.to,
        "body": data.body,
        "status": "sent" if result.get("success") else "failed",
        "twilio_sid": result.get("sid"),
        "created_at": datetime.now(timezone.utc)
    })
    return {"success": result.get("success"), "error": result.get("error")}


@router.get("/api/crm/messages/recent")
async def crm_recent_messages(current_user: dict = Depends(get_current_user)):
    msgs = list(db.crm_messages.find({"owner_id": current_user["_id"]}).sort("created_at", -1).limit(20))
    for m in msgs:
        m["id"] = str(m.pop("_id"))
        m.pop("owner_id", None)
        if m.get("contact_id"):
            m["contact_id"] = str(m["contact_id"])
        if isinstance(m.get("created_at"), datetime):
            m["created_at"] = m["created_at"].isoformat()
    return {"messages": msgs}


@router.post("/api/crm/twilio/webhook")
async def twilio_inbound_webhook(request_data: dict):
    """Receives inbound WhatsApp/SMS replies from Twilio"""
    from_number = request_data.get("From", "").replace("whatsapp:", "")
    body = request_data.get("Body", "")
    channel = "whatsapp" if "whatsapp" in request_data.get("From", "") else "sms"

    contact = db.contacts.find_one({"phone": from_number})

    msg_record = {
        "channel": channel,
        "direction": "inbound",
        "from": from_number,
        "body": body,
        "contact_id": contact["_id"] if contact else None,
        "owner_id": contact.get("owner_id") if contact else None,
        "created_at": datetime.now(timezone.utc)
    }
    db.crm_messages.insert_one(msg_record)

    if contact:
        inc_field = "engagement.whatsapp_messages" if channel == "whatsapp" else "engagement.sms_messages"
        db.contacts.update_one({"_id": contact["_id"]}, {"$inc": {inc_field: 1}})

    return {"success": True}
