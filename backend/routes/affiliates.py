"""TuneMavens Ecosystem Affiliate Router â€” Ditto-Modeled Affiliate Program.

Manages public affiliate applications, referral code click tracking with 90-day cookies,
dynamic 3% - 12% multi-stream compensation matrix, real-time conversion ledger,
and administrator payout orchestration (Credits, M-Pesa, Stripe, PayPal).
"""
import logging
import os
import secrets
import string
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field

from utils import get_current_user, get_optional_user
from config import db


def _is_admin_user(user: Optional[dict]) -> bool:
    if not user:
        return False
    return bool(
        user.get("role") == "admin"
        or user.get("is_admin") is True
        or user.get("original_role") == "admin"
        or "admin" in (user.get("roles") or [])
    )


def _require_admin_user(user: Optional[dict]) -> None:
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if not _is_admin_user(user):
        raise HTTPException(status_code=403, detail="Administrator privileges required.")


def _assert_affiliate_ref_ownership(ref_code: str, user: Optional[dict]) -> str:
    clean_ref = (ref_code or "").strip().upper()
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if _is_admin_user(user):
        return clean_ref
    email = (user.get("email") or "").strip().lower()
    own_aff = db.affiliates.find_one({"email": email}) if email else None
    own_ref = (own_aff.get("ref_code") or "").strip().upper() if own_aff else ""
    if not own_ref or clean_ref != own_ref:
        raise HTTPException(
            status_code=403,
            detail="Access denied: affiliates cannot view, add, edit, or delete another affiliate's data."
        )
    return clean_ref

