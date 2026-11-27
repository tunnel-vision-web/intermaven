import React, { useState, useMemo } from 'react';
import { DollarSign, Download, RotateCcw } from 'lucide-react';

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', rateUsd: 0.0038, africaMultiplier: 0.55 },
  { id: 'apple', name: 'Apple Music', rateUsd: 0.0076, africaMultiplier: 0.65 },
  { id: 'youtube', name: 'YouTube Music / Content ID', rateUsd: 0.0018, africaMultiplier: 0.6 },
  { id: 'boomplay', name: 'Boomplay', rateUsd: 0.0014, africaMultiplier: 1.0 },
  { id: 'audiomack', name: 'Audiomack', rateUsd: 0.0016, africaMultiplier: 1.0 },
  { id: 'tiktok', name: 'TikTok (Creations / Views)', rateUsd: 0.0007, africaMultiplier: 0.7 },
];

const KES_PER_USD = 129.0;

export default function RoyaltyCalculator() {
  const [streams, setStreams] = useState({
    spotify: 50000,
    apple: 20000,
    youtube: 80000,
    boomplay: 40000,
    audiomack: 25000,
    tiktok: 100000,
  });
  const [audienceRegion, setAudienceRegion] = useState('mixed'); // 'global' | 'mixed' | 'africa'
  const [splits, setSplits] = useState({
    artist: 60,
    producer: 20,
    label: 20,
  });

  const handleStreamChange = (id, val) => {
    const num = Math.max(0, Number(val) || 0);
    setStreams((prev) => ({ ...prev, [id]: num }));
  };

  const handleSplitChange = (role, val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setSplits((prev) => ({ ...prev, [role]: num }));
  };

  const splitTotal = splits.artist + splits.producer + splits.label;

  const breakdown = useMemo(() => {
    return PLATFORMS.map((p) => {
      const count = streams[p.id] || 0;
      const mult =
        audienceRegion === 'global'
          ? 1.0
          : audienceRegion === 'africa'
          ? p.africaMultiplier
          : (1.0 + p.africaMultiplier) / 2;
      const usd = count * p.rateUsd * mult;
      const kes = usd * KES_PER_USD;
      return { ...p, count, usd, kes };
    });
  }, [streams, audienceRegion]);

  const totalStreams = breakdown.reduce((s, b) => s + b.count, 0);
  const totalUsd = breakdown.reduce((s, b) => s + b.usd, 0);
  const totalKes = totalUsd * KES_PER_USD;

  const handleExportCsv = () => {
    const rows = [
      ['Platform', 'Streams', 'Estimated USD', 'Estimated KES'],
      ...breakdown.map((b) => [b.name, b.count, b.usd.toFixed(2), b.kes.toFixed(0)]),
      ['TOTAL', totalStreams, totalUsd.toFixed(2), totalKes.toFixed(0)],
      [],
      ['Role', 'Split %', 'USD Share', 'KES Share'],
      ['Artist', `${splits.artist}%`, ((totalUsd * splits.artist) / 100).toFixed(2), ((totalKes * splits.artist) / 100).toFixed(0)],
      ['Producer', `${splits.producer}%`, ((totalUsd * splits.producer) / 100).toFixed(2), ((totalKes * splits.producer) / 100).toFixed(0)],
      ['Label / Distro', `${splits.label}%`, ((totalUsd * splits.label) / 100).toFixed(2), ((totalKes * splits.label) / 100).toFixed(0)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'royalty-projection.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
            <DollarSign size={22} color="#f59e0b" />
            Royalty Calculator
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Project streaming payouts across global & African DSPs and model artist/producer/label splits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setStreams({ spotify: 0, apple: 0, youtube: 0, boomplay: 0, audiomack: 0, tiktok: 0 })}
            style={btnStyle}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{ ...btnStyle, background: '#f59e0b', color: '#1c1917', border: 'none', fontWeight: 700 }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={kpiCard}>
          <div style={kpiLabel}>Total Streams</div>
          <div style={kpiValue}>{totalStreams.toLocaleString()}</div>
        </div>
        <div style={kpiCard}>
          <div style={kpiLabel}>Projected Gross (USD)</div>
          <div style={{ ...kpiValue, color: '#34d399' }}>${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div style={kpiCard}>
          <div style={kpiLabel}>Projected Gross (KES)</div>
          <div style={{ ...kpiValue, color: '#fbbf24' }}>KES {Math.round(totalKes).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* Left: Stream Inputs */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>Streams by Platform</span>
            <select value={audienceRegion} onChange={(e) => setAudienceRegion(e.target.value)} style={inputStyle}>
              <option value="mixed">Mixed Global + Africa</option>
              <option value="global">Tier-1 Global (US/UK/EU)</option>
              <option value="africa">Africa-First Audience</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {breakdown.map((b) => (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.9fr', gap: '10px', alignItems: 'center', background: '#0f172a', padding: '10px 12px', borderRadius: '3px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Base ~${b.rateUsd}/stream</div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={b.count}
                  onChange={(e) => handleStreamChange(b.id, e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>${b.usd.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>KES {Math.round(b.kes).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Royalty Split Breakdown */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>Split Cascade Preview</div>
          <div style={{ fontSize: '12px', color: splitTotal === 100 ? '#34d399' : '#f87171', marginBottom: '14px' }}>
            Total Allocated: {splitTotal}% {splitTotal !== 100 ? '(Adjust to equal 100%)' : '✓ Balanced'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'artist', label: 'Artist / Songwriter' },
              { key: 'producer', label: 'Producer / Beatmaker' },
              { key: 'label', label: 'Label / Distributor' },
            ].map((role) => {
              const pct = splits[role.key];
              const usdShare = (totalUsd * pct) / 100;
              const kesShare = (totalKes * pct) / 100;
              return (
                <div key={role.key} style={{ background: '#0f172a', padding: '12px', borderRadius: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{role.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pct}
                        onChange={(e) => handleSplitChange(role.key, e.target.value)}
                        style={{ ...inputStyle, width: '64px', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                    <span>Share Payout</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                      ${usdShare.toFixed(2)} · KES {Math.round(kesShare).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const kpiCard = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '14px 16px' };
const kpiLabel = { fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 };
const kpiValue = { fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' };
const inputStyle = { padding: '7px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#1e293b', color: '#f8fafc', fontSize: '13px' };
const btnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.14)', background: '#1e293b', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer' };
