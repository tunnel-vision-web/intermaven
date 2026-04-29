import React, { useState } from 'react';
import { api } from '../App';
import {
  Copy, Download, Zap, ChevronDown, ChevronUp,
  Instagram, Facebook, Twitter, Linkedin, Video,
  Hash, Clock, Target, Repeat, Sparkles, RefreshCw,
  Image, Play, AlignLeft, Grid, MessageCircle, Users,
  TrendingUp, Calendar, Globe, BarChart2, Heart, Share2
} from 'lucide-react';

// ── Platform config ─────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram', color: '#E1306C',
    icon: Instagram,
    formats: [
      { id: 'feed_post', label: 'Feed Post', icon: Image },
      { id: 'reel', label: 'Reel', icon: Play },
      { id: 'story', label: 'Story', icon: Repeat },
      { id: 'carousel', label: 'Carousel', icon: Grid },
      { id: 'ig_live', label: 'Live Announcement', icon: Video },
    ]
  },
  {
    id: 'facebook', label: 'Facebook', color: '#1877F2',
    icon: Facebook,
    formats: [
      { id: 'fb_post', label: 'Post', icon: AlignLeft },
      { id: 'fb_reel', label: 'Reel', icon: Play },
      { id: 'fb_story', label: 'Story', icon: Repeat },
      { id: 'fb_event', label: 'Event Description', icon: Calendar },
      { id: 'fb_group', label: 'Group Post', icon: Users },
      { id: 'fb_ad', label: 'Ad Copy', icon: Target },
    ]
  },
  {
    id: 'threads', label: 'Threads', color: '#000000',
    icon: MessageCircle,
    formats: [
      { id: 'threads_post', label: 'Thread Post', icon: AlignLeft },
      { id: 'threads_reply', label: 'Conversation Starter', icon: MessageCircle },
    ]
  },
  {
    id: 'tiktok', label: 'TikTok', color: '#010101',
    icon: Video,
    formats: [
      { id: 'tiktok_video', label: 'Video Caption', icon: Video },
      { id: 'tiktok_stitch', label: 'Stitch/Duet Prompt', icon: Repeat },
      { id: 'tiktok_bio', label: 'Profile Bio', icon: AlignLeft },
    ]
  },
  {
    id: 'x', label: 'X (Twitter)', color: '#000000',
    icon: Twitter,
    formats: [
      { id: 'tweet', label: 'Tweet', icon: AlignLeft },
      { id: 'thread', label: 'Thread', icon: Hash },
      { id: 'x_space', label: 'Space Announcement', icon: Video },
    ]
  },
  {
    id: 'linkedin', label: 'LinkedIn', color: '#0A66C2',
    icon: Linkedin,
    formats: [
      { id: 'li_post', label: 'Post', icon: AlignLeft },
      { id: 'li_article', label: 'Article Intro', icon: AlignLeft },
      { id: 'li_event', label: 'Event Post', icon: Calendar },
    ]
  },
  {
    id: 'youtube', label: 'YouTube', color: '#FF0000',
    icon: Play,
    formats: [
      { id: 'yt_title', label: 'Video Title + Description', icon: AlignLeft },
      { id: 'yt_short', label: 'Shorts Caption', icon: Play },
      { id: 'yt_community', label: 'Community Post', icon: Users },
    ]
  },
];

const CONTENT_GOALS = [
  { id: 'announce_release', label: 'Announce a Release', icon: '🎵' },
  { id: 'drive_streams', label: 'Drive Streams', icon: '▶️' },
  { id: 'event_promo', label: 'Promote an Event', icon: '🎤' },
  { id: 'build_hype', label: 'Build Hype / Teaser', icon: '🔥' },
  { id: 'behind_scenes', label: 'Behind the Scenes', icon: '🎬' },
  { id: 'fan_engagement', label: 'Fan Engagement', icon: '❤️' },
  { id: 'collab_announce', label: 'Collaboration Drop', icon: '🤝' },
  { id: 'brand_awareness', label: 'Brand Awareness', icon: '✨' },
  { id: 'merch_sale', label: 'Merch / Product Launch', icon: '👕' },
  { id: 'throwback', label: 'Throwback / Archive', icon: '📸' },
  { id: 'milestone', label: 'Milestone / Achievement', icon: '🏆' },
  { id: 'call_to_action', label: 'Direct Call to Action', icon: '📢' },
];

