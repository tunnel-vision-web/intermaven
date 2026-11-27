import React, { useState } from 'react';
import { api, useAuth, useToast } from '../App';
import { ShoppingBag, Sparkles, Copy, Download, Check } from 'lucide-react';

const PRINT_METHODS = [
  'Screenprint + Woven Neck Label',
  'DTG (Direct-to-Garment)',
  '3D Puff Print + Embroidery',
  'Cut & Sew Custom',
  'Sublimation / All-Over Print',
];

export default function MerchBriefAI() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    brand_name: user?.brand_name || '',
    theme: '',
    garments: 'Heavyweight 240gsm Tees, Boxy Hoodies, Dad Caps, Tote Bags',
    audience: 'Streetwear / Tour Merch (Mid-Premium)',
    colors: 'Washed Black, Forest Green, Bone Cream',
    print_method: PRINT_METHODS[0],
    quantity: '150 units (S–XXL)',
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.brand_name.trim() || !form.theme.trim()) {
      addToast('Missing Details', 'Enter your Brand/Artist Name and Drop Theme.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/ai/generate', {
        tool_id: 'merchbrief',
        inputs: form,
      });
      setOutput(res.data?.content || '');
      if (refreshUser) refreshUser();
      addToast('Brief Generated', 'Saved automatically to your AI Output Library.', 'success');
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to generate merch brief', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    addToast('Copied', 'Merch brief copied to clipboard', 'success');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merch-brief-${(form.brand_name || 'drop').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
          <ShoppingBag size={22} color="#10b981" />
          Merch Designer Brief
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Generate production-ready apparel specifications, print dimensions, colorways, and vendor checklists.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '20px', alignItems: 'start' }}>
        <form onSubmit={handleGenerate} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={labelStyle}>Brand / Artist Name *</label>
          <input type="text" placeholder="e.g. TuneMavens Collective" value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} required style={inputStyle} />

          <label style={labelStyle}>Collection / Drop Theme *</label>
          <input type="text" placeholder="e.g. East Africa Tour 2026 Capsule" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} required style={inputStyle} />

          <label style={labelStyle}>Garments / Product Lineup</label>
          <textarea rows={2} value={form.garments} onChange={(e) => setForm({ ...form, garments: e.target.value })} style={inputStyle} />

          <label style={labelStyle}>Print / Branding Method</label>
          <select value={form.print_method} onChange={(e) => setForm({ ...form, print_method: e.target.value })} style={inputStyle}>
            {PRINT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Color Palette</label>
              <input type="text" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={labelStyle}>Quantity & Sizes</label>
              <input type="text" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <label style={labelStyle}>Target Audience & Price Tier</label>
          <input type="text" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} style={inputStyle} />

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '3px',
              border: 'none',
              background: '#10b981',
              color: '#022c22',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} />
            {loading ? 'Creating Production Brief...' : 'Generate Merch Brief →'}
          </button>
        </form>

        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Production & Design Brief</span>
            {output && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={handleCopy} style={btnStyle}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
                <button type="button" onClick={handleDownload} style={btnStyle}>
                  <Download size={14} /> Download .txt
                </button>
              </div>
            )}
          </div>
          {output ? (
            <textarea
              rows={20}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' }}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '24px' }}>
              Enter your collection theme and garment specs on the left to generate a vendor-ready merch brief.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '-6px' };
const inputStyle = { padding: '9px 11px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc', fontSize: '13px' };
const btnStyle = { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.14)', background: '#0f172a', color: '#e2e8f0', fontSize: '12px', cursor: 'pointer' };
