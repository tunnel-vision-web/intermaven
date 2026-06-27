# -*- coding: utf-8 -*-
import os
import json

def get_mock_response_by_prompt(prompt, system_message=""):
    prompt_lower = prompt.lower()
    
    # 1. Wizard JSON Prompts (usually requests JSON format)
    if "json" in prompt_lower or "format" in prompt_lower:
        # Check for channels suggestions
        if "channel" in prompt_lower:
            return json.dumps({
                "channels": ["Instagram", "TikTok", "Spotify", "YouTube"],
                "reasoning": "These channels align best with modern African creative audiences.",
                "difficulty": "Medium",
                "recommended_frequency": "3 times per week"
            })
        # Check for strategy/tactics
        if "strategy" in prompt_lower or "tactic" in prompt_lower:
            return json.dumps({
                "strategy_name": "Digital Hype Campaign",
                "milestones": [
                    {"phase": "Teaser", "duration": "1 week", "focus": "Pre-saves & teaser videos"},
                    {"phase": "Launch", "duration": "2 weeks", "focus": "Playlist pitching & influencer ads"},
                    {"phase": "Retention", "duration": "1 month", "focus": "Live Q&A & fan challenges"}
                ],
                "budget_allocation": {"organic": "40%", "paid": "60%"}
            })
        # General JSON fallback
        return json.dumps({
            "status": "success",
            "suggestion": "Expand local presence through radio interviews and campus tours.",
            "estimated_impact": "High"
        })

    # 2. Brand Kit AI
    if "brand kit" in prompt_lower or "brand name analysis" in prompt_lower:
        return """### 1. BRAND NAME ANALYSIS
The brand name presents a strong, authentic identity that resonates well with the contemporary East African market, balancing cultural roots with global appeal.

### 2. TAGLINE OPTIONS
- *Unleash the Sound of Africa* — Emphasizes musical energy and international readiness.
- *Rooted in Culture, Styled for the World* — Highlights the connection between traditional heritage and modern style.
- *Your Story, Amplified* — Focuses on empowerment and voice.

### 3. TONE OF VOICE
- **Bold & Vibrant**: Expressive, colorful, and energetic.
- **Authentic**: Genuine, honoring local heritage and values.
- **Innovative**: Forward-looking and tech-savvy.

### 4. COLOUR DIRECTION
Warm Savannah Gold (#E29578) paired with deep Forest Green (#006D77) to convey stability, richness, and organic growth.

### 5. POSITIONING STATEMENT
Providing high-impact branding solutions for creative entrepreneurs looking to scale globally while staying grounded in African heritage.

### 6. BRAND PERSONALITY
Adjectives: Energetic, Creative, Authentic, Modern, Resilient.
Anti-adjective: Not traditionalist."""

    # 3. Music Bio & Press Kit
    if "musicbio" in prompt_lower or "press kit" in prompt_lower or "full bio" in prompt_lower:
        return """### 1. SHORT BIO (100 words)
Born and raised in Nairobi, this groundbreaking artist is redefining African fusion. By blending traditional polyrhythms with electronic textures, they create a unique sonic footprint. Since their breakout single, they have captured the hearts of local audiences and are poised for international acclaim.

### 2. FULL BIO (250 words)
Growing up in the culturally rich neighborhoods of East Africa, the artist's musical journey began early, influenced by coastal Benga rhythms and global hip-hop. This synthesis of sounds led to a distinctive style that transcends borders. Their lyrics explore themes of resilience, urban life, and cultural pride, delivered with magnetic stage presence.
Their latest project has garnered attention from top curators, charting across regional platforms and securing slots at major festivals. With a growing fanbase, they continue to push boundaries and inspire the next generation of African creators.

### 3. PRESS NARRATIVE
A new wave of African sound is taking over the global stage, and this artist is leading the charge with unmatched creativity.

### 4. MEDIA PITCH
Introduce your listeners to the fresh sound of Nairobi with this compelling new project.

### 5. 3 INTERVIEW ANGLES
- The evolution of Benga fusion.
- Navigating the independent music landscape in East Africa.
- Bringing traditional drums into modern electronic production."""

    # 4. Social AI
    if "social" in prompt_lower or "caption variations" in prompt_lower:
        return """### 1. 3 CAPTION VARIATIONS
- *Option 1 (Hype)*: Nairobi! 🚀 We are dropping something huge this Friday. Turn your notifications ON. #NextWave
- *Option 2 (Casual)*: Spent the last few weeks in the studio cooking up magic. Can't wait for you all to hear it. ✨
- *Option 3 (Interactive)*: Which track from the new EP is on repeat for you? Let me know in the comments! 👇

### 2. 8 RELEVANT HASHTAGS
#AfricanMusic #NairobiCreative #SocialAI #StudioVibes #EastAfrica #ArtistSupport #NewMusic #IndependentArtist

### 3. BEST POSTING TIME
Wednesdays and Fridays at 6:00 PM (EAT) for maximum engagement.

### 4. ENGAGEMENT TIP
Reply to every comment in the first hour of posting to boost algorithm reach."""

    # 5. Sync Pitch AI
    if "syncpitch" in prompt_lower or "pitch email" in prompt_lower:
        return """### 1. SUBJECT LINE
- Pitch: High-energy Afro-electronic track for your next action scene
- Sync Submission: Authentic Nairobi vibes for commercial placements
- Track Feature: Uplifting African beats for lifestyle segments

### 2. PITCH EMAIL
Dear Music Supervisor,
I am pitching a high-energy track that perfectly captures the vibrant spirit of modern Nairobi, ideal for fast-paced sequences or lifestyle branding.

### 3. TRACK DESCRIPTION
A hybrid track featuring rich percussion, synth baselines, and catchy vocal loops.

### 4. USAGE SUGGESTIONS
Sports commercials, urban travel vlogs, transition sequences.

### 5. RIGHTS SUMMARY
One-stop clearance: 100% master and publishing rights cleared."""

    # 6. Pitch Deck AI
    if "bizpitch" in prompt_lower or "problem statement" in prompt_lower:
        return """### 1. PROBLEM STATEMENT
African creators lose over 60% of potential licensing royalties due to fragmented metadata standards and lack of direct sync pitching channels.

### 2. SOLUTION SLIDE COPY
A unified dashboard providing automated metadata registration, AI-powered sync briefs, and direct contract management.

### 3. MARKET OPPORTUNITY
East African creative economy is valued at $2.1B and growing at 8% CAGR.

### 4. TRACTION SECTION
Over 5,000 artists onboarded and 12,000 credits processed in the last 6 months.

### 5. CALL TO ACTION
Join us in powering the next generation of creative businesses. Reach out at partner@intermaven.co."""

    # 7. Default general fallback
    return "This is a beautiful and professional AI generation response customized for your creative business inputs, optimizing for the East African creative and digital markets."


async def run_llm_completion(prompt, system_message, session_id):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=session_id,
            system_message=system_message
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        response = await chat.send_message(UserMessage(text=prompt))
        if not isinstance(response, str):
            response = str(response)
        return response
    except ImportError:
        try:
            import litellm
            api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
            if api_key:
                res = litellm.completion(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    api_key=api_key,
                    timeout=30
                )
                val = res.choices[0].message.content
                if val:
                    return val
        except Exception:
            pass
            
        return get_mock_response_by_prompt(prompt, system_message)
