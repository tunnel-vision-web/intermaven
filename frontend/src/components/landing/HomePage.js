import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';

// Portal configurations matching original data.js
const PORTALS = {
  music: {
    badge: 'Music',
    slides: [
      { 
        dot: '#10b981', 
        badge: 'Now live — AI tools for Africa',
        h: 'Build your brand.<br/><em style="color:#c084fc">Grow your career.</em>',
        s: "Intermaven gives musicians and creatives the AI tools to brand, market, and scale — without an agency budget.",
        b1: 'Try AI tools free',
        b1link: '/tools',
        b2: 'See pricing',
        b2link: '/pricing'
      },
      { 
        dot: '#f59e0b', 
        badge: 'For musicians & artists',
        h: 'Your music.<br/><em style="color:#22d3ee">The world\'s stage.</em>',
        s: "From a polished press kit to a Hollywood sync pitch — our AI tools help African artists break through globally.",
        b1: 'Write my press kit',
        b1link: '/tools',
        b2: 'See all apps',
        b2link: '/apps'
      },
      { 
        dot: '#7c6ff7', 
        badge: 'For creative brands',
        h: 'Brand it right.<br/><em style="color:#f59e0b">From day one.</em>',
        s: "Whether you're an artist, studio, or label — generate your full brand kit in seconds.",
        b1: 'Generate brand kit',
        b1link: '/tools',
        b2: 'See all apps',
        b2link: '/apps'
      },
      { 
        dot: '#22d3ee', 
        badge: 'Music & Creative marketplace',
        h: 'One platform.<br/><em style="color:#10b981">Every creative tool.</em>',
        s: "A growing ecosystem of apps built for artists, labels, and creatives across Africa and the diaspora.",
        b1: 'Explore apps',
        b1link: '/apps',
        b2: 'Our story',
        b2link: '/about'
      }
    ],
    ftitle: 'AI tools for every stage of your creative career',
    feats: [
      { i: '🎨', bg: 'rgba(124,111,247,.15)', t: 'AI Brand Kit Generator', d: 'Name, taglines, tone, colour direction, and positioning.', tag: 'Free · 10 credits', tc: '#c084fc', tb: 'rgba(124,111,247,.15)', appId: 'brandkit' },
      { i: '🎤', bg: 'rgba(34,211,238,.12)', t: 'Music Bio & Press Kit', d: 'Bio, press narrative, and media pitch for labels.', tag: 'Free · 15 credits', tc: '#22d3ee', tb: 'rgba(34,211,238,.12)', appId: 'musicbio' },
      { i: '📱', bg: 'rgba(244,63,94,.12)', t: 'Social AI', d: 'Multi-account social management and insights.', tag: 'Free · 2 accounts', tc: '#f43f5e', tb: 'rgba(244,63,94,.12)', appId: 'social' },
      { i: '🥁', bg: 'rgba(16,185,129,.1)', t: 'More apps coming', d: 'EPK builder, distribution tracker, and more.', tag: 'View roadmap', tc: 'var(--mu)', tb: 'rgba(255,255,255,.06)', appId: null, dash: true }
    ],
    btitle: 'Music & Creative App Marketplace',
    bsub: 'Standalone modules in a growing ecosystem for African artists.',
    bpills: [
      { l: 'Brand Kit AI', lv: true },
      { l: 'Music Bio AI', lv: true },
      { l: 'Social AI', lv: true },
      { l: 'EPK Builder', lv: false },
      { l: 'Jakom Music Hub', lv: false }
    ]
  },
  business: {
    badge: 'Business',
    slides: [
      { 
        dot: '#10b981', 
        badge: 'Business tools for Nairobi SMEs',
        h: 'Run your business.<br/><em style="color:#22d3ee">Smarter every day.</em>',
        s: "Intermaven Business gives Nairobi entrepreneurs AI and operational tools to manage, market, and scale.",
        b1: 'See all tools',
        b1link: '/tools',
        b2: 'See pricing',
        b2link: '/pricing'
      },
      { 
        dot: '#22d3ee', 
        badge: 'M-Pesa native payments',
        h: 'Payments built<br/><em style="color:#10b981">for Kenya.</em>',
        s: "Every payment tool on Intermaven Business works natively with M-Pesa, cards, and mobile money.",
        b1: 'Explore POS',
        b1link: '/apps',
        b2: 'Learn more',
        b2link: '/about'
      },
      { 
        dot: '#f59e0b', 
        badge: 'AI tools for Nairobi businesses',
        h: 'Brand your business.<br/><em style="color:#f59e0b">Stand out.</em>',
        s: "AI brand kits, social content, and pitch decks — built for Nairobi retail, food, and service businesses.",
        b1: 'Generate brand kit',
        b1link: '/tools',
        b2: 'See all apps',
        b2link: '/apps'
      },
      { 
        dot: '#a855f7', 
        badge: 'The business app marketplace',
        h: 'One platform.<br/><em style="color:#22d3ee">Every business tool.</em>',
        s: "POS, invoicing, contracts, analytics, scheduling, and AI — all under one roof.",
        b1: 'Explore marketplace',
        b1link: '/apps',
        b2: 'Our story',
        b2link: '/about'
      }
    ],
    ftitle: 'AI and operational tools for Nairobi businesses',
    feats: [
      { i: '🎨', bg: 'rgba(14,148,153,.15)', t: 'Business Brand Kit AI', d: 'Brand foundation for SMEs and service businesses.', tag: 'Free · 10 credits', tc: '#22d3ee', tb: 'rgba(14,148,153,.15)', appId: 'brandkit' },
      { i: '📱', bg: 'rgba(244,63,94,.12)', t: 'Social AI', d: 'Multi-account social management and AI insights.', tag: 'Free · 2 accounts', tc: '#f43f5e', tb: 'rgba(244,63,94,.12)', appId: 'social' },
      { i: '💳', bg: 'rgba(245,158,11,.15)', t: 'Invoicing & Payments', d: 'M-Pesa invoices, card payments, billing management.', tag: 'Beta', tc: '#f59e0b', tb: 'rgba(245,158,11,.15)', appId: 'invoicing' },
      { i: '⚖', bg: 'rgba(100,116,139,.12)', t: 'Contract Templates', d: 'Kenya-law-compliant templates for all business types.', tag: 'Coming soon', tc: 'var(--mu)', tb: 'rgba(255,255,255,.06)', appId: null, dash: true }
    ],
    btitle: 'Business App Marketplace',
    bsub: 'Operational and AI tools for Nairobi entrepreneurs.',
    bpills: [
      { l: 'Brand Kit AI', lv: true },
      { l: 'Social AI', lv: true },
      { l: 'Pitch Deck AI', lv: true },
      { l: 'POS System', lv: false },
      { l: 'Contracts', lv: false }
    ]
  }
};

