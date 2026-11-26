import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import PageHeader from './PageHeader';
import SEO from '../SEO';
import FlatIcon from '../FlatIcon';
import { PERSONAS } from '../../data/personasCatalog';

export default function PerfectForPage({ onOpenAuth, onOpenSignIn }) {
  const [sideFilter, setSideFilter] = useState('all');

  const filtered = sideFilter === 'all' ? PERSONAS : PERSONAS.filter((p) => p.side === sideFilter);

  return (
    <LandingLayout onOpenAuth={onOpenAuth} onOpenSignIn={onOpenSignIn}>
      <SEO
        title="Perfect For — Every Seat in the Ecosystem"
        description="Explore tailored onboarding, recommended apps, and guides for Creators, Labels, Supervisors, DJs, Founders, Merchants, Agencies, Corporate, and Investors."
        canonical="https://intermaven.io/for"
      />
      <PageHeader
        pageKey="about"
        portal="business"
        breadcrumb="Intermaven › About › Perfect For"
        title="Built for Every Seat in the Ecosystem"
        subtitle="Whether you are a creator, record label, music supervisor, startup founder, merchant, or investor — Intermaven & TuneMavens adapt to your exact workflow."
      />

      <section style={{ padding: '44px 0 72px' }}>
        <div className="cn">
          {/* Filter Pills */}
          <div className="apf" style={{ justifyContent: 'center', marginBottom: '28px' }}>
            {[
              { id: 'all', label: `All Personas (${PERSONAS.length})` },
              { id: 'creative', label: 'Creative & Media (TuneMavens)' },
              { id: 'business', label: 'Business & Enterprise (Intermaven)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`apfb${sideFilter === tab.id ? ' on' : ''}`}
                onClick={() => setSideFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Persona Grid using standard .apg / .apc cards */}
          <div className="apg">
            {filtered.map((p) => (
              <Link
                key={p.key}
                to={`/for/${p.key}`}
                className="apc"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
              >
                <div className="apacc" style={{ background: p.accent }} />
                <div className="aph2">
                  <div className="apiw" style={{ background: `${p.accent}20` }}>
                    <FlatIcon name={p.icon} size={24} color={p.accent} />
                  </div>
                  <span className="aps slv" style={{ color: p.accent, borderColor: `${p.accent}44`, background: `${p.accent}18` }}>
                    {p.side === 'creative' ? 'Creative' : 'Business'}
                  </span>
                </div>
                <h3>{p.label}</h3>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mu)', marginBottom: '8px' }}>{p.subtitle}</div>
                <p style={{ flex: 1 }}>{p.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--b1)' }}>
                  {p.recommendedApps.slice(0, 4).map((appId, idx) => (
                    <FlatIcon key={`${appId}-${idx}`} name={appId} size={22} />
                  ))}
                  <span className="apa" style={{ marginLeft: 'auto', color: p.accent }}>
                    Onboarding &amp; Reading →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
