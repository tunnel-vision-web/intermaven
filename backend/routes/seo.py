"""
Phase 9 — Admin SEO Management Module & Public SEO/Sitemap/Robots Engine.

Provides:
- Global meta defaults, Search Console / Bing verification tags, Schema.org Organization + sameAs
- Per-page SEO overrides, canonicals, Open Graph / Twitter cards, and JSON-LD structured data
- Dynamic /sitemap.xml (/api/seo/sitemap.xml) and /robots.txt (/api/seo/robots.txt) generators
- Consent-aware tracking & analytics pixel configuration (GA4, GTM, Meta, TikTok, LinkedIn, PostHog, Plausible)
- AI-assisted meta copy generation (/api/admin/seo/ai-suggest)
- Automated full SEO, alt-text, internal link & Core Web Vitals audit scanner (/api/admin/seo/audit)
"""
from datetime import datetime, timezone
import os
import re
import uuid
from typing import Any, Dict, List, Optional
from xml.sax.saxutils import escape as xml_escape

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field

from config import db
from utils import get_admin_user, log_audit

router = APIRouter(tags=["seo"])

SCHEMA_TYPES = [
    "WebSite",
    "Organization",
    "SoftwareApplication",
    "Product",
    "FAQPage",
    "Article",
    "LocalBusiness",
    "BreadcrumbList",
]

DEFAULT_GLOBAL_SEO: Dict[str, Any] = {
    "_id": "global",
    "site_name": "Intermaven",
    "base_url": "https://intermaven.io",
    "title_template": "%s | Intermaven",
    "default_title": "Intermaven — AI Business, Smart CRM, Social AI & Creator Ecosystem",
    "default_description": (
        "Intermaven is the unified AI-powered operating system for founders, SMEs, creators, and record labels — "
        "featuring Smart CRM, Brand Kit AI, Social AI, EPK Builder, Distribution Tracker, and M-Pesa POS."
    ),
    "default_keywords": (
        "Intermaven, TuneMavens, TuneStream, SyncMavens, Smart CRM, Brand Kit AI, Social AI, "
        "Distribution Tracker, EPK Builder, M-Pesa POS, Africa creator tech, business AI"
    ),
    "default_og_image": "/images/hero/intermaven/hero-1.jpg",
    "twitter_card": "summary_large_image",
    "twitter_handle": "@intermaven",
    "locale": "en_US",
    "verification": {
        "google_site_verification": "",
        "bing_site_verification": "",
        "yandex_verification": "",
        "pinterest_verification": "",
    },
    "organization": {
        "name": "Intermaven",
        "legal_name": "Intermaven Technologies",
        "url": "https://intermaven.io",
        "logo": "https://intermaven.io/icon-512.png",
        "contact_email": "hello@intermaven.io",
        "contact_phone": "+254 700 000 000",
        "address_locality": "Nairobi",
        "address_country": "KE",
    },
    "social_accounts": {
        "instagram": "https://instagram.com/intermaven",
        "tiktok": "https://tiktok.com/@intermaven",
        "x": "https://x.com/intermaven",
        "linkedin": "https://linkedin.com/company/intermaven",
        "youtube": "https://youtube.com/@intermaven",
        "facebook": "https://facebook.com/intermaven",
        "ecosystem": [
            "https://tunemavens.com",
            "https://tunestream.co",
            "https://syncmavens.com",
        ],
    },
    "pixels": {
        "consent_required": True,
        "ga4_id": "",
        "gtm_id": "",
        "meta_pixel_id": "",
        "tiktok_pixel_id": "",
        "linkedin_partner_id": "",
        "posthog_key": "",
        "posthog_host": "https://app.posthog.com",
        "plausible_domain": "",
    },
    "robots": {
        "allow_indexing": True,
        "disallow_paths": ["/dashboard", "/admin", "/api/", "/sso/", "/embed/"],
        "custom_rules": "",
    },
    "performance_targets": {
        "lighthouse_seo": 96,
        "lighthouse_performance": 90,
        "lighthouse_accessibility": 95,
        "lighthouse_best_practices": 95,
        "lcp_ms": 2500,
        "inp_ms": 200,
        "cls": 0.1,
    },
}

