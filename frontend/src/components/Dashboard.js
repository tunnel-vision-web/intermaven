import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../App';
import { 
  Home, Zap, Users, FileText, HardDrive, Settings, LogOut,
  Palette, Music, Share2, Film, Presentation, Bell,
  TrendingUp, Download, Upload, BarChart3, DollarSign, UserPlus,
  BookOpen, Sparkles, Library, ShoppingBag, Plug, Smartphone, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import SocialAI from './SocialAI';
import CRMPanel from './CRMPanel';
import EPKBuilder from './EPKBuilder';
import FileManager from './FileManager';
import Channels from './Channels';
import POSPanel from './POSPanel';
import BusinessDiscoveryModal from './wizard/BusinessDiscoveryModal';
import WizardShell from './wizard/WizardShell';
import HOW_TO_GUIDES from './wizard/howto-content';
import StrategyPanel from './wizard/StrategyPanel';
import RequiredChannelsCard from './wizard/RequiredChannelsCard';

const APPS = {
  brandkit: { id: 'brandkit', name: 'Brand Kit AI', color: '#10b981', icon: Palette, portals: ['business', 'music'] },
  musicbio: { id: 'musicbio', name: 'Music Bio & Press Kit', color: '#22d3ee', icon: Music, portals: ['music'] },
  social: { id: 'social', name: 'Social AI', color: '#f43f5e', icon: Share2, portals: ['business', 'music', 'hospitality'] },
  syncpitch: { id: 'syncpitch', name: 'Sync Pitch AI', color: '#f59e0b', icon: Film, portals: ['music'] },
  bizpitch: { id: 'bizpitch', name: 'Pitch Deck AI', color: '#8b5cf6', icon: Presentation, portals: ['business'] },
  pos: { id: 'pos', name: 'Intermaven POS', color: '#0ea5e9', icon: Smartphone, portals: ['business', 'music'] }
};

const ALL_PORTALS = [
  { id: 'business', label: 'Business', enabled: true },
  { id: 'music', label: 'Music (TuneMavens)', enabled: true },
  { id: 'hospitality', label: 'Hospitality', enabled: false, comingSoon: true },
];

const PLAN_CREDITS = { free: 150, creator: 600, pro: 2500 };

const AVATAR_PRESETS = [
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'business', emoji: '💼', label: 'Business' },
  { id: 'producer', emoji: '🎛️', label: 'Producer' },
  { id: 'vocalist', emoji: '🎤', label: 'Vocalist' },
  { id: 'admin', emoji: '⚡', label: 'Admin' }
];

