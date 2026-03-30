# Intermaven PRD - AI Tools for African Creatives

## Original Problem Statement
Convert static HTML/CSS/JS Intermaven website into a fully functional full-stack application with database and protocols. Features include user authentication, AI tools for creatives, credit system, and M-Pesa/card payments via Pesapal.

## User Personas
1. **African Musicians/Artists** - Need brand kits, press materials, sync pitches
2. **Creative Entrepreneurs** - Need business pitch decks, social media content
3. **Small Business Owners** - Need branding, social management tools

## Tech Stack
- **Backend**: Python FastAPI + MongoDB
- **Frontend**: React.js with CSS
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Claude Sonnet 4.5 via Emergent LLM Key
- **Payments**: Pesapal (M-Pesa + Cards) - configured, awaiting credentials

## Core Requirements (Static)
1. User registration/login with JWT auth
2. Dashboard with 30% sidebar layout
3. Credit-based AI tool system (Free: 150, Creator: 600, Pro: 2500)
4. AI tools: Brand Kit, Music Bio, Social AI, Sync Pitch, Pitch Deck
5. Pesapal payment integration for M-Pesa and cards
6. Profile management and notifications

## What's Been Implemented

### March 30, 2026 - Quick UI Wins & Medium Complexity Features
- ✅ Password visibility toggle (eye icon) on Auth modal
- ✅ Dashboard sidebar logo click navigates to landing page
- ✅ Newsletter subscription CTA on homepage with email signup
- ✅ Payment method logos (M-Pesa, Visa, Mastercard) on homepage
- ✅ Muted futuristic color palette update
- ✅ Beta signup cards for Coming Soon apps (EPK, Lead Gen, POS)
- ✅ Terms of Service page at /terms
- ✅ Privacy Policy page at /privacy
- ✅ Help Center page at /help with categories and search
- ✅ Terms acceptance checkbox on registration form
- ✅ Community dropdown in navbar (Help Center + Forum links)
- ✅ Confirm Password field on signup form with validation
- ✅ Newsletter subscribe API: POST /api/newsletter/subscribe
- ✅ Beta signup API: POST /api/beta/signup
- ✅ Beta status API: GET /api/beta/status/{app_id}
- ✅ New MongoDB collections: newsletter_subscribers, beta_signups

### March 24, 2026 - Auth Modal & Hero Animations
- ✅ Converted auth page from full-page to modal overlay
- ✅ Auth modal closes when clicking outside (on backdrop)
- ✅ Auth modal shows landing page with faded background
- ✅ Auth modal has close (X) button
- ✅ Enhanced hero carousel with smooth animated transitions
- ✅ Staggered entrance animations for hero content
- ✅ Background scale transition during slide changes
- ✅ All 5 AI tools now assigned by default on registration

### March 24, 2026 - Landing Pages Conversion
- ✅ Converted all static HTML landing pages to React components
- ✅ Home page with hero carousel (4 slides), features section
- ✅ AI Tools page with 5 tool cards showing credit costs
- ✅ Apps Marketplace page with filter system (All, Live now, AI Tools, Music, Branding)
- ✅ Pricing page with 3 tiers (Free, Creator KES 500, Pro KES 1,500)
- ✅ About page with mission statement, story, stats, contact form
- ✅ Shared components: Navbar, Netbar, Footer, LegalModal, AppInfoModal
- ✅ Full CSS styling ported from original HTML files
- ✅ Mobile responsive design
- ✅ Navigation between all landing pages
- ✅ Portal switcher (Music/Business)

### March 24, 2026 - Initial MVP
- ✅ User registration with email, password, name, phone, portal
- ✅ User login with JWT token generation
- ✅ Protected routes with token authentication
- ✅ Profile update endpoint
- ✅ App toggle (add/remove apps)
- ✅ User stats API
- ✅ Notifications system
- ✅ AI generation with Claude via Emergent LLM Key
- ✅ Activity logging
- ✅ Pesapal payment endpoints (initiate, callback, transactions)

### Frontend (/app/frontend/src/)
- ✅ Auth page with sign in/register tabs
- ✅ Dashboard with 30% sidebar layout
- ✅ User profile display with initials avatar
- ✅ Credits display with progress bar
- ✅ Navigation menu (Dashboard, Notifications, Apps, Settings, Billing)
- ✅ Stats cards (credits, AI runs, active apps, scheduled posts)
- ✅ Quick actions for AI tools
- ✅ App cards with accent colors
- ✅ Activity feed
- ✅ Tool panels with input forms and output display
- ✅ Settings with profile/notifications/security tabs
- ✅ Billing panel with plan cards
- ✅ Toast notifications system

### Landing Pages (/app/frontend/src/components/landing/)
- ✅ LandingLayout.js - Main layout wrapper
- ✅ HomePage.js - Hero carousel, features
- ✅ ToolsPage.js - AI tool cards
- ✅ AppsPage.js - App marketplace with filters
- ✅ PricingPage.js - Pricing tiers
- ✅ AboutPage.js - Company info, contact
- ✅ Navbar.js - Navigation bar
- ✅ Netbar.js - Portal switcher
- ✅ Footer.js - Footer with links
- ✅ LegalModal.js - Privacy, Terms, etc.
- ✅ AppInfoModal.js - App detail modals

