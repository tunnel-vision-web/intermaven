import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  { code: 'en', short: 'EN', name: 'English', native: 'English', flag: 'LOC', accent: '#22d3ee', textDark: '#060813' },
  { code: 'sw', short: 'SW', name: 'Swahili', native: 'Kiswahili', flag: 'LOC', accent: '#10b981', textDark: '#042f2e' },
  { code: 'ki', short: 'KI', name: 'Kikuyu', native: 'GÄ©kÅ©yÅ©', flag: 'LOC', accent: '#f59e0b', textDark: '#1c1917' },
  { code: 'es', short: 'ES', name: 'Spanish', native: 'EspaÃ±ol', flag: 'LOC', accent: '#a855f7', textDark: '#ffffff' }
];

export const COUNTRY_FLAGS = {
  KE: 'ðŸ‡°ðŸ‡ª', UG: 'ðŸ‡ºðŸ‡¬', TZ: 'ðŸ‡¹ðŸ‡¿', RW: 'ðŸ‡·ðŸ‡¼', NG: 'ðŸ‡³ðŸ‡¬', GH: 'ðŸ‡¬ðŸ‡­', ZA: 'ðŸ‡¿ðŸ‡¦',
  US: 'ðŸ‡ºðŸ‡¸', CA: 'ðŸ‡¨ðŸ‡¦', GB: 'ðŸ‡¬ðŸ‡§', EU: 'ðŸ‡ªðŸ‡º', FR: 'ðŸ‡«ðŸ‡·', DE: 'ðŸ‡©ðŸ‡ª', ES: 'ðŸ‡ªðŸ‡¸',
  IN: 'ðŸ‡®ðŸ‡³', JP: 'ðŸ‡¯ðŸ‡µ', AU: 'ðŸ‡¦ðŸ‡º'
};

const TRANSLATIONS = {
  en: { 'nav.home': 'Home', 'nav.tools': 'AI Tools', 'nav.apps': 'Apps', 'nav.pricing': 'Pricing', 'nav.about': 'About', 'nav.help': 'Help Center', 'nav.forum': 'Forum', 'nav.perfect_for': 'Perfect For' },
  sw: { 'nav.home': 'Nyumbani', 'nav.tools': 'Zana za AI', 'nav.apps': 'Programu', 'nav.pricing': 'Bei', 'nav.about': 'Kuhusu', 'nav.help': 'Kituo cha Msaada', 'nav.forum': 'Jukwaa', 'nav.perfect_for': 'Inafaa Kwa' },
  ki: { 'nav.home': 'MÅ©ciÄ©', 'nav.tools': 'Indo cia AI', 'nav.apps': 'App', 'nav.pricing': 'Thogora', 'nav.about': 'Å¨horo WitÅ©', 'nav.help': 'Å¨teithio', 'nav.forum': 'KÄ©ama', 'nav.perfect_for': 'YagÄ©rÄ©ire' },
  es: { 'nav.home': 'Inicio', 'nav.tools': 'Herramientas IA', 'nav.apps': 'Apps', 'nav.pricing': 'Precios', 'nav.about': 'Nosotros', 'nav.help': 'Ayuda', 'nav.forum': 'Foro', 'nav.perfect_for': 'Ideal Para' },
};

