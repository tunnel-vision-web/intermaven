from datetime import datetime, timedelta, timezone
import os
import random
from typing import Any, Dict, List, Optional
from bson import ObjectId

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import db, logger
from utils import get_current_user

router = APIRouter(prefix="/api/grants", tags=["grants"])

APPLICATION_STAGES = ["draft", "submitted", "under_review", "shortlisted", "approved", "declined"]

SEED_GRANTS: List[Dict[str, Any]] = [
    {
        "id": "grant-british-council-ea",
        "title": "British Council — East Africa Arts & Mobility Grant",
        "funder": "British Council",
        "category": "Creative Arts",
        "region": "East Africa",
        "amount": "£2,000 – £10,000",
        "recommended_ask": "£6,500",
        "deadline": "Rolling / Quarterly",
        "review_timeline": "6–8 weeks after quarterly cutoff",
        "program_email": "arts.eastafrica@britishcouncil.org",
        "submission_mode": "hybrid",
        "eligibility": "Artists, musicians, curators, and creative collectives based in Kenya, Uganda, Tanzania, Rwanda, or Ethiopia.",
        "summary": "Supports cross-border collaborations, touring, showcases, and digital creative residencies between East Africa and the UK.",
        "requirements": [
            "Executive Summary & Cross-Border Creative Concept",
            "Applicant Bio / Portfolio or EPK Link",
            "Itemized Production & Travel Budget",
            "6-Month Delivery & Audience Impact Timeline",
        ],
        "apply_url": "https://www.britishcouncil.org/arts",
    },
    {
        "id": "grant-heva-creative",
        "title": "HEVA Fund — East Africa Creative Economy Growth Facility",
        "funder": "HEVA Fund",
        "category": "Business & SME",
        "region": "East Africa",
        "amount": "KES 500,000 – KES 5,000,000",
        "recommended_ask": "KES 1,500,000",
        "deadline": "Rolling Cohorts",
        "review_timeline": "4–6 weeks including due diligence",
        "program_email": "applications@hevafund.com",
        "submission_mode": "hybrid",
        "eligibility": "Registered creative businesses, music studios, fashion labels, live events, and digital media SMEs in Kenya & East Africa.",
        "summary": "Provides catalytic growth financing, working capital, and equipment funding tailored specifically for East African creative enterprises.",
        "requirements": [
            "Business / Studio Overview & Revenue Model",
            "Working Capital & Equipment Use-of-Funds Schedule",
            "12-Month Cashflow & Growth Milestones",
            "Company Registration / Founder Profile",
        ],
        "apply_url": "https://www.hevafund.com",
    },
    {
        "id": "grant-goethe-coprod",
        "title": "Goethe-Institut — International Coproduction Fund",
        "funder": "Goethe-Institut",
        "category": "Music & Audio",
        "region": "Global",
        "amount": "Up to €25,000",
        "recommended_ask": "€18,000",
        "deadline": "Bi-annual (Spring & Autumn)",
        "review_timeline": "8 weeks post-deadline",
        "program_email": "koprod@goethe.de",
        "submission_mode": "hybrid",
        "eligibility": "Independent musicians, sound artists, and performing arts ensembles co-producing with international partners.",
        "summary": "Funds collaborative music production, live touring rehearsals, and cross-cultural artistic exchanges.",
        "requirements": [
            "Artistic Co-Production Statement & Collaborator Details",
            "Audio / Video Work Samples or EPK",
            "Balanced Co-Financing & Production Budget",
            "Rehearsal, Premiere & Touring Schedule",
        ],
        "apply_url": "https://www.goethe.de/en/kul/foe/int.html",
    },
    {
        "id": "grant-africa-no-filter",
        "title": "Africa No Filter — Narrative Change Micro-Grant",
        "funder": "Africa No Filter",
        "category": "Film & Media",
        "region": "Africa",
        "amount": "$2,500 – $15,000",
        "recommended_ask": "$10,000",
        "deadline": "Rolling",
        "review_timeline": "4–5 weeks rolling review",
        "program_email": "grants@africanofilter.org",
        "submission_mode": "hybrid",
        "eligibility": "African storytellers, podcasters, filmmakers, journalists, and digital creators.",
        "summary": "Supports creative projects that shift stereotypical narratives about Africa through music, film, audio, and digital media.",
        "requirements": [
            "Narrative-Shift Concept & Target Audience Reach",
            "Creator Track Record & Past Work Links",
            "Distribution & Social Amplification Plan",
            "Milestone Budget Breakdown",
        ],
        "apply_url": "https://africanofilter.org/grants",
    },
    {
        "id": "grant-tef-entrepreneurship",
        "title": "Tony Elumelu Foundation Entrepreneurship Programme",
        "funder": "Tony Elumelu Foundation",
        "category": "Business & SME",
        "region": "Africa",
        "amount": "$5,000 Non-Refundable Seed Capital",
        "recommended_ask": "$5,000",
        "deadline": "Annual (Q1)",
        "review_timeline": "8–10 weeks + mentorship cohort",
        "program_email": "enquiries@tonyelumelufoundation.org",
        "submission_mode": "portal",
        "eligibility": "African entrepreneurs with early-stage businesses (0–3 years) across creative, tech, or commercial sectors.",
        "summary": "Provides business training, mentorship, and $5,000 non-refundable seed funding to scale African startups.",
        "requirements": [
            "Problem Statement & Scalable Business Solution",
            "Target Market & Customer Acquisition Plan",
            "$5,000 Seed Capital Deployment Breakdown",
            "Job Creation & SDG Impact Projections",
        ],
        "apply_url": "https://www.tefconnect.com",
    },
    {
        "id": "grant-music-in-africa",
        "title": "Music In Africa — Sound Connects Fund",
        "funder": "Music In Africa Foundation",
        "category": "Music & Audio",
        "region": "Africa",
        "amount": "€15,000 – €80,000",
        "recommended_ask": "€35,000",
        "deadline": "Annual",
        "review_timeline": "6–10 weeks panel evaluation",
        "program_email": "scf@musicinafrica.net",
        "submission_mode": "hybrid",
        "eligibility": "Music hubs, labels, studios, and industry organizations across Southern & East Africa.",
        "summary": "Accelerates music infrastructure, studio access, distribution capacity, and artist career development.",
        "requirements": [
            "Organizational Capacity & Music Ecosystem Track Record",
            "Program Implementation & Beneficiary Targets",
            "Detailed Multi-Line Euro Budget",
            "Monitoring, Evaluation & Sustainability Plan",
        ],
        "apply_url": "https://www.musicinafrica.net",
    },
    {
        "id": "grant-unesco-ifcd",
        "title": "UNESCO — International Fund for Cultural Diversity (IFCD)",
        "funder": "UNESCO",
        "category": "Creative Arts",
        "region": "Global",
        "amount": "Up to $100,000",
        "recommended_ask": "$65,000",
        "deadline": "Annual (May/June)",
        "review_timeline": "12–16 weeks international review",
        "program_email": "convention2005.ifcd@unesco.org",
        "submission_mode": "portal",
        "eligibility": "NGOs, cultural collectives, and public institutions in developing countries fostering creative industry ecosystems.",
        "summary": "Backs structural cultural initiatives, digital creative marketplaces, artist training, and cultural policy innovation.",
        "requirements": [
            "Ecosystem Impact Framework & Cultural Policy Alignment",
            "12–24 Month Workplan & Partner Commitments",
            "Audited / Verifiable Organizational Profile",
            "Comprehensive Activity-Based Budget",
        ],
        "apply_url": "https://www.unesco.org/creativity/en/ifcd",
    },
    {
        "id": "grant-afac-music",
        "title": "AFAC — Music & Performing Arts Production Grant",
        "funder": "Arab Fund for Arts & Culture",
        "category": "Music & Audio",
        "region": "Global",
        "amount": "Up to $20,000",
        "recommended_ask": "$15,000",
        "deadline": "Annual",
        "review_timeline": "8–12 weeks jury evaluation",
        "program_email": "grants@arabculturefund.org",
        "submission_mode": "hybrid",
        "eligibility": "Independent musicians, composers, and producers working on album production or live performance.",
        "summary": "Supports recording, mixing, mastering, and touring of original contemporary and experimental music.",
        "requirements": [
            "Artistic Treatment & Album / Performance Vision",
            "Demo / Reference Audio & Artist EPK",
            "Studio, Mixing, Mastering & Release Budget",
            "Release & Touring Timeline",
        ],
        "apply_url": "https://www.arabculturefund.org",
    },
    {
        "id": "grant-prs-foundation",
        "title": "PRS Foundation — International Showcase Fund",
        "funder": "PRS Foundation",
        "category": "Music & Audio",
        "region": "Global",
        "amount": "£1,500 – £5,500",
        "recommended_ask": "£4,000",
        "deadline": "Monthly Rounds",
        "review_timeline": "3–4 weeks fast-track decision",
        "program_email": "info@prsfoundation.com",
        "submission_mode": "hybrid",
        "eligibility": "Export-ready artists, bands, songwriters, and producers invited to perform at international music conferences (SXSW, WOMEX, etc.).",
        "summary": "Covers international travel, visas, accommodation, and per diems for career-defining showcase performances.",
        "requirements": [
            "Official Showcase Invitation Confirmation",
            "Artist Export Readiness & Press / Streaming Traction",
            "Travel, Visa & Accommodation Cost Breakdown",
            "Target Industry Meetings & ROI Plan",
        ],
        "apply_url": "https://prsfoundation.com/funding-support/",
    },
    {
        "id": "grant-docubox-ea",
        "title": "Docubox — East African Documentary & Music Film Fund",
        "funder": "Docubox East Africa",
        "category": "Film & Media",
        "region": "East Africa",
        "amount": "$5,000 – $20,000",
        "recommended_ask": "$12,000",
        "deadline": "Bi-annual",
        "review_timeline": "6 weeks + pitch session",
        "program_email": "info@mydocubox.org",
        "submission_mode": "hybrid",
        "eligibility": "Filmmakers, visual directors, and music documentary creators based in Kenya, Uganda, Tanzania, Rwanda, or Burundi.",
        "summary": "Provides production grants, edit labs, and festival distribution support for East African non-fiction and cultural films.",
        "requirements": [
            "Director's Statement, Synopsis & Visual Reel",
            "Production Crew & Shoot Schedule",
            "Production + Post-Production Budget",
            "Festival & Regional Screening Strategy",
        ],
        "apply_url": "https://www.mydocubox.org",
    },
]


