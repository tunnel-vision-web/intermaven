# Intermaven Platform Documentation
## Complete Technical Reference & Roadmap
### Africa's AI Marketplace

**Last Updated:** March 29, 2026  
**Version:** 2.0  
**Status:** Pre-Launch Development  
**Repository:** /app/

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Pre-Launch Requirements](#3-pre-launch-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [Database Configuration](#5-database-configuration)
6. [API Reference](#6-api-reference)
7. [Frontend Structure](#7-frontend-structure)
8. [Go-Live Checklist](#8-go-live-checklist)
9. [Post-Launch Roadmap](#9-post-launch-roadmap)
10. [Credentials & Environment Variables](#10-credentials--environment-variables)

---

# 1. Project Overview

## 1.1 What is Intermaven?

**Tagline:** *Africa's AI Marketplace*

Intermaven is an AI-powered creative and business tools platform built for African entrepreneurs and artists. The platform provides:

- **AI Tools:** Brand Kit Generator, Music Bio & Press Kit, Social AI, Sync Pitch AI, Pitch Deck AI, EPK Builder, Lead Generation
- **Credit System:** Pay-per-use model with M-Pesa and card payments
- **Two Portals:** Music (music.intermaven.io) and Business (intermaven.io)
- **Multi-language Support:** English & Swahili (extensible to more African languages)

## 1.2 Target Users

1. **African Musicians/Artists** - Need brand kits, press materials, sync pitches, EPKs
2. **Creative Entrepreneurs** - Need business pitch decks, social media content
3. **Small Business Owners** - Need branding, social management, POS tools
4. **Record Labels & Agencies** - Need to manage multiple artists/clients (Partner Program)

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

## 2.2 Pre-Launch Features Required ⏳

See [Section 3: Pre-Launch Requirements](#3-pre-launch-requirements) for detailed specifications.

## 2.3 Post-Launch Features 🔮

See [Section 9: Post-Launch Roadmap](#9-post-launch-roadmap) for detailed specifications.

---

# 3. Pre-Launch Requirements

## 3.1 Beta Signup Cards (EPK, Lead Generation, POS)

### Overview
Add "Coming Soon" app cards that allow users to sign up for early beta testing. Users select their preferred communication method (Email, WhatsApp, SMS) and are added to the CRM for notifications when the feature launches.

### Apps Requiring Beta Signup

| App | Portal | Description |
|-----|--------|-------------|
| EPK Kit Generator | Music | Electronic Press Kit builder |
| Lead Generation | Both | AI-powered lead gen tool |
| POS System | Business | Point of sale for SMEs |

### Beta Signup Card UI

```
┌─────────────────────────────────────────────────────────────┐
│  APP CARD (Coming Soon)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         [App Icon]                                   │   │
│  │                                                     │   │
│  │         EPK Kit Generator                           │   │
│  │                                                     │   │
│  │         Create professional press kits              │   │
│  │         for labels and bookers                      │   │
│  │                                                     │   │
│  │         ┌─────────────────────────────────────┐     │   │
│  │         │        COMING SOON                  │     │   │
│  │         │                                     │     │   │
│  │         │  Be first to know when it launches  │     │   │
│  │         │                                     │     │   │
│  │         │  How should we notify you?          │     │   │
│  │         │                                     │     │   │
│  │         │  [📧 Email] [💬 WhatsApp] [📱 SMS]  │     │   │
│  │         │                                     │     │   │
│  │         │  Email: [________________]          │     │   │
│  │         │                                     │     │   │
│  │         │  [Join Beta Waitlist →]             │     │   │
│  │         └─────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```javascript
// beta_signups collection
{
  _id: ObjectId,
  app_id: String,                // 'epk', 'lead_gen', 'pos'
  email: String,
  phone: String,                 // For WhatsApp/SMS
  preferred_channel: String,     // 'email', 'whatsapp', 'sms'
  portal: String,                // 'music', 'business'
  user_id: ObjectId,             // If signed in user
  status: String,                // 'waiting', 'notified', 'converted'
  notified_at: DateTime,
  converted_at: DateTime,
  created_at: DateTime
}
```

### API Endpoints

```
POST /api/beta/signup           # Sign up for beta
GET  /api/beta/status/:app_id   # Check signup status
POST /api/admin/beta/notify     # Send launch notification to waitlist
```

---

## 3.2 AI Chat Assistant

### Overview
An AI-powered support assistant that is fully conversant with the Intermaven platform. It helps users with navigation, feature usage, troubleshooting, and general questions. The assistant tracks user behavior and proactively offers help.

### Features

1. **Platform Knowledge Base**
   - Complete understanding of all features
   - How-to guides for each tool
   - Pricing and billing information
   - Technical troubleshooting

2. **Behavior Tracking & Proactive Help**
   - Tracks time on page
   - Detects user confusion (repeated clicks, back-and-forth navigation)
   - Automatically pops up after configurable idle time (default: 60 seconds on landing page)
   - Context-aware suggestions based on current page

3. **Multi-language Support**
   - English and Swahili
   - Follows system language setting

### Chat Assistant UI

```
┌─────────────────────────────────────────────────────────────┐
│  AI ASSISTANT (Floating Widget)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                              ┌──────────────────────────┐   │
│                              │  💬 Need help?           │   │
│                              │                          │   │
│                              │  I noticed you've been   │   │
│                              │  on this page for a      │   │
│                              │  while. Can I help you   │   │
│                              │  get started?            │   │
│                              │                          │   │
│                              │  [Yes, help me]          │   │
│                              │  [No thanks]             │   │
│                              └──────────────────────────┘   │
│                                                        🤖   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AI ASSISTANT (Expanded Chat)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Intermaven Assistant                          [—]  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  🤖 Hi! I'm your Intermaven assistant. I can help  │   │
│  │     you with:                                       │   │
│  │                                                     │   │
│  │     • Using AI tools                               │   │
│  │     • Managing your account                        │   │
│  │     • Understanding pricing                        │   │
│  │     • Technical issues                             │   │
│  │                                                     │   │
│  │     What can I help you with today?                │   │
│  │                                                     │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  👤 How do I create a brand kit?                   │   │
│  │                                                     │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  🤖 Great question! Here's how to create a brand   │   │
│  │     kit:                                           │   │
│  │                                                     │   │
│  │     1. Go to your Dashboard                        │   │
│  │     2. Click "Brand Kit AI" in the sidebar         │   │
│  │     3. Fill in your brand details...              │   │
│  │                                                     │   │
│  │     [Show me →]                                    │   │
│  │                                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [Type your question...]              [Send]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Proactive Trigger Rules

| Trigger | Condition | Action |
|---------|-----------|--------|
| Idle time | 60+ seconds on landing page | Show "Need help?" popup |
| Lost navigation | 3+ page changes in 30 seconds | Offer navigation help |
| Tool confusion | Started but abandoned AI form | Offer tool-specific help |
| Pricing page | 30+ seconds viewing pricing | Offer plan comparison |
| Error encounter | API error displayed | Offer troubleshooting |

### AI Knowledge Base Structure

```
/knowledge_base/
├── platform/
│   ├── overview.md
│   ├── getting_started.md
│   └── faq.md
├── tools/
│   ├── brand_kit.md
│   ├── music_bio.md
│   ├── social_ai.md
│   ├── sync_pitch.md
│   ├── pitch_deck.md
│   ├── epk_builder.md
│   └── lead_generation.md
├── account/
│   ├── registration.md
│   ├── profile.md
│   ├── billing.md
│   └── credits.md
├── troubleshooting/
│   ├── common_issues.md
│   └── error_codes.md
└── legal/
    ├── terms.md
    └── privacy.md
```

### Database Schema

```javascript
// chat_sessions collection
{
  _id: ObjectId,
  user_id: ObjectId,              // If logged in
  session_id: String,             // For anonymous users
  language: String,               // 'en', 'sw'
  messages: [{
    role: String,                 // 'user', 'assistant', 'system'
    content: String,
    timestamp: DateTime,
    context: {
      page: String,
      trigger: String             // 'proactive', 'user_initiated'
    }
  }],
  behavior: {
    pages_visited: [String],
    time_on_site: Number,
    last_activity: DateTime
  },
  resolved: Boolean,
  escalated_to_human: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

### API Endpoints

```
POST /api/chat/message           # Send message to AI
GET  /api/chat/history           # Get chat history
POST /api/chat/escalate          # Escalate to human support
GET  /api/chat/suggestions       # Get contextual suggestions
```

---

## 3.3 Assets Manager (File Manager)

### Overview
A backend file management system where users can upload, organize, and manage their assets (images, videos, documents). These assets can be used across the platform (EPK, social posts, etc.).

### Features

1. **File Upload**
   - Drag & drop upload
   - Multi-file upload
   - Progress indicator
   - File type validation

2. **Organization**
   - Folders and subfolders
   - Tags
   - Favorites
   - Search

3. **File Types Supported**
   - Images: jpg, jpeg, png, gif, webp, svg
   - Videos: mp4, mov, webm
   - Documents: pdf, doc, docx
   - Audio: mp3, wav

4. **Storage Tiers**
   | Plan | Storage |
   |------|---------|
   | Free | 500 MB |
   | Creator | 2 GB |
   | Pro | 10 GB |

### Assets Manager UI

```
┌─────────────────────────────────────────────────────────────┐
│  ASSETS MANAGER                       [+ Upload] [+ Folder] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 My Assets                                               │
│  ├── 📁 Press Photos (12)                                   │
│  ├── 📁 Videos (4)                                          │
│  ├── 📁 Documents (8)                                       │
│  └── 📁 Brand Assets (15)                                   │
│      ├── 📁 Logos                                           │
│      └── 📁 Color Palettes                                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  RECENT FILES                                               │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐              │
│  │ 🖼️  │  │ 🖼️  │  │ 📄  │  │ 🎵  │  │ 🎬  │              │
│  │     │  │     │  │     │  │     │  │     │              │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘              │
│  photo1   photo2   doc.pdf  track    video                 │
│  2.4 MB   1.8 MB   156 KB   4.8 MB   12 MB                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Storage: 245 MB / 500 MB used                [Upgrade]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```javascript
// files collection
{
  _id: ObjectId,
  user_id: ObjectId,
  filename: String,
  original_filename: String,
  mime_type: String,
  size: Number,
  extension: String,
  storage_path: String,
  storage_url: String,
  thumbnail_url: String,
  folder_id: ObjectId,
  tags: [String],
  is_favorite: Boolean,
  metadata: {
    width: Number,
    height: Number,
    duration: Number
  },
  created_at: DateTime,
  updated_at: DateTime
}

// folders collection
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  parent_id: ObjectId,
  color: String,
  created_at: DateTime
}
```

---

## 3.4 AI Output Library

### Overview
A dedicated library where users can store and organize all content generated by AI tools. This allows for:
- Future reference
- Re-use of strategies
- Version history
- Export and sharing

### Features

1. **Auto-save**: All AI generations automatically saved
2. **Organization**: By tool, date, project, tags
3. **Search**: Full-text search across all outputs
4. **Versioning**: Keep multiple versions of regenerated content
5. **Export**: PDF, TXT, Copy to clipboard
6. **Templates**: Save as template for future use

### Library UI

```
┌─────────────────────────────────────────────────────────────┐
│  MY LIBRARY                               [Search] [Filter] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter by: [All Tools ▼] [All Dates ▼] [All Tags ▼]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎨 Brand Kit: Savanna Sounds                        │   │
│  │    Created: Mar 24, 2026 • Credits used: 10         │   │
│  │    Tags: music, afrobeats, brand                    │   │
│  │                                                     │   │
│  │    [View] [Copy] [Download] [Regenerate] [Delete]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎤 Music Bio: Artist Press Kit                      │   │
│  │    Created: Mar 23, 2026 • Credits used: 15         │   │
│  │    Tags: press, bio, media                          │   │
│  │    Versions: 3                                      │   │
│  │                                                     │   │
│  │    [View] [Copy] [Download] [Regenerate] [Delete]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Showing 1-10 of 45 items            [< 1 2 3 4 5 >]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```javascript
// library_items collection
{
  _id: ObjectId,
  user_id: ObjectId,
  tool: String,
  title: String,
  input: Object,
  output: String,
  tags: [String],
  is_favorite: Boolean,
  is_template: Boolean,
  versions: [{
    version: Number,
    output: String,
    created_at: DateTime
  }],
  project_id: ObjectId,
  credits_used: Number,
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## 3.5 Multi-Language Support (i18n)

### Overview
Full internationalization support starting with English and Swahili, with a scalable architecture for adding more African languages.

### Supported Languages (Phase 1)

| Code | Language | Status |
|------|----------|--------|
| en | English | Primary |
| sw | Swahili | Secondary |

### Future Languages (Phase 2+)

| Code | Language | Region |
|------|----------|--------|
| yo | Yoruba | Nigeria |
| ha | Hausa | Nigeria/Niger |
| am | Amharic | Ethiopia |
| zu | Zulu | South Africa |
| lg | Luganda | Uganda |
| fr | French | Francophone Africa |

### Implementation Architecture

```
/app/frontend/src/
├── i18n/
│   ├── index.js              # i18n configuration
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json   # Common translations
│   │   │   ├── landing.json  # Landing page
│   │   │   ├── dashboard.json # Dashboard
│   │   │   ├── tools.json    # AI tools
│   │   │   └── legal.json    # Terms, Privacy
│   │   └── sw/
│   │       ├── common.json
│   │       ├── landing.json
│   │       ├── dashboard.json
│   │       ├── tools.json
│   │       └── legal.json
│   └── utils/
│       └── languageDetector.js
```

### Adding New Languages

1. Create new locale folder: `/i18n/locales/{code}/`
2. Copy all JSON files from `/en/`
3. Translate all strings
4. Add language to config in `/i18n/index.js`
5. Add language option to UI selector

### Language Selector UI

```
┌─────────────────────────────────────────────────────────────┐
│  LANGUAGE SELECTOR (Header)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🌐 English ▼]                                             │
│                                                             │
│  ┌─────────────────┐                                        │
│  │ 🇬🇧 English     │                                        │
│  │ 🇰🇪 Kiswahili   │                                        │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Translation Example

**English (en/common.json):**
```json
{
  "nav": {
    "home": "Home",
    "tools": "AI Tools",
    "apps": "Apps",
    "pricing": "Pricing",
    "about": "About"
  },
  "cta": {
    "get_started": "Get Started Free",
    "sign_in": "Sign In"
  }
}
```

**Swahili (sw/common.json):**
```json
{
  "nav": {
    "home": "Nyumbani",
    "tools": "Zana za AI",
    "apps": "Programu",
    "pricing": "Bei",
    "about": "Kuhusu"
  },
  "cta": {
    "get_started": "Anza Bure",
    "sign_in": "Ingia"
  }
}
```

---

## 3.6 Newsletter Signup

### Overview
Add a newsletter signup CTA prominently placed above the "Built for creatives across" trust section on the landing page.

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  NEWSLETTER SIGNUP (Above trust section)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  📬 Stay in the loop                               │   │
│  │                                                     │   │
│  │  Get the latest AI tools, tips, and updates        │   │
│  │  for African creatives. No spam, ever.             │   │
│  │                                                     │   │
│  │  [email@example.com________] [Subscribe →]         │   │
│  │                                                     │   │
│  │  ✓ Join 2,500+ creatives already subscribed       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Built for creatives across                                 │
│  Nairobi • Lagos • Accra • Kampala • Dar es Salaam        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.7 Terms of Service & Privacy Policy

### Overview
Comprehensive legal documents that users must read and accept before using the platform.

### Requirements

1. **Mandatory Acceptance**
   - Checkbox required during registration
   - "I have read and agree to the Terms of Service and Privacy Policy"
   - Cannot proceed without checking

2. **Version Tracking**
   - Track which version user accepted
   - Prompt re-acceptance when documents updated

3. **Accessible Pages**
   - Dedicated `/terms` and `/privacy` pages
   - Also accessible from footer

### Terms of Service Sections

1. **Account Terms**
   - Eligibility
   - Account security
   - Accurate information

2. **Acceptable Use**
   - Prohibited activities
   - Content guidelines
   - AI-generated content ownership

3. **Credits & Payments**
   - Credit system explanation
   - Expiration policies
   - Refund policy

4. **Intellectual Property**
   - User content ownership
   - Platform rights
   - AI output licensing

5. **Limitation of Liability**
   - Service availability
   - Data loss
   - Third-party services

6. **Termination**
   - Account suspension
   - Data retention
   - Refunds on termination

7. **Governing Law**
   - Kenya jurisdiction
   - Dispute resolution

### Privacy Policy Sections

1. **Information We Collect**
   - Personal information
   - Usage data
   - AI inputs/outputs

2. **How We Use Information**
   - Service provision
   - Communication
   - Improvement

3. **Data Sharing**
   - Third-party services
   - Legal requirements
   - Business transfers

4. **Data Security**
   - Encryption
   - Access controls
   - Incident response

5. **Your Rights**
   - Access
   - Correction
   - Deletion
   - Export

6. **Cookies**
   - Essential cookies
   - Analytics
   - Preferences

7. **Contact**
   - Data protection officer
   - Complaints

### Database Schema

```javascript
// legal_acceptances collection
{
  _id: ObjectId,
  user_id: ObjectId,
  document_type: String,         // 'terms', 'privacy'
  version: String,               // 'v1.0', 'v1.1'
  accepted_at: DateTime,
  ip_address: String,
  user_agent: String
}

// legal_documents collection
{
  _id: ObjectId,
  type: String,
  version: String,
  content: String,               // Markdown content
  effective_date: DateTime,
  created_at: DateTime
}
```

---

## 3.8 Password Visibility Toggle

### Overview
Add eye icon to show/hide password on sign in and sign up forms.

### UI Implementation

```
┌─────────────────────────────────────────────────────────────┐
│  PASSWORD INPUT                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Password                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔒 ••••••••••••                              👁️    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Click eye icon to toggle visibility]                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔒 MySecurePass123                           👁️‍🗨️   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.9 Enhanced Social AI (Flagship Product)

### Overview
Social AI is the flagship product with deep Meta API integration. It allows users to:
- Connect social accounts
- Create and schedule posts
- Preview posts as they'll appear
- Run paid campaigns
- Target specific audiences
- Generate leads

### Features

#### A. Account Connection
```
┌─────────────────────────────────────────────────────────────┐
│  CONNECT ACCOUNTS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Connect your social accounts to manage from one place      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📘 Facebook       [Connect]                         │   │
│  │    Pages, Groups, Ads                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📸 Instagram      [Connected ✓]         [Manage]    │   │
│  │    @yourusername • Business Account                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🐦 Twitter/X      [Connect]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎵 TikTok         [Connect]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### B. Post Creator with Preview
```
┌─────────────────────────────────────────────────────────────┐
│  CREATE POST                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ COMPOSE              │  │ PREVIEW              │        │
│  │                      │  │                      │        │
│  │ [📘] [📸] [🐦] [🎵] │  │ ┌──────────────────┐ │        │
│  │                      │  │ │ Instagram        │ │        │
│  │ ┌──────────────────┐ │  │ │                  │ │        │
│  │ │                  │ │  │ │ @yourusername    │ │        │
│  │ │ Write your      │ │  │ │                  │ │        │
│  │ │ caption here... │ │  │ │ [Image Preview]  │ │        │
│  │ │                  │ │  │ │                  │ │        │
│  │ └──────────────────┘ │  │ │ Your caption    │ │        │
│  │                      │  │ │ will appear...  │ │        │
│  │ [🖼️ Add Media]       │  │ │                  │ │        │
│  │                      │  │ │ #hashtags       │ │        │
│  │ [🤖 AI Generate]     │  │ └──────────────────┘ │        │
│  │                      │  │                      │        │
│  │ Hashtags:            │  │ [📘 Facebook ▼]      │        │
│  │ #music #afrobeats    │  │                      │        │
│  │                      │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  [Save Draft] [Schedule] [Post Now]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### C. Paid Campaigns (Meta Ads Integration)
```
┌─────────────────────────────────────────────────────────────┐
│  CREATE CAMPAIGN                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Campaign Objective                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Reach   │  │ Traffic │  │ Engage  │  │ Leads   │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  TARGETING                                                  │
│                                                             │
│  Location: [Kenya ▼] [+ Add more]                          │
│                                                             │
│  Age: [18] — [45]                                          │
│                                                             │
│  Gender: [All ▼]                                           │
│                                                             │
│  Interests:                                                 │
│  [Afrobeats] [Music] [Entertainment] [+ Add]               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  BUDGET                                                     │
│                                                             │
│  Daily Budget: KES [________]                               │
│  Duration: [7 days ▼]                                       │
│                                                             │
│  Estimated Reach: 15,000 - 45,000 people                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  PAYMENT                                                    │
│                                                             │
│  Pay with: [M-Pesa] [Card] [Intermaven Credits]            │
│                                                             │
│  Total: KES 3,500                                          │
│                                                             │
│  [Cancel] [Launch Campaign →]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### D. Lead Generation Integration
- Leads from campaigns saved to CRM
- Auto-tagging by campaign source
- Follow-up automation

### Meta API Integration Points

| Feature | API | Permissions Required |
|---------|-----|---------------------|
| Page posting | Graph API | pages_manage_posts |
| Instagram posting | Instagram Graph API | instagram_basic, instagram_content_publish |
| Insights | Graph API | read_insights |
| Ads management | Marketing API | ads_management |
| Lead forms | Lead Ads API | leads_retrieval |
| Audiences | Marketing API | ads_management |

---

## 3.10 User Management (Admin - Pre-Launch)

### Overview
Complete user management system for admins including the ability to view, edit, and grant credits to users.

### Features

1. **User List**
   - Search and filter
   - Pagination
   - Bulk actions

2. **User Details**
   - Full profile view/edit
   - Activity history
   - Payment history

3. **Credit Management**
   - View credit balance
   - Grant free credits
   - Preset amounts + custom

4. **Account Actions**
   - Suspend/unsuspend
   - Reset password
   - Delete account

### Admin Dashboard UI

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN: USER MANAGEMENT                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search users...] [Plan ▼] [Status ▼] [Portal ▼]          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ □ | User          | Email            | Plan  | Cr   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ □ | Amara Diallo  | amara@email.com  | Pro   | 2340 │   │
│  │ □ | John Mwangi   | john@email.com   | Creat | 580  │   │
│  │ □ | Sarah Okonkwo | sarah@email.com  | Free  | 120  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Selected: 0  [Grant Credits] [Export] [Bulk Actions ▼]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Grant Credits Modal

```
┌─────────────────────────────────────────────────────────────┐
│  GRANT CREDITS                                         [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User: Amara Diallo (amara@email.com)                      │
│  Current Balance: 2,340 credits                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  QUICK AMOUNTS                                              │
│  [50] [100] [150] [250] [500] [1000]                       │
│                                                             │
│  OR                                                         │
│                                                             │
│  Custom Amount: [________] credits                          │
│                                                             │
│  Note (optional):                                           │
│  [Compensation for service disruption_________________]     │
│                                                             │
│                               [Cancel] [Grant Credits →]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.11 Help Center & Documentation

### Overview
A comprehensive help center with how-to guides, documentation, and a ticketing system. Structure based on the provided help.html template.

### Help Center Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HELP CENTER                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            How can we help you today?               │   │
│  │                                                     │   │
│  │  [Search for help articles...____________] [🔍]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CATEGORIES                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 🚀      │  │ 🎨      │  │ 💳      │  │ 👤      │       │
│  │ Getting │  │ AI      │  │ Billing │  │ Account │       │
│  │ Started │  │ Tools   │  │         │  │         │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 📱      │  │ 🤝      │  │ ⚙️      │  │ 📞      │       │
│  │ Social  │  │ Partner │  │ Tech    │  │ Contact │       │
│  │ AI      │  │ Program │  │ Support │  │ Us      │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  POPULAR ARTICLES                                           │
│  • How to create your first brand kit                      │
│  • Understanding credits and billing                        │
│  • Connecting your social accounts                         │
│  • Getting started with Social AI                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Can't find what you're looking for?                       │
│  [Submit a Support Ticket →]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How-to Guides (Per App)

Each app will have a dedicated guide accessible from:
1. Help center category
2. Dashboard "?" icon next to each tool

**Guide Structure:**
- Overview
- Step-by-step instructions
- Screenshots/GIFs
- Tips & best practices
- FAQ
- Troubleshooting

### Ticketing System

```
┌─────────────────────────────────────────────────────────────┐
│  SUBMIT A TICKET                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Category: [Select category ▼]                              │
│  - Technical Issue                                          │
│  - Billing Question                                         │
│  - Feature Request                                          │
│  - Account Problem                                          │
│  - Other                                                    │
│                                                             │
│  Subject: [Brief description of your issue___________]      │
│                                                             │
│  Description:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Please describe your issue in detail...            │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Attachments: [+ Add files]                                 │
│                                                             │
│  Priority: [Normal ▼]                                       │
│                                                             │
│  [Cancel] [Submit Ticket →]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Admin Support Backend

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN: SUPPORT TICKETS                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [All] [Open (12)] [Pending (5)] [Resolved (89)]           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #1234 | Technical Issue | Payment not processing    │   │
│  │ Amara Diallo | 2 hours ago | 🔴 High Priority       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #1233 | Feature Request | Add TikTok support        │   │
│  │ John Mwangi | 5 hours ago | 🟡 Normal               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.12 App Management (Backend)

### Overview
Allow users to add/remove apps from their dashboard. Some apps are included by default, others can be added.

### Default vs Optional Apps

| App | Default (Free) | Default (Creator) | Default (Pro) |
|-----|---------------|-------------------|---------------|
| Brand Kit AI | ✓ | ✓ | ✓ |
| Music Bio AI | ✓ | ✓ | ✓ |
| Social AI | ✓ | ✓ | ✓ |
| Sync Pitch AI | ✓ | ✓ | ✓ |
| Pitch Deck AI | ✓ | ✓ | ✓ |
| EPK Builder | - | ✓ | ✓ |
| Lead Generation | - | - | ✓ |
| Asset Manager | - | ✓ | ✓ |
| Library | ✓ | ✓ | ✓ |

---

## 3.13 Payment Method Logos

### Overview
Display M-Pesa, Visa, and Mastercard logos on the landing page to build trust and indicate accepted payment methods.

### Placement Options

1. **Footer** - Payment methods section
2. **Pricing page** - Below plan cards
3. **Hero area** - Trust indicators

### Design

```
┌─────────────────────────────────────────────────────────────┐
│  PAYMENT METHODS (Muted, professional styling)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Secure payments via                                        │
│                                                             │
│  [M-Pesa logo] [Visa logo] [Mastercard logo]               │
│                                                             │
│  (Logos in muted/grayscale, slight opacity)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.14 Dashboard-to-Landing Navigation

### Overview
Allow users to navigate back to the public website from the dashboard by clicking the logo.

### Implementation

- Logo in dashboard sidebar links to `/` (landing page)
- Opens in same tab (with confirmation if unsaved work)
- Or add explicit "Back to website" link

---

## 3.15 Muted, Futuristic Color Palette

### Overview
Update all icons and accent colors to use muted, futuristic tones. Any color variations should be analogous (adjacent on color wheel).

### Color Palette

```css
:root {
  /* Primary (Muted Purple) */
  --primary: #6b5b95;
  --primary-muted: #534b6e;
  --primary-light: #8677a9;
  
  /* Analogous Accents */
  --accent-blue: #5b7795;      /* Blue-purple */
  --accent-violet: #7b5b95;    /* Red-purple */
  --accent-indigo: #5b6595;    /* Indigo */
  
  /* Neutrals */
  --bg-dark: #0a0b0f;
  --bg-medium: #12131a;
  --bg-light: #1a1b25;
  
  /* Text */
  --text-primary: #e8e8ec;
  --text-muted: #8b8b9a;
  --text-subtle: #5a5a6a;
  
  /* Status (Muted) */
  --success: #4a7c59;
  --warning: #7c6a4a;
  --error: #7c4a4a;
  --info: #4a5a7c;
}
```

### Icon Styling

```css
.icon {
  color: var(--text-muted);
  opacity: 0.85;
  transition: color 0.2s, opacity 0.2s;
}

.icon:hover {
  color: var(--primary-light);
  opacity: 1;
}
```

---

## 3.16 User Avatar Upload

### Overview
Allow users to upload a profile picture/avatar instead of just showing initials.

### Implementation

```
┌─────────────────────────────────────────────────────────────┐
│  PROFILE SETTINGS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐                                                │
│  │         │  [Upload Photo]                                │
│  │   AD    │  [Remove]                                      │
│  │         │                                                │
│  └─────────┘  Max 2MB, JPG/PNG                              │
│                                                             │
│  First Name: [Amara__________]                              │
│  Last Name:  [Diallo_________]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Storage

- Store in Assets Manager
- Auto-resize to 256x256
- Generate smaller thumbnails (64x64, 128x128)

---

## 3.17 Hero Images Configuration

### Overview
Setup dedicated folder for hero background images with proper naming and dimensions.

### Folder Structure

```
/app/frontend/public/images/
├── hero/
│   ├── hero-music-1.jpg       # Music portal, slide 1
│   ├── hero-music-2.jpg       # Music portal, slide 2
│   ├── hero-music-3.jpg       # Music portal, slide 3
│   ├── hero-music-4.jpg       # Music portal, slide 4
│   ├── hero-business-1.jpg    # Business portal, slide 1
│   ├── hero-business-2.jpg    # Business portal, slide 2
│   ├── hero-business-3.jpg    # Business portal, slide 3
│   └── hero-business-4.jpg    # Business portal, slide 4
├── logos/
│   ├── intermaven-white.svg
│   ├── intermaven-black.svg
│   ├── mpesa.svg
│   ├── visa.svg
│   └── mastercard.svg
└── icons/
    └── ... (app icons)
```

### Hero Image Specifications

| Property | Value |
|----------|-------|
| Dimensions | 1920 x 1080 px (16:9) |
| Format | JPEG (optimized) |
| File size | Max 500KB |
| Color profile | sRGB |
| Quality | 80% compression |

### Naming Convention

```
hero-{portal}-{slide_number}.jpg

Examples:
- hero-music-1.jpg
- hero-music-2.jpg
- hero-business-1.jpg
```

### Usage in Code

```javascript
const heroImages = {
  music: [
    '/images/hero/hero-music-1.jpg',
    '/images/hero/hero-music-2.jpg',
    '/images/hero/hero-music-3.jpg',
    '/images/hero/hero-music-4.jpg'
  ],
  business: [
    '/images/hero/hero-business-1.jpg',
    '/images/hero/hero-business-2.jpg',
    '/images/hero/hero-business-3.jpg',
    '/images/hero/hero-business-4.jpg'
  ]
};
```

---

# 4. Technical Architecture

## 4.1 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | React | 18.2.0 | Single Page Application |
| UI Components | Custom CSS + Shadcn/UI | - | Design system |
| Internationalization | react-i18next | - | Multi-language support |
| Backend | FastAPI | 0.104.1 | REST API |
| Runtime | Python | 3.11.14 | Backend runtime |
| Runtime | Node.js | 20.20.0 | Frontend build |
| Package Manager | Yarn | 1.22.22 | Frontend dependencies |
| Database | MongoDB | - | Document store |
| File Storage | S3/Cloudflare R2 | - | Asset storage |
| AI | Claude Sonnet 4.5 | - | Via Emergent LLM Key |
| Payments | Pesapal | - | M-Pesa + Cards |
| Social | Meta API | - | Facebook/Instagram integration |
| Messaging | Twilio | - | WhatsApp & SMS |
| Email | Resend | - | Transactional emails |
| Hosting | Vercel + Railway | - | Frontend + Backend |

## 4.2 Project Structure

```
/app/
├── backend/
│   ├── server.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── ai.py
│   │   ├── files.py
│   │   ├── library.py
│   │   ├── social.py
│   │   ├── chat.py
│   │   ├── admin.py
│   │   ├── support.py
│   │   └── beta.py
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── meta_service.py
│   │   ├── storage_service.py
│   │   └── email_service.py
│   ├── models/
│   │   └── schemas.py
│   ├── knowledge_base/
│   │   └── ... (AI assistant knowledge)
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── hero/
│   │   │   ├── logos/
│   │   │   └── icons/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── i18n/
│   │   │   ├── index.js
│   │   │   └── locales/
│   │   │       ├── en/
│   │   │       └── sw/
│   │   ├── components/
│   │   │   ├── AuthModal.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ChatAssistant.js
│   │   │   ├── landing/
│   │   │   ├── admin/
│   │   │   ├── social/
│   │   │   ├── files/
│   │   │   ├── library/
│   │   │   └── help/
│   │   └── styles/
│   ├── package.json
│   └── .env
│
├── memory/
│   ├── PRD.md
│   └── ROADMAP.md
│
└── DOCUMENTATION.md
```

---

# 5-10. [Remaining Sections]

*Sections 5-10 remain as previously documented with the following additions:*

---

# 9. Post-Launch Roadmap

## 9.1 Community Forum

Build a community forum similar to Odoo's forum (https://www.odoo.com/forum/help-1).

### Features
- Categories by topic
- User reputation/karma
- Upvoting/downvoting
- Best answer marking
- Search
- Tags
- User profiles

### Forum Structure
```
/forum
├── /category/getting-started
├── /category/ai-tools
├── /category/social-ai
├── /category/billing
├── /category/feature-requests
└── /category/general
```

## 9.2 Advanced Dashboard Analytics

Comprehensive statistics dashboard for users:

### Metrics
- Total leads generated
- New leads (period)
- Conversion rates
- AI tool usage breakdown
- Credit consumption trends
- Social engagement metrics
- Campaign performance

### Visualization
- Line charts (trends)
- Bar charts (comparisons)
- Pie charts (breakdowns)
- Data tables (details)

### Export/Import
- Export reports (PDF, CSV, Excel)
- Import authorized data
- Scheduled reports (email)

---

## 9.3 Partner Program

Full partner program as previously documented (commission system, bulk invites, etc.)

## 9.4 EPK Builder

Full implementation as previously documented.

## 9.5 CRM & Communication

Full implementation as previously documented.

---

# 10. Credentials & Environment Variables

## 10.1 Current Configuration

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

### Payments (Pesapal) ⏳ PENDING
```
PESAPAL_CONSUMER_KEY=<pending>
PESAPAL_CONSUMER_SECRET=<pending>
```

### Social (Meta API) ⏳ PENDING
```
META_APP_ID=<pending>
META_APP_SECRET=<pending>
```

### Messaging (Twilio) ⏳ PENDING
```
TWILIO_ACCOUNT_SID=<pending>
TWILIO_AUTH_TOKEN=<pending>
```

### Email (Resend) ⏳ PENDING
```
RESEND_API_KEY=<pending>
```

---

*Document Version: 2.0*  
*Last Updated: March 29, 2026*  
*Platform: Intermaven - Africa's AI Marketplace*
