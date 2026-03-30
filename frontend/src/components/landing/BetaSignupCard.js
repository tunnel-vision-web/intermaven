import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Check } from 'lucide-react';

const BETA_APPS = {
  epk: {
    id: 'epk',
    name: 'EPK Kit Generator',
    icon: '📁',
    color: '#6b5b95',
    desc: 'Create professional electronic press kits for labels, bookers, and media outlets.',
    portal: 'music'
  },
  lead_gen: {
    id: 'lead_gen',
    name: 'Lead Generation AI',
    icon: '🎯',
    color: '#5b7795',
    desc: 'AI-powered lead generation and prospecting for your creative business.',
    portal: 'both'
  },
  pos: {
    id: 'pos',
    name: 'Intermaven POS',
    icon: '💳',
    color: '#4a7c59',
    desc: 'Point of sale system with M-Pesa integration for Nairobi SMEs.',
    portal: 'business'
  }
};

function BetaSignupCard({ appId, onToast }) {
  const app = BETA_APPS[appId];
  const [channel, setChannel] = useState('email');
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!app) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactValue.trim()) return;

    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      const payload = {
        app_id: appId,
        preferred_channel: channel,
        portal: app.portal
      };

      if (channel === 'email') {
        payload.email = contactValue;
      } else {
        payload.phone = contactValue;
      }

      const response = await fetch(`${API_URL}/api/beta/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
        onToast('Joined waitlist!', `We'll notify you when ${app.name} launches.`, 'success');
      } else {
        const data = await response.json();
        onToast('Signup failed', data.detail || 'Please try again.', 'error');
      }
    } catch (error) {
      onToast('Signup failed', 'Please try again later.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="beta-card" data-testid={`beta-card-${appId}`}>
      <div className="apacc" style={{ background: app.color }} />
      
      <div className="aph2">
        <div className="apiw" style={{ background: `${app.color}20` }}>
          {app.icon}
        </div>
        <span className="beta-badge">
          <span className="beta-badge-dot" />
          Coming Soon
        </span>
      </div>
      
      <h3>{app.name}</h3>
      <p>{app.desc}</p>

      {success ? (
        <div className="beta-success" data-testid={`beta-success-${appId}`}>
          <Check size={18} />
          <span>You're on the waitlist! We'll notify you when it launches.</span>
        </div>
      ) : (
        <>
          <span className="beta-notify-label">How should we notify you?</span>
          
          <div className="beta-channel-options">
            <button
              type="button"
              className={`beta-channel-btn ${channel === 'email' ? 'active' : ''}`}
              onClick={() => setChannel('email')}
              data-testid={`beta-channel-email-${appId}`}
            >
              <Mail size={14} /> Email
            </button>
            <button
              type="button"
              className={`beta-channel-btn ${channel === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setChannel('whatsapp')}
              data-testid={`beta-channel-whatsapp-${appId}`}
            >
              <MessageCircle size={14} /> WhatsApp
            </button>
            <button
              type="button"
              className={`beta-channel-btn ${channel === 'sms' ? 'active' : ''}`}
              onClick={() => setChannel('sms')}
              data-testid={`beta-channel-sms-${appId}`}
            >
              <Phone size={14} /> SMS
            </button>
          </div>

          <form className="beta-form" onSubmit={handleSubmit}>
            <input
              type={channel === 'email' ? 'email' : 'tel'}
              placeholder={channel === 'email' ? 'you@example.com' : '+254 7XX XXX XXX'}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              required
              data-testid={`beta-input-${appId}`}
            />
            <button 
              type="submit" 
              disabled={loading}
              data-testid={`beta-submit-${appId}`}
            >
              {loading ? 'Joining...' : 'Join Waitlist →'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export { BETA_APPS };
export default BetaSignupCard;
