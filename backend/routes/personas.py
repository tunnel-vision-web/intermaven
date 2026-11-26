from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/personas", tags=["personas"])

PERSONAS = [
    # Creative & Media Personas (aligned with TuneMavens)
    {
        "key": "creator",
        "side": "creative",
        "portal": "music",
        "label": "Creators & Artists",
        "short_label": "Creators",
        "subtitle": "Artists, Songwriters & Producers",
        "tagline": "Release music globally, build your EPK, and automate split sheets & social promotion.",
        "accent": "#22d3ee",
        "recommended_apps": ["musicbio", "distro", "social", "syncpitch", "brandkit"],
        "onboarding_steps": [
            {"title": "Complete your Creator Profile & Persona", "desc": "Set your artist/producer name, genre, and payout preferences."},
            {"title": "Launch your Live EPK", "desc": "Publish a verified press kit with bio, streaming links, and press photos."},
            {"title": "Submit your first release to Distribution Tracker", "desc": "Generate ISRC/UPC codes and deliver to 150+ global DSPs."},
            {"title": "Schedule a Social AI campaign", "desc": "Auto-generate release-day captions and visual assets."},
        ],
        "recommended_reading": [
            {"title": "How to Launch a Global Release with Distribution Tracker", "slug": "distribution-tracker-guide", "category": "Distribution"},
            {"title": "Building a Press-Ready EPK That Books Festivals & Sync", "slug": "epk-builder-guide", "category": "Creator Tools"},
            {"title": "Understanding Split Sheets & Publishing Royalties", "slug": "split-sheets-royalties", "category": "Rights & Revenue"},
        ],
    },
    {
        "key": "podcaster",
        "side": "creative",
        "portal": "music",
        "label": "Podcasters",
        "short_label": "Podcasters",
        "subtitle": "Shows, RSS & Brand Sponsorships",
        "tagline": "Distribute episodes everywhere, pitch corporate sponsors, and manage guest reachout.",
        "accent": "#00f2fe",
        "recommended_apps": ["distro", "musicbio", "social", "crm", "brandkit"],
        "onboarding_steps": [
            {"title": "Set up your Show Identity", "desc": "Create your podcast cover palette and show bio in Brand Kit AI."},
            {"title": "Connect your RSS & Distribution", "desc": "Track Spotify, Apple Podcasts, and YouTube ingestion status."},
            {"title": "Build your Sponsor Media Kit (EPK)", "desc": "Showcase listener demographics and ad slot availability."},
            {"title": "Run Sponsor Outreach in Smart CRM", "desc": "Import sponsor leads and launch tracked email reachout."},
        ],
        "recommended_reading": [
            {"title": "Monetizing Your Podcast with Corporate Ad Flights", "slug": "podcast-monetization", "category": "Monetization"},
            {"title": "Using Smart CRM to Book Guests & Sponsors", "slug": "smart-crm-reachout", "category": "Growth"},
        ],
    },
    {
        "key": "label",
        "side": "creative",
        "portal": "music",
        "label": "Record Labels",
        "short_label": "Record Labels",
        "subtitle": "Roster Catalog, DDEX & Split Cascades",
        "tagline": "Manage multi-artist rosters, bulk DDEX deliveries, A&R pipelines, and royalty accounting.",
        "accent": "#a78bfa",
        "recommended_apps": ["distro", "crm", "musicbio", "syncpitch", "social"],
        "onboarding_steps": [
            {"title": "Configure your Label Workspace", "desc": "Set label imprint details and team member permissions."},
            {"title": "Onboard your Artist Roster", "desc": "Link artist profiles and EPKs under your label umbrella."},
            {"title": "Bulk Deliver Releases via DDEX", "desc": "Use Distribution Tracker bulk delivery and QC monitoring."},
            {"title": "Pitch Catalog to Sync Supervisors", "desc": "Package pre-cleared master/publishing rights for film & TV."},
        ],
        "recommended_reading": [
            {"title": "Bulk DDEX Delivery & Catalog QC for Labels", "slug": "label-bulk-distro", "category": "Distribution"},
            {"title": "Managing Multi-Artist Smart CRM Campaigns", "slug": "smart-crm-reachout", "category": "CRM & Reachout"},
        ],
    },
    {
        "key": "dj",
        "side": "creative",
        "portal": "music",
        "label": "DJs & Curators",
        "short_label": "DJs",
        "subtitle": "DJ Pool, Live Sets & Event Bookings",
        "tagline": "Access promo crates, promote live sets, manage bookings, and grow your listener base.",
        "accent": "#14b8a6",
        "recommended_apps": ["musicbio", "social", "crm", "pos", "distro"],
        "onboarding_steps": [
            {"title": "Build your DJ Press Kit", "desc": "Add resident clubs, mix links, and technical rider."},
            {"title": "Connect Smart CRM for Promoter Bookings", "desc": "Track club promoters, festival buyers, and event RSVPs."},
            {"title": "Automate Event Promo with Social AI", "desc": "Generate flyer copy and countdown posts for upcoming gigs."},
        ],
        "recommended_reading": [
            {"title": "How DJs Use TuneMavens & Intermaven for Event Bookings", "slug": "dj-bookings-crm", "category": "Live & Events"},
            {"title": "Accepting Direct Tips & Merch at Live Sets with POS", "slug": "pos-quick-start", "category": "Payments"},
        ],
    },
    {
        "key": "supervisor",
        "side": "creative",
        "portal": "music",
        "label": "Music Supervisors",
        "short_label": "Supervisors",
        "subtitle": "Sync Licensing, Film & Ad Briefs",
        "tagline": "Discover pre-cleared, one-stop tracks and manage sync licensing briefs in one place.",
        "accent": "#f59e0b",
        "recommended_apps": ["syncpitch", "crm", "distro", "musicbio"],
        "onboarding_steps": [
            {"title": "Set your Studio / Production Company Profile", "desc": "Define your project types (Film, TV, Ads, Gaming)."},
            {"title": "Post or Match a Sync Brief", "desc": "Use Sync Pitch AI to filter one-stop, cleared catalog."},
            {"title": "Manage Rights & Licensing Contacts", "desc": "Organize labels, publishers, and composers in Smart CRM."},
        ],
        "recommended_reading": [
            {"title": "One-Stop Sync Clearance & Licensing Workflows", "slug": "sync-licensing-guide", "category": "Sync"},
            {"title": "Evaluating AI-Matched Catalog Submissions", "slug": "sync-pitch-ai", "category": "AI Tools"},
        ],
    },
    {
        "key": "media-house",
        "side": "creative",
        "portal": "music",
        "label": "Media Houses",
        "short_label": "Media Houses",
        "subtitle": "Broadcast, Radio & Ad Inventory",
        "tagline": "Program broadcast rotations, manage ad rate cards, and clear music rights effortlessly.",
        "accent": "#3b82f6",
        "recommended_apps": ["crm", "hosting", "social", "syncpitch", "distro"],
        "onboarding_steps": [
            {"title": "Set up your Station / Network Profile", "desc": "Configure broadcast regions and audience reach."},
            {"title": "Manage Advertisers & Sponsors in Smart CRM", "desc": "Run targeted ad-slot outreach campaigns."},
            {"title": "Streamline Music Submissions & Cue Sheets", "desc": "Track cleared tracks and broadcast logs."},
        ],
        "recommended_reading": [
            {"title": "Broadcast Ad Rate Cards & Sponsor Reachout", "slug": "media-house-ads", "category": "Media & Ads"},
            {"title": "Automating Cue Sheets & Rights Compliance", "slug": "rights-compliance", "category": "Licensing"},
        ],
    },
    {
        "key": "consumer",
        "side": "creative",
        "portal": "music",
        "label": "Listeners & Fans",
        "short_label": "Listeners",
        "subtitle": "TuneStream, Events & Creator Support",
        "tagline": "Stream lossless audio, grab event tickets, and support your favorite creators directly.",
        "accent": "#10b981",
        "recommended_apps": ["musicbio", "pos"],
        "onboarding_steps": [
            {"title": "Personalize your Listening Taste", "desc": "Follow favorite genres, artists, and DJs across the ecosystem."},
            {"title": "Connect your Single Sign-On Account", "desc": "Use one login across Intermaven, TuneMavens, and TuneStream."},
        ],
        "recommended_reading": [
            {"title": "One Account Across Intermaven, TuneMavens & TuneStream", "slug": "sso-ecosystem-guide", "category": "Account"},
        ],
    },
    # Business & Enterprise Personas (Intermaven Core)
    {
        "key": "founder",
        "side": "business",
        "portal": "business",
        "label": "Founders & SMEs",
        "short_label": "Founders & SMEs",
        "subtitle": "Startups, Brands & Growing Businesses",
        "tagline": "Launch your brand identity, pitch investors, manage customers, and accept payments.",
        "accent": "#22d3ee",
        "recommended_apps": ["brandkit", "crm", "crm", "social", "pos", "hosting"],
        "onboarding_steps": [
            {"title": "Run the Business Discovery Wizard", "desc": "Get an AI-tailored growth strategy and channel checklist."},
            {"title": "Generate your Brand Kit", "desc": "Create your logo direction, color palette, and brand voice."},
            {"title": "Build your Investor Pitch Deck", "desc": "Draft a structured deck with market sizing and financials."},
            {"title": "Set up Smart CRM & Lead Capture", "desc": "Import contacts and launch automated email reachout."},
        ],
        "recommended_reading": [
            {"title": "From Idea to Brand Kit in 10 Minutes", "slug": "brand-kit-guide", "category": "AI Tools"},
            {"title": "Smart CRM & Automated Email Reachout", "slug": "smart-crm-reachout", "category": "Fundraising"},
            {"title": "Smart CRM & Automated Email Reachout", "slug": "smart-crm-reachout", "category": "CRM & Growth"},
        ],
    },
    {
        "key": "merchant",
        "side": "business",
        "portal": "business",
        "label": "Retailers & Merchants",
        "short_label": "Merchants (POS)",
        "subtitle": "POS Terminals, Inventory & TunePay",
        "tagline": "Run in-person & online sales, track inventory, and settle mobile money & card payments.",
        "accent": "#10b981",
        "recommended_apps": ["pos", "crm", "social", "brandkit", "hosting"],
        "onboarding_steps": [
            {"title": "Configure your Store & POS Terminal", "desc": "Add products, pricing, and tax settings in Intermaven POS."},
            {"title": "Enable Mobile Money & Card Checkout", "desc": "Connect M-Pesa, Stripe, or PesaPal settlement."},
            {"title": "Sync Customer Receipts to Smart CRM", "desc": "Turn walk-in buyers into repeat customers via email campaigns."},
        ],
        "recommended_reading": [
            {"title": "Getting Started with Intermaven POS & Inventory", "slug": "pos-quick-start", "category": "POS & Payments"},
            {"title": "Reconciling Daily Settlements & Staff Terminals", "slug": "pos-settlement", "category": "Operations"},
        ],
    },
    {
        "key": "agency",
        "side": "business",
        "portal": "business",
        "label": "Agencies & Managers",
        "short_label": "Agencies",
        "subtitle": "Multi-Client CRM, Social & Talent",
        "tagline": "Manage multiple client brands, social calendars, outreach campaigns, and hosting in one hub.",
        "accent": "#a78bfa",
        "recommended_apps": ["crm", "social", "brandkit", "hosting", "crm", "musicbio"],
        "onboarding_steps": [
            {"title": "Set up your Agency Workspace", "desc": "Enable both Business and Creative portals for full client coverage."},
            {"title": "Segment Client Target Groups in Smart CRM", "desc": "Organize client outreach lists and track attribution."},
            {"title": "Schedule Multi-Brand Content with Social AI", "desc": "Keep every client's social channels active from one console."},
        ],
        "recommended_reading": [
            {"title": "Managing Multi-Client Campaigns in Smart CRM", "slug": "smart-crm-reachout", "category": "Agency Ops"},
            {"title": "Cross-Platform SSO for Agency Teams", "slug": "sso-ecosystem-guide", "category": "Account"},
        ],
    },
    {
        "key": "corporate",
        "side": "business",
        "portal": "business",
        "label": "Corporate & Brands",
        "short_label": "Corporate",
        "subtitle": "Sponsorships, Ads & Enterprise",
        "tagline": "Sponsor tours, podcasts, and media flights with verified ROI attribution and brand safety.",
        "accent": "#ef4444",
        "recommended_apps": ["crm", "social", "crm", "hosting"],
        "onboarding_steps": [
            {"title": "Define your Brand Sponsorship Objectives", "desc": "Select target regions, audiences, and media channels."},
            {"title": "Launch Brand Campaigns via Smart CRM", "desc": "Coordinate creator, podcaster, and media house placements."},
            {"title": "Track Impressions & Conversion Telemetry", "desc": "Monitor campaign performance in your analytics dashboard."},
        ],
        "recommended_reading": [
            {"title": "Corporate Sponsorships Across Music, Podcasts & Events", "slug": "corporate-sponsorships", "category": "Enterprise"},
            {"title": "Measuring Reachout & Sponsorship Attribution", "slug": "smart-crm-reachout", "category": "Analytics"},
        ],
    },
    {
        "key": "investor",
        "side": "business",
        "portal": "business",
        "label": "Investors & VCs",
        "short_label": "Investors / VC",
        "subtitle": "Deal Flow, Tour Capital & Portfolio",
        "tagline": "Evaluate vetted startups and touring/catalog opportunities with real-time platform telemetry.",
        "accent": "#f59e0b",
        "recommended_apps": ["crm", "crm", "distro"],
        "onboarding_steps": [
            {"title": "Set your Investment Thesis & Sectors", "desc": "Filter deal flow across tech SMEs, media, and creative catalog."},
            {"title": "Review AI-Structured Pitch Decks", "desc": "Access founder & label data rooms securely."},
            {"title": "Track Portfolio Milestones", "desc": "Monitor revenue, distribution, and growth metrics in one view."},
        ],
        "recommended_reading": [
            {"title": "Evaluating Creative & Tech Deals on Intermaven", "slug": "investor-deal-flow", "category": "Capital"},
            {"title": "How Distribution Telemetry De-Risks Music Financing", "slug": "distribution-tracker-guide", "category": "Analytics"},
        ],
    },
]

PERSONAS_BY_KEY = {p["key"]: p for p in PERSONAS}


@router.get("")
async def list_personas(side: str | None = None):
    if side:
        return {"personas": [p for p in PERSONAS if p["side"] == side]}
    return {"personas": PERSONAS}


@router.get("/{persona_key}")
async def get_persona(persona_key: str):
    p = PERSONAS_BY_KEY.get(persona_key)
    if not p:
        raise HTTPException(status_code=404, detail="Persona not found")
    return {"persona": p}

