import React from 'react';
import PageHeader from './PageHeader';
import { FlatIcon } from '../FlatIcon';

function AboutPage({ portal = 'music', onToast }) {
  const handleContactSubmit = () => {
    onToast('Message received!', 'We will respond via WhatsApp within 24 hours.', '✓');
  };

  const handlePortalSwitch = () => {
    onToast('Portal switch coming soon!', '');
  };

  const contacts = [
    { icon: 'whatsapp', color: 'var(--gr)', title: 'WhatsApp support', desc: 'Fastest response — typically under 1 hour' },
    { icon: 'mail', color: 'var(--a2)', title: 'hello@intermaven.io', desc: 'For partnerships and press enquiries' },
    { icon: 'location', color: 'var(--am)', title: 'Nairobi, Kenya', desc: 'Intermaven Ltd — registered in Kenya' }
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader pageKey="about" breadcrumb="Intermaven › About" title="About Intermaven" subtitle="Built in Nairobi. Built for Africa." testId="about-header" />

      {/* About Content */}
      <div style={{ padding: '48px 0 60px' }}>
        <div className="cn">
          {/* Mission statement */}
          <div style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
            <div className="sl2" style={{ textAlign: 'center' }}>Our mission</div>
            <div style={{ 
              fontSize: 'clamp(20px, 3vw, 28px)', 
              fontWeight: '800', 
              lineHeight: '1.25', 
              letterSpacing: '-.5px', 
              marginBottom: '16px' 
            }}>
              Give every African creative and entrepreneur access to tools that were previously only available to those with agency budgets.
            </div>
            <p style={{ fontSize: '14px', color: 'var(--mu)', lineHeight: '1.75' }}>
              We've seen how talented artists and founders are held back — not by lack of skill, but by lack of access. 
              Intermaven exists to close that gap.
            </p>
          </div>

          {/* Story + values */}
          <div className="abg" style={{ marginBottom: '48px' }}>
            <div className="abb">
              <h3>Our story</h3>
              <p>
                Intermaven was founded by a team bridging the Nairobi creative scene and the US music industry. 
                After years of watching world-class African talent struggle to present themselves professionally 
                to international markets, we decided to build the tools we wished existed.
              </p>
              <p>
                The platform started as a single AI tool for writing music bios. It quickly grew into a full 
                creative operating system — brand kits, sync pitches, social content, investor decks, and more 
                — because the need was everywhere.
              </p>
              <p>
                This portal — {portal === 'music' ? 'music.intermaven.io' : 'intermaven.io'} — is purpose-built for 
                {portal === 'music' ? ' artists and creatives' : ' business owners'}. 
                For {portal === 'music' ? 'business tools, visit intermaven.io' : 'creative tools, visit music.intermaven.io'}.
              </p>
              
              <div className="vl" style={{ marginTop: '20px' }}>
                {[
                  { title: 'Africa-first context', desc: "every tool is built with Nairobi and African markets in mind, not retrofitted from Western templates." },
                  { title: 'Accessible pricing', desc: "M-Pesa-native, credit-based, no subscriptions, no lock-in. Pay for what you use." },
                  { title: 'Two portals, one network', desc: "music and creative tools here, business tools at intermaven.io. One login, one account." },
                  { title: 'WhatsApp-first support', desc: "because that's how Nairobi communicates. No ticket queues." }
                ].map((value, index) => (
                  <div key={index} className="vi">
                    <div className="vd" />
                    <p><strong>{value.title}</strong> — {value.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Stats */}
              <div style={{ 
                background: 'var(--ca)', 
                border: '1px solid var(--b1)', 
                borderRadius: 'var(--r)', 
                padding: '22px', 
                marginBottom: '16px' 
              }}>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  letterSpacing: '1px', 
                  textTransform: 'uppercase', 
                  color: 'var(--mu)', 
                  marginBottom: '14px' 
                }}>
                  By the numbers
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--a2)' }}>5+</div>
                    <div style={{ fontSize: '11px', color: 'var(--mu)' }}>AI tools live</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--a2)' }}>6</div>
                    <div style={{ fontSize: '11px', color: 'var(--mu)' }}>African cities served</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--a2)' }}>2</div>
                    <div style={{ fontSize: '11px', color: 'var(--mu)' }}>Portals (music + business)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--a2)' }}>📲</div>
                    <div style={{ fontSize: '11px', color: 'var(--mu)' }}>M-Pesa native from day one</div>
                  </div>
                </div>
              </div>

              {/* Other portal */}
              <div className="alt" style={{ marginBottom: '16px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FlatIcon name={portal === 'music' ? 'building' : 'musicbio'} size={18} color="var(--a2)" />
                  {portal === 'music' ? 'Intermaven Business' : 'Intermaven Music'}
                </h3>
                <p>
                  {portal === 'music' 
                    ? 'POS, invoicing, contracts and business AI at intermaven.io.'
                    : 'AI tools for artists — brand kits, press kits, sync pitches, and more.'}
                </p>
                <div style={{ marginBottom: '12px' }}>
                  {(portal === 'music' 
                    ? ['POS System', 'Invoicing', 'Contracts', 'Business AI']
                    : ['Brand Kit AI', 'Music Bio AI', 'Sync Pitch AI', 'EPK Builder']
                  ).map((tag, index) => (
                    <span key={index} className="atag">{tag}</span>
                  ))}
                </div>
                <button className="hbg" style={{ fontSize: '10px', padding: '8px 14px' }} onClick={handlePortalSwitch}>
                  {portal === 'music' ? 'Go to intermaven.io' : 'Go to music.intermaven.io'} →
                </button>
              </div>

              {/* Cities */}
              <div style={{ 
                background: 'var(--ca)', 
                border: '1px solid var(--b1)', 
                borderRadius: 'var(--r)', 
                padding: '18px' 
              }}>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  letterSpacing: '1px', 
                  textTransform: 'uppercase', 
                  color: 'var(--mu)', 
                  marginBottom: '12px' 
                }}>
                  Built for creatives across
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 'var(--r)', 
                    background: 'rgba(124,111,247,.1)', 
                    border: '1px solid rgba(124,111,247,.3)', 
                    fontSize: '11px', 
                    color: 'var(--a2)' 
                  }}>Nairobi</span>
                  {['Lagos', 'Accra', 'Kampala', 'Dar es Salaam', 'Diaspora'].map((city, index) => (
                    <span key={index} style={{ 
                      padding: '4px 10px', 
                      borderRadius: 'var(--r)', 
                      background: 'var(--ca)', 
                      border: '1px solid var(--b2)', 
                      fontSize: '11px', 
                      color: 'var(--mu)' 
                    }}>{city}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team values strip */}
          <div style={{ borderTop: '1px solid var(--b1)', paddingTop: '40px', marginBottom: '48px' }}>
            <div className="sl2">What we believe</div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '16px', 
              marginTop: '20px' 
            }}>
              {[
                { 
                  icon: 'globe', 
                  color: 'var(--a3)',
                  title: 'Africa is not a market to enter — it\'s a movement to serve', 
                  desc: "We don't build generic tools and localise them. We build for Nairobi first, and let the quality speak globally." 
                },
                { 
                  icon: 'lightbulb', 
                  color: 'var(--am)',
                  title: 'Talent is everywhere. Opportunity isn\'t. Yet.', 
                  desc: "The gap between a talented African artist and a Hollywood sync deal is not talent — it's access to the right words, tools, and positioning." 
                },
                { 
                  icon: 'handshake', 
                  color: 'var(--a2)',
                  title: 'Simple pricing is a form of respect', 
                  desc: "No subscriptions. No lock-in. No dark patterns. Just credits you buy when you need them, that never expire." 
                },
                { 
                  icon: 'whatsapp', 
                  color: 'var(--gr)',
                  title: 'WhatsApp is infrastructure', 
                  desc: "We build notifications, support, and receipts through WhatsApp because that's where Nairobi does business." 
                }
              ].map((belief, index) => (
                <div key={index} style={{ 
                  background: 'var(--ca)', 
                  border: '1px solid var(--b1)', 
                  borderRadius: 'var(--r)', 
                  padding: '20px' 
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <FlatIcon name={belief.icon} size={22} color={belief.color} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>{belief.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--mu)', lineHeight: '1.6' }}>{belief.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '32px', 
            alignItems: 'start' 
          }} className="contact-grid">
            <div>
              <div className="sl2">Get in touch</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-.3px' }}>
                We respond on WhatsApp within 24 hours
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--mu)', lineHeight: '1.7', marginBottom: '20px' }}>
                Whether you have a question, want to partner, or just want to say hello — we'd love to hear from you. 
                Fill in the form or email us directly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {contacts.map((contact, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '12px', 
                    background: 'var(--ca)', 
                    border: '1px solid var(--b1)', 
                    borderRadius: 'var(--r)' 
                  }}>
                    <FlatIcon name={contact.icon} size={16} color={contact.color} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600' }}>{contact.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--mu)' }}>{contact.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="cf" style={{ marginTop: '0' }}>
              <h3>Send us a message</h3>
              <div className="cfrow">
                <input type="text" placeholder="Your name" />
                <input type="text" placeholder="Email or phone" />
              </div>
              <select style={{ marginBottom: '9px' }}>
                <option>I'm a musician / artist</option>
                <option>I'm a creative brand</option>
                <option>I'm a label or agency</option>
                <option>I want to partner</option>
                <option>Press enquiry</option>
                <option>Other</option>
              </select>
              <textarea placeholder="How can we help?" />
              <button className="bp" style={{ marginTop: '0' }} onClick={handleContactSubmit}>
                Send message
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

export default AboutPage;
