import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../App';
import { invalidateSeoBundleCache } from './SEO';
import {
  Globe, Search, Sparkles, CheckCircle, RefreshCw,
  Save, Plus, Trash2, ExternalLink, Shield, Activity, Code,
  Share2, FileText, Eye, Copy, Check, Edit2, X, Wrench, ArrowRight, Image
} from 'lucide-react';

const SUB_TABS = [
  { id: 'audit', label: 'SEO Audit & CWV', icon: Activity },
  { id: 'global', label: 'Global Meta & Cards', icon: Globe },
  { id: 'pages', label: 'Page Overrides & AI', icon: FileText },
  { id: 'schema', label: 'Schema & Social Graph', icon: Share2 },
  { id: 'pixels', label: 'Pixels & Consent', icon: Shield },
  { id: 'crawlers', label: 'Sitemap & Robots', icon: Code },
];

const SCHEMA_TYPES = [
  'WebSite',
  'Organization',
  'SoftwareApplication',
  'Product',
  'FAQPage',
  'Article',
  'LocalBusiness',
  'BreadcrumbList',
];

const OG_IMAGE_PRESETS = [
  { label: 'Business Hero (16:9)', url: '/images/hero/intermaven/hero-1.jpg' },
  { label: 'Music Hero (16:9)', url: '/images/hero/intermavenmusic/hero-1.jpg' },
  { label: 'Tools Banner', url: '/images/headers/intermaven/header-tools.jpg' },
  { label: 'Apps Banner', url: '/images/headers/intermaven/header-apps.jpg' },
  { label: 'Pricing Banner', url: '/images/headers/intermaven/header-pricing.jpg' },
  { label: 'About Banner', url: '/images/headers/intermaven/header-about.jpg' },
  { label: 'Brand Icon (512px)', url: '/icon-512.png' },
];

const DEFAULT_FALLBACK_OG = '/images/hero/intermaven/hero-1.jpg';

/**
 * Resolves an OG image URL so that URLs pointing to the production base_url
 * (e.g. https://intermaven.io/images/...) render from the local public/ folder
 * during preview on localhost or staging without breaking.
 */
function resolvePreviewImageUrl(rawUrl, baseUrl = 'https://intermaven.io') {
  if (!rawUrl || !String(rawUrl).trim()) return DEFAULT_FALLBACK_OG;
  const trimmed = String(rawUrl).trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('/')) return trimmed;

  const cleanBase = (baseUrl || 'https://intermaven.io').replace(/\/$/, '');
  if (trimmed.startsWith(cleanBase + '/')) {
    return trimmed.slice(cleanBase.length);
  }
  if (trimmed.startsWith('https://intermaven.io/')) {
    return trimmed.slice('https://intermaven.io'.length);
  }
  if (trimmed.startsWith('http://intermaven.io/')) {
    return trimmed.slice('http://intermaven.io'.length);
  }
  return trimmed;
}

function StatusPill({ status }) {
  const map = {
    pass: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', color: '#10b981', text: 'PASS' },
    warn: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', color: '#f59e0b', text: 'WARN' },
    fail: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', color: '#ef4444', text: 'FAIL' },
  };
  const s = map[status] || map.warn;
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 700,
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      letterSpacing: '0.04em'
    }}>
      {s.text}
    </span>
  );
}

function SocialCardPreview({ imageUrl, baseUrl, title, description }) {
  const [imgBroken, setImgBroken] = useState(false);
  const resolvedSrc = resolvePreviewImageUrl(imageUrl, baseUrl);

  useEffect(() => {
    setImgBroken(false);
  }, [imageUrl, baseUrl]);

  const displayHost = (baseUrl || 'https://intermaven.io').replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div style={{ background: '#151821', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 175, background: '#090b10', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <img
          src={imgBroken ? DEFAULT_FALLBACK_OG : resolvedSrc}
          alt="Open Graph social share card preview"
          onError={() => setImgBroken(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: resolvedSrc.endsWith('icon-512.png') && !imgBroken ? 'contain' : 'cover',
            padding: resolvedSrc.endsWith('icon-512.png') && !imgBroken ? 18 : 0,
          }}
        />
        {imgBroken && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '3px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.9)', color: '#000', fontSize: 10, fontWeight: 700 }}>
            Unreachable URL — showing fallback banner
          </div>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {displayHost}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 3, lineHeight: 1.3 }}>
          {title || 'Intermaven — AI Business & Creator OS'}
        </div>
        <div style={{ fontSize: 12, color: '#9096b8', marginTop: 4, lineHeight: 1.4 }}>
          {(description || '').slice(0, 125)}{(description || '').length > 125 ? '...' : ''}
        </div>
      </div>
    </div>
  );
}

