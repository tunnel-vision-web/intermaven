# Intermaven — Live Go-Live Plan (Updated)

**Last updated:** January 2026
**Status:** Pre-launch · Phase 10 Mother-CMS (Wave 1) shipped · Phase 9 SEO deferred to last
**Owner:** Intermaven Build Team
**Target launch:** rolling waves into Q1–Q2 2026

---

## 1. Executive snapshot

Intermaven is an AI-powered, multi-portal creative + business operating system for African creators and entrepreneurs (with growing Western and global reach). The platform is being built in incremental waves; each wave is shippable and revenue-relevant.

This document tracks **what's done · what's pending · what's blocked**, with deploy actions for each remaining item.

---

## 2. ✅ Already Shipped & Live in Preview

### Infrastructure & Core
- React 18 frontend + FastAPI backend + MongoDB Atlas (`intermaven` DB)
- JWT auth (bcrypt), Claude Sonnet 4.5 via Emergent LLM key
- Modular backend (17 routers), supervisor process management, hot reload
- Initial GitHub repo pulled into `/app` and runnable end-to-end

### Backend API (registered routers)
- `auth` · `user` · `apps` · `files` · `folders` · `payments` · `epk` · `notifications` · `ai` (Brand Kit, Music Bio, Social AI, Sync Pitch, Pitch Deck) · `public` · `crm` · `admin` · `geo` (72 countries, 55 currencies, 37 langs) · `pricing` (multi-currency, live FX, KES base) · `sso` (OIDC) · `wizard` · `strategies` · `channels` · `avatar` · `cms` (Mother-CMS)

### Frontend & UX
- Dashboard with sidebar, top-bar account-type badge, View-Site link, notifications bell + unread count
- KPI cards (revenue, contacts/new-users, AI runs, onboarding progress) + recharts area/donut/bar
- Reports import/export (CRM CSV + admin user export)
- Onboarding checklist, profile settings (bio, avatar, email, password, preferred channel)
- All boxes & buttons standardized to **3px border radius**; app font +1px inside dashboard

### Wizard system + AI Strategy
- Business-Discovery modal: conversational with Ayo (Claude Sonnet 4.5), one question at a time, generates a structured strategy plan
- Per-app WizardShell: `[Wizard | Advanced Settings | How-to Guides]` toggle, AI step generator, How-to sidebar with "Personalize with Ayo" tips
- Wizard state persisted via `/api/wizard/state/{app_id}` and auto-applied to Advanced settings (verified on Social AI)
- Strategy Library with **Use this strategy** flow · 50/40/10 credit split (platform/creator/fees) · seed of 3 curated public strategies including **Google Local Services Ads — Lead Engine**
- Brand Playbook PDF export (reportlab) — cover, channels, cadence, KPIs, 30-day plan

