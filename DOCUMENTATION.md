# Intermaven Platform Documentation
## Complete Technical Reference & Roadmap

**Last Updated:** March 29, 2026  
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
- [ ] CRM & Communication System (full multi-platform)
- [ ] User Management (Admin Panel with full edit access)
- [ ] App Landing Pages (subdomains)
- [ ] Partner Program (corporate accounts with commission system)

---

# 3. Technical Architecture

## 3.1 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | React | 18.2.0 | Single Page Application |
| UI Components | Custom CSS + Shadcn/UI | - | Design system |
| Backend | FastAPI | 0.104.1 | REST API |
| Runtime | Python | 3.11.14 | Backend runtime |
| Runtime | Node.js | 20.20.0 | Frontend build |
| Package Manager | Yarn | 1.22.22 | Frontend dependencies |
| Database | MongoDB | - | Document store |
| AI | Claude Sonnet 4.5 | - | Via Emergent LLM Key |
| Payments | Pesapal | - | M-Pesa + Cards |
| Messaging | Twilio | - | WhatsApp & SMS (outbound + inbound) |
| Email | Resend / SendGrid | - | Transactional & campaign emails |
| Hosting (Planned) | Vercel + Railway | - | Frontend + Backend |

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
│   │       ├── admin/         # Admin components (future)
│   │       │   ├── AdminPanel.js
│   │       │   ├── UserTable.js
│   │       │   ├── UserEditModal.js
│   │       │   └── CreditGrant.js
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
│   │           └── AppInfoModal.js
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
  type: String,               // 'ai_run', 'login', 'payment', 'credit_grant', etc.
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
  type: String,               // 'credit_purchase', 'plan_upgrade', 'credit_grant'
  amount: Number,             // KES (0 for admin grants)
  credits: Number,
  status: String,             // 'pending', 'completed', 'failed'
  granted_by: ObjectId,       // Admin user ID (for credit_grant type)
  note: String,               // Optional admin note for free credit grants
  pesapal_reference: String,
  created_at: DateTime
}
```

### crm_contacts (Future)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Intermaven user who owns this contact
  name: String,
  email: String,
  phone: String,              // WhatsApp / SMS number
  tags: [String],             // e.g. ['label', 'fan', 'press']
  lists: [String],            // Audience segments
  source: String,             // 'manual', 'import', 'whatsapp', 'email_reply'
  platform_data: {
    last_whatsapp_at: DateTime,
    last_sms_at: DateTime,
    last_email_at: DateTime,
    email_opens: Number,
    email_clicks: Number,
    whatsapp_messages_sent: Number,
    sms_messages_sent: Number,
    whatsapp_messages_received: Number
  },
  notes: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

### crm_messages (Future)
```javascript
{
  _id: ObjectId,
  sender_user_id: ObjectId,   // Intermaven user sending
  contact_id: ObjectId,       // crm_contacts ref
  channel: String,            // 'whatsapp', 'sms', 'email'
  direction: String,          // 'outbound', 'inbound'
  body: String,
  subject: String,            // Email only
  status: String,             // 'sent', 'delivered', 'read', 'failed'
  twilio_sid: String,         // Twilio message SID
  created_at: DateTime
}
```

### crm_campaigns (Future)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  channel: String,            // 'whatsapp', 'sms', 'email'
  audience: [ObjectId],       // Contact IDs or list name
  body: String,
  subject: String,            // Email only
  status: String,             // 'draft', 'scheduled', 'sent', 'failed'
  scheduled_at: DateTime,
  sent_at: DateTime,
  stats: {
    total: Number,
    sent: Number,
    delivered: Number,
    opened: Number,           // Email only
    clicked: Number,          // Email only
    failed: Number
  },
  created_at: DateTime
}
```

