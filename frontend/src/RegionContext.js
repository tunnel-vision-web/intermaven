import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import fallbackData from './fallbackData.json';

const API_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : '');

const RegionContext = createContext(null);
export const useRegion = () => useContext(RegionContext);

const STORAGE_KEY = 'intermaven_region';

export const LANGUAGES_LIST = [
  { code: 'en', short: 'EN', name: 'English', native: 'English', flag: '🇬🇧', market: 'US', accent: '#22d3ee', textDark: '#060813' },
  { code: 'sw', short: 'SW', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', market: 'KE', accent: '#10b981', textDark: '#042f2e' },
  { code: 'ki', short: 'KI', name: 'Kikuyu', native: 'Gĩkũyũ', flag: '🇰🇪', market: 'KE', accent: '#f59e0b', textDark: '#1c1917' },
  { code: 'es', short: 'ES', name: 'Spanish', native: 'Español', flag: '🇺🇸', market: 'US', accent: '#a855f7', textDark: '#ffffff' }
];

export const COUNTRY_FLAGS = {
  KE: '🇰🇪', UG: '🇺🇬', TZ: '🇹🇿', RW: '🇷🇼', NG: '🇳🇬', GH: '🇬🇭', ZA: '🇿🇦',
  US: '🇺🇸', CA: '🇨🇦', GB: '🇬🇧', EU: '🇪🇺', FR: '🇫🇷', DE: '🇩🇪', ES: '🇪🇸',
  IN: '🇮🇳', JP: '🇯🇵', AU: '🇦🇺'
};

const TRANSLATIONS = {
  en: { 'nav.home': 'Home', 'nav.tools': 'AI Tools', 'nav.apps': 'Apps', 'nav.pricing': 'Pricing', 'nav.about': 'About', 'nav.help': 'Help Center', 'nav.forum': 'Forum', 'nav.perfect_for': 'Perfect For' },
  sw: { 'nav.home': 'Nyumbani', 'nav.tools': 'Zana za AI', 'nav.apps': 'Programu', 'nav.pricing': 'Bei', 'nav.about': 'Kuhusu', 'nav.help': 'Kituo cha Msaada', 'nav.forum': 'Jukwaa', 'nav.perfect_for': 'Inafaa Kwa' },
  ki: { 'nav.home': 'Mũciĩ', 'nav.tools': 'Indo cia AI', 'nav.apps': 'App', 'nav.pricing': 'Thogora', 'nav.about': 'Ũhoro Witũ', 'nav.help': 'Ũteithio', 'nav.forum': 'Kĩama', 'nav.perfect_for': 'Yagĩrĩire' },
  es: { 'nav.home': 'Inicio', 'nav.tools': 'Herramientas IA', 'nav.apps': 'Apps', 'nav.pricing': 'Precios', 'nav.about': 'Nosotros', 'nav.help': 'Ayuda', 'nav.forum': 'Foro', 'nav.perfect_for': 'Ideal Para' },
};

function getMergedLanguages() {
  const dynList = (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.getLanguagesList === 'function')
    ? window.SynergyLocalization.getLanguagesList()
    : null;
  if (!Array.isArray(dynList) || dynList.length === 0) return LANGUAGES_LIST;
  const map = new Map();
  LANGUAGES_LIST.forEach((l) => map.set(l.code, l));
  dynList.forEach((l) => {
    if (l && l.code) {
      map.set(l.code, { ...(map.get(l.code) || {}), ...l });
    }
  });
  return Array.from(map.values());
}

function isSupportedLanguageCode(code) {
  if (!code) return false;
  return getMergedLanguages().some((l) => l.code === code);
}

const resolveRegionLocally = (countryCode) => {
  const cc = (countryCode || 'KE').toUpperCase();
  const rawCountry = fallbackData.rawCountries[cc] || fallbackData.rawCountries.KE;
  const currencyCode = rawCountry.currency;
  const rawCurrency = fallbackData.rawCurrencies[currencyCode] || { symbol: currencyCode, name: currencyCode };
  const langs = (rawCountry.langs || []).map((lCode) => ({
    code: lCode,
    ...(fallbackData.rawLanguages[lCode] || { name: lCode, native: lCode })
  }));

  return {
    country: cc,
    country_name: rawCountry.name,
    currency: currencyCode,
    currency_info: {
      code: currencyCode,
      symbol: rawCurrency.symbol,
      name: rawCurrency.name,
      decimals: rawCurrency.decimals,
      rounding: rawCurrency.rounding,
      pos: rawCurrency.pos
    },
    languages: langs,
    default_language: langs[0]?.code || 'en'
  };
};

const detectClientLocation = async () => {
  try {
    const res = await axios.get('https://ipapi.co/json/', { timeout: 3000 });
    if (res.data && res.data.country_code) {
      const cc = res.data.country_code.toUpperCase();
      if (fallbackData.rawCountries[cc]) return cc;
    }
  } catch (e) {
    // Ignore IP lookup failure and use timezone fallback
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const tzLower = tz.toLowerCase();
      if (tzLower.includes('nairobi')) return 'KE';
      if (tzLower.includes('kampala')) return 'UG';
      if (tzLower.includes('dar_es_salaam')) return 'TZ';
      if (tzLower.includes('kigali')) return 'RW';
      if (tzLower.includes('lagos')) return 'NG';
      if (tzLower.includes('johannesburg')) return 'ZA';
      if (tzLower.includes('london')) return 'GB';
      if (tzLower.includes('india') || tzLower.includes('kolkata')) return 'IN';
      if (tzLower.includes('tokyo') || tzLower.includes('japan')) return 'JP';
      if (tzLower.includes('america/')) return 'US';
      if (tzLower.includes('europe/')) return 'FR';
    }
  } catch (e) {
    // ignore
  }

  return 'KE';
};

