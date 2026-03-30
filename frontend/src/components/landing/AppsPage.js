import React, { useState } from 'react';
import { ALL_APPS } from './AppInfoModal';
import BetaSignupCard, { BETA_APPS } from './BetaSignupCard';
import { FlatIcon } from '../FlatIcon';

const LIVE_APPS = ['brandkit', 'musicbio', 'syncpitch', 'social', 'bizpitch'];

function AppsPage({ portal = 'music', onOpenAppModal, onToast }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter apps based on portal
  const portalApps = ALL_APPS.filter(app => 
    app.p === 'both' || app.p === portal
  );

  // Filter apps based on active filter
  const filteredApps = portalApps.filter(app => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return LIVE_APPS.includes(app.id);
    if (activeFilter === 'ai') return ['brandkit', 'musicbio', 'syncpitch', 'social', 'bizpitch'].includes(app.id);
    if (activeFilter === 'music') return app.p === 'music' || app.p === 'both';
    if (activeFilter === 'business') return app.p === 'business' || app.p === 'both';
    if (activeFilter === 'brand') return ['brandkit'].includes(app.id);
    return true;
  });

  const filters = portal === 'music' 
    ? { 'All': 'all', 'Live now': 'live', 'AI Tools': 'ai', 'Music': 'music', 'Branding': 'brand' }
    : { 'All': 'all', 'Live now': 'live', 'Business': 'business', 'AI Tools': 'ai' };

  return (
    <>
      {/* Page Header */}
      <div className="ph" data-testid="apps-header">
        <div className="phi" style={{ background: 'radial-gradient(ellipse at 60% 40%,#003d4d,#08090d)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Intermaven › Apps</div>
          <div className="pht">App Marketplace</div>
          <div className="phs">Every tool your creative business needs</div>
        </div>
      </div>

      {/* Apps Content */}
      <div style={{ padding: '28px 0 60px' }}>
        <div className="cn">
          {/* Intro strip */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between', 
            marginBottom: '24px', 
            flexWrap: 'wrap', 
            gap: '14px' 
          }}>
            <div>
              <div className="sl2">App Marketplace</div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '800', 
                letterSpacing: '-.3px', 
                marginBottom: '6px' 
              }}>
                Standalone modules. One ecosystem.
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--mu)', maxWidth: '520px' }}>
                Pick only the apps you need. Each runs independently and adds to your dashboard. 
                Start free — no subscriptions, ever.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignSelf: 'flex-end' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                padding: '5px 11px', 
                borderRadius: 'var(--r)', 
                background: 'rgba(16,185,129,.1)', 
                border: '1px solid rgba(16,185,129,.3)', 
                fontSize: '10px', 
                fontWeight: '700', 
                color: 'var(--gr)' 
              }}>
                ● Live now
              </span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                padding: '5px 11px', 
                borderRadius: 'var(--r)', 
                background: 'var(--ca)', 
                border: '1px solid var(--b2)', 
                fontSize: '10px', 
                fontWeight: '700', 
                color: 'var(--mu)' 
              }}>
                ● Coming soon
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="apf">
            {Object.entries(filters).map(([label, value]) => (
              <button 
                key={value}
                className={`fb ${activeFilter === value ? 'on' : ''}`}
                onClick={() => setActiveFilter(value)}
                data-testid={`filter-${value}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* App grid */}
          <div className="apg" data-testid="apps-grid">
            {filteredApps.map((app) => {
              const isLive = LIVE_APPS.includes(app.id);
              return (
                <div 
                  key={app.id}
                  className="apc"
                  onClick={() => onOpenAppModal(app.id)}
                  data-testid={`app-card-${app.id}`}
                >
                  <div className="apacc" style={{ background: app.col }} />
                  <div className="aph2">
                    <div className="apiw" style={{ background: `${app.col}20` }}>
                      <FlatIcon name={app.icon} size={18} color={app.col} />
                    </div>
                    <span className={`aps ${isLive ? 'slv' : 'ssn'}`}>
                      {isLive ? 'Live' : 'Soon'}
                    </span>
                  </div>
                  <h3>{app.n}</h3>
                  <p>{app.d}</p>
                  <button className="apa">
                    {isLive ? 'Open app' : 'Learn more'} →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cross-portal CTA */}
          <div className="acta">
            <h3>{portal === 'music' ? 'Need business tools?' : 'Need creative tools?'}</h3>
            <p>
              {portal === 'music' 
                ? 'POS, invoicing and business AI at intermaven.io.' 
                : 'Brand kits, press kits and sync pitches at music.intermaven.io.'}
            </p>
            <button 
              className="hbp"
              onClick={() => onToast('Portal switch coming soon!', '', '🔄')}
            >
              {portal === 'music' ? 'Go to intermaven.io' : 'Go to music.intermaven.io'} →
            </button>
          </div>

          {/* Roadmap teaser */}
          <div style={{ 
            marginTop: '32px', 
            background: 'var(--ca)', 
            border: '1px solid var(--b1)', 
            borderRadius: 'var(--r)', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '28px' }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
                  What's coming next
                </div>
                <p style={{ fontSize: '12px', color: 'var(--mu)', marginBottom: '14px' }}>
                  We ship new apps regularly. Sign up below to get early access.
                </p>
              </div>
            </div>
          </div>

          {/* Beta Signup Cards */}
          <div className="apg" style={{ marginTop: '20px' }} data-testid="beta-cards">
            {Object.keys(BETA_APPS).map(appId => {
              const app = BETA_APPS[appId];
              // Filter by portal
              if (app.portal !== 'both' && app.portal !== portal) return null;
              return (
                <BetaSignupCard 
                  key={appId} 
                  appId={appId} 
                  onToast={onToast}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default AppsPage;
