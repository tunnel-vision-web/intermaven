import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, api } from '../App';

function SSOAuthorizePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('Verifying session...');

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const responseType = searchParams.get('response_type');

  useEffect(() => {
    // If not logged in, redirect to login page with this redirect URL in state
    if (!user) {
      const fullRedirectPath = location.pathname + location.search;
      navigate('/auth', { state: { redirect: fullRedirectPath, mode: 'signin' } });
      return;
    }

    // Validate parameters
    if (!clientId || !redirectUri) {
      setError('Missing client_id or redirect_uri parameters.');
      setLoading(false);
      return;
    }

    if (clientId !== 'atltvmount') {
      setError('Invalid client_id. This application is not registered for Single Sign-On.');
      setLoading(false);
      return;
    }

    if (responseType !== 'code') {
      setError('Unsupported response_type. Only code flow is supported.');
      setLoading(false);
      return;
    }

    // Auto-approve first-party partner site
    const performAuthorization = async () => {
      try {
        setStatusText('Authorizing ATL TV Mount PRO...');
        
        const response = await api.post('/api/auth/sso/authorize', {
          client_id: clientId,
          redirect_uri: redirectUri,
          state: state || null,
          code_challenge: codeChallenge || null,
          code_challenge_method: codeChallengeMethod || null
        });

        if (response.data && response.data.redirect_url) {
          setStatusText('Redirecting you back...');
          window.location.href = response.data.redirect_url;
        } else {
          setError('Failed to obtain authorization code from server.');
          setLoading(false);
        }
      } catch (err) {
        console.error('SSO authorization error:', err);
        setError(err.response?.data?.detail || 'An error occurred during authorization.');
        setLoading(false);
      }
    };

    // Minor timeout delay to give a premium transition feel
    const timer = setTimeout(() => {
      performAuthorization();
    }, 800);

    return () => clearTimeout(timer);
  }, [user, clientId, redirectUri, state, codeChallenge, codeChallengeMethod, responseType, navigate, location]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#08090d',
        color: '#f0f0f5',
        fontFamily: 'Inter, sans-serif',
        padding: '24px'
      }}>
        <div style={{
          background: '#0f111a',
          border: '1px solid #ffffff12',
          borderRadius: '3px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '18px', fontWeight: '700' }}>SSO Authorization Error</h2>
          <p style={{ color: '#9096b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#08090d',
      color: '#f0f0f5',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        <div className="loading-logo" style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '0.05em', marginBottom: '24px' }}>
          INTER<span style={{ color: '#10b981' }}>MAVEN</span>
        </div>
        <div style={{
          display: 'inline-block',
          width: '28px',
          height: '28px',
          border: '2px solid #ffffff12',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ color: '#9096b8', fontSize: '14px' }}>{statusText}</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SSOAuthorizePage;
