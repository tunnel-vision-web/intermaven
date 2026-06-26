# Intermaven — Phased Implementation & Go-Live Plan

> Created: June 2026. Source of truth for the expansion toward a globally-localized,
> multi-currency, multi-language platform with self-serve auth and an AI testing agent.
> This plan supplements `/app/memory/PRD.md` and `/app/ROADMAP.md`.

## Context snapshot (verified live)
- Stack: React 18 (CRA) + FastAPI (pymongo, sync) + MongoDB Atlas (`intermaven` db).
- Auth: JWT (python-jose) + bcrypt. Routes: register / login / me only.
- Payments: Pesapal scaffolded in `routes/payments.py` (KES-centric).
- AI: Claude Sonnet via `emergentintegrations` + `EMERGENT_LLM_KEY`.
- Portals: `business` (Intermaven) + `music` (keyed `intermavenmusic` → renaming to **tunemavens**).
- Pricing: hardcoded KES strings in `PricingPage.js`.
- Gaps driving this plan: geolocation, multi-currency, i18n, forgot-password, AI testing agent.

---

## Guiding principles
- **Geo-aware everything**: region drives currency, language, imagery, payment methods, legal/compliance copy.
- **Backend is the source of truth** for prices, FX, and region rules — frontend only renders.
- **Best-of-breed 2030 practices**: token-rotation auth, signed reset links, rate limiting, audit logging, i18n via resource catalogs, server-driven feature/region flags.
- **No hardcoded prices/strings** in components — everything resolves through a localization + pricing service.

---

## PHASE 0 — Stabilization & cleanup (1 short phase, low token cost)
Goal: clean baseline before building new systems.
- Remove `_debug_log` scaffolding & `debug-*.log` writers from `server.py`, `config.py`, `routes/auth.py`, frontend `App.js`/`AuthModal.js`.
- Confirm all 12 routers healthy via smoke tests (auth, user, apps, files, folders, payments, epk, notifications, ai, public, crm, admin).
- Seed a stable admin account; record in `/app/memory/test_credentials.md`.
**Test:** backend curl matrix + one frontend smoke screenshot.

## PHASE 1 — Geolocation & Region foundation (P0)
Goal: detect region, expose it everywhere, allow manual override.
- Backend `routes/geo.py`: `/api/geo/resolve` (IP → country/region/currency/language defaults) with manual override param. Use IP geolocation (provider TBD per decisions).
- `region_config` collection: per-region defaults { currency, locale, payment_methods, legal_variant, image_set }.
- Frontend `RegionContext` (React context) + `<RegionSwitcher>` (country/currency/language picker) in navbar. Persist choice in localStorage + cookie.
- Graceful fallback chain: manual override → IP → Accept-Language header → global default (USD/en).
**Test:** simulate IPs (US/KE/EU), verify resolved defaults; manual override persists.

## PHASE 2 — Multi-currency pricing engine (P0)
Goal: prices localize by region with correct rounding & psychological pricing.
- `routes/pricing.py`: `/api/pricing/plans?region=` returns localized plan + tool prices.
- Base prices stored once (base currency TBD). FX layer converts (live API or admin-managed — per decisions).
- Rounding rules engine:
  - Western (USD/EUR/GBP): round to `.99` (e.g., $4.99).
  - KES/NGN/etc.: round to clean "solid" numbers per region convention.
- Replace ALL hardcoded KES strings in `PricingPage.js`, tool cards, buy flows with engine output.
- Admin override: approve/lock displayed prices per region.
**Test:** snapshot prices for US/KE/EU; verify rounding endings and conversion accuracy.

## PHASE 3 — Internationalization (i18n) (P0/P1)
Goal: UI language follows region's predominant languages, with switcher.
- i18n catalog (`/locales/<lang>.json`) + `react-i18next` (or lightweight equiv).
- Region → predominant language map (e.g., KE: en/sw, FR/EU: fr, etc.); switcher lists region-relevant languages.
- Externalize all hardcoded UI strings progressively (start with nav, hero, pricing, auth).
- Backend returns localized region/legal copy where applicable.
**Test:** switch language, verify nav/hero/pricing/auth strings change; region defaults correct language.

## PHASE 4 — Full Auth protocols / Forgot Password (P0)
Goal: complete, secure self-serve auth everywhere login is required.
- **MUST route through `integration_expert` before writing auth code.**
- Add: `/api/auth/forgot-password` (signed, expiring reset token via email), `/api/auth/reset-password`, `/api/auth/change-password`.
- Email delivery via Resend (already a dependency target).
- Hardening: rate limiting / brute-force lockout, generic responses (no user enumeration), token single-use + expiry, optional email verification on signup.
- Frontend: Forgot/Reset password screens + flows in `AuthModal`/`AuthPage`.
**Test:** full reset cycle (request → email link → reset → login); lockout after N failures.

