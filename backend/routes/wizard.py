"""
Wizard router — AI-assisted business discovery, strategy generation,
per-app wizard steps, and personalized how-to tips.

Powered by Claude Sonnet 4.5 via Emergent LLM key (emergentintegrations).
"""
import os
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from config import db
from utils import get_current_user

router = APIRouter(tags=["wizard"])


# ============== MODELS ==============

class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    industry: Optional[str] = None
    role: Optional[str] = None             # artist, label, agency, business-owner, etc.
    audience: Optional[str] = None
    goals: Optional[List[str]] = None
    region: Optional[str] = None
    current_channels: Optional[List[str]] = None
    budget_band: Optional[str] = None       # none, <100, 100-500, 500-2000, 2000+
    brand_voice: Optional[str] = None
    notes: Optional[str] = None


class DiscoverTurnRequest(BaseModel):
    answer: Optional[str] = None            # user's reply to the previous question (or None on first call)
    transcript: List[Dict[str, str]] = Field(default_factory=list)  # [{role, content}, ...]


class StrategyRequest(BaseModel):
    refresh: bool = False


class AppStepRequest(BaseModel):
    app_id: str
    state: Dict[str, Any] = Field(default_factory=dict)   # previous wizard answers
    step_index: int = 0


class HowToRequest(BaseModel):
    app_id: str
    topic: str                              # e.g. "writing a strong hook"
    user_question: Optional[str] = None


# ============== HELPERS ==============

DISCOVERY_QUESTIONS = [
    ("business_name", "What's the name of your business, brand, or artist project?"),
    ("industry", "What industry are you in? (e.g. music, fashion, hospitality, consulting, e-commerce)"),
    ("role", "What's your role? (e.g. solo artist, label, agency owner, small-business founder, creator)"),
    ("audience", "Briefly describe your target audience — who are you trying to reach?"),
    ("goals", "What are your top 1–3 goals for the next 90 days? (e.g. grow followers, drive sales, book gigs, get sync placements)"),
    ("region", "Which region or country is your primary market?"),
    ("current_channels", "Which channels are you already using? (Instagram, TikTok, YouTube, email, in-person, none, etc.)"),
    ("budget_band", "What's your monthly marketing budget? (none / under $100 / $100–500 / $500–2000 / $2000+)"),
    ("brand_voice", "How would you describe your brand voice in 3 words? (e.g. playful, bold, premium)"),
]

REQUIRED_FIELDS = ["business_name", "industry", "audience", "goals", "region"]


