import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { INTERMAVEN_LOGO } from '../../imageRegistry';

function Navbar({ onOpenAuth, onOpenSignIn, portal = 'music', onToast }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [communityOpen, setCommunityOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const handleForumClick = () => {
    // Forum is now available, no toast needed
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const navLinks = [
    { to: '/', label: 'Home', exact: true },
    { to: '/tools', label: 'AI Tools' },
    { to: '/apps', label: 'Apps' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      <nav className="landing-nav" data-testid="landing-nav">
        <div className="nav-inner">
          <Link to="/" className={`logo${logoLoaded ? ' has-image' : ''}`} data-testid="logo">
            {logoLoaded ? (
              <img
                src={INTERMAVEN_LOGO}
                alt="Intermaven"
                className="logo-image"
                onError={() => setLogoLoaded(false)}
              />
            ) : null}
            <span className="logo-text">INTER<span>MAVEN</span></span>
            <span className="lbdg">{portal === 'music' ? 'Music' : 'Business'}</span>
          </Link>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            data-testid="hamburger"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="navl desktop-nav">
            <Link 
              to="/" 
              className={`nl ${isActive('/') && currentPath === '/' ? 'on' : ''}`}
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link 
              to="/tools" 
              className={`nl ${isActive('/tools') ? 'on' : ''}`}
              data-testid="nav-tools"
            >
              AI Tools
            </Link>
            <Link 
              to="/apps" 
              className={`nl ${isActive('/apps') ? 'on' : ''}`}
              data-testid="nav-apps"
            >
              Apps
            </Link>
            <Link 
              to="/pricing" 
              className={`nl ${isActive('/pricing') ? 'on' : ''}`}
              data-testid="nav-pricing"
            >
              Pricing
            </Link>
            
            {/* Community Dropdown */}
            <div 
              className="nav-dropdown"
              onMouseEnter={() => setCommunityOpen(true)}
              onMouseLeave={() => setCommunityOpen(false)}
              data-testid="nav-community"
            >
              <button className={`nl nav-dropdown-trigger ${isActive('/help') || isActive('/forum') ? 'on' : ''}`}>
                Community <ChevronDown size={14} className={`dropdown-chevron ${communityOpen ? 'open' : ''}`} />
              </button>
              {communityOpen && (
                <div className="nav-dropdown-menu" data-testid="community-dropdown">
                  <Link 
                    to="/help" 
                    className="nav-dropdown-item"
                    data-testid="nav-help"
                  >
                    Help Center
                  </Link>
                  <Link 
                    to="/forum" 
                    className="nav-dropdown-item"
                    data-testid="nav-forum"
                  >
                    Forum
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/about" 
              className={`nl ${isActive('/about') ? 'on' : ''}`}
              data-testid="nav-about"
            >
              About
            </Link>
            <button className="ncta" onClick={onOpenAuth} data-testid="nav-get-started">
              Start free
            </button>
            <button className="ncta secondary" onClick={onOpenSignIn} data-testid="nav-sign-in">
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        data-testid="mobile-overlay"
      />

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} data-testid="mobile-nav">
        <div className="navl">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nl ${isActive(link.to) ? 'on' : ''}`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          <button className="ncta" onClick={() => { closeMobileMenu(); onOpenAuth(); }}>
            Start free
          </button>
          <button className="nsign" onClick={() => { closeMobileMenu(); onOpenSignIn(); }}>
            Sign in
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;