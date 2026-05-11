import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlatIcon } from '../FlatIcon';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'X (Twitter)', 'LinkedIn', 'Facebook'];

function TrySocialAI({ onOpenAuth, onToast }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/ai/try-social/status`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setRemaining(d.remaining); })
      .catch(() => {});
  }, []);

  const handleTry = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Drop a topic first — e.g. "new EP launch" or "weekly studio tip".');
      return;
    }
    setError('');
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/api/ai/try-social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, goal: 'awareness', tone: 'hype' })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Generation failed. Try again.');
      } else {
        setResult(data.content || '');
        setRemaining(typeof data.remaining === 'number' ? data.remaining : remaining);
        if (onToast) onToast('Generated — sign up to save & unlock 4 more tools', 'success');
      }
    } catch (err) {
      setError('Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="try-social-ai-widget"
      style={{
        background: 'linear-gradient(135deg, rgba(244,63,94,.10), rgba(124,111,247,.06))',
        border: '1px solid rgba(244,63,94,.28)',
        borderRadius: 'var(--r)',
        padding: '22px',
        marginBottom: '28px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <FlatIcon name="social" size={22} color="#f43f5e" />
        <div style={{ fontSize: '15px', fontWeight: '800' }}>Try Social AI free — no signup</div>
        <span
          data-testid="try-social-free-badge"
          style={{
            fontSize: '9px',
            fontWeight: '800',
            letterSpacing: '.5px',
            textTransform: 'uppercase',
            color: 'var(--gr)',
            background: 'rgba(16,185,129,.12)',
            border: '1px solid rgba(16,185,129,.35)',
            borderRadius: '999px',
            padding: '3px 8px'
          }}
        >
          Free
        </span>
        {remaining !== null && (
          <span
            data-testid="try-social-remaining"
            style={{ fontSize: '11px', color: 'var(--mu)', marginLeft: 'auto' }}
          >
            {remaining}/3 free runs left today
          </span>
        )}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--mu)', marginBottom: '14px', maxWidth: '560px' }}>
        Type a topic, pick a platform, and we'll generate captions, hashtags, and posting timing built for African audiences. Powered by the same engine paying users get.
      </p>

      <form onSubmit={handleTry} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        <input
          data-testid="try-social-topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='e.g. "new EP launch" or "weekly studio tip"'
          maxLength={280}
          style={{
            flex: '1 1 260px',
            background: 'var(--ca)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: 'var(--tx)',
            padding: '10px 13px',
            fontSize: '13px'
          }}
        />
        <select
          data-testid="try-social-platform-select"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{
            background: 'var(--ca)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: 'var(--tx)',
            padding: '10px 13px',
            fontSize: '13px'
          }}
        >
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          data-testid="try-social-generate-btn"
          type="submit"
          disabled={loading}
          className="hbp"
          style={{ minWidth: '130px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Generating…' : 'Generate →'}
        </button>
      </form>

      {error && (
        <div
          data-testid="try-social-error"
          style={{
            fontSize: '12px',
            color: '#fda4af',
            background: 'rgba(244,63,94,.10)',
            border: '1px solid rgba(244,63,94,.35)',
            borderRadius: 'var(--r)',
            padding: '8px 10px',
            marginBottom: '10px'
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div data-testid="try-social-result-block" style={{ marginTop: '10px' }}>
          <div
            data-testid="try-social-result"
            style={{
              background: 'var(--ca)',
              border: '1px solid var(--b1)',
              borderRadius: 'var(--r)',
              padding: '14px',
              fontSize: '12.5px',
              lineHeight: '1.55',
              whiteSpace: 'pre-wrap',
              maxHeight: '420px',
              overflowY: 'auto'
            }}
          >
            {result}
          </div>
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              background: 'rgba(124,111,247,.10)',
              border: '1px solid rgba(124,111,247,.35)',
              borderRadius: 'var(--r)',
              padding: '12px 14px'
            }}
          >
            <div style={{ fontSize: '12.5px', fontWeight: '600' }}>
              Like what you see? Save this + unlock <strong>4 more tools</strong> + 150 free credits.
            </div>
            <button
              data-testid="try-social-signup-cta"
              onClick={() => onOpenAuth && onOpenAuth()}
              className="hbp"
            >
              Sign up free →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TOOL_PAGE_COPY = {
  default: {
    header: 'AI Creative Studio',
    subtitle: 'Generate brand and music assets powered by AI',
    cta: 'Start free →',
    ctaDesc: 'Create a free account to access all AI tools with 150 free credits. No credit card required.'
  },
  djs: {
    header: 'Tools for DJs and promoters',
    subtitle: 'Create show promos, lineups, and bookings with AI-ready branding.',
    cta: 'Join the movement →',
    ctaDesc: 'Sign up and turn every set into a branded experience for promoters, venues, and fans.'
  },
  labels: {
    header: 'Tools for labels and A&R teams',
    subtitle: 'Write artist bios, release plans, and pitch decks that help you sign and promote talent.',
    cta: 'Start label tools →',
    ctaDesc: 'Create an account and get label-ready assets for press, sync, and promotion.'
  },
  producers: {
    header: 'Tools for producers and studios',
    subtitle: 'Build your portfolio, pitch beats, and promote sessions with professional content.',
    cta: 'Create your demo pack →',
    ctaDesc: 'Sign up to generate polished producer profiles, sync pitches, and social assets.'
  },
  mediahouses: {
    header: 'Tools for media houses and brand teams',
    subtitle: 'Build music campaigns, licensing briefs, and curated playlists with ease.',
    cta: 'Explore media tools →',
    ctaDesc: 'Sign up to access tools built for licensing, campaigns, and creative operations.'
  }
};

// Tool definitions for landing page
const TOOL_CARDS = [
  { icon: 'brandkit', color: '#c084fc', n: 'Brand Kit AI', d: 'Name, taglines, tone of voice, colour direction', cost: '10 CREDITS', costColor: 'var(--a2)' },
  { icon: 'musicbio', color: '#22d3ee', n: 'Music Bio & Press Kit', d: 'Bio, press narrative, media pitch, interview angles', cost: '15 CREDITS', costColor: 'var(--a2)' },
  { icon: 'social', color: '#f43f5e', n: 'Social AI', d: 'Captions, hashtags, posting times for any platform', cost: 'FREE', costColor: 'var(--gr)' },
  { icon: 'syncpitch', color: '#f59e0b', n: 'Sync Pitch AI', d: 'Pitches for film, TV and advertising supervisors', cost: '20 CREDITS', costColor: 'var(--a2)' },
  { icon: 'pitchdeck', color: '#8b5cf6', n: 'Pitch Deck AI', d: 'Investor & grant pitch decks for East African markets', cost: '18 CREDITS', costColor: 'var(--a2)' }
];

function ToolsPage({ portal = 'music', subdomainPage = null, onOpenAuth, onToast }) {
  const [credits] = useState(150);
  const pageCopy = TOOL_PAGE_COPY[subdomainPage] || TOOL_PAGE_COPY.default;

  return (
    <>
      {/* Page Header */}
      <div className="ph" data-testid="tools-header">
        <div className="phi" style={{ background: 'radial-gradient(ellipse at 40% 60%,#3b1f6e,#08090d)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Intermaven › AI Tools</div>
          <div className="pht">{pageCopy.header}</div>
          <div className="phs">{pageCopy.subtitle}</div>
        </div>
      </div>

      {/* Tools Content */}
      <div style={{ padding: '28px 0 60px' }}>
        <div className="cn">
          {/* FREE DEMO — Try Social AI without signup */}
          <TrySocialAI onOpenAuth={onOpenAuth} onToast={onToast} />

          {/* Credits bar + top-up */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '24px', 
            flexWrap: 'wrap', 
            gap: '10px' 
          }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700' }}>AI Creative Studio</h2>
              <p style={{ fontSize: '12px', color: 'var(--mu)' }}>
                Use credits to generate professional assets instantly
              </p>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'var(--ca)', 
              border: '1px solid var(--b1)', 
              borderRadius: 'var(--r)', 
              padding: '8px 13px' 
            }}>
              <div>
                <div style={{ 
                  fontSize: '9px', 
                  color: 'var(--mu)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '.5px', 
                  fontWeight: '600' 
                }}>
                  Credits
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--a2)' }}>
                  {credits}
                </div>
              </div>
              <Link 
                to="/pricing" 
                style={{ 
                  padding: '6px 11px', 
                  borderRadius: 'var(--r)', 
                  fontSize: '9px', 
                  fontWeight: '700', 
                  letterSpacing: '.5px', 
                  textTransform: 'uppercase', 
                  background: 'var(--btn)', 
                  color: '#fff', 
                  border: 'none', 
                  cursor: 'pointer', 
                  textDecoration: 'none' 
                }}
              >
                Top up
              </Link>
            </div>
          </div>

          {/* Tool cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '10px', 
            marginBottom: '28px' 
          }}>
            {TOOL_CARDS.map((tool, index) => (
              <div 
                key={index}
                style={{ 
                  background: 'var(--ca)', 
                  border: '1px solid var(--b1)', 
                  borderRadius: 'var(--r)', 
                  padding: '14px',
                  cursor: 'pointer',
                  transition: '0.15s'
                }}
                onClick={() => onOpenAuth()}
                data-testid={`tool-card-${index}`}
              >
                <div style={{ marginBottom: '6px' }}>
                  <FlatIcon name={tool.icon} size={20} color={tool.color} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '3px' }}>{tool.n}</div>
                <div style={{ fontSize: '11px', color: 'var(--mu)' }}>{tool.d}</div>
                <div style={{ 
                  fontSize: '9px', 
                  color: tool.costColor, 
                  fontWeight: '700', 
                  marginTop: '6px' 
                }}>
                  {tool.cost}
                </div>
              </div>
            ))}
          </div>

          {/* Sign up CTA */}
          <div style={{ 
            background: 'var(--ca)', 
            border: '1px solid var(--b1)', 
            borderRadius: 'var(--r)', 
            padding: '24px', 
            textAlign: 'center',
            marginBottom: '28px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <FlatIcon name="rocket" size={28} color="var(--gr)" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
              Sign up to use AI tools
            </div>
            <p style={{ fontSize: '13px', color: 'var(--mu)', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
              Create a free account to access all AI tools with 150 free credits. No credit card required.
            </p>
            <button 
              className="hbp"
              onClick={onOpenAuth}
              style={{ display: 'inline-block' }}
              data-testid="tools-get-started"
            >
              {pageCopy.cta}
            </button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mu)', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
            {pageCopy.ctaDesc}
          </p>

          {/* CTA */}
          <div style={{ 
            marginTop: '32px', 
            background: 'linear-gradient(135deg, rgba(124,111,247,.12), rgba(34,211,238,.06))', 
            border: '1px solid rgba(124,111,247,.3)', 
            borderRadius: 'var(--r)', 
            padding: '28px', 
            textAlign: 'center' 
          }}>
            <div style={{ marginBottom: '10px' }}>
              <FlatIcon name="fire" size={26} color="var(--am)" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
              Need more credits?
            </div>
            <p style={{ fontSize: '13px', color: 'var(--mu)', marginBottom: '16px' }}>
              Upgrade to Creator (KES 500) for 600 credits, or Pro (KES 1,500) for 2,500 credits that never expire.
            </p>
            <Link 
              to="/pricing" 
              style={{ 
                display: 'inline-block', 
                padding: '10px 24px', 
                borderRadius: 'var(--r)', 
                fontSize: '11px', 
                fontWeight: '700', 
                letterSpacing: '.6px', 
                textTransform: 'uppercase', 
                background: 'var(--btn)', 
                color: '#fff', 
                textDecoration: 'none' 
              }}
            >
              See pricing →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ToolsPage;
