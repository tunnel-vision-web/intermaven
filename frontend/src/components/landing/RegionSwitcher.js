import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useRegion } from '../../RegionContext';

function RegionSwitcher() {
  const { country, currency, currencyInfo, language, languages, options, changeCountry, changeCurrency, changeLanguage } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="region-switcher" ref={ref} data-testid="region-switcher">
      <button
        className="region-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Region and currency"
        data-testid="region-switcher-trigger"
      >
        <Globe size={15} />
        <span>{currencyInfo?.symbol || currency} {currency}</span>
        <ChevronDown size={13} className={`region-chevron ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="region-panel" data-testid="region-panel">
          <label className="region-field">
            <span>Country / region</span>
            <select
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              data-testid="region-country-select"
            >
              {(options.countries || []).map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
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
              {(languages || []).map((l) => (
                <option key={l.code} value={l.code}>{l.native} ({l.name})</option>
              ))}
            </select>
          </label>

          <p className="region-note">Prices update live to your local currency.</p>
        </div>
      )}
    </div>
  );
}

export default RegionSwitcher;
