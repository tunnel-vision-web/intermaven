from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from config import db

router = APIRouter(tags=["public"])


# ============== NEWSLETTER ==============

class NewsletterSubscribe(BaseModel):
    email: EmailStr


@router.post("/api/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):
    existing = db.newsletter_subscribers.find_one({"email": data.email.lower()})
    if existing:
        return {"success": True, "message": "Already subscribed"}

    db.newsletter_subscribers.insert_one({
        "email": data.email.lower(),
        "subscribed_at": datetime.now(timezone.utc),
        "status": "active"
    })

    return {"success": True, "message": "Successfully subscribed"}


# ============== BETA SIGNUPS ==============

class BetaSignup(BaseModel):
    app_id: str  # 'epk', 'lead_gen', 'pos'
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_channel: str  # 'email', 'whatsapp', 'sms'
    portal: Optional[str] = "music"


@router.post("/api/beta/signup")
async def signup_beta(data: BetaSignup):
    if data.preferred_channel == 'email' and not data.email:
        raise HTTPException(status_code=400, detail="Email required for email notifications")
    if data.preferred_channel in ['whatsapp', 'sms'] and not data.phone:
        raise HTTPException(status_code=400, detail="Phone required for WhatsApp/SMS notifications")

    query = {"app_id": data.app_id}
    if data.email:
        query["email"] = data.email.lower()
    elif data.phone:
        query["phone"] = data.phone

    existing = db.beta_signups.find_one(query)
    if existing:
        return {"success": True, "message": "Already on waitlist"}

    signup_data = {
        "app_id": data.app_id,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "preferred_channel": data.preferred_channel,
        "portal": data.portal,
        "status": "waiting",
        "created_at": datetime.now(timezone.utc)
    }

    db.beta_signups.insert_one(signup_data)

    return {"success": True, "message": "Successfully joined waitlist"}


@router.get("/api/beta/status/{app_id}")
async def get_beta_status(app_id: str, email: Optional[str] = None, phone: Optional[str] = None):
    query = {"app_id": app_id}
    if email:
        query["email"] = email.lower()
    elif phone:
        query["phone"] = phone
    else:
        raise HTTPException(status_code=400, detail="Email or phone required")

    signup = db.beta_signups.find_one(query)
    if not signup:
        return {"signed_up": False}

    return {
        "signed_up": True,
        "status": signup.get("status", "waiting"),
        "created_at": signup.get("created_at").isoformat() if isinstance(signup.get("created_at"), datetime) else None
    }


# ============== SUPPORT TICKETS ==============

class SupportTicketCreate(BaseModel):
    subject: str
    message: str
    category: str = "general"  # general, billing, technical, ai-tools
    preferred_channel: str = "email"  # email, whatsapp, sms
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    user_id: Optional[str] = None


class TicketMessage(BaseModel):
    ticket_id: str
    message: str
    sender: str = "user"  # user, ai, admin


def generate_ai_ticket_response(subject: str, message: str, category: str) -> str:
    """Generate automated AI response based on ticket content"""
    message_lower = message.lower()

    if category == "billing" or any(word in message_lower for word in ['credit', 'payment', 'mpesa', 'refund', 'charge']):
        return """Thank you for reaching out about billing. I'm reviewing your account now.

**Common solutions:**
- Credits are added instantly after M-Pesa confirmation
- Check your transaction history in Dashboard → Settings → Billing
- If payment failed, try again or use a different payment method

I'll investigate your specific case and respond within 24 hours via your preferred channel. If this is urgent, please reply with "URGENT" and I'll escalate immediately.

— Ayo, AI Support"""

    if category == "technical" or any(word in message_lower for word in ['error', 'bug', 'broken', 'not working', "doesn't work", 'issue']):
        return """I see you're experiencing a technical issue. Let me help troubleshoot.

**Quick fixes to try:**
1. Clear your browser cache and cookies
2. Try a different browser (Chrome recommended)
3. Log out and log back in
4. Check if the issue persists on mobile

Please share:
- Which browser/device you're using
- Any error messages you see
- Steps to reproduce the issue

I'm analyzing the system logs now and will follow up shortly.

— Ayo, AI Support"""

    if category == "ai-tools" or any(word in message_lower for word in ['brand kit', 'music bio', 'social ai', 'sync pitch', 'generate']):
        return """Thanks for your question about our AI tools!

**Quick tips:**
- Each tool has specific input requirements for best results
- More detailed inputs = better outputs
- You can regenerate if the first result isn't perfect

**Credit costs:**
- Brand Kit: 10 credits
- Music Bio: 15 credits
- Social AI: Free
- Sync Pitch: 20 credits
- Pitch Deck: 18 credits

Let me know which specific tool you need help with, and I'll provide detailed guidance.

— Ayo, AI Support"""

    return """Thank you for contacting Intermaven support. I've received your message and am reviewing it now.

I'll analyze your request and provide a detailed response within 24 hours via your preferred communication channel.

If this is urgent, please reply with "URGENT" to escalate.

In the meantime, you might find answers in:
- Our Help Center: /help
- Community Forum: /forum

— Ayo, AI Support"""


@router.post("/api/support/tickets")
async def create_support_ticket(data: SupportTicketCreate):
    if data.preferred_channel == 'email' and not data.email:
        raise HTTPException(status_code=400, detail="Email required for email communication")
    if data.preferred_channel in ['whatsapp', 'sms'] and not data.phone:
        raise HTTPException(status_code=400, detail="Phone required for WhatsApp/SMS communication")

    ticket_count = db.support_tickets.count_documents({}) + 1
    ticket_id = f"TKT-{ticket_count:06d}"

    ticket_data = {
        "ticket_id": ticket_id,
        "subject": data.subject,
        "category": data.category,
        "status": "open",
        "priority": "normal",
        "preferred_channel": data.preferred_channel,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "user_id": data.user_id,
        "messages": [
            {
                "sender": "user",
                "message": data.message,
                "timestamp": datetime.now(timezone.utc)
            }
        ],
        "ai_handled": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    db.support_tickets.insert_one(ticket_data)

    ai_response = generate_ai_ticket_response(data.subject, data.message, data.category)

    db.support_tickets.update_one(
        {"ticket_id": ticket_id},
        {
            "$push": {
                "messages": {
                    "sender": "ai",
                    "message": ai_response,
                    "timestamp": datetime.now(timezone.utc)
                }
            },
            "$set": {"status": "in_progress", "updated_at": datetime.now(timezone.utc)}
        }
    )

    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": "Support ticket created. Our AI assistant is reviewing your request.",
        "ai_response": ai_response
    }


@router.get("/api/support/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = db.support_tickets.find_one({"ticket_id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if isinstance(ticket.get("created_at"), datetime):
        ticket["created_at"] = ticket["created_at"].isoformat()
    if isinstance(ticket.get("updated_at"), datetime):
        ticket["updated_at"] = ticket["updated_at"].isoformat()
    for msg in ticket.get("messages", []):
        if isinstance(msg.get("timestamp"), datetime):
            msg["timestamp"] = msg["timestamp"].isoformat()

    return ticket


@router.post("/api/support/tickets/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, data: TicketMessage):
    ticket = db.support_tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.support_tickets.update_one(
        {"ticket_id": ticket_id},
        {
            "$push": {
                "messages": {
                    "sender": data.sender,
                    "message": data.message,
                    "timestamp": datetime.now(timezone.utc)
                }
            },
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )

    return {"success": True, "message": "Reply added"}


@router.post("/api/support/tickets/{ticket_id}/resolve")
async def resolve_ticket(ticket_id: str):
    ticket = db.support_tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.support_tickets.update_one(
        {"ticket_id": ticket_id},
        {
            "$set": {
                "status": "resolved",
                "resolved_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    forum_post = {
        "title": f"Resolved: {ticket['subject']}",
        "category": ticket["category"],
        "content": ticket["messages"],
        "source": "support_ticket",
        "ticket_id": ticket_id,
        "author": "Intermaven Support",
        "author_role": "Admin",
        "status": "published",
        "created_at": datetime.now(timezone.utc)
    }
    db.forum_posts.insert_one(forum_post)

    return {"success": True, "message": "Ticket resolved and posted to forum"}


@router.get("/api/support/tickets")
async def list_user_tickets(email: Optional[str] = None, phone: Optional[str] = None):
    query = {}
    if email:
        query["email"] = email.lower()
    elif phone:
        query["phone"] = phone
    else:
        raise HTTPException(status_code=400, detail="Email or phone required")

    tickets = list(db.support_tickets.find(query, {"_id": 0}).sort("created_at", -1).limit(50))

    for ticket in tickets:
        if isinstance(ticket.get("created_at"), datetime):
            ticket["created_at"] = ticket["created_at"].isoformat()
        if isinstance(ticket.get("updated_at"), datetime):
            ticket["updated_at"] = ticket["updated_at"].isoformat()

    return {"tickets": tickets}
