import React, { useState } from 'react';
import { api, useAuth, useToast } from '../App';
import { Newspaper, Sparkles, Copy, Download, Check } from 'lucide-react';

const ANNOUNCEMENT_TYPES = [
  'Product / Platform Launch',
  'Music / Album Release',
  'Strategic Partnership',
  'Live Event / Tour',
  'Funding / Milestone',
];

export default function PressReleaseAI() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    announcement_type: ANNOUNCEMENT_TYPES[0],
    company_name: user?.brand_name || '',
    topic: '',
    location: 'Nairobi, Kenya',
    release_date: 'For Immediate Release',
    key_facts: '',
    quote: '',
    media_contact: user?.email || '',
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.topic.trim()) {
      addToast('Missing Details', 'Please provide an Organization/Artist Name and Headline/Topic.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/ai/generate', {
        tool_id: 'pressrelease',
        inputs: form,
      });
      setOutput(res.data?.content || '');
      if (refreshUser) refreshUser();
      addToast('Press Release Ready', 'Saved automatically to your AI Output Library.', 'success');
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to generate press release', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    addToast('Copied', 'Press release copied to clipboard', 'success');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `press-release-${(form.company_name || 'intermaven').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
          <Newspaper size={22} color="#38bdf8" />
          Press Release AI
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Generate AP-style, newsroom-ready press releases for launches, releases, partnerships, and events.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '20px', alignItems: 'start' }}>
        <form onSubmit={handleGenerate} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={labelStyle}>Announcement Type</label>
          <select value={form.announcement_type} onChange={(e) => setForm({ ...form, announcement_type: e.target.value })} style={inputStyle}>
            {ANNOUNCEMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label style={labelStyle}>Organization / Artist Name *</label>
          <input type="text" placeholder="e.g. Intermaven / Savara" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required style={inputStyle} />

          <label style={labelStyle}>Headline / Core Announcement *</label>
          <input type="text" placeholder="e.g. Launches AI Operating System for African Creators" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>City / Dateline</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={labelStyle}>Release Timing</label>
              <input type="text" value={form.release_date} onChange={(e) => setForm({ ...form, release_date: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <label style={labelStyle}>Key Facts, Metrics & Dates</label>
          <textarea rows={3} placeholder="Who, what, pricing, availability, key features..." value={form.key_facts} onChange={(e) => setForm({ ...form, key_facts: e.target.value })} style={inputStyle} />

          <label style={labelStyle}>Executive / Artist Quote (optional)</label>
          <textarea rows={2} placeholder='"We built this to give independent creators..." — Founder Name' value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} style={inputStyle} />

          <label style={labelStyle}>Media Contact</label>
          <input type="text" placeholder="Name, email, phone" value={form.media_contact} onChange={(e) => setForm({ ...form, media_contact: e.target.value })} style={inputStyle} />

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
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} />
            {loading ? 'Drafting Press Release...' : 'Generate Press Release →'}
          </button>
        </form>

        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Generated Press Release</span>
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
              style={{ ...inputStyle, flex: 1, fontFamily: 'Georgia, serif', lineHeight: 1.65, width: '100%', boxSizing: 'border-box' }}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '24px' }}>
              Fill in your announcement details on the left and click Generate Press Release. Your draft will also be saved to the AI Output Library.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '-6px' };
const inputStyle = {
  padding: '9px 11px',
  borderRadius: '3px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '13px',
};
const btnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 10px',
  borderRadius: '3px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: '#0f172a',
  color: '#e2e8f0',
  fontSize: '12px',
  cursor: 'pointer',
};
