import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, useToast } from '../App';
import { Share2, Calendar, Clock, CheckCircle2, Trash2, Plus } from 'lucide-react';

const PLATFORMS = [
  { id: 'Instagram', bestTime: '18:30', formats: ['Reel', 'Carousel', 'Story', 'Single Post'] },
  { id: 'TikTok', bestTime: '20:00', formats: ['Short Video', 'Duet / Stitch', 'Photo Mode'] },
  { id: 'YouTube', bestTime: '17:00', formats: ['YouTube Short', 'Full Video', 'Community Post'] },
  { id: 'X', bestTime: '12:30', formats: ['Thread', 'Single Post', 'Video Clip'] },
  { id: 'LinkedIn', bestTime: '09:00', formats: ['Thought Leadership', 'Carousel PDF', 'Video'] },
  { id: 'Facebook', bestTime: '19:00', formats: ['Reel', 'Page Post', 'Event Promo'] },
];

export default function ContentCalendar() {
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    platform: 'Instagram',
    format: 'Reel',
    title: '',
    caption: '',
    date: todayStr,
    time: '18:30',
  });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/social-ai/scheduled');
      setPosts(res.data?.posts || []);
    } catch (err) {
      toastRef.current('Error', err.response?.data?.detail || 'Failed to load scheduled posts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const activePlatformMeta = PLATFORMS.find((p) => p.id === form.platform) || PLATFORMS[0];

  const handlePlatformSelect = (platId) => {
    const meta = PLATFORMS.find((p) => p.id === platId) || PLATFORMS[0];
    setForm((prev) => ({
      ...prev,
      platform: platId,
      format: meta.formats[0],
      time: meta.bestTime,
    }));
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      addToast('Missing Details', 'Title and Date are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const scheduled_for = `${form.date}T${form.time || '12:00'}:00`;
      const res = await api.post('/api/social-ai/scheduled', {
        platform: form.platform,
        format: form.format,
        title: form.title.trim(),
        caption: form.caption.trim(),
        scheduled_for,
      });
      if (res.data?.post) {
        addToast('Scheduled', `Post scheduled on ${form.platform}`, 'success');
        setForm({ ...form, title: '', caption: '' });
        loadPosts();
      }
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to schedule post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPublished = async (post) => {
    try {
      await api.patch(`/api/social-ai/scheduled/${post.id}`, { status: 'published' });
      addToast('Published', 'Post marked as published', 'success');
      loadPosts();
    } catch {
      addToast('Error', 'Failed to update post status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/social-ai/scheduled/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      addToast('Deleted', 'Scheduled post removed', 'success');
    } catch {
      addToast('Error', 'Failed to delete post', 'error');
    }
  };

  const filteredPosts = platformFilter === 'all' ? posts : posts.filter((p) => p.platform === platformFilter);

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
          <Share2 size={22} color="#f43f5e" />
          Content Calendar · Social AI Scheduler
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Plan, schedule, and track your cross-platform posts with recommended peak-engagement windows.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.3fr)', gap: '20px', alignItems: 'start' }}>
        {/* Schedule Form */}
        <form onSubmit={handleSchedule} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>Schedule a Post</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <select value={form.platform} onChange={(e) => handlePlatformSelect(e.target.value)} style={inputStyle}>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
            </select>
            <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} style={inputStyle}>
              {activePlatformMeta.formats.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} /> Suggested peak time for {form.platform}: {activePlatformMeta.bestTime}
          </div>

          <input type="text" placeholder="Campaign / Post Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={inputStyle} />
          <textarea rows={4} placeholder="Caption, hooks, and hashtags..." value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required style={inputStyle} />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inputStyle} />
          </div>

          <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '3px', border: 'none', background: '#f43f5e', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Plus size={15} /> {submitting ? 'Scheduling...' : 'Add to Calendar →'}
          </button>
        </form>

        {/* Calendar / Queue */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>Scheduled Queue ({filteredPosts.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {['all', ...PLATFORMS.map((p) => p.id)].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatformFilter(plat)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    border: `1px solid ${platformFilter === plat ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`,
                    background: platformFilter === plat ? 'rgba(244, 63, 94, 0.15)' : '#0f172a',
                    color: platformFilter === plat ? '#fda4af' : '#94a3b8',
                  }}
                >
                  {plat === 'all' ? 'All' : plat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loading calendar...</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#64748b', padding: '24px', textAlign: 'center' }}>
              No posts scheduled yet. Add your first post on the left or schedule directly from Social AI.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPosts.map((p) => (
                <div key={p.id} style={{ background: '#0f172a', borderRadius: '3px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#fda4af' }}>
                      {p.platform} · {p.format}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: '3px',
                      background: p.status === 'published' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)',
                      color: p.status === 'published' ? '#34d399' : '#38bdf8',
                    }}>
                      {p.status || 'scheduled'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{p.title}</div>
                  {p.caption && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                      {p.caption}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {p.scheduled_for ? p.scheduled_for.replace('T', ' ').slice(0, 16) : ''}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {p.status !== 'published' && (
                        <button type="button" onClick={() => handleMarkPublished(p)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#1e293b', color: '#34d399', fontSize: '11px', cursor: 'pointer' }}>
                          <CheckCircle2 size={12} /> Mark Published
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc', fontSize: '13px' };
