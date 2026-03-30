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

function LandingLayout({ page = 'home', onOpenAuth, onOpenSignIn, addToast }) {
  const [portal, setPortal] = useState('music');
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
            onOpenAuth={handleOpenAuthWrapper}
            onToast={handleToast}
          />
        );
      case 'apps':
        return (
          <AppsPage 
            portal={portal}
            onOpenAppModal={handleOpenAppModal}
            onToast={handleToast}
          />
        );
      case 'pricing':
        return (
          <PricingPage 
            onOpenAuth={handleOpenAuthWrapper}
            onToast={handleToast}
          />
        );
      case 'about':
        return (
          <AboutPage 
            portal={portal}
            onToast={handleToast}
          />
        );
      case 'home':
      default:
        return (
          <HomePage 
            portal={portal}
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
