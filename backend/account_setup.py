"""Transactional email (Resend) and one-time "set your password" links.

- Sends through the Resend REST API when RESEND_API_KEY is set.
- Without a key nothing leaves the server: the message is saved in `email_outbox`
  and `communications` and logged, so development still works and nothing is silently lost.
- Setup tokens are random, single use and stored only as a SHA-256 hash.
- Full communications audit trail stored in `db.communications` with search, filtering,
  inspection, re-sending, and archiving support.
"""
from __future__ import annotations

import hashlib
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import requests

from config import db

logger = logging.getLogger("tunemavens.email")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
RESEND_FROM = os.environ.get("RESEND_FROM", "TuneMavens <hello@tunemavens.com>")
PUBLIC_APP_URL = os.environ.get("PUBLIC_APP_URL", "https://tunemavens.com").rstrip("/")
SETUP_TOKEN_HOURS = int(os.environ.get("SETUP_TOKEN_HOURS", "72"))


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_setup_token(user_id: str, purpose: str = "setup") -> str:
    """Create a one-time token (valid SETUP_TOKEN_HOURS) and return the raw value.

    purpose: 'setup' (choose/reset a password) or 'verify' (confirm the email address).
    """
    token = secrets.token_urlsafe(32)
    db.password_resets.insert_one({
        "purpose": purpose,
        "user_id": str(user_id),
        "token_hash": _hash(token),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=SETUP_TOKEN_HOURS),
        "used": False,
        "created_at": datetime.now(timezone.utc),
    })
    return token


def consume_setup_token(token: str, purpose: str = "setup") -> Optional[str]:
    """Validate a token and mark it used. Returns the user_id, or None if invalid/expired/used."""
    purposes = ["setup", None] if purpose == "setup" else [purpose]  # older tokens have no purpose
    doc = db.password_resets.find_one({"token_hash": _hash(token or ""), "used": False, "purpose": {"$in": purposes}})
    if not doc:
        return None
    expires = doc.get("expires_at")
    if expires is not None:
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            return None
    db.password_resets.update_one({"_id": doc["_id"]}, {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}})
    return doc["user_id"]


def verify_link(token: str) -> str:
    return f"{PUBLIC_APP_URL}/#/verify-email?token={token}"


def setup_link(token: str) -> str:
    # The portal uses hash routing, so the route lives after '#'.
    return f"{PUBLIC_APP_URL}/#/set-password?token={token}"


def _email_wrapper(
    content_html: str,
    title: str = "TuneMavens Notification",
    role: str = "",
    footer_html: Optional[str] = None,
) -> str:
    """Standardized email layout with dark theme, strict 3px border radius styling, and compliance footer."""
    role_badge = (
        f'<span style="background:rgba(34,211,238,0.12);color:#22d3ee;border:1px solid rgba(34,211,238,0.25);border-radius:3px;padding:3px 8px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">{role.upper()}</span>'
        if role else ""
    )
    default_footer = f"""
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #1e293b;font-size:11.5px;color:#64748b;text-align:center;line-height:1.6;">
      <p style="margin:0 0 6px 0;font-weight:700;color:#94a3b8;">TuneMavens Global Sync, Live Events &amp; Audio Ecosystem</p>
      <p style="margin:0 0 10px 0;">
        <a href="{PUBLIC_APP_URL}/#/dashboard?tab=settings" style="color:#22d3ee !important;text-decoration:underline;">Set Communication Preferences</a>
        &nbsp;&bull;&nbsp;
        <a href="{PUBLIC_APP_URL}/#/privacy" style="color:#94a3b8 !important;text-decoration:underline;">Privacy Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="{PUBLIC_APP_URL}/#/terms" style="color:#94a3b8 !important;text-decoration:underline;">Terms of Service</a>
        &nbsp;&bull;&nbsp;
        <a href="{PUBLIC_APP_URL}/#/support" style="color:#94a3b8 !important;text-decoration:underline;">Help &amp; Support</a>
      </p>
      <p style="margin:0 0 6px 0;font-size:11px;color:#475569;">
        Disclaimer: This message was sent in accordance with the Kenya Data Protection Act (ODPC), GDPR, and CAN-SPAM guidelines. TuneMavens strictly enforces opted-in email communications.
      </p>
      <p style="margin:0;font-size:11px;color:#475569;">
        &copy; 2026 TuneMavens (Intermaven Network) &bull; Westlands Commercial Center, Nairobi, Kenya &bull;
        <a href="mailto:support@tunemavens.com" style="color:#22d3ee !important;text-decoration:none;">support@tunemavens.com</a>
      </p>
    </div>"""

    return f"""
<div style="background-color:#090d16;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;background:#0d1522;border:1px solid #1e293b;border-radius:3px;padding:32px 28px;box-shadow:0 12px 30px rgba(0,0,0,0.55);">
    <div style="border-bottom:1px solid #1e293b;padding-bottom:18px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">
      <div style="font-size:19px;font-weight:800;letter-spacing:1px;color:#22d3ee;text-transform:uppercase;">TUNEMAVENS</div>
      {role_badge}
    </div>
    {content_html}
    {footer_html if footer_html is not None else default_footer}
  </div>
</div>"""


