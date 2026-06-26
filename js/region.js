// ─────────────────────────────────────────────────────────────────
// REGION DETECTION — Static Pages Helper
// ─────────────────────────────────────────────────────────────────
(function() {
  const STORAGE_KEY = 'intermaven_region';
  const WESTERN_COUNTRIES = new Set([
    'US', 'CA', 'GB', 'IE', 'AU', 'NZ',
    'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'FI', 'DK', 'AT', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR'
  ]);

  function getSavedRegion() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveRegion(region) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(region));
      window.dispatchEvent(new CustomEvent('regionChanged', { detail: region }));
    } catch (e) {}
  }

  function detectTimezoneCountry() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const tzLower = tz.toLowerCase();
        if (tzLower.includes('nairobi')) return { country: 'KE', currency: 'KES' };
        if (tzLower.includes('kampala')) return { country: 'UG', currency: 'UGX' };
        if (tzLower.includes('dar_es_salaam')) return { country: 'TZ', currency: 'TZS' };
        if (tzLower.includes('kigali')) return { country: 'RW', currency: 'RWF' };
        if (tzLower.includes('lagos')) return { country: 'NG', currency: 'NGN' };
        if (tzLower.includes('johannesburg')) return { country: 'ZA', currency: 'ZAR' };
        if (tzLower.includes('london')) return { country: 'GB', currency: 'GBP' };
        if (tzLower.includes('india') || tzLower.includes('kolkata')) return { country: 'IN', currency: 'INR' };
        if (tzLower.includes('tokyo') || tzLower.includes('japan')) return { country: 'JP', currency: 'JPY' };
        if (tzLower.includes('america/')) return { country: 'US', currency: 'USD' };
        if (tzLower.includes('europe/')) return { country: 'FR', currency: 'EUR' };
      }
    } catch (e) {}
    return { country: 'KE', currency: 'KES' }; // default fallback
  }

  // Initialize region
  let currentRegion = getSavedRegion();
  if (!currentRegion) {
    currentRegion = detectTimezoneCountry();
    saveRegion(currentRegion);
    
    // Attempt async IP-based detection in background
    fetch('https://ipapi.co/json/')
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then(data => {
        if (data && data.country_code) {
          const cc = data.country_code.toUpperCase();
          const currency = data.currency || (WESTERN_COUNTRIES.has(cc) ? 'USD' : 'KES');
          const newRegion = { country: cc, currency: currency };
          saveRegion(newRegion);
        }
      })
      .catch(err => {
        console.warn('IP geolocation failed, using timezone fallback:', err.message);
      });
  }

  // Expose to window
  window.IntermavenRegion = {
    getRegion: function() {
      return getSavedRegion() || currentRegion;
    },
    isWesternRegion: function() {
      const reg = this.getRegion();
      return reg && WESTERN_COUNTRIES.has(reg.country.toUpperCase());
    },
    setRegion: function(countryCode, currencyCode) {
      saveRegion({ country: countryCode.toUpperCase(), currency: currencyCode.toUpperCase() });
    }
  };
})();
