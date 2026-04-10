import React, { useState } from 'react';
import { useAuth } from '../App';
import { Mail, Lock, User, Phone } from 'lucide-react';

function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    portal: 'music'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-container">
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
              <div className="form-input-icon">
                <Lock className="icon" size={16} />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder={isLogin ? 'Your password' : 'Min 8 characters'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  data-testid="password-input"
                />
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

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
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

export default AuthPage;
