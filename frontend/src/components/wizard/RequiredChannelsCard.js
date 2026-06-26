/**
 * RequiredChannelsCard — dashboard widget shown on overview when the user
 * has a strategy with channels they haven't connected yet. Click-through
 * routes them to the Channels hub.
 */
import React, { useEffect, useState } from 'react';
import { api } from '../../App';
import { Plug, Check, ChevronRight } from 'lucide-react';

export default function RequiredChannelsCard({ onGoToChannels }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/channels/required').then(r => setData(r.data)).catch(() => setData(null));
  }, []);

  if (!data || data.total === 0) return null;
  const allConnected = data.connected_count === data.total;
  if (allConnected) return null;

  const remaining = data.required.filter(r => !r.connected);

  return (
    <div data-testid="required-channels-card" style={{
      backgroundColor: '#22d3ee11', borderRadius: '3px', padding: '18px 22px', marginBottom: '20px',
      border: '1px solid #22d3ee66', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 280 }}>
        <Plug size={26} color="#22d3ee" />
        <div>
          <div style={{ color: '#22d3ee', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Set up your channels · {data.connected_count}/{data.total} connected
          </div>
          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '15px', marginTop: '4px' }}>
            Connect the channels in your strategy so Intermaven can post & message for you.
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {remaining.map(r => (
              <span key={r.id} style={{ fontSize: 11, padding: '3px 9px', borderRadius: '3px', background: '#0f172a', border: `1px solid ${r.color}66`, color: r.color, fontWeight: 600 }}>
                {r.name}
              </span>
            ))}
            {data.required.filter(r => r.connected).map(r => (
              <span key={r.id} style={{ fontSize: 11, padding: '3px 9px', borderRadius: '3px', background: '#10b98122', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={10} /> {r.name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onGoToChannels} data-testid="go-to-channels-btn"
        style={{ backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Set up channels <ChevronRight size={14} />
      </button>
    </div>
  );
}
