// ─────────────────────────────────────────────────────────────────
// IMAGE REGISTRY — Intermaven
// ─────────────────────────────────────────────────────────────────
// All image paths are defined here in one place.
// Drop your image files into the matching public/ folders.
// The code reads from here automatically — no code changes needed
// when you add or replace images.
// ─────────────────────────────────────────────────────────────────

// Helper to check if the current region in local storage is Western
export function isWesternRegion() {
  if (typeof window === 'undefined') return false;
  try {
    const saved = JSON.parse(localStorage.getItem('intermaven_region') || 'null');
    if (saved && saved.country) {
      const cc = saved.country.toUpperCase();
      const westernCountries = new Set([
        'US', 'CA', 'GB', 'IE', 'AU', 'NZ',
        'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'FI', 'DK', 'AT', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR'
      ]);
      return westernCountries.has(cc);
    }
  } catch (e) {
    // ignore
  }
  return false;
}

// Helper to resolve Western variant images dynamically
export function localizeImagePath(path) {
  if (!isWesternRegion() || !path) return path;
  
  // Map standard files to their Western counterparts
  return path
    .replace('/images/hero/intermaven/hero-1.jpg', '/images/hero/intermaven_western/hero-1.png')
    .replace('/images/hero/intermaven/hero-2.jpg', '/images/hero/intermaven_western/hero-2.png')
    .replace('/images/hero/intermaven/hero-3.jpg', '/images/hero/intermaven_western/hero-3.png')
    .replace('/images/hero/intermavenmusic/hero-1.jpg', '/images/hero/intermavenmusic_western/hero-1.png')
    .replace('/images/hero/intermavenmusic/hero-2.jpg', '/images/hero/intermavenmusic_western/hero-2.png')
    .replace('/images/hero/intermavenmusic/hero-3.jpg', '/images/hero/intermavenmusic_western/hero-3.png')
    .replace('/images/headers/intermaven/header-tools.jpg', '/images/headers/intermaven_western/header-tools.png')
    .replace('/images/headers/intermaven/header-apps.jpg', '/images/headers/intermaven_western/header-apps.png')
    .replace('/images/headers/intermaven/header-pricing.jpg', '/images/headers/intermaven_western/header-pricing.png')
    .replace('/images/headers/intermaven/header-about.jpg', '/images/headers/intermaven_western/header-about.png')
    .replace('/images/headers/intermaven/header-help.jpg', '/images/headers/intermaven_western/header-help.png')
    .replace('/images/headers/intermaven/header-forum.jpg', '/images/headers/intermaven_western/header-forum.png')
    .replace('/images/headers/intermavenmusic/header-tools.jpg', '/images/headers/intermavenmusic_western/header-tools.png')
    .replace('/images/headers/intermavenmusic/header-apps.jpg', '/images/headers/intermavenmusic_western/header-apps.png')
    .replace('/images/headers/intermavenmusic/header-pricing.jpg', '/images/headers/intermavenmusic_western/header-pricing.png')
    .replace('/images/headers/intermavenmusic/header-about.jpg', '/images/headers/intermavenmusic_western/header-about.png')
    .replace('/images/headers/intermavenmusic/header-help.jpg', '/images/headers/intermavenmusic_western/header-help.png')
    .replace('/images/headers/intermavenmusic/header-forum.jpg', '/images/headers/intermavenmusic_western/header-forum.png');
}

// ── Hero slide images ─────────────────────────────────────────────
const raw_hero_images = {
  intermaven: [
    '/images/hero/intermaven/hero-1.jpg',
    '/images/hero/intermaven/hero-2.jpg',
    '/images/hero/intermaven/hero-3.jpg',
  ],
  intermavenmusic: [
    '/images/hero/intermavenmusic/hero-1.jpg',
    '/images/hero/intermavenmusic/hero-2.jpg',
    '/images/hero/intermavenmusic/hero-3.jpg',
  ],
};

