import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, ChevronRight, CreditCard, Palette, Music, Share2, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

const HELP_CATEGORIES = [
  { id: 'getting-started', icon: 'rocket', title: 'Getting Started', desc: 'New to Intermaven? Start here', color: 'var(--gr)' },
  { id: 'ai-tools', icon: 'wand', title: 'AI Tools', desc: 'How to use our AI features', color: 'var(--a2)' },
  { id: 'billing', icon: 'card', title: 'Billing & Credits', desc: 'Payments, plans, and credits', color: 'var(--am)' },
  { id: 'account', icon: 'user', title: 'Account', desc: 'Profile and settings', color: 'var(--a3)' },
  { id: 'social-ai', icon: 'share', title: 'Social AI', desc: 'Social media management', color: 'var(--btn)' },
  { id: 'forum', icon: 'chat', title: 'Community Forum', desc: 'Join the conversation', color: 'var(--gr)', link: '/forum' }
];

const POPULAR_ARTICLES = [
  { slug: 'how-to-create-brand-kit', title: 'How to create your first brand kit', icon: <Palette size={16} /> },
  { slug: 'understanding-credits-system', title: 'Understanding credits and billing', icon: <CreditCard size={16} /> },
  { slug: 'social-ai-content-calendar', title: 'Building a content calendar with Social AI', icon: <Share2 size={16} /> },
  { slug: 'music-bio-best-practices', title: 'Writing compelling music bios', icon: <Music size={16} /> },
  { slug: 'mobile-payments-mpesa-guide', title: 'M-Pesa payments setup guide', icon: <CreditCard size={16} /> },
  { slug: 'sync-licensing-masterclass', title: 'Sync licensing masterclass', icon: <FileText size={16} /> }
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
    if (!category.link) {
      addToast(`${category.title}`, 'More articles coming soon!', '');
    }
  };

  // Flat icon component
  const CategoryIcon = ({ type, color }) => {
    const style = { color };
    switch(type) {
      case 'rocket': return <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
      case 'wand': return <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>;
      case 'card': return <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
      case 'user': return <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
      case 'share': return <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
      case 'chat': return <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
      default: return <HelpCircle size={24} style={style} />;
    }
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
              category.link ? (
                <Link
                  key={category.id}
                  to={category.link}
                  className="help-category"
                  data-testid={`help-category-${category.id}`}
                >
                  <div className="help-category-icon">
                    <CategoryIcon type={category.icon} color={category.color} />
                  </div>
                  <h3>{category.title}</h3>
                  <p>{category.desc}</p>
                </Link>
              ) : (
                <div
                  key={category.id}
                  className="help-category"
                  onClick={() => handleCategoryClick(category)}
                  data-testid={`help-category-${category.id}`}
                >
                  <div className="help-category-icon">
                    <CategoryIcon type={category.icon} color={category.color} />
                  </div>
                  <h3>{category.title}</h3>
                  <p>{category.desc}</p>
                </div>
              )
            ))}
          </div>

          {/* Popular Articles */}
          <div className="help-articles" data-testid="help-articles">
            <h3>Popular Articles</h3>
            <div className="help-article-list">
              {POPULAR_ARTICLES.map((article, index) => (
                <Link
                  key={index}
                  to={`/help/article/${article.slug}`}
                  className="help-article"
                  data-testid={`help-article-${index}`}
                >
                  <span className="help-article-icon">{article.icon}</span>
                  <span>{article.title}</span>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--mu)' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="help-contact" data-testid="help-contact">
            <HelpCircle size={32} style={{ color: 'var(--a2)', marginBottom: '12px' }} />
            <h3>Can't find what you're looking for?</h3>
            <p>Chat with Ayo, our AI assistant, or visit our community forum.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/forum" className="hbp" style={{ textDecoration: 'none' }}>
                Visit Forum
              </Link>
            </div>
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
