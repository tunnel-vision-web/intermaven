/**
 * CmsContext — fetches a known set of CMS keys at app start, resolved against
 * the user's region, then provides `useCms(key)` to consumers. Components can
 * also call `useCms('any.other.key')` and it will lazy-fetch.
 *
 * Falls back to the provided default value if the key doesn't resolve, so the
 * UI never breaks even if the backend is offline.
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRegion } from '../RegionContext';

const API_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : '');

// Keys we know we will need on the public site. The provider preloads these.
const KNOWN_KEYS = [
  'footer.contact.phone',
  'footer.contact.address',
  'footer.tagline',
  'pricing.callout.title',
  'pricing.callout.body',
  'pricing.payment_methods',
  'social.instagram',
  'social.tiktok',
  'social.x',
  'social.linkedin',
  'social.youtube',
  'social.facebook',
  'about.phone_label',
  'about.business_hours',
  'about.description',
  'about.story_title',
  'about.story_body_1',
  'about.story_body_2',
  'about.email_label',
  'about.email',
  'about.based_in',
  'tools.header',
  'tools.subtitle',
  'tools.cta',
  'tools.cta_desc'
];

const CmsContext = createContext({ values: {}, get: () => null });

export function CmsProvider({ portal = 'business', children }) {
  const region = useRegion();
  const country = region?.country || 'KE';
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    axios
      .get(`${API_URL}/api/cms/bulk/lookup`, {
        params: { keys: KNOWN_KEYS.join(','), region: country, portal },
        timeout: 6000,
      })
      .then((res) => {
        if (cancelled) return;
        setValues(res.data?.values || {});
      })
      .catch(() => { /* non-fatal — defaults will render */ });
    return () => { cancelled = true; };
  }, [country, portal]);

  const get = useCallback(
    (key, fallback = null) => (values[key] != null ? values[key] : fallback),
    [values]
  );

  const value = useMemo(() => ({ values, get, region: country, portal }), [values, get, country, portal]);
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

/**
 * useCms(key, fallback) — read a CMS value. Returns fallback if not loaded yet
 * or not present. Never throws.
 */
export function useCms(key, fallback = null) {
  const ctx = useContext(CmsContext);
  const [lazy, setLazy] = useState(null);

  // Lazy-fetch keys we didn't preload
  useEffect(() => {
    if (!key) return;
    if (ctx.values[key] != null) return;
    if (KNOWN_KEYS.includes(key)) return; // already preloaded (or being preloaded)
    let cancelled = false;
    axios
      .get(`${API_URL}/api/cms/${encodeURIComponent(key)}`, {
        params: { region: ctx.region, portal: ctx.portal },
        timeout: 6000,
      })
      .then((res) => { if (!cancelled) setLazy(res.data?.value); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [key, ctx.values, ctx.region, ctx.portal]);

  if (ctx.values[key] != null) return ctx.values[key];
  if (lazy != null) return lazy;
  return fallback;
}

/** <CmsText keyName="..." fallback="..." /> — drop-in <span> */
export function CmsText({ keyName, fallback = '', as: As = 'span', ...rest }) {
  const v = useCms(keyName, fallback) || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(v);
  if (isHtml) {
    return <As {...rest} dangerouslySetInnerHTML={{ __html: v }} />;
  }
  return <As {...rest}>{v}</As>;
}

export default CmsContext;
