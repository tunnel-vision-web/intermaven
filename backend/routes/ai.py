import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
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