def _button(url: str, label: str, variant: str = "primary", target_blank: bool = False) -> str:
    """Strict 3px border-radius CTA button with dark-mode safe contrast."""
    border_css = "border:1px solid transparent;"
    if variant == "emerald":
        bg = "#10b981"
        color = "#04141a"
    elif variant == "purple":
        bg = "#a855f7"
        color = "#ffffff"
    elif variant == "secondary":
        bg = "#131e32"
        color = "#e2e8f0"
        border_css = "border:1px solid rgba(34,211,238,0.38);"
    else:
        bg = "#22d3ee"
        color = "#04141a"
    target_attr = ' target="_blank" rel="noopener noreferrer"' if target_blank else ""
    return (
        f'<a href="{url}"{target_attr} style="display:inline-block;background:{bg};color:{color} !important;'
        f'{border_css}text-decoration:none !important;font-weight:800;font-size:13.5px;padding:11px 20px;'
        f'border-radius:3px;margin-top:6px;margin-bottom:6px;margin-right:8px;line-height:1.3;">{label}</a>'
    )


def send_email(
    to: str,
    subject: str,
    html: str,
    text: str = "",
    event_type: str = "general",
    role: str = "general",
    recipient_name: str = "",
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """Send an email and record in communications audit vault.
    Returns 'sent', 'not_configured' or 'failed'. Never raises.
    """
    comm_id = f"comm_{secrets.token_hex(8)}"
    now = datetime.now(timezone.utc)
    from_addr = RESEND_FROM

    base_record = {
        "id": comm_id,
        "to": to.strip().lower(),
        "recipient_name": recipient_name.strip() if recipient_name else "",
        "subject": subject,
        "html": html,
        "text": text or subject,
        "channel": "email",
        "provider": "resend",
        "event_type": event_type,
        "role": role,
        "metadata": metadata or {},
        "archived": False,
        "archived_at": None,
        "created_at": now,
        "updated_at": now,
    }

    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set - email to %s not sent (saved to communications & outbox)", to)
        doc = {**base_record, "status": "not_configured", "from_addr": from_addr}
        try:
            db.communications.insert_one(doc)
            db.email_outbox.insert_one({
                "to": to,
                "subject": subject,
                "created_at": now,
                "status": "not_configured",
                "html": html,
                "comm_id": comm_id,
                "event_type": event_type,
                "role": role
            })
        except Exception as e:
            logger.error(f"Error saving unconfigured email record: {e}")
        return "not_configured"

    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={"from": from_addr, "to": [to], "subject": subject, "html": html, "text": text or subject},
            timeout=10,
        )
        # If custom domain rejected or unverified, retry with verified subdomain contact.tunemavens.com
        if r.status_code == 403 and "domain" in r.text.lower():
            if "@contact.tunemavens.com" not in from_addr:
                logger.info("Retrying with verified domain contact.tunemavens.com")
                from_addr = "TuneMavens <hello@contact.tunemavens.com>"
                r = requests.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                    json={"from": from_addr, "to": [to], "subject": subject, "html": html, "text": text or subject},
                    timeout=10,
                )
            if r.status_code == 403 and "domain" in r.text.lower() and from_addr != "TuneMavens <onboarding@resend.dev>":
                logger.info("Retrying with test domain onboarding@resend.dev")
                from_addr = "TuneMavens <onboarding@resend.dev>"
                r = requests.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                    json={"from": from_addr, "to": [to], "subject": subject, "html": html, "text": text or subject},
                    timeout=10,
                )

        ok = r.status_code in (200, 201)
        resend_json = {}
        try:
            resend_json = r.json()
        except Exception:
            pass

        resend_id = resend_json.get("id", "")
        status_val = "sent" if ok else "failed"

        doc = {
            **base_record,
            "status": status_val,
            "provider_status": r.status_code,
            "from_addr": from_addr,
            "resend_id": resend_id,
            "resend_response": r.text[:300]
        }

        try:
            db.communications.insert_one(doc)
            db.email_outbox.insert_one({
                "to": to,
                "subject": subject,
                "created_at": now,
                "status": status_val,
                "provider_status": r.status_code,
                "from_addr": from_addr,
                "resend_response": r.text[:300],
                "comm_id": comm_id,
                "event_type": event_type,
                "role": role
            })
        except Exception as e:
            logger.error(f"Error inserting sent email doc: {e}")

        if not ok:
            logger.error("Resend rejected email to %s: %s %s", to, r.status_code, r.text[:300])

        return status_val
    except Exception as exc:
        logger.error("Email to %s failed: %s", to, exc)
        try:
            db.communications.insert_one({
                **base_record,
                "status": "failed",
                "error": str(exc),
                "from_addr": from_addr
            })
        except Exception:
            pass
        return "failed"


