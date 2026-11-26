import os
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from config import db
from utils import get_current_user, get_system_settings

router = APIRouter(tags=["ai"])


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
    "bizpitch": 18
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

        db.activities.insert_one({
            "user_id": current_user["_id"],
            "type": "ai_generation",
            "tool_id": tool_id,
            "created_at": datetime.now(timezone.utc)
        })

        updated_user = db.users.find_one({"_id": current_user["_id"]})

        return {
            "success": True,
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
