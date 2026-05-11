# Intermaven Platform - PRD & Status

## Original Problem Statement
Pull all files from git (https://github.com/tunnel-vision-web/intermaven.git), review documentation and roadmap, and report current development status. Complete the in-progress modularization of `backend/server.py` (Phase 1 — Backend Stabilization):
- Wire `epk_router` into FastAPI app
- Remove old monolithic EPK section from `server.py`
- Diagnose and fix the login regression introduced by recent changes
- (Follow-on iterations) Extract remaining clusters: notifications/activities, AI generation, public (newsletter/beta/support), CRM, admin, user-apps.

## Architecture
- **Backend**: FastAPI (Python 3.11) on port 8001, supervisor-managed (`/root/.venv/bin/uvicorn`)
- **Frontend**: React 18 (CRA) on port 3000
- **DB**: MongoDB Atlas (`intermaven-c.vjbwldo.mongodb.net`, db `intermaven`)
- **Auth**: JWT via `python-jose`, password hashing via `passlib`/`bcrypt`
- **External**: Pesapal (payments), Twilio (SMS/WhatsApp), Resend (email), `emergentintegrations` (Anthropic Claude for AI tools)

## Backend modularization status — Phase 1 COMPLETE ✅

`server.py`: **1611 → 119 lines** (92% reduction). Now contains only: bootstrap, CORS, security headers, exception handler, router includes, `/api/health`.

| Router file | Endpoints |
|---|---|
| `routes/auth.py` | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| `routes/user.py` | `/api/user/profile`, `/api/user/apps/toggle`, `/api/user/stats`, plus `apps_router` (`/api/users/apps`, `/api/apps/available`) |
| `routes/files.py` | `/api/files/*` |
| `routes/folders.py` | `/api/folders/*` |
| `routes/payments.py` | `/api/payments/*` (Pesapal) |
| `routes/epk.py` | `/api/epk/*` |
| `routes/notifications.py` | `/api/notifications`, `/api/notifications/mark-read`, `/api/activities` |
| `routes/ai.py` | `/api/ai/generate` + `TOOL_COSTS`/`TOOL_PROMPTS` |
| `routes/public.py` | `/api/newsletter/subscribe`, `/api/beta/*`, `/api/support/tickets/*` |
| `routes/crm.py` | `/api/crm/waitlist`, `/api/crm/contacts/*`, `/api/crm/campaigns/*`, `/api/crm/messages/*`, `/api/crm/twilio/webhook` |
| `routes/admin.py` | `/api/admin/users/*`, `/api/admin/analytics/overview`, `/api/admin/audit-log`, `/api/admin/settings`, `/api/settings` |
| `utils.py` | shared helpers: `get_current_user`, `get_admin_user`, `log_audit`, `serialize_user`, `verify_password`, `get_password_hash`, `create_access_token`, S3/storage helpers |

Duplicate Pesapal block in `server.py` was deleted (the canonical version lives in `routes/payments.py`).

## What was completed across this session
1. Cloned latest `main` from `tunnel-vision-web/intermaven` into `/app`.
2. Configured `backend/.env` with valid MongoDB Atlas connection string (URL-encoded password).
3. Installed Python deps via `/root/.venv/bin/pip install -r backend/requirements.txt` and frontend deps via `yarn install`.
4. **Fixed login regression**: `routes/__init__.py` was importing `epk_router` and `payments_router` but neither was wired in `server.py`; `routes/epk.py` used `timezone` without importing it. Both fixed.
5. **Completed Phase 1 modularization** (6 iterations):
   - EPK wiring + cleanup
   - notifications + activities → `routes/notifications.py`
   - AI generation → `routes/ai.py`
   - newsletter + beta + support → `routes/public.py`
   - CRM (waitlist, contacts, campaigns, messaging, Twilio webhook) → `routes/crm.py`
   - admin (users, analytics, audit log, settings) → `routes/admin.py`
   - user-apps → folded into `routes/user.py` as `apps_router`
   - Stripped orphan models, duplicate Pesapal block, and unused imports from `server.py`
6. **Verified end-to-end** after every iteration:
   - Backend curl tests on every namespace (`auth`, `epk`, `notifications`, `ai`, `newsletter`, `beta`, `support`, `crm`, `admin`, `users/apps`, `apps/available`, `settings`)
   - CRUD: create contact → list → delete, create support ticket → AI auto-response
   - Frontend Playwright: filled login form → 200 response → redirected to `/dashboard` → "Welcome back!" toast → sidebar shows logged-in user

## Roadmap progress vs DEVELOPMENT_PLAN.md
**Phase 1 — Core platform completion**
- [x] MongoDB Atlas connection verified
- [x] Backend modularization (ALL clusters extracted)
- [x] Login working end-to-end
- [x] Hamburger menu + auth flow fixes (frontend)
- [ ] React dashboard completion (admin, CRM, EPK pages) — partial

**Phase 2 — Launch readiness** — not started

## Backlog / Prioritized
- **P0**: Frontend EPK Builder UI (referenced in ROADMAP §2) — connect to working `/api/epk/*`.
- **P0**: Admin dashboard frontend (consume `/api/admin/*` cluster).
- **P1**: Wire Pesapal credentials, Twilio creds, Resend creds (env vars only — already coded).
- **P1**: Add `EMERGENT_LLM_KEY` to `backend/.env` so AI tools return real generations.
- **P2**: Public EPK pages at `/artist/<username>`.
- **P2**: App marketplace landing pages (Social AI, Brand Kit AI, Smart CRM).
- **Cleanup**: There are still ~70 lines of debug-log scaffolding (`_debug_log` fetch calls) in frontend `App.js` / `AuthModal.js` and `debug-4d502b.log` paths — can be removed once the regression is confirmed stable.

## Test credentials (sandbox)
See `/app/memory/test_credentials.md`.

## Updated: 2026-05-11