# ---------------------------------------------------------------------------
# Persona copy configuration
# ---------------------------------------------------------------------------
ROLE_COPY = {
    "creator": ("Creator", "Build your EPK, lock in your split sheets and pitch to sync briefs."),
    "podcaster": ("Podcaster", "Publish episodes, find sponsors and grow your audience."),
    "label": ("Record Label", "Manage your roster, catalogue and split payouts in one place."),
    "dj": ("DJ", "Get lossless record pools and clear stems with confidence."),
    "supervisor": ("Music Supervisor", "Search the catalogue and license music with escrow protection."),
    "media_house": ("Media House", "License music for broadcast and keep playlist reports in order."),
    "corporate": ("Corporate / Brand", "Run audio ads and sponsorships with local artists."),
    "consumer": ("Listener", "Stream in high quality and support the artists you love."),
    "vc": ("Venture Capital & Tour Financier", "Discover creators and fund tours with clear, tracked terms."),
    "affiliate": ("Affiliate", "Share your link and earn on every referral."),
}


# ---------------------------------------------------------------------------
# Notification Protocols Across Key Activities
# ---------------------------------------------------------------------------

def send_welcome_email(to: str, name: str, role: str, verify_token: Optional[str] = None) -> str:
    """Welcome email for any persona, with a button to confirm the email address."""
    label, blurb = ROLE_COPY.get(role, ("Member", "Your account is ready."))
    first = (name or "there").split()[0]
    confirm = ""
    confirm_text = ""
    if verify_token:
        confirm = (
            "<p style='margin-top:16px;'>Please confirm your email address so we can keep your account safe and reach you about transactions.</p>"
            + _button(verify_link(verify_token), "Confirm My Email")
            + f"<p style='font-size:12px;color:#64748b;margin-top:8px;'>The link works once and expires in {SETUP_TOKEN_HOURS} hours.</p>"
        )
        confirm_text = f" Confirm your email: {verify_link(verify_token)}"
    login_url = f"{PUBLIC_APP_URL}/#/login"

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Welcome to TuneMavens, {first}!</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Your <strong>{label}</strong> account is live. {blurb}</p>
<div style="margin:20px 0;">
  {_button(login_url, "Open My Dashboard")}
</div>
{confirm}
<p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px dashed #1e293b;padding-top:14px;">
  Your login email is this address. We never ask for your password by email. If you did not register, please ignore this message.
