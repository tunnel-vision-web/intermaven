import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

function PrivacyPage() {
  return (
    <div className="landing-wrapper">
      <Navbar currentPage="privacy" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Legal</div>
          <h1 className="pht">Privacy Policy</h1>
          <p className="phs">Last updated: December 2025</p>
        </div>
      </div>

      <div className="legal-page">
        <div className="cn">
          <div className="legal-content" data-testid="privacy-content">
            <p className="legal-meta">
              At Intermaven, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>1.1 Personal Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Name (first and last)</li>
              <li>Email address</li>
              <li>Phone number (for M-Pesa payments and WhatsApp notifications)</li>
              <li>Portal preference (Music or Business)</li>
            </ul>

            <h3>1.2 Usage Data</h3>
            <p>We automatically collect information about your use of our platform:</p>
            <ul>
              <li>AI tools used and inputs provided</li>
              <li>Generated content (stored for your library)</li>
              <li>Credit consumption and transaction history</li>
              <li>Login times and IP addresses</li>
              <li>Device and browser information</li>
            </ul>

            <h3>1.3 AI Inputs and Outputs</h3>
            <p>
              We collect the information you provide to our AI tools and the content generated. This is necessary to provide our services and improve your experience.
            </p>

            <h2>2. How We Use Your Information</h2>
            <h3>2.1 Service Provision</h3>
            <p>We use your information to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Process AI generations using your inputs</li>
              <li>Store your AI outputs in your library</li>
              <li>Process payments and manage credits</li>
              <li>Provide customer support</li>
            </ul>

            <h3>2.2 Communication</h3>
            <p>We may contact you for:</p>
            <ul>
              <li>Service updates and important notifications</li>
              <li>Marketing communications (with your consent)</li>
              <li>Newsletter updates (if subscribed)</li>
              <li>Support responses</li>
            </ul>

            <h3>2.3 Service Improvement</h3>
            <p>
              We analyze usage patterns to improve our AI tools, develop new features, and enhance user experience. This analysis is performed on aggregated, anonymized data where possible.
            </p>

            <h2>3. Data Sharing</h2>
            <h3>3.1 Third-Party Services</h3>
            <p>We share data with trusted third parties to provide our services:</p>
            <ul>
              <li><strong>Anthropic (Claude AI):</strong> AI content generation</li>
              <li><strong>Pesapal:</strong> Payment processing</li>
              <li><strong>MongoDB (Railway):</strong> Data storage</li>
              <li><strong>Twilio:</strong> WhatsApp and SMS notifications</li>
            </ul>

            <h3>3.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, legal process, or government request, or to protect our rights, privacy, safety, or property.
            </p>

            <h3>3.3 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>

            <h2>4. Data Security</h2>
            <h3>4.1 Encryption</h3>
            <p>
              All data transmitted between your device and our servers is encrypted using TLS/SSL. Sensitive data such as passwords are hashed using industry-standard algorithms.
            </p>

            <h3>4.2 Access Controls</h3>
            <p>
              Access to your personal data is restricted to authorized personnel who need it to perform their duties. We implement role-based access controls and audit logs.
            </p>

            <h3>4.3 Incident Response</h3>
            <p>
              We have procedures in place to handle data breaches. In the event of a breach affecting your data, we will notify you as required by law.
            </p>

            <h2>5. Your Rights</h2>
            <h3>5.1 Access</h3>
            <p>
              You can access your personal information through your account dashboard. You can also request a copy of all data we hold about you.
            </p>

            <h3>5.2 Correction</h3>
            <p>
              You can update your profile information at any time through your account settings. Contact us for corrections to other data.
            </p>

            <h3>5.3 Deletion</h3>
            <p>
              You can request deletion of your account and associated data. Some information may be retained for legal compliance or legitimate business purposes.
            </p>

            <h3>5.4 Data Portability</h3>
            <p>
              You can export your AI-generated content from your library at any time. Contact us for a full data export.
            </p>

            <h3>5.5 Opt-Out</h3>
            <p>
              You can opt out of marketing communications at any time through your notification settings or by clicking unsubscribe in our emails.
            </p>

            <h2>6. Cookies</h2>
            <h3>6.1 Essential Cookies</h3>
            <p>
              We use essential cookies to maintain your session and authentication. These are necessary for the platform to function.
            </p>

            <h3>6.2 Analytics</h3>
            <p>
              We may use analytics cookies to understand how users interact with our platform. This helps us improve our services.
            </p>

            <h3>6.3 Managing Cookies</h3>
            <p>
              You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance, dispute resolution, or fraud prevention.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we learn we have collected data from a child, we will delete it promptly.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your data may be processed in countries other than Kenya. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses where applicable.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the platform. The date at the top indicates when the policy was last updated.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For privacy-related inquiries or to exercise your rights, contact us at:
            </p>
            <ul>
              <li>Email: privacy@intermaven.io</li>
              <li>Data Protection Officer: dpo@intermaven.io</li>
              <li>Address: Nairobi, Kenya</li>
            </ul>

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--b1)' }}>
              <Link to="/" className="hbp" style={{ textDecoration: 'none' }}>
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

export default PrivacyPage;
