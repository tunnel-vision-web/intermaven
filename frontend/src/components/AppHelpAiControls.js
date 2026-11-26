import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';
import { getHelpArticleForApp } from '../data/helpArticles';
import FlatIcon from './FlatIcon';

export default function AppHelpAiControls({ appId = 'overview', persona = 'creator', compact = false }) {
  const navigate = useNavigate();
  const article = getHelpArticleForApp(appId);

  const [helpOpen, setHelpOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([]);
  }, [appId]);

  const askMaven = async (promptText) => {
    const q = (promptText || question).trim();
    if (!q || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    setLoading(true);
    try {
      const res = await api.post('/api/support/ask-ai', {
        question: q,
        article_title: article.title,
        article_content: article.content,
        app_context: article.appTitle,
        persona,
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, Maven AI is temporarily unavailable. Please open the Help Center for full documentation.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          title={`Get Help: ${article.appTitle}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: compact ? '6px 10px' : '7px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(14, 165, 233, 0.35)',
            background: 'rgba(14, 165, 233, 0.12)',
            color: '#bae6fd',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FlatIcon name="help" size={18} />
          <span>Get Help</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (messages.length === 0) {
              setMessages([
                {
                  role: 'assistant',
                  text: `Hi! I'm Maven. Ask me anything about ${article.appTitle} or "${article.title}".`,
                },
              ]);
            }
            setAiOpen(true);
          }}
          title={`Ask Maven AI about ${article.appTitle}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: compact ? '6px 10px' : '7px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            background: 'rgba(168, 85, 247, 0.14)',
            color: '#e9d5ff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FlatIcon name="maven" size={18} />
          <span>Ask AI</span>
        </button>
      </div>

      {/* In-App Help Article Modal */}
      {helpOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.78)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setHelpOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              background: '#0d1117',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              padding: '24px',
              color: '#e6edf3',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FlatIcon name={appId} size={32} />
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8', fontWeight: 700 }}>
                    {article.category} · {article.readTime}
                  </div>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700 }}>{article.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>{article.summary}</p>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.65, fontSize: '14px', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {article.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setHelpOpen(false);
                  navigate(`/help?article=${article.slug}`);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e6edf3',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Open Full Help Center →
              </button>
              <button
                type="button"
                onClick={() => {
                  setHelpOpen(false);
                  setMessages([
                    { role: 'assistant', text: `I have "${article.title}" open. What would you like to know?` },
                  ]);
                  setAiOpen(true);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                  color: '#061224',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ask Maven AI about this
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Maven AI Modal */}
      {aiOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.78)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setAiOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0d1117',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: '14px',
              padding: '20px',
              color: '#e6edf3',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '82vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FlatIcon name="maven" size={28} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>Ask Maven AI · {article.appTitle}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Connected to Help Articles & your `{persona}` persona</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {article.suggestedQuestions?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {article.suggestedQuestions.map((sq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => askMaven(sq)}
                    style={{
                      fontSize: '11px',
                      padding: '5px 9px',
                      borderRadius: '999px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      border: '1px solid rgba(34, 211, 238, 0.25)',
                      color: '#67e8f9',
                      cursor: 'pointer',
                    }}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px', minHeight: '180px' }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    background: m.role === 'user' ? 'rgba(34, 211, 238, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                    border: m.role === 'user' ? '1px solid rgba(34, 211, 238, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {m.text}
                </div>
              ))}
              {loading && <div style={{ fontSize: '12px', color: '#94a3b8' }}>Maven is thinking…</div>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                askMaven();
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask Maven about ${article.appTitle}…`}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: '#161b22',
                  color: '#e6edf3',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#22d3ee',
                  color: '#061224',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
