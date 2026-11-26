import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, Globe, Coins, Disc, Sliders, Headphones, Ticket,
  ArrowRight, CheckCircle2, Check, Copy, X, Clock, ShieldCheck,
  ChevronDown, UserCheck, MessageSquare, DollarSign, ExternalLink,
  BarChart3, Search, Share2, Smartphone, CreditCard
} from 'lucide-react';
import { useAuth, useToast, api } from '../../App';
import { useRegion } from '../../RegionContext';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from '../SEO';
import './AffiliatesPage.css';

const DEFAULT_MATRIX = [
  { id: 'streams', label: 'Streaming Pools & Tips', rate: '3%', tier: 'Consumption', desc: 'Recurring 3% share on verified listener streams & mid-track tips' },
  { id: 'singles', label: 'Single Lossless Downloads', rate: '5%', tier: 'Retail', desc: 'Instant 5% commission on FLAC / WAV single purchases' },
  { id: 'albums', label: 'Full Album Releases', rate: '7%', tier: 'Retail', desc: '7% share on full LP & EP digital bundle sales' },
  { id: 'stems', label: 'Producer Stems & Kits', rate: '8.5%', tier: 'Creator Tools', desc: '8.5% on multitrack stems, sample packs & beat leases' },
  { id: 'events', label: 'Live Events & Passes', rate: '10%', tier: 'Experiences', desc: '10% commission on concert tickets & VIP livestream passes' },
  { id: 'sync_onboard', label: 'Commercial Sync & Onboarding', rate: '12%', tier: 'High Yield', desc: 'Top-tier 12% on sync clearances (up to $300/deal) & creator top-ups' }
];

