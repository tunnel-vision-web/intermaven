import React, { useState, useEffect, useRef } from 'react';
import { api } from '../App';
import { INTERMAVEN_LOGO } from '../imageRegistry';
import {
  Globe, Layout, Search, Plus, Save, RotateCcw, History,
  Check, AlertCircle, RefreshCw, Trash2, Image, Upload,
  Bold, Italic, Underline, List, ListOrdered, Link2, Type,
  Heading1, Heading2, Folder, FileText, ChevronRight, ChevronDown,
  Sparkles, Layers, CreditCard, Shield, Phone, Mail, MapPin, Eye,
  Sliders, ArrowRight, Play, ExternalLink, Info, Edit3, Repeat, Wand2
} from 'lucide-react';

// Recommended Dimensions Mapping
const RECOMMENDED_DIMENSIONS = {
  hero: { dims: '1920 × 1080 px', aspect: '16:9 HD', format: 'JPG / WEBP', desc: 'Hero carousel background image' },
  headers: { dims: '1920 × 600 px', aspect: '3.2:1 Banner', format: 'JPG / WEBP', desc: 'Top page header banner graphic' },
  logos: { dims: '400 × 120 px', aspect: 'Transparent', format: 'PNG / SVG', desc: 'Primary site brand logo' },
  icons: { dims: '512 × 512 px', aspect: '1:1 Square', format: 'PNG / SVG', desc: 'Application & tool icon asset' },
  'site-assets': { dims: '1200 × 800 px', aspect: '3:2 Ratio', format: 'JPG / PNG', desc: 'General site media asset' }
};

// Structure of Site Pages & Sections
const SITE_PAGES = [
  {
    id: 'homepage',
    name: 'Homepage & Hero Carousel',
    icon: '🏠',
    description: 'Edit all 4 Hero Carousel slides, background images, titles, and buttons',
    sections: [
      {
        id: 'hero_slide_1',
        name: 'Slide 1 (Hero Main)',
        keys: [
          { id: 'homepage.hero.slide1.badge', label: 'Slide 1 Top Badge', type: 'text', default: 'Now live - AI tools for Africa & Beyond' },
          { id: 'homepage.hero.slide1.title', label: 'Slide 1 Headline Title (HTML enabled)', type: 'richtext', default: 'Build your brand.<br/><em style="color:#c084fc">Grow your career.</em>' },
          { id: 'homepage.hero.slide1.subtitle', label: 'Slide 1 Subtitle Paragraph', type: 'richtext', default: 'Intermaven gives musicians, creators, and entrepreneurs the AI tools to brand, market, and scale.' },
          { id: 'homepage.hero.slide1.b1', label: 'Primary Button Label', type: 'text', default: 'Try AI tools free' },
          { id: 'homepage.hero.slide1.b1link', label: 'Primary Button Link', type: 'text', default: '/tools' },
          { id: 'homepage.hero.slide1.b2', label: 'Secondary Button Label', type: 'text', default: 'See pricing' },
          { id: 'homepage.hero.slide1.b2link', label: 'Secondary Button Link', type: 'text', default: '/pricing' },
          { id: 'homepage.hero.slide1.image', label: 'Background Image URL', type: 'image_url', default: '/images/hero/intermaven/hero-1.jpg' }
        ]
      },
      {
        id: 'hero_slide_2',
        name: 'Slide 2 (Feature Focus)',
        keys: [
          { id: 'homepage.hero.slide2.badge', label: 'Slide 2 Top Badge', type: 'text', default: 'For musicians & artists' },
          { id: 'homepage.hero.slide2.title', label: 'Slide 2 Headline Title', type: 'richtext', default: 'Your music.<br/><em style="color:#22d3ee">The world\'s stage.</em>' },
          { id: 'homepage.hero.slide2.subtitle', label: 'Slide 2 Subtitle Paragraph', type: 'richtext', default: 'From a polished press kit to a Hollywood sync pitch - our AI tools help creators break through globally.' },
          { id: 'homepage.hero.slide2.b1', label: 'Primary Button Label', type: 'text', default: 'Write my press kit' },
          { id: 'homepage.hero.slide2.b1link', label: 'Primary Button Link', type: 'text', default: '/tools' },
          { id: 'homepage.hero.slide2.b2', label: 'Secondary Button Label', type: 'text', default: 'See all apps' },
          { id: 'homepage.hero.slide2.b2link', label: 'Secondary Button Link', type: 'text', default: '/apps' },
          { id: 'homepage.hero.slide2.image', label: 'Background Image URL', type: 'image_url', default: '/images/hero/intermaven/hero-2.jpg' }
        ]
      },
      {
        id: 'hero_slide_3',
        name: 'Slide 3 (Brand Kit)',
        keys: [
          { id: 'homepage.hero.slide3.badge', label: 'Slide 3 Top Badge', type: 'text', default: 'For creative brands & SMEs' },
          { id: 'homepage.hero.slide3.title', label: 'Slide 3 Headline Title', type: 'richtext', default: 'Brand it right.<br/><em style="color:#f59e0b">From day one.</em>' },
          { id: 'homepage.hero.slide3.subtitle', label: 'Slide 3 Subtitle Paragraph', type: 'richtext', default: 'Whether you are an artist, studio, or business owner - generate your full brand kit in seconds.' },
          { id: 'homepage.hero.slide3.b1', label: 'Primary Button Label', type: 'text', default: 'Generate brand kit' },
          { id: 'homepage.hero.slide3.b1link', label: 'Primary Button Link', type: 'text', default: '/tools' },
          { id: 'homepage.hero.slide3.b2', label: 'Secondary Button Label', type: 'text', default: 'Explore apps' },
          { id: 'homepage.hero.slide3.b2link', label: 'Secondary Button Link', type: 'text', default: '/apps' },
          { id: 'homepage.hero.slide3.image', label: 'Background Image URL', type: 'image_url', default: '/images/hero/intermaven/hero-3.jpg' }
        ]
      },
      {
        id: 'hero_slide_4',
        name: 'Slide 4 (Ecosystem)',
        keys: [
          { id: 'homepage.hero.slide4.badge', label: 'Slide 4 Top Badge', type: 'text', default: 'Music & Creative marketplace' },
          { id: 'homepage.hero.slide4.title', label: 'Slide 4 Headline Title', type: 'richtext', default: 'One platform.<br/><em style="color:#10b981">Every creative tool.</em>' },
          { id: 'homepage.hero.slide4.subtitle', label: 'Slide 4 Subtitle Paragraph', type: 'richtext', default: 'A growing ecosystem of apps built for artists, labels, and creatives across Africa and the diaspora.' },
          { id: 'homepage.hero.slide4.b1', label: 'Primary Button Label', type: 'text', default: 'Explore marketplace' },
          { id: 'homepage.hero.slide4.b1link', label: 'Primary Button Link', type: 'text', default: '/apps' },
          { id: 'homepage.hero.slide4.b2', label: 'Secondary Button Label', type: 'text', default: 'Our story' },
          { id: 'homepage.hero.slide4.b2link', label: 'Secondary Button Link', type: 'text', default: '/about' },
          { id: 'homepage.hero.slide4.image', label: 'Background Image URL', type: 'image_url', default: '/images/hero/intermaven/hero-1.jpg' }
        ]
      },
      {
        id: 'callouts',
        name: 'Marketplace & Feature Grid',
        keys: [
          { id: 'homepage.features.title', label: 'Features Section Title', type: 'text', default: 'AI tools for every stage of your creative career' },
          { id: 'homepage.marketplace.title', label: 'App Marketplace Title', type: 'text', default: 'Music & Creative App Marketplace' },
          { id: 'homepage.marketplace.subtitle', label: 'App Marketplace Subtitle', type: 'richtext', default: 'Standalone modules in a growing ecosystem for independent creators and businesses.' }
        ]
      }
    ]
  },
  {
    id: 'about',
    name: 'About Page',
    icon: 'ℹ️',
    description: 'Company story, mission, hours, and contact details',
    sections: [
      {
        id: 'story',
        name: 'Our Story & Mission',
        keys: [
          { id: 'about.description', label: 'Header Tagline Paragraph', type: 'richtext', default: 'Intermaven is the complete creative operating system for African musicians, creators, and entrepreneurs.' },
          { id: 'about.story_title', label: 'Story Section Title', type: 'text', default: 'Our Story' },
          { id: 'about.story_body_1', label: 'Story Paragraph 1', type: 'richtext', default: 'We built Intermaven because creators in Africa deserve world-class tools that understand their unique challenges.' },
          { id: 'about.story_body_2', label: 'Story Paragraph 2', type: 'richtext', default: 'What started as a simple EPK builder in 2024 has grown into a full operating system used by thousands of independent artists.' }
        ]
      },
      {
        id: 'contact_info',
        name: 'Contact & Business Info',
        keys: [
          { id: 'about.email_label', label: 'Email Card Label', type: 'text', default: 'EMAIL US' },
          { id: 'about.email', label: 'Primary Contact Email', type: 'text', default: 'hello@intermaven.io' },
          { id: 'about.phone_label', label: 'Phone Card Label', type: 'text', default: 'WHATSAPP / PHONE' },
          { id: 'about.business_hours', label: 'Business Hours Line', type: 'text', default: 'Mon-Fri, 9am-5pm EAT' },
          { id: 'about.based_in', label: 'Based In Location Line', type: 'text', default: 'Nairobi, Kenya' }
        ]
      }
    ]
  },
  {
    id: 'tools',
    name: 'AI Tools Page',
    icon: '🛠️',
    description: 'AI Creative Studio headlines, tool cards, and CTAs',
    sections: [
      {
        id: 'tools_header',
        name: 'Page Header & CTAs',
        keys: [
          { id: 'tools.header', label: 'Tools Page Main Title', type: 'text', default: 'AI Creative Studio' },
          { id: 'tools.subtitle', label: 'Tools Page Subtitle', type: 'richtext', default: 'Generate brand and music assets powered by AI' },
          { id: 'tools.cta', label: 'CTA Button Text', type: 'text', default: 'Start free →' },
          { id: 'tools.cta_desc', label: 'CTA Description Note', type: 'richtext', default: 'Create a free account to access all AI tools with 150 free credits. No credit card required.' }
        ]
      }
    ]
  },
  {
    id: 'apps',
    name: 'Apps Marketplace Page',
    icon: '📱',
    description: 'App Marketplace titles and category descriptions',
    sections: [
      {
        id: 'apps_header',
        name: 'Marketplace Header',
        keys: [
          { id: 'apps.header', label: 'Marketplace Header Title', type: 'text', default: 'App Marketplace' },
          { id: 'apps.subtitle', label: 'Marketplace Subtitle', type: 'richtext', default: 'Modular applications designed for music creators, managers, and business owners.' }
        ]
      }
    ]
  },
  {
    id: 'pricing',
    name: 'Pricing & Payments',
    icon: '💳',
    description: 'Plans, pricing headlines, and payment callouts',
    sections: [
      {
        id: 'pricing_callouts',
        name: 'Payment Banners & Methods',
        keys: [
          { id: 'pricing.header', label: 'Pricing Page Header Title', type: 'text', default: 'Simple, Transparent Pricing' },
          { id: 'pricing.subtitle', label: 'Pricing Page Subtitle', type: 'richtext', default: 'Choose the plan that fits your stage of growth. Upgrade or downgrade anytime.' },
          { id: 'pricing.callout.title', label: 'Payment Callout Banner Title', type: 'text', default: 'Pay instantly with M-Pesa' },
          { id: 'pricing.callout.body', label: 'Payment Callout Body', type: 'richtext', default: 'Send to Paybill 522900. Credits load the moment your payment confirms - no waiting, no approval.' },
          { id: 'pricing.payment_methods', label: 'Supported Payment Methods', type: 'text', default: 'M-Pesa, Visa, Mastercard, PayPal' }
        ]
      }
    ]
  },
  {
    id: 'header_footer',
    name: 'Header & Footer',
    icon: '⚓',
    description: 'Global site address, support phone, tagline, and social links',
    sections: [
      {
        id: 'footer_info',
        name: 'Footer Contact & Copyright',
        keys: [
          { id: 'footer.tagline', label: 'Footer Tagline', type: 'text', default: 'Made with ❤ in Nairobi' },
          { id: 'footer.contact.phone', label: 'Support Phone Number', type: 'text', default: '+254 700 000 000' },
          { id: 'footer.contact.address', label: 'Postal Address', type: 'text', default: 'Nairobi, Kenya' }
        ]
      },
      {
        id: 'social_handles',
        name: 'Social Media URLs',
        keys: [
          { id: 'social.instagram', label: 'Instagram URL', type: 'text', default: 'https://instagram.com/intermaven' },
          { id: 'social.tiktok', label: 'TikTok URL', type: 'text', default: 'https://tiktok.com/@intermaven' },
          { id: 'social.x', label: 'X (Twitter) URL', type: 'text', default: 'https://x.com/intermaven' },
          { id: 'social.linkedin', label: 'LinkedIn URL', type: 'text', default: 'https://linkedin.com/company/intermaven' }
        ]
      }
    ]
  },
  {
    id: 'help_forum',
    name: 'Help & Community',
    icon: '❓',
    description: 'Help Center and Community Forum titles and support links',
    sections: [
      {
        id: 'community_headers',
        name: 'Help & Forum Headers',
        keys: [
          { id: 'help.header', label: 'Help Center Header', type: 'text', default: 'How can we help you?' },
          { id: 'forum.header', label: 'Community Forum Header', type: 'text', default: 'Community Forum' }
        ]
      }
    ]
  }
];

