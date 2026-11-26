import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import PageHeader from './PageHeader';
import FlatIcon from '../FlatIcon';
import { PERSONAS } from '../../data/personasCatalog';

export default function PerfectForPage({ onOpenAuth, onOpenSignIn }) {
  const [sideFilter, setSideFilter] = useState('all');

  const filtered = sideFilter === 'all' ? PERSONAS : PERSONAS.filter((p) => p.side === sideFilter);

  return (
    <LandingLayout onOpenAuth={onOpenAuth} onOpenSignIn={onOpenSignIn}>
      <PageHeader
        badge="ECOSYSTEM PERSONAS"
        title="Built for Every Seat in the Ecosystem"
        subtitle="Whether you are a creator, record label, music supervisor, startup founder, merchant, or investor — Intermaven & TuneMavens adapt to your exact workflow."
      />

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Personas (${PERSONAS.length})` },
            { id: 'creative', label: 'Creative & Media (TuneMavens)' },
            { id: 'business', label: 'Business & Enterprise (Intermaven)' },
          ].map((tab) => {
            const active = sideFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSideFilter(tab.id)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '999px',
                  border: active ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.14)',
                  background: active ? 'rgba(34, 211, 238, 0.16)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#67e8f9' : '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Persona Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
          {filtered.map((p) => (
            <Link
              key={p.key}
              to={`/for/${p.key}`}
              style={{
                textDecoration: 'none',
                background: 'rgba(13, 17, 23, 0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FlatIcon name={p.icon} size={40} color={p.accent} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: p.accent, fontWeight: 700 }}>
                      {p.side === 'creative' ? 'Creative & Media' : 'Business & Enterprise'}
                    </div>
                    <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>{p.label}</h3>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{p.subtitle}</div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: '#cbd5e1', flex: 1 }}>{p.tagline}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '6px' }}>
                {p.recommendedApps.slice(0, 4).map((appId) => (
                  <FlatIcon key={appId} name={appId} size={24} />
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700, color: p.accent }}>
                  Explore Onboarding & Reading →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </LandingLayout>
  );
}
