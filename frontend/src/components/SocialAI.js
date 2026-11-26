import React, { useState, useEffect } from 'react';
import { api, useAuth, useToast } from '../App';
import { useWizard } from './wizard/WizardContext';
import FlatIcon from './FlatIcon';
import AppHelpAiControls from './AppHelpAiControls';
import { getPersonaMeta } from '../data/personasCatalog';
import {
  Copy, Download, Zap, Instagram, Facebook, Twitter, Linkedin, Video,
  Hash, Target, Repeat, Sparkles, Image, Play, AlignLeft, Grid,
  MessageCircle, Users, Calendar, Trash2, Check, ArrowRight, ArrowLeft, Plus
} from 'lucide-react';

// ── 7 Platforms, 23 Formats (per DOCUMENTATION.md) ────────────────────────
const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram', color: '#E1306C', icon: Instagram,
    formats: [
      { id: 'feed_post', label: 'Feed Post', icon: Image },
      { id: 'reel', label: 'Reel', icon: Play },
      { id: 'story', label: 'Story', icon: Repeat },
      { id: 'carousel', label: 'Carousel', icon: Grid },
      { id: 'ig_live', label: 'Live Announcement', icon: Video },
    ],
  },
  {
    id: 'facebook', label: 'Facebook', color: '#1877F2', icon: Facebook,
    formats: [
      { id: 'fb_post', label: 'Post', icon: AlignLeft },
      { id: 'fb_reel', label: 'Reel', icon: Play },
      { id: 'fb_story', label: 'Story', icon: Repeat },
      { id: 'fb_event', label: 'Event Description', icon: Calendar },
      { id: 'fb_group', label: 'Group Post', icon: Users },
      { id: 'fb_ad', label: 'Ad Copy', icon: Target },
    ],
  },
  {
    id: 'threads', label: 'Threads', color: '#a855f7', icon: MessageCircle,
    formats: [
      { id: 'threads_post', label: 'Thread Post', icon: AlignLeft },
      { id: 'threads_reply', label: 'Conversation Starter', icon: MessageCircle },
    ],
  },
  {
    id: 'tiktok', label: 'TikTok', color: '#22d3ee', icon: Video,
    formats: [
      { id: 'tiktok_video', label: 'Video Caption', icon: Video },
      { id: 'tiktok_stitch', label: 'Stitch/Duet Prompt', icon: Repeat },
      { id: 'tiktok_bio', label: 'Profile Bio', icon: AlignLeft },
    ],
  },
  {
    id: 'x', label: 'X (Twitter)', color: '#94a3b8', icon: Twitter,
    formats: [
      { id: 'tweet', label: 'Tweet', icon: AlignLeft },
      { id: 'thread', label: 'Thread', icon: Hash },
      { id: 'x_space', label: 'Space Announcement', icon: Video },
    ],
  },
  {
    id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: Linkedin,
    formats: [
      { id: 'li_post', label: 'Post', icon: AlignLeft },
      { id: 'li_article', label: 'Article Intro', icon: AlignLeft },
      { id: 'li_event', label: 'Event Post', icon: Calendar },
    ],
  },
  {
    id: 'youtube', label: 'YouTube', color: '#FF0000', icon: Play,
    formats: [
      { id: 'yt_title', label: 'Video Title + Description', icon: AlignLeft },
      { id: 'yt_short', label: 'Shorts Caption', icon: Play },
      { id: 'yt_community', label: 'Community Post', icon: Users },
    ],
  },
];

const CONTENT_GOALS = [
  { id: 'announce_release', label: 'Announce a Release', accent: '#22d3ee' },
  { id: 'drive_streams', label: 'Drive Streams / Traffic', accent: '#10b981' },
  { id: 'event_promo', label: 'Promote an Event', accent: '#f59e0b' },
  { id: 'build_hype', label: 'Build Hype / Teaser', accent: '#f43f5e' },
  { id: 'behind_scenes', label: 'Behind the Scenes', accent: '#a78bfa' },
  { id: 'fan_engagement', label: 'Audience Engagement', accent: '#ec4899' },
  { id: 'collab_announce', label: 'Collaboration Drop', accent: '#14b8a6' },
  { id: 'brand_awareness', label: 'Brand Awareness', accent: '#3b82f6' },
  { id: 'merch_sale', label: 'Merch / Product Launch', accent: '#0ea5e9' },
  { id: 'milestone', label: 'Milestone / Win', accent: '#eab308' },
];

