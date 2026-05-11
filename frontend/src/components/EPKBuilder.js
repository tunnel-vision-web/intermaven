import React, { useState, useEffect } from 'react';
import { api } from '../App';
import {
  Music, Globe, Image, Video, FileText, Mail, Phone,
  Instagram, Twitter, Youtube, Facebook, Link2, Plus,
  Trash2, Eye, EyeOff, Download, Edit2, Check, X,
  ExternalLink, Copy, BarChart2, MapPin, Calendar,
  ChevronDown, ChevronUp, Save, Palette, User, Star,
  Play, Share2, Sparkles, AlertCircle, Clock
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'bold', label: 'Bold', desc: 'Dark, high-impact layout', preview: '#1a0a30' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean, editorial feel', preview: '#0f1117' },
  { id: 'classic', label: 'Classic', desc: 'Warm, professional tone', preview: '#1c1208' },
];

const GENRE_OPTIONS = [
  'Afrobeats', 'Afro-soul', 'Gengetone', 'Bongo Flava', 'Amapiano',
  'R&B', 'Hip Hop', 'Gospel', 'Jazz', 'Reggae', 'Electronic', 'Pop',
  'Neo-Soul', 'Dancehall', 'Highlife', 'Afropop', 'Spoken Word', 'Podcast',
];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourhandle' },
  { key: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/yourhandle' },
  { key: 'tiktok', label: 'TikTok', icon: Play, placeholder: 'https://tiktok.com/@yourhandle' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
  { key: 'spotify', label: 'Spotify', icon: Music, placeholder: 'https://open.spotify.com/artist/...' },
];

// ── Helpers ───────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="epk-section">
      <div className={`epk-section-header ${collapsible ? 'clickable' : ''}`} onClick={collapsible ? () => setOpen(o => !o) : undefined}>
        <div className="epk-section-title"><Icon size={15} /><span>{title}</span></div>
        {collapsible && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </div>
      {open && <div className="epk-section-body">{children}</div>}
    </div>
  );
}

