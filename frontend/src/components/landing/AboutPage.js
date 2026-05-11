import React from 'react';

// Expanded AboutPage with richer content and polished contact form
const AboutPage = () => {
  return (
    <div className="about-page cn">
      <div className="about-content">
        <div style={{ maxWidth: '780px', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>About Intermaven</h1>
          <p style={{ fontSize: '17px', color: '#94a3b8', lineHeight: 1.6 }}>
            Intermaven is the complete creative operating system for African musicians, creators, and entrepreneurs. 
            We combine powerful AI tools, smart CRM, professional EPK builder, secure file management, and a full music ecosystem in one beautiful platform.
          </p>
        </div>

        <section className="our-story" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Our Story</h2>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '780px' }}>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
              We built Intermaven because creators in Africa deserve world-class tools that understand their unique challenges — 
              from unreliable power and internet to complex payment systems and limited access to global markets.
            </p>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
              What started as a simple EPK builder in 2024 has grown into a full operating system used by thousands of independent artists, 
              DJs, labels, managers, and creative entrepreneurs across the continent and diaspora.
            </p>
          </div>
        </section>

        <section className="contact-section" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Send Us a Message</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            Have questions, feedback, or partnership ideas? We'd love to hear from you.
          </p>
          
          <div className="contact-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 320px', 
            gap: '32px',
            maxWidth: '920px'
          }}>
            {/* Form */}
            <form className="contact-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Aisha Okoro" 
                  style={{ 
                    width: '100%', 
                    background: '#1e2937', 
                    border: '1px solid #334155', 
                    borderRadius: '10px', 
                    padding: '12px 16px', 
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@artist.com" 
                  style={{ 
                    width: '100%', 
                    background: '#1e2937', 
                    border: '1px solid #334155', 
                    borderRadius: '10px', 
                    padding: '12px 16px', 
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Message</label>
                <textarea 
                  placeholder="Tell us how we can help..." 
                  rows="5"
                  style={{ 
                    width: '100%', 
                    background: '#1e2937', 
                    border: '1px solid #334155', 
                    borderRadius: '10px', 
                    padding: '14px 16px', 
                    color: '#e2e8f0',
                    fontSize: '15px',
                    resize: 'vertical'
                  }} 
                />
              </div>
              <button 
                type="submit"
                style={{
                  alignSelf: 'flex-start',
                  background: '#10b981',
                  color: '#0f172a',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Send Message
              </button>
            </form>

            {/* Contact info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#1e2937', border: '1px solid #334155', borderRadius: '14px', padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>EMAIL US</div>
                <div style={{ fontWeight: 600 }}>hello@intermaven.io</div>
              </div>
              <div style={{ background: '#1e2937', border: '1px solid #334155', borderRadius: '14px', padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>WHATSAPP</div>
                <div style={{ fontWeight: 600 }}>+254 700 000 000</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Mon–Fri, 9am–5pm EAT</div>
              </div>
              <div style={{ background: '#1e2937', border: '1px solid #334155', borderRadius: '14px', padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>BASED IN</div>
                <div style={{ fontWeight: 600 }}>Nairobi, Kenya</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;