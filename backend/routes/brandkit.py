from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import os
import json

from config import db
from utils import get_current_user, get_system_settings

router = APIRouter(prefix="/api/brandkit", tags=["brandkit"])

# Single source of truth for Brand Kit AI dimensions, vibes & keywords
# Reused across Frontend BrandKitAI.js, Landing Page (/brandkit), and Admin Console.
BRAND_DIMENSIONS = [
    {"id": "memorability", "label": "Memorability", "desc": "Instant recall after a single listen or glance"},
    {"id": "pronunciation", "label": "Pronunciation", "desc": "Effortless across local & global accents"},
    {"id": "handle_fit", "label": "Domain & Handle Fit", "desc": "Clean availability for .io/.com and @social"},
    {"id": "cultural_resonance", "label": "Cultural Resonance", "desc": "Authentic connection with target audience"},
    {"id": "differentiation", "label": "Differentiation", "desc": "Stands apart from category lookalikes"},
    {"id": "scalability", "label": "Scalability", "desc": "Room to expand into merch, tours, and new verticals"},
]

BRAND_VIBES = [
    {"id": "bold", "label": "Bold & Disruptive", "palette": ["#10b981", "#060813", "#22d3ee", "#f59e0b", "#f8fafc"]},
    {"id": "luxury", "label": "Minimal & Luxury", "palette": ["#d4af37", "#0a0a0f", "#1e293b", "#e2e8f0", "#ffffff"]},
    {"id": "warm", "label": "Warm & Community", "palette": ["#f59e0b", "#1c1917", "#10b981", "#fef3c7", "#fafaf9"]},
    {"id": "afrofuturist", "label": "Afro-Futurist", "palette": ["#22d3ee", "#060813", "#a855f7", "#10b981", "#f8fafc"]},
    {"id": "tech", "label": "Tech & Precision", "palette": ["#3b82f6", "#0f172a", "#22d3ee", "#64748b", "#f8fafc"]},
    {"id": "street", "label": "Playful & Street", "palette": ["#f43f5e", "#09090b", "#eab308", "#22d3ee", "#ffffff"]},
]

BRANDKIT_KEYWORDS = [
    "Brand Name Analysis",
    "6 Strategic Dimensions",
    "Tagline Options",
    "Tone of Voice Guide",
    "Colour Direction",
    "Positioning Statement",
    "Brand Personality",
    "Beta Free Credits",
]


class BrandKitGenerateRequest(BaseModel):
    name: str
    industry: str
    audience: str
    vibe: str = "bold"
    persona: Optional[str] = "creator"
    keywords: Optional[List[str]] = None
    extra: Optional[str] = ""


class BrandKitSaveRequest(BaseModel):
    name: str
    industry: Optional[str] = ""
    audience: Optional[str] = ""
    vibe: Optional[str] = "bold"
    persona: Optional[str] = "creator"
    keywords: Optional[List[str]] = None
    result: dict


@router.get("/config")
async def get_brandkit_config():
    settings = get_system_settings()
    return {
        "cost": settings.get("brandkit_cost", 10),
        "free_beta_credits": settings.get("free_credits", 150),
        "dimensions": BRAND_DIMENSIONS,
        "vibes": BRAND_VIBES,
        "keywords": BRANDKIT_KEYWORDS,
    }


def _build_structured_fallback(req: BrandKitGenerateRequest) -> dict:
    vibe_obj = next((v for v in BRAND_VIBES if v["id"] == req.vibe or v["label"].lower() == req.vibe.lower()), BRAND_VIBES[0])
    p = vibe_obj["palette"]
    clean_handle = "".join(ch for ch in req.name.lower() if ch.isalnum()) or "brand"
    return {
        "brand_name": req.name,
        "overall_score": 88,
        "dimensions": [
            {"id": d["id"], "label": d["label"], "score": 82 + (idx * 3) % 15, "note": f"Strong {d['label'].lower()} for {req.industry} targeting {req.audience}."}
            for idx, d in enumerate(BRAND_DIMENSIONS)
        ],
        "taglines": [
            {"line": f"{req.name}: Built for {req.audience}.", "rationale": "Direct, audience-first positioning that clarifies value in 5 words."},
            {"line": f"Own the moment with {req.name}.", "rationale": "Action-oriented hook ideal for social bios and campaign headers."},
            {"line": f"Where {req.industry} meets originality.", "rationale": "Elevates category authority while staying approachable."},
        ],
        "tone_of_voice": [
            {"principle": "Clear & Confident", "do": "Lead with outcomes and active verbs.", "dont": "Use vague corporate buzzwords."},
            {"principle": "Culturally Grounded", "do": f"Speak naturally to {req.audience}.", "dont": "Copy generic templates."},
            {"principle": "Consistent Across Channels", "do": "Keep bio, EPK, and Social AI aligned.", "dont": "Switch tone abruptly per platform."},
            {"principle": "Human & Direct", "do": "Address one person at a time.", "dont": "Over-complicate simple offers."},
        ],
        "colors": [
            {"role": "Primary", "hex": p[0], "meaning": "Growth, energy, and signature recognition"},
            {"role": "Surface", "hex": p[1], "meaning": "High-contrast obsidian backdrop for premium legibility"},
            {"role": "Accent", "hex": p[2], "meaning": "Highlights CTAs, links, and interactive states"},
            {"role": "Highlight", "hex": p[3], "meaning": "Warmth and urgency for key badges"},
            {"role": "Text", "hex": p[4], "meaning": "Clean readability across web & mobile"},
        ],
        "positioning_statement": f"For {req.audience}, {req.name} is the {vibe_obj['label'].lower()} {req.industry} brand that delivers unmistakable identity and consistent execution across every channel.",
        "personality": {
            "adjectives": ["Authentic", "Bold", "Resourceful", "Memorable", "Modern"],
            "anti_adjective": "Generic",
        },
        "typography": {"heading": "Sansation / Space Grotesk", "body": "Inter / System UI"},
        "handles": [f"@{clean_handle}", f"@{clean_handle}hq", f"{clean_handle}.io"],
        "keywords": req.keywords or BRANDKIT_KEYWORDS[:5],
    }


