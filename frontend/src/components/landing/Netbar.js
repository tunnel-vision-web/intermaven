import React from 'react';

// Updated Netbar - active tab now has 0.8 opacity background
const Netbar = ({ portal = 'business', onPortalChange }) => {
  console.log('Netbar rendered with portal =', portal);

  const portals = [
    { key: 'business', label: 'Business', icon: '💼' },
    { key: 'music', label: 'Music', icon: '🎵' },
  ];

  return (
    <div className="netbar" style={{ 
      background: 'transparent', 
      paddingTop: '12px',
      borderBottom: '1px solid #334155'
    }}>
      <div className="netbar-container" style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          background: '#1e2937',
          borderRadius: '8px 8px 0 0',
          padding: '0 4px 0 4px',
          border: '1px solid #334155',
          borderBottom: 'none',
        }}>
          {portals.map((p) => {
            const isActive = portal === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onPortalChange && onPortalChange(p.key)}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#e2e8f0' : '#64748b',
                  // Active tab background with 0.8 opacity
                  background: isActive ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px 6px 0 0',
                  marginRight: '2px',
                  marginBottom: '-1px',
                }}
              >
                <span style={{ fontSize: '15px' }}>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Netbar;