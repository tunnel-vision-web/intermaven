import React, { useState, useEffect } from 'react';
import { useAuth, useToast, api } from '../../App';
import { useRegion } from '../../RegionContext';
import Navbar from './Navbar';
import Netbar from './Netbar';
import Footer from './Footer';
import PageHeader from './PageHeader';
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

      <PageHeader
        pageKey="pricing"
        portal="business"
        breadcrumb="Intermaven › Community › Affiliate Program"
        title="Turn Your Network Into Recurring Revenue"
        subtitle="Earn 3% to 12% revenue share across Intermaven, TuneMavens, TuneStream, and SyncMavens — with 90-day attribution, M-Pesa mobile money, and global payouts."
      />

      <main style={{ padding: '44px 0 72px' }}>
        <div className="cn" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Active Partner Dashboard */}
          {myAffiliate && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 'var(--r)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FlatIcon name="invoicing" size={34} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>Active Partner · {myAffiliate.tier || 'Tier 1'}</div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--tx)' }}>Code: {myAffiliate.ref_code}</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="hbp"
                  onClick={() => {
                    navigator.clipboard.writeText(referralUrl);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 1800);
                  }}
                >
                  {copiedRef ? <Check size={14} /> : <Copy size={14} />}
                  {copiedRef ? 'Link Copied!' : 'Copy Referral Link'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--ca)', border: '1px solid var(--b1)', padding: '14px', borderRadius: 'var(--r)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--mu)' }}>Total Clicks</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--a2)' }}>{myAffiliate.clicks || 0}</div>
                </div>
                <div style={{ background: 'var(--ca)', border: '1px solid var(--b1)', padding: '14px', borderRadius: 'var(--r)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--mu)' }}>Onboarded Users</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gr)' }}>{myAffiliate.conversions || 0}</div>
                </div>
                <div style={{ background: 'var(--ca)', border: '1px solid var(--b1)', padding: '14px', borderRadius: 'var(--r)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--mu)' }}>Available Earnings</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--am)' }}>${(myAffiliate.balance_usd || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Calculator + Partner Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--ca)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="#22d3ee" /> Earnings Estimator
              </h3>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Monthly Referrals</span>
                  <strong style={{ color: 'var(--a2)' }}>{monthlyReferrals} users/mo</strong>
                </div>
                <input type="range" min={5} max={250} value={monthlyReferrals} onChange={(e) => setMonthlyReferrals(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Avg. Monthly Platform Spend</span>
                  <strong style={{ color: 'var(--gr)' }}>${avgSpendUsd}/mo</strong>
                </div>
                <input type="range" min={10} max={200} value={avgSpendUsd} onChange={(e) => setAvgSpendUsd(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div style={{ marginTop: 'auto', padding: '18px', borderRadius: 'var(--r)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--mu)' }}>Estimated Recurring Monthly Payout (10% avg)</div>
                <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--a2)', marginTop: '4px' }}>${estimatedMonthly.toLocaleString()}/mo</div>
              </div>
            </div>

            <form onSubmit={handleApply} style={{ background: 'var(--ca)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#10b981" /> Become an Affiliate Partner
              </h3>
              <input required className="form-input" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input required type="email" className="form-input" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="form-input" placeholder="Phone (M-Pesa / WhatsApp)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select className="form-input" value={form.payout_method} onChange={(e) => setForm({ ...form, payout_method: e.target.value })} style={{ background: '#0d1117', color: '#e6edf3' }}>
                <option value="mpesa">M-Pesa Mobile Money</option>
                <option value="pesapal">PesaPal / Bank</option>
                <option value="stripe">Card / Stripe Connect</option>
              </select>
              <button type="submit" disabled={submitting} className="hbp" style={{ justifyContent: 'center' }}>
                {submitting ? 'Submitting...' : 'Activate Partner Link'} <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Commission Matrix */}
          <div style={{ background: 'var(--ca)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '24px' }}>
            <div className="sl2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#f59e0b" /> Ecosystem Commission Matrix (Synced with TuneMavens)
            </div>
            <div className="apg">
              {(matrix.length > 0 ? matrix : [
                { name: 'Creator & Label Onboarding', rate: '10% Recurring', desc: 'Subscription & distro packages' },
                { name: 'TuneStream & Merch Sales', rate: '5% - 8%', desc: 'Lossless streams, tips & tickets' },
                { name: 'Sync & Enterprise Deals', rate: '12% Bounty', desc: 'Supervisor & corporate placements' },
                { name: 'Smart CRM Reachout Leads', rate: '90-Day Cookie', desc: 'Full-funnel attribution tracking' },
              ]).map((m, i) => (
                <div key={i} className="apc">
                  <div style={{ fontSize: '12px', color: 'var(--a2)', fontWeight: 700, marginBottom: '6px' }}>
                    {m.rate || (m.commission_pct ? `${m.commission_pct}%` : 'Active')}
                  </div>
                  <h3>{m.label || m.category || m.name}</h3>
                  <p>{m.description || m.notes || m.desc || 'Synced ecosystem rate'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