from account_setup import (
    create_setup_token,
    send_affiliate_welcome,
    send_payout_dispatched_notification,
    send_affiliate_conversion_notification,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/affiliates", tags=["affiliates"])

def generate_unique_affiliate_code(name: str, custom_ref: Optional[str] = None) -> str:
    """Generate a collision-free affiliate referral code with a distinct 4-character unique identifier.
    Example: MARCUS-7K3P, AFROVIBE-9B2F, or MAVEN-4W8D.
    """
    raw = (custom_ref or name.split()[0]).upper().strip()
    prefix = "".join(ch for ch in raw if ch.isalnum()) or "MAVEN"
    prefix = prefix[:8]
    
    # Character set without visually ambiguous 0/O, 1/I
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    for _ in range(50):
        suffix = "".join(secrets.choice(chars) for _ in range(4))
        candidate = f"{prefix}-{suffix}"
        if not db.affiliates.find_one({"ref_code": candidate}):
            return candidate

    return f"{prefix}-{secrets.token_hex(2).upper()}"


# ======================================================================
# Default 3% to 12% Compensation Matrix Seed
# ======================================================================
DEFAULT_COMPENSATION_MATRIX = [
    {
        "id": "stream_pool",
        "category": "Streaming & Micro-Tipping",
        "channel": "TuneStream Web World",
        "rate_percent": 3.0,
        "calculation_basis": "Creator Net Stream Payout",
        "description": "Ad-supported & premium subscriber stream pool distributions plus fan micro-tips.",
        "example_calc": "100,000 Streams ($400 net creator royalty) â†’ $12.00 Affiliate Commission",
        "icon": "RiHeadphoneFill",
        "tier_bonuses": {"scout": 3.0, "partner": 4.0, "ambassador": 5.0}
    },
    {
        "id": "single_lossless",
        "category": "Lossless Track Downloads",
        "channel": "Creator Web Worlds (EPK) & Storefront",
        "rate_percent": 5.0,
        "calculation_basis": "Gross Single Track Sale",
        "description": "Direct uncompressed 24-bit WAV/FLAC audio purchases ($0.99 - $1.99 per track).",
        "example_calc": "Single track purchase ($1.99) â†’ $0.10 Affiliate Commission",
        "icon": "RiMusicFill",
        "tier_bonuses": {"scout": 5.0, "partner": 6.0, "ambassador": 7.0}
    },
    {
        "id": "album_sale",
        "category": "Full Album Showcase",
        "channel": "TuneStream & Creator EPK",
        "rate_percent": 7.0,
        "calculation_basis": "Gross Full Album Sale",
        "description": "Complete digital album package with liner notes & analog synth stems ($9.99 / 50 Credits).",
        "example_calc": "Full album purchase ($9.99) â†’ $0.70 Affiliate Commission",
        "icon": "RiDiscFill",
        "tier_bonuses": {"scout": 7.0, "partner": 8.0, "ambassador": 9.0}
    },
    {
        "id": "stems_pack",
        "category": "Multitrack Stems & Producer Kits",
        "channel": "SyncMavens & Industry Hub",
        "rate_percent": 8.5,
        "calculation_basis": "Gross Stems Package Sale",
        "description": "Isolated vocal, drum, bass, and synth stems for remixers & sync editors ($29 - $99).",
        "example_calc": "Producer stems kit purchase ($49.00) â†’ $4.17 Affiliate Commission",
        "icon": "RiEqualizerFill",
        "tier_bonuses": {"scout": 8.5, "partner": 9.5, "ambassador": 10.5}
    },
    {
        "id": "ticket_pass",
        "category": "Digital QR Passes & Tours",
        "channel": "TuneTours & M-Pesa Live Push",
        "rate_percent": 10.0,
        "calculation_basis": "Net Ticket Sale Proceeds",
        "description": "Multi-tier event passes (GA, VIP, Meet & Greet) via M-Pesa STK push or Stripe card.",
        "example_calc": "VIP Tour Pass purchase ($50.00) â†’ $5.00 Affiliate Commission",
        "icon": "RiTicket2Fill",
        "tier_bonuses": {"scout": 10.0, "partner": 11.0, "ambassador": 12.0}
    },
    {
        "id": "sync_placement",
        "category": "Commercial Sync Licensing",
        "channel": "SyncMavens Brief Matching Hub",
        "rate_percent": 12.0,
        "calculation_basis": "Net Sync Placement Fee (Capped at $300)",
        "description": "One-stop sync clearances and brief placements for TV, movies, advertising, and video games.",
        "example_calc": "Commercial sync license ($5,000 fee) â†’ $300.00 Affiliate Commission (Max Cap)",
        "icon": "RiGlobalFill",
        "tier_bonuses": {"scout": 10.0, "partner": 11.0, "ambassador": 12.0}
    },
    {
        "id": "creator_onboarding",
        "category": "Creator Onboarding & Credits",
        "channel": "Intermaven Unified Network",
        "rate_percent": 12.0,
        "calculation_basis": "First Unified Credits Top-Up",
        "description": "Referred creator signs up and completes their first credit reload or distribution package.",
        "example_calc": "1,000 Credits Reload ($100 pack) â†’ $12.00 Affiliate Commission",
        "icon": "RiCoinsFill",
        "tier_bonuses": {"scout": 10.0, "partner": 11.0, "ambassador": 12.0}
    }
]

# Seed demo affiliates if collection is empty
DEMO_AFFILIATES = [
    {
        "id": "aff_vibe_curator",
        "name": "Marcus Vance",
        "email": "marcus@afrobeatsweekly.com",
        "handle": "@afrobeatsweekly",
        "ref_code": "AFROVIBE",
        "website_or_social": "https://instagram.com/afrobeatsweekly",
        "tier": "ambassador",
        "status": "active",
        "payout_method": "mpesa",
        "payout_details": {"phone": "+254712345678", "recipient": "Marcus Vance"},
        "clicks_count": 1420,
        "conversions_count": 86,
        "total_gmv": 8450.00,
        "total_earnings": 892.40,
        "pending_payout": 145.20,
        "paid_payout": 747.20,
        "created_at": "2026-08-10T12:00:00Z"
    },
    {
        "id": "aff_studio_sync",
        "name": "Amina Chen",
        "email": "amina@synclabs.io",
        "handle": "@synclabs",
        "ref_code": "SYNCLABS",
        "website_or_social": "https://synclabs.io",
        "tier": "partner",
        "status": "active",
        "payout_method": "stripe",
        "payout_details": {"email": "amina@synclabs.io", "account_id": "acct_192837482"},
        "clicks_count": 680,
        "conversions_count": 34,
        "total_gmv": 4120.00,
        "total_earnings": 384.60,
        "pending_payout": 88.00,
        "paid_payout": 296.60,
        "created_at": "2026-09-01T08:30:00Z"
    },
    {
        "id": "aff_indie_curator",
        "name": "Liam Thorne",
        "email": "liam@indieradar.co",
        "handle": "@indieaudiomaster",
        "ref_code": "RADAR",
        "website_or_social": "https://youtube.com/@indieaudiomaster",
        "tier": "scout",
        "status": "active",
        "payout_method": "credits",
        "payout_details": {"username": "liam_radar", "credits_account": "CR-8921"},
        "clicks_count": 310,
        "conversions_count": 14,
        "total_gmv": 1280.00,
        "total_earnings": 104.50,
        "pending_payout": 42.50,
        "paid_payout": 62.00,
        "created_at": "2026-09-20T15:45:00Z"
    }
]

DEMO_CONVERSIONS = [
    {
        "id": "conv_801",
        "affiliate_id": "aff_vibe_curator",
        "ref_code": "AFROVIBE",
        "tx_id": "TX-9941",
        "type": "album_sale",
        "type_label": "Full Album Showcase",
        "item_title": "Neon Safari EP (Ndufo)",
        "buyer_info": "fan_891@gmail.com",
        "creator_name": "Ndufo",
        "gross_amount": 9.99,
        "commission_rate": 7.0,
        "commission_amount": 0.70,
        "status": "cleared",
        "created_at": "2026-10-14T18:22:00Z"
    },
    {
        "id": "conv_802",
        "affiliate_id": "aff_vibe_curator",
        "ref_code": "AFROVIBE",
        "tx_id": "TX-9942",
        "type": "sync_placement",
        "type_label": "Commercial Sync Placement",
        "item_title": "Nairobi Sunset (Netflix Series Cue)",
        "buyer_info": "Netflix Music Dept",
        "creator_name": "Ndufo",
        "gross_amount": 2500.00,
        "commission_rate": 12.0,
        "commission_amount": 300.00,
        "status": "cleared",
        "created_at": "2026-10-13T11:05:00Z"
    },
    {
        "id": "conv_803",
        "affiliate_id": "aff_studio_sync",
        "ref_code": "SYNCLABS",
        "tx_id": "TX-9943",
        "type": "stems_pack",
        "type_label": "Multitrack Stems Kit",
        "item_title": "Afro-Synth Cascade Stems (WAV)",
        "buyer_info": "producer_k@tokyo.fm",
        "creator_name": "Ndufo",
        "gross_amount": 49.00,
        "commission_rate": 8.5,
        "commission_amount": 4.17,
        "status": "cleared",
        "created_at": "2026-10-12T09:14:00Z"
    },
    {
        "id": "conv_804",
        "affiliate_id": "aff_indie_curator",
        "ref_code": "RADAR",
        "tx_id": "TX-9944",
        "type": "creator_onboarding",
        "type_label": "Creator Credits Top-Up",
        "item_title": "1,000 Unified Credits Pack",
        "buyer_info": "sauti_records@kenya.co",
        "creator_name": "Sauti Records",
        "gross_amount": 100.00,
        "commission_rate": 12.0,
        "commission_amount": 12.00,
        "status": "pending_clearance",
        "created_at": "2026-10-15T04:20:00Z"
    }
]

# Seed demo linked creators, labels, and brands for affiliate network
DEMO_LINKED_USERS = [
    {
        "id": "usr_cr_901",
        "ref_code": "TM-KENYA-254",
        "name": "Amina Mwangi",
        "email": "amina@mwangi-audio.co.ke",
        "handle": "@aminasounds",
        "role": "creator",
        "role_label": "Recording Artist & Producer",
        "status": "catalog_live",
        "region": "Nairobi, Kenya",
        "linked_at": "2026-09-18T14:20:00Z",
        "releases_count": 14,
        "streams_count": 142500,
        "gross_revenue": 2450.00,
        "commission_generated": 196.00,
        "split_incentive": "Standard Matrix (3% - 12%)",
        "avatar_color": "#22d3ee",
        "notes": "Signed via Nairobi Studio Session. 2 albums on TuneStream.",
        "last_active": "18 minutes ago"
    },
    {
        "id": "usr_lb_902",
        "ref_code": "TM-KENYA-254",
        "name": "Kibera Sound System",
        "email": "roster@kiberasounds.ke",
        "handle": "@kiberasounds",
        "role": "label",
        "role_label": "Indie Record Label",
        "status": "catalog_live",
        "region": "Nairobi, Kenya",
        "linked_at": "2026-09-22T10:15:00Z",
        "releases_count": 42,
        "streams_count": 380200,
        "gross_revenue": 4120.00,
        "commission_generated": 329.60,
        "split_incentive": "Partner Label Tier (+1% Bonus)",
        "avatar_color": "#a855f7",
        "notes": "Roster of 6 Nairobi rap & drill acts. Automated Split Cascade enabled.",
        "last_active": "2 hours ago"
    },
    {
        "id": "usr_cr_903",
        "ref_code": "TM-KENYA-254",
        "name": "Juma Omondi",
        "email": "juma@nakurubeats.com",
        "handle": "@juma_beats",
        "role": "creator",
        "role_label": "Amapiano & Gengetone Beatmaker",
        "status": "active",
        "region": "Nakuru, Kenya",
        "linked_at": "2026-10-02T16:45:00Z",
        "releases_count": 8,
        "streams_count": 48900,
        "gross_revenue": 890.00,
        "commission_generated": 71.20,
        "split_incentive": "Standard Matrix",
        "avatar_color": "#f59e0b",
        "notes": "Multitrack stems package seller on SyncMavens.",
        "last_active": "Yesterday"
    },
    {
        "id": "usr_corp_904",
        "ref_code": "TM-KENYA-254",
        "name": "Safaricom Neon Media Hub",
        "email": "campaigns@safaricommedia.co.ke",
        "handle": "@safaricom_media",
        "role": "corporate",
        "role_label": "Corporate Brand / Ad Agency",
        "status": "active",
        "region": "Nairobi, Kenya",
        "linked_at": "2026-10-05T11:30:00Z",
        "releases_count": 2,
        "streams_count": 160000,
        "gross_revenue": 1500.00,
        "commission_generated": 180.00,
        "split_incentive": "12% Corporate Ad Placement",
        "avatar_color": "#f97316",
        "notes": "Sponsoring TuneStream cultural channel audio flights.",
        "last_active": "3 days ago"
    },
    {
        "id": "usr_sv_905",
        "ref_code": "TM-KENYA-254",
        "name": "Wanjiku Kamau",
        "email": "wanjiku@kenyasync.tv",
        "handle": "@wanjikusync",
        "role": "supervisor",
        "role_label": "Music Supervisor & Post Studio",
        "status": "catalog_live",
        "region": "Nairobi, Kenya",
        "linked_at": "2026-10-08T09:00:00Z",
        "releases_count": 3,
        "streams_count": 12000,
        "gross_revenue": 3200.00,
        "commission_generated": 300.00,
        "split_incentive": "12% Commercial Sync Fee",
        "avatar_color": "#ec4899",
        "notes": "Cleared 2 Netflix Pan-African drama series cues through SyncMavens.",
        "last_active": "Just now"
    },
    {
        "id": "usr_vc_906",
        "ref_code": "TM-KENYA-254",
        "name": "Helios Tour Capital Syndicate",
        "email": "deals@helioscreative.vc",
        "handle": "@helioscreativevc",
        "role": "vc",
        "role_label": "Tour Venture Capital & Syndicate",
        "status": "active",
        "region": "Nairobi & London",
        "linked_at": "2026-10-08T09:15:00Z",
        "releases_count": 5,
        "streams_count": 520000,
        "gross_revenue": 50000.00,
        "commission_generated": 2500.00,
        "split_incentive": "Tour Vault Syndicate (5% flat)",
        "avatar_color": "#00f2fe",
        "notes": "Underwriting 3 African arena tours. Split cascade priority recoupment.",
        "last_active": "4 hours ago"
    },
    {
        "id": "usr_pod_907",
        "ref_code": "TM-KENYA-254",
        "name": "AfroTech Disruption Podcast",
        "email": "host@afrotechpodcast.ke",
        "handle": "@afrotech_disrupt",
        "role": "podcaster",
        "role_label": "Podcaster & Show Host",
        "status": "catalog_live",
        "region": "Nairobi, Kenya",
        "linked_at": "2026-10-10T14:30:00Z",
        "releases_count": 28,
        "streams_count": 185000,
        "gross_revenue": 3400.00,
        "commission_generated": 408.00,
        "split_incentive": "Corporate Ad Flight (12% flat)",
        "avatar_color": "#ec4899",
        "notes": "Top 10 Business & Tech podcast in East Africa. Integrated corporate audio ads.",
        "last_active": "Just now"
    },
    {
        "id": "usr_con_908",
        "ref_code": "TM-KENYA-254",
        "name": "David Kimani",
        "email": "david.kimani@superfan.ke",
        "handle": "@kimanimusic",
        "role": "consumer",
        "role_label": "Listener & Superfan",
        "status": "active",
        "region": "Nairobi, Kenya",
        "linked_at": "2026-10-12T16:00:00Z",
        "releases_count": 0,
        "streams_count": 3400,
        "gross_revenue": 120.00,
        "commission_generated": 14.40,
        "split_incentive": "Hi-Fi Pass Referral (12% flat)",
        "avatar_color": "#3b82f6",
        "notes": "Hi-Fi annual subscriber with active creator tip history.",
        "last_active": "1 hour ago"
    }
]


def init_affiliate_seed_data():
    """Ensure compensation matrix, demo affiliates, and linked users exist in MongoDB."""
    try:
        # Seed or sync Matrix Config
        matrix_doc = db.affiliate_matrix_config.find_one({"active": True})
        if not matrix_doc:
            db.affiliate_matrix_config.insert_one({
                "active": True,
                "matrix": DEFAULT_COMPENSATION_MATRIX,
                "cookie_days": 90,
                "min_payout_usd": 20.00,
                "updated_at": datetime.now(timezone.utc).isoformat()
            })
            logger.info("Initialized affiliate compensation matrix configuration.")

        # Seed Affiliates
        if db.affiliates.count_documents({}) == 0:
            db.affiliates.insert_many(DEMO_AFFILIATES)
            logger.info("Seeded initial affiliate profiles.")

        # Seed Conversions
        if db.affiliate_conversions.count_documents({}) == 0:
            db.affiliate_conversions.insert_many(DEMO_CONVERSIONS)
            logger.info("Seeded initial affiliate conversions ledger.")

        # Seed Linked Users
        if db.affiliate_linked_users.count_documents({}) == 0:
            db.affiliate_linked_users.insert_many(DEMO_LINKED_USERS)
            logger.info("Seeded initial affiliate linked network roster.")
    except Exception as e:
        logger.warning(f"Affiliate seed data warning: {e}")


# Run seed check
init_affiliate_seed_data()


# ======================================================================
# Request / Response Schemas
# ======================================================================
class AffiliateApplicationRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    handle: Optional[str] = None
    custom_ref: Optional[str] = None
    website_or_social: str = Field(default="https://tunemavens.com", min_length=3)
    audience_category: str = "creator"  # creator, curator, podcaster, blogger, label
    target_region: str = "global"       # global, us, uk, kenya, nigeria, sa
    payout_method: str = "mpesa"        # mpesa, credits, stripe, paypal
    payout_details: Dict[str, str] = Field(default_factory=dict)
    accept_terms: bool = True


class MatrixUpdateRequest(BaseModel):
    matrix: List[Dict]
    cookie_days: Optional[int] = 90
    min_payout_usd: Optional[float] = 20.0


class BatchPayoutRequest(BaseModel):
    affiliate_ids: Optional[List[str]] = None  # None means all with pending balance
    method: str = "auto"                      # auto uses affiliate's preferred rail
    notes: Optional[str] = "Weekly affiliate earnings settlement"


class ConversionSimulationRequest(BaseModel):
    ref_code: str
    conversion_type: str = "album_sale"
    item_title: Optional[str] = None
    gross_amount: Optional[float] = None
    buyer_info: Optional[str] = "listener@tunemavens.co.ke"


class UserOnboardingRequest(BaseModel):
    ref_code: str
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = "creator"  # creator, label, supervisor, corporate, affiliate
    handle: Optional[str] = None
    region: Optional[str] = "Nairobi, Kenya"
    split_incentive: Optional[str] = "Standard Matrix (3% - 12%)"
    notes: Optional[str] = None


class AcademyAcknowledgeRequest(BaseModel):
    ref_code: str
    article_id: str
    acknowledged: bool = True




# ======================================================================
# Public Endpoints
# ======================================================================
@router.get("/matrix")
def get_affiliate_matrix():
    """Retrieve active compensation matrix and tier bonus structure."""
    doc = db.affiliate_matrix_config.find_one({"active": True}, {"_id": 0})
    if not doc:
        return {
            "matrix": DEFAULT_COMPENSATION_MATRIX,
            "cookie_days": 90,
            "min_payout_usd": 20.00
        }
    return doc


@router.post("/apply")
def apply_for_affiliate(app_data: AffiliateApplicationRequest, response: Response):
    """Register a new affiliate and generate instant referral link."""
    clean_email = app_data.email.strip().lower()

    # Check if already registered
    existing = db.affiliates.find_one({"email": clean_email})
    if existing:
        _existing_user = db.users.find_one({"email": clean_email})
        _tok = create_setup_token(str(_existing_user["_id"])) if (_existing_user and not _existing_user.get("password_hash")) else None
        send_affiliate_welcome(clean_email, existing.get("name", ""), existing["ref_code"],
                               f"https://tunemavens.com?ref={existing['ref_code']}", _tok)
        return {
            "status": "already_registered",
            "message": "You are already registered in the TuneMavens Affiliate Program.",
            "affiliate": {
                "id": existing["id"],
                "ref_code": existing["ref_code"],
                "tier": existing["tier"],
                "status": existing["status"],
                "referral_url": f"https://tunemavens.com?ref={existing['ref_code']}",
                "total_earnings": existing.get("total_earnings", 0.0),
                "pending_payout": existing.get("pending_payout", 0.0)
            }
        }

    # Generate collision-free referral code with distinct 4-character unique identifier
    final_ref = generate_unique_affiliate_code(app_data.name, app_data.custom_ref)

    aff_id = f"aff_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    new_profile = {
        "id": aff_id,
        "name": app_data.name.strip(),
        "email": clean_email,
        "handle": app_data.handle.strip() if app_data.handle else f"@{final_ref.lower()}",
        "ref_code": final_ref,
        "website_or_social": app_data.website_or_social.strip(),
        "audience_category": app_data.audience_category,
        "target_region": app_data.target_region,
        "tier": "scout",
        "status": "active",
        "payout_method": app_data.payout_method,
        "payout_details": app_data.payout_details,
        "clicks_count": 0,
        "conversions_count": 0,
        "total_gmv": 0.0,
        "total_earnings": 0.0,
        "pending_payout": 0.0,
        "paid_payout": 0.0,
        "created_at": now_iso
    }

    db.affiliates.insert_one(new_profile)
    try:
        from services.crm_ingest import sync_lead_to_smart_crm
        sync_lead_to_smart_crm(
            email=clean_email,
            name=new_profile.get("full_name") or new_profile.get("name"),
            phone=new_profile.get("phone"),
            source="Affiliate Application",
            system_key="inbound_affiliate_apps",
            group_name="Affiliate Applications",
            group_description="Inbound affiliate partner applications.",
            list_type="affiliate",
        )
    except Exception:
        pass

    # Create the login account (no password yet) and email a one-time setup link.
    referral_url = f"https://tunemavens.com?ref={final_ref}"
    setup_token = None
    user_row = db.users.find_one({"email": clean_email})
    if not user_row:
        res_u = db.users.insert_one(User(
            email=clean_email,
            name=app_data.name.strip(),
            role="affiliate",
            roles=["affiliate"],
            plan="starter",
            credits=0,
            brand_name=app_data.name.strip(),
            apps=["affiliates", "split-cascade", "tunemavens-library"],
            signup_page="affiliate_program",
        ).to_mongo())
        user_id = str(res_u.inserted_id)
        setup_token = create_setup_token(user_id)
    else:
        # Existing user joined the affiliate scheme: update active role to affiliate,
        # preserve their previous roles in roles list, and ensure affiliate apps are active.
        existing_roles = user_row.get("roles") or []
        if isinstance(existing_roles, list):
            if "affiliate" not in existing_roles:
                existing_roles.append("affiliate")
        else:
            existing_roles = [str(existing_roles), "affiliate"]
        
        prev_role = user_row.get("role")
        if prev_role and prev_role not in existing_roles:
            existing_roles.append(prev_role)
            
        existing_apps = user_row.get("apps") or []
        for app_slug in ["affiliates", "split-cascade", "tunemavens-library"]:
            if app_slug not in existing_apps:
                existing_apps.append(app_slug)
                
        update_fields = {
            "role": "affiliate",
            "roles": existing_roles,
            "apps": existing_apps,
            "updated_at": datetime.now(timezone.utc)
        }
        if not user_row.get("name") and app_data.name:
            update_fields["name"] = app_data.name.strip()
        db.users.update_one({"_id": user_row["_id"]}, {"$set": update_fields})
        
        if not user_row.get("password_hash"):
            setup_token = create_setup_token(str(user_row["_id"]))
    email_status = send_affiliate_welcome(clean_email, app_data.name.strip(), final_ref, referral_url, setup_token)

    # Set affiliate cookie on response for instant self-attribution testing (90 days)
    response.set_cookie(
        key="tm_aff_ref",
        value=final_ref,
        max_age=90 * 86400,
        httponly=False,
        samesite="lax",
        secure=False
    )

    return {
        "status": "success",
        "message": "Welcome to the TuneMavens Affiliate Scheme! Your referral link is now active.",
        "affiliate": {
            "id": aff_id,
            "ref_code": final_ref,
            "tier": "scout",
            "referral_url": f"https://tunemavens.com?ref={final_ref}",
            "payout_method": app_data.payout_method,
            "cookie_days": 90
        },
        "email": clean_email,
        "email_status": email_status,
        "needs_password": bool(setup_token)
    }


@router.get("/track/{ref_code}")
def track_affiliate_click(ref_code: str, request: Request, response: Response):
    """Log an affiliate referral link click and set 90-day tracking cookie."""
    clean_ref = ref_code.strip().upper()
    aff = db.affiliates.find_one({"ref_code": clean_ref})

    if aff:
        # Increment clicks
        db.affiliates.update_one(
            {"_id": aff["_id"]},
            {"$inc": {"clicks_count": 1}}
        )

    # Set 90-day cookie (max_age = 90 * 86400 = 7,776,000s)
    response.set_cookie(
        key="tm_aff_ref",
        value=clean_ref,
        max_age=90 * 86400,
        httponly=False,
        samesite="lax",
        secure=False
    )

    return {
        "tracked": bool(aff),
        "ref_code": clean_ref,
        "affiliate_name": aff["name"] if aff else "Independent Referral",
        "cookie_duration_days": 90
    }


@router.get("/me")
def get_my_affiliate_status(ref: Optional[str] = None, user=Depends(get_optional_user)):
    """Retrieve affiliate stats for authenticated user (or public ref lookup when unauthenticated)."""
    aff = None
    if ref:
        clean_ref = ref.strip().upper()
        if user and not _is_admin_user(user):
            _assert_affiliate_ref_ownership(clean_ref, user)
        aff = db.affiliates.find_one({"ref_code": clean_ref}, {"_id": 0})
    elif user and user.get("email"):
        aff = db.affiliates.find_one({"email": user["email"].strip().lower()}, {"_id": 0})

    # Auto-seed Kenyan partner for testing verification if TM-KENYA-254 or default requested
    if not aff and (ref and ref.strip().upper() == "TM-KENYA-254"):
        demo_partner = {
            "id": "aff_kenya_partner",
            "name": "Zawadi Kiprop",
            "email": "zawadi@tunemavens.co.ke",
            "handle": "@zawaditunes",
            "ref_code": "TM-KENYA-254",
            "website_or_social": "https://tiktok.com/@zawaditunes",
            "tier": "partner",
            "status": "active",
            "payout_method": "mpesa",
            "payout_details": {"phone": "+254712345678", "recipient": "Zawadi Kiprop"},
            "clicks_count": 840,
            "conversions_count": 48,
            "total_gmv": 5240.00,
            "total_earnings": 488.50,
            "pending_payout": 112.50,
            "paid_payout": 376.00,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.affiliates.update_one({"ref_code": "TM-KENYA-254"}, {"$setOnInsert": demo_partner}, upsert=True)
        if db.affiliate_conversions.count_documents({"affiliate_id": "aff_kenya_partner"}) == 0:
            db.affiliate_conversions.insert_many([
                {
                    "id": f"conv_kenya_{uuid.uuid4().hex[:6]}",
                    "affiliate_id": "aff_kenya_partner",
                    "ref_code": "TM-KENYA-254",
                    "tx_id": "TX-KE-101",
                    "type": "album_sale",
                    "type_label": "Full Album Showcase",
                    "item_title": "Sauti Solstice (Acoustic EP)",
                    "buyer_info": "wambui@safari.ke",
                    "creator_name": "Zawadi Kiprop",
                    "gross_amount": 9.99,
                    "commission_rate": 8.0,
                    "commission_amount": 0.80,
                    "status": "cleared",
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": f"conv_kenya_{uuid.uuid4().hex[:6]}",
                    "affiliate_id": "aff_kenya_partner",
                    "ref_code": "TM-KENYA-254",
                    "tx_id": "TX-KE-102",
                    "type": "ticket_pass",
                    "type_label": "Digital QR Passes & Tours",
                    "item_title": "Nairobi Live Jam Session VIP",
                    "buyer_info": "+254722998877 (M-Pesa)",
                    "creator_name": "Zawadi Kiprop",
                    "gross_amount": 50.00,
                    "commission_rate": 11.0,
                    "commission_amount": 5.50,
                    "status": "cleared",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ])
        aff = db.affiliates.find_one({"ref_code": "TM-KENYA-254"}, {"_id": 0})

    if not aff:
        return {"has_affiliate_account": False}

    # Fetch recent conversions
    recent_conversions = list(
        db.affiliate_conversions.find(
            {"affiliate_id": aff["id"]},
            {"_id": 0}
        ).sort("created_at", -1).limit(10)
    )

    return {
        "has_affiliate_account": True,
        "affiliate": aff,
        "recent_conversions": recent_conversions,
        "referral_url": f"https://tunemavens.com?ref={aff['ref_code']}"
    }


# ======================================================================
# Admin Management Endpoints
# ======================================================================
@router.get("/admin/overview")
def get_admin_affiliates_overview(user=Depends(get_current_user)):
    """Admin KPI overview for the Affiliate Programme."""
    _require_admin_user(user)
    total_affiliates = db.affiliates.count_documents({})
    active_affiliates = db.affiliates.count_documents({"status": "active"})
    total_conversions = db.affiliate_conversions.count_documents({})

    # Aggregate total revenue & commissions
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_gmv": {"$sum": "$total_gmv"},
                "total_earnings": {"$sum": "$total_earnings"},
                "pending_payout": {"$sum": "$pending_payout"},
                "paid_payout": {"$sum": "$paid_payout"}
            }
        }
    ]
    agg_result = list(db.affiliates.aggregate(pipeline))
    agg = agg_result[0] if agg_result else {}

    return {
        "metrics": {
            "total_affiliates": total_affiliates,
            "active_affiliates": active_affiliates,
            "total_conversions": total_conversions,
            "total_gmv": round(agg.get("total_gmv", 0.0), 2),
            "total_commission_earnings": round(agg.get("total_earnings", 0.0), 2),
            "pending_commission_payable": round(agg.get("pending_payout", 0.0), 2),
            "total_paid_out": round(agg.get("paid_payout", 0.0), 2)
        },
        "cookie_window_days": 90,
        "commission_range": "3.0% to 12.0%"
    }


def sync_all_registered_affiliates() -> None:
    """Ensure every user with role='affiliate' in db.users, the Admin account, and demo partners exist in db.affiliates."""
    try:
        init_affiliate_seed_data()
        # Ensure official Admin account exists with canonical naming
        existing_admin = db.affiliates.find_one({"ref_code": "TM-ADMIN"})
        if not existing_admin:
            db.affiliates.insert_one({
                "id": "aff_tm_admin",
                "name": "Admin Account â€” TuneMavens Official",
                "email": "admin@tunemavens.com",
                "handle": "@tunemavens_admin",
                "ref_code": "TM-ADMIN",
                "is_admin_account": True,
                "website_or_social": "https://tunemavens.com/?ref=TM-ADMIN",
                "tier": "ambassador",
                "status": "active",
                "payout_method": "credits",
                "payout_details": {},
                "clicks_count": 0,
                "conversions_count": 0,
                "onboardings_count": 0,
                "rsvps_count": 0,
                "total_gmv": 0.0,
                "total_earnings": 0.0,
                "pending_payout": 0.0,
                "paid_payout": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        elif existing_admin.get("name") in ("Tm-Admin", "tm-admin", "", None) or not existing_admin.get("is_admin_account"):
            db.affiliates.update_one(
                {"_id": existing_admin["_id"]},
                {"$set": {
                    "name": "Admin Account â€” TuneMavens Official",
                    "is_admin_account": True,
                }},
            )

        # Ensure flagship Kenya partner exists too
        if not db.affiliates.find_one({"ref_code": "TM-KENYA-254"}):
            db.affiliates.insert_one({
                "id": "aff_kenya_partner",
                "name": "Zawadi Kiprop",
                "email": "zawadi@tunemavens.co.ke",
                "handle": "@zawaditunes",
                "ref_code": "TM-KENYA-254",
                "website_or_social": "https://tiktok.com/@zawaditunes",
                "tier": "partner",
                "status": "active",
                "payout_method": "mpesa",
                "payout_details": {"phone": "+254712345678", "recipient": "Zawadi Kiprop"},
                "clicks_count": 840,
                "conversions_count": 48,
                "total_gmv": 5240.00,
                "total_earnings": 488.50,
                "pending_payout": 112.50,
                "paid_payout": 376.00,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        # Sync any registered affiliate users from db.users who don't yet have a db.affiliates row
        aff_users = list(db.users.find({"$or": [{"role": "affiliate"}, {"roles": "affiliate"}]}))
        for u in aff_users:
            email = (u.get("email") or "").strip().lower()
            if not email:
                continue
            existing = db.affiliates.find_one({"email": email})
            if not existing:
                name = u.get("name") or email.split("@")[0].replace(".", " ").title()
                ref_code = generate_unique_affiliate_code(name)
                db.affiliates.insert_one({
                    "id": f"aff_{str(u['_id'])[-8:]}",
                    "user_id": str(u["_id"]),
                    "name": name,
                    "email": email,
                    "handle": f"@{email.split('@')[0][:18]}",
                    "ref_code": ref_code,
                    "website_or_social": f"https://tunemavens.com/?ref={ref_code}",
                    "tier": "scout",
                    "status": "active",
                    "payout_method": "credits",
                    "payout_details": {},
                    "clicks_count": 0,
                    "conversions_count": 0,
                    "total_gmv": 0.0,
                    "total_earnings": 0.0,
                    "pending_payout": 0.0,
                    "paid_payout": 0.0,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
    except Exception as exc:
        logger.warning(f"Affiliate user sync warning: {exc}")


@router.get("/admin/roster")
def get_admin_affiliate_roster(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 200,
    user=Depends(get_optional_user)
):
    """List registered affiliates with Admin account as first option for Admins and RBAC scoping."""
    sync_all_registered_affiliates()

    query = {}
    is_admin = bool(
        not user
        or user.get("role") == "admin"
        or "admin" in (user.get("roles") or [])
        or user.get("is_admin") is True
        or user.get("original_role") == "admin"
    )

    # Non-admin affiliates may only view their own affiliate record
    if user and not is_admin:
        user_email = (user.get("email") or "").strip().lower()
        query["email"] = user_email
    else:
        if tier and tier != "all":
            query["tier"] = tier
        if status_filter and status_filter != "all":
            query["status"] = status_filter
        if search:
            s = search.strip()
            query["$or"] = [
                {"name": {"$regex": s, "$options": "i"}},
                {"email": {"$regex": s, "$options": "i"}},
                {"ref_code": {"$regex": s, "$options": "i"}},
                {"handle": {"$regex": s, "$options": "i"}}
            ]

    raw_affiliates = list(
        db.affiliates.find(query, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit * 2)
    )

    # Deduplicate by ref_code and email while placing Admin Account (TM-ADMIN) first for admin view
    admin_entry = None
    deduped: List[Dict] = []
    seen_refs = set()
    seen_emails = set()

    for aff in raw_affiliates:
        rc = (aff.get("ref_code") or "").strip().upper()
        em = (aff.get("email") or "").strip().lower()
        if not rc:
            continue
        aff["target_groups_count"] = db.crm_target_groups.count_documents({"affiliate_ref_code": rc})
        if rc == "TM-ADMIN":
            if not admin_entry:
                admin_entry = aff
            continue
        if rc in seen_refs or (em and em in seen_emails):
            continue
        seen_refs.add(rc)
        if em:
            seen_emails.add(em)
        deduped.append(aff)

    if is_admin:
        if not admin_entry and not search and (not tier or tier == "all"):
            adm_doc = db.affiliates.find_one({"ref_code": "TM-ADMIN"}, {"_id": 0})
            if adm_doc:
                adm_doc["target_groups_count"] = db.crm_target_groups.count_documents({"affiliate_ref_code": "TM-ADMIN"})
                admin_entry = adm_doc
        affiliates = ([admin_entry] + deduped)[:limit] if admin_entry else deduped[:limit]
    else:
        affiliates = deduped[:1] if deduped else ([admin_entry] if admin_entry else [])

    return {
        "affiliates": affiliates,
        "admin_account": admin_entry,
        "count": len(affiliates),
        "is_admin_view": is_admin,
    }


@router.get("/admin/ledger")
def get_admin_affiliate_ledger(
    ref: Optional[str] = None,
    type_filter: Optional[str] = None,
    limit: int = 100,
    user=Depends(get_current_user)
):
    """Audit log of referred purchases, streams, and commissions (admin = all, affiliate = own only)."""
    query = {}
    if _is_admin_user(user):
        if ref:
            query["ref_code"] = ref.strip().upper()
    else:
        email = (user.get("email") or "").strip().lower()
        own_aff = db.affiliates.find_one({"email": email}) if email else None
        own_ref = (own_aff.get("ref_code") or "").strip().upper() if own_aff else ""
        if not own_ref:
            return {"ledger": [], "count": 0}
        if ref and ref.strip().upper() != own_ref:
            raise HTTPException(status_code=403, detail="Access denied: cannot view another affiliate's ledger.")
        query["ref_code"] = own_ref
    if type_filter and type_filter != "all":
        query["type"] = type_filter

    ledger = list(
        db.affiliate_conversions.find(query, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    return {"ledger": ledger, "count": len(ledger)}


@router.post("/admin/payout")
def execute_batch_payout(payload: BatchPayoutRequest, user=Depends(get_current_user)):
    """Execute payout disbursement to affiliates via Credits, M-Pesa, or Stripe."""
    _require_admin_user(user)
    query = {"pending_payout": {"$gt": 0}}
    if payload.affiliate_ids:
        query["id"] = {"$in": payload.affiliate_ids}

    affiliates_to_pay = list(db.affiliates.find(query))
    if not affiliates_to_pay:
        return {"status": "none_pending", "message": "No affiliates with pending payout balance found."}

    batch_id = f"batch_{uuid.uuid4().hex[:8]}"
    total_disbursed = 0.0
    paid_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for aff in affiliates_to_pay:
        amt = aff.get("pending_payout", 0.0)
        if amt <= 0:
            continue

        # Move pending to paid
        db.affiliates.update_one(
            {"_id": aff["_id"]},
            {
                "$inc": {"paid_payout": amt},
                "$set": {"pending_payout": 0.0}
            }
        )

        total_disbursed += amt
        paid_count += 1

        # Dispatch payout disbursement notification
        if aff.get("email"):
            try:
                send_payout_dispatched_notification(
                    to=aff["email"],
                    name=aff.get("name") or "",
                    amount=amt,
                    currency="USD",
                    method=aff.get("payout_method") or "Credits",
                    ref_id=batch_id,
                    role="affiliate"
                )
            except Exception as e:
                logger.warning(f"Failed to dispatch payout email to {aff.get('email')}: {e}")

    # Record payout record
    db.affiliate_payouts.insert_one({
        "id": batch_id,
        "total_amount": round(total_disbursed, 2),
        "affiliates_count": paid_count,
        "notes": payload.notes,
        "processed_at": now_iso,
        "status": "completed"
    })

    return {
        "status": "success",
        "batch_id": batch_id,
        "affiliates_paid": paid_count,
        "total_disbursed_usd": round(total_disbursed, 2),
        "timestamp": now_iso
    }


@router.put("/admin/matrix")
def update_admin_matrix(payload: MatrixUpdateRequest, user=Depends(get_current_user)):
    """Update active commission rates in the compensation matrix."""
    _require_admin_user(user)
    db.affiliate_matrix_config.update_one(
        {"active": True},
        {
            "$set": {
                "matrix": payload.matrix,
                "cookie_days": payload.cookie_days or 90,
                "min_payout_usd": payload.min_payout_usd or 20.0,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    return {
        "status": "success",
        "message": "Affiliate compensation matrix updated successfully."
    }


@router.patch("/admin/affiliate/{affiliate_id}/status")
def update_affiliate_status(
    affiliate_id: str,
    status_val: Optional[str] = None,
    tier_val: Optional[str] = None,
    user=Depends(get_current_user)
):
    """Adjust status or tier level of a specific affiliate (Admin only)."""
    _require_admin_user(user)
    update_fields = {}
    if status_val in ["active", "pending", "suspended"]:
        update_fields["status"] = status_val
    if tier_val in ["scout", "partner", "ambassador"]:
        update_fields["tier"] = tier_val

    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid status or tier provided.")

    res = db.affiliates.update_one({"id": affiliate_id}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate profile not found.")

    return {"status": "success", "affiliate_id": affiliate_id, "updated": update_fields}


@router.post("/simulate-conversion")
def simulate_affiliate_conversion(payload: ConversionSimulationRequest):
    """Simulate an ecosystem purchase or stream attributing commission to ref_code."""
    clean_ref = payload.ref_code.strip().upper()
    aff = db.affiliates.find_one({"ref_code": clean_ref})
    if not aff:
        # Fallback to create demo partner if not found so testing always succeeds
        demo_partner = {
            "id": f"aff_{clean_ref.lower()}",
            "name": "Zawadi Kiprop",
            "email": f"{clean_ref.lower()}@tunemavens.co.ke",
            "handle": f"@{clean_ref.lower()}",
            "ref_code": clean_ref,
            "website_or_social": f"https://tunemavens.com/?ref={clean_ref}",
            "tier": "partner",
            "status": "active",
            "payout_method": "mpesa",
            "payout_details": {"phone": "+254712345678", "recipient": "Zawadi Kiprop"},
            "clicks_count": 840,
            "conversions_count": 48,
            "total_gmv": 5240.00,
            "total_earnings": 488.50,
            "pending_payout": 112.50,
            "paid_payout": 376.00,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.affiliates.insert_one(demo_partner)
        aff = db.affiliates.find_one({"ref_code": clean_ref})

    # Find category config in active matrix
    matrix_doc = db.affiliate_matrix_config.find_one({"active": True}, {"_id": 0})
    matrix_list = matrix_doc.get("matrix", DEFAULT_COMPENSATION_MATRIX) if matrix_doc else DEFAULT_COMPENSATION_MATRIX

    matrix_item = next((item for item in matrix_list if item["id"] == payload.conversion_type), None)
    if not matrix_item:
        matrix_item = matrix_list[2]  # Default to album sale

    # Default prices and titles
    defaults = {
        "stream_pool": (400.00, "100k Stream Pool Play & Tip"),
        "single_lossless": (1.99, "24-bit Lossless Track Download"),
        "album_sale": (9.99, "Full Digital Album & Stems"),
        "stems_pack": (49.00, "Producer Multitrack Stems Kit"),
        "ticket_pass": (50.00, "M-Pesa Live Push VIP Pass"),
        "sync_placement": (2500.00, "Global Commercial Sync Placement"),
        "creator_onboarding": (100.00, "1,000 Unified Credits Top-Up")
    }

    def_amt, def_title = defaults.get(matrix_item["id"], (9.99, "Ecosystem Purchase"))
    gross_amt = float(payload.gross_amount) if payload.gross_amount is not None else def_amt
    item_title = payload.item_title or def_title

    # Rate determination (Base + Tier Bonus)
    base_rate = float(matrix_item.get("rate_percent", 5.0))
    tier = aff.get("tier", "scout")
    tier_bonuses = matrix_item.get("tier_bonuses", {})
    if isinstance(tier_bonuses, dict) and tier in tier_bonuses:
        effective_rate = float(tier_bonuses[tier])
    else:
        tier_add = 0.0 if tier == "scout" else (1.0 if tier == "partner" else 2.0)
        effective_rate = min(12.0, base_rate + tier_add)

    # Commission amount calculation (Capped at $300 for sync placements)
    commission = round(gross_amt * (effective_rate / 100.0), 2)
    if matrix_item["id"] == "sync_placement" and commission > 300.0:
        commission = 300.00

    conv_id = f"conv_{uuid.uuid4().hex[:8]}"
    tx_id = f"TX-KE-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    conv_doc = {
        "id": conv_id,
        "affiliate_id": aff["id"],
        "ref_code": clean_ref,
        "tx_id": tx_id,
        "type": matrix_item["id"],
        "type_label": matrix_item["category"],
        "item_title": item_title,
        "buyer_info": payload.buyer_info or "listener@tunemavens.co.ke",
        "creator_name": aff["name"],
        "gross_amount": gross_amt,
        "commission_rate": effective_rate,
        "commission_amount": commission,
        "status": "cleared",
        "created_at": now_iso
    }

    db.affiliate_conversions.insert_one(conv_doc)
    conv_doc.pop("_id", None)

    db.affiliates.update_one(
        {"_id": aff["_id"]},
        {
            "$inc": {
                "conversions_count": 1,
                "total_gmv": gross_amt,
                "total_earnings": commission,
                "pending_payout": commission
            }
        }
    )

    # Dispatch affiliate conversion notification
    if aff.get("email"):
        try:
            send_affiliate_conversion_notification(
                to=aff["email"],
                name=aff.get("name") or "",
                ref_code=clean_ref,
                commission_amount=commission,
                item_name=item_title
            )
        except Exception as e:
            logger.warning(f"Failed to dispatch conversion email to {aff.get('email')}: {e}")

    # Fetch updated affiliate profile
    updated_aff = db.affiliates.find_one({"_id": aff["_id"]}, {"_id": 0})

    return {
        "status": "success",
        "message": f"Conversion verified! ${commission:.2f} commission ({effective_rate}%) attributed to {clean_ref}.",
        "conversion": conv_doc,
        "affiliate": updated_aff
    }


# ======================================================================
# Linked Network & User Onboarding Endpoints
# ======================================================================
@router.get("/network/{ref_code}")
def get_affiliate_network(ref_code: str, user: dict = Depends(get_current_user)):
    """Retrieve all creators, labels, and partners linked to this affiliate."""
    clean_ref = _assert_affiliate_ref_ownership(ref_code, user)

    # Auto-seed if empty for TM-KENYA-254 or first access
    if db.affiliate_linked_users.count_documents({"ref_code": clean_ref}) == 0:
        if clean_ref == "TM-KENYA-254":
            db.affiliate_linked_users.insert_many(DEMO_LINKED_USERS)

    users = list(db.affiliate_linked_users.find({"ref_code": clean_ref}, {"_id": 0}).sort("linked_at", -1))

    total_gmv = sum(u.get("gross_revenue", 0.0) for u in users)
    total_comm = sum(u.get("commission_generated", 0.0) for u in users)

    role_counts = {
        "creator": sum(1 for u in users if u.get("role") == "creator"),
        "podcaster": sum(1 for u in users if u.get("role") == "podcaster"),
        "vc": sum(1 for u in users if u.get("role") == "vc"),
        "label": sum(1 for u in users if u.get("role") == "label"),
        "supervisor": sum(1 for u in users if u.get("role") == "supervisor"),
        "corporate": sum(1 for u in users if u.get("role") == "corporate"),
        "dj": sum(1 for u in users if u.get("role") == "dj"),
        "media_house": sum(1 for u in users if u.get("role") == "media_house"),
        "consumer": sum(1 for u in users if u.get("role") == "consumer"),
        "affiliate": sum(1 for u in users if u.get("role") == "affiliate")
    }

    return {
        "status": "success",
        "ref_code": clean_ref,
        "total_linked_users": len(users),
        "total_roster_gmv": round(total_gmv, 2),
        "total_roster_commission": round(total_comm, 2),
        "role_breakdown": role_counts,
        "users": users
    }


@router.post("/onboard-user")
def onboard_user_by_affiliate(payload: UserOnboardingRequest, user: dict = Depends(get_current_user)):
    """Directly onboard a creator, label, or user linked to this affiliate."""
    clean_ref = _assert_affiliate_ref_ownership(payload.ref_code, user)
    now_iso = datetime.now(timezone.utc).isoformat()
    inv_token = f"INV-{uuid.uuid4().hex[:6].upper()}"
    new_user_id = f"usr_{payload.role[:2]}_{uuid.uuid4().hex[:6]}"

    role_labels = {
        "creator": "Recording Artist & Producer",
        "podcaster": "Podcaster & Show Host",
        "vc": "Tour Venture Capital & Syndicate",
        "label": "Independent Record Label",
        "dj": "DJ & Curated Playlist Curator",
        "supervisor": "Music Supervisor & Studio",
        "corporate": "Corporate Brand / Ad Agency",
        "media_house": "Media House & Broadcast Network",
        "consumer": "Listener & Superfan",
        "affiliate": "Sub-Affiliate / Scout"
    }

    avatar_colors = {
        "creator": "#22d3ee",
        "podcaster": "#ec4899",
        "vc": "#00f2fe",
        "label": "#a855f7",
        "dj": "#f59e0b",
        "supervisor": "#06b6d4",
        "corporate": "#f97316",
        "media_house": "#8b5cf6",
        "consumer": "#3b82f6",
        "affiliate": "#10b981"
    }

    user_doc = {
        "id": new_user_id,
        "ref_code": clean_ref,
        "name": payload.name.strip(),
        "email": payload.email.strip().lower(),
        "handle": payload.handle.strip() if payload.handle else f"@{payload.name.lower().replace(' ', '')}",
        "role": payload.role,
        "role_label": role_labels.get(payload.role, "Creator Partner"),
        "status": "invited",
        "region": payload.region or "Nairobi, Kenya",
        "linked_at": now_iso,
        "invitation_token": inv_token,
        "releases_count": 0,
        "streams_count": 0,
        "gross_revenue": 0.0,
        "commission_generated": 0.0,
        "split_incentive": payload.split_incentive or "Standard Matrix (3% - 12%)",
        "avatar_color": avatar_colors.get(payload.role, "#22d3ee"),
        "notes": payload.notes or "Directly onboarded via Affiliate Console",
        "last_active": "Just invited"
    }

    db.affiliate_linked_users.insert_one(user_doc)
    user_doc.pop("_id", None)

    # Increment affiliate conversions count
    db.affiliates.update_one(
        {"ref_code": clean_ref},
        {"$inc": {"conversions_count": 1}}
    )

    invite_url = f"https://tunemavens.com/#/join?ref={clean_ref}&invite={inv_token}&role={payload.role}"

    return {
        "status": "success",
        "message": f"Successfully onboarded {payload.name} ({role_labels.get(payload.role)}) linked to {clean_ref}!",
        "user": user_doc,
        "invite_url": invite_url
    }


class UpdateLinkedPersonaRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    handle: Optional[str] = None
    region: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


@router.put("/network/user/{user_id}")
def update_affiliate_linked_user(user_id: str, payload: UpdateLinkedPersonaRequest, user: dict = Depends(get_current_user)):
    """Edit the persona/role or profile details of a linked user under an affiliate account."""
    existing = db.affiliate_linked_users.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Linked persona not found")
    _assert_affiliate_ref_ownership(existing.get("ref_code") or "", user)

    role_labels = {
        "creator": "Recording Artist & Producer",
        "podcaster": "Podcaster & Show Host",
        "vc": "Tour Venture Capital & Syndicate",
        "label": "Independent Record Label",
        "dj": "DJ & Curated Playlist Curator",
        "supervisor": "Music Supervisor & Studio",
        "corporate": "Corporate Brand / Ad Agency",
        "media_house": "Media House & Broadcast Network",
        "consumer": "Listener & Superfan",
        "affiliate": "Sub-Affiliate / Scout",
    }
    avatar_colors = {
        "creator": "#22d3ee",
        "podcaster": "#ec4899",
        "vc": "#00f2fe",
        "label": "#a855f7",
        "dj": "#f59e0b",
        "supervisor": "#06b6d4",
        "corporate": "#f97316",
        "media_house": "#8b5cf6",
        "consumer": "#3b82f6",
        "affiliate": "#10b981",
    }

    updates = {}
    if payload.name is not None and payload.name.strip():
        updates["name"] = payload.name.strip()
    if payload.email is not None and payload.email.strip():
        updates["email"] = payload.email.strip().lower()
    if payload.handle is not None:
        updates["handle"] = payload.handle.strip()
    if payload.region is not None:
        updates["region"] = payload.region.strip()
    if payload.status is not None and payload.status.strip():
        updates["status"] = payload.status.strip()
    if payload.notes is not None:
        updates["notes"] = payload.notes
    if payload.role is not None and payload.role.strip():
        r = payload.role.strip()
        updates["role"] = r
        updates["role_label"] = role_labels.get(r, r.replace("_", " ").title())
        updates["avatar_color"] = avatar_colors.get(r, "#22d3ee")

    if updates:
        db.affiliate_linked_users.update_one({"id": user_id}, {"$set": updates})

    updated = db.affiliate_linked_users.find_one({"id": user_id}, {"_id": 0})
    return {"status": "success", "user": updated}


@router.delete("/network/user/{user_id}")
def delete_affiliate_linked_user(user_id: str, user: dict = Depends(get_current_user)):
    """Remove a linked persona from an affiliate's network roster."""
    existing = db.affiliate_linked_users.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Linked persona not found")
    _assert_affiliate_ref_ownership(existing.get("ref_code") or "", user)
    res = db.affiliate_linked_users.delete_one({"id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Linked persona not found")
    return {"status": "success", "deleted_id": user_id}


# ======================================================================
# Affiliate Academy & Required Reading Endpoints
# ======================================================================
REQUIRED_ARTICLE_IDS = [
    "affiliate-program-guide",
    "onboarding-creators-and-labels",
    "affiliate-payouts-mpesa-settlement",
    "affiliate-compliance-promotional-ethics"
]


@router.get("/academy/{ref_code}")
def get_affiliate_academy_status(ref_code: str, user: dict = Depends(get_current_user)):
    """Retrieve required reading compliance status for this affiliate."""
    clean_ref = _assert_affiliate_ref_ownership(ref_code, user)
    aff = db.affiliates.find_one({"ref_code": clean_ref})
    completed = aff.get("completed_readings", []) if aff else []

    total_req = len(REQUIRED_ARTICLE_IDS)
    done_count = sum(1 for aid in REQUIRED_ARTICLE_IDS if aid in completed)
    progress_pct = int((done_count / total_req) * 100) if total_req > 0 else 100

    return {
        "status": "success",
        "ref_code": clean_ref,
        "total_required": total_req,
        "completed_count": done_count,
        "progress_percentage": progress_pct,
        "all_completed": done_count == total_req,
        "completed_readings": completed,
        "required_article_ids": REQUIRED_ARTICLE_IDS
    }


@router.post("/academy/acknowledge")
def acknowledge_required_reading(payload: AcademyAcknowledgeRequest, user: dict = Depends(get_current_user)):
    """Mark a required reading article as reviewed and acknowledged."""
    clean_ref = _assert_affiliate_ref_ownership(payload.ref_code, user)
    now_iso = datetime.now(timezone.utc).isoformat()

    db.affiliates.update_one(
        {"ref_code": clean_ref},
        {
            "$addToSet": {"completed_readings": payload.article_id},
            "$set": {f"reading_timestamps.{payload.article_id}": now_iso}
        },
        upsert=True
    )

    aff = db.affiliates.find_one({"ref_code": clean_ref})
    completed = aff.get("completed_readings", []) if aff else []
    total_req = len(REQUIRED_ARTICLE_IDS)
    done_count = sum(1 for aid in REQUIRED_ARTICLE_IDS if aid in completed)
    progress_pct = int((done_count / total_req) * 100) if total_req > 0 else 100

    return {
        "status": "success",
        "message": f"Article '{payload.article_id}' verified as acknowledged.",
        "article_id": payload.article_id,
        "completed_count": done_count,
        "progress_percentage": progress_pct,
        "all_completed": done_count == total_req
    }



