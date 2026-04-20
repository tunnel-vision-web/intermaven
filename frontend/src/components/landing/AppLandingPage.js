import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ChevronDown, ChevronUp, ArrowRight, Star } from 'lucide-react';
import { INTERMAVEN_LOGO } from '../../imageRegistry';

// ── App configs ────────────────────────────────────────────────────
const APP_CONFIGS = {
  brandkit: {
    name: 'Brand Kit AI',
    tagline: 'Build your brand identity in 30 seconds',
    description: 'AI-powered brand names, taglines, tone of voice, and colour direction — designed for African creatives and entrepreneurs.',
    color: '#7c6ff7',
    cost: 10,
    icon: '🎨',
    slides: [
      { dot: '#7c6ff7', badge: 'AI Brand Kit', h: 'Build your brand identity in 30 seconds', s: "AI-powered brand names, taglines, tone of voice, and colour direction — designed for African creatives and entrepreneurs.", b1: 'Try free', b1link: '#', b2: 'See features', b2link: '#features' },
      { dot: '#7c6ff7', badge: 'Smart Analysis', h: 'AI evaluates your name across 6 strategic dimensions', s: "Get professional brand analysis that would cost thousands from consultants.", b1: 'Start analysis', b1link: '#', b2: 'View examples', b2link: '#examples' },
      { dot: '#7c6ff7', badge: 'Complete Kit', h: 'From name to positioning in one click', s: "Taglines, tone, colors, personality — everything you need to launch your brand.", b1: 'Generate kit', b1link: '#', b2: 'Pricing', b2link: '#pricing' }
    ],
    backgrounds: [
      'linear-gradient(180deg, #7c6ff722 0%, #7c6ff744 50%, #08090d 100%)',
      'linear-gradient(180deg, #7c6ff733 0%, #7c6ff755 50%, #08090d 100%)',
      'linear-gradient(180deg, #7c6ff744 0%, #7c6ff766 50%, #08090d 100%)'
    ],
    social: {
      twitter: 'https://twitter.com/intermaven_brand',
      instagram: 'https://instagram.com/intermaven_brand',
      linkedin: 'https://linkedin.com/company/intermaven-brand'
    },
    features: [
      { label: 'Brand Name Analysis', desc: 'AI evaluates your name across 6 strategic dimensions' },
      { label: '3+ Tagline Options', desc: 'Each with rationale tailored to your market' },
      { label: 'Tone of Voice Guide', desc: '4 principles defining how your brand speaks' },
      { label: 'Colour Direction', desc: 'Psychology-informed palette for your brand identity' },
      { label: 'Positioning Statement', desc: 'One sentence that defines your market position' },
      { label: 'Brand Personality', desc: '5 adjectives + anti-adjective for clarity' },
    ],
    steps: [
      { title: 'Enter 4 fields', desc: 'Your name, industry, audience, and brand vibe' },
      { title: 'AI generates', desc: 'A complete brand kit in under 30 seconds' },
      { title: 'Copy & use', desc: 'Ready for websites, socials, and marketing materials' },
    ],
    testimonials: [
      { quote: "Brand Kit AI gave me a positioning statement better than what a consultant quoted me KES 30,000 for.", name: 'Amara D.', role: 'Nairobi musician' },
      { quote: "I used to spend days on brand briefs. This does it in a minute.", name: 'Kwame O.', role: 'Creative director, Lagos' },
    ],
    faqs: [
      { q: 'How many credits does one run cost?', a: '10 credits per generation. Free plan includes 150 credits.' },
      { q: 'Can I edit the generated content?', a: 'Yes — everything is plain text you can copy, paste, and customise.' },
      { q: 'What if I don\'t like the results?', a: 'Regenerate with different inputs. Each new run uses 10 credits.' },
      { q: 'Is it specific to African markets?', a: 'Yes — prompts are optimised for Nairobi and East African brand culture.' },
    ],
  },
  musicbio: {
    name: 'Music Bio & Press Kit',
    tagline: 'Your artist story, told professionally',
    description: 'AI-written artist bios, press narratives, and media pitches built for African musicians looking to break internationally.',
    color: '#22d3ee',
    cost: 15,
    icon: '🎵',
    slides: [
      { dot: '#22d3ee', badge: 'Music Bio AI', h: 'Your artist story, told professionally', s: "AI-written artist bios, press narratives, and media pitches built for African musicians.", b1: 'Try free', b1link: '#', b2: 'See features', b2link: '#features' },
      { dot: '#22d3ee', badge: 'Press Narrative', h: '3-paragraph story arc for music journalists', s: "Professional press narratives that capture your unique journey and sound.", b1: 'Generate narrative', b1link: '#', b2: 'View examples', b2link: '#examples' },
      { dot: '#22d3ee', badge: 'Media Pitch', h: 'Ready-to-send pitches for blogs and playlists', s: "Targeted pitches for music supervisors, bloggers, and playlist curators.", b1: 'Create pitch', b1link: '#', b2: 'Pricing', b2link: '#pricing' }
    ],
    backgrounds: [
      'linear-gradient(180deg, #22d3ee22 0%, #22d3ee44 50%, #08090d 100%)',
      'linear-gradient(180deg, #22d3ee33 0%, #22d3ee55 50%, #08090d 100%)',
      'linear-gradient(180deg, #22d3ee44 0%, #22d3ee66 50%, #08090d 100%)'
    ],
    social: {
      twitter: 'https://twitter.com/intermaven_music',
      instagram: 'https://instagram.com/intermaven_music',
      linkedin: 'https://linkedin.com/company/intermaven-music'
    },
    features: [
      { label: 'Short Bio (100 words)', desc: 'Perfect for streaming profiles and social media' },
      { label: 'Full Bio (250 words)', desc: 'For press kits, websites, and media packages' },
      { label: 'Press Narrative', desc: '3-paragraph story arc for music journalists' },
      { label: 'Media Pitch (150 words)', desc: 'Ready-to-send pitch for blogs and playlists' },
      { label: '3 Interview Angles', desc: 'Story hooks to pitch to radio and podcast hosts' },
      { label: 'Multiple Tones', desc: 'Professional, bold, conversational, or storytelling' },
    ],
    steps: [
      { title: 'Describe your story', desc: 'Name, genre, origin, milestones, and tone' },
      { title: 'AI writes everything', desc: 'Short bio, full bio, press narrative, and pitch' },
      { title: 'Send to the world', desc: 'Paste into your EPK, emails, or streaming profiles' },
    ],
    testimonials: [
      { quote: "My Spotify bio went from 2 followers asking 'who is this?' to press requests in one week.", name: 'Savara M.', role: 'Afro-soul artist, Nairobi' },
      { quote: "Finally got on a Kenyan blog playlist after using the media pitch from this tool.", name: 'DJ Kenzo', role: 'DJ & producer, Mombasa' },
    ],
    faqs: [
      { q: 'How much does it cost per generation?', a: '15 credits per run.' },
      { q: 'Can I generate bios for multiple artists?', a: 'Yes — each generation is independent. Just change the inputs.' },
      { q: 'Does it work for podcasters and educators?', a: 'Yes — the tone and format adapt to any creator type.' },
    ],
  },
  social: {
    name: 'Social AI',
    tagline: 'Full-stack social content for every platform',
    description: 'Meta-maximized content engine covering Instagram, Facebook, TikTok, X, LinkedIn, YouTube, and Threads — with hashtag strategy, posting times, and scroll-stopping hooks.',
    color: '#f43f5e',
    cost: 0,
    icon: '📱',
    slides: [
      { dot: '#f43f5e', badge: 'Social AI', h: 'Full-stack social content for every platform', s: "Meta-maximized content engine covering Instagram, Facebook, TikTok, X, LinkedIn, YouTube, and Threads.", b1: 'Try free', b1link: '#', b2: 'See features', b2link: '#features' },
      { dot: '#f43f5e', badge: 'Hashtag Strategy', h: 'Tiered hashtags for maximum reach', s: "High-volume, mid-range, niche, and branded tags optimized for each platform.", b1: 'Generate hashtags', b1link: '#', b2: 'View examples', b2link: '#examples' },
      { dot: '#f43f5e', badge: 'Posting Times', h: 'Optimal timing for African audiences', s: "Platform-specific posting times based on Nairobi and East African engagement data.", b1: 'Get schedule', b1link: '#', b2: 'Pricing', b2link: '#pricing' }
    ],
    backgrounds: [
      'linear-gradient(180deg, #f43f5e22 0%, #f43f5e44 50%, #08090d 100%)',
      'linear-gradient(180deg, #f43f5e33 0%, #f43f5e55 50%, #08090d 100%)',
      'linear-gradient(180deg, #f43f5e44 0%, #f43f5e66 50%, #08090d 100%)'
    ],
    social: {
      twitter: 'https://twitter.com/intermaven_social',
      instagram: 'https://instagram.com/intermaven_social',
      linkedin: 'https://linkedin.com/company/intermaven-social'
    },
    features: [
      { label: '7 Platforms, 23 Formats', desc: 'Reels, carousels, stories, threads, events, ads, and more' },
      { label: 'Meta-Maximized Output', desc: 'Collab posts, Add Yours stickers, Remix prompts, ad targeting' },
      { label: 'Hashtag Strategy', desc: 'Tiered — high-volume, mid-range, niche, and branded tags' },
      { label: 'Optimal Posting Times', desc: 'Nairobi and East Africa audience timing per platform' },
      { label: 'Multiple Variations', desc: '1–5 caption variations per format, ready to A/B test' },
      { label: 'Visual Direction Notes', desc: 'Art direction brief for each piece of content' },
    ],
    steps: [
      { title: 'Pick your platforms', desc: 'Select any combination from 7 platforms and 23 formats' },
      { title: 'Describe your content', desc: 'Topic, goal, audience, and tone' },
      { title: 'Get everything', desc: 'Captions, hashtags, timing, hooks, and platform tips' },
    ],
    testimonials: [
      { quote: "This replaced my social media manager for organic content planning.", name: 'Kezia W.', role: 'Fashion brand founder, Nairobi' },
      { quote: "The Meta-specific tips are gold — engagement on my Reels went up 3x.", name: 'Baraka S.', role: 'Content creator, Dar es Salaam' },
    ],
    faqs: [
      { q: 'Is Social AI really free?', a: 'Yes — 0 credits per generation. Always.' },
      { q: 'Does it handle Facebook ad copy?', a: 'Yes — including audience targeting suggestions for Ads Manager.' },
      { q: 'Can I generate for all platforms at once?', a: 'Yes — select multiple platforms and formats in one run.' },
    ],
  },
  syncpitch: {
    name: 'Sync Pitch AI',
    tagline: 'Get your music into film, TV, and ads',
    description: 'Professional sync licensing pitches built for African artists targeting music supervisors, ad agencies, and brand teams globally.',
    color: '#f59e0b',
    cost: 20,
    icon: '🎬',
    social: {
      twitter: 'https://twitter.com/intermaven_sync',
      instagram: 'https://instagram.com/intermaven_sync',
      linkedin: 'https://linkedin.com/company/intermaven-sync'
    },
    features: [
      { label: '3 Subject Line Options', desc: 'Email subject lines optimised for open rates' },
      { label: 'Pitch Email (200–250 words)', desc: 'Tailored to the specific target — film, TV, or brand' },
      { label: 'Track Description (60 words)', desc: 'Concise, mood-led track summary for licensing databases' },
      { label: '3 Usage Scenarios', desc: 'Specific scene and placement suggestions for your track' },
      { label: 'Rights Summary', desc: 'Clear statement of what rights you\'re offering' },
      { label: 'Target-specific language', desc: 'Film supervisors, ad creatives, and brand teams speak differently' },
    ],
    steps: [
      { title: 'Describe your track', desc: 'Artist, title, genre, and mood' },
      { title: 'Choose your target', desc: 'Film/TV supervisor, ad agency, brand, or documentary' },
      { title: 'Get your pitch', desc: 'Subject lines, full email, track description, usage scenarios' },
    ],
    testimonials: [
      { quote: "Got my first sync placement in a Kenyan telco ad two weeks after using this tool.", name: 'Cedo P.', role: 'Producer, Nairobi' },
      { quote: "The usage scenarios convinced a supervisor my track fit their brief perfectly.", name: 'Niniola A.', role: 'Afrobeats artist' },
    ],
    faqs: [
      { q: 'How much does it cost?', a: '20 credits per pitch.' },
      { q: 'Does it work for instrumentals?', a: 'Yes — just describe the mood and tempo instead of lyrics.' },
      { q: 'Can I pitch the same track to different targets?', a: 'Yes — each run generates a different pitch optimised for that specific target.' },
    ],
  },
  bizpitch: {
    name: 'Pitch Deck AI',
    tagline: 'Investor-ready pitch copy in under a minute',
    description: 'Startup pitch content built for East African investment landscape — angels, banks, government grants, corporate partnerships, and accelerators.',
    color: '#8b5cf6',
    cost: 18,
    icon: '📊',
    social: {
      twitter: 'https://twitter.com/intermaven_pitch',
      instagram: 'https://instagram.com/intermaven_pitch',
      linkedin: 'https://linkedin.com/company/intermaven-pitch'
    },
    features: [
      { label: 'Problem Statement', desc: 'Investor-grade framing of the problem you solve' },
      { label: 'Solution Slide Copy', desc: 'Clear, compelling description of your solution' },
      { label: 'Market Opportunity', desc: 'Data-informed market sizing narrative' },
      { label: 'Traction Section', desc: 'How to present your metrics and milestones' },
      { label: 'Call to Action', desc: 'Specific ask tailored to the investor type' },
      { label: 'Audience-specific language', desc: 'Different framing for angels vs banks vs accelerators' },
    ],
    steps: [
      { title: 'Describe your business', desc: 'Name, sector, problem, and who you\'re pitching' },
      { title: 'AI builds your pitch', desc: '5-section pitch deck content in seconds' },
      { title: 'Drop into your deck', desc: 'Paste into PowerPoint, Google Slides, or Canva' },
    ],
    testimonials: [
      { quote: "Got into a Nairobi accelerator using the pitch copy from this tool as a starting point.", name: 'James K.', role: 'Fintech founder, Nairobi' },
      { quote: "The market opportunity section made our deck sound like we\'d hired a research firm.", name: 'Aisha N.', role: 'AgriTech startup, Kampala' },
    ],
    faqs: [
      { q: 'How much does it cost?', a: '18 credits per generation.' },
      { q: 'Does it generate the slides themselves?', a: 'It generates the text content — you paste it into your preferred design tool.' },
      { q: 'Can I use it for grant applications?', a: 'Yes — select "Government grant" as your audience for grant-specific language.' },
    ],
  },
  smartcrm: {
    name: 'Smart CRM',
    tagline: 'Turn contacts into bookings, fans, and revenue',
    description: 'A music-first CRM for artists, managers, and creative teams — manage relationships, live shows, sponsorships, and follow-up in one dashboard.',
    color: '#14b8a6',
    cost: 12,
    icon: '📇',
    slides: [
      { dot: '#14b8a6', badge: 'Smart CRM', h: 'Turn contacts into bookings, fans, and revenue', s: "A music-first CRM for artists, managers, and creative teams — manage relationships in one dashboard.", b1: 'Try free', b1link: '#', b2: 'See features', b2link: '#features' },
      { dot: '#14b8a6', badge: 'Booking Workflow', h: 'Track inquiries, proposals, and payments', s: "Streamline your booking process from initial contact to confirmed shows.", b1: 'Start tracking', b1link: '#', b2: 'View examples', b2link: '#examples' },
      { dot: '#14b8a6', badge: 'Insights Dashboard', h: 'See pipeline health and revenue outlook', s: "Monitor sponsorships, sync opportunities, and relationship momentum.", b1: 'View dashboard', b1link: '#', b2: 'Pricing', b2link: '#pricing' }
    ],
    backgrounds: [
      'linear-gradient(180deg, #14b8a622 0%, #14b8a644 50%, #08090d 100%)',
      'linear-gradient(180deg, #14b8a633 0%, #14b8a655 50%, #08090d 100%)',
      'linear-gradient(180deg, #14b8a644 0%, #14b8a666 50%, #08090d 100%)'
    ],
    social: {
      twitter: 'https://twitter.com/intermaven_crm',
      instagram: 'https://instagram.com/intermaven_crm',
      linkedin: 'https://linkedin.com/company/intermaven-crm'
    },
    features: [
      { label: 'Contact management', desc: 'Organise artists, promoters, brands, and media contacts in one place' },
      { label: 'Booking workflow', desc: 'Track inquiries, proposals, confirmations, and payments' },
      { label: 'Fan and partner tags', desc: 'Segment audiences by genre, location, and engagement' },
      { label: 'Automated follow-ups', desc: 'Save templated messages for outreach and event reminders' },
      { label: 'Deal tracking', desc: 'Monitor sponsorships, sync opportunities, and label discussions' },
      { label: 'Insights dashboard', desc: 'See pipeline health, revenue outlook, and relationship momentum' },
    ],
    steps: [
      { title: 'Add your contacts', desc: 'Enter artists, partners, venues, or media contacts' },
      { title: 'Track interactions', desc: 'Record calls, emails, shows, and tasks in one place' },
      { title: 'Close more opportunities', desc: 'Follow every lead with reminders and smart next steps' },
    ],
    testimonials: [
      { quote: "Smart CRM helped me keep track of every booking conversation without drowning in email.", name: 'Nia K.', role: 'Tour manager, Accra' },
      { quote: "We closed 4 new sponsor meetings in one month after using the pipeline dashboard.", name: 'Isaac M.', role: 'Music label operations lead, Lagos' },
    ],
    faqs: [
      { q: 'Can I use Smart CRM for both artists and events?', a: 'Yes — it is designed to manage people, partners, and show schedules together.' },
      { q: 'Is it only for music teams?', a: 'It works for brands, studios, and creative businesses that need relationship workflows.' },
      { q: 'How many contacts can I store?', a: 'The Free plan supports up to 1,500 contacts. Higher plans increase capacity.' },
    ],
  },
};

