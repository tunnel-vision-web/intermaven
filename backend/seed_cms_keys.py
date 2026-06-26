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
