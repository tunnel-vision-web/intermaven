from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import os
import uuid

from config import db
from utils import get_current_user, get_optional_user

router = APIRouter(prefix="/api/support", tags=["support"])


class AskAiRequest(BaseModel):
    question: str
    article_title: Optional[str] = None
    article_content: Optional[str] = None
    app_context: Optional[str] = None
    persona: Optional[str] = None


class TicketCreate(BaseModel):
    subject: str
    message: str
    category: Optional[str] = "general"
    priority: Optional[str] = "normal"


@router.post("/ask-ai")
async def ask_ai_help(req: AskAiRequest, current_user: dict | None = Depends(get_optional_user)):
    """Maven Knowledge-Base & Help AI endpoint connected to Help Articles & App Context."""
    q = (req.question or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question is required")

    persona = req.persona or (current_user.get("persona") if current_user else "creator")
    context_parts = []
    if req.app_context:
        context_parts.append(f"App Context: {req.app_context}")
    if req.article_title:
        context_parts.append(f"Help Article: {req.article_title}")
    if req.article_content:
        context_parts.append(f"Article Content:\n{req.article_content[:2500]}")

    system_prompt = (
        "You are Maven, the Intermaven & TuneMavens ecosystem AI assistant. "
        f"The user's current persona is '{persona}'. "
        "Answer clearly, concisely, and accurately using the provided Help Article context when available. "
        "Include actionable next steps inside Intermaven or TuneMavens."
    )
    user_prompt = ("\n\n".join(context_parts) + f"\n\nUser Question: {q}").strip()

    answer = None
    try:
        api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        if api_key:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=450,
                temperature=0.4,
            )
            answer = resp.choices[0].message.content
    except Exception:
        answer = None

    if not answer:
        if req.article_title and req.article_content:
            snippet = req.article_content.strip().split("\n")[0][:240]
            answer = (
                f"Based on **{req.article_title}** (tailored for your `{persona}` workspace): "
                f"{snippet}\n\n"
                "Next steps:\n"
                "1. Open the corresponding tool from your Dashboard sidebar.\n"
                "2. Check your persona defaults in Top-Right Settings if you need different tools.\n"
                "3. If you're still stuck, open a Support Ticket from the Help page and our team will assist."
            )
        else:
            answer = (
                f"Hi! I'm **Maven**. For your `{persona}` workspace, here's how to handle \"{q}\":\n\n"
                "• Use the **Get Help** button inside any app to view its dedicated guide.\n"
                "• Use **Smart CRM & Reachout** for email campaigns, **Distribution Tracker** for 150+ DSP deliveries, "
                "and **Top-Right Settings** to switch personas or manage your account.\n"
                "• Visit `/help` anytime to browse all knowledge-base articles or submit a ticket."
            )

    return {
        "answer": answer,
        "assistant": "Maven",
        "persona": persona,
        "article_title": req.article_title,
    }


@router.get("/tickets")
async def list_tickets(current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"tickets": []}
    tickets = list(
        db.support_tickets.find({"user_id": str(current_user["_id"])})
        .sort("created_at", -1)
        .limit(30)
    )
    for t in tickets:
        t["id"] = str(t.pop("_id"))
        if isinstance(t.get("created_at"), datetime):
            t["created_at"] = t["created_at"].isoformat()
    return {"tickets": tickets}


@router.post("/tickets")
async def create_ticket(req: TicketCreate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    doc = {
        "ticket_number": f"IM-{uuid.uuid4().hex[:6].upper()}",
        "user_id": str(current_user["_id"]),
        "user_email": current_user.get("email", ""),
        "subject": req.subject,
        "message": req.message,
        "category": req.category or "general",
        "priority": req.priority or "normal",
        "status": "open",
        "created_at": datetime.now(timezone.utc),
    }
    res = db.support_tickets.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    return {"success": True, "ticket": doc}
