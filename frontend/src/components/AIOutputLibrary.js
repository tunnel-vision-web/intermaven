import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, useToast } from '../App';
import { Sparkles, Search, Star, Copy, Download, Trash2, Eye, X, Check } from 'lucide-react';

const TOOL_FILTERS = [
  { id: 'all', label: 'All Tools' },
  { id: 'brandkit', label: 'Brand Kit AI' },
  { id: 'musicbio', label: 'Music Bio AI' },
  { id: 'social', label: 'Social AI' },
  { id: 'syncpitch', label: 'Sync Pitch AI' },
  { id: 'bizpitch', label: 'Pitch Deck AI' },
  { id: 'pressrelease', label: 'Press Release AI' },
  { id: 'lyrichook', label: 'Lyric & Hook AI' },
  { id: 'merchbrief', label: 'Merch Brief' },
];

export default function AIOutputLibrary() {
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolFilter, setToolFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchOutputs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (toolFilter !== 'all') params.set('tool_id', toolFilter);
      if (search.trim()) params.set('search', search.trim());
      if (favoritesOnly) params.set('favorites', 'true');
      const res = await api.get(`/api/ai/outputs?${params.toString()}`);
      setOutputs(res.data?.outputs || []);
    } catch (err) {
      toastRef.current('Error', err.response?.data?.detail || 'Failed to load AI Output Library', 'error');
    } finally {
      setLoading(false);
    }
  }, [toolFilter, search, favoritesOnly]);

  useEffect(() => {
    const t = setTimeout(fetchOutputs, 200);
    return () => clearTimeout(t);
  }, [fetchOutputs]);

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content || '');
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
      addToast('Copied', 'Output copied to clipboard', 'success');
    } catch {
      addToast('Error', 'Could not copy to clipboard', 'error');
    }
  };

  const handleDownload = (item) => {
    const blob = new Blob([`${item.title}\nTool: ${item.tool_id}\nCreated: ${item.created_at}\n\n${item.content}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(item.title || 'ai-output').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleFavorite = async (item) => {
    try {
      const res = await api.patch(`/api/ai/outputs/${item.id}`, { is_favorite: !item.is_favorite });
      const updated = res.data?.output;
      if (updated) {
        setOutputs((prev) => prev.map((o) => (o.id === item.id ? updated : o)));
        if (selected?.id === item.id) setSelected(updated);
      }
    } catch {
      addToast('Error', 'Failed to update favorite status', 'error');
    }
  };

  const handleDelete = async (item) => {
    try {
      await api.delete(`/api/ai/outputs/${item.id}`);
      setOutputs((prev) => prev.filter((o) => o.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      addToast('Deleted', 'Output removed from library', 'success');
    } catch {
      addToast('Error', 'Failed to delete output', 'error');
    }
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
            <Sparkles size={22} color="#10b981" />
            AI Output Library
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Every generation from your AI studio tools is automatically saved here for reuse.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '3px',
            border: `1px solid ${favoritesOnly ? '#f59e0b' : 'rgba(255,255,255,0.14)'}`,
            background: favoritesOnly ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
            color: favoritesOnly ? '#fbbf24' : '#cbd5e1',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Star size={14} fill={favoritesOnly ? '#fbbf24' : 'none'} />
          Favorites
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
          {TOOL_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setToolFilter(t.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '3px',
                border: `1px solid ${toolFilter === t.id ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                background: toolFilter === t.id ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                color: toolFilter === t.id ? '#34d399' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search saved outputs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              borderRadius: '3px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '3px' }}>
          Loading saved outputs...
        </div>
      ) : outputs.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Sparkles size={32} color="#475569" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>No saved outputs yet</div>
          <div style={{ fontSize: '13px' }}>Run any AI tool (Brand Kit, Social AI, Music Bio, Sync Pitch, Pitch Deck) and your results will appear here automatically.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {outputs.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '3px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#22d3ee', letterSpacing: '0.04em' }}>
                    {item.tool_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: item.is_favorite ? '#fbbf24' : '#64748b' }}
                    title="Toggle favorite"
                  >
                    <Star size={15} fill={item.is_favorite ? '#fbbf24' : 'none'} />
                  </button>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, maxHeight: '72px', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                  {item.content}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setSelected(item)} title="View" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                    <Eye size={15} />
                  </button>
                  <button type="button" onClick={() => handleCopy(item)} title="Copy" style={{ background: 'none', border: 'none', color: copiedId === item.id ? '#10b981' : '#cbd5e1', cursor: 'pointer' }}>
                    {copiedId === item.id ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                  <button type="button" onClick={() => handleDownload(item)} title="Download .txt" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                    <Download size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(item)} title="Delete" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '3px', maxWidth: '760px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#22d3ee' }}>{selected.tool_id}</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>{selected.title}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.65, color: '#e2e8f0' }}>
              {selected.content}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => handleCopy(selected)} style={{ padding: '8px 14px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.14)', background: '#1e293b', color: '#e2e8f0', cursor: 'pointer', fontSize: '13px' }}>
                Copy Text
              </button>
              <button type="button" onClick={() => handleDownload(selected)} style={{ padding: '8px 14px', borderRadius: '3px', border: 'none', background: '#10b981', color: '#022c22', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                Download .txt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
