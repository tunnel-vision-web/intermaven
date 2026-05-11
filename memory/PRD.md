# Intermaven Platform - PRD & Status

## Original Problem Statement
Pull all files from git (https://github.com/tunnel-vision-web/intermaven.git), review documentation and roadmap, and report current development status. Complete the in-progress modularization of `backend/server.py` (Phase 1 — Backend Stabilization):
- Wire `epk_router` into FastAPI app
- Remove old monolithic EPK section from `server.py`
- Diagnose and fix the login regression introduced by recent changes

## Architecture
- **Backend**: FastAPI (Python 3.11) on port 8001, supervisor-managed (`/root/.venv/bin/uvicorn`)
- **Frontend**: React 18 (CRA) on port 3000
- **DB**: MongoDB Atlas (`intermaven-c.vjbwldo.mongodb.net`, db `intermaven`)
- **Auth**: JWT via `python-jose`, password hashing via `passlib`/`bcrypt`
- **External**: Pesapal (payments), Twilio (SMS/WhatsApp), Resend (email), `emergentintegrations` (Anthropic Claude for AI tools)

## Backend modularization status (Phase 1)
| Router | Module | Wired in `server.py` |
|---|---|---|
| Auth (`/api/auth/*`) | `routes/auth.py` | ✅ |
| User (`/api/users/*`) | `routes/user.py` | ✅ |
| Files (`/api/files/*`) | `routes/files.py` | ✅ |
| Folders (`/api/folders/*`) | `routes/folders.py` | ✅ |
| Payments / Pesapal (`/api/payments/*`) | `routes/payments.py` | ✅ (newly wired) |
| EPK (`/api/epk/*`) | `routes/epk.py` | ✅ (newly wired) |
| Notifications + Activities (`/api/notifications/*`, `/api/activities`) | `routes/notifications.py` | ✅ (extracted this session) |
| AI Generation (`/api/ai/generate`) | `routes/ai.py` | ✅ (extracted this session) |

Still inside `server.py` monolith (next extraction targets):
- Newsletter, Beta signups, Support tickets
- CRM waitlist, contacts, campaigns, messaging (Twilio webhook)
- Admin: users, analytics, audit log, settings, credit grants, suspensions

## What was completed this session
1. Cloned latest `main` from `tunnel-vision-web/intermaven` into `/app`.
2. Configured `backend/.env` with valid MongoDB Atlas connection string (URL-encoded password).
3. Installed Python deps via `/root/.venv/bin/pip install -r backend/requirements.txt` and frontend deps via `yarn install`.
4. **Fixed root cause of login regression**:
   - `routes/__init__.py` was importing `epk_router` and `payments_router` but they were never wired into `server.py` (`app.include_router(...)` missing). Added both.
   - `routes/__init__.py` `__all__` updated to export `payments_router` and `epk_router`.
   - `routes/epk.py` used `datetime.now(timezone.utc)` but didn't import `timezone` → would throw `NameError` on any EPK write. Added `timezone` to imports. Module also now exports `epk_router` alias (per repo convention).
5. Verified end-to-end:
   - `GET /api/health` → healthy
   - `POST /api/auth/register` → 200, returns JWT + user
   - `POST /api/auth/login` → 200, returns JWT
   - `GET /api/auth/me` (with Bearer) → 200, user payload
   - `GET /api/epk/my` → 404 expected
   - `GET /api/epk/check-username?username=...` → `{"available": true}`
   - Frontend login via Playwright: filled credentials, submitted, response 200, redirected to `/dashboard`, sidebar shows logged-in user.

## Roadmap progress vs DEVELOPMENT_PLAN.md
**Phase 1 — Core platform completion**
- [x] MongoDB Atlas connection verified
- [x] Backend modularization (auth, user, files, folders) — was already done
- [x] Backend modularization (payments, EPK) — completed this session
- [ ] Backend modularization (AI, notifications, CRM, admin, support, beta, newsletter) — pending
- [x] Hamburger menu + auth flow fixes (frontend)
- [x] Login working end-to-end
- [ ] React dashboard completion (admin, CRM, EPK pages) — partial

**Phase 2 — Launch readiness** — not started

## Backlog / Prioritized
- **P0**: Continue server.py modularization — extract AI, notifications/activities, CRM (contacts/campaigns/messages), admin (users/analytics/settings/audit), support, beta, newsletter into `routes/`.
- **P0**: Frontend EPK Builder UI (referenced in ROADMAP §2) — connect to working `/api/epk/*`.
- **P1**: Admin dashboard frontend.
- **P1**: Wire Pesapal credentials, Twilio creds, Resend creds (env vars only — already coded).
- **P2**: Public EPK pages at `/artist/<username>`.
- **P2**: App marketplace landing pages (Social AI, Brand Kit AI, Smart CRM).

## Test credentials (sandbox)
See `/app/memory/test_credentials.md`.

## Updated: 2026-05-11