const SLIDE_DURATION = 8000;

function HomePage({ portal = 'music', onOpenAppModal, onOpenAuth, onToast }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideState, setSlideState] = useState('in');
  const [progress, setProgress] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  const portalData = PORTALS[portal];
  const slides = portalData.slides;

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      
      if (response.ok) {
        setNewsletterSuccess(true);
        setNewsletterEmail('');
        onToast('Subscribed!', 'You\'ll receive our latest updates.', 'success');
      } else {
        onToast('Subscription failed', 'Please try again later.', 'error');
      }
    } catch (error) {
      onToast('Subscription failed', 'Please try again later.', 'error');
    }
    setNewsletterLoading(false);
  };

  useEffect(() => {
    // Reset on portal change
    setCurrentSlide(0);
    setProgress(0);
    setSlideState('in');
  }, [portal]);

  useEffect(() => {
    // Auto-advance slides
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress < 100) {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      setSlideState('out');
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setProgress(0);
        setSlideState('in');
      }, 400);
    }, SLIDE_DURATION);

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, slides.length]);

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setSlideState('out');
    setTimeout(() => {
      setCurrentSlide(index);
      setProgress(0);
      setSlideState('in');
    }, 400);
  };

  const handleFeatureClick = (feat) => {
    if (feat.appId) {
      onOpenAppModal(feat.appId);
    } else if (feat.dash) {
      onToast('Coming soon — join the waitlist!', '', '⏳');
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <>
      {/* Hero Section */}
      <div className="hw" data-testid="hero-section">
        <div className="bgs">
          <div className={`bg bg1 ${currentSlide === 0 ? 'on' : ''}`} />
          <div className={`bg bg2 ${currentSlide === 1 ? 'on' : ''}`} />
          <div className={`bg bg3 ${currentSlide === 2 ? 'on' : ''}`} />
          <div className={`bg bg4 ${currentSlide === 3 ? 'on' : ''}`} />
          <div className="bgo" />
        </div>
        
        <div className="hs">
          <div className="hcont">
            <div className={`he hbadge ${slideState}`}>
              <span 
                className="bdot" 
                style={{ 
                  background: currentSlideData.dot,
                  animation: 'pulse 2s infinite'
                }} 
              />
              <span>{currentSlideData.badge}</span>
            </div>
            <div 
              className={`ht htitle ${slideState}`}
              dangerouslySetInnerHTML={{ __html: currentSlideData.h }}
            />
            <p className={`hp hsub ${slideState}`}>
              {currentSlideData.s}
            </p>
            <div className={`hb hbtns ${slideState}`}>
              <Link to={currentSlideData.b1link} className="hbp">
                {currentSlideData.b1}
              </Link>
              <Link to={currentSlideData.b2link} className="hbg">
                {currentSlideData.b2}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="sui">
          <div className="spr">
            <div 
              className="spb" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="sdots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`sd ${index === currentSlide ? 'on' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="fs" data-testid="features-section">
        <div className="cn">
          <div className="sl2">What we build</div>
          <div className="st">{portalData.ftitle}</div>
          
          <div className="fg">
            {portalData.feats.map((feat, index) => (
              <div 
                key={index}
                className="fc" 
                onClick={() => handleFeatureClick(feat)}
                data-testid={`feature-card-${index}`}
              >
                <div className="fi2" style={{ background: feat.bg }}>
                  {feat.i}
                </div>
                <h3>{feat.t}</h3>
                <p>{feat.d}</p>
                <span 
                  className="ftag" 
                  style={{ background: feat.tb, color: feat.tc }}
                >
                  {feat.tag}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mban">
            <div style={{ fontSize: '24px' }}>🥁</div>
            <div style={{ flex: 1 }}>
              <h3>{portalData.btitle}</h3>
              <p>{portalData.bsub}</p>
              <div className="pills">
                {portalData.bpills.map((pill, index) => (
                  <span key={index} className={`pill ${pill.lv ? 'lv' : ''}`}>
                    {pill.l}
                  </span>
                ))}
              </div>
            </div>
            <Link 
              to="/apps" 
              className="hbp" 
              style={{ alignSelf: 'center', whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              See all apps →
            </Link>
          </div>
          
          {/* Newsletter Signup CTA */}
          <div className="newsletter-cta" data-testid="newsletter-section">
            <div className="newsletter-icon">
              <Mail size={24} />
            </div>
            <h3>Stay in the loop</h3>
            <p>Get the latest AI tools, tips, and updates for African creatives. No spam, ever.</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="you@example.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterSuccess}
                data-testid="newsletter-email"
              />
              <button 
                type="submit" 
                disabled={newsletterLoading || newsletterSuccess}
                data-testid="newsletter-submit"
              >
                {newsletterLoading ? 'Subscribing...' : newsletterSuccess ? 'Subscribed!' : 'Subscribe →'}
              </button>
            </form>
            {newsletterSuccess && (
              <div className="newsletter-success">
                <Check size={14} /> You're on the list!
              </div>
            )}
            <div className="newsletter-count">
              <Check size={12} /> Join 2,500+ creatives already subscribed
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods" data-testid="payment-methods">
            <p>Secure payments via</p>
            <div className="payment-logos">
              <div className="payment-logo mpesa" title="M-Pesa">
                <span>M-PESA</span>
              </div>
              <div className="payment-logo visa" title="Visa">
                <span>VISA</span>
              </div>
              <div className="payment-logo mastercard" title="Mastercard">
                <span>Mastercard</span>
              </div>
            </div>
          </div>
          
          <div className="trust">
            <p>Built for creatives across</p>
            <div className="tlogos">
              <span>Nairobi</span>
              <span>Lagos</span>
              <span>Accra</span>
              <span>Kampala</span>
              <span>Dar es Salaam</span>
              <span>Diaspora</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
