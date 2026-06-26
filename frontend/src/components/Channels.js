/**
 * Channels — canonical hub for connecting social, Google, and messaging accounts.
 * Each row offers OAuth (stubbed) or Manual mode.
 */
import React, { useEffect, useState } from 'react';
import { api } from '../App';
import { Loader2, X, Check, AlertCircle, ExternalLink, Plug } from 'lucide-react';

const GROUP_ORDER = ['Social', 'Google', 'Messaging'];

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openConnect, setOpenConnect] = useState(null); // channel object
  const [mode, setMode] = useState('manual');           // manual | oauth_stub
  const [identifier, setIdentifier] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/channels');
      setChannels(r.data?.channels || []);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleOpenConnect = (c) => {
    setOpenConnect(c);
    setMode(c.supports_oauth ? 'oauth_stub' : 'manual');
    setIdentifier(c.identifier || '');
  };

  const handleSubmit = async () => {
    if (!openConnect) return;
    if (mode === 'manual' && !identifier.trim()) return;
    setSaving(true);
    try {
      await api.post(`/api/channels/${openConnect.id}/connect`, { mode, identifier: identifier.trim() });
      setOpenConnect(null);
      await refresh();
    } catch (e) {
      alert(e.response?.data?.detail || 'Could not connect.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (channelId) => {
    if (!window.confirm('Disconnect this channel?')) return;
    try {
      await api.delete(`/api/channels/${channelId}`);
      await refresh();
    } catch (e) { /* ignore */ }
  };

  const grouped = GROUP_ORDER.map(g => ({
    name: g,
    items: channels.filter(c => c.group === g),
  }));

  return (
    <div data-testid="channels-page" style={{ padding: 28, color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <Plug size={22} color="#22d3ee" />
        <div>
          <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 24, fontWeight: 700 }}>Channels</h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 13 }}>Connect the accounts Intermaven will publish, message, and pull leads from.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}><Loader2 size={20} className="spin" /></div>
      ) : (
        grouped.map(group => (
          <div key={group.name} style={{ marginBottom: 28 }}>
            <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{group.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {group.items.map(c => (
                <div key={c.id} data-testid={`channel-card-${c.id}`} style={{ background: '#1e293b', border: c.connected ? `1px solid ${c.color}55` : '1px solid #334155', borderRadius: '3px', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '3px', background: c.color }} />
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{c.name}</div>
                    </div>
                    {c.connected ? (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: '3px', background: '#10b98122', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={10} /> Connected
                      </span>
                    ) : c.status === 'pending_oauth' ? (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: '3px', background: '#f59e0b22', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle size={10} /> OAuth pending
                      </span>
                    ) : null}
                  </div>
                  {c.connected && c.identifier && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>↳ {c.identifier}</div>
                  )}
                  {!c.connected && c.stub_reason && (
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>{c.stub_reason}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {c.connected ? (
                      <>
                        <button onClick={() => handleOpenConnect(c)} data-testid={`channel-reconfigure-${c.id}`}
                          style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '3px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          Edit
                        </button>
                        <button onClick={() => handleDisconnect(c.id)} data-testid={`channel-disconnect-${c.id}`}
                          style={{ background: 'transparent', border: '1px solid #ef444466', color: '#ef4444', padding: '6px 12px', borderRadius: '3px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleOpenConnect(c)} data-testid={`channel-connect-${c.id}`}
                        style={{ background: c.color, border: 'none', color: '#0f172a', padding: '7px 14px', borderRadius: '3px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                        Connect
                      </button>
                    )}
                    {c.external_setup_url && (
                      <a href={c.external_setup_url} target="_blank" rel="noopener noreferrer" data-testid={`channel-external-${c.id}`}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#22d3ee', padding: '6px 12px', borderRadius: '3px', fontSize: 12, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Open <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Connect modal */}
      {openConnect && (
        <div data-testid="channel-connect-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ width: 480, background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ margin: 0, color: '#f1f5f9' }}>Connect {openConnect.name}</h4>
              <button onClick={() => setOpenConnect(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {/* Mode picker */}
            {openConnect.supports_oauth && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <label data-testid="mode-oauth-stub" style={{ flex: 1, cursor: 'pointer', padding: '10px 12px', borderRadius: '3px', border: mode === 'oauth_stub' ? `1px solid ${openConnect.color}` : '1px solid #334155', background: mode === 'oauth_stub' ? `${openConnect.color}11` : 'transparent' }}>
                  <input type="radio" checked={mode === 'oauth_stub'} onChange={() => setMode('oauth_stub')} style={{ display: 'none' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>OAuth (Recommended)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Sign in via {openConnect.oauth_provider}. Currently pending provider approval.</div>
                </label>
                <label data-testid="mode-manual" style={{ flex: 1, cursor: 'pointer', padding: '10px 12px', borderRadius: '3px', border: mode === 'manual' ? `1px solid ${openConnect.color}` : '1px solid #334155', background: mode === 'manual' ? `${openConnect.color}11` : 'transparent' }}>
                  <input type="radio" checked={mode === 'manual'} onChange={() => setMode('manual')} style={{ display: 'none' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Manual</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Paste your {openConnect.manual_label}.</div>
                </label>
              </div>
            )}

            {/* OAuth stub message */}
            {mode === 'oauth_stub' && (
              <div data-testid="oauth-stub-message" style={{ padding: 14, background: '#1e293b', border: '1px dashed #f59e0b66', borderRadius: '3px', fontSize: 13, color: '#cbd5e1', lineHeight: 1.55 }}>
                <strong style={{ color: '#f59e0b' }}>OAuth coming soon.</strong> We&apos;re finalizing approval with {openConnect.oauth_provider}. In the meantime, click below to register your interest — we&apos;ll email when it&apos;s ready, and you can switch over without losing data.
                <button onClick={handleSubmit} disabled={saving} data-testid="oauth-stub-request"
                  style={{ marginTop: 12, width: '100%', background: '#f59e0b', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  {saving ? 'Saving…' : 'Request early access'}
                </button>
              </div>
            )}

            {/* Manual mode */}
            {mode === 'manual' && (
              <>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{openConnect.manual_label}</label>
                <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={openConnect.manual_label} data-testid="manual-identifier-input" autoFocus
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 13 }} />
                {openConnect.external_setup_url && (
                  <a href={openConnect.external_setup_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#22d3ee', textDecoration: 'none' }}>
                    Where do I get this? <ExternalLink size={10} />
                  </a>
                )}
                <button onClick={handleSubmit} disabled={saving || !identifier.trim()} data-testid="manual-connect-btn"
                  style={{ marginTop: 14, width: '100%', background: openConnect.color, color: '#0f172a', border: 'none', padding: '10px', borderRadius: '3px', fontWeight: 700, cursor: saving || !identifier.trim() ? 'not-allowed' : 'pointer', fontSize: 13, opacity: !identifier.trim() ? 0.6 : 1 }}>
                  {saving ? 'Connecting…' : 'Connect'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin {to {transform: rotate(360deg);}} .spin{animation: spin 1s linear infinite;}`}</style>
    </div>
  );
}