// Rich Text Formatting Component
function RichTextToolbar({ onFormat, textRef }) {
  const applyTag = (startTag, endTag = '') => {
    const el = textRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selected = val.substring(start, end);
    const replacement = `${startTag}${selected || 'text'}${endTag}`;
    onFormat(val.substring(0, start) + replacement + val.substring(end));
  };

  return (
    <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', borderRadius: '4px 4px 0 0', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => applyTag('<b>', '</b>')} title="Bold" style={tbBtnStyle}><Bold size={13} /></button>
      <button type="button" onClick={() => applyTag('<i>', '</i>')} title="Italic" style={tbBtnStyle}><Italic size={13} /></button>
      <button type="button" onClick={() => applyTag('<u>', '</u>')} title="Underline" style={tbBtnStyle}><Underline size={13} /></button>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      <button type="button" onClick={() => applyTag('<em style="color:#c084fc">', '</em>')} title="Purple Highlight" style={{ ...tbBtnStyle, color: '#c084fc' }}>Purple</button>
      <button type="button" onClick={() => applyTag('<em style="color:#22d3ee">', '</em>')} title="Cyan Highlight" style={{ ...tbBtnStyle, color: '#22d3ee' }}>Cyan</button>
      <button type="button" onClick={() => applyTag('<em style="color:#10b981">', '</em>')} title="Green Highlight" style={{ ...tbBtnStyle, color: '#10b981' }}>Green</button>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      <button type="button" onClick={() => applyTag('<a href="#">', '</a>')} title="Link" style={tbBtnStyle}><Link2 size={13} /></button>
    </div>
  );
}

const tbBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#cbd5e1',
  padding: '4px 6px',
  borderRadius: '3px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 'bold'
};

