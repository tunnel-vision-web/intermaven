import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, CheckCircle2, AlertTriangle, FileText, X, ChevronRight, 
  ShieldAlert, ArrowLeft, LifeBuoy, Send, MessageSquare, LifeBuoy as SupportIcon
} from 'lucide-react';
import { useAuth, useToast, api } from '../../App';

const HelpPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('kb'); // 'kb' or 'support'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Ticket Tracker State
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [trackerEmail, setTrackerEmail] = useState('');
  const [trackerPhone, setTrackerPhone] = useState('');
  const [isTrackerLoaded, setIsTrackerLoaded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    description: '',
    preferred_channel: 'email'
  });
  const [attachments, setAttachments] = useState([]);
  const [ticketResult, setTicketResult] = useState(null);

  // Auto-fill form and load tickets if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || ''
      }));
      setTrackerEmail(user.email || '');
      setTrackerPhone(user.phone || '');
      loadTickets(user.email, user.phone);
    }
  }, [user]);

  const loadTickets = async (email, phone) => {
    const queryEmail = email || trackerEmail;
    const queryPhone = phone || trackerPhone;
    if (!queryEmail && !queryPhone) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/api/support/tickets', {
        params: {
          email: queryEmail || undefined,
          phone: queryPhone || undefined
        }
      });
      setUserTickets(response.data.tickets || []);
      setIsTrackerLoaded(true);
      
      // If a ticket is currently selected, refresh its details
      if (selectedTicket) {
        const updatedSelected = response.data.tickets.find(
          t => t.ticket_id === selectedTicket.ticket_id
        );
        if (updatedSelected) {
          setSelectedTicket(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      addToast('Error', 'Failed to retrieve your tickets. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 3) {
      addToast('Limit Exceeded', 'You can upload a maximum of 3 photos.', 'error');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        addToast('Invalid File', 'Only image files (JPG, PNG, WEBP) are supported.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('File Too Large', 'File size must be under 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            data: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.description) {
      addToast('Incomplete Form', 'Please fill in all required fields.', 'error');
      return;
    }

    if (formData.preferred_channel === 'email' && !formData.email) {
      addToast('Email Required', 'Please enter your email address.', 'error');
      return;
    }
    if (formData.preferred_channel !== 'email' && !formData.phone) {
      addToast('Phone Required', 'Please enter your phone number.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject: formData.subject,
        message: formData.description,
        category: formData.category,
        preferred_channel: formData.preferred_channel,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        user_id: user?.id || undefined,
        client_name: formData.name,
        attachments: attachments.map(a => a.data)
      };

      const response = await api.post('/api/support/tickets', payload);
      
      if (response.data.success) {
        setTicketResult({
          ticketId: response.data.ticket_id,
          aiResponse: response.data.ai_response
        });
        addToast('Success', 'Your support ticket has been logged.', 'success');
        
        // Reset form except contact details
        setFormData(prev => ({
          ...prev,
          subject: '',
          description: '',
        }));
        setAttachments([]);

        // Reload tickets to update tracker
        loadTickets(formData.email, formData.phone);
      } else {
        addToast('Error', 'Failed to create support ticket.', 'error');
      }
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      addToast('Error', err.response?.data?.detail || 'Failed to submit ticket.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const payload = {
        ticket_id: selectedTicket.ticket_id,
        message: replyText.trim(),
        sender: 'user'
      };

      await api.post(`/api/support/tickets/${selectedTicket.ticket_id}/reply`, payload);
      setReplyText('');
      addToast('Reply Sent', 'Your message has been added to the ticket.', 'success');
      loadTickets();
    } catch (err) {
      console.error('Failed to reply:', err);
      addToast('Error', 'Failed to send reply. Please try again.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      await api.post(`/api/support/tickets/${ticketId}/resolve`);
      addToast('Ticket Resolved', 'Thank you! The ticket is marked resolved and archived.', 'success');
      loadTickets();
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
      addToast('Error', 'Failed to resolve ticket.', 'error');
    }
  };

  // Static articles configuration
  const categories = [
    { title: "AI Tools", desc: "Brand Kit, Social Content, Image Generation", icon: "🤖", slug: "ai-tools" },
    { title: "Smart CRM", desc: "Campaigns, Contacts, Automation, WhatsApp", icon: "📊", slug: "smart-crm" },
    { title: "EPK Builder", desc: "Create, Customize, Publish, Analytics", icon: "🎤", slug: "epk-builder" },
    { title: "File Management", desc: "Upload, Organize, Share, Permissions", icon: "📁", slug: "file-management" },
    { title: "Music Portal", desc: "Releases, Distribution, Analytics, Payouts", icon: "🎵", slug: "music-portal" },
    { title: "Billing & Plans", desc: "Subscriptions, Upgrades, Invoices, Limits", icon: "💳", slug: "billing-plans" },
  ];

  const helpArticles = [
    { slug: "how-to-create-brand-kit", title: "Step-by-Step: Creating Your First Brand Kit", category: "AI Tools", readTime: "6 min" },
    { slug: "music-bio-best-practices", title: "Writing Compelling Music Bios: Tips from the Pros", category: "AI Tools", readTime: "8 min" },
    { slug: "social-ai-content-calendar", title: "Building a Content Calendar with Social AI", category: "AI Tools", readTime: "7 min" },
    { slug: "sync-licensing-masterclass", title: "Sync Licensing Masterclass: Getting Your Music in Film & TV", category: "AI Tools", readTime: "12 min" },
    { slug: "smart-crm-whatsapp-automation", title: "Smart CRM Campaigns: How to Automate WhatsApp Follow-ups", category: "Smart CRM", readTime: "8 min" },
    { slug: "epk-builder-101-professional-kits", title: "EPK Builder 101: Create Professional Electronic Press Kits in Minutes", category: "EPK Builder", readTime: "5 min" },
    { slug: "file-management-best-practices", title: "File Management Best Practices in Intermaven", category: "File Management", readTime: "4 min" },
    { slug: "tunemavens-new-tools", title: "tunemavens.com: New Tools for DJs, Labels & Producers", category: "Music Portal", readTime: "7 min" },
    { slug: "understanding-credits-system", title: "Understanding the Credit System: A Complete Guide", category: "Billing & Plans", readTime: "5 min" },
    { slug: "mobile-payments-mpesa-guide", title: "M-Pesa Payments: Complete Setup Guide", category: "Billing & Plans", readTime: "4 min" }
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="help-page cn" style={{ padding: '40px 0 60px' }}>
      
      {/* Dynamic Tab Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '40px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          background: '#0f172a',
          padding: '6px',
          borderRadius: '3px',
          border: '1px solid #1e293b'
        }}>
          <button
            onClick={() => setActiveTab('kb')}
            style={{
              padding: '10px 24px',
              borderRadius: '3px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              background: activeTab === 'kb' ? '#10b981' : 'transparent',
              color: activeTab === 'kb' ? '#0f172a' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('support')}
            style={{
              padding: '10px 24px',
              borderRadius: '3px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              background: activeTab === 'support' ? '#10b981' : 'transparent',
              color: activeTab === 'support' ? '#0f172a' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            Support Desk
          </button>
        </div>
      </div>

      {activeTab === 'kb' ? (
        // ================= KNOWLEDGE BASE TAB =================
        <div>
          <div className="help-header" style={{ marginBottom: '40px' }}>
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '620px' }}>
              Find answers, guides, and support for all Intermaven features. Click on a topic to view its articles below.
            </p>
          </div>

          <div className="help-content">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>Help Topics</h2>
            
            <div className="help-categories" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: '16px',
              marginBottom: '48px'
            }}>
              {categories.map((cat, index) => (
                <div 
                  key={index}
                  className="category-card"
                  onClick={() => scrollToSection(cat.slug)}
                  style={{
                    background: '#1e2937',
                    border: '1px solid #334155',
                    borderRadius: '3px',
                    padding: '20px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#334155';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ fontSize: '28px', lineHeight: 1 }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{cat.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>{cat.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '28px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              All Articles
            </h2>

            <div className="help-articles-sections" style={{ display: 'grid', gap: '32px', marginBottom: '48px' }}>
              {categories.map((cat, idx) => {
                const articlesInCat = helpArticles.filter(a => a.category === cat.title);
                return (
                  <div key={idx} id={cat.slug} style={{ scrollMarginTop: '100px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f0f5' }}>
                      <span>{cat.icon}</span>
                      <span>{cat.title}</span>
                    </h3>
                    {articlesInCat.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic', paddingLeft: '28px' }}>No articles under this category yet.</p>
                    ) : (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: '12px',
                        paddingLeft: '28px'
                      }}>
                        {articlesInCat.map((art, aIdx) => (
                          <Link 
                            key={aIdx} 
                            to={`/help/article/${art.slug}`}
                            style={{
                              background: '#0f172a',
                              border: '1px solid #1e2937',
                              borderRadius: '3px',
                              padding: '16px',
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'border-color 0.2s, background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#10b981';
                              e.currentTarget.style.backgroundColor = '#1e2937';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#1e2937';
                              e.currentTarget.style.backgroundColor = '#0f172a';
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e8f0', marginBottom: '8px', lineHeight: '1.4' }}>
                              {art.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                              <span>Guide</span>
                              <span>{art.readTime} read</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ 
              background: '#1e2937', 
              border: '1px solid #334155', 
              borderRadius: '3px', 
              padding: '28px',
              maxWidth: '720px'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Still need help?</h3>
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                Submit a support ticket and chat with our AI assistant or service agents.
              </p>
              <button 
                onClick={() => setActiveTab('support')}
                style={{
                  background: '#10b981',
                  color: '#0f172a',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '3px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                Go to Support Desk →
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ================= SUPPORT DESK TAB (DASHBOARD) =================
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            
            {/* Sidebar: Track Tickets List */}
            <div style={{
              flex: '1 1 300px',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '3px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '750px',
              overflow: 'hidden'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={18} color="#10b981" />
                <span>Your Tickets</span>
              </h3>

              {!isTrackerLoaded ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Enter your email or phone to load and track your active support tickets.
                  </p>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={trackerEmail}
                      onChange={(e) => setTrackerEmail(e.target.value)}
                      placeholder="e.g. creative@intermaven.com"
                      style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', margin: '4px 0', fontSize: '11px', color: '#64748b' }}>— OR —</div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={trackerPhone}
                      onChange={(e) => setTrackerPhone(e.target.value)}
                      placeholder="e.g. +254712345678"
                      style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <button
                    onClick={() => loadTickets()}
                    disabled={loading}
                    style={{
                      background: '#10b981', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '3px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                  >
                    {loading ? 'Searching...' : 'Load Ticket History'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <button 
                      onClick={() => setSelectedTicket(null)}
                      style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <SupportIcon size={12} /> Submit New Ticket
                    </button>
                    <button 
                      onClick={() => loadTickets()}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Refresh
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: '10px', paddingRight: '4px' }}>
                    {userTickets.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', margin: '20px 0' }}>No tickets found.</p>
                    ) : (
                      userTickets.map((t) => (
                        <div 
                          key={t.ticket_id}
                          onClick={() => setSelectedTicket(t)}
                          style={{
                            background: selectedTicket?.ticket_id === t.ticket_id ? '#1e293b' : '#08090d',
                            border: '1px solid',
                            borderColor: selectedTicket?.ticket_id === t.ticket_id ? '#10b981' : '#1e293b',
                            borderRadius: '3px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#94a3b8' }}>{t.ticket_id}</span>
                            <span style={{ 
                              color: t.status === 'resolved' ? '#10b981' : t.status === 'in_progress' ? '#3b82f6' : '#ef4444',
                              fontWeight: 700, textTransform: 'uppercase', fontSize: '10px'
                            }}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {t.subject}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                            <span>{t.category}</span>
                            <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsTrackerLoaded(false);
                      setSelectedTicket(null);
                    }}
                    style={{
                      background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '8px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', marginTop: '16px'
                    }}
                  >
                    Change Email/Phone
                  </button>
                </div>
              )}
            </div>

            {/* Main Area: Submission Form or Selected Ticket Conversation */}
            <div style={{
              flex: '2 2 500px',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '3px',
              padding: '32px',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {selectedTicket ? (
                // ================= TICKET CONVERSATION VIEW =================
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.05em' }}>
                          Category: {selectedTicket.category}
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                          {selectedTicket.subject}
                        </h2>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                          <span>ID: {selectedTicket.ticket_id}</span>
                          <span>•</span>
                          <span>Opened: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {selectedTicket.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveTicket(selectedTicket.ticket_id)}
                          style={{
                            background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '3px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>

                    {/* Messages list */}
                    <div style={{ display: 'grid', gap: '16px', marginBottom: '24px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                      {selectedTicket.messages.map((m, idx) => {
                        const isUser = m.sender === 'user';
                        const isAi = m.sender === 'ai';
                        const displayName = isUser ? (selectedTicket.client_name || 'You') : isAi ? 'Ayo (AI Support Helper)' : 'Intermaven Agent';
                        
                        return (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isUser ? 'flex-end' : 'flex-start',
                              width: '100%'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', fontSize: '11px', color: '#64748b' }}>
                              <span>{displayName}</span>
                              {m.sender === 'admin' && <span style={{ background: '#ef4444', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: 700 }}>Admin</span>}
                              {isAi && <span style={{ background: '#10b981', color: '#0f172a', padding: '1px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: 700 }}>AI Helper</span>}
                            </div>
                            
                            <div style={{
                              background: isUser ? '#10b981' : isAi ? '#1e293b' : '#334155',
                              color: isUser ? '#0f172a' : '#fff',
                              border: isAi ? '1px solid #334155' : 'none',
                              borderRadius: '3px',
                              padding: '12px 16px',
                              maxWidth: '80%',
                              fontSize: '14px',
                              lineHeight: 1.5,
                              whiteSpace: 'pre-wrap'
                            }}>
                              {m.message}
                            </div>
                            <span style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                              {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'resolved' ? (
                    <form onSubmit={handleSendReply} style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                      <input 
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a follow-up message..."
                        style={{
                          flex: 1, padding: '12px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={sendingReply || !replyText.trim()}
                        style={{
                          background: replyText.trim() ? '#10b981' : '#334155',
                          color: replyText.trim() ? '#0f172a' : '#64748b',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '3px',
                          fontWeight: 600,
                          cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send size={14} /> Send
                      </button>
                    </form>
                  ) : (
                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                      This ticket is resolved. Conversations are archived and posted on the community forum.
                    </div>
                  )}
                </div>
              ) : ticketResult ? (
                // ================= TICKET CREATED SUCCESS VIEW =================
                <div style={{ textAlign: 'center', padding: '40px 0', display: 'grid', gap: '20px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>Support Ticket Created!</h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
                      Your ticket reference is: <strong style={{ fontFamily: 'monospace', color: '#fff' }}>{ticketResult.ticketId}</strong>
                    </p>
                  </div>

                  <div style={{
                    background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', padding: '20px', textAlign: 'left'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SupportIcon size={14} />
                      Ayo (AI Support Helper) says:
                    </h4>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {ticketResult.aiResponse}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
                    <button
                      onClick={() => setTicketResult(null)}
                      style={{
                        background: '#10b981', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '3px', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Submit Another Ticket
                    </button>
                    <button
                      onClick={() => {
                        // find the ticket in local list and select it
                        const matched = userTickets.find(t => t.ticket_id === ticketResult.ticketId);
                        if (matched) {
                          setSelectedTicket(matched);
                        } else {
                          // refresh list
                          loadTickets().then(() => {
                            const refMatched = userTickets.find(t => t.ticket_id === ticketResult.ticketId);
                            if (refMatched) setSelectedTicket(refMatched);
                          });
                        }
                        setTicketResult(null);
                      }}
                      style={{
                        background: 'transparent', border: '1px solid #1e293b', color: '#cbd5e1', padding: '10px 20px', borderRadius: '3px', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      View Ticket Thread
                    </button>
                  </div>
                </div>
              ) : (
                // ================= TICKET SUBMISSION FORM =================
                <form onSubmit={handleSubmitTicket} style={{ display: 'grid', gap: '18px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', textAlign: 'center' }}>Submit a Support Ticket</h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', textAlign: 'center' }}>
                      Fill out your concern and our support agents and AI helper will assist you shortly.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Your Name *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Fatuma Mwangi"
                        style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Preferred Contact Channel</label>
                      <select
                        value={formData.preferred_channel}
                        onChange={(e) => setFormData({ ...formData, preferred_channel: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Email Address *</label>
                      <input 
                        type="email" 
                        required={formData.preferred_channel === 'email'}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. user@intermaven.com"
                        style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Phone Number *</label>
                      <input 
                        type="tel" 
                        required={formData.preferred_channel !== 'email'}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +254712345678"
                        style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Issue Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      >
                        <option value="general">General Support / Others</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="technical">Technical Bug / Issue</option>
                        <option value="ai-tools">AI Tools Help</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Subject *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Invoice credit missing or EPK error"
                        style={{ width: '100%', padding: '10px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Describe the Issue *</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain details of the workmanship error, payment details, or error messages..."
                      style={{ width: '100%', padding: '12px', background: '#08090d', border: '1px solid #1e293b', borderRadius: '3px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  {/* Photo Attachments */}
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Attach Photo Evidence (Max 3)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px dashed #334155', borderRadius: '3px', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', fontWeight: 600
                      }}>
                        <Upload size={14} />
                        Select Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Provide photos to support your inquiry. Under 5MB each.</span>
                    </div>

                    {attachments.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
                        {attachments.map((item, idx) => (
                          <div key={idx} style={{ position: 'relative', display: 'flex', gap: '8px', background: '#08090d', border: '1px solid #1e293b', padding: '8px', borderRadius: '3px', alignItems: 'center' }}>
                            <img src={item.data} alt="preview" style={{ width: '36px', height: '36px', borderRadius: '3px', objectFit: 'cover' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '10px', color: '#fff', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</p>
                              <p style={{ fontSize: '8px', color: '#64748b', margin: 0 }}>{item.size}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: '#10b981', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '12px'
                    }}
                  >
                    {submitting ? 'Submitting Ticket...' : 'Submit Support Request'}
                  </button>
                </form>
              )}
            </div>

          </div>
          
        </div>
      )}

    </div>
  );
};

export default HelpPage;