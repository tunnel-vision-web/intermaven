import React from 'react';
import { FlatIcon } from '../FlatIcon';

function PricingPage({ onOpenAuth, onToast }) {
  const handlePayment = () => {
    onToast('M-Pesa payment coming soon!', '', '📲');
  };

  const valueProps = [
    { icon: 'zap', color: 'var(--am)', title: 'Pay once', desc: 'No monthly fees. Buy credits when you need them.' },
    { icon: 'mpesa', color: 'var(--gr)', title: 'M-Pesa native', desc: 'Pay via M-Pesa, card, or PayPal. Credits load instantly.' },
    { icon: 'refresh', color: 'var(--a3)', title: 'Credits never expire', desc: 'Paid credits roll over forever. Use them at your own pace.' },
    { icon: 'unlock', color: 'var(--a2)', title: 'No lock-in', desc: "Cancel nothing — there's nothing to cancel. Ever." }
  ];

  const creditCosts = [
    { icon: 'brandkit', color: '#c084fc', name: 'Brand Kit AI', credits: '10 credits per run', price: 'KES 8.30 on Creator' },
    { icon: 'musicbio', color: '#22d3ee', name: 'Music Bio & Press Kit', credits: '15 credits per run', price: 'KES 12.50 on Creator' },
    { icon: 'social', color: '#f43f5e', name: 'Social AI', credits: 'Free — 0 credits', price: 'Always free', priceColor: 'var(--gr)' },
    { icon: 'syncpitch', color: '#f59e0b', name: 'Sync Pitch AI', credits: '20 credits per run', price: 'KES 16.70 on Creator' },
    { icon: 'pitchdeck', color: '#8b5cf6', name: 'Pitch Deck AI', credits: '18 credits per run', price: 'KES 15.00 on Creator' }
  ];

  return (
    <>
      {/* Page Header */}
      <div className="ph" data-testid="pricing-header">
        <div className="phi" style={{ background: 'radial-gradient(ellipse at 50% 50%,#2d0045,#08090d)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Intermaven › Pricing</div>
          <div className="pht">Simple, honest pricing</div>
          <div className="phs">Pay once. Credits never expire. No subscriptions, ever.</div>
        </div>
      </div>

      {/* Pricing Content */}
      <div style={{ padding: '40px 0 60px' }}>
        <div className="cn">
          {/* Value prop bar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '10px', 
            marginBottom: '40px' 
          }}>
            {valueProps.map((item, index) => (
              <div key={index} style={{ 
                background: 'var(--ca)', 
                border: '1px solid var(--b1)', 
                borderRadius: 'var(--r)', 
                padding: '16px', 
                textAlign: 'center' 
              }}>
                <div style={{ marginBottom: '6px' }}>
                  <FlatIcon name={item.icon} size={24} color={item.color} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '3px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--mu)' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Plan cards */}
          <div className="sl2" style={{ textAlign: 'center' }}>Choose your pack</div>
          <div className="prg" style={{ marginBottom: '32px' }}>
            {/* Free Plan */}
            <div className="prc">
              <div className="prn">Free starter</div>
              <div className="prp">KES 0</div>
              <div className="prce">150 free credits</div>
              <ul className="prf">
                <li>All AI tools (limited runs)</li>
                <li>Social AI — 2 accounts</li>
                <li>Copy & download results</li>
                <li>Credits valid for 90 days</li>
              </ul>
              <button 
                className="prb prbg" 
                onClick={onOpenAuth}
                data-testid="pricing-free-cta"
              >
                Start free — no card needed
              </button>
            </div>

            {/* Creator Plan */}
            <div className="prc pop">
              <div className="popb">Most popular</div>
              <div className="prn">Creator pack</div>
              <div className="prp">KES 500 <span>one-time</span></div>
              <div className="prce">600 credits • ~40 full runs</div>
              <ul className="prf">
                <li>Everything in Free</li>
                <li>Social AI — 6 accounts</li>
                <li>Priority AI generation speed</li>
                <li>Save & organise outputs</li>
                <li>Credits <strong style={{ color: 'var(--gr)' }}>never expire</strong></li>
              </ul>
              <button 
                className="prb prbp" 
                onClick={handlePayment}
                data-testid="pricing-creator-cta"
              >
                Buy with M-Pesa →
              </button>
              <p style={{ fontSize: '10px', color: 'var(--mu)', textAlign: 'center', marginTop: '8px' }}>
                Also: Visa, Mastercard, PayPal
              </p>
            </div>

            {/* Pro Plan */}
            <div className="prc">
              <div className="prn">Pro bundle</div>
              <div className="prp">KES 1,500 <span>one-time</span></div>
              <div className="prce">2,500 credits • ~165 full runs</div>
              <ul className="prf">
                <li>Everything in Creator</li>
                <li>Unlimited Social AI accounts</li>
                <li>White-label output</li>
                <li>API access (beta)</li>
                <li>Priority WhatsApp support</li>
                <li>Credits <strong style={{ color: 'var(--gr)' }}>never expire</strong></li>
              </ul>
              <button 
                className="prb prbp" 
                onClick={handlePayment}
                data-testid="pricing-pro-cta"
              >
                Buy with M-Pesa →
              </button>
              <p style={{ fontSize: '10px', color: 'var(--mu)', textAlign: 'center', marginTop: '8px' }}>
                Also: Visa, Mastercard, PayPal
              </p>
            </div>
          </div>

          {/* Credit cost breakdown */}
          <div style={{ 
            background: 'var(--ca)', 
            border: '1px solid var(--b1)', 
            borderRadius: 'var(--r)', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FlatIcon name="zap" size={16} color="var(--am)" />
              <span style={{ fontSize: '13px', fontWeight: '700' }}>What does 1 credit run cost?</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '10px' 
            }}>
              {creditCosts.map((tool, index) => (
                <div key={index} style={{ background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '12px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <FlatIcon name={tool.icon} size={18} color={tool.color} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}>{tool.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--mu)' }}>{tool.credits}</div>
                  <div style={{ fontSize: '10px', color: tool.priceColor || 'var(--a2)', marginTop: '4px' }}>
                    {tool.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* M-Pesa callout */}
          <div className="mpbox">
            <div>
              <FlatIcon name="mpesa" size={32} color="var(--gr)" />
            </div>
            <div>
              <h4>Pay instantly with <strong>M-Pesa</strong></h4>
              <p>
                Send to Paybill <strong style={{ color: 'var(--tx)' }}>522900</strong>. 
                Credits load the moment your payment confirms — no waiting, no approval.
              </p>
              <p style={{ marginTop: '6px' }}>
                Also accepted: <strong style={{ color: 'var(--tx)' }}>Visa, Mastercard, PayPal</strong> for diaspora users worldwide.
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
                { 
                  q: 'Do free credits expire?', 
                  a: 'Free starter credits expire after 90 days of inactivity. Paid credits (Creator and Pro) never expire.' 
                },
                { 
                  q: 'Can I top up more than once?', 
                  a: 'Yes. Buy as many packs as you need. Credits stack — your balance just keeps growing.' 
                },
                { 
                  q: 'What if a tool fails to generate?', 
                  a: "Credits are only deducted on a successful generation. If there's a server error your credits are automatically restored." 
                },
                { 
                  q: "I'm in the diaspora — can I still pay?", 
                  a: 'Absolutely. We accept Visa, Mastercard, and PayPal for users outside Kenya. Credits load instantly after payment.' 
                },
                { 
                  q: 'Is there a refund policy?', 
                  a: 'Credits are non-refundable once used. Duplicate payments or technical errors are refunded within 5 business days.' 
                }
              ].map((faq, index) => (
                <div key={index} style={{ 
                  background: 'var(--ca)', 
                  border: '1px solid var(--b1)', 
                  borderRadius: 'var(--r)', 
                  padding: '16px' 
                }}>
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
