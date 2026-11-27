import React from 'react';
import { FlatIcon } from '../FlatIcon';

// App info data matching the original js/data.js
const APP_INFO = {
  brandkit: {
    badge: 'Free • 10 credits per run',
    badgeCol: 'rgba(124,111,247,.2)',
    badgeTx: '#c084fc',
    pitch: 'Brand Kit AI generates a complete brand foundation in seconds: name analysis, tagline options, tone of voice, colour direction, and a positioning statement tailored to the African market.',
    steps: [
      { n: '1', t: 'Fill in 4 quick fields', d: 'Your name, industry, target audience, and brand vibe.', c: 'var(--btn)' },
      { n: '2', t: 'AI generates your brand kit', d: 'Claude produces a structured brand foundation designed for African markets.', c: 'var(--a2)' },
      { n: '3', t: 'Copy, download, and go', d: 'Ready to share with designers, collaborators, or use in your marketing.', c: 'var(--gr)' }
    ],
    credits: '10 credits per run • Free on the starter plan'
  },
  musicbio: {
    badge: 'TuneMavens App • Live',
    badgeCol: 'rgba(34,211,238,.15)',
    badgeTx: '#22d3ee',
    pitch: 'EPK Builder & Music Bio is the unified TuneMavens press kit studio — writing your short bio, full press narrative, cold pitch emails, and publishing a hosted Electronic Press Kit with audio, photos, and booking links.',
    steps: [
      { n: '1', t: 'Tell us your story', d: 'Artist name, genre, origin, key milestones, photos, and audio links.', c: 'var(--btn)' },
      { n: '2', t: 'Generate bios & theme', d: 'AI writes your press kit narrative while EPK Builder styles your hosted page.', c: 'var(--a2)' },
      { n: '3', t: 'Publish & share one link', d: 'Share your hosted TuneMavens/Intermaven EPK or export PDFs for bookers.', c: 'var(--gr)' }
    ],
    credits: 'Live now • Included in EPK Builder (0 credits during Beta)'
  },
  syncpitch: {
    badge: 'Free • 20 credits per run',
    badgeCol: 'rgba(245,158,11,.15)',
    badgeTx: '#f59e0b',
    pitch: 'Sync Pitch AI crafts professional cold email pitches to music supervisors, ad agency creative directors, and brand teams — with the right language and rights boilerplate.',
    steps: [
      { n: '1', t: 'Describe your track', d: 'Artist, track name, genre, mood and feel.', c: 'var(--btn)' },
      { n: '2', t: 'Select your target', d: 'Film/TV supervisor, ad agency, brand team, or documentary producer.', c: 'var(--a2)' },
      { n: '3', t: 'Get a pitch-ready package', d: 'Subject lines, pitch email, track description, usage scenarios, rights summary.', c: 'var(--gr)' }
    ],
    credits: '20 credits per run • Available on all plans'
  },
  social: {
    badge: 'Free • No credits needed',
    badgeCol: 'rgba(244,63,94,.15)',
    badgeTx: '#f43f5e',
    pitch: 'Social AI writes platform-optimised captions, hashtag strategies, and posting time recommendations for your content — tuned for Nairobi and African audiences.',
    steps: [
      { n: '1', t: "Describe what you're posting", d: 'Your topic, platform, goal, and tone.', c: 'var(--btn)' },
      { n: '2', t: 'Get 3 caption variations', d: 'Three angles plus 8 hashtags and an optimal posting time.', c: 'var(--a2)' },
      { n: '3', t: 'Upgrade for multi-account', d: 'Creator and Pro unlock multiple accounts and scheduled post queues.', c: 'var(--gr)' }
    ],
    credits: 'Free to use • Credits only required for advanced features'
  },
  smartcrm: {
    badge: 'Live • Free Beta Credits',
    badgeCol: 'rgba(59,130,246,.2)',
    badgeTx: '#60a5fa',
    pitch: 'Smart CRM & Reachout is your single source of truth with TuneMavens — build email-only target groups, import CSVs, preview HTML campaigns, and track full-funnel attribution.',
    steps: [
      { n: '1', t: 'Build email-only target groups', d: 'Paste contacts or import CSVs with automatic email validation and deduplication.', c: 'var(--btn)' },
      { n: '2', t: 'Preview persona-adaptive emails', d: 'Tailor campaign copy for Creators, Labels, Founders, Merchants, or Sponsors.', c: 'var(--a2)' },
      { n: '3', t: 'Dispatch & track attribution', d: 'Monitor sent, opened, clicked, and replied metrics across Intermaven & TuneMavens.', c: 'var(--gr)' }
    ],
    credits: 'Included in Free Beta Credits • Live Sync with TuneMavens'
  },
  pos: {
    badge: 'Coming soon',
    badgeCol: 'rgba(14,148,153,.15)',
    badgeTx: '#0e9499',
    pitch: 'Intermaven POS is a lightweight, M-Pesa-native point-of-sale system built for Nairobi SMEs. Accept M-Pesa, card, and cash. Track inventory. Work offline.',
    steps: [
      { n: '1', t: 'Set up your catalogue', d: 'Add products, prices, and stock levels.', c: 'var(--btn)' },
      { n: '2', t: 'Accept payments', d: 'M-Pesa STK push, card tap, or cash. Receipts by WhatsApp or SMS.', c: 'var(--a2)' },
      { n: '3', t: 'Get daily reports', d: 'End-of-day summaries and weekly business insights to your WhatsApp.', c: 'var(--gr)' }
    ],
    credits: 'Coming soon • Register your interest'
  },
  epk: {
    badge: 'TuneMavens App • Live',
    badgeCol: 'rgba(236,72,153,.15)',
    badgeTx: '#ec4899',
    pitch: 'EPK Builder Studio (includes Music Bio & Press Kit) creates a hosted page with your AI-written bio, photos, music embeds, press quotes, and booking contact — shareable via a single link.',
    steps: [
      { n: '1', t: 'Fill in your artist profile', d: 'Bio, genre, photos, music links, social handles, and press quotes.', c: 'var(--btn)' },
      { n: '2', t: 'Your EPK page goes live', d: 'A clean hosted page shareable with labels, press, and bookers.', c: 'var(--a2)' },
      { n: '3', t: 'Update anytime', d: 'Add new releases, tour dates, or press features without code.', c: 'var(--gr)' }
    ],
    credits: 'Live now • TuneMavens App'
  },
  distro: {
    badge: 'TuneMavens App • Live',
    badgeCol: 'rgba(14,165,233,.15)',
    badgeTx: '#0ea5e9',
    pitch: 'Distribution Tracker pulls your streams, downloads, DDEX 3.8 deliveries, and revenue data into one clean view across 150+ DSPs including Spotify, YouTube, Boomplay, and Mdundo.',
    steps: [
      { n: '1', t: 'Connect your platforms', d: 'Link Spotify, YouTube, Apple Music, Boomplay, and your distributor.', c: 'var(--btn)' },
      { n: '2', t: 'See your data in one view', d: 'Streams, territory breakdown, playlist placements, and revenue.', c: 'var(--a2)' },
      { n: '3', t: 'Get AI insights', d: 'Weekly digest with what is growing, declining, and recommended next steps.', c: 'var(--gr)' }
    ],
    credits: 'Live now • TuneMavens App'
  },
  catalogue: {
    badge: 'TuneMavens App • Live',
    badgeCol: 'rgba(168,85,247,.15)',
    badgeTx: '#a855f7',
    pitch: 'Catalogue Machine & Release Engine manages ISRC/UPC codes, album artwork validation, release scheduling, and metadata across labels and independent artists.',
    steps: [
      { n: '1', t: 'Upload tracks & metadata', d: 'Attach lossless WAV/FLAC masters, ISRCs, contributors, and artwork.', c: 'var(--btn)' },
      { n: '2', t: 'Validate release readiness', d: 'Automated checks against DSP and DDEX 3.8 standards.', c: 'var(--a2)' },
      { n: '3', t: 'Sync with Distribution', d: 'Push release states straight into Distribution Tracker & Split Ledger.', c: 'var(--gr)' }
    ],
    credits: 'Live now • TuneMavens App'
  },
  ledger: {
    badge: 'TuneMavens App • Live',
    badgeCol: 'rgba(16,185,129,.15)',
    badgeTx: '#10b981',
    pitch: 'Split Cascade Ledger automates transparent royalty accounting, collaborator split percentages, and instant M-Pesa / global payouts across every release.',
    steps: [
      { n: '1', t: 'Define collaborator splits', d: 'Assign master and publishing percentages to artists, producers, and writers.', c: 'var(--btn)' },
      { n: '2', t: 'Verify & lock split sheets', d: 'Timestamped confirmations prevent royalty disputes.', c: 'var(--a2)' },
      { n: '3', t: 'Cascade payouts automatically', d: 'Every stream, download, and sync check settles cleanly.', c: 'var(--gr)' }
    ],
    credits: 'Live now • TuneMavens App'
  },
  hosting: {
    badge: 'TuneMavens App • Live',
    badgeCol: 'rgba(56,189,248,.15)',
    badgeTx: '#38bdf8',
    pitch: 'Hosting & Domain Manager provisions custom domains, automatic SSL certificates, and fast edge hosting for your EPK pages and brand microsites.',
    steps: [
      { n: '1', t: 'Pick or connect a domain', d: 'Use a custom domain or instant subdomain.', c: 'var(--btn)' },
      { n: '2', t: 'Automatic SSL & DNS', d: 'Zero-config HTTPS and routing.', c: 'var(--a2)' },
      { n: '3', t: 'Publish in one click', d: 'Point directly to your EPK or brand page.', c: 'var(--gr)' }
    ],
    credits: 'Live now • TuneMavens App'
  },
  bizpitch: {
    badge: 'Intermaven App • Live',
    badgeCol: 'rgba(16,185,129,.15)',
    badgeTx: '#10b981',
    pitch: 'Pitch Deck AI builds investor-ready business pitch decks, financial narrative outlines, and executive summaries tailored to your venture.',
    steps: [
      { n: '1', t: 'Describe your venture', d: 'Problem, solution, traction, and market.', c: 'var(--btn)' },
      { n: '2', t: 'Generate slide structure', d: 'AI writes concise, compelling slide copy.', c: 'var(--a2)' },
      { n: '3', t: 'Export & present', d: 'Ready for investors, partners, and accelerators.', c: 'var(--gr)' }
    ],
    credits: 'Live now • 0 credits during Beta'
  }
};