### admin_credit_grants (Future)
```javascript
{
  _id: ObjectId,
  granted_by: ObjectId,       // Admin user ID
  granted_to: ObjectId,       // Recipient user ID
  credits: Number,
  method: String,             // 'custom' or 'preset'
  preset_label: String,       // e.g. '150 credits' (if method is preset)
  note: String,               // Reason / internal note
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

## 5.7 CRM Endpoints (Future)

### Contacts

#### GET /api/crm/contacts
List all contacts for the authenticated user. Supports filtering by tag, list, or search query.

**Query params:** `?tag=press&list=fans&search=amara`

#### POST /api/crm/contacts
Create a new contact.

**Request:**
```json
{
  "name": "Amara Diallo",
  "email": "amara@example.com",
  "phone": "+254712345678",
  "tags": ["press", "vip"],
  "lists": ["newsletter"],
  "source": "manual"
}
```

#### PUT /api/crm/contacts/{contact_id}
Update a contact's details, tags, or list membership.

#### DELETE /api/crm/contacts/{contact_id}
Delete a contact.

#### POST /api/crm/contacts/import
Bulk import contacts via CSV upload.

### Messaging

#### POST /api/crm/messages/send
Send a single WhatsApp or SMS message to a contact via Twilio.

**Request:**
```json
{
  "contact_id": "...",
  "channel": "whatsapp",
  "body": "Hey Amara, your press kit is ready!"
}
```

#### GET /api/crm/messages/{contact_id}
Get full message thread for a contact across all channels.

#### POST /api/crm/twilio/webhook
Twilio inbound webhook. Receives incoming WhatsApp and SMS messages.

### Campaigns

#### GET /api/crm/campaigns
List all campaigns for the authenticated user.

#### POST /api/crm/campaigns
Create a new campaign.

#### POST /api/crm/campaigns/{campaign_id}/send
Trigger immediate send of a campaign.

#### GET /api/crm/campaigns/{campaign_id}/stats
Get delivery and engagement stats for a campaign.

## 5.8 Admin Endpoints (Future)

All admin endpoints require `Authorization: Bearer <token>` where the token belongs to a user with an admin role.

### User Management

#### GET /api/admin/users
List all users. Supports search and filters.

#### GET /api/admin/users/{user_id}
Get full profile for a specific user.

#### PUT /api/admin/users/{user_id}
Edit any field on a user account.

#### POST /api/admin/users/{user_id}/grant-credits
Grant free credits to a user.

**Request:**
```json
{
  "method": "custom",
  "credits": 250,
  "note": "Compensation for service disruption"
}
```

**Preset Bundles:**
| Label | Credits |
|-------|---------|
| Starter Boost | 50 |
| Standard Grant | 150 |
| Creator Boost | 500 |
| Pro Grant | 1,000 |

#### DELETE /api/admin/users/{user_id}
Soft-delete a user account.

### Admin Analytics

#### GET /api/admin/stats
Platform-wide stats.

#### GET /api/admin/credit-grants
List all credit grants across all admins.

## 5.9 Other Endpoints

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
| `/partners` | PartnersPage | No | Partner companies listing |
| `/partners/apply` | PartnerSignup | No | Partner application form |
| `/auth` | AuthModal | No | Login/Register modal |
| `/dashboard/*` | Dashboard | Yes | User dashboard |
| `/partner/*` | PartnerDashboard | Yes (partner role) | Partner dashboard |
| `/admin/*` | AdminPanel | Yes (admin role) | Admin panel (future) |

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

### AdminPanel.js *(future)*
- Role-gated entry
- Sidebar navigation: Users, Credit Grants, Analytics, Settings
- UserTable with search, filter, and inline actions
- UserEditModal for full field editing
- CreditGrant modal with preset and custom amount options

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
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+<number>
TWILIO_SMS_NUMBER=+<number>
RESEND_API_KEY=<your-key>
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
│  • Full contact management with multi-platform data         │
│  • Twilio WhatsApp & SMS (outbound + inbound)               │
│  • Email campaigns (Resend/SendGrid)                        │
│  • Campaign analytics dashboard                             │
│                                                             │
│  🎯 GO-LIVE 5: Admin & App Pages (16-20 weeks)              │
│  • Full admin panel with user management                    │
│  • Free credit granting (custom + presets)                  │
│  • Individual app landing pages                             │
│                                                             │
│  🎯 GO-LIVE 6: Partner Program (21-26 weeks)                │
│  • Partner/Corporate accounts                               │
│  • Commission system for partner referrals                  │
│  • Partner dashboard for user management                    │
│  • Public Partners page with company listings               │
│  • Partner sign-up and onboarding flow                      │
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

**Contact Management**
- Import contacts via CSV or add manually
- Tag and segment into lists
- Full interaction history per contact
- Source tracking

**Multi-Platform Data Capture**
| Data Source | Data Captured |
|-------------|---------------|
| Intermaven platform | AI runs, logins, payments |
| WhatsApp (Twilio) | Messages sent/received |
| SMS (Twilio) | Messages sent, delivery status |
| Email (Resend) | Opens, clicks |

**Twilio Integration**
- Outbound: Send WhatsApp/SMS from CRM
- Inbound: Receive replies via webhook
- Message threads per contact
- Delivery tracking

### User Management (Admin)

**Admin Roles**
| Role | Permissions |
|------|-------------|
| super_admin | Full access |
| admin | Edit users, grant credits, analytics |
| support | View profiles, grant credits (capped) |
| finance | View transactions only |

**Features**
- Full user editing (name, email, plan, credits, apps)
- Free credit granting with presets
- All changes logged for audit
- User search and bulk actions

### File Management
- **Interface:** Google Drive-style folders
- **Storage:** Free 1GB, Creator 5GB, Pro 25GB
- **Features:** Upload, preview, share, version history

### App Landing Pages
- **Subdomains:** brandkit.intermaven.io, musicbio.intermaven.io, etc.
- **Template:** Hero, How it works, Demo, Pricing, FAQ

### Partner Program (Corporate Accounts)

The Partner Program allows organizations (record labels, agencies, creative hubs) to onboard and manage multiple users under their account, earning commission on all platform activity from their referred users.

**Partner Types**
| Type | Description | Example |
|------|-------------|---------|
| Record Label | Music labels with signed artists | Mavin Records, Sema Records |
| Creative Agency | Agencies managing multiple creatives | Brand agencies, PR firms |
| Incubator/Hub | Creative hubs and accelerators | Nairobi Garage, CcHub |
| Distributor | Music distributors with artist rosters | Africori, Platoon |

**Commission System**

Partners earn a percentage of all revenue generated by users they onboard:

| Revenue Source | Commission Basis |
|----------------|------------------|
| Credit purchases | % of purchase amount |
| Plan upgrades | % of upgrade amount |
| Future premium features | % of feature revenue |

**Commission Rates (Configurable via Admin)**
| Tier | Base Rate | Volume Bonus | Notes |
|------|-----------|--------------|-------|
| Standard | 10% | - | Default for new partners |
| Silver | 15% | 50+ active users | Auto-upgrade threshold |
| Gold | 20% | 200+ active users | Auto-upgrade threshold |
| Custom | Negotiable | Enterprise deals | Manual admin override |

**Partner Dashboard Features**

Partners get a dedicated dashboard to manage their roster:

```
┌─────────────────────────────────────────────────────────────┐
│  PARTNER DASHBOARD: Mavin Records                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OVERVIEW                                                   │
│  ─────────────────────────────────────────────────────────  │
│  Total Users: 47        Active (30d): 38                    │
│  Commission Rate: 15%   Tier: Silver                        │
│  Earnings MTD: KES 12,450   Lifetime: KES 89,200            │
│                                                             │
│  [Invite User]  [View Earnings]  [Export Report]            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  MY USERS                                                   │
│  ─────────────────────────────────────────────────────────  │
│  □  Name           Email              Plan    AI Runs       │
│  ─────────────────────────────────────────────────────────  │
│  □  Ayra Starr     ayra@email.com     Pro     234          │
│  □  Rema           rema@email.com     Creator 189          │
│  □  Crayon         crayon@email.com   Pro     156          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PENDING INVITES                                            │
│  ─────────────────────────────────────────────────────────  │
│  newartist@email.com - Sent Mar 25 - [Resend] [Cancel]      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  COMMISSION BREAKDOWN (Last 30 days)                        │
│  ─────────────────────────────────────────────────────────  │
│  Credit Purchases: KES 8,200 × 15% = KES 1,230              │
│  Plan Upgrades:    KES 28,500 × 15% = KES 4,275             │
│  ─────────────────────────────────────────────────────────  │
│  Total Commission: KES 5,505                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Partner User Onboarding Flow**

1. Partner sends invite via email or generates unique referral link
2. User signs up using invite link (auto-associates with partner)
3. User gets standard free credits + any partner-specific bonus
4. All user activity tracked for commission calculation
5. Partner sees user in their dashboard immediately

**Public Partners Page (`/partners`)**

A public-facing page showcasing approved partners:

```
┌─────────────────────────────────────────────────────────────┐
│  OUR PARTNERS                                               │
│  Trusted organizations building with Intermaven             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   [Logo]    │  │   [Logo]    │  │   [Logo]    │         │
│  │             │  │             │  │             │         │
│  │ Mavin       │  │ Sema        │  │ Africori    │         │
│  │ Records     │  │ Records     │  │             │         │
│  │             │  │             │  │             │         │
│  │ Nigeria's   │  │ East        │  │ Africa's    │         │
│  │ leading     │  │ Africa's    │  │ largest     │         │
│  │ record...   │  │ premier...  │  │ music...    │         │
│  │             │  │             │  │             │         │
│  │ 🌐 🐦 📷    │  │ 🌐 🐦 📷    │  │ 🌐 🐦 📷    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   [Logo]    │  │   [Logo]    │  │   [Logo]    │         │
│  │   ...       │  │   ...       │  │   ...       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  BECOME A PARTNER                                           │
│  ─────────────────────────────────────────────────────────  │
│  Are you a record label, agency, or creative hub?           │
│  Join our partner program and earn commission on every      │
│  creative you onboard.                                      │
│                                                             │
│  [Apply to become a partner →]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Partner Sign-Up Form**

Collects:
- Company name
- Company type (label, agency, hub, distributor, other)
- Contact person name
- Email
- Phone
- Website URL
- Social links (Instagram, Twitter, LinkedIn)
- Company bio (short description)
- Logo upload
- Estimated number of users to onboard
- How did you hear about us?

**Partner Approval Flow**
1. Partner submits application
2. Application enters "pending" status
3. Admin reviews and approves/rejects
4. On approval: Partner account created with base commission rate (10%)
5. Partner receives welcome email with dashboard access
6. Partner listed on public Partners page (optional, can be hidden)

**Partner Database Schema**

```javascript
// partners collection
{
  _id: ObjectId,
  
  // Company info
  company_name: String,
  company_type: String,           // 'label', 'agency', 'hub', 'distributor', 'other'
  bio: String,                    // Short description (max 200 chars)
  logo_url: String,               // Uploaded logo
  website: String,
  
  // Social links
  social: {
    instagram: String,
    twitter: String,
    linkedin: String,
    facebook: String
  },
  
  // Contact
  contact_name: String,
  contact_email: String,
  contact_phone: String,
  
  // Account
  user_id: ObjectId,              // Partner's own user account
  status: String,                 // 'pending', 'approved', 'rejected', 'suspended'
  
  // Commission
  commission_rate: Number,        // Percentage (e.g., 10, 15, 20)
  commission_tier: String,        // 'standard', 'silver', 'gold', 'custom'
  custom_rate_note: String,       // Admin note for custom rates
  
  // Referral
  referral_code: String,          // Unique code (e.g., 'MAVIN2026')
  referral_link: String,          // Full signup URL with code
  
  // Users
  users: [ObjectId],              // User IDs under this partner
  user_count: Number,             // Cached count for performance
  active_user_count: Number,      // Active in last 30 days
  
  // Financials
  total_earnings: Number,         // Lifetime commission earned (KES)
  pending_payout: Number,         // Unpaid commission
  last_payout_at: DateTime,
  
  // Display settings
  show_on_partners_page: Boolean, // Public listing opt-in
  featured: Boolean,              // Featured partner (admin-set)
  
  // Metadata
  created_at: DateTime,
  approved_at: DateTime,
  approved_by: ObjectId,          // Admin who approved
  updated_at: DateTime
}

// partner_commissions collection
{
  _id: ObjectId,
  partner_id: ObjectId,
  user_id: ObjectId,              // User who made the purchase
  transaction_id: ObjectId,       // Reference to transactions collection
  
  // Commission details
  transaction_amount: Number,     // Original transaction (KES)
  commission_rate: Number,        // Rate at time of transaction
  commission_amount: Number,      // Earned commission (KES)
  
  // Status
  status: String,                 // 'pending', 'approved', 'paid', 'cancelled'
  
  // Payout
  payout_id: ObjectId,            // Reference to payouts collection
  paid_at: DateTime,
  
  created_at: DateTime
}

// partner_payouts collection
{
  _id: ObjectId,
  partner_id: ObjectId,
  
  // Payout details
  amount: Number,                 // Total payout (KES)
  commission_ids: [ObjectId],     // Commissions included in this payout
  
  // Payment
  payment_method: String,         // 'mpesa', 'bank_transfer', 'paypal'
  payment_reference: String,      // M-Pesa code, bank ref, etc.
  payment_details: Object,        // Method-specific details
  
  // Status
  status: String,                 // 'pending', 'processing', 'completed', 'failed'
  
  // Admin
  initiated_by: ObjectId,         // Admin who initiated
  completed_at: DateTime,
  
  created_at: DateTime
}

// partner_invites collection
{
  _id: ObjectId,
  partner_id: ObjectId,
  
  // Invite details
  email: String,
  invite_code: String,            // Unique per invite
  
  // Status
  status: String,                 // 'pending', 'accepted', 'expired', 'cancelled'
  
  // Result
  user_id: ObjectId,              // Created user (if accepted)
  accepted_at: DateTime,
  
  // Metadata
  sent_at: DateTime,
  expires_at: DateTime,
  resent_count: Number
}
```

**Partner API Endpoints**

```
# Public
GET    /api/partners                      # List approved partners for public page
POST   /api/partners/apply                # Submit partner application
GET    /api/partners/verify/:code         # Verify referral code

# Partner Dashboard (requires partner role)
GET    /api/partner/dashboard             # Dashboard stats
GET    /api/partner/users                 # List users under partner
POST   /api/partner/invite                # Send user invite
DELETE /api/partner/invite/:id            # Cancel pending invite
GET    /api/partner/commissions           # List commission history
GET    /api/partner/payouts               # List payout history
PUT    /api/partner/profile               # Update partner profile
POST   /api/partner/payout/request        # Request payout

# Admin
GET    /api/admin/partners                # List all partners
GET    /api/admin/partners/:id            # Get partner details
PUT    /api/admin/partners/:id            # Update partner (status, rate, etc.)
POST   /api/admin/partners/:id/approve    # Approve application
POST   /api/admin/partners/:id/reject     # Reject application
POST   /api/admin/partners/:id/payout     # Process payout
GET    /api/admin/partners/applications   # List pending applications
GET    /api/admin/partners/commissions    # All commissions report
```

**Frontend Components (Partner)**

```
/app/frontend/src/components/partner/
├── PartnerDashboard.js       # Main partner dashboard
├── PartnerUsers.js           # User management table
├── PartnerInvite.js          # Invite user modal
├── PartnerEarnings.js        # Commission & payout history
├── PartnerProfile.js         # Edit partner profile
├── PartnerSignup.js          # Application form
└── PartnersPage.js           # Public partners listing page
```

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

### WhatsApp & SMS (Twilio) ⏳ PENDING
```
TWILIO_ACCOUNT_SID=<pending>
TWILIO_AUTH_TOKEN=<pending>
TWILIO_WHATSAPP_NUMBER=whatsapp:+<number>
TWILIO_SMS_NUMBER=+<number>
Webhook URL: https://api.intermaven.io/api/crm/twilio/webhook
```

### Email (Resend) ⏳ PENDING
```
RESEND_API_KEY=<pending>
Get from: https://resend.com/api-keys
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

# Grant credits (admin) - Future
curl -X POST "https://<url>/api/admin/users/<user_id>/grant-credits" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"method":"preset","preset_label":"Standard Grant","credits":150,"note":"Onboarding bonus"}'

# Send WhatsApp message via CRM - Future
curl -X POST "https://<url>/api/crm/messages/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contact_id":"<id>","channel":"whatsapp","body":"Hey! Your press kit is ready."}'
```

---

*Document Version: 1.2*  
*Last Updated: March 29, 2026*  
*Platform: Intermaven - AI Tools for African Creatives*
