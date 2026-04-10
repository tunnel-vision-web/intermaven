import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, User, ChevronRight, MessageSquare, ThumbsUp, Eye, Bookmark, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

// Forum categories with flat icons
const FORUM_CATEGORIES = [
  { id: 'announcements', name: 'Announcements', icon: 'megaphone', color: 'var(--btn)', count: 3 },
  { id: 'getting-started', name: 'Getting Started', icon: 'rocket', color: 'var(--gr)', count: 8 },
  { id: 'ai-tools', name: 'AI Tools', icon: 'wand', color: 'var(--a2)', count: 12 },
  { id: 'showcase', name: 'Showcase', icon: 'star', color: 'var(--am)', count: 5 },
  { id: 'feedback', name: 'Feedback & Ideas', icon: 'lightbulb', color: 'var(--a3)', count: 7 },
  { id: 'support', name: 'Technical Support', icon: 'wrench', color: 'var(--mu)', count: 4 }
];

// Pre-populated articles by admin
const FORUM_ARTICLES = [
  {
    id: 1,
    slug: 'welcome-to-intermaven-forum',
    title: 'Welcome to the Intermaven Community Forum!',
    excerpt: 'We\'re excited to launch our community forum. Here\'s what you can expect and how to get the most out of it.',
    category: 'announcements',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: '2026-03-30',
    readTime: '3 min',
    views: 342,
    likes: 45,
    comments: 12,
    pinned: true,
    featured: true
  },
  {
    id: 2,
    slug: 'introducing-ayo-ai-assistant',
    title: 'Meet Ayo: Your New AI Assistant',
    excerpt: 'Say hello to Ayo! Our AI assistant is here to help you navigate Intermaven and answer your questions 24/7.',
    category: 'announcements',
    author: 'Product Team',
    authorRole: 'Admin',
    date: '2026-03-30',
    readTime: '4 min',
    views: 256,
    likes: 38,
    comments: 8,
    pinned: true
  },
  {
    id: 3,
    slug: 'how-to-create-brand-kit',
    title: 'Step-by-Step: Creating Your First Brand Kit',
    excerpt: 'Learn how to use the Brand Kit Generator to create a complete brand identity in under 5 minutes.',
    category: 'getting-started',
    author: 'Creative Team',
    authorRole: 'Admin',
    date: '2026-03-28',
    readTime: '6 min',
    views: 1234,
    likes: 89,
    comments: 23
  },
  {
    id: 4,
    slug: 'understanding-credits-system',
    title: 'Understanding the Credit System: A Complete Guide',
    excerpt: 'Everything you need to know about credits - how they work, what they cost, and how to make the most of them.',
    category: 'getting-started',
    author: 'Support Team',
    authorRole: 'Admin',
    date: '2026-03-27',
    readTime: '5 min',
    views: 892,
    likes: 67,
    comments: 15
  },
  {
    id: 5,
    slug: 'music-bio-best-practices',
    title: 'Writing Compelling Music Bios: Tips from the Pros',
    excerpt: 'Industry secrets for creating artist bios that get noticed by labels, blogs, and playlist curators.',
    category: 'ai-tools',
    author: 'Music Industry Expert',
    authorRole: 'Guest Writer',
    date: '2026-03-26',
    readTime: '8 min',
    views: 756,
    likes: 92,
    comments: 31
  },
  {
    id: 6,
    slug: 'social-ai-content-calendar',
    title: 'Building a Content Calendar with Social AI',
    excerpt: 'How to plan and generate a month\'s worth of social media content using our Social AI tool.',
    category: 'ai-tools',
    author: 'Marketing Team',
    authorRole: 'Admin',
    date: '2026-03-25',
    readTime: '7 min',
    views: 634,
    likes: 54,
    comments: 18
  },
  {
    id: 7,
    slug: 'sync-licensing-masterclass',
    title: 'Sync Licensing Masterclass: Getting Your Music in Film & TV',
    excerpt: 'A comprehensive guide to sync licensing and how to craft pitches that actually get responses.',
    category: 'ai-tools',
    author: 'Sync Expert',
    authorRole: 'Guest Writer',
    date: '2026-03-24',
    readTime: '12 min',
    views: 1567,
    likes: 134,
    comments: 47
  },
  {
    id: 8,
    slug: 'showcase-afrobeats-brand-kit',
    title: 'Showcase: Afrobeats Artist Brand Kit Creation',
    excerpt: 'See how one artist used Intermaven to completely rebrand their image ahead of their album release.',
    category: 'showcase',
    author: 'Community Team',
    authorRole: 'Admin',
    date: '2026-03-23',
    readTime: '5 min',
    views: 445,
    likes: 78,
    comments: 22
  },
  {
    id: 9,
    slug: 'mobile-payments-mpesa-guide',
    title: 'M-Pesa Payments: Complete Setup Guide',
    excerpt: 'Step-by-step instructions for setting up and using M-Pesa payments on Intermaven.',
    category: 'getting-started',
    author: 'Support Team',
    authorRole: 'Admin',
    date: '2026-03-22',
    readTime: '4 min',
    views: 523,
    likes: 41,
    comments: 9
  },
  {
    id: 10,
    slug: 'feature-request-epk-builder',
    title: 'Feature Request Thread: EPK Builder',
    excerpt: 'Share your ideas and feature requests for the upcoming EPK Builder. We\'re listening!',
    category: 'feedback',
    author: 'Product Team',
    authorRole: 'Admin',
    date: '2026-03-21',
    readTime: '2 min',
    views: 312,
    likes: 56,
    comments: 34
  }
];