const PORTAL_META = {
  global: {
    id: 'global',
    label: '🌐 Global / Default',
    shortLabel: 'GLOBAL',
    accent: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.14)',
    accentBorder: 'rgba(16, 185, 129, 0.35)',
    desc: 'Base fallback content inherited by portals or regions without a specific override.'
  },
  business: {
    id: 'business',
    label: '💼 Business',
    shortLabel: 'BUSINESS',
    accent: '#22d3ee',
    accentBg: 'rgba(34, 211, 238, 0.14)',
    accentBorder: 'rgba(34, 211, 238, 0.35)',
    desc: 'Intermaven Business — SMEs, agencies, Smart CRM, M-Pesa POS, invoicing, contracts, and AI growth.'
  },
  music: {
    id: 'music',
    label: '🎵 Music (TuneMavens)',
    shortLabel: 'MUSIC',
    accent: '#c084fc',
    accentBg: 'rgba(192, 132, 252, 0.14)',
    accentBorder: 'rgba(192, 132, 252, 0.35)',
    desc: 'TuneMavens & Intermaven Music — Artists, DJs, labels, EPK Builder, DSP distribution, sync pitches, and tours.'
  },
  hospitality: {
    id: 'hospitality',
    label: '🏨 Hospitality',
    shortLabel: 'HOSPITALITY',
    accent: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.14)',
    accentBorder: 'rgba(245, 158, 11, 0.35)',
    desc: 'Intermaven Hospitality — Restaurants, lounges, hotels, table-side POS, VIP reservations, and venue events.'
  }
};