def _get_or_init_profile(user_id) -> dict:
    profile = db.business_profiles.find_one({"user_id": user_id})
    if not profile:
        profile = {
            "user_id": user_id,
            "business_name": "",
            "industry": "",
            "role": "",
            "audience": "",
            "goals": [],
            "region": "",
            "current_channels": [],
            "budget_band": "",
            "brand_voice": "",
            "notes": "",
            "completed": False,
            "strategy": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        db.business_profiles.insert_one(profile)
    return profile


def _strip_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc = {k: v for k, v in doc.items() if k != "_id"}
    if doc and "user_id" in doc:
        doc["user_id"] = str(doc["user_id"])
    if doc and isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    if doc and isinstance(doc.get("updated_at"), datetime):
        doc["updated_at"] = doc["updated_at"].isoformat()
    return doc


def _next_missing_field(profile: dict) -> Optional[tuple]:
    for field, q in DISCOVERY_QUESTIONS:
        v = profile.get(field)
        if not v or (isinstance(v, list) and len(v) == 0):
            return field, q
    return None


async def _llm_chat(system_message: str, user_text: str, session_suffix: str, user_id: str) -> str:
    """Thin wrapper around emergentintegrations LlmChat → Claude Sonnet 4.5."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(
        api_key=os.environ.get("EMERGENT_LLM_KEY"),
        session_id=f"intermaven-wizard-{user_id}-{session_suffix}",
        system_message=system_message,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    response = await chat.send_message(UserMessage(text=user_text))
    return response if isinstance(response, str) else str(response)


def _extract_json(text: str) -> Optional[dict]:
    """Best-effort JSON extraction from an LLM response."""
    if not text:
        return None
    # Find first { and matching } block
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return None
    snippet = text[start:end + 1]
    try:
        return json.loads(snippet)
    except Exception:
        return None


# ============== BUSINESS PROFILE CRUD ==============

@router.get("/api/business-profile")
async def get_business_profile(current_user: dict = Depends(get_current_user)):
    profile = _get_or_init_profile(current_user["_id"])
    return _strip_id(profile)


@router.put("/api/business-profile")
async def update_business_profile(
    data: BusinessProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    updates = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc)
    # Mark completed if every required field is now populated
    merged = {**_get_or_init_profile(current_user["_id"]), **updates}
    has_required = all(
        merged.get(f) and (not isinstance(merged.get(f), list) or len(merged[f]) > 0)
        for f in REQUIRED_FIELDS
    )
    updates["completed"] = bool(has_required)
    db.business_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$set": updates},
        upsert=True,
    )
    profile = db.business_profiles.find_one({"user_id": current_user["_id"]})
    return _strip_id(profile)


# ============== DISCOVERY (one-question-at-a-time chat) ==============

@router.post("/api/wizard/discover")
async def wizard_discover(
    req: DiscoverTurnRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Conversational onboarding. Stores the user's answer against the next missing
    business-profile field, then returns the next question (or signals done).
    """
    profile = _get_or_init_profile(current_user["_id"])

    # If user provided an answer, save it against the current next-missing field.
    if req.answer:
        nxt = _next_missing_field(profile)
        if nxt:
            field, _q = nxt
            value: Any = req.answer.strip()
            if field in ("goals", "current_channels"):
                # split on commas / "and"
                value = [v.strip() for v in value.replace(" and ", ",").split(",") if v.strip()]
            db.business_profiles.update_one(
                {"user_id": current_user["_id"]},
                {"$set": {field: value, "updated_at": datetime.now(timezone.utc)}},
            )
            profile = db.business_profiles.find_one({"user_id": current_user["_id"]})

    # Determine next missing field
    nxt = _next_missing_field(profile)
    if not nxt:
        # Mark complete
        db.business_profiles.update_one(
            {"user_id": current_user["_id"]},
            {"$set": {"completed": True, "updated_at": datetime.now(timezone.utc)}},
        )
        return {"done": True, "message": "Great — that's everything I need! I'll now craft a strategy for you.", "profile": _strip_id(profile)}

    field, question = nxt
    # Personalize the question with a quick LLM rewrite using what we already know
    try:
        context = {k: profile.get(k) for k in REQUIRED_FIELDS + ["role", "brand_voice"] if profile.get(k)}
        system = (
            "You are Ayo, Intermaven's friendly business strategist for African creatives and entrepreneurs. "
            "You ask ONE concise, conversational question at a time. Keep it under 30 words. "
            "Acknowledge prior answers briefly when relevant. Never list multiple questions."
        )
        prompt = (
            f"Context so far: {json.dumps(context)}\n"
            f"You need to ask the user about: {field}.\n"
            f"Baseline question: {question}\n"
            f"Rewrite this as a warm, concise question in your voice. Return ONLY the question."
        )
        question_text = await _llm_chat(system, prompt, "discover", str(current_user["_id"]))
        question_text = question_text.strip().strip('"').strip()
        if not question_text:
            question_text = question
    except Exception:
        question_text = question

    return {
        "done": False,
        "field": field,
        "question": question_text,
        "profile": _strip_id(profile),
    }


# ============== STRATEGY GENERATION ==============

@router.post("/api/wizard/strategy")
async def wizard_strategy(
    req: StrategyRequest,
    current_user: dict = Depends(get_current_user),
):
    profile = _get_or_init_profile(current_user["_id"])
    if not profile.get("completed") and not all(profile.get(f) for f in REQUIRED_FIELDS):
        raise HTTPException(status_code=400, detail="Business discovery is not complete yet")

    if profile.get("strategy") and not req.refresh:
        return {"strategy": profile["strategy"], "cached": True}

    system = (
        "You are Ayo, Intermaven's senior creative-business strategist for African artists and "
        "entrepreneurs. Given a business profile, return a JSON strategy plan with these EXACT keys:\n"
        "{\n"
        '  "headline": "1-line punchy summary",\n'
        '  "channels": [ {"name": "Instagram", "priority": "primary|secondary|test", "why": "..."} ],\n'
        '  "cadence": [ {"channel": "Instagram", "frequency": "3x/week"} ],\n'
        '  "content_pillars": ["Pillar 1", "Pillar 2", "Pillar 3"],\n'
        '  "kpis": [ {"metric": "Followers", "target_90d": "+1000"} ],\n'
        '  "first_30_days": [ "actionable step 1", "step 2", "step 3", "step 4" ]\n'
        "}\n"
        "Recommend 2–4 channels max. Be specific to the user's region, audience, and budget.\n"
        "Channels you may pick from include (but are not limited to): "
        "Instagram, TikTok, YouTube / YouTube Shorts, Facebook, X (Twitter), LinkedIn, Threads, "
        "WhatsApp Business, Email (Resend/SendGrid), SMS, "
        "Google Local Services Ads (PRIMARY pick for ANY local SERVICE business — plumbers, "
        "lawyers, mount-pros, cleaners, consultants — because it's pay-per-booked-lead and shows "
        "the Google Guarantee badge), "
        "Google Search Ads, Google Business Profile, Google Display, YouTube Ads, "
        "Meta Ads, TikTok Ads, Spotify for Artists, Apple Music for Artists.\n"
        "If the user is a LOCAL service-based business (anything in the home services, legal, "
        "health, beauty, professional-services categories), always include Google Local Services "
        "Ads + Google Business Profile in the channels list.\n"
        "Return ONLY valid JSON, no markdown fences."
    )
    user_text = (
        "Business profile:\n"
        f"- Name: {profile.get('business_name')}\n"
        f"- Industry: {profile.get('industry')}\n"
        f"- Role: {profile.get('role')}\n"
        f"- Audience: {profile.get('audience')}\n"
        f"- Goals: {profile.get('goals')}\n"
        f"- Region: {profile.get('region')}\n"
        f"- Current channels: {profile.get('current_channels')}\n"
        f"- Budget: {profile.get('budget_band')}\n"
        f"- Brand voice: {profile.get('brand_voice')}\n"
    )
    try:
        text = await _llm_chat(system, user_text, "strategy", str(current_user["_id"]))
        parsed = _extract_json(text) or {"headline": text[:200], "channels": [], "cadence": [], "content_pillars": [], "kpis": [], "first_30_days": []}
    except Exception as e:
        parsed = {
            "headline": "Strategy draft (offline fallback)",
            "channels": [
                {"name": "Instagram", "priority": "primary", "why": "Visual discovery, broad African reach"},
                {"name": "WhatsApp Business", "priority": "primary", "why": "Direct conversion & CRM-ready"},
            ],
            "cadence": [
                {"channel": "Instagram", "frequency": "4x/week"},
                {"channel": "WhatsApp Business", "frequency": "weekly broadcast"},
            ],
            "content_pillars": ["Story", "Proof", "Offer"],
            "kpis": [{"metric": "Followers", "target_90d": "+500"}, {"metric": "Inbound DMs", "target_90d": "20/wk"}],
            "first_30_days": [
                "Audit & lock-in brand voice",
                "Publish 4 short-form reels",
                "Build a WhatsApp broadcast list of 50",
                "Set up Intermaven Smart CRM with channel preference",
            ],
            "error": str(e),
        }

    db.business_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"strategy": parsed, "updated_at": datetime.now(timezone.utc)}},
    )
    return {"strategy": parsed, "cached": False}


