import React, { useState, useEffect } from 'react';
import { useAuth, useToast, api } from '../../App';
import { useRegion } from '../../RegionContext';
import Navbar from './Navbar';
import Netbar from './Netbar';
import Footer from './Footer';
import SEO from '../SEO';
import FlatIcon from '../FlatIcon';
import { Copy, Check, ArrowRight, Sparkles, Users, DollarSign } from 'lucide-react';

export default function AffiliatesPage({ onOpenAuth, onOpenSignIn }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { country, currency } = useRegion() || {};

  const [matrix, setMatrix] = useState([]);
  const [myAffiliate, setMyAffiliate] = useState(null);
  const [monthlyReferrals, setMonthlyReferrals] = useState(25);
  const [avgSpendUsd, setAvgSpendUsd] = useState(35);
  const [copiedRef, setCopiedRef] = useState(false);

  const [form, setForm] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    channel: 'creator_network',
    payout_method: 'mpesa',
    payout_account: user?.phone || '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  useEffect(() => {
    api.get('/api/affiliates/matrix')
      .then((r) => setMatrix(r.data?.matrix || r.data?.tiers || []))
      .catch(() => {});

    if (user) {
      api.get('/api/affiliates/me')
        .then((r) => {
          if (r.data?.affiliate) setMyAffiliate(r.data.affiliate);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/affiliates/apply', {
        ...form,
        country: country || 'KE',
        currency: currency || 'KES',
      });
      const code = res.data?.ref_code || res.data?.affiliate?.ref_code || '';
      setSubmittedRef(code);
      if (res.data?.affiliate) setMyAffiliate(res.data.affiliate);
      addToast('Affiliate Application Approved', 'Your partner referral link is ready!', 'success');
    } catch (err) {
      addToast('Application Error', err.response?.data?.detail || 'Could not submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const refCode = myAffiliate?.ref_code || submittedRef;
  const referralUrl = refCode ? `${window.location.origin}/?ref=${refCode}` : '';
  const estimatedMonthly = Math.round(monthlyReferrals * avgSpendUsd * 0.10);

  return (
    <div className="landing-wrapper">
      <SEO
        title="Affiliate & Partner Program"
        description="Earn 3% to 12% recurring revenue share across Intermaven, TuneMavens, TuneStream, and SyncMavens with M-Pesa & global payouts."
        canonical="https://intermaven.io/affiliates"
      />
      <Netbar portal="business" />
      <Navbar onOpenAuth={onOpenAuth} onOpenSignIn={onOpenSignIn} portal="business" />

      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '56px 24px 80px', color: '#e2e8f0' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '999px', background: 'rgba(34,211,238,0.14)', border: '1px solid rgba(34,211,238,0.35)', color: '#67e8f9', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
            Intermaven &amp; TuneMavens Partner Network · 90-Day Attribution
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px', lineHeight: 1.15 }}>
            Turn Your Network Into Recurring Revenue
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Earn 3% to 12% revenue share across Intermaven, TuneMavens, TuneStream, and SyncMavens — with direct M-Pesa mobile money and global card/bank payouts.
          </p>
        </div>

        {/* My Affiliate Dashboard (if enrolled) */}
        {myAffiliate && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '16px', padding: '24px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FlatIcon name="invoicing" size={34} />
                <div>
                  <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>Active Partner · {myAffiliate.tier || 'Tier 1'}</div>
                  <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Code: {myAffiliate.ref_code}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralUrl);
                  setCopiedRef(true);
                  setTimeout(() => setCopiedRef(false), 1800);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                {copiedRef ? <Check size={14} /> : <Copy size={14} />}
                {copiedRef ? 'Link Copied!' : 'Copy Referral Link'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(13,17,23,0.8)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Clicks</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#22d3ee' }}>{myAffiliate.clicks || 0}</div>
              </div>
              <div style={{ background: 'rgba(13,17,23,0.8)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Onboarded Users</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>{myAffiliate.conversions || 0}</div>
              </div>
              <div style={{ background: 'rgba(13,17,23,0.8)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Available Earnings</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>${(myAffiliate.balance_usd || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Calculator + Application Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px', marginBottom: '44px' }}>
          {/* Calculator */}
          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="#22d3ee" /> Earnings Estimator
            </h3>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span>Monthly Referrals</span>
                <strong style={{ color: '#22d3ee' }}>{monthlyReferrals} users/mo</strong>
              </div>
              <input type="range" min={5} max={250} value={monthlyReferrals} onChange={(e) => setMonthlyReferrals(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span>Avg. Monthly Platform Spend</span>
                <strong style={{ color: '#10b981' }}>${avgSpendUsd}/mo</strong>
              </div>
              <input type="range" min={10} max={200} value={avgSpendUsd} onChange={(e) => setAvgSpendUsd(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginTop: 'auto', padding: '18px', borderRadius: '12px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Estimated Recurring Monthly Payout (10% avg)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#22d3ee', marginTop: '4px' }}>${estimatedMonthly.toLocaleString()}/mo</div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleApply} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#10b981" /> Become an Affiliate Partner
            </h3>
            <input required placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input placeholder="Phone (M-Pesa / WhatsApp)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <select value={form.payout_method} onChange={(e) => setForm({ ...form, payout_method: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}>
              <option value="mpesa">M-Pesa Mobile Money</option>
              <option value="pesapal">PesaPal / Bank</option>
              <option value="stripe">Card / Stripe Connect</option>
            </select>
            <button type="submit" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: '#22d3ee', color: '#061224', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
              {submitting ? 'Submitting...' : 'Activate Partner Link'} <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Commission Matrix */}
        <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#f59e0b" /> Ecosystem Commission Matrix (Synced with TuneMavens)
          </h3>
          {matrix.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { name: 'Creator & Label Onboarding', rate: '10% Recurring', desc: 'Subscription & distro packages' },
                { name: 'TuneStream & Merch Sales', rate: '5% - 8%', desc: 'Lossless streams, tips & tickets' },
                { name: 'Sync & Enterprise Deals', rate: '12% Bounty', desc: 'Supervisor & corporate placements' },
                { name: 'Smart CRM Reachout Leads', rate: '90-Day Cookie', desc: 'Full-funnel attribution tracking' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#22d3ee', fontWeight: 700 }}>{m.rate}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{m.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {matrix.map((m, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#22d3ee', fontWeight: 700 }}>{m.rate || m.commission_pct ? `${m.commission_pct}%` : 'Active'}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{m.label || m.category || m.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{m.description || m.notes || 'Synced ecosystem rate'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