DEFAULT_SEO_PAGES: List[Dict[str, Any]] = [
    {
        "_id": "/",
        "path": "/",
        "label": "Homepage",
        "title": "AI Business, Smart CRM, Social AI & Creator Ecosystem",
        "description": "Build your brand and run your business smarter with Intermaven — AI Brand Kits, Smart CRM, Social AI, EPK Builder, M-Pesa POS, and the TuneMavens ecosystem.",
        "og_title": "Intermaven — AI Business, Smart CRM & Creator Ecosystem",
        "og_description": "One login across Intermaven, TuneMavens, TuneStream & SyncMavens. Start free with 150 AI credits.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/",
        "schema_type": "WebSite",
        "sitemap_include": True,
        "sitemap_priority": 1.0,
        "sitemap_changefreq": "daily",
        "noindex": False,
    },
    {
        "_id": "/tools",
        "path": "/tools",
        "label": "AI Creative & Business Tools",
        "title": "AI Creative & Business Studio Tools",
        "description": "Generate complete brand kits, artist bios, sync licensing pitches, press releases, lyric hooks, and merch briefs in seconds with Intermaven AI.",
        "og_title": "Intermaven AI Studio — Brand Kits, Bios, Pitches & Copy",
        "og_description": "Create agency-grade brand and music marketing assets powered by AI. Includes 150 free starter credits.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/tools",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.9,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/apps",
        "path": "/apps",
        "label": "App Marketplace",
        "title": "Music, Creator & Business App Marketplace",
        "description": "Explore 22+ integrated apps on Intermaven: Smart CRM, Social AI, EPK Builder, Distribution Tracker, Contract Builder, Invoicing, Tour Manager, and POS.",
        "og_title": "Intermaven App Marketplace — 22+ Modular Creator & SME Apps",
        "og_description": "Activate modular business, music, and hospitality applications under one unified account.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/apps",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.9,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/pricing",
        "path": "/pricing",
        "label": "Pricing & Plans",
        "title": "Simple, Transparent Pricing & Instant M-Pesa / Card Billing",
        "description": "Compare Free, Creator, and Pro plans on Intermaven. Start free with 150 AI credits and upgrade anytime via M-Pesa, Visa, Mastercard, or PayPal.",
        "og_title": "Intermaven Pricing — Free, Creator & Pro Plans",
        "og_description": "Flexible plans localized in 55+ currencies with instant M-Pesa and global card checkout.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/pricing",
        "schema_type": "Product",
        "sitemap_include": True,
        "sitemap_priority": 0.9,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/cms",
        "path": "/cms",
        "label": "Mother-CMS Product Page",
        "title": "Mother-CMS — Multi-Portal, Region-Aware Content Management",
        "description": "One source of truth across every portal and region. Deliver geo-localized copy, hero carousels, and rollback-safe content across your entire brand ecosystem.",
        "og_title": "Intermaven Mother-CMS — Portal & Region-Aware Headless CMS",
        "og_description": "Define content once and serve localized copy across web portals, regions, and currencies with full audit history.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/cms",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.85,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/about",
        "path": "/about",
        "label": "About Intermaven",
        "title": "About Us — Empowering Creators & Entrepreneurs Globally",
        "description": "Learn how Intermaven grew from an independent artist EPK builder into a complete AI creative and business operating system built in Nairobi for the world.",
        "og_title": "About Intermaven — Our Story & Mission",
        "og_description": "Building world-class AI, CRM, payments, and music distribution infrastructure for Africa and the global creator economy.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/about",
        "schema_type": "Organization",
        "sitemap_include": True,
        "sitemap_priority": 0.8,
        "sitemap_changefreq": "monthly",
        "noindex": False,
    },
    {
        "_id": "/smartcrm",
        "path": "/smartcrm",
        "label": "Smart CRM & Reachout Landing",
        "title": "Smart CRM & Automated Persona Reachout",
        "description": "Manage leads, venues, press contacts, and clients with persona-driven email & WhatsApp playbooks, tracked outreach, and revenue pipelines.",
        "og_title": "Intermaven Smart CRM — Bookings, Leads & Outreach",
        "og_description": "Close more bookings, sponsorships, and client retainers with AI-assisted outreach and contact pipelines.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/smartcrm",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.85,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/brandkit",
        "path": "/brandkit",
        "label": "Brand Kit AI Landing",
        "title": "AI Brand Kit Generator — Voice, Taglines & Colour Palette",
        "description": "Generate a cohesive brand identity — positioning, taglines, colour palette, typography, and audience strategy — in under 30 seconds.",
        "og_title": "Intermaven Brand Kit AI — Instant Brand Identity",
        "og_description": "Launch your business, studio, or artist brand with AI-crafted positioning, colours, and messaging.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/brandkit",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.85,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/social",
        "path": "/social",
        "label": "Social AI Landing",
        "title": "Social AI — Multi-Platform Captions, Visuals & Content Calendar",
        "description": "Plan, generate, and schedule high-converting social content, promo graphics, and captions across Instagram, TikTok, X, LinkedIn, and YouTube.",
        "og_title": "Intermaven Social AI — Content Studio & Scheduler",
        "og_description": "Create and schedule multi-channel social campaigns in minutes with Social AI.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/social",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.85,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/help",
        "path": "/help",
        "label": "Help Center & FAQ",
        "title": "Help Center, Guides & Customer Support",
        "description": "Browse setup guides, M-Pesa & card billing FAQs, SSO troubleshooting, and open direct support tickets with the Intermaven team.",
        "og_title": "Intermaven Help Center & Support",
        "og_description": "Fast answers, tutorials, and direct support for Intermaven and TuneMavens users.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/help",
        "schema_type": "FAQPage",
        "sitemap_include": True,
        "sitemap_priority": 0.7,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/forum",
        "path": "/forum",
        "label": "Community Forum",
        "title": "Creator & Entrepreneur Community Forum",
        "description": "Connect with independent artists, founders, DJs, producers, and marketers sharing growth playbooks and feedback across the Intermaven community.",
        "og_title": "Intermaven Community Forum",
        "og_description": "Collaborate, share strategies, and grow alongside thousands of creators and business owners.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/forum",
        "schema_type": "WebSite",
        "sitemap_include": True,
        "sitemap_priority": 0.7,
        "sitemap_changefreq": "daily",
        "noindex": False,
    },
    {
        "_id": "/blog",
        "path": "/blog",
        "label": "Blog & Editorial",
        "title": "Insights on AI, Music Business & African Creator Economy",
        "description": "Read actionable guides on music distribution, sync licensing, SME automation, M-Pesa commerce, and AI branding from the Intermaven editorial team.",
        "og_title": "Intermaven Blog — AI, Music & Business Playbooks",
        "og_description": "Deep dives and playbooks for modern creators, labels, and entrepreneurs.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/blog",
        "schema_type": "Article",
        "sitemap_include": True,
        "sitemap_priority": 0.75,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/affiliates",
        "path": "/affiliates",
        "label": "Affiliate Partner Program",
        "title": "Affiliate Program — Earn Recurring Commissions",
        "description": "Join the Intermaven Affiliate Program and earn recurring commissions referring creators, artists, agencies, and businesses to Intermaven.",
        "og_title": "Intermaven Affiliates — Partner & Earn",
        "og_description": "Share Intermaven with your audience and earn recurring payouts on paid upgrades.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/affiliates",
        "schema_type": "WebSite",
        "sitemap_include": True,
        "sitemap_priority": 0.65,
        "sitemap_changefreq": "monthly",
        "noindex": False,
    },
    {
        "_id": "/developers",
        "path": "/developers",
        "label": "Developers & API",
        "title": "Developer Portal — Mother-CMS, SSO & Platform APIs",
        "description": "Integrate Intermaven SSO, Mother-CMS multi-portal content delivery, and webhook events into your own web and mobile applications.",
        "og_title": "Intermaven Developers — APIs, SSO & Headless CMS",
        "og_description": "Documentation and endpoints for integrating with the Intermaven platform.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/developers",
        "schema_type": "SoftwareApplication",
        "sitemap_include": True,
        "sitemap_priority": 0.65,
        "sitemap_changefreq": "monthly",
        "noindex": False,
    },
    {
        "_id": "/careers",
        "path": "/careers",
        "label": "Careers",
        "title": "Careers — Build the Future of Creative & Business Tech",
        "description": "Explore engineering, product, design, and growth roles at Intermaven across Nairobi, Atlanta, and remote teams.",
        "og_title": "Careers at Intermaven",
        "og_description": "Join our team building AI and operational tools for creators and businesses.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/careers",
        "schema_type": "Organization",
        "sitemap_include": True,
        "sitemap_priority": 0.6,
        "sitemap_changefreq": "monthly",
        "noindex": False,
    },
    {
        "_id": "/for",
        "path": "/for",
        "label": "Perfect For — Personas & Industries",
        "title": "Built for Musicians, Labels, DJs, Agencies & Ambitious SMEs",
        "description": "See how Intermaven tailors AI workflows, Smart CRM, POS, and music distribution for independent artists, record labels, DJs, producers, and founders.",
        "og_title": "Who Intermaven Is Built For — Creators, Labels & SMEs",
        "og_description": "Tailored AI & operational suites for musicians, DJs, labels, agencies, and businesses.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/for",
        "schema_type": "WebSite",
        "sitemap_include": True,
        "sitemap_priority": 0.8,
        "sitemap_changefreq": "weekly",
        "noindex": False,
    },
    {
        "_id": "/terms",
        "path": "/terms",
        "label": "Terms of Service",
        "title": "Terms of Service, Acceptable Use & Account Policy",
        "description": "Review Intermaven's Terms of Service governing platform accounts, AI credits, subscriptions, intellectual property, and acceptable use.",
        "og_title": "Terms of Service | Intermaven",
        "og_description": "Official Terms of Service for Intermaven platforms and applications.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/terms",
        "schema_type": "WebSite",
        "sitemap_include": True,
        "sitemap_priority": 0.4,
        "sitemap_changefreq": "monthly",
        "noindex": False,
    },
    {
        "_id": "/privacy",
        "path": "/privacy",
        "label": "Privacy Policy",
        "title": "Privacy Policy & Data Protection",
        "description": "Learn how Intermaven collects, safeguards, and processes personal data in compliance with GDPR, Kenya DPA, and global privacy standards.",
        "og_title": "Privacy Policy | Intermaven",
        "og_description": "How Intermaven protects your account, creative assets, and personal information.",
        "og_image": "/images/hero/intermaven/hero-1.jpg",
        "canonical": "https://intermaven.io/privacy",
        "schema_type": "WebSite",
        "sitemap_include": True,
        "sitemap_priority": 0.4,
        "sitemap_changefreq": "monthly",
        "noindex": False,
    },
]