</p>"""

    html = _email_wrapper(inner_html, "Welcome to TuneMavens", role)
    text = f"Welcome to TuneMavens, {first}! Your {label} account is ready. Log in: {login_url}.{confirm_text}"
    return send_email(
        to=to,
        subject=f"Welcome to TuneMavens - your {label} account is ready",
        html=html,
        text=text,
        event_type="welcome_onboarding",
        role=role,
        recipient_name=name,
        metadata={"role": role, "verify_token_sent": bool(verify_token)}
    )


def send_affiliate_welcome(to: str, name: str, ref_code: str, referral_url: str, token: Optional[str]) -> str:
    """Welcome email for affiliate program registration with unique referral code & setup link."""
    first = (name or "there").split()[0]
    if token:
        action = (
            "<p style='margin-top:16px;'>Click the button below to choose your password and open your affiliate dashboard. "
            f"The link works once and expires in {SETUP_TOKEN_HOURS} hours.</p>"
            + _button(setup_link(token), "Set My Password")
        )
        action_text = f"Set your password: {setup_link(token)}"
    else:
        action = "<p style='margin-top:16px;'>You already have an account. Log in to open your affiliate dashboard.</p>" + _button(
            f"{PUBLIC_APP_URL}/#/login", "Log In to Affiliate Portal"
        )
        action_text = f"Log in: {PUBLIC_APP_URL}/#/login"

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Welcome to the Affiliate Program, {first}!</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Your affiliate account is registered and active across the TuneMavens ecosystem.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:16px 18px;margin:20px 0;">
  <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Your Unique Referral Code</div>
  <div style="font-size:18px;font-weight:800;color:#22d3ee;letter-spacing:1px;font-family:monospace;">{ref_code}</div>
  <div style="font-size:12px;color:#94a3b8;margin-top:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Your Unique Referral Link</div>
  <div style="font-size:13px;color:#e2e8f0;word-break:break-all;"><a href="{referral_url}" style="color:#22d3ee;text-decoration:none;">{referral_url}</a></div>
  <div style="font-size:11px;color:#64748b;margin-top:8px;">Every visitor through this link receives a 90-day tracking cookie.</div>
</div>

{action}
<p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px dashed #1e293b;padding-top:14px;">
  Your login email is this address. If you did not sign up for this program, you can ignore this email.
</p>"""

    html = _email_wrapper(inner_html, "TuneMavens Affiliate Welcome", "affiliate")
    text = (
        f"Welcome to TuneMavens, {first}! Your referral code: {ref_code}. Your unique link: {referral_url}. {action_text}"
    )
    return send_email(
        to=to,
        subject="Welcome to the TuneMavens Affiliate Program",
        html=html,
        text=text,
        event_type="affiliate_welcome",
        role="affiliate",
        recipient_name=name,
        metadata={"ref_code": ref_code, "referral_url": referral_url}
    )


def send_password_reset_email(to: str, name: str, token: str) -> str:
    """Send one-time password reset link."""
    first = (name or "there").split()[0]
    link = setup_link(token)
    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Password Reset Request</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, we received a request to set or reset your TuneMavens password.</p>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Click the button below to choose a secure password. The link works once and expires in {SETUP_TOKEN_HOURS} hours.</p>
<div style="margin:20px 0;">
  {_button(link, "Set My Password")}
</div>
<p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px dashed #1e293b;padding-top:14px;">
  If you did not make this request, you can safely ignore this email. Your current password remains unchanged.
</p>"""
    html = _email_wrapper(inner_html, "Password Reset Request", "security")
    return send_email(
        to=to,
        subject="Choose a new TuneMavens password",
        html=html,
        text=f"Set your password: {link}",
        event_type="password_reset_request",
        role="security",
        recipient_name=name,
        metadata={"token_hours": SETUP_TOKEN_HOURS}
    )


def send_password_changed_notification(to: str, name: str, role: str = "creator") -> str:
    """Security notification triggered immediately whenever a password is set or modified."""
    first = (name or "there").split()[0]
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Security Alert: Password Updated</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, your TuneMavens account password was successfully updated on <strong>{now_str}</strong>.</p>
<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:16px 18px;margin:20px 0;">
  <div style="display:flex;align-items:center;gap:8px;color:#10b981;font-weight:700;font-size:14px;">
    <span>●</span> Password status: Active and encrypted
  </div>
  <div style="font-size:12px;color:#94a3b8;margin-top:8px;">
    All active sessions remain protected by your updated credentials.
  </div>
</div>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  If you made this change, no further action is needed.
</p>
<p style="margin:0 0 16px 0;color:#f87171;font-size:13px;font-weight:600;">
  If you did NOT authorize this change, please lock your account or contact support immediately at support@tunemavens.com.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/login", "Open Security Settings", "secondary")}
</div>"""
    html = _email_wrapper(inner_html, "Security Alert: Password Changed", role)
    text = f"Hi {first}, your TuneMavens password was updated on {now_str}. If you did not make this change, please contact support immediately."
    return send_email(
        to=to,
        subject="Security Notice: Your TuneMavens password was updated",
        html=html,
        text=text,
        event_type="password_change",
        role=role,
        recipient_name=name,
        metadata={"updated_at": now_str}
    )


