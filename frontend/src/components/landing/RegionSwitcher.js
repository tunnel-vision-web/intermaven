import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useRegion, LANGUAGES_LIST } from '../../RegionContext';

function RegionSwitcher() {
  const {
    country,
    countryFlag,
    currency,
    currencyInfo,
    language,
    languages,
    options,
    changeCountry,
    changeCurrency,
    changeLanguage,
  } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('synergyOpenRegionSwitcher', openHandler);
    return () => window.removeEventListener('synergyOpenRegionSwitcher', openHandler);
  }, []);

  const langList = Array.isArray(languages) && languages.length > 0 ? languages : LANGUAGES_LIST;
  const activeIdx = Math.max(0, langList.findIndex((l) => l.code === language));
  const activeLang = langList[activeIdx] || langList[0];
  const nextLang = langList[(activeIdx + 1) % langList.length] || langList[0];

  const toggleLanguageQuick = (e) => {
    e.stopPropagation();
    changeLanguage(nextLang.code);
  };

  return (
    <div className="region-switcher" ref={ref} data-testid="region-switcher" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
      <div className="region-trigger" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Region and currency"
          data-testid="region-switcher-trigger"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            padding: 0,
            font: 'inherit',
          }}
        >
          <Globe size={14} style={{ color: '#22d3ee' }} />
          <span style={{ fontWeight: 700 }}>{country} · {currencyInfo?.symbol || currency} {currency}</span>
          <ChevronDown size={13} className={`region-chevron ${open ? 'open' : ''}`} />
        </button>

        <span style={{ opacity: 0.3, padding: '0 2px', userSelect: 'none' }}>|</span>

        <button
          type="button"
          onClick={toggleLanguageQuick}
          title={`Language: ${activeLang.native} — Click to switch to ${nextLang.native}`}
          data-testid="lang-quick-toggle"
          style={{
            background: language === 'en' ? 'rgba(34, 211, 238, 0.14)' : (activeLang.accent || '#10b981'),
            color: language === 'en' ? '#22d3ee' : (activeLang.textDark || '#042f2e'),
            border: language === 'en' ? '1px solid rgba(34, 211, 238, 0.35)' : `1px solid ${activeLang.accent || '#10b981'}`,
            borderRadius: '3px',
            padding: '2px 7px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.4px',
            lineHeight: 1.3,
          }}
        >
          <span>{activeLang.short || activeLang.code.toUpperCase()}</span>
        </button>
      </div>

      {open && (
        <div className="region-panel" data-testid="region-panel" style={{ zIndex: 99999, minWidth: '250px' }}>
          <label className="region-field">
            <span>Country / Region</span>
            <select
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              data-testid="region-country-select"
            >
              {(options.countries || []).map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
              ))}
            </select>
          </label>

          <label className="region-field">
            <span>Currency</span>
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              data-testid="region-currency-select"
            >
              {(options.currencies || []).map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </label>

          <label className="region-field">
            <span>Language</span>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              data-testid="region-language-select"
            >
              {langList.map((l) => (
                <option key={l.code} value={l.code}>{l.short} — {l.native} ({l.name})</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

export default RegionSwitcher;
