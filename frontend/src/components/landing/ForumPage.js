import React, { useState } from 'react';

// ForumPage with clickable articles, modal, and comment system
// Comments are local for now. Real persistence + auth will come with backend.
const ForumPage = ({ onOpenAuth, onOpenSignIn }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [comments, setComments] = useState({}); // { articleId: [{id, text, author, time}] }
  const [commentText, setCommentText] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false); // demo flag

  const articles = [
    { id: 1, title: "How AI Brand Kit Generator is Changing Creative Workflows", category: "AI Tools", excerpt: "Discover how Intermaven's AI tools help creators build professional brand kits in minutes instead of hours.", author: "Intermaven Team", date: "May 8, 2026", readTime: "6 min", pinned: true, content: "Full article content would go here. The AI Brand Kit tool allows you to generate complete visual identities from a single prompt..." },
    { id: 2, title: "Smart CRM Campaigns: How to Automate WhatsApp Follow-ups", category: "Smart CRM", excerpt: "Learn how to run powerful automated campaigns directly from your Intermaven dashboard with zero coding.", author: "Intermaven Team", date: "May 7, 2026", readTime: "8 min", content: "Automation rules let you trigger messages based on behavior. Example: new lead from EPK view → send welcome sequence..." },
    { id: 3, title: "EPK Builder 101: Create Professional Electronic Press Kits in Minutes", category: "EPK Builder", excerpt: "Step-by-step guide to building and publishing your artist EPK that actually gets noticed.", author: "Intermaven Team", date: "May 6, 2026", readTime: "5 min", content: "Use templates, embed music players, add press quotes, and track who viewed your EPK..." },
    { id: 4, title: "File Management Best Practices in Intermaven", category: "File Management", excerpt: "Organize, share, and collaborate on your creative files securely with version history.", author: "Intermaven Team", date: "May 5, 2026", readTime: "4 min", content: "Folders, smart tags, version history, and granular sharing permissions keep your projects organized..." },
    { id: 5, title: "intermavenmusic.com: New Tools for DJs, Labels & Producers", category: "Music Ecosystem", excerpt: "Everything you need to know about the new music portal and integrations.", author: "Intermaven Team", date: "May 4, 2026", readTime: "7 min", content: "Release distribution, royalty tracking, and direct-to-fan tools are now unified..." },
    { id: 6, title: "Pricing Plans Explained: Free vs Creator vs Pro", category: "Pricing", excerpt: "Which plan is right for you? Full breakdown of features and limits.", author: "Intermaven Team", date: "May 3, 2026", readTime: "5 min", content: "Free plan is generous for testing. Creator unlocks AI credits. Pro removes limits and adds team features..." },
  ];

  const openArticle = (article) => {
    setSelectedArticle(article);
    setCommentText('');
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setCommentText('');
  };

  const postComment = () => {
    if (!commentText.trim()) return;

    const articleId = selectedArticle.id;
    const newComment = {
      id: Date.now(),
      text: commentText.trim(),
      author: isSignedIn ? "You" : "Guest",
      time: "Just now",
    };

    setComments(prev => ({
      ...prev,
      [articleId]: [...(prev[articleId] || []), newComment]
    }));

    setCommentText('');
  };

  const handleSignInForComments = () => {
    if (onOpenSignIn) onOpenSignIn();
    setTimeout(() => setIsSignedIn(true), 800); // demo simulation
  };

  return (
    <div className="forum-page cn">
      <div className="forum-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Community Forum</h1>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              Discuss AI tools, CRM strategies, EPK creation, file management, and more.
            </p>
          </div>
          <div style={{ 
            background: '#1e2937', 
            padding: '6px 14px', 
            borderRadius: '9999px', 
            fontSize: '13px',
            color: '#64748b'
          }}>
            {articles.length} discussions
          </div>
        </div>
      </div>

      <div className="forum-content">
        <div className="articles-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          {articles.map((article) => (
            <div 
              key={article.id} 
              className="article-card"
              onClick={() => openArticle(article)}
              style={{
                background: '#1e2937',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
            >
              <div className="article-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="category" style={{ 
                  fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '9999px',
                  background: '#334155', color: '#94a3b8'
                }}>
                  {article.category}
                </span>
                {article.pinned && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>📌 Pinned</span>}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.3, marginBottom: '10px' }}>{article.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, marginBottom: '16px' }}>{article.excerpt}</p>
              <div className="article-footer" style={{ 
                display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b',
                borderTop: '1px solid #334155', paddingTop: '12px'
              }}>
                <span>{article.author}</span>
                <span>{article.date} • {article.readTime}</span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                Click to read & comment →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Modal with Comments */}
      {selectedArticle && (
        <div 
          onClick={closeModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.92)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '20px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '32px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ 
                  fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '9999px',
                  background: '#334155', color: '#94a3b8'
                }}>{selectedArticle.category}</span>
                {selectedArticle.pinned && <span style={{ marginLeft: '8px', color: '#10b981' }}>📌 Pinned</span>}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{selectedArticle.title}</h2>
            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              {selectedArticle.author} • {selectedArticle.date} • {selectedArticle.readTime}
            </div>

            <div style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '32px' }}>
              {selectedArticle.content}<br /><br />
              (Full formatted article content would appear here in a real implementation with images, embeds, etc.)
            </div>

            {/* Comments Section */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                Comments ({(comments[selectedArticle.id] || []).length})
              </h3>

              {/* Comment List */}
              <div style={{ marginBottom: '24px' }}>
                {(comments[selectedArticle.id] || []).length === 0 && (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
                )}
                {(comments[selectedArticle.id] || []).map((c, idx) => (
                  <div key={idx} style={{ 
                    background: '#1e2937', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginBottom: '12px',
                    border: '1px solid #334155'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.author}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{c.time}</span>
                    </div>
                    <p style={{ color: '#cbd5e1', margin: 0 }}>{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Comment Form */}
              {isSignedIn ? (
                <div>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    style={{
                      width: '100%',
                      background: '#1e2937',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#e2e8f0',
                      fontSize: '15px',
                      resize: 'vertical',
                      minHeight: '90px'
                    }}
                  />
                  <button 
                    onClick={postComment}
                    disabled={!commentText.trim()}
                    style={{
                      marginTop: '12px',
                      background: commentText.trim() ? '#10b981' : '#334155',
                      color: commentText.trim() ? '#0f172a' : '#64748b',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      cursor: commentText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Post Comment
                  </button>
                </div>
              ) : (
                <div style={{ 
                  background: '#1e2937', 
                  border: '1px dashed #475569', 
                  borderRadius: '14px', 
                  padding: '24px', 
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                    Sign in or create a free account to join the discussion.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                      onClick={handleSignInForComments}
                      style={{
                        background: '#10b981',
                        color: '#0f172a',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Sign In to Comment
                    </button>
                    <button 
                      onClick={onOpenAuth}
                      style={{
                        background: 'transparent',
                        color: '#e2e8f0',
                        border: '1px solid #475569',
                        padding: '10px 22px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;