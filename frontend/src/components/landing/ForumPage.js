import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../App';

const ForumPage = () => {
  const staticArticles = [
    { slug: "welcome-to-intermaven-forum", title: "Welcome to the Intermaven & TuneMavens Community Forum!", category: "Announcements", excerpt: "A unified space for creators, labels, founders, merchants, and supervisors to learn, share, and grow together.", author: "Intermaven Team", date: "November 2026", readTime: "3 min", pinned: true },
    { slug: "introducing-maven-ai-assistant", title: "Meet Maven: Your Cross-Platform AI Assistant", category: "Announcements", excerpt: "Say hello to Maven! Connected directly to our Help Knowledge Base and tailored to your active Business or Creative persona.", author: "Product Team", date: "November 2026", readTime: "4 min", pinned: true },
    { slug: "beta-free-credits-guide", title: "150 Free Beta Credits: Testing Every AI Tool & App Risk-Free", category: "Beta & Billing", excerpt: "During the beta phase, every new account receives 150 Free Beta Credits plus M-Pesa Mobile Payments & Card billing support.", author: "Billing Team", date: "November 2026", readTime: "4 min", pinned: true },
    { slug: "how-to-create-brand-kit", title: "Step-by-Step: Creating Your First Brand Kit", category: "Getting Started", excerpt: "Discover how Intermaven's Brand Kit AI helps creators and startups build professional brand identities in minutes.", author: "Creative Team", date: "November 2026", readTime: "6 min" },
    { slug: "smart-crm-email-reachout", title: "Smart CRM & Reachout: Email-Only Target Groups & Persona Playbooks", category: "Smart CRM", excerpt: "Import CSV email lists, preview HTML event flyers, dispatch tracked reachout, and sync live with TuneMavens.", author: "Intermaven Team", date: "November 2026", readTime: "7 min" },
    { slug: "distribution-tracker-150-dsps", title: "Distribution Tracker: Delivering to 150+ DSPs with DDEX 3.8", category: "Distribution", excerpt: "Auto-generate ISRC/UPC codes, monitor live store ingestion, and run bulk label deliveries.", author: "TuneMavens Ops", date: "November 2026", readTime: "6 min" },
    { slug: "epk-builder-101-professional-kits", title: "EPK Builder 101: Create Professional Electronic Press Kits in Minutes", category: "EPK Builder", excerpt: "Step-by-step guide to building and publishing your verified artist or podcaster EPK.", author: "Intermaven Team", date: "November 2026", readTime: "5 min" },
    { slug: "business-and-creative-personas", title: "Using Business & Creative Personas Across the Ecosystem", category: "Personas", excerpt: "Switch seamlessly between Creator, Label, Supervisor, DJ, Founder, Merchant, Agency, Corporate, and Investor seats.", author: "Product Team", date: "November 2026", readTime: "5 min" },
    { slug: "sso-single-login-ecosystem", title: "One Login Across Intermaven, TuneMavens & TuneStream", category: "Account & SSO", excerpt: "How our unified MongoDB & OIDC/PKCE Single Sign-On keeps your persona, credits, and apps synced everywhere.", author: "Engineering Team", date: "November 2026", readTime: "4 min" },
    { slug: "pricing-plans-explained", title: "Pricing Plans Explained: Beta Free Credits, Creator & Pro", category: "Pricing", excerpt: "Which plan is right for you? Full breakdown of features, beta credits, and Mobile Payments (M-Pesa).", author: "Intermaven Team", date: "November 2026", readTime: "5 min" }
  ];

  const [dynamicPosts, setDynamicPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/api/forum/posts');
        setDynamicPosts(response.data.posts || []);
      } catch (err) {
        console.error("Failed to fetch forum posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatCategory = (cat) => {
    if (cat === 'billing') return 'Billing';
    if (cat === 'technical') return 'Technical Support';
    if (cat === 'ai-tools') return 'AI Tools';
    return 'General Support';
  };

  const allArticles = [
    ...staticArticles,
    ...dynamicPosts.map(p => ({
      slug: p.slug,
      title: p.title,
      category: formatCategory(p.category),
      excerpt: Array.isArray(p.content) && p.content.length > 0 ? p.content[0].message : 'Resolved support ticket discussion.',
      author: p.author || 'Anonymous Creator',
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently',
      readTime: '4 min',
      pinned: false,
      isDynamic: true
    }))
  ];

  return (
    <div className="forum-page cn" style={{ padding: '40px 0 60px' }}>
      <div className="forum-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              Discuss AI tools, CRM strategies, EPK creation, file management, and more.
            </p>
          </div>
          <div style={{ 
            background: '#1e2937', 
            padding: '6px 14px', 
            borderRadius: '3px', 
            fontSize: '13px',
            color: '#64748b'
          }}>
            {allArticles.length} discussions
          </div>
        </div>
      </div>

      <div className="forum-content">
        {loading && dynamicPosts.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>Loading forum posts...</div>
        ) : (
          <div className="articles-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '20px' 
          }}>
            {allArticles.map((article, idx) => (
              <Link 
                key={idx} 
                to={article.isDynamic ? `/forum/article/${article.slug}` : `/forum/article/${article.slug}`}
                className="article-card"
                style={{
                  background: '#1e2937',
                  border: '1px solid #334155',
                  borderRadius: '3px',
                  padding: '20px',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div className="article-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="category" style={{ 
                      fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '3px',
                      background: article.isDynamic ? 'rgba(16, 185, 129, 0.1)' : '#334155', 
                      color: article.isDynamic ? '#10b981' : '#94a3b8'
                    }}>
                      {article.category}
                    </span>
                    {article.pinned && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>📌 Pinned</span>}
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.3, marginBottom: '10px' }}>{article.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, marginBottom: '16px', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
                </div>
                <div>
                  <div className="article-footer" style={{ 
                    display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b',
                    borderTop: '1px solid #334155', paddingTop: '12px'
                  }}>
                    <span>{article.author}</span>
                    <span>{article.date} • {article.readTime}</span>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#10b981', fontWeight: 600, textAlign: 'right' }}>
                    Read article & join conversation →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;