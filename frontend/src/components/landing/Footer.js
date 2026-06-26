import React from 'react';
import { Link } from 'react-router-dom';
import { useRegion } from '../../RegionContext';
import { useCms } from '../../cms/CmsContext';
import { INTERMAVEN_LOGO_FOOTER } from '../../imageRegistry';

function Footer({ onShowLegal, onToast }) {
  const { country } = useRegion();
  const isWestern = ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'FI', 'DK', 'AT', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR'].includes(country?.toUpperCase());
  // Mother-CMS lookups — region-aware, admin-editable
  const cmsAddress = useCms('footer.contact.address', isWestern ? 'Atlanta, USA' : 'Nairobi, Kenya');
  const cmsTagline = useCms('footer.tagline', isWestern ? 'Made with ❤ in Atlanta' : 'Made with ❤ in Nairobi');
  const cmsPhone = useCms('footer.contact.phone', null);

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
              <img src={INTERMAVEN_LOGO_FOOTER} alt="Intermaven" className="footer-logo-image" />
            </div>
            <div className="footer-desc">
              {isWestern 
                ? "AI-powered creative and business tools built for independent entrepreneurs and artists."
                : "AI-powered creative and business tools built for Africa's entrepreneurs and artists."}
            </div>
            <div className="footer-badges">
              <span className="fbadge">tunemavens.com</span>
              <span className="fbadge">intermaven.io</span>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <div className="footer-links">
              <Link to="/tools" className="footer-link">AI Tools</Link>
              <Link to="/apps" className="footer-link">App Marketplace</Link>
              <Link to="/pricing" className="footer-link">Pricing</Link>
              <Link to="/developers" className="footer-link">API & Developers</Link>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              <Link to="/about" className="footer-link">About us</Link>
              <Link to="/help" className="footer-link">Help Center</Link>
              <Link to="/forum" className="footer-link">Forum</Link>
              <Link to="/careers" className="footer-link">Careers</Link>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Follow us</h4>
            <div className="footer-social">
              <button 
                className="sico instagram" 
                onClick={() => handleComingSoon('Instagram', '📷')}
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </button>
              <button 
                className="sico x" 
                onClick={() => handleComingSoon('X', '𝕏')}
                aria-label="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </button>
              <button 
                className="sico linkedin" 
                onClick={() => handleComingSoon('LinkedIn', '💼')}
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </button>
              <button 
                className="sico tiktok" 
                onClick={() => handleComingSoon('TikTok', '🎵')}
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.43-.64-.67-.07 3.26-.03 6.52-.05 9.77-.04 1.83-.56 3.73-1.88 5.02-1.5 1.54-3.83 2.19-5.94 1.86-2.52-.39-4.71-2.45-5.14-4.96-.58-3.08 1.21-6.38 4.23-7.21.94-.27 1.95-.31 2.91-.18V12.18c-1.28-.21-2.65-.05-3.79.62-1.89 1.12-2.73 3.52-2.12 5.62.58 2.09 2.74 3.59 4.9 3.32 1.76-.2 3.27-1.53 3.65-3.26.17-.75.14-1.53.15-2.3V4.08C13.06 2.76 12.89 1.38 12.525.02z"></path></svg>
              </button>
            </div>
            <div className="footer-copy">
              © 2025 Intermaven Ltd.<br />
              {cmsAddress}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <Link to="/privacy" className="fbl">
              Privacy Policy
            </Link>
            <Link to="/terms" className="fbl">
              Terms of Service
            </Link>
            <Link to="/cookies" className="fbl">
              Cookie Policy
            </Link>
            <Link to="/refund" className="fbl">
              Refund Policy
            </Link>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--mu2)' }}>
            {cmsTagline}
            {cmsPhone && <span style={{ marginLeft: 10, color: '#94a3b8' }}>· {cmsPhone}</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
