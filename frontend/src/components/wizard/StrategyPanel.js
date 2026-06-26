/**
 * StrategyPanel — saved strategies + public library + playbook download.
 * Used inside the dashboard overview.
 */
import React, { useEffect, useState } from 'react';
import { api } from '../../App';
import { Download, Library, ShoppingBag, Sparkles, Save, X, Share2, Loader2, Check } from 'lucide-react';

export default function StrategyPanel({ businessProfile, onStrategyChanged }) {
  const [saved, setSaved] = useState([]);
  const [library, setLibrary] = useState([]);
  const [creditSplit, setCreditSplit] = useState({ platform: 0.5, creator: 0.4, fees: 0.1 });
  const [tab, setTab] = useState('saved');         // saved | library
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareCost, setShareCost] = useState(25);
  const [useStatus, setUseStatus] = useState({});  // { strategyId: 'pending'|'done'|'error' }
  const [downloading, setDownloading] = useState(false);

  const refresh = async () => {
    try {
      const a = await api.get('/api/strategies');
      setSaved(a.data?.strategies || []);
    } catch (e) { /* ignore */ }
    try {
      const b = await api.get('/api/strategies/library');
      setLibrary(b.data?.strategies || []);
      if (b.data?.credit_split) setCreditSplit(b.data.credit_split);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { refresh(); }, []);

  const hasStrategy = !!(businessProfile?.strategy?.headline);

  const handleSave = async () => {
    if (!saveName.trim() || !businessProfile?.strategy) return;
    setSaveLoading(true);
    try {
      await api.post('/api/strategies', {
        name: saveName.trim(),
        strategy: businessProfile.strategy,
        summary: businessProfile.strategy.headline,
      });
      setSaveName('');
      setShowSave(false);
      await refresh();
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareTarget) return;
    try {
      await api.post(`/api/strategies/${shareTarget._id}/share`, {
        name: shareTarget.name,
        credit_cost: parseInt(shareCost, 10) || 25,
        tags: [businessProfile?.industry, businessProfile?.region].filter(Boolean),
      });
      setShareTarget(null);
      await refresh();
    } catch (e) {
      alert('Share failed: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleUse = async (strategyId) => {
    setUseStatus(s => ({ ...s, [strategyId]: 'pending' }));
    try {
      const r = await api.post(`/api/strategies/${strategyId}/use`);
      setUseStatus(s => ({ ...s, [strategyId]: 'done' }));
      onStrategyChanged?.(r.data?.strategy);
      await refresh();
    } catch (e) {
      setUseStatus(s => ({ ...s, [strategyId]: 'error' }));
      alert(e.response?.data?.detail || 'Could not apply this strategy.');
    }
  };

  const handleDownloadPlaybook = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_BACKEND_URL || ''}/api/business-profile/playbook.pdf`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(businessProfile?.business_name || 'brand').replace(/\s+/g, '_').toLowerCase()}-playbook.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert('Playbook download failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const tabBtn = (id, label, icon) => (
    <button
      onClick={() => setTab(id)}
      data-testid={`strategy-tab-${id}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: '3px', cursor: 'pointer',
        background: tab === id ? '#22d3ee22' : 'transparent',
        color: tab === id ? '#22d3ee' : '#cbd5e1',
        border: tab === id ? '1px solid #22d3ee' : '1px solid #334155',
        fontWeight: 600, fontSize: 13,
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div data-testid="strategy-panel" style={{ marginTop: 28, background: '#1e2937', borderRadius: '3px', padding: 24, border: '1px solid #334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>Your Strategies</h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 13 }}>Save what works · download as PDF · browse strategies from other Mavens.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {hasStrategy && (
            <button onClick={() => setShowSave(true)} data-testid="save-current-strategy-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#0f172a', border: 'none', padding: '9px 16px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              <Save size={14} /> Save current strategy
            </button>
          )}
          {hasStrategy && (
            <button onClick={handleDownloadPlaybook} disabled={downloading} data-testid="download-playbook-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22d3ee', color: '#0f172a', border: 'none', padding: '9px 16px', borderRadius: '3px', fontWeight: 700, cursor: downloading ? 'wait' : 'pointer', fontSize: 13 }}>
              {downloading ? <Loader2 size={14} className="spin" /> : <Download size={14} />} Download Brand Playbook PDF
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {tabBtn('saved', `My Saved (${saved.length})`, <Library size={14} />)}
        {tabBtn('library', `Strategy Library (${library.length})`, <ShoppingBag size={14} />)}
      </div>

      {tab === 'saved' && (
        <div data-testid="saved-strategies-list">
          {saved.length === 0 ? (
            <div style={{ padding: '20px 0', color: '#64748b', fontSize: 13 }}>
              You haven&apos;t saved any strategies yet. {hasStrategy ? 'Click "Save current strategy" to keep this one.' : 'Generate a strategy first.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {saved.map(s => (
                <div key={s._id} data-testid={`saved-strategy-${s._id}`} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, flex: 1 }}>{s.name}</div>
                    {s.is_public && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: '3px', background: '#22d3ee22', color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public</span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, color: '#cbd5e1', fontSize: 12, lineHeight: 1.5 }}>{s.summary?.slice(0, 140) || '—'}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {!s.is_public && (
                      <button onClick={() => { setShareTarget(s); setShareCost(s.credit_cost || 25); }} data-testid={`share-strategy-${s._id}`}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '3px', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Share2 size={12} /> Share publicly
                      </button>
                    )}
                    {s.is_public && (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Used {s.usage_count || 0}× · {s.credit_cost || 25} credits</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'library' && (
        <div data-testid="library-strategies-list">
          <div style={{ padding: '6px 10px', background: '#0b1220', border: '1px solid #334155', borderRadius: '3px', marginBottom: 12, fontSize: 11, color: '#94a3b8' }}>
            💡 Credit split when a strategy is used: <strong style={{ color: '#22d3ee' }}>{Math.round(creditSplit.platform * 100)}% platform</strong> · <strong style={{ color: '#10b981' }}>{Math.round(creditSplit.creator * 100)}% creator</strong> · <strong style={{ color: '#f59e0b' }}>{Math.round(creditSplit.fees * 100)}% fees</strong>
          </div>
          {library.length === 0 ? (
            <div style={{ padding: '20px 0', color: '#64748b', fontSize: 13 }}>
              No public strategies in your industry yet. Be the first to share one!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {library.map(s => {
                const status = useStatus[s._id];
                return (
                  <div key={s._id} data-testid={`library-strategy-${s._id}`} style={{ background: '#0f172a', border: '1px solid #22d3ee44', borderRadius: '3px', padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, flex: 1 }}>{s.name}</div>
                      <span style={{ fontSize: 11, color: '#22d3ee', fontWeight: 700 }}>{s.credit_cost} cr</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>by {s.creator_name} · used {s.usage_count || 0}×</div>
                    <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: 12, lineHeight: 1.5 }}>{s.summary?.slice(0, 140) || s.strategy?.headline?.slice(0, 140) || '—'}</div>
                    <button onClick={() => handleUse(s._id)} disabled={status === 'pending' || status === 'done'} data-testid={`use-strategy-${s._id}`}
                      style={{ marginTop: 12, width: '100%', background: status === 'done' ? '#10b981' : '#22d3ee', border: 'none', color: '#0f172a', padding: '8px 12px', borderRadius: '3px', fontWeight: 700, cursor: status === 'pending' ? 'wait' : 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {status === 'pending' && <Loader2 size={12} className="spin" />}
                      {status === 'done' && <Check size={12} />}
                      {status === 'done' ? 'Applied!' : status === 'pending' ? 'Applying…' : `Use this strategy · ${s.credit_cost} cr`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Save modal */}
      {showSave && (
        <div data-testid="save-strategy-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 420, background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ margin: 0, color: '#f1f5f9' }}>Save this strategy</h4>
              <button onClick={() => setShowSave(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Give it a memorable name…" data-testid="save-strategy-name-input"
              style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 13 }} />
            <button onClick={handleSave} disabled={saveLoading || !saveName.trim()} data-testid="save-strategy-confirm-btn"
              style={{ marginTop: 14, width: '100%', background: '#10b981', color: '#0f172a', border: 'none', padding: '10px 14px', borderRadius: '3px', fontWeight: 700, cursor: saveLoading ? 'wait' : 'pointer', fontSize: 13 }}>
              {saveLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareTarget && (
        <div data-testid="share-strategy-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 460, background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ margin: 0, color: '#f1f5f9' }}>Share publicly</h4>
              <button onClick={() => setShareTarget(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
              Other Mavens can apply your strategy. You&apos;ll earn <strong style={{ color: '#10b981' }}>{Math.round(creditSplit.creator * 100)}%</strong> of the credits each time.
            </div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Credit cost</label>
            <input type="number" min="5" value={shareCost} onChange={e => setShareCost(e.target.value)} data-testid="share-cost-input"
              style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 13 }} />
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
              You&apos;ll earn ~{Math.round((parseInt(shareCost, 10) || 0) * creditSplit.creator)} credits per use.
            </div>
            <button onClick={handleShare} data-testid="share-strategy-confirm-btn"
              style={{ marginTop: 14, width: '100%', background: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 14px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              Share publicly
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin {to {transform: rotate(360deg);}} .spin{animation: spin 1s linear infinite;}`}</style>
    </div>
  );
}
