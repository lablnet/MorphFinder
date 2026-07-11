import React from 'react';
import { Cpu, HardDrive } from 'lucide-react';
import type { DevPanelInfo } from '@shared/types/devPanel';
import { MetaRow } from './MetaRow';

interface ProjectMetaCardProps {
  info: DevPanelInfo;
}

export function ProjectMetaCard({ info }: ProjectMetaCardProps): React.JSX.Element {
  return (
    <div className="rounded-shell border border-shell-border bg-shell-sidebar/40 p-4 space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <Cpu size={14} className="text-shell-accent" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-current/60">Project Info</h3>
      </div>

      <div className="space-y-0 divide-y divide-shell-border/30">
        <MetaRow label="Project" value={info.name} />
        <MetaRow label="Version" value={info.version} />
        <MetaRow label="License" value={info.license} />
        <MetaRow label="Description" value={info.description} />
        {info.toolchain && (
          <>
            <MetaRow label="Runtime" value={info.toolchain.runtime} />
            <MetaRow label="Required Version" value={info.toolchain.requiredVersion} />
          </>
        )}
        <MetaRow label="Git Branch" value={info.gitBranch} />
      </div>

      {/* Path */}
      <div className="pt-3 flex items-start gap-2">
        <HardDrive size={12} className="text-current/40 mt-0.5 shrink-0" />
        <span className="text-[10px] text-current/40 font-mono break-all leading-relaxed">{info.path}</span>
      </div>
    </div>
  );
}
