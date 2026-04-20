import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../App';
import {
  Users, BarChart2, Settings, LogOut, Search, Filter,
  ChevronDown, ChevronUp, Edit2, Trash2, Shield, CreditCard,
  AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Eye, EyeOff, RefreshCw, Download, Upload, X, Plus,
  MessageSquare, Activity, Zap, Bell, Mail, Phone,
  MoreHorizontal, ChevronLeft, ChevronRight, Star,
  Lock, Unlock, UserCheck, UserX, ArrowUp, ArrowDown
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────
const PLANS = ['free', 'creator', 'pro'];
const PORTALS = ['music', 'business'];
const PLAN_CREDITS = { free: 150, creator: 600, pro: 2500 };
const CREDIT_PRESETS = [
  { label: 'Starter Boost', credits: 50, desc: 'Minor compensation or trial extension' },
  { label: 'Standard Grant', credits: 150, desc: 'Onboarding bonus, support resolution' },
  { label: 'Creator Boost', credits: 500, desc: 'Partnership, influencer reward' },
  { label: 'Pro Grant', credits: 1000, desc: 'Enterprise trial, major issue resolution' },
];

const HERO_OVERRIDE_KEYS = ['music', 'business', 'djs', 'labels', 'producers', 'mediahouses'];

const ADMIN_ROLES = {
  super_admin: { label: 'Super Admin', color: '#f59e0b', perms: ['all'] },
  admin: { label: 'Admin', color: '#7c6ff7', perms: ['users', 'credits', 'analytics'] },
  support: { label: 'Support', color: '#22d3ee', perms: ['users.read', 'credits.limited'] },
  finance: { label: 'Finance', color: '#10b981', perms: ['payments', 'analytics.revenue'] },
};

// ── Helpers ───────────────────────────────────────────────────────
function Badge({ color, children }) {
  const colors = {
    free: '#9096b8', creator: '#7c6ff7', pro: '#f59e0b',
    music: '#22d3ee', business: '#10b981',
    active: '#10b981', inactive: '#ef4444', suspended: '#f59e0b',
    super_admin: '#f59e0b', admin: '#7c6ff7', support: '#22d3ee', finance: '#10b981',
    open: '#f59e0b', in_progress: '#22d3ee', resolved: '#10b981', closed: '#9096b8',
  };
  const c = colors[color] || color || '#9096b8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      background: `${c}22`, color: c, border: `1px solid ${c}44`
    }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: `${color}22`, color }}>
        <Icon size={18} />
      </div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`admin-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
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
      <span className="admin-pagination-info">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </span>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="admin-page-btn">
        <ChevronLeft size={14} />
      </button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 5) {
          if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
        }
        return (
          <button
            key={p}
            className={`admin-page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >{p}</button>
        );
      })}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="admin-page-btn">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ── Users Panel ───────────────────────────────────────────────────
