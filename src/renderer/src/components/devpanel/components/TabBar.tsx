import React from 'react';
import { cn } from '@lablnet/ui';
import { devPanelTabs, isDevPanelTabEnabled } from '@renderer/lib/devPanelDashboardUtils';
import type { DevPanelTab } from '../../../hooks/files/useDevPanel';

interface TabBarProps {
  activeTab: DevPanelTab;
  onTabChange: (tab: DevPanelTab) => void;
  hasScripts: boolean;
  hasDeps: boolean;
  hasEnv: boolean;
}

export function TabBar({ activeTab, onTabChange, hasScripts, hasDeps, hasEnv }: TabBarProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 border-b border-shell-border px-4 bg-shell-sidebar/30">
      {devPanelTabs.map(({ id, label }) => {
        const enabled = isDevPanelTabEnabled(id, hasScripts, hasDeps, hasEnv);
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            disabled={!enabled}
            onClick={() => onTabChange(id)}
            className={cn(
              'px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px outline-none disabled:opacity-30 disabled:cursor-not-allowed',
              isActive
                ? 'border-shell-accent text-shell-accent'
                : 'border-transparent text-current/55 hover:text-current hover:border-shell-border'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
