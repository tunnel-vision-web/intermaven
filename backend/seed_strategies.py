"""
Curated public strategies seeded by Intermaven.
Auto-inserted on app startup if not already present.

Owner = a deterministic synthetic user so the strategies appear in the
public library under "by Intermaven Official".
"""
from datetime import datetime, timezone
from config import db

SYSTEM_USER_ID = "intermaven-official"
SYSTEM_USER_NAME = "Intermaven Official"


def _ensure_system_user():
    existing = db.users.find_one({"_id": SYSTEM_USER_ID})
    if existing:
        return
    db.users.insert_one({
        "_id": SYSTEM_USER_ID,
        "email": "official@intermaven.io",
        "first_name": "Intermaven",
        "last_name": "Official",
        "role": "system",
        "is_admin": False,
        "credits": 0,
        "created_at": datetime.now(timezone.utc),
    })


CURATED_STRATEGIES = [
    {
        "_id": "curated-google-lsa-2026",
        "name": "Google Local Services Ads — Lead Engine",
        "summary": "Pay-per-lead Google LSA setup for local service businesses (plumbers, lawyers, "
                   "TV-mount pros, cleaners, consultants). Get verified-pro status, claim top "
                   "of search, and capture phone-call leads at predictable cost.",
        "tags": ["google", "local-services", "lsa", "lead-generation", "services", "local-seo"],
        "credit_cost": 35,
        "strategy": {
            "headline": "Win local searches with Google Local Services Ads — pay only for booked leads.",
            "channels": [
                {
                    "name": "Google Local Services Ads",
                    "priority": "primary",
                    "why": "Pay-per-lead pricing, appears above organic results, includes the trusted "
                           "Google Guarantee badge.",
                },
                {
                    "name": "Google Business Profile",
                    "priority": "primary",
                    "why": "LSA listings pull reviews and hours from GBP — keep it polished and respond "
                           "to every review.",
                },
                {
                    "name": "Google Search Ads",
                    "priority": "secondary",
                    "why": "Fill the gaps LSA can't cover (services outside LSA categories or geos).",
                },
                {
                    "name": "WhatsApp Business",
                    "priority": "test",
                    "why": "Re-engage leads who didn't convert on the first call.",
                },
            ],
            "cadence": [
                {"channel": "Google LSA", "frequency": "Always-on · 24/7"},
                {"channel": "Google Business Profile", "frequency": "Post 2x/week + reply to reviews within 24h"},
                {"channel": "Google Search Ads", "frequency": "Always-on, weekly bid review"},
                {"channel": "WhatsApp follow-up", "frequency": "Within 1h of missed lead call"},
            ],
            "content_pillars": [
                "Proof (5-star reviews, before/after photos, Google Guarantee badge)",
                "Speed-of-response (answer calls within 60 sec)",
                "Service area clarity (zip codes / neighborhoods)",
                "Trust signals (licensed, insured, background-checked)",
            ],
            "kpis": [
                {"metric": "Cost per booked lead", "target_90d": "≤ $25"},
                {"metric": "Lead-to-job conversion", "target_90d": "≥ 35%"},
                {"metric": "Google review count", "target_90d": "+30 net new"},
                {"metric": "Average review rating", "target_90d": "≥ 4.7★"},
            ],
            "first_30_days": [
                "Day 1–3: Complete Google Local Services Ads onboarding (license, insurance, background check).",
                "Day 4–7: Verify your business; submit photos, service categories, and service areas.",
                "Day 8–14: Set a starting weekly budget (begin with 10× your target CPL).",
                "Day 15–21: Configure call answering rules — every missed call costs you a lead.",
                "Day 22–30: Reach out to your last 50 happy customers to request Google reviews "
                            "(stronger reviews = better LSA ranking + cheaper leads).",
            ],
        },
    },
    {
        "_id": "curated-instagram-tiktok-creator-2026",
        "name": "Instagram + TikTok Creator Breakout (90 Days)",
        "summary": "Short-form video plan for artists and creators to grow followers, drive playlist "
                   "saves, and trigger the algorithm with consistent reels and trending sound usage.",
        "tags": ["music", "creator", "instagram", "tiktok", "afro-soul", "afrobeats"],
        "credit_cost": 25,
        "strategy": {
            "headline": "Stack Instagram Reels + TikTok daily drops to break out in 90 days.",
            "channels": [
                {"name": "Instagram", "priority": "primary", "why": "Visual discovery, save-rates feed the algorithm."},
                {"name": "TikTok", "priority": "primary", "why": "Highest organic reach for music + creator content."},
                {"name": "YouTube Shorts", "priority": "secondary", "why": "Cross-post for monetization + long-tail discovery."},
            ],
            "cadence": [
                {"channel": "Instagram Reels", "frequency": "5x/week"},
                {"channel": "TikTok", "frequency": "1x/day"},
                {"channel": "YouTube Shorts", "frequency": "3x/week (cross-posts)"},
            ],
            "content_pillars": [
                "Sound (snippets, behind-the-music, lyric breakdowns)",
                "Story (creative process, day-in-life, origin)",
                "Showcase (live clips, collabs, reaction reels)",
            ],
            "kpis": [
                {"metric": "Combined followers", "target_90d": "+5,000"},
                {"metric": "Saves per post", "target_90d": "≥ 50"},
                {"metric": "Playlist adds", "target_90d": "+200"},
            ],
            "first_30_days": [
                "Day 1–5: Batch-shoot 30 clips (1 day in the studio).",
                "Day 6–14: Post 1 reel/day testing 3 hook formats.",
                "Day 15–21: Double down on the winning format.",
                "Day 22–30: Send DMs to 20 micro-influencers in your niche for duets.",
            ],
        },
    },
    {
        "_id": "curated-whatsapp-broadcast-2026",
        "name": "WhatsApp Broadcast CRM (African Markets)",
        "summary": "High-open-rate broadcast funnel using WhatsApp Business for African creators and "
                   "small businesses where email open rates are weak.",
        "tags": ["whatsapp", "africa", "crm", "broadcast", "small-business"],
        "credit_cost": 20,
        "strategy": {
            "headline": "Skip email — build a WhatsApp broadcast list with 90% open rates.",
            "channels": [
                {"name": "WhatsApp Business", "priority": "primary", "why": "92%+ open rate in African markets."},
                {"name": "Instagram", "priority": "secondary", "why": "Funnel followers into your WhatsApp list."},
            ],
            "cadence": [
                {"channel": "WhatsApp broadcast", "frequency": "1x/week"},
                {"channel": "Instagram CTA", "frequency": "2x/week"},
            ],
            "content_pillars": ["Offer", "Update", "Story"],
            "kpis": [
                {"metric": "Broadcast list size", "target_90d": "500 contacts"},
                {"metric": "Click-through to product", "target_90d": "15%"},
            ],
            "first_30_days": [
                "Set up WhatsApp Business + green tick verification.",
                "Add a 'Get on the list' CTA in your Instagram bio.",
                "Send your first broadcast with a value-only message (no sell).",
                "Tag contacts in Intermaven CRM by source.",
            ],
        },
    },
]


def seed_curated_strategies():
    """Idempotent — insert any missing curated strategy by _id."""
    try:
        _ensure_system_user()
        now = datetime.now(timezone.utc)
        for s in CURATED_STRATEGIES:
            existing = db.user_strategies.find_one({"_id": s["_id"]})
            if existing:
                continue
            doc = {
                **s,
                "user_id": SYSTEM_USER_ID,
                "is_public": True,
                "usage_count": 0,
                "created_at": now,
                "updated_at": now,
            }
            db.user_strategies.insert_one(doc)
    except Exception as e:
        # non-fatal — startup should not crash if seeding fails
        import logging
        logging.warning(f"Curated strategy seed failed: {e}")