const TONES = [
  { id: 'hype', label: 'Hype & Bold' },
  { id: 'warm', label: 'Warm & Personal' },
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Fun & Casual' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'raw', label: 'Raw & Authentic' },
  { id: 'luxury', label: 'Luxe & Aspirational' },
  { id: 'afrocentric', label: 'Afrocentric & Cultural' },
];

const AUDIENCES = [
  { id: 'gen_z', label: 'Gen Z (18–25)' },
  { id: 'millennials', label: 'Millennials (25–35)' },
  { id: 'nairobi', label: 'Nairobi / Kenya' },
  { id: 'east_africa', label: 'East Africa' },
  { id: 'pan_africa', label: 'Pan-Africa' },
  { id: 'diaspora', label: 'African Diaspora' },
  { id: 'global', label: 'Global Audience' },
  { id: 'industry', label: 'Music Industry Pros' },
];

const CAPTION_LENGTHS = [
  { id: 'micro', label: 'Micro (1–2 lines)' },
  { id: 'short', label: 'Short (3–5 lines)' },
  { id: 'medium', label: 'Medium (1 paragraph)' },
  { id: 'long', label: 'Long (storytelling)' },
];

// ── Helpers ───────────────────────────────────────────────────────
function MultiSelect({ options, value = [], onChange, maxSelect }) {
  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      if (maxSelect && value.length >= maxSelect) return;
      onChange([...value, id]);
    }
  };
  return (
    <div className="social-chips">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          className={`social-chip ${value.includes(opt.id) ? 'active' : ''}`}
          onClick={() => toggle(opt.id)}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, icon: Icon, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="social-section">
      <div
        className={`social-section-header ${collapsible ? 'clickable' : ''}`}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
      >
        <div className="social-section-title">
          {Icon && <Icon size={15} />}
          <span>{title}</span>
        </div>
        {collapsible && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </div>
      {open && <div className="social-section-body">{children}</div>}
    </div>
  );
}

