# Intermaven PRD — Living Snapshot

**Last updated: January 2026 (Wave-1 of Phase 10 Mother-CMS shipped)**

## Original Problem Statement
Multi-portal AI creative + business OS for African creatives and entrepreneurs.
Built from the `tunnel-vision-web/intermaven` GitHub repo.

## Personas
- Creator/Artist (music, fashion, content)
- Small-business owner (services, retail, hospitality)
- Agency / multi-brand operator (future Pro tier)
- Local service business (uses Google LSA strategy)

## Tech Stack
React 18 + FastAPI (Python 3.11) + MongoDB Atlas · JWT auth (bcrypt) · Claude Sonnet 4.5 via Emergent LLM key · recharts · reportlab (PDF playbook)

## Shipped (by session, January 2026)
- Initial pull-and-run from `intermaven` GitHub repo into `/app`
- UI polish: 3px corners everywhere, +1px app font, View-Site link, account-type badge, notifications, sales/credits cards, recharts analytics (7-day, donut, bar)
- Avatar upload (base64 to data-URL) → File Manager
- Channels hub (13 channels: Social/Google/Messaging) + Required-Channels card + per-app Status Strip
- Wizard system: Business Discovery modal → strategy generation (Claude Sonnet 4.5) → per-app wizards → Advanced toggle with state hand-off
- Strategy library + "Use this strategy" w/ 50/40/10 credit split
- Brand Playbook PDF export (reportlab)
- Google LSA + Instagram/TikTok Creator + WhatsApp Broadcast curated strategies seeded
- Geo-aware content scrubbing (M-Pesa/Nairobi/Africa) for Western visitors
- Region-aware phone numbers (RegionContext.contactPhone)
- Help/Forum article pages: PageHeader hero + navbar logo + footer logo
- Portal toggle (Business / Music / Hospitality coming soon) — filters sidebar APPS
- **Phase 10 Wave 1**: Mother-CMS backend + frontend hook + first migrations (PricingPage callout, Footer address/tagline/phone)

## Pending P0 (next sessions)
- Phase 10 Wave 2: Admin CMS editor UI + migrate remaining strings + /cms marketing page
- Phase 10 Wave 3: Atlanta TV Mount Pro consumes Mother-CMS
- Wave 2 of original roadmap: social OAuth (real), AI image gen (Nano Banana), AI video gen (Sora 2), preview pane, scheduling, auto-reply
- Phase 9 (LAST): Full SEO Management module + full SEO audit pass
- Comprehensive go-live plan update after Phase 9

## Active Credentials / Env
- `EMERGENT_LLM_KEY` (in backend/.env)
- `MONGO_URL` Atlas connection (in backend/.env)
- Optional: `STRATEGY_SPLIT_PLATFORM`, `STRATEGY_SPLIT_CREATOR`, `STRATEGY_SPLIT_FEES`, `STRATEGY_DEFAULT_COST`

## Mother-CMS — Flagship Differentiator
See `DOCUMENTATION.md §14` for full spec. Marketing positioning approved by user (Jan 2026). Phase-10 wave-1 done; wave-2 (admin UI + marketing page) and wave-3 (atltvmountpro consumer) remaining.