def send_credit_balance_notification(
    to: str,
    name: str,
    delta: int | float,
    new_balance: int | float,
    reason: str,
    role: str = "creator",
    tx_id: str = ""
) -> str:
    """Dispatches a notification whenever credits are reloaded, spent, or granted."""
    first = (name or "there").split()[0]
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    is_positive = delta > 0
    delta_display = f"+{delta}" if is_positive else str(delta)
    delta_color = "#10b981" if is_positive else "#f59e0b"
    event_label = "Credit Reload / Grant" if is_positive else "Credit Spend"

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">TuneMavens Credit Ledger Update</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, an immutable credit ledger entry was recorded on your account.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Transaction Type</span>
    <span style="font-size:12px;font-weight:700;color:#22d3ee;text-transform:uppercase;">{event_label}</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Adjustment</span>
    <span style="font-size:18px;font-weight:800;color:{delta_color};font-family:monospace;">{delta_display} Credits</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-top:1px solid #1e293b;padding-top:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Current Total Balance</span>
    <span style="font-size:18px;font-weight:800;color:#f8fafc;font-family:monospace;">{new_balance} Credits</span>
  </div>
  <div style="font-size:12px;color:#94a3b8;margin-top:8px;"><strong>Reason:</strong> {reason}</div>
  {f'<div style="font-size:11px;color:#64748b;margin-top:6px;font-family:monospace;">Ref: {tx_id}</div>' if tx_id else ''}
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  TuneMavens credits never expire and are usable across all 9 persona apps in the ecosystem.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/dashboard", "View Credit Wallet & Ledger")}
</div>"""

    html = _email_wrapper(inner_html, "Credit Ledger Update", role)
    text = f"TuneMavens Credit Update for {first}: {delta_display} credits ({reason}). New balance: {new_balance} credits."
    return send_email(
        to=to,
        subject=f"TuneMavens Credit Update: {delta_display} Credits (Balance: {new_balance})",
        html=html,
        text=text,
        event_type="credit_balance",
        role=role,
        recipient_name=name,
        metadata={"delta": delta, "new_balance": new_balance, "reason": reason, "tx_id": tx_id}
    )


def send_payout_dispatched_notification(
    to: str,
    name: str,
    amount: float,
    currency: str = "USD",
    method: str = "Credits",
    ref_id: str = "",
    role: str = "affiliate"
) -> str:
    """Dispatches a disbursement receipt when payouts are orchestrated (M-Pesa, Stripe, PayPal, Credits)."""
    first = (name or "there").split()[0]
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Payout Disbursement Dispatched!</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, your payout disbursement has been processed and dispatched.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Disbursed Amount</span>
    <span style="font-size:22px;font-weight:800;color:#10b981;font-family:monospace;">${amount:.2f} {currency}</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Payment Rail</span>
    <span style="font-size:13px;font-weight:700;color:#22d3ee;text-transform:uppercase;">{method}</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1e293b;padding-top:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Batch Reference</span>
    <span style="font-size:12px;color:#cbd5e1;font-family:monospace;">{ref_id or 'TX-AUTO'}</span>
  </div>
  <div style="font-size:11px;color:#64748b;margin-top:8px;">Processed on {now_str}</div>
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  Depending on your payment method, funds typically reflect in your account within a few minutes (M-Pesa, Credits) or 1-3 business days (Stripe, PayPal).
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/affiliates", "View Payout History & Ledger", "emerald")}
</div>"""

    html = _email_wrapper(inner_html, "Payout Dispatched", role)
    text = f"Disbursement Notice: ${amount:.2f} {currency} was dispatched via {method} to {first}. Ref: {ref_id}."
    return send_email(
        to=to,
        subject=f"Disbursement Notice: ${amount:.2f} {currency} Payout Dispatched",
        html=html,
        text=text,
        event_type="payout_dispatched",
        role=role,
        recipient_name=name,
        metadata={"amount": amount, "currency": currency, "method": method, "ref_id": ref_id}
    )


