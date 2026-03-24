# Intermaven Platform - Technical Roadmap & Specifications
## Version 2.0 - Complete Platform Vision

**Last Updated:** March 24, 2026  
**Status:** Planning Document  
**Prepared for:** Development Team

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [EPK Builder System](#2-epk-builder-system)
3. [CRM & Communication System](#3-crm--communication-system)
4. [User Management System](#4-user-management-system)
5. [File Management System](#5-file-management-system)
6. [App Marketplace Landing Pages](#6-app-marketplace-landing-pages)
7. [Database Schema Updates](#7-database-schema-updates)
8. [API Endpoints Specification](#8-api-endpoints-specification)
9. [Infrastructure Requirements](#9-infrastructure-requirements)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Executive Summary

### Vision
Transform Intermaven from an AI tools platform into a complete creative business operating system for African artists and entrepreneurs, featuring:
- Professional online presence (EPK hosting)
- Customer relationship management
- Asset and file management
- Multi-channel communication
- Comprehensive user administration

### Current State
- ✅ User authentication (JWT)
- ✅ 5 AI Tools (Brand Kit, Music Bio, Social AI, Sync Pitch, Pitch Deck)
- ✅ Credit-based billing system
- ✅ Dashboard with 30% sidebar
- ✅ Landing pages (Home, Tools, Apps, Pricing, About)
- ✅ Pesapal integration (configured, awaiting credentials)

### Target State
- Full EPK hosting with public profiles
- CRM with multi-channel communication
- Admin dashboard with user management
- Google Drive-style file storage
- Individual app marketing pages

---

## 2. EPK Builder System

### 2.1 Overview
The Electronic Press Kit (EPK) Builder allows artists to create professional, shareable pages that consolidate their brand, music, press materials, and contact information.

### 2.2 Dual Output System

#### A. Hosted Profile Page
**URL Structure:** `https://intermaven.io/artist/[username]`

**Features:**
- Custom username selection (unique, URL-safe)
- Public/private toggle
- Password protection option for exclusive content
- Analytics tracking (views, clicks, referral sources)
- SEO optimization (meta tags, Open Graph, Twitter Cards)
- Mobile-responsive design
- Custom color themes (or inherit from Brand Kit)

**Page Sections:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  - Cover image/video (auto-play muted)                  │
│  - Profile photo                                        │
│  - Artist name + tagline                                │
│  - Genre tags                                           │
│  - Location                                             │
│  - Social links (icons)                                 │
├─────────────────────────────────────────────────────────┤
│  BIO SECTION                                            │
│  - Short bio (from Music Bio AI or custom)              │
│  - Full bio (expandable)                                │
│  - Career highlights timeline                           │
├─────────────────────────────────────────────────────────┤
│  MUSIC SECTION                                          │
│  - Spotify embed (top tracks/albums)                    │
│  - Apple Music link                                     │
│  - YouTube video embeds                                 │
│  - SoundCloud embeds                                    │
│  - Boomplay/Mdundo links (Africa-specific)              │
├─────────────────────────────────────────────────────────┤
│  MEDIA/PRESS SECTION                                    │
│  - Press photos (downloadable, high-res)                │
│  - Press quotes/reviews                                 │
│  - Media coverage links                                 │
│  - Press kit PDF download                               │
├─────────────────────────────────────────────────────────┤
│  VIDEOS SECTION                                         │
│  - Music videos                                         │
│  - Live performances                                    │
│  - Behind the scenes                                    │
├─────────────────────────────────────────────────────────┤
│  EVENTS/TOUR SECTION                                    │
│  - Upcoming shows                                       │
│  - Past performances                                    │
│  - Booking calendar integration                         │
├─────────────────────────────────────────────────────────┤
│  CONTACT SECTION                                        │
│  - Booking inquiries form                               │
│  - Management contact                                   │
│  - Press contact                                        │
│  - General inquiries                                    │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  - "Powered by Intermaven" badge                        │
│  - Quick links                                          │
│  - Copyright                                            │
└─────────────────────────────────────────────────────────┘
```

#### B. Downloadable PDF EPK
**Format:** A4/Letter PDF, professionally designed

**Contents:**
- Cover page with artist photo and branding
- One-sheet (name, genre, bio, contact)
- Full biography
- Discography
- Press highlights
- High-resolution photos (embedded or linked)
- Technical rider (for live performances)
- Contact information with QR codes

**Generation Options:**
- Auto-generate from hosted EPK data
- Custom templates (3-5 professional designs)
- White-label option (remove Intermaven branding for Pro users)

### 2.3 Data Integration

**Auto-populate from other tools:**
- Brand Kit AI → Color scheme, taglines, tone
- Music Bio AI → Short bio, full bio, press narrative
- Social AI → Social media links
- File Manager → Photos, press materials

### 2.4 EPK Analytics Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  EPK ANALYTICS                                          │
├─────────────────────────────────────────────────────────┤
│  Total Views: 1,234        Unique Visitors: 892         │
│  Avg. Time on Page: 2:34   Bounce Rate: 34%             │
├─────────────────────────────────────────────────────────┤
│  TOP REFERRAL SOURCES                                   │
│  1. Instagram Bio Link - 45%                            │
│  2. Direct Link - 28%                                   │
│  3. Google Search - 15%                                 │
│  4. Twitter - 8%                                        │
│  5. Email Campaigns - 4%                                │
├─────────────────────────────────────────────────────────┤
│  CLICK TRACKING                                         │
│  - Spotify: 234 clicks                                  │
│  - Download Press Kit: 67 clicks                        │
│  - Contact Form Submissions: 12                         │
│  - Social Links: 189 clicks                             │
├─────────────────────────────────────────────────────────┤
│  GEOGRAPHY                                              │
│  Kenya: 45% | Nigeria: 22% | USA: 15% | UK: 10% | Other │
└─────────────────────────────────────────────────────────┘
```

### 2.5 Technical Implementation

**Frontend Components:**
```
/app/frontend/src/
├── components/
│   └── epk/
│       ├── EPKBuilder.js          # Main builder interface
│       ├── EPKPreview.js          # Live preview
│       ├── EPKPublicPage.js       # Public-facing page
│       ├── EPKAnalytics.js        # Analytics dashboard
│       ├── sections/
│       │   ├── HeaderSection.js
│       │   ├── BioSection.js
│       │   ├── MusicSection.js
│       │   ├── MediaSection.js
│       │   ├── EventsSection.js
│       │   └── ContactSection.js
│       └── templates/
│           ├── MinimalTemplate.js
│           ├── BoldTemplate.js
│           └── ClassicTemplate.js
```

**Backend Endpoints:**
```
POST   /api/epk/create              # Create new EPK
GET    /api/epk/:id                 # Get EPK by ID
PUT    /api/epk/:id                 # Update EPK
DELETE /api/epk/:id                 # Delete EPK
GET    /api/epk/public/:username    # Get public EPK by username
POST   /api/epk/:id/publish         # Publish/unpublish EPK
GET    /api/epk/:id/analytics       # Get EPK analytics
POST   /api/epk/:id/pdf             # Generate PDF
GET    /api/epk/check-username      # Check username availability
```

**Database Schema:**
```javascript
// epk_profiles collection
{
  _id: ObjectId,
  user_id: ObjectId,
  username: String,           // unique, URL-safe
  is_published: Boolean,
  is_password_protected: Boolean,
  password_hash: String,
  
  // Profile data
  artist_name: String,
  tagline: String,
  genres: [String],
  location: String,
  
  // Content sections
  bio: {
    short: String,
    full: String,
    highlights: [{ year: Number, text: String }]
  },
  
  music: {
    spotify_artist_id: String,
    apple_music_url: String,
    youtube_channel: String,
    soundcloud_url: String,
    boomplay_url: String,
    featured_tracks: [{ platform: String, embed_id: String }]
  },
  
  media: {
    photos: [{ file_id: ObjectId, caption: String, is_press: Boolean }],
    videos: [{ platform: String, embed_id: String, title: String }],
    press_quotes: [{ quote: String, source: String, date: Date }],
    press_links: [{ title: String, url: String, publication: String }]
  },
  
  events: {
    upcoming: [{ date: Date, venue: String, city: String, ticket_url: String }],
    past: [{ date: Date, venue: String, city: String }]
  },
  
  contact: {
    booking_email: String,
    management_email: String,
    press_email: String,
    booking_form_enabled: Boolean
  },
  
  social_links: {
    instagram: String,
    twitter: String,
    tiktok: String,
    facebook: String,
    youtube: String,
    spotify: String
  },
  
  design: {
    template: String,          // 'minimal', 'bold', 'classic'
    primary_color: String,
    secondary_color: String,
    cover_image_id: ObjectId,
    profile_image_id: ObjectId
  },
  
  // Analytics
  analytics: {
    total_views: Number,
    unique_visitors: Number,
    last_viewed: Date
  },
  
  created_at: Date,
  updated_at: Date
}

// epk_analytics collection (detailed tracking)
{
  _id: ObjectId,
  epk_id: ObjectId,
  event_type: String,         // 'view', 'click', 'download', 'form_submit'
  event_data: Object,         // { element: 'spotify_link', etc. }
  referrer: String,
  user_agent: String,
  ip_country: String,
  ip_city: String,
  timestamp: Date
}
```

---

## 3. CRM & Communication System

### 3.1 Overview
A comprehensive Customer Relationship Management system to manage contacts, segment audiences, and communicate across multiple channels.

### 3.2 Contact Management

#### Contact Sources
- EPK booking form submissions
- Newsletter signups
- Payment customers
- Manual imports (CSV)
- API integrations (future: Mailchimp, HubSpot sync)

#### Contact Data Model
```javascript
// contacts collection
{
  _id: ObjectId,
  user_id: ObjectId,          // Intermaven user who owns this contact
  
  // Basic info
  email: String,
  phone: String,
  first_name: String,
  last_name: String,
  company: String,
  job_title: String,
  
  // Source tracking
  source: String,             // 'epk_form', 'newsletter', 'manual', 'import'
  source_details: {
    epk_id: ObjectId,
    form_type: String,
    campaign_id: String,
    import_batch_id: String
  },
  
  // Segmentation
  tags: [String],             // ['fan', 'industry', 'press', 'booker', 'label']
  lists: [ObjectId],          // Reference to contact_lists
  
  // Engagement tracking
  engagement: {
    emails_sent: Number,
    emails_opened: Number,
    emails_clicked: Number,
    last_email_sent: Date,
    last_email_opened: Date,
    whatsapp_messages: Number,
    sms_messages: Number
  },
  
  // Custom fields
  custom_fields: Object,
  
  // Status
  status: String,             // 'active', 'unsubscribed', 'bounced', 'spam'
  unsubscribe_reason: String,
  
  // Notes & history
  notes: [{ text: String, created_at: Date, created_by: ObjectId }],
  
  created_at: Date,
  updated_at: Date
}

// contact_lists collection
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  description: String,
  type: String,               // 'static', 'dynamic'
  dynamic_rules: Object,      // For dynamic lists: { tags: ['industry'], source: 'epk_form' }
  contact_count: Number,
  created_at: Date
}
```

### 3.3 Communication Channels

#### A. Email Campaigns
**Integration:** Resend API or SendGrid

**Features:**
- Rich text editor with templates
- Merge fields ({{first_name}}, {{artist_name}}, etc.)
- Scheduling
- A/B testing
- Open/click tracking
- Unsubscribe management

**Campaign Types:**
- One-time broadcasts
- Automated sequences (drip campaigns)
- Transactional emails (receipts, notifications)

**Templates:**
```
- New Release Announcement
- Tour/Event Announcement
- Press Release
- Newsletter
- Thank You / Follow-up
- Custom
```

#### B. WhatsApp Business
**Integration:** Twilio WhatsApp API or WhatsApp Business API

**Features:**
- Template messages (pre-approved)
- Broadcast lists
- Two-way conversations
- Media sharing (images, audio, documents)
- Delivery/read receipts

**Use Cases:**
- New release alerts to fans
- Booking confirmations
- Payment receipts
- Support conversations

#### C. SMS
**Integration:** Twilio SMS or Africa's Talking

**Features:**
- Bulk SMS campaigns
- Personalized messages
- Delivery tracking
- Opt-out management
- Africa-specific: USSD integration

#### D. In-App Notifications
**Features:**
- Push notifications (web/mobile)
- Bell icon notifications
- Activity feed
- Real-time updates via WebSocket

### 3.4 Communication Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  COMMUNICATIONS                                         │
├─────────────────────────────────────────────────────────┤
│  [Email] [WhatsApp] [SMS] [Notifications]               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  RECENT CAMPAIGNS                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📧 New Single Announcement                       │   │
│  │    Sent: Mar 20 | Opens: 45% | Clicks: 12%      │   │
│  │    Recipients: 234 | Status: Completed          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💬 WhatsApp: Show Reminder                       │   │
│  │    Sent: Mar 18 | Delivered: 98% | Read: 87%    │   │
│  │    Recipients: 156 | Status: Completed          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [+ New Campaign]  [View All]                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  QUICK STATS                                            │
│  Total Contacts: 1,234    Email Open Rate: 42%          │
│  Active Lists: 8          WhatsApp Delivery: 96%        │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Automation Workflows

**Trigger-based Automations:**
```yaml
Workflow: "New EPK Contact Welcome"
Trigger: EPK booking form submission
Actions:
  - Wait: 0 minutes
  - Send Email: "Thank you for reaching out"
  - Wait: 2 days
  - Send Email: "Here's more about my music"
  - Add Tag: "engaged"
  
Workflow: "Abandoned Cart Recovery"
Trigger: Payment initiated but not completed
Actions:
  - Wait: 1 hour
  - Send Email: "Complete your purchase"
  - Wait: 24 hours
  - If: payment_status != completed
    - Send WhatsApp: "Need help with your order?"
```

### 3.6 Technical Implementation

**Backend Endpoints:**
```
# Contacts
GET    /api/crm/contacts              # List contacts (paginated, filterable)
POST   /api/crm/contacts              # Create contact
GET    /api/crm/contacts/:id          # Get contact details
PUT    /api/crm/contacts/:id          # Update contact
DELETE /api/crm/contacts/:id          # Delete contact
POST   /api/crm/contacts/import       # Bulk import (CSV)
POST   /api/crm/contacts/export       # Export contacts

# Lists
GET    /api/crm/lists                 # Get all lists
POST   /api/crm/lists                 # Create list
PUT    /api/crm/lists/:id             # Update list
DELETE /api/crm/lists/:id             # Delete list
POST   /api/crm/lists/:id/contacts    # Add contacts to list
DELETE /api/crm/lists/:id/contacts    # Remove contacts from list

# Campaigns
GET    /api/crm/campaigns             # List campaigns
POST   /api/crm/campaigns             # Create campaign
GET    /api/crm/campaigns/:id         # Get campaign details
PUT    /api/crm/campaigns/:id         # Update campaign
DELETE /api/crm/campaigns/:id         # Delete campaign
POST   /api/crm/campaigns/:id/send    # Send campaign
GET    /api/crm/campaigns/:id/stats   # Get campaign statistics

# Communication
POST   /api/crm/send/email            # Send single email
POST   /api/crm/send/whatsapp         # Send WhatsApp message
POST   /api/crm/send/sms              # Send SMS

# Automations
GET    /api/crm/automations           # List automations
POST   /api/crm/automations           # Create automation
PUT    /api/crm/automations/:id       # Update automation
DELETE /api/crm/automations/:id       # Delete automation
POST   /api/crm/automations/:id/toggle # Enable/disable
```

---

## 4. User Management System

### 4.1 Overview
A comprehensive admin system for managing all Intermaven users, their subscriptions, activities, and support needs.

### 4.2 Admin Roles & Permissions

```javascript
// admin_roles collection
{
  _id: ObjectId,
  name: String,               // 'super_admin', 'admin', 'support', 'finance', 'content'
  permissions: [String]       // ['users.read', 'users.write', 'payments.refund', etc.]
}

// Permissions matrix
{
  // User management
  'users.read': 'View user list and details',
  'users.write': 'Create and edit users',
  'users.delete': 'Delete users',
  'users.impersonate': 'Login as user',
  
  // Financial
  'payments.read': 'View transactions',
  'payments.refund': 'Process refunds',
  'credits.adjust': 'Add/remove credits',
  
  // Content
  'content.moderate': 'Review and moderate EPKs',
  'content.feature': 'Feature content on homepage',
  
  // Support
  'support.tickets': 'Handle support tickets',
  'support.chat': 'Live chat with users',
  
  // System
  'system.settings': 'Modify system settings',
  'system.logs': 'View system logs',
  'system.analytics': 'Access analytics dashboard'
}
```

### 4.3 Admin Dashboard Features

#### A. User List & Search
```
┌─────────────────────────────────────────────────────────┐
│  USERS                                        [+ Add]   │
├─────────────────────────────────────────────────────────┤
│  Search: [________________________] [Filters ▼]         │
│                                                         │
│  Filters: Plan [All ▼] Status [All ▼] Portal [All ▼]   │
│           Date Range [Last 30 days ▼]                   │
├─────────────────────────────────────────────────────────┤
│  □  Name           Email              Plan    Credits   │
│  ─────────────────────────────────────────────────────  │
│  □  Amara Diallo   amara@email.com    Pro     2,340    │
│  □  John Mwangi    john@email.com     Creator   580    │
│  □  Sarah Okonkwo  sarah@email.com    Free      120    │
│  □  ...                                                 │
├─────────────────────────────────────────────────────────┤
│  Showing 1-25 of 1,234 users    [< 1 2 3 ... 50 >]     │
└─────────────────────────────────────────────────────────┘
```

#### B. User Detail View
```
┌─────────────────────────────────────────────────────────┐
│  USER: Amara Diallo                    [Edit] [Actions ▼]│
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  Email: amara@email.com                    │
│  │  Photo  │  Phone: +254 712 345 678                   │
│  │   AD    │  Portal: Music                             │
│  └─────────┘  Joined: March 15, 2026                    │
│               Last Active: 2 hours ago                  │
├─────────────────────────────────────────────────────────┤
│  [Overview] [Activity] [Billing] [Files] [Support]      │
├─────────────────────────────────────────────────────────┤
│  SUBSCRIPTION                                           │
│  Plan: Pro Bundle          Credits: 2,340               │
│  Purchased: Mar 15, 2026   Value: KES 1,500             │
│                                                         │
│  [Adjust Credits] [Change Plan] [Add Note]              │
├─────────────────────────────────────────────────────────┤
│  ACTIVE APPS                                            │
│  ✓ Brand Kit AI    ✓ Music Bio AI    ✓ Social AI       │
│  ✓ Sync Pitch AI   ✓ Pitch Deck AI   ✓ EPK Builder     │
├─────────────────────────────────────────────────────────┤
│  AI USAGE (Last 30 days)                                │
│  Total Runs: 45    Credits Used: 680                    │
│  Most Used: Music Bio AI (18 runs)                      │
├─────────────────────────────────────────────────────────┤
│  ADMIN NOTES                                            │
│  [Mar 20] Requested custom template - escalated to dev  │
│  [Mar 18] Refunded duplicate payment - KES 500          │
└─────────────────────────────────────────────────────────┘
```

#### C. Bulk Actions
- Send email to selected users
- Adjust credits for multiple users
- Export user data
- Change plans in bulk
- Add/remove tags

#### D. User Analytics
```
┌─────────────────────────────────────────────────────────┐
│  USER ANALYTICS                                         │
├─────────────────────────────────────────────────────────┤
│  Total Users: 12,345    Active (30d): 4,567             │
│  New This Month: 890    Churn Rate: 3.2%                │
├─────────────────────────────────────────────────────────┤
│  BY PLAN                      BY PORTAL                 │
│  Free: 8,234 (67%)            Music: 7,890 (64%)        │
│  Creator: 3,012 (24%)         Business: 4,455 (36%)     │
│  Pro: 1,099 (9%)                                        │
├─────────────────────────────────────────────────────────┤
│  SIGNUPS OVER TIME                                      │
│  [Graph showing daily/weekly/monthly signups]           │
├─────────────────────────────────────────────────────────┤
│  TOP FEATURES USED                                      │
│  1. Brand Kit AI - 34%                                  │
│  2. Social AI - 28%                                     │
│  3. Music Bio AI - 22%                                  │
│  4. Pitch Deck AI - 10%                                 │
│  5. Sync Pitch AI - 6%                                  │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Support Ticket System

```javascript
// support_tickets collection
{
  _id: ObjectId,
  ticket_number: String,      // "TKT-2026-001234"
  user_id: ObjectId,
  
  subject: String,
  category: String,           // 'billing', 'technical', 'feature', 'other'
  priority: String,           // 'low', 'medium', 'high', 'urgent'
  status: String,             // 'open', 'in_progress', 'waiting', 'resolved', 'closed'
  
  messages: [{
    sender_type: String,      // 'user', 'admin'
    sender_id: ObjectId,
    message: String,
    attachments: [ObjectId],
    created_at: Date
  }],
  
  assigned_to: ObjectId,      // Admin user
  tags: [String],
  
  // SLA tracking
  first_response_at: Date,
  resolved_at: Date,
  
  created_at: Date,
  updated_at: Date
}
```

### 4.5 Technical Implementation

**Admin Backend Endpoints:**
```
# User Management
GET    /api/admin/users                    # List users (paginated)
GET    /api/admin/users/:id                # Get user details
PUT    /api/admin/users/:id                # Update user
DELETE /api/admin/users/:id                # Delete user
POST   /api/admin/users/:id/impersonate    # Login as user
POST   /api/admin/users/:id/credits        # Adjust credits
POST   /api/admin/users/:id/notes          # Add admin note
GET    /api/admin/users/:id/activity       # Get user activity log
POST   /api/admin/users/bulk               # Bulk actions

# Analytics
GET    /api/admin/analytics/overview       # Dashboard stats
GET    /api/admin/analytics/users          # User analytics
GET    /api/admin/analytics/revenue        # Revenue analytics
GET    /api/admin/analytics/usage          # Feature usage

# Support
GET    /api/admin/tickets                  # List tickets
POST   /api/admin/tickets                  # Create ticket
GET    /api/admin/tickets/:id              # Get ticket
PUT    /api/admin/tickets/:id              # Update ticket
POST   /api/admin/tickets/:id/reply        # Reply to ticket
POST   /api/admin/tickets/:id/assign       # Assign ticket

# System
GET    /api/admin/settings                 # Get settings
PUT    /api/admin/settings                 # Update settings
GET    /api/admin/logs                     # View system logs
```

---

## 5. File Management System

### 5.1 Overview
A Google Drive-style file management system for users to store, organize, and share their creative assets.

### 5.2 Features

#### A. File Organization
```
┌─────────────────────────────────────────────────────────┐
│  MY FILES                          [+ Upload] [+ Folder]│
├─────────────────────────────────────────────────────────┤
│  📁 Press Photos                                        │
│  📁 Music Files                                         │
│  📁 Videos                                              │
│  📁 Documents                                           │
│  📁 Brand Assets                                        │
│     └── 📁 Logos                                        │
│     └── 📁 Color Palettes                               │
│  📁 AI Outputs                                          │
│     └── 📁 Brand Kits                                   │
│     └── 📁 Press Materials                              │
├─────────────────────────────────────────────────────────┤
│  RECENT FILES                                           │
│  🖼️ press_photo_01.jpg    2.4 MB    Mar 24             │
│  📄 media_pitch.pdf       156 KB    Mar 23             │
│  🎵 single_preview.mp3    4.8 MB    Mar 22             │
├─────────────────────────────────────────────────────────┤
│  Storage Used: 2.4 GB of 5 GB    [Upgrade]              │
└─────────────────────────────────────────────────────────┘
```

#### B. File Types Supported
```
Images:    jpg, jpeg, png, gif, webp, svg, heic
Audio:     mp3, wav, flac, aac, m4a, ogg
Video:     mp4, mov, avi, webm, mkv
Documents: pdf, doc, docx, txt, rtf
Archives:  zip, rar
Other:     psd, ai, eps (preview generation)
```

#### C. Features List
- **Upload:** Drag & drop, multi-file, resumable uploads
- **Organization:** Folders, tags, favorites, recent files
- **Search:** Full-text search, filter by type/date/size
- **Preview:** In-browser preview for images, audio, video, PDFs
- **Sharing:** Public links, password protection, expiry dates
- **Versioning:** Keep previous versions of files
- **Integration:** Use files in EPK, attach to emails, embed in AI tools

#### D. Storage Tiers
```
Free:    1 GB storage
Creator: 5 GB storage  
Pro:     25 GB storage
```

### 5.3 Data Model

```javascript
// files collection
{
  _id: ObjectId,
  user_id: ObjectId,
  
  // File info
  filename: String,
  original_filename: String,
  mime_type: String,
  size: Number,              // bytes
  extension: String,
  
  // Storage
  storage_provider: String,  // 's3', 'gcs', 'local'
  storage_path: String,
  storage_url: String,
  thumbnail_url: String,     // For images/videos
  
  // Organization
  folder_id: ObjectId,       // null for root
  tags: [String],
  is_favorite: Boolean,
  
  // Sharing
  is_public: Boolean,
  public_url: String,
  public_password_hash: String,
  public_expiry: Date,
  download_count: Number,
  
  // Versioning
  version: Number,
  previous_versions: [{
    version: Number,
    storage_path: String,
    created_at: Date
  }],
  
  // Metadata
  metadata: {
    // Image-specific
    width: Number,
    height: Number,
    
    // Audio-specific
    duration: Number,        // seconds
    bitrate: Number,
    
    // Video-specific
    resolution: String,
    fps: Number,
    
    // Document-specific
    page_count: Number
  },
  
  // AI integration
  used_in: [{
    type: String,            // 'epk', 'email', 'brand_kit'
    reference_id: ObjectId
  }],
  
  created_at: Date,
  updated_at: Date,
  deleted_at: Date           // Soft delete for trash
}

// folders collection
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  parent_id: ObjectId,       // null for root
  color: String,
  created_at: Date
}
```

### 5.4 Technical Implementation

**Storage Options:**
1. **AWS S3** (recommended for production)
2. **Google Cloud Storage**
3. **Cloudflare R2** (cost-effective)
4. **Local storage** (development only)

**Upload Flow:**
```
1. Client requests presigned upload URL
2. Backend generates presigned URL with expiry
3. Client uploads directly to storage (bypasses server)
4. Client notifies backend of completion
5. Backend processes file (thumbnails, metadata)
6. File record created in database
```

**Backend Endpoints:**
```
# Files
GET    /api/files                         # List files
POST   /api/files/upload-url              # Get presigned upload URL
POST   /api/files                         # Create file record after upload
GET    /api/files/:id                     # Get file details
PUT    /api/files/:id                     # Update file
DELETE /api/files/:id                     # Delete file (soft)
POST   /api/files/:id/restore             # Restore from trash
DELETE /api/files/:id/permanent           # Permanent delete
GET    /api/files/:id/download            # Get download URL
POST   /api/files/:id/share               # Create/update share link
GET    /api/files/shared/:token           # Access shared file

# Folders
GET    /api/folders                       # List folders
POST   /api/folders                       # Create folder
PUT    /api/folders/:id                   # Update folder
DELETE /api/folders/:id                   # Delete folder
POST   /api/folders/:id/move              # Move folder

# Search & Filter
GET    /api/files/search                  # Search files
GET    /api/files/recent                  # Recent files
GET    /api/files/favorites               # Favorited files
GET    /api/files/trash                   # Deleted files
```

---

## 6. App Marketplace Landing Pages

### 6.1 Overview
Each app in the marketplace gets its own dedicated landing page at a subdomain, focused on marketing that specific tool.

### 6.2 URL Structure
```
brandkit.intermaven.io      → Brand Kit AI
musicbio.intermaven.io      → Music Bio & Press Kit
social.intermaven.io        → Social AI
syncpitch.intermaven.io     → Sync Pitch AI
pitchdeck.intermaven.io     → Pitch Deck AI
epk.intermaven.io           → EPK Builder
pos.intermaven.io           → Intermaven POS
```

### 6.3 Landing Page Template

Each app landing page follows a consistent structure:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] INTERMAVEN Brand Kit AI    [Sign In] [Get Free] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO SECTION                                           │
│  ─────────────────────────────────────────────────────  │
│  [App Icon]                                             │
│                                                         │
│  Build your brand identity                              │
│  in 30 seconds                                          │
│                                                         │
│  AI-powered brand names, taglines, tone of voice,       │
│  and color direction — designed for African creatives.  │
│                                                         │
│  [Try Free — 10 credits] [See Pricing]                  │
│                                                         │
│  ✓ No credit card required                              │
│  ✓ 150 free credits on signup                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HOW IT WORKS                                           │
│  ─────────────────────────────────────────────────────  │
│  [Step 1]        [Step 2]        [Step 3]               │
│  Fill 4 fields   AI generates    Copy & use             │
│  Your name,      A complete      Ready for your         │
│  industry,       brand kit       website, socials,      │
│  audience,       tailored to     and marketing          │
│  brand vibe      your market     materials              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  WHAT YOU GET                                           │
│  ─────────────────────────────────────────────────────  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Brand    │  │ 5 Tagline│  │ Tone of  │              │
│  │ Name     │  │ Options  │  │ Voice    │              │
│  │ Analysis │  │          │  │ Guide    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Color    │  │ Position │  │ Elevator │              │
│  │ Direction│  │ Statement│  │ Pitch    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LIVE DEMO                                              │
│  ─────────────────────────────────────────────────────  │
│  [Interactive demo with sample output]                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PRICING                                                │
│  ─────────────────────────────────────────────────────  │
│  10 credits per run                                     │
│                                                         │
│  [Free]          [Creator]        [Pro]                 │
│  KES 0           KES 500          KES 1,500             │
│  15 runs         60 runs          250 runs              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TESTIMONIALS                                           │
│  ─────────────────────────────────────────────────────  │
│  "Brand Kit AI saved me hours..."                       │
│  — Amara, Nairobi musician                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FAQ                                                    │
│  ─────────────────────────────────────────────────────  │
│  + How many credits does one run cost?                  │
│  + Can I edit the generated content?                    │
│  + What if I don't like the results?                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CTA                                                    │
│  ─────────────────────────────────────────────────────  │
│  Ready to build your brand?                             │
│  [Get Started Free →]                                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  Other Tools: Music Bio | Social AI | Sync Pitch | ...  │
│  © 2026 Intermaven | Privacy | Terms                    │
└─────────────────────────────────────────────────────────┘
```

### 6.4 App-Specific Content

Each landing page customizes:
- Hero headline and subheadline
- Feature list
- Demo content
- Testimonials
- FAQ
- Screenshots/examples

### 6.5 Technical Implementation

**Option A: Static Site Generation**
- Build static HTML at deploy time
- Host on CDN (Cloudflare Pages, Vercel)
- Fast load times
- Update via rebuild

**Option B: Dynamic React Routes**
- Single React app with app-specific routes
- Data-driven content from CMS/database
- Easier content updates
- Shared components

**Recommended: Hybrid Approach**
```
Main app: intermaven.io (React SPA)
App pages: [app].intermaven.io (Static, pre-rendered)
```

**DNS/Routing:**
```
*.intermaven.io → App landing pages (Vercel/Cloudflare)
intermaven.io   → Main React app (Current setup)
```

---

## 7. Database Schema Updates

### 7.1 New Collections Summary

```javascript
// Existing
users
notifications
ai_runs
activities
transactions

// New - EPK
epk_profiles
epk_analytics

// New - CRM
contacts
contact_lists
campaigns
campaign_stats
automations
automation_logs

// New - Admin
admin_users
admin_roles
support_tickets
admin_logs
system_settings

// New - Files
files
folders
file_shares
```

### 7.2 Index Recommendations

```javascript
// epk_profiles
db.epk_profiles.createIndex({ user_id: 1 })
db.epk_profiles.createIndex({ username: 1 }, { unique: true })
db.epk_profiles.createIndex({ is_published: 1 })

// contacts
db.contacts.createIndex({ user_id: 1 })
db.contacts.createIndex({ email: 1, user_id: 1 })
db.contacts.createIndex({ tags: 1 })
db.contacts.createIndex({ lists: 1 })
db.contacts.createIndex({ created_at: -1 })

// files
db.files.createIndex({ user_id: 1 })
db.files.createIndex({ folder_id: 1 })
db.files.createIndex({ tags: 1 })
db.files.createIndex({ created_at: -1 })
db.files.createIndex({ deleted_at: 1 })

// support_tickets
db.support_tickets.createIndex({ user_id: 1 })
db.support_tickets.createIndex({ status: 1 })
db.support_tickets.createIndex({ assigned_to: 1 })
db.support_tickets.createIndex({ created_at: -1 })
```

---

## 8. API Endpoints Specification

### 8.1 Complete API Structure

```
/api
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── GET    /me
│   ├── POST   /refresh
│   ├── POST   /forgot-password
│   └── POST   /reset-password
│
├── /user
│   ├── PUT    /profile
│   ├── POST   /apps/toggle
│   ├── GET    /stats
│   └── PUT    /settings
│
├── /ai
│   └── POST   /generate
│
├── /epk
│   ├── POST   /                     # Create EPK
│   ├── GET    /:id                  # Get EPK
│   ├── PUT    /:id                  # Update EPK
│   ├── DELETE /:id                  # Delete EPK
│   ├── POST   /:id/publish          # Toggle publish
│   ├── GET    /:id/analytics        # Get analytics
│   ├── POST   /:id/pdf              # Generate PDF
│   ├── GET    /public/:username     # Public EPK
│   └── GET    /check-username       # Check availability
│
├── /crm
│   ├── /contacts
│   │   ├── GET    /                 # List contacts
│   │   ├── POST   /                 # Create contact
│   │   ├── GET    /:id              # Get contact
│   │   ├── PUT    /:id              # Update contact
│   │   ├── DELETE /:id              # Delete contact
│   │   ├── POST   /import           # Bulk import
│   │   └── POST   /export           # Export
│   │
│   ├── /lists
│   │   ├── GET    /                 # List all lists
│   │   ├── POST   /                 # Create list
│   │   ├── PUT    /:id              # Update list
│   │   ├── DELETE /:id              # Delete list
│   │   └── POST   /:id/contacts     # Add/remove contacts
│   │
│   ├── /campaigns
│   │   ├── GET    /                 # List campaigns
│   │   ├── POST   /                 # Create campaign
│   │   ├── GET    /:id              # Get campaign
│   │   ├── PUT    /:id              # Update campaign
│   │   ├── DELETE /:id              # Delete campaign
│   │   ├── POST   /:id/send         # Send campaign
│   │   └── GET    /:id/stats        # Get stats
│   │
│   └── /automations
│       ├── GET    /                 # List automations
│       ├── POST   /                 # Create
│       ├── PUT    /:id              # Update
│       ├── DELETE /:id              # Delete
│       └── POST   /:id/toggle       # Enable/disable
│
├── /files
│   ├── GET    /                     # List files
│   ├── POST   /upload-url           # Get presigned URL
│   ├── POST   /                     # Create file record
│   ├── GET    /:id                  # Get file
│   ├── PUT    /:id                  # Update file
│   ├── DELETE /:id                  # Soft delete
│   ├── POST   /:id/restore          # Restore
│   ├── DELETE /:id/permanent        # Hard delete
│   ├── GET    /:id/download         # Download URL
│   ├── POST   /:id/share            # Share settings
│   ├── GET    /search               # Search
│   ├── GET    /recent               # Recent files
│   ├── GET    /favorites            # Favorites
│   └── GET    /trash                # Trash
│
├── /folders
│   ├── GET    /                     # List folders
│   ├── POST   /                     # Create folder
│   ├── PUT    /:id                  # Update folder
│   ├── DELETE /:id                  # Delete folder
│   └── POST   /:id/move             # Move folder
│
├── /notifications
│   ├── GET    /                     # Get notifications
│   └── POST   /mark-read            # Mark as read
│
├── /payments
│   ├── POST   /initiate             # Start payment
│   ├── POST   /callback             # Pesapal callback
│   └── GET    /transactions         # Get transactions
│
├── /admin (requires admin role)
│   ├── /users
│   │   ├── GET    /                 # List users
│   │   ├── GET    /:id              # User details
│   │   ├── PUT    /:id              # Update user
│   │   ├── DELETE /:id              # Delete user
│   │   ├── POST   /:id/impersonate  # Login as user
│   │   ├── POST   /:id/credits      # Adjust credits
│   │   └── POST   /:id/notes        # Add note
│   │
│   ├── /analytics
│   │   ├── GET    /overview         # Dashboard
│   │   ├── GET    /users            # User stats
│   │   ├── GET    /revenue          # Revenue stats
│   │   └── GET    /usage            # Feature usage
│   │
│   ├── /tickets
│   │   ├── GET    /                 # List tickets
│   │   ├── GET    /:id              # Get ticket
│   │   ├── PUT    /:id              # Update ticket
│   │   ├── POST   /:id/reply        # Reply
│   │   └── POST   /:id/assign       # Assign
│   │
│   └── /settings
│       ├── GET    /                 # Get settings
│       └── PUT    /                 # Update settings
│
└── /public
    ├── GET    /epk/:username        # Public EPK page
    └── POST   /epk/:username/contact # EPK contact form
```

---

## 9. Infrastructure Requirements

### 9.1 Current Infrastructure
- **Backend:** FastAPI on single container
- **Frontend:** React SPA
- **Database:** MongoDB (single instance)
- **Storage:** Local filesystem

### 9.2 Production Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                        │
│                   (Cloudflare/AWS)                      │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Frontend    │  │    Backend    │  │  Admin Panel  │
│   (Vercel)    │  │   (Railway)   │  │   (Vercel)    │
└───────────────┘  └───────────────┘  └───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   MongoDB     │  │     Redis     │  │   S3/R2       │
│   (Atlas)     │  │   (Upstash)   │  │   Storage     │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 9.3 Services Required

| Service | Provider Options | Purpose |
|---------|-----------------|---------|
| Database | MongoDB Atlas | Primary database |
| Cache | Redis (Upstash) | Sessions, rate limiting, queues |
| Storage | AWS S3, Cloudflare R2 | File storage |
| Email | Resend, SendGrid | Transactional & marketing emails |
| SMS | Twilio, Africa's Talking | SMS notifications |
| WhatsApp | Twilio, WhatsApp Business API | WhatsApp messaging |
| CDN | Cloudflare | Asset delivery, DDoS protection |
| Monitoring | Sentry, LogRocket | Error tracking, session replay |
| Analytics | PostHog, Mixpanel | Product analytics |
| Payments | Pesapal | M-Pesa, cards |
| PDF Generation | Puppeteer, WeasyPrint | EPK PDF export |

### 9.4 Scaling Considerations

**Database:**
- MongoDB Atlas M10+ for production
- Read replicas for analytics queries
- Sharding for files/analytics collections

**Backend:**
- Horizontal scaling (multiple containers)
- Background job queue (Celery/RQ with Redis)
- Rate limiting per user/IP

**Storage:**
- CDN for public files
- Presigned URLs for private files
- Lifecycle policies for old versions

---

## 10. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Core infrastructure and EPK MVP

**Tasks:**
- [ ] Set up production infrastructure (MongoDB Atlas, S3)
- [ ] Implement file upload system (presigned URLs)
- [ ] Create EPK data model and API endpoints
- [ ] Build EPK builder UI (basic sections)
- [ ] Implement public EPK page rendering
- [ ] Add EPK PDF generation

**Deliverables:**
- Users can create and publish basic EPKs
- Files can be uploaded and used in EPKs
- PDF export works

### Phase 2: File Management (Weeks 5-6)
**Goal:** Complete file manager

**Tasks:**
- [ ] Build file manager UI (folders, upload, preview)
- [ ] Implement file search and filtering
- [ ] Add sharing functionality
- [ ] Implement storage quotas by plan
- [ ] Add version history

**Deliverables:**
- Full Google Drive-like file management
- Files integrate with EPK and AI tools

### Phase 3: CRM Foundation (Weeks 7-10)
**Goal:** Contact management and basic email

**Tasks:**
- [ ] Create contact management system
- [ ] Build contact import/export
- [ ] Implement contact lists and tags
- [ ] Integrate Resend/SendGrid for email
- [ ] Build email campaign editor
- [ ] Add email templates

**Deliverables:**
- Users can manage contacts
- Users can send email campaigns
- Basic open/click tracking

### Phase 4: Advanced Communication (Weeks 11-14)
**Goal:** Multi-channel communication

**Tasks:**
- [ ] Integrate Twilio for SMS
- [ ] Integrate WhatsApp Business API
- [ ] Build automation workflow builder
- [ ] Implement trigger-based automations
- [ ] Add communication analytics

**Deliverables:**
- SMS and WhatsApp campaigns
- Automated communication workflows

### Phase 5: Admin System (Weeks 15-18)
**Goal:** Complete admin panel

**Tasks:**
- [ ] Build admin authentication (separate from users)
- [ ] Create user management dashboard
- [ ] Implement support ticket system
- [ ] Build analytics dashboards
- [ ] Add audit logging

**Deliverables:**
- Full admin panel for user management
- Support ticket handling
- Business analytics

### Phase 6: App Landing Pages (Weeks 19-20)
**Goal:** Individual app marketing pages

**Tasks:**
- [ ] Design landing page template
- [ ] Create content for each app
- [ ] Set up subdomains/routing
- [ ] Implement demo/preview features
- [ ] Add testimonials and social proof

**Deliverables:**
- Each app has dedicated landing page
- SEO-optimized marketing pages

### Phase 7: Polish & Launch (Weeks 21-24)
**Goal:** Production readiness

**Tasks:**
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Beta user testing
- [ ] Bug fixes
- [ ] Launch preparation

**Deliverables:**
- Production-ready platform
- Documentation for users and developers
- Marketing materials

---

## Appendix A: Technology Stack Summary

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 18 | Main application |
| UI Components | Shadcn/UI, Tailwind CSS | Consistent design system |
| State Management | React Context + hooks | Simple state needs |
| Backend | FastAPI (Python 3.11+) | Async, high performance |
| Database | MongoDB 7.0 | Document store |
| Cache | Redis | Sessions, queues |
| Storage | AWS S3 / Cloudflare R2 | File storage |
| Email | Resend | Transactional email |
| SMS | Twilio / Africa's Talking | SMS delivery |
| WhatsApp | Twilio WhatsApp API | Messaging |
| Payments | Pesapal | M-Pesa + Cards |
| AI | Claude (Anthropic) | Via Emergent LLM Key |
| PDF | Puppeteer / WeasyPrint | EPK export |
| Hosting | Vercel (FE) + Railway (BE) | Scalable hosting |
| CDN | Cloudflare | Global delivery |
| Monitoring | Sentry | Error tracking |
| Analytics | PostHog | Product analytics |

---

## Appendix B: Cost Estimates

### Monthly Infrastructure Costs (Estimated)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| MongoDB Atlas | M10 | $60 |
| Redis (Upstash) | Pay-as-you-go | $10-30 |
| S3/R2 Storage | 100GB | $5-15 |
| Resend | Pro | $20 |
| Twilio | Pay-as-you-go | $50-100 |
| Railway (Backend) | Pro | $20 |
| Vercel (Frontend) | Pro | $20 |
| Cloudflare | Pro | $20 |
| Sentry | Team | $26 |
| PostHog | Growth | $0-50 |

**Estimated Total:** $230-360/month for production

---

## Appendix C: Security Considerations

1. **Authentication:**
   - JWT with short expiry (15 min access, 7 day refresh)
   - Rate limiting on auth endpoints
   - Account lockout after failed attempts

2. **Authorization:**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API key authentication for integrations

3. **Data Protection:**
   - Encryption at rest (MongoDB, S3)
   - Encryption in transit (TLS 1.3)
   - PII data handling compliance

4. **File Security:**
   - Presigned URLs with expiry
   - Malware scanning on upload
   - File type validation

5. **Admin Security:**
   - Separate admin authentication
   - IP whitelisting option
   - Audit logging for all actions

---

*Document Version: 1.0*  
*Last Updated: March 24, 2026*  
*Author: Intermaven Development Team*
