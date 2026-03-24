import React from 'react';

function Netbar({ portal = 'music', onPortalChange }) {
  return (
    <div className="netbar" data-testid="netbar">
      <span className="netlbl">Intermaven</span>
      <button 
        className={`ntab ${portal === 'music' ? 'on' : ''}`}
        onClick={() => onPortalChange('music')}
        data-testid="netbar-music"
      >
        <span className="ndot"></span> music.intermaven.io
      </button>
      <button 
        className={`ntab ${portal === 'business' ? 'on' : ''}`}
        onClick={() => onPortalChange('business')}
        data-testid="netbar-business"
      >
        <span className="ndot"></span> intermaven.io — Business
      </button>
    </div>
  );
}

export default Netbar;
