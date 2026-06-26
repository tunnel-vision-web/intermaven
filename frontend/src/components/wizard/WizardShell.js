/**
 * WizardShell — wraps every app with a [Wizard | Advanced Settings] toggle,
 * a step-by-step AI-driven wizard panel, and a hybrid How-To guide sidebar.
 *
 * Props:
 *   appId        - one of 'social','epk','brandkit','musicbio','syncpitch','bizpitch','crm'
 *   appName      - display name
 *   color        - accent color
 *   children     - the full "Advanced Settings" UI for the app (rendered when mode==='advanced')
 *   howToTopics  - pre-written backbone guides: [{title, steps:[...]}]
 *   onWizardComplete (state) => void  - optional: parent receives final wizard state to apply to advanced settings
 */
import React, { useEffect, useState } from 'react';
import { api } from '../../App';
import { Sparkles, Settings as SettingsIcon, BookOpen, Wand2, ChevronRight, Loader2, Lightbulb } from 'lucide-react';

const accentBtn = (active, color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '8px 14px', borderRadius: '3px', cursor: 'pointer',
  border: `1px solid ${active ? color : '#334155'}`,
  background: active ? `${color}22` : 'transparent',
  color: active ? color : '#cbd5e1', fontWeight: 600, fontSize: 13
});

export default function WizardShell({ appId, appName, color = '#22d3ee', children, howToTopics = [], onWizardComplete }) {
  const [mode, setMode] = useState('wizard');             // wizard | advanced
  const [showHowTo, setShowHowTo] = useState(false);
  const [step, setStep] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [wizardState, setWizardState] = useState({});
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true);

  // Load strategy + profile state
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/api/business-profile');
        setStrategy(r.data?.strategy || null);
        setProfileComplete(!!r.data?.completed);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // Initialize first step
  useEffect(() => {
    if (mode === 'wizard' && !step && profileComplete) {
      loadStep(0, {});
    }
  }, [mode, profileComplete]); // eslint-disable-line

  const loadStep = async (idx, state) => {
    setLoading(true);
    try {
      const r = await api.post('/api/wizard/app/step', { app_id: appId, state, step_index: idx });
      setStep(r.data.step);
      setStepIndex(idx);
    } catch (e) {
      setStep({ title: 'Step paused', intent: 'Could not load AI step. Switch to Advanced Settings.', fields: [], tip: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setWizardState(s => ({ ...s, [key]: value }));
  };

  const handleNext = async () => {
    const newState = { ...wizardState, [`step_${stepIndex}`]: { ...wizardState } };
    if (step?.final) {
      onWizardComplete?.(newState);
      setMode('advanced');
      return;
    }
    await loadStep(stepIndex + 1, newState);
  };

  return (
    <div data-testid={`wizard-shell-${appId}`} style={{ padding: 24, color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 24, fontWeight: 700 }}>{appName}</h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 13 }}>
            {mode === 'wizard' ? 'Ayo will guide you through every step.' : 'Full controls — power-user mode.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setMode('wizard')} data-testid={`mode-wizard-${appId}`} style={accentBtn(mode === 'wizard', color)}>
            <Wand2 size={14} /> Wizard
          </button>
          <button onClick={() => setMode('advanced')} data-testid={`mode-advanced-${appId}`} style={accentBtn(mode === 'advanced', color)}>
            <SettingsIcon size={14} /> Advanced Settings
          </button>
          <button onClick={() => setShowHowTo(v => !v)} data-testid={`mode-howto-${appId}`}
            style={{ ...accentBtn(showHowTo, '#f59e0b'), background: showHowTo ? '#f59e0b22' : 'transparent' }}>
            <BookOpen size={14} /> How-to Guides
          </button>
        </div>
      </div>

      {/* Strategy banner */}
      {strategy?.headline && mode === 'wizard' && (
        <div style={{ background: '#0b1220', border: `1px solid ${color}44`, borderRadius: '3px', padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={16} color={color} />
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#94a3b8' }}>Your strategy: </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{strategy.headline}</span>
          </div>
        </div>
      )}

      {!profileComplete && mode === 'wizard' && (
        <div data-testid="discovery-required" style={{ background: '#fde68a22', border: '1px solid #f59e0b66', borderRadius: '3px', padding: 14, marginBottom: 18, color: '#fde68a', fontSize: 13 }}>
          Please complete your business discovery first so Ayo can personalize this wizard.
          <button onClick={() => setMode('advanced')} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: '#22d3ee', cursor: 'pointer', textDecoration: 'underline' }}>
            Or use Advanced Settings now
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showHowTo ? '2fr 1fr' : '1fr', gap: 20 }}>
        {/* MAIN AREA */}
        <div>
          {mode === 'wizard' ? (
            <WizardPanel
              appId={appId}
              color={color}
              step={step}
              stepIndex={stepIndex}
              loading={loading}
              wizardState={wizardState}
              onFieldChange={handleFieldChange}
              onNext={handleNext}
              onBack={() => stepIndex > 0 && loadStep(stepIndex - 1, wizardState)}
              profileComplete={profileComplete}
            />
          ) : (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: 20 }}>
              {children}
            </div>
          )}
        </div>

        {/* HOW-TO GUIDES */}
        {showHowTo && (
          <HowToPanel appId={appId} topics={howToTopics} color={color} />
        )}
      </div>
    </div>
  );
}