const ALL_APPS = [
  { id: 'smartcrm', n: 'Smart CRM & Reachout', icon: 'crm', col: '#3b82f6', d: 'Email target groups, persona playbooks & tracked reachout', p: 'both', ecosystem: 'Intermaven · TuneMavens', page: '/smartcrm' },
  { id: 'brandkit', n: 'Brand Kit AI', icon: 'brandkit', col: '#10b981', d: 'Brand names, taglines, color palettes & guidelines', p: 'both', ecosystem: 'Intermaven', page: '/brandkit' },
  { id: 'social', n: 'Social AI', icon: 'social', col: '#f43f5e', d: 'Multi-platform social management & campaigns', p: 'both', ecosystem: 'Intermaven', page: '/social' },
  { id: 'calendar', n: 'Content Calendar', icon: 'social', col: '#fb7185', d: 'Cross-platform post scheduler with peak engagement windows', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=calendar' },
  { id: 'musicbio', n: 'EPK Builder & Music Bio', icon: 'epk', col: '#22d3ee', d: 'Hosted TuneMavens EPKs, artist bios & press materials', p: 'both', ecosystem: 'TuneMavens', page: '/musicbio' },
  { id: 'syncpitch', n: 'Sync Pitch AI', icon: 'syncpitch', col: '#f59e0b', d: 'Film, TV and advertising sync pitches', p: 'both', ecosystem: 'Intermaven · TuneMavens', page: '/syncpitch' },
  { id: 'distro', n: 'Distribution Tracker', icon: 'distro', col: '#0ea5e9', d: '181 DSPs & DDEX 3.8 release tracking, ISRC/UPC & bulk delivery', p: 'both', ecosystem: 'TuneMavens', page: '/distro' },
  { id: 'catalogue', n: 'Catalogue Machine & Release Engine', icon: 'distro', col: '#a855f7', d: 'ISRC/UPC catalog management & release readiness', p: 'both', ecosystem: 'TuneMavens', page: '/dashboard?tab=distro' },
  { id: 'ledger', n: 'Split Cascade Ledger', icon: 'crm', col: '#10b981', d: 'Automated collaborator royalty splits & payouts', p: 'both', ecosystem: 'TuneMavens', page: '/dashboard?tab=distro' },
  { id: 'royalties', n: 'Royalty Calculator', icon: 'syncpitch', col: '#f59e0b', d: 'Multi-DSP streaming payout projections & split cascade modeling', p: 'both', ecosystem: 'Intermaven · TuneMavens', page: '/dashboard?tab=royalties' },
  { id: 'lyrichook', n: 'Lyric & Hook AI', icon: 'epk', col: '#f43f5e', d: 'Genre-specific hooks, verse bars, rhyme schemes & cadence notes', p: 'music', ecosystem: 'Intermaven · TuneMavens', page: '/dashboard?tab=lyrichook' },
  { id: 'tours', n: 'Tour Manager', icon: 'distro', col: '#22d3ee', d: 'Show routing, hotels, VIP guest lists & TuneMavens Events sync', p: 'both', ecosystem: 'Intermaven · TuneMavens', page: '/dashboard?tab=tours' },
  { id: 'merchbrief', n: 'Merch Designer Brief', icon: 'brandkit', col: '#10b981', d: 'Apparel GSM specs, print dimensions & vendor checklists', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=merchbrief' },
  { id: 'pos', n: 'M-Pesa & Card POS Terminal', icon: 'pos', col: '#0e9499', d: 'Mobile money & card point of sale for events & merch', p: 'both', ecosystem: 'Intermaven · TuneMavens', page: '/dashboard?tab=pos' },
  { id: 'hosting', n: 'Hosting & Domain Manager', icon: 'brandkit', col: '#38bdf8', d: 'Custom domains, SSL & instant EPK/brand site hosting', p: 'both', ecosystem: 'TuneMavens', page: '/dashboard?tab=hosting' },
  { id: 'bizpitch', n: 'Pitch Deck AI', icon: 'bizpitch', col: '#8b5cf6', d: 'Investor-ready business pitch decks & executive summaries', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=bizpitch' },
  { id: 'contracts', n: 'Business Contract Builder', icon: 'contracts', col: '#a78bfa', d: 'NDAs, Work-for-Hire, Collaboration & Client Service agreements with e-sign', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=contracts' },
  { id: 'pressrelease', n: 'Press Release AI', icon: 'bizpitch', col: '#38bdf8', d: 'AP-style newsroom press releases for launches, releases & events', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=pressrelease' },
  { id: 'invoices', n: 'Invoice & Payments', icon: 'pos', col: '#10b981', d: 'Multi-currency client invoicing with Pesapal/M-Pesa & Stripe links', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=invoices' },
  { id: 'grants', n: 'Grant Finder', icon: 'crm', col: '#34d399', d: 'Curated arts, music & SME grants with AI proposal drafting', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=grants' },
  { id: 'outputs', n: 'AI Output Library', icon: 'brandkit', col: '#10b981', d: 'Auto-saved archive of all AI generations with search & export', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=outputs' },
  { id: 'files', n: 'File Manager', icon: 'crm', col: '#22d3ee', d: 'Cloud-ready asset folders, sharing links & storage management', p: 'both', ecosystem: 'Intermaven', page: '/dashboard?tab=filemanager' }
];

function AppInfoModal({ isOpen, appId, onClose, onGetStarted, onToast }) {
  if (!isOpen || !appId) return null;

  const app = ALL_APPS.find(a => a.id === appId) || (appId === 'epk' ? ALL_APPS.find(a => a.id === 'musicbio') : null);
  const info = APP_INFO[appId];

  if (!app || !info) {
    return null;
  }

  const isLive = ['smartcrm', 'brandkit', 'musicbio', 'epk', 'syncpitch', 'social', 'distro', 'pos', 'catalogue', 'ledger', 'hosting', 'bizpitch'].includes(appId);

  const handleCTA = () => {
    onClose();
    if (isLive) {
      onGetStarted(appId);
    } else {
      if (onToast) {
        onToast('Added to waitlist!', `We will notify you when ${app.n} launches.`, '✓');
      }
    }
  };

  return (
    <div 
      className={`app-modal-bg ${isOpen ? 'op' : ''}`} 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="app-info-modal"
    >
      <div className="app-modal">
        <div 
          className="am-hero" 
          style={{ background: `radial-gradient(ellipse at center, ${app.col}30 0%, var(--bg3) 100%)` }}
        >
          <div 
            className="am-hero-glow" 
            style={{ background: `radial-gradient(circle, ${app.col} 0%, transparent 70%)` }}
          />
          <div className="am-hero-icon">
            <FlatIcon name={app.icon} size={32} color={app.col} />
          </div>
          <button className="am-close" onClick={onClose} data-testid="app-modal-close">
            ✕
          </button>
        </div>
        
        <div className="am-body">
          <div 
            className="am-badge" 
            style={{ 
              background: info.badgeCol, 
              color: info.badgeTx,
              border: `1px solid ${info.badgeTx}40`
            }}
            dangerouslySetInnerHTML={{ __html: info.badge }}
          />
          <div className="am-name">{app.n}</div>
          <div className="am-tag">{app.d}</div>
          <div className="am-pitch">{info.pitch}</div>
          
          <div className="am-how">
            <h4>How it works</h4>
            <div className="am-steps">
              {info.steps.map((step, index) => (
                <div key={index} className="am-step">
                  <div 
                    className="am-step-num" 
                    style={{ background: `${step.c}20`, color: step.c }}
                  >
                    {step.n}
                  </div>
                  <div className="am-step-body">
                    <div className="am-step-title">{step.t}</div>
                    <div className="am-step-desc">{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="am-cta-row">
            <button className="am-cta" onClick={handleCTA} data-testid="app-modal-cta">
              {isLive ? 'Get started →' : 'Join the waitlist →'}
            </button>
            <button className="am-cta-ghost" onClick={onClose}>
              Maybe later
            </button>
          </div>
          
          <div className="am-credits" dangerouslySetInnerHTML={{ __html: info.credits }} />
        </div>
      </div>
    </div>
  );
}

export { AppInfoModal, APP_INFO, ALL_APPS };
