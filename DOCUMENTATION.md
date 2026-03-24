# Intermaven Platform Documentation
## Complete Technical Reference & Roadmap

**Last Updated:** March 24, 2026  
**Status:** Development Complete - Ready for Production Deployment  
**Repository:** /app/

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Configuration](#4-database-configuration)
5. [API Reference](#5-api-reference)
6. [Frontend Structure](#6-frontend-structure)
7. [Go-Live Checklist](#7-go-live-checklist)
8. [Future Roadmap](#8-future-roadmap)
9. [Credentials & Environment Variables](#9-credentials--environment-variables)

---

# 1. Project Overview

## 1.1 What is Intermaven?

Intermaven is an AI-powered creative and business tools platform built for African entrepreneurs and artists. The platform provides:

- **AI Tools:** Brand Kit Generator, Music Bio & Press Kit, Social AI, Sync Pitch AI, Pitch Deck AI
- **Credit System:** Pay-per-use model with M-Pesa and card payments
- **Two Portals:** Music (music.intermaven.io) and Business (intermaven.io)

## 1.2 Target Users

1. **African Musicians/Artists** - Need brand kits, press materials, sync pitches
2. **Creative Entrepreneurs** - Need business pitch decks, social media content
3. **Small Business Owners** - Need branding, social management tools

## 1.3 Business Model

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Free Starter | KES 0 | 150 | All AI tools, 90-day expiry |
| Creator | KES 500 | 600 | Priority speed, credits never expire |
| Pro | KES 1,500 | 2,500 | API access, white-label, WhatsApp support |

---

# 2. Current Implementation Status

## 2.1 Completed Features ✅

### Backend (FastAPI)
- [x] User registration with email/password
- [x] User login with JWT authentication
- [x] Protected routes with token verification
- [x] Profile management (update profile, settings)
- [x] App toggle (add/remove apps from dashboard)
- [x] User statistics API
- [x] Notifications system
- [x] AI generation with Claude (via Emergent LLM Key)
- [x] Activity logging
- [x] Pesapal payment endpoints (configured, awaiting credentials)

### Frontend (React)
- [x] Landing pages (Home, Tools, Apps, Pricing, About)
- [x] Auth modal with backdrop click-to-close
- [x] Dashboard with 30% sidebar layout
- [x] All 5 AI tools accessible and functional
- [x] User profile display with avatar
- [x] Credits display with progress bar
- [x] Settings panel (profile, notifications, security tabs)
- [x] Billing panel with plan cards
- [x] Toast notifications
- [x] Hero carousel with smooth animations
- [x] Mobile responsive design

### Database (MongoDB)
- [x] Production database configured (Railway)
- [x] Collections: users, notifications, ai_runs, activities, transactions

## 2.2 Pending for Go-Live ⏳

- [ ] Pesapal credentials (M-Pesa payments)
- [ ] Production deployment (Vercel + Railway)
- [ ] Custom domain configuration (intermaven.io)
- [ ] SSL certificates

## 2.3 Future Features 🔮

- [ ] EPK Builder (hosted + PDF)
- [ ] File Management System
- [ ] CRM & Communication System
- [ ] User Management (Admin Panel)
- [ ] App Landing Pages (subdomains)

---

# 3. Technical Architecture

## 3.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | Single Page Application |
| UI Components | Custom CSS + Shadcn/UI | Design system |
| Backend | FastAPI (Python 3.11) | REST API |
| Database | MongoDB | Document store |
| AI | Claude Sonnet 4.5 | Via Emergent LLM Key |
| Payments | Pesapal | M-Pesa + Cards |
| Hosting (Planned) | Vercel + Railway | Frontend + Backend |

## 3.2 Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application (all routes)
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             # Main router & auth context
│   │   ├── App.css            # Global styles
│   │   ├── index.js           # Entry point
│   │   ├── styles/
│   │   │   └── landing.css    # Landing page styles
│   │   └── components/
│   │       ├── AuthModal.js   # Login/Register modal
│   │       ├── Dashboard.js   # Main dashboard (847 lines)
│   │       ├── Toast.js       # Notification toasts
│   │       └── landing/
│   │           ├── index.js           # Exports
│   │           ├── LandingLayout.js   # Layout wrapper
│   │           ├── HomePage.js        # Hero + features
│   │           ├── ToolsPage.js       # AI tools listing
│   │           ├── AppsPage.js        # App marketplace
│   │           ├── PricingPage.js     # Pricing tiers
│   │           ├── AboutPage.js       # Company info
│   │           ├── Navbar.js          # Navigation
│   │           ├── Netbar.js          # Portal switcher
│   │           ├── Footer.js          # Footer
│   │           ├── LegalModal.js      # Privacy/Terms
│   │           └── AppInfoModal.js    # App details
│   ├── package.json           # Node dependencies
│   └── .env                   # Frontend environment
│
├── memory/
│   ├── PRD.md                 # Product requirements
│   └── ROADMAP.md             # Technical roadmap
│
├── test_reports/
│   ├── iteration_1.json       # Initial MVP tests
│   ├── iteration_2.json       # Landing pages tests
│   └── iteration_3.json       # Auth modal tests
│
└── DOCUMENTATION.md           # This file
```

---

# 4. Database Configuration

## 4.1 Production Database (Railway MongoDB)

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION DATABASE - RAILWAY MONGODB                      │
├─────────────────────────────────────────────────────────────┤
│  Host:     centerbeam.proxy.rlwy.net                        │
│  Port:     20600                                            │
│  Username: mongo                                            │
│  Password: IzypDlPIOWEIyNZSoybbZmWzvPYAeuym                  │
│  Database: intermaven                                       │
│                                                             │
│  Connection String:                                         │
│  mongodb://mongo:IzypDlPIOWEIyNZSoybbZmWzvPYAeuym@          │
│  centerbeam.proxy.rlwy.net:20600                            │
│                                                             │
│  Status: ✅ ACTIVE & CONNECTED                              │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Collections Schema

### users
```javascript
{
  _id: ObjectId,
  email: String,              // Unique, lowercase
  password: String,           // Hashed with bcrypt
  first_name: String,
  last_name: String,
  phone: String,              // M-Pesa & WhatsApp
  plan: String,               // 'free', 'creator', 'pro'
  credits: Number,            // Available credits
  apps: [String],             // ['brandkit', 'musicbio', 'social', 'syncpitch', 'bizpitch']
  portal: String,             // 'music' or 'business'
  brand_name: String,
  bio: String,
  channels: {
    email: Boolean,
    whatsapp: Boolean,
    sms: Boolean,
    push: Boolean
  },
  ai_runs: Number,
  created_at: DateTime
}
```

### notifications
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  icon: String,               // Emoji
  title: String,
  text: String,
  read: Boolean,
  created_at: DateTime
}
```

### ai_runs
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  tool: String,               // 'brandkit', 'musicbio', etc.
  input: Object,              // Tool-specific input
  output: String,             // Generated content
  credits_used: Number,
  created_at: DateTime
}
```

### activities
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  type: String,               // 'ai_run', 'login', 'payment', etc.
  description: String,
  metadata: Object,
  created_at: DateTime
}
```

### transactions
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  type: String,               // 'credit_purchase', 'plan_upgrade'
  amount: Number,             // KES
  credits: Number,
  status: String,             // 'pending', 'completed', 'failed'
  pesapal_reference: String,
  created_at: DateTime
}
```

---

# 5. API Reference

## 5.1 Base URL
- **Preview:** `https://151c44ef-2fa8-40cf-a20d-7837dfcf2942.preview.emergentagent.com`
- **Production:** `https://api.intermaven.io` (to be configured)

## 5.2 Authentication Endpoints

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "minlength8",
  "first_name": "Amara",
  "last_name": "Diallo",
  "phone": "+254712345678",
  "portal": "music"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "first_name": "Amara",
    "credits": 150,
    "plan": "free",
    "apps": ["brandkit", "musicbio", "social", "syncpitch", "bizpitch"]
  }
}
```

### POST /api/auth/login
Login to existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

## 5.3 User Endpoints

### PUT /api/user/profile
Update user profile.

### POST /api/user/apps/toggle
Add or remove an app from user's dashboard.

**Request:**
```json
{
  "app_id": "brandkit",
  "action": "add"
}
```

### GET /api/user/stats
Get user statistics (credits, AI runs, active apps).

## 5.4 AI Endpoints

### POST /api/ai/generate
Generate AI content using specified tool.

**Request:**
```json
{
  "tool": "brandkit",
  "input": {
    "brand_name": "Savanna Sounds",
    "industry": "Music Production",
    "target_audience": "African artists",
    "brand_vibe": "Modern, authentic, professional"
  }
}
```

**Response:**
```json
{
  "success": true,
  "output": "## Brand Name Analysis\n\n**Savanna Sounds** evokes...",
  "credits_used": 10,
  "credits_remaining": 140
}
```

### Tool Credit Costs
| Tool | Credits |
|------|---------|
| brandkit | 10 |
| musicbio | 15 |
| social | 0 (free) |
| syncpitch | 20 |
| bizpitch | 18 |

## 5.5 Notification Endpoints

### GET /api/notifications
Get user notifications.

### POST /api/notifications/mark-read
Mark all notifications as read.

## 5.6 Payment Endpoints

### POST /api/payments/initiate
Start a Pesapal payment.

**Request:**
```json
{
  "amount": 500,
  "plan": "creator"
}
```

### POST /api/payments/callback
Pesapal IPN callback (webhook).

### GET /api/payments/transactions
Get user's payment history.

## 5.7 Other Endpoints

### GET /api/activities
Get recent user activities.

### GET /api/health
Health check endpoint.

---

# 6. Frontend Structure

## 6.1 Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | HomePage | No | Landing page with hero |
| `/tools` | ToolsPage | No | AI tools showcase |
| `/apps` | AppsPage | No | App marketplace |
| `/pricing` | PricingPage | No | Pricing plans |
| `/about` | AboutPage | No | Company info |
| `/auth` | AuthModal | No | Login/Register modal |
| `/dashboard/*` | Dashboard | Yes | User dashboard |

## 6.2 Key Components

### AuthModal.js
- Modal overlay with faded background
- Click outside to close
- Sign In / Create Account tabs
- Form validation

### Dashboard.js
- 30% sidebar width
- Navigation: Dashboard, Notifications, Apps, Settings, Billing
- Quick actions for AI tools
- App cards grid
- Activity feed
- Tool panels with input forms

### LandingLayout.js
- Wraps all landing pages
- Includes Netbar, Navbar, Footer
- Manages modals (Legal, AppInfo)
- Portal switching (Music/Business)

## 6.3 Styling

- **Global:** `/app/frontend/src/App.css`
- **Landing:** `/app/frontend/src/styles/landing.css`
- **CSS Variables:** Dark theme with purple/cyan accents

```css
:root {
  --bg:   #08090d;
  --bg2:  #0f1117;
  --bg3:  #161820;
  --tx:   #f0f0f5;
  --btn:  #7c6ff7;
  --a2:   #c084fc;
  --a3:   #22d3ee;
  --gr:   #10b981;
}
```

---

# 7. Go-Live Checklist

## 7.1 Completed ✅

- [x] Backend API fully functional
- [x] Frontend with all landing pages
- [x] User authentication (JWT)
- [x] All 5 AI tools working
- [x] Production database (Railway MongoDB)
- [x] Auth modal with proper UX
- [x] Mobile responsive design
- [x] Testing completed (100% pass rate)

## 7.2 Required for Launch ⏳

### A. Pesapal Payment Integration
```
Required credentials:
- PESAPAL_CONSUMER_KEY
- PESAPAL_CONSUMER_SECRET

Get from: https://www.pesapal.com/dashboard
```

### B. Production Deployment

**Option 1: Vercel + Railway**
```
Frontend: Vercel
Backend: Railway
Database: Railway MongoDB (already configured)
```

**Option 2: All on Railway**
```
Frontend: Railway (static site)
Backend: Railway
Database: Railway MongoDB
```

### C. Domain Configuration
```
intermaven.io           → Frontend
api.intermaven.io       → Backend
music.intermaven.io     → Music portal (future)
```

### D. Environment Variables for Production

**Backend (.env):**
```
MONGO_URL=mongodb://mongo:IzypDlPIOWEIyNZSoybbZmWzvPYAeuym@centerbeam.proxy.rlwy.net:20600
DB_NAME=intermaven
JWT_SECRET=<generate-strong-secret>
EMERGENT_LLM_KEY=sk-emergent-a3a79EeF44b2f09684
PESAPAL_CONSUMER_KEY=<your-key>
PESAPAL_CONSUMER_SECRET=<your-secret>
PESAPAL_ENVIRONMENT=production
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://api.intermaven.io
```

---

# 8. Future Roadmap

## 8.1 Phase Timeline

```
┌─────────────────────────────────────────────────────────────┐
│  PHASED GO-LIVE TIMELINE                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ READY NOW                                               │
│  • All 5 AI Tools (Brand Kit, Music Bio, Social,            │
│    Sync Pitch, Pitch Deck)                                  │
│  • User Authentication                                      │
│  • Landing Pages                                            │
│  • Production Database                                      │
│                                                             │
│  🎯 GO-LIVE 1: MVP Launch (1-2 weeks)                       │
│  • Configure Pesapal credentials                            │
│  • Deploy to production                                     │
│  • Configure domain                                         │
│                                                             │
│  🎯 GO-LIVE 2: EPK Builder (3-6 weeks)                      │
│  • EPK Builder UI                                           │
│  • Public profiles: intermaven.io/artist/[username]         │
│  • PDF export                                               │
│                                                             │
│  🎯 GO-LIVE 3: File Manager (7-8 weeks)                     │
│  • Google Drive-style file management                       │
│  • Storage tiers by plan                                    │
│                                                             │
│  🎯 GO-LIVE 4: CRM & Communication (10-14 weeks)            │
│  • Contact management                                       │
│  • Email campaigns                                          │
│  • WhatsApp & SMS integration                               │
│                                                             │
│  🎯 GO-LIVE 5: Admin & App Pages (16-20 weeks)              │
│  • Admin dashboard                                          │
│  • Individual app landing pages                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8.2 Feature Details

### EPK Builder
- **Hosted profiles:** `intermaven.io/artist/[username]`
- **PDF Export:** Professional downloadable press kits
- **Sections:** Header, Bio, Music embeds, Media, Events, Contact
- **Analytics:** Views, clicks, geography tracking

### CRM & Communication
- **Contact Management:** Import, tags, lists, segmentation
- **Email Campaigns:** Resend/SendGrid integration
- **WhatsApp:** Twilio integration, broadcasts
- **SMS:** Africa's Talking for local delivery
- **Automations:** Trigger-based workflows

### User Management (Admin)
- **Roles:** super_admin, admin, support, finance
- **Features:** User search, bulk actions, impersonation
- **Support:** Ticket system with SLA tracking
- **Analytics:** User growth, revenue dashboards

### File Management
- **Interface:** Google Drive-style folders
- **Storage:** Free 1GB, Creator 5GB, Pro 25GB
- **Features:** Upload, preview, share, version history

### App Landing Pages
- **Subdomains:** brandkit.intermaven.io, musicbio.intermaven.io, etc.
- **Template:** Hero, How it works, Demo, Pricing, FAQ

---

# 9. Credentials & Environment Variables

## 9.1 Current Configuration

### Database (Railway MongoDB) ✅ ACTIVE
```
Host: centerbeam.proxy.rlwy.net
Port: 20600
Username: mongo
Password: IzypDlPIOWEIyNZSoybbZmWzvPYAeuym
Database: intermaven
```

### AI Integration (Emergent LLM Key) ✅ ACTIVE
```
EMERGENT_LLM_KEY=sk-emergent-a3a79EeF44b2f09684
Model: Claude Sonnet 4.5
```

### Authentication ✅ ACTIVE
```
JWT_SECRET=intermaven_jwt_secret_key_2025_secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Payments (Pesapal) ⏳ PENDING
```
PESAPAL_CONSUMER_KEY=<pending>
PESAPAL_CONSUMER_SECRET=<pending>
PESAPAL_ENVIRONMENT=sandbox
```

### WhatsApp/SMS (Twilio) ⏳ PENDING
```
TWILIO_ACCOUNT_SID=<pending>
TWILIO_AUTH_TOKEN=<pending>
TWILIO_WHATSAPP_NUMBER=<pending>
```

## 9.2 Preview Environment

```
Frontend URL: https://151c44ef-2fa8-40cf-a20d-7837dfcf2942.preview.emergentagent.com
Backend URL:  https://151c44ef-2fa8-40cf-a20d-7837dfcf2942.preview.emergentagent.com/api
```

---

# Appendix A: Testing Results

## Test Reports

| Iteration | Date | Focus | Result |
|-----------|------|-------|--------|
| 1 | Mar 24, 2026 | Initial MVP | 100% (20/20 backend tests) |
| 2 | Mar 24, 2026 | Landing Pages | 100% (all pages render) |
| 3 | Mar 24, 2026 | Auth Modal + AI Tools | 100% (modal, all 5 tools) |

## Test User Credentials
```
Email: production_test_1774368430@example.com
Password: testpass123
```

---

# Appendix B: Useful Commands

## Development

```bash
# Start backend
cd /app/backend && uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Start frontend
cd /app/frontend && yarn start

# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

## Database

```bash
# Connect to MongoDB
mongosh "mongodb://mongo:IzypDlPIOWEIyNZSoybbZmWzvPYAeuym@centerbeam.proxy.rlwy.net:20600/intermaven"

# Quick Python connection test
python3 -c "
from pymongo import MongoClient
client = MongoClient('mongodb://mongo:IzypDlPIOWEIyNZSoybbZmWzvPYAeuym@centerbeam.proxy.rlwy.net:20600')
print('Connected:', client.intermaven.users.count_documents({}), 'users')
"
```

## API Testing

```bash
# Register user
curl -X POST "https://<url>/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User","phone":"+254712345678","portal":"music"}'

# Login
curl -X POST "https://<url>/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# AI Generate (with token)
curl -X POST "https://<url>/api/ai/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tool":"brandkit","input":{"brand_name":"Test Brand","industry":"Music","target_audience":"Artists","brand_vibe":"Modern"}}'
```

---

*Document Version: 1.0*  
*Last Updated: March 24, 2026*  
*Platform: Intermaven - AI Tools for African Creatives*