// Built-in portal fallback content when a key does not yet have a saved portal override in MongoDB
const PORTAL_FALLBACKS = {
  business: {
    'homepage.hero.slide1.badge': 'Business tools for Nairobi SMEs & Agencies',
    'homepage.hero.slide1.title': 'Run your business.<br/><em style="color:#22d3ee">Smarter every day.</em>',
    'homepage.hero.slide1.subtitle': 'Intermaven Business gives entrepreneurs AI and operational tools — Smart CRM, invoicing, contracts, and POS — to manage, market, and scale.',
    'homepage.hero.slide1.b1': 'Explore business tools',
    'homepage.hero.slide1.b1link': '/tools',
    'homepage.hero.slide1.b2': 'See business plans',
    'homepage.hero.slide1.b2link': '/pricing',
    'homepage.hero.slide1.image': '/images/hero/intermaven/hero-1.jpg',
    'homepage.hero.slide2.badge': 'M-Pesa & Card native payments',
    'homepage.hero.slide2.title': 'Payments & invoicing<br/><em style="color:#10b981">built for growth.</em>',
    'homepage.hero.slide2.subtitle': 'Every billing tool on Intermaven Business works seamlessly with M-Pesa, Visa, Mastercard, and automated client invoices.',
    'homepage.hero.slide2.b1': 'Explore POS & Invoicing',
    'homepage.hero.slide2.b1link': '/apps',
    'homepage.hero.slide2.b2': 'Learn more',
    'homepage.hero.slide2.b2link': '/about',
    'homepage.hero.slide2.image': '/images/hero/intermaven/hero-2.jpg',
    'homepage.hero.slide3.badge': 'AI marketing & client CRM',
    'homepage.hero.slide3.title': 'Brand your business.<br/><em style="color:#f59e0b">Win more clients.</em>',
    'homepage.hero.slide3.subtitle': 'AI brand kits, legally structured business contracts, Smart CRM campaigns, and scheduled social content for modern teams.',
    'homepage.hero.slide3.b1': 'Generate brand kit',
    'homepage.hero.slide3.b1link': '/tools',
    'homepage.hero.slide3.b2': 'Contract builder',
    'homepage.hero.slide3.b2link': '/apps',
    'homepage.hero.slide3.image': '/images/hero/intermaven/hero-3.jpg',
    'homepage.hero.slide4.badge': 'The Business App Marketplace',
    'homepage.hero.slide4.title': 'One platform.<br/><em style="color:#22d3ee">Every business tool.</em>',
    'homepage.hero.slide4.subtitle': 'POS, invoicing, contracts, Smart CRM, content calendar, grant finder, and AI — unified under one business account.',
    'homepage.hero.slide4.b1': 'Explore business apps',
    'homepage.hero.slide4.b1link': '/apps',
    'homepage.hero.slide4.b2': 'Our story',
    'homepage.hero.slide4.b2link': '/about',
    'homepage.hero.slide4.image': '/images/hero/intermaven/hero-1.jpg',
    'homepage.features.title': 'AI and operational tools for modern businesses',
    'homepage.marketplace.title': 'Business App Marketplace',
    'homepage.marketplace.subtitle': 'Operational, billing, legal, and AI growth modules built for SMEs, agencies, and founders.',
    'about.description': 'Intermaven Business is the operating system for ambitious SMEs, agencies, and founders — combining AI brand building, Smart CRM, legally structured contracts, invoicing, and POS.',
    'about.story_title': 'Why We Built Intermaven Business',
    'about.story_body_1': 'Small and medium businesses shouldn\'t have to stitch together ten expensive overseas SaaS subscriptions that don\'t support local mobile money, local tax invoices, or regional workflows.',
    'about.story_body_2': 'Today, Intermaven Business powers retail shops, creative agencies, consultants, and fast-growing startups with AI marketing, automated outreach, contracts, and instant payments.',
    'about.email_label': 'BUSINESS & ENTERPRISE',
    'about.email': 'business@intermaven.io',
    'about.phone_label': 'BUSINESS DESK / WHATSAPP',
    'about.business_hours': 'Mon–Fri, 8am–6pm EAT',
    'about.based_in': 'Nairobi, Kenya · Atlanta, USA',
    'tools.header': 'AI Business & Marketing Studio',
    'tools.subtitle': 'Generate SME brand kits, client proposals, press releases, and scheduled social campaigns in seconds.',
    'tools.cta': 'Launch Business AI free →',
    'tools.cta_desc': 'Open a free business workspace with 150 AI credits for branding, contracts, and social campaigns.',
    'apps.header': 'Business App Marketplace',
    'apps.subtitle': 'Activate Smart CRM, POS, Invoicing, Business Contracts, Grant Finder, and Content Calendar in one click.',
    'pricing.header': 'Business Plans That Scale With Your Team',
    'pricing.subtitle': 'Start free with AI branding and Smart CRM, then unlock unlimited invoicing, POS, and team seats.',
    'pricing.callout.title': 'Instant M-Pesa Till, Paybill & Corporate Card Billing',
    'pricing.callout.body': 'Pay via Paybill 522900 or Visa/Mastercard. Tax-compliant receipts and team credits activate immediately.',
    'pricing.payment_methods': 'M-Pesa Paybill, Pesapal, Visa, Mastercard, Bank EFT',
    'footer.tagline': 'Powering ambitious SMEs & founders across Africa & beyond',
    'footer.contact.phone': '+254 700 100 200',
    'footer.contact.address': 'Westlands Commercial Hub · Nairobi, Kenya',
    'social.instagram': 'https://instagram.com/intermavenbusiness',
    'social.tiktok': 'https://tiktok.com/@intermaven',
    'social.x': 'https://x.com/intermaven',
    'social.linkedin': 'https://linkedin.com/company/intermaven',
    'help.header': 'Intermaven Business Help & Onboarding',
    'forum.header': 'Founders & SME Operators Community'
  },
  music: {
    'homepage.hero.slide1.badge': 'Now live - AI tools for Artists & Labels',
    'homepage.hero.slide1.title': 'Build your sound.<br/><em style="color:#c084fc">Own your music career.</em>',
    'homepage.hero.slide1.subtitle': 'TuneMavens & Intermaven Music give independent artists, DJs, and labels the AI tools to release, pitch, and monetize globally.',
    'homepage.hero.slide1.b1': 'Launch artist studio',
    'homepage.hero.slide1.b1link': '/tools',
    'homepage.hero.slide1.b2': 'Artist plans',
    'homepage.hero.slide1.b2link': '/pricing',
    'homepage.hero.slide1.image': '/images/hero/intermavenmusic/hero-1.jpg',
    'homepage.hero.slide2.badge': 'For musicians, DJs & record labels',
    'homepage.hero.slide2.title': 'Your music.<br/><em style="color:#22d3ee">The world\'s stage.</em>',
    'homepage.hero.slide2.subtitle': 'From an interactive EPK to Hollywood sync pitches and global DSP distribution tracking — break through worldwide.',
    'homepage.hero.slide2.b1': 'Build my EPK',
    'homepage.hero.slide2.b1link': '/apps',
    'homepage.hero.slide2.b2': 'Distribution tracker',
    'homepage.hero.slide2.b2link': '/apps',
    'homepage.hero.slide2.image': '/images/hero/intermavenmusic/hero-2.jpg',
    'homepage.hero.slide3.badge': 'Sync licensing, lyrics & tours',
    'homepage.hero.slide3.title': 'Book bigger tours.<br/><em style="color:#f59e0b">Land sync deals.</em>',
    'homepage.hero.slide3.subtitle': 'Manage tour routing, VIP guest lists on the TuneMavens Events Network, royalty splits, and AI lyric hooks in one studio.',
    'homepage.hero.slide3.b1': 'Plan my tour',
    'homepage.hero.slide3.b1link': '/apps',
    'homepage.hero.slide3.b2': 'Royalty calculator',
    'homepage.hero.slide3.b2link': '/apps',
    'homepage.hero.slide3.image': '/images/hero/intermavenmusic/hero-3.jpg',
    'homepage.hero.slide4.badge': 'TuneMavens Music Ecosystem',
    'homepage.hero.slide4.title': 'One login.<br/><em style="color:#c084fc">Every music platform.</em>',
    'homepage.hero.slide4.subtitle': 'Single sign-on across Intermaven, TuneMavens, TuneStream, and SyncMavens — built for artists, producers, and labels.',
    'homepage.hero.slide4.b1': 'Explore music apps',
    'homepage.hero.slide4.b1link': '/apps',
    'homepage.hero.slide4.b2': 'About TuneMavens',
    'homepage.hero.slide4.b2link': '/about',
    'homepage.hero.slide4.image': '/images/hero/intermavenmusic/hero-1.jpg',
    'homepage.features.title': 'AI studio & release tools for every stage of your music career',
    'homepage.marketplace.title': 'TuneMavens Music & Creator Marketplace',
    'homepage.marketplace.subtitle': 'EPK, DSP distribution, sync pitching, tour routing, and royalty tools for artists and labels.',
    'about.description': 'Intermaven Music & TuneMavens empower independent artists, DJs, producers, and labels with AI press kits, global distribution tracking, sync licensing, and tour management.',
    'about.story_title': 'The TuneMavens & Intermaven Music Story',
    'about.story_body_1': 'Independent musicians and labels across Africa and the diaspora deserve direct access to global DSP tracking, Hollywood sync briefs, press-ready EPKs, and transparent royalty splits.',
    'about.story_body_2': 'Connected natively with TuneMavens, TuneStream, and SyncMavens, our studio suite helps thousands of creators turn raw recordings into sustainable global music careers.',
    'about.email_label': 'ARTIST & LABEL DESK',
    'about.email': 'hello@tunemavens.com',
    'about.phone_label': 'ARTIST RELATIONS / WHATSAPP',
    'about.business_hours': 'Mon–Sat, 10am–7pm EAT',
    'about.based_in': 'Nairobi · Lagos · Johannesburg · Atlanta',
    'tools.header': 'AI Music, Bio & Sync Studio',
    'tools.subtitle': 'Write press-ready artist bios, sync licensing pitches, lyric hooks, merch briefs, and release press kits.',
    'tools.cta': 'Launch Artist Studio free →',
    'tools.cta_desc': 'Create your free artist account with 150 credits for bios, sync pitches, hooks, and EPK copy.',
    'apps.header': 'Music & Creator App Marketplace',
    'apps.subtitle': 'Activate EPK Builder, Distribution Tracker, Tour Manager, Royalty Calculator, and Lyric AI in one workspace.',
    'pricing.header': 'Creator & Label Plans Built for Releases',
    'pricing.subtitle': 'Start with 150 free studio credits. Upgrade for unlimited EPKs, DSP distribution tracking, and sync pitches.',
    'pricing.callout.title': 'Top up studio credits instantly via M-Pesa or Card',
    'pricing.callout.body': 'Send to Paybill 522900 or pay by card — your AI credits and distribution slots unlock in seconds.',
    'pricing.payment_methods': 'M-Pesa, Visa, Mastercard, PayPal',
    'footer.tagline': 'Built for independent artists, DJs & labels worldwide',
    'footer.contact.phone': '+254 700 300 400',
    'footer.contact.address': 'Kilimani Creative Studios · Nairobi, Kenya',
    'social.instagram': 'https://instagram.com/tunemavens',
    'social.tiktok': 'https://tiktok.com/@tunemavens',
    'social.x': 'https://x.com/tunemavens',
    'social.linkedin': 'https://linkedin.com/company/tunemavens',
    'help.header': 'Artist, Label & TuneMavens Support',
    'forum.header': 'Artists, Producers & Labels Community'
  },
  hospitality: {
    'homepage.hero.slide1.badge': 'Hospitality OS for Restaurants, Lounges & Hotels',
    'homepage.hero.slide1.title': 'Run your venue.<br/><em style="color:#f59e0b">Delight every guest.</em>',
    'homepage.hero.slide1.subtitle': 'Intermaven Hospitality powers restaurants, bars, lounges, and boutique hotels with table-side POS, VIP bookings, and AI guest marketing.',
    'homepage.hero.slide1.b1': 'Launch venue POS',
    'homepage.hero.slide1.b1link': '/apps',
    'homepage.hero.slide1.b2': 'Book venue demo',
    'homepage.hero.slide1.b2link': '/pricing',
    'homepage.hero.slide1.image': '/images/hero/intermaven/hero-2.jpg',
    'homepage.hero.slide2.badge': 'Table-side M-Pesa & Tab Management',
    'homepage.hero.slide2.title': 'Faster table turns.<br/><em style="color:#10b981">Zero bill friction.</em>',
    'homepage.hero.slide2.subtitle': 'Split tabs, kitchen & bar routing, QR digital menus, and instant M-Pesa STK or card settlement from any tablet.',
    'homepage.hero.slide2.b1': 'Explore Hospitality POS',
    'homepage.hero.slide2.b1link': '/apps',
    'homepage.hero.slide2.b2': 'See venue features',
    'homepage.hero.slide2.b2link': '/about',
    'homepage.hero.slide2.image': '/images/hero/intermaven/hero-3.jpg',
    'homepage.hero.slide3.badge': 'VIP Reservations, Events & Nightlife',
    'homepage.hero.slide3.title': 'Pack every night.<br/><em style="color:#f59e0b">Own your guest list.</em>',
    'homepage.hero.slide3.subtitle': 'Manage table bookings, bottle-service VIP RSVPs, resident DJ lineups, and automated WhatsApp/email guest retention.',
    'homepage.hero.slide3.b1': 'Manage VIP & events',
    'homepage.hero.slide3.b1link': '/apps',
    'homepage.hero.slide3.b2': 'Hospitality CRM',
    'homepage.hero.slide3.b2link': '/smartcrm',
    'homepage.hero.slide3.image': '/images/hero/intermaven/hero-1.jpg',
    'homepage.hero.slide4.badge': 'Connected Venue Ecosystem',
    'homepage.hero.slide4.title': 'One system.<br/><em style="color:#10b981">Front house to back office.</em>',
    'homepage.hero.slide4.subtitle': 'Connect POS inventory, staff shifts, vendor invoices, live entertainment calendars, and social promos in one hub.',
    'homepage.hero.slide4.b1': 'Explore venue apps',
    'homepage.hero.slide4.b1link': '/apps',
    'homepage.hero.slide4.b2': 'Talk to sales',
    'homepage.hero.slide4.b2link': '/about',
    'homepage.hero.slide4.image': '/images/hero/intermaven/hero-2.jpg',
    'homepage.features.title': 'POS, reservations, and AI marketing for hospitality venues',
    'homepage.marketplace.title': 'Hospitality & Venue App Suite',
    'homepage.marketplace.subtitle': 'Point-of-sale, digital menus, VIP table bookings, event calendars, and guest CRM for venues.',
    'about.description': 'Intermaven Hospitality brings unified POS, M-Pesa table payments, VIP guest list management, and AI event marketing to restaurants, lounges, clubs, and boutique hotels.',
    'about.story_title': 'Reinventing Hospitality Operations',
    'about.story_body_1': 'Great hospitality venues thrive on speed, ambiance, and loyal regulars — yet legacy POS systems remain clunky, offline-hostile, and disconnected from event marketing.',
    'about.story_body_2': 'From Nairobi rooftop lounges to boutique coastal hotels, Intermaven Hospitality connects front-of-house POS, VIP reservations, live DJ programming, and guest CRM in one cloud.',
    'about.email_label': 'HOSPITALITY ONBOARDING',
    'about.email': 'hospitality@intermaven.io',
    'about.phone_label': '24/7 VENUE SUPPORT',
    'about.business_hours': '24/7 Live Venue Support · EAT',
    'about.based_in': 'Nairobi · Mombasa · Kigali',
    'tools.header': 'AI Hospitality Menu, Promo & Guest Studio',
    'tools.subtitle': 'Craft irresistible menu descriptions, weekend event promos, VIP invite copy, and hospitality brand kits.',
    'tools.cta': 'Try Venue AI free →',
    'tools.cta_desc': 'Start free with 150 AI credits to promote your restaurant, lounge, hotel, or upcoming event night.',
    'apps.header': 'Hospitality & Venue App Marketplace',
    'apps.subtitle': 'Activate Hospitality POS, VIP Event Manager, Guest Smart CRM, Invoicing, and Social Promo Calendar.',
    'pricing.header': 'Venue & Multi-Branch Hospitality Pricing',
    'pricing.subtitle': 'Transparent per-venue pricing with unlimited POS terminals, M-Pesa STK push, and VIP booking tools.',
    'pricing.callout.title': 'Zero-downtime M-Pesa & Card settlement for venues',
    'pricing.callout.body': 'Activate POS registers and hospitality modules instantly via Paybill 522900 or corporate card.',
    'pricing.payment_methods': 'M-Pesa Till/Paybill, Visa, Mastercard, Corporate Invoice',
    'footer.tagline': 'Crafted for restaurants, lounges, hotels & live venues',
    'footer.contact.phone': '+254 700 500 600',
    'footer.contact.address': 'Riverside Hospitality Suite · Nairobi, Kenya',
    'social.instagram': 'https://instagram.com/intermavenhospitality',
    'social.tiktok': 'https://tiktok.com/@intermavenhospitality',
    'social.x': 'https://x.com/intermavenhosp',
    'social.linkedin': 'https://linkedin.com/company/intermaven-hospitality',
    'help.header': 'Hospitality POS & Venue Support Center',
    'forum.header': 'Hospitality Owners & Venue Managers Hub'
  }
};

