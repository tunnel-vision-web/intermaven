import React, { useState, useEffect } from 'react';
import { api } from '../App';
import FlatIcon from './FlatIcon';
import AppHelpAiControls from './AppHelpAiControls';
import { PERSONAS } from '../data/personasCatalog';
import { Sparkles, Trash2, Send, Eye, Upload } from 'lucide-react';

export default function CRMPanel({ user }) {
  const [tab, setTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [segments, setSegments] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);

  const [campForm, setCampForm] = useState({
    name: '',
    subject: '',
    body: '',
    segment: user?.persona || 'creator',
    cta_label: 'Explore Now',
    cta_url: '/dashboard',
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [groupForm, setGroupForm] = useState({ name: '', emailsText: '' });
  const [csvImport, setCsvImport] = useState({ name: '', csvText: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', stage: 'lead' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, grpRes, segRes, intelRes, contRes] = await Promise.all([
        api.get('/api/crm/campaigns').catch(() => ({ data: { campaigns: [] } })),
        api.get('/api/crm/target-groups').catch(() => ({ data: { target_groups: [], groups: [] } })),
        api.get('/api/crm/segments').catch(() => ({ data: { segments: [] } })),
        api.get('/api/crm/intelligence').catch(() => ({ data: null })),
        api.get('/api/crm/contacts').catch(() => ({ data: { contacts: [] } })),
      ]);
      setCampaigns(campRes.data?.campaigns || []);
      setTargetGroups(grpRes.data?.target_groups || grpRes.data?.groups || []);
      setSegments(segRes.data?.segments || []);
      setIntelligence(intelRes.data || null);
      setContacts(contRes.data?.contacts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSmartRecommend = async () => {
    setRecommending(true);
    try {
      const res = await api.post('/api/crm/smart-recommend', {
        persona: campForm.segment === 'all' ? (user?.persona || 'creator') : campForm.segment,
        goal: 'engagement',
      });
      const rec = res.data?.recommendation || res.data;
      if (rec) {
        setCampForm((prev) => ({
          ...prev,
          name: prev.name || rec.campaign_name || `Smart ${prev.segment} Reachout`,
          subject: rec.subject || prev.subject,
          body: rec.body || prev.body,
          cta_label: rec.cta_label || prev.cta_label,
        }));
        setStatusMsg('Smart CRM Playbook recommendation applied!');
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Could not load smart recommendation');
    } finally {
      setRecommending(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/crm/campaigns', {
        ...campForm,
        channels: ['email', 'in_app'],
      });
      setStatusMsg('Reachout campaign saved.');
      setCampForm({ ...campForm, name: '', subject: '', body: '' });
      await loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Failed to save campaign');
    }
  };

  const handlePreviewCampaign = async () => {
    try {
      const res = await api.post('/api/crm/campaigns/preview', {
        ...campForm,
        channels: ['email', 'in_app'],
      });
      setPreviewHtml(res.data?.html || res.data?.preview_html || '<p>Preview generated.</p>');
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Could not generate preview');
    }
  };

  const handleDispatchCampaign = async (campaignId) => {
    try {
      await api.post(`/api/crm/campaigns/${campaignId}/dispatch`, {});
      setStatusMsg('Campaign dispatched across Email & In-App Inbox!');
      await loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Dispatch failed');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const emails = groupForm.emailsText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((email) => ({ email }));
    try {
      await api.post('/api/crm/target-groups', {
        name: groupForm.name,
        entries: emails,
      });
      setStatusMsg(`Target group "${groupForm.name}" created with ${emails.length} email(s).`);
      setGroupForm({ name: '', emailsText: '' });
      await loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Failed to create target group');
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/crm/target-groups/import', {
        name: csvImport.name,
        csv_text: csvImport.csvText,
      });
      setStatusMsg(`CSV imported into "${csvImport.name}".`);
      setCsvImport({ name: '', csvText: '' });
      await loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'CSV import failed');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.delete(`/api/crm/target-groups/${groupId}`);
      await loadData();
    } catch {
      setStatusMsg('Could not delete target group');
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/crm/contacts', contactForm);
      setStatusMsg('Contact added.');
      setContactForm({ name: '', email: '', company: '', stage: 'lead' });
      await loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Failed to add contact');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlatIcon name="crm" size={40} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
              Smart CRM &amp; Reachout Studio
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Mirrored with TuneMavens · Strictly Email-Only Target Groups · Self-Learning Persona Playbooks
            </p>
          </div>
        </div>
        <AppHelpAiControls appId="crm" persona={user?.persona || 'creator'} compact />
      </div>

      {/* Intelligence Strip */}
      {intelligence && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Target Groups', value: targetGroups.length, color: '#22d3ee' },
            { label: 'Campaigns', value: campaigns.length, color: '#3b82f6' },
            { label: 'CRM Contacts', value: contacts.length, color: '#10b981' },
            { label: 'Ecosystem Segments', value: segments.length, color: '#a78bfa' },
          ].map((stat, idx) => (
            <div key={idx} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color, marginTop: '2px' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {statusMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.14)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{statusMsg}</span>
          <button type="button" onClick={() => setStatusMsg('')} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'campaigns', label: `Reachout Campaigns (${campaigns.length})` },
          { id: 'groups', label: `Email Target Groups (${targetGroups.length})` },
          { id: 'contacts', label: `CRM Contacts & Inbound Leads (${contacts.length})` },
          { id: 'segments', label: `Persona Segments (${segments.length})` },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: active ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.12)',
                background: active ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.04)',
                color: active ? '#93c5fd' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading Smart CRM Studio…</div>
      ) : tab === 'campaigns' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          <form onSubmit={handleCreateCampaign} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>New Reachout Campaign</h3>
              <button type="button" onClick={handleSmartRecommend} disabled={recommending} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(168,85,247,0.45)', background: 'rgba(168,85,247,0.16)', color: '#e9d5ff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                <Sparkles size={12} /> {recommending ? 'Thinking...' : 'Smart Recommend'}
              </button>
            </div>
            <select value={campForm.segment} onChange={(e) => setCampForm({ ...campForm, segment: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}>
              <option value="all">All Ecosystem Users</option>
              {PERSONAS.map((p) => (
                <option key={p.key} value={p.key}>Persona: {p.label}</option>
              ))}
            </select>
            <input required placeholder="Campaign Name" value={campForm.name} onChange={(e) => setCampForm({ ...campForm, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input required placeholder="Email Subject" value={campForm.subject} onChange={(e) => setCampForm({ ...campForm, subject: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <textarea required rows={4} placeholder="Campaign Message Body..." value={campForm.body} onChange={(e) => setCampForm({ ...campForm, body: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handlePreviewCampaign} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.12)', color: '#67e8f9', fontWeight: 700, cursor: 'pointer' }}>
                <Eye size={14} /> Preview Email
              </button>
              <button type="submit" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Campaign</button>
            </div>
          </form>

          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Recent Campaigns</h3>
            {campaigns.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No campaigns created yet.</p>
            ) : (
              campaigns.slice(0, 10).map((c) => (
                <div key={c.id || c._id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{c.name || c.subject}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.18)', color: '#93c5fd' }}>{c.status || 'draft'}</span>
                      {c.status !== 'dispatched' && (
                        <button type="button" onClick={() => handleDispatchCampaign(c.id || c._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 9px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, cursor: 'pointer' }}>
                          <Send size={11} /> Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Segment: {c.segment || 'all'} · Sent: {c.stats?.sent || 0} · Clicks: {c.stats?.clicked || 0}</div>
                </div>
              ))
            )}
          </div>

          {previewHtml && (
            <div style={{ gridColumn: '1 / -1', background: '#0d1117', border: '1px solid rgba(34,211,238,0.35)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#67e8f9', fontSize: '14px' }}>Rendered Campaign Email Preview</strong>
                <button type="button" onClick={() => setPreviewHtml('')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ background: '#ffffff', borderRadius: '8px', padding: '16px', color: '#0f172a' }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          )}
        </div>
      ) : tab === 'groups' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <form onSubmit={handleCreateGroup} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Create Email-Only Target Group</h3>
              <input required placeholder="Group Name (e.g., Festival Promoters)" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              <textarea rows={3} placeholder="Paste email addresses (comma or newline separated)" value={groupForm.emailsText} onChange={(e) => setGroupForm({ ...groupForm, emailsText: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Target Group</button>
            </form>

            <form onSubmit={handleImportCsv} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}><Upload size={14} style={{ marginRight: '6px' }} />Import Email CSV</h3>
              <input required placeholder="Target Group Name" value={csvImport.name} onChange={(e) => setCsvImport({ ...csvImport, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
              <textarea required rows={3} placeholder="email,name&#10;promoter@example.com,Nia" value={csvImport.csvText} onChange={(e) => setCsvImport({ ...csvImport, csvText: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff', fontFamily: 'monospace', fontSize: '12px' }} />
              <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, cursor: 'pointer' }}>Import CSV</button>
            </form>
          </div>

          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Target Groups (Synced with TuneMavens)</h3>
            {targetGroups.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No target groups yet.</p>
            ) : (
              targetGroups.map((g) => (
                <div key={g.id || g._id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{g.name}</strong>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{g.entry_count ?? g.entries?.length ?? 0} email contacts {g.is_system_group ? '· Inbound Sync' : ''}</div>
                  </div>
                  {!g.is_system_group && (
                    <button type="button" onClick={() => handleDeleteGroup(g.id || g._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : tab === 'contacts' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          <form onSubmit={handleCreateContact} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Add CRM Contact</h3>
            <input required placeholder="Full Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input required type="email" placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input placeholder="Company / Label" value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Contact</button>
          </form>

          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Contacts &amp; Inbound Leads</h3>
            {contacts.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No contacts yet.</p>
            ) : (
              contacts.slice(0, 20).map((c) => (
                <div key={c.id || c._id} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13px' }}>{c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{c.email} {c.source ? `· ${c.source}` : ''}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#60a5fa', textTransform: 'uppercase' }}>{c.stage || 'lead'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {segments.map((s) => (
            <div key={s.id || s.key} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>{s.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{s.description}</div>
              <div style={{ fontSize: '12px', color: '#22d3ee', fontWeight: 700, marginTop: '8px' }}>{s.count ?? 0} users</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
