import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Layers, RotateCcw, ShieldCheck, Zap, Check, ArrowRight, Server, Layout, Sparkles } from 'lucide-react';
import PageHeader from './PageHeader';

function CmsPage({ onOpenAuth }) {
  const navigate = useNavigate();

  const handleTrySandbox = () => {
    navigate('/auth', { state: { mode: 'signin' } });
  };

  return (
    <div className="landing-page cms-page" style={{ background: '#08090d', color: '#f0f0f5' }}>
      {/* Page Hero Header */}
      <PageHeader
        badge="Phase 10 Flagship Feature"
        title={
          <>
            One Source of Truth.<br />
            <span style={{ color: '#10b981' }}>Every Portal. Every Region.</span>
          </>
        }
        subtitle="Intermaven Mother-CMS is the first multi-portal, region-aware content management system. Define content once and deliver context-aware localized copy to any domain, app, or audience."
      />

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTrySandbox}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 'bold', background: '#10b981', color: '#000000', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Zap size={18} /> Open CMS Admin Sandbox →
          </button>
          <a
            href="/docs/cms-overview.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Server size={18} /> Technical Documentation
          </a>
        </div>

        {/* Architecture Diagram Visualization */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '36px 24px',
          marginBottom: '80px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Unified Content Mesh Architecture
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '8px 0 24px' }}>
            Single Control Core → Infinite Distributed Consumer Endpoints
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '24px' }}>
            {[
              { title: 'intermaven.io', type: 'Creative OS Portal', desc: 'Regionalized payment callouts & creator playbooks', badge: 'Business & Music' },
              { title: 'tunemavens.com', type: 'Music Marketplace', desc: 'Sync briefs, DJ pool, and release metadata', badge: 'Music Portal' },
              { title: 'atltvmountpro.com', type: 'External Consumer', desc: 'Proof-of-concept multi-site CMS consumer', badge: 'External Partner' },
              { title: 'hospitality.intermaven.io', type: 'Hospitality Portal', desc: 'Menu, room service, and booking callouts', badge: 'Coming Soon' },
            ].map((node, i) => (
              <div key={i} style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '3px', color: '#10b981', fontWeight: 'bold' }}>
                    {node.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: '4px 0 2px', fontFamily: 'monospace' }}>{node.title}</h4>
                <div style={{ fontSize: '12px', color: '#60a5fa', marginBottom: '6px' }}>{node.type}</div>
                <p style={{ fontSize: '12px', color: '#9096b8', margin: 0, lineHeight: 1.4 }}>{node.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '28px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>1. Region-Aware Overrides</h3>
            <p style={{ fontSize: '14px', color: '#9096b8', lineHeight: 1.6, margin: 0 }}>
              Automatically detects visitor geo (72 countries, 55 currencies) and serves custom regional overrides. Show M-Pesa Paybill in Nairobi and Venmo/Zelle in Atlanta seamlessly.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '28px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginBottom: '16px' }}>
              <Layout size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>2. Portal-Aware Resolution</h3>
            <p style={{ fontSize: '14px', color: '#9096b8', lineHeight: 1.6, margin: 0 }}>
              Single key resolves different content based on active portal context (`business`, `music`, `hospitality`). Perfect for multi-brand corporate ecosystems.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '28px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '16px' }}>
              <RotateCcw size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>3. Audit History & Rollback</h3>
            <p style={{ fontSize: '14px', color: '#9096b8', lineHeight: 1.6, margin: 0 }}>
              Every content change logs pre-change snapshots with author ID and timestamp. Instant 1-click rollback restores any previous version safely.
            </p>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '32px 24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '800', textAlign: 'center', color: '#ffffff', marginBottom: '8px' }}>
            Mother-CMS vs. Traditional CMS Platforms
          </h3>
          <p style={{ fontSize: '14px', textAlign: 'center', color: '#9096b8', marginBottom: '32px' }}>
            Why enterprise agencies and multi-brand operators switch to Intermaven Mother-CMS.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '12px 16px', color: '#ffffff' }}>Capability</th>
                  <th style={{ padding: '12px 16px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>Intermaven Mother-CMS</th>
                  <th style={{ padding: '12px 16px', color: '#9096b8' }}>Webflow</th>
                  <th style={{ padding: '12px 16px', color: '#9096b8' }}>Contentful</th>
                  <th style={{ padding: '12px 16px', color: '#9096b8' }}>Sanity</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feat: 'Multi-Region Native Overrides', mother: true, w: false, c: 'Partial', s: 'Partial' },
                  { feat: 'Multi-Portal Context Routing', mother: true, w: false, c: false, s: false },
                  { feat: '1-Click Version Rollback', mother: true, w: true, c: true, s: true },
                  { feat: 'Geo-Aware Payment Scrubbing', mother: true, w: false, c: false, s: false },
                  { feat: 'Shared Credit & Auth Layer', mother: true, w: false, c: false, s: false },
                  { feat: 'Decoupled API Resolution', mother: true, w: false, c: true, s: true },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '600' }}>{row.feat}</td>
                    <td style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', fontWeight: 'bold' }}>
                      <Check size={16} /> Yes
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9096b8' }}>{row.w === true ? <Check size={14} /> : (row.w === false ? '✕' : row.w)}</td>
                    <td style={{ padding: '12px 16px', color: '#9096b8' }}>{row.c === true ? <Check size={14} /> : (row.c === false ? '✕' : row.c)}</td>
                    <td style={{ padding: '12px 16px', color: '#9096b8' }}>{row.s === true ? <Check size={14} /> : (row.s === false ? '✕' : row.s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CmsPage;