function OutputBlock({ platform, format, content, onCopy }) {
  const [copied, setCopied] = useState(false);
  const plat = PLATFORMS.find(p => p.id === platform);
  const fmt = plat?.formats.find(f => f.id === format);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="social-output-block">
      <div className="social-output-block-header">
        <div className="social-output-platform" style={{ color: plat?.color }}>
          {plat?.label}{fmt ? ` · ${fmt.label}` : ''}
        </div>
        <button className="social-copy-btn" onClick={handleCopy}>
          <Copy size={12} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="social-output-pre">{content}</pre>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
function SocialAI({ user, updateUser, addToast, fetchStats, fetchActivities }) {
  const [step, setStep] = useState(1); // 1 = configure, 2 = output
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState(null);

  // Form state
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState({}); // { instagram: ['reel', 'story'], ... }
  const [goal, setGoal] = useState('');
  const [tones, setTones] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [captionLength, setCaptionLength] = useState('short');
  const [variations, setVariations] = useState('3');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [includeTiming, setIncludeTiming] = useState(true);
  const [includeHooks, setIncludeHooks] = useState(true);
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [mentions, setMentions] = useState('');
  const [links, setLinks] = useState('');

  const togglePlatform = (platId) => {
    if (selectedPlatforms.includes(platId)) {
      setSelectedPlatforms(p => p.filter(x => x !== platId));
      const newFormats = { ...selectedFormats };
      delete newFormats[platId];
      setSelectedFormats(newFormats);
    } else {
      setSelectedPlatforms(p => [...p, platId]);
    }
  };

  const toggleFormat = (platId, fmtId) => {
    const current = selectedFormats[platId] || [];
    if (current.includes(fmtId)) {
      setSelectedFormats({ ...selectedFormats, [platId]: current.filter(x => x !== fmtId) });
    } else {
      setSelectedFormats({ ...selectedFormats, [platId]: [...current, fmtId] });
    }
  };

  const allFormatsSelected = () => {
    return selectedPlatforms.every(p => (selectedFormats[p] || []).length > 0);
  };

  const canGenerate = topic.trim() && goal && selectedPlatforms.length > 0 && allFormatsSelected();

  const buildPrompt = () => {
    const platformDetails = selectedPlatforms.map(platId => {
      const plat = PLATFORMS.find(p => p.id === platId);
      const formats = (selectedFormats[platId] || []).map(fId => {
        const fmt = plat?.formats.find(f => f.id === fId);
        return fmt?.label;
      }).join(', ');
      return `${plat?.label} (${formats})`;
    }).join(' | ');

    const toneLabels = tones.map(t => TONES.find(x => x.id === t)?.label).join(', ') || 'Balanced';
    const audienceLabels = audiences.map(a => AUDIENCES.find(x => x.id === a)?.label).join(', ') || 'General African creative audience';
    const goalLabel = CONTENT_GOALS.find(g => g.id === goal)?.label || goal;
    const lengthLabel = CAPTION_LENGTHS.find(l => l.id === captionLength)?.label || 'Short';

    return `You are a world-class social media strategist specializing in African creative industries — music, fashion, art, and entertainment. You understand platform algorithms deeply, especially Meta's systems (Instagram and Facebook), and how to maximize organic reach for African creators.

BRIEF:
- Topic/Content: ${topic}
- Goal: ${goalLabel}
- Platforms & Formats: ${platformDetails}
- Tone: ${toneLabels}
- Target Audience: ${audienceLabels}
- Caption Length: ${lengthLabel}
- Number of Variations per format: ${variations}
${context ? `- Additional Context: ${context}` : ''}
${brandVoice ? `- Brand Voice Notes: ${brandVoice}` : ''}
${mentions ? `- Tags/Mentions to include: ${mentions}` : ''}
${links ? `- Link(s) to include: ${links}` : ''}

DELIVERABLES — For EACH platform and format combination, provide:

1. CAPTION VARIATIONS (${variations} options, clearly numbered)
   - Each variation optimized for that specific format's algorithm behavior
   - ${includeEmojis ? 'Include strategic emojis.' : 'No emojis.'}
   - ${includeCTA ? 'Include a clear Call to Action.' : 'No explicit CTA.'}
   - ${includeHooks ? 'Open with a strong hook (first line must stop the scroll).' : ''}

2. ${includeHashtags ? `HASHTAG STRATEGY
   - 3–5 high-volume tags (1M+ posts)
   - 3–5 mid-range tags (100K–1M posts)
   - 3–5 niche tags (<100K, highly targeted)
   - 2–3 branded/African-specific tags
   - Total: 20–25 hashtags for maximum reach` : ''}

3. ${includeTiming ? `OPTIMAL POSTING TIME
   - Best day(s) for Nairobi / East Africa audience
   - Best time window (include UTC+3 timezone)
   - Frequency recommendation` : ''}

4. PLATFORM-SPECIFIC TIPS (2–3 tactical notes per format)
   - What the algorithm rewards for this specific format
   - Any Meta-specific feature to leverage (Collab posts, Remix, Add Yours stickers, Polls, etc.)
   - Engagement tactic to boost early interactions (critical in first 30 minutes)

5. VISUAL DIRECTION (brief art direction note for the accompanying media)

${selectedPlatforms.includes('facebook') ? `
FACEBOOK-SPECIFIC: For all Facebook formats, also include:
- Whether to boost as paid ad (yes/no + rationale)
- Audience targeting suggestion for Facebook Ads Manager
- Best Facebook placement (Feed, Reels, Stories, Marketplace)
` : ''}

${selectedPlatforms.includes('instagram') ? `
INSTAGRAM-SPECIFIC: For all Instagram formats, also include:
- Reel audio strategy (trending sound vs original audio)
- Cover image/thumbnail direction
- Story sequence (if story format selected): 3-frame story arc
- Collab post opportunity (who to collab with + rationale)
` : ''}

Format your response with clear headers for each platform, then each format. Make every caption genuinely creative, specific to African creative culture, and ready to copy-paste. No generic filler.`;
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setLoading(true);
    setOutputs(null);

    try {
      const response = await api.post('/api/ai/generate', {
        tool_id: 'social',
        inputs: {
          prompt_override: buildPrompt(),
          platforms: selectedPlatforms,
          formats: selectedFormats,
          goal,
          topic,
        }
      });

      setOutputs(response.data.content);
      updateUser({ ...user, credits: response.data.credits_remaining });
      addToast('Generated!', 'Your social content is ready.', 'success');
      fetchStats();
      fetchActivities();
      setStep(2);
    } catch (error) {
      const message = error.response?.data?.detail || 'Generation failed.';
      addToast('Generation failed', message, 'error');
    }

    setLoading(false);
  };

  const downloadAll = () => {
    if (!outputs) return;
    const blob = new Blob([outputs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded!', '', 'success');
  };

  const copyAll = () => {
    if (!outputs) return;
    navigator.clipboard.writeText(outputs);
    addToast('All content copied!', '', 'success');
  };

  return (
    <div className="panel active tool-panel social-ai-panel" data-testid="tool-panel-social">

      {/* Header */}
      <div className="tool-header">
        <span className="tool-icon">
          <Share2 size={26} color="#f43f5e" />
        </span>
        <div className="tool-info">
          <h2>Social AI</h2>
          <p>Full-stack content engine — Meta, TikTok, X, LinkedIn, YouTube</p>
        </div>
        <div className="tool-credits">
          <Zap size={14} />
          Free
        </div>
      </div>

      {/* Step tabs */}
      <div className="social-steps">
        <button
          className={`social-step-btn ${step === 1 ? 'active' : ''}`}
          onClick={() => setStep(1)}
        >
          <span className="social-step-num">1</span> Configure
        </button>
        <div className="social-step-divider" />
        <button
          className={`social-step-btn ${step === 2 ? 'active' : ''} ${!outputs ? 'disabled' : ''}`}
          onClick={() => outputs && setStep(2)}
        >
          <span className="social-step-num">2</span> Output
        </button>
      </div>

      {step === 1 && (
        <div className="social-configure">

          {/* PLATFORM SELECTION */}
          <Section title="Platforms" icon={Globe} defaultOpen={true}>
            <p className="social-hint">Select all platforms you're posting to. Choose formats for each.</p>
            <div className="social-platform-grid">
              {PLATFORMS.map(plat => {
                const PlatIcon = plat.icon;
                const isSelected = selectedPlatforms.includes(plat.id);
                return (
                  <div key={plat.id} className={`social-platform-card ${isSelected ? 'active' : ''}`}>
                    <div
                      className="social-platform-header"
                      onClick={() => togglePlatform(plat.id)}
                    >
                      <div className="social-platform-name">
                        <PlatIcon size={15} style={{ color: plat.color }} />
                        <span>{plat.label}</span>
                      </div>
                      <div className={`social-platform-toggle ${isSelected ? 'on' : ''}`} />
                    </div>
                    {isSelected && (
                      <div className="social-format-list">
                        {plat.formats.map(fmt => {
                          const FmtIcon = fmt.icon;
                          const isFmtSelected = (selectedFormats[plat.id] || []).includes(fmt.id);
                          return (
                            <button
                              key={fmt.id}
                              type="button"
                              className={`social-format-btn ${isFmtSelected ? 'active' : ''}`}
                              onClick={() => toggleFormat(plat.id, fmt.id)}
                            >
                              <FmtIcon size={12} />
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* CONTENT BRIEF */}
          <Section title="Content Brief" icon={AlignLeft} defaultOpen={true}>
            <div className="form-group">
              <label className="form-label">What are you posting about? <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                placeholder="e.g. New single 'Golden Hour' dropping Friday — Afro-soul, features Savara, produced by Cedo. We want people streaming on Spotify and sharing the link."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Goal <span className="required">*</span></label>
              <div className="social-goal-grid">
                {CONTENT_GOALS.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    className={`social-goal-btn ${goal === g.id ? 'active' : ''}`}
                    onClick={() => setGoal(g.id)}
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional context (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Links, streaming URLs, ticket info, promo codes, collab details, visual description..."
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={2}
              />
            </div>
          </Section>

          {/* AUDIENCE & TONE */}
          <Section title="Audience & Tone" icon={Target} defaultOpen={true}>
            <div className="form-group">
              <label className="form-label">Target Audience (select all that apply)</label>
              <MultiSelect options={AUDIENCES} value={audiences} onChange={setAudiences} />
            </div>
            <div className="form-group">
              <label className="form-label">Tone (select up to 2)</label>
              <MultiSelect options={TONES} value={tones} onChange={setTones} maxSelect={2} />
            </div>
          </Section>

          {/* CONTENT SETTINGS */}
          <Section title="Content Settings" icon={BarChart2} collapsible defaultOpen={true}>
            <div className="social-settings-grid">
              <div className="form-group">
                <label className="form-label">Caption Length</label>
                <select
                  className="form-select"
                  value={captionLength}
                  onChange={e => setCaptionLength(e.target.value)}
                >
                  {CAPTION_LENGTHS.map(l => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Variations per format</label>
                <select
                  className="form-select"
                  value={variations}
                  onChange={e => setVariations(e.target.value)}
                >
                  <option value="1">1 variation</option>
                  <option value="2">2 variations</option>
                  <option value="3">3 variations</option>
                  <option value="5">5 variations</option>
                </select>
              </div>
            </div>

            <div className="social-toggles">
              {[
                { key: 'hashtags', label: 'Hashtag strategy', val: includeHashtags, set: setIncludeHashtags, icon: Hash },
                { key: 'emojis', label: 'Include emojis', val: includeEmojis, set: setIncludeEmojis, icon: Heart },
                { key: 'cta', label: 'Call to Action', val: includeCTA, set: setIncludeCTA, icon: Target },
                { key: 'timing', label: 'Optimal posting time', val: includeTiming, set: setIncludeTiming, icon: Clock },
                { key: 'hooks', label: 'Scroll-stopping hooks', val: includeHooks, set: setIncludeHooks, icon: TrendingUp },
              ].map(({ key, label, val, set, icon: Icon }) => (
                <div key={key} className="social-toggle-row">
                  <div className="social-toggle-label">
                    <Icon size={14} />
                    <span>{label}</span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch ${val ? 'on' : ''}`}
                    onClick={() => set(v => !v)}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* BRAND DETAILS */}
          <Section title="Brand Details" icon={Users} collapsible defaultOpen={false}>
            <div className="form-group">
              <label className="form-label">Brand voice / style notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. We always say 'the culture' not 'the community'. Never use corporate speak."
                value={brandVoice}
                onChange={e => setBrandVoice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags & mentions to include</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. @savara @cedoproducer @universalmusicafrica"
                value={mentions}
                onChange={e => setMentions(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Links to include</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Spotify link, Ticketsasa, linktr.ee"
                value={links}
                onChange={e => setLinks(e.target.value)}
              />
            </div>
          </Section>

          {/* GENERATE */}
          <div className="social-generate-bar">
            {!canGenerate && (
              <p className="social-generate-hint">
                {!topic.trim() && '· Add your topic  '}
                {!goal && '· Select a goal  '}
                {selectedPlatforms.length === 0 && '· Choose at least one platform  '}
                {selectedPlatforms.length > 0 && !allFormatsSelected() && '· Select format(s) for each platform'}
              </p>
            )}
            <button
              className="btn btn-primary social-generate-btn"
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
              data-testid="generate-button"
            >
              {loading ? (
                <><span className="spinner" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate Content</>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 2 && outputs && (
        <div className="social-output">
          <div className="social-output-toolbar">
            <div className="social-output-meta">
              <span className="social-output-badge">
                {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
              </span>
              <span className="social-output-badge">
                {Object.values(selectedFormats).flat().length} format{Object.values(selectedFormats).flat().length > 1 ? 's' : ''}
              </span>
              <span className="social-output-badge">
                {variations} variation{variations > 1 ? 's' : ''} each
              </span>
            </div>
            <div className="social-output-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>
                <RefreshCw size={13} /> Edit Brief
              </button>
              <button className="btn btn-secondary btn-sm" onClick={copyAll}>
                <Copy size={13} /> Copy All
              </button>
              <button className="btn btn-secondary btn-sm" onClick={downloadAll}>
                <Download size={13} /> Download
              </button>
            </div>
          </div>

          <div className="social-output-content" data-testid="tool-output">
            <pre className="social-output-full">{outputs}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialAI;
