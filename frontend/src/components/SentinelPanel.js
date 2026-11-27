import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../App';
import { Activity, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function SentinelPanel({ addToast }) {
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const [platforms, setPlatforms] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('intermaven');
  const [targetUrl, setTargetUrl] = useState('local');
  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [platRes, runsRes] = await Promise.all([
        api.get('/api/admin/test-agent/platforms'),
        api.get('/api/admin/test-agent/runs'),
      ]);
      setPlatforms(platRes.data?.platforms || []);
      const list = runsRes.data?.runs || [];
      setRuns(list);
      setActiveRun((prev) => prev || (list.length > 0 ? list[0] : null));
    } catch (err) {
      if (toastRef.current) toastRef.current('Error', err.response?.data?.detail || 'Failed to load Sentinel QA data', 'error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePlatformChange = (pid) => {
    setSelectedPlatform(pid);
    const meta = platforms.find((p) => p.id === pid);
    if (meta) setTargetUrl(meta.default_url || 'local');
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await api.post('/api/admin/test-agent/run', {
        platform: selectedPlatform,
        target_url: targetUrl.trim() || 'local',
      });
      const run = res.data?.run;
      if (run) {
        setActiveRun(run);
        setRuns((prev) => [run, ...prev]);
        if (addToast) {
          addToast(
            'Sentinel Complete',
            `${run.passed}/${run.total} checks passed (${run.duration_ms}ms)`,
            run.failed === 0 ? 'success' : 'error'
          );
        }
      }
    } catch (err) {
      if (addToast) addToast('Sentinel Error', err.response?.data?.detail || 'Test run failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#e2e8f0' }}>
      {/* Control Bar */}
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Target Platform</div>
          <select value={selectedPlatform} onChange={(e) => handlePlatformChange(e.target.value)} style={inputStyle}>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.check_count} checks)</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '2 1 260px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Target Environment (`local` = in-process ASGI, or staging/live URL)</div>
          <input type="text" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="local or https://tunemavens.com" style={inputStyle} />
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '3px',
            border: 'none',
            background: '#10b981',
            color: '#022c22',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Play size={15} /> {running ? 'Running Sentinel...' : 'Run Sentinel Suite'}
        </button>
      </div>

      {/* Active Run Results */}
      {activeRun && (
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#22d3ee" />
                {activeRun.platform.toUpperCase()} — {activeRun.target_url}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                {activeRun.passed}/{activeRun.total} passed · {activeRun.failed} failed · {activeRun.duration_ms}ms · Regression diff: {activeRun.regression_diff >= 0 ? `+${activeRun.regression_diff}` : activeRun.regression_diff}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {(activeRun.results || []).map((r, idx) => (
              <div key={idx} style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '3px', border: `1px solid ${r.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.35)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {r.passed ? <CheckCircle2 size={14} color="#34d399" /> : <XCircle size={14} color="#f87171" />}
                    {r.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>HTTP {r.status_code} · {r.latency_ms}ms</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{r.path}</div>
                {r.error && <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{r.error}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run History */}
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>Recent Sentinel Runs ({runs.length})</div>
        {runs.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#64748b' }}>No test runs recorded yet. Click "Run Sentinel Suite" above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {runs.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() => setActiveRun(run)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#0f172a',
                  border: `1px solid ${activeRun?.id === run.id ? '#22d3ee' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '3px',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{run.platform.toUpperCase()}</span>
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#94a3b8' }}>({run.target_url})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                  <span style={{ color: run.failed === 0 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                    {run.passed}/{run.total} passed
                  </span>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {run.duration_ms}ms
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 11px',
  borderRadius: '3px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '13px',
};