function ForumPage({ addToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredArticles = FORUM_ARTICLES.filter(article => {
    if (activeCategory !== 'all' && article.category !== activeCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(query) || 
             article.excerpt.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'popular') return b.views - a.views;
    if (sortBy === 'discussed') return b.comments - a.comments;
    return 0;
  });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="landing-wrapper">
      <Navbar currentPage="forum" onToast={addToast} />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.15) 0%, rgba(91, 119, 149, 0.1) 100%)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Community</div>
          <h1 className="pht">Forum</h1>
          <p className="phs">Learn, share, and connect with African creatives</p>
        </div>
      </div>

      <div className="forum-page">
        <div className="cn">
          {/* Search Bar */}
          <div className="forum-search" data-testid="forum-search">
            <form onSubmit={handleSearch}>
              <Search size={18} className="forum-search-icon" />
              <input
                type="text"
                placeholder="Search articles and discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="forum-search-input"
              />
            </form>
          </div>

          <div className="forum-layout">
            {/* Sidebar */}
            <aside className="forum-sidebar">
              <div className="forum-categories-header">
                <h3>Categories</h3>
              </div>
              <div className="forum-categories-list">
                <button 
                  className={`forum-category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  <span className="forum-cat-icon all">
                    <TrendingUp size={14} />
                  </span>
                  <span>All Posts</span>
                  <span className="forum-cat-count">{FORUM_ARTICLES.length}</span>
                </button>
                {FORUM_CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    className={`forum-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="forum-cat-icon" style={{ color: cat.color }}>
                      {cat.icon === 'megaphone' && <MessageSquare size={14} />}
                      {cat.icon === 'rocket' && <TrendingUp size={14} />}
                      {cat.icon === 'wand' && <Bookmark size={14} />}
                      {cat.icon === 'star' && <ThumbsUp size={14} />}
                      {cat.icon === 'lightbulb' && <Eye size={14} />}
                      {cat.icon === 'wrench' && <User size={14} />}
                    </span>
                    <span>{cat.name}</span>
                    <span className="forum-cat-count">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Join CTA */}
              <div className="forum-join-cta">
                <h4>Join the conversation</h4>
                <p>Create an account to comment, like, and share your own content.</p>
                <Link to="/auth" className="hbp">
                  Start Free
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className="forum-main">
              {/* Sort Options */}
              <div className="forum-sort">
                <span>Sort by:</span>
                <button 
                  className={sortBy === 'recent' ? 'active' : ''}
                  onClick={() => setSortBy('recent')}
                >
                  Recent
                </button>
                <button 
                  className={sortBy === 'popular' ? 'active' : ''}
                  onClick={() => setSortBy('popular')}
                >
                  Popular
                </button>
                <button 
                  className={sortBy === 'discussed' ? 'active' : ''}
                  onClick={() => setSortBy('discussed')}
                >
                  Most Discussed
                </button>
              </div>

              {/* Featured Article */}
              {activeCategory === 'all' && filteredArticles.find(a => a.featured) && (
                <Link 
                  to={`/help/article/${filteredArticles.find(a => a.featured).slug}`} 
                  className="forum-featured"
                  data-testid="forum-featured"
                >
                  <span className="forum-featured-badge">Featured</span>
                  <h2>{filteredArticles.find(a => a.featured).title}</h2>
                  <p>{filteredArticles.find(a => a.featured).excerpt}</p>
                  <div className="forum-featured-meta">
                    <span><User size={12} /> {filteredArticles.find(a => a.featured).author}</span>
                    <span><Clock size={12} /> {filteredArticles.find(a => a.featured).readTime} read</span>
                  </div>
                </Link>
              )}

              {/* Articles List */}
              <div className="forum-articles" data-testid="forum-articles">
                {filteredArticles.filter(a => !a.featured || activeCategory !== 'all').map(article => (
                  <Link 
                    key={article.id}
                    to={`/help/article/${article.slug}`}
                    className="forum-article"
                    data-testid={`forum-article-${article.id}`}
                  >
                    {article.pinned && <span className="forum-pin-badge">Pinned</span>}
                    <div className="forum-article-content">
                      <span className="forum-article-category" style={{ 
                        color: FORUM_CATEGORIES.find(c => c.id === article.category)?.color 
                      }}>
                        {FORUM_CATEGORIES.find(c => c.id === article.category)?.name}
                      </span>
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <div className="forum-article-meta">
                        <span className="forum-author">
                          <User size={12} />
                          {article.author}
                          {article.authorRole === 'Admin' && <span className="admin-badge">Admin</span>}
                          {article.authorRole === 'Guest Writer' && <span className="guest-badge">Guest</span>}
                        </span>
                        <span><Clock size={12} /> {article.readTime}</span>
                      </div>
                    </div>
                    <div className="forum-article-stats">
                      <span><Eye size={14} /> {article.views}</span>
                      <span><ThumbsUp size={14} /> {article.likes}</span>
                      <span><MessageSquare size={14} /> {article.comments}</span>
                    </div>
                    <ChevronRight size={18} className="forum-article-arrow" />
                  </Link>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="forum-empty">
                  <p>No articles found matching your search.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer onToast={addToast} />
    </div>
  );
}

export default ForumPage;
