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
9. [intermavenmusic.com — Technical Spec](#9-intermavenmusic.com--technical-spec)
10. [Roadmap — Remaining Build Items](#10-roadmap--remaining-build-items)
11. [Credentials & Environment Variables](#11-credentials--environment-variables)

---

# 1. Project Overview

## 1.1 What is Intermaven?

Intermaven is a dual-portal AI-powered creative and business tools ecosystem built for African entrepreneurs, musicians, and artists.

**Portal 1 — intermaven.io**
AI tools for creative business: brand kits, music bios, social content, sync pitches, pitch decks, EPK builder, CRM, file management, and admin.

**Portal 2 — intermavenmusic.com**
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
| intermavenmusic.com build | Next major phase |

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
Base URL (production):  https://intermaven-production.up.railway.app
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
- `intermavenmusic.com` is the music ecosystem portal. Vertical audience pages should use branded subdomains such as `djs.intermavenmusic.com`, `labels.intermavenmusic.com`, `producers.intermavenmusic.com`, and `mediahouses.intermavenmusic.com`.
- Each subdomain landing page should include:
  - a hero section with three targeted key messages tailored to the visitor segment
  - app cards, FAQs, and bottom content that are specific to the vertical or audience
  - a logo carousel directly below the hero section on `intermavenmusic.com`
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
    dot: '#7c6ff7',                    // Dot indicator color
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
  'linear-gradient(180deg, #7c6ff722 0%, #7c6ff744 50%, #08090d 100%)',
  'linear-gradient(180deg, #7c6ff733 0%, #7c6ff755 50%, #08090d 100%)',
  'linear-gradient(180deg, #7c6ff744 0%, #7c6ff766 50%, #08090d 100%)'
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
  color: '#7c6ff7',
  slides: [
    {
      dot: '#7c6ff7',
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
    'linear-gradient(180deg, #7c6ff722 0%, #7c6ff744 50%, #08090d 100%)',
    'linear-gradient(180deg, #7c6ff733 0%, #7c6ff755 50%, #08090d 100%)',
    'linear-gradient(180deg, #7c6ff744 0%, #7c6ff766 50%, #08090d 100%)'
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

- The logo carousel appears directly below the hero section on `intermavenmusic.com` and on relevant app landing pages.
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
REACT_APP_BACKEND_URL=https://intermaven-production.up.railway.app npm run build
```

Upload all contents of `frontend/build/` to public_html including `.htaccess`.
Upload `htpasswd_file` to `/home/u422251763/` renamed to `.htpasswd`.

Build phase credentials: username `intermaven`, password `build2026`.
To go public: delete the 4 Auth lines from `.htaccess`.

## 8.2 Backend — Railway

Service URL: https://intermaven-production.up.railway.app
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
| CNAME | api | intermaven-production.up.railway.app |

## 8.4 Set Admin Access

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { admin_role: "super_admin" } }
)
```

---

# 9. intermavenmusic.com — Technical Spec

## 9.1 Overview

Shared infrastructure with intermaven.io. Users from intermaven.io are auto-recognized. No re-registration required. Same JWT, same credits, same MongoDB.

## 9.2 User Types (7 total)

Each has a dedicated multi-step modal onboarding wizard.

**Consumer** — Streaming and downloading. Wizard: Personal info → Genre/content prefs → Creator discovery (pick 3) → Device detection → Pricing → Payment → Dashboard.

**Creator (Artist/Educator/Podcaster)** — Distribution, publishing, sync, merch. Wizard: About + payment + type → Details/bio/gallery → Discography/products → Compensation matrix → E-sign → Dashboard.

**Record Label** — Full roster management. Default 50/50 Gross Net split (editable per label in admin). Bulk upload for roster and catalogue with CSV validation.

**DJ** — HQ downloads, extended edits, 3-piece sets, mashups, remixes, drops. Hybrid consumer/creator model. IP Permission Request Engine for clearances.

**Film Studio** — Sync licensing. Access to Sync Marketplace with watermarked 30-second previews. AI Music Brief for scene-based catalogue search.

**Corporate** — Advertising (audio, display, sponsored playlists), talent discovery, brand partnerships, sync licensing. Public corporate directory.

**Media House** — Content licensing, broadcast royalties, interview/appearance requests. Mandatory playlist reporting with AI discrepancy detection. Escrow for appearance fees.

## 9.3 Compensation Engine

Cascade payment logic resolves all splits in one transaction cycle:
Intermaven commission → Label share → Artist split → Manager fee → Investor recoupment

Supports: distribution, publishing, sync, merch, ads, partnerships — each with independent split logic. Milestone-based payment schedules for partnership deals. Escrow for interview fees and pre-delivery licensing payments. Immutable audit trail accessible to all rights holders.

## 9.4 AI Notification Layer

Fires on every meaningful platform event across both portals. Respects each user's preferred channel (Email via Resend, WhatsApp via Twilio, SMS via Twilio). Logged in CRM against user profile. Escalates to secondary channel if primary goes unread past threshold.

## 9.5 EPK Cross-Platform Hosting

Artists can host their EPK on intermaven.io, intermavenmusic.com, or a custom domain — or all three simultaneously. Single source of truth: updates on one instance propagate to all hosted instances automatically.

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

## 10.2 intermavenmusic.com (Full Build — Next Phase)

10 build phases: Foundation → Consumer → Creator → Label → DJ → Sync Marketplace → Compensation Engine → Contract Module → Ad Platform → Media House

## 10.3 App Roadmap

**High priority:** Distribution Tracker, Hosting Manager
**Medium priority:** Press Release AI, Contract Builder, Lyric & Hook AI, Royalty Calculator
**Low priority:** Content Calendar, Grant Finder, ISRC Generator, Playlist Pitch AI

## 10.4 Platform App Inventory (30 apps total)

**Live and built (8):** Brand Kit AI, Music Bio & Press Kit, Social AI, Sync Pitch AI, Pitch Deck AI, EPK Builder, CRM & Comms, File Manager

**Roadmap intermaven.io (12):** Distribution Tracker, POS, Contract Builder, Invoice & Payments, Content Calendar, Press Release AI, Grant Finder, Lyric & Hook AI, Tour Manager, Merch Designer Brief, Royalty Calculator, Hosting Manager

**Roadmap intermavenmusic.com (10):** ISRC Generator, Release Planner, Sync Brief AI, Mastering Brief AI, Artist One-Sheet AI, Playlist Pitch AI, Music NFT Brief, Remix License Generator, Broadcast Report Formatter, Royalty Statement AI

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

Backend (Railway):
  URL: https://intermaven-production.up.railway.app
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
  Webhook: https://intermaven-production.up.railway.app/api/crm/twilio/webhook

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

*Document Version: 3.0*
*Last Updated: April 12, 2026*
*Platform: Intermaven — Africa's AI Marketplace*