## PHASE 5 — Region-aware payments (P1)
Goal: show preferred local payment methods per region.
- **Route through `integration_expert`** for each provider.
- USA/EU/UK: Stripe (cards) + PayPal (per decisions). Kenya: Pesapal/M-Pesa (existing). 
- Payment method selection driven by `region_config.payment_methods`.
- Currency passed through to provider matches displayed currency.
**Test:** checkout shows correct methods + currency per region (sandbox).

## PHASE 6 — Music platform rebrand: intermavenmusic → tunemavens.com (P1)
Goal: rename the music vertical's brand/domain assets.
- Rename image-registry keys/folders `intermavenmusic` → `tunemavens` (`imageRegistry.js`, `/images/hero/`, `/images/headers/`).
- Update any displayed domain/brand text to `tunemavens.com`.
- Keep all music portal functionality identical.
**Test:** music portal renders with renamed assets; no broken image paths.

## PHASE 7 — AI Testing Agent (P1) — "Sentinel"
Goal: an admin-triggered agent that impersonates each user persona and exercises all
front + back end functions, on both local and live environments.
- **Scope:** assimilate each user/role (free, creator, pro, admin, business, music) and run end-to-end task suites.
- **Environments:** local + live (env-targeted base URL).
- **Trigger:** manual, from backend Admin dashboard (button → `/api/admin/test-agent/run`), returns run report.
- **2030 best practices:** scenario-driven autonomous test generation, self-healing selectors, parallel persona runs, structured run reports persisted to `test_runs` collection, regression diffing vs last run, safety guardrails (sandbox data only).
- Surfaces results in admin UI (pass/fail per flow, screenshots, logs).
**Test:** admin triggers run; report generated for a representative flow set.

## PHASE 8 — Go-Live readiness (P1/P2)
- Wire real credentials (Pesapal, Stripe, PayPal, Resend, Twilio, FX provider, IP geo) via env only.
- Region-specific legal/privacy variants (GDPR for EU, etc.).
- Performance, security headers, error logging review.
- Staging deploy → live smoke tests (via Sentinel) → production.

---

## Execution order (token-efficient)
P0 first: 0 → 1 → 2 → 3 → 4. Then P1: 5 → 6 → 7. Then 8.
Each phase ends with targeted tests; large phases end with `testing_agent`.

## PROGRESS LOG
- **2026-06 — Repo migration:** Cloned `tunnel-vision-web/intermaven` into `/app`, wired MongoDB Atlas (`intermaven`), installed deps + `emergentintegrations`, added `EMERGENT_LLM_KEY`. Backend healthy, login verified end-to-end.
- **2026-06 — Phase 1 (Geolocation/Region) ✅ DONE & verified:**
  - `backend/regions.py` (72 countries, 55 currencies incl. all major African, 37 languages incl. tribal: Luo, Kikuyu, Luhya, Kalenjin, Kamba, Hausa, Yoruba, Igbo, Zulu, Xhosa, etc. + Spanish for US, French/Portuguese/Arabic).
  - `routes/geo.py`: `/api/geo/resolve` (IP detect via ip-api + CF header + manual `?country=` override), `/api/geo/options`.
  - Frontend `RegionContext.js` + `RegionSwitcher` in navbar (country/currency/language), persisted to localStorage.
- **2026-06 — Phase 2 (Multi-currency pricing) ✅ DONE & verified:**
  - `backend/fx.py`: live FX via `open.er-api.com` (KES base), Mongo-cached (6h TTL) + static fallback.
  - `backend/pricing.py`: base KES prices, `.99` rounding (Western), clean round-up (African); `routes/pricing.py` → `/api/pricing?currency=&country=`.
  - `PricingPage.js` now fully data-driven & localized; pricing card CSS added. Verified: KES 500 → $3.99 / €3.99 / £2.99 / ₦5,300 / R70 / USh14,500.
- **DEFERRED:** Phase 0 debug-log cleanup (`_debug_log` scaffolding still in server.py/config.py/auth.py/App.js) — low risk, do alongside Phase 4.

## NEXT (not yet started)
- Phase 3 i18n catalogs (UI string externalization + per-language translation; 37 langs — seed English, machine-assist others).
- Phase 4 Full auth + forgot-password (**route via integration_expert first**; needs Resend email key).
- Phase 5 Region-aware payments (**integration_expert**; needs PayPal + Pesapal creds; Stripe test key in pod).
- Phase 6 Music rebrand intermavenmusic → tunemavens.com.
- Phase 7 Autonomous AI Testing Agent ("Sentinel", full version per user choice).

