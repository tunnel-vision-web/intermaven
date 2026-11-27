import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel

from config import db
from utils import get_current_user, get_system_settings

router = APIRouter(tags=["ai"])

TOOL_LABELS = {
    "brandkit": "Brand Kit AI",
    "musicbio": "Music Bio AI",
    "social": "Social AI",
    "syncpitch": "Sync Pitch AI",
    "bizpitch": "Pitch Deck AI",
    "pressrelease": "Press Release AI",
    "lyrichook": "Lyric & Hook AI",
    "merchbrief": "Merch Designer Brief",
}


def _derive_output_title(tool_id: str, inputs: Dict[str, Any]) -> str:
    for key in ("brand_name", "artist_name", "company_name", "track_title", "topic", "title", "project_name"):
        val = inputs.get(key)
        if isinstance(val, str) and val.strip():
            return f"{TOOL_LABELS.get(tool_id, tool_id)}: {val.strip()[:60]}"
    return f"{TOOL_LABELS.get(tool_id, tool_id)} Output"


def save_ai_output(
    user_id: Any,
    tool_id: str,
    content: str,
    inputs: Optional[Dict[str, Any]] = None,
    credits_used: int = 0,
    title: Optional[str] = None,
) -> Optional[str]:
    """Persist an AI generation to db.ai_outputs for the AI Output Library."""
    if db is None:
        return None
    safe_inputs = inputs or {}
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "tool_id": tool_id,
        "title": title or _derive_output_title(tool_id, safe_inputs),
        "content": content,
        "inputs": safe_inputs,
        "credits_used": credits_used,
        "is_favorite": False,
        "created_at": now,
        "updated_at": now,
    }
    res = db.ai_outputs.insert_one(doc)
    return str(res.inserted_id)


class AIGenerateRequest(BaseModel):
    tool_id: str
    inputs: dict

    class Config:
        extra = "allow"


class TrySocialRequest(BaseModel):
    topic: str
    platform: str = "Instagram"
    goal: str = "awareness"
    tone: str = "hype"


DEMO_DAILY_LIMIT = 3


TOOL_COSTS = {
    "brandkit": 10,
    "musicbio": 15,
    "social": 0,
    "syncpitch": 20,
    "bizpitch": 18,
    "pressrelease": 10,
    "lyrichook": 8,
    "merchbrief": 8,
}