# ============== SEEDING & SERIALIZATION HELPERS ==============

def seed_default_seo():
    """Idempotently seed global SEO config and default page entries."""
    if db is None:
        return
    try:
        now = datetime.now(timezone.utc)
        if not db.seo_config.find_one({"_id": "global"}):
            db.seo_config.insert_one({**DEFAULT_GLOBAL_SEO, "updated_at": now})
        for page in DEFAULT_SEO_PAGES:
            if not db.seo_pages.find_one({"_id": page["_id"]}):
                db.seo_pages.insert_one({**page, "created_at": now, "updated_at": now})
    except Exception as e:
        import logging
        logging.warning(f"SEO seed skipped: {e}")


def _normalize_path(path: str) -> str:
    p = (path or "/").strip()
    if not p.startswith("/"):
        p = "/" + p
    if len(p) > 1 and p.endswith("/"):
        p = p.rstrip("/")
    return p


def _get_global_config() -> Dict[str, Any]:
    if db is None:
        return {**DEFAULT_GLOBAL_SEO}
    doc = db.seo_config.find_one({"_id": "global"})
    if not doc:
        seed_default_seo()
        doc = db.seo_config.find_one({"_id": "global"}) or {**DEFAULT_GLOBAL_SEO}
    merged = {**DEFAULT_GLOBAL_SEO, **doc}
    for sub_key in ("verification", "organization", "social_accounts", "pixels", "robots", "performance_targets"):
        merged[sub_key] = {**DEFAULT_GLOBAL_SEO.get(sub_key, {}), **(doc.get(sub_key) or {})}
    if isinstance(merged.get("updated_at"), datetime):
        merged["updated_at"] = merged["updated_at"].isoformat()
    return merged


