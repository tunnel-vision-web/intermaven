/**
 * ChannelStatusStrip — thin status bar shown at the top of the Advanced
 * settings view inside an app. Tells the user whether their target channel
 * is connected; clicking routes them to the Channels hub.
 *
 * appChannels: array of channel ids that are relevant for this app
 *   e.g. social → ['instagram','facebook','tiktok','x','linkedin','youtube','threads']
 */
import React, { useEffect, useState } from 'react';
import { api } from '../../App';
import { Check, AlertCircle, Plug } from 'lucide-react';

export default function ChannelStatusStrip({ appChannels = [], onGoToChannels }) {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    api.get('/api/channels').then(r => setChannels(r.data?.channels || [])).catch(() => {});
  }, []);

  const relevant = channels.filter(c => appChannels.includes(c.id));
  if (relevant.length === 0) return null;
  const connected = relevant.filter(c => c.connected);
  const missing = relevant.filter(c => !c.connected);

  return (
    <div data-testid="channel-status-strip" style={{
      marginBottom: 14, padding: '8px 14px',
      background: missing.length === 0 ? '#10b98111' : '#f59e0b11',
      border: `1px solid ${missing.length === 0 ? '#10b98166' : '#f59e0b66'}`,
      borderRadius: '3px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#cbd5e1' }}>
        {missing.length === 0 ? <Check size={14} color="#10b981" /> : <AlertCircle size={14} color="#f59e0b" />}
        {missing.length === 0 ? (
          <span><strong style={{ color: '#10b981' }}>Posting to:</strong> {connected.map(c => c.identifier || c.name).join(', ')}</span>
        ) : (
          <span>
            <strong style={{ color: '#f59e0b' }}>Not connected:</strong> {missing.map(c => c.name).join(', ')}
            {connected.length > 0 && <span style={{ color: '#94a3b8' }}> · Connected: {connected.map(c => c.name).join(', ')}</span>}
          </span>
        )}
      </div>
      <button onClick={onGoToChannels} data-testid="strip-go-channels-btn"
        style={{ background: 'transparent', border: '1px solid #334155', color: '#22d3ee', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Plug size={10} /> {missing.length === 0 ? 'Manage' : 'Connect'}
      </button>
    </div>
  );
}
