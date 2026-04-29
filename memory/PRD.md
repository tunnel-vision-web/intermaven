# Intermaven PRD - AI Tools for African Creatives

## Original Problem Statement
Convert static HTML/CSS/JS Intermaven website into a fully functional full-stack application with database and protocols. Features include user authentication, AI tools for creatives, credit system, and M-Pesa/card payments via Pesapal.

## User Personas
1. **African Musicians/Artists** - Need brand kits, press materials, sync pitches
2. **Creative Entrepreneurs** - Need business pitch decks, social media content
3. **Small Business Owners** - Need branding, social management tools

## Tech Stack
- **Backend**: Python FastAPI + MongoDB Atlas
- **Frontend**: React.js with CSS
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Claude Sonnet 4.5 via Emergent LLM Key
- **Payments**: Pesapal (M-Pesa + Cards) - configured, awaiting credentials
- **Database**: MongoDB Atlas (cloud-hosted)

## Database Configuration

### MongoDB Atlas (Active) ✅
```
Cluster: intermaven-c.vjbwldo.mongodb.net
Database: intermaven
User: tunnelandvision_db_user
Collections: users, ai_runs, activities, notifications, connection_test
```

## Core Requirements (Static)
1. User registration/login with JWT auth
2. Dashboard with 30% sidebar layout
3. Credit-based AI tool system (Free: 150, Creator: 600, Pro: 2500)
4. AI tools: Brand Kit, Music Bio, Social AI, Sync Pitch, Pitch Deck
5. Pesapal payment integration for M-Pesa and cards
6. Profile management and notifications

## What's Been Implemented

### April 29, 2026 - MongoDB Atlas Migration
- ✅ Migrated from Railway MongoDB to MongoDB Atlas (free tier)
- ✅ Verified full stack working with Atlas
- ✅ Test users created and AI generation tested
- ✅ File sync prepared for local development

### March 30, 2026 - Quick UI Wins & Medium Complexity Features
- ✅ Password visibility toggle (eye icon) on Auth modal
- ✅ Confirm Password field on signup form with validation
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
- ✅ Ayo AI Chat Assistant with support ticket creation
- ✅ FlatIcon system for unified SVG icons site-wide

### Backend Features
- ✅ Newsletter subscribe API: POST /api/newsletter/subscribe
- ✅ Beta signup API: POST /api/beta/signup
- ✅ Beta status API: GET /api/beta/status/{app_id}
- ✅ Support ticket API: POST /api/support/ticket
- ✅ AI Chat API: POST /api/chat/message
- ✅ App management: POST /api/apps/add, GET /api/apps/available

### Frontend Components
- ✅ AuthModal.js - Login/Register with password toggle
- ✅ Dashboard.js - Full dashboard with app management
- ✅ AyoChat.js - AI support assistant
- ✅ FlatIcon.js - Centralized icon system
- ✅ Landing pages (Home, Tools, Apps, Pricing, About, Terms, Privacy, Help)

## API Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET  /api/auth/me - Get current user
PUT  /api/user/profile - Update profile
POST /api/users/apps - Add app to dashboard
GET  /api/apps/available - Get available apps
GET  /api/user/stats - Get user statistics
GET  /api/notifications - Get notifications
POST /api/notifications/mark-read - Mark all read
POST /api/ai/generate - Generate AI content
GET  /api/activities - Get recent activities
POST /api/chat/message - AI chat message
POST /api/support/ticket - Create support ticket
POST /api/newsletter/subscribe - Subscribe to newsletter
POST /api/beta/signup - Join beta waitlist
GET  /api/beta/status/{app_id} - Check beta signup status
GET  /api/health - Health check
```

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://tunnelandvision_db_user:Intermaven2026%21@intermaven-c.vjbwldo.mongodb.net/intermaven?retryWrites=true&w=majority&appName=intermaven-c
DB_NAME=intermaven
JWT_SECRET=intermaven_jwt_secret_key_2025_secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EMERGENT_LLM_KEY=sk-emergent-a3a79EeF44b2f09684
PESAPAL_CONSUMER_KEY=<pending>
PESAPAL_CONSUMER_SECRET=<pending>
PESAPAL_ENVIRONMENT=sandbox
```

### Frontend (.env)
```
# For local development with ngrok:
REACT_APP_BACKEND_URL=https://your-ngrok-url.ngrok-free.app

# For Emergent preview:
REACT_APP_BACKEND_URL=https://code-viewer-63.preview.emergentagent.com
```

## Prioritized Backlog

### P0 - Critical (Pre-Launch)
- [ ] Assets Manager (file upload/storage backend)
- [ ] AI Output Library (auto-save generated content)
- [ ] Bilingual support (English + Swahili i18n)
- [ ] User Management Admin Dashboard

### P1 - High Priority (Blocked on Credentials)
- [ ] Pesapal payment integration (awaiting credentials)
- [ ] Meta API integration for Social AI (awaiting credentials)
- [ ] WhatsApp notifications via Twilio (awaiting credentials)

### P2 - Medium Priority (Post-Launch)
- [ ] Community Forum (Odoo-style)
- [ ] Advanced Analytics Dashboard with export
- [ ] EPK Builder (hosted profiles)
- [ ] CRM & Communication System

### P3 - Future
- [ ] Partner Program (Corporate accounts)
- [ ] POS System for businesses
- [ ] App Marketplace Landing Pages

## File Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── .env               # Backend environment
│   ├── requirements.txt   # Python dependencies
│   └── tests/
│       └── test_api.py
├── frontend/
│   ├── src/
│   │   ├── App.js, App.css
│   │   ├── components/
│   │   │   ├── AuthModal.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AyoChat.js + AyoChat.css
│   │   │   ├── FlatIcon.js
│   │   │   └── landing/ (15 files)
│   │   └── styles/landing.css
│   ├── .env
│   └── package.json
├── memory/
│   ├── PRD.md
│   └── ROADMAP.md
└── DOCUMENTATION.md
```

## Testing Status
- Backend: 100% (All endpoints working)
- Frontend: 100% (All pages working)
- Database: MongoDB Atlas verified
- AI Generation: Tested and working

---
Last Updated: April 29, 2026
