import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import { LandingLayout } from './components/landing';

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

// Wrapper component to use navigate hook
function LandingWrapper({ page, addToast }) {
  const navigate = useNavigate();
  
  const handleOpenAuth = (appId) => {
    navigate('/auth', { state: { preselectedApp: appId } });
  };
  
  const handleOpenSignIn = () => {
    navigate('/auth', { state: { mode: 'signin' } });
  };
  
  return (
    <LandingLayout 
      page={page}
      onOpenAuth={handleOpenAuth}
      onOpenSignIn={handleOpenSignIn}
      addToast={addToast}
    />
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
            {/* Auth Route */}
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
            />
            
            {/* Dashboard Route */}
            <Route 
              path="/dashboard/*" 
              element={user ? <Dashboard /> : <Navigate to="/auth" />} 
            />
            
            {/* Landing Pages - if logged in, redirect to dashboard from home only */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWrapper page="home" addToast={addToast} />} 
            />
            <Route 
              path="/tools" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWrapper page="tools" addToast={addToast} />} 
            />
            <Route 
              path="/apps" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWrapper page="apps" addToast={addToast} />} 
            />
            <Route 
              path="/pricing" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWrapper page="pricing" addToast={addToast} />} 
            />
            <Route 
              path="/about" 
              element={user ? <Navigate to="/dashboard" /> : <LandingWrapper page="about" addToast={addToast} />} 
            />
          </Routes>
        </Router>
        <Toast toasts={toasts} />
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
