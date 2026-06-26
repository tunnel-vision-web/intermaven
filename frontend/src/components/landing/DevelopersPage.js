import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Terminal, Shield, Link2, Code } from 'lucide-react';
import '../../styles/landing.css';

function DevelopersPage() {
  return (
    <div className="landing-wrapper">
      <Navbar currentPage="developers" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Developers</div>
          <h1 className="pht">API & Integrations Portal</h1>
          <p className="phs">Mount the Intermaven CRM, AI tools, and EPK builder directly inside your partner applications.</p>
        </div>
      </div>

      <div style={{ padding: '40px 0 80px' }}>
        <div className="cn">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Intro */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              <div style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#10b981' }}>
                  <Shield size={18} />
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>SSO Auth Flow</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  Securely authorize partner platform accounts using Intermaven's Single Sign-On query flows.
                </p>
              </div>
              <div style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#22d3ee' }}>
                  <Terminal size={18} />
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>REST API Endpoints</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  Retrieve public EPK listings, query credit costs, and inject leads directly into your Smart CRM dashboard.
                </p>
              </div>
              <div style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#c084fc' }}>
                  <Link2 size={18} />
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>Webhooks</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  Receive real-time notifications for new EPK views, WhatsApp contact signups, and credit transaction status.
                </p>
              </div>
            </div>

            {/* API Reference */}
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>API Quickstart Guide</h2>
            <div style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '16px', padding: '32px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>Authentication</h3>
              <p style={{ margin: '0 0 16px' }}>
                All API requests must contain a valid Bearer Token in the authorization header:
              </p>
              <pre style={{ background: '#08090d', padding: '14px 18px', borderRadius: '8px', border: '1px solid #1e2937', overflowX: 'auto', fontSize: '13px', color: '#a2a7cb', fontFamily: 'monospace', marginBottom: '24px' }}>
                {"Authorization: Bearer YOUR_API_KEY"}
              </pre>

              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '24px 0 8px' }}>Endpoint: Retrieve Public EPK Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ background: '#10b981', color: '#0f172a', padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>GET</span>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0' }}>https://api.intermaven.io/api/epk/public/{`{username}`}</span>
              </div>
              <p style={{ margin: '0 0 16px' }}>
                Returns design details, press quotes, social links, and bio sheets for the specified user profile.
              </p>
              
              <h4 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, margin: '16px 0 6px' }}>Code Example (cURL)</h4>
              <pre style={{ background: '#08090d', padding: '14px 18px', borderRadius: '8px', border: '1px solid #1e2937', overflowX: 'auto', fontSize: '13px', color: '#a2a7cb', fontFamily: 'monospace', marginBottom: '24px', lineHeight: 1.5 }}>
{`curl -X GET \\
  https://api.intermaven.io/api/epk/public/amara_music \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </pre>

              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '28px 0 8px' }}>Endpoint: Inject CRM Contact Lead</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>POST</span>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0' }}>https://api.intermaven.io/api/crm/contact</span>
              </div>
              <p style={{ margin: '0 0 16px' }}>
                Programmatically inject new contact leads into your Intermaven CRM and trigger immediate automated welcome campaigns.
              </p>
              
              <h4 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, margin: '16px 0 6px' }}>Request Body (JSON)</h4>
              <pre style={{ background: '#08090d', padding: '14px 18px', borderRadius: '8px', border: '1px solid #1e2937', overflowX: 'auto', fontSize: '13px', color: '#a2a7cb', fontFamily: 'monospace', marginBottom: '0', lineHeight: 1.5 }}>
{`{
  "email": "lead@partner.com",
  "first_name": "Juma",
  "last_name": "Onyango",
  "phone": "+254712345678",
  "tags": ["partner_integration", "nairobi_biz"]
}`}
              </pre>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default DevelopersPage;
