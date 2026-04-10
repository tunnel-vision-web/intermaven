import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../App';
import {
  Users, Mail, MessageSquare, Phone, Plus, Search, Filter,
  Send, Clock, CheckCircle, AlertCircle, Trash2, Edit2,
  Upload, Download, X, ChevronDown, Tag, List,
  BarChart2, RefreshCw, Eye, MoreHorizontal,
  MessageCircle, AtSign, Hash, Calendar, Zap,
  ChevronLeft, ChevronRight, Globe, Star, UserPlus
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────
const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail, color: '#7c6ff7' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { id: 'sms', label: 'SMS', icon: Phone, color: '#f59e0b' },
];

const CONTACT_TAGS = ['fan', 'industry', 'press', 'booker', 'label', 'sponsor', 'media', 'vip'];

const CAMPAIGN_TYPES = [
  { id: 'release', label: '🎵 New Release' },
  { id: 'event', label: '🎤 Event / Show' },
  { id: 'newsletter', label: '📰 Newsletter' },
  { id: 'press', label: '📢 Press Release' },
  { id: 'thankyou', label: '🙏 Thank You' },
  { id: 'custom', label: '✏️ Custom' },
];

// ── Helpers ───────────────────────────────────────────────────────
function Badge({ color, children }) {
  const map = { email: '#7c6ff7', whatsapp: '#25D366', sms: '#f59e0b', active: '#10b981', sent: '#10b981', draft: '#9096b8', scheduled: '#22d3ee', failed: '#ef4444' };
  const c = map[color] || color || '#9096b8';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
      {children}
    </span>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="admin-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: width }}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="admin-pagination">
      <span className="admin-pagination-info">{(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="admin-page-btn"><ChevronLeft size={14} /></button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 5) {
          if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
        }
        return <button key={p} className={`admin-page-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>;
      })}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="admin-page-btn"><ChevronRight size={14} /></button>
    </div>
  );
}

// ── Contacts Panel ────────────────────────────────────────────────
function ContactsPanel({ addToast }) {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewContact, setViewContact] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState([]);
  const PER_PAGE = 25;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: PER_PAGE, ...(search && { search }), ...(tagFilter && { tag: tagFilter }) });
      const res = await api.get(`/api/crm/contacts?${params}`);
      setContacts(res.data.contacts || []);
      setTotal(res.data.total || 0);
    } catch { addToast('Failed to load contacts', '', 'error'); }
    setLoading(false);
  }, [page, search, tagFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/api/crm/contacts/${id}`);
      addToast('Contact deleted', '', 'success');
      fetchContacts();
    } catch { addToast('Failed', '', 'error'); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const exportContacts = async () => {
    try {
      const res = await api.post('/api/crm/contacts/export', { contact_ids: selected.length ? selected : undefined }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `contacts-${Date.now()}.csv`; a.click();
    } catch { addToast('Export failed', '', 'error'); }
  };

  return (
    <div className="crm-panel">
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={14} className="admin-search-icon" />
          <input className="admin-search" placeholder="Search contacts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="admin-select" value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
          <option value="">All tags</option>
          {CONTACT_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="admin-btn-icon" onClick={fetchContacts}><RefreshCw size={14} /></button>
        <button className="admin-btn-icon" onClick={exportContacts}><Download size={14} /> Export</button>
        <button className="admin-btn-icon" onClick={() => setShowImport(true)}><Upload size={14} /> Import</button>
        <button className="admin-btn-primary" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Contact</button>
      </div>

      {selected.length > 0 && (
        <div className="admin-bulk-bar">
          <span>{selected.length} selected</span>
          <button className="admin-btn-sm" onClick={exportContacts}>Export</button>
          <button className="admin-btn-text" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={e => setSelected(e.target.checked ? contacts.map(c => c.id) : [])} /></th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Tags</th>
              <th>Source</th>
              <th>Engagement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="admin-table-empty"><span className="spinner" /></td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={8} className="admin-table-empty">No contacts yet — import a CSV or add manually</td></tr>
            ) : contacts.map(c => (
              <tr key={c.id} className={selected.includes(c.id) ? 'selected' : ''}>
                <td><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-avatar-sm">{(c.first_name?.[0] || c.email?.[0] || '?').toUpperCase()}</div>
                    <span>{c.first_name} {c.last_name}</span>
                  </div>
                </td>
                <td className="admin-muted">{c.email || '—'}</td>
                <td className="admin-muted">{c.phone || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(c.tags || []).map(t => <Badge key={t} color="#9096b8">{t}</Badge>)}
                  </div>
                </td>
                <td className="admin-muted" style={{ fontSize: 11 }}>{c.source?.replace('_', ' ') || '—'}</td>
                <td>
                  <div style={{ fontSize: 11, color: 'var(--mu)' }}>
                    {c.engagement?.emails_opened || 0} opens · {c.engagement?.whatsapp_messages || 0} WA
                  </div>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button className="admin-action-btn" onClick={() => setViewContact(c)}><Eye size={13} /></button>
                    <button className="admin-action-btn" onClick={() => setEditContact(c)}><Edit2 size={13} /></button>
                    <button className="admin-action-btn danger" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />

      {showAddModal && <ContactFormModal onClose={() => setShowAddModal(false)} addToast={addToast} onRefresh={fetchContacts} />}
      {editContact && <ContactFormModal contact={editContact} onClose={() => setEditContact(null)} addToast={addToast} onRefresh={fetchContacts} />}
      {viewContact && <ContactDetailModal contact={viewContact} onClose={() => setViewContact(null)} addToast={addToast} onEdit={c => { setViewContact(null); setEditContact(c); }} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} addToast={addToast} onRefresh={fetchContacts} />}
    </div>
  );
}

// ── Contact Form Modal ────────────────────────────────────────────
function ContactFormModal({ contact, onClose, addToast, onRefresh }) {
  const isEdit = !!contact;
  const [form, setForm] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    job_title: contact?.job_title || '',
    tags: contact?.tags || [],
    notes_text: '',
  });
  const [saving, setSaving] = useState(false);

  const toggleTag = (t) => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }));

  const handleSave = async () => {
    if (!form.email && !form.phone) return addToast('Email or phone required', '', 'error');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/crm/contacts/${contact.id}`, form);
      } else {
        await api.post('/api/crm/contacts', form);
      }
      addToast(isEdit ? 'Contact updated' : 'Contact added', '', 'success');
      onRefresh(); onClose();
    } catch (e) { addToast('Failed', e.response?.data?.detail || '', 'error'); }
    setSaving(false);
  };

  return (
    <Modal title={isEdit ? 'Edit Contact' : 'Add Contact'} onClose={onClose}>
      <div className="admin-form">
        <div className="admin-form-grid">
          {[['first_name', 'First Name'], ['last_name', 'Last Name'], ['email', 'Email'], ['phone', 'Phone (+254...)'], ['company', 'Company'], ['job_title', 'Job Title']].map(([k, l]) => (
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input type="text" className="form-input" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Tags</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CONTACT_TAGS.map(t => (
              <button key={t} type="button"
                className={`social-chip ${form.tags.includes(t) ? 'active' : ''}`}
                onClick={() => toggleTag(t)}
              >{t}</button>
            ))}
          </div>
        </div>
        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Initial note (optional)</label>
            <textarea className="admin-textarea" rows={2} value={form.notes_text} onChange={e => setForm(f => ({ ...f, notes_text: e.target.value }))} />
          </div>
        )}
        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Contact Detail Modal ──────────────────────────────────────────
function ContactDetailModal({ contact, onClose, addToast, onEdit }) {
  const [messages, setMessages] = useState([]);
  const [sendForm, setSendForm] = useState({ channel: 'whatsapp', body: '' });
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => { if (tab === 'messages') fetchMessages(); }, [tab]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/crm/contacts/${contact.id}/messages`);
      setMessages(res.data.messages || []);
    } catch {}
  };

  const handleSend = async () => {
    if (!sendForm.body.trim()) return;
    setSending(true);
    try {
      await api.post('/api/crm/messages/send', { contact_id: contact.id, ...sendForm });
      addToast('Message sent!', '', 'success');
      setSendForm(f => ({ ...f, body: '' }));
      fetchMessages();
    } catch (e) { addToast('Failed to send', e.response?.data?.detail || '', 'error'); }
    setSending(false);
  };

  return (
    <Modal title={`${contact.first_name || ''} ${contact.last_name || contact.email}`} onClose={onClose} width={640}>
      <div className="admin-detail-tabs">
        {['profile', 'messages', 'engagement'].map(t => (
          <button key={t} className={`admin-detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="admin-detail-grid" style={{ marginTop: 16 }}>
          {[['Email', contact.email], ['Phone', contact.phone], ['Company', contact.company], ['Job Title', contact.job_title], ['Source', contact.source], ['Added', contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '—']].map(([k, v]) => v ? (
            <div key={k} className="admin-detail-card">
              <div className="admin-detail-card-title">{k}</div>
              <div style={{ fontSize: 13 }}>{v}</div>
            </div>
          ) : null)}
          <div className="admin-detail-card" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-detail-card-title">Tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {(contact.tags || []).length > 0 ? contact.tags.map(t => <Badge key={t} color="#9096b8">{t}</Badge>) : <span className="admin-muted">No tags</span>}
            </div>
          </div>
          {(contact.notes || []).length > 0 && (
            <div className="admin-detail-card" style={{ gridColumn: '1 / -1' }}>
              <div className="admin-detail-card-title">Notes</div>
              {contact.notes.map((n, i) => (
                <div key={i} className="admin-note-item">{typeof n === 'string' ? n : n.text}</div>
              ))}
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <button className="admin-btn-primary" onClick={() => onEdit(contact)}><Edit2 size={13} /> Edit Contact</button>
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div style={{ marginTop: 16 }}>
          <div className="crm-message-thread">
            {messages.length === 0 ? (
              <div className="admin-empty">No messages yet</div>
            ) : messages.map((m, i) => (
              <div key={i} className={`crm-message ${m.direction === 'inbound' ? 'inbound' : 'outbound'}`}>
                <div className="crm-message-body">{m.body}</div>
                <div className="crm-message-meta">
                  <Badge color={m.channel}>{m.channel}</Badge>
                  <span>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                  {m.status && <Badge color={m.status === 'delivered' ? 'active' : 'failed'}>{m.status}</Badge>}
                </div>
              </div>
            ))}
          </div>
          <div className="crm-send-bar">
            <div className="crm-channel-tabs">
              {CHANNELS.map(ch => (
                <button key={ch.id} className={`crm-channel-tab ${sendForm.channel === ch.id ? 'active' : ''}`} onClick={() => setSendForm(f => ({ ...f, channel: ch.id }))}>
                  <ch.icon size={13} style={{ color: ch.color }} /> {ch.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder={`Send ${sendForm.channel} message...`} value={sendForm.body} onChange={e => setSendForm(f => ({ ...f, body: e.target.value }))
              } onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button className="admin-btn-primary" onClick={handleSend} disabled={sending || !sendForm.body.trim()}>
                {sending ? <span className="spinner" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'engagement' && (
        <div className="admin-detail-grid" style={{ marginTop: 16 }}>
          {[
            ['Emails Sent', contact.engagement?.emails_sent || 0],
            ['Emails Opened', contact.engagement?.emails_opened || 0],
            ['Email Clicks', contact.engagement?.emails_clicked || 0],
            ['WhatsApp Messages', contact.engagement?.whatsapp_messages || 0],
            ['SMS Messages', contact.engagement?.sms_messages || 0],
          ].map(([k, v]) => (
            <div key={k} className="admin-detail-card">
              <div className="admin-detail-card-title">{k}</div>
              <div className="admin-detail-big">{v}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ── Import Modal ──────────────────────────────────────────────────
function ImportModal({ onClose, addToast, onRefresh }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').slice(0, 4);
      setPreview(lines);
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/api/crm/contacts/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Import complete', `${res.data.imported} contacts imported`, 'success');
      onRefresh(); onClose();
    } catch (e) { addToast('Import failed', e.response?.data?.detail || '', 'error'); }
    setUploading(false);
  };

  return (
    <Modal title="Import Contacts (CSV)" onClose={onClose} width={480}>
      <div className="admin-import">
        <div className="admin-import-info">
          <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 12 }}>
            Upload a CSV with columns: <code>first_name, last_name, email, phone, company, tags</code>
          </p>
          <a href="/sample-contacts.csv" download className="admin-btn-text" style={{ fontSize: 12 }}>
            <Download size={12} /> Download sample template
          </a>
        </div>
        <label className="admin-file-drop">
          <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          {file ? (
            <div><CheckCircle size={20} color="#10b981" /><div style={{ fontSize: 13, marginTop: 8 }}>{file.name}</div></div>
          ) : (
            <div><Upload size={24} color="var(--mu)" /><div style={{ fontSize: 13, color: 'var(--mu)', marginTop: 8 }}>Click to select CSV file</div></div>
          )}
        </label>
        {preview && (
          <div className="admin-import-preview">
            <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 6 }}>Preview (first 3 rows):</div>
            {preview.map((line, i) => <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--tx)' }}>{line}</div>)}
          </div>
        )}
        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn-primary" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? <span className="spinner" /> : 'Import Contacts'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Campaigns Panel ───────────────────────────────────────────────
function CampaignsPanel({ addToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/crm/campaigns');
      setCampaigns(res.data.campaigns || []);
    } catch { addToast('Failed to load campaigns', '', 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete campaign?')) return;
    try {
      await api.delete(`/api/crm/campaigns/${id}`);
      addToast('Campaign deleted', '', 'success');
      fetchCampaigns();
    } catch { addToast('Failed', '', 'error'); }
  };

  const STATUS_COLORS = { draft: '#9096b8', scheduled: '#22d3ee', sent: '#10b981', failed: '#ef4444' };

  return (
    <div className="crm-panel">
      <div className="admin-toolbar">
        <div style={{ flex: 1 }} />
        <button className="admin-btn-icon" onClick={fetchCampaigns}><RefreshCw size={14} /></button>
        <button className="admin-btn-primary" onClick={() => setShowCompose(true)}>
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner" /></div>
      ) : campaigns.length === 0 ? (
        <div className="crm-empty-state">
          <Send size={32} color="var(--mu)" />
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>No campaigns yet</div>
          <div style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16 }}>Create your first campaign to reach your audience</div>
          <button className="admin-btn-primary" onClick={() => setShowCompose(true)}>Create Campaign</button>
        </div>
      ) : (
        <div className="crm-campaign-list">
          {campaigns.map(c => (
            <div key={c.id} className="crm-campaign-card">
              <div className="crm-campaign-header">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.subject || c.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Badge color={c.channel}>{c.channel}</Badge>
                    <Badge color={STATUS_COLORS[c.status]}>{c.status}</Badge>
                  </div>
                </div>
                <div className="admin-row-actions">
                  <button className="admin-action-btn" onClick={() => setViewCampaign(c)}><BarChart2 size={13} /></button>
                  <button className="admin-action-btn danger" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="crm-campaign-stats">
                <div className="crm-stat"><span>{c.stats?.sent || c.recipients || 0}</span><span>Sent</span></div>
                <div className="crm-stat"><span>{c.stats?.delivered || 0}</span><span>Delivered</span></div>
                <div className="crm-stat"><span>{c.stats?.opened || 0}</span><span>Opened</span></div>
                <div className="crm-stat"><span>{c.stats?.clicked || 0}</span><span>Clicked</span></div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 8 }}>
                {c.sent_at ? `Sent ${new Date(c.sent_at).toLocaleString()}` : c.scheduled_at ? `Scheduled ${new Date(c.scheduled_at).toLocaleString()}` : `Created ${new Date(c.created_at).toLocaleString()}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} addToast={addToast} onRefresh={fetchCampaigns} />}
    </div>
  );
}

// ── Compose Modal ─────────────────────────────────────────────────
function ComposeModal({ onClose, addToast, onRefresh }) {
  const [form, setForm] = useState({
    channel: 'email',
    subject: '',
    body: '',
    campaign_type: 'custom',
    recipient_type: 'all',
    tag_filter: '',
    scheduled_at: '',
  });
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1); // 1 = compose, 2 = review

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = async (schedule = false) => {
    if (!form.body.trim()) return addToast('Message body required', '', 'error');
    if (form.channel === 'email' && !form.subject.trim()) return addToast('Subject required for email', '', 'error');
    setSending(true);
    try {
      await api.post('/api/crm/campaigns', { ...form, scheduled: schedule });
      addToast(schedule ? 'Campaign scheduled!' : 'Campaign sent!', '', 'success');
      onRefresh(); onClose();
    } catch (e) { addToast('Failed', e.response?.data?.detail || '', 'error'); }
    setSending(false);
  };

  return (
    <Modal title="New Campaign" onClose={onClose} width={640}>
      <div className="crm-compose">
        {/* Channel */}
        <div className="crm-channel-selector">
          {CHANNELS.map(ch => (
            <button key={ch.id} className={`crm-channel-option ${form.channel === ch.id ? 'active' : ''}`} onClick={() => update('channel', ch.id)}>
              <ch.icon size={18} style={{ color: ch.color }} />
              <span>{ch.label}</span>
            </button>
          ))}
        </div>

        {/* Campaign type */}
        <div className="form-group">
          <label className="form-label">Campaign Type</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CAMPAIGN_TYPES.map(t => (
              <button key={t.id} type="button"
                className={`social-chip ${form.campaign_type === t.id ? 'active' : ''}`}
                onClick={() => update('campaign_type', t.id)}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div className="form-group">
          <label className="form-label">Recipients</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="admin-select" style={{ flex: 1 }} value={form.recipient_type} onChange={e => update('recipient_type', e.target.value)}>
              <option value="all">All contacts</option>
              <option value="tag">By tag</option>
              <option value="plan">By plan (Intermaven users)</option>
            </select>
            {form.recipient_type === 'tag' && (
              <select className="admin-select" style={{ flex: 1 }} value={form.tag_filter} onChange={e => update('tag_filter', e.target.value)}>
                <option value="">Select tag...</option>
                {CONTACT_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Subject (email only) */}
        {form.channel === 'email' && (
          <div className="form-group">
            <label className="form-label">Subject Line</label>
            <input className="form-input" placeholder="e.g. 🎵 New single out now — Golden Hour" value={form.subject} onChange={e => update('subject', e.target.value)} />
          </div>
        )}

        {/* Body */}
        <div className="form-group">
          <label className="form-label">
            Message {form.channel === 'sms' ? `(${form.body.length}/160)` : ''}
          </label>
          <textarea
            className="admin-textarea"
            rows={form.channel === 'email' ? 8 : 4}
            placeholder={form.channel === 'email' ? 'Write your email content...\n\nYou can use {{first_name}} for personalization.' : form.channel === 'whatsapp' ? 'Hey {{first_name}}! 👋' : 'Short SMS message (160 chars)'}
            value={form.body}
            onChange={e => update('body', e.target.value)}
            maxLength={form.channel === 'sms' ? 160 : undefined}
          />
        </div>

        {/* Schedule */}
        <div className="form-group">
          <label className="form-label">Schedule (optional — leave blank to send now)</label>
          <input type="datetime-local" className="form-input" value={form.scheduled_at} onChange={e => update('scheduled_at', e.target.value)} />
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          {form.scheduled_at && (
            <button className="admin-btn-secondary" onClick={() => handleSend(true)} disabled={sending}>
              <Clock size={14} /> Schedule
            </button>
          )}
          <button className="admin-btn-primary" onClick={() => handleSend(false)} disabled={sending}>
            {sending ? <span className="spinner" /> : <><Send size={14} /> Send Now</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Quick Send Panel ──────────────────────────────────────────────
function QuickSendPanel({ addToast }) {
  const [form, setForm] = useState({ channel: 'whatsapp', to: '', body: '' });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/crm/messages/recent');
      setHistory(res.data.messages || []);
    } catch {}
  };

  const handleSend = async () => {
    if (!form.to.trim() || !form.body.trim()) return addToast('Recipient and message required', '', 'error');
    setSending(true);
    try {
      await api.post('/api/crm/messages/send-direct', form);
      addToast('Message sent!', '', 'success');
      setForm(f => ({ ...f, body: '' }));
      fetchHistory();
    } catch (e) { addToast('Failed to send', e.response?.data?.detail || 'Check Twilio credentials', 'error'); }
    setSending(false);
  };

  return (
    <div className="crm-panel">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Compose */}
        <div className="admin-settings-section">
          <div className="admin-settings-title">Quick Send</div>
          <div className="crm-channel-selector" style={{ marginBottom: 16 }}>
            {CHANNELS.map(ch => (
              <button key={ch.id} className={`crm-channel-option ${form.channel === ch.id ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, channel: ch.id }))}>
                <ch.icon size={16} style={{ color: ch.color }} />
                <span>{ch.label}</span>
              </button>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">{form.channel === 'email' ? 'To (email)' : 'To (phone +254...)'}</label>
            <input className="form-input" placeholder={form.channel === 'email' ? 'recipient@email.com' : '+254712345678'} value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="admin-textarea" rows={4} placeholder="Type your message..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          </div>
          <button className="admin-btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? <span className="spinner" /> : <><Send size={14} /> Send</>}
          </button>
        </div>

        {/* Recent */}
        <div className="admin-settings-section">
          <div className="admin-settings-title">Recent Messages</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.length === 0 ? (
              <div className="admin-empty">No messages sent yet</div>
            ) : history.map((m, i) => (
              <div key={i} className="crm-history-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Badge color={m.channel}>{m.channel}</Badge>
                  <span className="admin-muted" style={{ fontSize: 11 }}>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--mu)' }}>→ {m.to}</div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{m.body?.slice(0, 80)}{m.body?.length > 80 ? '...' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main CRM Panel ────────────────────────────────────────────────
function CRMPanel({ addToast }) {
  const [tab, setTab] = useState('contacts');

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'quicksend', label: 'Quick Send', icon: MessageSquare },
  ];

  return (
    <div className="panel active crm-root" data-testid="crm-panel">
      <div className="tool-header">
        <span className="tool-icon"><Users size={26} color="#22d3ee" /></span>
        <div className="tool-info">
          <h2>CRM & Communications</h2>
          <p>Contacts, campaigns, WhatsApp, SMS, and email — all in one place</p>
        </div>
      </div>

      <div className="crm-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`crm-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'contacts' && <ContactsPanel addToast={addToast} />}
      {tab === 'campaigns' && <CampaignsPanel addToast={addToast} />}
      {tab === 'quicksend' && <QuickSendPanel addToast={addToast} />}
    </div>
  );
}

export default CRMPanel;
