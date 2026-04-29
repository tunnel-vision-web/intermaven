import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import AyoChat from './components/AyoChat';
import { LandingLayout } from './components/landing';
import TermsPage from './components/landing/TermsPage';
import PrivacyPage from './components/landing/PrivacyPage';
import HelpPage from './components/landing/HelpPage';
import ForumPage from './components/landing/ForumPage';
import ArticlePage from './components/landing/ArticlePage';
import AppLandingPage from './components/landing/AppLandingPage';

// Context
const AuthContext = createContext(null);
const ToastContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useToast = () => useContext(ToastContext);

// API Configuration
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };

// Wrapper component for landing pages with optional auth modal
function LandingWithAuth({ page, addToast, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showAuth = location.pathname === '/auth';
  
  console.log('[LandingWithAuth] Rendered - pathname:', location.pathname, 'showAuth:', showAuth, 'user:', user);
  
  const handleOpenAuth = (appId) => {
    console.log('[LandingWithAuth] handleOpenAuth called with appId:', appId);
    navigate('/auth', { state: { preselectedApp: appId, backgroundPage: page } });
  };
  
  const handleOpenSignIn = () => {
    console.log('[LandingWithAuth] handleOpenSignIn called');
    navigate('/auth', { state: { mode: 'signin', backgroundPage: page } });
  };

  const handleCloseAuth = () => {
    console.log('[LandingWithAuth] handleCloseAuth called');
    // Go back to the previous page or home
    const bgPage = location.state?.backgroundPage || 'home';
    const pageMap = {
      home: '/',
      tools: '/tools',
      apps: '/apps',
      pricing: '/pricing',
      about: '/about'
    };
    navigate(pageMap[bgPage] || '/');
  };
  
  return (
    <>
      <LandingLayout 
        page={page}
        onOpenAuth={handleOpenAuth}
        onOpenSignIn={handleOpenSignIn}
        addToast={addToast}
      />
      {showAuth && !user && <AuthModal onClose={handleCloseAuth} />}
    </>
  );
}

// EPK Public Page — renders artist EPK by username
function EPKPublicPage() {
  const { username } = require('react-router-dom').useParams();
  const [epk, setEpk] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    api.get(`/api/epk/public/${username}`)
      .then(r => { setEpk(r.data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08090d', color: '#9096b8', fontSize: 14 }}>Loading...</div>;
  if (notFound || !epk) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08090d', color: '#9096b8', fontSize: 14 }}>EPK not found</div>;

  const color = epk.design?.primary_color || '#10b981';

  return (
    <div style={{ background: '#08090d', minHeight: '100vh', color: '#f0f0f5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${color}33, #0f1117)`, padding: '60px 24px 40px', textAlign: 'center', borderBottom: '1px solid #ffffff12' }}>
        <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>{epk.artist_name}</div>
        {epk.tagline && <div style={{ fontSize: 16, color: '#9096b8', marginBottom: 12 }}>{epk.tagline}</div>}
        {epk.location && <div style={{ fontSize: 13, color: '#555870' }}>📍 {epk.location}</div>}
        {epk.genres?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            {epk.genres.map(g => <span key={g} style={{ padding: '3px 10px', background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 20, fontSize: 12, color }}>{g}</span>)}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        {/* Bio */}
        {epk.bio_short && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>About</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#c8cce8' }}>{epk.bio_full || epk.bio_short}</p>
          </div>
        )}

        {/* Press quotes */}
        {epk.press_quotes?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Press</h2>
            {epk.press_quotes.map((q, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontStyle: 'italic', color: '#c8cce8', marginBottom: 4 }}>"{q.quote}"</p>
                <span style={{ fontSize: 12, color: '#555870' }}>{q.source}{q.date ? ` · ${q.date}` : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Events */}
        {epk.events_upcoming?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Upcoming Shows</h2>
            {epk.events_upcoming.map((ev, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ffffff12' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ev.venue}</div>
                  <div style={{ fontSize: 12, color: '#555870' }}>{ev.city}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#9096b8' }}>{ev.date}</div>
                  {ev.ticket_url && <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color }}> Tickets →</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Socials */}
        {Object.values(epk.social_links || {}).some(Boolean) && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Follow</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(epk.social_links || {}).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 20, fontSize: 12, color, textDecoration: 'none' }}>
                  {k.charAt(0).toUpperCase() + k.slice(1)} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {epk.contact?.booking_email && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Contact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {epk.contact.booking_email && <div style={{ fontSize: 13 }}>📩 Booking: <a href={`mailto:${epk.contact.booking_email}`} style={{ color }}>{epk.contact.booking_email}</a></div>}
              {epk.contact.press_email && <div style={{ fontSize: 13 }}>📰 Press: <a href={`mailto:${epk.contact.press_email}`} style={{ color }}>{epk.contact.press_email}</a></div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #ffffff12', fontSize: 12, color: '#555870' }}>
        Powered by <a href="https://intermaven.io" style={{ color: '#9096b8' }}>Intermaven</a>
      </div>
    </div>
  );
}

function AppLandingRoute({ appId }) {
  const navigate = useNavigate();
  const handleOpenAuth = () => navigate('/auth');

  return <AppLandingPage appId={appId} onOpenAuth={handleOpenAuth} />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message = '', type = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      addToast('Welcome back!', `Signed in as ${response.data.user.first_name}`, 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      addToast('Login Failed', message, 'error');
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('[App] register called with:', { email: userData.email, first_name: userData.first_name });
      const response = await api.post('/api/auth/register', userData);
      console.log('[App] register successful, user:', response.data.user);
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      addToast('Account Created!', `Welcome to Intermaven, ${response.data.user.first_name}!`, 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      console.error('[App] register failed:', message, error);
      addToast('Registration Failed', message, 'error');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    addToast('Signed out', 'See you next time!', '');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">INTER<span>MAVEN</span></div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      <ToastContext.Provider value={{ addToast }}>
        <Router>
          <Routes>
            {/* Dashboard Route */}
            <Route 
              path="/dashboard/*" 
              element={user ? <Dashboard /> : <Navigate to="/auth" />} 
            />
            
            {/* Auth Route - shows modal over home page */}
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWithAuth page="home" addToast={addToast} user={user} />} 
            />
            
            {/* Landing Pages */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWithAuth page="home" addToast={addToast} user={user} />} 
            />
            <Route 
              path="/tools" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWithAuth page="tools" addToast={addToast} user={user} />} 
            />
            <Route 
              path="/apps" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWithAuth page="apps" addToast={addToast} user={user} />} 
            />
            <Route 
              path="/pricing" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWithAuth page="pricing" addToast={addToast} user={user} />} 
            />
            <Route 
              path="/about" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWithAuth page="about" addToast={addToast} user={user} />} 
            />
            
            {/* Legal Pages */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/help" element={<HelpPage addToast={addToast} />} />
            <Route path="/help/article/:slug" element={<ArticlePage />} />
            <Route path="/forum" element={<ForumPage addToast={addToast} />} />
            
            {/* App Landing Pages */}
            {['brandkit', 'musicbio', 'social', 'syncpitch', 'bizpitch', 'smartcrm'].map(appId => (
              <Route
                key={appId}
                path={`/${appId}`}
                element={
                  user
                    ? <Navigate to="/dashboard" />
                    : <AppLandingRoute appId={appId} />
                }
              />
            ))}
            
            {/* EPK Public Page */}
            <Route path="/artist/:username" element={<EPKPublicPage />} />
          </Routes>
          
          {/* Ayo Chat Assistant - shows on all pages */}
          <AyoChat currentPage={window.location.pathname.split('/')[1] || 'homepage'} isLoggedIn={!!user} />
        </Router>
        <Toast toasts={toasts} />
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
