import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import PageHeader from './PageHeader';
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

      <PageHeader
        pageKey="apps"
        portal={meta.portal}
        breadcrumb={`Intermaven › Perfect For › ${meta.label}`}
        title={`Intermaven for ${meta.label}`}
        subtitle={meta.tagline}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px', justifyContent: 'center' }}>
          <button type="button" className="hbp" onClick={handleStartOnboarding}>
            Start {meta.shortLabel} Onboarding →
          </button>
          <Link to="/pricing" className="hbg" style={{ textDecoration: 'none' }}>
            View Plans (Free in Beta)
          </Link>
        </div>
      </PageHeader>

      {/* Sticky Persona Switcher Toolbar */}
      <nav
        aria-label="Audience persona switcher"
        style={{
          position: 'sticky',
          top: '68px',
          zIndex: 90,
          background: 'rgba(6, 8, 19, 0.94)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--b1)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: 'var(--mu)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
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
                borderRadius: 'var(--r)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#060813' : 'var(--tx)',
                background: isActive ? r.accent : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${r.accent}` : '1px solid var(--b1)',
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
            borderRadius: 'var(--r)',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--a2)',
            border: '1px solid rgba(34,211,238,0.3)',
            background: 'rgba(34,211,238,0.08)',
          }}
        >
          All Personas
        </Link>
      </nav>

      <section style={{ padding: '28px 0 64px' }}>
        <div className="cn" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Persona Overview Content Box */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', borderRadius: 'var(--r)', padding: '24px' }}>
            <div className="sl2" style={{ marginBottom: '8px' }}>Seat Overview · {meta.subtitle}</div>
            <p style={{ margin: 0, color: 'var(--mu)', fontSize: '14px', lineHeight: 1.65 }}>
              {meta.tagline} All tools below sync under a single login and are free to test during our Beta phase.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: 0 }} />

          {/* Recommended Apps */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', borderRadius: 'var(--r)', padding: '24px' }}>
            <div className="sl2">Your {meta.shortLabel} App Stack</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {meta.recommendedApps.map((appId, idx) => {
                const appMeta = APP_ICON_META[appId] || { label: appId, bg: '#22d3ee' };
                return (
                  <div
                    key={`${appId}-${idx}`}
                    style={{
                      background: 'var(--ca)',
                      border: '1px solid var(--b1)',
                      borderRadius: 'var(--r)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <FlatIcon name={appId} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--tx)' }}>{appMeta.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--mu)' }}>Included in Single Sign-On</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: 0 }} />

          {/* Persona-Specific Onboarding Checklist */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', borderRadius: 'var(--r)', padding: '28px' }}>
            <div className="sl2" style={{ marginBottom: '6px' }}>{meta.shortLabel} Onboarding Checklist</div>
            <p style={{ color: 'var(--mu)', fontSize: '14px', margin: '0 0 20px' }}>
              Follow these tailored steps to activate your {meta.label} workspace across Intermaven &amp; TuneMavens.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {meta.onboardingSteps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--b1)',
                    borderRadius: 'var(--r)',
                    padding: '18px',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
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
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--tx)', marginBottom: '6px' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--mu)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: 0 }} />

          {/* Recommended Reading */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', borderRadius: 'var(--r)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div className="sl2" style={{ margin: 0 }}>Recommended Reading for {meta.label}</div>
              <Link to="/help" style={{ color: 'var(--a2)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
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
                    className="apc"
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: meta.accent }}>
                      {item.category} {fullArticle ? `· ${fullArticle.readTime}` : ''}
                    </span>
                    <h3 style={{ margin: 0 }}>{item.title}</h3>
                    {fullArticle && <p style={{ flex: 1 }}>{fullArticle.summary}</p>}
                    <span className="apa" style={{ marginTop: 'auto', color: 'var(--a2)' }}>
                      Read Guide &amp; Ask Maven AI →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
