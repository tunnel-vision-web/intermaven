import React from 'react';

// Centralized flat color icon system for Intermaven (frontend & dashboard).
// Every app and tool renders a crisp flat color badge with a two-tone vector glyph.

export const APP_ICON_META = {
  brandkit:  { bg: '#10b981', fg: '#ffffff', accent: '#a7f3d0', label: 'Brand Kit AI' },
  musicbio:  { bg: '#06b6d4', fg: '#ffffff', accent: '#a5f3fc', label: 'EPK & Music Bio' },
  epk:       { bg: '#06b6d4', fg: '#ffffff', accent: '#a5f3fc', label: 'EPK Builder' },
  social:    { bg: '#f43f5e', fg: '#ffffff', accent: '#fecdd3', label: 'Social AI' },
  syncpitch: { bg: '#f59e0b', fg: '#ffffff', accent: '#fde68a', label: 'Sync Pitch AI' },
  bizpitch:  { bg: '#8b5cf6', fg: '#ffffff', accent: '#ddd6fe', label: 'Pitch Deck AI' },
  pitchdeck: { bg: '#8b5cf6', fg: '#ffffff', accent: '#ddd6fe', label: 'Pitch Deck AI' },
  pos:       { bg: '#0ea5e9', fg: '#ffffff', accent: '#bae6fd', label: 'Intermaven POS' },
  distro:    { bg: '#14b8a6', fg: '#ffffff', accent: '#99f6e4', label: 'Distribution Tracker' },
  hosting:   { bg: '#22c55e', fg: '#ffffff', accent: '#bbf7d0', label: 'Hosting Manager' },
  crm:       { bg: '#3b82f6', fg: '#ffffff', accent: '#bfdbfe', label: 'Smart CRM & Reachout' },
  files:     { bg: '#6366f1', fg: '#ffffff', accent: '#c7d2fe', label: 'File Manager' },
  channels:  { bg: '#ec4899', fg: '#ffffff', accent: '#fbcfe8', label: 'Channels' },
  wizard:    { bg: '#00c8ff', fg: '#061224', accent: '#ffffff', label: 'Business Wizard' },
  strategy:  { bg: '#eab308', fg: '#ffffff', accent: '#fef08a', label: 'Strategy' },
  admin:     { bg: '#ef4444', fg: '#ffffff', accent: '#fecaca', label: 'Admin Console' },
  settings:  { bg: '#64748b', fg: '#ffffff', accent: '#cbd5e1', label: 'Settings' },
  help:      { bg: '#0ea5e9', fg: '#ffffff', accent: '#bae6fd', label: 'Get Help' },
  maven:     { bg: '#22d3ee', fg: '#061224', accent: '#ffffff', label: 'Maven AI' },
  ai:        { bg: '#a855f7', fg: '#ffffff', accent: '#e9d5ff', label: 'Ask AI' },
  overview:  { bg: '#0284c7', fg: '#ffffff', accent: '#bae6fd', label: 'Overview' },
  invoicing: { bg: '#059669', fg: '#ffffff', accent: '#a7f3d0', label: 'Invoicing' },
  contracts: { bg: '#7c3aed', fg: '#ffffff', accent: '#ddd6fe', label: 'Contracts' },
};

