import os
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from config import db
from utils import get_current_user

router = APIRouter(tags=["ai"])


class AIGenerateRequest(BaseModel):
    tool_id: str
    inputs: dict

    # Support legacy 'tool_id' and also accept as 'tool_id'
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

    cost = TOOL_COSTS[tool_id]
    if cost > 0 and current_user.get("credits", 0) < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    prompt = TOOL_PROMPTS[tool_id](inputs)

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"intermaven-{str(current_user['_id'])}-{tool_id}",
            system_message="You are a helpful AI assistant specialized in African creative and business markets."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)

        # Deduct credits
        if cost > 0:
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$inc": {"credits": -cost, "ai_runs": 1}}
            )

        # Log AI run
        db.ai_runs.insert_one({
            "user_id": current_user["_id"],
            "tool_id": tool_id,
            "cost": cost,
            "created_at": datetime.now(timezone.utc)
        })

        # Log activity
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
    """Resolve client IP behind ingress/proxies."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.get("/api/ai/try-social/status")
async def try_social_status(request: Request):
    """Return how many free demo runs the caller has left today."""
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
    """Un-gated free demo of Social AI. Rate-limited per IP."""
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
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"intermaven-demo-{ip}",
            system_message="You are a helpful AI assistant specialized in African creative and business markets."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)

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