def send_affiliate_conversion_notification(
    to: str,
    name: str,
    ref_code: str,
    commission_amount: float,
    item_name: str
) -> str:
    """Notifies affiliate when a transaction occurs through their referral code."""
    first = (name or "there").split()[0]
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">New Referral Commission Earned!</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, a transaction was completed using your unique referral link.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Commission Earned</span>
    <span style="font-size:20px;font-weight:800;color:#10b981;font-family:monospace;">+${commission_amount:.2f} USD</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Item / Stream</span>
    <span style="font-size:13px;font-weight:600;color:#f8fafc;">{item_name}</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1e293b;padding-top:12px;">
    <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Referral Code</span>
    <span style="font-size:13px;font-weight:700;color:#22d3ee;font-family:monospace;">{ref_code}</span>
  </div>
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  This earning has been credited to your pending payout balance and will be disbursed in the next automated settlement run.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/affiliates", "View Affiliate Dashboard")}
</div>"""

    html = _email_wrapper(inner_html, "Referral Commission Earned", "affiliate")
    text = f"New Commission: ${commission_amount:.2f} earned via your code {ref_code} for {item_name}."
    return send_email(
        to=to,
        subject=f"Commission Earned: +${commission_amount:.2f} via Code {ref_code}",
        html=html,
        text=text,
        event_type="affiliate_conversion",
        role="affiliate",
        recipient_name=name,
        metadata={"commission": commission_amount, "ref_code": ref_code, "item_name": item_name}
    )


def send_contract_executed_notification(
    to: str,
    name: str,
    contract_title: str,
    contract_id: str,
    counterparties: str = "",
    role: str = "creator"
) -> str:
    """Dispatched when a contract agreement is fully executed with cryptographic signatures."""
    first = (name or "there").split()[0]
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Agreement Fully Executed!</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, all parties have completed signatures on the agreement below.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="font-size:16px;font-weight:700;color:#f8fafc;margin-bottom:8px;">{contract_title}</div>
  <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">ID: <span style="font-family:monospace;color:#cbd5e1;">{contract_id}</span></div>
  {f'<div style="font-size:12px;color:#94a3b8;margin-bottom:8px;"><strong>Parties:</strong> {counterparties}</div>' if counterparties else ''}
  <div style="border-top:1px solid #1e293b;padding-top:10px;display:flex;align-items:center;gap:8px;color:#10b981;font-size:13px;font-weight:600;">
    <span>✓</span> Cryptographically sealed on {now_str}
  </div>
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  An immutable PDF copy with SHA-256 audit logs is archived and accessible at any time from your contracts repository.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/contracts", "Download & Review Agreement")}
</div>"""

    html = _email_wrapper(inner_html, "Contract Executed", role)
    text = f"TuneMavens Contract Executed: {contract_title} (ID: {contract_id}). Fully signed and sealed."
    return send_email(
        to=to,
        subject=f"Executed Agreement: {contract_title}",
        html=html,
        text=text,
        event_type="contract_executed",
        role=role,
        recipient_name=name,
        metadata={"contract_id": contract_id, "contract_title": contract_title}
    )


