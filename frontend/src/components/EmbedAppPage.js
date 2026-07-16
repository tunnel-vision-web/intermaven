import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, api, setInMemoryToken } from '../App';
import SocialAI from './SocialAI';
import CRMPanel from './CRMPanel';
import EPKBuilder from './EPKBuilder';
import FileManager from './FileManager';
import POSPanel from './POSPanel';
import DistroPanel from './DistroPanel';
import HostingPanel from './HostingPanel';
import StrategyPanel from './wizard/StrategyPanel';
import CMSEditor from './CMSEditor';

function EmbedAppPage() {
  const { appId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [businessProfile, setBusinessProfile] = useState(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    const initSession = async () => {
      let activeToken = token;
      
      if (token) {
        setInMemoryToken(token);
        try {
          localStorage.setItem('token', token);
        } catch (e) {
          console.warn('Iframe localStorage write blocked:', e);
        }
      } else {
        try {
          activeToken = localStorage.getItem('token');
        } catch (e) {
          console.warn('Iframe localStorage read blocked:', e);
        }
      }
      
      if (!activeToken) {
        navigate('/auth', { state: { redirect: window.location.pathname + window.location.search, mode: 'signin' } });
        return;
      }
      
      try {
        // Retrieve and sync user profile to context
        const response = await api.get('/api/auth/me');
        updateUser(response.data);
        
        // If we are loading the brand kit, pre-fetch the business profile
        if (appId === 'brandkit') {
          const bpResponse = await api.get('/api/business-profile');
          setBusinessProfile(bpResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Embed authorization failed:', err);
        try {
          localStorage.removeItem('token');
        } catch (e) {}
        navigate('/auth', { state: { redirect: window.location.pathname + window.location.search, mode: 'signin' } });
      }
    };
    
    initSession();
  }, [token, appId, updateUser, navigate]);

  const handleStrategyChanged = (newStrategy) => {
    setBusinessProfile(prev => prev ? { ...prev, strategy: newStrategy } : null);
  };

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
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#0f111a',
          border: '1px solid #ffffff12',
          borderRadius: '3px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h3 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>Embed Authorization Error</h3>
          <p style={{ color: '#9096b8', fontSize: '13px', lineHeight: '1.6' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#08090d',
        color: '#9096b8',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '2px solid #ffffff12',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginRight: '12px'
        }} />
        Loading App Portal...
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render components without standard dashboard chrome (logo, sidebar)
  return (
    <div className="embed-container" style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0f172a',
      padding: '24px',
      boxSizing: 'border-box',
      overflow: 'auto',
      color: '#f8fafc'
    }}>
      {appId === 'social' && <SocialAI />}
      {appId === 'crm' && <CRMPanel />}
      {appId === 'epk' && <EPKBuilder />}
      {appId === 'filemanager' && <FileManager />}
      {appId === 'pos' && <POSPanel />}
      {appId === 'distro' && <DistroPanel />}
      {appId === 'hosting' && <HostingPanel />}
      {appId === 'cms' && <CMSEditor />}
      {appId === 'brandkit' && (
        <StrategyPanel 
          businessProfile={businessProfile} 
          onStrategyChanged={handleStrategyChanged} 
        />
      )}
      
      {!['social', 'crm', 'epk', 'filemanager', 'pos', 'distro', 'hosting', 'brandkit', 'cms'].includes(appId) && (
        <div style={{
          backgroundColor: '#1e2937',
          borderRadius: '3px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#22d3ee', margin: '0 0 12px 0' }}>{appId.toUpperCase()}</h2>
          <p style={{ margin: 0, color: '#9096b8', fontSize: '14px' }}>Full app interface is ready for embedding.</p>
        </div>
      )}
    </div>
  );
}

export default EmbedAppPage;
