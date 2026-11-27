import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const FALLBACK_LOCAL_API =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8005'
    : '';

const API_URL = process.env.REACT_APP_BACKEND_URL || FALLBACK_LOCAL_API;

let _seoBundleCache = null;
let _seoFetchPromise = null;
let _pixelsInjectedKey = '';

export function invalidateSeoBundleCache() {
  _seoBundleCache = null;
  _seoFetchPromise = null;
}

async function fetchSeoBundle() {
  if (_seoBundleCache) return _seoBundleCache;
  if (_seoFetchPromise) return _seoFetchPromise;
  _seoFetchPromise = fetch(`${API_URL}/api/seo/public`)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (data) _seoBundleCache = data;
      _seoFetchPromise = null;
      return data;
    })
    .catch(() => {
      _seoFetchPromise = null;
      return null;
    });
  return _seoFetchPromise;
}

function upsertMeta(attrName, attrValue, content) {
  if (content === undefined || content === null) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function upsertCanonical(href) {
  if (!href) return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function hasTrackingConsent(consentRequired) {
  if (!consentRequired) return true;
  try {
    const val = localStorage.getItem('cookie_consent') || localStorage.getItem('intermaven_cookie_consent') || '';
    return ['accepted', 'all', 'analytics', 'true', '1'].includes(val.toLowerCase());
  } catch {
    return false;
  }
}

function injectConsentAwarePixels(pixels) {
  if (!pixels || typeof document === 'undefined') return;
  if (!hasTrackingConsent(pixels.consent_required !== false)) return;

  const sig = JSON.stringify(pixels);
  if (_pixelsInjectedKey === sig) return;
  _pixelsInjectedKey = sig;

  // GA4
  if (pixels.ga4_id && !document.getElementById('im-ga4-src')) {
    const s1 = document.createElement('script');
    s1.id = 'im-ga4-src';
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(pixels.ga4_id)}`;
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.id = 'im-ga4-init';
    s2.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(pixels.ga4_id)});`;
    document.head.appendChild(s2);
  }

  // Google Tag Manager
  if (pixels.gtm_id && !document.getElementById('im-gtm-init')) {
    const gtm = document.createElement('script');
    gtm.id = 'im-gtm-init';
    gtm.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(pixels.gtm_id)});`;
    document.head.appendChild(gtm);
  }

  // Plausible (privacy-friendly)
  if (pixels.plausible_domain && !document.getElementById('im-plausible')) {
    const pl = document.createElement('script');
    pl.id = 'im-plausible';
    pl.defer = true;
    pl.setAttribute('data-domain', pixels.plausible_domain);
    pl.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(pl);
  }
}

export function SEORouteListener() {
  const location = useLocation();
  const [bundle, setBundle] = useState(_seoBundleCache);

  useEffect(() => {
    let active = true;
    fetchSeoBundle().then(data => {
      if (active && data) setBundle(data);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!bundle) return;
    const cfg = bundle.global || {};
    const rawPath = location.pathname || '/';
    const normPath = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
    const page = (bundle.pages || {})[normPath] || null;

    // Private dashboard/admin routes get noindex automatically
    const isPrivateRoute =
      normPath.startsWith('/dashboard') ||
      normPath.startsWith('/admin') ||
      normPath.startsWith('/sso') ||
      normPath.startsWith('/embed');

    const baseUrl = (cfg.base_url || 'https://intermaven.io').replace(/\/$/, '');
    const tpl = cfg.title_template || '%s | Intermaven';
    const rawTitle = page?.title || cfg.default_title || 'Intermaven';
    const fullTitle =
      page?.title && tpl.includes('%s')
        ? tpl.replace('%s', page.title)
        : rawTitle;
    const desc = page?.description || cfg.default_description || '';
    const canonical = page?.canonical || (normPath === '/' ? `${baseUrl}/` : `${baseUrl}${normPath}`);
    const ogTitle = page?.og_title || fullTitle;
    const ogDesc = page?.og_description || desc;
    const rawOgImg = page?.og_image || cfg.default_og_image || '/images/hero/intermaven/hero-1.jpg';
    const ogImg = rawOgImg.startsWith('/') ? `${baseUrl}${rawOgImg}` : rawOgImg;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    if (cfg.default_keywords) upsertMeta('name', 'keywords', cfg.default_keywords);
    upsertMeta('name', 'robots', isPrivateRoute || page?.noindex ? 'noindex, nofollow' : 'index, follow');
    upsertCanonical(canonical);

    // Open Graph & Twitter
    upsertMeta('property', 'og:site_name', cfg.site_name || 'Intermaven');
    upsertMeta('property', 'og:title', ogTitle);
    upsertMeta('property', 'og:description', ogDesc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImg);
    upsertMeta('name', 'twitter:card', cfg.twitter_card || 'summary_large_image');
    if (cfg.twitter_handle) upsertMeta('name', 'twitter:site', cfg.twitter_handle);
    upsertMeta('name', 'twitter:title', ogTitle);
    upsertMeta('name', 'twitter:description', ogDesc);
    upsertMeta('name', 'twitter:image', ogImg);

    // Webmaster verification tags
    const verif = cfg.verification || {};
    if (verif.google_site_verification) upsertMeta('name', 'google-site-verification', verif.google_site_verification);
    if (verif.bing_site_verification) upsertMeta('name', 'msvalidate.01', verif.bing_site_verification);
    if (verif.yandex_verification) upsertMeta('name', 'yandex-verification', verif.yandex_verification);
    if (verif.pinterest_verification) upsertMeta('name', 'p:domain_verify', verif.pinterest_verification);

    // JSON-LD Structured Data
    const existingLd = document.getElementById('intermaven-json-ld');
    if (existingLd) existingLd.remove();
    if (!isPrivateRoute && bundle.organization_json_ld) {
      const ldScript = document.createElement('script');
      ldScript.id = 'intermaven-json-ld';
      ldScript.type = 'application/ld+json';
      const graphNodes = [...(bundle.organization_json_ld['@graph'] || [])];
      if (normPath !== '/' && page) {
        graphNodes.push({
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: page.label || page.title || normPath, item: canonical },
          ],
        });
      }
      if (page?.custom_schema && typeof page.custom_schema === 'object') {
        graphNodes.push(page.custom_schema);
      }
      ldScript.text = JSON.stringify({ '@context': 'https://schema.org', '@graph': graphNodes });
      document.head.appendChild(ldScript);
    }

    injectConsentAwarePixels(cfg.pixels);
  }, [bundle, location.pathname]);

  return null;
}

export default function SEO({ title, description, canonical, schema }) {
  useEffect(() => {
    if (title) document.title = `${title} | Intermaven`;
    if (description) upsertMeta('name', 'description', description);
    if (canonical) upsertCanonical(canonical);
    if (schema) {
      let ldJsonScript = document.getElementById('intermaven-page-json-ld');
      if (ldJsonScript) ldJsonScript.remove();
      ldJsonScript = document.createElement('script');
      ldJsonScript.id = 'intermaven-page-json-ld';
      ldJsonScript.type = 'application/ld+json';
      ldJsonScript.text = JSON.stringify(schema);
      document.head.appendChild(ldJsonScript);
      return () => {
        if (ldJsonScript) ldJsonScript.remove();
      };
    }
  }, [title, description, canonical, schema]);

  return null;
}
