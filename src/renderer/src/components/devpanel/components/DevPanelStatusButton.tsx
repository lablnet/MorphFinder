import React from 'react';
import { Code2 } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { ProjectType } from '@shared/types/devPanel';
import { PROJECT_TYPE_CONFIG } from './DevPanelHeader';

interface DevPanelStatusButtonProps {
  hasProject: boolean;
  projectType: ProjectType | null;
  projectName: string | null;
  /** Called when the user clicks the button — should navigate to DEV_PANEL_PATH. */
  onClick: () => void;
}

/**
 * A compact status-bar button that appears when the active directory contains
 * a recognised project manifest. Mirrors the style of the Terminal toggle and
 * the GitRadar branch chip.
 *
 * Reuses PROJECT_TYPE_CONFIG from DevPanelHeader so label/colour definitions
 * are never duplicated.
 */
export function DevPanelStatusButton({
  hasProject,
  projectType,
  projectName,
  onClick,
}: DevPanelStatusButtonProps): React.JSX.Element | null {
  if (!hasProject || projectType === null) return null;

  const config = PROJECT_TYPE_CONFIG[projectType];

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Open Dev Panel${projectName ? ` — ${projectName}` : ''} (${config.label})`}
      className={cn(
        'flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-shell-surface/60 transition-colors select-none cursor-pointer',
        // Extract just the text-colour class from the badge config so we don't
        // apply a full background in the slim status bar pill.
        projectType === 'node' && 'text-green-600 dark:text-green-400',
        projectType === 'typescript' && 'text-blue-600 dark:text-blue-400',
        projectType === 'electron' && 'text-sky-600 dark:text-sky-400',
        projectType === 'react-native' && 'text-cyan-600 dark:text-cyan-400',
        projectType === 'flutter' && 'text-blue-500 dark:text-blue-300',
        projectType === 'dart' && 'text-teal-600 dark:text-teal-400',
        projectType === 'android' && 'text-green-700 dark:text-green-400',
        (projectType === 'ios' || projectType === 'macos-native') && 'text-slate-600 dark:text-slate-300',
        projectType === 'rust' && 'text-orange-600 dark:text-orange-400',
        projectType === 'go' && 'text-cyan-700 dark:text-cyan-400',
        projectType === 'python' && 'text-yellow-600 dark:text-yellow-400',
        projectType === 'ruby' && 'text-red-600 dark:text-red-400',
        projectType === 'php' && 'text-violet-600 dark:text-violet-400',
        projectType === 'java' && 'text-amber-600 dark:text-amber-400',
        projectType === 'kotlin' && 'text-purple-600 dark:text-purple-400',
        projectType === 'swift' && 'text-orange-500 dark:text-orange-300',
        projectType === 'dotnet' && 'text-indigo-600 dark:text-indigo-400',
        projectType === 'cpp' && 'text-blue-700 dark:text-blue-300',
        projectType === 'unknown' && 'text-current/60',
      )}
    >
      <Code2 size={12} />
      <span className="font-medium">{projectName ?? config.label}</span>
    </button>
  );
}
