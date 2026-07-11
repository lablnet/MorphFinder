import React from 'react';
import { GitBranch, AlertCircle, Box, Tag, RefreshCw } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { DevPanelInfo, ProjectType } from '@shared/types/devPanel';

// ---------------------------------------------------------------------------
// Per-project-type metadata: display label, badge colours, and icon emoji.
// Add new entries here when the ProjectType union gains a new member.
// ---------------------------------------------------------------------------

interface ProjectTypeConfig {
  label: string;
  color: string;   // Tailwind classes for the badge
  icon: string;    // emoji or short text rendered inside the avatar square
}

export const PROJECT_TYPE_CONFIG: Record<ProjectType, ProjectTypeConfig> = {
  // JS / TS ecosystem
  node: {
    label: 'Node.js',
    color: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20',
    icon: '⬢',
  },
  typescript: {
    label: 'TypeScript',
    color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: 'TS',
  },
  electron: {
    label: 'Electron',
    color: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20',
    icon: '⚡',
  },
  'react-native': {
    label: 'React Native',
    color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    icon: '⚛',
  },

  // Mobile / Cross-platform
  flutter: {
    label: 'Flutter',
    color: 'bg-blue-400/15 text-blue-600 dark:text-blue-300 border-blue-400/20',
    icon: '🐦',
  },
  dart: {
    label: 'Dart',
    color: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/20',
    icon: '🎯',
  },
  android: {
    label: 'Android',
    color: 'bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/20',
    icon: '🤖',
  },
  ios: {
    label: 'iOS',
    color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20',
    icon: '',
  },
  'macos-native': {
    label: 'macOS Native',
    color: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/20',
    icon: '',
  },

  // Systems / Backend
  rust: {
    label: 'Rust',
    color: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    icon: '🦀',
  },
  go: {
    label: 'Go',
    color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    icon: 'Go',
  },
  python: {
    label: 'Python',
    color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    icon: '🐍',
  },
  ruby: {
    label: 'Ruby',
    color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
    icon: '💎',
  },
  php: {
    label: 'PHP',
    color: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/20',
    icon: '🐘',
  },
  java: {
    label: 'Java',
    color: 'bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-600/20',
    icon: '☕',
  },
  kotlin: {
    label: 'Kotlin',
    color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20',
    icon: 'K',
  },
  swift: {
    label: 'Swift',
    color: 'bg-orange-400/15 text-orange-600 dark:text-orange-300 border-orange-400/20',
    icon: '🕊',
  },
  dotnet: {
    label: '.NET',
    color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    icon: '.N',
  },
  cpp: {
    label: 'C/C++',
    color: 'bg-blue-700/15 text-blue-800 dark:text-blue-300 border-blue-700/20',
    icon: 'C++',
  },
  unknown: {
    label: 'Unknown',
    color: 'bg-shell-sidebar border-shell-border text-current/60',
    icon: '?',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DevPanelHeaderProps {
  info: DevPanelInfo;
  onRefresh: () => void;
  loading: boolean;
}

export function DevPanelHeader({ info, onRefresh, loading }: DevPanelHeaderProps): React.JSX.Element {
  const typeConfig = PROJECT_TYPE_CONFIG[info.projectType];

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-shell-border p-4 bg-shell-surface/60 backdrop-blur-md gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {/* Project type avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent text-base font-bold select-none">
          {typeConfig.icon}
        </div>

        {/* Name + badges row */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-current truncate">
              {info.name ?? 'Unnamed Project'}
            </h2>
            {/* Project type badge */}
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                typeConfig.color
              )}
            >
              {typeConfig.label}
            </span>
            {/* Version tag */}
            {info.version && (
              <span className="inline-flex items-center gap-1 text-[10px] text-current/50 font-mono">
                <Tag size={10} />
                {info.version}
              </span>
            )}
            {/* License */}
            {info.license && (
              <span className="inline-flex items-center gap-1 text-[10px] text-current/50">
                <Box size={10} />
                {info.license}
              </span>
            )}
          </div>

          {/* Description */}
          {info.description && (
            <p className="text-xs text-current/50 mt-0.5 truncate">{info.description}</p>
          )}

          {/* Git branch pill */}
          {info.gitBranch && (
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border',
                  info.gitIsDirty
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                    : 'bg-shell-sidebar border-shell-border text-current/60'
                )}
              >
                <GitBranch size={10} />
                {info.gitBranch}
                {info.gitIsDirty && <AlertCircle size={10} className="ml-0.5" />}
              </span>
              {info.gitIsDirty && (
                <span className="text-[10px] text-yellow-600 dark:text-yellow-500">
                  uncommitted changes
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refresh button */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-shell text-current/50 hover:text-current hover:bg-shell-sidebar transition-colors disabled:opacity-30"
        title="Re-scan project"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
