# Intermaven Platform Documentation
## Complete Technical Reference

**Last Updated:** April 12, 2026
**Version:** 4.0
**Status:** Active Development — Backend Live on Railway

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. Frontend Structure
6.1 Component Map
6.2 Dashboard Panels
6.3 App Sorting Grid
6.4 Landing Page Header
6.5 Hero Section
7. Image & Asset System(#7-image--asset-system)
8. [Deployment Configuration](#8-deployment-configuration)
9. [tunemavens.com — Technical Spec](#9-tunemavens.com--technical-spec)
10. [Roadmap — Remaining Build Items](#10-roadmap--remaining-build-items)
11. [Credentials & Environment Variables](#11-credentials--environment-variables)
12. [AI Testing Agent System](#12-ai-testing-agent-system)
13. [Cross-Platform Plugin Integration](#13-cross-platform-plugin-integration)

---

# 1. Project Overview

## 1.1 What is Intermaven?

Intermaven is a dual-portal AI-powered creative and business tools ecosystem built for African entrepreneurs, musicians, and artists.

**Portal 1 — intermaven.io**
AI tools for creative business: brand kits, music bios, social content, sync pitches, pitch decks, EPK builder, CRM, file management, and admin.

**Portal 2 — tunemavens.com**
Africa's music ecosystem: streaming, distribution, sync licensing, DJ tools, label management, corporate advertising, and media house licensing.

Both portals share a single authentication layer, credit system, database, and AI infrastructure.

## 1.2 Business Model

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Free Starter | KES 0 | 150 | All AI tools, 90-day expiry |
| Creator | KES 500 | 600 | Priority speed, credits never expire |
| Pro | KES 1,500 | 2,500 | API access, white-label, WhatsApp support |

## 1.3 AI Tool Credit Costs

| Tool | Credits per Run |
|------|----------------|
| Brand Kit AI | 10 |
| Music Bio & Press Kit | 15 |
| Social AI | Free |
| Sync Pitch AI | 20 |
| Pitch Deck AI | 18 |
| EPK Builder (AI bio generation) | 15 |

---

# 2. Current Implementation Status

## 2.1 Completed & Deployed

### Backend (FastAPI — Railway)
- User registration and login with JWT authentication
- Protected routes with token verification
- Profile management (update profile, settings)
- App management (add/remove apps from dashboard)
- User statistics API
- Notifications system
- AI generation with Claude Sonnet via Emergent LLM Key
- Activity logging
- Pesapal payment endpoints (awaiting credentials)
- Newsletter subscription
- Beta signup waitlist
- Support ticket system with AI auto-response
- Forum posts
- Admin Panel — full user management, credit granting, audit logging, analytics, system settings
- CRM and Communications — contacts, campaigns, direct messaging via Twilio, inbound webhook
- EPK routes — create, update, publish, username check, public page, analytics
- File Management routes — files, folders, storage info, download URLs, share links

### Frontend (React 18 — Hostinger)
- Landing pages: Home, Tools, Apps, Pricing, About, Help, Forum, Terms, Privacy
- Auth modal with multi-step registration wizard
- Dashboard with 30% sidebar layout
- All 5 AI tools functional
- Social AI — full rebuild: 7 platforms, 23 formats, Meta-maximized, hashtag strategy, timing, hooks
- Admin Console — Users table, analytics, audit log, settings (super_admin only)
- CRM Panel — contacts, campaigns, quick send, message threads
- EPK Builder — 7-tab builder, AI bio generation, publish/unpublish, analytics, multi-hosting
- File Manager — grid/list view, drag-drop upload, folders, preview, sharing
- App Sorting Grid — multi-select, category filter, search, wizard for multiple apps
- App Landing Pages — dynamic tool landing pages with pricing, FAQs, hero sections, and subdomain-ready templates
- EPK Public Page — /artist/:username public-facing route
- Hero slideshow with image registry and CSS fallbacks
- Page headers with image registry and CSS fallbacks
- AyoChat AI assistant (floating widget)
- Toast notifications
- Mobile responsive design

### Database (MongoDB — Railway)
Collections active: users, notifications, ai_runs, activities, transactions, beta_signups, support_tickets, forum_posts, newsletter_subscribers, crm_waitlist, crm_messages, crm_campaigns, contacts, epk_profiles, epk_analytics, files, folders, audit_log, admin_credit_grants, system_settings

## 2.2 Pending

| Item | Blocker |
|------|---------|
| Live payments | Pesapal credentials |
| WhatsApp/SMS messaging | Twilio credentials |
| Email campaigns | Resend API key |
| File uploads | Cloud storage (S3/GCS/R2) wiring |
| Hero and header images | Image assets from designer |
| App icons (PNG) | Icons from designer |
| tunemavens.com build | Next major phase |

## 2.3 Go-Live Checklist

- [ ] Pesapal credentials added to Railway environment variables
- [ ] Twilio credentials added to Railway environment variables
- [ ] Resend API key added to Railway environment variables
- [ ] Cloud storage configured and /api/files/upload endpoint wired
- [ ] Hero images uploaded to public/images/hero/intermaven/
- [ ] Header images uploaded to public/images/headers/intermaven/
- [ ] App icons uploaded to public/icons/apps/
- [ ] Admin role set for Tim's account in MongoDB
- [ ] Remove .htaccess password protection when ready to go public
- [ ] DNS: A record pointing intermaven.io to Hostinger IP
- [ ] DNS: CNAME api.intermaven.io to intermaven-production.up.railway.app
- [ ] SSL certificate active (auto via Hostinger)

---

# 3. Technical Architecture

## 3.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18.2.0 | Single Page Application |
| Routing | React Router v6 | Client-side routing |
| HTTP Client | Axios | API communication |
| Icons | Lucide React | UI icons |
| Backend | FastAPI (Python 3.11) | REST API |
| Database | MongoDB (Railway) | Document store |
| AI Engine | Claude Sonnet 4.5 via Emergent | All AI generation |
| Payments | Pesapal | KES, M-Pesa, cards |
| Messaging | Twilio | WhatsApp and SMS (inbound and outbound) |
| Email | Resend | Transactional and campaigns |
| File Storage | S3 / GCS / Cloudflare R2 | Asset uploads |
| Frontend Hosting | Hostinger Shared (public_html) | Static React build |
| Backend Hosting | Railway | FastAPI and MongoDB |
| Domain | intermaven.io (Hostinger DNS) | Primary domain |

## 3.2 Authentication Architecture

Single JWT layer shared across both portals:

- Token stored in localStorage as `token`
- 1440-minute expiry (24 hours)
- `portal` field on user document tracks which portal they registered on
- Users registered on either portal can access both with no re-registration required
- `admin_role` field: super_admin, admin, support, finance

## 3.3 API URL Structure

```
Base URL (production):  https://intermaven.onrender.com
Base URL (planned):     https://api.intermaven.io

Auth:        /api/auth/register | /api/auth/login | /api/auth/me
User:        /api/user/profile | /api/user/stats
Apps:        /api/users/apps | /api/apps/available
AI:          /api/ai/generate
Payments:    /api/payments/initiate | /api/payments/callback
Admin:       /api/admin/users | /api/admin/analytics/* | /api/admin/audit-log
             /api/admin/users/:id/grant-credits | /api/admin/settings
CRM:         /api/crm/contacts | /api/crm/campaigns | /api/crm/messages/*
             /api/crm/twilio/webhook
EPK:         /api/epk/my | /api/epk/create | /api/epk/:id
             /api/epk/public/:username | /api/epk/:id/analytics
Files:       /api/files | /api/files/upload | /api/files/:id/download
             /api/files/:id/share | /api/folders
Health:      /api/health
```

## 3.4 Landing Page & Subdomain Architecture

- `intermaven.io` is the primary business portal and should default to business apps, with music portal content reachable through a top navigation tab.
- `tunemavens.com` is the music ecosystem portal. Vertical audience pages should use branded subdomains such as `djs.tunemavens.com`, `labels.tunemavens.com`, `producers.tunemavens.com`, and `mediahouses.tunemavens.com`.
- Each subdomain landing page should include:
  - a hero section with three targeted key messages tailored to the visitor segment
  - app cards, FAQs, and bottom content that are specific to the vertical or audience
  - a logo carousel directly below the hero section on `tunemavens.com`
- Main Intermaven app landing pages should follow the same pattern: hero section plus a related carousel below it, with the first wave focused on flagship offerings (Social AI, Brand Kit AI, Smart CRM).
- Not all apps need landing pages immediately. Build flagship pages first and extend to additional apps after reviewing user behavior.
- Admin-managed hero content should be supported by the backend CMS over time. This can be added in tandem with the existing CMS system and scheduled later in the release pipeline.
- Future development should enable users to build their own sites leveraging Intermaven systems and connected apps as a post-launch release.

---

# 4. Database Schema

## 4.1 users
```javascript
{
  _id: ObjectId,
  email: String,              // Unique, lowercase
  password: String,           // bcrypt hashed
  first_name: String,
  last_name: String,
  phone: String,
  plan: String,               // 'free' | 'creator' | 'pro'
  credits: Number,
  apps: [String],
  portal: String,             // 'music' | 'business'
  brand_name: String,
  bio: String,
  channels: { email: Boolean, whatsapp: Boolean, sms: Boolean, push: Boolean },
  ai_runs: Number,
  admin_role: String,         // 'super_admin' | 'admin' | 'support' | 'finance' | null
  admin_notes: [{ note: String, admin_id: String, created_at: Date }],
  suspended: Boolean,
  deleted: Boolean,
  created_at: Date
}
```

## 4.2 admin_credit_grants
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  admin_id: ObjectId,
  method: String,             // 'preset' | 'custom'
  preset_label: String,       // 'Starter Boost' | 'Standard Grant' | 'Creator Boost' | 'Pro Grant'
  credits: Number,            // 50 | 150 | 500 | 1000 for presets
  note: String,
  created_at: Date
}
```

## 4.3 audit_log
```javascript
{
  _id: ObjectId,
  admin_id: String,
  admin_name: String,
  action: String,             // 'user_edit' | 'credit_grant' | 'suspend' | 'settings_update' etc
  target_user_id: String,
  target_user_name: String,
  details: Object,            // Field-level changes with old and new values
  created_at: Date
}
```

## 4.4 epk_profiles
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  username: String,           // Unique URL-safe slug
  artist_name: String,
  tagline: String,
  genres: [String],
  location: String,
  bio_short: String,
  bio_full: String,
  highlights: [{ year: String, text: String }],
  music: { spotify_artist_id, apple_music_url, youtube_channel, soundcloud_url, boomplay_url },
  social_links: { instagram, twitter, tiktok, youtube, facebook, spotify },
  contact: { booking_email, management_email, press_email, booking_form_enabled },
  press_quotes: [{ quote, source, date }],
  events_upcoming: [{ date, venue, city, ticket_url }],
  design: { template, primary_color, secondary_color },
  is_published: Boolean,
  hosting: { intermaven: Boolean, intermavenmusic: Boolean, custom_domain: String },
  analytics: { total_views: Number, unique_visitors: Number },
  created_at: Date,
  updated_at: Date
}
```

## 4.5 contacts
```javascript
{
  _id: ObjectId,
  owner_id: ObjectId,
  email: String,
  phone: String,
  first_name: String,
  last_name: String,
  company: String,
  tags: [String],             // 'fan' | 'industry' | 'press' | 'booker' | 'label' | 'vip' etc
  source: String,             // 'manual' | 'import' | 'epk_form' | 'newsletter'
  engagement: { emails_sent, emails_opened, emails_clicked, whatsapp_messages, sms_messages },
  status: String,             // 'active' | 'unsubscribed'
  deleted: Boolean,
  created_at: Date
}
```

## 4.6 crm_campaigns
```javascript
{
  _id: ObjectId,
  owner_id: ObjectId,
  channel: String,            // 'email' | 'whatsapp' | 'sms'
  subject: String,
  body: String,
  campaign_type: String,      // 'release' | 'event' | 'newsletter' | 'press' | 'custom'
  recipient_type: String,     // 'all' | 'tag' | 'plan'
  recipients: Number,
  status: String,             // 'draft' | 'scheduled' | 'sent' | 'failed'
  stats: { sent, delivered, opened, clicked, failed },
  created_at: Date,
  sent_at: Date
}
```

## 4.7 files
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  filename: String,
  mime_type: String,
  size: Number,               // bytes
  storage_url: String,
  folder_id: ObjectId,        // null for root
  is_favorite: Boolean,
  is_public: Boolean,
  share_token: String,
  deleted_at: Date,           // soft delete
  created_at: Date
}
```

## 4.8 system_settings
```javascript
{
  key: 'global',
  default_plan: String,
  free_credits: Number,       // default 150
  creator_credits: Number,    // default 600
  pro_credits: Number,        // default 2500
  brandkit_cost: Number,      // default 10
  musicbio_cost: Number,      // default 15
  syncpitch_cost: Number,     // default 20
  bizpitch_cost: Number,      // default 18
  maintenance_mode: Boolean,
  registrations_open: Boolean
}
```

## 4.9 support_tickets
```javascript
{
  _id: ObjectId,
  ticket_id: String,          // Unique format TKT-XXXXXX
  subject: String,
  category: String,           // 'general' | 'billing' | 'technical' | 'ai-tools'
  status: String,             // 'open' | 'in_progress' | 'resolved'
  priority: String,           // 'normal' | 'high'
  preferred_channel: String,  // 'email' | 'whatsapp' | 'sms'
  email: String,
  phone: String,
  user_id: ObjectId,          // optional owner
  client_name: String,        // optional name
  attachments: [String],      // array of Base64 image strings
  messages: [{
    sender: String,           // 'user' | 'ai' | 'admin'
    message: String,
    timestamp: Date
  }],
  ai_handled: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## 4.10 forum_posts
```javascript
{
  _id: ObjectId,
  title: String,
  category: String,
  content: String | Array,    // String for announcements, Array of messages for resolved support tickets
  source: String,             // 'support_ticket' | 'manual'
  ticket_id: String,          // optional origin reference
  author: String,
  author_role: String,
  status: String,             // 'published' | 'draft'
  created_at: Date
}
```

## 4.11 crm_leads
```javascript
{
  _id: ObjectId,
  contact_id: ObjectId,       // reference to db.contacts
  partner_id: String,         // 'intermaven_support' | 'atltvmount'
  event_type: String,         // 'ticket_created' | 'lead_gen'
  payload: Object,            // flexible JSON data
  status: String,             // 'new' | 'processed'
  created_at: Date
}
```

---


# 5. API Reference

## 5.1 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |

## 5.2 Admin (requires admin_role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List users with pagination, search, filters, sorting |
| GET | /api/admin/users/:id | Get user details |
| PUT | /api/admin/users/:id | Update user — every change audit-logged |
| POST | /api/admin/users/:id/grant-credits | Grant credits (preset bundles or custom amount) |
| POST | /api/admin/users/:id/notes | Add internal admin note |
| GET | /api/admin/users/:id/activity | User activity history |
| GET | /api/admin/users/:id/transactions | User transaction history |
| POST | /api/admin/users/:id/suspend | Toggle suspend/unsuspend |
| POST | /api/admin/users/bulk | Bulk suspend, delete, or plan change |
| GET | /api/admin/users/export | Export all users as CSV |
| GET | /api/admin/analytics/overview | Platform stats (7d/30d/90d/all) |
| GET | /api/admin/audit-log | Full audit log, paginated |
| GET | /api/admin/settings | System settings |
| PUT | /api/admin/settings | Update system settings (super_admin only) |

**Credit Grant Presets:**

| Preset | Credits | Use Case |
|--------|---------|----------|
| Starter Boost | 50 | Minor compensation or trial extension |
| Standard Grant | 150 | Onboarding bonus, support resolution |
| Creator Boost | 500 | Partnership, influencer reward |
| Pro Grant | 1,000 | Enterprise trial, major issue resolution |

## 5.3 CRM

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/crm/contacts | List with pagination, search, tag filter |
| POST | /api/crm/contacts | Create contact |
| PUT | /api/crm/contacts/:id | Update contact |
| DELETE | /api/crm/contacts/:id | Soft delete |
| POST | /api/crm/contacts/export | Export as CSV |
| GET | /api/crm/contacts/:id/messages | Message thread |
| GET/POST/DELETE | /api/crm/campaigns | Campaign management |
| POST | /api/crm/messages/send | Send to contact via WhatsApp/SMS/email |
| POST | /api/crm/messages/send-direct | Send direct to phone or email |
| GET | /api/crm/messages/recent | Recent outbound messages |
| POST | /api/crm/twilio/webhook | Inbound messages from Twilio |

## 5.4 EPK

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/epk/my | Get user's EPK |
| POST | /api/epk/create | Create new EPK |
| PUT | /api/epk/:id | Update EPK |
| POST | /api/epk/:id/publish | Toggle publish |
| GET | /api/epk/check-username | Check availability |
| GET | /api/epk/public/:username | Public page (no auth required) |
| GET | /api/epk/:id/analytics | View and click analytics |

## 5.5 Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/files | List files (folder, search, favorites, recent, trash) |
| POST | /api/files/upload | Upload file (multipart) |
| GET | /api/files/storage | Storage usage |
| GET | /api/files/:id/download | Get download URL |
| POST | /api/files/:id/share | Create share link |
| DELETE | /api/files/:id | Soft delete |
| GET/POST/PUT/DELETE | /api/folders | Folder CRUD |

## 5.6 Support Tickets & Forum CMS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/support/tickets | Create ticket (with client_name and attachments; auto-syncs to CRM) |
| GET | /api/support/tickets | List tickets for user (filtered by email or phone) |
| GET | /api/support/tickets/:id | Get ticket details and conversation thread |
| POST | /api/support/tickets/:id/reply | Send a follow-up reply |
| POST | /api/support/tickets/:id/resolve | Resolve ticket (automatically creates a published CMS Forum post) |
| GET | /api/forum/posts | List published forum posts and resolved tickets |
| GET | /api/forum/posts/:slug | Get a specific forum post or resolved ticket thread |

---

# 6. Frontend Structure

## 6.1 Component Map

```
frontend/src/
├── App.js                          Router, auth context, EPK public page
├── App.css                         All component styles
├── imageRegistry.js                Central image path registry (NEW)
├── components/
│   ├── AuthModal.js                Login and register modal
│   ├── Dashboard.js                Main dashboard shell and routing
│   ├── SocialAI.js                 Social AI — 7 platforms, 23 formats (NEW)
│   ├── AdminPanel.js               Admin console (NEW)
│   ├── CRMPanel.js                 CRM contacts, campaigns, messaging (NEW)
│   ├── EPKBuilder.js               EPK builder 7 tabs (NEW)
│   ├── FileManager.js              File manager (NEW)
│   ├── AppSortingGrid.js           Multi-select app grid with wizard (NEW)
│   ├── FlatIcon.js                 PNG first, SVG fallback icon system (UPDATED)
│   ├── AyoChat.js                  AI chat assistant
│   ├── Toast.js                    Toast notifications
│   └── landing/
│       ├── PageHeader.js           Reusable page header with imageRegistry (NEW)
│       ├── AppLandingPage.js       Dynamic tool landing pages (NEW)
│       ├── HomePage.js             Hero slideshow with imageRegistry (UPDATED)
│       ├── AboutPage.js            Uses PageHeader (UPDATED)
│       └── [all other pages]
└── styles/
    └── landing.css
```

## 6.2 Dashboard Panels

| Panel | Sidebar Label | Component |
|-------|--------------|-----------|
| Overview | Dashboard | OverviewPanel with AppSortingGrid |
| All Apps | All Apps | AppSortingGrid full page |
| EPK Builder | EPK Builder | EPKBuilder |
| File Manager | File Manager | FileManager |
| CRM & Comms | CRM & Comms | CRMPanel |
| Settings | Profile, Notifications, Security | SettingsPanel |
| Billing | Billing & Credits | BillingPanel |
| Admin Console | Admin Console (admin only) | AdminPanel |
| AI Tools | [tool name] | SocialAI or ToolPanel |

## 6.3 App Sorting Grid

Behaviour:
- Single click: selects card, adds to selection bar
- Single selection then Open: opens app directly
- Multiple selections then Open: launches multi-app wizard
- Double-click or owned app: opens directly
- Coming soon apps: visible, greyed, non-selectable
- Category filter: All, Music, Marketing, Business, Branding
- Search: live filter on name and description

---
## 6.4 Landing Page Header — Layout & Logo

### Header Structure
All landing pages (main, app-specific, and portals) share a consistent header layout:


### Logo Specifications

| Property | Value |
|----------|-------|
| **Image Height** | 42px (40% increase from baseline 30px) |
| **Width** | Auto-maintained aspect ratio |
| **Font Size (fallback text)** | 18px weight 800 |
| **Gap between logo & menu** | 8px |
| **Transition** | 0.25s ease |
| **Scroll behavior** | Logo stays at 42px; background darkens with backdrop-filter blur(10px) |

### CSS Classes
- `.logo` — main landing page logo (Navbar component)
- `.app-landing-logo` — app-specific landing pages (AppLandingPage)
- `.logo-image` — image element (height: 42px)
- `.logo-text` — fallback text (hidden when image loads via `.has-image` state)
- `.logo span` — "MAVEN" highlight color (var(--a2) = purple/primary color)

### Header Scroll Behavior
**Normal State (at top):**
- Background: transparent
- Logo size: full 42px
- Border: none

**Scrolled State (user scrolls down):**
- Background: rgba(0, 0, 0, 0.8) with backdrop-filter blur(10px)
- Border-bottom: 1px solid var(--b1)
- Logo: remains 42px (no shrinking on app landing pages)
- Main landing page logo: scales to 0.8 (34px) via `.landing-wrapper.scrolled .logo`

### Navigation Links
Located to the right of logo:
- "AI Tools" → /tools
- "Community" → /forum
- "Help" → /help
- "Sign in" button (secondary style)
- "Get free →" button (primary style, calls onOpenAuth)

---

## 6.5 Hero Section — Layout & Functionality

### Hero Section Structure (All Landing Pages)

Every landing page includes a hero section with:
1. **Slide carousel** (3 slides minimum)
2. **Hero image background** (from imageRegistry)
3. **Content overlay with call-to-action buttons**
4. **Automatic slide rotation** with manual navigation

### Hero Slide Configuration

Each slide is defined in `APP_CONFIGS` with:

```javascript
slides: [
  {
    dot: '#10b981',                    // Dot indicator color
    badge: 'AI Brand Kit',              // Badge text
    h: 'Build your brand identity...',  // Heading
    s: "AI-powered brand names...",     // Subheading
    b1: 'Try free',                     // Button 1 text
    b1link: '#',                        // Button 1 link
    b2: 'See features',                 // Button 2 text
    b2link: '#features'                 // Button 2 link
  },
  // Slide 2, 3...
]

backgrounds: [
  'linear-gradient(180deg, #10b98122 0%, #10b98144 50%, #08090d 100%)',
  'linear-gradient(180deg, #10b98133 0%, #10b98155 50%, #08090d 100%)',
  'linear-gradient(180deg, #10b98144 0%, #10b98166 50%, #08090d 100%)'
]

┌──────────────────────────────────────────────────┐
│                 [Image Background]                │
│        [Gradient Overlay — app color]            │
│                                                  │
│              📍 Badge — top-left                  │
│                                                  │
│              🎯 Heading (h2)                     │
│              📝 Subheading (p)                   │
│                                                  │
│    [Button 1]              [Button 2]             │
│                                                  │
│         ● ● ●   [Progress bar]   ›              │
└──────────────────────────────────────────────────┘

const [currentSlide, setCurrentSlide] = useState(0);
const [progress, setProgress] = useState(0);
const [slideState, setSlideState] = useState('in');

brandkit: {
  name: 'Brand Kit AI',
  color: '#10b981',
  slides: [
    {
      dot: '#10b981',
      badge: 'AI Brand Kit',
      h: 'Build your brand identity in 30 seconds',
      s: "AI-powered brand names, taglines, tone of voice, and colour direction...",
      b1: 'Try free',
      b1link: '#',
      b2: 'See features',
      b2link: '#features'
    },
    // Slide 2, 3 follow same structure
  ],
  backgrounds: [
    'linear-gradient(180deg, #10b98122 0%, #10b98144 50%, #08090d 100%)',
    'linear-gradient(180deg, #10b98133 0%, #10b98155 50%, #08090d 100%)',
    'linear-gradient(180deg, #10b98144 0%, #10b98166 50%, #08090d 100%)'
  ]
}
# 7. Image & Asset System

## 7.1 Folder Structure

```
public/
├── images/
│   ├── hero/
│   │   ├── intermaven/
│   │   │   ├── hero-1.jpg    Slide 1 — "Build your brand. Grow your career."
│   │   │   ├── hero-2.jpg    Slide 2 — "Your music. The world's stage."
│   │   │   └── hero-3.jpg    Slide 3 — "Brand it right. From day one."
│   │   └── intermavenmusic/
│   │       ├── hero-1.jpg    Slide 1 — "Africa's music ecosystem, finally connected."
│   │       ├── hero-2.jpg    Slide 2 — "Your music. Your terms. Your money."
│   │       └── hero-3.jpg    Slide 3 — "The right track for every scene."
│   ├── carousel/
│   │   └── logos/
│   │       ├── logo-dj.svg
│   │       ├── logo-label.svg
│   │       ├── logo-producer.svg
│   │       ├── logo-artist.svg
│   │       ├── logo-social.svg
│   │       ├── logo-brandkit.svg
│   │       └── logo-crm.svg
│   └── headers/
│       ├── intermaven/
│       │   ├── header-tools.jpg
│       │   ├── header-apps.jpg
│       │   ├── header-pricing.jpg
│       │   ├── header-about.jpg
│       │   ├── header-help.jpg
│       │   ├── header-forum.jpg
│       │   ├── header-brandkit.jpg
│       │   ├── header-musicbio.jpg
│       │   ├── header-social.jpg
│       │   ├── header-syncpitch.jpg
│       │   └── header-bizpitch.jpg
│       └── intermavenmusic/
│           ├── header-consumer.jpg
│           ├── header-creator.jpg
│           ├── header-label.jpg
│           ├── header-dj.jpg
│           ├── header-filmstudio.jpg
│           ├── header-corporate.jpg
│           ├── header-mediahouse.jpg
│           └── header-about.jpg
└── icons/
    └── apps/
        ├── brandkit.png
        ├── musicbio.png
        ├── social.png
        ├── syncpitch.png
        ├── bizpitch.png
        ├── epk.png
        ├── crm.png
        ├── files.png
        ├── distro.png
        ├── pos.png
        ├── contract.png
        ├── pressrel.png
        ├── lyric.png
        ├── royalty.png
        ├── calendar.png
        └── grant.png
```

## 7.2 Image Specifications

**Hero slides:** 1920x900px minimum, JPG or WebP, under 400KB, dark moody style with African creatives.

**Page headers:** 1920x350px, JPG or WebP, under 200KB, relevant to page topic.

**App icons:** 64x64px or 128x128px square, PNG with transparent background, flat icon style.

**Logo carousel SVGs:** 220x100px artboard with a 200x80px safe area. Use simple brand mark placeholders and ensure logos are legible on light and dark backgrounds.

## 7.5 Logo Carousel

- The logo carousel appears directly below the hero section on `tunemavens.com` and on relevant app landing pages.
- It should move slowly by default and pause on hover.
- Each logo is clickable and navigates to its related landing page.
- Use SVG placeholders stored in `public/images/carousel/logos/`.
- Recommended logo size: 220x100px artboard, 200x80px safe area, with at least 16px spacing between items.
- If a carousel item is missing, render a plain SVG placeholder with a simple border and label.

## 7.3 How imageRegistry.js Works

All image paths are defined centrally in `src/imageRegistry.js`. The code reads from here automatically — no code changes are needed when you add or replace images. Just drop the file in the correct folder with the exact filename listed above.

Exported helpers:
- `getHeroBackground(portal, index)` — returns backgroundImage CSS value with fallback
- `getHeaderBackground(pageKey)` — returns backgroundImage CSS value with fallback
- `getAppIconSrc(appId)` — returns PNG path or null

If an image file is missing, CSS gradient fallbacks activate automatically.

## 7.4 FlatIcon Icon System

Icons resolve in this order:
1. Check `public/icons/apps/{name}.png`
2. If PNG exists and loads: renders as img tag
3. If PNG fails or is missing: uses SVG fallback icon from FlatIcon.js

---

# 8. Deployment Configuration

## 8.1 Frontend — Hostinger

Deploy target: `public_html/`

Build command:
```
cd frontend
REACT_APP_BACKEND_URL=https://intermaven.onrender.com npm run build
```

Upload all contents of `frontend/build/` to public_html including `.htaccess`.
Upload `htpasswd_file` to `/home/u422251763/` renamed to `.htpasswd`.

Build phase credentials: username `intermaven`, password `build2026`.
To go public: delete the 4 Auth lines from `.htaccess`.

## 8.2 Backend — Render

Service URL: https://intermaven.onrender.com
Root directory: `backend`
Build: nixpacks with `--break-system-packages` in nixpacks.toml

Key files in `backend/`:
- server.py — all routes in single FastAPI file
- requirements.txt — full Python dependencies
- Procfile — start command
- railway.json — Railway config
- nixpacks.toml — build config

## 8.3 DNS Configuration

| Type | Name | Value |
|------|------|-------|
| A | @ | Hostinger server IP |
| A | www | Same Hostinger IP |
| CNAME | api | intermaven.onrender.com |

## 8.4 Set Admin Access

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { admin_role: "super_admin" } }
)
```

---

# 9. tunemavens.com — Technical Spec

## 9.1 Overview

Shared infrastructure with intermaven.io. Users from intermaven.io are auto-recognized. No re-registration required. Same JWT, same credits, same MongoDB.

tunemavens.com is positioned as a **comprehensive music business marketplace** — not just a streaming/distribution utility, but the operating layer for publishing, distribution, sync licensing, and placement across the African music ecosystem and beyond.

## 9.2 User Types (7 total)

Each has a dedicated multi-step modal onboarding wizard.

**Consumer** — Streaming and downloading. Wizard: Personal info → Genre/content prefs → Creator discovery (pick 3) → Device detection → Pricing → Payment → Dashboard.

**Creator (Artist/Educator/Podcaster)** — Distribution, publishing, sync, merch. Wizard: About + payment + type → Details/bio/gallery → Discography/products → **Publishing & Distribution election** (see 9.3.1, 9.3.2) → **App Marketplace recommendation step** (see 9.6) → Compensation matrix → E-sign → Dashboard.

**Record Label** — Full roster management. Default 50/50 Gross Net split (editable per label in admin). Bulk upload for roster and catalogue with CSV validation.

**DJ** — HQ downloads, extended edits, 3-piece sets, mashups, remixes, drops. Hybrid consumer/creator model. IP Permission Request Engine for clearances.

**Film Studio** — Sync licensing. Access to Sync Marketplace with watermarked 30-second previews. AI Music Brief for scene-based catalogue search.

**Corporate** — Advertising (audio, display, sponsored playlists), talent discovery, brand partnerships, sync licensing. Public corporate directory.

**Media House** — Content licensing, broadcast royalties, interview/appearance requests. Mandatory playlist reporting with AI discrepancy detection. Escrow for appearance fees.

---

## 9.3 Compensation Engine

Cascade payment logic resolves all splits in one transaction cycle:

**Intermaven/Tunemavens commission → Label share → Artist split → Manager fee → Investor recoupment**

Supports: distribution, publishing, sync, merch, ads, partnerships — each with independent split logic configured per deal type. Milestone-based payment schedules for partnership deals. Escrow for interview fees and pre-delivery licensing payments. Immutable audit trail accessible to all rights holders.

The cascade engine is deal-type-agnostic at the transaction layer — it always resolves Commission → Label/Publisher → Artist → Manager → Investor in that order — but the **percentage configuration and recoupment stack differ per revenue category**, as detailed below. Every configuration is stored as a versioned record attached to the relevant contract, never as a global constant, so two artists on the platform can run materially different splits without code changes.

### 9.3.1 Publishing — Three Configurations

Most creators arriving on the platform have **no existing publishing administration**. Tunemavens offers three tiers of publishing relationship, selected during the Creator onboarding wizard:

**A. Tunemavens Publishing (Standard Administration)**
- Creator opts in to have Tunemavens administer their publishing rights only (no active pitching/placement service).
- Split follows **standard Western publishing convention: 50/50 on the publisher's share** — i.e. of the total publishing royalty, 50% is allocated to the writer's share (always retained by the songwriter, non-negotiable under standard convention) and 50% to the publisher's share, which is split 50/50 between Tunemavens Publishing and the writer/creator acting as their own publisher (or split further if a co-publisher is involved — see 9.3.1.B).
- This is an administrative-only relationship: Tunemavens registers works, collects royalties via PRO/CMO relationships, and distributes — no active sync pitching service is included at this tier.

**B. Tunemavens Placement, Publishing & Sync Agent (Full-Service / Co-Publishing)**
- Creator opts in to a full-service relationship: Tunemavens actively pitches the catalogue for sync and placement opportunities using its existing label, sync, and media-house network.
- This is structured as a **co-publishing deal**, most often involving one of Tunemavens' existing publishing partners.
- **Publisher's share split: 50/50 between the collective publishers** (Tunemavens + co-publishing partner, combined, vs. the writer/creator's publisher-side share) — consistent with the standard publishing convention in 9.3.1.A, but now shared across two publishing entities on the administering side.
- **Writing/production contribution share**: if Tunemavens (or a Tunemavens-affiliated writer/producer) contributed creatively to the work — writing, top-line, production, etc. — the collective publishers may additionally hold a **writer-side or production-credit share** in the work itself, separate from and in addition to the publisher-side administration split. This must be documented per-work in the contract (see Compensation & Contracts doc, §2).
- **Recoupables**: any advances, catalogue purchase costs, or marketing/pitching spend fronted by Tunemavens under this tier are tracked as recoupable against the creator's share, recouped before ongoing splits resume (see 9.3.3).
- All downstream payments — once the co-publishing split and any recoupment are resolved — cascade through the standard Compensation Engine waterfall (Commission → Label → Artist → Manager → Investor) exactly as any other deal type.

**C. Catalogue Acquisition / Advance Recoupment**
- Applies when Tunemavens has purchased a catalogue outright, or has advanced funds against future earnings (publishing, distribution, sync, or otherwise).
- Advances and acquisition costs are **recouped in standard recoupment order** — i.e. 100% of net receipts apply against the outstanding advance/acquisition balance until fully recovered, after which normal splits resume per the relevant configuration (9.3.1.A or 9.3.1.B).
- Recoupment balances are tracked per-deal in an immutable ledger, visible to the rights holder, with real-time remaining-balance reporting.

### 9.3.2 Distribution — Three Paths

Tunemavens offers distribution comparable to DistroKid-style aggregators, plus a native rev-share option:

**A. Standard Distribution (Fee-Matched)**
- Mirrors third-party distributor pricing models (flat annual/per-release fee structures, consistent with how competing platforms price distribution — not a revenue split).
- Creator retains their full royalty share from DSPs; Tunemavens charges the matched flat fee for distribution service only.

**B. Tunemavens Native Distribution (Revenue Share)**
- Distributing directly through tunemavens.com (rather than out to third-party DSPs via the standard pipeline) runs on a **flat 45/55 split in Tunemavens' favor** (Tunemavens 45% / Creator 55%), admin-editable per artist or per release.
- This is a genuinely distinct pricing model from 9.3.2.A — flat-fee vs. rev-share — and the two must never be conflated in the schema or contract templates (see Compensation & Contracts doc, §3).

**C. Label / Catalogue Owner Negotiation (AI Wizard)**
- For labels and catalogue owners, an AI/wizard-guided negotiation flow opens at a **50/50 starting split** and iterates through guided counter-offer rounds until both parties lock in terms.
- Once agreed, the negotiated split is finalized and flows into the Contract Creation System exactly like the fixed-split paths — the contract generator is informed which path (fixed 45/55 vs. negotiated) produced the terms, so it pulls the correct clause set and discloses negotiation history in the contract metadata.

### 9.3.3 Recoupment Order (applies across 9.3.1 and 9.3.2)

When recoupable advances exist (catalogue purchase, publishing advance, distribution advance, or sync advance), recoupment is always applied **before** the relevant cascade resumes normal split behavior:

```
Gross Receipts → Recoupment Balance (if any) → Standard Cascade:
  Commission → Label/Publisher Share → Artist Split → Manager Fee → Investor Recoupment
```

Recoupment balances are deal-specific (tied to the originating contract/advance record) and never cross-collateralize between unrelated deals unless the contract explicitly states cross-collateralization.

---

## 9.4 AI Notification Layer

Fires on every meaningful platform event across both portals. Respects each user's preferred channel (Email via Resend, WhatsApp via Twilio, SMS via Twilio). Logged in CRM against user profile. Escalates to secondary channel if primary goes unread past threshold.

## 9.5 EPK Cross-Platform Hosting

Artists can host their EPK on intermaven.io, tunemavens.com, or a custom domain — or all three simultaneously. Single source of truth: updates on one instance propagate to all hosted instances automatically.

## 9.6 Intermaven App Marketplace (Cross-Portal App Toggle)

All Intermaven apps (Brand Kit AI, Social AI, Music Bio & Press Kit, Sync Pitch AI, Pitch Deck AI, EPK Builder, CRM & Comms, File Manager, and future roadmap apps) are available **inside the tunemavens.com dashboard**, not gated behind a separate intermaven.io login.

- **Simple toggle activation**: each app appears as a togglable card in the user's dashboard; activating adds it to `users.apps[]` (existing field — no schema change needed for the toggle itself).
- **Onboarding recommendation engine**: during the Creator (and other user-type) onboarding wizards, the system makes intelligent app recommendations based on wizard answers — e.g. an artist who indicates active touring gets Tour Manager and Merch Designer Brief surfaced; an artist focused on sync gets Sync Pitch AI and Sync Brief AI surfaced. Recommendations are suggestions, not defaults — nothing auto-activates without user confirmation.
- **Per-user custom dashboard**: each user's dashboard panel arrangement, active app set, and layout is fully custom and editable at any time — not a fixed template tied to user type. This requires a net-new field on the `users` schema: `dashboard_layout: Object` (free-form layout/ordering state, analogous to how `apps: [String]` already tracks activation but doesn't track arrangement).

---

## 9.7 Schema Additions Required for This Update

```js
// users collection — new field
dashboard_layout: Object   // free-form per-user panel ordering/layout state

// new collection: publishing_deals
{
  _id: ObjectId,
  creator_id: ObjectId,
  tier: String,                  // 'standard_admin' | 'full_service_copub'
  copublisher_partner_id: ObjectId,   // null if standard_admin
  publisher_share_split: {
    tunemavens_pct: Number,      // 50 by default (of the publisher's share)
    creator_publisher_pct: Number,
    copublisher_partner_pct: Number    // null if standard_admin
  },
  writer_credit_share: {          // only if Tunemavens contributed creatively
    applies: Boolean,
    pct: Number,
    contributors: [String]
  },
  recoupment_balance: Number,     // outstanding advance/acquisition balance, 0 if none
  status: String,                 // 'active' | 'terminated'
  contract_id: ObjectId,
  created_at: Date
}

// new collection: distribution_deals
{
  _id: ObjectId,
  creator_id: ObjectId,
  path: String,                   // 'standard_fee_matched' | 'tunemavens_native' | 'label_negotiated'
  fee_structure: String,          // 'flat_fee' | 'rev_share'
  tunemavens_split_pct: Number,   // 45 for native default; null for flat_fee path
  creator_split_pct: Number,      // 55 for native default; null for flat_fee path
  negotiation_history: [Object],  // only populated for label_negotiated path
  contract_id: ObjectId,
  created_at: Date
}

// catalogue_acquisitions / advances — recoupment ledger
{
  _id: ObjectId,
  creator_id: ObjectId,
  deal_type: String,              // 'catalogue_purchase' | 'publishing_advance' | 'distribution_advance' | 'sync_advance'
  original_amount: Number,
  recouped_to_date: Number,
  remaining_balance: Number,
  cross_collateralized: Boolean,
  linked_contract_id: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

*This section supersedes the prior §9.3 Compensation Engine description and adds §9.6–9.7. See the companion document `COMPENSATION_AND_CONTRACTS.md` for the contract-template and clause-level detail behind each configuration above.*

---

# 10. Roadmap — Remaining Build Items

## 10.1 intermaven.io

| Item | Priority |
|------|----------|
| Cloud storage wiring for file uploads | High |
| Pesapal live payments | High |
| Twilio messaging live | High |
| Resend email live | High |
| PageHeader image registry updates (remaining pages) | Medium |
| AI Output Library (auto-save all generations) | Medium |
| Hosting Manager app (Truehost API) | Medium |
| i18n English/Swahili | Low |

## 10.2 tunemavens.com (Full Build — Next Phase)

10 build phases: Foundation → Consumer → Creator → Label → DJ → Sync Marketplace → Compensation Engine → Contract Module → Ad Platform → Media House

## 10.3 App Roadmap

**High priority:** Distribution Tracker, Hosting Manager
**Medium priority:** Press Release AI, Contract Builder, Lyric & Hook AI, Royalty Calculator
**Low priority:** Content Calendar, Grant Finder, ISRC Generator, Playlist Pitch AI

## 10.4 Platform App Inventory (30 apps total)

**Live and built (8):** Brand Kit AI, Music Bio & Press Kit, Social AI, Sync Pitch AI, Pitch Deck AI, EPK Builder, CRM & Comms, File Manager

**Roadmap intermaven.io (12):** Distribution Tracker, POS, Contract Builder, Invoice & Payments, Content Calendar, Press Release AI, Grant Finder, Lyric & Hook AI, Tour Manager, Merch Designer Brief, Royalty Calculator, Hosting Manager

**Roadmap tunemavens.com (10):** ISRC Generator, Release Planner, Sync Brief AI, Mastering Brief AI, Artist One-Sheet AI, Playlist Pitch AI, Music NFT Brief, Remix License Generator, Broadcast Report Formatter, Royalty Statement AI

---

# 11. Credentials & Environment Variables

## 11.1 Active

```
MongoDB:
  Host: centerbeam.proxy.rlwy.net:20600
  User: mongo
  Password: IzypDlPIOWEIyNZSoybbZmWzvPYAeuym
  DB: intermaven

AI:
  EMERGENT_LLM_KEY=sk-emergent-a3a79EeF44b2f09684
  Model: claude-sonnet-4-5-20250929

Auth:
  JWT_SECRET=intermaven_jwt_secret_key_2025_secure
  JWT_ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=1440

Frontend (Hostinger):
  URL: https://intermaven.io
  FTP Host: 145.79.14.70
  FTP User: u422251763

Backend (Render):
  URL: https://intermaven.onrender.com
```

## 11.2 Pending

```
Pesapal:
  PESAPAL_CONSUMER_KEY=<pending>
  PESAPAL_CONSUMER_SECRET=<pending>
  PESAPAL_ENVIRONMENT=sandbox → production when live

Twilio:
  TWILIO_ACCOUNT_SID=<pending>
  TWILIO_AUTH_TOKEN=<pending>
  TWILIO_WHATSAPP_NUMBER=whatsapp:+<pending>
  TWILIO_SMS_NUMBER=+<pending>
  Webhook: https://intermaven.onrender.com/api/crm/twilio/webhook

Resend:
  RESEND_API_KEY=<pending>
  From: noreply@intermaven.io (requires domain verification)

File Storage:
  AWS_ACCESS_KEY_ID=<pending>
  AWS_SECRET_ACCESS_KEY=<pending>
  AWS_S3_BUCKET=<pending>
  AWS_REGION=<pending>
```

---

# 12. AI Testing Agent System

The AI Testing Agent is an autonomous QA and simulation system designed to validate end-to-end functionality across both the front-end and back-end of the Intermaven platform.

## 12.1 Technology Stack

To achieve complete verification coverage without maintaining fragile DOM-selector-based testing scripts, the system utilizes the following agentic technologies:

### A. Multimodal Visual-Spatial Web Agent (VSA)
- **Description**: Instead of relying on traditional DOM selectors (IDs, classes, XPaths) which break with minor UI changes, the agent utilizes a visual-spatial model. It visually analyzes the page viewport and interacts with elements based on semantic understanding.
- **Capabilities**:
  - **Element Detection**: Automatically identifies form fields, buttons, sliders, modals, and close triggers by visual appearance.
  - **Self-Healing Flow Graphs**: Automatically adjusts navigation paths if buttons or elements move, change style, or become nested inside drawers.
  - **Natural Language Navigation**: Interacts with the interface using goal statements, e.g., *"Generate a new music bio, edit it to include an upcoming tour, and save the changes."*

### B. Generative Persona Synthesizer
- **Description**: Synthesizes and clones realistic user personas to simulate actual human interactions, including typical user errors, input variations, and network speeds.
- **Generative Mocking**:
  - **Input Synthesis**: Generates unique names, phone numbers, email addresses, artist details, and business bios.
  - **Document Synthesizer**: Generates mock PDF and JPEG attachments (e.g. mock press release files, album art, background check consents) that bypass OCR validation layers in the registration/EPK upload pipelines.

### C. State Space & API Fuzzer
- **Description**: Evaluates backend robustness by testing API endpoints directly while the frontend agent interacts with the UI.
- **Capabilities**:
  - **Webhook Interception**: Captures, validates, and simulates delayed or failed third-party webhook dispatches (such as Pesapal payments) to test recovery loops.
  - **Concurrency Tests**: Simulates concurrent file uploads, parallel admin edits, and rapid-fire API commands to verify database locks and transaction log integrity.

## 12.2 User Assimilation Models (Personas)

The agent executes testing loops based on target personas matching the dual-portal ecosystem:

| Persona | Portal | Target Workflows | Expected Output |
| :--- | :--- | :--- | :--- |
| **Musician / Artist** | intermaven.io / tunemavens.com | EPK creation, music bio generation, media file uploads, sync licensing submissions, streaming catalog setup. | Correct public page routing, media registry updates, public EPK asset compilation. |
| **Creative Entrepreneur** | intermaven.io | Brand kit generation, pitch deck generation, social AI post campaigns, CRM contact imports, credit updates. | Clean generation outputs, correct credit deductions, contact record creation in CRM. |
| **Media House / DJ / Label** | tunemavens.com | Contract execution, playlist reporting, DJ tool usage, uniform licensing acquisition. | Signed contracts ledger updates, licensing fee transactions logged, licensing file access granted. |
| **System Administrator** | intermaven.io | User audit log inspection, manual credit allocation, system settings overrides, test trigger desk execution. | Audited action logs, secure credit grants, system config changes verified in DB. |

## 12.3 Dual-Mode Execution Boundaries

Strict safety gates isolate testing execution based on the environment to prevent production data contamination:

### A. Local & Staging Sandbox Mode
- **Goal**: Maximize code coverage, test destructive actions, and verify edge-case recovery.
- **Capabilities**:
  - **Database Resets**: Authorized to perform database resets and seed cycles.
  - **Mock Integrations**: Replaces outbound third-party calls (Pesapal, Twilio, Resend) with mock loopbacks to verify correct payloads are generated without contacting active APIs.
  - **Time-Warping**: Speeds up clock times to test chronological events (e.g. verifying that trial credits expire exactly after 90 days).

### B. Production Smoke Testing Mode
- **Goal**: Validate production deployments without contaminating real metrics or generating erroneous transactions.
- **Safety Gates**:
  - **Transactional Bypass**: Uses designated read-only actions for payment and campaign flows.
  - **Identifiable Mock Data**: Any entries logged in production (such as a smoke-test support ticket) must be prefixed with `[SYSTEM-SMOKE]` and contain a self-destruct flag.
  - **Immediate Clean-Up**: A post-test webhook triggers a database script to immediately purge the smoke data and restore ledger metrics.

## 12.4 Backend Admin Control Desk

The AI Testing Agent is controlled via an interactive dashboard in the backend admin panel:
1. **Live Viewport Stream**: Renders a canvas displaying the real-time visual traversal of the agent's web view, showing where the agent is looking, clicking, and typing.
2. **Execution Parameters**:
   - **Environment Toggle**: Switches boundaries between sandbox and smoke modes.
   - **Persona Selectors**: Choose specific personas to run individual loops or execute a full suite sweep.
   - **Simulation Speed**: Sliders to toggle between instant execution (max speed) or real-time simulation (human reading speeds for debugging).
3. **Interactive Test Report**:
   - Logs database diffs (before and after operations).
   - Flagged anomalies (e.g. slow API response times, unhandled UI layout shifts).
   - Diagnostic exports containing session video recordings and console logs.

---

# 13. Cross-Platform Plugin Integration

The Intermaven platform is architected to be highly modular, allowing the CMS, AI tools, and core services to be mounted as plugins, sub-modules, or API integrations on other platforms running on a similar technology stack (Python/FastAPI backend, React frontend, MongoDB).

## 13.1 Backend Router Portability (FastAPI Sub-Apps)

Each module (CMS, EPK, CRM, AI) is self-contained within its own router under `backend/routes/`. To connect these services to any other FastAPI project:
1. **Module Import**: Copy the specific route file (e.g. `admin.py`, `ai.py`) and schema declarations.
2. **Mounting**: Mount the router directly as a sub-app or router prefix:
   ```python
   from fastapi import FastAPI
   from routes.admin import router as admin_router
   
   app = FastAPI()
   app.include_router(admin_router, prefix="/api/plugin/admin")
   ```
3. **Database Sharing**: Ensure the host platform passes its MongoDB client instance to the routers or uses a shared database environment variable.

## 13.2 Frontend Component Portability (React Embedding)

The React components are written as clean functional components with minimal external styling hooks:
1. **Embedding via Iframe & postMessage**:
   To embed the CMS/EPK widgets on external websites, use a sandboxed iframe communicating via HTML5 Web Messaging:
   ```javascript
   // Parent website listening to events
   window.addEventListener("message", (event) => {
     if (event.origin !== "https://intermaven.io") return;
     if (event.data.type === "EPK_PUBLISHED") {
       console.log("EPK URL:", event.data.url);
     }
   });
   ```
2. **Micro-Frontend/Web Components Compilation**:
   The tools can be exported as Custom Elements (Web Components) using React's wrapper to be used on any HTML page (even non-React platforms):
   ```javascript
   import { createRoot } from 'react-dom/client';
   
   class SocialAIElement extends HTMLElement {
     connectedCallback() {
       const root = createRoot(this);
       root.render(<SocialAI />);
     }
   }
   customElements.define('intermaven-social-ai', SocialAIElement);
   ```

## 13.3 Cross-Origin Resource Sharing (CORS)

To enable external platform frontends to invoke the Intermaven API:
1. Configure allowed origins in `server.py` or system database settings.
2. The authentication system accepts authorization headers (`Authorization: Bearer <token>`) enabling secure cross-origin API request dispatch.

## 13.4 Unified Single Sign-On (SSO)

To allow users and clients to log in across partner sites (like Atlanta TV Mount PRO) using a single set of credentials, Intermaven functions as a federated Identity Provider (IdP) supporting the standard OAuth2 / OpenID Connect (OIDC) protocol:
1. **SSO Core Endpoints**:
   - **Authorization (`/api/auth/oauth/authorize`)**: Initiates the OAuth flow. If the user is authenticated in Intermaven, they are prompted to authorize the partner platform. If successful, redirects back to the partner site with an authorization code.
   - **Token Exchange (`/api/auth/oauth/token`)**: Exchanges the authorization code or refresh tokens for a standard JWT access token, enabling partner apps to query API endpoints securely.
   - **UserInfo Provider (`/api/auth/oauth/userinfo`)**: Verifies active JWTs and returns the authenticated user's profile details (first name, last name, email, roles, permissions) to synchronize accounts.
2. **Federated Security Policies**:
   - Both databases (MongoDB for Intermaven, SQLite/PocketBase for partner sites) resolve matching profile entries by email.
   - Password hashes remain safely within Intermaven's database, and partner platforms configure OIDC clients to handle standard session handshakes.

## 13.5 Federated CRM Data Sync

To support unified customer tracking and cross-compatible client leads, Intermaven exposes a secure CRM ingestion interface:
1. **Ingest Endpoint (`/api/crm/ingest`)**:
   - Accepts secure webhooks triggered by partner platforms during key events (e.g. quote estimator requests, appointment bookings, support tickets, and sales orders).
   - Expected Payload Schema:
     ```json
     {
       "partner_id": "atltvmount",
       "event": "booking_created",
       "client": {
         "name": "John Doe",
         "email": "john@example.com",
         "phone": "+1234567890"
       },
       "details": {
         "id": "bk_98234",
         "type": "TV Mount Installation",
         "value": 150.00,
         "status": "confirmed"
       }
     }
     ```
2. **Profile Consolidation**:
   - Checks if a contact with the given email exists in MongoDB `crm_contacts`. If so, links the booking details to their centralized client card.
   - If no record exists, programmatically creates a new CRM Lead / Contact entry and generates a cross-platform reference key.
   - Allows administrators to view a customer's multi-platform history (e.g., their music licensing files alongside their AV installation bookings) under a unified timeline.

## 13.6 Cross-Platform App Embed Engine

All Intermaven application tools (Brand Kit, EPK Builder, Social AI, Pitch Deck) are packaged for cross-platform portability:
1. **Iframe Embed & Token Exchange**:
   - Partner frontends can load Intermaven widgets inside dashboard tabs using secure iframes.
   - During mounting, the partner frontend requests a temporary Single-Use Auth Token from the Intermaven API via their server API and passes it as a query param:
     `https://intermaven.io/embed/social-ai?auth_token=<temp_token>`
   - The embedded application validates the token and initiates a secure session.
2. **HTML5 postMessage Protocol**:
   - Enables bidirectional UI communication. For example, if an EPK is completed inside the iframe, the widget notifies the partner site to update their local record:
     ```javascript
     window.parent.postMessage({ type: 'EPK_COMPLETED', url: 'https://intermaven.me/p/artist1' }, '*');
     ```

---

---

# 14. Mother-CMS — Flagship Differentiator (Phase 10)

> **One source of truth. Every portal. Every region. Every language.**

The Intermaven CMS — ported from Atlanta TV Mount Pro and elevated to "mother" status — is not just an internal tool but a **standalone product feature** of the Intermaven platform. Every Intermaven plan from Creator tier and up includes Mother-CMS access.

## 14.1 What It Is
A centralized, region-aware, portal-aware content management layer that powers every Intermaven sister site (intermaven.io, tunemavens.com, the upcoming Hospitality portal, and partner platforms like Atlanta TV Mount Pro).

## 14.2 Three Feature Pillars
1. **Region-aware** — every key supports per-country overrides. M-Pesa appears for Nairobi visitors, Venmo/Cash App/Zelle for Atlanta visitors, automatically and without code changes.
2. **Portal-aware** — the same CMS key can render different copy on intermaven.io vs tunemavens.com vs hospitality.intermaven.io vs atltvmountpro.com. Edit once; publish everywhere correctly.
3. **Audit-ready** — full version history per key, per edit. One-click rollback. Diff view. Approval workflows for enterprise clients.

## 14.3 Schema
```json
{
  "_id": "footer.contact.phone",
  "default": "+254 700 000 000",
  "regions": {
    "US": "+1 (800) 555-0114",
    "GB": "+44 800 016 6028",
    "KE": "+254 700 000 000",
    "NG": "+234 800 000 0000",
    "ZA": "+27 800 000 000"
  },
  "portals": {
    "business":    { "US": "+1 (800) 555-0114" },
    "music":       { "US": "+1 (800) 555-0140" },
    "hospitality": { "US": "+1 (800) 555-0188" }
  },
  "updated_at": "2026-03-24T10:11:00Z",
  "updated_by": "user_id",
  "history": [ /* prior versions */ ]
}
```

## 14.4 API
```
GET  /api/cms/{key}?region=US&portal=business
GET  /api/cms/bulk?keys=footer.phone,footer.address&region=US&portal=business
PUT  /api/admin/cms/{key}             # admin-only · creates a new revision
POST /api/admin/cms/{key}/rollback/{revision_id}
GET  /api/admin/cms/{key}/history
```

## 14.5 Atlanta TV Mount Pro as First Consumer
Once the CMS schema is shared, Atlanta TV Mount Pro switches from local content to consuming `/api/cms/*` from Intermaven. The migration validates the multi-portal architecture and creates the first concrete proof-of-concept for the "Mother CMS" positioning.

## 14.6 Marketing & Positioning
Mother-CMS is positioned as a **product differentiator** in addition to internal infrastructure:

- **Landing-page section** (`/` and dedicated `/cms` page): animated diagram showing one CMS pushing copy to intermaven.io, tunemavens.com, hospitality.intermaven.io, atltvmountpro.com simultaneously
- **Pricing tier inclusion**:
  - Creator tier: Mother-CMS access for up to 3 portals
  - Pro tier: unlimited portals + API access (enables white-label / agency resale)
- **Comparison page**: "Intermaven CMS vs Webflow vs Contentful vs Sanity" — emphasizing region + portal awareness (a unique angle other CMS products don't have)
- **Enterprise sales angle**: agencies, multi-brand operators, franchise networks, hotel groups — all targetable once the CMS is positioned as a product rather than internal plumbing
- **Tagline**: *"Edit once. Publish to every portal, every region, every language. Roll back any change."*

## 14.7 Documentation Deliverables (when Phase 10 ships)
1. `/docs/cms-overview.md` — product overview for end users
2. `/docs/cms-api.md` — developer-facing API for consumer portals
3. New `/cms` marketing landing page on intermaven.io
4. Comparison page: "Intermaven CMS vs Webflow vs Contentful vs Sanity"
5. Case study: how Atlanta TV Mount Pro consumes the Intermaven CMS (becomes proof-of-concept content)

## 14.8 Status
- Schema designed: ✅ (this section)
- Backend `/api/cms/*` endpoints: pending Phase 10 build
- Atlanta TV Mount Pro consumer migration: pending Phase 10 build
- Marketing landing section + `/cms` page: pending Phase 10 build
- Pricing tier inclusion: planned for Phase 10 release

---

*Document Version: 4.1*
*Last Updated: January 2026*
*Platform: Intermaven — Africa's Creative & Music Operating System*
