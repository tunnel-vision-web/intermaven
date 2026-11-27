import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, useAuth, useToast } from '../App';
import {
  Library, Search, Bookmark, ExternalLink, Sparkles, X, Copy,
  Send, CheckCircle, Clock, MessageSquare, Mail, Phone, FileText,
  RefreshCw, Download, Trash2, CheckSquare, Calendar, ArrowRight
} from 'lucide-react';

const CATEGORIES = ['all', 'Music & Audio', 'Creative Arts', 'Film & Media', 'Business & SME'];
const REGIONS = ['all', 'East Africa', 'Africa', 'Global'];

const STAGES = [
  { id: 'draft', label: 'Draft', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  { id: 'submitted', label: 'Submitted', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  { id: 'under_review', label: 'Under Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  { id: 'shortlisted', label: 'Shortlisted', color: '#c084fc', bg: 'rgba(192,132,252,0.15)' },
  { id: 'approved', label: 'Approved / Awarded', color: '#34d399', bg: 'rgba(52,211,153,0.18)' },
  { id: 'declined', label: 'Declined', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
];

const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.id, s]));

const FALLBACK_GRANTS = [
  {
    id: 'grant-british-council-ea',
    title: 'British Council — East Africa Arts & Mobility Grant',
    funder: 'British Council',
    category: 'Creative Arts',
    region: 'East Africa',
    amount: '£2,000 – £10,000',
    recommended_ask: '£6,500',
    deadline: 'Rolling / Quarterly',
    review_timeline: '6–8 weeks after quarterly cutoff',
    program_email: 'arts.eastafrica@britishcouncil.org',
    eligibility: 'Artists, musicians, curators, and creative collectives based in Kenya, Uganda, Tanzania, Rwanda, or Ethiopia.',
    summary: 'Supports cross-border collaborations, touring, showcases, and digital creative residencies between East Africa and the UK.',
    requirements: [
      'Executive Summary & Cross-Border Creative Concept',
      'Applicant Bio / Portfolio or EPK Link',
      'Itemized Production & Travel Budget',
      '6-Month Delivery & Audience Impact Timeline',
    ],
    apply_url: 'https://www.britishcouncil.org/arts',
  },
  {
    id: 'grant-heva-creative',
    title: 'HEVA Fund — East Africa Creative Economy Growth Facility',
    funder: 'HEVA Fund',
    category: 'Business & SME',
    region: 'East Africa',
    amount: 'KES 500,000 – KES 5,000,000',
    recommended_ask: 'KES 1,500,000',
    deadline: 'Rolling Cohorts',
    review_timeline: '4–6 weeks including due diligence',
    program_email: 'applications@hevafund.com',
    eligibility: 'Registered creative businesses, music studios, fashion labels, live events, and digital media SMEs in Kenya & East Africa.',
    summary: 'Provides catalytic growth financing, working capital, and equipment funding tailored specifically for East African creative enterprises.',
    requirements: [
      'Business / Studio Overview & Revenue Model',
      'Working Capital & Equipment Use-of-Funds Schedule',
      '12-Month Cashflow & Growth Milestones',
      'Company Registration / Founder Profile',
    ],
    apply_url: 'https://www.hevafund.com',
  },
  {
    id: 'grant-goethe-coprod',
    title: 'Goethe-Institut — International Coproduction Fund',
    funder: 'Goethe-Institut',
    category: 'Music & Audio',
    region: 'Global',
    amount: 'Up to €25,000',
    recommended_ask: '€18,000',
    deadline: 'Bi-annual (Spring & Autumn)',
    review_timeline: '8 weeks post-deadline',
    program_email: 'koprod@goethe.de',
    eligibility: 'Independent musicians, sound artists, and performing arts ensembles co-producing with international partners.',
    summary: 'Funds collaborative music production, live touring rehearsals, and cross-cultural artistic exchanges.',
    requirements: [
      'Artistic Co-Production Statement & Collaborator Details',
      'Audio / Video Work Samples or EPK',
      'Balanced Co-Financing & Production Budget',
      'Rehearsal, Premiere & Touring Schedule',
    ],
    apply_url: 'https://www.goethe.de/en/kul/foe/int.html',
  },
  {
    id: 'grant-africa-no-filter',
    title: 'Africa No Filter — Narrative Change Micro-Grant',
    funder: 'Africa No Filter',
    category: 'Film & Media',
    region: 'Africa',
    amount: '$2,500 – $15,000',
    recommended_ask: '$10,000',
    deadline: 'Rolling',
    review_timeline: '4–5 weeks rolling review',
    program_email: 'grants@africanofilter.org',
    eligibility: 'African storytellers, podcasters, filmmakers, journalists, and digital creators.',
    summary: 'Supports creative projects that shift stereotypical narratives about Africa through music, film, audio, and digital media.',
    requirements: [
      'Narrative-Shift Concept & Target Audience Reach',
      'Creator Track Record & Past Work Links',
      'Distribution & Social Amplification Plan',
      'Milestone Budget Breakdown',
    ],
    apply_url: 'https://africanofilter.org/grants',
  },
  {
    id: 'grant-tef-entrepreneurship',
    title: 'Tony Elumelu Foundation Entrepreneurship Programme',
    funder: 'Tony Elumelu Foundation',
    category: 'Business & SME',
    region: 'Africa',
    amount: '$5,000 Non-Refundable Seed Capital',
    recommended_ask: '$5,000',
    deadline: 'Annual (Q1)',
    review_timeline: '8–10 weeks + mentorship cohort',
    program_email: 'enquiries@tonyelumelufoundation.org',
    eligibility: 'African entrepreneurs with early-stage businesses (0–3 years) across creative, tech, or commercial sectors.',
    summary: 'Provides business training, mentorship, and $5,000 non-refundable seed funding to scale African startups.',
    requirements: [
      'Problem Statement & Scalable Business Solution',
      'Target Market & Customer Acquisition Plan',
      '$5,000 Seed Capital Deployment Breakdown',
      'Job Creation & SDG Impact Projections',
    ],
    apply_url: 'https://www.tefconnect.com',
  },
  {
    id: 'grant-music-in-africa',
    title: 'Music In Africa — Sound Connects Fund',
    funder: 'Music In Africa Foundation',
    category: 'Music & Audio',
    region: 'Africa',
    amount: '€15,000 – €80,000',
    recommended_ask: '€35,000',
    deadline: 'Annual',
    review_timeline: '6–10 weeks panel evaluation',
    program_email: 'scf@musicinafrica.net',
    eligibility: 'Music hubs, labels, studios, and industry organizations across Southern & East Africa.',
    summary: 'Accelerates music infrastructure, studio access, distribution capacity, and artist career development.',
    requirements: [
      'Organizational Capacity & Music Ecosystem Track Record',
      'Program Implementation & Beneficiary Targets',
      'Detailed Multi-Line Euro Budget',
      'Monitoring, Evaluation & Sustainability Plan',
    ],
    apply_url: 'https://www.musicinafrica.net',
  },
];

function buildInstantClientPrefill(grant, user) {
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Lead Applicant';
  const entity = user?.brand_name || fullName;
  const email = user?.email || '';
  const phone = user?.phone || '';
  const ask = grant.recommended_ask || grant.amount || '$5,000';
  const reqs = grant.requirements || [
    'Executive Summary & Project Concept',
    'Applicant Bio & Portfolio Link',
    'Itemized Budget Breakdown',
    'Implementation & Impact Timeline',
  ];
  const projectName = `${entity} — ${grant.category} Growth & Impact Initiative`;
  const summary =
    `${user?.bio || `${entity} is an independent ${grant.category.toLowerCase()} initiative led by ${fullName}.`} ` +
    `Directly aligned with ${grant.funder} eligibility: ${grant.eligibility}`;
  const fundingUse =
    `Requested Grant (${ask}):\n` +
    `• 45% — Core Production, Studio/Technical Execution & Local Talent Fees\n` +
    `• 25% — Distribution, Marketing, Showcase & Audience Reach\n` +
    `• 20% — Operations, Equipment / Tooling & Community Capacity\n` +
    `• 10% — Monitoring, Evaluation & Funder Impact Reporting`;
  const timeline =
    `Aligned with ${grant.funder} (${grant.deadline} · ${grant.review_timeline || '6–8 weeks review'}):\n` +
    `• Month 1–2: Pre-production, partner onboarding, and resource mobilization.\n` +
    `• Month 3–4: Core creative/business execution and mid-point deliverable review.\n` +
    `• Month 5–6: Public launch, audience distribution, and final impact report to ${grant.funder}.`;

  const proposal =
    `OFFICIAL GRANT PROPOSAL — ${grant.title.toUpperCase()}\n` +
    `Submitted To: ${grant.funder} (${grant.region} · ${grant.amount})\n` +
    `Project Title: ${projectName}\n` +
    `Applicant: ${entity} (${fullName})\n` +
    `Contact: ${email}${phone ? ' · ' + phone : ''}\n` +
    `Requested Amount: ${ask}\n` +
    `${'='.repeat(64)}\n\n` +
    `1. EXECUTIVE SUMMARY\n${projectName} advances ${grant.summary}\n\n` +
    `2. APPLICANT TRACK RECORD & ELIGIBILITY\n${summary}\n\n` +
    `3. IMPLEMENTATION TIMELINE & MILESTONES\n${timeline}\n\n` +
    `4. BUDGET & USE OF FUNDS (${ask})\n${fundingUse}\n\n` +
    `5. MEASURABLE IMPACT\n• Verifiable audience reach, local creative jobs, and transparent post-grant reporting.\n`;

  return {
    grant_id: grant.id,
    grant_title: grant.title,
    funder: grant.funder,
    project_name: projectName,
    applicant_name: entity,
    applicant_email: email,
    applicant_phone: phone,
    portfolio_url: 'https://intermaven.io',
    requested_amount: ask,
    recipient_email: grant.program_email || '',
    applicant_summary: summary,
    funding_use: fundingUse,
    timeline_milestones: timeline,
    checklist: reqs.map(r => ({ label: r, completed: true })),
    proposal,
    known_sources: ['User Profile', 'Grant Requirements & Timeline'],
    external_confirmation_ref: '',
    notify_whatsapp: Boolean(phone),
    sync_to_crm: true,
  };
}

export default function GrantFinder() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;

  // Main View Toggle: 'discover' | 'tracker'
  const [viewMode, setViewMode] = useState('discover');

  // Discover State
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  // Applications Pipeline State
  const [applications, setApplications] = useState([]);
  const [stageCounts, setStageCounts] = useState({});
  const [trackerFilterStage, setTrackerFilterStage] = useState('all');

  // Maven AI Smart Composer Modal State
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeGrant, setActiveGrant] = useState(null);
  const [form, setForm] = useState(null);
  const [hydratingAi, setHydratingAi] = useState(false);
  const [regeneratingAi, setRegeneratingAi] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(null);
  const [customAiFocus, setCustomAiFocus] = useState('');

  // Active Tracked Application Detail & Comms Modal State
  const [activeApp, setActiveApp] = useState(null);
  const [commsChannel, setCommsChannel] = useState('email'); // 'email' | 'whatsapp' | 'sms' | 'inbound_log'
  const [commsRecipient, setCommsRecipient] = useState('');
  const [commsSubject, setCommsSubject] = useState('');
  const [commsBody, setCommsBody] = useState('');
  const [sendingComms, setSendingComms] = useState(false);
  const [draftingCommsAi, setDraftingCommsAi] = useState(false);

  const loadGrantsAndApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (region !== 'all') params.set('region', region);
      if (search.trim()) params.set('search', search.trim());
      if (savedOnly) params.set('saved_only', 'true');

      const [grantsRes, appsRes] = await Promise.all([
        api.get(`/api/grants?${params.toString()}`),
        api.get('/api/grants/applications').catch(() => ({ data: { applications: [], counts: {} } })),
      ]);
      setGrants(Array.isArray(grantsRes.data?.grants) ? grantsRes.data.grants : FALLBACK_GRANTS);
      setApplications(appsRes.data?.applications || []);
      setStageCounts(appsRes.data?.counts || {});
    } catch {
      setGrants(FALLBACK_GRANTS);
    } finally {
      setLoading(false);
    }
  }, [category, region, search, savedOnly]);

  useEffect(() => {
    const t = setTimeout(loadGrantsAndApps, 160);
    return () => clearTimeout(t);
  }, [loadGrantsAndApps]);

  const handleBookmark = async (grant) => {
    try {
      const res = await api.post(`/api/grants/${grant.id}/bookmark`);
      const next = !!res.data?.is_bookmarked;
      setGrants(prev => prev.map(g => (g.id === grant.id ? { ...g, is_bookmarked: next } : g)));
      toastRef.current?.(next ? 'Saved' : 'Removed', next ? 'Grant bookmarked' : 'Removed from saved grants', 'success');
    } catch {
      setGrants(prev => prev.map(g => (g.id === grant.id ? { ...g, is_bookmarked: !g.is_bookmarked } : g)));
    }
  };

  // Opens Composer IMMEDIATELY pre-filled by Maven AI from User + Business Profile + Brand Kit + EPK + Grant Specs
  const handleOpenComposer = async (grant) => {
    setActiveGrant(grant);
    setCustomAiFocus('');
    setForm(buildInstantClientPrefill(grant, user));
    setComposerOpen(true);
    setHydratingAi(true);
    try {
      const res = await api.post(`/api/grants/${grant.id}/prefill`, { regenerate_with_ai: false });
      if (res.data?.prefill) {
        setForm(prev => ({
          ...prev,
          ...res.data.prefill,
          notify_whatsapp: Boolean(res.data.prefill.applicant_phone || user?.phone),
          sync_to_crm: true,
        }));
      }
    } catch {
      // Instant client prefill already populated cleanly
    } finally {
      setHydratingAi(false);
    }
  };

  const handleRegenerateWithMavenAi = async () => {
    if (!activeGrant || !form) return;
    setRegeneratingAi(true);
    try {
      const res = await api.post(`/api/grants/${activeGrant.id}/prefill`, {
        regenerate_with_ai: true,
        custom_focus: customAiFocus,
      });
      if (res.data?.prefill) {
        setForm(prev => ({
          ...prev,
          ...res.data.prefill,
          recipient_email: prev.recipient_email || res.data.prefill.recipient_email,
        }));
        toastRef.current?.('Maven AI Refined', 'Proposal tailored to your profile & grant requirements.', 'success');
      }
    } catch {
      toastRef.current?.('Refinement Error', 'Could not reach Maven AI right now.', 'error');
    } finally {
      setRegeneratingAi(false);
    }
  };

  const handleSaveOrSubmit = async (actionType) => {
    if (!activeGrant || !form?.project_name?.trim()) {
      toastRef.current?.('Missing Project Title', 'Please provide a project title.', 'error');
      return;
    }
    if (actionType === 'submit_email' && !form.recipient_email?.trim()) {
      toastRef.current?.('Recipient Email Needed', 'Enter the funder grants desk or recipient email.', 'error');
      return;
    }

    setSubmittingAction(actionType);
    try {
      if (actionType === 'submit_portal') {
        try {
          await navigator.clipboard.writeText(form.proposal || '');
        } catch {}
        if (activeGrant.apply_url) {
          window.open(activeGrant.apply_url, '_blank', 'noopener,noreferrer');
        }
      }

      const res = await api.post('/api/grants/applications', {
        grant_id: activeGrant.id,
        application_id: form.existing_application_id || form.id || null,
        action: actionType,
        project_name: form.project_name,
        applicant_name: form.applicant_name,
        applicant_email: form.applicant_email,
        applicant_phone: form.applicant_phone,
        portfolio_url: form.portfolio_url,
        requested_amount: form.requested_amount,
        recipient_email: form.recipient_email,
        applicant_summary: form.applicant_summary,
        funding_use: form.funding_use,
        timeline_milestones: form.timeline_milestones,
        checklist: form.checklist,
        proposal: form.proposal,
        external_confirmation_ref: form.external_confirmation_ref || '',
        notify_whatsapp: Boolean(form.notify_whatsapp),
        sync_to_crm: Boolean(form.sync_to_crm),
      });

      const savedApp = res.data?.application;
      await loadGrantsAndApps();
      setComposerOpen(false);

      if (actionType === 'save_draft') {
        toastRef.current?.('Draft Saved', `Saved "${savedApp.project_name}" (${savedApp.tracking_ref})`, 'success');
      } else if (actionType === 'submit_email') {
        toastRef.current?.(
          'Grant Package Dispatched!',
          `Tracking ID ${savedApp.tracking_ref} · Proposal sent & tracked in My Applications.`,
          'success'
        );
        setViewMode('tracker');
        openTrackerModal(savedApp);
      } else {
        toastRef.current?.(
          'Portal Opened & Tracked!',
          `Proposal copied to clipboard · Tracking ID ${savedApp.tracking_ref} active.`,
          'success'
        );
        setViewMode('tracker');
        openTrackerModal(savedApp);
      }
    } catch (err) {
      toastRef.current?.('Action Failed', err.response?.data?.detail || 'Could not save grant application', 'error');
    } finally {
      setSubmittingAction(null);
    }
  };

  const openTrackerModal = (appDoc) => {
    setActiveApp(appDoc);
    setCommsChannel('email');
    setCommsRecipient(appDoc.recipient_email || '');
    setCommsSubject(`Re: ${appDoc.project_name} (${appDoc.tracking_ref})`);
    setCommsBody('');
  };

  const handleStageUpdate = async (newStage) => {
    if (!activeApp) return;
    try {
      const res = await api.patch(`/api/grants/applications/${activeApp.id}`, { stage: newStage });
      const updated = res.data?.application;
      setActiveApp(updated);
      await loadGrantsAndApps();
      toastRef.current?.('Stage Updated', `Moved to ${STAGE_MAP[newStage]?.label || newStage}`, 'success');
    } catch {
      toastRef.current?.('Update Failed', 'Could not update application status', 'error');
    }
  };

  const handleSaveTrackingMeta = async () => {
    if (!activeApp) return;
    try {
      const res = await api.patch(`/api/grants/applications/${activeApp.id}`, {
        external_confirmation_ref: activeApp.external_confirmation_ref || '',
        next_followup_date: activeApp.next_followup_date || '',
        checklist: activeApp.checklist || [],
      });
      setActiveApp(res.data?.application);
      await loadGrantsAndApps();
      toastRef.current?.('Saved', 'Updated confirmation reference & follow-up schedule', 'success');
    } catch {
      toastRef.current?.('Error', 'Could not save tracking details', 'error');
    }
  };

  const handleAiDraftComms = async (templateKey) => {
    if (!activeApp) return;
    setDraftingCommsAi(true);
    try {
      const res = await api.post(`/api/grants/applications/${activeApp.id}/ai-message`, { template: templateKey });
      if (res.data?.subject) setCommsSubject(res.data.subject);
      if (res.data?.body) setCommsBody(res.data.body);
      toastRef.current?.('Maven AI Draft Ready', 'Review and send when ready.', 'success');
    } catch {
      toastRef.current?.('Error', 'Could not draft message', 'error');
    } finally {
      setDraftingCommsAi(false);
    }
  };

  const handleSendOrLogComms = async (e) => {
    e.preventDefault();
    if (!activeApp || !commsBody.trim()) {
      toastRef.current?.('Empty Message', 'Write or generate a message first.', 'error');
      return;
    }
    setSendingComms(true);
    try {
      const res = await api.post(`/api/grants/applications/${activeApp.id}/communicate`, {
        channel: commsChannel,
        recipient: commsRecipient,
        subject: commsSubject,
        body: commsBody,
      });
      setActiveApp(res.data?.application);
      setCommsBody('');
      await loadGrantsAndApps();
      toastRef.current?.(
        commsChannel === 'inbound_log' ? 'Funder Update Logged' : 'Message Dispatched',
        commsChannel === 'inbound_log'
          ? 'Added to application communication history.'
          : `Sent via ${commsChannel.toUpperCase()} and logged to timeline.`,
        'success'
      );
    } catch (err) {
      toastRef.current?.('Comms Error', err.response?.data?.detail || 'Could not send message', 'error');
    } finally {
      setSendingComms(false);
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm('Remove this grant application from your tracker?')) return;
    try {
      await api.delete(`/api/grants/applications/${appId}`);
      if (activeApp?.id === appId) setActiveApp(null);
      await loadGrantsAndApps();
      toastRef.current?.('Removed', 'Application removed from tracker', 'success');
    } catch {
      toastRef.current?.('Error', 'Could not delete application', 'error');
    }
  };

  const downloadProposalTxt = (title, text) => {
    const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'grant-proposal').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredApps =
    trackerFilterStage === 'all'
      ? applications
      : applications.filter(a => a.stage === trackerFilterStage);

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header + Primary Mode Switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
            <Library size={22} color="#34d399" />
            Grant Finder, Submission & Pipeline Tracker
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Maven AI pre-fills proposals from your profile & grant timelines — submit packages, track review stages, and manage funder communications in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setViewMode('discover')}
            style={{
              padding: '9px 16px',
              borderRadius: '4px',
              border: viewMode === 'discover' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
              background: viewMode === 'discover' ? '#10b981' : '#1e293b',
              color: viewMode === 'discover' ? '#022c22' : '#cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Discover Grants ({grants.length})
          </button>

          <button
            type="button"
            onClick={() => setViewMode('tracker')}
            style={{
              padding: '9px 16px',
              borderRadius: '4px',
              border: viewMode === 'tracker' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
              background: viewMode === 'tracker' ? '#38bdf8' : '#1e293b',
              color: viewMode === 'tracker' ? '#082f49' : '#cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle size={15} /> My Applications & Comms ({applications.length})
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 1: DISCOVER GRANTS
         ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'discover' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${category === c ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                    background: category === c ? 'rgba(16, 185, 129, 0.16)' : '#1e293b',
                    color: category === c ? '#34d399' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c === 'all' ? 'All Categories' : c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSavedOnly(!savedOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '4px',
                border: `1px solid ${savedOnly ? '#34d399' : 'rgba(255,255,255,0.12)'}`,
                background: savedOnly ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                color: savedOnly ? '#34d399' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={13} fill={savedOnly ? '#34d399' : 'none'} /> Saved
            </button>

            <select value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle}>
              {REGIONS.map((r) => <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>)}
            </select>

            <div style={{ position: 'relative', minWidth: '210px' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search grants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '30px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '6px' }}>
              Loading grant opportunities...
            </div>
          ) : grants.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '6px' }}>
              No grants match your current filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {grants.map((g) => {
                const appSt = g.application_status ? STAGE_MAP[g.application_status] : null;
                return (
                  <div key={g.id} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#22d3ee' }}>
                          {g.category} · {g.region}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {appSt && (
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, background: appSt.bg, color: appSt.color }}>
                              {appSt.label}
                            </span>
                          )}
                          <button type="button" onClick={() => handleBookmark(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: g.is_bookmarked ? '#34d399' : '#64748b', padding: 0 }}>
                            <Bookmark size={16} fill={g.is_bookmarked ? '#34d399' : 'none'} />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{g.title}</div>
                      <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>
                        {g.amount} · Deadline: {g.deadline}
                      </div>
                      {g.review_timeline && (
                        <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={12} /> Review Cycle: {g.review_timeline}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '8px' }}>{g.summary}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.45 }}>
                        <strong>Eligibility:</strong> {g.eligibility}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenComposer(g)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 13px', borderRadius: '4px', border: 'none', background: '#10b981', color: '#022c22', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                      >
                        <Sparkles size={14} /> {g.application_status ? 'Resume / Edit Application' : 'Apply with Maven AI'}
                      </button>

                      <a href={g.apply_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
                        Funder Info <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 2: MY APPLICATIONS & PIPELINE TRACKER
         ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'tracker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Visual Stage Filter Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setTrackerFilterStage('all')}
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                background: trackerFilterStage === 'all' ? 'rgba(16,185,129,0.16)' : '#1e293b',
                border: trackerFilterStage === 'all' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
              }}
            >
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>All Tracked</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{applications.length}</div>
            </button>

            {STAGES.map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setTrackerFilterStage(st.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: trackerFilterStage === st.id ? st.bg : '#1e293b',
                  border: trackerFilterStage === st.id ? `1px solid ${st.color}` : '1px solid rgba(255,255,255,0.08)',
                  color: '#f8fafc',
                }}
              >
                <div style={{ fontSize: '11px', color: st.color, fontWeight: 700, textTransform: 'uppercase' }}>{st.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{stageCounts[st.id] || 0}</div>
              </button>
            ))}
          </div>

          {filteredApps.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FileText size={34} color="#38bdf8" style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>No Grant Applications in This Stage Yet</div>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 16px' }}>
                Select any grant in Discover Grants — Maven AI will pre-fill your proposal so you can submit and track it here.
              </p>
              <button
                type="button"
                onClick={() => setViewMode('discover')}
                style={{ padding: '9px 16px', borderRadius: '4px', border: 'none', background: '#10b981', color: '#022c22', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Browse Grants →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredApps.map(app => {
                const st = STAGE_MAP[app.stage] || STAGE_MAP.draft;
                const commsCount = (app.communications || []).length;
                return (
                  <div key={app.id} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ flex: '1 1 340px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                          {app.tracking_ref}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>· {app.funder}</span>
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>{app.project_name}</div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{app.grant_title}</div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                        <span>Ask: <strong style={{ color: '#34d399' }}>{app.requested_amount || app.grant_amount_range}</strong></span>
                        <span>Next Follow-Up: <strong style={{ color: '#e2e8f0' }}>{app.next_followup_date || 'Not set'}</strong></span>
                        <span>Messages Logged: <strong style={{ color: '#38bdf8' }}>{commsCount}</strong></span>
                        {app.external_confirmation_ref && (
                          <span>Portal Ref: <strong style={{ color: '#c084fc' }}>{app.external_confirmation_ref}</strong></span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => openTrackerModal(app)}
                        style={{ padding: '8px 14px', borderRadius: '4px', border: 'none', background: '#38bdf8', color: '#082f49', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MessageSquare size={14} /> Track & Communicate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const gObj = grants.find(x => x.id === app.grant_id) || {
                            id: app.grant_id,
                            title: app.grant_title,
                            funder: app.funder,
                            amount: app.grant_amount_range,
                            deadline: app.grant_deadline,
                            review_timeline: app.review_timeline,
                            apply_url: app.apply_url,
                          };
                          setActiveGrant(gObj);
                          setForm({ ...app, existing_application_id: app.id, known_sources: ['Saved Application'] });
                          setComposerOpen(true);
                        }}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit Proposal
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.12)', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1: MAVEN AI PRE-FILLED GRANT COMPOSER & SUBMISSION STUDIO
         ════════════════════════════════════════════════════════════════════════ */}
      {composerOpen && activeGrant && form && (
        <div onClick={(e) => e.target === e.currentTarget && setComposerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '8px', maxWidth: '940px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(56,189,248,0.08))' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeGrant.funder} · {activeGrant.amount} · Deadline: {activeGrant.deadline}
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                  {activeGrant.title}
                </div>
              </div>
              <button type="button" onClick={() => setComposerOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Maven AI Auto-Fill Banner */}
              <div style={{ padding: '12px 14px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} />
                    {hydratingAi ? 'Syncing your Intermaven Profile & EPK...' : 'Auto-Populated by Maven AI'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                    Sources used: <strong>{(form.known_sources || ['User Profile']).join(' · ')}</strong> + {activeGrant.funder} requirements & timeline.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Optional angle (e.g. youth tour, studio gear)..."
                    value={customAiFocus}
                    onChange={e => setCustomAiFocus(e.target.value)}
                    style={{ ...inputStyle, fontSize: '12px', padding: '6px 10px', width: '220px' }}
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateWithMavenAi}
                    disabled={regeneratingAi}
                    style={{ padding: '7px 12px', borderRadius: '4px', border: '1px solid #a855f7', background: 'rgba(168,85,247,0.2)', color: '#e9d5ff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <RefreshCw size={12} /> {regeneratingAi ? 'Tailoring...' : 'Tailor with Maven AI'}
                  </button>
                </div>
              </div>

              {/* 2-Column Structured Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={lblStyle}>Project / Initiative Title *</label>
                  <input style={fullInp} value={form.project_name || ''} onChange={e => setForm({ ...form, project_name: e.target.value })} />
                </div>
                <div>
                  <label style={lblStyle}>Applicant / Brand / Artist Name</label>
                  <input style={fullInp} value={form.applicant_name || ''} onChange={e => setForm({ ...form, applicant_name: e.target.value })} />
                </div>
                <div>
                  <label style={lblStyle}>Requested Grant Amount</label>
                  <input style={fullInp} value={form.requested_amount || ''} onChange={e => setForm({ ...form, requested_amount: e.target.value })} />
                </div>
                <div>
                  <label style={lblStyle}>Funder Grants Desk / Recipient Email</label>
                  <input style={fullInp} placeholder="grants@funder.org" value={form.recipient_email || ''} onChange={e => setForm({ ...form, recipient_email: e.target.value })} />
                </div>
                <div>
                  <label style={lblStyle}>Your Reply-To Email</label>
                  <input style={fullInp} value={form.applicant_email || ''} onChange={e => setForm({ ...form, applicant_email: e.target.value })} />
                </div>
                <div>
                  <label style={lblStyle}>Portfolio / EPK / Website URL</label>
                  <input style={fullInp} value={form.portfolio_url || ''} onChange={e => setForm({ ...form, portfolio_url: e.target.value })} />
                </div>
              </div>

              {/* Requirements Checklist + Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckSquare size={13} /> {activeGrant.funder} Requirements Checklist
                  </div>
                  {(form.checklist || []).map((item, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(item.completed)}
                        onChange={e => {
                          const next = [...(form.checklist || [])];
                          next[idx] = { ...next[idx], completed: e.target.checked };
                          setForm({ ...form, checklist: next });
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label style={lblStyle}>Implementation Timeline & Milestones</label>
                  <textarea rows={5} style={fullInp} value={form.timeline_milestones || ''} onChange={e => setForm({ ...form, timeline_milestones: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={lblStyle}>Applicant Summary & Eligibility Match</label>
                  <textarea rows={3} style={fullInp} value={form.applicant_summary || ''} onChange={e => setForm({ ...form, applicant_summary: e.target.value })} />
                </div>
                <div>
                  <label style={lblStyle}>Budget Breakdown & Use of Funds</label>
                  <textarea rows={3} style={fullInp} value={form.funding_use || ''} onChange={e => setForm({ ...form, funding_use: e.target.value })} />
                </div>
              </div>

              {/* Full Submission-Ready Proposal Document */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ ...lblStyle, marginBottom: 0 }}>Complete Grant Proposal Package (Editable)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(form.proposal || ''); toastRef.current?.('Copied', 'Proposal copied to clipboard', 'success'); }}
                      style={secBtnStyle}
                    >
                      <Copy size={12} /> Copy Text
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadProposalTxt(form.project_name, form.proposal)}
                      style={secBtnStyle}
                    >
                      <Download size={12} /> Download .txt
                    </button>
                  </div>
                </div>
                <textarea
                  rows={11}
                  value={form.proposal || ''}
                  onChange={e => setForm({ ...form, proposal: e.target.value })}
                  style={{ ...fullInp, fontFamily: 'monospace', lineHeight: 1.55 }}
                />
              </div>

              {/* Communication Protocol Options */}
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '12px', color: '#cbd5e1', background: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={Boolean(form.sync_to_crm)} onChange={e => setForm({ ...form, sync_to_crm: e.target.checked })} />
                  Sync funder contact to Smart CRM
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={Boolean(form.notify_whatsapp)} onChange={e => setForm({ ...form, notify_whatsapp: e.target.checked })} />
                  Send WhatsApp submission alert to my phone
                </label>
              </div>
            </div>

            {/* Action Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#090d16', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSaveOrSubmit('save_draft')}
                disabled={Boolean(submittingAction)}
                style={{ padding: '9px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.16)', background: '#1e293b', color: '#e2e8f0', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                {submittingAction === 'save_draft' ? 'Saving...' : 'Save as Draft'}
              </button>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleSaveOrSubmit('submit_portal')}
                  disabled={Boolean(submittingAction)}
                  style={{ padding: '9px 15px', borderRadius: '4px', border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.16)', color: '#38bdf8', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} />
                  {submittingAction === 'submit_portal' ? 'Opening...' : 'Copy, Open Portal & Track'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveOrSubmit('submit_email')}
                  disabled={Boolean(submittingAction)}
                  style={{ padding: '9px 16px', borderRadius: '4px', border: 'none', background: '#10b981', color: '#022c22', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  {submittingAction === 'submit_email' ? 'Submitting...' : 'Submit Email Packet & Track'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2: APPLICATION PROGRESS TRACKER & MULTI-CHANNEL COMMS STUDIO
         ════════════════════════════════════════════════════════════════════════ */}
      {activeApp && (
        <div onClick={(e) => e.target === e.currentTarget && setActiveApp(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.84)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1150, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '8px', maxWidth: '920px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}>
                  {activeApp.tracking_ref} · {activeApp.funder}
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                  {activeApp.project_name}
                </div>
              </div>
              <button type="button" onClick={() => setActiveApp(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Interactive Stage Pipeline Stepper */}
              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Application Stage (Click any stage to update status)
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {STAGES.map((st, i) => {
                    const isCurrent = activeApp.stage === st.id;
                    return (
                      <React.Fragment key={st.id}>
                        <button
                          type="button"
                          onClick={() => handleStageUpdate(st.id)}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: isCurrent ? `1px solid ${st.color}` : '1px solid rgba(255,255,255,0.1)',
                            background: isCurrent ? st.bg : 'rgba(15,23,42,0.7)',
                            color: isCurrent ? st.color : '#94a3b8',
                          }}
                        >
                          {st.label}
                        </button>
                        {i < STAGES.length - 2 && <ArrowRight size={13} color="#475569" style={{ alignSelf: 'center' }} />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Portal Confirmation Ref + Next Follow-up Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={lblStyle}>External Portal Confirmation #</label>
                    <input
                      style={fullInp}
                      placeholder="e.g. BC-2026-88412"
                      value={activeApp.external_confirmation_ref || ''}
                      onChange={e => setActiveApp({ ...activeApp, external_confirmation_ref: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={lblStyle}>Next Follow-Up Reminder Date</label>
                    <input
                      type="date"
                      style={fullInp}
                      value={activeApp.next_followup_date || ''}
                      onChange={e => setActiveApp({ ...activeApp, next_followup_date: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={handleSaveTrackingMeta} style={{ padding: '8px 14px', borderRadius: '4px', border: 'none', background: '#10b981', color: '#022c22', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                      Save Tracking Info
                    </button>
                    {activeApp.apply_url && (
                      <a href={activeApp.apply_url} target="_blank" rel="noreferrer" style={{ ...secBtnStyle, textDecoration: 'none', padding: '8px 12px' }}>
                        Portal <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-Channel Communications Composer */}
              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.22)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={15} color="#38bdf8" /> Communication & Follow-Up Hub
                  </div>

                  {/* 1-Click Maven AI Message Templates */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'status_followup', label: '✨ Status Check-In' },
                      { id: 'clarification_reply', label: '✨ Answer Query' },
                      { id: 'accept_award', label: '✨ Accept Award' },
                      { id: 'impact_report', label: '✨ Impact Report' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={draftingCommsAi}
                        onClick={() => handleAiDraftComms(t.id)}
                        style={{ padding: '4px 9px', borderRadius: '4px', border: '1px solid rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.14)', color: '#e9d5ff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'email', label: '📧 Email Funder' },
                    { id: 'whatsapp', label: '💬 WhatsApp' },
                    { id: 'sms', label: '📱 SMS' },
                    { id: 'inbound_log', label: '📥 Log Funder Reply / Note' },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setCommsChannel(ch.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: commsChannel === ch.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        background: commsChannel === ch.id ? 'rgba(56,189,248,0.18)' : '#0f172a',
                        color: commsChannel === ch.id ? '#38bdf8' : '#94a3b8',
                      }}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendOrLogComms} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {commsChannel !== 'inbound_log' && (
                    <div style={{ display: 'grid', gridTemplateColumns: commsChannel === 'email' ? '1fr 1fr' : '1fr', gap: '8px' }}>
                      <input
                        style={fullInp}
                        placeholder={commsChannel === 'email' ? 'Recipient Email (e.g. grants@funder.org)' : 'Phone Number (+254...)'}
                        value={commsRecipient}
                        onChange={e => setCommsRecipient(e.target.value)}
                      />
                      {commsChannel === 'email' && (
                        <input
                          style={fullInp}
                          placeholder="Email Subject"
                          value={commsSubject}
                          onChange={e => setCommsSubject(e.target.value)}
                        />
                      )}
                    </div>
                  )}

                  <textarea
                    rows={4}
                    style={fullInp}
                    placeholder={
                      commsChannel === 'inbound_log'
                        ? 'Paste email reply, interview invite, or feedback received from the funder...'
                        : 'Write your message or click a Maven AI quick-draft button above...'
                    }
                    value={commsBody}
                    onChange={e => setCommsBody(e.target.value)}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    {commsChannel === 'whatsapp' && commsBody.trim() ? (
                      <a
                        href={`https://wa.me/${(commsRecipient || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(commsBody)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '12px', color: '#34d399', textDecoration: 'none', fontWeight: 700 }}
                      >
                        Open directly in WhatsApp Web ↗
                      </a>
                    ) : <span />}

                    <button
                      type="submit"
                      disabled={sendingComms}
                      style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#38bdf8', color: '#082f49', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={13} />
                      {sendingComms ? 'Processing...' : commsChannel === 'inbound_log' ? 'Save Funder Reply to Log' : `Send via ${commsChannel.toUpperCase()}`}
                    </button>
                  </div>
                </form>
              </div>

              {/* Chronological Communications & Activity Log */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
                    Message History ({(activeApp.communications || []).length})
                  </div>
                  {(activeApp.communications || []).length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#64748b' }}>No messages sent or logged yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {[...(activeApp.communications || [])].reverse().map(m => (
                        <div key={m.id} style={{ padding: '10px', borderRadius: '4px', background: '#0f172a', borderLeft: `3px solid ${m.direction === 'inbound' ? '#c084fc' : '#34d399'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                            <strong style={{ color: m.direction === 'inbound' ? '#c084fc' : '#34d399', textTransform: 'uppercase' }}>
                              {m.direction === 'inbound' ? 'Inbound Funder Reply' : `Outbound ${m.channel}`}
                            </strong>
                            <span>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                          </div>
                          {m.subject && <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '3px' }}>{m.subject}</div>}
                          <div style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{m.body.slice(0, 280)}{m.body.length > 280 ? '...' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#34d399" /> Audit & Stage Timeline
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {[...(activeApp.timeline_events || [])].reverse().map((ev, idx) => (
                      <div key={idx} style={{ fontSize: '11px', padding: '8px 10px', background: '#0f172a', borderRadius: '4px' }}>
                        <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{ev.event}</div>
                        <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
                          {ev.at ? new Date(ev.at).toLocaleString() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lblStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  marginBottom: '5px',
};

const inputStyle = {
  padding: '8px 10px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '13px',
};

const fullInp = {
  ...inputStyle,
  width: '100%',
  boxSizing: 'border-box',
};

const secBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 10px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: '#1e293b',
  color: '#e2e8f0',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
};