def send_contract_invitation_notification(
    to: str,
    name: str,
    contract_title: str,
    contract_id: str,
    inviter_name: str = "",
    role: str = "creator"
) -> str:
    """Dispatched when a party is invited to collaborate on or sign a contract."""
    first = (name or "there").split()[0]
    inviter_display = inviter_name or "A partner"

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">Contract Collaboration Invitation</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, {inviter_display} has invited you to review and sign an agreement on TuneMavens.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="font-size:16px;font-weight:700;color:#f8fafc;margin-bottom:8px;">{contract_title}</div>
  <div style="font-size:12px;color:#94a3b8;">Agreement Reference: <span style="font-family:monospace;color:#cbd5e1;">{contract_id}</span></div>
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  You can review clauses, propose redlines, and add your verified electronic signature directly in the portal.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/contracts", "Review & Sign Agreement")}
</div>"""

    html = _email_wrapper(inner_html, "Contract Invitation", role)
    text = f"Contract Invitation from {inviter_display}: Review and sign '{contract_title}' on TuneMavens."
    return send_email(
        to=to,
        subject=f"Contract Invitation: {contract_title}",
        html=html,
        text=text,
        event_type="contract_invitation",
        role=role,
        recipient_name=name,
        metadata={"contract_id": contract_id, "contract_title": contract_title, "inviter": inviter_name}
    )


def send_dj_mix_clearance_invitation(
    to: str,
    name: str,
    mix_title: str,
    track_title: str,
    dj_name: str,
    contract_id: str,
    split_pct: float,
    commercial_price: float = 4.99,
    mix_id: str = "",
    role: str = "creator"
) -> str:
    """Dispatched when a DJ requests commercial mix clearance from an IP owner."""
    first = (name or "there").split()[0]
    estimated_payout_per_sale = (split_pct / 100.0) * commercial_price

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">DJ Mix Commercial Clearance Request</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, DJ <strong>{dj_name}</strong> has featured your recording in a commercial mix release on TuneMavens and is requesting your clearance approval.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="font-size:16px;font-weight:700;color:#f8fafc;margin-bottom:8px;">Mix Title: {mix_title}</div>
  <div style="font-size:14px;color:#22d3ee;margin-bottom:12px;">Featured Track: <strong>{track_title}</strong></div>
  
  <table style="width:100%;border-collapse:collapse;font-size:13px;color:#cbd5e1;margin-top:10px;">
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Commercial Retail Price:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;">${commercial_price:.2f} USD</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Proposed Revenue Split:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;color:#10b981;">{split_pct:.2f}% of gross (${estimated_payout_per_sale:.2f} / sale)</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Streaming Status:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;color:#22d3ee;">Free Promotional Stream Active</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">IP Owner Crediting:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;color:#a78bfa;">100% Fully Credited</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Condition Precedent:</td>
      <td style="padding:6px 0;font-style:italic;text-align:right;color:#f59e0b;">No sales occur until 100% agreement</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Agreement Ref:</td>
      <td style="padding:6px 0;font-family:monospace;text-align:right;">{contract_id}</td>
    </tr>
  </table>
</div>

<div style="background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.25);border-radius:3px;padding:14px 16px;margin:16px 0;font-size:13px;color:#cbd5e1;line-height:1.5;">
  <strong style="color:#22d3ee;">Free Promotional Streaming Notice:</strong> Until all clearances are executed, this mix is completely free to stream. This gives you, your artist, and the DJ global exposure while consumers enjoy the music, and gives you the opportunity to experience the TuneMavens platform, hear your track in the set, and review your proposed commercial splits. You are prominently credited as the IP owner across all players and tracklists.
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  Review the interactive tracklist in context, listen to the transition, and execute the standard digital clearance contract with cryptographic SHA-256 seal.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/contracts?id={contract_id}&mix_id={mix_id}", "Review & Sign Clearance Agreement")}
</div>"""

    html = _email_wrapper(inner_html, "DJ Mix Clearance Request", role)
    text = (
        f"DJ Mix Clearance Request from {dj_name}: Clearance requested for '{track_title}' in '{mix_title}'. "
        f"Proposed split: {split_pct:.2f}% (${estimated_payout_per_sale:.2f}/sale). Review on TuneMavens: Contract {contract_id}."
    )
    return send_email(
        to=to,
        subject=f"Action Required: DJ Mix Clearance Request for '{track_title}' in '{mix_title}'",
        html=html,
        text=text,
        event_type="dj_mix_clearance_request",
        role=role,
        recipient_name=name,
        metadata={
            "contract_id": contract_id,
            "mix_title": mix_title,
            "track_title": track_title,
            "dj_name": dj_name,
            "split_pct": split_pct,
            "mix_id": mix_id
        }
    )


