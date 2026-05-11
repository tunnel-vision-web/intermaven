// ─────────────────────────────────────────────────────────────────
// IMAGE REGISTRY — Intermaven
// ─────────────────────────────────────────────────────────────────
// All image paths are defined here in one place.
// Drop your image files into the matching public/ folders.
// The code reads from here automatically — no code changes needed
// when you add or replace images.
//
// FOLDER STRUCTURE:
//   public/images/hero/intermaven/        hero-1.jpg, hero-2.jpg, hero-3.jpg
//   public/images/hero/intermavenmusic/   hero-1.jpg, hero-2.jpg, hero-3.jpg
//   public/images/headers/intermaven/     header-{page}.jpg
//   public/images/headers/intermavenmusic/header-{page}.jpg
//   public/icons/                    {appid}.png
//
// FORMAT SUPPORT: .jpg, .jpeg, .webp, .png
// If a file is missing, a CSS gradient fallback is used automatically.
// ─────────────────────────────────────────────────────────────────

const BASE = process.env.PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');

// ── Hero slide images ─────────────────────────────────────────────
// Used in HomePage slideshow. 1920×900px recommended.
// Maps to slides array index (0, 1, 2).

export const HERO_IMAGES = {
  intermaven: [
    `${BASE}/images/hero/intermaven/hero-1.jpg`,
    `${BASE}/images/hero/intermaven/hero-2.jpg`,
    `${BASE}/images/hero/intermaven/hero-3.jpg`,
  ],
  intermavenmusic: [
    `${BASE}/images/hero/intermavenmusic/hero-1.jpg`,
    `${BASE}/images/hero/intermavenmusic/hero-2.jpg`,
    `${BASE}/images/hero/intermavenmusic/hero-3.jpg`,
  ],
};

// CSS gradient fallbacks — used when image file is not present.
// These match the mood of each slide automatically.
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
// Used in page headers across landing pages. 1920×350px.
// Falls back to CSS gradient if file not found.

export const HEADER_IMAGES = {
  // intermaven.io pages
  tools:       `${BASE}/images/headers/intermaven/header-tools.jpg`,
  apps:        `${BASE}/images/headers/intermaven/header-apps.jpg`,
  pricing:     `${BASE}/images/headers/intermaven/header-pricing.jpg`,
  about:       `${BASE}/images/headers/intermaven/header-about.jpg`,
  help:        `${BASE}/images/headers/intermaven/header-help.jpg`,
  forum:       `${BASE}/images/headers/intermaven/header-forum.jpg`,
  dashboard:   `${BASE}/images/headers/intermaven/header-dashboard.jpg`,

  // App landing page headers
  brandkit:    `${BASE}/images/headers/intermaven/header-brandkit.jpg`,
  musicbio:    `${BASE}/images/headers/intermaven/header-musicbio.jpg`,
  social:      `${BASE}/images/headers/intermaven/header-social.jpg`,
  syncpitch:   `${BASE}/images/headers/intermaven/header-syncpitch.jpg`,
  bizpitch:    `${BASE}/images/headers/intermaven/header-bizpitch.jpg`,

  // intermavenmusic.com pages
  consumer:    `${BASE}/images/headers/intermavenmusic/header-consumer.jpg`,
  creator:     `${BASE}/images/headers/intermavenmusic/header-creator.jpg`,
  label:       `${BASE}/images/headers/intermavenmusic/header-label.jpg`,
  dj:          `${BASE}/images/headers/intermavenmusic/header-dj.jpg`,
  filmstudio:  `${BASE}/images/headers/intermavenmusic/header-filmstudio.jpg`,
  corporate:   `${BASE}/images/headers/intermavenmusic/header-corporate.jpg`,
  mediahouse:  `${BASE}/images/headers/intermavenmusic/header-mediahouse.jpg`,
  musicabout:  `${BASE}/images/headers/intermavenmusic/header-about.jpg`,
};

// CSS gradient fallbacks for page headers
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
// Custom PNG icons — drop files in public/icons/
// If the file doesn't exist, FlatIcon SVG fallback is used.