export function RegionProvider({ children }) {
  const [country, setCountry] = useState('KE');
  const [countryName, setCountryName] = useState('Kenya');
  const [currency, setCurrency] = useState('KES');
  const [currencyInfo, setCurrencyInfo] = useState({ code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' });
  const [language, setLanguage] = useState('en');
  const [options, setOptions] = useState({
    countries: fallbackData.countries,
    currencies: fallbackData.currencies,
    languages: LANGUAGES_LIST
  });
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState(null);
  const [hasSavedRegion, setHasSavedRegion] = useState(true);

  const availableLanguages = useMemo(() => getMergedLanguages(), [language]);

  const persist = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (data?.language) {
        localStorage.setItem('synergy_lang', data.language);
        localStorage.setItem('tunemavens_lang', data.language);
      }
      if (data?.country) {
        localStorage.setItem('synergy_market', data.country);
        localStorage.setItem('tunemavens_country', data.country);
      }
      if (data?.currency) {
        localStorage.setItem('synergy_currency', data.currency);
      }
    } catch (e) { /* noop */ }
  }, []);

  // Load switcher options once
  useEffect(() => {
    axios.get(`${API_URL}/api/geo/options`)
      .then((r) => {
        if (r.data && r.data.countries) {
          setOptions(r.data);
        }
      })
      .catch(() => { /* keep fallbackData */ });
  }, []);

  // Sync with SynergyLocalization custom events
  useEffect(() => {
    const handleSynergyChange = (e) => {
      const detail = e.detail || {};
      if (detail.market && detail.market.code) {
        const local = resolveRegionLocally(detail.market.code);
        setCountry(local.country);
        setCountryName(local.country_name);
      }
      if (detail.currency) {
        const rawCurr = fallbackData.rawCurrencies[detail.currency] || { symbol: detail.currency, name: detail.currency };
        setCurrency(detail.currency);
        setCurrencyInfo({ code: detail.currency, symbol: rawCurr.symbol, name: rawCurr.name });
      }
      if (isSupportedLanguageCode(detail.lang)) {
        setLanguage(detail.lang);
      }
    };

    const handleDefaultChange = (e) => {
      const detail = e.detail || {};
      if (detail.marketCode === country && detail.defaultLang && isSupportedLanguageCode(detail.defaultLang)) {
        setLanguage(detail.defaultLang);
      }
    };

    window.addEventListener('synergyLocalizationChanged', handleSynergyChange);
    window.addEventListener('synergyMarketDefaultChanged', handleDefaultChange);
    return () => {
      window.removeEventListener('synergyLocalizationChanged', handleSynergyChange);
      window.removeEventListener('synergyMarketDefaultChanged', handleDefaultChange);
    };
  }, [country]);

  // Trigger DOM localization pass whenever country, currency, or language updates
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
    if (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.applyLocalization === 'function') {
      requestAnimationFrame(() => {
        window.SynergyLocalization.applyLocalization();
      });
    }
  }, [country, currency, language]);

  // Resolve initial region: saved choice wins, otherwise IP-detect
  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
    const synMarket = typeof localStorage !== 'undefined' ? localStorage.getItem('synergy_market') : null;
    const synCurr = typeof localStorage !== 'undefined' ? localStorage.getItem('synergy_currency') : null;
    const synLang = typeof localStorage !== 'undefined' ? localStorage.getItem('synergy_lang') : null;

    setHasSavedRegion(!!((saved && saved.country) || synMarket));

    const loadRegion = async () => {
      let countryCode = (saved && saved.country) || synMarket || null;
      let isAutodetected = false;

      if (!countryCode) {
        countryCode = await detectClientLocation();
        isAutodetected = true;
      }

      const applyResolved = (d, src) => {
        setSource(src);
        setCountry(d.country);
        setCountryName(d.country_name);
        let resolvedCurrency = d.currency;
        let resolvedCurrencyInfo = d.currency_info;
        if (synCurr && fallbackData.rawCurrencies[synCurr]) {
          resolvedCurrency = synCurr;
          resolvedCurrencyInfo = { code: synCurr, ...fallbackData.rawCurrencies[synCurr] };
        } else if (saved && saved.currency) {
          resolvedCurrency = saved.currency;
          resolvedCurrencyInfo = saved.currencyInfo || d.currency_info;
        }
        setCurrency(resolvedCurrency);
        setCurrencyInfo(resolvedCurrencyInfo);
        let resolvedLanguage = d.default_language || 'en';
        if (isSupportedLanguageCode(synLang)) {
          resolvedLanguage = synLang;
        } else if (saved && isSupportedLanguageCode(saved.language)) {
          resolvedLanguage = saved.language;
        }
        setLanguage(resolvedLanguage);
        setReady(true);
        persist({
          country: d.country,
          currency: resolvedCurrency,
          currencyInfo: resolvedCurrencyInfo,
          language: resolvedLanguage
        });
      };

      const url = `${API_URL}/api/geo/resolve${countryCode ? `?country=${countryCode}` : ''}`;
      axios.get(url)
        .then((r) => applyResolved(r.data, isAutodetected ? 'ip' : r.data.source))
        .catch(() => applyResolved(resolveRegionLocally(countryCode), isAutodetected ? 'ip' : 'saved'));
    };

    loadRegion();
  }, [persist]);

  const changeCountry = useCallback((code, preserveLang = false) => {
    const local = resolveRegionLocally(code);
    setCountry(local.country);
    setCountryName(local.country_name);
    setCurrency(local.currency);
    setCurrencyInfo(local.currency_info);

    let targetLang = language;
    if (!preserveLang) {
      const adminDefault = (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.getRegionDefaultLanguage === 'function')
        ? window.SynergyLocalization.getRegionDefaultLanguage(local.country)
        : local.default_language;
      if (adminDefault && isSupportedLanguageCode(adminDefault)) {
        targetLang = adminDefault;
        setLanguage(targetLang);
      }
    }

    persist({
      country: local.country,
      currency: local.currency,
      currencyInfo: local.currency_info,
      language: targetLang
    });

    if (typeof window !== 'undefined') {
      if (window.SynergyLocalization && typeof window.SynergyLocalization.setMarket === 'function') {
        window.SynergyLocalization.setMarket(local.country, preserveLang);
      }
      window.dispatchEvent(new CustomEvent('synergyLocaleChanged', { detail: { language: targetLang, country: local.country, currency: local.currency } }));
    }
  }, [language, persist]);

  const changeCurrency = useCallback((code) => {
    const raw = fallbackData.rawCurrencies[code];
    const info = (options.currencies || []).find((c) => c.code === code) || (raw ? { code, ...raw } : { code, symbol: code, name: code });
    setCurrency(code);
    setCurrencyInfo(info);
    persist({ country, currency: code, currencyInfo: info, language });
    if (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.setCurrency === 'function') {
      window.SynergyLocalization.setCurrency(code);
    }
  }, [country, language, options, persist]);

  const changeLanguage = useCallback((code) => {
    if (!isSupportedLanguageCode(code)) return;
    setLanguage(code);
    if (typeof document !== 'undefined') document.documentElement.lang = code;
    persist({ country, currency, currencyInfo, language: code });
    if (typeof window !== 'undefined') {
      if (window.SynergyLocalization && typeof window.SynergyLocalization.setLanguage === 'function') {
        window.SynergyLocalization.setLanguage(code);
      }
      window.dispatchEvent(new CustomEvent('synergyLocaleChanged', { detail: { language: code, country, currency } }));
    }
  }, [country, currency, currencyInfo, persist]);

  const setRegionDefaultLanguage = useCallback((marketCode, langCode) => {
    if (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.setRegionDefaultLanguage === 'function') {
      window.SynergyLocalization.setRegionDefaultLanguage(marketCode, langCode);
      if (country === marketCode) {
        setLanguage(langCode);
      }
    }
  }, [country]);

  const getRegionDefaultLanguage = useCallback((marketCode) => {
    if (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.getRegionDefaultLanguage === 'function') {
      return window.SynergyLocalization.getRegionDefaultLanguage(marketCode);
    }
    const local = resolveRegionLocally(marketCode);
    return local.default_language || 'en';
  }, []);

  const t = useCallback((key, fallback) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (typeof window !== 'undefined' && window.SynergyLocalization && typeof window.SynergyLocalization.translateString === 'function') {
      return window.SynergyLocalization.translateString(fallback || key, language);
    }
    return fallback || key;
  }, [language]);

  const countryFlag = COUNTRY_FLAGS[(country || 'KE').toUpperCase()] || '🌍';

  return (
    <RegionContext.Provider value={{
      country,
      countryName,
      countryFlag,
      region: ['KE', 'TZ', 'UG'].includes((country || 'KE').toUpperCase()) ? 'east-africa' : 'west',
      currency,
      currencyInfo,
      language,
      languages: availableLanguages,
      options,
      ready,
      t,
      source,
      hasSavedRegion,
      changeCountry,
      changeCurrency,
      changeLanguage,
      setRegionDefaultLanguage,
      getRegionDefaultLanguage,
      isAfrican: ['KE','UG','TZ','RW','BI','SS','SO','ET','DJ','ER','SD','EG','MA','TN','DZ','LY','NG','GH','SN','CI','BJ','TG','BF','ML','NE','MR','GM','GN','GW','SL','LR','CM','GA','CG','CD','AO','ZA','BW','NA','ZW','MZ','MG','MU','MW','ZM','LS','SZ','KM','SC','ST','CV','EH','CF','TD','EQ'].includes((country || 'KE').toUpperCase()),
      isWestern: ['US','CA','GB','IE','AU','NZ','FR','DE','IT','ES','NL','BE','SE','NO','FI','DK','AT','CH','PT','PL','CZ','HU','GR','LU','IS','LI','MT','CY','EE','LV','LT','SI','SK','HR','RO','BG'].includes((country || '').toUpperCase()),
      isUSorCA: ['US','CA'].includes((country || '').toUpperCase()),
      contactPhone: (() => {
        const cc = (country || 'KE').toUpperCase();
        if (cc === 'US' || cc === 'CA') return '+1 (800) 555-0114';
        if (cc === 'GB') return '+44 800 016 6028';
        if (cc === 'KE') return '+254 700 000 000';
        if (cc === 'NG') return '+234 800 000 0000';
        if (cc === 'ZA') return '+27 800 000 000';
        return '+254 700 000 000';
      })(),
      contactPhoneCountry: (country || 'KE').toUpperCase(),
    }}>
      {children}
    </RegionContext.Provider>
  );
}
