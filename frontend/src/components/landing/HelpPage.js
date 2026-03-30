import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, ChevronRight, MessageCircle, CreditCard, User, Palette, Music, Share2, Settings, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

const HELP_CATEGORIES = [
  { id: 'getting-started', icon: '🚀', title: 'Getting Started', desc: 'New to Intermaven? Start here' },
  { id: 'ai-tools', icon: '🤖', title: 'AI Tools', desc: 'How to use our AI features' },
  { id: 'billing', icon: '💳', title: 'Billing & Credits', desc: 'Payments, plans, and credits' },
  { id: 'account', icon: '👤', title: 'Account', desc: 'Profile and settings' },
  { id: 'social-ai', icon: '📱', title: 'Social AI', desc: 'Social media management' },
  { id: 'partners', icon: '🤝', title: 'Partner Program', desc: 'For agencies and labels' },
  { id: 'technical', icon: '⚙️', title: 'Technical Support', desc: 'Troubleshooting issues' },
  { id: 'contact', icon: '📞', title: 'Contact Us', desc: 'Get in touch' }
];

const POPULAR_ARTICLES = [
  { title: 'How to create your first brand kit', icon: <Palette size={16} /> },
  { title: 'Understanding credits and billing', icon: <CreditCard size={16} /> },
  { title: 'Connecting your social accounts', icon: <Share2 size={16} /> },
  { title: 'Getting started with Social AI', icon: <Music size={16} /> },
  { title: 'Managing your profile settings', icon: <User size={16} /> },
  { title: 'Generating music bios and press kits', icon: <FileText size={16} /> }
];

function HelpPage({ addToast }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToast('Search coming soon', 'We\'re building this feature!', '');
    }
  };

  const handleCategoryClick = (category) => {
    addToast(`${category.title}`, 'Documentation coming soon!', '');
  };

  const handleArticleClick = (article) => {
    addToast(article.title, 'This guide is coming soon!', '');
  };

  return (
    <div className="landing-wrapper">
      <Navbar currentPage="help" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Support</div>
          <h1 className="pht">Help Center</h1>
          <p className="phs">Find answers and get support</p>
        </div>
      </div>

      <div className="legal-page">
        <div className="cn">
          {/* Search Section */}
          <div className="help-search" data-testid="help-search">
            <h2>How can we help you today?</h2>
            <form className="help-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="help-search-input"
              />
              <button type="submit" data-testid="help-search-submit">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="help-categories" data-testid="help-categories">
            {HELP_CATEGORIES.map(category => (
              <div
                key={category.id}
                className="help-category"
                onClick={() => handleCategoryClick(category)}
                data-testid={`help-category-${category.id}`}
              >
                <div className="help-category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p>{category.desc}</p>
              </div>
            ))}
          </div>

          {/* Popular Articles */}
          <div className="help-articles" data-testid="help-articles">
            <h3>Popular Articles</h3>
            <div className="help-article-list">
              {POPULAR_ARTICLES.map((article, index) => (
                <div
                  key={index}
                  className="help-article"
                  onClick={() => handleArticleClick(article)}
                  data-testid={`help-article-${index}`}
                >
                  <span className="help-article-icon">{article.icon}</span>
                  <span>{article.title}</span>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--mu)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="help-contact" data-testid="help-contact">
            <HelpCircle size={32} style={{ color: 'var(--a2)', marginBottom: '12px' }} />
            <h3>Can't find what you're looking for?</h3>
            <p>Our support team is here to help. Submit a ticket and we'll get back to you soon.</p>
            <button 
              className="hbp" 
              onClick={() => addToast('Support tickets', 'Coming soon!', '')}
              data-testid="submit-ticket-btn"
            >
              Submit a Support Ticket →
            </button>
          </div>

          {/* Quick Links */}
          <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/terms" className="hbg" style={{ textDecoration: 'none' }}>
              Terms of Service
            </Link>
            <Link to="/privacy" className="hbg" style={{ textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/" className="hbg" style={{ textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default HelpPage;
