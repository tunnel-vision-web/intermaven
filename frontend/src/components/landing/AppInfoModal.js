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
    badge: 'Free • 15 credits per run',
    badgeCol: 'rgba(34,211,238,.15)',
    badgeTx: '#22d3ee',
    pitch: 'Music Bio AI writes your short bio, full press kit narrative, a cold pitch email, and three journalist interview angles — tailored to your genre, story, and tone.',
    steps: [
      { n: '1', t: 'Tell us your story', d: 'Artist name, genre, origin, key milestones.', c: 'var(--btn)' },
      { n: '2', t: 'Choose your tone', d: 'Professional, conversational, bold hype, or storytelling.', c: 'var(--a2)' },
      { n: '3', t: 'Get 5 assets at once', d: 'Short bio, full bio, press narrative, media pitch email, and 3 hooks.', c: 'var(--gr)' }
    ],
    credits: '15 credits per run • Included in all plans'
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
    badge: 'Beta • Limited access',
    badgeCol: 'rgba(236,72,153,.15)',
    badgeTx: '#ec4899',
    pitch: 'EPK Builder creates a beautiful hosted page with your bio, photos, music embeds, press quotes, and booking contact — shareable via a single link.',
    steps: [
      { n: '1', t: 'Fill in your artist profile', d: 'Bio, genre, photos, music links, social handles, and press quotes.', c: 'var(--btn)' },
      { n: '2', t: 'Your EPK page goes live', d: 'A clean page at intermaven.io/yourname shareable with labels and bookers.', c: 'var(--a2)' },
      { n: '3', t: 'Update anytime', d: 'Add new releases, tour dates, or press features without code.', c: 'var(--gr)' }
    ],
    credits: 'Beta access • Join the waitlist'
  },
  distro: {
    badge: 'Coming soon',
    badgeCol: 'rgba(14,165,233,.15)',
    badgeTx: '#0ea5e9',
    pitch: 'Distribution Tracker pulls your streams, downloads, and revenue data into one clean view across Spotify, YouTube, Boomplay, Mdundo, and more.',
    steps: [
      { n: '1', t: 'Connect your platforms', d: 'Link Spotify, YouTube, Apple Music, Boomplay, and your distributor.', c: 'var(--btn)' },
      { n: '2', t: 'See your data in one view', d: 'Streams, territory breakdown, playlist placements, and revenue.', c: 'var(--a2)' },
      { n: '3', t: 'Get AI insights', d: 'Weekly digest with what is growing, declining, and recommended next steps.', c: 'var(--gr)' }
    ],
    credits: 'Coming soon • Register your interest'
  }
};

const ALL_APPS = [
  { id: 'smartcrm', n: 'Smart CRM & Reachout', icon: 'crm', col: '#3b82f6', d: 'Email target groups, persona playbooks & tracked reachout', p: 'both', page: '/smartcrm' },
  { id: 'brandkit', n: 'Brand Kit AI', icon: 'brandkit', col: '#10b981', d: 'Brand names, taglines, tone of voice', p: 'both', page: '/brandkit' },
  { id: 'social', n: 'Social AI', icon: 'social', col: '#f43f5e', d: 'Multi-platform social management', p: 'both', page: '/social' },
  { id: 'musicbio', n: 'Music Bio & Press Kit', icon: 'musicbio', col: '#22d3ee', d: 'Artist bios and press materials', p: 'music', page: '/musicbio' },
  { id: 'syncpitch', n: 'Sync Pitch AI', icon: 'syncpitch', col: '#f59e0b', d: 'Film, TV and advertising pitches', p: 'music', page: '/syncpitch' },
  { id: 'pos', n: 'Intermaven POS', icon: 'pos', col: '#0e9499', d: 'Mobile money & card point of sale', p: 'business' },
  { id: 'epk', n: 'Electronic Press Kit', icon: 'epk', col: '#ec4899', d: 'Hosted EPK pages for artists', p: 'music' },
  { id: 'distro', n: 'Distribution Tracker', icon: 'distro', col: '#0ea5e9', d: '150+ DSPs & DDEX 3.8 tracking', p: 'music' }
];

function AppInfoModal({ isOpen, appId, onClose, onGetStarted, onToast }) {
  if (!isOpen || !appId) return null;

  const app = ALL_APPS.find(a => a.id === appId);
  const info = APP_INFO[appId];

  if (!app || !info) {
    return null;
  }

  const isLive = ['smartcrm', 'brandkit', 'musicbio', 'syncpitch', 'social', 'distro'].includes(appId);

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