# ============== PER-APP WIZARD STEP ==============

APP_WIZARD_PROMPTS = {
    "social": (
        "You are guiding the user through Intermaven's Social AI wizard. "
        "Generate the NEXT wizard step as JSON: "
        '{"title":"...","intent":"...","fields":[{"key":"platform","label":"...","type":"select","options":["Instagram","TikTok"]}],"tip":"one-line Ayo tip"}. '
        "Steps in order: 1) Pick primary platform, 2) Pick content goal, 3) Define tone, 4) Choose post type "
        "(carousel/reel/single), 5) Generate. Return ONLY JSON."
    ),
    "epk": (
        "You are guiding through Intermaven's EPK Builder wizard. JSON step shape: "
        '{"title":"...","intent":"...","fields":[...],"tip":"..."}. Steps: 1) Artist bio basics, '
        "2) Genre & influences, 3) Press highlights, 4) Booking contact, 5) Cover photo, 6) Publish. JSON only."
    ),
    "brandkit": (
        "Brand Kit wizard. JSON step shape as before. Steps: 1) Brand name & tagline, 2) Audience snapshot, "
        "3) Voice & values, 4) Visual direction (3 adjectives), 5) Color & font preferences, 6) Generate. JSON only."
    ),
    "musicbio": (
        "Music Bio wizard. JSON step shape. Steps: 1) Stage name + origin, 2) Genre & influences, "
        "3) Key milestones, 4) Personality keywords, 5) Length (short/medium/long), 6) Generate. JSON only."
    ),
    "syncpitch": (
        "Sync Pitch wizard. JSON step shape. Steps: 1) Track title + mood, 2) Suggested use cases, "
        "3) Target placements (film/TV/ad), 4) One-line hook, 5) Generate pitch. JSON only."
    ),
    "bizpitch": (
        "Pitch Deck wizard. JSON step shape. Steps: 1) Problem, 2) Solution, 3) Market, "
        "4) Traction, 5) Ask, 6) Generate. JSON only."
    ),
    "crm": (
        "Smart CRM wizard. JSON step shape. Steps: 1) Preferred channel (Email/WhatsApp/SMS), "
        "2) Import existing contacts or start fresh, 3) Tag taxonomy, 4) First campaign goal, "
        "5) Schedule first message. JSON only."
    ),
}


