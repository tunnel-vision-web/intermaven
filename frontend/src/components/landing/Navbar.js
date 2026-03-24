import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ onOpenAuth, onOpenSignIn, portal = 'music' }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
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
          <Link 
            to="/about" 
            className={`nl ${isActive('/about') ? 'on' : ''}`}
            data-testid="nav-about"
          >
            About
          </Link>
          <button className="ncta" onClick={onOpenAuth} data-testid="nav-get-started">
            Get started free
          </button>
          <button className="nsign" onClick={onOpenSignIn} data-testid="nav-sign-in">
            Sign in
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