const TONES = [
  { id: 'hype', label: 'Hype & Bold' },
  { id: 'warm', label: 'Warm & Personal' },
  { id: 'pro', label: 'Professional' },
  { id: 'story', label: 'Storytelling' },
  { id: 'witty', label: 'Witty & Playful' },
  { id: 'urgent', label: 'Urgent / FOMO' },
];

function SocialOutputBlock({ platformId, formatId, content, onCopy, onSchedule }) {
  const [copied, setCopied] = useState(false);
  const plat = PLATFORMS.find((p) => p.id === platformId);
  const fmt = plat?.formats.find((f) => f.id === formatId);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: plat?.color || '#22d3ee' }}>
          {plat?.label || platformId}{fmt ? ` · ${fmt.label}` : ''}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onSchedule(platformId, formatId, content)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(34,211,238,0.35)', background: 'rgba(34,211,238,0.12)', color: '#67e8f9', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Calendar size={12} /> Schedule
          </button>
          <button
            type="button"
            onClick={handleCopy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px', lineHeight: 1.55, color: '#cbd5e1' }}>
        {content}
      </pre>
    </div>
  );
}

export default function SocialAI(props) {
  const auth = useAuth();
  const toast = useToast();
  const user = props.user || auth?.user;
  const updateUser = props.updateUser || auth?.updateUser;
  const addToast = props.addToast || toast?.addToast || (() => {});
  const personaMeta = getPersonaMeta(user?.persona);

  // Supplementary Studio Tabs
  const [studioTab, setStudioTab] = useState('wizard'); // wizard | visuals | calendar | assets | insights
  const [wizardStep, setWizardStep] = useState(1); // 1: Platforms & Formats, 2: Goal & Topic, 3: Output

  // Wizard state
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'tiktok']);
  const [selectedFormats, setSelectedFormats] = useState({ instagram: ['feed_post', 'reel'], tiktok: ['tiktok_video'] });
  const [goal, setGoal] = useState('announce_release');
  const [tones, setTones] = useState(['hype']);
  const [captionLength, setCaptionLength] = useState('short');
  const [variations, setVariations] = useState('3');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeTiming, setIncludeTiming] = useState(true);
  const [includeHooks, setIncludeHooks] = useState(true);
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [links, setLinks] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState(null);

  // Visuals Studio & Styles state
  const [artPrompt, setArtPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [artLoading, setArtLoading] = useState(false);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [assets, setAssets] = useState([]);
  const [styles, setStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStylePrompt, setNewStylePrompt] = useState('');

  // Calendar / Scheduled Posts state
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [schedForm, setSchedForm] = useState({
    platform: 'instagram',
    format: 'feed_post',
    title: '',
    caption: '',
    scheduled_for: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  // Recommendations & Channels
  const [recommendations, setRecommendations] = useState([]);

  // Pre-populate from WizardContext if applied
  const wizard = useWizard();
  useEffect(() => {
    if (!wizard?.appliedFromWizard || !wizard?.state) return;
    const s = wizard.state;
    if (s.topic && !topic) setTopic(s.topic);
    if (s.goal) setGoal(s.goal);
  }, [wizard?.appliedFromWizard]); // eslint-disable-line

  const loadStudioData = async () => {
    try {
      const [assetRes, styleRes, schedRes] = await Promise.all([
        api.get('/api/social-ai/assets').catch(() => ({ data: { assets: [] } })),
        api.get('/api/social-ai/styles').catch(() => ({ data: { styles: [] } })),
        api.get('/api/social-ai/scheduled').catch(() => ({ data: { posts: [] } })),
      ]);
      setAssets(assetRes.data?.assets || []);
      setStyles(styleRes.data?.styles || []);
      setScheduledPosts(schedRes.data?.posts || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  const togglePlatform = (platId) => {
    if (selectedPlatforms.includes(platId)) {
      setSelectedPlatforms((p) => p.filter((x) => x !== platId));
      const next = { ...selectedFormats };
      delete next[platId];
      setSelectedFormats(next);
    } else {
      const plat = PLATFORMS.find((p) => p.id === platId);
      setSelectedPlatforms((p) => [...p, platId]);
      setSelectedFormats((prev) => ({
        ...prev,
        [platId]: prev[platId]?.length ? prev[platId] : [plat?.formats[0]?.id].filter(Boolean),
      }));
    }
  };

  const toggleFormat = (platId, fmtId) => {
    const cur = selectedFormats[platId] || [];
    const next = cur.includes(fmtId) ? cur.filter((x) => x !== fmtId) : [...cur, fmtId];
    setSelectedFormats({ ...selectedFormats, [platId]: next });
  };

  const applyPreset = (preset) => {
    if (preset === 'meta') {
      setSelectedPlatforms(['instagram', 'facebook', 'threads']);
      setSelectedFormats({ instagram: ['feed_post', 'reel', 'story'], facebook: ['fb_post', 'fb_reel'], threads: ['threads_post'] });
    } else if (preset === 'video') {
      setSelectedPlatforms(['tiktok', 'instagram', 'youtube']);
      setSelectedFormats({ tiktok: ['tiktok_video'], instagram: ['reel'], youtube: ['yt_short'] });
    } else if (preset === 'persona') {
      if (personaMeta.side === 'business') {
        setSelectedPlatforms(['linkedin', 'instagram', 'x']);
        setSelectedFormats({ linkedin: ['li_post'], instagram: ['feed_post', 'carousel'], x: ['tweet', 'thread'] });
      } else {
        setSelectedPlatforms(['instagram', 'tiktok', 'youtube']);
        setSelectedFormats({ instagram: ['reel', 'story'], tiktok: ['tiktok_video'], youtube: ['yt_short', 'yt_community'] });
      }
    }
    addToast('Preset applied', `Tailored for ${personaMeta.shortLabel}`, 'success');
  };

  const handleGenerateCaptions = async () => {
    if (!topic.trim()) {
      addToast('Topic required', 'Tell Maven AI what you are posting about.', 'error');
      return;
    }
    setLoading(true);
    try {
      const platformsDesc = selectedPlatforms
        .map((pid) => {
          const p = PLATFORMS.find((x) => x.id === pid);
          const fmts = (selectedFormats[pid] || []).map((fid) => p?.formats.find((f) => f.id === fid)?.label || fid);
          return `${p?.label}: ${fmts.join(', ')}`;
        })
        .join(' | ');

      const prompt = `Persona: ${personaMeta.label}. Goal: ${goal}. Tones: ${tones.join(', ')}. Length: ${captionLength}. Variations: ${variations}. Include Hashtags: ${includeHashtags}. Include Timing: ${includeTiming}. Include Hooks: ${includeHooks}. Topic: ${topic}. Context: ${context}. Links: ${links}. Platforms & Formats: ${platformsDesc}`;

      const res = await api.post('/api/ai/generate', {
        tool_id: 'social',
        inputs: { topic, goal, tones, platforms: selectedPlatforms, formats: selectedFormats, prompt_override: prompt },
      });

      const rawText = res.data?.output || res.data?.result || '';
      const blocks = [];
      selectedPlatforms.forEach((pid) => {
        (selectedFormats[pid] || ['feed_post']).forEach((fid) => {
          blocks.push({
            platformId: pid,
            formatId: fid,
            content: rawText || `[${pid.toUpperCase()} · ${fid}]\n\n${topic}\n\n${context ? context + '\n' : ''}${links ? 'Link: ' + links + '\n' : ''}${includeHashtags ? '#Intermaven #TuneMavens #' + personaMeta.key : ''}`,
          });
        });
      });

      setOutputs({ raw: rawText, blocks });
      if (res.data?.remaining_credits !== undefined && updateUser && user) {
        updateUser({ ...user, credits: res.data.remaining_credits });
      }
      setWizardStep(3);
      if (props.fetchStats) props.fetchStats();
      if (props.fetchActivities) props.fetchActivities();
    } catch (err) {
      addToast('Generation failed', err.response?.data?.detail || 'Could not generate social copy', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFromOutput = async (platformId, formatId, content) => {
    try {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
      await api.post('/api/social-ai/scheduled', {
        platform: platformId,
        format: formatId,
        title: topic || `${platformId} campaign`,
        caption: content.slice(0, 600),
        scheduled_for: tomorrow,
        persona: user?.persona || 'creator',
      });
      addToast('Scheduled!', `Added ${platformId} post to your Content Calendar.`, 'success');
      await loadStudioData();
    } catch (err) {
      addToast('Schedule failed', err.response?.data?.detail || 'Could not schedule post', 'error');
    }
  };

  const handleGenerateArt = async (e) => {
    e.preventDefault();
    if (!artPrompt.trim()) return;
    setArtLoading(true);
    try {
      const res = await api.post('/api/social-ai/generate-art', {
        prompt: `${artPrompt} (for ${personaMeta.label} social campaign)`,
        aspect_ratio: aspectRatio,
      });
      setGeneratedArt(res.data?.asset || res.data);
      addToast('Visual generated', 'Saved to your Social AI Asset Library.', 'success');
      await loadStudioData();
    } catch (err) {
      addToast('Visual generation failed', err.response?.data?.detail || 'Try a different prompt', 'error');
    } finally {
      setArtLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/social-ai/scheduled', { ...schedForm, persona: user?.persona || 'creator' });
      addToast('Post scheduled', 'Added to Content Calendar.', 'success');
      setSchedForm({ ...schedForm, title: '', caption: '' });
      await loadStudioData();
    } catch (err) {
      addToast('Failed', err.response?.data?.detail || 'Could not schedule post', 'error');
    }
  };

  const handleDeleteSchedule = async (id) => {
    await api.delete(`/api/social-ai/scheduled/${id}`);
    await loadStudioData();
  };

  const handleSaveStyle = async (e) => {
    e.preventDefault();
    if (!newStyleName.trim()) return;
    try {
      await api.post('/api/social-ai/styles', { name: newStyleName, prompt_suffix: newStylePrompt });
      setNewStyleName('');
      setNewStylePrompt('');
      addToast('Style saved', 'Added to your Brand Style Presets.', 'success');
      await loadStudioData();
    } catch (err) {
      addToast('Error', 'Could not save style', 'error');
    }
  };

  const handleLoadRecommendations = async () => {
    try {
      const res = await api.post('/api/social-ai/recommendations', {
        persona: user?.persona || 'creator',
        goal,
        platforms: selectedPlatforms,
      });
      setRecommendations(res.data?.recommendations || [res.data?.recommendation || 'Post 3x/week with short-form hooks and clear CTAs.']);
    } catch {
      setRecommendations([`For ${personaMeta.label}, post 3–4 short-form clips weekly and pair with Smart CRM email drops.`]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlatIcon name="social" size={42} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>Social AI Studio</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              7 Platforms · 23 Formats · AI Visuals · Content Calendar · Tailored for {personaMeta.label}
            </p>
          </div>
        </div>
        <AppHelpAiControls appId="social" persona={user?.persona || 'creator'} compact />
      </div>

      {/* Supplementary Studio Menu */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        {[
          { id: 'wizard', label: '1. Campaign Wizard' },
          { id: 'visuals', label: '2. AI Visuals Studio' },
          { id: 'calendar', label: `3. Content Calendar (${scheduledPosts.length})` },
          { id: 'assets', label: `4. Assets & Styles (${assets.length})` },
          { id: 'insights', label: '5. AI Recommendations' },
        ].map((t) => {
          const active = studioTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setStudioTab(t.id);
                if (t.id === 'insights' && recommendations.length === 0) handleLoadRecommendations();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: active ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.12)',
                background: active ? 'rgba(244,63,94,0.16)' : 'rgba(255,255,255,0.04)',
                color: active ? '#fda4af' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GUIDED 3-STEP WIZARD */}
      {studioTab === 'wizard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Wizard Progress Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { n: 1, title: 'Step 1: Platforms & Formats' },
              { n: 2, title: 'Step 2: Goal, Tone & Topic' },
              { n: 3, title: 'Step 3: Generated Posts & Schedule' },
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setWizardStep(s.n)}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: wizardStep === s.n ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.08)',
                  background: wizardStep === s.n ? 'rgba(34,211,238,0.12)' : 'rgba(13,17,23,0.6)',
                  color: wizardStep === s.n ? '#67e8f9' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {wizardStep === 1 && (
            <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Choose Platforms & Formats</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Pick a 1-click preset or select individual platforms below.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => applyPreset('persona')} style={{ padding: '6px 11px', borderRadius: '6px', border: '1px solid rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.12)', color: '#67e8f9', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                    Recommended for {personaMeta.shortLabel}
                  </button>
                  <button type="button" onClick={() => applyPreset('meta')} style={{ padding: '6px 11px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    Meta-Max (IG + FB + Threads)
                  </button>
                  <button type="button" onClick={() => applyPreset('video')} style={{ padding: '6px 11px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    Short-Form Video Pack
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <div key={p.id} style={{ padding: '14px', borderRadius: '10px', border: active ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)', background: active ? `${p.color}14` : 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }} onClick={() => togglePlatform(p.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>
                          <Icon size={16} color={p.color} /> {p.label}
                        </div>
                        <input type="checkbox" checked={active} readOnly />
                      </div>
                      {active && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {p.formats.map((f) => {
                            const fActive = (selectedFormats[p.id] || []).includes(f.id);
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => toggleFormat(p.id, f.id)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  border: fActive ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.12)',
                                  background: fActive ? `${p.color}28` : 'transparent',
                                  color: fActive ? '#f8fafc' : '#94a3b8',
                                  cursor: 'pointer',
                                }}
                              >
                                {f.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={selectedPlatforms.length === 0}
                  onClick={() => setWizardStep(2)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#22d3ee', color: '#061224', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Next: Goal &amp; Topic <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Campaign Goal, Tone &amp; Topic</h3>

              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>1. What is your goal?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CONTENT_GOALS.map((g) => {
                    const active = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: active ? `1px solid ${g.accent}` : '1px solid rgba(255,255,255,0.12)',
                          background: active ? `${g.accent}22` : 'rgba(255,255,255,0.03)',
                          color: active ? '#f8fafc' : '#cbd5e1',
                          cursor: 'pointer',
                        }}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>2. Pick tone(s)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TONES.map((t) => {
                    const active = tones.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTones(active ? tones.filter((x) => x !== t.id) : [...tones, t.id])}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          border: active ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.12)',
                          background: active ? 'rgba(244,63,94,0.18)' : 'transparent',
                          color: active ? '#fda4af' : '#cbd5e1',
                          cursor: 'pointer',
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Topic / Announcement *</label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., New single 'Midnight Drifter' out Friday on all DSPs"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Key Link / CTA URL</label>
                  <input
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                    placeholder="https://intermaven.io/... or pre-save link"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Extra Context / Offer Details</label>
                <textarea
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Add release story, event venue, discount code, or target audience notes..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#cbd5e1' }}>
                <label><input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} /> Include Hashtag Strategy</label>
                <label><input type="checkbox" checked={includeHooks} onChange={(e) => setIncludeHooks(e.target.checked)} /> Include Scroll-Stopping Hooks</label>
                <label><input type="checkbox" checked={includeTiming} onChange={(e) => setIncludeTiming(e.target.checked)} /> Include Best Posting Times</label>
                <select value={captionLength} onChange={(e) => setCaptionLength(e.target.value)} style={{ background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '6px', padding: '3px 8px' }}>
                  <option value="short">Short &amp; Punchy</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long Storytelling</option>
                </select>
                <select value={variations} onChange={(e) => setVariations(e.target.value)} style={{ background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '6px', padding: '3px 8px' }}>
                  <option value="1">1 Variation</option>
                  <option value="3">3 Variations</option>
                  <option value="5">5 Variations</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button type="button" onClick={() => setWizardStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGenerateCaptions}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f43f5e, #a855f7)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  <Zap size={15} /> {loading ? 'Generating with Maven AI...' : 'Generate Campaign Copy'}
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Generated Campaign Copy</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setWizardStep(2)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer' }}>
                    ← Edit Prompt
                  </button>
                  {outputs?.raw && (
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([outputs.raw], { type: 'text/plain' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `social-ai-${Date.now()}.txt`;
                        a.click();
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      <Download size={13} /> Export .txt
                    </button>
                  )}
                </div>
              </div>

              {!outputs ? (
                <div style={{ padding: '32px', textAlign: 'center', background: 'rgba(13,17,23,0.85)', borderRadius: '12px', color: '#94a3b8' }}>
                  Complete Steps 1 and 2 to generate tailored social copy.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {outputs.blocks.map((b, i) => (
                    <SocialOutputBlock
                      key={i}
                      platformId={b.platformId}
                      formatId={b.formatId}
                      content={b.content}
                      onCopy={() => addToast('Copied', 'Caption copied to clipboard.', 'success')}
                      onSchedule={handleScheduleFromOutput}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI VISUALS STUDIO */}
      {studioTab === 'visuals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          <form onSubmit={handleGenerateArt} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Generate Campaign Artwork</h3>
            <textarea required rows={4} placeholder="Describe the visual (e.g., Neon Nairobi rooftop DJ set at dusk, afrofuturist cyan & magenta lighting)..." value={artPrompt} onChange={(e) => setArtPrompt(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}>
              <option value="1:1">1:1 Square (Instagram Feed)</option>
              <option value="9:16">9:16 Vertical (Reels / TikTok / Shorts)</option>
              <option value="16:9">16:9 Landscape (YouTube / LinkedIn)</option>
            </select>
            <button type="submit" disabled={artLoading} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              {artLoading ? 'Generating Visual...' : 'Generate Visual'}
            </button>
          </form>

          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '240px' }}>
            {generatedArt?.media_url ? (
              <img src={generatedArt.media_url} alt={generatedArt.prompt} style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '10px' }} />
            ) : (
              <span style={{ color: '#64748b', fontSize: '13px' }}>Your generated campaign artwork will appear here.</span>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT CALENDAR / SCHEDULER */}
      {studioTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          <form onSubmit={handleCreateSchedule} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Schedule a Post</h3>
            <select value={schedForm.platform} onChange={(e) => setSchedForm({ ...schedForm, platform: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }}>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <input required placeholder="Campaign Title" value={schedForm.title} onChange={(e) => setSchedForm({ ...schedForm, title: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <textarea required rows={3} placeholder="Post Caption..." value={schedForm.caption} onChange={(e) => setSchedForm({ ...schedForm, caption: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input type="datetime-local" value={schedForm.scheduled_for} onChange={(e) => setSchedForm({ ...schedForm, scheduled_for: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#22d3ee', color: '#061224', fontWeight: 700, cursor: 'pointer' }}>Add to Calendar</button>
          </form>

          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Upcoming Scheduled Posts</h3>
            {scheduledPosts.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No posts scheduled yet.</p>
            ) : (
              scheduledPosts.map((p) => (
                <div key={p.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: '#22d3ee', textTransform: 'uppercase' }}>{p.platform} · {p.scheduled_for}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{p.caption?.slice(0, 120)}</div>
                  </div>
                  <button type="button" onClick={() => handleDeleteSchedule(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={15} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ASSETS & STYLE PRESETS */}
      {studioTab === 'assets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#f8fafc' }}>Saved Visual Assets ({assets.length})</h3>
            {assets.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Generate visuals in Tab 2 to populate your library.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                {assets.map((a) => (
                  <div key={a.id || a._id} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={a.media_url} alt={a.prompt} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveStyle} style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Brand Style Presets ({styles.length})</h3>
            <input required placeholder="Style Name (e.g., Afro-Futurist Neon)" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <input placeholder="Prompt Modifiers / Color Palette" value={newStylePrompt} onChange={(e) => setNewStylePrompt(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.14)', background: '#161b22', color: '#fff' }} />
            <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#061224', fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} /> Save Style Preset
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: AI RECOMMENDATIONS */}
      {studioTab === 'insights' && (
        <div style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Smart Recommendations for {personaMeta.label}</h3>
            <button type="button" onClick={handleLoadRecommendations} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.12)', color: '#67e8f9', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Refresh
            </button>
          </div>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5 }}>
              <Sparkles size={14} color="#22d3ee" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {typeof rec === 'string' ? rec : rec.text || rec.title || JSON.stringify(rec)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