### Channels Hub
- 13-channel catalog: Social (Instagram/Facebook/Threads/TikTok/X/LinkedIn/YouTube), Google (LSA, Business Profile, Search Ads), Messaging (WhatsApp Business, Email Resend, SMS Twilio)
- Manual connection + OAuth-stub modes (with "Request early access" CTA per platform)
- Required-Channels card on dashboard (only shows channels in user's strategy)
- ChannelStatusStrip in every app's Advanced mode

### Geo & Localization
- Region-aware content scrubbing: M-Pesa / Nairobi / Africa stripped for Western users (HomePage carousel, AppLandingPage deep-links, PricingPage value-props/FAQ/callout, AboutPage)
- `RegionContext` helpers: `isAfrican`, `isWestern`, `isUSorCA`, `contactPhone`
- Region-aware payment callouts on Pricing (US sees Venmo/Cash App/Zelle, KE sees M-Pesa Paybill 522900)

### Mother-CMS (Phase 10 Wave 1) — ✅ NEW THIS SESSION
- Backend `routes/cms.py`: 7 endpoints (public lookup, bulk lookup, admin list/get/upsert/history/rollback/delete)
- Resolution priority: `portals[portal][region]` → `portals[portal][default]` → `regions[region]` → `default`
- Versioning + 1-click rollback
- 14 default keys auto-seeded on startup (phone, address, tagline, payment callouts, social handles, about hours)
- Frontend `cms/CmsContext.js` with `useCms()` hook + `<CmsText>` component + `<CmsProvider portal>`
- First migrations: PricingPage callout title/body, Footer address/tagline/phone

### Portals
- Per-user **Business / Music / Hospitality (coming-soon)** portal toggle — filters sidebar APPS

### Misc polish
- Avatar upload (base64 → File Manager → user avatar)
- Help & Forum article pages: PageHeader hero + Navbar logo + Footer logo (image-path bug fixed — was breaking on nested routes)
- Footer "Blog" link → routed to Forum
- Curated strategies (Google LSA, Instagram/TikTok Creator, WhatsApp Broadcast) auto-seeded

---

## 3. 🔧 In-flight / Wave 2 (next 1–2 sessions)

| Item | Status | Owner | Blocks |
|---|---|---|---|
| Phase 10 Wave 2: Admin CMS editor UI in AdminPanel (key list + region/portal grid + history + rollback) | Pending | Build team | None |
| Phase 10 Wave 2: migrate remaining hardcoded strings (HomePage, AppLandingPage, AboutPage, ToolsPage) into CMS keys | Pending | Build team | None |
| Phase 10 Wave 2: `/cms` marketing landing page + landing-page section + comparison page (CMS vs Webflow/Contentful/Sanity) | Pending | Build team | None |
| Wave 2 — AI image gen (Gemini **Nano Banana** via Emergent LLM key) — per-post images in Social AI | Pending | Build team | None |
| Wave 2 — AI video gen (Sora 2 via Emergent LLM key) — per-post short video clips | Pending | Build team | None |
| Wave 2 — Preview pane (renders posts/ads styled per platform before publish) | Pending | Build team | Depends on Nano Banana ready |
| Wave 2 — Real OAuth on social channels | Pending | User must provision developer apps (Meta App ID/Secret, TikTok Business, X API tier, LinkedIn Marketing API, Google OAuth client) | External |

---

## 4. 🚧 Wave 3 (later)

| Item | Status |
|---|---|
| **Atlanta TV Mount Pro** becomes first external consumer of Intermaven Mother-CMS (proof-of-concept) | Pending |
| Phase 10 — `/docs/cms-overview.md`, `/docs/cms-api.md`, atltvmountpro case-study content | Pending |
| Scheduling (post calendar, auto-publish at chosen time) | Pending |
| Auto-reply to comments (webhook ingest per platform — needs OAuth approvals) | Pending |
| Done-for-you fulfillment dashboard (Intermaven runs the channels for users on the service tier) | Pending |
| Top-10 Most-Used Strategies leaderboard + 10+ uses unlock USD payout to creators (revenue flywheel) | Pending |
| EPK Builder UI polish & public artist pages `/artist/{username}` | Pending |
| 22-app expansion (Distribution Tracker, Hosting Manager, Contract Builder, Press Release AI, Lyric & Hook AI, Royalty Calc, Invoice, Tour Manager, Merch Brief, Content Calendar, Grant Finder, M-Pesa POS · TuneMavens-specific: Sync Brief AI, Mastering Brief AI, One-Sheet AI, Remix License, Broadcast Report, Royalty Statement AI, Release Planner, NFT Brief, ISRC Generator, Playlist Pitch AI) | Pending |
| tunemavens.com 10-phase build (Foundation → Consumer Audio → Creator Pipeline → Label Console → DJ Pool → Sync Marketplace → Split Cascade Engine → Escrow Contracts → Ads Platform → Media House Routing) | Pending |

---

## 5. 🛑 Phase 9 — LAST (deferred to end per user instruction)

### SEO Management Module (Admin-only)
- Global meta defaults: site title template, description, default OG image, robots.txt + sitemap.xml generators
- Per-page overrides: title / meta-description / canonical / OG image / structured data per landing, app-landing, pricing, help, forum, article
- Social media account registry for `schema.org sameAs` + JSON-LD Organization
- JSON-LD schemas: Organization, WebSite, BreadcrumbList, Article, FAQPage, Product, SoftwareApplication, LocalBusiness
- Sitemap + robots auto-generated from page registry + manual overrides
- OG + Twitter card editor with live preview
- Tracking & analytics manager: GA4, GTM, Meta Pixel, TikTok Pixel, LinkedIn Insight, Plausible/PostHog (consent-aware)
- Search Console / Bing Webmaster verification meta tags
- Performance: Lighthouse score targets, Core Web Vitals dashboards, image alt-text checks, broken-link reports
- AI-assisted (Claude) meta-copy auto-suggestions
- **Full SEO audit pass** (manual + automated) executed during this phase

### After Phase 9 ships
- **Comprehensive go-live plan update**: produce a refreshed version of this document showing done vs remaining across every phase, with public launch date, pricing tier final cut, and PR plan.

---

## 6. 🌐 Production Deploy Plan (parallel to feature work)

### 6.1 Backend
- **Hosted on Render** (currently deployed). Trigger redeploy on every `Save to GitHub` push.
- Env vars needed in Render:
  - `MONGO_URL` — Atlas connection (DONE)
  - `DB_NAME` (DONE)
  - `JWT_SECRET` — rotate before public launch
  - `EMERGENT_LLM_KEY` — confirmed working
  - Optional: `STRATEGY_SPLIT_PLATFORM=0.5`, `STRATEGY_SPLIT_CREATOR=0.4`, `STRATEGY_SPLIT_FEES=0.1`, `STRATEGY_DEFAULT_COST=25`
- CORS: currently `*` — restrict to `intermaven.io`, `tunemavens.com`, partner subdomains before launch
- Idempotent seeds on startup: curated strategies + 14 default CMS keys

### 6.2 Frontend
- **Hosted on Render or Vercel** (TBD)
- Env vars: `REACT_APP_BACKEND_URL`, `WDS_SOCKET_PORT=443`
- DNS: `intermaven.io` → frontend; `api.intermaven.io` → backend
- SSL: Let's Encrypt via Render/Vercel
- CDN: Cloudflare in front (optional but recommended)

### 6.3 Third-party credentials needed before public launch
| Service | Status | Required for |
|---|---|---|
| Pesapal consumer key & secret | Not provided | M-Pesa + card payments in Kenya |
| Stripe production keys | Not provided | Card payments in West |
| PayPal client ID & secret | Not provided | PayPal payments worldwide |
| Resend API key | Not provided | Transactional email + password reset |
| Twilio SID/token + WhatsApp sender | Not provided | SMS + WhatsApp campaigns |
| AWS S3 / Cloudflare R2 + credentials | Not provided | File Manager production storage (currently uses base64 data-URLs) |
| Meta (Facebook/Instagram/Threads) App ID + secret | Not provided | OAuth on Channels hub |
| TikTok for Business client | Not provided | OAuth on Channels hub |
| X (Twitter) API tier + keys | Not provided | OAuth on Channels hub |
| LinkedIn Marketing API client | Not provided | OAuth on Channels hub |
| Google OAuth client (YouTube + GBP + Ads) | Not provided | OAuth on Channels hub |
| GA4 measurement ID | Not provided | Phase 9 analytics |
| Google Search Console + Bing Webmaster verification | Not provided | Phase 9 SEO |

### 6.4 Pre-launch checklist
- [ ] Rotate `JWT_SECRET`
- [ ] Restrict CORS origins to production domains
- [ ] Replace base64 avatar storage with S3/R2 upload (Phase: see 6.3)
- [ ] Verify Mother-CMS keys via admin editor (Wave 2)
- [ ] Migrate remaining hardcoded strings to CMS (Wave 2)
- [ ] Configure transactional email (Resend)
- [ ] Provision real OAuth apps with each social provider
- [ ] Run full SEO audit (Phase 9)
- [ ] Lighthouse pass ≥ 90 on every public page
- [ ] Privacy policy & ToS updated for production
- [ ] GDPR / data-residency review for EU/UK visitors
- [ ] Set up uptime monitoring (UptimeRobot or BetterUptime)
- [ ] Set up error tracking (Sentry)
- [ ] Stripe / Pesapal production webhooks tested
- [ ] First 50 invite-only users seeded
- [ ] Press release + announcement post (date: TBD)

---

## 7. Release Waves (proposed)

| Wave | Target | Scope | Status |
|---|---|---|---|
| **GL-1 — MVP / Closed Beta** | Q1 2026 | Dashboard + AI tools + EPK Builder + CRM + Strategy Library + Mother-CMS Wave-1, KE + US payments live | Mostly done — payments + S3 pending |
| **GL-2 — Channel OAuth + Image Gen** | Q1–Q2 2026 | Real social OAuth + Nano Banana per-post images + preview pane | Pending credentials from user |
| **GL-3 — TuneMavens.com Foundation** | Q2 2026 | tunemavens.com launches with shared auth + CMS, DJ Pool MVP | Pending |
| **GL-4 — Mother-CMS Marketing Push** | Q2 2026 | `/cms` landing + comparison page + atltvmountpro as proof-of-concept consumer | Phase 10 Wave 2/3 |
| **GL-5 — SEO Audit + Phase 9** | Q2 2026 | Full SEO module + audit + indexed across Google | Final phase before public launch |
| **GL-6 — Public Launch** | Q2–Q3 2026 | Open registration, paid plans live, PR campaign, scale infra | Pending |
| **GL-7 — Hospitality Portal** | Q3 2026 | Third portal goes live on the Mother-CMS | Pending |

---

## 8. Open questions for user

1. Which payment provider takes priority for production credentials — **Pesapal** (KE) or **Stripe** (US/global)?
2. When can OAuth developer-app provisioning begin? Meta + Google take 2–6 weeks each.
3. What date is the target for public launch? Sets backwards plan for Phase 9 and credentials.
4. Should the Hospitality portal launch concurrently with Phase 10 Wave-3 (atltvmountpro consumer), or wait for after Public Launch?
5. Should we engage a marketing partner now for press / launch PR?

---

*This document is the canonical pre-launch reference. It will be regenerated at the close of Phase 9 with a definitive "done vs remaining" matrix and final launch date.*