### Backlog addition (June 2026) — Geolocation-aware contact details — DEPRECATED, see Phase 10 above

## DECISIONS LOCKED (user, June 2026)
1. Currencies/languages: ALL African + Western (incl. tribal langs + Spanish for US). ✅ built into regions.py
2. FX: live API auto-updated. ✅
3. Base currency: KES. ✅
4. Payments: Stripe + PayPal (West) + Pesapal/M-Pesa (Kenya).
5. AI Testing Agent: full autonomous version.
6. Build immediately. ✅ (Phases 1–2 delivered)

---

## NEW (Jan 2026) — Phase 9 & 10 additions

### Phase 9 — SEO Management Module (Admin-only)
**Status: planned · not yet built**

A backend-driven SEO control center built into `/admin/seo` for Intermaven Official.
Scope (industry best practices):

- **Global meta defaults**: site title template, description, default OG image, robots.txt + sitemap.xml generators
- **Per-page overrides**: title / meta-description / canonical / OG image / structured data per landing, app-landing, pricing, help, forum, article
- **Social media account registry**: Intermaven's own Instagram / TikTok / X / LinkedIn / YouTube / Facebook / Threads / Pinterest / Spotify / Apple-Music / Google Business handles — used for footer links, schema.org `sameAs`, JSON-LD organization
- **JSON-LD schemas**: Organization, WebSite, BreadcrumbList, Article, FAQPage, Product, SoftwareApplication, LocalBusiness — auto-rendered from CMS data
- **Sitemap & robots**: auto-generated from page registry + manual override
- **Open Graph & Twitter Cards**: per-page editor with live preview
- **Tracking & analytics**: GA4 measurement IDs, GTM container, Meta Pixel, TikTok Pixel, LinkedIn Insight, Plausible/PostHog — toggled per consent
- **Search Console / Bing Webmaster verification meta tags**
- **Performance**: Lighthouse score targets, Core Web Vitals dashboards, image alt-text checks, broken-link reports
- **AI-assisted**: Claude auto-suggests meta titles / descriptions / OG copy from page content
- **Full SEO audit pass** (manual + automated) executed as part of this phase

### Phase 10 — CMS Integration (port from Atlanta TV Mount Pro, made the "mother")
**Status: Wave 1 SHIPPED · Wave 2 + 3 remaining**

#### Wave 1 (✅ delivered Jan 2026)
- ✅ Backend `routes/cms.py` — 7 endpoints (public GET key, GET bulk, admin list/get/upsert/history/rollback/delete)
- ✅ Schema: `cms_keys { _id, default, regions:{...}, portals:{...}, description, history:[...], updated_at, updated_by }`
- ✅ Resolution priority: `portals[portal][region]` → `portals[portal][default]` → `regions[region]` → `default`
- ✅ Versioning + 1-click rollback via `/api/admin/cms/{key}/rollback/{revision_id}`
- ✅ Seed: `seed_cms_keys.py` — auto-inserts 14 default keys (phone/address/tagline/payment callouts/social handles) idempotently on startup
- ✅ Frontend `cms/CmsContext.js` — `<CmsProvider portal="business">`, `useCms(key, fallback)` hook, `<CmsText>` component, preload + lazy-fetch strategy
- ✅ First migrations: PricingPage callout title/body, Footer address/tagline/phone — all now CMS-resolved
- ✅ Region resolution verified: US → "Pay instantly with Venmo, Cash App, or Zelle" / KE → "Pay instantly with M-Pesa"

#### Wave 2 (pending)
- Admin CMS editor UI in AdminPanel (table of keys, click-to-edit modal with region+portal grid, history view, rollback button)
- Migrate remaining strings: HomePage tagline/badge, AppLandingPage CTAs, AboutPage phone+hours, ToolsPage hero
- `/cms` marketing landing page on intermaven.io (positioning the CMS as a flagship feature)
- Landing-page section with animated diagram (single CMS pushing to all portals)

#### Wave 3 (pending)
- Atlanta TV Mount Pro consumes Intermaven Mother-CMS (proof-of-concept case study)
- Comparison page: "Intermaven CMS vs Webflow vs Contentful vs Sanity"
- `/docs/cms-overview.md`, `/docs/cms-api.md`

The atltvmountpro repo already has a working CMS pattern. Port to Intermaven and make it the canonical CMS for all sister portals (Intermaven, TuneMavens, and future ones like Hospitality):

