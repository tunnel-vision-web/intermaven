/**
 * BusinessDiscoveryModal — one-time conversational onboarding with Ayo.
 * Auto-shows after signup until the user's business profile is `completed`.
 * Generates a strategy plan at the end and stores it on the profile.
 */
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../App';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';

export default function BusinessDiscoveryModal({ onClose, onComplete }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi, I'm Ayo 👋 I'll ask a few quick questions so I can tailor Intermaven to your business. Ready?" }
  ]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const scrollRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    // Kick off the first question (guard against StrictMode double-invoke)
    if (initRef.current) return;
    initRef.current = true;
    askNext(null);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, strategy]);

  const askNext = async (userAnswer) => {
    setLoading(true);
    try {
      const res = await api.post('/api/wizard/discover', { answer: userAnswer || null });
      if (res.data.done) {
        setMessages(m => [...m, { role: 'assistant', content: res.data.message }]);
        setDone(true);
        // Auto-generate the strategy
        setStrategyLoading(true);
        try {
          const s = await api.post('/api/wizard/strategy', { refresh: false });
          setStrategy(s.data.strategy);
        } catch (e) {
          setMessages(m => [...m, { role: 'assistant', content: 'I had trouble drafting your strategy. You can try again from the dashboard.' }]);
        } finally {
          setStrategyLoading(false);
        }
      } else {
        setMessages(m => [...m, { role: 'assistant', content: res.data.question }]);
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: 'Hmm, something went wrong. Try again?' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!answer.trim() || loading || done) return;
    const userText = answer.trim();
    setMessages(m => [...m, { role: 'user', content: userText }]);
    setAnswer('');
    askNext(userText);
  };

  return (
    <div
      data-testid="business-discovery-modal"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000
      }}
    >
      <div style={{
        width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '3px', background: 'linear-gradient(135deg,#22d3ee,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#0f172a" />
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Welcome to Intermaven</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>A 2-minute discovery with Ayo to personalize your apps</div>
            </div>
          </div>
          <button onClick={onClose} data-testid="discovery-close-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Chat */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%',
                background: m.role === 'user' ? '#22d3ee' : '#1e293b',
                color: m.role === 'user' ? '#0f172a' : '#e2e8f0',
                padding: '10px 14px', borderRadius: '3px', fontSize: 14, lineHeight: 1.5,
                border: m.role === 'user' ? 'none' : '1px solid #334155'
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} className="spin" /> Ayo is thinking…
            </div>
          )}

          {/* Strategy plan */}
          {strategyLoading && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: 16, color: '#e2e8f0', fontSize: 13 }}>
              <Loader2 size={14} className="spin" /> Drafting your custom strategy…
            </div>
          )}
          {strategy && (
            <div data-testid="strategy-plan" style={{ background: '#0b1220', border: '1px solid #22d3ee44', borderRadius: '3px', padding: 18, marginTop: 6 }}>
              <div style={{ color: '#22d3ee', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Your Strategy</div>
              <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 16, marginBottom: 14 }}>{strategy.headline}</div>

              {Array.isArray(strategy.channels) && strategy.channels.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Recommended channels</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {strategy.channels.map((c, i) => (
                      <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: '6px 12px', fontSize: 12, color: '#e2e8f0' }}>
                        <strong style={{ color: '#22d3ee' }}>{c.name}</strong>
                        <span style={{ color: '#94a3b8', marginLeft: 6 }}>· {c.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(strategy.content_pillars) && strategy.content_pillars.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Content pillars</div>
                  <div style={{ color: '#e2e8f0', fontSize: 13 }}>{strategy.content_pillars.join(' · ')}</div>
                </div>
              )}

              {Array.isArray(strategy.first_30_days) && strategy.first_30_days.length > 0 && (
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>First 30 days</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: 13 }}>
                    {strategy.first_30_days.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                  </ul>
                </div>
              )}

              <button
                onClick={() => { onComplete?.(strategy); onClose?.(); }}
                data-testid="discovery-finish-btn"
                style={{ marginTop: 18, backgroundColor: '#22d3ee', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '3px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                Use this plan →
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        {!done && (
          <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #334155', padding: 14, display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer…"
              data-testid="discovery-input"
              disabled={loading}
              style={{ flex: 1, padding: '12px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 14 }}
            />
            <button type="submit" disabled={loading || !answer.trim()} data-testid="discovery-send-btn"
              style={{ background: '#22d3ee', color: '#0f172a', border: 'none', padding: '0 18px', borderRadius: '3px', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={14} /> Send
            </button>
          </form>
        )}
      </div>

      <style>{`@keyframes spin {to {transform: rotate(360deg);}} .spin{animation: spin 1s linear infinite;}`}</style>
    </div>
  );
}