@router.post("/api/wizard/app/step")
async def wizard_app_step(
    req: AppStepRequest,
    current_user: dict = Depends(get_current_user),
):
    if req.app_id not in APP_WIZARD_PROMPTS:
        raise HTTPException(status_code=400, detail=f"No wizard for app '{req.app_id}'")
    profile = _get_or_init_profile(current_user["_id"])
    system = APP_WIZARD_PROMPTS[req.app_id]
    user_text = (
        f"User business profile: {json.dumps({k: profile.get(k) for k in REQUIRED_FIELDS + ['role','brand_voice']})}\n"
        f"User's recommended strategy: {json.dumps(profile.get('strategy') or {})}\n"
        f"Wizard state so far: {json.dumps(req.state)}\n"
        f"We are on step index {req.step_index}. "
        "Return ONLY the JSON for the next step. If this was the last step, set "
        '"final": true and include "summary":"...".'
    )
    try:
        text = await _llm_chat(system, user_text, f"app-{req.app_id}", str(current_user["_id"]))
        step = _extract_json(text) or {"title": "Next step", "intent": "", "fields": [], "tip": text[:160]}
    except Exception as e:
        step = {
            "title": "Step paused",
            "intent": "AI unavailable — proceed manually using Advanced Settings.",
            "fields": [],
            "tip": "Switch to Advanced Settings to continue without AI.",
            "error": str(e),
        }
    return {"step_index": req.step_index, "step": step}


# ============== HOW-TO PERSONALIZED TIP ==============

@router.post("/api/wizard/howto")
async def wizard_howto(
    req: HowToRequest,
    current_user: dict = Depends(get_current_user),
):
    profile = _get_or_init_profile(current_user["_id"])
    system = (
        "You are Ayo, Intermaven's how-to coach. Given a user's business profile and a how-to topic, "
        "return a SHORT (90–150 words) personalized tip. Use second person. Include 2–3 concrete actions. "
        "End with a punchy 1-line call-to-action. Plain text only, no markdown."
    )
    user_text = (
        f"Profile: {json.dumps({k: profile.get(k) for k in REQUIRED_FIELDS + ['role','brand_voice']})}\n"
        f"App: {req.app_id}\n"
        f"Topic: {req.topic}\n"
        f"User question: {req.user_question or '(none — give the general personalized tip for this topic)'}\n"
    )
    try:
        tip = await _llm_chat(system, user_text, f"howto-{req.app_id}", str(current_user["_id"]))
    except Exception:
        tip = (
            "Quick win: focus on consistency over polish. Pick ONE channel, ship 3 posts this week, "
            "and review what got the most replies. Refine voice from there. "
            "Open the Wizard to lock in your channel."
        )
    return {"app_id": req.app_id, "topic": req.topic, "tip": tip.strip()}
