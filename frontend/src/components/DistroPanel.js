import React, { useState, useEffect } from 'react';
import { api } from '../App';
import { 
  Music, Activity, CloudLightning, ShieldAlert, CheckCircle, 
  Clock, Plus, ListMusic, Globe, AlertTriangle 
} from 'lucide-react';

export default function DistroPanel() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // 'list' | 'new'
  
  // New release state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [upc, setUpc] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [platforms, setPlatforms] = useState(['spotify', 'apple', 'youtube']);
  const [submitting, setSubmitting] = useState(false);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/distro/releases');
      setReleases(response.data.releases || []);
    } catch (err) {
      console.error('Error fetching distributions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleTogglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleCreateRelease = async (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !releaseDate) {
      alert('Please fill in release title, artist name, and target date.');
      return;
    }
    if (platforms.length === 0) {
      alert('Please select at least one distribution platform.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/api/distro/releases', {
        title,
        artist,
        upc,
        release_date: releaseDate,
        platforms
      });
      if (response.data.success) {
        setTitle('');
        setArtist('');
        setUpc('');
        setReleaseDate('');
        setPlatforms(['spotify', 'apple', 'youtube']);
        setMode('list');
        fetchReleases();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Error registering release.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      live: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: CheckCircle, label: 'Live' },
      scheduled: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', icon: Clock, label: 'Scheduled' },
      pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: Clock, label: 'Pending' },
      action_required: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', icon: AlertTriangle, label: 'Action Required' }
    };
    
    const config = styles[status] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', icon: Clock, label: status };
    const Icon = config.icon;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: config.bg,
        color: config.color,
        padding: '3px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="#0ea5e9" size={24} />
            Distribution Tracker
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Monitor release dispatch schedules, ingest status, and live store indicators across DSP channels.
          </p>
        </div>
        <div>
          {mode === 'list' ? (
            <button
              onClick={() => setMode('new')}
              style={{
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '3px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Track New Release
            </button>
          ) : (
            <button
              onClick={() => setMode('list')}
              style={{
                background: 'transparent',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '8px 16px',
                borderRadius: '3px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ListMusic size={16} />
              Releases List
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(14, 165, 233, 0.1)',
            borderTop: '3px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : mode === 'list' ? (
        /* List Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {releases.map((rel) => (
            <div 
              key={rel.id} 
              style={{ 
                background: '#111827', 
                border: '1px solid #1e293b', 
                borderRadius: '3px', 
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr',
                gap: '24px'
              }}
            >
              {/* Left Column: Cover & Details */}
              <div style={{ borderRight: '1px solid #1e293b', paddingRight: '24px', display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <Music size={36} color="#475569" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>
                    {rel.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px' }}>
                    {rel.artist}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#94a3b8' }}>
                    <span>UPC: {rel.upc || 'Pending'}</span>
                    <span>Release: {rel.release_date}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform Statuses */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', margin: '0 0 4px' }}>
                  Platform Ingestion Tracker
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {rel.platforms.map((p) => {
                    const status = rel.status[p] || 'pending';
                    const iconMap = {
                      spotify: '🟢 Spotify',
                      apple: '🍎 Apple Music',
                      youtube: '🔴 YouTube Music',
                      amazon: '🔵 Amazon Music'
                    };
                    return (
                      <div 
                        key={p} 
                        style={{ 
                          background: '#1f2937', 
                          border: '1px solid #374151', 
                          borderRadius: '3px', 
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>
                          {iconMap[p] || p.toUpperCase()}
                        </span>
                        {getStatusBadge(status)}
                      </div>
                    );
                  })}
                </div>
                
                {/* Specific Action Alerts */}
                {Object.values(rel.status).includes('action_required') && (
                  <div style={{ 
                    marginTop: '8px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    borderRadius: '3px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: '#ef4444'
                  }}>
                    <ShieldAlert size={14} />
                    <span>Metadata flag encountered on Amazon Music. Please check ISRC allocations or contact Support.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Create Mode Form */
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '3px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#f1f5f9' }}>
            Register New Release for Dispatch Tracking
          </h3>
          <form onSubmit={handleCreateRelease} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Release Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Neon Horizon EP"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Primary Artist Name *
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="E.g. DJ Tunez"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  UPC / Barcode (Optional)
                </label>
                <input
                  type="text"
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  placeholder="Leave empty to auto-generate"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Release Date *
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
                Target Distribution Channels
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { id: 'spotify', label: '🟢 Spotify' },
                  { id: 'apple', label: '🍎 Apple Music' },
                  { id: 'youtube', label: '🔴 YouTube Music' },
                  { id: 'amazon', label: '🔵 Amazon Music' }
                ].map((item) => {
                  const active = platforms.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTogglePlatform(item.id)}
                      style={{
                        background: active ? '#0ea5e9' : '#1f2937',
                        color: active ? '#fff' : '#cbd5e1',
                        border: active ? '1px solid #0ea5e9' : '1px solid #374151',
                        borderRadius: '3px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background 0.2s'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#10b981',
                color: '#0f172a',
                border: 'none',
                borderRadius: '3px',
                padding: '14px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} />
              {submitting ? 'Registering release...' : 'Submit Release for Distribution'}
            </button>
          </form>
        </div>
      )}

      {/* Inline styles for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