export const HERO_IMAGES = new Proxy(raw_hero_images, {
  get(target, prop) {
    const val = target[prop];
    if (!val) return val;
    return val.map(localizeImagePath);
  }
});

export const HERO_FALLBACKS = {
  intermaven: [
    'radial-gradient(ellipse at 30% 60%, #3b1f6e 0%, #1a0a30 45%, #08090d 100%)',
    'radial-gradient(ellipse at 70% 40%, #7c3800 0%, #3d1a00 45%, #08090d 100%)',
    'radial-gradient(ellipse at 50% 65%, #003d4d 0%, #001a22 45%, #08090d 100%)',
  ],
  intermavenmusic: [
    'radial-gradient(ellipse at 40% 55%, #1a003d 0%, #0d0022 50%, #08090d 100%)',
    'radial-gradient(ellipse at 60% 45%, #003d1a 0%, #001a0d 50%, #08090d 100%)',
    'radial-gradient(ellipse at 35% 60%, #3d1a00 0%, #1a0d00 50%, #08090d 100%)',
  ],
  djs: [
    'radial-gradient(ellipse at 40% 55%, #1a003d 0%, #0d0022 50%, #08090d 100%)',
    'radial-gradient(ellipse at 60% 45%, #003d1a 0%, #001a0d 50%, #08090d 100%)',
    'radial-gradient(ellipse at 35% 60%, #3d1a00 0%, #1a0d00 50%, #08090d 100%)',
  ],
  labels: [
    'radial-gradient(ellipse at 40% 55%, #1a003d 0%, #0d0022 50%, #08090d 100%)',
    'radial-gradient(ellipse at 60% 45%, #003d1a 0%, #001a0d 50%, #08090d 100%)',
    'radial-gradient(ellipse at 35% 60%, #3d1a00 0%, #1a0d00 50%, #08090d 100%)',
  ],
  producers: [
    'radial-gradient(ellipse at 40% 55%, #1a003d 0%, #0d0022 50%, #08090d 100%)',
    'radial-gradient(ellipse at 60% 45%, #003d1a 0%, #001a0d 50%, #08090d 100%)',
    'radial-gradient(ellipse at 35% 60%, #3d1a00 0%, #1a0d00 50%, #08090d 100%)',
  ],
  mediahouses: [
    'radial-gradient(ellipse at 40% 55%, #1a003d 0%, #0d0022 50%, #08090d 100%)',
    'radial-gradient(ellipse at 60% 45%, #003d1a 0%, #001a0d 50%, #08090d 100%)',
    'radial-gradient(ellipse at 35% 60%, #3d1a00 0%, #1a0d00 50%, #08090d 100%)',
  ],
};

// ── Page header images ─────────────────────────────────────────────
const raw_header_images = {
  tools:       '/images/headers/intermaven/header-tools.jpg',
  apps:        '/images/headers/intermaven/header-apps.jpg',
  pricing:     '/images/headers/intermaven/header-pricing.jpg',
  about:       '/images/headers/intermaven/header-about.jpg',
  help:        '/images/headers/intermaven/header-help.jpg',
  forum:       '/images/headers/intermaven/header-forum.jpg',
  dashboard:   '/images/headers/intermaven/header-dashboard.jpg',
  brandkit:    '/images/headers/intermaven/header-brandkit.jpg',
  musicbio:    '/images/headers/intermaven/header-musicbio.jpg',
  social:      '/images/headers/intermaven/header-social.jpg',
  syncpitch:   '/images/headers/intermaven/header-syncpitch.jpg',
  bizpitch:    '/images/headers/intermaven/header-bizpitch.jpg',
  consumer:    '/images/headers/intermavenmusic/header-consumer.jpg',
  creator:     '/images/headers/intermavenmusic/header-creator.jpg',
  label:       '/images/headers/intermavenmusic/header-label.jpg',
  dj:          '/images/headers/intermavenmusic/header-dj.jpg',
  filmstudio:  '/images/headers/intermavenmusic/header-filmstudio.jpg',
  corporate:   '/images/headers/intermavenmusic/header-corporate.jpg',
  mediahouse:  '/images/headers/intermavenmusic/header-mediahouse.jpg',
  musicabout:  '/images/headers/intermavenmusic/header-about.jpg',
  musictools:   '/images/headers/intermavenmusic/header-tools.jpg',
  musicapps:    '/images/headers/intermavenmusic/header-apps.jpg',
  musicpricing: '/images/headers/intermavenmusic/header-pricing.jpg',
  musichelp:    '/images/headers/intermavenmusic/header-help.jpg',
  musicforum:   '/images/headers/intermavenmusic/header-forum.jpg',
};