// ── FAQ Item ───────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-faq-item" onClick={() => setOpen(o => !o)}>
      <div className="app-faq-question">
        <span>{q}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {open && <div className="app-faq-answer">{a}</div>}
    </div>
  );
}

// ── Main App Landing Page ─────────────────────────────────────────
function AppLandingPage({ appId, onOpenAuth }) {
  const config = APP_CONFIGS[appId];
  const navigate = useNavigate();
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [slideState, setSlideState] = useState('in');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  const slides = config ? config.slides || [] : [];
  const backgrounds = config ? config.backgrounds || [] : [];
  const SLIDE_DURATION = 5000;
  const slideCount = slides.length;
  const currentSlideData = slides[currentSlide];
  const currentBgIndex = backgrounds.length ? currentSlide % backgrounds.length : 0;

  useEffect(() => {
    if (!config) return;
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
        setCurrentSlide((prev) => (prev + 1) % slideCount);
        setProgress(0);
        setSlideState('in');
      }, 400);
    }, SLIDE_DURATION);

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, slideCount, config]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const goToPrevSlide = () => {
    goToSlide((currentSlide - 1 + slideCount) % slideCount);
  };

  const goToNextSlide = () => {
    goToSlide((currentSlide + 1) % slideCount);
  };

  if (!config) return <div style={{ padding: 40, color: 'var(--tx)' }}>App not found</div>;

  const { name, color, cost, features, steps, testimonials, faqs, social } = config;

  return (
    <div className="app-landing">
      {/* Nav */}
      <nav className={`app-landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="app-landing-nav-inner">
          <div className={`app-landing-logo ${logoLoaded ? 'has-image' : ''}`} onClick={() => navigate('/')}>
            {logoLoaded ? (
              <img
                src={INTERMAVEN_LOGO}
                alt="Intermaven"
                className="logo-image"
                onError={() => setLogoLoaded(false)}
              />
            ) : null}
            <span className="logo-text">INTER<span>MAVEN</span></span>
          </div>
          <div className="app-nav-menu">
            <Link to="/tools" className="app-nav-link">AI Tools</Link>
            <Link to="/forum" className="app-nav-link">Community</Link>
            <Link to="/help" className="app-nav-link">Help</Link>
          </div>
          <div className="app-landing-nav-actions">
            <button className="app-nav-btn" onClick={() => onOpenAuth()}>Sign in</button>
            <button className="app-nav-btn primary" onClick={() => onOpenAuth()}>Get free →</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hw" data-testid="hero-section">
        <div className="bgs">
          {backgrounds.map((bg, i) => (
            <div
              key={i}
              className={`bg ${currentBgIndex === i ? 'on' : ''}`}
              style={{
                background: bg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
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
              <button className="hbp" onClick={() => onOpenAuth()}>
                {currentSlideData.b1}
              </button>
              <a href={currentSlideData.b2link} className="hbg">
                {currentSlideData.b2}
              </a>
            </div>
          </div>
        </div>
        
        <div className={`sui-arrows ${slideState}`}>
          <button type="button" className="slide-nav prev" onClick={goToPrevSlide} aria-label="Previous slide">‹</button>
          <button type="button" className="slide-nav next" onClick={goToNextSlide} aria-label="Next slide">›</button>
        </div>
        
        <div className={`sui-bottom ${slideState}`}>
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
                type="button"
                className={`sd ${index === currentSlide ? 'on' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="app-section">
        <h2 className="app-section-title">How it works</h2>
        <div className="app-steps">
          {steps.map((s, i) => (
            <div key={i} className="app-step">
              <div className="app-step-num" style={{ background: `${color}22`, color }}>{i + 1}</div>
              <div className="app-step-title">{s.title}</div>
              <div className="app-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="app-section alt">
        <h2 className="app-section-title">What you get</h2>
        <div className="app-features-grid">
          {features.map((f, i) => (
            <div key={i} className="app-feature-card">
              <div className="app-feature-dot" style={{ background: color }} />
              <div>
                <div className="app-feature-label">{f.label}</div>
                <div className="app-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="app-section">
        <h2 className="app-section-title">Simple pricing</h2>
        <div className="app-pricing-row">
          <div className="app-pricing-cost" style={{ color }}>
            {cost > 0 ? <><Zap size={20} /> {cost} credits per run</> : <><Star size={20} /> Always free</>}
          </div>
          <div className="app-pricing-plans">
            {[
              { plan: 'Free', price: 'KES 0', credits: 150, runs: cost > 0 ? Math.floor(150 / cost) : '∞' },
              { plan: 'Creator', price: 'KES 500', credits: 600, runs: cost > 0 ? Math.floor(600 / cost) : '∞', popular: true },
              { plan: 'Pro', price: 'KES 1,500', credits: 2500, runs: cost > 0 ? Math.floor(2500 / cost) : '∞' },
            ].map(p => (
              <div key={p.plan} className={`app-plan-card ${p.popular ? 'popular' : ''}`}>
                {p.popular && <div className="app-plan-badge" style={{ background: color }}>Most popular</div>}
                <div className="app-plan-name">{p.plan}</div>
                <div className="app-plan-price">{p.price}</div>
                <div className="app-plan-credits">{p.credits.toLocaleString()} credits</div>
                <div className="app-plan-runs" style={{ color }}>{p.runs} {cost > 0 ? 'runs' : 'unlimited'}</div>
                <button className="app-plan-btn" style={{ background: p.popular ? color : 'transparent', borderColor: color, color: p.popular ? '#fff' : color }} onClick={() => onOpenAuth()}>
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="app-section alt">
        <h2 className="app-section-title">What creators say</h2>
        <div className="app-testimonials">
          {testimonials.map((t, i) => (
            <div key={i} className="app-testimonial">
              <div className="app-testimonial-stars">{[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />)}</div>
              <p className="app-testimonial-quote">"{t.quote}"</p>
              <div className="app-testimonial-author">
                <div className="app-testimonial-name">{t.name}</div>
                <div className="app-testimonial-role">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="app-section">
        <h2 className="app-section-title">Frequently asked</h2>
        <div className="app-faq">
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="app-cta-section" style={{ background: `linear-gradient(135deg, ${color}22, var(--bg))` }}>
        <h2 className="app-cta-title">Ready to {name.split(' ')[0].toLowerCase()}?</h2>
        <p className="app-cta-sub">Join thousands of African creatives using Intermaven</p>
        <button className="app-cta-primary" style={{ background: color }} onClick={() => onOpenAuth()}>
          Get started free <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="cn">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                INTER<span>MAVEN</span>
              </div>
              <div className="footer-desc">
                AI-powered creative and business tools built for Africa's entrepreneurs and artists.
              </div>
              <div className="footer-badges">
                <span className="fbadge">music.intermaven.io</span>
                <span className="fbadge">intermaven.io</span>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Product</h4>
              <div className="footer-links">
                <a href="/tools" className="footer-link">AI Tools</a>
                <a href="/apps" className="footer-link">App Marketplace</a>
                <a href="/pricing" className="footer-link">Pricing</a>
                <span className="footer-link">API & Developers</span>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Company</h4>
              <div className="footer-links">
                <a href="/about" className="footer-link">About us</a>
                <a href="/help" className="footer-link">Help Center</a>
                <span className="footer-link">Blog</span>
                <span className="footer-link">Careers</span>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Follow us</h4>
              <div className="footer-social">
                <a 
                  href={config.social.instagram} 
                  className="sico" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  📷
                </a>
                <a 
                  href={config.social.twitter} 
                  className="sico" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                >
                  𝕏
                </a>
                <a 
                  href={config.social.linkedin} 
                  className="sico" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  in
                </a>
                <span className="sico">▶</span>
              </div>
              <div className="footer-copy">
                © {new Date().getFullYear()} Intermaven Ltd.<br />
                Nairobi, Kenya
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-links">
              <span className="fbl">Privacy Policy</span>
              <span className="fbl">Terms of Service</span>
              <span className="fbl">Cookie Policy</span>
              <span className="fbl">Refund Policy</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--mu2)' }}>
              Made with ❤ in Nairobi
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { APP_CONFIGS };
export default AppLandingPage;
