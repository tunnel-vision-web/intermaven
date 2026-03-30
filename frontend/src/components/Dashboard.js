import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast, api } from '../App';
import { 
  Home, Bell, Plus, User, Settings, CreditCard, LogOut,
  Zap, Copy, Download
} from 'lucide-react';
import { FlatIcon } from './FlatIcon';

// App definitions
const APPS = {
  brandkit: { id: 'brandkit', name: 'Brand Kit AI', icon: 'brandkit', color: '#7c6ff7', desc: 'Brand names, taglines, tone of voice', cost: 10 },
  musicbio: { id: 'musicbio', name: 'Music Bio & Press Kit', icon: 'musicbio', color: '#22d3ee', desc: 'Artist bios and press materials', cost: 15 },
  social: { id: 'social', name: 'Social AI', icon: 'social', color: '#f43f5e', desc: 'Multi-platform social management', cost: 0 },
  syncpitch: { id: 'syncpitch', name: 'Sync Pitch AI', icon: 'syncpitch', color: '#f59e0b', desc: 'Film, TV and advertising pitches', cost: 20 },
  bizpitch: { id: 'bizpitch', name: 'Pitch Deck AI', icon: 'pitchdeck', color: '#8b5cf6', desc: 'Investor and grant pitch decks', cost: 18 }
};

const PLAN_CREDITS = { free: 150, creator: 600, pro: 2500 };

