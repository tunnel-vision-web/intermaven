import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useRegion, LANGUAGES_LIST, COUNTRY_FLAGS } from '../../RegionContext';

function RegionSwitcher({ iconOnly = false }) {
  const {
    country,
    countryName,
    countryFlag,
    currency,
    currencyInfo,
    language,
    languages,
    options,
    changeCountry,
    changeCurrency,
    changeLanguage,
    setRegionDefaultLanguage,
    getRegionDefaultLanguage
  } = useRegion();

  const [open, setOpen] = useState(false);
  const [showAdminDefaults, setShowAdminDefaults] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
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
  const activeLangIndex = Math.max(0, langList.findIndex((l) => l.code === language));
  const activeLangObj = langList[activeLangIndex] || langList[0];
  const nextLangObj = langList[(activeLangIndex + 1) % langList.length] || langList[0];

  const toggleLanguageQuick = (e) => {
    e.stopPropagation();
    changeLanguage(nextLangObj.code);
  };

  const currentDefaultLang = getRegionDefaultLanguage ? getRegionDefaultLanguage(country) : 'en';

  return (
    <div
      id="synergyLocalizationBar"
      data-prerendered="true"
      className={`region-switcher ${iconOnly ? 'region-switcher-icon-only' : ''}`}
      ref={ref}
      data-testid="region-switcher"
      style={{ display: 'inline-flex', alignItems: 'center', gap: iconOnly ? '6px' : '4px', position: 'relative', flexShrink: 0 }}
    >
      <div
        className="region-trigger"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: iconOnly ? '0' : '5px 10px',
          whiteSpace: 'nowrap',
          background: iconOnly ? 'transparent' : undefined,
          border: iconOnly ? 'none' : undefined
        }}
      >
        <button
          type="button"
          id="marketSelectorBtn"
          onClick={() => setOpen((o) => !o)}
          aria-label="Region and currency Selection"
          title={`Region & Currency (${countryFlag || '🇰🇪'} ${currencyInfo?.symbol || 'KSh'} ${currency})`}
          data-tooltip={`Region & Currency (${countryFlag || '🇰🇪'} ${currencyInfo?.symbol || 'KSh'} ${currency})`}
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
            whiteSpace: 'nowrap'
          }}
        >
          <Globe size={iconOnly ? 16 : 14} style={{ color: '#22d3ee' }} />
          <span id="selectedMarketText" data-no-i18n="true" style={{ fontWeight: 700, fontSize: '12px' }}>
            {countryFlag || '🇰🇪'} {currencyInfo?.symbol || 'KSh'} {currency}
          </span>
          {!iconOnly && <ChevronDown size={13} className={`region-chevron ${open ? 'open' : ''}`} />}
        </button>

        {!iconOnly && (
          <span data-no-i18n="true" style={{ opacity: 0.3, padding: '0 2px', userSelect: 'none' }}>|</span>
        )}

        <button
          type="button"
          id="langSelectorBtn"
          onClick={toggleLanguageQuick}
          title={`Language: ${activeLangObj.native} — Click to switch to ${nextLangObj.native}`}
          data-tooltip={`Language: ${activeLangObj.native} (Switch to ${nextLangObj.native})`}
          data-testid="lang-quick-toggle"
          data-no-i18n="true"
          style={{
            background: language === 'en' ? 'rgba(34, 211, 238, 0.14)' : (activeLangObj.accent || '#10b981'),
            color: language === 'en' ? '#22d3ee' : (activeLangObj.textDark || '#042f2e'),
            border: language === 'en' ? '1px solid rgba(34, 211, 238, 0.35)' : `1px solid ${activeLangObj.accent || '#10b981'}`,
            borderRadius: '3px',
            padding: '2px 7px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.4px',
            lineHeight: 1.3
          }}
        >
          <span id="selectedLangText" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', lineHeight: 1 }}>{activeLangObj.flag || '🌐'}</span>
            <span style={{ marginLeft: '4px' }}>
              {activeLangObj.short || activeLangObj.code.toUpperCase()}
            </span>
          </span>
        </button>
      </div>

      {open && (
        <div className="region-panel" data-testid="region-panel" style={{ zIndex: 99999, minWidth: '260px' }}>
          <label className="region-field">
            <span>Country / Region</span>
            <select
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              data-testid="region-country-select"
            >
              {(options.countries || []).map((c) => {
                const flag = c.flag || COUNTRY_FLAGS[c.code] || '';
                return (
                  <option key={c.code} value={c.code} data-no-i18n="true">
                    {flag ? `${flag} ` : ''}{c.name} ({c.currency})
                  </option>
                );
              })}
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
                <option key={c.code} value={c.code} data-no-i18n="true">
                  {c.code}{c.symbol ? ` (${c.symbol})` : ''} — {c.name}
                </option>
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
                <option key={l.code} value={l.code} data-no-i18n="true">
                  {l.flag ? `${l.flag} ` : ''}{l.native} ({l.name})
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
              marginTop: '6px'
            }}
            data-no-i18n="true"
          >
            {langList.map((l) => {
              const isSelected = language === l.code;
              const accentColor = l.accent || '#22d3ee';
              const darkText = l.textDark || '#060813';
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => changeLanguage(l.code)}
                  data-testid={`lang-btn-${l.code}`}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '3px',
                    border: isSelected ? `1px solid ${accentColor}` : '1px solid #1e293b',
                    background: isSelected ? accentColor : '#0f172a',
                    color: isSelected ? darkText : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.native}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => setShowAdminDefaults((s) => !s)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '4px 0'
              }}
            >
              <span>⚙️ Admin: Region Default Language</span>
              <span>{showAdminDefaults ? '▲' : '▼'}</span>
            </button>

            {showAdminDefaults && (
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '10px' }}>
                  Default language for {countryName || country}:
                </p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {langList.map((l) => {
                    const isDefault = currentDefaultLang === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setRegionDefaultLanguage && setRegionDefaultLanguage(country, l.code)}
                        title={`Set ${l.name} as default language for ${countryName}`}
                        style={{
                          flex: 1,
                          padding: '4px 3px',
                          fontSize: '10px',
                          borderRadius: '3px',
                          border: isDefault ? '1px solid #10b981' : '1px solid #334155',
                          background: isDefault ? 'rgba(16, 185, 129, 0.25)' : '#0f172a',
                          color: isDefault ? '#34d399' : '#94a3b8',
                          cursor: 'pointer',
                          fontWeight: isDefault ? 800 : 500
                        }}
                      >
                        {l.flag} {l.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="region-note" style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
            Prices and plans update live to your local currency.
          </p>
        </div>
      )}
    </div>
  );
}

export default RegionSwitcher;