function UsersPanel({ addToast, adminRole }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ plan: '', portal: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [creditUser, setCreditUser] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const PER_PAGE = 25;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, per_page: PER_PAGE, sort_by: sortBy, sort_dir: sortDir,
        ...(search && { search }),
        ...(filters.plan && { plan: filters.plan }),
        ...(filters.portal && { portal: filters.portal }),
        ...(filters.status && { status: filters.status }),
      });
      const res = await api.get(`/api/admin/users?${params}`);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {
      addToast('Failed to load users', '', 'error');
    }
    setLoading(false);
  }, [page, search, filters, sortBy, sortDir]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === users.length ? [] : users.map(u => u.id));

  const handleExport = async () => {
    try {
      const res = await api.get('/api/admin/users/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `users-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { addToast('Export failed', '', 'error'); }
  };

  const handleBulkAction = async (action) => {
    if (!selected.length) return;
    try {
      await api.post('/api/admin/users/bulk', { user_ids: selected, action });
      addToast(`Bulk ${action} complete`, `${selected.length} users updated`, 'success');
      setSelected([]);
      fetchUsers();
    } catch { addToast('Bulk action failed', '', 'error'); }
  };

  return (
    <div className="admin-panel-content">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={14} className="admin-search-icon" />
          <input
            className="admin-search"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className={`admin-btn-icon ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(f => !f)}>
          <Filter size={14} /> Filters
          {Object.values(filters).some(Boolean) && <span className="admin-filter-dot" />}
        </button>
        <button className="admin-btn-icon" onClick={fetchUsers}><RefreshCw size={14} /></button>
        <button className="admin-btn-icon" onClick={handleExport}><Download size={14} /> Export</button>
      </div>

      {showFilters && (
        <div className="admin-filters">
          <select className="admin-select" value={filters.plan} onChange={e => setFilters(f => ({ ...f, plan: e.target.value }))}>
            <option value="">All plans</option>
            {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select className="admin-select" value={filters.portal} onChange={e => setFilters(f => ({ ...f, portal: e.target.value }))}>
            <option value="">All portals</option>
            {PORTALS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select className="admin-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="admin-btn-text" onClick={() => setFilters({ plan: '', portal: '', status: '' })}>Clear</button>
        </div>
      )}

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="admin-bulk-bar">
          <span>{selected.length} selected</span>
          <button className="admin-btn-sm" onClick={() => handleBulkAction('export')}>Export selected</button>
          <button className="admin-btn-sm" onClick={() => handleBulkAction('suspend')}>Suspend</button>
          <button className="admin-btn-sm danger" onClick={() => handleBulkAction('delete')}>Delete</button>
          <button className="admin-btn-text" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selected.length === users.length && users.length > 0} onChange={toggleAll} /></th>
              <th onClick={() => toggleSort('first_name')} className="sortable">Name <SortIcon col="first_name" /></th>
              <th onClick={() => toggleSort('email')} className="sortable">Email <SortIcon col="email" /></th>
              <th onClick={() => toggleSort('plan')} className="sortable">Plan <SortIcon col="plan" /></th>
              <th onClick={() => toggleSort('credits')} className="sortable">Credits <SortIcon col="credits" /></th>
              <th>Portal</th>
              <th onClick={() => toggleSort('created_at')} className="sortable">Joined <SortIcon col="created_at" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="admin-table-empty"><span className="spinner" /> Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="admin-table-empty">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className={selected.includes(u.id) ? 'selected' : ''}>
                <td><input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-avatar-sm">{(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}</div>
                    <span>{u.first_name} {u.last_name}</span>
                    {u.admin_role && <Badge color={u.admin_role}>{ADMIN_ROLES[u.admin_role]?.label}</Badge>}
                  </div>
                </td>
                <td className="admin-muted">{u.email}</td>
                <td><Badge color={u.plan}>{u.plan}</Badge></td>
                <td>
                  <div className="admin-credits-cell">
                    <span>{u.credits?.toLocaleString()}</span>
                    <div className="admin-credits-mini-bar">
                      <div style={{ width: `${Math.min((u.credits / PLAN_CREDITS[u.plan || 'free']) * 100, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td><Badge color={u.portal}>{u.portal}</Badge></td>
                <td className="admin-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="admin-row-actions">
                    <button className="admin-action-btn" title="View" onClick={() => setViewUser(u)}><Eye size={13} /></button>
                    <button className="admin-action-btn" title="Edit" onClick={() => setEditUser(u)}><Edit2 size={13} /></button>
                    <button className="admin-action-btn" title="Credits" onClick={() => setCreditUser(u)}><Zap size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />

      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} onEdit={u => { setViewUser(null); setEditUser(u); }} onCredit={u => { setViewUser(null); setCreditUser(u); }} addToast={addToast} onRefresh={fetchUsers} />}
      {editUser && <UserEditModal user={editUser} onClose={() => setEditUser(null)} addToast={addToast} onRefresh={fetchUsers} />}
      {creditUser && <CreditModal user={creditUser} onClose={() => setCreditUser(null)} addToast={addToast} onRefresh={fetchUsers} />}
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────────
function UserDetailModal({ user, onClose, onEdit, onCredit, addToast, onRefresh }) {
  const [tab, setTab] = useState('overview');
  const [activity, setActivity] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notes, setNotes] = useState(user.admin_notes || []);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (tab === 'activity') fetchActivity();
    if (tab === 'billing') fetchTransactions();
  }, [tab]);

  const fetchActivity = async () => {
    try {
      const res = await api.get(`/api/admin/users/${user.id}/activity`);
      setActivity(res.data.activities || []);
    } catch {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/api/admin/users/${user.id}/transactions`);
      setTransactions(res.data.transactions || []);
    } catch {}
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await api.post(`/api/admin/users/${user.id}/notes`, { note: newNote });
      setNotes(res.data.notes);
      setNewNote('');
      addToast('Note added', '', 'success');
    } catch { addToast('Failed to add note', '', 'error'); }
    setAddingNote(false);
  };

  const handleSuspend = async () => {
    try {
      await api.post(`/api/admin/users/${user.id}/suspend`);
      addToast('User suspended', '', 'success');
      onRefresh(); onClose();
    } catch { addToast('Failed', '', 'error'); }
  };

  const creditPercent = Math.min(Math.round((user.credits / PLAN_CREDITS[user.plan || 'free']) * 100), 100);

  return (
    <Modal title={`${user.first_name} ${user.last_name}`} onClose={onClose} width={700}>
      <div className="admin-user-detail">
        <div className="admin-user-detail-header">
          <div className="admin-avatar-lg">{(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}</div>
          <div className="admin-user-detail-info">
            <div className="admin-user-detail-name">{user.first_name} {user.last_name}</div>
            <div className="admin-user-detail-meta">
              <span><Mail size={12} /> {user.email}</span>
              {user.phone && <span><Phone size={12} /> {user.phone}</span>}
            </div>
            <div className="admin-user-detail-badges">
              <Badge color={user.plan}>{user.plan}</Badge>
              <Badge color={user.portal}>{user.portal}</Badge>
              {user.admin_role && <Badge color={user.admin_role}>{ADMIN_ROLES[user.admin_role]?.label}</Badge>}
            </div>
          </div>
          <div className="admin-user-detail-actions">
            <button className="admin-btn-sm" onClick={() => onEdit(user)}><Edit2 size={12} /> Edit</button>
            <button className="admin-btn-sm" onClick={() => onCredit(user)}><Zap size={12} /> Credits</button>
            <button className="admin-btn-sm danger" onClick={handleSuspend}><UserX size={12} /> Suspend</button>
          </div>
        </div>

        <div className="admin-detail-tabs">
          {['overview', 'activity', 'billing', 'notes'].map(t => (
            <button key={t} className={`admin-detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="admin-detail-grid">
            <div className="admin-detail-card">
              <div className="admin-detail-card-title">Credits</div>
              <div className="admin-detail-big">{user.credits?.toLocaleString()}</div>
              <div className="admin-mini-bar"><div style={{ width: `${creditPercent}%` }} /></div>
              <div className="admin-muted" style={{ fontSize: 11 }}>{creditPercent}% of {PLAN_CREDITS[user.plan || 'free']} plan allowance</div>
            </div>
            <div className="admin-detail-card">
              <div className="admin-detail-card-title">AI Runs</div>
              <div className="admin-detail-big">{user.ai_runs || 0}</div>
              <div className="admin-muted" style={{ fontSize: 11 }}>Total lifetime runs</div>
            </div>
            <div className="admin-detail-card">
              <div className="admin-detail-card-title">Active Apps</div>
              <div className="admin-detail-big">{user.apps?.length || 0}</div>
              <div className="admin-muted" style={{ fontSize: 11 }}>{user.apps?.join(', ') || 'None'}</div>
            </div>
            <div className="admin-detail-card">
              <div className="admin-detail-card-title">Joined</div>
              <div className="admin-detail-big">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
            </div>
            <div className="admin-detail-card" style={{ gridColumn: '1 / -1' }}>
              <div className="admin-detail-card-title">Bio</div>
              <div className="admin-muted">{user.bio || 'No bio set'}</div>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="admin-activity-list">
            {activity.length === 0 ? <div className="admin-empty">No activity yet</div> : activity.map((a, i) => (
              <div key={i} className="admin-activity-item">
                <div className="admin-activity-dot" />
                <div>
                  <div className="admin-activity-text">{a.type?.replace('_', ' ') || 'Action'} — {a.tool_id || ''}</div>
                  <div className="admin-activity-time">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'billing' && (
          <div>
            {transactions.length === 0 ? <div className="admin-empty">No transactions</div> : transactions.map((t, i) => (
              <div key={i} className="admin-tx-row">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.plan?.charAt(0).toUpperCase() + t.plan?.slice(1)} Plan</div>
                  <div className="admin-muted" style={{ fontSize: 11 }}>{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>KES {t.amount?.toLocaleString()}</div>
                  <Badge color={t.status === 'completed' ? 'active' : 'suspended'}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <div className="admin-notes-list">
              {notes.length === 0 ? <div className="admin-empty">No notes yet</div> : notes.map((n, i) => (
                <div key={i} className="admin-note-item">
                  <div className="admin-note-text">{typeof n === 'string' ? n : n.note}</div>
                  <div className="admin-note-meta">{n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}</div>
                </div>
              ))}
            </div>
            <div className="admin-note-input">
              <textarea
                className="admin-textarea"
                placeholder="Add an internal note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                rows={2}
              />
              <button className="admin-btn-primary" onClick={addNote} disabled={addingNote || !newNote.trim()}>
                {addingNote ? <span className="spinner" /> : 'Add Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── User Edit Modal ───────────────────────────────────────────────
function UserEditModal({ user, onClose, addToast, onRefresh }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    plan: user.plan || 'free',
    portal: user.portal || 'music',
    brand_name: user.brand_name || '',
    bio: user.bio || '',
    admin_role: user.admin_role || '',
  });
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setChanges(c => ({ ...c, [k]: { from: user[k], to: v } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/admin/users/${user.id}`, { ...form, audit_changes: changes });
      addToast('User updated', 'Changes saved and logged', 'success');
      onRefresh(); onClose();
    } catch (e) {
      addToast('Failed to update', e.response?.data?.detail || '', 'error');
    }
    setSaving(false);
  };

  const fields = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
    { key: 'brand_name', label: 'Brand / Artist Name' },
  ];

  return (
    <Modal title="Edit User" onClose={onClose}>
      <div className="admin-form">
        <div className="admin-form-grid">
          {fields.map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input
                type={f.type || 'text'}
                className={`form-input ${changes[f.key] ? 'changed' : ''}`}
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="admin-textarea" value={form.bio} onChange={e => handleChange('bio', e.target.value)} rows={2} />
        </div>
        <div className="admin-form-row">
          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className={`admin-select ${changes.plan ? 'changed' : ''}`} value={form.plan} onChange={e => handleChange('plan', e.target.value)}>
              {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Portal</label>
            <select className={`admin-select ${changes.portal ? 'changed' : ''}`} value={form.portal} onChange={e => handleChange('portal', e.target.value)}>
              {PORTALS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Admin Role</label>
            <select className={`admin-select ${changes.admin_role ? 'changed' : ''}`} value={form.admin_role} onChange={e => handleChange('admin_role', e.target.value)}>
              <option value="">— User (no admin) —</option>
              {Object.entries(ADMIN_ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        {Object.keys(changes).length > 0 && (
          <div className="admin-change-log">
            <div className="admin-change-log-title"><AlertCircle size={13} /> Pending changes (will be audit-logged)</div>
            {Object.entries(changes).map(([k, { from, to }]) => (
              <div key={k} className="admin-change-item">
                <span className="admin-change-field">{k}</span>
                <span className="admin-change-from">{String(from) || '(empty)'}</span>
                <span>→</span>
                <span className="admin-change-to">{String(to) || '(empty)'}</span>
              </div>
            ))}
          </div>
        )}
        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving || !Object.keys(changes).length}>
            {saving ? <span className="spinner" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Credit Modal ──────────────────────────────────────────────────
function CreditModal({ user, onClose, addToast, onRefresh }) {
  const [method, setMethod] = useState('preset');
  const [preset, setPreset] = useState(null);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGrant = async () => {
    const amount = method === 'preset' ? preset?.credits : parseInt(custom);
    if (!amount || amount <= 0) return addToast('Enter a valid amount', '', 'error');
    setSaving(true);
    try {
      await api.post(`/api/admin/users/${user.id}/grant-credits`, {
        method,
        preset_label: preset?.label,
        credits: amount,
        note,
      });
      addToast('Credits granted!', `${amount} credits added to ${user.first_name}'s account`, 'success');
      onRefresh(); onClose();
    } catch (e) {
      addToast('Failed', e.response?.data?.detail || '', 'error');
    }
    setSaving(false);
  };

  return (
    <Modal title={`Grant Credits — ${user.first_name} ${user.last_name}`} onClose={onClose} width={480}>
      <div className="admin-credit-modal">
        <div className="admin-credit-current">
          <div className="admin-credit-current-label">Current balance</div>
          <div className="admin-credit-current-value">{user.credits?.toLocaleString()} credits</div>
          <div className="admin-mini-bar" style={{ marginTop: 8 }}>
            <div style={{ width: `${Math.min((user.credits / PLAN_CREDITS[user.plan || 'free']) * 100, 100)}%` }} />
          </div>
        </div>

        <div className="admin-method-tabs">
          <button className={`admin-method-tab ${method === 'preset' ? 'active' : ''}`} onClick={() => setMethod('preset')}>
            Preset Bundles
          </button>
          <button className={`admin-method-tab ${method === 'custom' ? 'active' : ''}`} onClick={() => setMethod('custom')}>
            Custom Amount
          </button>
        </div>

        {method === 'preset' && (
          <div className="admin-preset-grid">
            {CREDIT_PRESETS.map(p => (
              <button
                key={p.label}
                className={`admin-preset-card ${preset?.label === p.label ? 'active' : ''}`}
                onClick={() => setPreset(p)}
              >
                <div className="admin-preset-credits">{p.credits.toLocaleString()}</div>
                <div className="admin-preset-label">{p.label}</div>
                <div className="admin-preset-desc">{p.desc}</div>
              </button>
            ))}
          </div>
        )}

        {method === 'custom' && (
          <div className="form-group">
            <label className="form-label">Credits to grant</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 250"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              min={1}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Internal note (optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Reason for grant..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn-primary"
            onClick={handleGrant}
            disabled={saving || (method === 'preset' && !preset) || (method === 'custom' && !custom)}
          >
            {saving ? <span className="spinner" /> : `Grant ${method === 'preset' ? preset?.credits || 0 : custom || 0} Credits`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Analytics Panel ───────────────────────────────────────────────
function AnalyticsPanel({ addToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => { fetchStats(); }, [range]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/analytics/overview?range=${range}`);
      setStats(res.data);
    } catch { addToast('Failed to load analytics', '', 'error'); }
    setLoading(false);
  };

  if (loading) return <div className="admin-loading"><span className="spinner" /> Loading analytics...</div>;
  if (!stats) return null;

  return (
    <div className="admin-panel-content">
      <div className="admin-range-tabs">
        {[['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['all', 'All time']].map(([v, l]) => (
          <button key={v} className={`admin-range-tab ${range === v ? 'active' : ''}`} onClick={() => setRange(v)}>{l}</button>
        ))}
      </div>

      <div className="admin-stats-grid">
        <StatCard label="Total Users" value={(stats.total_users || 0).toLocaleString()} icon={Users} color="#7c6ff7" trend={stats.user_growth} />
        <StatCard label="Active (30d)" value={(stats.active_users || 0).toLocaleString()} icon={Activity} color="#22d3ee" />
        <StatCard label="New This Period" value={(stats.new_users || 0).toLocaleString()} icon={TrendingUp} color="#10b981" trend={stats.new_user_trend} />
        <StatCard label="AI Runs" value={(stats.total_ai_runs || 0).toLocaleString()} icon={Zap} color="#f59e0b" />
        <StatCard label="Credits Granted" value={(stats.credits_granted || 0).toLocaleString()} icon={Star} color="#ec4899" />
        <StatCard label="Revenue (KES)" value={(stats.revenue || 0).toLocaleString()} icon={CreditCard} color="#10b981" trend={stats.revenue_trend} />
      </div>

      <div className="admin-analytics-row">
        <div className="admin-analytics-card">
          <div className="admin-analytics-card-title">Users by Plan</div>
          {[
            { label: 'Free', count: stats.by_plan?.free || 0, color: '#9096b8' },
            { label: 'Creator', count: stats.by_plan?.creator || 0, color: '#7c6ff7' },
            { label: 'Pro', count: stats.by_plan?.pro || 0, color: '#f59e0b' },
          ].map(({ label, count, color }) => {
            const pct = stats.total_users ? Math.round((count / stats.total_users) * 100) : 0;
            return (
              <div key={label} className="admin-bar-row">
                <span className="admin-bar-label">{label}</span>
                <div className="admin-bar-track">
                  <div className="admin-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="admin-bar-value">{count.toLocaleString()} ({pct}%)</span>
              </div>
            );
          })}
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-card-title">Users by Portal</div>
          {[
            { label: 'Music', count: stats.by_portal?.music || 0, color: '#22d3ee' },
            { label: 'Business', count: stats.by_portal?.business || 0, color: '#10b981' },
          ].map(({ label, count, color }) => {
            const pct = stats.total_users ? Math.round((count / stats.total_users) * 100) : 0;
            return (
              <div key={label} className="admin-bar-row">
                <span className="admin-bar-label">{label}</span>
                <div className="admin-bar-track">
                  <div className="admin-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="admin-bar-value">{count.toLocaleString()} ({pct}%)</span>
              </div>
            );
          })}
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-card-title">Top Tools Used</div>
          {(stats.top_tools || []).map(({ tool_id, count }, i) => {
            const max = stats.top_tools?.[0]?.count || 1;
            const pct = Math.round((count / max) * 100);
            const colors = ['#7c6ff7', '#22d3ee', '#f59e0b', '#ec4899', '#10b981'];
            return (
              <div key={tool_id} className="admin-bar-row">
                <span className="admin-bar-label">{tool_id}</span>
                <div className="admin-bar-track">
                  <div className="admin-bar-fill" style={{ width: `${pct}%`, background: colors[i] }} />
                </div>
                <span className="admin-bar-value">{count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-analytics-card" style={{ marginTop: 16 }}>
        <div className="admin-analytics-card-title">Recent Signups</div>
        <div className="admin-signup-list">
          {(stats.recent_signups || []).map((u, i) => (
            <div key={i} className="admin-signup-row">
              <div className="admin-avatar-sm">{(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}</div>
              <div>
                <div style={{ fontSize: 13 }}>{u.first_name} {u.last_name}</div>
                <div className="admin-muted" style={{ fontSize: 11 }}>{u.email}</div>
              </div>
              <Badge color={u.plan}>{u.plan}</Badge>
              <Badge color={u.portal}>{u.portal}</Badge>
              <div className="admin-muted" style={{ fontSize: 11 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Audit Log Panel ───────────────────────────────────────────────
function AuditPanel({ addToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/audit-log?page=${page}&per_page=50`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch { addToast('Failed to load audit log', '', 'error'); }
    setLoading(false);
  };

  const ACTION_COLORS = {
    user_edit: '#7c6ff7', credit_grant: '#10b981', plan_change: '#f59e0b',
    suspend: '#ef4444', delete: '#ef4444', note_add: '#22d3ee',
  };

  return (
    <div className="admin-panel-content">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target User</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="admin-table-empty"><span className="spinner" /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="admin-table-empty">No audit logs yet</td></tr>
            ) : logs.map((l, i) => (
              <tr key={i}>
                <td className="admin-muted" style={{ fontSize: 11 }}>{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                <td style={{ fontSize: 13 }}>{l.admin_name || l.admin_id}</td>
                <td><Badge color={ACTION_COLORS[l.action] || '#9096b8'}>{l.action?.replace('_', ' ')}</Badge></td>
                <td style={{ fontSize: 13 }}>{l.target_user_name || l.target_user_id}</td>
                <td className="admin-muted" style={{ fontSize: 11 }}>
                  {l.details ? JSON.stringify(l.details).slice(0, 80) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} perPage={50} onChange={setPage} />
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────
function AdminSettingsPanel({ addToast }) {
  const [settings, setSettings] = useState(null);
  const [selectedHeroScope, setSelectedHeroScope] = useState('music');
  const [showRawHeroJson, setShowRawHeroJson] = useState(false);
  const [heroOverrideJson, setHeroOverrideJson] = useState('');
  const [heroJsonError, setHeroJsonError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (!settings) return;
    setHeroOverrideJson(JSON.stringify(settings.hero_content_overrides || {}, null, 2));
  }, [settings]);

  const getHeroOverrides = () => settings?.hero_content_overrides || {};

  const getHeroScopeData = () => {
    const overrides = getHeroOverrides();
    return overrides[selectedHeroScope] || { slides: [], heroImages: [], heroFallbacks: [] };
  };

  const sanitizeHeroScopeData = (scopeData) => {
    const sanitized = {};

    if (Array.isArray(scopeData.slides) && scopeData.slides.length > 0) {
      sanitized.slides = scopeData.slides;
    }

    if (Array.isArray(scopeData.heroImages)) {
      const images = scopeData.heroImages.map(img => typeof img === 'string' ? img.trim() : '').filter(Boolean);
      if (images.length > 0) sanitized.heroImages = images;
    }

    if (Array.isArray(scopeData.heroFallbacks)) {
      const fallbacks = scopeData.heroFallbacks.map(img => typeof img === 'string' ? img.trim() : '').filter(Boolean);
      if (fallbacks.length > 0) sanitized.heroFallbacks = fallbacks;
    }

    return sanitized;
  };

  const setHeroScopeData = (scopeData) => {
    setSettings(prev => {
      const overrides = prev?.hero_content_overrides ? { ...prev.hero_content_overrides } : {};
      const sanitized = sanitizeHeroScopeData(scopeData);

      if (Object.keys(sanitized).length > 0) {
        overrides[selectedHeroScope] = sanitized;
      } else {
        delete overrides[selectedHeroScope];
      }

      return { ...prev, hero_content_overrides: overrides };
    });
  };

  const updateHeroOverrideSlide = (index, field, value) => {
    const current = getHeroScopeData();
    const slides = [...(current.slides || [])];
    slides[index] = { ...slides[index], [field]: value };
    setHeroScopeData({ ...current, slides });
  };

  const removeHeroOverrideSlide = (index) => {
    const current = getHeroScopeData();
    const slides = [...(current.slides || [])];
    slides.splice(index, 1);
    setHeroScopeData({ ...current, slides });
  };

  const addHeroOverrideSlide = () => {
    const current = getHeroScopeData();
    setHeroScopeData({
      ...current,
      slides: [
        ...(current.slides || []),
        { dot: '', badge: '', h: '', s: '', b1: '', b1link: '', b2: '', b2link: '' }
      ]
    });
  };

  const updateHeroOverrideArrayItem = (arrayKey, index, value) => {
    const current = getHeroScopeData();
    const array = [...(current[arrayKey] || [])];
    array[index] = value;
    setHeroScopeData({ ...current, [arrayKey]: array });
  };

  const addHeroOverrideArrayItem = (arrayKey) => {
    const current = getHeroScopeData();
    const array = [...(current[arrayKey] || []), ''];
    setHeroScopeData({ ...current, [arrayKey]: array });
  };

  const removeHeroOverrideArrayItem = (arrayKey, index) => {
    const current = getHeroScopeData();
    const array = [...(current[arrayKey] || [])];
    array.splice(index, 1);
    setHeroScopeData({ ...current, [arrayKey]: array });
  };

  const clearHeroOverrideScope = () => {
    setHeroScopeData({ slides: [], heroImages: [], heroFallbacks: [] });
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/admin/settings');
      setSettings(res.data);
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', settings);
      addToast('Settings saved', '', 'success');
    } catch { addToast('Failed to save', '', 'error'); }
    setSaving(false);
  };

  const updateHeroOverrides = (value) => {
    setHeroOverrideJson(value);
    try {
      const parsed = JSON.parse(value);
      setHeroJsonError('');
      setSettings(s => ({ ...s, hero_content_overrides: parsed }));
    } catch (err) {
      setHeroJsonError('Invalid JSON: ' + err.message);
    }
  };

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>;
  if (!settings) return null;

  const update = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="admin-panel-content">
      <div className="admin-settings-section">
        <div className="admin-settings-title">Platform Defaults</div>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Default plan for new users</label>
            <select className="admin-select" value={settings.default_plan || 'free'} onChange={e => update('default_plan', e.target.value)}>
              {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Free plan credit allowance</label>
            <input type="number" className="form-input" value={settings.free_credits || 150} onChange={e => update('free_credits', parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Creator plan credit allowance</label>
            <input type="number" className="form-input" value={settings.creator_credits || 600} onChange={e => update('creator_credits', parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Pro plan credit allowance</label>
            <input type="number" className="form-input" value={settings.pro_credits || 2500} onChange={e => update('pro_credits', parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="admin-settings-section">
        <div className="admin-settings-title">Tool Credit Costs</div>
        <div className="admin-form-grid">
          {[
            { key: 'brandkit_cost', label: 'Brand Kit AI' },
            { key: 'musicbio_cost', label: 'Music Bio AI' },
            { key: 'syncpitch_cost', label: 'Sync Pitch AI' },
            { key: 'bizpitch_cost', label: 'Pitch Deck AI' },
          ].map(({ key, label }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label} (credits)</label>
              <input type="number" className="form-input" value={settings[key] || 0} onChange={e => update(key, parseInt(e.target.value))} min={0} />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-settings-section">
        <div className="admin-settings-title">Hero Content Overrides</div>
        <div className="admin-form-grid">
          <div className="form-group" style={{ minWidth: 240 }}>
            <label className="form-label">Override scope</label>
            <select
              className="admin-select"
              value={selectedHeroScope}
              onChange={(e) => setSelectedHeroScope(e.target.value)}
            >
              {HERO_OVERRIDE_KEYS.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={clearHeroOverrideScope}
              disabled={!getHeroOverrides()[selectedHeroScope]}
            >
              Clear override
            </button>
          </div>
        </div>

        <div className="admin-settings-subsection" style={{ marginTop: 16 }}>
          <div className="admin-settings-subtitle">Scope preview</div>
          <div className="admin-card" style={{ padding: 14, marginBottom: 16, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div>
              <div className="admin-settings-label">Slides</div>
              <div>{getHeroScopeData().slides.length}</div>
            </div>
            <div>
              <div className="admin-settings-label">Hero images</div>
              <div>{getHeroScopeData().heroImages.length}</div>
            </div>
            <div>
              <div className="admin-settings-label">Fallbacks</div>
              <div>{getHeroScopeData().heroFallbacks.length}</div>
            </div>
          </div>

          <div className="admin-settings-subtitle">Slides</div>
          {getHeroScopeData().slides.length === 0 ? (
            <div className="admin-muted" style={{ marginBottom: 12 }}>
              No slides configured for this scope yet. Add slides to override the default landing content.
            </div>
          ) : null}
          {getHeroScopeData().slides.map((slide, index) => (
            <div key={index} className="admin-card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">Badge</label>
                  <input
                    className="form-input"
                    value={slide.badge || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'badge', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dot color</label>
                  <input
                    className="form-input"
                    value={slide.dot || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'dot', e.target.value)}
                    placeholder="#22d3ee"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Headline</label>
                  <input
                    className="form-input"
                    value={slide.h || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'h', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Subheadline</label>
                  <input
                    className="form-input"
                    value={slide.s || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 's', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary CTA text</label>
                  <input
                    className="form-input"
                    value={slide.b1 || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'b1', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary CTA link</label>
                  <input
                    className="form-input"
                    value={slide.b1link || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'b1link', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary CTA text</label>
                  <input
                    className="form-input"
                    value={slide.b2 || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'b2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary CTA link</label>
                  <input
                    className="form-input"
                    value={slide.b2link || ''}
                    onChange={(e) => updateHeroOverrideSlide(index, 'b2link', e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ marginTop: 12 }}
                onClick={() => removeHeroOverrideSlide(index)}
              >
                Remove slide
              </button>
            </div>
          ))}
          <button type="button" className="admin-btn-secondary" onClick={addHeroOverrideSlide}>
            Add slide
          </button>
        </div>

        <div className="admin-form-grid" style={{ marginTop: 24 }}>
          <div className="form-group full-width">
            <label className="form-label">Hero images</label>
            {getHeroScopeData().heroImages.map((img, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <input
                  className="form-input"
                  value={img}
                  onChange={(e) => updateHeroOverrideArrayItem('heroImages', index, e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn-link"
                  style={{ marginLeft: 8 }}
                  onClick={() => removeHeroOverrideArrayItem('heroImages', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="admin-btn-secondary" onClick={() => addHeroOverrideArrayItem('heroImages')}>
              Add image URL
            </button>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Hero fallbacks</label>
            {getHeroScopeData().heroFallbacks.map((img, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <input
                  className="form-input"
                  value={img}
                  onChange={(e) => updateHeroOverrideArrayItem('heroFallbacks', index, e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn-link"
                  style={{ marginLeft: 8 }}
                  onClick={() => removeHeroOverrideArrayItem('heroFallbacks', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="admin-btn-secondary" onClick={() => addHeroOverrideArrayItem('heroFallbacks')}>
              Add fallback URL
            </button>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            type="button"
            className="admin-btn-link"
            onClick={() => setShowRawHeroJson(!showRawHeroJson)}
          >
            {showRawHeroJson ? 'Hide advanced JSON editor' : 'Show advanced JSON editor'}
          </button>
        </div>

        {showRawHeroJson && (
          <div className="admin-form-grid" style={{ marginTop: 16 }}>
            <div className="form-group full-width">
              <label className="form-label">Hero override JSON</label>
              <textarea
                className="form-textarea"
                rows={12}
                value={heroOverrideJson}
                onChange={(e) => updateHeroOverrides(e.target.value)}
              />
              <div className="admin-muted" style={{ fontSize: 12, marginTop: 8 }}>
                Define per-portal/subdomain hero overrides as JSON. Example keys: <code>music</code>, <code>djs</code>, <code>labels</code>, <code>producers</code>, <code>mediahouses</code>.
                Use <code>slides</code>, <code>heroImages</code>, and <code>heroFallbacks</code> inside each override object.
              </div>
              {heroJsonError && <div className="admin-error" style={{ marginTop: 8 }}>{heroJsonError}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="admin-settings-section">
        <div className="admin-settings-title">Maintenance</div>
        <div className="admin-toggle-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Maintenance Mode</div>
            <div className="admin-muted" style={{ fontSize: 12 }}>Blocks all non-admin access with a maintenance message</div>
          </div>
          <button
            className={`toggle-switch ${settings.maintenance_mode ? 'on' : ''}`}
            onClick={() => update('maintenance_mode', !settings.maintenance_mode)}
          />
        </div>
        <div className="admin-toggle-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>New Registrations</div>
            <div className="admin-muted" style={{ fontSize: 12 }}>Allow new users to register</div>
          </div>
          <button
            className={`toggle-switch ${settings.registrations_open !== false ? 'on' : ''}`}
            onClick={() => update('registrations_open', !settings.registrations_open)}
          />
        </div>
      </div>

      <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? <span className="spinner" /> : 'Save Settings'}
      </button>
    </div>
  );
}

// ── Main AdminPanel ────────────────────────────────────────────────
function AdminPanel({ user, onBack, addToast }) {
  const [tab, setTab] = useState('users');
  const adminRole = user?.admin_role;

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'audit', label: 'Audit Log', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">INTER<span>MAVEN</span></div>
          <div className="admin-sidebar-sub">Admin Console</div>
        </div>

        <div className="admin-sidebar-user">
          <div className="admin-avatar-sm">{(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
            <Badge color={adminRole}>{ADMIN_ROLES[adminRole]?.label || 'Admin'}</Badge>
          </div>
        </div>

        <nav className="admin-nav">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin-nav-item ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <button className="admin-nav-item back-btn" onClick={onBack}>
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </aside>

      {/* Admin Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">
            {tabs.find(t => t.id === tab)?.label}
          </h1>
        </header>

        <div className="admin-body">
          {tab === 'users' && <UsersPanel addToast={addToast} adminRole={adminRole} />}
          {tab === 'analytics' && <AnalyticsPanel addToast={addToast} />}
          {tab === 'audit' && <AuditPanel addToast={addToast} />}
          {tab === 'settings' && <AdminSettingsPanel addToast={addToast} />}
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;
