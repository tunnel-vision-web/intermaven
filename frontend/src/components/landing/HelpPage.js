import React from 'react';

// Richer HelpPage with better structure and more helpful content
const HelpPage = () => {
  const categories = [
    { title: "AI Tools", desc: "Brand Kit, Social Content, Image Generation", icon: "🤖" },
    { title: "Smart CRM", desc: "Campaigns, Contacts, Automation, WhatsApp", icon: "📊" },
    { title: "EPK Builder", desc: "Create, Customize, Publish, Analytics", icon: "🎤" },
    { title: "File Management", desc: "Upload, Organize, Share, Permissions", icon: "📁" },
    { title: "Music Portal", desc: "Releases, Distribution, Analytics, Payouts", icon: "🎵" },
    { title: "Billing & Plans", desc: "Subscriptions, Upgrades, Invoices, Limits", icon: "💳" },
  ];

  return (
    <div className="help-page cn">
      <div className="help-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Help Center</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '620px' }}>
          Find answers, guides, and support for all Intermaven features. Can't find what you need? Contact our team directly.
        </p>
      </div>

      <div className="help-content">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Popular Topics</h2>
        
        <div className="help-categories" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '16px',
          marginBottom: '48px'
        }}>
          {categories.map((cat, index) => (
            <div 
              key={index}
              className="category-card"
              style={{
                background: '#1e2937',
                border: '1px solid #334155',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ fontSize: '28px', lineHeight: 1 }}>{cat.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{cat.title}</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          background: '#1e2937', 
          border: '1px solid #334155', 
          borderRadius: '16px', 
          padding: '28px',
          maxWidth: '720px'
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Still need help?</h3>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
            Our support team typically replies within a few hours on weekdays.
          </p>
          <button 
            onClick={() => window.location.href = '/about'}
            style={{
              background: '#10b981',
              color: '#0f172a',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;