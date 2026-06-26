import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Clock, User, ChevronLeft } from 'lucide-react';
import '../../styles/landing.css';

const BLOG_POSTS = [
  {
    slug: "ai-african-music-industry",
    title: "AI in the African Music Industry: Opportunities and Challenges",
    desc: "How emerging artists are using AI generators to design brand kits, translate music bios, and pitch their music to global sync supervisors.",
    author: "Amara Mwangi",
    date: "June 15, 2026",
    readTime: "5 min",
    content: `
The rise of artificial intelligence is reshaping the global music industry, and Africa is at the forefront of this digital revolution. Emerging artists from Lagos, Nairobi, and Johannesburg are leveraging AI tools to level the playing field, bypassing traditional gatekeepers.

### Branding on a Budget

Historically, launching a professional music career required substantial capital. Hiring graphic designers for logo concepts, copywriters for press releases, and marketing consultants for social calendars easily cost thousands of dollars. Today, AI-powered systems like Intermaven's Brand Kit and Music Bio generators let independent artists create professional visual and textual identities in minutes for a fraction of the cost.

### Sync Pitching to Global Media

One of the most lucrative avenues for independent music is synchronization licensing—getting songs placed in Netflix series, video games, or commercials. However, music supervisors receive thousands of pitches daily. AI writing assistants help artists structure professional, metadata-rich email pitches. By analyzing BPM, genre cues, and emotional tones, AI helps artists articulate exactly why their track fits a specific scene.

### The Human Element

While AI speeds up administrative and creative operations, the core of music remains deeply human. Industry experts agree that AI should be used as a collaborative assistant, not a replacement. The most successful creators use AI to handle administrative overhead (like scheduling social posts or formatting bio translations), leaving them with more time to focus on writing music, performing, and connecting with fans.
    `
  },
  {
    slug: "smart-crm-fanbase-tactics",
    title: "How to Build a Loyal Fanbase: Smart CRM Tactics for Independent Creatives",
    desc: "Stop relying solely on social media algorithms. Learn how to capture customer leads, automate WhatsApp follow-ups, and own your audience data.",
    author: "Kofi Mensah",
    date: "June 10, 2026",
    readTime: "7 min",
    content: `
Social media algorithms change constantly, meaning your organic reach can drop overnight. To build a sustainable creative career, you need to own your audience data. This is where Customer Relationship Management (CRM) tools come into play.

### The Power of Direct Channels

Email and WhatsApp have open rates that far exceed organic Instagram or TikTok posts. When you capture a fan's email or phone number, you have a direct line to them. You don't have to pay to boost a post just to tell them about your new release or tour dates.

### Smart CRM Automations

**1. Electronic Press Kit Lead Capture**
Embed waitlist and newsletter forms directly on your public EPK pages. When a promoter or fan signs up, their data is instantly stored in your CRM.

**2. Automated Welcome Sequences**
Configure automation rules to send a follow-up WhatsApp or email immediately after sign-up. Thank them, offer a free download or discount code, and tell them what to expect.

**3. Booking Reminders**
If you run creative services (like a recording studio, DJ bookings, or design work), automate booking confirmations and deposit reminders. This reduces no-shows and secures your revenue.

### Creative CRM Strategy

Segment your fanbase based on their engagement:
- **Superfans**: Invite them to exclusive WhatsApp channels, offer early-access merch.
- **Casual Listeners**: Send monthly newsletter roundups.
- **Promoters/B2B**: Send direct pitches for show bookings.
    `
  },
  {
    slug: "music-distribution-demystified",
    title: "Demystifying Music Distribution: Digital Releases for Emerging Artists",
    desc: "A comprehensive guide on releasing music to Spotify, Apple Music, and TikTok, tracking royalties, and managing collaborator splits sheets.",
    author: "Lindiwe Ndlovu",
    date: "June 05, 2026",
    readTime: "6 min",
    content: `
Digital music distribution has never been easier, yet many independent artists find the process confusing. Let's break down the exact steps to distribute your music globally and collect all the royalties you are owed.

### Choosing a Distributor

Distributors act as the intermediary between you and streaming platforms like Spotify, Apple Music, and TikTok. Services like tunemavens.com allow you to upload your files, manage release metadata, and pitch for playlist considerations.

### Essential Release Metadata

To ensure your music is cataloged correctly and payouts go to the right owners, you must compile accurate metadata:
- **Audio Files**: High-resolution WAV format (16-bit, 44.1kHz or higher).
- **Artwork**: Square cover art (3000x3000px) with no logos, website URLs, or social handles.
- **Songwriting Credits**: Full legal names of all composers, lyricists, and producers.
- **ISRC Codes**: International Standard Recording Codes, which uniquely identify each recording.

### Automating Split Sheets

Collaborator disputes are the number-one cause of songs being pulled down from streaming services. Always agree on royalty split percentages before entering the studio. Use digital split sheet tools to automate this process so that royalties are divided and paid out automatically to each contributor upon receipt.
    `
  }
];

function BlogPage() {
  const [activePost, setActivePost] = useState(null);

  const handlePostClick = (post) => {
    setActivePost(post);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setActivePost(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="landing-wrapper">
      <Navbar currentPage="blog" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Resources</div>
          <h1 className="pht">{activePost ? activePost.title : "Intermaven Blog"}</h1>
          <p className="phs">{activePost ? `Published on ${activePost.date} by ${activePost.author}` : "Latest insights in creative technology, marketing, and music industry operations."}</p>
        </div>
      </div>

      <div style={{ padding: '40px 0 80px' }}>
        <div className="cn">
          {activePost ? (
            /* Single Blog Post View */
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <button 
                onClick={handleBackToList}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', 
                  border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, 
                  marginBottom: '24px', fontSize: '14px'
                }}
              >
                <ChevronLeft size={18} />
                Back to Blog List
              </button>

              <article style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '16px', padding: '32px', color: '#cbd5e1', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #1e2937', paddingBottom: '12px', marginBottom: '24px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <User size={14} /> {activePost.author}
                  </span>
                  <span><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {activePost.readTime} read</span>
                </div>
                
                <div className="blog-body" style={{ whiteSpace: 'pre-line' }}>
                  {activePost.content}
                </div>
              </article>
            </div>
          ) : (
            /* Blog List View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {BLOG_POSTS.map((post, index) => (
                <div 
                  key={index}
                  onClick={() => handlePostClick(post)}
                  style={{
                    background: '#0f1117',
                    border: '1px solid #1e2937',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e2937';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                      <span>Insights</span>
                      <span>{post.readTime} read</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>
                      {post.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                      {post.desc}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e2937', paddingTop: '12px', fontSize: '13px', color: '#64748b' }}>
                    <span>{post.author}</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Read post →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BlogPage;
