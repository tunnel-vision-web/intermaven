"""
Strategies router — persistent strategy storage, public marketplace
("Use this strategy"), and PDF Brand Playbook generation.

Credit split model (configurable): 50% platform / 40% creator / 10% fees.
"""
import os
import io
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from config import db
from utils import get_current_user

router = APIRouter(tags=["strategies"])


# ============== CREDIT SPLIT ==============
CREDIT_SPLIT = {
    "platform": float(os.environ.get("STRATEGY_SPLIT_PLATFORM", 0.50)),
    "creator":  float(os.environ.get("STRATEGY_SPLIT_CREATOR",  0.40)),
    "fees":     float(os.environ.get("STRATEGY_SPLIT_FEES",     0.10)),
}
DEFAULT_STRATEGY_COST = int(os.environ.get("STRATEGY_DEFAULT_COST", 25))


# ============== MODELS ==============

class StrategySaveRequest(BaseModel):
    name: str
    strategy: Dict[str, Any]
    summary: Optional[str] = None
    is_public: bool = False
    credit_cost: Optional[int] = None
    tags: List[str] = Field(default_factory=list)


class StrategyShareRequest(BaseModel):
    name: str
    credit_cost: Optional[int] = None
    tags: List[str] = Field(default_factory=list)


class WizardStateSaveRequest(BaseModel):
    app_id: str
    state: Dict[str, Any]


# ============== HELPERS ==============

def _strip(doc: dict) -> dict:
    if not doc:
        return doc
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["_id"] = str(v)
            out["id"] = str(v)
        else:
            out[k] = v
    for k in ("owner_user_id", "user_id"):
        if k in out:
            out[k] = str(out[k])
    for k in ("created_at", "updated_at"):
        if isinstance(out.get(k), datetime):
            out[k] = out[k].isoformat()
    return out


def _get_profile(user_id) -> dict:
    profile = db.business_profiles.find_one({"user_id": user_id})
    return profile or {}


# ============== SAVED STRATEGIES (per user) ==============

@router.get("/api/strategies")
async def list_saved_strategies(current_user: dict = Depends(get_current_user)):
    cursor = db.user_strategies.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    items = [_strip(s) for s in cursor]
    return {"strategies": items, "total": len(items)}


@router.post("/api/strategies")
async def save_strategy(req: StrategySaveRequest, current_user: dict = Depends(get_current_user)):
    if not req.strategy:
        raise HTTPException(status_code=400, detail="Strategy body required")
    doc = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "name": req.name.strip(),
        "summary": req.summary or req.strategy.get("headline", ""),
        "strategy": req.strategy,
        "is_public": bool(req.is_public),
        "credit_cost": int(req.credit_cost or DEFAULT_STRATEGY_COST),
        "tags": req.tags,
        "usage_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    db.user_strategies.insert_one(doc)
    return _strip(doc)