- **Editable everywhere**: site copy, phone numbers (per region), addresses, social handles, payment options shown, hero images, testimonials, FAQs, help/forum articles, pricing notes, legal pages
- **Per-region overrides**: every CMS string supports `KE/NG/ZA/US/GB/AU/...` variants — so M-Pesa/Nairobi never leak to Western visitors
- **Per-portal overrides**: the same key can render differently on intermaven.io vs tunemavens.com vs hospitality.intermaven.io
- **Versioning & rollback**: every edit saves a revision; admin can preview + roll back per page
- **Locked vs editable**: certain values (system config) are protected
- **Schema**: `cms_keys { _id, key, default, regions:{KE:..., US:...}, portals:{business:..., music:...}, updated_at, updated_by }`
- **API**: `GET /api/cms/{key}?region=US&portal=business` resolves the right variant
- **Atlanta TV Mount Pro becomes a consumer of the Intermaven CMS** once the schema is shared
- **First migration**: phone numbers, addresses, social handles, M-Pesa callouts → CMS-managed

#### Phase 10 Enhancement — Mother-CMS as a flagship differentiator
- Once Phase 10 ships, position the Intermaven CMS as a **standalone product feature** in marketing — not just an internal tool.
- **Tagline (draft)**: *"One source of truth. Every portal. Every region. Every language."*
- **Positioning**:
  - Sold as "powered by our own multi-portal CMS — your hospitality, music, and business sites all share one source of truth"
  - Targets prospective **enterprise / agency / multi-brand clients** later
  - Highlight: a marketing agency running 10 client brands could use ONE Intermaven CMS to push region-aware copy to all of them
- **Landing-page section to build** (after Phase 10 backend is live):
  - Section title: *"Multi-Portal CMS — built into every Intermaven plan"*
  - Subhead: *"Edit once. Publish to every portal, every region, every language. Roll back any change."*
  - Visual: animated diagram showing one CMS pushing copy to intermaven.io, tunemavens.com, hospitality.intermaven.io, atltvmountpro.com simultaneously
  - 3 feature pillars:
    1. **Region-aware** — M-Pesa for Nairobi, Venmo for Atlanta, automatically
    2. **Portal-aware** — same key can render differently per portal (music vs business vs hospitality)
    3. **Audit-ready** — full version history + 1-click rollback
  - CTA: *"See it in action — sign up for Creator plan"* (CMS access ships in Creator+ tier)
- **Pricing positioning**: include in Creator tier ("Mother CMS access · up to 3 portals") + Pro tier ("unlimited portals + API access for white-label resale")
- **Use as enterprise sales angle**: agencies, multi-brand operators, franchise networks all become reachable once the CMS is positioned as a product rather than infrastructure
- **Documentation deliverables when Phase 10 ships**:
  1. `/docs/cms-overview.md` — product overview for end users
  2. `/docs/cms-api.md` — developer-facing API for consumer portals
  3. Marketing landing section in `HomePage.js` + standalone `/cms` page
  4. Comparison page: "Intermaven CMS vs Webflow vs Contentful vs Sanity" emphasizing region/portal awareness

### Backlog addition (Jan 2026) — Channels hub + portals
- ✅ Channels hub shipped (13 channels: Social, Google LSA/GBP/Search Ads, Messaging)
- ✅ Per-user portal toggle (business / music / hospitality coming soon)
- ✅ Avatar upload routed to File Manager
- Geo-aware content scrubbing extended (M-Pesa, Nairobi, Africa) across Pricing, AppLandingPage, AboutPage, HomePage carousel
- Region-aware phone numbers wired through `RegionContext.contactPhone` (CMS-ready)
- Article pages now match parent help/forum styling (hero header via `PageHeader`)


### Backlog addition (June 2026) — Geolocation-aware contact details
- **Phone numbers must change based on geolocation** (alongside currency/language). Today contact/support phone
  numbers are hardcoded Kenyan (`+254 700 000 000`, M-Pesa Paybill, "Mon–Fri 9am–5pm EAT") in About/Help/Footer/Pricing.
- Plan: add per-region contact metadata to `region_config` (support phone, WhatsApp number, business hours/timezone,
  Paybill/local-payment ref) resolved via `/api/geo/resolve`; render dynamically in Footer, About contact card,
  Help "Contact Support", Pricing M-Pesa callout. Fallback to a global/international number when no regional number exists.
  Fold into Phase 1 (region foundation) data model + Phase 8 go-live (provision real regional numbers). **Partially live** (RegionContext.contactPhone) — full CMS plumbing pending Phase 10.
