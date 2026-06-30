import React, { useEffect, useState } from 'react';
import Netbar from './Netbar';
import Navbar from './Navbar';
import Footer from './Footer';
import PageHeader from './PageHeader';
import { useRegion } from '../../RegionContext';
import { CmsProvider } from '../../cms/CmsContext';

import HomePage from './HomePage';
import ToolsPage from './ToolsPage';
import AppsPage from './AppsPage';
import PricingPage from './PricingPage';
import AboutPage from './AboutPage';
import ForumPage from './ForumPage';
import HelpPage from './HelpPage';

const pageComponents = {
  home: HomePage,
  tools: ToolsPage,
  apps: AppsPage,
  pricing: PricingPage,
  about: AboutPage,
  forum: ForumPage,
  help: HelpPage,
};

function LandingLayout({ page = 'home', onOpenAuth, onOpenSignIn, addToast }) {
  const region = useRegion();
  const [scrolled, setScrolled] = useState(false);
  const [portal, setPortal] = useState('business'); // Business is the default

  const PageComponent = pageComponents[page] || HomePage;

  // Force Business default on mount (prevents any early override to 'music')
  useEffect(() => {
    if (portal !== 'business') {
      console.log('Force default to business (overriding external call)');
      setPortal('business');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePortalChange = (newPortal) => {
    console.log('Portal changed to:', newPortal);
    setPortal(newPortal);
  };

  // Pages that render their OWN <PageHeader> (tools, apps, pricing) are excluded
  // here to avoid a duplicate/overlapping header. These pages rely on LandingLayout.
  const layoutHeaderPages = ['forum', 'help', 'about'];
  const showFullHeader = layoutHeaderPages.includes(page);

  return (
    <CmsProvider portal={portal}>
      <div className={`landing-wrapper ${scrolled ? 'scrolled' : ''}`}>
        <Netbar 
          portal={portal}
          onPortalChange={handlePortalChange}
        />
        <Navbar 
          onOpenAuth={onOpenAuth} 
          onOpenSignIn={onOpenSignIn} 
        />
        
        {showFullHeader && (
          <PageHeader 
            pageKey={page} 
            portal={portal}
            title={page === 'forum' ? 'Community Forum' : 
                   page === 'help' ? 'Help Center' : 
                   page === 'about' ? 'About Intermaven' : ''}
          />
        )}

        <main className="landing-content">
          <PageComponent 
            portal={portal}
            onOpenAuth={onOpenAuth} 
            onOpenSignIn={onOpenSignIn} 
            onOpenAppModal={onOpenAuth}
            onToast={addToast}
            addToast={addToast}
          />
        </main>

        <Footer />
      </div>
    </CmsProvider>
  );
}

export default LandingLayout;