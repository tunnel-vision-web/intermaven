import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, User, Phone, X, Eye, EyeOff } from 'lucide-react';

function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    portal: 'music'
  });

  // Check if we should show sign in or register
  useEffect(() => {
    if (location.state?.mode === 'signin') {
      setIsLogin(true);
    } else if (location.state?.mode === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData);
    }

    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onClose) {
        onClose();
      } else {
        navigate('/');
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleBackdropClick} data-testid="auth-modal-backdrop">
      <div className="auth-modal" data-testid="auth-modal">
        <button 
          className="auth-modal-close" 
          onClick={handleClose}
          data-testid="auth-close-button"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        
        <div className="auth-header">
          <div className="auth-logo">INTER<span>MAVEN</span></div>
        </div>
        
        <div className="auth-body">
          <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to your Intermaven account.' 
              : 'Join African creatives building with Intermaven.'}
          </p>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
              data-testid="login-tab"
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
              data-testid="register-tab"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <div className="form-input-icon">
                      <User className="icon" size={16} />
                      <input
                        type="text"
                        name="first_name"
                        className="form-input"
                        placeholder="Amara"
                        value={formData.first_name}
                        onChange={handleChange}
                        required={!isLogin}
                        data-testid="first-name-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className="form-input"
                      placeholder="Diallo"
                      value={formData.last_name}
                      onChange={handleChange}
                      data-testid="last-name-input"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input-icon">
                <Mail className="icon" size={16} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Phone (M-Pesa & WhatsApp)</label>
                <div className="form-input-icon">
                  <Phone className="icon" size={16} />
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={handleChange}
                    data-testid="phone-input"
                  />
                </div>
                <div className="form-hint">Used for M-Pesa payments and WhatsApp notifications</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon password-field">
                <Lock className="icon" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder={isLogin ? 'Your password' : 'Min 8 characters'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  data-testid="password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Portal</label>
                <select
                  name="portal"
                  className="form-select"
                  value={formData.portal}
                  onChange={handleChange}
                  data-testid="portal-select"
                >
                  <option value="music">Music & Creative</option>
                  <option value="business">Business</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div className="form-group terms-group">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    data-testid="terms-checkbox"
                  />
                  <span>
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                  </span>
                </label>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || (!isLogin && !acceptedTerms)}
              data-testid="submit-button"
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                isLogin ? 'Sign in →' : 'Create account →'
              )}
            </button>
          </form>

          <div className="auth-link">
            {isLogin ? (
              <>Don't have an account? <button onClick={() => setIsLogin(false)}>Get started free</button></>
            ) : (
              <>Already have an account? <button onClick={() => setIsLogin(true)}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
