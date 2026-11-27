import React, { useState } from 'react';
import { api, useAuth, useToast } from '../App';
import { Music, Sparkles, Copy, Download, Check } from 'lucide-react';

const GENRES = ['Afrobeats', 'Amapiano', 'Gengetone / Arbantone', 'Bongo Flava', 'Hip-Hop / Trap', 'R&B / Soul', 'Gospel', 'Afro-Pop'];
const MOODS = ['Uplifting / Anthem', 'Club / High-Energy', 'Romantic / Smooth', 'Reflective / Storytelling', 'Street / Confident'];

export default function LyricHookAI() {
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    title: '',
    genre: GENRES[0],
    mood: MOODS[0],
    bpm: '105 BPM',
    language_mix: 'English / Swahili',
    theme: '',
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() && !form.theme.trim()) {
      addToast('Missing Details', 'Enter a Song Concept/Title or Theme.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/ai/generate', {
        tool_id: 'lyrichook',
        inputs: form,
      });
      setOutput(res.data?.content || '');
      if (refreshUser) refreshUser();
      addToast('Lyrics Ready', 'Saved automatically to your AI Output Library.', 'success');
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to generate lyrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    addToast('Copied', 'Lyrics copied to clipboard', 'success');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics-${(form.title || 'hook').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
          <Music size={22} color="#f43f5e" />
          Lyric & Hook AI
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Generate genre-specific hooks, verse structures, rhyme schemes, and vocal cadence notes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '20px', alignItems: 'start' }}>
        <form onSubmit={handleGenerate} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={labelStyle}>Song Title / Working Concept *</label>
          <input type="text" placeholder="e.g. Nairobi Nights" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Genre</label>
              <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Mood / Vibe</label>
              <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Tempo / BPM</label>
              <input type="text" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={labelStyle}>Language / Slang Mix</label>
              <input type="text" value={form.language_mix} onChange={(e) => setForm({ ...form, language_mix: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <label style={labelStyle}>Story / Key Themes</label>
          <textarea rows={4} placeholder="Describe the story, imagery, or punchlines you want in the track..." value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} style={inputStyle} />

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
              background: '#e11d48',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} />
            {loading ? 'Writing Hooks & Verses...' : 'Generate Lyrics & Hooks →'}
          </button>
        </form>

        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Songwriting Sheet</span>
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
              Pick a genre, mood, and concept on the left to generate hook options, verse bars, and vocal cadence notes.
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