@router.delete("/api/strategies/{strategy_id}")
async def delete_strategy(strategy_id: str, current_user: dict = Depends(get_current_user)):
    res = db.user_strategies.delete_one({"_id": strategy_id, "user_id": current_user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return {"deleted": True, "id": strategy_id}


# ============== PUBLIC STRATEGY LIBRARY ==============

@router.get("/api/strategies/library")
async def strategy_library(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
):
    """List public strategies. If no filters, returns those matching the user's profile."""
    q: Dict[str, Any] = {"is_public": True, "user_id": {"$ne": current_user["_id"]}}
    profile = _get_profile(current_user["_id"])
    industry_filter = industry or profile.get("industry")
    if industry_filter:
        q["$or"] = [
            {"tags": {"$regex": industry_filter, "$options": "i"}},
            {"summary": {"$regex": industry_filter, "$options": "i"}},
            {"strategy.headline": {"$regex": industry_filter, "$options": "i"}},
        ]
    cursor = db.user_strategies.find(q).sort("usage_count", -1).limit(limit)
    items = []
    for s in cursor:
        s = _strip(s)
        # Enrich with creator's first name (best effort, anonymized)
        try:
            owner = db.users.find_one({"_id": s["user_id"]}, {"first_name": 1})
            s["creator_name"] = (owner or {}).get("first_name") or "Anonymous Maven"
        except Exception:
            s["creator_name"] = "Anonymous Maven"
        items.append(s)
    return {"strategies": items, "total": len(items), "credit_split": CREDIT_SPLIT}


@router.post("/api/strategies/{strategy_id}/share")
async def share_strategy(strategy_id: str, req: StrategyShareRequest, current_user: dict = Depends(get_current_user)):
    """Mark a user's own strategy as public so others can browse / 'Use this'."""
    s = db.user_strategies.find_one({"_id": strategy_id, "user_id": current_user["_id"]})
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    updates = {
        "is_public": True,
        "name": req.name.strip() or s.get("name"),
        "credit_cost": int(req.credit_cost or s.get("credit_cost") or DEFAULT_STRATEGY_COST),
        "tags": req.tags or s.get("tags", []),
        "updated_at": datetime.now(timezone.utc),
    }
    db.user_strategies.update_one({"_id": strategy_id}, {"$set": updates})
    return _strip({**s, **updates})


@router.post("/api/strategies/{strategy_id}/use")
async def use_strategy(strategy_id: str, current_user: dict = Depends(get_current_user)):
    """Spend credits to copy a public strategy onto the current user's profile.

    Records credit split: platform / creator (credit bonus) / fees (revenue log).
    """
    src = db.user_strategies.find_one({"_id": strategy_id, "is_public": True})
    if not src:
        raise HTTPException(status_code=404, detail="Public strategy not found")
    if src["user_id"] == current_user["_id"]:
        raise HTTPException(status_code=400, detail="You already own this strategy")

    cost = int(src.get("credit_cost") or DEFAULT_STRATEGY_COST)
    buyer = db.users.find_one({"_id": current_user["_id"]}) or {}
    buyer_credits = int(buyer.get("credits", 0))
    if buyer_credits < cost:
        raise HTTPException(status_code=402, detail=f"Not enough credits. Needs {cost}, you have {buyer_credits}.")

    # Compute split
    creator_share = int(round(cost * CREDIT_SPLIT["creator"]))
    platform_share = int(round(cost * CREDIT_SPLIT["platform"]))
    fees_share = cost - creator_share - platform_share

    now = datetime.now(timezone.utc)

    # 1) Debit buyer
    db.users.update_one({"_id": current_user["_id"]}, {"$inc": {"credits": -cost}})

    # 2) Credit creator (bonus credits)
    db.users.update_one({"_id": src["user_id"]}, {"$inc": {"credits": creator_share}})

    # 3) Log transaction
    tx = {
        "_id": str(uuid.uuid4()),
        "type": "strategy_purchase",
        "buyer_user_id": current_user["_id"],
        "seller_user_id": src["user_id"],
        "strategy_id": strategy_id,
        "credits_spent": cost,
        "split": {"platform": platform_share, "creator": creator_share, "fees": fees_share},
        "created_at": now,
    }
    db.credit_transactions.insert_one(tx)

    # 4) Increment usage_count on source strategy
    db.user_strategies.update_one({"_id": strategy_id}, {"$inc": {"usage_count": 1}, "$set": {"updated_at": now}})

    # 5) Copy strategy into buyer's profile as the active strategy
    db.business_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"strategy": src["strategy"], "updated_at": now}},
        upsert=True,
    )

    # 6) Also save a snapshot to buyer's user_strategies for history
    seller_uid = str(src["user_id"])
    snapshot = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "name": f"{src.get('name','Strategy')} (from {seller_uid[:6]})",
        "summary": src.get("summary", ""),
        "strategy": src["strategy"],
        "is_public": False,
        "credit_cost": cost,
        "tags": src.get("tags", []),
        "source_strategy_id": strategy_id,
        "usage_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    db.user_strategies.insert_one(snapshot)

    return {
        "applied": True,
        "credits_spent": cost,
        "split": tx["split"],
        "new_credit_balance": buyer_credits - cost,
        "strategy": src["strategy"],
    }


# ============== SAVE WIZARD STATE PER APP ==============