TOOL_PROMPTS = {
    "brandkit": lambda v: f"""Senior brand strategist for African creative businesses.
Name: {v.get('name', '')} Industry: {v.get('industry', '')} Audience: {v.get('audience', '')} Vibe: {v.get('vibe', '')} Extra: {v.get('extra', '')}

Create a complete brand kit with:
1. BRAND NAME ANALYSIS
2. TAGLINE OPTIONS (3+ with rationale)
3. TONE OF VOICE (3-4 principles)
4. COLOUR DIRECTION
5. POSITIONING STATEMENT
6. BRAND PERSONALITY (5 adjectives + anti-adjective)
Be specific to African/Nairobi market.""",

    "musicbio": lambda v: f"""Music PR professional placing African artists internationally.
Artist: {v.get('artist', '')} Genre: {v.get('genre', '')} Origin: {v.get('origin', '')} Story: {v.get('story', '')} Tone: {v.get('tone', '')} Extra: {v.get('extra', '')}

Create:
1. SHORT BIO (100 words)
2. FULL BIO (250 words)
3. PRESS NARRATIVE (3 paragraphs)
4. MEDIA PITCH (150 words)
5. 3 INTERVIEW ANGLES""",

    "social": lambda v: v.get('prompt_override') or f"""Social media strategist for African creatives.
Topic: {v.get('topic', '')} Platform: {v.get('platform', '')} Goal: {v.get('goal', '')} Tone: {v.get('tone', '')} Extra: {v.get('extra', '')}

Create:
1. 3 caption variations for {v.get('platform', 'the platform')}
2. 8 relevant hashtags
3. Best posting time for Nairobi audiences
4. One engagement tip""",

    "pressrelease": lambda v: f"""Senior PR director writing a newsroom-ready press release.
Announcement Type: {v.get('announcement_type', 'Launch')}
Organization / Artist: {v.get('company_name', '')}
Headline / Topic: {v.get('topic', '')}
Location / Dateline: {v.get('location', 'Nairobi, Kenya')}
Release Date: {v.get('release_date', 'Immediate')}
Key Facts & Milestones: {v.get('key_facts', '')}
Executive / Artist Quote: {v.get('quote', '')}
Media Contact: {v.get('media_contact', '')}

Write a complete, publication-ready AP-style press release with:
1. FOR IMMEDIATE RELEASE header & dateline
2. Compelling Headline + Subheadline
3. Lead paragraph (Who, What, When, Where, Why)
4. 2-3 Body paragraphs with the attributed quote
5. Boilerplate ("About {v.get('company_name', 'the Organization')}")
6. ### End mark & Media Contact block""",

    "lyrichook": lambda v: f"""Hit songwriter and vocal arranger for African & global contemporary music.
Song Title / Concept: {v.get('title', '')}
Genre: {v.get('genre', 'Afrobeats')}
Mood / Vibe: {v.get('mood', 'Uplifting')}
Tempo / BPM: {v.get('bpm', '105 BPM')}
Language / Slang Mix: {v.get('language_mix', 'English / Swahili / Sheng')}
Key Themes / Story: {v.get('theme', '')}

Write:
1. 3 CATCHY CHORUS / HOOK OPTIONS (with rhythmic phrasing & ad-libs)
2. VERSE 1 (8–12 bars with rhyme scheme markers)
3. PRE-CHORUS / BRIDGE
4. DELIVERY & VOCAL CADENCE NOTES""",

    "merchbrief": lambda v: f"""Creative director & apparel production specialist for creator and brand merchandise.
Brand / Artist Name: {v.get('brand_name', '')}
Drop / Collection Theme: {v.get('theme', '')}
Garment / Product Types: {v.get('garments', 'Heavyweight Tees, Hoodies, Tote Bags')}
Target Audience & Price Tier: {v.get('audience', 'Streetwear / Mid-Premium')}
Color Palette / Aesthetic: {v.get('colors', 'Black, Forest Green, Cream')}
Print / Branding Method: {v.get('print_method', 'Screenprint + Woven Label')}
Estimated Quantity & Sizes: {v.get('quantity', '100 units (S–XXL)')}

Produce a complete Merch Designer & Production Brief with:
1. COLLECTION CONCEPT & VISUAL DIRECTION
2. GARMENT & FABRIC SPECIFICATIONS (GSM, fit, blanks)
3. ARTWORK PLACEMENT & PRINT DIMENSIONS (Front, Back, Sleeve, Neck label)
4. COLORWAYS & INK / EMBROIDERY CALLOUTS
5. SIZE CURVE & PACKAGING / HANGTAG NOTES
6. VENDOR PRODUCTION CHECKLIST""",

    "syncpitch": lambda v: f"""Sync licensing agent placing African music globally.
Artist: {v.get('artist', '')} Track: {v.get('track', '')} Target: {v.get('target', '')} Mood: {v.get('mood', '')} Extra: {v.get('extra', '')}

Create:
1. SUBJECT LINE (3 options)
2. PITCH EMAIL (200-250 words for {v.get('target', 'the target')})
3. TRACK DESCRIPTION (60 words)
4. USAGE SUGGESTIONS (3 scenarios)
5. RIGHTS SUMMARY""",

    "bizpitch": lambda v: f"""Startup pitch consultant, East African investment landscape.
Business: {v.get('business', '')} Sector: {v.get('sector', '')} Problem: {v.get('problem', '')} Audience: {v.get('audience', '')} Extra: {v.get('extra', '')}

Create:
1. PROBLEM STATEMENT
2. SOLUTION SLIDE COPY
3. MARKET OPPORTUNITY
4. TRACTION SECTION
5. CALL TO ACTION"""
}