export const APP_ICONS = {
  brandkit:  `${BASE}/icons/brandkit.png`,
  musicbio:  `${BASE}/icons/musicbio.png`,
  social:    `${BASE}/icons/social.png`,
  syncpitch: `${BASE}/icons/syncpitch.png`,
  bizpitch:  `${BASE}/icons/bizpitch.png`,
  epk:       `${BASE}/icons/epk.png`,
  crm:       `${BASE}/icons/crm.png`,
  files:     `${BASE}/icons/files.png`,
  distro:    `${BASE}/icons/distro.png`,
  pos:       `${BASE}/icons/pos.png`,
  contract:  `${BASE}/icons/contract.png`,
  pressrel:  `${BASE}/icons/pressrel.png`,
  lyric:     `${BASE}/icons/lyric.png`,
  royalty:   `${BASE}/icons/royalty.png`,
  calendar:  `${BASE}/icons/calendar.png`,
  grant:     `${BASE}/icons/grant.png`,
};

export const INTERMAVEN_LOGO = `${BASE}/images/logos/intermaven/intermaven-logo-web.png`;

export const CAROUSEL_LOGOS = {
  music: [
    { src: `${BASE}/images/carousel/logos/logo-dj.svg`, alt: 'DJ stage', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-label.svg`, alt: 'Label network', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-producer.svg`, alt: 'Producer community', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-artist.svg`, alt: 'Artist collective', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-social.svg`, alt: 'Social creators', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-brandkit.svg`, alt: 'Brand kit partners', link: '/apps' },
  ],
  business: [
    { src: `${BASE}/images/carousel/logos/logo-brandkit.svg`, alt: 'Brand builders', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-crm.svg`, alt: 'Smart CRM', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-dj.svg`, alt: 'Creative events', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-social.svg`, alt: 'Social storefronts', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-artist.svg`, alt: 'Creative services', link: '/apps' },
  ],
  djs: [
    { src: `${BASE}/images/carousel/logos/logo-dj.svg`, alt: 'DJ bookings', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-social.svg`, alt: 'Audience content', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-brandkit.svg`, alt: 'Brand identity', link: '/apps' },
  ],
  labels: [
    { src: `${BASE}/images/carousel/logos/logo-label.svg`, alt: 'Label services', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-producer.svg`, alt: 'Producer partnerships', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-crm.svg`, alt: 'Label CRM', link: '/apps' },
  ],
  producers: [
    { src: `${BASE}/images/carousel/logos/logo-producer.svg`, alt: 'Producer network', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-social.svg`, alt: 'Portfolios & promo', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-brandkit.svg`, alt: 'Music branding', link: '/apps' },
  ],
  mediahouses: [
    { src: `${BASE}/images/carousel/logos/logo-mediahouse.svg`, alt: 'Media houses', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-crm.svg`, alt: 'Content operations', link: '/apps' },
    { src: `${BASE}/images/carousel/logos/logo-brandkit.svg`, alt: 'Campaign branding', link: '/apps' },
  ],
};

// ── Helper: get hero image with fallback ─────────────────────────
// Returns backgroundImage CSS value — image URL if available,
// or gradient fallback. Use in style={{ backgroundImage: ... }}
export function getHeroBackground(portal, index) {
  const img = HERO_IMAGES[portal]?.[index];
  const fallback = HERO_FALLBACKS[portal]?.[index] || HERO_FALLBACKS.intermaven[0];
  if (!img) return fallback;
  return `url(${img}), ${fallback}`;
}

// ── Helper: get header background ────────────────────────────────
export function getHeaderBackground(pageKey) {
  const img = HEADER_IMAGES[pageKey];
  const fallback = HEADER_FALLBACKS[pageKey] || 'radial-gradient(ellipse at 35% 55%, #003d5c, #08090d)';
  if (!img) return fallback;
  return `url(${img}), ${fallback}`;
}

// ── Helper: get app icon src ──────────────────────────────────────
// Returns the PNG path if defined, or null (FlatIcon SVG fallback)
export function getAppIconSrc(appId) {
  return APP_ICONS[appId] || null;
}