@router.put("/api/wizard/state")
async def save_wizard_state(req: WizardStateSaveRequest, current_user: dict = Depends(get_current_user)):
    db.business_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {f"wizard_state.{req.app_id}": req.state, "updated_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return {"saved": True, "app_id": req.app_id, "state": req.state}


@router.get("/api/wizard/state/{app_id}")
async def get_wizard_state(app_id: str, current_user: dict = Depends(get_current_user)):
    profile = _get_profile(current_user["_id"])
    state = (profile.get("wizard_state") or {}).get(app_id, {})
    return {"app_id": app_id, "state": state}


# ============== BRAND PLAYBOOK PDF ==============

@router.get("/api/business-profile/playbook.pdf")
async def playbook_pdf(current_user: dict = Depends(get_current_user)):
    profile = _get_profile(current_user["_id"])
    if not profile or not profile.get("strategy"):
        raise HTTPException(status_code=400, detail="Generate your strategy first before downloading the playbook.")

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=0.7*inch, rightMargin=0.7*inch, topMargin=0.7*inch, bottomMargin=0.7*inch)
    styles = getSampleStyleSheet()

    accent = colors.HexColor("#22d3ee")
    ink = colors.HexColor("#0f172a")
    muted = colors.HexColor("#475569")
    gold = colors.HexColor("#f59e0b")

    h1 = ParagraphStyle("H1", parent=styles["Title"], textColor=ink, fontSize=28, leading=32, spaceAfter=10)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=accent, fontSize=14, leading=18, spaceBefore=18, spaceAfter=6)
    body = ParagraphStyle("Body", parent=styles["BodyText"], textColor=ink, fontSize=11, leading=16)
    sub = ParagraphStyle("Sub", parent=styles["BodyText"], textColor=muted, fontSize=10, leading=14)

    story = []
    strategy = profile.get("strategy") or {}

    # Cover
    story.append(Spacer(1, 0.6*inch))
    story.append(Paragraph("BRAND PLAYBOOK", ParagraphStyle("Cover", parent=h1, textColor=accent, fontSize=14, alignment=1)))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph(profile.get("business_name") or "Your Business", ParagraphStyle("BizName", parent=h1, fontSize=34, leading=40, alignment=1)))
    story.append(Spacer(1, 0.05*inch))
    story.append(Paragraph(f"{profile.get('industry') or '—'} · {profile.get('region') or '—'}", ParagraphStyle("Loc", parent=sub, alignment=1, fontSize=11)))
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(strategy.get("headline") or "Your custom go-to-market strategy", ParagraphStyle("Headline", parent=body, fontSize=14, leading=20, alignment=1, textColor=ink)))
    story.append(Spacer(1, 1.0*inch))
    story.append(Paragraph(f"Prepared for: {profile.get('business_name') or 'You'}", sub))
    story.append(Paragraph(f"Date: {datetime.now(timezone.utc).strftime('%B %d, %Y')}", sub))
    story.append(Paragraph("Crafted by Ayo · Intermaven", sub))
    story.append(PageBreak())

    # Section: Business Snapshot
    story.append(Paragraph("BUSINESS SNAPSHOT", h2))
    snapshot_rows = [
        ["Business name", profile.get("business_name") or "—"],
        ["Industry", profile.get("industry") or "—"],
        ["Role", profile.get("role") or "—"],
        ["Audience", profile.get("audience") or "—"],
        ["Region", profile.get("region") or "—"],
        ["Brand voice", profile.get("brand_voice") or "—"],
        ["Budget", profile.get("budget_band") or "—"],
    ]
    snap = Table(snapshot_rows, colWidths=[1.6*inch, 4.3*inch])
    snap.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, -1), "Helvetica", 10),
        ("TEXTCOLOR", (0, 0), (0, -1), muted),
        ("TEXTCOLOR", (1, 0), (1, -1), ink),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(snap)

    # Section: Goals
    goals = profile.get("goals") or []
    if goals:
        story.append(Paragraph("YOUR 90-DAY GOALS", h2))
        for g in goals:
            story.append(Paragraph(f"• {g}", body))

    # Section: Channels
    channels = strategy.get("channels") or []
    if channels:
        story.append(Paragraph("RECOMMENDED CHANNELS", h2))
        ch_rows = [["Channel", "Priority", "Why"]]
        for c in channels:
            ch_rows.append([c.get("name", "—"), (c.get("priority") or "—").title(), c.get("why", "—")])
        ch = Table(ch_rows, colWidths=[1.4*inch, 1.1*inch, 3.4*inch])
        ch.setStyle(TableStyle([
            ("FONT", (0, 0), (-1, -1), "Helvetica", 10),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
            ("BACKGROUND", (0, 0), (-1, 0), accent),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(ch)

    # Section: Cadence
    cadence = strategy.get("cadence") or []
    if cadence:
        story.append(Paragraph("POSTING CADENCE", h2))
        cad_rows = [["Channel", "Frequency"]]
        for c in cadence:
            cad_rows.append([c.get("channel", "—"), c.get("frequency", "—")])
        cad = Table(cad_rows, colWidths=[3*inch, 2.9*inch])
        cad.setStyle(TableStyle([
            ("FONT", (0, 0), (-1, -1), "Helvetica", 10),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
            ("BACKGROUND", (0, 0), (-1, 0), gold),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(cad)

    # Section: Content Pillars
    pillars = strategy.get("content_pillars") or []
    if pillars:
        story.append(Paragraph("CONTENT PILLARS", h2))
        story.append(Paragraph(" · ".join(pillars), ParagraphStyle("Pillars", parent=body, fontSize=12, leading=20, textColor=ink)))

    # Section: KPIs
    kpis = strategy.get("kpis") or []
    if kpis:
        story.append(Paragraph("90-DAY KPIs", h2))
        kpi_rows = [["Metric", "90-day target"]]
        for k in kpis:
            kpi_rows.append([k.get("metric", "—"), k.get("target_90d", "—")])
        kp = Table(kpi_rows, colWidths=[3*inch, 2.9*inch])
        kp.setStyle(TableStyle([
            ("FONT", (0, 0), (-1, -1), "Helvetica", 10),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10b981")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(kp)

    # Section: First 30 days
    first30 = strategy.get("first_30_days") or []
    if first30:
        story.append(Paragraph("FIRST 30 DAYS — ACTION PLAN", h2))
        for i, s in enumerate(first30, 1):
            story.append(Paragraph(f"{i}. {s}", body))

    # Footer
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph("— Ayo, your Intermaven strategist", ParagraphStyle("Sign", parent=body, fontSize=11, textColor=accent)))
    story.append(Paragraph("intermaven.io", sub))

    doc.build(story)
    buf.seek(0)
    fname = f"{(profile.get('business_name') or 'brand').replace(' ', '_').lower()}-playbook.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )
