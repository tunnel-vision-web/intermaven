"""Smart CRM Campaign Reachout, Affiliate Attribution & Dual-Notification Service.

Implements:
1. Email-only target group validation (strictly no phone numbers, SMS, or WhatsApp).
2. Tracked per-recipient reachout links tied to the initiating affiliate account.
3. Event email rendering with direct RSVP and/or Buy Ticket CTAs + new-user onboarding CTA.
4. Full-funnel affiliate attribution (clicks -> RSVPs -> user onboarding -> platform spend).
5. Dual notifications to the initiating affiliate: In-App Inbox (`db.user_inbox`) AND
   their registered email address on file (`account_setup.send_email`).
"""
from __future__ import annotations

import csv
import io
import json
import logging
import os
import re
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote

from config import db

logger = logging.getLogger("tunemavens.reachout")

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
FORBIDDEN_CHANNELS = {"sms", "text", "whatsapp", "phone", "call"}
PUBLIC_APP_URL = os.environ.get("PUBLIC_APP_URL", "http://localhost:3000").rstrip("/")

# Intelligent Persona Playbooks: tailored onboarding, EPK creation & catalogue ingestion
PERSONA_PLAYBOOKS: Dict[str, Dict[str, Any]] = {
    "creator": {
        "persona": "creator",
        "label": "Recording Artist, Songwriter & Producer",
        "supports_epk": True,
        "supports_catalog": True,
        "default_subject": "{{name}}, Launch Your Official TuneMavens EPK & Ingest Your Catalogue (90% Sync Payouts)",
        "subject_variants": [
            "{{name}}, Claim Your Official EPK Web World & Pre-Clear Your Stems for Global Sync",
            "Welcome {{name}} — Keep 100% Publishing & Stream in 24-Bit Lossless on TuneMavens",
        ],
        "default_body": (
            "Hi {{name}},\n\n"
            "We'd love to welcome you to TuneMavens — the unified operating system built for African and diaspora artists, songwriters, and producers.\n\n"
            "In minutes you can:\n"
            "• Build your official Creator EPK Web World with custom subdomain, press kit, and tour calendar\n"
            "• Ingest your singles, albums, and multitrack stems with automated TuneLedger split cascades\n"
            "• Pitch pre-cleared cues on SyncMavens (90% direct creator payout, 100% publishing retained) and sell lossless masters on TuneStream"
        ),
        "cta_label": "Onboard, Build EPK & Ingest Catalogue",
        "cta_url": "/for/creator",
        "highlights": [
            "Official Creator EPK Web World with live booking & press vault",
            "1-click single, album & stems catalogue ingestion with split cascades",
            "90% direct sync placement payouts + 24-bit lossless streaming revenue",
        ],
    },
    "dj": {
        "persona": "dj",
        "label": "DJ & Mix Curator",
        "supports_epk": True,
        "supports_catalog": True,
        "default_subject": "{{name}}, Monetize Your DJ Mixes Legally & Launch Your Official DJ EPK",
        "subject_variants": [
            "{{name}}, Unlock the 24-Bit DJ Pool & Sell Cleared Mixes on TuneStream",
            "Official DJ Invitation for {{name}} — Automated Tracklist Clearance & Arena Booking EPK",
        ],
        "default_body": (
            "Hi {{name}},\n\n"
            "You're invited to join TuneMavens as an Official DJ & Curator.\n\n"
            "Here's what unlocks immediately when you onboard:\n"
            "• Launch your DJ Press Kit (EPK) for festival, club, and corporate bookings\n"
            "• Ingest your DJ mixes with automated tracklist rights clearance so you can legally sell lossless downloads while splitting royalties fairly with underlying artists\n"
            "• Download club-ready 24-bit WAV/FLAC promos and stems from the TuneMavens DJ Pool"
        ),
        "cta_label": "Onboard, Launch DJ EPK & Upload Mixes",
        "cta_url": "/for/dj",
        "highlights": [
            "Official DJ EPK with live set showcase & booking rider",
            "Legal DJ Mix ingestion with automated TuneLedger rights clearance",
            "24-bit lossless DJ Pool crate access",
        ],
    },
    "label": {
        "persona": "label",
        "label": "Record Label & Distributor",
        "supports_epk": True,
        "supports_catalog": True,
        "default_subject": "{{name}}, Bulk-Ingest Your Label Roster Catalogue & Automate Split Cascades",
        "subject_variants": [
            "{{name}}, Modernize Your Label Operations: Bulk DDEX/CSV Ingest & Roster EPKs",
        ],
        "default_body": (
            "Hello {{name}},\n\n"
            "TuneMavens gives independent record labels and distributors enterprise-grade catalogue, sync, and royalty infrastructure:\n\n"
            "• Bulk-ingest your entire back catalogue & stems via CSV/ZIP wizard in minutes\n"
            "• Provision official EPK Web Worlds for every artist on your roster\n"
            "• Automate transparent recoupment waterfalls and multi-party TuneLedger split cascades across streaming, sync, and live ticketing"
        ),
        "cta_label": "Onboard Label & Bulk-Ingest Catalogue",
        "cta_url": "/for/label",
        "highlights": [
            "Bulk roster catalogue & stem ingestion engine",
            "Multi-artist EPK studio & team seat management",
            "Automated recoupment & TuneLedger split cascades",
        ],
    },
    "podcaster": {
        "persona": "podcaster",
        "label": "Podcaster & Show Host",
        "supports_epk": True,
        "supports_catalog": True,
        "default_subject": "{{name}}, Launch Your Show EPK, Ingest Episodes & Unlock Brand Audio Sponsorships",
        "subject_variants": [
            "{{name}}, Monetize Your Podcast with Direct Corporate Ad Flights on TuneMavens",
        ],
        "default_body": (
            "Hi {{name}},\n\n"
            "Bring your podcast into the TuneMavens audio ecosystem:\n\n"
            "• Create an official Show EPK to attract guests, syndicators, and corporate sponsors\n"
            "• Ingest episodes with broadcast-ready -16 LUFS mastering and licensed Afro-centric intro/outro beds\n"
            "• Opt into automated Corporate Brand Ad Flights and listener micro-tipping"
        ),
        "cta_label": "Launch Show EPK & Ingest Episodes",
        "cta_url": "/for/podcaster",
        "highlights": [
            "Official Podcaster EPK & guest booking CRM",
            "Episode catalogue ingestion with -16 LUFS mastering",
            "Direct corporate brand audio sponsorship marketplace",
        ],
    },
    "supervisor": {
        "persona": "supervisor",
        "label": "Music Supervisor, Film/TV & Sync Buyer",
        "supports_epk": False,
        "supports_catalog": False,
        "default_subject": "{{name}}, Complimentary VIP Supervisor Access: One-Stop Pre-Cleared African & Diaspora Stems",
        "subject_variants": [
            "{{name}}, Clear Broadcast & Film Cues in Minutes on SyncMavens (Zero Platform Fees)",
        ],
        "default_body": (
            "Dear {{name}},\n\n"
            "As a Music Supervisor or Licensing Executive, your TuneMavens account is permanently credit-exempt.\n\n"
            "• Post confidential sync briefs and receive AI-matched, one-stop pre-cleared masters & isolated stems\n"
            "• Download 24-bit WAV stems with verified chain-of-title and instant SHA-256 license execution\n"
            "• Save your sonic preferences and project folders for instant recall on future productions"
        ),
        "cta_label": "Activate VIP Supervisor Desk",
        "cta_url": "/for/supervisor",
        "highlights": [
            "100% credit-exempt VIP supervisor seat",
            "One-stop pre-cleared masters & multitrack WAV stems",
            "Instant SHA-256 sync license & chain-of-title verification",
        ],
    },
    "corporate": {
        "persona": "corporate",
        "label": "Corporate Brand & Ad Agency",
        "supports_epk": False,
        "supports_catalog": False,
        "default_subject": "{{name}}, Reach Engaged Music & Podcast Audiences with TuneMavens Brand Audio Flights",
        "subject_variants": [
            "{{name}}, Commission Authentic Sonic Branding & Cultural Audio Campaigns",
        ],
        "default_body": (
            "Hello {{name}},\n\n"
            "Connect your brand with high-intent listeners across East Africa and the global diaspora on TuneMavens:\n\n"
            "• Launch targeted audio ad flights across TuneStream music channels and top regional podcasts\n"
            "• License pre-cleared commercial sync tracks directly from verified creators\n"
            "• Track real-time impressions, completion rates, and Tour Sponsorship ROI"
        ),
        "cta_label": "Onboard Brand & View Ad Rates",
        "cta_url": "/for/corporate",
        "highlights": [
            "Targeted audio ad flights across music & podcasts",
            "Direct commercial sync & sonic branding clearance",
            "Live campaign telemetry & transparent rate card",
        ],
    },
    "media_house": {
        "persona": "media_house",
        "label": "Radio, TV & Broadcast Media House",
        "supports_epk": False,
        "supports_catalog": True,
        "default_subject": "{{name}}, Automate Broadcast Music Servicing & PRO Cue Sheets on TuneMavens",
        "subject_variants": [
            "{{name}}, Direct Broadcast-Ready WAV Servicing & Syndication Hub",
        ],
        "default_body": (
            "Hello {{name}},\n\n"
            "Streamline broadcast music acquisition and compliance with TuneMavens Media House Operations:\n\n"
            "• Receive broadcast-ready clean masters and syndicated shows directly into your station crate\n"
            "• Automate PRO cue sheet logging and commercial ad traffic scheduling\n"
            "• Connect directly with verified labels, podcasters, and regional talent"
        ),
        "cta_label": "Activate Broadcast Media Desk",
        "cta_url": "/for/media-house",
        "highlights": [
            "Direct clean broadcast master & show ingestion",
            "Automated PRO cue sheet & playout reporting",
            "Syndication & commercial traffic workspace",
        ],
    },
    "vc": {
        "persona": "vc",
        "label": "Tour Venture Capital & Catalogue Investor",
        "supports_epk": False,
        "supports_catalog": False,
        "default_subject": "{{name}}, Institutional LP Invitation: Tour Capital Vault & Catalogue Royalty Yields",
        "subject_variants": [
            "{{name}}, Underwrite Data-Backed Live Tours & Verified Music Catalogues on TuneMavens",
        ],
        "default_body": (
            "Dear {{name}},\n\n"
            "You are invited to access the TuneMavens Tour Capital & Catalogue Acquisition Vault (permanently credit-exempt for Institutional LPs):\n\n"
            "• Review live streaming, ticketing, and superfan geo-demand telemetry before underwriting tours or catalogue acquisitions\n"
            "• Automated priority recoupment via TuneLedger smart split cascades on every ticket, stream, and sync fee"
        ),
        "cta_label": "Activate Institutional LP Access",
        "cta_url": "/for/vc",
        "highlights": [
            "Credit-exempt Institutional LP deal room",
            "Verified box-office & streaming diligence telemetry",
            "Automated priority recoupment via TuneLedger split cascades",
        ],
    },
    "affiliate": {
        "persona": "affiliate",
        "label": "Affiliate Partner, Curator & Influencer",
        "supports_epk": False,
        "supports_catalog": False,
        "default_subject": "{{name}}, Earn 3%–12% Recurring Ecosystem Commissions as a TuneMavens Partner",
        "subject_variants": [
            "{{name}}, Claim Your Vanity Partner Code & Instant M-Pesa / Stripe Payouts",
        ],
        "default_body": (
            "Hi {{name}},\n\n"
            "Turn your cultural influence and industry network into recurring revenue with the TuneMavens Partner Programme:\n\n"
            "• Claim your unique 90-day tracking code and Smart CRM email reachout suite\n"
            "• Earn 3% to 12% across ticket sales, creator credit reloads, lossless albums, stems, and sync placements\n"
            "• Receive real-time In-App Inbox + Email alerts and withdraw via M-Pesa, Stripe, or Credits"
        ),
        "cta_label": "Join Partner Programme & Claim Code",
        "cta_url": "/affiliates",
        "highlights": [
            "3%–12% multi-stream commission matrix (90-day attribution)",
            "Built-in Smart CRM Reachout & live conversion ledger",
            "Instant M-Pesa, Stripe & Unified Credits settlements",
        ],
    },
    "consumer": {
        "persona": "consumer",
        "label": "Audiophile Listener & Live Music Fan",
        "supports_epk": False,
        "supports_catalog": False,
        "default_subject": "{{name}}, Stream 24-Bit Lossless African Music & Unlock Priority Concert Passes",
        "subject_variants": [
            "Welcome {{name}} — Save Your Music Taste for Personalized Mixes & VIP Event RSVPs",
        ],
        "default_body": (
            "Hey {{name}},\n\n"
            "Experience music the way artists intended on TuneStream & TuneMavens:\n\n"
            "• Stream authentic African & diaspora singles, albums, and DJ mixes in crystal-clear audio\n"
            "• Save your favorite genres, artists, and city for priority concert RSVPs and digital QR passes\n"
            "• Support your favorite creators directly with 1-tap transparent micro-tipping"
        ),
        "cta_label": "Join Free & Save Music Preferences",
        "cta_url": "/for/consumer",
        "highlights": [
            "Personalized genre, artist & city recommendations",
            "1-tap concert RSVPs & digital QR ticket wallet",
            "Lossless streaming & direct artist micro-support",
        ],
    },
}


def validate_email_address(email: str) -> str:
    """Validate and normalize an email address."""
    clean = (email or "").strip().lower()
    if not clean or not EMAIL_REGEX.match(clean):
        raise ValueError(f"Invalid email address: '{email}'")
    return clean


def assert_email_only_channels(channels: Optional[List[str]]) -> List[str]:
    """Ensure no SMS/text/WhatsApp channels are requested for Smart CRM reachouts."""
    requested = [c.strip().lower() for c in (channels or ["email"]) if c and c.strip()]
    blocked = [c for c in requested if c in FORBIDDEN_CHANNELS]
    if blocked:
        raise ValueError(
            f"Unsupported reachout channel(s): {', '.join(blocked)}. "
            "Smart CRM reachouts use email only (no SMS/text or WhatsApp to avoid messaging costs and WhatsApp flagging)."
        )
    if not requested:
        return ["email"]
    return requested


def resolve_initiator_affiliate(
    current_user: Optional[dict] = None,
    affiliate_ref_code: Optional[str] = None,
    initiator_email: Optional[str] = None,
    initiator_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Resolve the affiliate account initiating a Smart CRM reachout.

    Lookup priority:
    1. Explicit `affiliate_ref_code` in `db.affiliates`
    2. Authenticated `current_user`'s email in `db.affiliates`
    3. Explicit `initiator_email` in `db.affiliates`
    4. If a user/email is provided without an existing affiliate row, auto-provision
       an active affiliate tracking record so their reachouts are always attributed.
    """
    aff = None
    if affiliate_ref_code:
        clean_ref = affiliate_ref_code.strip().upper()
        aff = db.affiliates.find_one({"ref_code": clean_ref})

    user_email = None
    user_name = None
    user_id = None
    if current_user:
        user_id = str(current_user.get("_id", "")) or current_user.get("id")
        user_email = (current_user.get("email") or "").strip().lower() or None
        user_name = current_user.get("name") or current_user.get("username")

    resolved_email = (initiator_email or user_email or "").strip().lower() or None
    resolved_name = (initiator_name or user_name or "").strip() or None

    if not aff and resolved_email:
        aff = db.affiliates.find_one({"email": resolved_email})

    # If still not found, check if we have a ref_code or email to auto-create an affiliate record
    if not aff and (affiliate_ref_code or resolved_email):
        ref_code = (
            affiliate_ref_code.strip().upper()
            if affiliate_ref_code
            else f"TM-{secrets.token_hex(3).upper()}"
        )
        aff_email = resolved_email or f"{ref_code.lower()}@tunemavens.com"
        aff_name = resolved_name or (aff_email.split("@")[0].replace(".", " ").title())
        aff_id = f"aff_{uuid.uuid4().hex[:8]}"
        new_aff = {
            "id": aff_id,
            "user_id": user_id,
            "name": aff_name,
            "email": aff_email,
            "handle": f"@{re.sub(r'[^a-z0-9]', '', aff_name.lower())[:16] or 'affiliate'}",
            "ref_code": ref_code,
            "website_or_social": f"{PUBLIC_APP_URL}/?ref={ref_code}",
            "tier": "scout",
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
        }
        db.affiliates.insert_one(new_aff)
        aff = db.affiliates.find_one({"id": aff_id})

    # Fallback: resolve user_id from db.users if affiliate exists
    if aff and not user_id and aff.get("email"):
        u = db.users.find_one({"email": aff["email"].strip().lower()})
        if u:
            user_id = str(u["_id"])

    if not aff:
        return {
            "affiliate_id": None,
            "ref_code": None,
            "name": resolved_name or "TuneMavens Growth Team",
            "email": resolved_email,
            "user_id": user_id,
        }

    return {
        "affiliate_id": aff.get("id") or str(aff.get("_id")),
        "ref_code": aff.get("ref_code"),
        "name": aff.get("name") or resolved_name or "Affiliate Partner",
        "email": (aff.get("email") or resolved_email or "").strip().lower() or None,
        "user_id": user_id or aff.get("user_id"),
    }


def notify_affiliate_of_action(
    affiliate_ref_code: Optional[str],
    action_type: str,
    subject: str,
    body_text: str,
    cta_label: str = "Open Affiliate Dashboard",
    cta_url: str = "/dashboard",
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Notify the initiating affiliate in BOTH their In-App Inbox AND their registered email on file.

    Returns a summary dict with `inbox_id`, `email_status`, and `affiliate_email`.
    """
    if not affiliate_ref_code:
        return {"notified": False, "reason": "no_affiliate_ref"}

    clean_ref = affiliate_ref_code.strip().upper()
    aff = db.affiliates.find_one({"ref_code": clean_ref})
    if not aff:
        return {"notified": False, "reason": "affiliate_not_found"}

    aff_email = (aff.get("email") or "").strip().lower()
    aff_name = aff.get("name") or "Affiliate Partner"
    aff_id = aff.get("id") or str(aff.get("_id"))

    # Find linked platform user_id so it appears in their authenticated In-App Inbox
    target_user_id = aff.get("user_id")
    if not target_user_id and aff_email:
        u = db.users.find_one({"email": aff_email})
        if u:
            target_user_id = str(u["_id"])

    now = datetime.now(timezone.utc)
    inbox_doc = {
        "user_id": target_user_id or aff_id,
        "affiliate_id": aff_id,
        "affiliate_ref_code": clean_ref,
        "user_email": aff_email,
        "sender": "TuneMavens Smart CRM Affiliate Tracker",
        "subject": subject,
        "body": body_text,
        "cta_label": cta_label,
        "cta_url": cta_url,
        "category": "affiliate_reachout",
        "action_type": action_type,
        "metadata": metadata or {},
        "read": False,
        "replies": [],
        "created_at": now,
    }
    res = db.user_inbox.insert_one(inbox_doc)
    inbox_id = str(res.inserted_id)

    email_status = "skipped_no_email"
    if aff_email:
        try:
            from account_setup import send_email, _email_wrapper, _button

            inner_html = f"""
            <div style="font-size: 18px; font-weight: 800; color: #22d3ee; margin-bottom: 12px;">{subject}</div>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.65; margin-bottom: 18px;">
              Hi {aff_name},<br><br>{body_text.replace(chr(10), '<br>')}
            </p>
            <div style="background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.22); border-radius: 3px; padding: 12px 14px; margin-bottom: 18px; font-size: 12px; color: #94a3b8;">
              <strong style="color: #22d3ee;">Affiliate Ref Code:</strong> {clean_ref} &nbsp;|&nbsp;
              <strong style="color: #22d3ee;">Event Type:</strong> {action_type.replace('_', ' ').title()}
            </div>
            <div>{_button(f"{PUBLIC_APP_URL}{cta_url}", cta_label, variant="primary")}</div>
            """
            wrapped = _email_wrapper(inner_html, subject, "affiliate")
            is_sandbox_or_test = bool(os.environ.get("PYTEST_CURRENT_TEST")) or aff_email.endswith("@example.com")
            if is_sandbox_or_test:
                now_ts = datetime.now(timezone.utc)
                comm_id = f"comm_{secrets.token_hex(8)}"
                db.communications.insert_one({
                    "id": comm_id,
                    "to": aff_email,
                    "recipient_name": aff_name,
                    "subject": subject,
                    "html": wrapped,
                    "text": body_text,
                    "channel": "email",
                    "provider": "resend",
                    "status": "simulated",
                    "event_type": f"affiliate_reachout_{action_type}",
                    "role": "affiliate",
                    "metadata": {"affiliate_id": aff_id, "ref_code": clean_ref, "action_type": action_type, "inbox_id": inbox_id},
                    "archived": False,
                    "created_at": now_ts,
                    "updated_at": now_ts,
                })
                db.email_outbox.insert_one({
                    "to": aff_email,
                    "subject": subject,
                    "html": wrapped,
                    "created_at": now_ts,
                    "status": "simulated",
                    "comm_id": comm_id,
                    "event_type": f"affiliate_reachout_{action_type}",
                    "role": "affiliate",
                })
                email_status = "simulated"
            else:
                email_status = send_email(
                    to=aff_email,
                    subject=subject,
                    html=wrapped,
                    text=f"Hi {aff_name},\n\n{body_text}\n\nAffiliate Ref: {clean_ref}",
                    event_type=f"affiliate_reachout_{action_type}",
                    role="affiliate",
                    recipient_name=aff_name,
                    metadata={
                        "affiliate_id": aff_id,
                        "ref_code": clean_ref,
                        "action_type": action_type,
                        "inbox_id": inbox_id,
                        **(metadata or {}),
                    },
                )
        except Exception as exc:
            logger.warning("Failed to email affiliate %s: %s", aff_email, exc)
            email_status = "failed"

    return {
        "notified": True,
        "inbox_id": inbox_id,
        "email_status": email_status,
        "affiliate_email": aff_email,
        "affiliate_ref_code": clean_ref,
    }


HTML_TAG_DETECTOR = re.compile(r"<(?:p|div|br|img|h[1-6]|ul|ol|li|strong|b|em|i|u|s|span|a|blockquote|hr|table|tr|td|th)\b", re.IGNORECASE)


def _sanitize_and_prepare_body_html(raw_body: str, is_preview: bool = False, app_url: str = "") -> str:
    """Render plain text or rich HTML email body safely with responsive image support."""
    if not raw_body:
        return ""

    # Strip dangerous script/iframe/object tags and inline JS event handlers
    cleaned = re.sub(r"<\s*(script|iframe|object|embed|form)[^>]*>.*?<\s*/\s*\1\s*>", "", raw_body, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r"<\s*(script|iframe|object|embed)\b[^>]*/?\s*>", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+on[a-zA-Z]+\s*=\s*(\"[^\"]*\"|'[^']*'|[^\s>]+)", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"javascript\s*:", "", cleaned, flags=re.IGNORECASE)

    has_html = bool(HTML_TAG_DETECTOR.search(cleaned))
    if not has_html:
        return cleaned.replace("\n", "<br>")

    base = (app_url or PUBLIC_APP_URL).rstrip("/")

    def _fix_img_tag(match: re.Match) -> str:
        tag = match.group(0)
        # Expand relative /uploads, /api/uploads, /api/crm/images, /headers, /heroes URLs for real external email dispatches
        if not is_preview and base:
            tag = re.sub(
                r'(\bsrc\s*=\s*["\'])(/(?:api/(?:uploads|crm/images)|uploads|headers|heroes)/[^"\']+)(["\'])',
                lambda m: f'{m.group(1)}{base}{m.group(2)}{m.group(3)}',
                tag,
                flags=re.IGNORECASE,
            )
        # Ensure responsive max-width styling so uploaded images fit email layouts cleanly
        if re.search(r"\bstyle\s*=", tag, flags=re.IGNORECASE):
            if "max-width" not in tag.lower():
                tag = re.sub(
                    r'(\bstyle\s*=\s*["\'])',
                    r"\1max-width:100%;height:auto;border-radius:3px;",
                    tag,
                    count=1,
                    flags=re.IGNORECASE,
                )
        else:
            tag = tag[:-1].rstrip("/") + ' style="max-width:100%;height:auto;border-radius:3px;display:block;margin:10px 0;" />'
        return tag

    cleaned = re.sub(r"<img\b[^>]*>", _fix_img_tag, cleaned, flags=re.IGNORECASE)
    if not is_preview and base:
        cleaned = re.sub(
            r'(\bhref\s*=\s*["\'])(/(?!/)[^"\']*)(["\'])',
            lambda m: f'{m.group(1)}{base}{m.group(2)}{m.group(3)}',
            cleaned,
            flags=re.IGNORECASE,
        )
    return cleaned


PERSONA_SECONDARY_CTAS: Dict[str, List[Tuple[str, str, str]]] = {
    "creator": [("sync", "Explore SyncMavens Briefs", "secondary")],
    "dj": [("dj_pool", "Browse 24-Bit DJ Pool", "secondary")],
    "label": [("splits", "Configure Split Cascades", "secondary")],
    "podcaster": [("ads", "View Brand Ad Sponsorships", "secondary")],
    "supervisor": [
        ("sync_brief", "Post Confidential Sync Brief", "emerald"),
        ("sync_catalog", "Audition Pre-Cleared 24-Bit Stems", "secondary"),
    ],
    "corporate": [
        ("ad_flight", "Launch Audio Ad Flight", "emerald"),
        ("sync_catalog", "License Commercial Sync Music", "secondary"),
    ],
    "media_house": [("broadcast", "Open PRO Cue Sheet & Playout Hub", "emerald")],
    "vc": [
        ("vc_vault", "Explore Tour Capital Vault", "emerald"),
        ("vc_yields", "Review Catalogue Royalty Yields", "secondary"),
    ],
    "affiliate": [
        ("affiliate_matrix", "View 3%–12% Commission Matrix", "emerald"),
        ("affiliate_crm", "Open Partner Reachout Suite", "secondary"),
    ],
    "consumer": [
        ("stream", "Stream 24-Bit Lossless Audio", "emerald"),
        ("events", "Browse Live Concerts & Passes", "secondary"),
    ],
}


def build_reachout_email_html(
    recipient_name: str,
    subject: str,
    rendered_body: str,
    reachout_token: str,
    promotion_type: str = "product_service",
    event_doc: Optional[Dict[str, Any]] = None,
    event_ctas: Optional[List[str]] = None,
    cta_label: str = "",
    cta_url: Optional[str] = None,
    product_name: Optional[str] = None,
    affiliate_name: Optional[str] = None,
    affiliate_ref_code: Optional[str] = None,
    target_persona: Optional[str] = None,
    include_epk_cta: bool = True,
    include_catalog_cta: bool = True,
    recipient_email: Optional[str] = None,
    is_preview: bool = False,
    app_origin: Optional[str] = None,
) -> Tuple[str, Dict[str, str]]:
    """Build rich email HTML, bottom CTA buttons, and compliance/preferences footer for a Smart CRM reachout.

    Supports:
    - `event`: Direct RSVP and/or Buy Ticket CTA buttons + Event Details button + Onboarding CTA button
    - `persona_intro`: Tailored Persona CTA buttons (Onboard, Launch EPK, Ingest Catalogue, and persona-specific actions)
    - `product_service`: Product/Service Primary CTA button + Contextual Ecosystem CTA button + Onboarding CTA button
    """
    from account_setup import _email_wrapper, _button

    effective_base_url = (app_origin.rstrip("/") if (is_preview and app_origin) else PUBLIC_APP_URL)
    base_reachout = f"{effective_base_url}/#/reachout/{reachout_token}"
    ref_qs = f"&ref={quote(affiliate_ref_code)}" if affiliate_ref_code else ""
    role_qs = f"&role={quote(target_persona)}" if target_persona else ""
    email_qs = f"&email={quote(recipient_email)}" if recipient_email else ""
    ev_id_val = str(event_doc.get("id") or "") if event_doc else ""
    ev_qs = f"&event_id={quote(ev_id_val)}" if ev_id_val else ""
    promo_qs = f"&promo={quote(promotion_type)}" if promotion_type else ""
    name_qs = f"&name={quote(recipient_name)}" if (is_preview and recipient_name) else ""

    urls: Dict[str, str] = {
        "primary": f"{base_reachout}?action=explore{ref_qs}{role_qs}{promo_qs}{name_qs}",
        "rsvp": f"{base_reachout}?action=rsvp{ref_qs}{ev_qs}{promo_qs}{email_qs}{name_qs}",
        "ticket": f"{base_reachout}?action=ticket{ref_qs}{ev_qs}{promo_qs}{email_qs}{name_qs}",
        "event_details": f"{base_reachout}?action=event{ref_qs}{ev_qs}{promo_qs}{email_qs}{name_qs}",
        "onboard": f"{base_reachout}?action=onboard{ref_qs}{role_qs}",
        "epk": f"{base_reachout}?action=epk{ref_qs}{role_qs}",
        "catalog": f"{base_reachout}?action=catalog{ref_qs}{role_qs}",
        "sync": f"{base_reachout}?action=sync{ref_qs}{role_qs}",
        "sync_brief": f"{base_reachout}?action=sync_brief{ref_qs}{role_qs}",
        "sync_catalog": f"{base_reachout}?action=sync_catalog{ref_qs}{role_qs}",
        "dj_pool": f"{base_reachout}?action=dj_pool{ref_qs}{role_qs}",
        "splits": f"{base_reachout}?action=splits{ref_qs}{role_qs}",
        "ads": f"{base_reachout}?action=ads{ref_qs}{role_qs}",
        "ad_flight": f"{base_reachout}?action=ad_flight{ref_qs}{role_qs}",
        "broadcast": f"{base_reachout}?action=broadcast{ref_qs}{role_qs}",
        "vc_vault": f"{base_reachout}?action=vc_vault{ref_qs}{role_qs}",
        "vc_yields": f"{base_reachout}?action=vc_yields{ref_qs}{role_qs}",
        "affiliate_matrix": f"{base_reachout}?action=affiliate_matrix{ref_qs}{role_qs}",
        "affiliate_crm": f"{base_reachout}?action=affiliate_crm{ref_qs}{role_qs}",
        "stream": f"{base_reachout}?action=stream{ref_qs}",
        "events": f"{base_reachout}?action=events{ref_qs}",
        "preferences": f"{base_reachout}?action=preferences{email_qs}{ref_qs}",
        "unsubscribe": f"{base_reachout}?action=unsubscribe{email_qs}{ref_qs}",
        "privacy": f"{effective_base_url}/#/privacy",
        "terms": f"{effective_base_url}/#/terms",
        "cookies": f"{effective_base_url}/#/cookies",
        "support": f"{effective_base_url}/#/support",
    }

    body_is_rich_html = bool(HTML_TAG_DETECTOR.search(rendered_body or ""))
    promo_block = ""
    cta_section_heading = "Recommended Next Steps"
    btns: List[str] = []
    norm_persona = (
        {"sync_supervisor": "supervisor", "mediahouse": "media_house"}.get((target_persona or "").strip().lower(), (target_persona or "").strip().lower())
        if target_persona
        else ""
    )
    persona_key = norm_persona if (norm_persona and norm_persona in PERSONA_PLAYBOOKS) else None
    pb_for_target = PERSONA_PLAYBOOKS.get(persona_key) if persona_key else None

    if promotion_type == "event" and event_doc:
        cta_section_heading = (
            f"Event Pass & {pb_for_target['label']} Actions"
            if pb_for_target
            else "Event Pass & Attendance Actions"
        )
        ev_title = event_doc.get("title", "TuneMavens Live Event")
        ev_artist = event_doc.get("artist", "TuneMavens Featured Artist")
        ev_date = event_doc.get("date_display") or event_doc.get("date", "Upcoming")
        ev_venue = event_doc.get("venue", "")
        ev_city = event_doc.get("city", "")
        ev_mode = event_doc.get("payment_mode", "paid")
        raw_flyer = (
            event_doc.get("image_url")
            or event_doc.get("poster_url")
            or event_doc.get("flyer_url")
            or event_doc.get("banner_url")
            or ""
        ).strip()
        if raw_flyer.startswith("/"):
            flyer_url = raw_flyer if is_preview else f"{PUBLIC_APP_URL}{raw_flyer}"
        else:
            flyer_url = raw_flyer

        chosen_ctas = [c.lower() for c in (event_ctas or [])]
        if ev_mode == "free_rsvp":
            chosen_ctas = ["rsvp"]
        elif not chosen_ctas:
            if ev_mode == "both":
                chosen_ctas = ["rsvp", "ticket"]
            else:
                chosen_ctas = ["ticket", "rsvp"]

        # Only append fallback event promo card if the message body doesn't already embed this event flyer
        already_embeds_flyer = bool(raw_flyer and raw_flyer in (rendered_body or ""))
        if not already_embeds_flyer:
            flyer_html = (
                f'<div style="margin-bottom: 14px;">'
                f'<img src="{flyer_url}" alt="{ev_title} Official Event Poster" '
                f'style="width: 100%; max-height: 300px; object-fit: cover; display: block; border-radius: 3px; border: 1px solid rgba(34,211,238,0.28);" />'
                f'</div>'
                if flyer_url
                else ""
            )
            promo_block = f"""
            <div style="background: rgba(34,211,238,0.06); border: 1px solid rgba(34,211,238,0.25); border-radius: 3px; padding: 16px 18px; margin: 18px 0;">
              {flyer_html}
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #22d3ee; margin-bottom: 6px;">
                LIVE EVENT INVITATION
              </div>
              <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">{ev_title}</div>
              <div style="font-size: 13px; color: #94a3b8;">
                Featuring <strong style="color: #e2e8f0;">{ev_artist}</strong><br>
                {ev_date} &bull; {ev_venue}{f', {ev_city}' if ev_city else ''}
              </div>
            </div>
            """

        if "rsvp" in chosen_ctas:
            btns.append(_button(urls["rsvp"], "RSVP Now (Reserve Spot)", variant="emerald", target_blank=is_preview))
        if "ticket" in chosen_ctas:
            btns.append(_button(urls["ticket"], "Buy Ticket Now", variant="primary", target_blank=is_preview))
        btns.append(_button(urls["event_details"], "View Event Details & Lineup", variant="secondary", target_blank=is_preview))
        if persona_key and PERSONA_SECONDARY_CTAS.get(persona_key):
            u_k, s_lbl, _ = PERSONA_SECONDARY_CTAS[persona_key][0]
            btns.append(_button(urls[u_k], s_lbl, variant="purple", target_blank=is_preview))

    elif promotion_type == "persona_intro":
        eff_persona = persona_key or "creator"
        pb = PERSONA_PLAYBOOKS.get(eff_persona, PERSONA_PLAYBOOKS["creator"])
        cta_section_heading = f"Direct Actions for {pb['label']}"
        # Only add fallback highlights card when body is plain text (rich HTML editor includes full editable layout)
        if not body_is_rich_html:
            highlights_html = "".join(
                f'<li style="margin-bottom: 4px; color: #cbd5e1;">{h}</li>'
                for h in pb.get("highlights", [])
            )
            promo_block = f"""
            <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.28); border-radius: 3px; padding: 16px 18px; margin: 18px 0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #10b981; margin-bottom: 6px;">
                PERSONALIZED INVITATION &bull; {pb['label'].upper()}
              </div>
              <ul style="margin: 6px 0 0; padding-left: 18px; font-size: 13px; line-height: 1.6;">
                {highlights_html}
              </ul>
            </div>
            """
        btns.append(_button(urls["onboard"], cta_label or pb["cta_label"], variant="primary", target_blank=is_preview))
        if pb.get("supports_epk") and include_epk_cta:
            btns.append(_button(urls["epk"], "Launch Official EPK", variant="emerald", target_blank=is_preview))
        if pb.get("supports_catalog") and include_catalog_cta:
            btns.append(_button(urls["catalog"], "Ingest Catalogue & Stems", variant="purple", target_blank=is_preview))
        for url_key, sec_label, sec_variant in PERSONA_SECONDARY_CTAS.get(eff_persona, []):
            btns.append(_button(urls[url_key], sec_label, variant=sec_variant, target_blank=is_preview))

    else:
        prod_display = (product_name or "").strip()
        cta_section_heading = (
            f"{prod_display} — Actions for {pb_for_target['label']}"
            if (prod_display and pb_for_target)
            else (f"Get Started with {prod_display}" if prod_display else "Explore TuneMavens Ecosystem")
        )
        btns.append(_button(urls["primary"], cta_label or (f"Explore {prod_display}" if prod_display else "Explore TuneMavens"), variant="primary", target_blank=is_preview))
        if persona_key and PERSONA_SECONDARY_CTAS.get(persona_key):
            for url_key, sec_label, sec_variant in PERSONA_SECONDARY_CTAS[persona_key]:
                btns.append(_button(urls[url_key], sec_label, variant=sec_variant, target_blank=is_preview))
        else:
            hint = f"{prod_display} {cta_url or ''}".lower()
            if "sync" in hint:
                btns.append(_button(urls["sync"], "Browse Pre-Cleared Sync Stems", variant="emerald", target_blank=is_preview))
            elif "dj" in hint:
                btns.append(_button(urls["dj_pool"], "Open 24-Bit DJ Pool", variant="emerald", target_blank=is_preview))
            elif "epk" in hint:
                btns.append(_button(urls["epk"], "Launch Official EPK", variant="emerald", target_blank=is_preview))
            else:
                btns.append(_button(urls["stream"], "Stream 24-Bit Lossless Audio", variant="emerald", target_blank=is_preview))
            btns.append(_button(urls["events"], "Browse Live Events & Passes", variant="secondary", target_blank=is_preview))

    cta_buttons_html = f"""
    <div style="margin: 22px 0 18px; padding: 16px 18px; background: rgba(15,23,42,0.85); border: 1px solid rgba(34,211,238,0.22); border-radius: 3px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 10px;">
        {cta_section_heading}
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        {"".join(btns)}
      </div>
    </div>
    """

    onboard_btn = _button(urls["onboard"], "Save Preferences & Complete Free Onboarding", variant="secondary", target_blank=is_preview)
    onboard_callout = f"""
    <div style="margin-top: 18px; padding: 15px 18px; background: #0b1220; border: 1px solid #1e293b; border-radius: 3px;">
      <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">
        New to TuneMavens?
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px; line-height: 1.55;">
        Create your free TuneMavens account in seconds to save your music preferences, EPK workspace, catalogue settings, and QR event passes for instant 1-tap access next time.
      </div>
      <div>{onboard_btn}</div>
    </div>
    """

    clean_ref_upper = (affiliate_ref_code or "TM-ADMIN").strip().upper()
    is_official_admin = clean_ref_upper == "TM-ADMIN"
    partner_disclosure = (
        f"Official Platform Dispatch: Sent by <strong style='color:#cbd5e1;'>TuneMavens Administration</strong> (Ref: <code style='color:#22d3ee;'>TM-ADMIN</code>)."
        if is_official_admin
        else (
            f"Partner Attribution Disclosure: Shared via the TuneMavens Official Partner Network by "
            f"<strong style='color:#cbd5e1;'>{affiliate_name or 'Authorized Partner'}</strong> "
            f"(Partner Ref: <code style='color:#10b981;'>{clean_ref_upper}</code>). "
            f"Links in this email include 90-day attribution tokens that may credit the referring partner at zero extra cost to you."
        )
    )

    recipient_display = recipient_email or "your registered email address"
    target_attr = ' target="_blank" rel="noopener noreferrer"' if is_preview else ""

    reachout_footer_html = f"""
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 11.5px; color: #64748b; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 14px; padding: 10px 12px; background: #090f1c; border: 1px solid rgba(255,255,255,0.06); border-radius: 3px;">
        <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: #94a3b8; margin-bottom: 6px;">
          Manage Your Email &amp; Communication Preferences
        </div>
        <a href="{urls['preferences']}"{target_attr} style="color: #22d3ee !important; font-weight: 700; text-decoration: underline;">Set Communication Preferences</a>
        &nbsp;&bull;&nbsp;
        <a href="{urls['unsubscribe']}"{target_attr} style="color: #f87171 !important; font-weight: 700; text-decoration: underline;">Unsubscribe / Opt Out</a>
        &nbsp;&bull;&nbsp;
        <a href="{urls['privacy']}"{target_attr} style="color: #94a3b8 !important; text-decoration: underline;">Privacy Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="{urls['terms']}"{target_attr} style="color: #94a3b8 !important; text-decoration: underline;">Terms of Service</a>
        &nbsp;&bull;&nbsp;
        <a href="{urls['cookies']}"{target_attr} style="color: #94a3b8 !important; text-decoration: underline;">Cookie Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="{urls['support']}"{target_attr} style="color: #94a3b8 !important; text-decoration: underline;">Help &amp; Support</a>
      </div>

      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">
        <strong style="color: #94a3b8;">Why you received this email:</strong> This message was sent to <span style="color: #cbd5e1;">{recipient_display}</span> because you hold a registered TuneMavens account or opted into an authorized TuneMavens Smart CRM email-only reachout list.
      </p>
      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">
        {partner_disclosure}
      </p>
      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 11px;">
        <strong style="color: #94a3b8;">Compliance &amp; Legal Disclaimer:</strong> TuneMavens Smart CRM enforces a strict Email-Only outreach policy (never unsolicited SMS or WhatsApp) in compliance with the Kenya Data Protection Act (ODPC), GDPR, and CAN-SPAM regulations. Event schedules, ticket capacities, sync licensing terms, and royalty/commission rates are subject to TuneMavens Terms of Service. All artist names, masters, and publishing rights remain the property of their respective rights holders.
      </p>
      <p style="margin: 0; text-align: center; font-size: 11px; color: #475569;">
        &copy; 2026 TuneMavens Global Sync, Live Events &amp; Audio Ecosystem (Intermaven Network) &bull; Westlands Commercial Center, Nairobi, Kenya &bull;
        <a href="mailto:support@tunemavens.com" style="color: #22d3ee !important; text-decoration: none;">support@tunemavens.com</a>
      </p>
    </div>
    """

    prepared_body_html = _sanitize_and_prepare_body_html(
        rendered_body,
        is_preview=is_preview,
        app_url=effective_base_url,
    )

    inner_html = f"""
    <div style="font-size: 18px; font-weight: 800; color: #22d3ee; margin-bottom: 14px;">{subject}</div>
    <div style="color: #cbd5e1; font-size: 14px; line-height: 1.65; margin-bottom: 16px;">
      {prepared_body_html}
    </div>
    {promo_block}
    {cta_buttons_html}
    {onboard_callout}
    """

    wrapped_html = _email_wrapper(
        inner_html,
        subject,
        target_persona or ("event" if promotion_type == "event" else "reachout"),
        footer_html=reachout_footer_html,
    )
    return wrapped_html, urls


def parse_target_group_import_payload(raw_content: str, format_hint: str = "auto") -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Parse CSV, TSV, JSON, or plain line-delimited contact lists into Email-Only entries.

    Automatically strips phone/WhatsApp/SMS columns if present in imported files so real-world
    exports import cleanly while strictly enforcing the Name + Email policy.
    """
    text = (raw_content or "").strip()
    if not text:
        return [], {"imported": 0, "skipped_duplicates": 0, "invalid_rows": 0, "stripped_phone_fields": 0}

    parsed_rows: List[Dict[str, Any]] = []
    stripped_phone_count = 0
    invalid_rows = 0

    # 1. JSON array support
    if format_hint == "json" or (text.startswith("[") and text.endswith("]")):
        try:
            arr = json.loads(text)
            if isinstance(arr, list):
                for item in arr:
                    if isinstance(item, dict):
                        if any(item.get(k) for k in ("phone", "phone_number", "mobile", "whatsapp", "sms")):
                            stripped_phone_count += 1
                        name = (
                            item.get("name")
                            or item.get("full_name")
                            or f"{item.get('first_name', '')} {item.get('last_name', '')}".strip()
                        )
                        email = item.get("email") or item.get("email_address")
                        parsed_rows.append({
                            "name": name,
                            "email": email,
                            "notes": item.get("notes") or item.get("persona") or item.get("role") or "",
                        })
        except Exception:
            invalid_rows += 1

    # 2. CSV / TSV / Line-delimited support
    if not parsed_rows and invalid_rows == 0:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        delimiter = "\t" if ("\t" in lines[0] and "," not in lines[0]) else ","
        reader = list(csv.reader(io.StringIO(text), delimiter=delimiter))
        if reader:
            first_lower = [c.strip().lower() for c in reader[0]]
            has_header = any(
                h in ("email", "email_address", "e-mail", "mail", "name", "full_name", "first_name", "contact")
                for h in first_lower
            ) and not EMAIL_REGEX.match(first_lower[0]) and (len(first_lower) < 2 or not EMAIL_REGEX.match(first_lower[1]))

            if has_header:
                headers = first_lower
                phone_cols = [i for i, h in enumerate(headers) if h in ("phone", "phone_number", "mobile", "whatsapp", "sms", "tel")]
                email_idx = next((i for i, h in enumerate(headers) if "mail" in h), None)
                name_idx = next((i for i, h in enumerate(headers) if h in ("name", "full_name", "contact", "artist", "creator")), None)
                fn_idx = next((i for i, h in enumerate(headers) if h in ("first_name", "firstname", "first")), None)
                ln_idx = next((i for i, h in enumerate(headers) if h in ("last_name", "lastname", "last")), None)
                notes_idx = next((i for i, h in enumerate(headers) if h in ("notes", "role", "persona", "category", "company")), None)

                for row in reader[1:]:
                    if not any(cell.strip() for cell in row):
                        continue
                    if any(idx < len(row) and row[idx].strip() for idx in phone_cols):
                        stripped_phone_count += 1
                    email_val = row[email_idx].strip() if (email_idx is not None and email_idx < len(row)) else ""
                    if not email_val:
                        # Scan row for an email cell
                        email_val = next((cell.strip() for cell in row if EMAIL_REGEX.match(cell.strip())), "")
                    if name_idx is not None and name_idx < len(row) and row[name_idx].strip():
                        name_val = row[name_idx].strip()
                    elif fn_idx is not None:
                        fn = row[fn_idx].strip() if fn_idx < len(row) else ""
                        ln = row[ln_idx].strip() if (ln_idx is not None and ln_idx < len(row)) else ""
                        name_val = f"{fn} {ln}".strip()
                    else:
                        name_val = email_val.split("@")[0].replace(".", " ").replace("_", " ").title() if "@" in email_val else ""
                    notes_val = row[notes_idx].strip() if (notes_idx is not None and notes_idx < len(row)) else ""
                    parsed_rows.append({"name": name_val, "email": email_val, "notes": notes_val})
            else:
                for row in reader:
                    cells = [c.strip() for c in row if c.strip()]
                    if not cells:
                        continue
                    # Support "Name <email@domain.com>" format as well
                    angle_match = re.match(r"^(.+?)<([^>]+)>$", cells[0])
                    if angle_match:
                        parsed_rows.append({"name": angle_match.group(1).strip().strip('"'), "email": angle_match.group(2).strip(), "notes": ""})
                        continue
                    email_cell = next((c for c in cells if EMAIL_REGEX.match(c)), None)
                    if not email_cell:
                        invalid_rows += 1
                        continue
                    other_cells = [c for c in cells if c != email_cell]
                    # Strip obvious phone-like cells (+254..., digits)
                    non_phone_cells = []
                    for c in other_cells:
                        if re.match(r"^\+?[\d\s\-()]{7,}$", c):
                            stripped_phone_count += 1
                        else:
                            non_phone_cells.append(c)
                    name_val = non_phone_cells[0] if non_phone_cells else email_cell.split("@")[0].replace(".", " ").title()
                    notes_val = non_phone_cells[1] if len(non_phone_cells) > 1 else ""
                    parsed_rows.append({"name": name_val, "email": email_cell, "notes": notes_val})

    valid_entries: List[Dict[str, Any]] = []
    seen = set()
    skipped_duplicates = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for r in parsed_rows:
        try:
            clean_email = validate_email_address(r.get("email") or "")
        except ValueError:
            invalid_rows += 1
            continue
        if clean_email in seen:
            skipped_duplicates += 1
            continue
        seen.add(clean_email)
        clean_name = (r.get("name") or "").strip() or clean_email.split("@")[0].replace(".", " ").title()
        valid_entries.append({
            "id": f"ent_{uuid.uuid4().hex[:8]}",
            "name": clean_name,
            "email": clean_email,
            "notes": (r.get("notes") or "").strip(),
            "tags": [],
            "added_at": now_iso,
        })

    return valid_entries, {
        "imported": len(valid_entries),
        "skipped_duplicates": skipped_duplicates,
        "invalid_rows": invalid_rows,
        "stripped_phone_fields": stripped_phone_count,
    }


def _update_learning_weights(
    campaign_id: Optional[str],
    action_type: str,
    amount_usd: float = 0.0,
) -> None:
    """Adaptive CRM Learning Loop: reinforce winning persona playbooks, subject patterns & CTAs."""
    if not campaign_id:
        return
    try:
        from bson import ObjectId
        camp = db.crm_campaigns.find_one({"_id": ObjectId(campaign_id)})
        if not camp:
            return
        persona = camp.get("target_persona") or camp.get("segment") or "general"
        promo_type = camp.get("promotion_type") or "product_service"
        subject = camp.get("subject") or ""
        cta_label = camp.get("cta_label") or "Explore Now"

        weight_delta = {
            "click": 1.0,
            "rsvp": 2.5,
            "onboarding": 5.0,
            "epk_created": 6.0,
            "catalog_ingested": 6.0,
            "spend": 8.0 + min(20.0, float(amount_usd or 0.0) * 0.1),
        }.get(action_type, 1.0)

        inc_fields: Dict[str, Any] = {
            "engagement_score": weight_delta,
            f"counts.{action_type}": 1,
        }
        if amount_usd > 0:
            inc_fields["total_revenue_usd"] = round(float(amount_usd), 2)

        db.crm_learning_weights.update_one(
            {
                "persona": persona,
                "promotion_type": promo_type,
                "subject_template": subject,
                "cta_label": cta_label,
            },
            {
                "$inc": inc_fields,
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
            },
            upsert=True,
        )
    except Exception as exc:
        logger.debug("CRM learning update skipped: %s", exc)


def get_crm_intelligence(
    persona: Optional[str] = None,
    affiliate_ref_code: Optional[str] = None,
) -> Dict[str, Any]:
    """Compute self-learning Smart CRM insights, top-performing playbooks, EPK/catalogue activation,
    and warm unconverted lead recommendations.
    """
    link_query: Dict[str, Any] = {}
    if affiliate_ref_code and affiliate_ref_code.upper() != "ALL":
        link_query["affiliate_ref_code"] = affiliate_ref_code.strip().upper()
    if persona:
        link_query["target_persona"] = persona

    links = list(db.crm_reachout_links.find(link_query))
    total_sent = len(links)
    clicked_links = [l for l in links if (l.get("clicks") or 0) > 0]
    onboarded_links = [l for l in links if l.get("onboarded")]
    warm_unconverted = [
        {
            "name": l.get("recipient_name"),
            "email": l.get("recipient_email"),
            "clicks": l.get("clicks", 0),
            "campaign_title": l.get("campaign_title"),
            "persona": l.get("target_persona") or l.get("promotion_type"),
            "affiliate_ref_code": l.get("affiliate_ref_code"),
        }
        for l in clicked_links
        if not l.get("onboarded") and not l.get("rsvped") and not l.get("ticket_purchased")
    ]

    # Measure downstream EPK creation & Catalogue ingestion among onboarded reachout users
    onboarded_emails = [l.get("recipient_email") for l in onboarded_links if l.get("recipient_email")]
    epks_activated = 0
    catalog_items_ingested = 0
    if onboarded_emails:
        onboarded_users = list(db.users.find({"email": {"$in": onboarded_emails}}))
        user_ids = [str(u["_id"]) for u in onboarded_users]
        epks_activated = db.epks.count_documents({"$or": [{"user_id": {"$in": user_ids}}, {"email": {"$in": onboarded_emails}}]})
        catalog_items_ingested = (
            db.tracks.count_documents({"$or": [{"user_id": {"$in": user_ids}}, {"creator_id": {"$in": user_ids}}]})
            + db.dj_mixes.count_documents({"$or": [{"dj_id": {"$in": user_ids}}, {"user_id": {"$in": user_ids}}]})
        )

    # Query learned top patterns
    weight_query: Dict[str, Any] = {}
    if persona:
        weight_query["persona"] = persona
    top_patterns = list(
        db.crm_learning_weights.find(weight_query, {"_id": 0})
        .sort("engagement_score", -1)
        .limit(5)
    )
    for tp in top_patterns:
        if isinstance(tp.get("updated_at"), datetime):
            tp["updated_at"] = tp["updated_at"].isoformat()
        if isinstance(tp.get("created_at"), datetime):
            tp["created_at"] = tp["created_at"].isoformat()

    click_rate = round((len(clicked_links) / total_sent) * 100, 1) if total_sent > 0 else 0.0
    onboard_rate = round((len(onboarded_links) / len(clicked_links)) * 100, 1) if clicked_links else 0.0

    recommendations: List[str] = []
    if warm_unconverted:
        recommendations.append(
            f"{len(warm_unconverted)} recipient(s) clicked a reachout link without completing onboarding — send a targeted Persona Follow-Up to convert warm intent."
        )
    if top_patterns:
        best = top_patterns[0]
        recommendations.append(
            f"Highest-scoring learned pattern ({best.get('persona', 'general')}): CTA '{best.get('cta_label')}' with score {round(best.get('engagement_score', 0), 1)}."
        )
    if persona in ("creator", "dj", "label", "podcaster"):
        recommendations.append(
            f"For {PERSONA_PLAYBOOKS[persona]['label']}, enabling both 'Launch Official EPK' and 'Ingest Catalogue' CTAs drives higher post-signup retention."
        )
    elif not recommendations:
        recommendations.append(
            "Smart CRM Learning Engine active: every email click, RSVP, onboarding, EPK launch, catalogue upload, and purchase refines subject & CTA rankings automatically."
        )

    return {
        "learning_status": "active",
        "metrics": {
            "total_reachouts_sent": total_sent,
            "unique_clicked": len(clicked_links),
            "click_through_rate_pct": click_rate,
            "onboarded_users": len(onboarded_links),
            "click_to_onboard_rate_pct": onboard_rate,
            "epks_activated": epks_activated,
            "catalog_items_ingested": catalog_items_ingested,
            "warm_unconverted_leads_count": len(warm_unconverted),
        },
        "top_learned_patterns": top_patterns,
        "warm_unconverted_leads": warm_unconverted[:15],
        "recommendations": recommendations,
    }


def generate_smart_recommendation(
    promotion_type: str = "persona_intro",
    persona: str = "creator",
    event_doc: Optional[Dict[str, Any]] = None,
    product_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Generate an optimized Subject, Body, and CTA configuration informed by historical learning weights."""
    pb = PERSONA_PLAYBOOKS.get(persona, PERSONA_PLAYBOOKS["creator"])

    # Check if the learning engine has discovered a top-scoring subject/CTA for this persona & promo_type
    learned = db.crm_learning_weights.find_one(
        {"persona": persona, "promotion_type": promotion_type},
        sort=[("engagement_score", -1)],
    )

    if promotion_type == "event" and event_doc:
        title = event_doc.get("title", "Live Showcase")
        artist = event_doc.get("artist", "Featured Artist")
        venue = event_doc.get("venue", "Main Stage")
        date_str = event_doc.get("date_display") or event_doc.get("date", "Upcoming")
        subject = (
            learned["subject_template"]
            if learned and learned.get("engagement_score", 0) >= 5
            else f"{{{{name}}}}, VIP Invitation: {title} with {artist}"
        )
        body = (
            f"Hi {{{{name}}}},\n\n"
            f"You're personally invited to {title} featuring {artist} at {venue} ({date_str}).\n\n"
            f"Use the direct buttons below to confirm your RSVP or lock in your digital QR ticket pass immediately. "
            f"When you arrive on TuneMavens, save your music & city preferences in one tap for priority access to future shows!"
        )
        return {
            "promotion_type": "event",
            "persona": persona,
            "subject": subject,
            "body": body,
            "cta_label": learned["cta_label"] if learned else "RSVP / Get Tickets",
            "learned_boost_applied": bool(learned),
            "supports_epk": False,
            "supports_catalog": False,
        }

    if promotion_type == "product_service":
        prod = product_name or "TuneMavens Lossless & Sync Suite"
        subject = (
            learned["subject_template"]
            if learned and learned.get("engagement_score", 0) >= 5
            else f"{{{{name}}}}, Exclusive Access to {prod} on TuneMavens"
        )
        body = (
            f"Hi {{{{name}}}},\n\n"
            f"We're excited to introduce you to {prod} inside the TuneMavens ecosystem.\n\n"
            f"Click below to explore directly and save your account preferences for instant access next time."
        )
        return {
            "promotion_type": "product_service",
            "persona": persona,
            "subject": subject,
            "body": body,
            "cta_label": learned["cta_label"] if learned else f"Explore {prod}",
            "learned_boost_applied": bool(learned),
            "supports_epk": pb["supports_epk"],
            "supports_catalog": pb["supports_catalog"],
        }

    # Default: persona_intro
    subject = (
        learned["subject_template"]
        if learned and learned.get("engagement_score", 0) >= 5
        else pb["default_subject"]
    )
    cta_label = learned["cta_label"] if learned and learned.get("engagement_score", 0) >= 5 else pb["cta_label"]
    return {
        "promotion_type": "persona_intro",
        "persona": persona,
        "persona_label": pb["label"],
        "subject": subject,
        "subject_alternatives": pb.get("subject_variants", []),
        "body": pb["default_body"],
        "cta_label": cta_label,
        "cta_url": pb["cta_url"],
        "supports_epk": pb["supports_epk"],
        "supports_catalog": pb["supports_catalog"],
        "include_epk_cta": pb["supports_epk"],
        "include_catalog_cta": pb["supports_catalog"],
        "learned_boost_applied": bool(learned),
    }


def _log_reachout_activity(
    action_type: str,
    affiliate_ref_code: Optional[str],
    affiliate_id: Optional[str],
    campaign_id: Optional[str],
    reachout_token: Optional[str],
    actor_name: Optional[str],
    actor_email: Optional[str],
    amount_usd: float = 0.0,
    commission_usd: float = 0.0,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """Persist a structured funnel activity event for Smart CRM affiliate reporting."""
    db.crm_reachout_activity.insert_one({
        "id": f"act_{uuid.uuid4().hex[:10]}",
        "action_type": action_type,
        "affiliate_ref_code": affiliate_ref_code,
        "affiliate_id": affiliate_id,
        "campaign_id": campaign_id,
        "reachout_token": reachout_token,
        "actor_name": actor_name,
        "actor_email": (actor_email or "").strip().lower() or None,
        "amount_usd": round(float(amount_usd or 0.0), 2),
        "commission_usd": round(float(commission_usd or 0.0), 2),
        "details": details or {},
        "created_at": datetime.now(timezone.utc),
    })
    _update_learning_weights(campaign_id=campaign_id, action_type=action_type, amount_usd=amount_usd)


def record_reachout_click(token: str) -> Optional[Dict[str, Any]]:
    """Record a recipient click on a tracked reachout link."""
    link = db.crm_reachout_links.find_one({"token": token})
    if not link:
        return None

    now = datetime.now(timezone.utc)
    update_ops: Dict[str, Any] = {
        "$inc": {"clicks": 1},
        "$set": {"last_clicked_at": now},
    }
    if not link.get("first_clicked_at"):
        update_ops["$set"]["first_clicked_at"] = now

    db.crm_reachout_links.update_one({"_id": link["_id"]}, update_ops)

    # Update campaign stats
    campaign_id = link.get("campaign_id")
    if campaign_id:
        try:
            from bson import ObjectId
            db.crm_campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {"$inc": {"stats.clicked": 1}},
            )
        except Exception:
            pass

    # Increment affiliate clicks
    ref_code = link.get("affiliate_ref_code")
    if ref_code:
        db.affiliates.update_one(
            {"ref_code": ref_code},
            {"$inc": {"clicks_count": 1}},
        )

    _log_reachout_activity(
        action_type="click",
        affiliate_ref_code=ref_code,
        affiliate_id=link.get("affiliate_id"),
        campaign_id=campaign_id,
        reachout_token=token,
        actor_name=link.get("recipient_name"),
        actor_email=link.get("recipient_email"),
        details={"promotion_type": link.get("promotion_type"), "event_id": link.get("event_id")},
    )

    return db.crm_reachout_links.find_one({"_id": link["_id"]})


def record_reachout_rsvp(
    event: Dict[str, Any],
    fan_name: str,
    fan_email: str,
    rsvp_id: str,
    reachout_token: Optional[str] = None,
    ref_code: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Attribute an event RSVP to a Smart CRM reachout and notify the initiating affiliate."""
    link = db.crm_reachout_links.find_one({"token": reachout_token}) if reachout_token else None
    resolved_ref = (
        (link.get("affiliate_ref_code") if link else None)
        or (ref_code.strip().upper() if ref_code else None)
    )

    if not resolved_ref and fan_email:
        # Check if this user was previously onboarded under an affiliate
        u = db.users.find_one({"email": fan_email.strip().lower()})
        if u and u.get("referred_by_ref_code"):
            resolved_ref = u["referred_by_ref_code"]

    if not resolved_ref and not link:
        return None

    now = datetime.now(timezone.utc)
    if link:
        db.crm_reachout_links.update_one(
            {"_id": link["_id"]},
            {"$set": {"rsvped": True, "rsvp_id": rsvp_id, "rsvped_at": now}},
        )
        if link.get("campaign_id"):
            try:
                from bson import ObjectId
                db.crm_campaigns.update_one(
                    {"_id": ObjectId(link["campaign_id"])},
                    {"$inc": {"stats.rsvps": 1}},
                )
            except Exception:
                pass

    if resolved_ref:
        db.affiliates.update_one(
            {"ref_code": resolved_ref},
            {"$inc": {"rsvps_count": 1}},
        )

    _log_reachout_activity(
        action_type="rsvp",
        affiliate_ref_code=resolved_ref,
        affiliate_id=link.get("affiliate_id") if link else None,
        campaign_id=link.get("campaign_id") if link else None,
        reachout_token=reachout_token,
        actor_name=fan_name,
        actor_email=fan_email,
        details={"event_id": event.get("id"), "event_title": event.get("title"), "rsvp_id": rsvp_id},
    )

    return notify_affiliate_of_action(
        affiliate_ref_code=resolved_ref,
        action_type="rsvp",
        subject=f"New Event RSVP from Your Reachout: {fan_name} → {event.get('title')}",
        body_text=(
            f"{fan_name} ({fan_email}) just confirmed an RSVP for '{event.get('title')}' "
            f"via your Smart CRM reachout campaign (RSVP ID: {rsvp_id}).\n\n"
            "Any future onboarding or platform spending by this guest will continue to be tracked under your affiliate account."
        ),
        cta_label="View Affiliate Telemetry",
        cta_url="/dashboard",
        metadata={"event_id": event.get("id"), "rsvp_id": rsvp_id, "guest_email": fan_email},
    )


def record_reachout_onboarding(
    user_doc: Dict[str, Any],
    reachout_token: Optional[str] = None,
    ref_code: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Attribute a new user onboarding to the initiating affiliate and notify them."""
    link = db.crm_reachout_links.find_one({"token": reachout_token}) if reachout_token else None
    resolved_ref = (
        (link.get("affiliate_ref_code") if link else None)
        or (ref_code.strip().upper() if ref_code else None)
    )
    if not resolved_ref:
        return None

    aff = db.affiliates.find_one({"ref_code": resolved_ref})
    aff_id = (aff.get("id") if aff else None) or (link.get("affiliate_id") if link else None)
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    user_email = (user_doc.get("email") or "").strip().lower()
    user_name = user_doc.get("name") or user_email.split("@")[0]
    user_role = user_doc.get("role") or "consumer"

    # Stamp attribution on the user record so future spending is automatically tracked
    if user_doc.get("_id"):
        db.users.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {
                "referred_by_ref_code": resolved_ref,
                "referred_by_affiliate_id": aff_id,
                "reachout_token": reachout_token,
                "reachout_campaign_id": link.get("campaign_id") if link else None,
            }},
        )

    if link:
        db.crm_reachout_links.update_one(
            {"_id": link["_id"]},
            {"$set": {
                "onboarded": True,
                "onboarded_user_id": str(user_doc.get("_id", "")),
                "onboarded_at": now,
            }},
        )
        if link.get("campaign_id"):
            try:
                from bson import ObjectId
                db.crm_campaigns.update_one(
                    {"_id": ObjectId(link["campaign_id"])},
                    {"$inc": {"stats.onboarded": 1}},
                )
            except Exception:
                pass

    # Record in affiliate_linked_users so it shows up in the Affiliate Network dashboard
    db.affiliate_linked_users.update_one(
        {"ref_code": resolved_ref, "email": user_email},
        {"$set": {
            "id": f"usr_ref_{uuid.uuid4().hex[:6]}",
            "ref_code": resolved_ref,
            "name": user_name,
            "email": user_email,
            "handle": f"@{re.sub(r'[^a-z0-9]', '', user_name.lower())[:16] or 'member'}",
            "role": user_role,
            "role_label": user_role.title(),
            "status": "active",
            "region": user_doc.get("country") or "Global",
            "linked_at": now_iso,
            "source": "smart_crm_reachout",
            "reachout_token": reachout_token,
            "releases_count": 0,
            "streams_count": 0,
            "gross_revenue": 0.0,
            "commission_generated": 0.0,
            "last_active": "Just onboarded",
        }},
        upsert=True,
    )

    if aff:
        db.affiliates.update_one(
            {"_id": aff["_id"]},
            {"$inc": {"onboardings_count": 1}},
        )

    _log_reachout_activity(
        action_type="onboarding",
        affiliate_ref_code=resolved_ref,
        affiliate_id=aff_id,
        campaign_id=link.get("campaign_id") if link else None,
        reachout_token=reachout_token,
        actor_name=user_name,
        actor_email=user_email,
        details={"role": user_role, "preferences": user_doc.get("preferences") or {}},
    )

    return notify_affiliate_of_action(
        affiliate_ref_code=resolved_ref,
        action_type="onboarding",
        subject=f"New User Onboarded via Your Reachout: {user_name}",
        body_text=(
            f"Great news! {user_name} ({user_email}) just completed onboarding as a {user_role.title()} "
            f"through your Smart CRM reachout.\n\n"
            "Their account is now permanently linked to your affiliate code, so you will automatically earn commissions "
            "and receive notifications whenever they purchase tickets, reload credits, or spend on TuneMavens."
        ),
        cta_label="View Your Affiliate Network",
        cta_url="/dashboard",
        metadata={"user_email": user_email, "role": user_role, "reachout_token": reachout_token},
    )


def record_reachout_spend(
    conversion_type: str,
    item_title: str,
    gross_amount_usd: float,
    user_id: Optional[str] = None,
    buyer_email: Optional[str] = None,
    buyer_name: Optional[str] = None,
    reachout_token: Optional[str] = None,
    ref_code: Optional[str] = None,
    tx_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Attribute a platform spend (ticket, credit reload, purchase) to the initiating affiliate.

    Resolves attribution from:
    1. Explicit `reachout_token` -> `crm_reachout_links`
    2. Explicit `ref_code`
    3. The buyer's `db.users` document (`referred_by_ref_code` / `reachout_token`)
    """
    if gross_amount_usd <= 0:
        return None

    link = db.crm_reachout_links.find_one({"token": reachout_token}) if reachout_token else None
    resolved_ref = (
        (link.get("affiliate_ref_code") if link else None)
        or (ref_code.strip().upper() if ref_code else None)
    )
    resolved_token = reachout_token

    # Fallback: check user record by user_id or buyer_email
    if not resolved_ref:
        user_doc = None
        if user_id:
            try:
                from bson import ObjectId
                user_doc = db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                user_doc = db.users.find_one({"id": user_id})
        if not user_doc and buyer_email:
            user_doc = db.users.find_one({"email": buyer_email.strip().lower()})
        if user_doc:
            resolved_ref = user_doc.get("referred_by_ref_code")
            if not resolved_token and user_doc.get("reachout_token"):
                resolved_token = user_doc.get("reachout_token")
                link = db.crm_reachout_links.find_one({"token": resolved_token})

    if not resolved_ref:
        return None

    aff = db.affiliates.find_one({"ref_code": resolved_ref})
    if not aff:
        return None

    # Determine commission rate from active matrix
    from routes.affiliate_router import DEFAULT_COMPENSATION_MATRIX

    matrix_doc = db.affiliate_matrix_config.find_one({"active": True}, {"_id": 0})
    matrix_list = matrix_doc.get("matrix", DEFAULT_COMPENSATION_MATRIX) if matrix_doc else DEFAULT_COMPENSATION_MATRIX
    matrix_item = next((m for m in matrix_list if m["id"] == conversion_type), None)
    if not matrix_item:
        matrix_item = next((m for m in matrix_list if m["id"] == "ticket_pass"), matrix_list[0])

    base_rate = float(matrix_item.get("rate_percent", 10.0))
    tier = aff.get("tier", "scout")
    tier_bonuses = matrix_item.get("tier_bonuses", {})
    if isinstance(tier_bonuses, dict) and tier in tier_bonuses:
        effective_rate = float(tier_bonuses[tier])
    else:
        tier_add = 0.0 if tier == "scout" else (1.0 if tier == "partner" else 2.0)
        effective_rate = min(12.0, base_rate + tier_add)

    commission = round(float(gross_amount_usd) * (effective_rate / 100.0), 2)
    if matrix_item["id"] == "sync_placement" and commission > 300.0:
        commission = 300.00

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    conv_id = f"conv_{uuid.uuid4().hex[:8]}"
    final_tx = tx_id or f"TX-CRM-{uuid.uuid4().hex[:6].upper()}"

    conv_doc = {
        "id": conv_id,
        "affiliate_id": aff.get("id") or str(aff.get("_id")),
        "ref_code": resolved_ref,
        "tx_id": final_tx,
        "type": matrix_item["id"],
        "type_label": matrix_item["category"],
        "item_title": item_title,
        "buyer_info": buyer_email or buyer_name or "Platform Member",
        "creator_name": aff.get("name"),
        "gross_amount": round(float(gross_amount_usd), 2),
        "commission_rate": effective_rate,
        "commission_amount": commission,
        "status": "cleared",
        "source": "smart_crm_reachout",
        "reachout_token": resolved_token,
        "campaign_id": link.get("campaign_id") if link else None,
        "created_at": now_iso,
    }
    db.affiliate_conversions.insert_one(dict(conv_doc))

    db.affiliates.update_one(
        {"_id": aff["_id"]},
        {"$inc": {
            "conversions_count": 1,
            "total_gmv": round(float(gross_amount_usd), 2),
            "total_earnings": commission,
            "pending_payout": commission,
        }},
    )

    if buyer_email:
        db.affiliate_linked_users.update_one(
            {"ref_code": resolved_ref, "email": buyer_email.strip().lower()},
            {"$inc": {
                "gross_revenue": round(float(gross_amount_usd), 2),
                "commission_generated": commission,
            }, "$set": {"last_active": "Just purchased"}},
        )

    if link:
        db.crm_reachout_links.update_one(
            {"_id": link["_id"]},
            {
                "$set": {"ticket_purchased": conversion_type == "ticket_pass" or bool(link.get("ticket_purchased"))},
                "$inc": {
                    "total_spend_usd": round(float(gross_amount_usd), 2),
                    "commission_earned_usd": commission,
                },
            },
        )
        if link.get("campaign_id"):
            try:
                from bson import ObjectId
                db.crm_campaigns.update_one(
                    {"_id": ObjectId(link["campaign_id"])},
                    {"$inc": {
                        "stats.conversions": 1,
                        "stats.total_spend_usd": round(float(gross_amount_usd), 2),
                        "stats.commission_earned_usd": commission,
                    }},
                )
            except Exception:
                pass

    _log_reachout_activity(
        action_type="spend",
        affiliate_ref_code=resolved_ref,
        affiliate_id=aff.get("id") or str(aff.get("_id")),
        campaign_id=link.get("campaign_id") if link else None,
        reachout_token=resolved_token,
        actor_name=buyer_name,
        actor_email=buyer_email,
        amount_usd=gross_amount_usd,
        commission_usd=commission,
        details={"tx_id": final_tx, "item_title": item_title, "conversion_type": conversion_type},
    )

    buyer_label = buyer_name or buyer_email or "A referred user"
    notif = notify_affiliate_of_action(
        affiliate_ref_code=resolved_ref,
        action_type="spend",
        subject=f"Commission Earned (${commission:.2f}): {buyer_label} purchased {item_title}",
        body_text=(
            f"{buyer_label} spent ${float(gross_amount_usd):.2f} on '{item_title}' (Ref TX: {final_tx}).\n\n"
            f"Your Affiliate Commission ({effective_rate:.1f}%): ${commission:.2f} has been credited to your pending payout balance."
        ),
        cta_label="View Earnings & Ledger",
        cta_url="/dashboard",
        metadata={
            "conversion_id": conv_id,
            "tx_id": final_tx,
            "gross_amount": round(float(gross_amount_usd), 2),
            "commission_amount": commission,
            "item_title": item_title,
        },
    )

    return {
        "attributed": True,
        "conversion": conv_doc,
        "notification": notif,
    }