export const HEADER_IMAGES = new Proxy(raw_header_images, {
  get(target, prop) {
    const val = target[prop];
    if (!val) return val;
    return localizeImagePath(val);
  }
});

export const HEADER_FALLBACKS = {
  tools:       'radial-gradient(ellipse at 35% 55%, #003d5c, #08090d)',
  apps:        'radial-gradient(ellipse at 65% 45%, #1a0a30, #08090d)',
  pricing:     'radial-gradient(ellipse at 40% 60%, #003d1a, #08090d)',
  about:       'radial-gradient(ellipse at 35% 55%, #003d5c, #08090d)',
  help:        'radial-gradient(ellipse at 50% 50%, #1a1a3d, #08090d)',
  forum:       'radial-gradient(ellipse at 45% 55%, #2d1a00, #08090d)',
  dashboard:   'radial-gradient(ellipse at 50% 50%, #1a1a3d, #08090d)',
  brandkit:    'radial-gradient(ellipse at 35% 55%, #2a1f6e, #08090d)',
  musicbio:    'radial-gradient(ellipse at 50% 45%, #003d4d, #08090d)',
  social:      'radial-gradient(ellipse at 60% 55%, #3d0014, #08090d)',
  syncpitch:   'radial-gradient(ellipse at 40% 60%, #3d2a00, #08090d)',
  bizpitch:    'radial-gradient(ellipse at 55% 50%, #1a003d, #08090d)',
  consumer:    'radial-gradient(ellipse at 40% 55%, #001a3d, #08090d)',
  creator:     'radial-gradient(ellipse at 35% 60%, #1a003d, #08090d)',
  label:       'radial-gradient(ellipse at 60% 45%, #003d1a, #08090d)',
  dj:          'radial-gradient(ellipse at 50% 55%, #0d001a, #08090d)',
  filmstudio:  'radial-gradient(ellipse at 40% 50%, #001a14, #08090d)',
  corporate:   'radial-gradient(ellipse at 55% 45%, #001a3d, #08090d)',
  mediahouse:  'radial-gradient(ellipse at 45% 55%, #1a0d00, #08090d)',
  musicabout:  'radial-gradient(ellipse at 35% 55%, #003d5c, #08090d)',
};

// ── App icons ─────────────────────────────────────────────────────
export const APP_ICONS = {
  brandkit:  './icons/brandkit.png',
  musicbio:  './icons/musicbio.png',
  social:    './icons/social.png',
  syncpitch: './icons/syncpitch.png',
  bizpitch:  './icons/bizpitch.png',
  epk:       './icons/epk.png',
  crm:       './icons/crm.png',
  files:     './icons/files.png',
  distro:    './icons/distro.png',
  pos:       './icons/pos.png',
  contract:  './icons/contract.png',
  pressrel:  './icons/pressrel.png',
  lyric:     './icons/lyric.png',
  royalty:   './icons/royalty.png',
  calendar:  './icons/calendar.png',
  grant:     './icons/grant.png',
};

export const INTERMAVEN_LOGO = '/images/logos/intermaven/intermaven-logo-web.png';
export const INTERMAVEN_LOGO_FOOTER = '/images/logos/intermaven/intermaven-logo-footer.png';

