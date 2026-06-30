"""
Default CMS keys for the Mother-CMS.
Idempotent — only inserts keys that don't exist yet, preserving any admin edits.
"""
from datetime import datetime, timezone
from config import db


DEFAULT_CMS_KEYS = [
    # ============== FOOTER & CONTACT ==============
    {
        "_id": "footer.contact.phone",
        "description": "Primary contact phone number shown in footer.",
        "default": "+254 700 000 000",
        "regions": {
            "US": "+1 (800) 555-0114",
            "CA": "+1 (800) 555-0114",
            "GB": "+44 800 016 6028",
            "KE": "+254 700 000 000",
            "NG": "+234 800 000 0000",
            "ZA": "+27 800 000 000",
        },
        "portals": {},
    },
    {
        "_id": "footer.contact.address",
        "description": "Postal address in footer.",
        "default": "Nairobi, Kenya",
        "regions": {
            "US": "Atlanta, GA · USA",
            "CA": "Atlanta, GA · USA",
            "GB": "London · UK",
            "KE": "Nairobi, Kenya",
            "NG": "Lagos, Nigeria",
            "ZA": "Johannesburg, South Africa",
        },
        "portals": {},
    },
    {
        "_id": "footer.tagline",
        "description": "Tagline shown above footer columns.",
        "default": "Made with ❤ in Nairobi",
        "regions": {
            "US": "Made with ❤ for creators worldwide",
            "CA": "Made with ❤ for creators worldwide",
            "GB": "Made with ❤ for creators worldwide",
        },
        "portals": {},
    },

    # ============== PAYMENT / PRICING ==============
    {
        "_id": "pricing.callout.title",
        "description": "Pricing-page payment callout title.",
        "default": "Pay instantly with M-Pesa",
        "regions": {
            "US": "Pay instantly with Venmo, Cash App, or Zelle",
            "CA": "Pay instantly with PayPal or Card",
            "GB": "Pay instantly with PayPal or Card",
        },
        "portals": {},
    },
    {
        "_id": "pricing.callout.body",
        "description": "Pricing-page payment callout body.",
        "default": "Send to Paybill 522900. Credits load the moment your payment confirms — no waiting, no approval.",
        "regions": {
            "US": "Transfer directly to our handle @intermaven. Credits load the moment your payment confirms — no waiting, no approval.",
            "CA": "Pay via PayPal or Card. Credits load the moment your payment confirms.",
            "GB": "Pay via PayPal or Card. Credits load the moment your payment confirms.",
        },
        "portals": {},
    },
    {
        "_id": "pricing.payment_methods",
        "description": "Comma-separated list of payment methods shown on plan cards.",
        "default": "M-Pesa, Visa, Mastercard, PayPal",
        "regions": {
            "US": "Venmo, Cash App, Zelle, Card, PayPal",
            "CA": "Card, PayPal",
            "GB": "Card, PayPal",
        },
        "portals": {},
    },

    # ============== SOCIAL HANDLES (Intermaven's own — for schema.org sameAs) ==============
    {"_id": "social.instagram", "description": "Intermaven Instagram URL.", "default": "https://instagram.com/intermaven", "regions": {}, "portals": {}},
    {"_id": "social.tiktok", "description": "Intermaven TikTok URL.", "default": "https://tiktok.com/@intermaven", "regions": {}, "portals": {}},
    {"_id": "social.x", "description": "Intermaven X (Twitter) URL.", "default": "https://x.com/intermaven", "regions": {}, "portals": {}},
    {"_id": "social.linkedin", "description": "Intermaven LinkedIn URL.", "default": "https://linkedin.com/company/intermaven", "regions": {}, "portals": {}},
    {"_id": "social.youtube", "description": "Intermaven YouTube URL.", "default": "https://youtube.com/@intermaven", "regions": {}, "portals": {}},
    {"_id": "social.facebook", "description": "Intermaven Facebook URL.", "default": "https://facebook.com/intermaven", "regions": {}, "portals": {}},

    # ============== ABOUT PAGE ==============
    {
        "_id": "about.phone_label",
        "description": "Label shown above phone number on About page.",
        "default": "WHATSAPP",
        "regions": {"US": "PHONE", "CA": "PHONE", "GB": "PHONE"},
        "portals": {},
    },
    {
        "_id": "about.business_hours",
        "description": "Business hours line on About page.",
        "default": "Mon–Fri, 9am–5pm EAT",
        "regions": {
            "US": "Mon–Fri, 9am–5pm ET",
            "CA": "Mon–Fri, 9am–5pm ET",
            "GB": "Mon–Fri, 9am–5pm GMT",
        },
        "portals": {},
    },
    {
        "_id": "about.description",
        "description": "Tagline paragraph at the top of the About page.",
        "default": "Intermaven is the complete creative operating system for African musicians, creators, and entrepreneurs. We combine powerful AI tools, smart CRM, professional EPK builder, secure file management, and a full music ecosystem in one beautiful platform.",
        "regions": {},
        "portals": {},
    },
    {
        "_id": "about.story_title",
        "description": "Title of the story section on the About page.",
        "default": "Our Story",
        "regions": {},
        "portals": {},
    },
    {
        "_id": "about.story_body_1",
        "description": "First paragraph of the story section.",
        "default": "We built Intermaven because creators in Africa deserve world-class tools that understand their unique challenges — from unreliable power and internet to complex payment systems and limited access to global markets.",
        "regions": {},
        "portals": {},
    },
    {
        "_id": "about.story_body_2",
        "description": "Second paragraph of the story section.",
        "default": "What started as a simple EPK builder in 2024 has grown into a full operating system used by thousands of independent artists, DJs, labels, managers, and creative entrepreneurs across the continent and diaspora.",
        "regions": {},
        "portals": {},
    },
    {
        "_id": "about.email_label",
        "description": "Label for the email contact card on the About page.",
        "default": "EMAIL US",
        "regions": {},
        "portals": {},
    },
    {
        "_id": "about.email",
        "description": "Contact email address on the About page.",
        "default": "hello@intermaven.io",
        "regions": {},
        "portals": {},
    },
    {
        "_id": "about.based_in",
        "description": "Location description shown on the About page.",
        "default": "Nairobi, Kenya",
        "regions": {
            "US": "Atlanta, USA · Nairobi, Kenya",
            "CA": "Atlanta, USA · Nairobi, Kenya",
            "GB": "London, UK · Nairobi, Kenya",
        },
        "portals": {},
    },
    {
        "_id": "tools.header",
        "description": "Main title heading of the AI Creative Tools page.",
        "default": "AI Creative Studio",
        "regions": {},
        "portals": {
            "djs": {"default": "Tools for DJs and promoters"},
            "labels": {"default": "Tools for labels and A&R teams"},
            "producers": {"default": "Tools for producers and studios"},
            "mediahouses": {"default": "Tools for media houses and brand teams"},
        },
    },
    {
        "_id": "tools.subtitle",
        "description": "Sub-title text of the AI Creative Tools page.",
        "default": "Generate brand and music assets powered by AI",
        "regions": {},
        "portals": {
            "djs": {"default": "Create show promos, lineups, and bookings with AI-ready branding."},
            "labels": {"default": "Write artist bios, release plans, and pitch decks that help you sign and promote talent."},
            "producers": {"default": "Build your portfolio, pitch beats, and promote sessions with professional content."},
            "mediahouses": {"default": "Build music campaigns, licensing briefs, and curated playlists with ease."},
        },
    },
    {
        "_id": "tools.cta",
        "description": "Call to action button text on the Tools page.",
        "default": "Start free →",
        "regions": {},
        "portals": {
            "djs": {"default": "Join the movement →"},
            "labels": {"default": "Start label tools →"},
            "producers": {"default": "Create your demo pack →"},
            "mediahouses": {"default": "Explore media tools →"},
        },
    },
    {
        "_id": "tools.cta_desc",
        "description": "Description note below the sign-up call to action on the Tools page.",
        "default": "Create a free account to access all AI tools with 150 free credits. No credit card required.",
        "regions": {},
        "portals": {
            "djs": {"default": "Sign up and turn every set into a branded experience for promoters, venues, and fans."},
            "labels": {"default": "Create an account and get label-ready assets for press, sync, and promotion."},
            "producers": {"default": "Sign up to generate polished producer profiles, sync pitches, and social assets."},
            "mediahouses": {"default": "Sign up to access tools built for licensing, campaigns, and creative operations."},
        },
    },
]


def seed_default_cms_keys():
    """Insert any missing default CMS keys without overwriting admin edits."""
    try:
        now = datetime.now(timezone.utc)
        for k in DEFAULT_CMS_KEYS:
            if db.cms_keys.find_one({"_id": k["_id"]}):
                continue
            doc = {
                **k,
                "created_at": now,
                "updated_at": now,
                "updated_by": "system-seed",
                "history": [],
            }
            db.cms_keys.insert_one(doc)
    except Exception as e:
        import logging
        logging.warning(f"CMS key seed failed: {e}")