def _serialize_page(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = {**doc}
    out["path"] = out.get("path") or str(out.get("_id", "/"))
    out["_id"] = str(out.get("_id", out["path"]))
    for k in ("created_at", "updated_at"):
        if isinstance(out.get(k), datetime):
            out[k] = out[k].isoformat()
    return out


def _get_all_pages() -> List[Dict[str, Any]]:
    if db is None:
        return [{**p} for p in DEFAULT_SEO_PAGES]
    docs = list(db.seo_pages.find({}).sort("sitemap_priority", -1))
    if not docs:
        seed_default_seo()
        docs = list(db.seo_pages.find({}).sort("sitemap_priority", -1))
    return [_serialize_page(d) for d in docs]


def build_json_ld_graph(cfg: Dict[str, Any], page: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Construct a rich Schema.org @graph combining Organization (with sameAs), BreadcrumbList, and page schema."""
    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    org_cfg = cfg.get("organization") or {}
    socials = cfg.get("social_accounts") or {}

    same_as: List[str] = []
    for k in ("instagram", "tiktok", "x", "linkedin", "youtube", "facebook"):
        val = (socials.get(k) or "").strip()
        if val:
            same_as.append(val)
    for eco_url in socials.get("ecosystem") or []:
        if eco_url and eco_url.strip() and eco_url.strip() not in same_as:
            same_as.append(eco_url.strip())

    org_node: Dict[str, Any] = {
        "@type": "Organization",
        "@id": f"{base_url}/#organization",
        "name": org_cfg.get("name") or cfg.get("site_name") or "Intermaven",
        "legalName": org_cfg.get("legal_name") or "Intermaven Technologies",
        "url": org_cfg.get("url") or base_url,
        "logo": org_cfg.get("logo") or cfg.get("default_og_image") or f"{base_url}/icon-512.png",
        "sameAs": same_as,
    }
    if org_cfg.get("contact_email") or org_cfg.get("contact_phone"):
        org_node["contactPoint"] = {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": org_cfg.get("contact_email") or "hello@intermaven.io",
            "telephone": org_cfg.get("contact_phone") or "+254 700 000 000",
        }

    graph: List[Dict[str, Any]] = [org_node]

    if page:
        path = _normalize_path(page.get("path") or "/")
        page_url = page.get("canonical") or (f"{base_url}/" if path == "/" else f"{base_url}{path}")
        schema_type = page.get("schema_type") or "WebSite"
        title = page.get("title") or cfg.get("default_title") or "Intermaven"
        desc = page.get("description") or cfg.get("default_description") or ""

        # BreadcrumbList for sub-pages
        if path != "/":
            graph.append({
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{base_url}/"},
                    {"@type": "ListItem", "position": 2, "name": page.get("label") or title, "item": page_url},
                ],
            })

        if page.get("schema_json") and isinstance(page["schema_json"], dict):
            graph.append(page["schema_json"])
        elif schema_type == "WebSite":
            graph.append({
                "@type": "WebSite",
                "@id": f"{base_url}/#website",
                "url": base_url,
                "name": cfg.get("site_name") or "Intermaven",
                "description": desc,
                "publisher": {"@id": f"{base_url}/#organization"},
            })
        elif schema_type == "SoftwareApplication":
            graph.append({
                "@type": "SoftwareApplication",
                "name": f"{page.get('label') or title} — Intermaven",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "url": page_url,
                "description": desc,
                "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
                "publisher": {"@id": f"{base_url}/#organization"},
            })
        elif schema_type == "Product":
            graph.append({
                "@type": "Product",
                "name": title,
                "description": desc,
                "brand": {"@id": f"{base_url}/#organization"},
                "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "0",
                    "highPrice": "49",
                    "priceCurrency": "USD",
                    "offerCount": "3",
                },
            })
        elif schema_type == "FAQPage":
            graph.append({
                "@type": "FAQPage",
                "name": title,
                "url": page_url,
                "description": desc,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "How do free AI starter credits work on Intermaven?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Every new Intermaven account starts with 150 free credits to generate brand kits, artist bios, sync pitches, and social campaigns.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "Which payment methods are supported?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Intermaven supports M-Pesa instant mobile money, Visa, Mastercard, Pesapal, Stripe, and PayPal across 55+ currencies.",
                        },
                    },
                ],
            })
        elif schema_type == "Article":
            graph.append({
                "@type": "Article",
                "headline": title,
                "description": desc,
                "url": page_url,
                "image": page.get("og_image") or cfg.get("default_og_image"),
                "publisher": {"@id": f"{base_url}/#organization"},
            })
        elif schema_type == "LocalBusiness":
            graph.append({
                "@type": "LocalBusiness",
                "name": org_cfg.get("name") or "Intermaven",
                "url": page_url,
                "telephone": org_cfg.get("contact_phone") or "+254 700 000 000",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": org_cfg.get("address_locality") or "Nairobi",
                    "addressCountry": org_cfg.get("address_country") or "KE",
                },
            })

    return {"@context": "https://schema.org", "@graph": graph}


# ============== PYDANTIC MODELS ==============

class SeoGlobalUpdate(BaseModel):
    site_name: Optional[str] = None
    base_url: Optional[str] = None
    title_template: Optional[str] = None
    default_title: Optional[str] = None
    default_description: Optional[str] = None
    default_keywords: Optional[str] = None
    default_og_image: Optional[str] = None
    twitter_card: Optional[str] = None
    twitter_handle: Optional[str] = None
    locale: Optional[str] = None
    verification: Optional[Dict[str, str]] = None
    organization: Optional[Dict[str, Any]] = None
    social_accounts: Optional[Dict[str, Any]] = None
    pixels: Optional[Dict[str, Any]] = None
    robots: Optional[Dict[str, Any]] = None
    performance_targets: Optional[Dict[str, Any]] = None


class SeoPageUpsert(BaseModel):
    model_config = {"protected_namespaces": ()}
    path: str
    label: Optional[str] = ""
    title: str
    description: str
    og_title: Optional[str] = ""
    og_description: Optional[str] = ""
    og_image: Optional[str] = ""
    canonical: Optional[str] = ""
    schema_type: Optional[str] = "WebSite"
    schema_json: Optional[Dict[str, Any]] = None
    sitemap_include: bool = True
    sitemap_priority: float = Field(default=0.7, ge=0.0, le=1.0)
    sitemap_changefreq: str = "weekly"
    noindex: bool = False


class SeoAiSuggestRequest(BaseModel):
    path: str = "/"
    label: Optional[str] = ""
    current_title: Optional[str] = ""
    current_description: Optional[str] = ""
    focus_keywords: Optional[str] = ""
    portal: Optional[str] = "business"


# ============== PUBLIC SEO, SITEMAP & ROBOTS ENDPOINTS ==============

@router.get("/api/seo/public")
async def get_public_seo_bundle():
    """Returns global SEO config, Organization JSON-LD, pixels, and per-page overrides for instant client resolution."""
    cfg = _get_global_config()
    pages = _get_all_pages()
    pages_by_path = {p["path"]: p for p in pages}
    return {
        "global": cfg,
        "pages": pages_by_path,
        "organization_json_ld": build_json_ld_graph(cfg, pages_by_path.get("/")),
    }


@router.get("/api/seo/resolve")
async def resolve_page_seo(path: str = Query("/")):
    cfg = _get_global_config()
    norm = _normalize_path(path)
    page = None
    if db is not None:
        doc = db.seo_pages.find_one({"_id": norm})
        if doc:
            page = _serialize_page(doc)
    if not page:
        page = next((p for p in DEFAULT_SEO_PAGES if p["path"] == norm), None)

    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    tpl = cfg.get("title_template") or "%s | Intermaven"
    raw_title = (page or {}).get("title") or cfg.get("default_title") or "Intermaven"
    formatted_title = tpl.replace("%s", raw_title) if "%s" in tpl and raw_title != cfg.get("default_title") else raw_title
    desc = (page or {}).get("description") or cfg.get("default_description") or ""
    canonical = (page or {}).get("canonical") or (f"{base_url}/" if norm == "/" else f"{base_url}{norm}")

    return {
        "path": norm,
        "title": formatted_title,
        "raw_title": raw_title,
        "description": desc,
        "canonical": canonical,
        "og_title": (page or {}).get("og_title") or formatted_title,
        "og_description": (page or {}).get("og_description") or desc,
        "og_image": (page or {}).get("og_image") or cfg.get("default_og_image"),
        "twitter_card": cfg.get("twitter_card", "summary_large_image"),
        "twitter_handle": cfg.get("twitter_handle", "@intermaven"),
        "noindex": bool((page or {}).get("noindex", False)),
        "json_ld": build_json_ld_graph(cfg, page),
    }


def _render_sitemap_xml() -> str:
    cfg = _get_global_config()
    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    pages = _get_all_pages()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    urls_xml: List[str] = []
    seen_locs = set()

    for p in pages:
        if not p.get("sitemap_include", True) or p.get("noindex", False):
            continue
        path = _normalize_path(p.get("path") or "/")
        loc = p.get("canonical") or (f"{base_url}/" if path == "/" else f"{base_url}{path}")
        if loc in seen_locs:
            continue
        seen_locs.add(loc)
        lastmod_raw = str(p.get("updated_at") or today)[:10]
        freq = p.get("sitemap_changefreq") or "weekly"
        prio = f"{float(p.get('sitemap_priority', 0.7)):.1f}"
        urls_xml.append(
            f"  <url>\n"
            f"    <loc>{xml_escape(loc)}</loc>\n"
            f"    <lastmod>{xml_escape(lastmod_raw)}</lastmod>\n"
            f"    <changefreq>{xml_escape(freq)}</changefreq>\n"
            f"    <priority>{prio}</priority>\n"
            f"  </url>"
        )

    # Also include public published artist EPKs dynamically
    if db is not None:
        try:
            for epk in db.epks.find({"published": True}, {"username": 1, "updated_at": 1}).limit(500):
                uname = (epk.get("username") or "").strip()
                if not uname:
                    continue
                loc = f"{base_url}/epk/{uname}"
                if loc in seen_locs:
                    continue
                seen_locs.add(loc)
                lm = epk["updated_at"].strftime("%Y-%m-%d") if isinstance(epk.get("updated_at"), datetime) else today
                urls_xml.append(
                    f"  <url>\n"
                    f"    <loc>{xml_escape(loc)}</loc>\n"
                    f"    <lastmod>{lm}</lastmod>\n"
                    f"    <changefreq>weekly</changefreq>\n"
                    f"    <priority>0.6</priority>\n"
                    f"  </url>"
                )
        except Exception:
            pass

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls_xml)
        + "\n</urlset>\n"
    )


def _render_robots_txt() -> str:
    cfg = _get_global_config()
    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    robots = cfg.get("robots") or {}
    lines = ["User-agent: *"]
    if not robots.get("allow_indexing", True):
        lines.append("Disallow: /")
    else:
        lines.append("Allow: /")
        for dis in robots.get("disallow_paths") or []:
            if dis and str(dis).strip():
                lines.append(f"Disallow: {str(dis).strip()}")
    custom = (robots.get("custom_rules") or "").strip()
    if custom:
        lines.append("")
        lines.append(custom)
    lines.append("")
    lines.append(f"Sitemap: {base_url}/sitemap.xml")
    return "\n".join(lines) + "\n"


@router.get("/sitemap.xml")
@router.get("/api/seo/sitemap.xml")
async def get_sitemap_xml():
    return Response(content=_render_sitemap_xml(), media_type="application/xml")


@router.get("/robots.txt")
@router.get("/api/seo/robots.txt")
async def get_robots_txt():
    return Response(content=_render_robots_txt(), media_type="text/plain")


# ============== ADMIN SEO CONTROL CENTER ENDPOINTS ==============

@router.get("/api/admin/seo/config")
async def admin_get_seo_config(admin: dict = Depends(get_admin_user)):
    return {
        "config": _get_global_config(),
        "schema_types": SCHEMA_TYPES,
        "robots_preview": _render_robots_txt(),
        "sitemap_url_count": len([p for p in _get_all_pages() if p.get("sitemap_include", True) and not p.get("noindex")]),
    }


@router.put("/api/admin/seo/config")
async def admin_update_seo_config(data: SeoGlobalUpdate, admin: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    existing = _get_global_config()
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    for nested in ("verification", "organization", "social_accounts", "pixels", "robots", "performance_targets"):
        if nested in payload and isinstance(payload[nested], dict):
            payload[nested] = {**(existing.get(nested) or {}), **payload[nested]}
    payload["updated_at"] = datetime.now(timezone.utc)
    payload["updated_by"] = str(admin["_id"])

    db.seo_config.update_one({"_id": "global"}, {"$set": payload}, upsert=True)
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "seo_config_update", details={"updated_fields": list(payload.keys())})
    return {"success": True, "config": _get_global_config(), "robots_preview": _render_robots_txt()}


@router.get("/api/admin/seo/pages")
async def admin_list_seo_pages(admin: dict = Depends(get_admin_user)):
    pages = _get_all_pages()
    return {"pages": pages, "total": len(pages), "schema_types": SCHEMA_TYPES}


@router.put("/api/admin/seo/pages")
async def admin_upsert_seo_page(body: SeoPageUpsert, admin: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    norm = _normalize_path(body.path)
    cfg = _get_global_config()
    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    now = datetime.now(timezone.utc)

    doc_update = {
        "path": norm,
        "label": body.label or norm,
        "title": body.title.strip(),
        "description": body.description.strip(),
        "og_title": (body.og_title or body.title).strip(),
        "og_description": (body.og_description or body.description).strip(),
        "og_image": (body.og_image or cfg.get("default_og_image") or "").strip(),
        "canonical": (body.canonical or (f"{base_url}/" if norm == "/" else f"{base_url}{norm}")).strip(),
        "schema_type": body.schema_type if body.schema_type in SCHEMA_TYPES else "WebSite",
        "schema_json": body.schema_json,
        "sitemap_include": body.sitemap_include,
        "sitemap_priority": round(float(body.sitemap_priority), 2),
        "sitemap_changefreq": body.sitemap_changefreq or "weekly",
        "noindex": body.noindex,
        "updated_at": now,
        "updated_by": str(admin["_id"]),
    }
    db.seo_pages.update_one(
        {"_id": norm},
        {"$set": doc_update, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    saved = db.seo_pages.find_one({"_id": norm})
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "seo_page_upsert", details={"path": norm, "title": body.title})
    return {"success": True, "page": _serialize_page(saved)}


@router.delete("/api/admin/seo/pages")
async def admin_delete_seo_page(path: str = Query(...), admin: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    norm = _normalize_path(path)
    if norm == "/":
        raise HTTPException(status_code=400, detail="Cannot delete root homepage SEO entry")
    res = db.seo_pages.delete_one({"_id": norm})
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "seo_page_delete", details={"path": norm})
    return {"deleted": res.deleted_count > 0, "path": norm}


@router.post("/api/admin/seo/ai-suggest")
async def admin_seo_ai_suggest(req: SeoAiSuggestRequest, admin: dict = Depends(get_admin_user)):
    """AI-assisted SEO title, meta description, Open Graph copy & Schema type recommender."""
    norm = _normalize_path(req.path)
    page_label = req.label or norm.strip("/").replace("-", " ").title() or "Homepage"
    kw = (req.focus_keywords or "").strip()

    fallback_title = (
        f"{page_label} — AI Tools, CRM & Creator Growth"[:58]
        if norm != "/"
        else "AI Business, Smart CRM & Music Creator Operating System"
    )
    fallback_desc = (
        f"Discover {page_label} on Intermaven. Build your brand, automate client outreach, and scale with AI tools, "
        f"M-Pesa & global card billing. Start free with 150 credits."
    )[:158]

    system_msg = (
        "You are an elite Technical SEO Strategist using Claude Sonnet 4.5 best practices. "
        "Return ONLY valid JSON with keys: title (45-60 chars, no trailing '| Brand'), "
        "description (135-158 chars, compelling CTA), og_title, og_description, keywords (comma-separated), "
        "and schema_type (one of WebSite, Organization, SoftwareApplication, Product, FAQPage, Article, LocalBusiness)."
    )
    prompt = (
        f"Route Path: {norm}\n"
        f"Page Name: {page_label}\n"
        f"Target Portal: {req.portal}\n"
        f"Focus Keywords: {kw or 'Intermaven, AI business tools, Smart CRM, African & global creators'}\n"
        f"Current Title: {req.current_title or '(none)'}\n"
        f"Current Description: {req.current_description or '(none)'}\n\n"
        "Generate optimized SEO metadata JSON now:"
    )

    try:
        import json
        from llm_fallback import run_llm_completion
        raw = await run_llm_completion(prompt=prompt, system_message=system_msg, session_id=f"seo-suggest-{norm}")
        cleaned = re.sub(r"^```(?:json)?|```$", "", (raw or "").strip(), flags=re.MULTILINE).strip()
        parsed = json.loads(cleaned)
        return {
            "success": True,
            "suggestion": {
                "title": (parsed.get("title") or fallback_title)[:65],
                "description": (parsed.get("description") or fallback_desc)[:165],
                "og_title": (parsed.get("og_title") or parsed.get("title") or fallback_title)[:70],
                "og_description": (parsed.get("og_description") or parsed.get("description") or fallback_desc)[:180],
                "keywords": parsed.get("keywords") or kw or "Intermaven, AI Studio, Smart CRM, Creator OS",
                "schema_type": parsed.get("schema_type") if parsed.get("schema_type") in SCHEMA_TYPES else "SoftwareApplication",
            },
            "source": "ai",
        }
    except Exception:
        return {
            "success": True,
            "suggestion": {
                "title": fallback_title,
                "description": fallback_desc,
                "og_title": f"{fallback_title} | Intermaven",
                "og_description": fallback_desc,
                "keywords": kw or f"Intermaven, {page_label}, AI tools, Smart CRM, TuneMavens",
                "schema_type": "SoftwareApplication" if norm in ("/tools", "/apps", "/cms", "/smartcrm", "/brandkit", "/social") else "WebSite",
            },
            "source": "smart_template",
        }


# ============== AUTOMATED FULL SEO, ALT-TEXT & LINK AUDIT PASS ==============

def _scan_frontend_source_health(known_paths: set) -> Dict[str, Any]:
    """Scans frontend JSX files (when accessible in repo) for missing image alt attributes and broken internal links."""
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    src_dir = os.path.join(repo_root, "frontend", "src")
    missing_alts: List[Dict[str, Any]] = []
    total_imgs = 0
    broken_links: List[Dict[str, Any]] = []
    total_links = 0

    valid_prefixes = (
        "/dashboard", "/admin", "/auth", "/epk/", "/artist/", "/embed/", "/sso/", "/article/",
        "/help/article/", "/forum/article/", "/for/", "/perfect-for", "/persona/",
        "/cookies", "/refund", "/distro", "/pos", "/musicbio", "/syncpitch",
        "/images/", "/icons/", "/docs/",
    )

    if not os.path.isdir(src_dir):
        return {
            "scanned_files": 0,
            "total_images": 0,
            "images_with_alt": 0,
            "missing_alt_items": [],
            "total_internal_links": 0,
            "broken_link_items": [],
        }

    scanned_files = 0
    img_pattern = re.compile(r"<img\b([^>]*?)/?>", re.DOTALL)
    link_pattern = re.compile(r"""(?:to|href)\s*=\s*["'](/[^"'#?\s]*)["']""")

    for root, _, files in os.walk(src_dir):
        for fname in files:
            if not fname.endswith((".js", ".jsx")):
                continue
            scanned_files += 1
            fpath = os.path.join(root, fname)
            rel_file = os.path.relpath(fpath, repo_root).replace("\\", "/")
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            except Exception:
                continue

            for m in img_pattern.finditer(text):
                total_imgs += 1
                attrs = m.group(1) or ""
                if not re.search(r"\balt\s*=", attrs):
                    line_no = text.count("\n", 0, m.start()) + 1
                    missing_alts.append({"file": rel_file, "line": line_no})

            for lm in link_pattern.finditer(text):
                target = _normalize_path(lm.group(1))
                total_links += 1
                if target in known_paths or any(target.startswith(pref) for pref in valid_prefixes):
                    continue
                line_no = text.count("\n", 0, lm.start()) + 1
                broken_links.append({"file": rel_file, "line": line_no, "target": target})

    return {
        "scanned_files": scanned_files,
        "total_images": total_imgs,
        "images_with_alt": max(0, total_imgs - len(missing_alts)),
        "missing_alt_items": missing_alts[:25],
        "total_internal_links": total_links,
        "broken_link_items": broken_links[:25],
    }


@router.get("/api/admin/seo/audits")
async def admin_list_seo_audits(admin: dict = Depends(get_admin_user)):
    if db is None:
        return {"audits": []}
    runs = []
    for r in db.seo_audits.find({}).sort("created_at", -1).limit(15):
        r["id"] = str(r.pop("_id"))
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()
        runs.append(r)
    return {"audits": runs}


@router.post("/api/admin/seo/audit")
async def admin_run_seo_audit(admin: dict = Depends(get_admin_user)):
    """Executes the Phase 9 comprehensive SEO, Structured Data, Alt-Text, Link & CWV Audit Pass."""
    cfg = _get_global_config()
    pages = _get_all_pages()
    known_paths = {p["path"] for p in pages}

    checks: List[Dict[str, Any]] = []
    page_findings: List[Dict[str, Any]] = []

    # 1. Global Meta & Indexing Checks
    robots_allow = bool((cfg.get("robots") or {}).get("allow_indexing", True))
    checks.append({
        "check_id": "robots_indexing",
        "category": "Crawlability & Indexing",
        "title": "Robots.txt allows search engine indexing",
        "status": "pass" if robots_allow else "fail",
        "detail": "Allow: / active with /sitemap.xml directive" if robots_allow else "Global Disallow: / is blocking crawlers!",
        "fix_mode": "auto",
        "fix_label": "Enable Indexing",
    })

    sitemap_xml = _render_sitemap_xml()
    sitemap_count = sitemap_xml.count("<url>")
    checks.append({
        "check_id": "sitemap_xml",
        "category": "Crawlability & Indexing",
        "title": "Dynamic XML Sitemap generator (/sitemap.xml)",
        "status": "pass" if sitemap_count >= 10 else "warn",
        "detail": f"{sitemap_count} indexable URLs active in /sitemap.xml",
        "fix_mode": "auto",
        "fix_label": "Seed Missing Routes",
    })

    verif = cfg.get("verification") or {}
    has_gsc = bool((verif.get("google_site_verification") or "").strip())
    has_bing = bool((verif.get("bing_site_verification") or "").strip())
    checks.append({
        "check_id": "webmaster_verification",
        "category": "Webmaster Verification",
        "title": "Google Search Console & Bing Webmaster tags",
        "status": "pass" if (has_gsc and has_bing) else "warn",
        "detail": (
            f"GSC: {'Configured' if has_gsc else 'Pending token'} · Bing: {'Configured' if has_bing else 'Pending token'}"
        ),
        "fix_mode": "modal_verification",
        "fix_label": "Configure Tokens",
    })

    socials = cfg.get("social_accounts") or {}
    active_socials = [k for k in ("instagram", "tiktok", "x", "linkedin", "youtube", "facebook") if (socials.get(k) or "").strip()]
    checks.append({
        "check_id": "social_sameas",
        "category": "Schema.org & Brand Graph",
        "title": "Organization JSON-LD + sameAs social graph",
        "status": "pass" if len(active_socials) >= 4 else "warn",
        "detail": f"{len(active_socials)}/6 social profiles + {len(socials.get('ecosystem') or [])} ecosystem domains linked in sameAs",
        "fix_mode": "auto",
        "fix_label": "Restore Social Graph",
        "nav_tab": "schema",
    })

    pixels = cfg.get("pixels") or {}
    consent_on = bool(pixels.get("consent_required", True))
    active_pixels = [k for k in ("ga4_id", "gtm_id", "meta_pixel_id", "tiktok_pixel_id", "linkedin_partner_id", "posthog_key", "plausible_domain") if (pixels.get(k) or "").strip()]
    checks.append({
        "check_id": "consent_gate",
        "category": "Analytics & Privacy",
        "title": "Consent-aware pixel manager",
        "status": "pass" if consent_on else "warn",
        "detail": f"Consent gate: {'Enabled (GDPR/DPA safe)' if consent_on else 'Disabled'} · {len(active_pixels)} tracking ID(s) configured",
        "fix_mode": "auto",
        "fix_label": "Enable Consent Gate",
        "nav_tab": "pixels",
    })

    # 2. Per-Page Meta & Structured Data Audit
    seen_titles: Dict[str, str] = {}
    seen_descs: Dict[str, str] = {}
    healthy_pages = 0

    for p in pages:
        issues: List[str] = []
        t = (p.get("title") or "").strip()
        d = (p.get("description") or "").strip()
        path = p.get("path") or "/"

        if not t:
            issues.append("Missing page title")
        elif len(t) < 20:
            issues.append(f"Title too short ({len(t)} chars; aim for 35–60)")
        elif len(t) > 70:
            issues.append(f"Title may truncate in SERPs ({len(t)} chars; aim for <= 65)")

        if not d:
            issues.append("Missing meta description")
        elif len(d) < 90:
            issues.append(f"Meta description short ({len(d)} chars; aim for 120–160)")
        elif len(d) > 175:
            issues.append(f"Meta description long ({len(d)} chars; aim for <= 165)")

        if t and t.lower() in seen_titles:
            issues.append(f"Duplicate title with {seen_titles[t.lower()]}")
        elif t:
            seen_titles[t.lower()] = path

        if d and d.lower() in seen_descs:
            issues.append(f"Duplicate description with {seen_descs[d.lower()]}")
        elif d:
            seen_descs[d.lower()] = path

        if not (p.get("og_image") or cfg.get("default_og_image")):
            issues.append("Missing Open Graph image")
        if not p.get("canonical"):
            issues.append("Missing explicit canonical URL")

        if not issues:
            healthy_pages += 1
        page_findings.append({
            "path": path,
            "label": p.get("label") or path,
            "schema_type": p.get("schema_type") or "WebSite",
            "title_len": len(t),
            "desc_len": len(d),
            "status": "pass" if not issues else "warn",
            "issues": issues,
        })

    checks.append({
        "check_id": "on_page_meta",
        "category": "On-Page Meta & Canonicals",
        "title": "Per-route titles, descriptions, canonicals & JSON-LD",
        "status": "pass" if healthy_pages == len(pages) else "warn",
        "detail": f"{healthy_pages}/{len(pages)} registered routes pass all title, description, canonical & OG checks",
        "fix_mode": "auto",
        "fix_label": "Auto-Fix Route Meta",
        "nav_tab": "pages",
    })

    # 3. Codebase Image Alt-Text & Broken Internal Link Scan
    source_scan = _scan_frontend_source_health(known_paths)
    missing_alt_count = len(source_scan["missing_alt_items"])
    broken_link_count = len(source_scan["broken_link_items"])

    checks.append({
        "check_id": "image_alt_text",
        "category": "Accessibility & Image SEO",
        "title": "Image alt-text coverage across UI components",
        "status": "pass" if missing_alt_count == 0 else "warn",
        "detail": (
            f"{source_scan['images_with_alt']}/{source_scan['total_images']} <img> elements include alt attributes"
            if source_scan["total_images"]
            else "No missing alt attributes detected"
        ),
        "fix_mode": "auto",
        "fix_label": "Auto-Tag Missing Alt",
    })

    checks.append({
        "check_id": "internal_links",
        "category": "Internal Link Integrity",
        "title": "Internal route link verification",
        "status": "pass" if broken_link_count == 0 else "warn",
        "detail": (
            f"{source_scan['total_internal_links']} internal links verified, {broken_link_count} unmapped link(s)"
        ),
        "fix_mode": "auto",
        "fix_label": "Register Unmapped Routes",
    })

    # Compute Weighted Score (0-100)
    meta_score = round((healthy_pages / max(1, len(pages))) * 100)
    crawl_score = 100 if (robots_allow and sitemap_count >= 10) else (60 if robots_allow else 20)
    schema_score = min(100, 60 + len(active_socials) * 7)
    alt_score = (
        round((source_scan["images_with_alt"] / source_scan["total_images"]) * 100)
        if source_scan["total_images"] > 0
        else 100
    )
    link_score = max(0, 100 - broken_link_count * 10)
    overall_score = round(meta_score * 0.35 + crawl_score * 0.25 + schema_score * 0.15 + alt_score * 0.15 + link_score * 0.10)

    report = {
        "run_id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc),
        "created_by": str(admin["_id"]),
        "overall_score": overall_score,
        "category_scores": {
            "on_page_meta": meta_score,
            "crawlability": crawl_score,
            "structured_data": schema_score,
            "image_alt_text": alt_score,
            "internal_links": link_score,
        },
        "checks": checks,
        "page_findings": page_findings,
        "source_scan": source_scan,
        "cwv_targets": cfg.get("performance_targets") or DEFAULT_GLOBAL_SEO["performance_targets"],
        "summary": (
            f"SEO Health Score: {overall_score}/100 — {healthy_pages}/{len(pages)} routes fully optimized, "
            f"{sitemap_count} URLs in sitemap.xml, {source_scan['images_with_alt']}/{source_scan['total_images']} images with alt text."
        ),
    }

    if db is not None:
        ins = db.seo_audits.insert_one({**report})
        report["id"] = str(ins.inserted_id)
        report.pop("_id", None)
    report["created_at"] = report["created_at"].isoformat()

    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "seo_audit_run", details={"overall_score": overall_score})
    return report


# ============== IN-SYSTEM POST-AUDIT REMEDIATION ENGINE ==============

class SeoRemediateRequest(BaseModel):
    action: str  # "fix_all_auto" | "fix_check" | "fix_page"
    check_id: Optional[str] = None
    path: Optional[str] = None


def _auto_repair_single_page(p: Dict[str, Any], cfg: Dict[str, Any]) -> Dict[str, Any]:
    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    path = _normalize_path(p.get("path") or "/")
    label = (p.get("label") or path.strip("/").replace("-", " ").title() or "Homepage").strip()
    title = (p.get("title") or "").strip()
    desc = (p.get("description") or "").strip()

    if len(title) < 25:
        title = f"{label} — AI Studio, Smart CRM & Creator Platform"[:58]
    elif len(title) > 65:
        title = title[:62].rsplit(" ", 1)[0]

    if len(desc) < 95:
        desc = (
            f"Explore {label} on Intermaven — unified AI tools, Smart CRM, M-Pesa & global card billing "
            f"built for ambitious creators, labels, and businesses."
        )[:158]
    elif len(desc) > 168:
        desc = desc[:160].rsplit(" ", 1)[0] + "."

    canonical = (p.get("canonical") or "").strip() or (f"{base_url}/" if path == "/" else f"{base_url}{path}")
    og_img = (p.get("og_image") or "").strip() or cfg.get("default_og_image") or "/images/hero/intermaven/hero-1.jpg"
    if og_img == "https://intermaven.io/icon-512.png":
        og_img = "/images/hero/intermaven/hero-1.jpg"

    return {
        **p,
        "path": path,
        "label": label,
        "title": title,
        "description": desc,
        "og_title": (p.get("og_title") or title)[:68],
        "og_description": (p.get("og_description") or desc)[:168],
        "og_image": og_img,
        "canonical": canonical,
    }


def _auto_tag_missing_jsx_alts() -> int:
    """Safely adds descriptive alt attributes to any JSX <img> tags missing alt= in frontend/src."""
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    src_dir = os.path.join(repo_root, "frontend", "src")
    if not os.path.isdir(src_dir):
        return 0
    fixed_count = 0
    img_pattern = re.compile(r"<img\b([^>]*?)(/?)>", re.DOTALL)

    for root, _, files in os.walk(src_dir):
        for fname in files:
            if not fname.endswith((".js", ".jsx")):
                continue
            fpath = os.path.join(root, fname)
            base_label = os.path.splitext(fname)[0].replace("Page", "").replace("Panel", "") or "Intermaven"
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    original = f.read()
            except Exception:
                continue

            changed_in_file = False

            def _repl(match):
                nonlocal fixed_count, changed_in_file
                attrs = match.group(1) or ""
                slash = match.group(2) or ""
                if re.search(r"\balt\s*=", attrs):
                    return match.group(0)
                fixed_count += 1
                changed_in_file = True
                return f'<img{attrs} alt="{base_label} visual" {slash}>'

            updated = img_pattern.sub(_repl, original)
            if changed_in_file and updated != original:
                try:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(updated)
                except Exception:
                    pass
    return fixed_count


@router.post("/api/admin/seo/remediate")
async def admin_remediate_seo(req: SeoRemediateRequest, admin: dict = Depends(get_admin_user)):
    """Fixes post-audit SEO issues directly in MongoDB (and local JSX alt tags when applicable) and returns a fresh audit."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    now = datetime.now(timezone.utc)
    cfg = _get_global_config()
    base_url = (cfg.get("base_url") or "https://intermaven.io").rstrip("/")
    actions_applied: List[str] = []

    def _fix_robots():
        robots = {**(cfg.get("robots") or {}), "allow_indexing": True}
        db.seo_config.update_one({"_id": "global"}, {"$set": {"robots": robots, "updated_at": now}}, upsert=True)
        actions_applied.append("Enabled search engine indexing in robots.txt")

    def _fix_consent():
        pixels = {**(cfg.get("pixels") or {}), "consent_required": True}
        db.seo_config.update_one({"_id": "global"}, {"$set": {"pixels": pixels, "updated_at": now}}, upsert=True)
        actions_applied.append("Enabled GDPR / Kenya DPA cookie consent gate on tracking pixels")

    def _fix_socials():
        merged_socials = {**DEFAULT_GLOBAL_SEO["social_accounts"], **(cfg.get("social_accounts") or {})}
        for k, def_val in DEFAULT_GLOBAL_SEO["social_accounts"].items():
            if not merged_socials.get(k):
                merged_socials[k] = def_val
        db.seo_config.update_one({"_id": "global"}, {"$set": {"social_accounts": merged_socials, "updated_at": now}}, upsert=True)
        actions_applied.append("Restored Schema.org Organization sameAs social profiles")

    def _fix_pages(target_path: Optional[str] = None):
        seed_default_seo()
        pages = _get_all_pages()
        repaired_num = 0
        for p in pages:
            if target_path and p["path"] != _normalize_path(target_path):
                continue
            repaired = _auto_repair_single_page(p, cfg)
            repaired_doc = {k: v for k, v in repaired.items() if k not in ("_id", "created_at")}
            repaired_doc["updated_at"] = now
            repaired_doc["updated_by"] = str(admin["_id"])
            db.seo_pages.update_one({"_id": repaired["path"]}, {"$set": repaired_doc}, upsert=True)
            repaired_num += 1
        if repaired_num:
            actions_applied.append(f"Optimized metadata, canonicals & OG images for {repaired_num} route(s)")

    def _fix_unmapped_links():
        pages = _get_all_pages()
        known_paths = {p["path"] for p in pages}
        scan = _scan_frontend_source_health(known_paths)
        added = 0
        for item in scan.get("broken_link_items") or []:
            t_path = _normalize_path(item["target"])
            if t_path in known_paths:
                continue
            known_paths.add(t_path)
            lbl = t_path.strip("/").replace("-", " ").replace("/", " · ").title() or "Landing Page"
            new_doc = _auto_repair_single_page({"path": t_path, "label": lbl}, cfg)
            new_doc.pop("_id", None)
            new_doc["schema_type"] = "WebSite"
            new_doc["sitemap_include"] = True
            new_doc["sitemap_priority"] = 0.65
            new_doc["sitemap_changefreq"] = "weekly"
            new_doc["noindex"] = False
            new_doc["created_at"] = now
            new_doc["updated_at"] = now
            db.seo_pages.update_one({"_id": t_path}, {"$set": new_doc}, upsert=True)
            added += 1
        if added:
            actions_applied.append(f"Registered {added} unmapped internal route(s) into SEO registry & sitemap.xml")

    if req.action == "fix_page" and req.path:
        _fix_pages(target_path=req.path)
    elif req.action == "fix_check" and req.check_id:
        cid = req.check_id
        if cid == "robots_indexing":
            _fix_robots()
        elif cid == "sitemap_xml":
            seed_default_seo()
            actions_applied.append("Restored default indexable routes in sitemap.xml")
        elif cid == "social_sameas":
            _fix_socials()
        elif cid == "consent_gate":
            _fix_consent()
        elif cid == "on_page_meta":
            _fix_pages()
        elif cid == "internal_links":
            _fix_unmapped_links()
        elif cid == "image_alt_text":
            tagged = _auto_tag_missing_jsx_alts()
            actions_applied.append(f"Added descriptive alt attributes to {tagged} <img> tag(s)")
    elif req.action == "fix_all_auto":
        _fix_robots()
        _fix_consent()
        _fix_socials()
        _fix_unmapped_links()
        _fix_pages()
        tagged = _auto_tag_missing_jsx_alts()
        if tagged:
            actions_applied.append(f"Added descriptive alt attributes to {tagged} <img> tag(s)")
    else:
        raise HTTPException(status_code=400, detail="Unsupported remediation action")

    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "seo_remediate", details={"action": req.action, "applied": actions_applied})

    fresh_audit = await admin_run_seo_audit(admin)
    return {
        "success": True,
        "actions_applied": actions_applied,
        "audit": fresh_audit,
        "config": _get_global_config(),
        "pages": _get_all_pages(),
    }