function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Onboarding States
  const [hasEpk, setHasEpk] = useState(false);

  // Analytics / Reports State
  const [analytics, setAnalytics] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  // Business Discovery State
  const [businessProfile, setBusinessProfile] = useState(null);
  const [showDiscovery, setShowDiscovery] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    bio: '',
    preferred_channel: 'email',
    avatar: '',
    password: '',
    enabled_portals: ['business', 'music'],
  });

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Fetch EPK status
  const checkEpk = async () => {
    try {
      const response = await api.get('/api/epk/my');
      if (response.data && response.data.epk) {
        setHasEpk(true);
      }
    } catch (err) {
      setHasEpk(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    checkEpk();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard analytics (per-user + admin-overview if admin)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const p = await api.get('/api/business-profile');
        setBusinessProfile(p.data);
        // Hydrate enabled_portals from business profile (defaults to business+music)
        if (p.data?.enabled_portals && Array.isArray(p.data.enabled_portals) && p.data.enabled_portals.length > 0) {
          setProfileForm(prev => ({ ...prev, enabled_portals: p.data.enabled_portals }));
        }
        // Show discovery modal automatically if not completed and user hasn't dismissed it
        if (!p.data?.completed && !sessionStorage.getItem('discovery_skipped')) {
          setShowDiscovery(true);
        }
      } catch (e) { /* non-fatal */ }
      try {
        const s = await api.get('/api/user/stats');
        setUserStats(s.data);
      } catch (e) { /* non-fatal */ }
      try {
        const c = await api.get('/api/crm/contacts');
        setContactsCount(Array.isArray(c.data?.contacts) ? c.data.contacts.length : (c.data?.total || 0));
      } catch (e) { /* non-fatal */ }
      if (user.role === 'admin' || user.is_admin) {
        try {
          const a = await api.get('/api/admin/analytics/overview?range=30d');
          setAnalytics(a.data);
        } catch (e) { /* admin-only */ }
      }
    })();
  }, [user]);

  // Build chart series
  const seedDailySeries = (base = 30) => {
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      out.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        runs: Math.max(0, Math.round(base * (0.5 + Math.random()))),
        credits: Math.max(0, Math.round((base / 2) * (0.5 + Math.random())))
      });
    }
    return out;
  };
  const APP_COLORS = ['#10b981', '#22d3ee', '#f43f5e', '#f59e0b', '#8b5cf6'];

  // CSV export of user's CRM contacts
  const handleExportContacts = async () => {
    try {
      const res = await api.get('/api/crm/contacts');
      const contacts = res.data?.contacts || [];
      if (!contacts.length) { alert('No contacts to export.'); return; }
      const headers = ['first_name', 'last_name', 'email', 'phone', 'tags'];
      const rows = contacts.map(c => headers.map(h => {
        const v = c[h];
        if (Array.isArray(v)) return `"${v.join('|')}"`;
        return `"${(v ?? '').toString().replace(/"/g, '""')}"`;
      }).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `intermaven-contacts-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleImportContacts = async (file) => {
    if (!file) return;
    setImporting(true); setImportMsg('');
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { setImportMsg('Empty or invalid CSV.'); setImporting(false); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const contacts = lines.slice(1).map(line => {
        const cells = line.match(/("[^"]*"|[^,]+)/g) || [];
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (cells[i] || '').replace(/^"|"$/g, ''); });
        if (obj.tags) obj.tags = obj.tags.split('|').filter(Boolean);
        return obj;
      }).filter(c => c.email);
      const res = await api.post('/api/crm/contacts/import', { contacts });
      setImportMsg(`Imported ${res.data?.imported ?? contacts.length} contact(s).`);
      const c = await api.get('/api/crm/contacts');
      setContactsCount(Array.isArray(c.data?.contacts) ? c.data.contacts.length : (c.data?.total || 0));
    } catch (err) {
      setImportMsg('Import failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        email: user.email || '',
        bio: user.bio || '',
        preferred_channel: user.preferred_channel || 'email',
        avatar: user.avatar || '',
        password: ''
      });
    }
  }, [user]);

  const handleLogoClick = () => navigate('/');
  const toggleCollapse = () => setCollapsed(!collapsed);

  const openApp = (appId) => {
    console.log('%c🚀 APP CARD CLICKED → Loading: ' + appId, 'background:#22d3ee;color:#0f172a;font-weight:bold;padding:4px 8px;border-radius:4px');
    setActivePanel(appId);
  };

  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      try {
        await api.post('/api/notifications/mark-read');
        setUnreadCount(0);
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { enabled_portals, ...rest } = profileForm;
      const payload = { ...rest };
      if (!payload.password) delete payload.password;
      
      const response = await api.put('/api/user/profile', payload);
      updateUser(response.data);
      // Save portal preference separately to business profile
      try {
        await api.put('/api/business-profile', { enabled_portals: enabled_portals || ['business', 'music'] });
      } catch (e) { /* non-fatal */ }
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  // Filter APPS based on the user's enabled portals (default business + music)
  const enabledPortals = profileForm.enabled_portals && profileForm.enabled_portals.length > 0
    ? profileForm.enabled_portals
    : ['business', 'music'];
  const visibleApps = Object.values(APPS).filter(app =>
    !app.portals || app.portals.some(p => enabledPortals.includes(p))
  );

  const sidebarWidth = collapsed ? '70px' : '20%';
  const currentPlan = user?.plan || 'free';

  // Onboarding items definition
  const onboardingSteps = [
    {
      id: 'profile',
      label: 'Complete your profile details (First & Last Name, Phone, Bio)',
      isCompleted: !!(user?.first_name && user?.phone && user?.bio),
      action: () => { setActivePanel('settings'); setSettingsTab('profile'); }
    },
    {
      id: 'avatar',
      label: 'Select a customized profile avatar',
      isCompleted: !!user?.avatar,
      action: () => { setActivePanel('settings'); setSettingsTab('profile'); }
    },
    {
      id: 'channel',
      label: 'Set your preferred CRM communication channel',
      isCompleted: !!user?.preferred_channel,
      action: () => { setActivePanel('settings'); setSettingsTab('profile'); }
    },
    {
      id: 'brandkit',
      label: 'Add your AI Brand Name setting',
      isCompleted: !!user?.brand_name,
      action: () => { setActivePanel('brandkit'); }
    },
    {
      id: 'epk',
      label: 'Create your Electronic Press Kit (EPK)',
      isCompleted: hasEpk,
      action: () => { setActivePanel('epk'); }
    }
  ];

  const completedStepsCount = onboardingSteps.filter(s => s.isCompleted).length;
  const onboardingProgress = Math.round((completedStepsCount / onboardingSteps.length) * 100);

  // Derived chart data (depends on onboarding + analytics state defined above)
  const activitySeries = userStats?.daily_activity?.length
    ? userStats.daily_activity
    : seedDailySeries(userStats?.ai_runs_week ? Math.max(2, userStats.ai_runs_week) : 4);

  const appUsageData = (() => {
    if (analytics?.top_tools?.length) {
      return analytics.top_tools.map(t => ({ name: APPS[t.tool_id]?.name || t.tool_id, value: t.count }));
    }
    return Object.values(APPS).slice(0, 5).map(a => ({ name: a.name, value: Math.floor(Math.random() * 10) + 1 }));
  })();

  const onboardingPieData = [
    { name: 'Completed', value: completedStepsCount },
    { name: 'Remaining', value: Math.max(0, onboardingSteps.length - completedStepsCount) }
  ];

  const renderAvatar = (u, size = 36) => {
    const preset = AVATAR_PRESETS.find(p => p.id === u?.avatar);
    if (preset) {
      return (
        <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '3px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${size * 0.5}px` }}>
          {preset.emoji}
        </div>
      );
    }
    if (u?.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('/'))) {
      return (
        <img src={u.avatar} alt="Avatar" style={{ width: `${size}px`, height: `${size}px`, borderRadius: '3px', objectFit: 'cover' }} />
      );
    }
    return (
      <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '3px', backgroundColor: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold', fontSize: `${size * 0.4}px` }}>
        {(u?.first_name?.[0] || u?.email?.[0] || 'U').toUpperCase()}
      </div>
    );
  };

  const getAccountTypeLabel = () => {
    if (user?.admin_role) {
      return `Admin (${user.admin_role.toUpperCase()})`;
    }
    switch (currentPlan) {
      case 'pro': return 'Pro Plan';
      case 'creator': return 'Creator Plan';
      default: return 'Free Starter';
    }
  };

  const getBadgeColor = () => {
    if (user?.admin_role) return '#ef4444';
    if (currentPlan === 'pro') return '#8b5cf6';
    if (currentPlan === 'creator') return '#22d3ee';
    return '#64748b';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a' }} className="backend-container">
      
      {/* TOP LOGO BAR */}
      <div style={{ 
        width: '100%', 
        height: '70px', 
        backgroundColor: '#1e2937', 
        borderBottom: '1px solid #334155', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 50
      }}>
        {/* Centered logo container horizontally matching the sidebar width */}
        <div style={{ 
          width: sidebarWidth, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          transition: 'all 0.3s ease',
          height: '100%'
        }}>
          <img 
            src="/images/logos/intermaven/intermaven-logo-web.png" 
            alt="Intermaven" 
            style={{ 
              height: '42px', 
              cursor: 'pointer', 
              maxWidth: collapsed ? '45px' : '180px', 
              transition: 'all 0.3s ease',
              objectFit: 'contain'
            }} 
            onClick={handleLogoClick} 
          />
        </div>

        {/* Top-Right Header Elements */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '24px' }}>
          
          {/* Account Type Badge */}
          <div style={{ 
            backgroundColor: getBadgeColor(), 
            color: '#ffffff', 
            padding: '5px 14px', 
            borderRadius: '3px', 
            fontSize: '12px', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {getAccountTypeLabel()}
          </div>

          {/* View Site link — lets logged-in users browse the public frontend */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="view-site-link"
            style={{
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid #334155',
              borderRadius: '3px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            View Site ↗
          </a>

          {/* Notification bell and tray */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={handleBellClick} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#cbd5e1', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                position: 'relative', 
                padding: '8px',
                borderRadius: '3px'
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '16px', 
                  height: '16px', 
                  fontSize: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold' 
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{ 
                position: 'absolute', 
                top: '45px', 
                right: '0', 
                width: '320px', 
                backgroundColor: '#1e2937', 
                border: '1px solid #334155', 
                borderRadius: '3px', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', 
                zIndex: 100, 
                padding: '12px' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: '1px solid #334155', 
                  paddingBottom: '8px', 
                  marginBottom: '8px' 
                }}>
                  <h5 style={{ margin: 0, color: '#f1f5f9', fontSize: '14px' }}>Notifications</h5>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{unreadCount} unread</span>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < notifications.length - 1 ? '1px solid #334155' : 'none' }}>
                        <span style={{ fontSize: '16px' }}>{n.icon || '🔔'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{n.title}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>{n.text}</div>
                          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR */}
        <div style={{ 
          width: sidebarWidth, 
          minWidth: collapsed ? '70px' : '20%', 
          maxWidth: collapsed ? '70px' : '20%', 
          backgroundColor: '#1e2937', 
          display: 'flex', 
          flexDirection: 'column', 
          transition: 'all 0.3s ease',
          borderRight: '1px solid #334155'
        }}>

          <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {renderAvatar(user, 36)}
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </div>
                </div>
              )}
            </div>
            <button onClick={toggleCollapse} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '22px', cursor: 'pointer' }}>
              {collapsed ? '›' : '‹'}
            </button>
          </div>

          <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>

            <button onClick={() => setActivePanel('overview')} style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === 'overview' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
              <Home size={24} color="#22d3ee" />
              {!collapsed && <span>Dashboard</span>}
            </button>

            <div style={{ padding: collapsed ? '12px 16px' : '12px 24px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              {!collapsed && 'MY APPS'}
            </div>

            {visibleApps.map(app => (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === app.id ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}
              >
                <app.icon size={24} color={app.color} />
                {!collapsed && <span>{app.name}</span>}
              </button>
            ))}

            <div style={{ padding: collapsed ? '12px 16px' : '12px 24px', fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '16px' }}>
              {!collapsed && 'TOOLS'}
            </div>

            <button onClick={() => setActivePanel('filemanager')} style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === 'filemanager' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
              <HardDrive size={24} color="#22d3ee" />
              {!collapsed && <span>File Manager</span>}
            </button>

            <button onClick={() => setActivePanel('epk')} style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === 'epk' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
              <FileText size={24} color="#22d3ee" />
              {!collapsed && <span>EPK Builder</span>}
            </button>

            <button onClick={() => setActivePanel('crm')} style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === 'crm' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
              <Users size={24} color="#22d3ee" />
              {!collapsed && <span>Smart CRM</span>}
            </button>

            <button onClick={() => setActivePanel('channels')} data-testid="sidebar-channels-btn" style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === 'channels' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
              <Plug size={24} color="#22d3ee" />
              {!collapsed && <span>Channels</span>}
            </button>

            <button onClick={() => setActivePanel('settings')} style={{ width: '100%', padding: collapsed ? '16px' : '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: activePanel === 'settings' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
              <Settings size={24} color="#22d3ee" />
              {!collapsed && <span>Settings</span>}
            </button>

            <div style={{ marginTop: 'auto', padding: '20px 24px' }}>
              <button onClick={logout} style={{ width: '100%', padding: '12px 0', display: 'flex', alignItems: 'center', gap: '16px', background: 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' }}>
                <LogOut size={24} color="#22d3ee" />
                {!collapsed && <span>Log Out</span>}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '16px 32px', overflowY: 'auto', backgroundColor: '#0f172a' }}>

          {activePanel === 'overview' && (
            <div>
              {/* Business Discovery CTA — shown if not completed */}
              {businessProfile && !businessProfile.completed && (
                <div data-testid="discovery-cta" style={{ backgroundColor: '#22d3ee11', borderRadius: '3px', padding: '18px 22px', marginBottom: '20px', border: '1px solid #22d3ee66', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ color: '#22d3ee', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended · 2 min</div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px', marginTop: '4px' }}>Tell Ayo about your business</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>I&apos;ll generate a custom strategy &amp; personalize every app for you.</div>
                  </div>
                  <button
                    onClick={() => { sessionStorage.removeItem('discovery_skipped'); setShowDiscovery(true); }}
                    data-testid="start-discovery-btn"
                    style={{ backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                  >
                    Start discovery →
                  </button>
                </div>
              )}

              {/* Required Channels CTA — shown when user has a strategy with unconnected channels */}
              <RequiredChannelsCard onGoToChannels={() => setActivePanel('channels')} />

              {/* Upgrade Banner */}
              <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '28px', marginBottom: '28px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                  <Zap size={52} color="#22d3ee" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#e2e8f0' }}>Ready to unlock more power?</h3>
                    <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.6', fontSize: '16px' }}>
                      Upgrade to Creator or Pro plan and get 4× more credits, priority AI processing, and exclusive tools.
                    </p>
                  </div>
                </div>
                <button style={{ marginTop: '24px', backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '14px 32px', borderRadius: '3px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
                  Upgrade Now →
                </button>
              </div>

              {/* Onboarding Checklist */}
              <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', marginBottom: '28px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '16px', fontWeight: 600 }}>Onboarding Progress ({onboardingProgress}%)</h4>
                <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${onboardingProgress}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {onboardingSteps.map(step => (
                    <div 
                      key={step.id} 
                      onClick={step.action} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        cursor: 'pointer', 
                        padding: '10px 14px', 
                        borderRadius: '3px', 
                        backgroundColor: '#1f293d',
                        border: '1px solid #334155',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a3a54'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f293d'}
                    >
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '3px', 
                        border: '2px solid', 
                        borderColor: step.isCompleted ? '#10b981' : '#64748b',
                        backgroundColor: step.isCompleted ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {step.isCompleted ? '✓' : ''}
                      </div>
                      <span style={{ 
                        fontSize: '14px', 
                        color: step.isCompleted ? '#94a3b8' : '#e2e8f0', 
                        textDecoration: step.isCompleted ? 'line-through' : 'none' 
                      }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats & Launch Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Credits Left */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credits Remaining</h4>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: '#22d3ee' }}>{user?.credits ?? 0}</div>
                  <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '3px', margin: '16px 0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round(((user?.credits ?? 0) / PLAN_CREDITS[currentPlan]) * 100))}%`, backgroundColor: '#22d3ee' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Plan capacity: {PLAN_CREDITS[currentPlan]} credits</div>
                </div>

                {/* Sales metric card */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales & CRM Revenue</h4>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: '#10b981' }}>$1,240.00</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '16px 0 0 0', fontSize: '13px', color: '#10b981' }}>
                    <span>▲ +12.4%</span>
                    <span style={{ color: '#64748b' }}>vs last week</span>
                  </div>
                </div>

                {/* Quick Launch */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Launch</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
                    {visibleApps.map(app => (
                      <div 
                        key={app.id} 
                        onClick={() => openApp(app.id)} 
                        style={{ backgroundColor: '#33415544', border: '1px solid #334155', borderRadius: '3px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#33415588'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#33415544'}
                      >
                        <app.icon size={28} color={app.color} style={{ margin: '0 auto' }} />
                        <div style={{ fontSize: '11px', marginTop: '8px', color: '#cbd5e1' }}>{app.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', gridColumn: 'span 3', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</h4>
                  <p style={{ color: '#e2e8f0', margin: 0, fontSize: '14px' }}>Your recent generations and activity will appear here.</p>
                </div>

              </div>

              {/* ============================================================ */}
              {/* ACCOUNT METRICS — Sales · Users Signed Up · Credits           */}
              {/* ============================================================ */}
              <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }} data-testid="account-metrics-grid">

                {/* Total Sales / Revenue */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '22px', border: '1px solid #334155' }} data-testid="metric-revenue">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue (30d)</span>
                    <DollarSign size={18} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                    ${(analytics?.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    {analytics ? 'Across all paid transactions' : 'Connect payments to see live data'}
                  </div>
                </div>

                {/* Users Signed Up */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '22px', border: '1px solid #334155' }} data-testid="metric-users-signed-up">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {(user?.role === 'admin' || user?.is_admin) ? 'New Users (30d)' : 'CRM Contacts'}
                    </span>
                    <UserPlus size={18} color="#22d3ee" />
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#22d3ee' }}>
                    {(user?.role === 'admin' || user?.is_admin) ? (analytics?.new_users ?? 0) : contactsCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    {(user?.role === 'admin' || user?.is_admin)
                      ? `Total platform users: ${analytics?.total_users ?? '—'}`
                      : 'People in your network'}
                  </div>
                </div>

                {/* AI Runs This Week */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '22px', border: '1px solid #334155' }} data-testid="metric-ai-runs">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Runs (7d)</span>
                    <BarChart3 size={18} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{userStats?.ai_runs_week ?? 0}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Active apps: {userStats?.active_apps ?? 0}</div>
                </div>

                {/* Onboarding Completion */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '22px', border: '1px solid #334155' }} data-testid="metric-onboarding">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Onboarding</span>
                    <TrendingUp size={18} color="#8b5cf6" />
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>{onboardingProgress}%</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{completedStepsCount}/{onboardingSteps.length} steps complete</div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* ANALYTICS — CHARTS                                            */}
              {/* ============================================================ */}
              <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }} data-testid="analytics-grid">

                {/* 7-Day Activity Area */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }} data-testid="chart-activity">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '15px', fontWeight: 600 }}>7-Day Activity Trend</h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>AI runs · credits used</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={activitySeries} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradRuns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCredits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 3, color: '#e2e8f0' }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Area type="monotone" dataKey="runs" stroke="#22d3ee" strokeWidth={2} fill="url(#gradRuns)" name="AI Runs" />
                      <Area type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={2} fill="url(#gradCredits)" name="Credits Used" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Onboarding Donut */}
                <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }} data-testid="chart-onboarding-donut">
                  <h4 style={{ margin: '0 0 14px 0', color: '#f1f5f9', fontSize: '15px', fontWeight: 600 }}>Onboarding Snapshot</h4>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={onboardingPieData}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        paddingAngle={3} dataKey="value" stroke="#0f172a"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#334155" />
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 3, color: '#e2e8f0' }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* App-Usage Bar */}
              <div style={{ marginTop: '20px', backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }} data-testid="chart-app-usage">
                <h4 style={{ margin: '0 0 14px 0', color: '#f1f5f9', fontSize: '15px', fontWeight: 600 }}>App Usage Breakdown</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={appUsageData} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 3, color: '#e2e8f0' }} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {appUsageData.map((entry, i) => (
                        <Cell key={`c-${i}`} fill={APP_COLORS[i % APP_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ============================================================ */}
              {/* STRATEGY PANEL — Save · Library · Brand Playbook PDF          */}
              {/* ============================================================ */}
              <StrategyPanel
                businessProfile={businessProfile}
                onStrategyChanged={(s) => {
                  // Refetch profile so the strategy banner & PDF reflect the new active strategy
                  api.get('/api/business-profile').then(r => setBusinessProfile(r.data)).catch(() => {});
                }}
              />

              {/* ============================================================ */}
              {/* REPORTS — Import / Export                                     */}
              {/* ============================================================ */}
              <div style={{ marginTop: '28px', backgroundColor: '#1e2937', borderRadius: '3px', padding: '24px', border: '1px solid #334155' }} data-testid="reports-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#f1f5f9', fontSize: '16px', fontWeight: 600 }}>Reports</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Import contacts or export your data as CSV.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleExportContacts}
                      data-testid="export-contacts-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                    >
                      <Download size={16} /> Export Contacts CSV
                    </button>
                    <label
                      data-testid="import-contacts-label"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', color: '#e2e8f0', border: '1px solid #334155', padding: '10px 18px', borderRadius: '3px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                    >
                      <Upload size={16} /> {importing ? 'Importing…' : 'Import Contacts CSV'}
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        data-testid="import-contacts-input"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImportContacts(e.target.files?.[0])}
                      />
                    </label>
                    {(user?.role === 'admin' || user?.is_admin) && (
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL || ''}/api/admin/users/export`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="export-users-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#8b5cf6', color: '#ffffff', textDecoration: 'none', padding: '10px 18px', borderRadius: '3px', fontWeight: 700, fontSize: '13px' }}
                      >
                        <Download size={16} /> Export All Users CSV
                      </a>
                    )}
                  </div>
                </div>
                {importMsg && (
                  <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '3px', color: '#22d3ee', fontSize: '13px' }} data-testid="import-msg">
                    {importMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS PANEL */}
          {activePanel === 'settings' && (
            <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '30px', maxWidth: '900px', margin: '0 auto', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
                <button onClick={() => setSettingsTab('profile')} style={{ padding: '12px 28px', background: settingsTab === 'profile' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontWeight: settingsTab === 'profile' ? '600' : '400', borderRadius: '3px 3px 0 0' }}>
                  Profile
                </button>
                <button onClick={() => setSettingsTab('billing')} style={{ padding: '12px 28px', background: settingsTab === 'billing' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontWeight: settingsTab === 'billing' ? '600' : '400', borderRadius: '3px 3px 0 0' }}>
                  Billing
                </button>
              </div>

              {settingsTab === 'profile' && (
                <div>
                  <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#f1f5f9' }}>Profile Information</h3>
                  
                  {/* Avatar preset selection */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Select Avatar Preset</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {AVATAR_PRESETS.map(preset => {
                        const isSelected = profileForm.avatar === preset.id;
                        return (
                          <div 
                            key={preset.id}
                            onClick={() => setProfileForm(p => ({ ...p, avatar: preset.id }))}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: isSelected ? '#22d3ee22' : '#33415544',
                              border: '2px solid',
                              borderColor: isSelected ? '#22d3ee' : '#334155',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span style={{ fontSize: '20px' }}>{preset.emoji}</span>
                            <span style={{ fontSize: '13px', color: isSelected ? '#22d3ee' : '#e2e8f0' }}>{preset.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Custom URL Input */}
                    <div style={{ marginTop: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Or enter custom Image URL</span>
                      <input 
                        type="text" 
                        placeholder="https://example.com/avatar.jpg"
                        value={profileForm.avatar && !AVATAR_PRESETS.some(p => p.id === profileForm.avatar) && !profileForm.avatar.startsWith('data:') ? profileForm.avatar : ''}
                        onChange={(e) => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                        style={{ width: '100%', padding: '10px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: '13px', marginTop: '6px' }}
                      />
                    </div>

                    {/* Upload from device — saves to File Manager */}
                    <div style={{ marginTop: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: 6 }}>Or upload from your device (saved to File Manager → Avatars)</span>
                      <label data-testid="avatar-upload-label"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22d3ee', color: '#0f172a', padding: '8px 14px', borderRadius: '3px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <Upload size={14} /> Upload image
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                          data-testid="avatar-upload-input"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              const fd = new FormData();
                              fd.append('file', f);
                              const r = await api.post('/api/user/avatar/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              if (r.data?.avatar) {
                                setProfileForm(p => ({ ...p, avatar: r.data.avatar }));
                                alert('Avatar uploaded and saved to File Manager → Avatars.');
                              }
                            } catch (err) {
                              alert('Upload failed: ' + (err.response?.data?.detail || err.message));
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Portal preference — show business / music / hospitality apps */}
                    <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #33415555' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Portals to show in your sidebar</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ALL_PORTALS.map(p => {
                          const enabled = (profileForm.enabled_portals || ['business', 'music']).includes(p.id);
                          const disabled = !p.enabled;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={disabled}
                              data-testid={`portal-toggle-${p.id}`}
                              onClick={() => {
                                if (disabled) return;
                                setProfileForm(prev => {
                                  const current = prev.enabled_portals || ['business', 'music'];
                                  const next = current.includes(p.id) ? current.filter(x => x !== p.id) : [...current, p.id];
                                  return { ...prev, enabled_portals: next.length === 0 ? ['business'] : next };
                                });
                              }}
                              style={{
                                padding: '8px 14px', borderRadius: '3px', fontWeight: 600, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
                                background: enabled ? '#22d3ee22' : 'transparent',
                                color: disabled ? '#475569' : enabled ? '#22d3ee' : '#cbd5e1',
                                border: enabled ? '1px solid #22d3ee' : '1px solid #334155',
                                opacity: disabled ? 0.6 : 1,
                              }}
                            >
                              {enabled ? '✓ ' : ''}{p.label}{p.comingSoon ? ' (Coming soon)' : ''}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: 8 }}>Show only the apps relevant to your business. You can change this anytime.</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>First Name</label>
                      <input 
                        type="text" 
                        value={profileForm.first_name} 
                        onChange={(e) => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                        style={{ width: '100%', padding: '12px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Last Name</label>
                      <input 
                        type="text" 
                        value={profileForm.last_name} 
                        onChange={(e) => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                        style={{ width: '100%', padding: '12px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Email Address</label>
                      <input 
                        type="email" 
                        value={profileForm.email} 
                        onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                        style={{ width: '100%', padding: '12px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={profileForm.phone} 
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        style={{ width: '100%', padding: '12px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0' }} 
                      />
                    </div>
                  </div>

                  {/* Preferred channel for CRM */}
                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Preferred Communication Channel (for CRM Sync)</label>
                    <select 
                      value={profileForm.preferred_channel}
                      onChange={(e) => setProfileForm(p => ({ ...p, preferred_channel: e.target.value }))}
                      style={{ width: '100%', padding: '12px', background: '#334155', border: '1px solid #4b5563', borderRadius: '3px', color: '#e2e8f0', fontSize: '14px' }}
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Bio</label>
                    <textarea 
                      rows="4" 
                      placeholder="Tell us about yourself..." 
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                      style={{ width: '100%', padding: '12px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', resize: 'vertical' }} 
                    />
                  </div>

                  <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '16px', color: '#f1f5f9' }}>Change Password</h4>
                    <div style={{ maxWidth: '400px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>New Password (leave blank to keep current)</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={profileForm.password}
                        onChange={(e) => setProfileForm(p => ({ ...p, password: e.target.value }))}
                        style={{ width: '100%', padding: '12px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0' }} 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    style={{ marginTop: '32px', backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '14px 32px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save Profile Changes
                  </button>
                </div>
              )}

              {settingsTab === 'billing' && (
                <div>
                  <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#f1f5f9' }}>Billing & Subscription</h3>
                  <div style={{ backgroundColor: '#334155', borderRadius: '3px', padding: '24px', marginBottom: '24px', border: '1px solid #475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4>Current Plan</h4>
                        <p style={{ color: '#22d3ee', fontSize: '22px', fontWeight: 700 }}>{currentPlan.toUpperCase()}</p>
                      </div>
                      <button style={{ backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 24px', borderRadius: '3px', fontWeight: 600, cursor: 'pointer' }}>
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <h4>Payment Method</h4>
                    <div style={{ backgroundColor: '#334155', borderRadius: '3px', padding: '20px', border: '1px solid #475569' }}>
                      <p>Visa •••• 4242 (expires 12/28)</p>
                      <button style={{ marginTop: '12px', background: 'transparent', border: '1px solid #64748b', color: '#e2e8f0', padding: '8px 20px', borderRadius: '3px', cursor: 'pointer' }}>
                        Update Card
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real apps - full container */}
          {activePanel === 'social' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><WizardShell appId="social" appName="Social AI" color="#f43f5e" howToTopics={HOW_TO_GUIDES.social} onGoToChannels={() => setActivePanel('channels')}><SocialAI /></WizardShell></div>}
          {activePanel === 'crm' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><WizardShell appId="crm" appName="Smart CRM" color="#22d3ee" howToTopics={HOW_TO_GUIDES.crm} onGoToChannels={() => setActivePanel('channels')}><CRMPanel /></WizardShell></div>}
          {activePanel === 'epk' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><WizardShell appId="epk" appName="EPK Builder" color="#22d3ee" howToTopics={HOW_TO_GUIDES.epk} onGoToChannels={() => setActivePanel('channels')}><EPKBuilder /></WizardShell></div>}
          {activePanel === 'filemanager' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><FileManager /></div>}
          {activePanel === 'channels' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><Channels /></div>}
          {activePanel === 'pos' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><POSPanel /></div>}

          {APPS[activePanel] && !['social','crm','epk','filemanager','settings','channels','pos'].includes(activePanel) && (
            <div style={{ flex: 1, height: '100%', overflow: 'auto' }}>
              <WizardShell
                appId={activePanel}
                appName={APPS[activePanel].name}
                color={APPS[activePanel].color}
                howToTopics={HOW_TO_GUIDES[activePanel] || []}
                onGoToChannels={() => setActivePanel('channels')}
              >
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <h3 style={{ color: APPS[activePanel].color, fontSize: 20, marginBottom: 8 }}>{APPS[activePanel].name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>Full advanced interface for this app is being built. Use the Wizard tab above to generate content with Ayo.</p>
                </div>
              </WizardShell>
            </div>
          )}
        </div>
      </div>

      {/* Business Discovery Modal — auto-shows on first login until completed */}
      {showDiscovery && (
        <BusinessDiscoveryModal
          onClose={() => { setShowDiscovery(false); sessionStorage.setItem('discovery_skipped', '1'); }}
          onComplete={(strategy) => {
            setShowDiscovery(false);
            sessionStorage.removeItem('discovery_skipped');
            // Refresh local profile state
            api.get('/api/business-profile').then(r => setBusinessProfile(r.data)).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;