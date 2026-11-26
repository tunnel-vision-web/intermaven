import React, { useState, useEffect } from 'react';
import { api } from '../App';
import FlatIcon from './FlatIcon';
import AppHelpAiControls from './AppHelpAiControls';

const STATUS_STYLE = {
  Live: { bg: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  LIVE: { bg: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  live: { bg: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  Scheduled: { bg: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
  scheduled: { bg: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  pending: { bg: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  Delivering: { bg: 'rgba(34, 211, 238, 0.16)', color: '#22d3ee', border: 'rgba(34, 211, 238, 0.35)' },
  'Action Required': { bg: 'rgba(239, 68, 68, 0.16)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  action_required: { bg: 'rgba(239, 68, 68, 0.16)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
};

export default function DistroPanel({ user }) {
  const [releases, setReleases] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [ddexSheet, setDdexSheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    artist: user?.brand_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Artist',
    genre: 'Afro-House',
    release_type: 'Single',
    upc: '',
    isrc: '',
    release_date: new Date().toISOString().split('T')[0],
    outlets: ['spotify', 'apple_music', 'youtube_music', 'tiktok', 'boomplay', 'tunestream'],
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [relRes, outRes, statRes] = await Promise.all([
        api.get('/api/distro/releases'),
        api.get('/api/distro/outlets').catch(() => ({ data: { outlets: [] } })),
        api.get('/api/distro/stats').catch(() => ({ data: null })),
      ]);
      setReleases(relRes.data?.releases || []);
      setOutlets((outRes.data?.outlets || []).slice(0, 24));
      setStats(statRes.data || null);
    } catch (err) {
      console.error('Distro load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleGenerateCodes = async () => {
    try {
      const [isrcRes, upcRes] = await Promise.all([
        api.post('/api/distro/generate-isrc'),
        api.post('/api/distro/generate-upc'),
      ]);
      setForm((prev) => ({
        ...prev,
        isrc: isrcRes.data?.isrc || prev.isrc,
        upc: upcRes.data?.upc || prev.upc,
      }));
    } catch (err) {
      console.error('Code gen error:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/distro/releases', form);
      if (res.data?.release || res.data?.id) {
        setStatusMsg('Release submitted to Distribution Tracker.');
        setShowModal(false);
        await loadAll();
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Failed to submit release');
    }
  };

  const handleDeliver = async (releaseId) => {
    try {
      await api.post(`/api/distro/releases/${releaseId}/deliver`, {});
      setStatusMsg('Release queued for DSP delivery.');
      await loadAll();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Delivery failed');
    }
  };

  const handleBulkDeliver = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/api/distro/bulk-deliver', { release_ids: selectedIds });
      setStatusMsg(`Bulk delivered ${selectedIds.length} release(s) to DSPs.`);
      setSelectedIds([]);
      await loadAll();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Bulk deliver failed');
    }
  };

  const handleViewSheet = async (releaseId) => {
    try {
      const res = await api.get(`/api/distro/releases/${releaseId}/sheet`);
      setDdexSheet(res.data);
    } catch (err) {
      setStatusMsg('Could not load DDEX sheet');
    }
  };

  const handleSimulateSync = async () => {
    try {
      await api.post('/api/distro/stats/simulate-sync');
      setStatusMsg('DSP streaming telemetry synced.');
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOutlet = (id) => {
    setForm((prev) => ({
      ...prev,
      outlets: prev.outlets.includes(id)
        ? prev.outlets.filter((o) => o !== id)
        : [...prev.outlets, id],
    }));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlatIcon name="distro" size={40} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
              Distribution Tracker
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Unified TuneMavens & Intermaven DSP Pipeline · 150+ Global Outlets · DDEX 3.8
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <AppHelpAiControls appId="distro" persona={user?.persona || 'creator'} compact />
          <button
            type="button"
            onClick={handleSimulateSync}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.05)',
              color: '#e6edf3',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sync DSP Telemetry
          </button>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDeliver}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#a78bfa',
                color: '#061224',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Bulk Deliver ({selectedIds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#14b8a6',
              color: '#061224',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Submit Release
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.14)', border: '1px solid rgba(20, 184, 166, 0.35)', color: '#5eead4', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{statusMsg}</span>
          <button type="button" onClick={() => setStatusMsg('')} style={{ background: 'none', border: 'none', color: '#5eead4', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Releases', value: stats?.total_releases ?? releases.length, accent: '#22d3ee' },
          { label: 'Live on DSPs', value: stats?.live_releases ?? releases.filter((r) => (r.status || '').toUpperCase() === 'LIVE').length, accent: '#10b981' },
          { label: 'Total Streams', value: (stats?.total_streams ?? releases.reduce((s, r) => s + (r.streams || 0), 0)).toLocaleString(), accent: '#a78bfa' },
          { label: 'Est. Royalties', value: `$${((stats?.estimated_revenue_usd ?? 0)).toFixed(2)}`, accent: '#f59e0b' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'rgba(13, 17, 23, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>{card.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: card.accent, marginTop: '4px' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Releases Table */}
      <div style={{ background: 'rgba(13, 17, 23, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>Loading Distribution Pipeline…</div>
        ) : releases.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No releases yet. Click "+ Submit Release" to start distributing.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px' }}>Select</th>
                  <th style={{ padding: '12px 14px' }}>Release</th>
                  <th style={{ padding: '12px 14px' }}>ISRC / UPC</th>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>DSP Statuses</th>
                  <th style={{ padding: '12px 14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((rel) => {
                  const id = rel.id || rel._id;
                  const outletStatuses = rel.outlet_statuses || rel.status || {};
                  const statusObj = typeof outletStatuses === 'object' ? outletStatuses : {};
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <input type="checkbox" checked={selectedIds.includes(id)} onChange={() => toggleSelect(id)} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{rel.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{rel.artist} · {rel.release_type || 'Single'}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
                        <div>{rel.isrc || '—'}</div>
                        <div style={{ color: '#64748b' }}>{rel.upc || '—'}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{rel.release_date || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {Object.entries(statusObj).slice(0, 6).map(([dsp, val]) => {
                            const st = typeof val === 'string' ? val : val?.status || 'Pending';
                            const sty = STATUS_STYLE[st] || STATUS_STYLE.Pending;
                            return (
                              <span
                                key={dsp}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: sty.bg,
                                  color: sty.color,
                                  border: `1px solid ${sty.border}`,
                                }}
                              >
                                {dsp}: {st}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleDeliver(id)}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(20,184,166,0.4)', background: 'rgba(20,184,166,0.14)', color: '#5eead4', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Deliver
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewSheet(id)}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: '#e6edf3', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            DDEX Sheet
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Release Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowModal(false)}>
          <form onSubmit={handleCreate} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '14px', padding: '24px', color: '#e6edf3', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '88vh', overflowY: 'auto' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Submit Release to DSPs</h3>
            <input required placeholder="Release Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input required placeholder="Primary Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input placeholder="ISRC (optional)" value={form.isrc} onChange={(e) => setForm({ ...form, isrc: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              <input placeholder="UPC (optional)" value={form.upc} onChange={(e) => setForm({ ...form, upc: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              <button type="button" onClick={handleGenerateCodes} style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.12)', color: '#67e8f9', fontWeight: 700, cursor: 'pointer' }}>Auto-Gen</button>
            </div>
            <input type="date" value={form.release_date} onChange={(e) => setForm({ ...form, release_date: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Select DSP Outlets ({form.outlets.length} selected)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(outlets.length ? outlets : [{ id: 'spotify', name: 'Spotify' }, { id: 'apple_music', name: 'Apple Music' }, { id: 'youtube_music', name: 'YouTube Music' }, { id: 'tiktok', name: 'TikTok' }, { id: 'boomplay', name: 'Boomplay' }, { id: 'tunestream', name: 'TuneStream' }]).map((o) => {
                  const active = form.outlets.includes(o.id);
                  return (
                    <button key={o.id} type="button" onClick={() => toggleOutlet(o.id)} style={{ padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: active ? '1px solid #14b8a6' : '1px solid rgba(255,255,255,0.12)', background: active ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.04)', color: active ? '#5eead4' : '#cbd5e1' }}>
                      {o.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#14b8a6', color: '#061224', fontWeight: 700, cursor: 'pointer' }}>Submit Release</button>
            </div>
          </form>
        </div>
      )}

      {/* DDEX Sheet Modal */}
      {ddexSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setDdexSheet(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '14px', padding: '20px', color: '#e6edf3', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>DDEX 3.8 Manifest Sheet</h3>
              <button type="button" onClick={() => setDdexSheet(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <pre style={{ background: '#161b22', padding: '14px', borderRadius: '10px', fontSize: '12px', overflowX: 'auto', color: '#a5f3fc' }}>
              {JSON.stringify(ddexSheet, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
