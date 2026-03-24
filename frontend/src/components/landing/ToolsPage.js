import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Tool definitions for landing page
const TOOL_CARDS = [
  { i: '🎨', n: 'Brand Kit AI', d: 'Name, taglines, tone of voice, colour direction', cost: '10 CREDITS', costColor: 'var(--a2)' },
  { i: '🎤', n: 'Music Bio & Press Kit', d: 'Bio, press narrative, media pitch, interview angles', cost: '15 CREDITS', costColor: 'var(--a2)' },
  { i: '📱', n: 'Social AI', d: 'Captions, hashtags, posting times for any platform', cost: 'FREE', costColor: 'var(--gr)' },
  { i: '📄', n: 'Sync Pitch AI', d: 'Pitches for film, TV and advertising supervisors', cost: '20 CREDITS', costColor: 'var(--a2)' },
  { i: '📋', n: 'Pitch Deck AI', d: 'Investor & grant pitch decks for East African markets', cost: '18 CREDITS', costColor: 'var(--a2)' }
];

function ToolsPage({ portal = 'music', onOpenAuth, onToast }) {
  const [credits] = useState(150);

  return (
    <>
      {/* Page Header */}
      <div className="ph" data-testid="tools-header">
        <div className="phi" style={{ background: 'radial-gradient(ellipse at 40% 60%,#3b1f6e,#08090d)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Intermaven › AI Tools</div>
          <div className="pht">AI Creative Studio</div>
          <div className="phs">Generate brand and music assets powered by AI</div>
        </div>
      </div>

      {/* Tools Content */}
      <div style={{ padding: '28px 0 60px' }}>
        <div className="cn">
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
                <div style={{ fontSize: '18px', marginBottom: '6px' }}>{tool.i}</div>
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚀</div>
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
              Get started free →
            </button>
          </div>

          {/* CTA */}
          <div style={{ 
            marginTop: '32px', 
            background: 'linear-gradient(135deg, rgba(124,111,247,.12), rgba(34,211,238,.06))', 
            border: '1px solid rgba(124,111,247,.3)', 
            borderRadius: 'var(--r)', 
            padding: '28px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>🔥</div>
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