// Helper to resolve region options locally if backend is down or on initial render
const resolveRegionLocally = (countryCode) => {
  const cc = (countryCode || 'KE').toUpperCase();
  const rawCountry = fallbackData.rawCountries[cc] || fallbackData.rawCountries['KE'];
  const currencyCode = rawCountry.currency;
  const rawCurrency = fallbackData.rawCurrencies[currencyCode] || { symbol: currencyCode, name: currencyCode };
  const langs = (rawCountry.langs || []).map(lCode => ({
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

// Client-side geolocation detection using a public free HTTPS endpoint
const detectClientLocation = async () => {
  try {
    const res = await axios.get('https://ipapi.co/json/', { timeout: 3000 });
    if (res.data && res.data.country_code) {
      const cc = res.data.country_code.toUpperCase();
      if (fallbackData.rawCountries[cc]) {
        return cc;
      }
    }
  } catch (e) {
    console.warn('Client-side IP geolocation failed:', e);
  }
  
  // Backup fallback using timezone detection
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
  
  return 'KE'; // Default fallback
};

export function RegionProvider({ children }) {
  const [country, setCountry] = useState('KE');
  const [countryName, setCountryName] = useState('Kenya');
  const [currency, setCurrency] = useState('KES');
  const [currencyInfo, setCurrencyInfo] = useState({ code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' });
  const [language, setLanguage] = useState('en');
  const [languages, setLanguages] = useState([{ code: 'en', name: 'English', native: 'English' }]);
  const [options, setOptions] = useState({
    countries: fallbackData.countries,
    currencies: fallbackData.currencies,
    languages: fallbackData.languages
  });
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState(null);
  const [hasSavedRegion, setHasSavedRegion] = useState(true);

  const persist = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (data?.language) localStorage.setItem('tunemavens_lang', data.language);
      if (data?.country) localStorage.setItem('tunemavens_country', data.country);
    } catch (e) { /* noop */ }
  }, []);

  // Load switcher options once.
  useEffect(() => {
    axios.get(`${API_URL}/api/geo/options`)
      .then((r) => {
        if (r.data && r.data.countries) {
          setOptions(r.data);
        }
      })
      .catch(() => {
        // Keep using fallbackData initialized in state
      });
  }, []);

  // Resolve region: saved choice wins, otherwise IP-detect.
  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
    setHasSavedRegion(!!(saved && saved.country));

    const loadRegion = async () => {
      let countryCode = saved && saved.country ? saved.country : null;
      let isAutodetected = false;
      
      if (!countryCode) {
        countryCode = await detectClientLocation();
        isAutodetected = true;
      }
      
      const url = `${API_URL}/api/geo/resolve${countryCode ? `?country=${countryCode}` : ''}`;
      axios.get(url).then((r) => {
        const d = r.data;
        setSource(isAutodetected ? 'ip' : d.source);
        setCountry(d.country);
        setCountryName(d.country_name);
        setLanguages(d.languages || []);
        let resolvedCurrency = d.currency;
        let resolvedCurrencyInfo = d.currency_info;
        if (saved && saved.currency) {
          resolvedCurrency = saved.currency;
          resolvedCurrencyInfo = saved.currencyInfo || d.currency_info;
        }
        setCurrency(resolvedCurrency);
        setCurrencyInfo(resolvedCurrencyInfo);
        let resolvedLanguage = d.default_language || 'en';
        if (saved && saved.language) {
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
      }).catch(() => {
        // Local Fallback resolution
        const d = resolveRegionLocally(countryCode);
        setSource(isAutodetected ? 'ip' : 'saved');
        setCountry(d.country);
        setCountryName(d.country_name);
        setLanguages(d.languages || []);
        let resolvedCurrency = d.currency;
        let resolvedCurrencyInfo = d.currency_info;
        if (saved && saved.currency) {
          resolvedCurrency = saved.currency;
          resolvedCurrencyInfo = saved.currencyInfo || d.currency_info;
        }
        setCurrency(resolvedCurrency);
        setCurrencyInfo(resolvedCurrencyInfo);
        let resolvedLanguage = d.default_language || 'en';
        if (saved && saved.language) {
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
      });
    };

    loadRegion();
  }, []);

  const changeCountry = useCallback((code) => {
    const local = resolveRegionLocally(code);
    setCountry(local.country);
    setCountryName(local.country_name);
    setCurrency(local.currency);
    setCurrencyInfo(local.currency_info);
    persist({ country: local.country, currency: local.currency, currencyInfo: local.currency_info, language });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('synergyLocaleChanged', { detail: { language, country: local.country, currency: local.currency } }));
    }
    axios.get(`${API_URL}/api/geo/resolve?country=${code}`).then((r) => {
      const d = r.data;
      if (d && d.country) {
        setCountry(d.country);
        setCountryName(d.country_name || local.country_name);
        setCurrency(d.currency || local.currency);
        setCurrencyInfo(d.currency_info || local.currency_info);
        persist({ country: d.country, currency: d.currency || local.currency, currencyInfo: d.currency_info || local.currency_info, language });
      }
    }).catch(() => {
      // Already resolved locally above
    });
  }, [language, persist]);

  const changeCurrency = useCallback((code) => {
    const info = (options.currencies || []).find((c) => c.code === code) || { code, symbol: code, name: code };
    setCurrency(code);
    setCurrencyInfo(info);
    persist({ country, currency: code, currencyInfo: info, language });
  }, [country, language, options, persist]);

  const changeLanguage = useCallback((code) => {
    setLanguage(code);
    if (typeof document !== 'undefined') document.documentElement.lang = code;
    persist({ country, currency, currencyInfo, language: code });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('synergyLocaleChanged', { detail: { language: code, country, currency } }));
    }
  }, [country, currency, currencyInfo, persist]);

  const t = useCallback((key, fallback) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || fallback || key;
  }, [language]);

  const countryFlag = COUNTRY_FLAGS[(country || 'KE').toUpperCase()] || '🌍';

  return (
    <RegionContext.Provider value={{
      country, countryName, countryFlag, currency, currencyInfo, language, languages: LANGUAGES_LIST, options, ready, t,
      source, hasSavedRegion,
      changeCountry, changeCurrency, changeLanguage,
      // Derived helpers
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
