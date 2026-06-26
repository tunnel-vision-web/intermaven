import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

function CookiesPage() {
  return (
    <div className="landing-wrapper">
      <Navbar currentPage="cookies" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Legal</div>
          <h1 className="pht">Cookie Policy</h1>
          <p className="phs">Last updated: December 2025</p>
        </div>
      </div>

      <div className="legal-page" style={{ padding: '40px 0 80px' }}>
        <div className="cn">
          <div className="legal-content" style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '16px', padding: '32px', color: '#cbd5e1', lineHeight: '1.8' }}>
            <p style={{ fontSize: '16px', color: '#fff', marginBottom: '24px', fontWeight: 500 }}>
              This Cookie Policy explains how Intermaven Ltd uses cookies and similar tracking technologies when you use our platform.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide reporting information.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>2. How We Use Cookies</h2>
            <p>
              We use both session cookies (which expire once you close your web browser) and persistent cookies (which stay on your device until you delete them or they expire) to provide you with a more personal and interactive experience.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>3. Types of Cookies We Use</h2>
            
            <h3 style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600, marginTop: '20px', marginBottom: '8px' }}>3.1 Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as access to secure areas (like the developer dashboard). They cannot be turned off as the platform will not function properly without them.
            </p>
            <ul>
              <li><strong>Authentication:</strong> We use local storage tokens and session cookies to keep you signed in.</li>
              <li><strong>Security:</strong> We use cookies to prevent Cross-Site Request Forgery (CSRF) attacks.</li>
            </ul>

            <h3 style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600, marginTop: '20px', marginBottom: '8px' }}>3.2 Analytics and Performance Cookies</h3>
            <p>
              These cookies are used to collect information about traffic to our platform and how users use it. The information is aggregated and anonymous and does not identify any individual visitor. It helps us improve how our platform works.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>4. Managing Your Cookie Preferences</h2>
            <p>
              Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove or reject cookies, this could affect certain features or services of our platform.
            </p>

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--b1)' }}>
              <Link to="/" className="hbp" style={{ textDecoration: 'none', background: '#10b981', color: '#0f172a', padding: '10px 20px', borderRadius: '9999px', fontWeight: 600 }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CookiesPage;
