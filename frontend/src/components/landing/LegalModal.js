import React from 'react';

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    body: `Last updated: March 2025

Intermaven Ltd is committed to protecting your personal information.

Data we collect: Name, email, phone number, payment information, and usage data.

How we use it: To provide services, process payments, and personalise your experience.

Data sharing: We do not sell your personal data.

Your rights: Contact privacy@intermaven.io to access, correct, or delete your data.`
  },
  terms: {
    title: 'Terms of Service',
    body: `Last updated: March 2025

Credits are non-refundable once used. Unused free credits expire after 90 days. Paid credits never expire.

Governing law: Laws of Kenya.

Contact: legal@intermaven.io`
  },
  cookies: {
    title: 'Cookie Policy',
    body: 'We use essential cookies for authentication and optional analytics cookies to improve our tools.'
  },
  refund: {
    title: 'Refund Policy',
    body: `Credits are non-refundable except for technical errors or duplicate payments.

Email billing@intermaven.io with your account email and transaction reference.`
  }
};

function LegalModal({ isOpen, legalType, onClose }) {
  if (!isOpen) return null;

  const content = LEGAL_CONTENT[legalType] || { title: 'Policy', body: '' };

  return (
    <div className={`ov ${isOpen ? 'op' : ''}`} data-testid="legal-modal">
      <div className="wiz" style={{ maxWidth: '520px' }}>
        <div className="wh">
          <div className="wl">
            INTER<b>MAVEN</b>
          </div>
          <button className="wx" onClick={onClose} data-testid="legal-close">
            ✕
          </button>
        </div>
        <div className="wb">
          <div className="wti">{content.title}</div>
          <div 
            style={{ 
              fontSize: '13px', 
              color: 'var(--mu)', 
              lineHeight: '1.8', 
              maxHeight: '55vh', 
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}
          >
            {content.body}
          </div>
          <button className="bp" style={{ marginTop: '16px' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