@router.post("/api/ai/generate")
async def generate_ai_content(request: AIGenerateRequest, current_user: dict = Depends(get_current_user)):
    tool_id = request.tool_id
    inputs = request.inputs

    if tool_id not in TOOL_COSTS:
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    settings = get_system_settings()
    cost_map = {
        "brandkit": settings.get("brandkit_cost", 10),
        "musicbio": settings.get("musicbio_cost", 15),
        "social": 0,
        "syncpitch": settings.get("syncpitch_cost", 20),
        "bizpitch": settings.get("bizpitch_cost", 18)
    }
    beta_free = os.environ.get("BETA_FREE_MODE", "true").lower() == "true"
    cost = 0 if beta_free else cost_map.get(tool_id, TOOL_COSTS.get(tool_id, 0))
    if cost > 0 and current_user.get("credits", 0) < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    prompt = TOOL_PROMPTS[tool_id](inputs)

    try:
        from llm_fallback import run_llm_completion
        response = await run_llm_completion(
            prompt=prompt,
            system_message="You are a helpful AI assistant specialized in African creative and business markets.",
            session_id="intermaven-{0}-{1}".format(str(current_user['_id']), tool_id)
        )

        if cost > 0:
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$inc": {"credits": -cost, "ai_runs": 1}}
            )

        db.ai_runs.insert_one({
            "user_id": current_user["_id"],
            "tool_id": tool_id,
            "cost": cost,
            "created_at": datetime.now(timezone.utc)
        })

        output_id = save_ai_output(
            user_id=current_user["_id"],
            tool_id=tool_id,
            content=response,
            inputs=inputs,
            credits_used=cost,
        )

        db.activities.insert_one({
            "user_id": current_user["_id"],
            "type": "ai_generation",
            "tool_id": tool_id,
            "created_at": datetime.now(timezone.utc)
        })

        updated_user = db.users.find_one({"_id": current_user["_id"]})

        return {
            "success": True,
            "output_id": output_id,
            "content": response,
            "credits_used": cost,
            "credits_remaining": updated_user.get("credits", 0)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


def _get_client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.get("/api/ai/try-social/status")
async def try_social_status(request: Request):
    ip = _get_client_ip(request)
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    used = db.demo_runs.count_documents({"ip": ip, "tool_id": "social", "created_at": {"$gte": since}})
    return {
        "limit": DEMO_DAILY_LIMIT,
        "used": used,
        "remaining": max(0, DEMO_DAILY_LIMIT - used),
    }


@router.post("/api/ai/try-social")
async def try_social_demo(payload: TrySocialRequest, request: Request):
    ip = _get_client_ip(request)
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    used = db.demo_runs.count_documents({"ip": ip, "tool_id": "social", "created_at": {"$gte": since}})
    if used >= DEMO_DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Free demo limit reached ({DEMO_DAILY_LIMIT}/day). Sign up to keep going.",
        )

    topic = (payload.topic or "").strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")
    if len(topic) > 280:
        raise HTTPException(status_code=400, detail="Topic must be 280 characters or fewer")

    prompt = TOOL_PROMPTS["social"]({
        "topic": topic,
        "platform": payload.platform,
        "goal": payload.goal,
        "tone": payload.tone,
        "extra": "",
    })

    try:
        from llm_fallback import run_llm_completion
        response = await run_llm_completion(
            prompt=prompt,
            system_message="You are a helpful AI assistant specialized in African creative and business markets.",
            session_id="intermaven-demo-{0}".format(ip)
        )

        db.demo_runs.insert_one({
            "ip": ip,
            "tool_id": "social",
            "topic": topic[:120],
            "platform": payload.platform,
            "created_at": datetime.now(timezone.utc),
        })

        remaining = max(0, DEMO_DAILY_LIMIT - (used + 1))
        return {
            "success": True,
            "content": response,
            "remaining": remaining,
            "limit": DEMO_DAILY_LIMIT,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo generation failed: {str(e)}")


# ============== CMS AI COPYWRITING ASSISTANT ==============

class CmsAiAssistRequest(BaseModel):
    key_id: str
    current_text: Optional[str] = ""
    prompt: Optional[str] = ""
    tone: Optional[str] = "hype"
    target_portal: Optional[str] = "business"


@router.post("/api/ai/cms-assist")
async def cms_ai_assist(request: CmsAiAssistRequest, current_user: dict = Depends(get_current_user)):
    admin_roles = {"super_admin", "admin", "support", "finance"}
    if not (current_user.get("is_admin") or current_user.get("role") == "admin" or current_user.get("admin_role") in admin_roles):
        raise HTTPException(status_code=403, detail="Admin only")

    key_id = request.key_id
    current_text = request.current_text or ""
    user_prompt = request.prompt or ""
    tone = request.tone or "hype"
    portal = request.target_portal or "business"

    system_instruction = (
        f"You are Intermaven's expert AI Copywriter & Marketing Strategist for the {portal.upper()} portal. "
        f"Generate or rewrite punchy, conversion-focused website copy for CMS key '{key_id}'. "
        f"Keep formatting clean. If HTML markup like <b>, <em>, or <br/> is appropriate, use it tastefully."
    )

    user_message = (
        f"CMS Key: {key_id}\n"
        f"Current Copy: '{current_text}'\n"
        f"Desired Tone/Style: {tone}\n"
        f"Custom Instruction: '{user_prompt}'\n\n"
        f"Provide ONLY the refined final copy string ready for insertion:"
    )

    try:
        from llm_fallback import run_llm_completion
        result = await run_llm_completion(
            prompt=user_message,
            system_message=system_instruction,
            session_id=f"cms-assist-{key_id}"
        )
        clean_result = (result or "").strip().strip('"').strip("'")
        return {"success": True, "key_id": key_id, "suggestion": clean_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI assistance failed: {str(e)}")


# ============== AI OUTPUT LIBRARY ==============

class AiOutputUpdate(BaseModel):
    title: Optional[str] = None
    is_favorite: Optional[bool] = None


def _serialize_output(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "tool_id": doc.get("tool_id", ""),
        "title": doc.get("title", "AI Output"),
        "content": doc.get("content", ""),
        "inputs": doc.get("inputs", {}),
        "credits_used": doc.get("credits_used", 0),
        "is_favorite": bool(doc.get("is_favorite", False)),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", "")),
        "updated_at": doc["updated_at"].isoformat() if isinstance(doc.get("updated_at"), datetime) else str(doc.get("updated_at", "")),
    }


@router.get("/api/ai/outputs")
async def list_ai_outputs(
    tool_id: Optional[str] = None,
    search: Optional[str] = None,
    favorites: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        return {"outputs": []}

    query: Dict[str, Any] = {"user_id": current_user["_id"]}
    if tool_id and tool_id != "all":
        query["tool_id"] = tool_id
    if favorites:
        query["is_favorite"] = True
    if search and search.strip():
        pattern = {"$regex": search.strip(), "$options": "i"}
        query["$or"] = [{"title": pattern}, {"content": pattern}]

    docs = list(db.ai_outputs.find(query).sort("created_at", -1).limit(limit))
    return {"outputs": [_serialize_output(d) for d in docs]}


@router.get("/api/ai/outputs/{output_id}")
async def get_ai_output(output_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(output_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid output ID")

    doc = db.ai_outputs.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Output not found")
    return {"output": _serialize_output(doc)}


@router.patch("/api/ai/outputs/{output_id}")
async def update_ai_output(output_id: str, payload: AiOutputUpdate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(output_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid output ID")

    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    if payload.title is not None:
        updates["title"] = payload.title.strip()[:120] or "AI Output"
    if payload.is_favorite is not None:
        updates["is_favorite"] = payload.is_favorite

    res = db.ai_outputs.find_one_and_update(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$set": updates},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Output not found")
    return {"success": True, "output": _serialize_output(res)}


@router.delete("/api/ai/outputs/{output_id}")
async def delete_ai_output(output_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(output_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid output ID")

    res = db.ai_outputs.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Output not found")
    return {"success": True}