def send_dj_remix_clearance_invitation(
    to: str,
    name: str,
    mix_title: str,
    track_title: str,
    dj_name: str,
    contract_id: str,
    split_pct: float,
    commercial_price: float = 4.99,
    mix_id: str = "",
    role: str = "creator"
) -> str:
    """Dispatched when a DJ creates a new version of a song with an original beat and requests clearance."""
    first = (name or "there").split()[0]
    estimated_payout_per_sale = (split_pct / 100.0) * commercial_price

    inner_html = f"""
<h2 style="margin:0 0 12px 0;color:#f8fafc;font-size:20px;font-weight:700;">DJ Remix & Original Beat Clearance Request</h2>
<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">Hi {first}, DJ <strong>{dj_name}</strong> has created a new version of your song <strong>"{track_title}"</strong> using their originally produced beat/instrumental, and is requesting your clearance approval on TuneMavens.</p>

<div style="background:#131c2d;border:1px solid #1e293b;border-radius:3px;padding:18px 20px;margin:20px 0;">
  <div style="font-size:16px;font-weight:700;color:#f8fafc;margin-bottom:8px;">Remix Title: {mix_title}</div>
  <div style="font-size:14px;color:#22d3ee;margin-bottom:12px;">Original Song: <strong>{track_title}</strong> (Credited Rights Holder: {name})</div>
  <div style="font-size:13px;color:#a78bfa;margin-bottom:12px;">Beat Producer: <strong>{dj_name}</strong> (Original Composition & Production)</div>
  
  <table style="width:100%;border-collapse:collapse;font-size:13px;color:#cbd5e1;margin-top:10px;">
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Commercial Retail Price:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;">${commercial_price:.2f} USD</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Proposed Revenue Split:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;color:#10b981;">{split_pct:.2f}% of gross (${estimated_payout_per_sale:.2f} / sale or monetized stream)</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Current Streaming Status:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;color:#22d3ee;">100% Free Promotional Streaming Active</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Creator Accreditation:</td>
      <td style="padding:6px 0;font-weight:600;text-align:right;color:#a78bfa;">100% Fully Credited as Song & Master Rights Owner</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Commercial Selling Status:</td>
      <td style="padding:6px 0;font-style:italic;text-align:right;color:#f59e0b;">Strictly NO selling until your clearance approval</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#94a3b8;">Agreement Ref:</td>
      <td style="padding:6px 0;font-family:monospace;text-align:right;">{contract_id}</td>
    </tr>
  </table>
</div>

<div style="background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.25);border-radius:3px;padding:14px 16px;margin:16px 0;font-size:13px;color:#cbd5e1;line-height:1.5;">
  <strong style="color:#22d3ee;">Policy & Monetization Roadmap:</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><strong>Before Clearance:</strong> This rework is streaming 100% free with full accreditation to you, giving your song exposure to club and festival audiences. There is strictly no commercial selling permitted.</li>
    <li><strong>After Clearance:</strong> Once you review and sign this clearance agreement, this new version can be <strong>sold as a commercial download and/or monetized on stream</strong>, distributing your {split_pct:.1f}% royalty share directly to your wallet in real-time.</li>
  </ul>
</div>

<p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;">
  Review the audio production, inspect the proposed split waterfall, and execute the clearance agreement with cryptographic SHA-256 seal.
</p>
<div style="margin:20px 0;">
  {_button(f"{PUBLIC_APP_URL}/#/contracts?id={contract_id}&mix_id={mix_id}", "Review Rework & Sign Clearance Agreement")}
</div>"""

    html = _email_wrapper(inner_html, "DJ Remix Clearance Request", role)
    text = (
        f"DJ Remix Clearance Request from {dj_name}: Clearance requested for new original beat version of '{track_title}'. "
        f"Proposed split: {split_pct:.2f}% (${estimated_payout_per_sale:.2f}/sale). Review on TuneMavens: Contract {contract_id}."
    )
    return send_email(
        to=to,
        subject=f"Action Required: Clearance for Original Beat DJ Remix of '{track_title}' by {dj_name}",
        html=html,
        text=text,
        event_type="dj_remix_clearance_request",
        role=role,
        recipient_name=name,
        metadata={
            "contract_id": contract_id,
            "mix_title": mix_title,
            "track_title": track_title,
            "dj_name": dj_name,
            "split_pct": split_pct,
            "mix_id": mix_id
        }
    )


# Re-export WhatsApp communication primitives
from services.whatsapp_service import send_whatsapp, sanitize_phone_number, generate_wa_direct_url

