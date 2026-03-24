import React from 'react';
import { Link } from 'react-router-dom';

function Footer({ onShowLegal, onToast }) {
  const handleComingSoon = (feature, icon) => {
    if (onToast) {
      onToast(`${feature} coming soon`, '', icon);
    }
  };

  return (
    <footer className="landing-footer" data-testid="landing-footer">
      <div className="cn">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              INTER<span>MAVEN</span>
            </div>
            <div className="footer-desc">
              AI-powered creative and business tools built for Africa's entrepreneurs and artists.
            </div>
            <div className="footer-badges">
              <span className="fbadge">music.intermaven.io</span>
              <span className="fbadge">intermaven.io</span>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <div className="footer-links">
              <Link to="/tools" className="footer-link">AI Tools</Link>
              <Link to="/apps" className="footer-link">App Marketplace</Link>
              <Link to="/pricing" className="footer-link">Pricing</Link>
              <button 
                className="footer-link" 
                onClick={() => handleComingSoon('API docs', '📄')}
              >
                API & Developers
              </button>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              <Link to="/about" className="footer-link">About us</Link>
              <button 
                className="footer-link" 
                onClick={() => handleComingSoon('Blog', '✍')}
              >
                Blog
              </button>
              <button 
                className="footer-link" 
                onClick={() => handleComingSoon('Careers', '💼')}
              >
                Careers
              </button>
              <Link to="/about" className="footer-link">Contact</Link>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Follow us</h4>
            <div className="footer-social">
              <button 
                className="sico" 
                onClick={() => handleComingSoon('Instagram', '📷')}
                aria-label="Instagram"
              >
                📷
              </button>
              <button 
                className="sico" 
                onClick={() => handleComingSoon('X', '𝕏')}
                aria-label="X (Twitter)"
              >
                𝕏
              </button>
              <button 
                className="sico" 
                onClick={() => handleComingSoon('LinkedIn', '💼')}
                aria-label="LinkedIn"
              >
                in
              </button>
              <button 
                className="sico" 
                onClick={() => handleComingSoon('TikTok', '🎵')}
                aria-label="TikTok"
              >
                ▶
              </button>
            </div>
            <div className="footer-copy">
              © 2025 Intermaven Ltd.<br />
              Nairobi, Kenya
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <button className="fbl" onClick={() => onShowLegal && onShowLegal('privacy')}>
              Privacy Policy
            </button>
            <button className="fbl" onClick={() => onShowLegal && onShowLegal('terms')}>
              Terms of Service
            </button>
            <button className="fbl" onClick={() => onShowLegal && onShowLegal('cookies')}>
              Cookie Policy
            </button>
            <button className="fbl" onClick={() => onShowLegal && onShowLegal('refund')}>
              Refund Policy
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--mu2)' }}>
            Made with ❤ in Nairobi
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
