import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, User, Phone, X, Eye, EyeOff } from 'lucide-react';
import { INTERMAVEN_LOGO } from '../imageRegistry';

function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    portal: 'music'
  });

  // Check if we should show sign in or register
  useEffect(() => {
    console.log('[AuthModal] Mounted on path:', location.pathname);
    if (location.state?.mode === 'signin') {
      console.log('[AuthModal] Setting mode to signin');
      setIsLogin(true);
    } else if (location.state?.mode === 'register') {
      console.log('[AuthModal] Setting mode to register');
      setIsLogin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear password error when typing
    if (name === 'password' || name === 'confirm_password') {
      setPasswordError('');
    }
    // Clear form error when typing
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // #region agent log
    fetch('http://127.0.0.1:7592/ingest/2b858072-d19e-40a8-b4df-586d28188f3b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4d502b'},body:JSON.stringify({sessionId:'4d502b',runId:'pre-fix',hypothesisId:'H1',location:'frontend/src/components/AuthModal.js:handleSubmit:start',message:'Auth submit triggered',data:{isLogin,acceptedTerms,hasFirstName:!!formData.first_name.trim(),hasLastName:!!formData.last_name.trim(),hasEmail:!!formData.email.trim(),passwordLength:formData.password.length,confirmMatches:formData.password===formData.confirm_password,portal:formData.portal},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    // Clear previous errors
    setPasswordError('');
    setFormError('');
    
    // Validate password match on signup
    if (!isLogin) {
      if (!formData.first_name.trim()) {
        setFormError('First name is required');
        return;
      }
      if (!formData.email.trim()) {
        setFormError('Email is required');
        return;
      }
      if (formData.password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setPasswordError('Passwords do not match');
        return;
      }
      if (!acceptedTerms) {
        setFormError('You must accept the Terms of Service and Privacy Policy');
        return;
      }
    } else {
      if (!formData.email.trim()) {
        setFormError('Email is required');
        return;
      }
      if (!formData.password.trim()) {
        setFormError('Password is required');
        return;
      }
    }
    
    setLoading(true);

    let result;
    try {
      if (isLogin) {
        // #region agent log
        fetch('http://127.0.0.1:7592/ingest/2b858072-d19e-40a8-b4df-586d28188f3b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4d502b'},body:JSON.stringify({sessionId:'4d502b',runId:'pre-fix',hypothesisId:'H2',location:'frontend/src/components/AuthModal.js:handleSubmit:login-call',message:'Calling login()',data:{emailDomain:formData.email.includes('@')?formData.email.split('@')[1]:'invalid'},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        result = await login(formData.email, formData.password);
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7592/ingest/2b858072-d19e-40a8-b4df-586d28188f3b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4d502b'},body:JSON.stringify({sessionId:'4d502b',runId:'pre-fix',hypothesisId:'H2',location:'frontend/src/components/AuthModal.js:handleSubmit:register-call',message:'Calling register()',data:{emailDomain:formData.email.includes('@')?formData.email.split('@')[1]:'invalid',hasPhone:!!formData.phone.trim(),portal:formData.portal},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        result = await register(formData);
      }

      // #region agent log
      fetch('http://127.0.0.1:7592/ingest/2b858072-d19e-40a8-b4df-586d28188f3b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4d502b'},body:JSON.stringify({sessionId:'4d502b',runId:'pre-fix',hypothesisId:'H5',location:'frontend/src/components/AuthModal.js:handleSubmit:result',message:'Auth result returned to modal',data:{success:!!result?.success,error:result?.error||null,mode:isLogin?'login':'register'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormError(result.error || (isLogin ? 'Sign in failed' : 'Registration failed'));
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7592/ingest/2b858072-d19e-40a8-b4df-586d28188f3b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4d502b'},body:JSON.stringify({sessionId:'4d502b',runId:'pre-fix',hypothesisId:'H5',location:'frontend/src/components/AuthModal.js:handleSubmit:exception',message:'Unexpected auth exception in modal',data:{errorMessage:error?.message||'unknown'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error('Auth error:', error);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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
          <div className={`auth-logo ${logoLoaded ? 'has-image' : ''}`}>
            {logoLoaded ? (
              <img
                src={INTERMAVEN_LOGO}
                alt="Intermaven"
                className="auth-logo-image"
                onError={() => setLogoLoaded(false)}
              />
            ) : null}
            <span className="auth-logo-text">INTER<span>MAVEN</span></span>
          </div>
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

          {formError && (
            <div className="form-error-banner" data-testid="form-error-banner" style={{
              padding: '10px 12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: 'var(--r)',
              color: '#ff6b6b',
              fontSize: '13px'
            }}>
              {formError}
            </div>
          )}

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
                      required={!isLogin}
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
                  className={`form-input ${passwordError ? 'error' : ''}`}
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
                <label className="form-label">Confirm Password</label>
                <div className="form-input-icon password-field">
                  <Lock className="icon" size={16} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    className={`form-input ${passwordError ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    data-testid="confirm-password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="confirm-password-toggle"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <div className="form-error" data-testid="password-error">{passwordError}</div>
                )}
              </div>
            )}

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
              <>Don't have an account? <button onClick={() => setIsLogin(false)}>Start free</button></>
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