function WizardPanel({ appId, color, step, stepIndex, loading, wizardState, onFieldChange, onNext, onBack, profileComplete }) {
  if (!profileComplete) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: 28, textAlign: 'center' }}>
        <Wand2 size={32} color={color} style={{ marginBottom: 12 }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#f1f5f9' }}>Wizard locked</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Complete the global business discovery from your dashboard to unlock the personalized wizard.</p>
      </div>
    );
  }
  if (loading || !step) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: 28, textAlign: 'center' }}>
        <Loader2 size={20} className="spin" color={color} />
        <div style={{ marginTop: 10, color: '#94a3b8', fontSize: 13 }}>Ayo is preparing your next step…</div>
        <style>{`@keyframes spin {to {transform: rotate(360deg);}} .spin{animation: spin 1s linear infinite;}`}</style>
      </div>
    );
  }

  return (
    <div data-testid={`wizard-panel-${appId}`} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: 24 }}>
      <div style={{ color: color, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Step {stepIndex + 1}</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: 20 }}>{step.title}</h3>
      {step.intent && <p style={{ margin: '0 0 18px 0', color: '#cbd5e1', fontSize: 14, lineHeight: 1.55 }}>{step.intent}</p>}

      {/* Dynamic fields */}
      {Array.isArray(step.fields) && step.fields.map((f, i) => (
        <div key={`${stepIndex}-${i}-${f.key}`} style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>{f.label}</label>
          {f.type === 'select' ? (
            <select
              value={wizardState[f.key] || ''}
              onChange={(e) => onFieldChange(f.key, e.target.value)}
              data-testid={`wizard-field-${f.key}`}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 13 }}
            >
              <option value="">Select…</option>
              {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              value={wizardState[f.key] || ''}
              onChange={(e) => onFieldChange(f.key, e.target.value)}
              data-testid={`wizard-field-${f.key}`}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 13, resize: 'vertical' }}
            />
          ) : (
            <input
              type="text"
              value={wizardState[f.key] || ''}
              onChange={(e) => onFieldChange(f.key, e.target.value)}
              data-testid={`wizard-field-${f.key}`}
              placeholder={f.placeholder || ''}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', color: '#e2e8f0', fontSize: 13 }}
            />
          )}
        </div>
      ))}

      {step.tip && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#0b1220', border: `1px dashed ${color}66`, borderRadius: '3px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Lightbulb size={16} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: '#cbd5e1' }}>{step.tip}</div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button onClick={onBack} disabled={stepIndex === 0} data-testid={`wizard-back-${appId}`}
          style={{ background: 'transparent', border: '1px solid #334155', color: stepIndex === 0 ? '#475569' : '#cbd5e1', padding: '10px 18px', borderRadius: '3px', cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}>
          ← Back
        </button>
        <button onClick={onNext} data-testid={`wizard-next-${appId}`}
          style={{ background: color, border: 'none', color: '#0f172a', padding: '10px 18px', borderRadius: '3px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {step.final ? 'Finish & open Advanced' : 'Next'} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function HowToPanel({ appId, topics, color }) {
  const [openTopic, setOpenTopic] = useState(null);
  const [aiTip, setAiTip] = useState({});
  const [tipLoading, setTipLoading] = useState({});

  const fetchTip = async (topic) => {
    setTipLoading(t => ({ ...t, [topic]: true }));
    try {
      const r = await api.post('/api/wizard/howto', { app_id: appId, topic });
      setAiTip(t => ({ ...t, [topic]: r.data.tip }));
    } catch (e) {
      setAiTip(t => ({ ...t, [topic]: 'Tip unavailable — try again in a moment.' }));
    } finally {
      setTipLoading(t => ({ ...t, [topic]: false }));
    }
  };

  return (
    <div data-testid={`howto-panel-${appId}`} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '3px', padding: 18, height: 'fit-content' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BookOpen size={16} color={color} />
        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>How-to Guides</h4>
      </div>
      {topics.length === 0 && <div style={{ color: '#64748b', fontSize: 13 }}>No guides yet for this app.</div>}
      {topics.map((t, i) => {
        const isOpen = openTopic === i;
        return (
          <div key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid #334155', padding: '10px 0' }}>
            <button onClick={() => setOpenTopic(isOpen ? null : i)} data-testid={`howto-topic-${i}`}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t.title}</span>
              <ChevronRight size={14} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {isOpen && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#cbd5e1', lineHeight: 1.55 }}>
                <ol style={{ paddingLeft: 18, margin: '0 0 12px 0' }}>
                  {t.steps.map((s, si) => <li key={si} style={{ marginBottom: 4 }}>{s}</li>)}
                </ol>
                {Array.isArray(t.prompts) && t.prompts.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Suggested prompts</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {t.prompts.map((p, pi) => (
                        <div key={pi} style={{ fontSize: 12, color: '#cbd5e1', background: '#0f172a', border: '1px solid #334155', borderRadius: '3px', padding: '6px 8px' }}>“{p}”</div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => fetchTip(t.title)} disabled={tipLoading[t.title]} data-testid={`howto-personalize-${i}`}
                  style={{ marginTop: 12, background: color, border: 'none', color: '#0f172a', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                  {tipLoading[t.title] ? 'Personalizing…' : '✨ Personalize with Ayo'}
                </button>
                {aiTip[t.title] && (
                  <div style={{ marginTop: 10, padding: 10, background: '#0b1220', border: `1px solid ${color}44`, borderRadius: '3px', fontSize: 12, color: '#e2e8f0', lineHeight: 1.55 }}>
                    {aiTip[t.title]}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
