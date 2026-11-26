// Single source of truth for Help & Knowledge Base Articles across Intermaven & TuneMavens.
// Used by HelpPage.js, AppHelpAiControls.js ("Get Help" & "Ask AI"), and Persona Landing Pages ("Recommended Reading").

export const HELP_ARTICLES = [
  {
    slug: 'distribution-tracker-guide',
    appId: 'distro',
    appTitle: 'Distribution Tracker',
    category: 'Distribution',
    readTime: '5 min read',
    title: 'How to Launch a Global Release with Distribution Tracker',
    summary: 'Submit tracks, auto-generate ISRC/UPC codes, inspect DDEX 3.8 manifests, and monitor 150+ DSPs in real time.',
    content: `The Intermaven & TuneMavens Distribution Tracker gives creators and record labels a single radar screen for every release.

1. Create a Release: Enter track title, primary artist, release date, and select selective or worldwide DSP outlets (150+ stores including Spotify, Apple Music, YouTube Music, Boomplay, TikTok, and TuneStream).
2. Auto-Generate ISRC & UPC: Leave ISRC/UPC blank to auto-generate compliant codes, or enter your own.
3. Deliver & Monitor QC: Click Deliver to push your release to selected outlets. Watch live ingestion statuses (Live, Scheduled, Pending, Action Required) and download your DDEX 3.8 manifest sheet anytime.
4. Bulk Deliver & Roster: Labels can deliver multiple releases at once and track roster-wide streams.`,
    suggestedQuestions: [
      'How do I auto-generate an ISRC and UPC code?',
      'What does "Action Required" mean on a DSP outlet?',
      'How do labels use Bulk Deliver and DDEX sheets?',
    ],
  },
  {
    slug: 'smart-crm-reachout',
    appId: 'crm',
    appTitle: 'Smart CRM & Reachout',
    category: 'CRM & Growth',
    readTime: '6 min read',
    title: 'Smart CRM & Automated Email Reachout',
    summary: 'Manage contacts, import email-only target groups, preview persona-adaptive campaigns, and track affiliate attribution.',
    content: `Smart CRM & Reachout unifies contact management and multi-channel outreach across Intermaven and TuneMavens.

1. Audience Segments & Target Groups: Create custom email-only target groups or import CSV contact lists cleanly.
2. Persona-Adaptive Copy: Choose a target persona (Creator, Label, Founder, Merchant, Sponsor, etc.) to get smart copy recommendations tailored to that audience.
3. Campaign Preview & Dispatch: Preview the rendered email and CTA before dispatching, then track sent, delivered, opened, clicked, and replied metrics.
4. Contacts & Waitlists: Manage 1-to-1 leads, deal stages, and inbound waitlist signups in the same CRM workspace.`,
    suggestedQuestions: [
      'How do Email-Only Target Groups and CSV imports work?',
      'How do I preview a campaign email before sending?',
      'How does persona-adaptive Smart CRM copy work?',
    ],
  },
  {
    slug: 'epk-builder-guide',
    appId: 'musicbio',
    appTitle: 'EPK & Music Bio Builder',
    category: 'Creator Tools',
    readTime: '4 min read',
    title: 'Building a Press-Ready EPK That Books Festivals & Sync',
    summary: 'Publish a live, shareable Electronic Press Kit with bio, press photos, streaming embeds, and booking contacts.',
    content: `Your Electronic Press Kit (EPK) is your verified digital calling card across promoters, press, and music supervisors.

1. Complete Bio & Press Quotes: Use Maven AI to polish your artist/brand bio for media and festival buyers.
2. Upload High-Res Press Photos & Audio: Store press shots in your File Manager and link your top tracks.
3. Share Your Public Link: Every EPK gets a clean public URL (/epk/your-handle) ready for booking agents and sync briefs.`,
    suggestedQuestions: [
      'Where do I find my public EPK share link?',
      'How do I update my EPK press photos and bio?',
    ],
  },
  {
    slug: 'brand-kit-guide',
    appId: 'brandkit',
    appTitle: 'Brand Kit AI',
    category: 'AI Tools',
    readTime: '4 min read',
    title: 'From Idea to Brand Kit in 10 Minutes',
    summary: 'Generate a cohesive color palette, typography direction, voice guidelines, and tagline with Brand Kit AI.',
    content: `Brand Kit AI helps founders, creators, and agencies establish a consistent visual and verbal identity.

1. Describe Your Brand & Audience: Enter your brand name, industry, and target persona.
2. Generate Palette & Voice: Brand Kit AI produces primary/accent hex colors, tone-of-voice rules, and messaging pillars.
3. Apply Across Apps: Use your Brand Kit consistently in Social AI, Pitch Deck AI, and your EPK.`,
    suggestedQuestions: [
      'How do I generate a color palette and brand voice?',
      'Can I save multiple brand kits for agency clients?',
    ],
  },
  {
    slug: 'pitch-deck-guide',
    appId: 'bizpitch',
    appTitle: 'Pitch Deck AI',
    category: 'Fundraising',
    readTime: '5 min read',
    title: 'Crafting a Winning Pitch Deck with Pitch Deck AI',
    summary: 'Structure problem, solution, market size, traction, and ask slides tailored for investors and sponsors.',
    content: `Pitch Deck AI turns your business discovery profile and metrics into a clean investor-ready narrative.

1. Input Business & Traction: Provide your business model, revenue stage, and funding goal.
2. Generate Slide Outline: Get structured copy for all 10–12 core investor slides.
3. Export & Share: Export your deck or present it alongside your Smart CRM deal pipeline.`,
    suggestedQuestions: [
      'What slides does Pitch Deck AI generate?',
      'How do I tailor my deck for VCs vs corporate sponsors?',
    ],
  },
  {
    slug: 'pos-quick-start',
    appId: 'pos',
    appTitle: 'Intermaven POS',
    category: 'POS & Payments',
    readTime: '4 min read',
    title: 'Getting Started with Intermaven POS & Inventory',
    summary: 'Set up products, process in-person or mobile money checkouts, and track daily settlements.',
    content: `Intermaven POS bridges online and in-person commerce for merchants, merch booths, and event organizers.

1. Add Products & SKUs: Set prices, stock counts, and categories.
2. Process Checkout: Ring up orders with mobile money (M-Pesa), card, or cash.
3. Track Settlements: View daily totals and sync buyer contacts into Smart CRM.`,
    suggestedQuestions: [
      'How do I add inventory items to Intermaven POS?',
      'Which payment methods are supported at checkout?',
    ],
  },
  {
    slug: 'sso-ecosystem-guide',
    appId: 'overview',
    appTitle: 'Account & SSO',
    category: 'Account',
    readTime: '3 min read',
    title: 'One Account Across Intermaven, TuneMavens & TuneStream',
    summary: 'How single user login (SSO) works across all Intermaven and TuneMavens apps with shared persona state.',
    content: `Intermaven, TuneMavens, TuneStream, and SyncMavens share a unified identity and MongoDB user directory.

1. Single Login: Sign in once with your email and password on any platform.
2. Unified Persona & Apps: Your active persona, plan, credits, and activated apps stay synchronized everywhere.
3. OIDC/PKCE SSO: Partner apps and local portals authenticate seamlessly via /api/auth/sso.`,
    suggestedQuestions: [
      'Do I need separate accounts for Intermaven and TuneMavens?',
      'How do I switch my active persona?',
    ],
  },
  {
    slug: 'social-ai-guide',
    appId: 'social',
    appTitle: 'Social AI',
    category: 'AI Tools',
    readTime: '4 min read',
    title: 'Automating Multi-Platform Social Campaigns with Social AI',
    summary: 'Draft platform-specific captions, hashtags, and content calendars for releases, launches, and events.',
    content: `Social AI helps creators, founders, and agencies maintain consistent momentum across Instagram, TikTok, X, and LinkedIn.

1. Pick Your Goal & Persona: Select a product launch, music release, or event promo.
2. Generate Captions & Hooks: Get platform-tailored copy and hashtag sets in seconds.
3. Schedule & Track: Queue posts and coordinate with your Smart CRM email drops.`,
    suggestedQuestions: [
      'How do I generate captions for multiple platforms at once?',
      'Can Social AI adapt tone for business vs music personas?',
    ],
  },
  {
    slug: 'sync-licensing-guide',
    appId: 'syncpitch',
    appTitle: 'Sync Pitch AI',
    category: 'Sync',
    readTime: '4 min read',
    title: 'One-Stop Sync Clearance & Licensing Workflows',
    summary: 'Match catalog tracks to film, TV, and ad briefs with clean master and publishing clearance metadata.',
    content: `Sync Pitch AI connects rights holders with music supervisors looking for pre-cleared tracks.

1. Prepare Metadata: Ensure mood, tempo, genre, and split ownership are documented.
2. Match Briefs: Use Sync Pitch AI to craft targeted pitch notes for supervisors.
3. Close Licensing: Track supervisor responses in Smart CRM.`,
    suggestedQuestions: [
      'What makes a track "one-stop" for sync licensing?',
      'How do I pitch a track to a music supervisor?',
    ],
  },
  {
    slug: 'hosting-manager-guide',
    appId: 'hosting',
    appTitle: 'Hosting Manager',
    category: 'Operations',
    readTime: '3 min read',
    title: 'Managing Domains, SSL & Deployments in Hosting Manager',
    summary: 'Monitor custom domains, SSL status, and landing page deployments from your Intermaven dashboard.',
    content: `Hosting Manager lets businesses, labels, and media houses track web properties and custom domains.

1. Connect Domain: Point your A/CNAME records to your deployment target.
2. Verify SSL & Health: Monitor certificate status and uptime directly in the panel.`,
    suggestedQuestions: [
      'How do I connect a custom domain?',
      'How do I check SSL status?',
    ],
  },
  {
    slug: 'beta-free-credits-guide',
    appId: 'overview',
    appTitle: 'Dashboard & Beta Credits',
    category: 'Beta & Billing',
    readTime: '3 min read',
    title: 'Using Your 150 Free Beta Credits & Mobile Payments',
    summary: 'How free beta credits work during the Intermaven & TuneMavens beta phase, plus M-Pesa & card billing.',
    content: `During the beta phase, every new Intermaven and TuneMavens account starts with 150 Free Beta Credits.

1. Zero Risk Testing: Use your 150 Free Beta Credits across Brand Kit AI, Music Bio & EPK, Sync Pitch AI, Pitch Deck AI, and Smart CRM.
2. Mobile Payments & Cards: When you are ready to top up or upgrade, link your M-Pesa / Mobile Money number or Visa/Mastercard in Settings → Billing.`,
    suggestedQuestions: [
      'How many free credits do I get during the beta phase?',
      'How do I link M-Pesa or mobile payments in Billing?',
    ],
  },
  {
    slug: 'file-manager-guide',
    appId: 'filemanager',
    appTitle: 'File Manager',
    category: 'Workspace',
    readTime: '3 min read',
    title: 'Organizing Masters, Press Photos & Brand Assets in File Manager',
    summary: 'Upload, organize in folders, and share audio masters, stems, and press kits across Intermaven & TuneMavens.',
    content: `File Manager gives your team a centralized cloud vault for audio masters, cover art, press photos, and pitch decks.

1. Create Folders: Group assets by release, client, or campaign.
2. Instant Sharing: Copy secure links or attach files directly into your EPK and Distribution Tracker.`,
    suggestedQuestions: [
      'What file formats are supported in File Manager?',
      'How do I attach press photos to my EPK?',
    ],
  },
  {
    slug: 'channels-integration-guide',
    appId: 'channels',
    appTitle: 'Connected Channels',
    category: 'Integrations',
    readTime: '3 min read',
    title: 'Connecting Email, WhatsApp & Social Channels',
    summary: 'Link your communication channels so notifications, reachout, and social publishing flow automatically.',
    content: `Connected Channels powers automated notifications and social publishing across your persona workspace.

1. Verify Email & WhatsApp: Receive instant alerts for release QC, CRM replies, and support tickets.
2. Link Social Accounts: Connect Instagram, TikTok, X, and LinkedIn for one-click Social AI scheduling.`,
    suggestedQuestions: [
      'How do I verify my WhatsApp or Email notification channel?',
      'Which social channels can I connect?',
    ],
  },
  {
    slug: 'settings-persona-guide',
    appId: 'settings',
    appTitle: 'Settings & Billing',
    category: 'Account',
    readTime: '3 min read',
    title: 'Managing Personas, Portals, Mobile Payments & Security',
    summary: 'Switch between Business and Creative personas, link M-Pesa/cards, and update your profile.',
    content: `Your Settings hub controls your cross-platform identity across Intermaven, TuneMavens, TuneStream, and SyncMavens.

1. Persona & Portals: Switch your active persona anytime from the top bar or Settings → Profile.
2. Billing & Mobile Payments: Manage your plan, view beta credit balances, and link M-Pesa / Mobile Money or cards.`,
    suggestedQuestions: [
      'How do I switch between Business and Creative personas?',
      'How do I add Mobile Payments (M-Pesa) to Billing?',
    ],
  },
  {
    slug: 'admin-console-guide',
    appId: 'admin',
    appTitle: 'Admin & Mother-CMS',
    category: 'Administration',
    readTime: '4 min read',
    title: 'Using Admin Console, Analytics, Audit Logs & Mother-CMS',
    summary: 'Manage platform users, grant beta credits, inspect cross-system audit logs, and edit live CMS copy.',
    content: `The Admin Console & Mother-CMS give platform operators full visibility across Intermaven and TuneMavens.

1. User & Credit Management: Inspect users, update plans/personas, and grant beta credits (all actions are audit-logged).
2. Unified Analytics & Audit Log: Monitor signups, AI runs, revenue, and combined audit logs from both platforms.
3. Mother-CMS Studio: Edit live landing page copy and hero overrides without redeploying.`,
    suggestedQuestions: [
      'Where do Admin Audit Logs get recorded?',
      'How do I edit live landing page copy in Mother-CMS?',
    ],
  },
];

const APP_ALIAS_MAP = {
  epk: 'musicbio',
  cms: 'admin',
};

export function getHelpArticleForApp(appId) {
  const resolved = APP_ALIAS_MAP[appId] || appId;
  return HELP_ARTICLES.find((a) => a.appId === resolved) || HELP_ARTICLES[0];
}

export function getHelpArticleBySlug(slug) {
  return HELP_ARTICLES.find((a) => a.slug === slug) || null;
}