function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('overview');
  const [stats, setStats] = useState({ credits: 0, ai_runs_week: 0, active_apps: 0 });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [availableApps, setAvailableApps] = useState([]);

  const handleLogoClick = () => {
    // Log out and navigate to landing page
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchActivities();
    fetchAvailableApps();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/user/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/api/activities');
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchAvailableApps = async () => {
    try {
      const response = await api.get('/api/apps/available');
      setAvailableApps(Object.values(response.data.apps));
    } catch (error) {
      console.error('Failed to fetch available apps:', error);
    }
  };

  const addApp = async (appId) => {
    try {
      const response = await api.post('/api/users/apps', { app_id: appId });
      if (response.data.success) {
        updateUser({ ...user, apps: response.data.apps });
        addToast('App added!', `${APPS[appId]?.name || appId} is now in your dashboard.`, 'success');
        setShowAddAppModal(false);
      }
    } catch (error) {
      addToast('Failed to add app', error.response?.data?.detail || 'Please try again.', 'error');
    }
  };

  const markNotificationsRead = async () => {
    try {
      await api.post('/api/notifications/mark-read');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || '';
    const last = user?.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
  };

  const creditPercent = Math.round((user?.credits || 0) / PLAN_CREDITS[user?.plan || 'free'] * 100);

  return (
    <div className="dashboard-layout" data-testid="dashboard">
      {/* Sidebar - 30% */}
      <aside className="sidebar" data-testid="sidebar">
        <div className="sidebar-header">
          <div 
            className="sidebar-logo clickable" 
            onClick={handleLogoClick}
            title="Back to website"
            data-testid="sidebar-logo"
          >
            INTER<span>MAVEN</span>
            <span className="sidebar-badge">{user?.portal === 'music' ? 'Music' : 'Business'}</span>
          </div>
        </div>

        <div 
          className="sidebar-user" 
          onClick={() => { setActivePanel('settings'); setSettingsTab('profile'); }}
          data-testid="sidebar-user"
        >
          <div className="sidebar-avatar">{getInitials()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{getFullName()}</div>
            <div className="sidebar-user-plan">{user?.plan} plan</div>
            <div className="sidebar-edit">✎ Edit profile</div>
          </div>
        </div>

        <div className="sidebar-credits">
          <div className="sidebar-credits-header">
            <span className="sidebar-credits-label">Credits</span>
            <span className="sidebar-credits-value">{user?.credits || 0}</span>
          </div>
          <div className="sidebar-credits-bar">
            <div className="sidebar-credits-fill" style={{ width: `${creditPercent}%` }}></div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Overview</div>
          </div>
          <button 
            className={`sidebar-nav-item ${activePanel === 'overview' ? 'active' : ''}`}
            onClick={() => setActivePanel('overview')}
            data-testid="nav-dashboard"
          >
            <Home className="icon" size={18} />
            Dashboard
          </button>
          <button 
            className={`sidebar-nav-item ${activePanel === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActivePanel('notifications'); markNotificationsRead(); }}
            data-testid="nav-notifications"
          >
            <Bell className="icon" size={18} />
            Notifications
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          <div className="sidebar-section">
            <div className="sidebar-section-title">My Apps</div>
          </div>
          {user?.apps?.map(appId => {
            const app = APPS[appId];
            if (!app) return null;
            return (
              <button
                key={appId}
                className={`sidebar-nav-item ${activePanel === `app-${appId}` ? 'active' : ''}`}
                onClick={() => setActivePanel(`app-${appId}`)}
                data-testid={`nav-app-${appId}`}
              >
                <FlatIcon name={app.icon} size={16} color={app.color} />
                {app.name}
              </button>
            );
          })}
          <button className="sidebar-nav-item" onClick={() => addToast('Coming soon', 'Add more apps from the marketplace', '')}>
            <Plus className="icon" size={18} />
            Add app
          </button>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Account</div>
          </div>
          <button 
            className={`sidebar-nav-item ${activePanel === 'settings' && settingsTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActivePanel('settings'); setSettingsTab('profile'); }}
            data-testid="nav-profile"
          >
            <User className="icon" size={18} />
            Profile
          </button>
          <button 
            className={`sidebar-nav-item ${activePanel === 'settings' && settingsTab === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActivePanel('settings'); setSettingsTab('notifications'); }}
          >
            <Bell className="icon" size={18} />
            Notifications
          </button>
          <button 
            className={`sidebar-nav-item ${activePanel === 'billing' ? 'active' : ''}`}
            onClick={() => setActivePanel('billing')}
            data-testid="nav-billing"
          >
            <CreditCard className="icon" size={18} />
            Billing & Credits
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-signout" onClick={logout} data-testid="signout-button">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content - 70% */}
      <main className="main-content">
        <header className="main-header">
          <h1 className="main-title">
            {activePanel === 'overview' && 'Dashboard'}
            {activePanel === 'notifications' && 'Notifications'}
            {activePanel === 'settings' && 'Settings'}
            {activePanel === 'billing' && 'Billing & Credits'}
            {activePanel.startsWith('app-') && APPS[activePanel.replace('app-', '')]?.name}
          </h1>
          <div className="main-header-actions">
            <button 
              className="header-bell" 
              onClick={() => { setActivePanel('notifications'); markNotificationsRead(); }}
              data-testid="header-notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="dot"></span>}
            </button>
            <div 
              className="header-avatar" 
              onClick={() => { setActivePanel('settings'); setSettingsTab('profile'); }}
              data-testid="header-avatar"
            >
              {getInitials()}
            </div>
          </div>
        </header>

        <div className="main-body">
          {/* Overview Panel */}
          {activePanel === 'overview' && (
            <OverviewPanel 
              user={user}
              stats={stats}
              activities={activities}
              setActivePanel={setActivePanel}
              creditPercent={creditPercent}
            />
          )}

          {/* Notifications Panel */}
          {activePanel === 'notifications' && (
            <NotificationsPanel notifications={notifications} />
          )}

          {/* Settings Panel */}
          {activePanel === 'settings' && (
            <SettingsPanel 
              user={user}
              settingsTab={settingsTab}
              setSettingsTab={setSettingsTab}
              updateUser={updateUser}
              addToast={addToast}
            />
          )}

          {/* Billing Panel */}
          {activePanel === 'billing' && (
            <BillingPanel user={user} creditPercent={creditPercent} addToast={addToast} />
          )}

          {/* App Panels */}
          {activePanel.startsWith('app-') && (
            <ToolPanel 
              appId={activePanel.replace('app-', '')}
              user={user}
              updateUser={updateUser}
              addToast={addToast}
              fetchStats={fetchStats}
              fetchActivities={fetchActivities}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Overview Panel Component
function OverviewPanel({ user, stats, activities, setActivePanel, creditPercent }) {
  return (
    <div className="panel active" data-testid="overview-panel">
      {user?.plan === 'free' && (
        <div className="upgrade-banner">
          <span className="upgrade-banner-icon">🔥</span>
          <div className="upgrade-banner-content">
            <h3>You're on the Free plan</h3>
            <p>Upgrade to Creator (KES 500) for 600 credits, faster AI, and Social AI with 6 accounts.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setActivePanel('billing')}>
            Upgrade now →
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Credits remaining</div>
          <div className="stat-value">{user?.credits || 0}</div>
          <div className="stat-sub">{user?.plan} plan</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI runs this week</div>
          <div className="stat-value">{stats.ai_runs_week}</div>
          <div className="stat-sub up">Getting started</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active apps</div>
          <div className="stat-value">{user?.apps?.length || 0}</div>
          <div className="stat-sub">Selected at signup</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scheduled posts</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">Social AI queue</div>
        </div>
      </div>

      <div className="quick-actions">
        {user?.apps?.map(appId => {
          const app = APPS[appId];
          if (!app) return null;
          return (
            <button 
              key={appId}
              className="quick-action" 
              onClick={() => setActivePanel(`app-${appId}`)}
              data-testid={`quick-action-${appId}`}
            >
              <FlatIcon name={app.icon} size={18} color={app.color} />
              {app.name}
            </button>
          );
        })}
      </div>

      <div className="apps-section">
        <div className="section-header">
          <h3 className="section-title">Your apps</h3>
          <button className="btn btn-secondary btn-sm">+ Add app</button>
        </div>
        <div className="apps-grid">
          {user?.apps?.map(appId => {
            const app = APPS[appId];
            if (!app) return null;
            return (
              <div 
                key={appId}
                className="app-card" 
                onClick={() => setActivePanel(`app-${appId}`)}
                data-testid={`app-card-${appId}`}
              >
                <div className="app-card-accent" style={{ background: app.color }}></div>
                <div className="app-card-icon">
                  <FlatIcon name={app.icon} size={24} color={app.color} />
                </div>
                <div className="app-card-name">{app.name}</div>
                <div className="app-card-desc">{app.desc}</div>
                <div className="app-card-action">Open app →</div>
              </div>
            );
          })}
          <div 
            className="app-card app-card-add"
            onClick={() => setShowAddAppModal(true)}
            data-testid="add-app-button"
          >
            <Plus className="icon" size={28} />
            <div className="title">Add new app</div>
            <div className="subtitle">Browse the marketplace</div>
          </div>
        </div>
      </div>

      {/* Add App Modal */}
      {showAddAppModal && (
        <div className="modal-overlay" onClick={() => setShowAddAppModal(false)}>
          <div className="add-app-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add App to Dashboard</h3>
              <button className="modal-close" onClick={() => setShowAddAppModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Select an app to add to your dashboard</p>
              <div className="available-apps-grid">
                {availableApps.filter(app => app.status === 'live' && !user?.apps?.includes(app.id)).map(app => (
                  <div 
                    key={app.id}
                    className="available-app-card"
                    onClick={() => addApp(app.id)}
                    data-testid={`add-app-${app.id}`}
                  >
                    <div className="app-icon-wrap" style={{ background: `${app.color}20` }}>
                      <FlatIcon name={app.icon} size={22} color={app.color} />
                    </div>
                    <div className="app-info">
                      <h4>{app.name}</h4>
                      <p>{app.desc}</p>
                      <span className="app-cost">{app.cost === 0 ? 'Free' : `${app.cost} credits`}</span>
                    </div>
                  </div>
                ))}
                {availableApps.filter(app => app.status === 'live' && !user?.apps?.includes(app.id)).length === 0 && (
                  <div className="no-apps-message">
                    You have all available apps! Check back soon for new releases.
                  </div>
                )}
              </div>
              <div className="coming-soon-section">
                <h4>Coming Soon</h4>
                <div className="coming-soon-apps">
                  {availableApps.filter(app => app.status === 'coming_soon').map(app => (
                    <div key={app.id} className="coming-soon-app">
                      <FlatIcon name={app.icon} size={16} color={app.color} />
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="activity-feed">
        <h3>Recent activity</h3>
        {activities.length === 0 ? (
          <div className="empty-state">No activity yet. Pick a tool above to get started.</div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">⚡</div>
              <div className="activity-content">
                <div className="activity-title">{APPS[activity.tool_id]?.name || activity.tool_id} generated</div>
                <div className="activity-time">{new Date(activity.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Notifications Panel
function NotificationsPanel({ notifications }) {
  return (
    <div className="panel active" data-testid="notifications-panel">
      {notifications.length === 0 ? (
        <div className="empty-state">No notifications yet.</div>
      ) : (
        notifications.map((notif, index) => (
          <div key={index} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
            <span className="notification-icon">{notif.icon}</span>
            <div className="notification-content">
              <div className="notification-title">{notif.title}</div>
              <div className="notification-text">{notif.text}</div>
              <div className="notification-time">{new Date(notif.created_at).toLocaleString()}</div>
            </div>
            {!notif.read && <span className="notification-dot"></span>}
          </div>
        ))
      )}
    </div>
  );
}

// Settings Panel
function SettingsPanel({ user, settingsTab, setSettingsTab, updateUser, addToast }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    brand_name: user?.brand_name || '',
    bio: user?.bio || ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/api/user/profile', formData);
      updateUser(response.data);
      addToast('Profile saved', '', 'success');
    } catch (error) {
      addToast('Failed to save', error.response?.data?.detail || 'Please try again', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="panel active" data-testid="settings-panel">
      <div className="settings-layout">
        <div className="settings-nav">
          <button 
            className={`settings-nav-item ${settingsTab === 'profile' ? 'active' : ''}`}
            onClick={() => setSettingsTab('profile')}
          >
            <User size={16} /> Profile
          </button>
          <button 
            className={`settings-nav-item ${settingsTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setSettingsTab('notifications')}
          >
            <Bell size={16} /> Notifications
          </button>
          <button 
            className={`settings-nav-item ${settingsTab === 'security' ? 'active' : ''}`}
            onClick={() => setSettingsTab('security')}
          >
            <Settings size={16} /> Security
          </button>
        </div>

        <div className="settings-content">
          {settingsTab === 'profile' && (
            <div className="settings-card">
              <h3>Profile</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-input"
                    value={formData.first_name}
                    onChange={handleChange}
                    data-testid="profile-first-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-input"
                    value={formData.last_name}
                    onChange={handleChange}
                    data-testid="profile-last-name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  data-testid="profile-phone"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brand / Artist Name</label>
                <input
                  type="text"
                  name="brand_name"
                  className="form-input"
                  value={formData.brand_name}
                  onChange={handleChange}
                  data-testid="profile-brand-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-textarea"
                  placeholder="Short bio for your EPK and profile..."
                  value={formData.bio}
                  onChange={handleChange}
                  data-testid="profile-bio"
                />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ maxWidth: '200px' }}
                onClick={handleSave}
                disabled={saving}
                data-testid="save-profile-button"
              >
                {saving ? <span className="spinner"></span> : 'Save changes'}
              </button>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="settings-card">
              <h3>Notification Channels</h3>
              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Email</h4>
                  <p>Notifications to your email</p>
                </div>
                <div className="toggle-switch on"></div>
              </div>
              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>WhatsApp</h4>
                  <p>Messages to your WhatsApp</p>
                </div>
                <div className="toggle-switch on"></div>
              </div>
              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>SMS</h4>
                  <p>Text messages to your phone</p>
                </div>
                <div className="toggle-switch"></div>
              </div>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="settings-card">
              <h3>Change Password</h3>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="Current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="Min 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" placeholder="Repeat new password" />
              </div>
              <button className="btn btn-primary" style={{ maxWidth: '200px' }}>
                Update password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Billing Panel
function BillingPanel({ user, creditPercent, addToast }) {
  return (
    <div className="panel active" data-testid="billing-panel">
      <div className="billing-header">
        <div className="billing-header-top">
          <div>
            <div className="billing-plan">{user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} plan</div>
            <div className="billing-credits-info">{user?.credits} credits remaining</div>
          </div>
          <button className="btn btn-primary">Upgrade / Top up →</button>
        </div>
        <div className="billing-bar">
          <div className="billing-bar-fill" style={{ width: `${creditPercent}%` }}></div>
        </div>
        <div className="billing-bar-label">{user?.credits} / {PLAN_CREDITS[user?.plan || 'free']} credits</div>
      </div>

      <h3 style={{ marginBottom: '16px' }}>Upgrade plan</h3>
      <div className="plans-grid">
        <div className="plan-card">
          <div className="plan-name">Creator pack</div>
          <div className="plan-price">KES 500 <span>one-time</span></div>
          <div className="plan-credits">600 credits</div>
          <ul className="plan-features">
            <li>Priority AI speed</li>
            <li>Social AI (6 accounts)</li>
            <li>Save & organise outputs</li>
          </ul>
          <button 
            className="btn btn-primary"
            onClick={() => addToast('M-Pesa payment', 'Payment integration coming soon!', '')}
            data-testid="buy-creator-button"
          >
            Buy with M-Pesa
          </button>
        </div>
        <div className="plan-card popular">
          <div className="plan-name">Pro bundle</div>
          <div className="plan-price">KES 1,500 <span>one-time</span></div>
          <div className="plan-credits">2,500 credits</div>
          <ul className="plan-features">
            <li>Everything in Creator</li>
            <li>White-label output</li>
            <li>API access (beta)</li>
            <li>Priority WhatsApp support</li>
          </ul>
          <button 
            className="btn btn-primary"
            onClick={() => addToast('M-Pesa payment', 'Payment integration coming soon!', '')}
            data-testid="buy-pro-button"
          >
            Buy with M-Pesa
          </button>
        </div>
      </div>
    </div>
  );
}

// Tool Panel Component
function ToolPanel({ appId, user, updateUser, addToast, fetchStats, fetchActivities }) {
  const app = APPS[appId];
  const [inputs, setInputs] = useState({});
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!app) return <div>App not found</div>;

  const TOOL_FIELDS = {
    brandkit: [
      { name: 'name', label: 'Name', placeholder: 'e.g. Sauti Collective' },
      { name: 'industry', label: 'Industry', type: 'select', options: ['Music / Entertainment', 'Fashion & Lifestyle', 'Food & Beverage', 'Tech Startup', 'Creative Agency', 'Personal Brand'] },
      { name: 'audience', label: 'Audience', placeholder: 'Young Nairobi professionals' },
      { name: 'vibe', label: 'Vibe (3 words)', placeholder: 'bold, warm, futuristic' },
      { name: 'extra', label: 'Additional prompt', type: 'textarea', placeholder: 'References, requirements, brand notes...' }
    ],
    musicbio: [
      { name: 'artist', label: 'Artist name', placeholder: 'e.g. Amara Diallo' },
      { name: 'genre', label: 'Genre(s)', placeholder: 'Afrobeats, R&B' },
      { name: 'origin', label: 'Origin', placeholder: 'Nairobi, Kenya' },
      { name: 'story', label: 'Story & milestones', type: 'textarea', placeholder: 'Achievements, releases, collabs...' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional & formal', 'Conversational & relatable', 'Bold & hype', 'Storytelling & emotive'] },
      { name: 'extra', label: 'Additional prompt', type: 'textarea', placeholder: 'Awards, outlets, brand voice...' }
    ],
    social: [
      { name: 'topic', label: 'Topic', placeholder: 'New single dropping Friday' },
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'X (Twitter)', 'Facebook', 'LinkedIn', 'All platforms'] },
      { name: 'goal', label: 'Goal', type: 'select', options: ['Announce a release', 'Drive engagement', 'Build awareness', 'Promote an event'] },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Hype & bold', 'Warm & personal', 'Professional', 'Fun & casual'] },
      { name: 'extra', label: 'Additional prompt', type: 'textarea', placeholder: 'Emojis, mentions, length, brand voice...' }
    ],
    syncpitch: [
      { name: 'artist', label: 'Artist', placeholder: 'e.g. Amara Diallo' },
      { name: 'track', label: 'Track & genre', placeholder: '"Golden Hour" — Afro-soul' },
      { name: 'target', label: 'Pitching to', type: 'select', options: ['Film / TV supervisor', 'Ad agency creative director', 'Brand marketing team', 'Documentary producer'] },
      { name: 'mood', label: 'Track mood', placeholder: 'cinematic, uplifting, tense' },
      { name: 'extra', label: 'Additional prompt', type: 'textarea', placeholder: 'Specific shows, brands, scenes...' }
    ],
    bizpitch: [
      { name: 'business', label: 'Business name', placeholder: 'e.g. Kali Foods' },
      { name: 'sector', label: 'Sector', placeholder: 'food tech, retail, fintech' },
      { name: 'problem', label: 'Problem solved', type: 'textarea', placeholder: 'Describe the problem...' },
      { name: 'audience', label: 'Pitching to', type: 'select', options: ['Angel investors', 'Bank / microfinance', 'Government grant', 'Corporate partnership', 'Accelerator / incubator'] },
      { name: 'extra', label: 'Additional prompt', type: 'textarea', placeholder: 'Revenue, team, traction, ask amount...' }
    ]
  };

  const fields = TOOL_FIELDS[appId] || [];

  const handleChange = (name, value) => {
    setInputs({ ...inputs, [name]: value });
  };

  const handleGenerate = async () => {
    if (app.cost > 0 && user.credits < app.cost) {
      addToast('Not enough credits', 'Top up in Billing.', 'error');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      const response = await api.post('/api/ai/generate', {
        tool_id: appId,
        inputs: inputs
      });

      setOutput(response.data.content);
      updateUser({ ...user, credits: response.data.credits_remaining });
      addToast('Generated!', `${response.data.credits_used > 0 ? response.data.credits_used + ' credits used.' : 'Free run.'}`, 'success');
      fetchStats();
      fetchActivities();
    } catch (error) {
      const message = error.response?.data?.detail || 'Generation failed. Please try again.';
      setOutput(message);
      addToast('Generation failed', message, 'error');
    }

    setLoading(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    addToast('Copied!', '', 'success');
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appId}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel active tool-panel" data-testid={`tool-panel-${appId}`}>
      <div className="tool-header">
        <span className="tool-icon">
          <FlatIcon name={app.icon} size={28} color={app.color} />
        </span>
        <div className="tool-info">
          <h2>{app.name}</h2>
          <p>{app.desc}</p>
        </div>
      </div>

      <div className="tool-widget">
        <div className="tool-input-section">
          <div className="tool-section-header">
            <h4>Input</h4>
            <div className="tool-credits">
              <Zap size={14} />
              {app.cost > 0 ? `${app.cost} credits` : 'Free'}
            </div>
          </div>

          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label className="form-label">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="form-select"
                  value={inputs[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  data-testid={`input-${field.name}`}
                >
                  <option value="">Select {field.label.toLowerCase()}...</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="form-textarea"
                  placeholder={field.placeholder}
                  value={inputs[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  data-testid={`input-${field.name}`}
                />
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder={field.placeholder}
                  value={inputs[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  data-testid={`input-${field.name}`}
                />
              )}
            </div>
          ))}

          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={loading}
            data-testid="generate-button"
          >
            {loading ? <span className="spinner"></span> : 'Generate →'}
          </button>
        </div>

        <div className="tool-output-section">
          <div className="tool-section-header">
            <h4>Output</h4>
          </div>

          {loading ? (
            <div className="tool-output-loading">
              <span className="spinner"></span>
              Generating...
            </div>
          ) : output ? (
            <>
              <div className="tool-output-content" data-testid="tool-output">{output}</div>
              <div className="tool-output-actions">
                <button className="btn btn-secondary btn-sm" onClick={copyOutput}>
                  <Copy size={14} /> Copy
                </button>
                <button className="btn btn-secondary btn-sm" onClick={downloadOutput}>
                  <Download size={14} /> Download .txt
                </button>
              </div>
            </>
          ) : (
            <div className="tool-output-placeholder">
              Fill in the fields and click Generate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
