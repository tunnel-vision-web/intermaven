import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Netbar from './Netbar';
import Navbar from './Navbar';
import Footer from './Footer';
import LegalModal from './LegalModal';
import { AppInfoModal } from './AppInfoModal';
import HomePage from './HomePage';
import ToolsPage from './ToolsPage';
import AppsPage from './AppsPage';
import PricingPage from './PricingPage';
import AboutPage from './AboutPage';
import '../../styles/landing.css';

function getInitialPortal(hostname) {
  if (hostname.includes('intermavenmusic.com')) {
    return 'music';
  }
  return 'business';
}

function getSubdomainPage(hostname) {
  if (!hostname.endsWith('intermavenmusic.com')) return null;
  const parts = hostname.split('.');
  if (parts.length === 3) {
    const sub = parts[0].toLowerCase();
    const valid = ['djs', 'labels', 'producers', 'mediahouses'];
    return valid.includes(sub) ? sub : null;
  }
  return null;
}

function LandingLayout({ page = 'home', onOpenAuth, onOpenSignIn, addToast }) {
  const hostname = window?.location?.hostname || '';
  const [portal, setPortal] = useState(() => getInitialPortal(hostname));
  const [subdomainPage] = useState(() => getSubdomainPage(hostname));
  const [legalModal, setLegalModal] = useState({ open: false, type: null });
  const [appModal, setAppModal] = useState({ open: false, appId: null });
  const navigate = useNavigate();

  const handlePortalChange = (newPortal) => {
    setPortal(newPortal);
  };

  const handleShowLegal = (type) => {
    setLegalModal({ open: true, type });
  };

  const handleCloseLegal = () => {
    setLegalModal({ open: false, type: null });
  };

  const handleOpenAppModal = (appId) => {
    setAppModal({ open: true, appId });
  };

  const handleCloseAppModal = () => {
    setAppModal({ open: false, appId: null });
  };

  const handleGetStarted = (appId) => {
    handleCloseAppModal();
    if (onOpenAuth) {
      onOpenAuth(appId);
    } else {
      navigate('/auth');
    }
  };

  const handleToast = (title, message, icon) => {
    if (addToast) {
      addToast(title, message, icon === '✓' ? 'success' : '');
    }
  };

  const handleOpenAuthWrapper = () => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      navigate('/auth');
    }
  };

  const handleOpenSignInWrapper = () => {
    if (onOpenSignIn) {
      onOpenSignIn();
    } else {
      navigate('/auth');
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'tools':
        return (
          <ToolsPage 
            portal={portal}
            subdomainPage={subdomainPage}
            onOpenAuth={handleOpenAuthWrapper}
            onToast={handleToast}
          />
        );
      case 'apps':
        return (
          <AppsPage 
            portal={portal}
            subdomainPage={subdomainPage}
            onOpenAppModal={handleOpenAppModal}
            onToast={handleToast}
          />
        );
      case 'pricing':
        return (
          <PricingPage 
            portal={portal}
            subdomainPage={subdomainPage}
            onOpenAuth={handleOpenAuthWrapper}
            onToast={handleToast}
          />
        );
      case 'about':
        return (
          <AboutPage 
            portal={portal}
            subdomainPage={subdomainPage}
            onToast={handleToast}
          />
        );
      case 'home':
      default:
        return (
          <HomePage 
            portal={portal}
            subdomainPage={subdomainPage}
            onOpenAppModal={handleOpenAppModal}
            onOpenAuth={handleOpenAuthWrapper}
            onToast={handleToast}
          />
        );
    }
  };

  return (
    <div className="landing-wrapper" data-testid="landing-wrapper">
      <Netbar portal={portal} onPortalChange={handlePortalChange} />
      <Navbar 
        portal={portal} 
        onOpenAuth={handleOpenAuthWrapper}
        onOpenSignIn={handleOpenSignInWrapper}
        onToast={handleToast}
      />
      
      {renderPage()}
      
      <Footer 
        onShowLegal={handleShowLegal}
        onToast={handleToast}
      />
      
      <LegalModal 
        isOpen={legalModal.open}
        legalType={legalModal.type}
        onClose={handleCloseLegal}
      />
      
      <AppInfoModal 
        isOpen={appModal.open}
        appId={appModal.appId}
        onClose={handleCloseAppModal}
        onGetStarted={handleGetStarted}
        onToast={handleToast}
      />
    </div>
  );
}

export default LandingLayout;
