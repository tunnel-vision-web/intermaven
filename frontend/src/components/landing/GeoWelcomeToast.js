import { useEffect, useRef } from 'react';
import { useRegion } from '../../RegionContext';
import { useToast } from '../../App';

const FLAG_KEY = 'intermaven_geo_welcomed';

// One-time welcome toast that tells visitors (esp. diaspora / Western traffic)
// their region was detected and prices are shown in their local currency.
function GeoWelcomeToast() {
  const { ready, source, currency, countryName, hasSavedRegion } = useRegion();
  const { addToast } = useToast();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!ready) return;
    // Skip returning visitors who already picked a region.
    if (hasSavedRegion) return;
    // Only greet when we actually detected a location (not the safe default).
    if (source !== 'ip') return;
    let already = false;
    try { already = localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { already = false; }
    if (already) return;

    fired.current = true;
    try { localStorage.setItem(FLAG_KEY, '1'); } catch (e) { /* noop */ }
    addToast(
      `🌍 You're in ${countryName}`,
      `Prices are shown in ${currency}. Change anytime from the menu.`,
      'success'
    );
  }, [ready, source, currency, countryName, hasSavedRegion, addToast]);

  return null;
}

export default GeoWelcomeToast;
