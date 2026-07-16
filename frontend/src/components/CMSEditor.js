import React, { useState, useEffect } from 'react';
import { api } from '../App';
import { 
  Save, History, Sparkles, Plus, Trash2, Loader2, Image, Video, 
  HelpCircle, Check, Link, Eye, Info, RefreshCw, X, MessageSquare 
} from 'lucide-react';

const CMS_PAGES = [
  { id: 'home', label: 'Home Page' },
  { id: 'header', label: 'Header & Logo' },
  { id: 'footer', label: 'Footer & Links' },
  { id: 'about', label: 'About Us Page' },
  { id: 'services', label: 'Services Catalogue' }
];

export default function CMSEditor() {
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [version, setVersion] = useState(1);
  
  // History & Rollbacks
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // AI Image Generator Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [targetField, setTargetField] = useState(''); // e.g. 'hero_image', 'logo_url'
  const [aiError, setAiError] = useState('');

  // Toast State
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchLayout = async (pageId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/cms/layouts/${pageId}`);
      setFormData(res.data.data || {});
      setVersion(res.data.version || 1);
      fetchHistory(pageId);
    } catch (err) {
      triggerToast('Failed to fetch CMS page configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (pageId) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/api/cms/layouts/${pageId}/history`);
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load version logs', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout(activePage);
  }, [activePage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/api/cms/layouts', {
        layout_id: activePage,
        data: formData
      });
      setVersion(res.data.version || version + 1);
      triggerToast(`CMS ${activePage} layout updated successfully! (v${res.data.version})`, 'success');
      fetchHistory(activePage);
    } catch (err) {
      triggerToast(err.response?.data?.detail || err.message || 'Failed to save layout changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (historyVersion) => {
    if (!window.confirm(`Are you sure you want to revert ${activePage} layout to Version #${historyVersion}?`)) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/cms/layouts/${activePage}/rollback/${historyVersion}`);
      setFormData(res.data.data || {});
      setVersion(res.data.version || 1);
      triggerToast(`Reverted successfully to Version #${historyVersion}!`, 'success');
      setShowHistory(false);
      fetchHistory(activePage);
    } catch (err) {
      triggerToast(err.response?.data?.detail || err.message || 'Rollback failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // AI Generation Trigger
  const openAIGenerator = (fieldName) => {
    setTargetField(fieldName);
    setAiPrompt('');
    setAiError('');
    setAiLoading(false);
    setShowAIModal(true);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a description for the image.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/api/social-ai/generate-art', {
        prompt: aiPrompt,
        aspect_ratio: '1:1'
      });
      const generatedUrl = res.data.asset.media_url;
      updateField(targetField, generatedUrl);
      triggerToast('AI Image generated and applied successfully!', 'success');
      setShowAIModal(false);
    } catch (err) {
      setAiError(err.response?.data?.detail || err.message || 'AI Generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper List Add/Removes
  const addFAQItem = () => {
    const list = [...(formData.faqs || [])];
    list.push({ question: '', answer: '' });
    updateField('faqs', list);
  };

  const removeFAQItem = (idx) => {
    const list = (formData.faqs || []).filter((_, i) => i !== idx);
    updateField('faqs', list);
  };

  const addServiceItem = () => {
    const list = [...(formData.services || [])];
    list.push({ title: 'New Service', tagline: 'Details...', price: '$99', isSpotlight: false });
    updateField('services', list);
  };

  const removeServiceItem = (idx) => {
    const list = (formData.services || []).filter((_, i) => i !== idx);
    updateField('services', list);
  };

  const addTeamMember = () => {
    const list = [...(formData.team || [])];
    list.push({ name: '', role: '', image_url: '' });
    updateField('team', list);
  };

  const removeTeamMember = (idx) => {
    const list = (formData.team || []).filter((_, i) => i !== idx);
    updateField('team', list);
  };

  return (
    <div className="cms-editor-container" style={{
      fontFamily: 'Inter, sans-serif',
      color: '#cbd5e1',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: toastMsg.type === 'error' ? '#ef4444' : '#10b981',
          color: '#000',
          fontWeight: '700',
          padding: '12px 24px',
          borderRadius: '4px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMsg.type === 'error' ? '⚠️' : '✓'} {toastMsg.msg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🖥️ Mother CMS Studio
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
            Modify layout copy, brand assets, and structural listings site-wide.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => setShowHistory(!showHistory)} 
            className="btn-secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '9px 16px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <History size={14} /> Revision logs ({history.length})
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={saving} 
            className="btn-primary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '9px 24px', background: 'var(--cyan)', color: '#000', border: 'none', fontWeight: 'bold' }}
          >
            {saving ? <Loader2 className="spin" size={14} /> : <Save size={14} />} Save Version {version}
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px', gap: '8px', overflowX: 'auto' }}>
        {CMS_PAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePage(p.id)}
            style={{
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: '600',
              color: activePage === p.id ? 'var(--cyan)' : '#94a3b8',
              background: 'transparent',
              border: 'none',
              borderBottom: activePage === p.id ? '2px solid var(--cyan)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* History Ledger Sidebar overlay */}
      {showHistory && (
        <div className="glass-panel" style={{
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: '#0a0d16',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: '800' }}>Version History Revision Log ({activePage})</h4>
            <button onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
          </div>
          {historyLoading ? (
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Loading ledger history...</p>
          ) : history.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>No revision entries found for this page yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((h) => (
                <div key={h.version} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--cyan)' }}>v{h.version}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '10px' }}>
                      {new Date(h.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRollback(h.version)} 
                    className="btn-secondary" 
                    style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
                  >
                    Rollback to this
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="spin" size={24} color="var(--cyan)" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ================= HOME PAGE FORM ================= */}
          {activePage === 'home' && (
            <>
              {/* Hero Setup */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '15px', fontWeight: '700' }}>Hero Section Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Hero Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.hero_title || ''} 
                      onChange={(e) => updateField('hero_title', e.target.value)} 
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Hero Subtitle</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.hero_subtitle || ''} 
                      onChange={(e) => updateField('hero_subtitle', e.target.value)} 
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Primary Accent Color</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.primary_accent || 'var(--cyan)'} 
                    onChange={(e) => updateField('primary_accent', e.target.value)} 
                    style={{ width: '200px', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>

                {/* Cover Image with AI Integration */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Hero Background Image URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.hero_image_url || ''} 
                      onChange={(e) => updateField('hero_image_url', e.target.value)} 
                      placeholder="Paste Image URL"
                      style={{ flex: 1, background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => openAIGenerator('hero_image_url')}
                      className="btn-secondary" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.3)', padding: '0 16px', borderRadius: '4px' }}
                    >
                      <Sparkles size={13} /> AI Gen
                    </button>
                  </div>
                </div>

                {/* Cover Video */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Hero Background Video URL (optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.hero_video_url || ''} 
                    onChange={(e) => updateField('hero_video_url', e.target.value)} 
                    placeholder="Paste Video URL (e.g. .mp4 file)"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
              </div>

              {/* FAQs Setup */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '700' }}>Frequently Asked Questions</h3>
                  <button onClick={addFAQItem} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(34, 211, 238, 0.2)', padding: '6px 12px', borderRadius: '4px' }}>
                    <Plus size={12} /> Add FAQ
                  </button>
                </div>
                
                {(!formData.faqs || formData.faqs.length === 0) ? (
                  <p style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>No FAQ entries created. Click "Add FAQ" to list items.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(formData.faqs || []).map((faq, idx) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative' }}>
                        <button 
                          onClick={() => removeFAQItem(idx)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder={`Question #${idx + 1}`} 
                            value={faq.question || ''}
                            onChange={(e) => {
                              const list = [...formData.faqs];
                              list[idx].question = e.target.value;
                              updateField('faqs', list);
                            }}
                            style={{ width: '90%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', padding: '4px' }}
                          />
                          <textarea 
                            placeholder="Provide answers here..." 
                            value={faq.answer || ''}
                            rows="2"
                            onChange={(e) => {
                              const list = [...formData.faqs];
                              list[idx].answer = e.target.value;
                              updateField('faqs', list);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12.5px', padding: '4px', resize: 'none' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= HEADER CONFIG FORM ================= */}
          {activePage === 'header' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '15px', fontWeight: '700' }}>Header Navigation & Logo</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Brand Name / Title</label>
                <input 
                  type="text" 
                  value={formData.brand_name || ''} 
                  onChange={(e) => updateField('brand_name', e.target.value)} 
                  placeholder="e.g. TuneMavens"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                />
              </div>

              {/* Logo with AI Integration */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Header Logo Image URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={formData.logo_url || ''} 
                    onChange={(e) => updateField('logo_url', e.target.value)} 
                    placeholder="Logo URL"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => openAIGenerator('logo_url')}
                    className="btn-secondary" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.3)', padding: '0 16px', borderRadius: '4px' }}
                  >
                    <Sparkles size={13} /> AI Gen Logo
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Announcement Banner Text (optional)</label>
                <input 
                  type="text" 
                  value={formData.announcement_text || ''} 
                  onChange={(e) => updateField('announcement_text', e.target.value)} 
                  placeholder="e.g. Free 14-day trials active this week!"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                />
              </div>
            </div>
          )}

          {/* ================= FOOTER CONFIG FORM ================= */}
          {activePage === 'footer' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '15px', fontWeight: '700' }}>Footer Branding & Contact Anchors</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Copyright Text</label>
                  <input 
                    type="text" 
                    value={formData.copyright_text || ''} 
                    onChange={(e) => updateField('copyright_text', e.target.value)} 
                    placeholder="e.g. © 2026 TuneMavens Network. All rights reserved."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Brand Tagline</label>
                  <input 
                    type="text" 
                    value={formData.tagline || ''} 
                    onChange={(e) => updateField('tagline', e.target.value)} 
                    placeholder="Tagline..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Support Phone</label>
                  <input 
                    type="text" 
                    value={formData.contact_phone || ''} 
                    onChange={(e) => updateField('contact_phone', e.target.value)} 
                    placeholder="Phone number"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Support Email</label>
                  <input 
                    type="email" 
                    value={formData.contact_email || ''} 
                    onChange={(e) => updateField('contact_email', e.target.value)} 
                    placeholder="Email"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Physical Address</label>
                  <input 
                    type="text" 
                    value={formData.contact_address || ''} 
                    onChange={(e) => updateField('contact_address', e.target.value)} 
                    placeholder="Headquarters location"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px', color: '#fff', fontSize: '13.5px', fontWeight: '700' }}>Social Media Profiles</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Instagram URL</label>
                  <input 
                    type="text" 
                    value={formData.social_instagram || ''} 
                    onChange={(e) => updateField('social_instagram', e.target.value)} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Facebook URL</label>
                  <input 
                    type="text" 
                    value={formData.social_facebook || ''} 
                    onChange={(e) => updateField('social_facebook', e.target.value)} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>X (Twitter) URL</label>
                  <input 
                    type="text" 
                    value={formData.social_x || ''} 
                    onChange={(e) => updateField('social_x', e.target.value)} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>LinkedIn URL</label>
                  <input 
                    type="text" 
                    value={formData.social_linkedin || ''} 
                    onChange={(e) => updateField('social_linkedin', e.target.value)} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= ABOUT US PAGE FORM ================= */}
          {activePage === 'about' && (
            <>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '15px', fontWeight: '700' }}>About Us Story Copy</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Story Title</label>
                  <input 
                    type="text" 
                    value={formData.story_title || ''} 
                    onChange={(e) => updateField('story_title', e.target.value)} 
                    placeholder="Our background story"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Story Narrative Paragraphs</label>
                  <textarea 
                    value={formData.story_body || ''} 
                    onChange={(e) => updateField('story_body', e.target.value)} 
                    placeholder="Tell your narrative story here..."
                    rows="6"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '12px', resize: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>About Cover Background Image URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={formData.about_image_url || ''} 
                      onChange={(e) => updateField('about_image_url', e.target.value)} 
                      placeholder="About narrative image URL"
                      style={{ flex: 1, background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => openAIGenerator('about_image_url')}
                      className="btn-secondary" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.3)', padding: '0 16px', borderRadius: '4px' }}
                    >
                      <Sparkles size={13} /> AI Gen
                    </button>
                  </div>
                </div>

                <h4 style={{ margin: '20px 0 12px', color: '#fff', fontSize: '13.5px', fontWeight: '700' }}>Statistical Counters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Metric #1 Label / Value</label>
                    <input 
                      type="text" 
                      value={formData.metric_1 || ''} 
                      onChange={(e) => updateField('metric_1', e.target.value)} 
                      placeholder="e.g. 50+ Global Artists"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Metric #2 Label / Value</label>
                    <input 
                      type="text" 
                      value={formData.metric_2 || ''} 
                      onChange={(e) => updateField('metric_2', e.target.value)} 
                      placeholder="e.g. 1M+ Monthly Streams"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>Metric #3 Label / Value</label>
                    <input 
                      type="text" 
                      value={formData.metric_3 || ''} 
                      onChange={(e) => updateField('metric_3', e.target.value)} 
                      placeholder="e.g. 100% Retained Royalties"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Team Profile Grid */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '700' }}>Team Roster profiles</h3>
                  <button onClick={addTeamMember} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(34, 211, 238, 0.2)', padding: '6px 12px', borderRadius: '4px' }}>
                    <Plus size={12} /> Add Member
                  </button>
                </div>
                
                {(!formData.team || formData.team.length === 0) ? (
                  <p style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>No team member listings populated. Click "Add Member" to create roster entries.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {(formData.team || []).map((member, idx) => (
                      <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={() => removeTeamMember(idx)}
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                        <input 
                          type="text" 
                          placeholder="Name" 
                          value={member.name || ''}
                          onChange={(e) => {
                            const list = [...formData.team];
                            list[idx].name = e.target.value;
                            updateField('team', list);
                          }}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', padding: '4px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Role" 
                          value={member.role || ''}
                          onChange={(e) => {
                            const list = [...formData.team];
                            list[idx].role = e.target.value;
                            updateField('team', list);
                          }}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '11px', padding: '4px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          value={member.image_url || ''}
                          onChange={(e) => {
                            const list = [...formData.team];
                            list[idx].image_url = e.target.value;
                            updateField('team', list);
                          }}
                          style={{ width: '100%', background: 'transparent', border: 'none', color: '#64748b', fontSize: '10px', padding: '4px' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= SERVICES CONFIG FORM ================= */}
          {activePage === 'services' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '700' }}>Handyman Services & Solutions Catalogue</h3>
                <button onClick={addServiceItem} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(34, 211, 238, 0.2)', padding: '6px 12px', borderRadius: '4px' }}>
                  <Plus size={12} /> Add Service
                </button>
              </div>

              {(!formData.services || formData.services.length === 0) ? (
                <p style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>No service entries catalogued. Click "Add Service" to populate products.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(formData.services || []).map((svc, idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative' }}>
                      <button 
                        onClick={() => removeServiceItem(idx)}
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: '#64748b' }}>Service Title</label>
                          <input 
                            type="text" 
                            value={svc.title || ''} 
                            onChange={(e) => {
                              const list = [...formData.services];
                              list[idx].title = e.target.value;
                              updateField('services', list);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', padding: '2px 0' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: '#64748b' }}>Price Tag / Rate</label>
                          <input 
                            type="text" 
                            value={svc.price || ''} 
                            onChange={(e) => {
                              const list = [...formData.services];
                              list[idx].price = e.target.value;
                              updateField('services', list);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--cyan)', fontSize: '13px', padding: '2px 0' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
                          <input 
                            type="checkbox" 
                            id={`spotlight-${idx}`}
                            checked={svc.isSpotlight || false} 
                            onChange={(e) => {
                              const list = [...formData.services];
                              list[idx].isSpotlight = e.target.checked;
                              updateField('services', list);
                            }}
                            style={{ accentColor: 'var(--cyan)', cursor: 'pointer' }}
                          />
                          <label htmlFor={`spotlight-${idx}`} style={{ fontSize: '11px', color: '#cbd5e1', cursor: 'pointer' }}>Spotlight?</label>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b' }}>Short Tagline / Info</label>
                        <input 
                          type="text" 
                          value={svc.tagline || ''} 
                          onChange={(e) => {
                            const list = [...formData.services];
                            list[idx].tagline = e.target.value;
                            updateField('services', list);
                          }}
                          style={{ width: '100%', background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '12px', padding: '2px 0' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* AI IMAGE GENERATOR MODAL */}
      {showAIModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(6px)'
        }}>
          <div className="glass-panel" style={{
            width: '450px',
            padding: '28px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: '#0c0f1d',
            borderRadius: '8px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--purple)" /> Social AI Image Maker
              </h3>
              <button 
                onClick={() => setShowAIModal(false)} 
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '12.5px', lineHeight: '1.5' }}>
              Describe the brand image you want. It will use our backend AI studio to generate the visual and apply the URL to the <strong>{targetField.replace(/_/g, ' ')}</strong> field.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#64748b' }}>Creative Art Prompt</label>
              <textarea 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)} 
                placeholder="e.g. A gorgeous modern recording studio room with dark mahogany walls and glowing cyan LED strip lights, hyper-realistic, 8k resolution"
                rows="3"
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px', fontSize: '13px', resize: 'none' }}
              />
            </div>

            {aiError && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>⚠️ {aiError}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowAIModal(false)}
                className="btn-secondary" 
                style={{ fontSize: '12.5px', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 24px', background: 'var(--cyan)', color: '#000', border: 'none', fontWeight: 'bold' }}
              >
                {aiLoading ? <Loader2 className="spin" size={13} /> : <Sparkles size={13} />}
                {aiLoading ? 'Creating Art...' : 'Generate Image'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
