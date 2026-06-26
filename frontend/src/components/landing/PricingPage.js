import PageHeader from './PageHeader';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FlatIcon } from '../FlatIcon';
import { useRegion } from '../../RegionContext';
import { useCms } from '../../cms/CmsContext';
import fallbackData from '../../fallbackData.json';

const API_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : '');

const roundNinetyNine = (value) => {
  if (value <= 0) return 0.0;
  const base = Math.floor(value);
  let candidate = base + 0.99;
  if (candidate < value - 1e-9) {
    candidate = base + 1 + 0.99;
  }
  return Math.round(candidate * 100) / 100;
};

const roundClean = (value) => {
  if (value <= 0) return 0.0;
  let step = 10;
  if (value < 100) {
    step = 10;
  } else if (value < 1000) {
    step = 50;
  } else if (value < 10000) {
    step = 100;
  } else if (value < 100000) {
    step = 500;
  } else {
    step = 1000;
  }
  return Math.ceil(value / step) * step;
};

const formatPrice = (value, currencyInfo) => {
  const decimals = currencyInfo.decimals !== undefined ? currencyInfo.decimals : 0;
  const symbol = currencyInfo.symbol || '$';
  const pos = currencyInfo.pos || 'before';
  
  let num;
  if (decimals === 0) {
    num = Math.round(value).toLocaleString();
  } else {
    num = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  const alpha = /[a-zA-Z]/.test(symbol);
  if (pos === 'after') {
    return alpha ? `${num} ${symbol}` : `${num}${symbol}`;
  }
  return alpha ? `${symbol} ${num}` : `${symbol}${num}`;
};

const convertAndFormatPrice = (amountKes, targetCurrency, currencyInfo, fxRates, doRound = true) => {
  const rate = fxRates[targetCurrency] || 1.0;
  const converted = amountKes * rate;
  
  let finalAmount = converted;
  if (doRound) {
    const roundingMode = currencyInfo.rounding || 'clean';
    if (roundingMode === 'ninety_nine') {
      finalAmount = roundNinetyNine(converted);
    } else {
      finalAmount = roundClean(converted);
    }
  } else {
    finalAmount = Math.round(converted * 100) / 100;
  }
  
  return {
    amount: finalAmount,
    display: formatPrice(finalAmount, currencyInfo)
  };
};

const calculateFallbackPricing = (targetCurrency, fallbackData) => {
  const currency = targetCurrency.toUpperCase();
  const rawCurrency = fallbackData.rawCurrencies[currency] || { symbol: currency, name: currency, decimals: 0, rounding: 'clean', pos: 'before' };
  const fxRates = fallbackData.fxRates || {};
  
  const plans = (fallbackData.plans || []).map(p => {
    let displayPrice = '';
    let amount = 0;
    if (p.kes > 0) {
      const res = convertAndFormatPrice(p.kes, currency, rawCurrency, fxRates, true);
      displayPrice = res.display;
      amount = res.amount;
    } else {
      displayPrice = formatPrice(0, rawCurrency);
    }
    
    return {
      id: p.id,
      name: p.name,
      credits: p.credits,
      billing: p.billing,
      popular: p.popular,
      cta: p.cta,
      features: p.features,
      price: displayPrice,
      price_amount: amount
    };
  });
  
  const tools = (fallbackData.toolCosts || []).map(t => {
    let disp = '';
    if (t.always_free) {
      disp = 'Always free';
    } else {
      const res = convertAndFormatPrice(t.kes, currency, rawCurrency, fxRates, false);
      disp = `${res.display} on Creator`;
    }
    
    return {
      icon: t.icon,
      color: t.color,
      name: t.name,
      credits: t.credits,
      price: disp,
      always_free: !!t.always_free
    };
  });
  
  return {
    currency: currency,
    currency_symbol: rawCurrency.symbol,
    currency_name: rawCurrency.name,
    plans: plans,
    tools: tools
  };
};

function PricingPage({ portal = 'music', subdomainPage = null, onOpenAuth, onToast }) {
  const { currency, countryName, country } = useRegion();
  // Mother-CMS pulls — region-aware payment callouts, editable by admin without code changes
  const calloutTitle = useCms('pricing.callout.title', 'Pay instantly with M-Pesa');
  const calloutBody = useCms('pricing.callout.body', 'Send to Paybill 522900. Credits load the moment your payment confirms — no waiting, no approval.');
  const isWestern = ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'FI', 'DK', 'AT', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR'].includes(country?.toUpperCase());
  const isUSorCA = ['US', 'CA'].includes(country?.toUpperCase());
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/pricing?currency=${currency}`)
      .then((r) => { if (active) setPricing(r.data); })
      .catch(() => {
        if (active) {
          const fallbackPricing = calculateFallbackPricing(currency, fallbackData);
          setPricing(fallbackPricing);
        }
      });
    return () => { active = false; };
  }, [currency]);

  const handlePayment = async (plan) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onToast('Please sign in or create an account first.', '', '🔑');
        onOpenAuth();
        return;
      }
      onToast(`Initiating checkout for ${plan.name}...`, '', '⏳');

      const res = await axios.post(`${API_URL}/api/payments/initiate`, {
        plan: plan.id,
        amount: plan.price_amount,
        callback_url: window.location.origin + '/dashboard'
      });

      if (res.data && res.data.success && res.data.redirect_url) {
        onToast('Redirecting to secure checkout...', '', '📲');
        window.location.href = res.data.redirect_url;
      } else {
        throw new Error(res.data?.message || 'Failed to initiate checkout.');
      }
    } catch (err) {
      console.error(err);
      onToast(err.response?.data?.detail || err.message || 'Error starting payment session.', '', 'er');
    }
  };

  const pageSubtitle = subdomainPage
    ? 'Pricing crafted for your music team and creative operations.'
    : portal === 'music'
      ? 'Pay once. Credits never expire. No subscriptions, ever.'
      : 'Simple credit pricing for business tools and creative operations.';

  const valueProps = [
    { icon: 'zap', color: 'var(--am)', title: 'Pay once', desc: 'No monthly fees. Buy credits when you need them.' },
    isWestern
      ? { icon: 'card', color: 'var(--gr)', title: 'Card-native payments', desc: 'Card, Apple Pay, Google Pay, PayPal. Credits load instantly.' }
      : { icon: 'mpesa', color: 'var(--gr)', title: 'Local payments', desc: 'M-Pesa, card, or PayPal. Credits load instantly.' },
    { icon: 'refresh', color: 'var(--a3)', title: 'Credits never expire', desc: 'Paid credits roll over forever. Use them at your own pace.' },
    { icon: 'unlock', color: 'var(--a2)', title: 'No lock-in', desc: "Cancel nothing — there's nothing to cancel. Ever." }
  ];

  const plans = pricing?.plans || [];
  const tools = pricing?.tools || [];

  return (
    <>
      <PageHeader pageKey="pricing" portal={portal} breadcrumb="Intermaven › Pricing" title="Simple, honest pricing" subtitle={pageSubtitle} />

      <div style={{ padding: '40px 0 60px' }}>
        <div className="cn">
          {/* Value prop bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            {valueProps.map((item, index) => (
              <div key={index} style={{ background: 'var(--ca)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '16px', textAlign: 'center' }}>
                <div style={{ marginBottom: '6px' }}>
                  <FlatIcon name={item.icon} size={24} color={item.color} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '3px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--mu)' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Currency note */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--mu)', marginBottom: '20px' }} data-testid="pricing-currency-note">
            Showing prices in <strong style={{ color: 'var(--tx)' }}>{pricing?.currency || currency}</strong>
            {countryName ? ` for ${countryName}` : ''} · change region in the top menu
          </div>

          {/* Plan cards (dynamic) */}
          <div className="sl2" style={{ textAlign: 'center' }}>Choose your pack</div>
          <div className="prg" style={{ marginBottom: '32px' }} data-testid="pricing-plans">
            {plans.map((plan) => (
              <div key={plan.id} className={`prc${plan.popular ? ' pop' : ''}`} data-testid={`pricing-plan-${plan.id}`}>
                {plan.popular && <div className="popb">Most popular</div>}
                <div className="prn">{plan.name}</div>
                <div className="prp" data-testid={`pricing-price-${plan.id}`}>
                  {plan.id === 'free' ? 'Free' : plan.price}
                  {plan.billing ? <span> {plan.billing}</span> : null}
                </div>
                <div className="prce">{plan.credits}</div>
                <ul className="prf">
                  {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button
                  className={`prb ${plan.id === 'free' ? 'prbg' : 'prbp'}`}
                  onClick={() => (plan.id === 'free' ? onOpenAuth() : handlePayment(plan))}
                  data-testid={`pricing-${plan.id}-cta`}
                >
                  {plan.cta}
                </button>
                {plan.id !== 'free' && (
                  <p style={{ fontSize: '10px', color: 'var(--mu)', textAlign: 'center', marginTop: '8px' }}>
                    {isUSorCA ? 'Venmo, Cash App, Zelle, Card, PayPal' : isWestern ? 'Card, Apple Pay, Google Pay, PayPal' : 'M-Pesa, Visa, Mastercard, PayPal'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Credit cost breakdown (dynamic) */}
          <div style={{ background: 'var(--ca)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FlatIcon name="zap" size={16} color="var(--am)" />
              <span style={{ fontSize: '13px', fontWeight: '700' }}>What does 1 credit run cost?</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {tools.map((tool, index) => (
                <div 
                  key={index} 
                  style={{ 
                    background: 'var(--bg2)', 
                    borderRadius: 'var(--r)', 
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
                    <FlatIcon name={tool.icon} size={18} color={tool.color} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}>{tool.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--mu)' }}>{tool.credits}</div>
                  <div style={{ fontSize: '10px', color: tool.always_free ? 'var(--gr)' : 'var(--a2)', marginTop: '4px' }}>
                    {tool.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Localized payment callout */}
          <div className="mpbox">
            <div>
              <FlatIcon name={isWestern ? 'card' : 'mpesa'} size={32} color="var(--gr)" />
            </div>
            <div data-testid="pricing-callout">
              <h4>{calloutTitle}</h4>
              <p>{calloutBody}</p>
              <p style={{ marginTop: '6px' }}>
                Also accepted: <strong style={{ color: 'var(--tx)' }}>Visa, Mastercard, PayPal</strong> for users worldwide.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginTop: '36px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>
              Frequently asked questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { q: 'Do free credits expire?', a: 'Free starter credits expire after 90 days of inactivity. Paid credits (Creator and Pro) never expire.' },
                { q: 'Can I top up more than once?', a: 'Yes. Buy as many packs as you need. Credits stack — your balance just keeps growing.' },
                { q: 'What if a tool fails to generate?', a: "Credits are only deducted on a successful generation. If there's a server error your credits are automatically restored." },
                { q: isWestern ? 'What payment methods are supported?' : 'Can I pay from outside Kenya?', a: isWestern ? 'We accept credit cards, PayPal, Apple Pay, Google Pay, and regional mobile transfers like Venmo, Cash App, or Zelle depending on your location. Credits load instantly after payment.' : 'Absolutely. Prices show in your local currency and we accept Visa, Mastercard, and PayPal worldwide. Credits load instantly after payment.' },
                { q: 'Is there a refund policy?', a: 'Credits are non-refundable once used. Duplicate payments or technical errors are refunded within 5 business days.' }
              ].map((faq, index) => (
                <div key={index} style={{ background: 'var(--ca)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>{faq.q}</div>
                  <div style={{ fontSize: '12px', color: 'var(--mu)' }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PricingPage;
