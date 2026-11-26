"""Shared Smart CRM Lead Ingestion Helper across Intermaven & TuneMavens.

Ensures every inbound public/ecosystem form (Stay in the Loop newsletter,
Beta Signups, App Waitlists, Support Tickets, Role Inquiries, Affiliate Apps)
syncs immediately into Smart CRM (`db.crm_target_groups`, `db.crm_waitlist`,
and `db.contacts`).
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from config import db

logger = logging.getLogger("intermaven.crm_ingest")


def sync_lead_to_smart_crm(
    *,
    email: Optional[str] = None,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    company: Optional[str] = None,
    source: str = "Website Form",
    system_key: str = "inbound_website_leads",
    group_name: str = "Website Leads",
    group_description: str = "Inbound leads captured from public ecosystem forms.",
    list_type: str = "general",
    notes: Optional[str] = None,
) -> None:
    if db is None:
        return

    now = datetime.now(timezone.utc)
    clean_email = (email or "").strip().lower() or None
    clean_name = (name or "").strip() or (clean_email.split("@")[0] if clean_email else "Lead")

    try:
        # 1. Sync to db.crm_waitlist (deduplicated)
        if clean_email or phone:
            wl_query = {"list_type": list_type}
            if clean_email:
                wl_query["email"] = clean_email
            else:
                wl_query["phone"] = phone
            if not db.crm_waitlist.find_one(wl_query):
                db.crm_waitlist.insert_one({
                    "list_type": list_type,
                    "email": clean_email,
                    "phone": phone,
                    "name": clean_name,
                    "company": company,
                    "preferred_channel": "email" if clean_email else "whatsapp",
                    "source": source,
                    "notes": notes,
                    "status": "active",
                    "created_at": now,
                    "contacted": False,
                    "converted": False,
                })

        # 2. Sync to Email-Only Smart CRM Target Group (db.crm_target_groups)
        if clean_email:
            entry = {
                "id": str(uuid.uuid4()),
                "email": clean_email,
                "name": clean_name,
                "source": source,
                "added_at": now.isoformat(),
            }
            existing_group = db.crm_target_groups.find_one({"system_key": system_key})
            if existing_group:
                entries = existing_group.get("entries") or []
                already = any((e.get("email") or "").lower() == clean_email for e in entries)
                if not already:
                    entries.append(entry)
                    db.crm_target_groups.update_one(
                        {"_id": existing_group["_id"]},
                        {"$set": {"entries": entries, "entry_count": len(entries), "updated_at": now}},
                    )
            else:
                db.crm_target_groups.insert_one({
                    "system_key": system_key,
                    "is_system_group": True,
                    "group_category": "Inbound Leads",
                    "persona": "all",
                    "sort_order": 50,
                    "name": group_name,
                    "description": group_description,
                    "entries": [entry],
                    "entry_count": 1,
                    "created_at": now,
                    "updated_at": now,
                })

            # 3. Sync to db.contacts (deduplicated by email)
            if not db.contacts.find_one({"email": clean_email}):
                parts = clean_name.split(" ", 1)
                db.contacts.insert_one({
                    "first_name": parts[0],
                    "last_name": parts[1] if len(parts) > 1 else "",
                    "name": clean_name,
                    "email": clean_email,
                    "phone": phone or "",
                    "company": company or "",
                    "stage": "lead",
                    "source": source,
                    "tags": [list_type, "inbound"],
                    "notes": [{"text": notes, "created_at": now}] if notes else [],
                    "status": "active",
                    "created_at": now,
                })
    except Exception as exc:
        logger.warning(f"Smart CRM sync skipped for {clean_email or phone}: {exc}")