# ============== HELPERS: SEEDING, USER PROFILE SYNTHESIS & COMMS ==============

def _ensure_grants_seeded() -> None:
    if db is None:
        return
    now = datetime.now(timezone.utc)
    for g in SEED_GRANTS:
        existing = db.grants.find_one({"id": g["id"]})
        if not existing:
            db.grants.insert_one({**g, "created_at": now})
        else:
            # Backfill enriched metadata (requirements, review_timeline, program_email, recommended_ask)
            updates = {}
            for k in ("requirements", "review_timeline", "program_email", "submission_mode", "recommended_ask"):
                if k in g and not existing.get(k):
                    updates[k] = g[k]
            if updates:
                db.grants.update_one({"_id": existing["_id"]}, {"$set": updates})


def _serialize_grant(doc: Dict[str, Any], bookmarked_ids: List[str], user_apps_by_grant: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    out = {k: v for k, v in doc.items() if k != "_id"}
    gid = str(out.get("id") or doc.get("_id") or "")
    out["id"] = gid
    if isinstance(out.get("created_at"), datetime):
        out["created_at"] = out["created_at"].isoformat()
    out["is_bookmarked"] = gid in bookmarked_ids
    app_info = user_apps_by_grant.get(gid)
    out["application_status"] = app_info.get("stage") if app_info else None
    out["application_id"] = app_info.get("id") if app_info else None
    return out


def _serialize_application(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = {k: v for k, v in doc.items() if k not in ("_id", "user_id")}
    out["id"] = str(doc["_id"])
    for dt_field in ("created_at", "updated_at", "submitted_at"):
        if isinstance(out.get(dt_field), datetime):
            out[dt_field] = out[dt_field].isoformat()
    comms = []
    for c in out.get("communications") or []:
        c_copy = {**c}
        if isinstance(c_copy.get("created_at"), datetime):
            c_copy["created_at"] = c_copy["created_at"].isoformat()
        comms.append(c_copy)
    out["communications"] = comms

    events = []
    for ev in out.get("timeline_events") or []:
        ev_copy = {**ev}
        if isinstance(ev_copy.get("at"), datetime):
            ev_copy["at"] = ev_copy["at"].isoformat()
        events.append(ev_copy)
    out["timeline_events"] = events
    return out


def _gather_user_grant_context(current_user: dict) -> Dict[str, Any]:
    """Synthesizes known user data across users, business_profiles, brand_kits, and epks."""
    uid = current_user["_id"]
    sources: List[str] = ["User Account"]

    full_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip() or "Founder / Lead Creator"
    email = current_user.get("email", "")
    phone = current_user.get("phone", "")
    brand_name = (current_user.get("brand_name") or "").strip()
    bio = (current_user.get("bio") or "").strip()
    portal = current_user.get("portal") or "business"

    biz_profile = {}
    epk_doc = {}
    brand_kit = {}

    if db is not None:
        biz_profile = db.business_profiles.find_one({"user_id": uid}) or {}
        if biz_profile.get("business_name") or biz_profile.get("industry") or biz_profile.get("audience"):
            sources.append("Ayo Business Profile")

        epk_doc = db.epks.find_one({"user_id": uid}) or db.epks.find_one({"user_id": str(uid)}) or {}
        if epk_doc.get("artist_name") or epk_doc.get("bio_short"):
            sources.append("Artist EPK")

        brand_kit = db.brand_kits.find_one({"user_id": str(uid)}, sort=[("created_at", -1)]) or {}
        if brand_kit.get("brand_name") or brand_kit.get("mission"):
            sources.append("Brand Kit AI")

    entity_name = (
        epk_doc.get("artist_name")
        or biz_profile.get("business_name")
        or brand_kit.get("brand_name")
        or brand_name
        or full_name
    )
    location = (
        epk_doc.get("location")
        or biz_profile.get("region")
        or "Nairobi, Kenya / East Africa"
    )
    industry = (
        ", ".join(epk_doc.get("genres") or [])
        or biz_profile.get("industry")
        or ("Music & Performing Arts" if portal == "music" else "Creative & Digital Enterprise")
    )
    audience = biz_profile.get("audience") or brand_kit.get("target_audience") or "regional and international audiences across digital and live channels"
    goals = ", ".join(biz_profile.get("goals") or []) or brand_kit.get("mission") or "scaling creative production, distribution reach, and sustainable local jobs"
    rich_bio = (
        epk_doc.get("bio_full")
        or epk_doc.get("bio_short")
        or bio
        or biz_profile.get("notes")
        or f"{entity_name} is an independent {industry.lower()} initiative led by {full_name}, focused on {goals}."
    )
    epk_username = (epk_doc.get("username") or "").strip()
    portfolio_url = f"https://intermaven.io/artist/{epk_username}" if epk_username else "https://intermaven.io"

    return {
        "full_name": full_name,
        "entity_name": entity_name,
        "email": email,
        "phone": phone,
        "location": location,
        "industry": industry,
        "audience": audience,
        "goals": goals,
        "bio": rich_bio,
        "portfolio_url": portfolio_url,
        "sources": sources,
    }


def _build_prefilled_application(grant: Dict[str, Any], ctx: Dict[str, Any]) -> Dict[str, Any]:
    """Builds complete pre-populated fields + proposal outline tailored to user data & grant specs."""
    entity = ctx["entity_name"]
    cat = grant.get("category", "Creative")
    ask = grant.get("recommended_ask") or grant.get("amount", "$5,000")
    reqs = grant.get("requirements") or [
        "Executive Summary & Project Concept",
        "Applicant Track Record & Portfolio",
        "Itemized Budget & Use of Funds",
        "Implementation & Impact Timeline",
    ]
    review_tl = grant.get("review_timeline") or "6–8 weeks review cycle"
    deadline = grant.get("deadline") or "Upcoming Round"

    project_name = f"{entity} — {cat} Growth & Impact Initiative"
    applicant_summary = (
        f"{ctx['bio']} Based in {ctx['location']}, {entity} operates in {ctx['industry']} serving {ctx['audience']}. "
        f"Directly eligible under {grant['funder']} criteria: {grant['eligibility']}"
    )
    funding_use = (
        f"Requested Grant ({ask}):\n"
        f"• 45% — Core Production, Studio/Technical Execution & Creative Talent Fees\n"
        f"• 25% — Distribution, Marketing, Showcase & Audience Mobility\n"
        f"• 20% — Operations, Equipment / Digital Tooling & Community Capacity\n"
        f"• 10% — Monitoring, Documentation & Funder Impact Reporting"
    )
    timeline_milestones = (
        f"Aligned with {grant['funder']} ({deadline} · {review_tl}):\n"
        f"• Month 1–2 (Pre-Production & Mobilization): Finalize partner contracts, workplan, and resource procurement.\n"
        f"• Month 3–4 (Core Production & Delivery): Execute primary creative/operational deliverables and milestone check-in.\n"
        f"• Month 5–6 (Launch, Distribution & Impact Audit): Public showcase/release, audience analytics, and final financial & impact report to {grant['funder']}."
    )
    checklist = [{"label": r, "completed": True} for r in reqs]

    proposal = (
        f"OFFICIAL GRANT PROPOSAL — {grant['title'].upper()}\n"
        f"Submitted To: {grant['funder']} ({grant['region']} · {grant['amount']})\n"
        f"Project Title: {project_name}\n"
        f"Applicant / Lead Entity: {entity} ({ctx['full_name']})\n"
        f"Contact: {ctx['email']}{(' · ' + ctx['phone']) if ctx['phone'] else ''}\n"
        f"Portfolio / EPK: {ctx['portfolio_url']}\n"
        f"Requested Amount: {ask}\n"
        f"{'=' * 68}\n\n"
        f"1. EXECUTIVE SUMMARY\n"
        f"{project_name} is a high-impact {cat.lower()} initiative led by {entity} ({ctx['location']}). "
        f"Our objective is to advance {ctx['goals']} while directly fulfilling {grant['funder']}'s mission: {grant['summary']}\n\n"
        f"2. APPLICANT BACKGROUND & ELIGIBILITY ALIGNMENT\n"
        f"{applicant_summary}\n\n"
        f"3. PROJECT IMPLEMENTATION & TIMELINE\n"
        f"{timeline_milestones}\n\n"
        f"4. BUDGET ALLOCATION & USE OF FUNDS ({ask})\n"
        f"{funding_use}\n\n"
        f"5. MEASURABLE OUTCOMES & SUSTAINABILITY\n"
        f"• Measurable digital & live audience reach across {ctx['audience']}\n"
        f"• Direct income and skills transfer for collaborating local creatives and operators\n"
        f"• Transparent milestone accounting and full post-grant impact documentation for {grant['funder']}\n"
    )

    return {
        "grant_id": grant["id"],
        "grant_title": grant["title"],
        "funder": grant["funder"],
        "project_name": project_name,
        "applicant_name": entity,
        "applicant_email": ctx["email"],
        "applicant_phone": ctx["phone"],
        "portfolio_url": ctx["portfolio_url"],
        "requested_amount": ask,
        "recipient_email": grant.get("program_email") or "",
        "applicant_summary": applicant_summary,
        "funding_use": funding_use,
        "timeline_milestones": timeline_milestones,
        "checklist": checklist,
        "proposal": proposal,
        "known_sources": ctx["sources"],
        "grant_deadline": deadline,
        "review_timeline": review_tl,
        "apply_url": grant.get("apply_url", ""),
    }


async def _dispatch_grant_email(to_email: str, reply_to: str, subject: str, text_body: str) -> Dict[str, Any]:
    """Sends official grant email via Resend when RESEND_API_KEY is configured, with logged outbox fallback."""
    resend_key = os.getenv("RESEND_API_KEY", "").strip()
    sender = os.getenv("EMAIL_FROM", "Intermaven Grants Desk <grants@intermaven.io>")
    if not resend_key:
        logger.info("[GRANTS DESK OUTBOX] To=%s | Reply-To=%s | Subject=%s", to_email, reply_to, subject)
        return {"sent": True, "mode": "queued_outbox", "detail": "Logged to Intermaven Outbox (set RESEND_API_KEY for live SMTP relay)"}

    html_body = (
        "<div style='font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;color:#111827;line-height:1.6'>"
        f"<h2 style='color:#065f46;margin-bottom:8px'>{subject}</h2>"
        f"<pre style='white-space:pre-wrap;font-family:Inter,Arial,sans-serif;font-size:14px;background:#f8fafc;padding:18px;border-radius:8px;border:1px solid #e2e8f0'>{text_body}</pre>"
        f"<p style='font-size:12px;color:#64748b;margin-top:16px'>Dispatched via Intermaven Grant Management Suite · Reply directly to <a href='mailto:{reply_to}'>{reply_to}</a>.</p>"
        "</div>"
    )
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                json={
                    "from": sender,
                    "to": [to_email],
                    "reply_to": reply_to or None,
                    "subject": subject,
                    "html": html_body,
                    "text": text_body,
                },
            )
            if resp.status_code < 300:
                return {"sent": True, "mode": "live_resend", "id": resp.json().get("id")}
            return {"sent": False, "mode": "error", "detail": resp.text[:160]}
    except Exception as exc:
        return {"sent": False, "mode": "error", "detail": str(exc)}


def _push_user_notification(user_id, icon: str, title: str, text: str):
    if db is None:
        return
    try:
        db.notifications.insert_one({
            "user_id": user_id,
            "icon": icon,
            "title": title,
            "text": text,
            "category": "grants",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass


# ============== PYDANTIC MODELS ==============

class GrantPrefillRequest(BaseModel):
    regenerate_with_ai: bool = False
    custom_focus: Optional[str] = ""


class GrantPitchRequest(BaseModel):
    project_name: str
    applicant_summary: Optional[str] = ""
    funding_use: Optional[str] = ""
    timeline_milestones: Optional[str] = ""
    requested_amount: Optional[str] = ""


class GrantApplicationSaveRequest(BaseModel):
    grant_id: str
    application_id: Optional[str] = None
    action: str = "save_draft"  # "save_draft" | "submit_email" | "submit_portal"
    project_name: str
    applicant_name: Optional[str] = ""
    applicant_email: Optional[str] = ""
    applicant_phone: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    requested_amount: Optional[str] = ""
    recipient_email: Optional[str] = ""
    applicant_summary: Optional[str] = ""
    funding_use: Optional[str] = ""
    timeline_milestones: Optional[str] = ""
    checklist: Optional[List[Dict[str, Any]]] = None
    proposal: str
    external_confirmation_ref: Optional[str] = ""
    notify_whatsapp: bool = False
    sync_to_crm: bool = True


class GrantApplicationPatchRequest(BaseModel):
    stage: Optional[str] = None
    external_confirmation_ref: Optional[str] = None
    next_followup_date: Optional[str] = None
    notes: Optional[str] = None
    checklist: Optional[List[Dict[str, Any]]] = None
    proposal: Optional[str] = None


class GrantCommsRequest(BaseModel):
    channel: str = "email"  # "email" | "whatsapp" | "sms" | "inbound_log"
    recipient: Optional[str] = ""
    subject: Optional[str] = ""
    body: str


class GrantAiCommsDraftRequest(BaseModel):
    template: str = "status_followup"  # "status_followup" | "clarification_reply" | "accept_award" | "impact_report"


# ============== ROUTES ==============

@router.get("")
async def list_grants(
    category: Optional[str] = None,
    region: Optional[str] = None,
    search: Optional[str] = None,
    saved_only: bool = False,
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        return {"grants": [{**g, "is_bookmarked": False} for g in SEED_GRANTS], "bookmarked_ids": []}

    _ensure_grants_seeded()
    query: Dict[str, Any] = {}
    if category and category != "all":
        query["category"] = category
    if region and region != "all":
        query["region"] = region
    if search and search.strip():
        pat = {"$regex": search.strip(), "$options": "i"}
        query["$or"] = [{"title": pat}, {"funder": pat}, {"summary": pat}, {"eligibility": pat}]

    bookmarks = list(db.grant_bookmarks.find({"user_id": current_user["_id"]}))
    bookmarked_ids = [str(b.get("grant_id", "")) for b in bookmarks]

    user_apps = list(db.grant_applications.find({"user_id": current_user["_id"]}))
    user_apps_by_grant = {
        str(a.get("grant_id")): {"id": str(a["_id"]), "stage": a.get("stage", "draft")}
        for a in user_apps
    }

    if saved_only:
        query["id"] = {"$in": bookmarked_ids}

    docs = [_serialize_grant(d, bookmarked_ids, user_apps_by_grant) for d in db.grants.find(query).limit(100)]
    return {"grants": docs, "bookmarked_ids": bookmarked_ids}


@router.post("/{grant_id}/prefill")
async def prefill_grant_with_maven_ai(
    grant_id: str,
    body: GrantPrefillRequest = GrantPrefillRequest(),
    current_user: dict = Depends(get_current_user),
):
    """Auto-populates all grant proposal fields from the user's known profile, Brand Kit, EPK & grant requirements."""
    if db is not None:
        _ensure_grants_seeded()
        # If user already has a saved application for this grant and isn't explicitly regenerating, return it!
        if not body.regenerate_with_ai:
            existing_app = db.grant_applications.find_one({"user_id": current_user["_id"], "grant_id": grant_id})
            if existing_app:
                ctx = _gather_user_grant_context(current_user)
                ser = _serialize_application(existing_app)
                ser["known_sources"] = ctx["sources"]
                ser["existing_application_id"] = ser["id"]
                return {"success": True, "prefill": ser, "resumed_existing": True}

    grant = (
        (db.grants.find_one({"id": grant_id}, {"_id": 0}) if db is not None else None)
        or next((g for g in SEED_GRANTS if g["id"] == grant_id), None)
    )
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")

    ctx = _gather_user_grant_context(current_user)
    prefill = _build_prefilled_application(grant, ctx)

    # Optionally polish the full proposal narrative via Maven AI LLM
    if body.regenerate_with_ai:
        try:
            from llm_fallback import run_llm_completion
            ai_text = await run_llm_completion(
                prompt=(
                    f"Write a complete, persuasive, submission-ready grant proposal for '{grant['title']}' "
                    f"by {grant['funder']} ({grant['amount']}, Deadline: {grant.get('deadline')}, Review: {grant.get('review_timeline')}).\n"
                    f"Funder Requirements: {', '.join(grant.get('requirements') or [])}\n"
                    f"Applicant / Brand: {prefill['applicant_name']} ({ctx['full_name']}, {ctx['location']})\n"
                    f"Background: {prefill['applicant_summary']}\n"
                    f"Requested Amount & Budget: {prefill['funding_use']}\n"
                    f"Timeline: {prefill['timeline_milestones']}\n"
                    f"Additional Focus: {body.custom_focus or 'Maximize alignment with funder impact metrics'}\n\n"
                    "Format cleanly with numbered sections: Executive Summary, Applicant Track Record & Eligibility, "
                    "Implementation & Timeline, Itemized Budget Justification, and Measurable Impact."
                ),
                system_message="You are Maven AI, Intermaven's senior grant strategist and proposal writer.",
                session_id=f"grant-prefill-{current_user['_id']}-{grant_id}",
            )
            if ai_text and len(ai_text.strip()) > 120:
                prefill["proposal"] = ai_text.strip()
        except Exception:
            pass

    return {"success": True, "prefill": prefill, "resumed_existing": False}


@router.post("/{grant_id}/bookmark")
async def toggle_grant_bookmark(grant_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    existing = db.grant_bookmarks.find_one({"user_id": current_user["_id"], "grant_id": grant_id})
    if existing:
        db.grant_bookmarks.delete_one({"_id": existing["_id"]})
        return {"success": True, "is_bookmarked": False}

    db.grant_bookmarks.insert_one({
        "user_id": current_user["_id"],
        "grant_id": grant_id,
        "created_at": datetime.now(timezone.utc),
    })
    return {"success": True, "is_bookmarked": True}


@router.post("/{grant_id}/pitch")
async def draft_grant_proposal(grant_id: str, payload: GrantPitchRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    _ensure_grants_seeded()
    grant = db.grants.find_one({"id": grant_id}, {"_id": 0}) or next(
        (g for g in SEED_GRANTS if g["id"] == grant_id), None
    )
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")

    ctx = _gather_user_grant_context(current_user)
    base = _build_prefilled_application(grant, ctx)
    proposal = base["proposal"]

    try:
        from llm_fallback import run_llm_completion
        ai_text = await run_llm_completion(
            prompt=(
                f"Write a persuasive, submission-ready grant proposal for '{grant['title']}' by {grant['funder']} ({grant['amount']}).\n"
                f"Eligibility: {grant['eligibility']}\n"
                f"Requirements: {', '.join(grant.get('requirements') or [])}\n"
                f"Project Name: {payload.project_name}\n"
                f"Requested Amount: {payload.requested_amount or base['requested_amount']}\n"
                f"Applicant Summary: {payload.applicant_summary or base['applicant_summary']}\n"
                f"Use of Funds: {payload.funding_use or base['funding_use']}\n"
                f"Timeline & Milestones: {payload.timeline_milestones or base['timeline_milestones']}\n"
                "Include: Executive Summary, Eligibility & Track Record, Implementation Timeline, Budget Breakdown, and Measurable Impact."
            ),
            system_message="You are Maven AI, Intermaven's expert arts, music, and SME grant strategist.",
            session_id=f"grant-{current_user['_id']}-{grant_id}",
        )
        if ai_text and len(ai_text.strip()) > 80:
            proposal = ai_text.strip()
    except Exception:
        pass

    try:
        from routes.ai import save_ai_output
        save_ai_output(
            user_id=current_user["_id"],
            tool_id="bizpitch",
            content=proposal,
            inputs={"grant_id": grant_id, "project_name": payload.project_name},
            title=f"Grant Proposal: {payload.project_name} ({grant['funder']})",
        )
    except Exception:
        pass

    return {"success": True, "proposal": proposal}


# ============== APPLICATION PIPELINE, SUBMISSION & COMMUNICATIONS ==============

@router.get("/applications")
async def list_grant_applications(current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"applications": [], "counts": {}}
    docs = list(db.grant_applications.find({"user_id": current_user["_id"]}).sort("updated_at", -1))
    apps = [_serialize_application(d) for d in docs]
    counts: Dict[str, int] = {s: 0 for s in APPLICATION_STAGES}
    for a in apps:
        st = a.get("stage", "draft")
        counts[st] = counts.get(st, 0) + 1
    return {"applications": apps, "counts": counts}


@router.post("/applications")
async def save_or_submit_grant_application(
    req: GrantApplicationSaveRequest,
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    _ensure_grants_seeded()
    grant = db.grants.find_one({"id": req.grant_id}, {"_id": 0}) or next(
        (g for g in SEED_GRANTS if g["id"] == req.grant_id), None
    )
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")

    now = datetime.now(timezone.utc)
    is_submitting = req.action in ("submit_email", "submit_portal")
    next_stage = "submitted" if is_submitting else "draft"
    followup_date = (now + timedelta(days=14)).strftime("%Y-%m-%d")

    existing = None
    if req.application_id:
        try:
            existing = db.grant_applications.find_one({"_id": ObjectId(req.application_id), "user_id": current_user["_id"]})
        except Exception:
            existing = None
    if not existing:
        existing = db.grant_applications.find_one({"user_id": current_user["_id"], "grant_id": req.grant_id})

    tracking_ref = (existing or {}).get("tracking_ref") or f"GRT-{now.strftime('%Y')}-{random.randint(1000, 9999)}"
    comms = list((existing or {}).get("communications") or [])
    timeline_events = list((existing or {}).get("timeline_events") or [])
    delivery_report: Dict[str, Any] = {}

    if not existing:
        timeline_events.append({"event": "Application workspace initialized by Maven AI", "stage": "draft", "at": now})

    # Dispatch Direct Email Submission Package if requested
    target_recipient = (req.recipient_email or grant.get("program_email") or "").strip()
    applicant_email = (req.applicant_email or current_user.get("email") or "").strip()

    if req.action == "submit_email":
        if not target_recipient:
            raise HTTPException(status_code=400, detail="Enter a recipient / program desk email to dispatch the submission package.")
        subject = f"Grant Proposal Submission: {req.project_name} ({tracking_ref})"
        email_res = await _dispatch_grant_email(
            to_email=target_recipient,
            reply_to=applicant_email,
            subject=subject,
            text_body=req.proposal,
        )
        delivery_report["email"] = email_res
        # Also send confirmation copy to applicant if distinct
        if applicant_email and applicant_email.lower() != target_recipient.lower():
            await _dispatch_grant_email(
                to_email=applicant_email,
                reply_to=target_recipient,
                subject=f"[Confirmation Copy] {subject}",
                text_body=f"Your grant proposal to {grant['funder']} has been logged ({tracking_ref}).\n\n{req.proposal}",
            )

        comms.append({
            "id": f"msg-{int(now.timestamp())}",
            "direction": "outbound",
            "channel": "email",
            "recipient": target_recipient,
            "subject": subject,
            "body": req.proposal,
            "delivery_status": email_res.get("mode", "sent"),
            "created_at": now,
        })
        timeline_events.append({
            "event": f"Official proposal package dispatched via Email to {target_recipient}",
            "stage": "submitted",
            "at": now,
        })

    elif req.action == "submit_portal":
        ref_note = f" (Portal Ref: {req.external_confirmation_ref})" if req.external_confirmation_ref else ""
        timeline_events.append({
            "event": f"Submitted via {grant['funder']} official portal{ref_note}",
            "stage": "submitted",
            "at": now,
        })

    # Optional WhatsApp confirmation alert to user
    user_phone = (req.applicant_phone or current_user.get("phone") or "").strip()
    if is_submitting and req.notify_whatsapp and user_phone:
        try:
            from routes.crm import send_twilio_message
            wa_res = await send_twilio_message(
                user_phone,
                f"Intermaven Grants: Your proposal '{req.project_name}' for {grant['title']} ({tracking_ref}) is now tracked as SUBMITTED. Next follow-up: {followup_date}.",
                channel="whatsapp",
            )
            delivery_report["whatsapp"] = wa_res
        except Exception:
            delivery_report["whatsapp"] = {"success": False, "mode": "logged"}

    # Sync funder contact into Smart CRM so outreach stays unified
    if is_submitting and req.sync_to_crm and target_recipient:
        try:
            existing_contact = db.crm_contacts.find_one({"user_id": current_user["_id"], "email": target_recipient.lower()})
            if not existing_contact:
                db.crm_contacts.insert_one({
                    "user_id": current_user["_id"],
                    "name": f"{grant['funder']} Grants Desk",
                    "email": target_recipient.lower(),
                    "phone": "",
                    "company": grant["funder"],
                    "category": "funder",
                    "tags": ["grant-funder", grant["region"].lower().replace(" ", "-")],
                    "notes": f"Synced from Grant Application {tracking_ref}: {req.project_name}",
                    "created_at": now,
                })
        except Exception:
            pass

    if is_submitting:
        _push_user_notification(
            current_user["_id"],
            "🎯",
            f"Grant Submitted: {grant['funder']}",
            f"Tracking ID {tracking_ref} · Next follow-up scheduled for {followup_date}.",
        )

    doc_fields = {
        "user_id": current_user["_id"],
        "grant_id": grant["id"],
        "grant_title": grant["title"],
        "funder": grant["funder"],
        "grant_amount_range": grant["amount"],
        "grant_deadline": grant.get("deadline", ""),
        "review_timeline": grant.get("review_timeline", ""),
        "apply_url": grant.get("apply_url", ""),
        "tracking_ref": tracking_ref,
        "stage": next_stage if (not existing or is_submitting) else existing.get("stage", "draft"),
        "project_name": req.project_name.strip(),
        "applicant_name": (req.applicant_name or "").strip(),
        "applicant_email": applicant_email,
        "applicant_phone": user_phone,
        "portfolio_url": (req.portfolio_url or "").strip(),
        "requested_amount": (req.requested_amount or grant.get("recommended_ask") or "").strip(),
        "recipient_email": target_recipient,
        "applicant_summary": (req.applicant_summary or "").strip(),
        "funding_use": (req.funding_use or "").strip(),
        "timeline_milestones": (req.timeline_milestones or "").strip(),
        "checklist": req.checklist or [],
        "proposal": req.proposal,
        "external_confirmation_ref": (req.external_confirmation_ref or (existing or {}).get("external_confirmation_ref") or "").strip(),
        "next_followup_date": followup_date if is_submitting else ((existing or {}).get("next_followup_date") or followup_date),
        "communications": comms,
        "timeline_events": timeline_events,
        "updated_at": now,
    }
    if is_submitting and not (existing or {}).get("submitted_at"):
        doc_fields["submitted_at"] = now

    if existing:
        db.grant_applications.update_one({"_id": existing["_id"]}, {"$set": doc_fields})
        saved = db.grant_applications.find_one({"_id": existing["_id"]})
    else:
        doc_fields["created_at"] = now
        ins = db.grant_applications.insert_one(doc_fields)
        saved = db.grant_applications.find_one({"_id": ins.inserted_id})

    return {
        "success": True,
        "application": _serialize_application(saved),
        "delivery": delivery_report,
    }


@router.patch("/applications/{app_id}")
async def update_grant_application(
    app_id: str,
    body: GrantApplicationPatchRequest,
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        doc = db.grant_applications.find_one({"_id": ObjectId(app_id), "user_id": current_user["_id"]})
    except Exception:
        doc = None
    if not doc:
        raise HTTPException(status_code=404, detail="Grant application not found")

    now = datetime.now(timezone.utc)
    updates: Dict[str, Any] = {"updated_at": now}
    events = list(doc.get("timeline_events") or [])

    if body.stage and body.stage in APPLICATION_STAGES and body.stage != doc.get("stage"):
        updates["stage"] = body.stage
        if body.stage == "submitted" and not doc.get("submitted_at"):
            updates["submitted_at"] = now
        events.append({
            "event": f"Status updated from {doc.get('stage', 'draft').replace('_', ' ').title()} → {body.stage.replace('_', ' ').title()}",
            "stage": body.stage,
            "at": now,
        })
        _push_user_notification(
            current_user["_id"],
            "📋",
            f"Grant Status: {body.stage.replace('_', ' ').title()}",
            f"{doc.get('project_name')} ({doc.get('funder')}) moved to {body.stage.replace('_', ' ').title()}.",
        )

    for k in ("external_confirmation_ref", "next_followup_date", "notes", "checklist", "proposal"):
        val = getattr(body, k)
        if val is not None:
            updates[k] = val

    updates["timeline_events"] = events
    db.grant_applications.update_one({"_id": doc["_id"]}, {"$set": updates})
    saved = db.grant_applications.find_one({"_id": doc["_id"]})
    return {"success": True, "application": _serialize_application(saved)}


@router.post("/applications/{app_id}/communicate")
async def send_or_log_grant_communication(
    app_id: str,
    req: GrantCommsRequest,
    current_user: dict = Depends(get_current_user),
):
    """Sends outbound Email / WhatsApp / SMS or logs inbound funder replies on a tracked grant application."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        doc = db.grant_applications.find_one({"_id": ObjectId(app_id), "user_id": current_user["_id"]})
    except Exception:
        doc = None
    if not doc:
        raise HTTPException(status_code=404, detail="Grant application not found")

    now = datetime.now(timezone.utc)
    channel = req.channel.lower().strip()
    recipient = (req.recipient or doc.get("recipient_email") or "").strip()
    subject = (req.subject or f"Re: {doc.get('project_name')} ({doc.get('tracking_ref')})").strip()
    direction = "inbound" if channel == "inbound_log" else "outbound"
    delivery_status = "logged"

    if channel == "email":
        if not recipient:
            raise HTTPException(status_code=400, detail="Recipient email is required.")
        res = await _dispatch_grant_email(
            to_email=recipient,
            reply_to=doc.get("applicant_email") or current_user.get("email", ""),
            subject=subject,
            text_body=req.body,
        )
        delivery_status = res.get("mode", "sent")
    elif channel in ("whatsapp", "sms"):
        target_phone = recipient or doc.get("applicant_phone") or current_user.get("phone", "")
        if target_phone:
            try:
                from routes.crm import send_twilio_message
                tw_res = await send_twilio_message(target_phone, req.body, channel=channel)
                delivery_status = "live_twilio" if tw_res.get("success") else "logged_ready"
            except Exception:
                delivery_status = "logged_ready"

    msg_entry = {
        "id": f"msg-{int(now.timestamp())}-{random.randint(100, 999)}",
        "direction": direction,
        "channel": "funder_reply" if channel == "inbound_log" else channel,
        "recipient": recipient,
        "subject": subject,
        "body": req.body.strip(),
        "delivery_status": delivery_status,
        "created_at": now,
    }
    event_entry = {
        "event": (
            f"Logged inbound update from {doc.get('funder')}"
            if direction == "inbound"
            else f"Sent {channel.upper()} message to {recipient or doc.get('funder')}"
        ),
        "stage": doc.get("stage", "submitted"),
        "at": now,
    }

    db.grant_applications.update_one(
        {"_id": doc["_id"]},
        {
            "$push": {"communications": msg_entry, "timeline_events": event_entry},
            "$set": {"updated_at": now},
        },
    )
    saved = db.grant_applications.find_one({"_id": doc["_id"]})
    return {"success": True, "application": _serialize_application(saved), "message": msg_entry}


@router.post("/applications/{app_id}/ai-message")
async def draft_grant_followup_message(
    app_id: str,
    req: GrantAiCommsDraftRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generates contextual follow-up, clarification, acceptance, or impact report messages via Maven AI."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        doc = db.grant_applications.find_one({"_id": ObjectId(app_id), "user_id": current_user["_id"]})
    except Exception:
        doc = None
    if not doc:
        raise HTTPException(status_code=404, detail="Grant application not found")

    funder = doc.get("funder", "Grants Committee")
    proj = doc.get("project_name", "Project")
    ref = doc.get("tracking_ref", "")
    applicant = doc.get("applicant_name") or f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip()
    ask = doc.get("requested_amount", "")

    templates = {
        "status_followup": (
            f"Status Inquiry: {proj} ({ref})",
            f"Dear {funder} Selection Committee,\n\n"
            f"I hope this message finds you well. I am writing to respectfully check on the review status of our grant application "
            f"for \"{proj}\" (Reference: {ref}, Requested: {ask}).\n\n"
            f"Our team at {applicant} remains deeply excited about aligning with {funder}'s mandate, and we are happy to provide "
            f"any supplementary work samples, budget clarifications, or references helpful to the panel.\n\n"
            f"Warm regards,\n{applicant}\n{doc.get('applicant_email', '')}",
        ),
        "clarification_reply": (
            f"Supplementary Details — {proj} ({ref})",
            f"Dear {funder} Program Team,\n\n"
            f"Thank you for reviewing our proposal \"{proj}\" ({ref}). Please find below the requested clarifications regarding "
            f"our implementation schedule, budget allocation, and measurable community outcomes:\n\n"
            f"1. Key Deliverable Confirmation: [Insert specific detail]\n"
            f"2. Updated Portfolio / Verification Link: {doc.get('portfolio_url', 'https://intermaven.io')}\n\n"
            f"Please let us know if anything further is needed.\n\nSincerely,\n{applicant}",
        ),
        "accept_award": (
            f"Official Grant Acceptance — {proj} ({ref})",
            f"Dear {funder} Team,\n\n"
            f"On behalf of {applicant}, we are thrilled and honored to formally accept the {doc.get('grant_title')} award "
            f"in support of \"{proj}\" ({ref}).\n\n"
            f"We have reviewed the compliance and reporting schedule and are ready to countersign the grant agreement and confirm "
            f"disbursement details at your convenience.\n\nWith gratitude,\n{applicant}",
        ),
        "impact_report": (
            f"Milestone & Impact Progress Update — {proj} ({ref})",
            f"Dear {funder} Program Officer,\n\n"
            f"We are pleased to share our latest milestone and budget utilization update for \"{proj}\" ({ref}):\n\n"
            f"• Completed Milestones: Core production and partner onboarding achieved on schedule.\n"
            f"• Audience & Community Reach: [Insert metric] beneficiaries / listeners / customers engaged.\n"
            f"• Budget Compliance: 100% aligned with approved allocation ({ask}).\n\n"
            f"Best regards,\n{applicant}",
        ),
    }

    subj, default_body = templates.get(req.template, templates["status_followup"])

    try:
        from llm_fallback import run_llm_completion
        ai_body = await run_llm_completion(
            prompt=(
                f"Draft a concise, professional '{req.template}' email from {applicant} to {funder} "
                f"regarding grant application '{proj}' (Ref: {ref}, Stage: {doc.get('stage')}, Amount: {ask}). "
                "Return ONLY the email body text."
            ),
            system_message="You are Maven AI, expert grant communications advisor.",
            session_id=f"grant-comms-{app_id}-{req.template}",
        )
        if ai_body and len(ai_body.strip()) > 60:
            default_body = ai_body.strip()
    except Exception:
        pass

    return {"success": True, "subject": subj, "body": default_body}


@router.delete("/applications/{app_id}")
async def delete_grant_application(app_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        res = db.grant_applications.delete_one({"_id": ObjectId(app_id), "user_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    return {"deleted": res.deleted_count > 0}