### Database Collections (MongoDB)
- users (auth, profile, credits, apps)
- notifications
- ai_runs
- activities
- transactions

## Testing Status
- Backend: 100% (All endpoints working)
- Frontend: 100% (All pages and features working)
- Last test: iteration_5.json - Community dropdown and Confirm Password tested

## Prioritized Backlog

### P0 - Critical (In Progress)
- [ ] AI Chat Assistant (proactive pop-up based on user behavior)
- [ ] Assets Manager (file upload/storage backend)
- [ ] AI Output Library (auto-save generated content)
- [ ] Bilingual support (English + Swahili i18n)
- [ ] User Management Admin Dashboard

### P1 - High Priority
- [ ] Pesapal payment integration (awaiting credentials)
- [ ] Meta API integration for Social AI (awaiting credentials)
- [ ] WhatsApp notifications via Twilio (awaiting credentials)
- [ ] EPK Builder System (See ROADMAP.md Section 2)
  - Hosted profiles at intermaven.io/artist/[username]
  - Downloadable PDF export
  - Analytics tracking

### P2 - Medium Priority
- [ ] CRM & Communication System (See ROADMAP.md Section 3)
  - Contact management
  - Email campaigns (Resend/SendGrid)
  - WhatsApp & SMS broadcasting
  - Automation workflows
- [ ] User Management System (See ROADMAP.md Section 4)
  - Admin dashboard
  - Support ticket system
  - User analytics

### P3 - Future
- [ ] App Marketplace Landing Pages (See ROADMAP.md Section 6)
  - brandkit.intermaven.io
  - musicbio.intermaven.io
  - social.intermaven.io
  - etc.
- [ ] POS System for businesses
- [ ] Invoicing module
- [ ] Contract templates
- [ ] Dark/Light theme toggle

**Full technical specifications available in:** `/app/memory/ROADMAP.md`

## API Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET  /api/auth/me - Get current user
PUT  /api/user/profile - Update profile
POST /api/user/apps/toggle - Add/remove app
GET  /api/user/stats - Get user statistics
GET  /api/notifications - Get notifications
POST /api/notifications/mark-read - Mark all read
POST /api/ai/generate - Generate AI content
GET  /api/activities - Get recent activities
POST /api/payments/initiate - Start payment
POST /api/payments/callback - Pesapal callback
GET  /api/payments/transactions - Get transactions
POST /api/newsletter/subscribe - Subscribe to newsletter
POST /api/beta/signup - Join beta waitlist
GET  /api/beta/status/{app_id} - Check beta signup status
GET  /api/health - Health check
```

## Database Configuration

### Production Database (Railway MongoDB) ✅ ACTIVE
```
Host:     centerbeam.proxy.rlwy.net
Port:     20600
Username: mongo
Password: IzypDlPIOWEIyNZSoybbZmWzvPYAeuym
Database: intermaven

Connection String:
mongodb://mongo:IzypDlPIOWEIyNZSoybbZmWzvPYAeuym@centerbeam.proxy.rlwy.net:20600
```

**Status:** Connected and operational  
**Provider:** Railway  
**Collections:** users, notifications, ai_runs, activities, transactions, newsletter_subscribers, beta_signups

---

## Environment Variables Required
```
# Backend
MONGO_URL=mongodb://mongo:IzypDlPIOWEIyNZSoybbZmWzvPYAeuym@centerbeam.proxy.rlwy.net:20600
DB_NAME=intermaven
JWT_SECRET=intermaven_jwt_secret_key_2025_secure
EMERGENT_LLM_KEY=sk-emergent-a3a79EeF44b2f09684
PESAPAL_CONSUMER_KEY=<pending>
PESAPAL_CONSUMER_SECRET=<pending>
PESAPAL_ENVIRONMENT=sandbox

# Frontend
REACT_APP_BACKEND_URL=<preview_url>
```

---

## Documentation

Full technical documentation available at: `/app/DOCUMENTATION.md`

Includes:
- Complete API reference
- Database schema
- Go-live checklist
- Future roadmap with timelines
- All credentials and environment variables

## File Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── .env               # Backend environment
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main router
│   │   ├── App.css        # Global styles
│   │   ├── styles/
│   │   │   └── landing.css # Landing page styles
│   │   └── components/
│   │       ├── AuthPage.js
│   │       ├── Dashboard.js
│   │       ├── Toast.js
│   │       └── landing/
│   │           ├── index.js
│   │           ├── LandingLayout.js
│   │           ├── HomePage.js
│   │           ├── ToolsPage.js
│   │           ├── AppsPage.js
│   │           ├── PricingPage.js
│   │           ├── AboutPage.js
│   │           ├── Navbar.js
│   │           ├── Netbar.js
│   │           ├── Footer.js
│   │           ├── LegalModal.js
│   │           ├── AppInfoModal.js
│   │           ├── TermsPage.js
│   │           ├── PrivacyPage.js
│   │           ├── HelpPage.js
│   │           └── BetaSignupCard.js
│   ├── .env               # Frontend environment
│   └── package.json       # Node dependencies
├── memory/
│   └── PRD.md            # This file
└── test_reports/
    ├── iteration_1.json  # Initial MVP tests
    ├── iteration_2.json  # Landing pages tests
    ├── iteration_3.json  # E2E auth tests
    └── iteration_4.json  # Quick UI & Medium Complexity tests
```