export const CAROUSEL_LOGOS = {
  music: [
    { src: '/images/carousel/logos/logo-dj.svg', alt: 'DJ stage', link: '/apps' },
    { src: '/images/carousel/logos/logo-label.svg', alt: 'Label network', link: '/apps' },
    { src: '/images/carousel/logos/logo-producer.svg', alt: 'Producer community', link: '/apps' },
    { src: '/images/carousel/logos/logo-artist.svg', alt: 'Artist collective', link: '/apps' },
    { src: '/images/carousel/logos/logo-social.svg', alt: 'Social creators', link: '/apps' },
    { src: '/images/carousel/logos/logo-brandkit.svg', alt: 'Brand kit partners', link: '/apps' },
  ],
  business: [
    { src: '/images/carousel/logos/logo-brandkit.svg', alt: 'Brand builders', link: '/apps' },
    { src: '/images/carousel/logos/logo-crm.svg', alt: 'Smart CRM', link: '/apps' },
    { src: '/images/carousel/logos/logo-dj.svg', alt: 'Creative events', link: '/apps' },
    { src: '/images/carousel/logos/logo-social.svg', alt: 'Social storefronts', link: '/apps' },
    { src: '/images/carousel/logos/logo-artist.svg', alt: 'Creative services', link: '/apps' },
  ],
  djs: [
    { src: '/images/carousel/logos/logo-dj.svg', alt: 'DJ bookings', link: '/apps' },
    { src: '/images/carousel/logos/logo-social.svg', alt: 'Audience content', link: '/apps' },
    { src: '/images/carousel/logos/logo-brandkit.svg', alt: 'Brand identity', link: '/apps' },
  ],
  labels: [
    { src: '/images/carousel/logos/logo-label.svg', alt: 'Label services', link: '/apps' },
    { src: '/images/carousel/logos/logo-producer.svg', alt: 'Producer partnerships', link: '/apps' },
    { src: '/images/carousel/logos/logo-crm.svg', alt: 'Label CRM', link: '/apps' },
  ],
  producers: [
    { src: '/images/carousel/logos/logo-producer.svg', alt: 'Producer network', link: '/apps' },
    { src: '/images/carousel/logos/logo-social.svg', alt: 'Portfolios & promo', link: '/apps' },
    { src: '/images/carousel/logos/logo-brandkit.svg', alt: 'Music branding', link: '/apps' },
  ],
  mediahouses: [
    { src: '/images/carousel/logos/logo-mediahouse.svg', alt: 'Media houses', link: '/apps' },
    { src: '/images/carousel/logos/logo-crm.svg', alt: 'Content operations', link: '/apps' },
    { src: '/images/carousel/logos/logo-brandkit.svg', alt: 'Campaign branding', link: '/apps' },
  ],
};

// ── Helper: get hero image with fallback ─────────────────────────
export function getHeroBackground(portal, index) {
  const img = HERO_IMAGES[portal]?.[index];
  const fallback = HERO_FALLBACKS[portal]?.[index] || HERO_FALLBACKS.intermaven[0];
  if (!img) return fallback;
  return `url(${img}), ${fallback}`;
}

// ── Helper: get header background ────────────────────────────────
export function getHeaderBackground(pageKey, portal = 'business') {
  let key = pageKey;
  if (portal === 'music') {
    if (pageKey === 'about') key = 'musicabout';
    else if (pageKey === 'tools') key = 'musictools';
    else if (pageKey === 'apps') key = 'musicapps';
    else if (pageKey === 'pricing') key = 'musicpricing';
    else if (pageKey === 'help') key = 'musichelp';
    else if (pageKey === 'forum') key = 'musicforum';
  }
  const img = HEADER_IMAGES[key];
  const fallback = HEADER_FALLBACKS[key] || HEADER_FALLBACKS[pageKey] || 'radial-gradient(ellipse at 35% 55%, #003d5c, #08090d)';
  if (!img) return fallback;
  return `url(${img}), ${fallback}`;
}

// ── Helper: get app icon src ──────────────────────────────────────
export function getAppIconSrc(appId) {
  return APP_ICONS[appId] || null;
}
