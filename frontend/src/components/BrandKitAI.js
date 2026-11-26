import React, { useState, useEffect } from 'react';
import { api, useAuth, useToast } from '../App';
import FlatIcon from './FlatIcon';
import AppHelpAiControls from './AppHelpAiControls';
import { getPersonaMeta } from '../data/personasCatalog';
import {
  Copy, Download, Zap, Check, ArrowRight, ArrowLeft, Bookmark, Trash2, Sparkles
} from 'lucide-react';

const FALLBACK_VIBES = [
  { id: 'bold', label: 'Bold & Disruptive', palette: ['#10b981', '#060813', '#22d3ee', '#f59e0b', '#f8fafc'] },
  { id: 'luxury', label: 'Minimal & Luxury', palette: ['#d4af37', '#0a0a0f', '#1e293b', '#e2e8f0', '#ffffff'] },
  { id: 'warm', label: 'Warm & Community', palette: ['#f59e0b', '#1c1917', '#10b981', '#fef3c7', '#fafaf9'] },
  { id: 'afrofuturist', label: 'Afro-Futurist', palette: ['#22d3ee', '#060813', '#a855f7', '#10b981', '#f8fafc'] },
  { id: 'tech', label: 'Tech & Precision', palette: ['#3b82f6', '#0f172a', '#22d3ee', '#64748b', '#f8fafc'] },
  { id: 'street', label: 'Playful & Street', palette: ['#f43f5e', '#09090b', '#eab308', '#22d3ee', '#ffffff'] },
];

const FALLBACK_KEYWORDS = [
  'Brand Name Analysis',
  '6 Strategic Dimensions',
  'Tagline Options',
  'Tone of Voice Guide',
  'Colour Direction',
  'Positioning Statement',
  'Brand Personality',
  'Beta Free Credits',
];