function SaveBar({ saving, saved, onSave, onPreview, epk }) {
  return (
    <div className="epk-save-bar">
      <div className="epk-save-status">
        {saved ? <><Check size={13} color="#10b981" /> Saved</> : saving ? <><span className="spinner" /> Saving...</> : <><Clock size={13} /> Unsaved changes</>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {epk?.username && (
          <button className="admin-btn-secondary" onClick={onPreview}>
            <Eye size={13} /> Preview
          </button>
        )}
        <button className="admin-btn-primary" onClick={onSave} disabled={saving}>
          <Save size={13} /> {saving ? 'Saving...' : 'Save EPK'}
        </button>
      </div>
    </div>
  );
}

// ── EPK Builder Main ──────────────────────────────────────────────
function EPKBuilder({ user, addToast, updateUser }) {
  const [epk, setEpk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Form state
  const [form, setForm] = useState({
    username: '',
    artist_name: '',
    tagline: '',
    genres: [],
    location: '',
    bio_short: '',
    bio_full: '',
    highlights: [],
    music: { spotify_artist_id: '', apple_music_url: '', youtube_channel: '', soundcloud_url: '', boomplay_url: '' },
    social_links: { instagram: '', twitter: '', tiktok: '', youtube: '', facebook: '', spotify: '' },
    contact: { booking_email: '', management_email: '', press_email: '', booking_form_enabled: true },
    press_quotes: [],
    press_links: [],
    events_upcoming: [],
    design: { template: 'bold', primary_color: '#10b981', secondary_color: '#c084fc' },
    is_published: false,
    hosting: { intermaven: true, intermavenmusic: false, custom_domain: '' },
  });

  const [usernameStatus, setUsernameStatus] = useState(''); // '', 'checking', 'available', 'taken'
  const [usernameTimer, setUsernameTimer] = useState(null);

  useEffect(() => {
    fetchEPK();
  }, []);

  const fetchEPK = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/epk/my');
      if (res.data.epk) {
        setEpk(res.data.epk);
        setForm(f => ({ ...f, ...res.data.epk }));
        setSaved(true);
      }
    } catch (e) {
      if (e.response?.status !== 404) addToast('Failed to load EPK', '', 'error');
    }
    setLoading(false);
  };

  const handleChange = (path, value) => {
    setSaved(false);
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      setForm(f => ({ ...f, [parent]: { ...f[parent], [child]: value } }));
    } else {
      setForm(f => ({ ...f, [path]: value }));
    }
  };

  const checkUsername = (username) => {
    if (usernameTimer) clearTimeout(usernameTimer);
    if (!username || username.length < 3) { setUsernameStatus(''); return; }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/epk/check-username?username=${username}&epk_id=${epk?.id || ''}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch { setUsernameStatus(''); }
    }, 500);
    setUsernameTimer(timer);
  };

  const toggleGenre = (g) => {
    setSaved(false);
    setForm(f => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g]
    }));
  };

  const handleSave = async () => {
    if (!form.artist_name.trim()) return addToast('Artist name required', '', 'error');
    setSaving(true);
    try {
      let res;
      if (epk?.id) {
        res = await api.put(`/api/epk/${epk.id}`, form);
      } else {
        res = await api.post('/api/epk/create', form);
      }
      setEpk(res.data.epk);
      setSaved(true);
      addToast('EPK saved!', '', 'success');
    } catch (e) {
      addToast('Failed to save', e.response?.data?.detail || '', 'error');
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!epk?.id) return addToast('Save your EPK first', '', 'error');
    try {
      const res = await api.post(`/api/epk/${epk.id}/publish`);
      setEpk(e => ({ ...e, is_published: res.data.is_published }));
      setForm(f => ({ ...f, is_published: res.data.is_published }));
      addToast(res.data.is_published ? 'EPK is now live!' : 'EPK unpublished', '', 'success');
    } catch { addToast('Failed', '', 'error'); }
  };

  const handleAutoGenerate = async (field) => {
    try {
      const res = await api.post('/api/ai/generate', {
        tool_id: 'musicbio',
        inputs: {
          artist: form.artist_name,
          genre: form.genres.join(', '),
          origin: form.location,
          story: form.bio_full || '',
          tone: 'Professional & formal',
          extra: 'Generate for EPK'
        }
      });
      if (field === 'bio_short') {
        const match = res.data.content.match(/SHORT BIO.*?\n([\s\S]{50,200}?)(?:\n\n|\n[A-Z])/i);
        if (match) handleChange('bio_short', match[1].trim());
      } else if (field === 'bio_full') {
        const match = res.data.content.match(/FULL BIO.*?\n([\s\S]{100,600}?)(?:\n\n|\n[A-Z])/i);
        if (match) handleChange('bio_full', match[1].trim());
      }
      updateUser({ ...user, credits: res.data.credits_remaining });
      addToast('Generated!', '15 credits used', 'success');
    } catch (e) {
      addToast('Generation failed', e.response?.data?.detail || '', 'error');
    }
  };

  const fetchAnalytics = async () => {
    if (!epk?.id) return;
    try {
      const res = await api.get(`/api/epk/${epk.id}/analytics`);
      setAnalytics(res.data);
      setShowAnalytics(true);
    } catch { addToast('Failed to load analytics', '', 'error'); }
  };

  const copyLink = () => {
    const url = `https://intermaven.io/artist/${form.username}`;
    navigator.clipboard.writeText(url);
    addToast('Link copied!', url, 'success');
  };

  if (loading) return <div className="admin-loading"><span className="spinner" /> Loading EPK Builder...</div>;

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'media', label: 'Media & Press', icon: Image },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'hosting', label: 'Hosting', icon: Globe },
  ];

  return (
    <div className="panel active epk-builder" data-testid="epk-panel">
      <div className="tool-header">
        <span className="tool-icon"><FileText size={26} color="#ec4899" /></span>
        <div className="tool-info">
          <h2>EPK Builder</h2>
          <p>Electronic Press Kit — build, publish, and host your artist profile</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {epk?.id && (
            <>
              <button className="admin-btn-secondary" onClick={fetchAnalytics}><BarChart2 size={13} /> Analytics</button>
              <button
                className={`admin-btn-secondary ${form.is_published ? 'published' : ''}`}
                onClick={handlePublish}
              >
                {form.is_published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
              </button>
            </>
          )}
          {form.username && form.is_published && (
            <button className="admin-btn-secondary" onClick={copyLink}><Copy size={13} /> Copy Link</button>
          )}
        </div>
      </div>

      {/* Status bar */}
      {epk?.id && (
        <div className={`epk-status-bar ${form.is_published ? 'live' : 'draft'}`}>
          <div className={`epk-status-dot ${form.is_published ? 'live' : ''}`} />
          {form.is_published
            ? <>Live at <a href={`https://intermaven.io/artist/${form.username}`} target="_blank" rel="noopener noreferrer">intermaven.io/artist/{form.username}</a></>
            : 'Draft — not publicly visible'}
        </div>
      )}

      <SaveBar saving={saving} saved={saved} onSave={handleSave} onPreview={() => setShowPreview(true)} epk={epk} />

      {/* Tab nav */}
      <div className="epk-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`epk-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div className="epk-tab-content">
          <Section title="Identity" icon={User}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label className="form-label">Artist / Stage Name <span className="required">*</span></label>
                <input className="form-input" placeholder="e.g. Amara Diallo" value={form.artist_name} onChange={e => handleChange('artist_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  EPK Username
                  <span className={`epk-username-status ${usernameStatus}`}>
                    {usernameStatus === 'checking' && ' checking...'}
                    {usernameStatus === 'available' && ' ✓ available'}
                    {usernameStatus === 'taken' && ' ✗ taken'}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="epk-username-prefix">intermaven.io/artist/</span>
                  <input
                    className="form-input epk-username-input"
                    placeholder="yourname"
                    value={form.username}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      handleChange('username', val);
                      checkUsername(val);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-input" placeholder="e.g. Afro-soul singer from Nairobi blending tradition with the future" value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} />
            </div>
            <div className="admin-form-grid">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="Nairobi, Kenya" value={form.location} onChange={e => handleChange('location', e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Genres" icon={Music}>
            <div className="social-chips">
              {GENRE_OPTIONS.map(g => (
                <button key={g} type="button" className={`social-chip ${form.genres.includes(g) ? 'active' : ''}`} onClick={() => toggleGenre(g)}>{g}</button>
              ))}
            </div>
          </Section>

          <Section title="Biography" icon={FileText}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Short Bio (100 words)</label>
                <button className="admin-btn-sm" onClick={() => handleAutoGenerate('bio_short')}><Sparkles size={11} /> AI Generate</button>
              </div>
              <textarea className="admin-textarea" rows={3} placeholder="A concise intro for cards, search results, and quick pitches..." value={form.bio_short} onChange={e => handleChange('bio_short', e.target.value)} />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Full Bio</label>
                <button className="admin-btn-sm" onClick={() => handleAutoGenerate('bio_full')}><Sparkles size={11} /> AI Generate</button>
              </div>
              <textarea className="admin-textarea" rows={6} placeholder="Your full story — career highlights, collaborations, achievements..." value={form.bio_full} onChange={e => handleChange('bio_full', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Career Highlights / Timeline</label>
              {form.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input className="form-input" style={{ width: 80 }} placeholder="Year" value={h.year} onChange={e => { const arr = [...form.highlights]; arr[i].year = e.target.value; handleChange('highlights', arr); }} />
                  <input className="form-input" style={{ flex: 1 }} placeholder="Milestone" value={h.text} onChange={e => { const arr = [...form.highlights]; arr[i].text = e.target.value; handleChange('highlights', arr); }} />
                  <button className="admin-action-btn danger" onClick={() => handleChange('highlights', form.highlights.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
                </div>
              ))}
              <button className="admin-btn-sm" onClick={() => handleChange('highlights', [...form.highlights, { year: '', text: '' }])}><Plus size={12} /> Add Milestone</button>
            </div>
          </Section>

          <Section title="Social Links" icon={Link2} collapsible defaultOpen={false}>
            {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label"><Icon size={13} /> {label}</label>
                <input className="form-input" placeholder={placeholder} value={form.social_links[key] || ''} onChange={e => handleChange(`social_links.${key}`, e.target.value)} />
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ── MUSIC TAB ── */}
      {activeTab === 'music' && (
        <div className="epk-tab-content">
          <Section title="Streaming Platforms" icon={Music}>
            <p className="social-hint">Add your profile links — these will embed your music directly on your EPK.</p>
            {[
              ['spotify_artist_id', 'Spotify Artist URL', 'https://open.spotify.com/artist/...'],
              ['apple_music_url', 'Apple Music URL', 'https://music.apple.com/artist/...'],
              ['youtube_channel', 'YouTube Channel URL', 'https://youtube.com/@yourchannel'],
              ['soundcloud_url', 'SoundCloud URL', 'https://soundcloud.com/yourprofile'],
              ['boomplay_url', 'Boomplay URL', 'https://www.boomplay.com/artists/...'],
            ].map(([key, label, placeholder]) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" placeholder={placeholder} value={form.music[key] || ''} onChange={e => handleChange(`music.${key}`, e.target.value)} />
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ── MEDIA & PRESS TAB ── */}
      {activeTab === 'media' && (
        <div className="epk-tab-content">
          <Section title="Press Quotes" icon={Star}>
            {form.press_quotes.map((q, i) => (
              <div key={i} className="epk-press-item">
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <textarea className="admin-textarea" rows={2} style={{ flex: 1 }} placeholder="Quote text..." value={q.quote} onChange={e => { const arr = [...form.press_quotes]; arr[i].quote = e.target.value; handleChange('press_quotes', arr); }} />
                  <button className="admin-action-btn danger" onClick={() => handleChange('press_quotes', form.press_quotes.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Publication / Source" value={q.source} onChange={e => { const arr = [...form.press_quotes]; arr[i].source = e.target.value; handleChange('press_quotes', arr); }} />
                  <input className="form-input" style={{ width: 120 }} placeholder="Date" value={q.date} onChange={e => { const arr = [...form.press_quotes]; arr[i].date = e.target.value; handleChange('press_quotes', arr); }} />
                </div>
              </div>
            ))}
            <button className="admin-btn-sm" onClick={() => handleChange('press_quotes', [...form.press_quotes, { quote: '', source: '', date: '' }])}><Plus size={12} /> Add Quote</button>
          </Section>

          <Section title="Press Coverage Links" icon={Link2} collapsible defaultOpen={false}>
            {form.press_links.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Headline / Title" value={l.title} onChange={e => { const arr = [...form.press_links]; arr[i].title = e.target.value; handleChange('press_links', arr); }} />
                <input className="form-input" placeholder="Publication" style={{ width: 140 }} value={l.publication} onChange={e => { const arr = [...form.press_links]; arr[i].publication = e.target.value; handleChange('press_links', arr); }} />
                <input className="form-input" placeholder="URL" style={{ flex: 1 }} value={l.url} onChange={e => { const arr = [...form.press_links]; arr[i].url = e.target.value; handleChange('press_links', arr); }} />
                <button className="admin-action-btn danger" onClick={() => handleChange('press_links', form.press_links.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
              </div>
            ))}
            <button className="admin-btn-sm" onClick={() => handleChange('press_links', [...form.press_links, { title: '', publication: '', url: '' }])}><Plus size={12} /> Add Link</button>
          </Section>
        </div>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === 'events' && (
        <div className="epk-tab-content">
          <Section title="Upcoming Shows" icon={Calendar}>
            {form.events_upcoming.length === 0 && <div className="admin-empty">No upcoming events added</div>}
            {form.events_upcoming.map((ev, i) => (
              <div key={i} className="epk-event-item">
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input type="date" className="form-input" style={{ width: 150 }} value={ev.date} onChange={e => { const arr = [...form.events_upcoming]; arr[i].date = e.target.value; handleChange('events_upcoming', arr); }} />
                  <input className="form-input" placeholder="Venue" style={{ flex: 1 }} value={ev.venue} onChange={e => { const arr = [...form.events_upcoming]; arr[i].venue = e.target.value; handleChange('events_upcoming', arr); }} />
                  <input className="form-input" placeholder="City" style={{ width: 120 }} value={ev.city} onChange={e => { const arr = [...form.events_upcoming]; arr[i].city = e.target.value; handleChange('events_upcoming', arr); }} />
                  <input className="form-input" placeholder="Ticket URL" style={{ flex: 1 }} value={ev.ticket_url} onChange={e => { const arr = [...form.events_upcoming]; arr[i].ticket_url = e.target.value; handleChange('events_upcoming', arr); }} />
                  <button className="admin-action-btn danger" onClick={() => handleChange('events_upcoming', form.events_upcoming.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            <button className="admin-btn-sm" onClick={() => handleChange('events_upcoming', [...form.events_upcoming, { date: '', venue: '', city: '', ticket_url: '' }])}><Plus size={12} /> Add Show</button>
          </Section>
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === 'contact' && (
        <div className="epk-tab-content">
          <Section title="Contact Information" icon={Mail}>
            {[
              ['contact.booking_email', 'Booking Enquiries Email', 'booking@yourmanagement.com'],
              ['contact.management_email', 'Management Email', 'management@yourteam.com'],
              ['contact.press_email', 'Press & Media Email', 'press@yourteam.com'],
            ].map(([path, label, placeholder]) => (
              <div key={path} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type="email" placeholder={placeholder} value={path.split('.').reduce((obj, k) => obj?.[k], form) || ''} onChange={e => handleChange(path, e.target.value)} />
              </div>
            ))}
            <div className="admin-toggle-row">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Enable Booking Enquiry Form</div>
                <div className="admin-muted" style={{ fontSize: 12 }}>Show a contact form on your EPK for direct booking requests</div>
              </div>
              <button className={`toggle-switch ${form.contact?.booking_form_enabled ? 'on' : ''}`} onClick={() => handleChange('contact.booking_form_enabled', !form.contact?.booking_form_enabled)} />
            </div>
          </Section>
        </div>
      )}

      {/* ── DESIGN TAB ── */}
      {activeTab === 'design' && (
        <div className="epk-tab-content">
          <Section title="Template" icon={Palette}>
            <div className="epk-template-grid">
              {TEMPLATES.map(t => (
                <button key={t.id} className={`epk-template-card ${form.design?.template === t.id ? 'active' : ''}`} onClick={() => handleChange('design.template', t.id)}>
                  <div className="epk-template-preview" style={{ background: t.preview }}>
                    <div className="epk-template-preview-bar" />
                    <div className="epk-template-preview-text" />
                    <div className="epk-template-preview-text short" />
                  </div>
                  <div className="epk-template-name">{t.label}</div>
                  <div className="epk-template-desc">{t.desc}</div>
                </button>
              ))}
            </div>
          </Section>
          <Section title="Brand Colours" icon={Palette} collapsible defaultOpen={false}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Primary Colour</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.design?.primary_color || '#10b981'} onChange={e => handleChange('design.primary_color', e.target.value)} style={{ width: 40, height: 36, padding: 2, background: 'var(--bg3)', border: '1px solid var(--b1)', borderRadius: 4, cursor: 'pointer' }} />
                  <input className="form-input" value={form.design?.primary_color || '#10b981'} onChange={e => handleChange('design.primary_color', e.target.value)} style={{ width: 100 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Accent Colour</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.design?.secondary_color || '#c084fc'} onChange={e => handleChange('design.secondary_color', e.target.value)} style={{ width: 40, height: 36, padding: 2, background: 'var(--bg3)', border: '1px solid var(--b1)', borderRadius: 4, cursor: 'pointer' }} />
                  <input className="form-input" value={form.design?.secondary_color || '#c084fc'} onChange={e => handleChange('design.secondary_color', e.target.value)} style={{ width: 100 }} />
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── HOSTING TAB ── */}
      {activeTab === 'hosting' && (
        <div className="epk-tab-content">
          <Section title="Hosting Options" icon={Globe}>
            <p className="social-hint" style={{ marginBottom: 16 }}>Choose where your EPK is publicly accessible. Changes take effect on next save.</p>
            {[
              { key: 'intermaven', label: 'intermaven.io', desc: `intermaven.io/artist/${form.username || 'yourname'}`, always: true },
              { key: 'intermavenmusic', label: 'intermavenmusic.com', desc: `intermavenmusic.com/artist/${form.username || 'yourname'}` },
            ].map(({ key, label, desc, always }) => (
              <div key={key} className="admin-toggle-row">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div className="admin-muted" style={{ fontSize: 12 }}>{desc}</div>
                </div>
                <button
                  className={`toggle-switch ${form.hosting?.[key] ? 'on' : ''}`}
                  onClick={() => !always && handleChange(`hosting.${key}`, !form.hosting?.[key])}
                  disabled={always}
                  title={always ? 'Always hosted on intermaven.io' : ''}
                />
              </div>
            ))}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Custom Domain (optional)</label>
              <input className="form-input" placeholder="epk.yourname.com" value={form.hosting?.custom_domain || ''} onChange={e => handleChange('hosting.custom_domain', e.target.value)} />
              <div className="social-hint" style={{ marginTop: 6 }}>Point your domain's CNAME to <code>epk.intermaven.io</code> — our team will configure SSL after you save.</div>
            </div>
          </Section>

          {epk?.id && form.is_published && (
            <Section title="Share Your EPK" icon={Share2} collapsible defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['intermaven.io/artist/', 'intermavenmusic.com/artist/'].map(base => (
                  <div key={base} style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" readOnly value={`https://${base}${form.username}`} />
                    <button className="admin-btn-secondary" onClick={() => { navigator.clipboard.writeText(`https://${base}${form.username}`); addToast('Copied!', '', 'success'); }}><Copy size={13} /></button>
                    <a href={`https://${base}${form.username}`} target="_blank" rel="noopener noreferrer" className="admin-btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}><ExternalLink size={13} /></a>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="admin-modal-backdrop" onClick={() => setShowAnalytics(false)}>
          <div className="admin-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>EPK Analytics</h3>
              <button className="admin-modal-close" onClick={() => setShowAnalytics(false)}><X size={16} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
                {[
                  ['Total Views', analytics.total_views || 0],
                  ['Unique Visitors', analytics.unique_visitors || 0],
                  ['Link Clicks', analytics.link_clicks || 0],
                  ['Form Submissions', analytics.form_submissions || 0],
                ].map(([label, value]) => (
                  <div key={label} className="admin-detail-card">
                    <div className="admin-detail-card-title">{label}</div>
                    <div className="admin-detail-big">{value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {analytics.top_referrers?.length > 0 && (
                <div className="admin-analytics-card">
                  <div className="admin-analytics-card-title">Top Referrers</div>
                  {analytics.top_referrers.map((r, i) => (
                    <div key={i} className="admin-bar-row">
                      <span className="admin-bar-label">{r.source}</span>
                      <div className="admin-bar-track"><div className="admin-bar-fill" style={{ width: `${r.pct}%`, background: '#10b981' }} /></div>
                      <span className="admin-bar-value">{r.count} ({r.pct}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EPKBuilder;
