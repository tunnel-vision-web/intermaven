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
  
  const handleOpenAuth = (appId) => {
    navigate('/auth', { state: { preselectedApp: appId, backgroundPage: page } });
  };
  
  const handleOpenSignIn = () => {
    navigate('/auth', { state: { mode: 'signin', backgroundPage: page } });
  };

  const handleCloseAuth = () => {
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
      const response = await api.post('/api/auth/register', userData);
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      addToast('Account Created!', `Welcome to Intermaven, ${response.data.user.first_name}!`, 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
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