export default function AffiliatesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { country, language } = useRegion() || {};
  const isSw = language === 'sw';

  const [scrolled, setScrolled] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideState, setSlideState] = useState('in');
  const [progress, setProgress] = useState(0);
  const [titleHovered, setTitleHovered] = useState(false);
  const progressRef = useRef(null);
  const timerRef = useRef(null);
  const SLIDE_DURATION = 12000;

  const slides = [
    {
      dot: '#22d3ee',
      badge: '🇰🇪 Kenya Launch · East Africa & Global Affiliate Program',
      hLine1: 'Turn your network into',
      hLine2: 'recurring monthly income.',
      hLine2Color: '#22d3ee',
      s: 'Partner with Intermaven & TuneMavens. Earn 3% to 12% revenue share on every AI subscription top-up, stream, lossless album sale, sync placement, and creator onboarded. Direct M-Pesa STK payouts and global rails.',
      b1: 'Become an Affiliate',
      b1action: 'apply',
      b2: 'Calculate Earnings',
      b2action: 'scroll',
      b2target: 'aff-calculator'
    },
    {
      dot: '#8b5cf6',
      badge: '90-Day Cookie Attribution · 3 Full Months of Sales',
      hLine1: 'One shared referral link.',
      hLine2: '90 days of commission.',
      hLine2Color: '#a78bfa',
      s: 'Share creator EPKs, Brand Kit tools, or stems kits across Nairobi, Mombasa, Kampala, or worldwide. Even if your audience purchases weeks later, every checkout is credited to your ledger.',
      b1: 'View Commission Matrix',
      b1action: 'scroll',
      b1target: 'aff-matrix',
      b2: 'Check Affiliate Stats',
      b2action: 'stats'
    },
    {
      dot: '#10b981',
      badge: 'Instant M-Pesa & Global Rails · Low $20 / KES 2,600 Floor',
      hLine1: 'Fast local payouts.',
      hLine2: 'Zero payment gatekeeping.',
      hLine2Color: '#34d399',
      s: 'Cash out automatically via Safaricom M-Pesa STK push or global bank transfers (Stripe, PayPal, wire) with an ultra-accessible $20 (KES 2,600) minimum withdrawal.',
      b1: 'Apply in 2 Minutes',
      b1action: 'apply',
      b2: 'How It Works',
      b2action: 'scroll',
      b2target: 'aff-journey'
    },
    {
      dot: '#f59e0b',
      badge: 'High-Yield Commercial Sync · SyncMavens Integration',
      hLine1: 'Place African sound in TV & film.',
      hLine2: 'Earn up to $300 per placement.',
      hLine2Color: '#fbbf24',
      s: 'Connect brand sync supervisors and commercial briefs to sync-cleared Kenyan and global music. Collect top-tier 12% affiliate commission on commercial clearances and show placements.',
      b1: 'Explore Sync Platform',
      b1link: '/for/supervisor',
      b2: 'Read Affiliate FAQs',
      b2action: 'scroll',
      b2target: 'aff-faq'
    },
    {
      dot: '#c084fc',
      badge: 'Curators, DJs, Agencies & Founders · Multicultural Network',
      hLine1: 'From Nairobi to the world.',
      hLine2: 'Monetize your creative reach.',
      hLine2Color: '#c084fc',
      s: 'Whether you run Afro-house playlists, agency retainers, DJ sets in Nairobi, or creator podcasts, monetize every referral across the entire Intermaven ecosystem.',
      b1: 'Join the Partner Network',
      b1action: 'apply',
      b2: 'Check My Stats',
      b2action: 'stats'
    }
  ];

  const slideCount = slides.length;
  const currentSlideData = slides[currentSlide];

  const backgrounds = [
    'url(/images/affiliate_hero_1.png)',
    'url(/images/affiliate_hero_2.png)',
    'url(/images/affiliate_hero_3.png)',
    'url(/images/affiliate_hero_4.png)',
    'url(/images/affiliate_hero_5.png)'
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
    }, 350);
  };

  useEffect(() => {
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
      }, 350);
    }, SLIDE_DURATION);

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, slideCount]);

  // Matrix & Config State
  const [matrixData, setMatrixData] = useState(DEFAULT_MATRIX);
  const [cookieDays, setCookieDays] = useState(90);
  const [minPayoutUsd, setMinPayoutUsd] = useState(20);

  // Modals & Lookup State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCheckStatsModal, setShowCheckStatsModal] = useState(false);
  const [lookupRefCode, setLookupRefCode] = useState(user?.email || '');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Apply Form State
  const [applyForm, setApplyForm] = useState({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    handle: '',
    custom_ref: '',
    website_or_social: '',
    audience_category: 'affiliate',
    target_region: country || 'global',
    payout_method: 'mpesa',
    payout_account: user?.phone || ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccessData, setApplySuccessData] = useState(null);
  const [applyError, setApplyError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculator State
  const [calcStreams, setCalcStreams] = useState(75000);
  const [calcAlbums, setCalcAlbums] = useState(40);
  const [calcStems, setCalcStems] = useState(8);
  const [calcSync, setCalcSync] = useState(1);
  const [calcOnboarding, setCalcOnboarding] = useState(5);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Fetch Compensation Matrix on mount
  useEffect(() => {
    api.get('/api/affiliates/matrix')
      .then((res) => {
        const d = res.data;
        if (d && Array.isArray(d.matrix) && d.matrix.length > 0) {
          setMatrixData(d.matrix);
        }
        if (d?.cookie_days) setCookieDays(d.cookie_days);
        if (d?.min_payout_usd) setMinPayoutUsd(d.min_payout_usd);
      })
      .catch(() => {});
  }, []);

  // Track ?ref= click or auto-open apply modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'apply' || params.get('join') === 'true') {
      setShowApplyModal(true);
    }
    const refParam = params.get('ref');
    if (refParam) {
      try {
        localStorage.setItem('intermaven_ref', refParam);
      } catch (_) {}
      api.get(`/api/affiliates/track/${encodeURIComponent(refParam)}`).catch(() => {});
    }
  }, [location.search]);

  const handleCtaClick = (btn) => {
    if (btn.action === 'apply') {
      setShowApplyModal(true);
    } else if (btn.action === 'stats') {
      setShowCheckStatsModal(true);
    } else if (btn.action === 'scroll' && btn.target) {
      const el = document.getElementById(btn.target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (btn.link) {
      if (btn.link.startsWith('http')) {
        window.open(btn.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(btn.link);
      }
    }
  };

  const renderHeroCta = (slide, which) => {
    const label = which === 'b1' ? slide.b1 : slide.b2;
    const action = which === 'b1' ? slide.b1action : slide.b2action;
    const target = which === 'b1' ? slide.b1target : slide.b2target;
    const link = which === 'b1' ? slide.b1link : slide.b2link;
    const cls = which === 'b1' ? 'hbp' : 'hbg';

    if (action || !link) {
      return (
        <button
          type="button"
          className={cls}
          onClick={() => handleCtaClick({ action, target, link })}
          style={{ cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {label}
        </button>
      );
    }
    if (link.startsWith('http')) {
      return (
        <a href={link} className={cls} target="_blank" rel="noopener noreferrer">
          {label} <ExternalLink size={14} style={{ marginLeft: '4px' }} />
        </a>
      );
    }
    return <Link to={link} className={cls}>{label}</Link>;
  };

  const calculatedEarnings = useMemo(() => {
    const streamEarnings = calcStreams * 0.004 * 0.03;
    const albumEarnings = calcAlbums * 9.99 * 0.07;
    const stemsEarnings = calcStems * 49.00 * 0.085;
    const syncEarnings = calcSync * Math.min(2500 * 0.12, 300);
    const onboardingEarnings = calcOnboarding * 100 * 0.12;
    const totalUsd = streamEarnings + albumEarnings + stemsEarnings + syncEarnings + onboardingEarnings;
    const totalKes = totalUsd * 130;

    return {
      streamEarnings: Math.round(streamEarnings * 100) / 100,
      albumEarnings: Math.round(albumEarnings * 100) / 100,
      stemsEarnings: Math.round(stemsEarnings * 100) / 100,
      syncEarnings: Math.round(syncEarnings * 100) / 100,
      onboardingEarnings: Math.round(onboardingEarnings * 100) / 100,
      totalUsd: Math.round(totalUsd * 100) / 100,
      totalKes: Math.round(totalKes)
    };
  }, [calcStreams, calcAlbums, calcStems, calcSync, calcOnboarding]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setApplyError('Please read and accept the Terms of Service and Privacy Policy.');
      return;
    }
    const cleanName = (applyForm.name || '').trim();
    const cleanEmail = (applyForm.email || '').trim();
    if (cleanName.length < 2 || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setApplyError('Please enter your full name and a valid email address.');
      return;
    }
    setApplySubmitting(true);
    setApplyError('');

    try {
      let link = (applyForm.website_or_social || '').trim();
      if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
      if (!link) link = (applyForm.handle || '').trim() || 'https://intermaven.io';

      const payload = {
        name: cleanName,
        email: cleanEmail,
        handle: applyForm.handle,
        custom_ref: applyForm.custom_ref,
        website_or_social: link,
        audience_category: applyForm.audience_category,
        target_region: applyForm.target_region,
        payout_method: applyForm.payout_method,
        payout_details: { account: applyForm.payout_account || cleanEmail },
        accept_terms: true
      };

      const res = await api.post('/api/affiliates/apply', payload);
      const data = res.data;
      if (data && (data.status === 'success' || data.status === 'already_registered' || data.affiliate || data.ref_code)) {
        const aff = data.affiliate || data;
        setApplySuccessData({ tier: 'scout', ...aff, email: data.email || cleanEmail });
        addToast('Affiliate Partner Active', 'Your referral link is ready to share.', 'success');
      } else {
        setApplyError(data?.message || 'Registration encountered an issue. Please try again.');
      }
    } catch (err) {
      setApplyError(err.response?.data?.detail || err.message || 'Could not submit application.');
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleLookupStats = async (e) => {
    e.preventDefault();
    if (!lookupRefCode.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);

    try {
      const q = encodeURIComponent(lookupRefCode.trim());
      const res = await api.get(`/api/affiliates/me?ref_code=${q}&email=${q}`);
      const d = res.data;
      if (d?.has_affiliate_account || d?.affiliate) {
        setLookupResult({ has_affiliate_account: true, affiliate: d.affiliate || d });
      } else {
        setLookupResult({ not_found: true });
      }
    } catch (err) {
      setLookupResult({ error: err.response?.data?.detail || 'Unable to retrieve affiliate stats.' });
    } finally {
      setLookupLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    addToast('Copied', 'Referral link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const FAQS = [
    {
      q: 'Do I need platform credits to use the Affiliate Dashboard or onboard creators?',
      a: 'No. The Affiliate Dashboard, referral link generator, conversion analytics, and direct creator onboarding are 100% free and require zero credits.'
    },
    {
      q: 'How does the 90-day tracking cookie work?',
      a: 'When anyone clicks your unique referral link (e.g., intermaven.io?ref=YOURNAME), attribution persists for 90 days. Even if they return weeks later to upgrade, buy credits, or purchase stems, the commission is credited to your ledger.'
    },
    {
      q: 'How does the 3% to 12% compensation matrix work?',
      a: 'You earn 3% on stream pools & tips, 5% on single lossless downloads, 7% on full albums, 8.5% on stems kits, 10% on event passes, and 12% on commercial sync deals and creator onboarding reloads.'
    },
    {
      q: 'How and when do I get paid?',
      a: 'Commissions clear after a short verification window and can be withdrawn once you hit $20 (KES 2,600) via instant Safaricom M-Pesa STK push, PayPal, Stripe, or bank transfer.'
    }
  ];

  const matrixList = matrixData && matrixData.length > 0 ? matrixData : DEFAULT_MATRIX;

  return (
    <div className={`landing-wrapper affiliates-landing-page ${scrolled ? 'scrolled' : ''}`}>
      <SEO
        title="Affiliate & Partner Program — Earn up to 12% Revenue Share | Intermaven"
        description="Join the Intermaven & TuneMavens Affiliate Program. Earn 3% to 12% lifetime commissions with 90-day attribution and instant M-Pesa or global payouts."
        canonical="https://intermaven.io/affiliates"
      />
      <Navbar currentPage="affiliates" />

      {/* ================= HERO CAROUSEL ================= */}
      <div className="hw">
        <div className="bgs">
          {backgrounds.map((bg, idx) => (
            <div
              key={idx}
              className={`bg ${currentSlide === idx ? 'on' : ''}`}
              style={{
                backgroundImage: bg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: currentSlide === idx
                  ? (titleHovered ? 'brightness(1.05)' : 'brightness(0.85)')
                  : 'none',
                transform: currentSlide === idx && titleHovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'filter 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            />
          ))}
          <div className="bgo" style={{ opacity: titleHovered ? 0.35 : 0.78, transition: 'opacity 0.6s ease' }} />
        </div>

        <div className="hs">
          <div
            className="hcont"
            key={currentSlide}
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          >
            <div className={`he hbadge ${slideState}`}>
              <span className="bdot" style={{ background: currentSlideData.dot }} />
              {currentSlideData.badge}
            </div>
            <h1 className={`he hh1 ${slideState}`}>
              {currentSlideData.hLine1}
              <span className="hl2" style={{ color: currentSlideData.hLine2Color }}>{currentSlideData.hLine2}</span>
            </h1>
            <p className={`he hp ${slideState}`}>{currentSlideData.s}</p>
            <div className={`he hbtns ${slideState}`}>
              {renderHeroCta(currentSlideData, 'b1')}
              {renderHeroCta(currentSlideData, 'b2')}
            </div>

            <div className="carousel-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  style={{
                    width: currentSlide === idx ? '28px' : '10px',
                    height: '6px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: currentSlide === idx ? '#22d3ee' : 'rgba(255,255,255,0.28)',
                    transition: 'all 0.25s'
                  }}
                />
              ))}
            </div>
            <div style={{ width: '180px', height: '2px', background: 'rgba(255,255,255,0.12)', margin: '10px auto 0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#22d3ee' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= PARTNER BAR ================= */}
      <div className="cn" style={{ padding: '44px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '14px', padding: '18px 24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#22d3ee' }}>
              <Clock size={15} /> {cookieDays}-Day Attribution Cookie
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
              <ShieldCheck size={15} /> Min Payout: ${minPayoutUsd} (KES {(minPayoutUsd * 130).toLocaleString()})
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#c084fc' }}>
              <Smartphone size={15} /> Instant M-Pesa STK &amp; Global Rails
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setShowCheckStatsModal(true)} className="hbg" style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>
              <BarChart3 size={14} style={{ marginRight: '6px' }} /> Check Affiliate Stats
            </button>
            <button type="button" onClick={() => setShowApplyModal(true)} className="hbp" style={{ padding: '8px 18px', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
              Join Affiliate Program <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ================= 4-STEP JOURNEY ================= */}
        <section id="aff-journey" style={{ marginBottom: '56px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#22d3ee', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>How It Works</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>Four Steps to Recurring Affiliate Income</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
            {[
              { step: '01', icon: UserCheck, title: 'Instant Activation', desc: 'Submit the 2-minute application and get your unique referral code & dashboard immediately.' },
              { step: '02', icon: Share2, title: 'Share Ecosystem Links', desc: 'Promote Intermaven AI Studio, Smart CRM, Brand Kit, TuneMavens, or artist releases.' },
              { step: '03', icon: Coins, title: '90-Day Ledger Credit', desc: 'Every stream, download, sync license, and credit reload within 90 days posts to your ledger.' },
              { step: '04', icon: CreditCard, title: 'M-Pesa & Global Cashout', desc: `Withdraw from just $${minPayoutUsd} via Safaricom M-Pesa STK push, Stripe, PayPal, or wire.` }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.step} style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#22d3ee' }}>STEP {item.step}</span>
                    <IconComp size={20} style={{ color: '#10b981' }} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--mu)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= COMMISSION MATRIX ================= */}
        <section id="aff-matrix" style={{ marginBottom: '56px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>Compensation Matrix</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>3% to 12% Lifetime Revenue Share</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {matrixList.map((tier, idx) => (
              <div key={tier.id || idx} style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#22d3ee' }}>{tier.tier || tier.category || 'Commission'}</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#10b981' }}>{tier.rate || `${tier.commission_pct || 10}%`}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{tier.label || tier.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--mu)', margin: 0, lineHeight: 1.55 }}>{tier.desc || tier.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= EARNINGS CALCULATOR ================= */}
        <section id="aff-calculator" style={{ marginBottom: '56px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>Interactive Estimator</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '18px' }}>Calculate Your Monthly Affiliate Potential</h2>
              {[
                { label: 'Monthly Referred Streams (3%)', val: calcStreams, set: setCalcStreams, min: 0, max: 500000, step: 5000, fmt: (v) => v.toLocaleString() },
                { label: 'Full Albums Referred (7%)', val: calcAlbums, set: setCalcAlbums, min: 0, max: 300, step: 5, fmt: (v) => v },
                { label: 'Stems & Producer Kits (8.5%)', val: calcStems, set: setCalcStems, min: 0, max: 100, step: 1, fmt: (v) => v },
                { label: 'Sync Deals Placed (12%)', val: calcSync, set: setCalcSync, min: 0, max: 10, step: 1, fmt: (v) => v },
                { label: 'Creators Onboarded (12%)', val: calcOnboarding, set: setCalcOnboarding, min: 0, max: 50, step: 1, fmt: (v) => v }
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>{s.label}</span>
                    <strong style={{ color: '#fff' }}>{s.fmt(s.val)}</strong>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.val}
                    onChange={(e) => s.set(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ background: '#08090d', border: '1px solid var(--b2)', borderRadius: '14px', padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }}>Estimated Monthly Commission</div>
              <div style={{ fontSize: '44px', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
                ${calculatedEarnings.totalUsd.toLocaleString()}
              </div>
              <div style={{ fontSize: '15px', color: '#22d3ee', fontWeight: 700, marginTop: '6px', marginBottom: '20px' }}>
                ≈ KES {calculatedEarnings.totalKes.toLocaleString()} / month
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="hbp"
                style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: '12px 20px' }}
              >
                Start Earning Now <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal(true)}
                style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--b2)', color: '#cbd5e1', borderRadius: '6px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
              >
                Preview Affiliate Dashboard UI
              </button>
            </div>
          </div>
        </section>

        {/* ================= FAQ ACCORDION ================= */}
        <section id="aff-faq" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '24px' }}>Affiliate Program FAQs</h2>
          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'grid', gap: '12px' }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '12px', padding: '18px 22px' }}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: openFaqIndex === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openFaqIndex === idx && (
                  <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '14px', color: 'var(--mu)', lineHeight: 1.65 }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= APPLY MODAL ================= */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
            <button type="button" onClick={() => setShowApplyModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            {applySuccessData ? (
              <div>
                <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '22px', color: '#fff', fontWeight: 800, marginBottom: '8px' }}>Your Affiliate Account Is Live!</h3>
                <p style={{ fontSize: '14px', color: 'var(--mu)', marginBottom: '16px' }}>Share your unique referral link to earn 3%–12% across 90-day attribution.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#08090d', border: '1px solid var(--b2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
                  <code style={{ flex: 1, color: '#10b981', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {applySuccessData.referral_url || `${window.location.origin}/?ref=${applySuccessData.ref_code}`}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(applySuccessData.referral_url || `${window.location.origin}/?ref=${applySuccessData.ref_code}`)}
                    style={{ background: '#10b981', color: '#060813', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button type="button" onClick={() => setShowApplyModal(false)} className="hbp" style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'grid', gap: '12px' }}>
                <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 800, marginBottom: '4px' }}>Join the Affiliate Program</h3>
                <p style={{ fontSize: '13px', color: 'var(--mu)', marginBottom: '6px' }}>Free to join. Instant referral link + M-Pesa / global payouts.</p>
                {applyError && <div style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>{applyError}</div>}

                <input type="text" required placeholder="Full Name *" value={applyForm.name} onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })} style={{ padding: '10px 12px', borderRadius: '6px', background: '#08090d', border: '1px solid var(--b2)', color: '#fff' }} />
                <input type="email" required placeholder="Email Address *" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} style={{ padding: '10px 12px', borderRadius: '6px', background: '#08090d', border: '1px solid var(--b2)', color: '#fff' }} />
                <input type="text" placeholder="Social Handle or Custom Code (optional)" value={applyForm.custom_ref} onChange={(e) => setApplyForm({ ...applyForm, custom_ref: e.target.value })} style={{ padding: '10px 12px', borderRadius: '6px', background: '#08090d', border: '1px solid var(--b2)', color: '#fff' }} />
                <select value={applyForm.payout_method} onChange={(e) => setApplyForm({ ...applyForm, payout_method: e.target.value })} style={{ padding: '10px 12px', borderRadius: '6px', background: '#08090d', border: '1px solid var(--b2)', color: '#fff' }}>
                  <option value="mpesa">M-Pesa STK / Mobile Money</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank / Wire Transfer</option>
                </select>
                <input type="text" required placeholder="Payout Phone / Account *" value={applyForm.payout_account} onChange={(e) => setApplyForm({ ...applyForm, payout_account: e.target.value })} style={{ padding: '10px 12px', borderRadius: '6px', background: '#08090d', border: '1px solid var(--b2)', color: '#fff' }} />

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--mu)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required style={{ marginTop: '3px' }} />
                  <span>
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>Privacy Policy</a>.
                  </span>
                </label>

                <button type="submit" disabled={applySubmitting || !acceptedTerms} className="hbp" style={{ justifyContent: 'center', border: 'none', cursor: 'pointer', padding: '12px' }}>
                  {applySubmitting ? 'Activating...' : 'Get My Affiliate Link'} <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= STATS LOOKUP MODAL ================= */}
      {showCheckStatsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button type="button" onClick={() => setShowCheckStatsModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 800, marginBottom: '12px' }}>Check Affiliate Stats</h3>
            <form onSubmit={handleLookupStats} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="text" required placeholder="Enter ref code or email" value={lookupRefCode} onChange={(e) => setLookupRefCode(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', background: '#08090d', border: '1px solid var(--b2)', color: '#fff' }} />
              <button type="submit" disabled={lookupLoading} className="hbp" style={{ border: 'none', cursor: 'pointer', padding: '10px 16px' }}>
                <Search size={15} />
              </button>
            </form>
            {lookupResult?.has_affiliate_account && lookupResult.affiliate && (
              <div style={{ background: '#08090d', border: '1px solid var(--b2)', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#cbd5e1', display: 'grid', gap: '8px' }}>
                <div><strong>Ref Code:</strong> <span style={{ color: '#22d3ee' }}>{lookupResult.affiliate.ref_code}</span></div>
                <div><strong>Clicks:</strong> {lookupResult.affiliate.clicks || 0}</div>
                <div><strong>Conversions:</strong> {lookupResult.affiliate.conversions || 0}</div>
                <div><strong>Total Earned:</strong> <span style={{ color: '#10b981' }}>${Number(lookupResult.affiliate.total_earned_usd || 0).toFixed(2)}</span></div>
              </div>
            )}
            {lookupResult?.not_found && <p style={{ fontSize: '13px', color: '#f59e0b' }}>No affiliate record found for that code or email.</p>}
            {lookupResult?.error && <p style={{ fontSize: '13px', color: '#ef4444' }}>{lookupResult.error}</p>}
          </div>
        </div>
      )}

      {/* ================= PREVIEW DASHBOARD MODAL ================= */}
      {previewModal && (
        <div onClick={() => setPreviewModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '100%', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: '14px', padding: '16px', position: 'relative' }}>
            <button type="button" onClick={() => setPreviewModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: '#08090d', border: '1px solid var(--b2)', borderRadius: '50%', color: '#fff', width: '32px', height: '32px', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            <img
              src={isSw ? '/images/affiliate_dashboard_actual_sw.png' : '/images/affiliate_dashboard_actual_en.png'}
              alt="Intermaven Affiliate Dashboard Preview"
              style={{ width: '100%', borderRadius: '8px', display: 'block' }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