export default function BrandKitAI(props) {
  const auth = useAuth();
  const toast = useToast();
  const user = props.user || auth?.user;
  const updateUser = props.updateUser || auth?.updateUser;
  const addToast = props.addToast || toast?.addToast || (() => {});
  const personaMeta = getPersonaMeta(user?.persona);

  const [studioTab, setStudioTab] = useState('wizard'); // wizard | library | keywords
  const [step, setStep] = useState(1); // 1: Basics, 2: Vibe & Keywords, 3: Output

  // Shared backend config (cost, dimensions, vibes, keywords)
  const [config, setConfig] = useState({
    cost: 0,
    beta_free: true,
    free_beta_credits: 150,
    dimensions: [],
    vibes: FALLBACK_VIBES,
    keywords: FALLBACK_KEYWORDS,
  });

  // Form State
  const [name, setName] = useState(user?.brand_name || '');
  const [industry, setIndustry] = useState(personaMeta.subtitle || '');
  const [audience, setAudience] = useState('');
  const [vibe, setVibe] = useState('bold');
  const [selectedKeywords, setSelectedKeywords] = useState(FALLBACK_KEYWORDS.slice(0, 5));
  const [extra, setExtra] = useState('');

  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState(null);
  const [savedKits, setSavedKits] = useState([]);
  const [copiedHex, setCopiedHex] = useState('');

  const loadAll = async () => {
    try {
      const [cfgRes, kitsRes] = await Promise.all([
        api.get('/api/brandkit/config').catch(() => ({ data: null })),
        api.get('/api/brandkit/kits').catch(() => ({ data: { kits: [] } })),
      ]);
      if (cfgRes.data) setConfig(cfgRes.data);
      setSavedKits(kitsRes.data?.kits || []);
    } catch {
      // keep fallbacks
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleKeyword = (kw) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((x) => x !== kw) : [...prev, kw]
    );
  };

  const handleGenerate = async () => {
    if (!name.trim() || !industry.trim() || !audience.trim()) {
      addToast('Missing fields', 'Please enter Brand Name, Industry, and Target Audience.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/brandkit/generate', {
        name: name.trim(),
        industry: industry.trim(),
        audience: audience.trim(),
        vibe,
        persona: user?.persona || 'creator',
        keywords: selectedKeywords,
        extra,
      });
      setKit(res.data.kit);
      if (res.data?.remaining_credits !== undefined && updateUser && user) {
        updateUser({ ...user, credits: res.data.remaining_credits });
      }
      setStep(3);
      addToast('Brand Kit ready', `Generated 6-dimension analysis & full kit (${res.data.credits_used} credits).`, 'success');
    } catch (err) {
      addToast('Generation failed', err.response?.data?.detail || 'Could not generate brand kit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKit = async () => {
    if (!kit) return;
    try {
      await api.post('/api/brandkit/kits', {
        name: kit.brand_name || name,
        industry,
        audience,
        vibe,
        persona: user?.persona || 'creator',
        keywords: selectedKeywords,
        result: kit,
      });
      addToast('Saved!', 'Brand Kit added to your Library.', 'success');
      await loadAll();
    } catch (err) {
      addToast('Save failed', err.response?.data?.detail || 'Could not save kit', 'error');
    }
  };

  const handleApplyKit = async (kitId) => {
    try {
      const res = await api.post(`/api/brandkit/kits/${kitId}/apply`);
      if (updateUser && user) updateUser({ ...user, brand_name: res.data.brand_name });
      addToast('Applied to Profile', `Active brand set to "${res.data.brand_name}".`, 'success');
    } catch {
      addToast('Error', 'Could not apply brand kit', 'error');
    }
  };

  const handleDeleteKit = async (kitId) => {
    await api.delete(`/api/brandkit/kits/${kitId}`);
    await loadAll();
  };

  const copyText = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    addToast(label, text, 'success');
    setTimeout(() => setCopiedHex(''), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlatIcon name="brandkit" size={42} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>Brand Kit AI Studio</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              6-Dimension Name Analysis · Taglines · Tone Guide · Hex Palette · Free During Beta (0 Credits)
            </p>
          </div>
        </div>
        <AppHelpAiControls appId="brandkit" persona={user?.persona || 'creator'} compact />
      </div>

      {/* Supplementary Studio Menu */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        {[
          { id: 'wizard', label: '1. Guided Brand Kit Wizard' },
          { id: 'library', label: `2. Saved Brand Kits (${savedKits.length})` },
          { id: 'keywords', label: '3. 6-Dimension Matrix & Keywords' },
        ].map((t) => {
          const active = studioTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setStudioTab(t.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: active ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                background: active ? 'rgba(16,185,129,0.16)' : 'rgba(255,255,255,0.04)',
                color: active ? '#6ee7b7' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: 3-STEP WIZARD */}
      {studioTab === 'wizard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { n: 1, title: 'Step 1: Brand Name & Audience' },
              { n: 2, title: 'Step 2: Visual Vibe & Keywords' },
              { n: 3, title: 'Step 3: 6-Dimension Kit & Palette' },
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n)}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: step === s.n ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: step === s.n ? 'rgba(16,185,129,0.12)' : 'rgba(13,17,23,0.6)',
                  color: step === s.n ? '#6ee7b7' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Tell Maven About Your Brand ({personaMeta.shortLabel} Seat)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Brand / Artist / Company Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Savannah Pulse" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Industry / Niche *</label>
                  <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Afro-House Label, Fintech SME, Fashion" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Target Audience *</label>
                <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., Gen-Z music fans across Nairobi, Lagos & London" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  Next: Vibe &amp; Keywords <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Choose Visual Vibe &amp; Strategic Keywords</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px' }}>
                {(config.vibes || FALLBACK_VIBES).map((v) => {
                  const active = vibe === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: active ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                        background: active ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>{v.label}</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {v.palette.map((hex, i) => (
                          <span key={i} style={{ width: '18px', height: '18px', borderRadius: '4px', background: hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Focus Keywords (synced with Backend &amp; Admin):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {(config.keywords || FALLBACK_KEYWORDS).map((kw) => {
                    const active = selectedKeywords.includes(kw);
                    return (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => toggleKeyword(kw)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: active ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.12)',
                          background: active ? 'rgba(34,211,238,0.16)' : 'transparent',
                          color: active ? '#67e8f9' : '#cbd5e1',
                          cursor: 'pointer',
                        }}
                      >
                        {kw}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Extra Notes / Competitors / Inspiration (optional)</label>
                <textarea rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Any specific positioning goals or cultural references..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button type="button" onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button type="button" disabled={loading} onClick={handleGenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #22d3ee)', color: '#061224', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  <Zap size={15} /> {loading ? 'Analyzing 6 Dimensions...' : (config.cost === 0 ? 'Generate Brand Kit (Free in Beta)' : `Generate Brand Kit (${config.cost} Credits)`)}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!kit ? (
                <div style={{ padding: '32px', textAlign: 'center', background: 'rgba(13,17,23,0.85)', borderRadius: '12px', color: '#94a3b8' }}>
                  Complete Steps 1 and 2 to generate your 6-dimension Brand Kit.
                </div>
              ) : (
                <>
                  {/* Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: 'rgba(13,17,23,0.85)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.35)' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#10b981', fontWeight: 700 }}>Brand Score: {kit.overall_score || 88}/100</div>
                      <h3 style={{ margin: '2px 0 0', fontSize: '20px', color: '#f8fafc' }}>{kit.brand_name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" onClick={handleSaveKit} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        <Bookmark size={14} /> Save to Library
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(kit, null, 2)], { type: 'application/json' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = `${(kit.brand_name || 'brandkit').toLowerCase().replace(/\s+/g, '-')}.json`;
                          a.click();
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        <Download size={14} /> Export JSON
                      </button>
                    </div>
                  </div>

                  {/* Positioning Statement */}
                  <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#22d3ee', fontWeight: 700, marginBottom: '6px' }}>Positioning Statement</div>
                    <p style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: 600, lineHeight: 1.5 }}>{kit.positioning_statement}</p>
                  </div>

                  {/* 6-Dimension Brand Name Analysis */}
                  <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#f8fafc' }}>6-Dimension Brand Name Analysis</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      {(kit.dimensions || []).map((d, i) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{d.label}</strong>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>{d.score}/100</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{d.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tagline Options + Live Color Palette */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#f8fafc' }}>Tagline Options</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(kit.taglines || []).map((t, i) => (
                          <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                              <strong style={{ fontSize: '13px', color: '#6ee7b7' }}>"{t.line}"</strong>
                              <button type="button" onClick={() => copyText(t.line, 'Tagline copied')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Copy size={13} /></button>
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{t.rationale}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#f8fafc' }}>Colour Direction (Click Hex to Copy)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(kit.colors || []).map((c, i) => (
                          <div key={i} onClick={() => copyText(c.hex, 'Hex copied')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{c.role} · <span style={{ fontFamily: 'monospace', color: '#22d3ee' }}>{c.hex}</span></div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.meaning}</div>
                            </div>
                            {copiedHex === c.hex ? <Check size={14} color="#10b981" /> : <Copy size={13} color="#64748b" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tone of Voice & Personality */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#f8fafc' }}>Tone of Voice (4 Principles)</h4>
                      {(kit.tone_of_voice || []).map((tv, i) => (
                        <div key={i} style={{ marginBottom: '10px', fontSize: '12px' }}>
                          <strong style={{ color: '#f8fafc' }}>{tv.principle}</strong>
                          <div style={{ color: '#34d399' }}>Do: {tv.do}</div>
                          <div style={{ color: '#f87171' }}>Don&apos;t: {tv.dont}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#f8fafc' }}>Brand Personality &amp; Handles</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {(kit.personality?.adjectives || []).map((adj, i) => (
                          <span key={i} style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.16)', color: '#6ee7b7', fontSize: '12px', fontWeight: 600 }}>{adj}</span>
                        ))}
                        {kit.personality?.anti_adjective && (
                          <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(239,68,68,0.16)', color: '#fca5a5', fontSize: '12px', fontWeight: 600 }}>Not: {kit.personality.anti_adjective}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Suggested Handles: <strong style={{ color: '#e2e8f0' }}>{(kit.handles || []).join(' · ')}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED BRAND KITS LIBRARY */}
      {studioTab === 'library' && (
        <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#f8fafc' }}>Saved Brand Kits</h3>
          {savedKits.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No saved Brand Kits yet. Generate one in Tab 1 and click "Save to Library".</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {savedKits.map((k) => (
                <div key={k.id} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{k.name}</strong>
                    <button type="button" onClick={() => handleDeleteKit(k.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{k.industry} · {k.vibe}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button type="button" onClick={() => { setKit(k.result); setStudioTab('wizard'); setStep(3); }} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#e2e8f0', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Open</button>
                    <button type="button" onClick={() => handleApplyKit(k.id)} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#061224', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Apply to Profile</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 6-DIMENSION MATRIX & SHARED KEYWORDS */}
      {studioTab === 'keywords' && (
        <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>6 Strategic Brand Dimensions (Synced with Backend &amp; Admin)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {(config.dimensions || []).map((d) => (
              <div key={d.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#6ee7b7' }}><Sparkles size={13} style={{ marginRight: '6px' }} />{d.label}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
