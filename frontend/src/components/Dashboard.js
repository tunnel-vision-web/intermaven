import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../App';
import { 
  Home, Zap, Users, FileText, HardDrive, Settings, LogOut,
  Palette, Music, Share2, Film, Presentation, Bell
} from 'lucide-react';
import SocialAI from './SocialAI';
import CRMPanel from './CRMPanel';
import EPKBuilder from './EPKBuilder';
import FileManager from './FileManager';

const APPS = {
  brandkit: { id: 'brandkit', name: 'Brand Kit AI', color: '#10b981', icon: Palette },
  musicbio: { id: 'musicbio', name: 'Music Bio & Press Kit', color: '#22d3ee', icon: Music },
  social: { id: 'social', name: 'Social AI', color: '#f43f5e', icon: Share2 },
  syncpitch: { id: 'syncpitch', name: 'Sync Pitch AI', color: '#f59e0b', icon: Film },
  bizpitch: { id: 'bizpitch', name: 'Pitch Deck AI', color: '#8b5cf6', icon: Presentation }
};

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

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    bio: '',
    preferred_channel: 'email',
    avatar: '',
    password: ''
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
      const payload = { ...profileForm };
      if (!payload.password) delete payload.password;
      
      const response = await api.put('/api/user/profile', payload);
      updateUser(response.data);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update profile');
    }
  };

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

            {Object.values(APPS).map(app => (
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
                    {Object.values(APPS).map(app => (
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
                        value={profileForm.avatar && !AVATAR_PRESETS.some(p => p.id === profileForm.avatar) ? profileForm.avatar : ''}
                        onChange={(e) => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                        style={{ width: '100%', padding: '10px', background: '#33415544', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: '13px', marginTop: '6px' }}
                      />
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
          {activePanel === 'social' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><SocialAI /></div>}
          {activePanel === 'crm' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><CRMPanel /></div>}
          {activePanel === 'epk' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><EPKBuilder /></div>}
          {activePanel === 'filemanager' && <div style={{ flex: 1, height: '100%', overflow: 'auto' }}><FileManager /></div>}

          {APPS[activePanel] && !['social','crm','epk','filemanager','settings'].includes(activePanel) && (
            <div style={{ backgroundColor: '#1e2937', borderRadius: '3px', padding: '60px', textAlign: 'center', color: '#e2e8f0', flex: 1, height: '100%', border: '1px solid #334155' }}>
              <h2 style={{ color: APPS[activePanel].color, fontSize: '24px' }}>{APPS[activePanel].name}</h2>
              <p style={{ marginTop: '20px', fontSize: '18px' }}>Full app interface loads here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;