function renderGlyph(name, fg, accent) {
  switch (name) {
    case 'brandkit':
      return (
        <>
          <circle cx="12" cy="12" r="8" fill={accent} opacity="0.28" />
          <path d="M12 4a8 8 0 0 0 0 16c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 3-9 8 8 0 0 0-8-.8z" fill={fg} />
          <circle cx="8.5" cy="10.5" r="1.3" fill="#10b981" />
          <circle cx="11.5" cy="7.5" r="1.3" fill="#f59e0b" />
          <circle cx="15.5" cy="9.5" r="1.3" fill="#f43f5e" />
        </>
      );
    case 'musicbio':
    case 'epk':
      return (
        <>
          <path d="M9 17V6l10-2v11" stroke={fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="6.5" cy="17.5" r="2.8" fill={fg} />
          <circle cx="16.5" cy="15.5" r="2.8" fill={accent} />
        </>
      );
    case 'social':
      return (
        <>
          <line x1="8.5" y1="12" x2="15.5" y2="7.5" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="8.5" y1="12" x2="15.5" y2="16.5" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="17" cy="6.5" r="3" fill={fg} />
          <circle cx="6.5" cy="12" r="3" fill={fg} />
          <circle cx="17" cy="17.5" r="3" fill={accent} />
        </>
      );
    case 'syncpitch':
      return (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2.5" fill={fg} />
          <polygon points="10,9 16,12 10,15" fill="#f59e0b" />
          <rect x="6" y="7" width="2" height="2" fill={accent} />
          <rect x="6" y="15" width="2" height="2" fill={accent} />
        </>
      );
    case 'bizpitch':
    case 'pitchdeck':
      return (
        <>
          <rect x="4" y="4" width="16" height="12" rx="2" fill={fg} />
          <path d="M8 12l3-3 2.5 2 3-3.5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M12 16v4M8.5 20h7" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case 'pos':
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2.5" fill={fg} />
          <rect x="3" y="9" width="18" height="3" fill="#0284c7" />
          <rect x="6" y="14" width="5" height="2" rx="1" fill={accent} />
        </>
      );
    case 'distro':
      return (
        <>
          <circle cx="12" cy="12" r="8" fill={accent} opacity="0.25" />
          <path d="M4 12h3.5l2-4.5 3.5 9 2.5-5.5 1.5 1H20" stroke={fg} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case 'hosting':
      return (
        <>
          <circle cx="12" cy="12" r="7.5" stroke={fg} strokeWidth="2" fill={accent} fillOpacity="0.22" />
          <ellipse cx="12" cy="12" rx="3.5" ry="7.5" stroke={fg} strokeWidth="1.8" fill="none" />
          <line x1="4.5" y1="12" x2="19.5" y2="12" stroke={fg} strokeWidth="1.8" />
        </>
      );
    case 'crm':
      return (
        <>
          <circle cx="9.5" cy="9" r="3.2" fill={fg} />
          <path d="M4 18.5c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5" fill={fg} />
          <circle cx="16.5" cy="10" r="2.4" fill={accent} />
          <path d="M15.5 18.5h4.5c0-2.1-1.5-3.5-3.5-3.8" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      );
    case 'files':
      return (
        <>
          <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10z" fill={fg} />
          <rect x="6.5" y="11" width="11" height="2" rx="1" fill={accent} />
        </>
      );
    case 'channels':
      return (
        <>
          <rect x="4" y="5" width="16" height="11" rx="2.5" fill={fg} />
          <polygon points="9,16 12,20 15,16" fill={fg} />
          <circle cx="9" cy="10.5" r="1.2" fill="#ec4899" />
          <circle cx="12" cy="10.5" r="1.2" fill="#ec4899" />
          <circle cx="15" cy="10.5" r="1.2" fill="#ec4899" />
        </>
      );
    case 'wizard':
    case 'ai':
    case 'maven':
      return (
        <>
          <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z" fill={fg} />
          <circle cx="18.5" cy="5.5" r="1.5" fill={accent} />
        </>
      );
    case 'admin':
      return (
        <>
          <path d="M12 3l7 3v5.5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3z" fill={fg} />
          <path d="M9.5 12l1.8 1.8 3.5-3.6" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case 'settings':
      return (
        <>
          <circle cx="12" cy="12" r="7" fill={accent} opacity="0.28" />
          <circle cx="12" cy="12" r="3.2" stroke={fg} strokeWidth="2.4" fill="none" />
          <path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.3 6.3l1.6 1.6M16.1 16.1l1.6 1.6M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'help':
      return (
        <>
          <circle cx="12" cy="12" r="8" fill={fg} />
          <path d="M9.8 9.4a2.3 2.3 0 0 1 4.4.8c0 1.5-2.2 2-2.2 3.3" stroke="#0ea5e9" strokeWidth="2.1" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="16.5" r="1.2" fill="#0ea5e9" />
        </>
      );
    case 'invoicing':
    case 'contracts':
      return (
        <>
          <rect x="5" y="3.5" width="14" height="17" rx="2" fill={fg} />
          <line x1="8" y1="8.5" x2="16" y2="8.5" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="12.5" x2="16" y2="12.5" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="16.5" x2="13" y2="16.5" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.8" fill={fg} />
          <rect x="13" y="4" width="7" height="7" rx="1.8" fill={accent} />
          <rect x="4" y="13" width="7" height="7" rx="1.8" fill={accent} />
          <rect x="13" y="13" width="7" height="7" rx="1.8" fill={fg} />
        </>
      );
  }
}

export const FlatIcon = ({ name, size = 28, color, className = '' }) => {
  const meta = APP_ICON_META[name] || APP_ICON_META.overview;
  const bg = color || meta.bg;
  const radius = Math.max(6, Math.round(size * 0.24));

  return (
    <span
      className={`flat-color-icon ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        minWidth: size,
        borderRadius: radius,
        background: bg,
        boxShadow: `0 4px 12px ${bg}33`,
      }}
    >
      <svg
        width={Math.round(size * 0.66)}
        height={Math.round(size * 0.66)}
        viewBox="0 0 24 24"
        fill="none"
      >
        {renderGlyph(name, meta.fg, meta.accent)}
      </svg>
    </span>
  );
};

export default FlatIcon;
