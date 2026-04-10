import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

function Navbar({ onOpenAuth, onOpenSignIn, portal = 'music', onToast }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [communityOpen, setCommunityOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const handleForumClick = () => {
    // Forum is now available, no toast needed
  };

  return (
    <nav className="landing-nav" data-testid="landing-nav">
      <div className="nav-inner">
        <Link to="/" className="logo" data-testid="logo">
          INTER<span>MAVEN</span>
          <span className="lbdg">{portal === 'music' ? 'Music' : 'Business'}</span>
        </Link>
        <div className="navl">
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
  );
}

export default Navbar;
