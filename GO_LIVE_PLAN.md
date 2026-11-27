# Intermaven — Live Go-Live Plan (Post-Phase 9 Master Reconciliation)

**Last updated:** November 2026
**Status:** Feature-Complete Core Platform · Phases 0–10 Shipped · Ready for Production Credentials & Public Cutover
**Owner:** Intermaven Build Team
**SEO Audit Score:** `100 / 100` (18/18 routes optimized, dynamic `/sitemap.xml` & `/robots.txt` active, 100% image alt-text coverage)

---

## 1. Executive Snapshot

Intermaven is an AI-powered, multi-portal creative, music, hospitality, and business operating system built for African creators and SMEs with seamless Western and global localization.

All core engineering waves across **Self-Serve Auth**, **22 Reconciled Marketplace Apps**, **Mother-CMS (69 Portal & Region-Aware Keys)**, **Sentinel Cross-Platform QA Agent**, and **Phase 9 Admin SEO Control Center** are now implemented, compiled, and verified against MongoDB (`intermaven`). Remaining Go-Live items are strictly **production credential provisioning, DNS/SSL cutover, and launch PR**.

---

## 2. Definitive "Done vs. Remaining" Matrix

| Phase / Workstream | Scope | Engineering Status | Remaining Action Before Public Launch |
| :--- | :--- | :--- | :--- |
| **Phase 0 — Security & Debug Cleanup** | Remove debug log scaffolding, add security headers & CORS handling | **DONE** | Rotate `JWT_SECRET` & lock `allow_origins` to production domains in Render |
| **Phase 4 — Self-Serve Auth & SSO** | Register/login, OIDC SSO across ecosystem, SHA-256 single-use Forgot/Reset/Change Password | **DONE** | Add production `RESEND_API_KEY` so reset emails deliver via Resend instead of dev log |
| **Phase 5–7 — Core Studio, Wizard & Channels** | Ayo Business Discovery, WizardShell, Strategy Library (50/40/10 split), Playbook PDF, 13-channel hub | **DONE** | Provision live Meta, TikTok, X, LinkedIn, and Google OAuth app credentials |
| **Phase 8 — 22 Reconciled Marketplace Apps** | Brand Kit AI, Music Bio AI, Social AI, Sync Pitch AI, Pitch Deck AI, Press Release AI, Lyric & Hook AI, Merch Brief AI, AI Output Library, Smart CRM, EPK Builder, File Manager (S3/R2 ready), Distribution Tracker (181 DSP outlets), Hosting Manager, M-Pesa POS, Business Contract Builder, Invoice & Payments, Royalty Calculator, Tour Manager (TuneMavens Events Network), Grant Finder, Content Calendar, Affiliates | **DONE** | Wire live `STORAGE_BUCKET` (S3/R2) & live `PESAPAL_*` / `STRIPE_*` / `PAYPAL_*` webhook keys |
| **Phase 9 — Admin SEO Management Module** | `routes/seo.py` + `AdminSEOPanel.js` (`/admin/seo`), global meta, 18 route overrides, dynamic `/sitemap.xml` & `/robots.txt`, Organization + `sameAs` JSON-LD `@graph`, consent-aware pixel manager, AI meta copywriter, automated SEO/Alt-Text/Link/CWV Audit (`100/100`) | **DONE** | Paste live Google Search Console, Bing Webmaster, and GA4 tokens in **Admin → SEO Manager** |
| **Phase 10 — Mother-CMS (Wave 1 & 2)** | `routes/cms.py` + `CMSEditor.js` + `/cms` product page, 69 seeded keys with distinct `global`, `business`, `music`, and `hospitality` portal copy + regional overrides (`KE`, `US`, `GB`, `CA`, `NG`, `ZA`), live hero preview, AI copywriter, media library, revision history & 1-click rollback | **DONE** | Optional Wave 3: connect `atltvmountpro.com` & `tunemavens.com` to consume Mother-CMS API |
| **Sentinel Cross-Platform QA Agent** | Portable `/api/admin/test-agent` (`sentinel.py` + `SentinelPanel.js`) testing `intermaven`, `tunemavens`, `tunestream`, and `syncmavens` with AI triage | **DONE** | Set `TUNEMAVENS_API_URL`, `TUNESTREAM_API_URL`, `SYNCMAVENS_API_URL` in Render env |

---

## 3. Registered Backend Routers (`backend/routes/`)

All 33 modular FastAPI routers are active on port `8001` (`server.py`):
`auth` · `user` · `apps` · `files` · `folders` · `payments` · `epk` · `notifications` · `ai` · `public` · `crm` · `crm_smart` · `admin` · `geo` · `pricing` · `sso` · `wizard` · `strategies` · `channels` · `avatar` · `cms` · `distro` · `hosting` · `personas` · `support` · `social_ai` · `brandkit` · `affiliates` · `contracts` · `invoices` · `events_api_router` · `grants` · `sentinel` · `seo`

---

## 4. Final Pricing Tier Cut

| Tier | Monthly Price (USD / KES Localized) | Monthly Credits | Included Portals & Flagship Capabilities |
| :--- | :--- | :--- | :--- |
| **Free (Starter)** | `$0` / `KES 0` | `150` starter credits | Core AI Studio tools, 1 EPK, Smart CRM (starter), AI Output Library, Royalty Calculator |
| **Creator** | Localized via `/api/pricing` | `600` credits / mo | All 22 Marketplace Apps, Distribution Tracker, Tour Manager, Content Calendar, Mother-CMS (up to 3 portals) |
| **Pro / Business** | Localized via `/api/pricing` | `2,500` credits / mo | Multi-seat POS, Unlimited Invoices & Contracts, Priority Sync & Grant Pitches, Unlimited Mother-CMS Portals + White-Label API |

---

## 5. Production Credentials & Cutover Checklist

### 5.1 Environment Variables Required on Render (Backend)
- [x] `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_HOST`, `DB_NAME` (`intermaven`)
- [x] `EMERGENT_LLM_KEY`
- [ ] Rotate `JWT_SECRET` to a 64-byte cryptographic secret before public traffic
- [ ] `RESEND_API_KEY` + `EMAIL_FROM=noreply@intermaven.io` (activates live password-reset & CRM outreach emails)
- [ ] `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_IPN_ID` (Kenya M-Pesa & card checkout)
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (US/UK/EU/Global card checkout)
- [ ] `STORAGE_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `STORAGE_ENDPOINT_URL` (Cloudflare R2 / S3 file storage)
- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (SMS & WhatsApp broadcasts)

### 5.2 Final Pre-Launch Verification Steps
- [x] Run Phase 9 Automated SEO, Alt-Text & Internal Link Audit (`100/100` verified)
- [x] Run Sentinel QA Suite across all 14 local Intermaven health, auth, CMS, SEO, Distro, Events, Contracts, Grants & Calendar endpoints (`14/14` passing)
- [x] Verify production frontend build (`npm run build` exit code `0`)
- [ ] Restrict CORS in `backend/server.py` to `https://intermaven.io`, `https://www.intermaven.io`, `https://tunemavens.com`, `https://tunestream.co`, `https://syncmavens.com`
- [ ] Submit `https://intermaven.io/sitemap.xml` in Google Search Console & Bing Webmaster Tools
- [ ] Publish launch announcement via Intermaven Press Release AI + scheduled multi-channel Social AI campaign
