import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

function RefundPage() {
  return (
    <div className="landing-wrapper">
      <Navbar currentPage="refund" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Legal</div>
          <h1 className="pht">Refund Policy</h1>
          <p className="phs">Last updated: December 2025</p>
        </div>
      </div>

      <div className="legal-page" style={{ padding: '40px 0 80px' }}>
        <div className="cn">
          <div className="legal-content" style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '16px', padding: '32px', color: '#cbd5e1', lineHeight: '1.8' }}>
            <p style={{ fontSize: '16px', color: '#fff', marginBottom: '24px', fontWeight: 500 }}>
              At Intermaven, we want to ensure you are fully satisfied with our AI tools. This Refund Policy details our guidelines regarding billing and purchase refunds.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>1. General Terms</h2>
            <p>
              Due to the digital nature of AI generations and credit tokens, all credit top-ups (Creator Plan and Pro Plan) are generally non-refundable once purchased. 
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>2. Exceptions and Discretionary Refunds</h2>
            <p>
              We want to be fair. We will issue refunds or credit adjustments in the following scenarios:
            </p>
            <ul>
              <li><strong>Duplicate Payments:</strong> If you are billed twice due to a payment gateway glitch (M-Pesa or Card), we will refund the duplicate transaction within 5 business days.</li>
              <li><strong>Technical Server Failures:</strong> If you purchase credits but they fail to load onto your profile, and our support team cannot manually add them within 24 hours.</li>
              <li><strong>Underlying Generation Failures:</strong> If a tool deducts credits but fails to return any output due to a platform crash, your credits will be automatically refunded to your balance.</li>
            </ul>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '28px', marginBottom: '12px' }}>3. How to Request a Refund</h2>
            <p>
              To request a refund, please send an email to <strong style={{ color: '#10b981' }}>billing@intermaven.io</strong> with:
            </p>
            <ul>
              <li>Your account email address</li>
              <li>Transaction Reference Code (e.g. M-Pesa Receipt Code or Card transaction ID)</li>
              <li>Date and time of purchase</li>
              <li>A short description of the issue encountered</li>
            </ul>

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

export default RefundPage;