export default function AdminSEOPanel({ addToast }) {
  const toastRef = useRef(addToast);
  toastRef.current = addToast;

  const [subTab, setSubTab] = useState('audit');
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // Global Config & Pages State
  const [config, setConfig] = useState(null);
  const [robotsPreview, setRobotsPreview] = useState('');
  const [pages, setPages] = useState([]);
  const [pageSearch, setPageSearch] = useState('');

  // Page Editor Modal State
  const [editingPage, setEditingPage] = useState(null);
  const [savingPage, setSavingPage] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [focusKeywords, setFocusKeywords] = useState('');

  // Post-Audit Remediation & Verification Modal State
  const [runningAudit, setRunningAudit] = useState(false);
  const [remediatingKey, setRemediatingKey] = useState(null);
  const [latestAudit, setLatestAudit] = useState(null);
  const [auditRouteFilter, setAuditRouteFilter] = useState('issues'); // 'issues' | 'all'
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verifDraft, setVerifDraft] = useState({ google_site_verification: '', bing_site_verification: '' });
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);

  // Disallow paths & ecosystem helper inputs
  const [disallowInput, setDisallowInput] = useState('');
  const [ecosystemInput, setEcosystemInput] = useState('');

  const apiBase = api.defaults.baseURL || 'http://localhost:8005';

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, pagesRes, auditsRes] = await Promise.all([
        api.get('/api/admin/seo/config'),
        api.get('/api/admin/seo/pages'),
        api.get('/api/admin/seo/audits').catch(() => ({ data: { audits: [] } })),
      ]);
      const cfg = cfgRes.data?.config || {};
      setConfig(cfg);
      setRobotsPreview(cfgRes.data?.robots_preview || '');
      setDisallowInput(((cfg.robots || {}).disallow_paths || []).join('\n'));
      setEcosystemInput(((cfg.social_accounts || {}).ecosystem || []).join('\n'));
      setPages(pagesRes.data?.pages || []);

      const past = auditsRes.data?.audits || [];
      if (past.length > 0) {
        setLatestAudit(past[0]);
      }
    } catch (err) {
      toastRef.current?.('SEO Load Error', err.response?.data?.detail || 'Could not load SEO settings', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveGlobal = async (overrideCfg = null, reRunAuditAfter = false) => {
    const activeCfg = overrideCfg || config;
    if (!activeCfg) return;
    setSavingConfig(true);
    try {
      const payload = {
        ...activeCfg,
        robots: {
          ...(activeCfg.robots || {}),
          disallow_paths: disallowInput
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean),
        },
        social_accounts: {
          ...(activeCfg.social_accounts || {}),
          ecosystem: ecosystemInput
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean),
        },
      };
      const res = await api.put('/api/admin/seo/config', payload);
      setConfig(res.data?.config || payload);
      if (res.data?.robots_preview) setRobotsPreview(res.data.robots_preview);
      invalidateSeoBundleCache();
      toastRef.current?.('SEO Settings Saved', 'Global metadata, schemas, and pixels updated.', 'success');

      if (reRunAuditAfter) {
        const auditRes = await api.post('/api/admin/seo/audit');
        setLatestAudit(auditRes.data);
      }
    } catch (err) {
      toastRef.current?.('Save Failed', err.response?.data?.detail || 'Failed to update SEO settings', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRunAudit = async () => {
    setRunningAudit(true);
    try {
      const res = await api.post('/api/admin/seo/audit');
      setLatestAudit(res.data);
      toastRef.current?.('SEO Audit Complete', `Overall Score: ${res.data?.overall_score}/100`, 'success');
    } catch (err) {
      toastRef.current?.('Audit Failed', err.response?.data?.detail || 'Could not complete SEO audit', 'error');
    } finally {
      setRunningAudit(false);
    }
  };

  const handleRemediate = async (body, keyLabel) => {
    setRemediatingKey(keyLabel);
    try {
      const res = await api.post('/api/admin/seo/remediate', body);
      if (res.data?.config) {
        setConfig(res.data.config);
        setDisallowInput(((res.data.config.robots || {}).disallow_paths || []).join('\n'));
        setEcosystemInput(((res.data.config.social_accounts || {}).ecosystem || []).join('\n'));
      }
      if (res.data?.pages) setPages(res.data.pages);
      if (res.data?.audit) setLatestAudit(res.data.audit);
      invalidateSeoBundleCache();

      const summaryText = (res.data?.actions_applied || []).join(' · ') || 'SEO configuration repaired and re-audited.';
      toastRef.current?.('Issue Remediated', summaryText, 'success');
    } catch (err) {
      toastRef.current?.('Remediation Failed', err.response?.data?.detail || 'Could not auto-fix SEO item', 'error');
    } finally {
      setRemediatingKey(null);
    }
  };

  const openVerificationQuickModal = () => {
    setVerifDraft({
      google_site_verification: config?.verification?.google_site_verification || '',
      bing_site_verification: config?.verification?.bing_site_verification || '',
    });
    setVerificationModalOpen(true);
  };

  const handleSaveVerificationModal = async () => {
    const nextCfg = {
      ...config,
      verification: {
        ...(config?.verification || {}),
        google_site_verification: verifDraft.google_site_verification.trim(),
        bing_site_verification: verifDraft.bing_site_verification.trim(),
      },
    };
    setConfig(nextCfg);
    setVerificationModalOpen(false);
    await handleSaveGlobal(nextCfg, true);
  };

  const openPageEditor = (pageObj = null) => {
    setFocusKeywords('');
    if (pageObj) {
      const fullPage = pages.find(p => p.path === pageObj.path) || pageObj;
      setEditingPage({ ...fullPage });
    } else {
      const base = (config?.base_url || 'https://intermaven.io').replace(/\/$/, '');
      setEditingPage({
        path: '/new-page',
        label: 'New Landing Page',
        title: '',
        description: '',
        og_title: '',
        og_description: '',
        og_image: config?.default_og_image || DEFAULT_FALLBACK_OG,
        canonical: `${base}/new-page`,
        schema_type: 'WebSite',
        sitemap_include: true,
        sitemap_priority: 0.7,
        sitemap_changefreq: 'weekly',
        noindex: false,
        isNew: true,
      });
    }
  };

  const handleAiSuggestPage = async () => {
    if (!editingPage) return;
    setAiSuggesting(true);
    try {
      const res = await api.post('/api/admin/seo/ai-suggest', {
        path: editingPage.path,
        label: editingPage.label,
        current_title: editingPage.title,
        current_description: editingPage.description,
        focus_keywords: focusKeywords,
        portal: 'business',
      });
      const s = res.data?.suggestion;
      if (s) {
        setEditingPage(prev => ({
          ...prev,
          title: s.title || prev.title,
          description: s.description || prev.description,
          og_title: s.og_title || prev.og_title,
          og_description: s.og_description || prev.og_description,
          schema_type: s.schema_type || prev.schema_type,
        }));
        toastRef.current?.('AI Meta Generated', 'Applied optimized title, description & Open Graph copy.', 'success');
      }
    } catch (err) {
      toastRef.current?.('AI Suggest Failed', 'Could not generate SEO copy right now.', 'error');
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSavePage = async () => {
    if (!editingPage?.path || !editingPage?.title || !editingPage?.description) {
      toastRef.current?.('Missing Fields', 'Route path, title, and meta description are required.', 'error');
      return;
    }
    setSavingPage(true);
    try {
      const res = await api.put('/api/admin/seo/pages', editingPage);
      const saved = res.data?.page;
      setPages(prev => {
        const exists = prev.some(p => p.path === saved.path);
        return exists ? prev.map(p => (p.path === saved.path ? saved : p)) : [saved, ...prev];
      });
      invalidateSeoBundleCache();
      setEditingPage(null);
      toastRef.current?.('Route SEO Saved', `Updated metadata for ${saved.path}`, 'success');

      // If we are on the Audit tab, automatically re-run audit so status updates immediately!
      if (subTab === 'audit') {
        const auditRes = await api.post('/api/admin/seo/audit');
        setLatestAudit(auditRes.data);
      }
    } catch (err) {
      toastRef.current?.('Save Failed', err.response?.data?.detail || 'Could not save page SEO', 'error');
    } finally {
      setSavingPage(false);
    }
  };

  const handleDeletePage = async (path) => {
    if (path === '/') return;
    if (!window.confirm(`Delete custom SEO entry for ${path}?`)) return;
    try {
      await api.delete(`/api/admin/seo/pages?path=${encodeURIComponent(path)}`);
      setPages(prev => prev.filter(p => p.path !== path));
      invalidateSeoBundleCache();
      toastRef.current?.('Route Removed', `Removed ${path} override`, 'success');
    } catch (err) {
      toastRef.current?.('Delete Failed', err.response?.data?.detail || 'Could not delete route', 'error');
    }
  };

  const updateNested = (section, key, val) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [key]: val,
      },
    }));
  };

  const buildOrgJsonLdPreview = () => {
    if (!config) return '{}';
    const base = (config.base_url || 'https://intermaven.io').replace(/\/$/, '');
    const org = config.organization || {};
    const soc = config.social_accounts || {};
    const eco = ecosystemInput.split('\n').map(s => s.trim()).filter(Boolean);
    const sameAs = [
      soc.instagram, soc.tiktok, soc.x, soc.linkedin, soc.youtube, soc.facebook, ...eco
    ].filter(Boolean);

    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${base}/#organization`,
            name: org.name || config.site_name || 'Intermaven',
            legalName: org.legal_name || 'Intermaven Technologies',
            url: org.url || base,
            logo: org.logo || config.default_og_image,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: org.contact_email || 'hello@intermaven.io',
              telephone: org.contact_phone || '+254 700 000 000',
            },
            sameAs,
          },
          {
            '@type': 'WebSite',
            '@id': `${base}/#website`,
            url: base,
            name: config.site_name || 'Intermaven',
            publisher: { '@id': `${base}/#organization` },
          },
        ],
      },
      null,
      2
    );
  };

  if (loading || !config) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9096b8' }}>
        <RefreshCw size={20} className="spinner" style={{ marginBottom: 8 }} />
        <div>Loading Phase 9 SEO Control Center...</div>
      </div>
    );
  }

  const filteredPages = pages.filter(p =>
    `${p.path} ${p.label} ${p.title}`.toLowerCase().includes(pageSearch.toLowerCase())
  );

  const scoreColor = (score) => (score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : '#ef4444');

  const auditChecksWithIssues = (latestAudit?.checks || []).filter(c => c.status !== 'pass');
  const auditPagesWithIssues = (latestAudit?.page_findings || []).filter(p => p.issues && p.issues.length > 0);
  const hasAutoFixableIssues =
    auditChecksWithIssues.some(c => c.fix_mode === 'auto') || auditPagesWithIssues.length > 0;

  const displayedAuditRoutes =
    auditRouteFilter === 'issues' && auditPagesWithIssues.length > 0
      ? auditPagesWithIssues
      : (latestAudit?.page_findings || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#f0f0f5' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(34, 211, 238, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 10,
        padding: '18px 22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={19} style={{ color: '#10b981' }} /> SEO & Search Visibility Control Center
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9096b8' }}>
            Manage global meta defaults, per-route overrides, JSON-LD Schema.org graph, consent-aware pixels, dynamic sitemap.xml, and 1-click audit remediation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a
            href={`${apiBase}/api/seo/sitemap.xml`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '7px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#cbd5e1', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            sitemap.xml <ExternalLink size={12} />
          </a>
          <a
            href={`${apiBase}/api/seo/robots.txt`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '7px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#cbd5e1', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            robots.txt <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={runningAudit}
            style={{ padding: '7px 14px', borderRadius: 6, background: '#10b981', border: 'none', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Activity size={14} /> {runningAudit ? 'Auditing...' : 'Run Full SEO Audit'}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
        {SUB_TABS.map(({ id, label, icon: Icon }) => {
          const active = subTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: active ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255,255,255,0.02)',
                color: active ? '#10b981' : '#cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SEO AUDIT, REMEDIATION & CORE WEB VITALS ────────────────────── */}
      {subTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!latestAudit ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 36, textAlign: 'center' }}>
              <Activity size={34} style={{ color: '#10b981', marginBottom: 10 }} />
              <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>No SEO Audit Executed Yet</h3>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#9096b8' }}>
                Click "Run Full SEO Audit" to inspect all route titles, descriptions, canonicals, JSON-LD schemas, image alt-text coverage, and internal links.
              </p>
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={runningAudit}
                style={{ padding: '9px 18px', borderRadius: 6, background: '#10b981', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                {runningAudit ? 'Running Audit...' : 'Launch Phase 9 SEO Audit Pass'}
              </button>
            </div>
          ) : (
            <>
              {/* Post-Audit Remediation Action Bar */}
              {(auditChecksWithIssues.length > 0 || auditPagesWithIssues.length > 0) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(168, 85, 247, 0.12))',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Wrench size={15} /> {auditChecksWithIssues.length + auditPagesWithIssues.length} Actionable Item(s) Detected
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>
                      Use the 1-click remediation buttons on any row below — or run Auto-Fix All to repair metadata, indexing, social graph, unmapped routes, and alt tags automatically.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {auditChecksWithIssues.some(c => c.check_id === 'webmaster_verification') && (
                      <button
                        type="button"
                        onClick={openVerificationQuickModal}
                        style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(34, 211, 238, 0.18)', border: '1px solid #22d3ee', color: '#22d3ee', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Globe size={13} /> Enter GSC / Bing Tokens
                      </button>
                    )}
                    {hasAutoFixableIssues && (
                      <button
                        type="button"
                        onClick={() => handleRemediate({ action: 'fix_all_auto' }, 'fix_all')}
                        disabled={remediatingKey === 'fix_all'}
                        style={{ padding: '8px 16px', borderRadius: 6, background: '#f59e0b', border: 'none', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Sparkles size={14} /> {remediatingKey === 'fix_all' ? 'Auto-Fixing...' : 'Auto-Fix All Issues'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Score Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 12 }}>
                <div style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${scoreColor(latestAudit.overall_score)}55`, borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 11, color: '#9096b8', textTransform: 'uppercase', fontWeight: 700 }}>Overall SEO Score</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: scoreColor(latestAudit.overall_score), marginTop: 4 }}>
                    {latestAudit.overall_score}<span style={{ fontSize: 14, color: '#9096b8' }}>/100</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9096b8', marginTop: 4 }}>
                    {new Date(latestAudit.created_at).toLocaleString()}
                  </div>
                </div>

                {Object.entries(latestAudit.category_scores || {}).map(([k, val]) => (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 11, color: '#9096b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      {k.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor(val), marginTop: 6 }}>{val}%</div>
                  </div>
                ))}
              </div>

              {/* Diagnostic Checks with Direct In-System Fix Buttons */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 18 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Diagnostic Checks & Direct Fixes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(latestAudit.checks || []).map((c, idx) => {
                    const cid = c.check_id || `check-${idx}`;
                    const needsFix = c.status !== 'pass';
                    return (
                      <div key={cid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'rgba(0,0,0,0.28)', borderRadius: 6, border: needsFix ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>
                            {c.title} <span style={{ fontSize: 11, color: '#9096b8', fontWeight: 400 }}>({c.category})</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#9096b8', marginTop: 2 }}>{c.detail}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {needsFix && c.fix_mode === 'modal_verification' && (
                            <button
                              type="button"
                              onClick={openVerificationQuickModal}
                              style={fixBtnStyle}
                            >
                              <Wrench size={12} /> {c.fix_label || 'Configure Tokens'}
                            </button>
                          )}

                          {needsFix && c.fix_mode === 'auto' && (
                            <button
                              type="button"
                              onClick={() => handleRemediate({ action: 'fix_check', check_id: cid }, cid)}
                              disabled={remediatingKey === cid}
                              style={fixBtnStyle}
                            >
                              <Sparkles size={12} /> {remediatingKey === cid ? 'Fixing...' : (c.fix_label || 'Auto-Fix')}
                            </button>
                          )}

                          {c.nav_tab && (
                            <button
                              type="button"
                              onClick={() => setSubTab(c.nav_tab)}
                              style={{ padding: '4px 9px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              Settings <ArrowRight size={11} />
                            </button>
                          )}

                          <StatusPill status={c.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-Route Audit Findings & 1-Click Fix / Edit Table */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                      Route-by-Route SEO Inspection ({auditPagesWithIssues.length} with warnings · {(latestAudit.page_findings || []).length} total)
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setAuditRouteFilter('issues')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: auditRouteFilter === 'issues' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                        background: auditRouteFilter === 'issues' ? 'rgba(245,158,11,0.16)' : 'transparent',
                        color: auditRouteFilter === 'issues' ? '#fbbf24' : '#9096b8',
                      }}
                    >
                      Warnings ({auditPagesWithIssues.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditRouteFilter('all')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: auditRouteFilter === 'all' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                        background: auditRouteFilter === 'all' ? 'rgba(16,185,129,0.16)' : 'transparent',
                        color: auditRouteFilter === 'all' ? '#10b981' : '#9096b8',
                      }}
                    >
                      All Routes ({(latestAudit.page_findings || []).length})
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayedAuditRoutes.map(pf => {
                    const hasIssue = pf.issues && pf.issues.length > 0;
                    return (
                      <div key={pf.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.28)', borderRadius: 6, border: hasIssue ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981', fontSize: 12 }}>{pf.path}</span>
                            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{pf.label}</span>
                            <span style={{ fontSize: 10, color: '#9096b8' }}>({pf.title_len}c title · {pf.desc_len}c desc)</span>
                          </div>
                          <div style={{ fontSize: 11, color: hasIssue ? '#fbbf24' : '#10b981', marginTop: 3 }}>
                            {hasIssue ? pf.issues.join(' · ') : 'Title, meta description, canonical & Open Graph card verified'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {hasIssue && (
                            <button
                              type="button"
                              onClick={() => handleRemediate({ action: 'fix_page', path: pf.path }, `page-${pf.path}`)}
                              disabled={remediatingKey === `page-${pf.path}`}
                              style={fixBtnStyle}
                            >
                              <Sparkles size={11} /> {remediatingKey === `page-${pf.path}` ? 'Fixing...' : 'Auto-Fix'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openPageEditor(pf)}
                            style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit2 size={11} /> Edit Meta
                          </button>
                          <StatusPill status={pf.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Core Web Vitals & Lighthouse Targets */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#22d3ee' }}>Core Web Vitals & Lighthouse Targets</span>
                  <button
                    type="button"
                    onClick={() => setSubTab('crawlers')}
                    style={{ background: 'none', border: 'none', color: '#22d3ee', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Adjust Budgets →
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {[
                    { label: 'Lighthouse SEO Target', val: `${config.performance_targets?.lighthouse_seo || 96}/100` },
                    { label: 'Lighthouse Perf Target', val: `${config.performance_targets?.lighthouse_performance || 90}/100` },
                    { label: 'LCP Budget', val: `<= ${config.performance_targets?.lcp_ms || 2500} ms` },
                    { label: 'INP Budget', val: `<= ${config.performance_targets?.inp_ms || 200} ms` },
                    { label: 'CLS Budget', val: `<= ${config.performance_targets?.cls ?? 0.1}` },
                    { label: 'Images w/ Alt Text', val: `${latestAudit.source_scan?.images_with_alt ?? 0}/${latestAudit.source_scan?.total_images ?? 0}` },
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 11, color: '#9096b8' }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981', marginTop: 3 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt-Text & Internal Link Findings with 1-Click Remediation */}
              {((latestAudit.source_scan?.missing_alt_items?.length > 0) || (latestAudit.source_scan?.broken_link_items?.length > 0)) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                  {latestAudit.source_scan?.missing_alt_items?.length > 0 && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
                          Images Missing alt="" ({latestAudit.source_scan.missing_alt_items.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemediate({ action: 'fix_check', check_id: 'image_alt_text' }, 'image_alt_text')}
                          disabled={remediatingKey === 'image_alt_text'}
                          style={fixBtnStyle}
                        >
                          <Wrench size={11} /> Auto-Tag All
                        </button>
                      </div>
                      {latestAudit.source_scan.missing_alt_items.slice(0, 8).map((it, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#cbd5e1', fontFamily: 'monospace', padding: '3px 0' }}>
                          {it.file}:{it.line}
                        </div>
                      ))}
                    </div>
                  )}
                  {latestAudit.source_scan?.broken_link_items?.length > 0 && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
                          Unregistered Internal Links ({latestAudit.source_scan.broken_link_items.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemediate({ action: 'fix_check', check_id: 'internal_links' }, 'internal_links')}
                          disabled={remediatingKey === 'internal_links'}
                          style={fixBtnStyle}
                        >
                          <Plus size={11} /> Register All
                        </button>
                      </div>
                      {latestAudit.source_scan.broken_link_items.slice(0, 8).map((it, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#cbd5e1', fontFamily: 'monospace', padding: '3px 0' }}>
                          {it.target} ({it.file}:{it.line})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: GLOBAL META, VERIFICATION & SOCIAL CARD PREVIEW ────────────── */}
      {subTab === 'global' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Global Meta Defaults</h3>

            <div>
              <label style={lblStyle}>Canonical Base URL</label>
              <input style={inpStyle} value={config.base_url || ''} onChange={e => setConfig({ ...config, base_url: e.target.value })} />
            </div>

            <div>
              <label style={lblStyle}>Site Title Template (%s = Page Title)</label>
              <input style={inpStyle} value={config.title_template || ''} onChange={e => setConfig({ ...config, title_template: e.target.value })} />
            </div>

            <div>
              <label style={lblStyle}>Default Fallback Title ({(config.default_title || '').length} chars)</label>
              <input style={inpStyle} value={config.default_title || ''} onChange={e => setConfig({ ...config, default_title: e.target.value })} />
            </div>

            <div>
              <label style={lblStyle}>Default Meta Description ({(config.default_description || '').length}/160 chars)</label>
              <textarea rows={3} style={inpStyle} value={config.default_description || ''} onChange={e => setConfig({ ...config, default_description: e.target.value })} />
            </div>

            <div>
              <label style={lblStyle}>Default Keywords (comma-separated)</label>
              <input style={inpStyle} value={config.default_keywords || ''} onChange={e => setConfig({ ...config, default_keywords: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>Default OG Image URL</label>
                <input style={inpStyle} value={config.default_og_image || ''} onChange={e => setConfig({ ...config, default_og_image: e.target.value })} />
              </div>
              <div>
                <label style={lblStyle}>Twitter / X Handle</label>
                <input style={inpStyle} value={config.twitter_handle || ''} onChange={e => setConfig({ ...config, twitter_handle: e.target.value })} />
              </div>
            </div>

            {/* Quick OG Image Presets */}
            <div>
              <label style={{ ...lblStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Image size={12} /> Quick-Select Site OG Banner
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {OG_IMAGE_PRESETS.map(pr => (
                  <button
                    key={pr.url}
                    type="button"
                    onClick={() => setConfig({ ...config, default_og_image: pr.url })}
                    style={{
                      padding: '4px 9px',
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: 'pointer',
                      border: config.default_og_image === pr.url ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                      background: config.default_og_image === pr.url ? 'rgba(16,185,129,0.18)' : 'rgba(0,0,0,0.3)',
                      color: config.default_og_image === pr.url ? '#10b981' : '#cbd5e1',
                    }}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            <h4 style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700, color: '#22d3ee' }}>Search Engine Verification Meta Tags</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>Google Search Console Token</label>
                <input style={inpStyle} placeholder="google-site-verification content" value={config.verification?.google_site_verification || ''} onChange={e => updateNested('verification', 'google_site_verification', e.target.value)} />
              </div>
              <div>
                <label style={lblStyle}>Bing Webmaster (msvalidate.01)</label>
                <input style={inpStyle} placeholder="Bing verification code" value={config.verification?.bing_site_verification || ''} onChange={e => updateNested('verification', 'bing_site_verification', e.target.value)} />
              </div>
            </div>

            <button type="button" onClick={() => handleSaveGlobal()} disabled={savingConfig} style={primaryBtnStyle}>
              <Save size={14} /> {savingConfig ? 'Saving...' : 'Save Global Meta & Verification'}
            </button>
          </div>

          {/* Live Google SERP & Social Card Previews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={13} /> Google Search Snippet Live Preview
              </div>
              <div style={{ background: '#ffffff', color: '#202124', borderRadius: 8, padding: 16, fontFamily: 'Arial, sans-serif' }}>
                <div style={{ fontSize: 12, color: '#4d5156', marginBottom: 4 }}>{config.base_url || 'https://intermaven.io'}</div>
                <div style={{ fontSize: 18, color: '#1a0dab', fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>
                  {config.default_title || 'Intermaven'}
                </div>
                <div style={{ fontSize: 13, color: '#4d5156', lineHeight: 1.45 }}>
                  {(config.default_description || '').slice(0, 160)}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Share2 size={13} /> Open Graph / X Card Live Preview
              </div>
              <SocialCardPreview
                imageUrl={config.default_og_image}
                baseUrl={config.base_url}
                title={config.default_title}
                description={config.default_description}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PER-PAGE OVERRIDES & AI COPYWRITER ─────────────────────────── */}
      {subTab === 'pages' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#9096b8' }} />
              <input
                style={{ ...inpStyle, paddingLeft: 32 }}
                placeholder="Filter routes by path or title..."
                value={pageSearch}
                onChange={e => setPageSearch(e.target.value)}
              />
            </div>
            <button type="button" onClick={() => openPageEditor(null)} style={primaryBtnStyle}>
              <Plus size={14} /> Add Route Override
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9096b8', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px' }}>Route</th>
                  <th style={{ padding: '10px 8px' }}>SEO Title & Description</th>
                  <th style={{ padding: '10px 8px' }}>Schema</th>
                  <th style={{ padding: '10px 8px' }}>Sitemap</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map(p => (
                  <tr key={p.path} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>{p.path}</div>
                      <div style={{ fontSize: 11, color: '#9096b8' }}>{p.label}</div>
                    </td>
                    <td style={{ padding: '12px 8px', maxWidth: 420 }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#9096b8', marginTop: 2 }}>{p.description}</div>
                      <div style={{ fontSize: 10, color: '#60a5fa', marginTop: 4 }}>
                        Title: {(p.title || '').length} chars · Desc: {(p.description || '').length} chars
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(192,132,252,0.15)', color: '#c084fc', fontSize: 11, fontWeight: 600 }}>
                        {p.schema_type || 'WebSite'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top', color: '#cbd5e1' }}>
                      {p.noindex ? (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>noindex</span>
                      ) : p.sitemap_include ? (
                        <span>Priority {p.sitemap_priority} ({p.sitemap_changefreq})</span>
                      ) : (
                        <span style={{ color: '#9096b8' }}>Excluded</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => openPageEditor(p)}
                        style={{ padding: '5px 10px', marginRight: 6, borderRadius: 4, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, cursor: 'pointer' }}
                      >
                        <Edit2 size={12} style={{ verticalAlign: 'middle' }} /> Edit
                      </button>
                      {p.path !== '/' && (
                        <button
                          type="button"
                          onClick={() => handleDeletePage(p.path)}
                          style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}
                        >
                          <Trash2 size={12} style={{ verticalAlign: 'middle' }} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: SCHEMA.ORG & SOCIAL SAMEAS REGISTRY ────────────────────────── */}
      {subTab === 'schema' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Organization Identity & Social sameAs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>Organization Name</label>
                <input style={inpStyle} value={config.organization?.name || ''} onChange={e => updateNested('organization', 'name', e.target.value)} />
              </div>
              <div>
                <label style={lblStyle}>Legal Entity Name</label>
                <input style={inpStyle} value={config.organization?.legal_name || ''} onChange={e => updateNested('organization', 'legal_name', e.target.value)} />
              </div>
              <div>
                <label style={lblStyle}>Support Email</label>
                <input style={inpStyle} value={config.organization?.contact_email || ''} onChange={e => updateNested('organization', 'contact_email', e.target.value)} />
              </div>
              <div>
                <label style={lblStyle}>Support Phone</label>
                <input style={inpStyle} value={config.organization?.contact_phone || ''} onChange={e => updateNested('organization', 'contact_phone', e.target.value)} />
              </div>
            </div>

            <h4 style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700, color: '#c084fc' }}>Verified Social Profiles (Schema.org sameAs)</h4>
            {['instagram', 'tiktok', 'x', 'linkedin', 'youtube', 'facebook'].map(platform => (
              <div key={platform}>
                <label style={lblStyle}>{platform.toUpperCase()} Profile URL</label>
                <input
                  style={inpStyle}
                  value={config.social_accounts?.[platform] || ''}
                  onChange={e => updateNested('social_accounts', platform, e.target.value)}
                />
              </div>
            ))}

            <div>
              <label style={lblStyle}>Connected Ecosystem Domains (one URL per line)</label>
              <textarea rows={3} style={inpStyle} value={ecosystemInput} onChange={e => setEcosystemInput(e.target.value)} />
            </div>

            <button type="button" onClick={() => handleSaveGlobal()} disabled={savingConfig} style={primaryBtnStyle}>
              <Save size={14} /> {savingConfig ? 'Saving...' : 'Save Schema & Social Graph'}
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Live JSON-LD @graph Output</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(buildOrgJsonLdPreview());
                  setCopiedJsonLd(true);
                  setTimeout(() => setCopiedJsonLd(false), 2000);
                }}
                style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                {copiedJsonLd ? <Check size={12} /> : <Copy size={12} />} {copiedJsonLd ? 'Copied' : 'Copy JSON-LD'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: 14, background: '#07080c', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', color: '#a5f3fc', fontSize: 11, overflowX: 'auto', maxHeight: 520 }}>
              {buildOrgJsonLdPreview()}
            </pre>
          </div>
        </div>
      )}

      {/* ── TAB 5: TRACKING PIXELS & CONSENT MANAGER ──────────────────────────── */}
      {subTab === 'pixels' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Consent-Aware Script Loading (GDPR / Kenya DPA)</div>
              <div style={{ fontSize: 12, color: '#9096b8', marginTop: 2 }}>
                When enabled, analytics & ad pixels only fire after visitor cookie consent is granted.
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.pixels?.consent_required !== false}
                onChange={e => updateNested('pixels', 'consent_required', e.target.checked)}
              />
              Require Cookie Consent
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {[
              { key: 'ga4_id', label: 'Google Analytics 4 (GA4 ID)', placeholder: 'G-XXXXXXXXXX' },
              { key: 'gtm_id', label: 'Google Tag Manager (GTM ID)', placeholder: 'GTM-XXXXXXX' },
              { key: 'meta_pixel_id', label: 'Meta / Facebook Pixel ID', placeholder: '123456789012345' },
              { key: 'tiktok_pixel_id', label: 'TikTok Pixel ID', placeholder: 'CXXXXXXXXXXXXXXX' },
              { key: 'linkedin_partner_id', label: 'LinkedIn Insight Partner ID', placeholder: '1234567' },
              { key: 'posthog_key', label: 'PostHog Project API Key', placeholder: 'phc_...' },
              { key: 'plausible_domain', label: 'Plausible Analytics Domain', placeholder: 'intermaven.io' },
            ].map(p => (
              <div key={p.key}>
                <label style={lblStyle}>{p.label}</label>
                <input
                  style={inpStyle}
                  placeholder={p.placeholder}
                  value={config.pixels?.[p.key] || ''}
                  onChange={e => updateNested('pixels', p.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div>
            <button type="button" onClick={() => handleSaveGlobal()} disabled={savingConfig} style={primaryBtnStyle}>
              <Save size={14} /> {savingConfig ? 'Saving...' : 'Save Pixel & Consent Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 6: SITEMAP.XML, ROBOTS.TXT & CWV BUDGETS ──────────────────────── */}
      {subTab === 'crawlers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Crawler Directives & Performance Targets</h3>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.robots?.allow_indexing !== false}
                onChange={e => updateNested('robots', 'allow_indexing', e.target.checked)}
              />
              Allow Search Engine Indexing (Allow: /)
            </label>

            <div>
              <label style={lblStyle}>Disallowed Paths (one path prefix per line)</label>
              <textarea rows={5} style={{ ...inpStyle, fontFamily: 'monospace' }} value={disallowInput} onChange={e => setDisallowInput(e.target.value)} />
            </div>

            <div>
              <label style={lblStyle}>Custom Robots.txt Directives (Optional)</label>
              <textarea rows={3} style={{ ...inpStyle, fontFamily: 'monospace' }} placeholder="User-agent: GPTBot&#10;Disallow: /private/" value={config.robots?.custom_rules || ''} onChange={e => updateNested('robots', 'custom_rules', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>LCP Target (ms)</label>
                <input type="number" style={inpStyle} value={config.performance_targets?.lcp_ms || 2500} onChange={e => updateNested('performance_targets', 'lcp_ms', Number(e.target.value))} />
              </div>
              <div>
                <label style={lblStyle}>INP Target (ms)</label>
                <input type="number" style={inpStyle} value={config.performance_targets?.inp_ms || 200} onChange={e => updateNested('performance_targets', 'inp_ms', Number(e.target.value))} />
              </div>
              <div>
                <label style={lblStyle}>CLS Target</label>
                <input type="number" step="0.01" style={inpStyle} value={config.performance_targets?.cls ?? 0.1} onChange={e => updateNested('performance_targets', 'cls', Number(e.target.value))} />
              </div>
            </div>

            <button type="button" onClick={() => handleSaveGlobal()} disabled={savingConfig} style={primaryBtnStyle}>
              <Save size={14} /> {savingConfig ? 'Saving...' : 'Save Crawler & CWV Settings'}
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Generated /robots.txt Preview</div>
            <pre style={{ margin: 0, padding: 14, background: '#07080c', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 12, overflowX: 'auto' }}>
              {robotsPreview}
            </pre>
            <div style={{ fontSize: 12, color: '#9096b8', marginTop: 6 }}>
              Active Sitemap Routes: <strong style={{ color: '#fff' }}>{pages.filter(p => p.sitemap_include && !p.noindex).length}</strong> static routes + published public EPKs automatically included at <code>/sitemap.xml</code>.
            </div>
          </div>
        </div>
      )}

      {/* ── IN-SYSTEM WEBMASTER VERIFICATION MODAL (FROM AUDIT FIX) ──────────── */}
      {verificationModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#12141d', border: '1px solid rgba(34,211,238,0.4)', borderRadius: 10, width: '100%', maxWidth: 480, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#22d3ee' }}>
                Configure Search Console & Bing Verification
              </h3>
              <button type="button" onClick={() => setVerificationModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9096b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#9096b8', lineHeight: 1.45 }}>
              Paste the verification code from Google Search Console (HTML tag method) and Bing Webmaster Tools. Saving injects both meta tags live into your site <code>&lt;head&gt;</code> and re-runs the SEO Audit automatically.
            </p>
            <div>
              <label style={lblStyle}>Google Search Console (google-site-verification)</label>
              <input
                style={inpStyle}
                placeholder="e.g. Qx8vK2..."
                value={verifDraft.google_site_verification}
                onChange={e => setVerifDraft({ ...verifDraft, google_site_verification: e.target.value })}
              />
            </div>
            <div>
              <label style={lblStyle}>Bing Webmaster Tools (msvalidate.01)</label>
              <input
                style={inpStyle}
                placeholder="e.g. 9A4B3C..."
                value={verifDraft.bing_site_verification}
                onChange={e => setVerifDraft({ ...verifDraft, bing_site_verification: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button type="button" onClick={() => setVerificationModalOpen(false)} style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 12, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleSaveVerificationModal} disabled={savingConfig} style={primaryBtnStyle}>
                <CheckCircle size={14} /> {savingConfig ? 'Saving...' : 'Save & Re-Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROUTE OVERRIDE + AI SUGGESTION + LIVE OG PREVIEW MODAL ──────────── */}
      {editingPage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#12141d', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 10, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                {editingPage.isNew ? 'Add Route SEO Override' : `Edit SEO: ${editingPage.path}`}
              </h3>
              <button type="button" onClick={() => setEditingPage(null)} style={{ background: 'none', border: 'none', color: '#9096b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* AI Meta Copywriter Bar */}
            <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.16), rgba(59,130,246,0.14))', border: '1px solid rgba(168,85,247,0.4)', borderRadius: 8, padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                style={{ ...inpStyle, flex: '1 1 200px', background: 'rgba(0,0,0,0.4)' }}
                placeholder="Optional focus keywords for AI (e.g. M-Pesa POS, African artists, EPK)..."
                value={focusKeywords}
                onChange={e => setFocusKeywords(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAiSuggestPage}
                disabled={aiSuggesting}
                style={{ padding: '8px 14px', borderRadius: 6, background: '#a855f7', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={14} /> {aiSuggesting ? 'Generating...' : 'AI Suggest Meta'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>Route Path</label>
                <input style={inpStyle} disabled={!editingPage.isNew} value={editingPage.path} onChange={e => setEditingPage({ ...editingPage, path: e.target.value })} />
              </div>
              <div>
                <label style={lblStyle}>Page Label</label>
                <input style={inpStyle} value={editingPage.label || ''} onChange={e => setEditingPage({ ...editingPage, label: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={lblStyle}>SEO Title ({(editingPage.title || '').length}/60 chars)</label>
              <input style={inpStyle} value={editingPage.title || ''} onChange={e => setEditingPage({ ...editingPage, title: e.target.value })} />
            </div>

            <div>
              <label style={lblStyle}>Meta Description ({(editingPage.description || '').length}/160 chars)</label>
              <textarea rows={3} style={inpStyle} value={editingPage.description || ''} onChange={e => setEditingPage({ ...editingPage, description: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>Open Graph Title</label>
                <input style={inpStyle} value={editingPage.og_title || ''} onChange={e => setEditingPage({ ...editingPage, og_title: e.target.value })} />
              </div>
              <div>
                <label style={lblStyle}>Schema.org Type</label>
                <select style={inpStyle} value={editingPage.schema_type || 'WebSite'} onChange={e => setEditingPage({ ...editingPage, schema_type: e.target.value })}>
                  {SCHEMA_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lblStyle}>Canonical URL</label>
                <input style={inpStyle} value={editingPage.canonical || ''} onChange={e => setEditingPage({ ...editingPage, canonical: e.target.value })} />
              </div>
              <div>
                <label style={lblStyle}>OG Image URL</label>
                <input style={inpStyle} value={editingPage.og_image || ''} onChange={e => setEditingPage({ ...editingPage, og_image: e.target.value })} />
              </div>
            </div>

            {/* Quick OG Banner Selector + Live Preview */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {OG_IMAGE_PRESETS.map(pr => (
                <button
                  key={pr.url}
                  type="button"
                  onClick={() => setEditingPage({ ...editingPage, og_image: pr.url })}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    cursor: 'pointer',
                    border: editingPage.og_image === pr.url ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                    background: editingPage.og_image === pr.url ? 'rgba(16,185,129,0.18)' : 'rgba(0,0,0,0.3)',
                    color: editingPage.og_image === pr.url ? '#10b981' : '#cbd5e1',
                  }}
                >
                  {pr.label}
                </button>
              ))}
            </div>

            <SocialCardPreview
              imageUrl={editingPage.og_image || config.default_og_image}
              baseUrl={config.base_url}
              title={editingPage.og_title || editingPage.title}
              description={editingPage.og_description || editingPage.description}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
              <div>
                <label style={lblStyle}>Sitemap Priority (0.0–1.0)</label>
                <input type="number" step="0.05" min="0" max="1" style={inpStyle} value={editingPage.sitemap_priority ?? 0.7} onChange={e => setEditingPage({ ...editingPage, sitemap_priority: Number(e.target.value) })} />
              </div>
              <div>
                <label style={lblStyle}>Change Frequency</label>
                <select style={inpStyle} value={editingPage.sitemap_changefreq || 'weekly'} onChange={e => setEditingPage({ ...editingPage, sitemap_changefreq: e.target.value })}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 14 }}>
                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={Boolean(editingPage.sitemap_include)} onChange={e => setEditingPage({ ...editingPage, sitemap_include: e.target.checked })} />
                  Include in Sitemap
                </label>
                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#fca5a5' }}>
                  <input type="checkbox" checked={Boolean(editingPage.noindex)} onChange={e => setEditingPage({ ...editingPage, noindex: e.target.checked })} />
                  Set noindex
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setEditingPage(null)} style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 12, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleSavePage} disabled={savingPage} style={primaryBtnStyle}>
                <CheckCircle size={14} /> {savingPage ? 'Saving...' : 'Save Route SEO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lblStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#9096b8',
  textTransform: 'uppercase',
  marginBottom: 5,
};

const inpStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  color: '#ffffff',
  fontSize: 12,
  outline: 'none',
};

const primaryBtnStyle = {
  padding: '9px 16px',
  borderRadius: 6,
  background: '#10b981',
  border: 'none',
  color: '#000000',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  width: 'fit-content',
};

const fixBtnStyle = {
  padding: '5px 10px',
  borderRadius: 4,
  background: 'rgba(245, 158, 11, 0.18)',
  border: '1px solid rgba(245, 158, 11, 0.45)',
  color: '#fbbf24',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
