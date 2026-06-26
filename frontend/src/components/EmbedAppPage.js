import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth, api } from '../App';
import SocialAI from './SocialAI';
import CRMPanel from './CRMPanel';
import EPKBuilder from './EPKBuilder';
import FileManager from './FileManager';

function EmbedAppPage() {
  const { appId } = useParams();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const initSession = async () => {
      if (token) {
        localStorage.setItem('token', token);
      }
      
      const activeToken = localStorage.getItem('token');
      if (!activeToken) {
        setError('Authorization token is missing. Access denied.');
        setLoading(false);
        return;
      }
      
      try {
        // Retrieve and sync user profile to context
        const response = await api.get('/api/auth/me');
        updateUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Embed authorization failed:', err);
        setError('Failed to authorize partner session. Invalid or expired token.');
        setLoading(false);
      }
    };
    
    initSession();
  }, [token, updateUser]);

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
      
      {!['social', 'crm', 'epk', 'filemanager'].includes(appId) && (
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
