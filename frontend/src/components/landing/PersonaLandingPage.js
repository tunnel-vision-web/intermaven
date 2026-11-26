import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import FlatIcon, { APP_ICON_META } from '../FlatIcon';
import SEO from '../SEO';
import { PERSONAS, getPersonaMeta } from '../../data/personasCatalog';
import { getHelpArticleBySlug } from '../../data/helpArticles';

export default function PersonaLandingPage({ onOpenAuth, onOpenSignIn }) {
  const { persona } = useParams();
  const navigate = useNavigate();
  const meta = getPersonaMeta(persona);

  const handleStartOnboarding = () => {
    localStorage.setItem('intermaven_pending_persona', meta.key);
    if (onOpenAuth) {
      onOpenAuth(meta.portal, meta.key);
    } else {
      navigate(`/auth?mode=register&persona=${meta.key}&portal=${meta.portal}`);
    }
  };

  return (
    <LandingLayout onOpenAuth={onOpenAuth} onOpenSignIn={onOpenSignIn}>
      <SEO title={`For ${meta.label}`} description={meta.tagline} canonical={`https://intermaven.io/for/${meta.key}`} />
      {/* Sticky Persona Switcher Toolbar (modeled on TuneMavens RoleLandingView) */}
      <nav
        aria-label="Audience persona switcher"
        style={{
          position: 'sticky',
          top: '70px',
          zIndex: 90,
          background: 'rgba(6, 8, 19, 0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#8b949e', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
          Seat:
        </span>
        {PERSONAS.map((r) => {
          const isActive = r.key === meta.key;
          return (
            <Link
              key={r.key}
              to={`/for/${r.key}`}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#060813' : '#e6edf3',
                background: isActive ? r.accent : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${r.accent}` : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {r.shortLabel}
            </Link>
          );
        })}
        <Link
          to="/for"
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 600,
            color: '#22d3ee',
            border: '1px solid rgba(34,211,238,0.3)',
            background: 'rgba(34,211,238,0.08)',
          }}
        >
          All Personas
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '56px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <FlatIcon name={meta.icon} size={52} color={meta.accent} />
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: `${meta.accent}22`,
                color: meta.accent,
                border: `1px solid ${meta.accent}55`,
              }}
            >
              {meta.side === 'creative' ? 'Creative & Media Seat' : 'Business & Enterprise Seat'} · {meta.subtitle}
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.325rem)', fontWeight: 800, margin: '0 0 14px', color: '#f8fafc', lineHeight: 1.12 }}>
          Intermaven for {meta.label}
        </h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '720px', lineHeight: 1.6, marginBottom: '28px' }}>
          {meta.tagline}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleStartOnboarding}
            style={{
              padding: '13px 24px',
              borderRadius: '10px',
              border: 'none',
              background: meta.accent,
              color: '#061224',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Start {meta.shortLabel} Onboarding →
          </button>
          <Link
            to="/pricing"
            style={{
              padding: '13px 22px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.04)',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            View Plans & Pricing
          </Link>
        </div>
      </section>

      {/* Recommended Apps */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px 40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
          Your {meta.shortLabel} App Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {meta.recommendedApps.map((appId) => {
            const appMeta = APP_ICON_META[appId] || { label: appId, bg: '#22d3ee' };
            return (
              <div
                key={appId}
                style={{
                  background: 'rgba(13, 17, 23, 0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <FlatIcon name={appId} size={36} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>{appMeta.label}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Included in Single Sign-On</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Persona-Specific Onboarding Checklist */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px 40px' }}>
        <div style={{ background: 'rgba(13, 17, 23, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>
            {meta.shortLabel} Onboarding Checklist
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 22px' }}>
            Follow these tailored steps to activate your {meta.label} workspace across Intermaven & TuneMavens.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {meta.onboardingSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: `${meta.accent}22`,
                    color: meta.accent,
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc', marginBottom: '6px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Reading */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Recommended Reading for {meta.label}
          </h2>
          <Link to="/help" style={{ color: '#22d3ee', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Browse All Help Articles →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {meta.recommendedReading.map((item) => {
            const fullArticle = getHelpArticleBySlug(item.slug);
            return (
              <Link
                key={item.slug}
                to={`/help?article=${item.slug}`}
                style={{
                  textDecoration: 'none',
                  background: 'rgba(13, 17, 23, 0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: meta.accent }}>
                  {item.category} {fullArticle ? `· ${fullArticle.readTime}` : ''}
                </span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>{item.title}</div>
                {fullArticle && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{fullArticle.summary}</p>
                )}
                <span style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', fontWeight: 700, color: '#22d3ee' }}>
                  Read Guide & Ask Maven AI →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </LandingLayout>
  );
}
