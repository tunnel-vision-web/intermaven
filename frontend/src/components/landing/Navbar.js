import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { INTERMAVEN_LOGO } from '../../imageRegistry';
import RegionSwitcher from './RegionSwitcher';
import { useAuth } from '../../App';

function Navbar({ onOpenAuth, onOpenSignIn, portal = 'music', onToast }) {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [communityOpen, setCommunityOpen] = useState(false);
  const communityTimer = useRef(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutTimer = useRef(null);

  const openCommunity = () => {
    if (communityTimer.current) clearTimeout(communityTimer.current);
    setCommunityOpen(true);
  };
  const closeCommunity = () => {
    if (communityTimer.current) clearTimeout(communityTimer.current);
    communityTimer.current = setTimeout(() => setCommunityOpen(false), 220);
  };
  const openAbout = () => {
    if (aboutTimer.current) clearTimeout(aboutTimer.current);
    setAboutOpen(true);
  };
  const closeAbout = () => {
    if (aboutTimer.current) clearTimeout(aboutTimer.current);
    aboutTimer.current = setTimeout(() => setAboutOpen(false), 220);
  };
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
    { to: '/about', label: 'About Us' },
    { to: '/for', label: 'Perfect For' },
  ];

  return (
    <>
      <nav className="landing-nav" data-testid="landing-nav">
        <div className="nav-inner">
          <Link to="/" className={`logo${logoLoaded ? ' has-image' : ''}`} data-testid="logo">
            {logoLoaded ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <img
                  src={INTERMAVEN_LOGO}
                  alt="Intermaven"
                  className="logo-image"
                  onError={() => setLogoLoaded(false)}
                />
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#00f0ff', marginTop: '-3px', alignSelf: 'flex-end' }}>beta</span>
              </div>
            ) : null}
            <span className="logo-text">INTER<span>MAVEN</span></span>
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
              onMouseEnter={openCommunity}
              onMouseLeave={closeCommunity}
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
                  <Link
                    to="/affiliates"
                    className="nav-dropdown-item"
                    data-testid="nav-affiliates"
                  >
                    Affiliates
                  </Link>
                </div>
              )}
            </div>

            {/* About Dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={openAbout}
              onMouseLeave={closeAbout}
              data-testid="nav-about"
            >
              <button
                type="button"
                onClick={() => setAboutOpen((o) => !o)}
                className={`nl nav-dropdown-trigger ${isActive('/about') || isActive('/for') || isActive('/perfect-for') ? 'on' : ''}`}
              >
                About <ChevronDown size={14} className={`dropdown-chevron ${aboutOpen ? 'open' : ''}`} />
              </button>
              {aboutOpen && (
                <div className="nav-dropdown-menu" data-testid="about-dropdown">
                  <Link
                    to="/about"
                    className="nav-dropdown-item"
                    data-testid="nav-about-us"
                    onClick={() => setAboutOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/for"
                    className="nav-dropdown-item"
                    data-testid="nav-perfect-for"
                    onClick={() => setAboutOpen(false)}
                  >
                    Perfect For
                  </Link>
                </div>
              )}
            </div>
            <RegionSwitcher />
            {user ? (
              <Link to="/dashboard" className="ncta" data-testid="nav-dashboard">
                Dashboard
              </Link>
            ) : (
              <>
                <button className="ncta" onClick={onOpenAuth} data-testid="nav-get-started">
                  Start free
                </button>
                <button className="ncta secondary" onClick={onOpenSignIn} data-testid="nav-sign-in">
                  Sign in
                </button>
              </>
            )}
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
          {user ? (
            <Link to="/dashboard" className="ncta" onClick={closeMobileMenu}>
              Dashboard
            </Link>
          ) : (
            <>
              <button className="ncta" onClick={() => { closeMobileMenu(); onOpenAuth(); }}>
                Start free
              </button>
              <button className="nsign" onClick={() => { closeMobileMenu(); onOpenSignIn(); }}>
                Sign in
              </button>
            </>
          )}
          <div style={{ marginTop: '16px' }}>
            <RegionSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;