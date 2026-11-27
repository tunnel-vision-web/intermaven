"""
Default CMS keys for the Mother-CMS.
Idempotent — inserts missing keys and backfills missing portal defaults without overwriting admin edits.
"""
from datetime import datetime, timezone
from config import db


DEFAULT_CMS_KEYS = [
    # ============== HOMEPAGE HERO SLIDE 1 ==============
    {
        "_id": "homepage.hero.slide1.badge",
        "description": "Slide 1 Top Badge on Homepage Hero.",
        "default": "Now live - AI tools for Africa & Beyond",
        "regions": {"US": "Now live - Global AI OS for Creatives & SMEs"},
        "portals": {
            "business": {"default": "Business tools for Nairobi SMEs & Agencies", "US": "Business tools for modern SMEs & Agencies"},
            "music": {"default": "Now live - AI tools for Artists & Labels", "US": "Now live - Global AI OS for Independent Artists"},
            "hospitality": {"default": "Hospitality OS for Restaurants, Lounges & Hotels", "US": "Hospitality OS for Modern Venues & Hotels"},
        },
    },
    {
        "_id": "homepage.hero.slide1.title",
        "description": "Slide 1 Headline Title on Homepage Hero.",
        "default": 'Build your brand.<br/><em style="color:#c084fc">Grow your career.</em>',
        "regions": {},
        "portals": {
            "business": {"default": 'Run your business.<br/><em style="color:#22d3ee">Smarter every day.</em>'},
            "music": {"default": 'Build your sound.<br/><em style="color:#c084fc">Own your music career.</em>'},
            "hospitality": {"default": 'Run your venue.<br/><em style="color:#f59e0b">Delight every guest.</em>'},
        },
    },
    {
        "_id": "homepage.hero.slide1.subtitle",
        "description": "Slide 1 Subtitle Paragraph on Homepage Hero.",
        "default": "Intermaven gives musicians, creators, and entrepreneurs the AI tools to brand, market, and scale.",
        "regions": {},
        "portals": {
            "business": {"default": "Intermaven Business gives entrepreneurs AI and operational tools — Smart CRM, invoicing, contracts, and POS — to manage, market, and scale."},
            "music": {"default": "TuneMavens & Intermaven Music give independent artists, DJs, and labels the AI tools to release, pitch, and monetize globally."},
            "hospitality": {"default": "Intermaven Hospitality powers restaurants, bars, lounges, and boutique hotels with table-side POS, VIP bookings, and AI guest marketing."},
        },
    },
    {
        "_id": "homepage.hero.slide1.b1",
        "description": "Slide 1 Primary CTA Button Label.",
        "default": "Try AI tools free",
        "regions": {},
        "portals": {
            "business": {"default": "Explore business tools"},
            "music": {"default": "Launch artist studio"},
            "hospitality": {"default": "Launch venue POS"},
        },
    },
    {
        "_id": "homepage.hero.slide1.b1link",
        "description": "Slide 1 Primary CTA Link.",
        "default": "/tools",
        "regions": {},
        "portals": {
            "business": {"default": "/tools"},
            "music": {"default": "/tools"},
            "hospitality": {"default": "/apps"},
        },
    },
    {
        "_id": "homepage.hero.slide1.b2",
        "description": "Slide 1 Secondary CTA Button Label.",
        "default": "See pricing",
        "regions": {},
        "portals": {
            "business": {"default": "See business plans"},
            "music": {"default": "Artist plans"},
            "hospitality": {"default": "Book venue demo"},
        },
    },
    {
        "_id": "homepage.hero.slide1.b2link",
        "description": "Slide 1 Secondary CTA Link.",
        "default": "/pricing",
        "regions": {},
        "portals": {
            "business": {"default": "/pricing"},
            "music": {"default": "/pricing"},
            "hospitality": {"default": "/pricing"},
        },
    },
    {
        "_id": "homepage.hero.slide1.image",
        "description": "Slide 1 Hero Background Image URL.",
        "default": "/images/hero/intermaven/hero-1.jpg",
        "regions": {},
        "portals": {
            "business": {"default": "/images/hero/intermaven/hero-1.jpg"},
            "music": {"default": "/images/hero/intermavenmusic/hero-1.jpg"},
            "hospitality": {"default": "/images/hero/intermaven/hero-2.jpg"},
        },
    },

    # ============== HOMEPAGE HERO SLIDE 2 ==============
    {
        "_id": "homepage.hero.slide2.badge",
        "description": "Slide 2 Top Badge on Homepage Hero.",
        "default": "For musicians & artists",
        "regions": {},
        "portals": {
            "business": {"default": "M-Pesa & Card native payments", "US": "Card, ACH & Wallet native payments"},
            "music": {"default": "For musicians, DJs & record labels"},
            "hospitality": {"default": "Table-side M-Pesa & Tab Management", "US": "Table-side Tap-to-Pay & Tab Management"},
        },
    },
    {
        "_id": "homepage.hero.slide2.title",
        "description": "Slide 2 Headline Title on Homepage Hero.",
        "default": 'Your music.<br/><em style="color:#22d3ee">The world\'s stage.</em>',
        "regions": {},
        "portals": {
            "business": {"default": 'Payments & invoicing<br/><em style="color:#10b981">built for growth.</em>'},
            "music": {"default": 'Your music.<br/><em style="color:#22d3ee">The world\'s stage.</em>'},
            "hospitality": {"default": 'Faster table turns.<br/><em style="color:#10b981">Zero bill friction.</em>'},
        },
    },
    {
        "_id": "homepage.hero.slide2.subtitle",
        "description": "Slide 2 Subtitle Paragraph on Homepage Hero.",
        "default": "From a polished press kit to a Hollywood sync pitch - our AI tools help creators break through globally.",
        "regions": {},
        "portals": {
            "business": {"default": "Every billing tool on Intermaven Business works seamlessly with M-Pesa, Visa, Mastercard, and automated client invoices."},
            "music": {"default": "From an interactive EPK to Hollywood sync pitches and global DSP distribution tracking — break through worldwide."},
            "hospitality": {"default": "Split tabs, kitchen & bar routing, QR digital menus, and instant M-Pesa STK or card settlement from any tablet."},
        },
    },
    {
        "_id": "homepage.hero.slide2.b1",
        "description": "Slide 2 Primary CTA Button Label.",
        "default": "Write my press kit",
        "regions": {},
        "portals": {
            "business": {"default": "Explore POS & Invoicing"},
            "music": {"default": "Build my EPK"},
            "hospitality": {"default": "Explore Hospitality POS"},
        },
    },
    {
        "_id": "homepage.hero.slide2.b1link",
        "description": "Slide 2 Primary CTA Link.",
        "default": "/tools",
        "regions": {},
        "portals": {
            "business": {"default": "/apps"},
            "music": {"default": "/apps"},
            "hospitality": {"default": "/apps"},
        },
    },
    {
        "_id": "homepage.hero.slide2.b2",
        "description": "Slide 2 Secondary CTA Button Label.",
        "default": "See all apps",
        "regions": {},
        "portals": {
            "business": {"default": "Learn more"},
            "music": {"default": "Distribution tracker"},
            "hospitality": {"default": "See venue features"},
        },
    },
    {
        "_id": "homepage.hero.slide2.b2link",
        "description": "Slide 2 Secondary CTA Link.",
        "default": "/apps",
        "regions": {},
        "portals": {
            "business": {"default": "/about"},
            "music": {"default": "/apps"},
            "hospitality": {"default": "/about"},
        },
    },
    {
        "_id": "homepage.hero.slide2.image",
        "description": "Slide 2 Hero Background Image URL.",
        "default": "/images/hero/intermaven/hero-2.jpg",
        "regions": {},
        "portals": {
            "business": {"default": "/images/hero/intermaven/hero-2.jpg"},
            "music": {"default": "/images/hero/intermavenmusic/hero-2.jpg"},
            "hospitality": {"default": "/images/hero/intermaven/hero-3.jpg"},
        },
    },

    # ============== HOMEPAGE HERO SLIDE 3 ==============
    {
        "_id": "homepage.hero.slide3.badge",
        "description": "Slide 3 Top Badge on Homepage Hero.",
        "default": "For creative brands & SMEs",
        "regions": {},
        "portals": {
            "business": {"default": "AI marketing & client CRM"},
            "music": {"default": "Sync licensing, lyrics & tours"},
            "hospitality": {"default": "VIP Reservations, Events & Nightlife"},
        },
    },
    {
        "_id": "homepage.hero.slide3.title",
        "description": "Slide 3 Headline Title on Homepage Hero.",
        "default": 'Brand it right.<br/><em style="color:#f59e0b">From day one.</em>',
        "regions": {},
        "portals": {
            "business": {"default": 'Brand your business.<br/><em style="color:#f59e0b">Win more clients.</em>'},
            "music": {"default": 'Book bigger tours.<br/><em style="color:#f59e0b">Land sync deals.</em>'},
            "hospitality": {"default": 'Pack every night.<br/><em style="color:#f59e0b">Own your guest list.</em>'},
        },
    },
    {
        "_id": "homepage.hero.slide3.subtitle",
        "description": "Slide 3 Subtitle Paragraph on Homepage Hero.",
        "default": "Whether you are an artist, studio, or business owner - generate your full brand kit in seconds.",
        "regions": {},
        "portals": {
            "business": {"default": "AI brand kits, legally structured business contracts, Smart CRM campaigns, and scheduled social content for modern teams."},
            "music": {"default": "Manage tour routing, VIP guest lists on the TuneMavens Events Network, royalty splits, and AI lyric hooks in one studio."},
            "hospitality": {"default": "Manage table bookings, bottle-service VIP RSVPs, resident DJ lineups, and automated WhatsApp/email guest retention."},
        },
    },
    {
        "_id": "homepage.hero.slide3.b1",
        "description": "Slide 3 Primary CTA Button Label.",
        "default": "Generate brand kit",
        "regions": {},
        "portals": {
            "business": {"default": "Generate brand kit"},
            "music": {"default": "Plan my tour"},
            "hospitality": {"default": "Manage VIP & events"},
        },
    },
    {
        "_id": "homepage.hero.slide3.b1link",
        "description": "Slide 3 Primary CTA Link.",
        "default": "/tools",
        "regions": {},
        "portals": {
            "business": {"default": "/tools"},
            "music": {"default": "/apps"},
            "hospitality": {"default": "/apps"},
        },
    },
    {
        "_id": "homepage.hero.slide3.b2",
        "description": "Slide 3 Secondary CTA Button Label.",
        "default": "Explore apps",
        "regions": {},
        "portals": {
            "business": {"default": "Contract builder"},
            "music": {"default": "Royalty calculator"},
            "hospitality": {"default": "Hospitality CRM"},
        },
    },
    {
        "_id": "homepage.hero.slide3.b2link",
        "description": "Slide 3 Secondary CTA Link.",
        "default": "/apps",
        "regions": {},
        "portals": {
            "business": {"default": "/apps"},
            "music": {"default": "/apps"},
            "hospitality": {"default": "/smartcrm"},
        },
    },
    {
        "_id": "homepage.hero.slide3.image",
        "description": "Slide 3 Hero Background Image URL.",
        "default": "/images/hero/intermaven/hero-3.jpg",
        "regions": {},
        "portals": {
            "business": {"default": "/images/hero/intermaven/hero-3.jpg"},
            "music": {"default": "/images/hero/intermavenmusic/hero-3.jpg"},
            "hospitality": {"default": "/images/hero/intermaven/hero-1.jpg"},
        },
    },

    # ============== HOMEPAGE HERO SLIDE 4 ==============
    {
        "_id": "homepage.hero.slide4.badge",
        "description": "Slide 4 Top Badge on Homepage Hero.",
        "default": "Music & Creative marketplace",
        "regions": {},
        "portals": {
            "business": {"default": "The Business App Marketplace"},
            "music": {"default": "TuneMavens Music Ecosystem"},
            "hospitality": {"default": "Connected Venue Ecosystem"},
        },
    },
    {
        "_id": "homepage.hero.slide4.title",
        "description": "Slide 4 Headline Title on Homepage Hero.",
        "default": 'One platform.<br/><em style="color:#10b981">Every creative tool.</em>',
        "regions": {},
        "portals": {
            "business": {"default": 'One platform.<br/><em style="color:#22d3ee">Every business tool.</em>'},
            "music": {"default": 'One login.<br/><em style="color:#c084fc">Every music platform.</em>'},
            "hospitality": {"default": 'One system.<br/><em style="color:#10b981">Front house to back office.</em>'},
        },
    },
    {
        "_id": "homepage.hero.slide4.subtitle",
        "description": "Slide 4 Subtitle Paragraph on Homepage Hero.",
        "default": "A growing ecosystem of apps built for artists, labels, and creatives across Africa and the diaspora.",
        "regions": {},
        "portals": {
            "business": {"default": "POS, invoicing, contracts, Smart CRM, content calendar, grant finder, and AI — unified under one business account."},
            "music": {"default": "Single sign-on across Intermaven, TuneMavens, TuneStream, and SyncMavens — built for artists, producers, and labels."},
            "hospitality": {"default": "Connect POS inventory, staff shifts, vendor invoices, live entertainment calendars, and social promos in one hub."},
        },
    },
    {
        "_id": "homepage.hero.slide4.b1",
        "description": "Slide 4 Primary CTA Button Label.",
        "default": "Explore marketplace",
        "regions": {},
        "portals": {
            "business": {"default": "Explore business apps"},
            "music": {"default": "Explore music apps"},
            "hospitality": {"default": "Explore venue apps"},
        },
    },
    {
        "_id": "homepage.hero.slide4.b1link",
        "description": "Slide 4 Primary CTA Link.",
        "default": "/apps",
        "regions": {},
        "portals": {
            "business": {"default": "/apps"},
            "music": {"default": "/apps"},
            "hospitality": {"default": "/apps"},
        },
    },
    {
        "_id": "homepage.hero.slide4.b2",
        "description": "Slide 4 Secondary CTA Button Label.",
        "default": "Our story",
        "regions": {},
        "portals": {
            "business": {"default": "Our story"},
            "music": {"default": "About TuneMavens"},
            "hospitality": {"default": "Talk to sales"},
        },
    },
    {
        "_id": "homepage.hero.slide4.b2link",
        "description": "Slide 4 Secondary CTA Link.",
        "default": "/about",
        "regions": {},
        "portals": {
            "business": {"default": "/about"},
            "music": {"default": "/about"},
            "hospitality": {"default": "/about"},
        },
    },
    {
        "_id": "homepage.hero.slide4.image",
        "description": "Slide 4 Hero Background Image URL.",
        "default": "/images/hero/intermaven/hero-1.jpg",
        "regions": {},
        "portals": {
            "business": {"default": "/images/hero/intermaven/hero-1.jpg"},
            "music": {"default": "/images/hero/intermavenmusic/hero-1.jpg"},
            "hospitality": {"default": "/images/hero/intermaven/hero-2.jpg"},
        },
    },

    # ============== HOMEPAGE CALLOUTS & LEGACY HERO KEYS ==============
    {
        "_id": "homepage.features.title",
        "description": "Features Section Title on Homepage.",
        "default": "AI tools for every stage of your creative career",
        "regions": {},
        "portals": {
            "business": {"default": "AI and operational tools for modern businesses"},
            "music": {"default": "AI studio & release tools for every stage of your music career"},
            "hospitality": {"default": "POS, reservations, and AI marketing for hospitality venues"},
        },
    },
    {
        "_id": "homepage.marketplace.title",
        "description": "App Marketplace Title on Homepage.",
        "default": "Music & Creative App Marketplace",
        "regions": {},
        "portals": {
            "business": {"default": "Business App Marketplace"},
            "music": {"default": "TuneMavens Music & Creator Marketplace"},
            "hospitality": {"default": "Hospitality & Venue App Suite"},
        },
    },
    {
        "_id": "homepage.marketplace.subtitle",
        "description": "App Marketplace Subtitle on Homepage.",
        "default": "Standalone modules in a growing ecosystem for independent creators and businesses.",
        "regions": {},
        "portals": {
            "business": {"default": "Operational, billing, legal, and AI growth modules built for SMEs, agencies, and founders."},
            "music": {"default": "EPK, DSP distribution, sync pitching, tour routing, and royalty tools for artists and labels."},
            "hospitality": {"default": "Point-of-sale, digital menus, VIP table bookings, event calendars, and guest CRM for venues."},
        },
    },
    {
        "_id": "homepage.hero.title",
        "description": "Main hero headline title on the Homepage.",
        "default": "Build your brand. Grow your career.",
        "regions": {
            "US": "Build your brand. Scale globally.",
            "KE": "Build your brand. Grow your career.",
        },
        "portals": {
            "business": {"default": "Run your business. Smarter every day."},
            "music": {"default": "Build your sound. Own your music career."},
            "hospitality": {"default": "Run your venue. Delight every guest."},
        },
    },
    {
        "_id": "homepage.hero.subtitle",
        "description": "Main hero subtitle paragraph on the Homepage.",
        "default": "Intermaven gives musicians, creators, and entrepreneurs the AI tools to brand, market, and scale — without an agency budget.",
        "regions": {},
        "portals": {
            "business": {"default": "Intermaven Business gives entrepreneurs AI and operational tools to manage, market, and scale."},
            "music": {"default": "Intermaven Music & TuneMavens give artists and labels AI tools to brand, distribute, and tour globally."},
            "hospitality": {"default": "Intermaven Hospitality equips restaurants, lounges, and hotels with modern POS, reservations, and guest marketing."},
        },
    },
    {
        "_id": "homepage.hero.badge",
        "description": "Badge text at top of Homepage hero.",
        "default": "Now live — AI tools for Africa & Beyond",
        "regions": {"US": "Now live — Global AI OS for Creatives"},
        "portals": {
            "business": {"default": "Business tools for SMEs & Creators"},
            "music": {"default": "AI tools for Artists, DJs & Labels"},
            "hospitality": {"default": "Hospitality OS for Venues & Hotels"},
        },
    },

    # ============== FOOTER & CONTACT ==============
    {
        "_id": "footer.contact.phone",
        "description": "Primary contact phone number shown in footer.",
        "default": "+254 700 000 000",
        "regions": {
            "US": "+1 (800) 555-0114",
            "CA": "+1 (800) 555-0114",
            "GB": "+44 800 016 6028",
            "KE": "+254 700 000 000",
            "NG": "+234 800 000 0000",
            "ZA": "+27 800 000 000",
        },
        "portals": {
            "business": {"default": "+254 700 100 200"},
            "music": {"default": "+254 700 300 400"},
            "hospitality": {"default": "+254 700 500 600"},
        },
    },
    {
        "_id": "footer.contact.address",
        "description": "Postal address in footer.",
        "default": "Nairobi, Kenya",
        "regions": {
            "US": "Atlanta, GA · USA",
            "CA": "Atlanta, GA · USA",
            "GB": "London · UK",
            "KE": "Nairobi, Kenya",
            "NG": "Lagos, Nigeria",
            "ZA": "Johannesburg, South Africa",
        },
        "portals": {
            "business": {"default": "Westlands Commercial Hub · Nairobi, Kenya"},
            "music": {"default": "Kilimani Creative Studios · Nairobi, Kenya"},
            "hospitality": {"default": "Riverside Hospitality Suite · Nairobi, Kenya"},
        },
    },
    {
        "_id": "footer.tagline",
        "description": "Tagline shown above footer columns.",
        "default": "Made with ❤ in Nairobi",
        "regions": {
            "US": "Made with ❤ for creators worldwide",
            "CA": "Made with ❤ for creators worldwide",
            "GB": "Made with ❤ for creators worldwide",
        },
        "portals": {
            "business": {"default": "Powering ambitious SMEs & founders across Africa & beyond"},
            "music": {"default": "Built for independent artists, DJs & labels worldwide"},
            "hospitality": {"default": "Crafted for restaurants, lounges, hotels & live venues"},
        },
    },

    # ============== PAYMENT / PRICING ==============
    {
        "_id": "pricing.header",
        "description": "Header title of Pricing page.",
        "default": "Simple, Transparent Pricing",
        "regions": {},
        "portals": {
            "business": {"default": "Business Plans That Scale With Your Team"},
            "music": {"default": "Creator & Label Plans Built for Releases"},
            "hospitality": {"default": "Venue & Multi-Branch Hospitality Pricing"},
        },
    },
    {
        "_id": "pricing.subtitle",
        "description": "Subtitle of Pricing page.",
        "default": "Choose the plan that fits your stage of growth. Upgrade or downgrade anytime.",
        "regions": {},
        "portals": {
            "business": {"default": "Start free with AI branding and Smart CRM, then unlock unlimited invoicing, POS, and team seats."},
            "music": {"default": "Start with 150 free studio credits. Upgrade for unlimited EPKs, DSP distribution tracking, and sync pitches."},
            "hospitality": {"default": "Transparent per-venue pricing with unlimited POS terminals, M-Pesa STK push, and VIP booking tools."},
        },
    },
    {
        "_id": "pricing.callout.title",
        "description": "Pricing-page payment callout title.",
        "default": "Pay instantly with M-Pesa",
        "regions": {
            "US": "Pay instantly with Venmo, Cash App, or Zelle",
            "CA": "Pay instantly with PayPal or Card",
            "GB": "Pay instantly with PayPal or Card",
        },
        "portals": {
            "business": {"default": "Instant M-Pesa Till, Paybill & Corporate Card Billing", "US": "Instant Card, ACH & Corporate Billing"},
            "music": {"default": "Top up studio credits instantly via M-Pesa or Card", "US": "Top up studio credits instantly via Card, Venmo, or Cash App"},
            "hospitality": {"default": "Zero-downtime M-Pesa & Card settlement for venues", "US": "Zero-downtime Card & Tap-to-Pay settlement for venues"},
        },
    },
    {
        "_id": "pricing.callout.body",
        "description": "Pricing-page payment callout body.",
        "default": "Send to Paybill 522900. Credits load the moment your payment confirms — no waiting, no approval.",
        "regions": {
            "US": "Transfer directly to our handle @intermaven. Credits load the moment your payment confirms — no waiting, no approval.",
            "CA": "Pay via PayPal or Card. Credits load the moment your payment confirms.",
            "GB": "Pay via PayPal or Card. Credits load the moment your payment confirms.",
        },
        "portals": {
            "business": {"default": "Pay via Paybill 522900 or Visa/Mastercard. Tax-compliant receipts and team credits activate immediately."},
            "music": {"default": "Send to Paybill 522900 or pay by card — your AI credits and distribution slots unlock in seconds."},
            "hospitality": {"default": "Activate POS registers and hospitality modules instantly via Paybill 522900 or corporate card."},
        },
    },
    {
        "_id": "pricing.payment_methods",
        "description": "Comma-separated list of payment methods shown on plan cards.",
        "default": "M-Pesa, Visa, Mastercard, PayPal",
        "regions": {
            "US": "Venmo, Cash App, Zelle, Card, PayPal",
            "CA": "Card, PayPal",
            "GB": "Card, PayPal",
        },
        "portals": {
            "business": {"default": "M-Pesa Paybill, Pesapal, Visa, Mastercard, Bank EFT"},
            "music": {"default": "M-Pesa, Visa, Mastercard, PayPal"},
            "hospitality": {"default": "M-Pesa Till/Paybill, Visa, Mastercard, Corporate Invoice"},
        },
    },

    # ============== SOCIAL HANDLES ==============
    {
        "_id": "social.instagram",
        "description": "Intermaven Instagram URL.",
        "default": "https://instagram.com/intermaven",
        "regions": {},
        "portals": {
            "business": {"default": "https://instagram.com/intermavenbusiness"},
            "music": {"default": "https://instagram.com/tunemavens"},
            "hospitality": {"default": "https://instagram.com/intermavenhospitality"},
        },
    },
    {
        "_id": "social.tiktok",
        "description": "Intermaven TikTok URL.",
        "default": "https://tiktok.com/@intermaven",
        "regions": {},
        "portals": {
            "business": {"default": "https://tiktok.com/@intermaven"},
            "music": {"default": "https://tiktok.com/@tunemavens"},
            "hospitality": {"default": "https://tiktok.com/@intermavenhospitality"},
        },
    },
    {
        "_id": "social.x",
        "description": "Intermaven X (Twitter) URL.",
        "default": "https://x.com/intermaven",
        "regions": {},
        "portals": {
            "business": {"default": "https://x.com/intermaven"},
            "music": {"default": "https://x.com/tunemavens"},
            "hospitality": {"default": "https://x.com/intermavenhosp"},
        },
    },
    {
        "_id": "social.linkedin",
        "description": "Intermaven LinkedIn URL.",
        "default": "https://linkedin.com/company/intermaven",
        "regions": {},
        "portals": {
            "business": {"default": "https://linkedin.com/company/intermaven"},
            "music": {"default": "https://linkedin.com/company/tunemavens"},
            "hospitality": {"default": "https://linkedin.com/company/intermaven-hospitality"},
        },
    },
    {"_id": "social.youtube", "description": "Intermaven YouTube URL.", "default": "https://youtube.com/@intermaven", "regions": {}, "portals": {"music": {"default": "https://youtube.com/@tunemavens"}}},
    {"_id": "social.facebook", "description": "Intermaven Facebook URL.", "default": "https://facebook.com/intermaven", "regions": {}, "portals": {"music": {"default": "https://facebook.com/tunemavens"}}},

    # ============== ABOUT PAGE ==============
    {
        "_id": "about.phone_label",
        "description": "Label shown above phone number on About page.",
        "default": "WHATSAPP",
        "regions": {"US": "PHONE", "CA": "PHONE", "GB": "PHONE"},
        "portals": {
            "business": {"default": "BUSINESS DESK / WHATSAPP"},
            "music": {"default": "ARTIST RELATIONS / WHATSAPP"},
            "hospitality": {"default": "24/7 VENUE SUPPORT"},
        },
    },
    {
        "_id": "about.business_hours",
        "description": "Business hours line on About page.",
        "default": "Mon–Fri, 9am–5pm EAT",
        "regions": {
            "US": "Mon–Fri, 9am–5pm ET",
            "CA": "Mon–Fri, 9am–5pm ET",
            "GB": "Mon–Fri, 9am–5pm GMT",
        },
        "portals": {
            "business": {"default": "Mon–Fri, 8am–6pm EAT"},
            "music": {"default": "Mon–Sat, 10am–7pm EAT"},
            "hospitality": {"default": "24/7 Live Venue Support · EAT"},
        },
    },
    {
        "_id": "about.description",
        "description": "Tagline paragraph at the top of the About page.",
        "default": "Intermaven is the complete creative operating system for African musicians, creators, and entrepreneurs. We combine powerful AI tools, smart CRM, professional EPK builder, secure file management, and a full music ecosystem in one beautiful platform.",
        "regions": {},
        "portals": {
            "business": {"default": "Intermaven Business is the operating system for ambitious SMEs, agencies, and founders — combining AI brand building, Smart CRM, legally structured contracts, invoicing, and POS."},
            "music": {"default": "Intermaven Music & TuneMavens empower independent artists, DJs, producers, and labels with AI press kits, global distribution tracking, sync licensing, and tour management."},
            "hospitality": {"default": "Intermaven Hospitality brings unified POS, M-Pesa table payments, VIP guest list management, and AI event marketing to restaurants, lounges, clubs, and boutique hotels."},
        },
    },
    {
        "_id": "about.story_title",
        "description": "Title of the story section on the About page.",
        "default": "Our Story",
        "regions": {},
        "portals": {
            "business": {"default": "Why We Built Intermaven Business"},
            "music": {"default": "The TuneMavens & Intermaven Music Story"},
            "hospitality": {"default": "Reinventing Hospitality Operations"},
        },
    },
    {
        "_id": "about.story_body_1",
        "description": "First paragraph of the story section.",
        "default": "We built Intermaven because creators in Africa deserve world-class tools that understand their unique challenges — from unreliable power and internet to complex payment systems and limited access to global markets.",
        "regions": {},
        "portals": {
            "business": {"default": "Small and medium businesses shouldn't have to stitch together ten expensive overseas SaaS subscriptions that don't support local mobile money, local tax invoices, or regional workflows."},
            "music": {"default": "Independent musicians and labels across Africa and the diaspora deserve direct access to global DSP tracking, Hollywood sync briefs, press-ready EPKs, and transparent royalty splits."},
            "hospitality": {"default": "Great hospitality venues thrive on speed, ambiance, and loyal regulars — yet legacy POS systems remain clunky, offline-hostile, and disconnected from event marketing."},
        },
    },
    {
        "_id": "about.story_body_2",
        "description": "Second paragraph of the story section.",
        "default": "What started as a simple EPK builder in 2024 has grown into a full operating system used by thousands of independent artists, DJs, labels, managers, and creative entrepreneurs across the continent and diaspora.",
        "regions": {},
        "portals": {
            "business": {"default": "Today, Intermaven Business powers retail shops, creative agencies, consultants, and fast-growing startups with AI marketing, automated outreach, contracts, and instant payments."},
            "music": {"default": "Connected natively with TuneMavens, TuneStream, and SyncMavens, our studio suite helps thousands of creators turn raw recordings into sustainable global music careers."},
            "hospitality": {"default": "From Nairobi rooftop lounges to boutique coastal hotels, Intermaven Hospitality connects front-of-house POS, VIP reservations, live DJ programming, and guest CRM in one cloud."},
        },
    },
    {
        "_id": "about.email_label",
        "description": "Label for the email contact card on the About page.",
        "default": "EMAIL US",
        "regions": {},
        "portals": {
            "business": {"default": "BUSINESS & ENTERPRISE"},
            "music": {"default": "ARTIST & LABEL DESK"},
            "hospitality": {"default": "HOSPITALITY ONBOARDING"},
        },
    },
    {
        "_id": "about.email",
        "description": "Contact email address on the About page.",
        "default": "hello@intermaven.io",
        "regions": {},
        "portals": {
            "business": {"default": "business@intermaven.io"},
            "music": {"default": "hello@tunemavens.com"},
            "hospitality": {"default": "hospitality@intermaven.io"},
        },
    },
    {
        "_id": "about.based_in",
        "description": "Location description shown on the About page.",
        "default": "Nairobi, Kenya",
        "regions": {
            "US": "Atlanta, USA · Nairobi, Kenya",
            "CA": "Atlanta, USA · Nairobi, Kenya",
            "GB": "London, UK · Nairobi, Kenya",
        },
        "portals": {
            "business": {"default": "Nairobi, Kenya · Atlanta, USA"},
            "music": {"default": "Nairobi · Lagos · Johannesburg · Atlanta"},
            "hospitality": {"default": "Nairobi · Mombasa · Kigali"},
        },
    },

    # ============== AI TOOLS PAGE ==============
    {
        "_id": "tools.header",
        "description": "Main title heading of the AI Creative Tools page.",
        "default": "AI Creative Studio",
        "regions": {},
        "portals": {
            "business": {"default": "AI Business & Marketing Studio"},
            "music": {"default": "AI Music, Bio & Sync Studio"},
            "hospitality": {"default": "AI Hospitality Menu, Promo & Guest Studio"},
            "djs": {"default": "Tools for DJs and promoters"},
            "labels": {"default": "Tools for labels and A&R teams"},
            "producers": {"default": "Tools for producers and studios"},
            "mediahouses": {"default": "Tools for media houses and brand teams"},
        },
    },
    {
        "_id": "tools.subtitle",
        "description": "Sub-title text of the AI Creative Tools page.",
        "default": "Generate brand and music assets powered by AI",
        "regions": {},
        "portals": {
            "business": {"default": "Generate SME brand kits, client proposals, press releases, and scheduled social campaigns in seconds."},
            "music": {"default": "Write press-ready artist bios, sync licensing pitches, lyric hooks, merch briefs, and release press kits."},
            "hospitality": {"default": "Craft irresistible menu descriptions, weekend event promos, VIP invite copy, and hospitality brand kits."},
            "djs": {"default": "Create show promos, lineups, and bookings with AI-ready branding."},
            "labels": {"default": "Write artist bios, release plans, and pitch decks that help you sign and promote talent."},
            "producers": {"default": "Build your portfolio, pitch beats, and promote sessions with professional content."},
            "mediahouses": {"default": "Build music campaigns, licensing briefs, and curated playlists with ease."},
        },
    },
    {
        "_id": "tools.cta",
        "description": "Call to action button text on the Tools page.",
        "default": "Start free →",
        "regions": {},
        "portals": {
            "business": {"default": "Launch Business AI free →"},
            "music": {"default": "Launch Artist Studio free →"},
            "hospitality": {"default": "Try Venue AI free →"},
            "djs": {"default": "Join the movement →"},
            "labels": {"default": "Start label tools →"},
            "producers": {"default": "Create your demo pack →"},
            "mediahouses": {"default": "Explore media tools →"},
        },
    },
    {
        "_id": "tools.cta_desc",
        "description": "Description note below the sign-up call to action on the Tools page.",
        "default": "Create a free account to access all AI tools with 150 free credits. No credit card required.",
        "regions": {},
        "portals": {
            "business": {"default": "Open a free business workspace with 150 AI credits for branding, contracts, and social campaigns."},
            "music": {"default": "Create your free artist account with 150 credits for bios, sync pitches, hooks, and EPK copy."},
            "hospitality": {"default": "Start free with 150 AI credits to promote your restaurant, lounge, hotel, or upcoming event night."},
            "djs": {"default": "Sign up and turn every set into a branded experience for promoters, venues, and fans."},
            "labels": {"default": "Create an account and get label-ready assets for press, sync, and promotion."},
            "producers": {"default": "Sign up to generate polished producer profiles, sync pitches, and social assets."},
            "mediahouses": {"default": "Sign up to streamline broadcast reporting, artist EPKs, and media kits."},
        },
    },

    # ============== APPS MARKETPLACE, HELP & FORUM ==============
    {
        "_id": "apps.header",
        "description": "Header title of Apps Marketplace page.",
        "default": "App Marketplace",
        "regions": {},
        "portals": {
            "business": {"default": "Business App Marketplace"},
            "music": {"default": "Music & Creator App Marketplace"},
            "hospitality": {"default": "Hospitality & Venue App Marketplace"},
        },
    },
    {
        "_id": "apps.subtitle",
        "description": "Subtitle description of Apps Marketplace page.",
        "default": "Modular applications designed for music creators, managers, and business owners.",
        "regions": {},
        "portals": {
            "business": {"default": "Activate Smart CRM, POS, Invoicing, Business Contracts, Grant Finder, and Content Calendar in one click."},
            "music": {"default": "Activate EPK Builder, Distribution Tracker, Tour Manager, Royalty Calculator, and Lyric AI in one workspace."},
            "hospitality": {"default": "Activate Hospitality POS, VIP Event Manager, Guest Smart CRM, Invoicing, and Social Promo Calendar."},
        },
    },
    {
        "_id": "help.header",
        "description": "Header title of Help Center page.",
        "default": "How can we help you?",
        "regions": {},
        "portals": {
            "business": {"default": "Intermaven Business Help & Onboarding"},
            "music": {"default": "Artist, Label & TuneMavens Support"},
            "hospitality": {"default": "Hospitality POS & Venue Support Center"},
        },
    },
    {
        "_id": "forum.header",
        "description": "Header title of Community Forum page.",
        "default": "Community Forum",
        "regions": {},
        "portals": {
            "business": {"default": "Founders & SME Operators Community"},
            "music": {"default": "Artists, Producers & Labels Community"},
            "hospitality": {"default": "Hospitality Owners & Venue Managers Hub"},
        },
    },
]


def seed_default_cms_keys():
    """Insert missing default CMS keys and backfill missing portal defaults without overwriting admin edits."""
    try:
        now = datetime.now(timezone.utc)
        for k in DEFAULT_CMS_KEYS:
            existing = db.cms_keys.find_one({"_id": k["_id"]})
            if not existing:
                doc = {
                    **k,
                    "created_at": now,
                    "updated_at": now,
                    "updated_by": "system-seed",
                    "history": [],
                }
                db.cms_keys.insert_one(doc)
            else:
                # Non-destructively backfill any missing portal defaults so portal tabs switch cleanly
                seed_portals = k.get("portals") or {}
                curr_portals = existing.get("portals") or {}
                merged_portals = {**curr_portals}
                changed = False
                for p_name, p_vals in seed_portals.items():
                    if p_name not in merged_portals or not merged_portals[p_name]:
                        merged_portals[p_name] = p_vals
                        changed = True
                if changed:
                    db.cms_keys.update_one(
                        {"_id": k["_id"]},
                        {"$set": {"portals": merged_portals}},
                    )
    except Exception as e:
        import logging
        logging.warning(f"CMS key seed failed: {e}")
