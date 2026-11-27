import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, useAuth, useToast } from '../App';
import { FileText, Sparkles, CheckCircle2, Copy, Download, Trash2, PenTool, Save } from 'lucide-react';

export default function ContractBuilder() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const [templates, setTemplates] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeContract, setActiveContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    template_id: 'nda',
    title: '',
    party_a_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '',
    party_a_email: user?.email || '',
    party_b_name: '',
    party_b_email: '',
    jurisdiction: 'Republic of Kenya',
    compensation: '',
    scope: '',
    term: '',
    custom_notes: '',
    use_ai: false,
  });

  const [selectedClauses, setSelectedClauses] = useState([]);
  const [signerName, setSignerName] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tplRes, listRes] = await Promise.all([
        api.get('/api/contracts/templates'),
        api.get('/api/contracts'),
      ]);
      const tpls = tplRes.data?.templates || [];
      setTemplates(tpls);
      setSelectedClauses((prev) => (prev.length === 0 && tpls.length > 0 ? tpls[0].clauses || [] : prev));
      setContracts(listRes.data?.contracts || []);
    } catch (err) {
      toastRef.current('Error', err.response?.data?.detail || 'Failed to load Contract Builder', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentTemplate = templates.find((t) => t.id === form.template_id) || templates[0];

  const handleTemplateSelect = (tpl) => {
    setForm((prev) => ({ ...prev, template_id: tpl.id, term: tpl.default_term || '' }));
    setSelectedClauses(tpl.clauses || []);
  };

  const toggleClause = (clause) => {
    setSelectedClauses((prev) =>
      prev.includes(clause) ? prev.filter((c) => c !== clause) : [...prev, clause]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.party_a_name.trim() || !form.party_b_name.trim()) {
      addToast('Missing Parties', 'Please enter both Party A and Party B names.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/api/contracts/generate', {
        ...form,
        selected_clauses: selectedClauses,
      });
      const created = res.data?.contract;
      if (created) {
        setActiveContract(created);
        setContracts((prev) => [created, ...prev]);
        addToast('Contract Generated', created.title, 'success');
      }
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to generate contract', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeContract) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/contracts/${activeContract.id}`, {
        title: activeContract.title,
        body: activeContract.body,
      });
      const updated = res.data?.contract;
      if (updated) {
        setActiveContract(updated);
        setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        addToast('Saved', 'Contract changes saved', 'success');
      }
    } catch {
      addToast('Error', 'Failed to save contract changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!activeContract) return;
    const name = signerName.trim() || form.party_a_name.trim();
    if (!name) {
      addToast('Signer Required', 'Enter your full name to e-sign.', 'error');
      return;
    }
    try {
      const res = await api.post(`/api/contracts/${activeContract.id}/sign`, {
        signer_name: name,
        signer_role: 'Party A',
      });
      const updated = res.data?.contract;
      if (updated) {
        setActiveContract(updated);
        setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        addToast('Signed', 'E-signature recorded on contract', 'success');
      }
    } catch {
      addToast('Error', 'Failed to sign contract', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/contracts/${id}`);
      setContracts((prev) => prev.filter((c) => c.id !== id));
      if (activeContract?.id === id) setActiveContract(null);
      addToast('Deleted', 'Contract removed', 'success');
    } catch {
      addToast('Error', 'Failed to delete contract', 'error');
    }
  };

  const handleCopy = async () => {
    if (!activeContract) return;
    await navigator.clipboard.writeText(activeContract.body || '');
    addToast('Copied', 'Contract text copied to clipboard', 'success');
  };

  const handleDownload = () => {
    if (!activeContract) return;
    const blob = new Blob([activeContract.body || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeContract.title || 'contract').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
          <FileText size={22} color="#a78bfa" />
          Business Contract Builder
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Generate, customize, and e-sign NDAs, Work-for-Hire, Collaboration, and Client Service agreements.
        </p>
      </div>

      {/* Template Picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {templates.map((tpl) => {
          const active = form.template_id === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleTemplateSelect(tpl)}
              style={{
                textAlign: 'left',
                padding: '14px',
                borderRadius: '3px',
                border: `1px solid ${active ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
                background: active ? 'rgba(167, 139, 250, 0.14)' : '#1e293b',
                color: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '4px' }}>
                {tpl.category}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{tpl.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>{tpl.description}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.3fr)', gap: '20px', alignItems: 'start' }}>
        {/* Left: Form */}
        <form onSubmit={handleGenerate} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>Agreement Details</div>

          <input
            type="text"
            placeholder="Contract Title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={inputStyle}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="Party A Name *" value={form.party_a_name} onChange={(e) => setForm({ ...form, party_a_name: e.target.value })} required style={inputStyle} />
            <input type="email" placeholder="Party A Email" value={form.party_a_email} onChange={(e) => setForm({ ...form, party_a_email: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="Party B Name *" value={form.party_b_name} onChange={(e) => setForm({ ...form, party_b_name: e.target.value })} required style={inputStyle} />
            <input type="email" placeholder="Party B Email" value={form.party_b_email} onChange={(e) => setForm({ ...form, party_b_email: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="Governing Law / Jurisdiction" value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} style={inputStyle} />
            <input type="text" placeholder="Term (e.g. 12 months)" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} style={inputStyle} />
          </div>

          <input type="text" placeholder="Compensation / Payment Terms (optional)" value={form.compensation} onChange={(e) => setForm({ ...form, compensation: e.target.value })} style={inputStyle} />
          <textarea rows={3} placeholder="Scope of Work / Purpose..." value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} style={inputStyle} />

          {currentTemplate?.clauses && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Clauses to Include</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentTemplate.clauses.map((cl) => {
                  const on = selectedClauses.includes(cl);
                  return (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => toggleClause(cl)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: `1px solid ${on ? '#10b981' : 'rgba(255,255,255,0.12)'}`,
                        background: on ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                        color: on ? '#34d399' : '#94a3b8',
                      }}
                    >
                      {on ? '✓ ' : '+ '}{cl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <textarea rows={2} placeholder="Special Provisions / Custom Notes (optional)" value={form.custom_notes} onChange={(e) => setForm({ ...form, custom_notes: e.target.value })} style={inputStyle} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.use_ai} onChange={(e) => setForm({ ...form, use_ai: e.target.checked })} />
            <Sparkles size={14} color="#a78bfa" />
            Enhance legal prose with AI (Claude)
          </label>

          <button
            type="submit"
            disabled={generating}
            style={{
              padding: '10px 16px',
              borderRadius: '3px',
              border: 'none',
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {generating ? 'Generating Contract...' : 'Generate Contract →'}
          </button>
        </form>

        {/* Right: Active Draft / Editor + Saved List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeContract ? (
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    background: activeContract.status === 'signed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                    color: activeContract.status === 'signed' ? '#34d399' : '#fbbf24',
                  }}>
                    {activeContract.status}
                  </span>
                  <h3 style={{ margin: '6px 0 0', fontSize: '16px', color: '#f8fafc' }}>{activeContract.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleSaveEdit} disabled={saving} style={iconBtnStyle} title="Save edits">
                    <Save size={14} /> Save
                  </button>
                  <button type="button" onClick={handleCopy} style={iconBtnStyle} title="Copy">
                    <Copy size={14} /> Copy
                  </button>
                  <button type="button" onClick={handleDownload} style={iconBtnStyle} title="Download .txt">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              <textarea
                rows={16}
                value={activeContract.body}
                onChange={(e) => setActiveContract({ ...activeContract, body: e.target.value })}
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: 1.55,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Type full name to e-sign..."
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: '180px' }}
                />
                <button
                  type="button"
                  onClick={handleSign}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '3px',
                    border: 'none',
                    background: '#10b981',
                    color: '#022c22',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <PenTool size={14} /> E-Sign Contract
                </button>
              </div>
              {activeContract.signatures?.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  Signed by {activeContract.signatures.map((s) => `${s.signer_name} (${new Date(s.signed_at).toLocaleDateString()})`).join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
              Select a template and fill in the parties to generate a contract, or open one from your saved list below.
            </div>
          )}

          {/* Saved Contracts */}
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
              Saved Contracts ({contracts.length})
            </div>
            {loading ? (
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loading contracts...</div>
            ) : contracts.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#64748b' }}>No saved contracts yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#0f172a',
                      borderRadius: '3px',
                      border: `1px solid ${activeContract?.id === c.id ? '#a78bfa' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveContract(c)}
                      style={{ background: 'none', border: 'none', textAlign: 'left', color: '#f8fafc', cursor: 'pointer', flex: 1, padding: 0 }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {c.template_name} · {c.status.toUpperCase()}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                      title="Delete contract"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '9px 11px',
  borderRadius: '3px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '13px',
};

const iconBtnStyle = {
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