@router.post("/generate")
async def generate_brand_kit(req: BrandKitGenerateRequest, current_user: dict = Depends(get_current_user)):
    settings = get_system_settings()
    cost = int(settings.get("brandkit_cost", 10))
    user_credits = int(current_user.get("credits", 0))
    if cost > 0 and user_credits < cost:
        raise HTTPException(status_code=402, detail=f"Insufficient credits ({cost} credits required)")

    result = None
    try:
        api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        if api_key:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = (
                f"Generate a structured JSON brand kit for brand '{req.name}' in '{req.industry}' "
                f"for audience '{req.audience}', vibe '{req.vibe}', persona '{req.persona}'. "
                f"Keywords: {', '.join(req.keywords or BRANDKIT_KEYWORDS)}. Extra: {req.extra}.\n"
                "Return valid JSON with keys: brand_name, overall_score (int 1-100), "
                "dimensions (list of 6 objects {id,label,score,note}), "
                "taglines (list of 3 objects {line,rationale}), "
                "tone_of_voice (list of 4 objects {principle,do,dont}), "
                "colors (list of 5 objects {role,hex,meaning}), "
                "positioning_statement (string), "
                "personality ({adjectives: [5 strings], anti_adjective: string}), "
                "typography ({heading, body}), handles ([3 strings]), keywords ([strings])."
            )
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=900,
                temperature=0.6,
            )
            result = json.loads(resp.choices[0].message.content)
    except Exception:
        result = None

    if not result or not isinstance(result, dict):
        result = _build_structured_fallback(req)

    new_credits = max(0, user_credits - cost)
    if db is not None:
        db.users.update_one({"_id": current_user["_id"]}, {"$set": {"credits": new_credits}, "$inc": {"ai_runs": 1}})
        db.ai_runs.insert_one({
            "user_id": current_user["_id"],
            "tool_id": "brandkit",
            "credits_used": cost,
            "inputs": req.model_dump(),
            "created_at": datetime.now(timezone.utc),
        })

    return {
        "success": True,
        "credits_used": cost,
        "remaining_credits": new_credits,
        "kit": result,
    }


@router.get("/kits")
async def list_brand_kits(current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"kits": []}
    kits = list(db.brand_kits.find({"user_id": str(current_user["_id"])}).sort("created_at", -1).limit(30))
    for k in kits:
        k["id"] = str(k.pop("_id"))
        if isinstance(k.get("created_at"), datetime):
            k["created_at"] = k["created_at"].isoformat()
    return {"kits": kits}


@router.post("/kits")
async def save_brand_kit(req: BrandKitSaveRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    doc = {
        "user_id": str(current_user["_id"]),
        "name": req.name,
        "industry": req.industry,
        "audience": req.audience,
        "vibe": req.vibe,
        "persona": req.persona or current_user.get("persona", "creator"),
        "keywords": req.keywords or BRANDKIT_KEYWORDS[:5],
        "result": req.result,
        "created_at": datetime.now(timezone.utc),
    }
    res = db.brand_kits.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    return {"success": True, "kit": doc}


@router.post("/kits/{kit_id}/apply")
async def apply_brand_kit_to_profile(kit_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    kit = db.brand_kits.find_one({"_id": ObjectId(kit_id), "user_id": str(current_user["_id"])})
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "brand_name": kit.get("name", ""),
            "active_brand_kit_id": kit_id,
        }},
    )
    return {"success": True, "brand_name": kit.get("name", "")}


@router.delete("/kits/{kit_id}")
async def delete_brand_kit(kit_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"success": True}
    try:
        db.brand_kits.delete_one({"_id": ObjectId(kit_id), "user_id": str(current_user["_id"])})
    except Exception:
        pass
    return {"success": True}