// ── Interactive Live Hero Carousel Preview Component ────────────────
function LiveHeroPreview({ slideNum, slideData, activePortal }) {
  const portalMeta = PORTAL_META[activePortal] || PORTAL_META.global;
  const defaultImg = activePortal === 'music'
    ? `/images/hero/intermavenmusic/hero-${((slideNum - 1) % 3) + 1}.jpg`
    : `/images/hero/intermaven/hero-${((slideNum - 1) % 3) + 1}.jpg`;
  const bgImg = slideData.image || defaultImg;

  return (
    <div style={{
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      border: `1px solid ${portalMeta.accentBorder}`,
      minHeight: '220px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundImage: `linear-gradient(rgba(8, 9, 13, 0.72), rgba(8, 9, 13, 0.86)), url(${bgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      marginBottom: '20px',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.7)', border: `1px solid ${portalMeta.accentBorder}`, borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', color: portalMeta.accent }}>
        <Eye size={12} /> LIVE PREVIEW (SLIDE {slideNum} · {portalMeta.shortLabel})
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: portalMeta.accentBg, border: `1px solid ${portalMeta.accentBorder}`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold', color: portalMeta.accent, width: 'fit-content', marginBottom: '10px' }}>
        <span>●</span> {slideData.badge || 'Now live'}
      </div>

      <h3
        style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px', color: '#ffffff', lineHeight: 1.2 }}
        dangerouslySetInnerHTML={{ __html: slideData.title || 'Hero Slide Headline' }}
      />

      <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 16px', maxWidth: '540px', lineHeight: 1.45 }}>
        {slideData.subtitle || 'Hero slide description paragraph preview.'}
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <span style={{ padding: '8px 16px', background: portalMeta.accent, color: '#000000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {slideData.b1 || 'Primary CTA'} →
        </span>
        <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
          {slideData.b2 || 'Secondary CTA'}
        </span>
      </div>
    </div>
  );
}

function CMSEditor() {
  // Navigation & Portal Selection
  const [activePortal, setActivePortal] = useState('global');
  const [activeTab, setActiveTab] = useState('homepage');
  const [activeRegion, setActiveRegion] = useState('DEFAULT');
  const [previewSlideNum, setPreviewSlideNum] = useState(1);

  // CMS Keys & Media Data
  const [cmsKeys, setCmsKeys] = useState({});
  const [mediaList, setMediaList] = useState([]);
  const [mediaFilterCategory, setMediaFilterCategory] = useState('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKeyId, setSavingKeyId] = useState(null);
  const [savedSuccessKeyId, setSavedSuccessKeyId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Currently Focused Key in Editor
  const [focusedKeyId, setFocusedKeyId] = useState('homepage.hero.slide1.title');

  // Per-Key Draft Values
  const [keyDrafts, setKeyDrafts] = useState({});

  // Media Upload & Replace State
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [targetPickerKeyId, setTargetPickerKeyId] = useState(null);
  const [replacingAssetId, setReplacingAssetId] = useState(null);

  // AI Assistant Drawer / Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTargetKeyId, setAiTargetKeyId] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('hype');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // History Modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Raw Keys Search
  const [rawSearch, setRawSearch] = useState('');

  const textareaRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Fetch CMS Keys & Media Catalog
  const loadData = async () => {
    setLoading(true);
    try {
      const [keysRes, mediaRes] = await Promise.all([
        api.get('/api/admin/cms').catch(() => ({ data: { keys: [] } })),
        api.get('/api/admin/cms/media').catch(() => ({ data: { media: [] } }))
      ]);

      const keysArray = keysRes.data?.keys || [];
      const keysMap = {};
      keysArray.forEach(k => {
        const id = k._id || k.key;
        keysMap[id] = k;
      });
      setCmsKeys(keysMap);
      setMediaList(mediaRes.data?.media || []);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
      setMsg({ type: 'error', text: 'Error connecting to CMS backend' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectKey = (keyId) => {
    setFocusedKeyId(keyId);
    setHistoryOpen(false);
  };

  const getDraftScopeKey = (kId, portal = activePortal, region = activeRegion) =>
    `${portal}::${region}::${kId}`;

  const setScopedDraft = (kId, val) => {
    const scopeKey = getDraftScopeKey(kId);
    setKeyDrafts(prev => ({ ...prev, [scopeKey]: val }));
  };

  const clearScopedDraft = (kId, portal = activePortal, region = activeRegion) => {
    const scopeKey = getDraftScopeKey(kId, portal, region);
    setKeyDrafts(prev => {
      if (!(scopeKey in prev)) return prev;
      const next = { ...prev };
      delete next[scopeKey];
      return next;
    });
  };

  const getResolvedInfo = (kId, fallbackDef = '') => {
    const scopeKey = getDraftScopeKey(kId);
    if (keyDrafts[scopeKey] !== undefined && keyDrafts[scopeKey] !== null) {
      return { value: keyDrafts[scopeKey], source: 'Unsaved Draft', isDraft: true };
    }
    const kObj = cmsKeys[kId];
    const reg = activeRegion === 'DEFAULT' ? '' : activeRegion;

    if (activePortal !== 'global') {
      const pObj = kObj?.portals?.[activePortal];
      if (pObj) {
        if (reg && pObj[reg] !== undefined && pObj[reg] !== '') {
          return { value: pObj[reg], source: `${activePortal.toUpperCase()} · ${reg} Override`, isDraft: false };
        }
        if (pObj.default !== undefined && pObj.default !== '') {
          return { value: pObj.default, source: `${activePortal.toUpperCase()} Portal`, isDraft: false };
        }
      }
      const builtinPortalVal = PORTAL_FALLBACKS[activePortal]?.[kId];
      if (builtinPortalVal !== undefined) {
        return { value: builtinPortalVal, source: `${activePortal.toUpperCase()} Default`, isDraft: false };
      }
    }

    if (kObj) {
      if (reg && kObj.regions?.[reg] !== undefined && kObj.regions[reg] !== '') {
        return { value: kObj.regions[reg], source: `Global · ${reg} Region`, isDraft: false };
      }
      if (kObj.default !== undefined && kObj.default !== null) {
        return {
          value: kObj.default,
          source: activePortal === 'global' ? 'Global Default' : 'Inherited from Global',
          isDraft: false
        };
      }
    }
    return { value: fallbackDef, source: 'System Fallback', isDraft: false };
  };

  const getResolvedValue = (kId, fallbackDef = '') => getResolvedInfo(kId, fallbackDef).value;

  // 1-Click Per-Field Save Handler
  const handleSaveSingleKey = async (keyId, currentVal, fallbackDef = '') => {
    setSavingKeyId(keyId);
    setSavedSuccessKeyId(null);
    setMsg({ type: '', text: '' });
    try {
      const existingObj = cmsKeys[keyId] || {};
      const baseDefault = existingObj.default !== undefined ? existingObj.default : fallbackDef;
      let payload = {
        default: (activePortal === 'global' && activeRegion === 'DEFAULT') ? currentVal : baseDefault,
        description: existingObj.description || `Key for ${keyId}`,
        regions: { ...(existingObj.regions || {}) },
        portals: { ...(existingObj.portals || {}) }
      };

      if (activePortal !== 'global') {
        payload.portals = {
          ...payload.portals,
          [activePortal]: {
            ...(payload.portals?.[activePortal] || {}),
            [activeRegion === 'DEFAULT' ? 'default' : activeRegion]: currentVal
          }
        };
      } else if (activeRegion !== 'DEFAULT') {
        payload.regions = {
          ...payload.regions,
          [activeRegion]: currentVal
        };
      }

      const res = await api.put(`/api/admin/cms/${keyId}`, payload);
      const savedObj = res.data;
      setCmsKeys(prev => ({ ...prev, [keyId]: savedObj }));
      clearScopedDraft(keyId);
      setSavedSuccessKeyId(keyId);
      setTimeout(() => setSavedSuccessKeyId(null), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || `Failed to save "${keyId}"` });
    } finally {
      setSavingKeyId(null);
    }
  };

  // Ask AI Generation Handler
  const handleOpenAiAssistant = (keyId) => {
    setAiTargetKeyId(keyId);
    setAiPrompt('');
    setAiSuggestion('');
    setAiModalOpen(true);
  };

  const handleGenerateAiCopy = async () => {
    if (!aiTargetKeyId) return;
    setAiGenerating(true);
    setAiSuggestion('');
    try {
      const currentVal = getResolvedValue(aiTargetKeyId, '');
      const payload = {
        key_id: aiTargetKeyId,
        current_text: currentVal,
        prompt: aiPrompt,
        tone: aiTone,
        target_portal: activePortal
      };
      const res = await api.post('/api/ai/cms-assist', payload);
      setAiSuggestion(res.data?.suggestion || '');
    } catch (err) {
      alert('AI Generation failed. Check connection.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiTargetKeyId || !aiSuggestion) return;
    setScopedDraft(aiTargetKeyId, aiSuggestion);
    setAiModalOpen(false);
  };

  const handleMediaFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const payload = {
          name: file.name,
          data_url: reader.result,
          file_type: file.type.startsWith('image/') ? 'image' : 'file',
          category: 'site-assets'
        };
        const res = await api.post('/api/admin/cms/media', payload);
        setMediaList(prev => [res.data, ...prev]);
        setMsg({ type: 'success', text: `Uploaded site media asset "${file.name}"!` });
      } catch (err) {
        alert('Failed to upload site media file');
      } finally {
        setUploadingMedia(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceAssetTrigger = (assetId) => {
    setReplacingAssetId(assetId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceAssetFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingAssetId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const newUrl = reader.result;
        setMediaList(prev => prev.map(m => m.id === replacingAssetId ? { ...m, url: newUrl } : m));
        setMsg({ type: 'success', text: `Replaced media asset image successfully!` });
      } catch (err) {
        alert('Failed to replace image');
      } finally {
        setReplacingAssetId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMedia = async (assetId) => {
    if (!window.confirm('Delete this site media asset from catalog?')) return;
    try {
      if (!assetId.startsWith('builtin-')) {
        await api.delete(`/api/admin/cms/media/${assetId}`).catch(() => {});
      }
      setMediaList(prev => prev.filter(m => m.id !== assetId));
      setMsg({ type: 'success', text: 'Deleted media asset from catalog' });
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const pickMediaForField = (assetUrl) => {
    if (targetPickerKeyId) {
      setScopedDraft(targetPickerKeyId, assetUrl);
    }
    setMediaPickerOpen(false);
  };

  const fetchHistory = async () => {
    if (!focusedKeyId) return;
    setHistoryOpen(true);
    try {
      const res = await api.get(`/api/admin/cms/${focusedKeyId}/history`);
      setHistoryList(res.data?.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRollback = async (revisionId) => {
    if (!window.confirm('Rollback to this historic revision?')) return;
    try {
      const res = await api.post(`/api/admin/cms/${focusedKeyId}/rollback/${revisionId}`);
      const savedObj = res.data;
      setCmsKeys(prev => ({ ...prev, [focusedKeyId]: savedObj }));
      setKeyDrafts(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (k.endsWith(`::${focusedKeyId}`)) delete next[k];
        });
        return next;
      });
      setMsg({ type: 'success', text: 'Rolled back key successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Rollback failed' });
    }
  };

  const currentPageObj = SITE_PAGES.find(p => p.id === activeTab);
  const activePortalMeta = PORTAL_META[activePortal] || PORTAL_META.global;

  const getSlidePreviewData = (num) => {
    const prefix = `homepage.hero.slide${num}`;
    return {
      badge: getResolvedValue(`${prefix}.badge`, 'Now live - AI tools'),
      title: getResolvedValue(`${prefix}.title`, 'Build your brand.<br/><em style="color:#c084fc">Grow your career.</em>'),
      subtitle: getResolvedValue(`${prefix}.subtitle`, 'Intermaven gives musicians and creatives AI tools to brand and scale.'),
      b1: getResolvedValue(`${prefix}.b1`, 'Try AI tools free'),
      b2: getResolvedValue(`${prefix}.b2`, 'See pricing'),
      image: getResolvedValue(`${prefix}.image`, `/images/hero/intermaven/hero-${((num - 1) % 3) + 1}.jpg`)
    };
  };

  const filteredMedia = mediaList.filter(m => {
    const matchCat = mediaFilterCategory === 'all' || m.category === mediaFilterCategory;
    const matchSearch = (m.name || '').toLowerCase().includes(mediaSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#0b0c10', color: '#f0f0f5', borderRadius: '10px', padding: '24px', minHeight: '750px', border: '1px solid rgba(255,255,255,0.08)' }}>
      
      {/* Hidden File Input for Image Replacement */}
      <input type="file" ref={replaceFileInputRef} accept="image/*" onChange={handleReplaceAssetFile} style={{ display: 'none' }} />

      {/* ── TOP HEADER BAR WITH OFFICIAL LOGO & PORTAL SWITCHER ────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${activePortalMeta.accentBg}, rgba(59, 130, 246, 0.08))`, border: `1px solid ${activePortalMeta.accentBorder}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', transition: 'all 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src={INTERMAVEN_LOGO} alt="Intermaven Logo" style={{ height: '36px', objectFit: 'contain' }} />
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={18} style={{ color: activePortalMeta.accent }} /> Mother-CMS Control Center
            </h2>
            <p style={{ fontSize: '12px', color: '#9096b8', margin: '2px 0 0' }}>
              {activePortalMeta.desc}
            </p>
          </div>
        </div>

        {/* Portal Selector Pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.45)', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
          {Object.values(PORTAL_META).map(p => {
            const isActive = activePortal === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePortal(p.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: isActive ? `1px solid ${p.accent}` : '1px solid transparent',
                  background: isActive ? p.accent : 'transparent',
                  color: isActive ? '#000000' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Region Target Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#60a5fa', textTransform: 'uppercase' }}>Target Region:</span>
          <select
            value={activeRegion}
            onChange={(e) => setActiveRegion(e.target.value)}
            style={{ padding: '6px 12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
          >
            <option value="DEFAULT">Global (Fallback)</option>
            <option value="US">🇺🇸 United States (US)</option>
            <option value="KE">🇰🇪 Kenya (KE)</option>
            <option value="GB">🇬🇧 United Kingdom (GB)</option>
            <option value="CA">🇨🇦 Canada (CA)</option>
            <option value="NG">🇳🇬 Nigeria (NG)</option>
            <option value="ZA">🇿🇦 South Africa (ZA)</option>
          </select>
        </div>
      </div>

      {/* Global Status Notification */}
      {msg.text && (
        <div style={{
          padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
          background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${msg.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: msg.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* ── MAIN WORKSPACE GRID: LEFT PAGE TREE SIDEBAR + RIGHT CONTENT EDITOR ──── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>

        {/* LEFT COLUMN: PAGE NAVIGATION TREE */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#9096b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Site Pages & Sections
          </div>

          {/* Page Tree Links */}
          {SITE_PAGES.map(page => (
            <button
              key={page.id}
              type="button"
              onClick={() => {
                setActiveTab(page.id);
                if (page.sections?.[0]?.keys?.[0]?.id) {
                  selectKey(page.sections[0].keys[0].id);
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                textAlign: 'left',
                border: activeTab === page.id ? `1px solid ${activePortalMeta.accent}` : '1px solid transparent',
                background: activeTab === page.id ? activePortalMeta.accentBg : 'transparent',
                color: activeTab === page.id ? activePortalMeta.accent : '#f0f0f5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{page.icon}</span>
                <span>{page.name}</span>
              </div>
              <ChevronRight size={14} style={{ opacity: activeTab === page.id ? 1 : 0.4 }} />
            </button>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 0' }} />

          {/* Site Media Library Link */}
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              textAlign: 'left',
              border: activeTab === 'media' ? '1px solid #60a5fa' : '1px solid transparent',
              background: activeTab === 'media' ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
              color: activeTab === 'media' ? '#60a5fa' : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Image size={18} style={{ color: '#60a5fa' }} />
            <span>Site Media Assets ({mediaList.length})</span>
          </button>

          {/* Raw Keys Mode Link */}
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              textAlign: 'left',
              border: activeTab === 'raw' ? '1px solid #a855f7' : '1px solid transparent',
              background: activeTab === 'raw' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'raw' ? '#c084fc' : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Layers size={18} style={{ color: '#c084fc' }} />
            <span>Developer Raw Keys View</span>
          </button>
        </div>

        {/* RIGHT COLUMN: CONTENT EDITOR & PREVIEW PANE */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '24px' }}>
          
          {/* TAB 1: HOMEPAGE / HERO CAROUSEL EDITOR */}
          {currentPageObj ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{currentPageObj.icon}</span> Editing {currentPageObj.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9096b8', margin: '4px 0 0' }}>{currentPageObj.description}</p>
                </div>

                {/* Active Context Pill */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: activePortalMeta.accentBg,
                  border: `1px solid ${activePortalMeta.accentBorder}`,
                  color: activePortalMeta.accent,
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  <span>{activePortalMeta.label}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ color: '#f0f0f5' }}>{activeRegion === 'DEFAULT' ? 'Global Fallback' : activeRegion}</span>
                </div>
              </div>

              {/* LIVE HERO CAROUSEL PREVIEW (For Homepage) */}
              {activeTab === 'homepage' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: activePortalMeta.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Interactive Hero Carousel Live Preview ({activePortalMeta.shortLabel})
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPreviewSlideNum(num)}
                          style={{
                            padding: '3px 10px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            border: previewSlideNum === num ? `1px solid ${activePortalMeta.accent}` : '1px solid rgba(255,255,255,0.1)',
                            background: previewSlideNum === num ? activePortalMeta.accentBg : 'transparent',
                            color: previewSlideNum === num ? activePortalMeta.accent : '#9096b8',
                            cursor: 'pointer'
                          }}
                        >
                          Slide {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <LiveHeroPreview
                    slideNum={previewSlideNum}
                    slideData={getSlidePreviewData(previewSlideNum)}
                    activePortal={activePortal}
                  />
                </div>
              )}

              {/* Sections Accordion & Form Fields */}
              {currentPageObj.sections.map(sec => (
                <div key={sec.id} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '18px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: activePortalMeta.accent, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Folder size={16} /> {sec.name}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {sec.keys.map(kDef => {
                      const isFocused = focusedKeyId === kDef.id;
                      const resolved = getResolvedInfo(kDef.id, kDef.default);
                      const draftVal = resolved.value;
                      const isSaving = savingKeyId === kDef.id;
                      const isSaved = savedSuccessKeyId === kDef.id;

                      return (
                        <div
                          key={`${activePortal}-${activeRegion}-${kDef.id}`}
                          onClick={() => selectKey(kDef.id)}
                          style={{
                            padding: '16px',
                            borderRadius: '6px',
                            background: isFocused ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255,255,255,0.01)',
                            border: isFocused ? `1px solid ${activePortalMeta.accentBorder}` : '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Block Header with Label + Action Buttons */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{kDef.label}</span>
                              <span style={{ fontSize: '11px', color: '#9096b8', fontFamily: 'monospace' }}>({kDef.id})</span>
                              {resolved.isDraft && (
                                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                                  Unsaved edit
                                </span>
                              )}
                              {isSaved && <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><Check size={13} /> Saved!</span>}
                            </label>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {resolved.isDraft && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); clearScopedDraft(kDef.id); }}
                                  style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '4px', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <RotateCcw size={11} /> Reset
                                </button>
                              )}
                              {kDef.type === 'image_url' && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setTargetPickerKeyId(kDef.id); setMediaPickerOpen(true); }}
                                  style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '4px', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Image size={12} /> Pick Image Asset
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); selectKey(kDef.id); fetchHistory(); }}
                                style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <History size={12} /> History
                              </button>

                              {/* PROMINENT DIRECT PER-FIELD SAVE BUTTON */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleSaveSingleKey(kDef.id, draftVal, kDef.default); }}
                                disabled={isSaving}
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  background: activePortalMeta.accent,
                                  border: 'none',
                                  borderRadius: '4px',
                                  color: '#000000',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                                }}
                              >
                                <Save size={13} /> {isSaving ? 'Saving...' : `Save (${activePortalMeta.shortLabel})`}
                              </button>

                              {/* ASK AI ASSISTANT BUTTON */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); selectKey(kDef.id); handleOpenAiAssistant(kDef.id); }}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(59, 130, 246, 0.25))',
                                  border: '1px solid #a855f7',
                                  borderRadius: '4px',
                                  color: '#c084fc',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Sparkles size={12} /> Ask AI
                              </button>
                            </div>
                          </div>

                          {/* Rich Text Editor or Standard Input */}
                          {kDef.type === 'richtext' ? (
                            <div>
                              <RichTextToolbar
                                textRef={textareaRef}
                                onFormat={(newVal) => {
                                  setScopedDraft(kDef.id, newVal);
                                }}
                              />
                              <textarea
                                ref={isFocused ? textareaRef : null}
                                rows={3}
                                value={draftVal}
                                onChange={(e) => {
                                  setScopedDraft(kDef.id, e.target.value);
                                }}
                                placeholder={`Enter ${kDef.label}...`}
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 4px 4px', color: '#ffffff', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={draftVal}
                              onChange={(e) => {
                                setScopedDraft(kDef.id, e.target.value);
                              }}
                              placeholder={`Enter ${kDef.label}...`}
                              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                            />
                          )}

                          {/* Live Portal & Region Resolved Preview Badge */}
                          <div style={{ marginTop: '8px', fontSize: '11px', color: '#9096b8', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <Eye size={12} style={{ color: activePortalMeta.accent }} />
                            <span>Source: <strong style={{ color: activePortalMeta.accent }}>{resolved.source}</strong></span>
                            <span style={{ opacity: 0.5 }}>·</span>
                            <span>Resolved for {activePortalMeta.shortLabel} ({activeRegion}):</span>
                            <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>"{draftVal || '(Empty)'}"</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'media' ? (

            /* TAB 2: COMPLETE SITE MEDIA CATALOG (WITH REPLACE, HOVER DIMENSIONS, DELETE) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image size={22} style={{ color: '#60a5fa' }} /> Site Media Asset Library
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9096b8', margin: '4px 0 0' }}>
                    Hover over any asset card to view recommended dimensions. Click "Replace" to upload a new asset variant.
                  </p>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3b82f6', color: '#ffffff', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <Upload size={16} /> {uploadingMedia ? 'Uploading...' : 'Upload Site Asset'}
                  <input type="file" accept="image/*" onChange={handleMediaFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Category Filter Pills & Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'all', label: 'All Assets' },
                    { id: 'hero', label: '🖼️ Hero Backgrounds' },
                    { id: 'headers', label: '🌄 Page Banners' },
                    { id: 'logos', label: '✨ Logos' },
                    { id: 'icons', label: '🧩 App Icons' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setMediaFilterCategory(cat.id)}
                      style={{
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        border: mediaFilterCategory === cat.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                        background: mediaFilterCategory === cat.id ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                        color: mediaFilterCategory === cat.id ? '#60a5fa' : '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#9096b8' }} />
                  <input
                    type="text"
                    placeholder="Search media assets..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    style={{ padding: '6px 10px 6px 30px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Media Assets Grid */}
              {filteredMedia.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: '#9096b8' }}>
                  <Image size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>No site media assets matching filter.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {filteredMedia.map(asset => {
                    const rec = RECOMMENDED_DIMENSIONS[asset.category] || RECOMMENDED_DIMENSIONS['site-assets'];
                    return (
                      <div
                        key={asset.id}
                        className="media-asset-card"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ height: '110px', background: '#000000', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={asset.url} alt={asset.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '4px', padding: '4px 6px', fontSize: '10px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Info size={11} /> Rec: {rec.dims} ({rec.format})
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {asset.name}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => { navigator.clipboard.writeText(asset.url); alert(`Copied URL: ${asset.url}`); }}
                            style={{ flex: 1, padding: '5px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', borderRadius: '3px', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Copy URL
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReplaceAssetTrigger(asset.id)}
                            style={{ padding: '5px 8px', fontSize: '11px', background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#60a5fa', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Repeat size={12} /> Replace
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(asset.id)}
                            style={{ padding: '5px 8px', fontSize: '11px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (

            /* TAB 3: DEVELOPER RAW KEYS VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                    Developer Raw Keys View ({activePortalMeta.shortLabel} · {activeRegion})
                  </h3>
                  <div style={{ fontSize: '12px', color: '#9096b8', marginTop: '2px' }}>
                    Showing resolved values for the currently selected portal & region
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Filter keys..."
                  value={rawSearch}
                  onChange={(e) => setRawSearch(e.target.value)}
                  style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', fontSize: '12px', width: '220px' }}
                />
              </div>

              <div style={{ maxHeight: '550px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(cmsKeys)
                  .filter(k => (k._id || k.key || '').toLowerCase().includes(rawSearch.toLowerCase()))
                  .map(k => {
                    const keyId = k._id || k.key;
                    const resolved = getResolvedInfo(keyId, k.default || '');
                    return (
                      <div key={keyId} onClick={() => selectKey(keyId)} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: activePortalMeta.accent, fontSize: '13px' }}>{keyId}</span>
                            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: activePortalMeta.accentBg, color: activePortalMeta.accent }}>{resolved.source}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {resolved.value || '(no value)'}
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: '#9096b8', flexShrink: 0 }} />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ✨ ASK AI COPYWRITER MODAL ────────────────────────────────────────── */}
      {aiModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#12131a', border: '1px solid #a855f7', borderRadius: '10px', width: '560px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#c084fc' }} /> Ask AI Copywriter & Assistant
              </h3>
              <button onClick={() => setAiModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9096b8', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              Editing Key: <span style={{ fontFamily: 'monospace', color: '#c084fc', fontWeight: 'bold' }}>{aiTargetKeyId}</span>
            </div>

            {/* Quick Tone & Style Presets */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9096b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Select Copywriting Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'hype', label: '🚀 Hype & High-Conversion', desc: 'Energetic for creators & artists' },
                  { id: 'professional', label: '💼 Professional & Enterprise', desc: 'Polished for business owners' },
                  { id: 'concise', label: '🎯 Concise & Punchy', desc: 'Shorten & refine existing copy' },
                  { id: 'kenya', label: '🌍 Nairobi & African Context', desc: 'Tailored for East Africa market' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAiTone(t.id)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: aiTone === t.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                      background: aiTone === t.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                      color: aiTone === t.id ? '#c084fc' : '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.label}</div>
                    <div style={{ fontSize: '10px', color: '#9096b8' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction Prompt */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#9096b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Custom Instruction Prompt (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Highlight 100% free credits for artists or add a tagline for Nairobi retail..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateAiCopy}
              disabled={aiGenerating}
              style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Wand2 size={16} /> {aiGenerating ? 'Generating AI Copy...' : 'Generate AI Suggestion'}
            </button>

            {/* AI Generated Suggestion Result Box */}
            {aiSuggestion && (
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '6px' }}>AI Suggested Output:</div>
                <div style={{ fontSize: '13px', color: '#ffffff', lineHeight: 1.4, background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {aiSuggestion}
                </div>
                <button
                  onClick={handleApplyAiSuggestion}
                  style={{ width: '100%', marginTop: '12px', padding: '8px', background: '#10b981', border: 'none', borderRadius: '4px', color: '#000000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Check size={14} /> Apply AI Suggestion to Field
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- MEDIA PICKER MODAL ----------------------------------------------- */}
      {mediaPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#12131a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', width: '680px', maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>Select Asset from Site Media Catalog</h3>
              <button onClick={() => setMediaPickerOpen(false)} style={{ background: 'none', border: 'none', color: '#9096b8', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {mediaList.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => pickMediaForField(asset.url)}
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px', cursor: 'pointer', textAlign: 'center' }}
                >
                  <div style={{ height: '90px', background: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <img src={asset.url} alt={asset.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -- HISTORIC ROLLBACK MODAL ------------------------------------------ */}
      {historyOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#12131a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>Revision History ({focusedKeyId})</h3>
              <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', color: '#9096b8', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            {historyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9096b8' }}>No historic revisions logged.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {historyList.map((h, i) => (
                  <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{h.by_name || 'Admin'}</span>
                      <span style={{ color: '#9096b8' }}>{new Date(h.at).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleRollback(h.revision_id)}
                      style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}
                    >
                      Rollback to this state
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CMSEditor;

