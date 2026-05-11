import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Home, Zap, Users, FileText, HardDrive, Settings, LogOut,
  Palette, Music, Share2, Film, Presentation 
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

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoClick = () => navigate('/');
  const toggleCollapse = () => setCollapsed(!collapsed);

  const openApp = (appId) => {
    console.log('%c🚀 APP CARD CLICKED → Loading: ' + appId, 'background:#22d3ee;color:#0f172a;font-weight:bold;padding:4px 8px;border-radius:4px');
    setActivePanel(appId);
  };

  const sidebarWidth = collapsed ? '70px' : '20%';
  const currentPlan = user?.plan || 'free';
  const creditsUsed = 45;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      
      {/* TOP LOGO BAR */}
      <div style={{ width: '100%', height: '70px', backgroundColor: '#1e2937', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <img src="/images/logos/intermaven/intermaven-logo-web.png" alt="Intermaven" style={{ height: '42px', cursor: 'pointer', maxWidth: '180px' }} onClick={handleLogoClick} />
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
          transition: 'all 0.3s ease' 
        }}>

          <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>
                {user?.name?.[0] || 'U'}
              </div>
              {!collapsed && (
                <div>
                  <div style={{ fontWeight: 600 }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{user?.email}</div>
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
              <div style={{ backgroundColor: '#1e2937', borderRadius: '12px', padding: '28px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                  <Zap size={52} color="#22d3ee" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#e2e8f0' }}>Ready to unlock more power?</h3>
                    <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.6', fontSize: '16px' }}>
                      Upgrade to Creator or Pro plan and get 4× more credits, priority AI processing, and exclusive tools.
                    </p>
                  </div>
                </div>
                <button style={{ marginTop: '24px', backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '16px' }}>
                  Upgrade Now →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#1e2937', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b' }}>Credits Remaining</h4>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: '#22d3ee' }}>{PLAN_CREDITS[currentPlan] - creditsUsed}</div>
                  <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', margin: '16px 0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(((PLAN_CREDITS[currentPlan] - creditsUsed) / PLAN_CREDITS[currentPlan]) * 100)}%`, backgroundColor: '#22d3ee' }} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#1e2937', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b' }}>Quick Launch</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
                    {Object.values(APPS).map(app => (
                      <div key={app.id} onClick={() => openApp(app.id)} style={{ backgroundColor: '#334155', borderRadius: '8px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                        <app.icon size={28} color={app.color} />
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>{app.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#1e2937', borderRadius: '12px', padding: '24px', gridColumn: 'span 2' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#64748b' }}>Recent Activity</h4>
                  <p style={{ color: '#e2e8f0' }}>Your recent generations and activity will appear here.</p>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PANEL */}
          {activePanel === 'settings' && (
            <div style={{ backgroundColor: '#1e2937', borderRadius: '12px', padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
                <button onClick={() => setSettingsTab('profile')} style={{ padding: '12px 28px', background: settingsTab === 'profile' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontWeight: settingsTab === 'profile' ? '600' : '400' }}>
                  Profile
                </button>
                <button onClick={() => setSettingsTab('billing')} style={{ padding: '12px 28px', background: settingsTab === 'billing' ? '#334155' : 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontWeight: settingsTab === 'billing' ? '600' : '400' }}>
                  Billing
                </button>
              </div>

              {settingsTab === 'profile' && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Profile Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>Full Name</label>
                      <input type="text" defaultValue={user?.name || ''} style={{ width: '100%', padding: '12px', background: '#334155', border: 'none', borderRadius: '8px', color: '#e2e8f0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>Email Address</label>
                      <input type="email" defaultValue={user?.email || ''} style={{ width: '100%', padding: '12px', background: '#334155', border: 'none', borderRadius: '8px', color: '#e2e8f0' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>Bio</label>
                    <textarea rows="4" placeholder="Tell us about yourself..." style={{ width: '100%', padding: '12px', background: '#334155', border: 'none', borderRadius: '8px', color: '#e2e8f0', resize: 'vertical' }} />
                  </div>
                  <button style={{ marginTop: '32px', backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: 700 }}>
                    Save Profile Changes
                  </button>
                </div>
              )}

              {settingsTab === 'billing' && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Billing & Subscription</h3>
                  <div style={{ backgroundColor: '#334155', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4>Current Plan</h4>
                        <p style={{ color: '#22d3ee', fontSize: '22px', fontWeight: 700 }}>{currentPlan.toUpperCase()}</p>
                      </div>
                      <button style={{ backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <h4>Payment Method</h4>
                    <div style={{ backgroundColor: '#334155', borderRadius: '12px', padding: '20px' }}>
                      <p>Visa •••• 4242 (expires 12/28)</p>
                      <button style={{ marginTop: '12px', background: 'transparent', border: '1px solid #64748b', color: '#e2e8f0', padding: '8px 20px', borderRadius: '8px' }}>
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
            <div style={{ backgroundColor: '#1e2937', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#e2e8f0', flex: 1, height: '100%' }}>
              <h2 style={{ color: APPS[activePanel].color }}>{APPS[activePanel].name}</h2>
              <p style={{ marginTop: '20px', fontSize: '18px' }}>Full app interface loads here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;