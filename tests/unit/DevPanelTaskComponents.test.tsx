import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DependencyWarningItem } from '../../src/renderer/src/components/devpanel/components/tasks/DependencyWarningItem';
import { DependencyWarningList } from '../../src/renderer/src/components/devpanel/components/tasks/DependencyWarningList';
import { EnvChecklist } from '../../src/renderer/src/components/devpanel/components/tasks/EnvChecklist';
import { EnvChecklistItem } from '../../src/renderer/src/components/devpanel/components/tasks/EnvChecklistItem';
import { PackageManagerCard } from '../../src/renderer/src/components/devpanel/components/tasks/PackageManagerCard';
import { TaskDashboard } from '../../src/renderer/src/components/devpanel/components/tasks/TaskDashboard';
import { TaskScriptList } from '../../src/renderer/src/components/devpanel/components/tasks/TaskScriptList';
import { TaskScriptRow } from '../../src/renderer/src/components/devpanel/components/tasks/TaskScriptRow';
import type { DevPanelInfo } from '../../src/shared/types/devPanel';

const info: DevPanelInfo = {
  path: '/repo',
  projectType: 'node',
  name: 'app',
  version: '1.0.0',
  description: 'demo',
  license: 'MIT',
  toolchain: null,
  packageManager: 'pnpm',
  scripts: [{ name: 'dev', command: 'pnpm dev' }],
  dependencies: [],
  envVars: [],
  envChecklist: [
    { key: 'DATABASE_URL', present: true, source: '.env.example' },
    { key: 'API_KEY', present: false, source: '.env.example' },
  ],
  healthChecks: [{ id: 'pkg', label: 'Package', status: 'pass', detail: 'Found' }],
  dependencyWarnings: [{ packageName: 'left-pad', severity: 'warn', message: 'Deprecated' }],
  gitBranch: 'main',
  gitIsDirty: false,
  hasProject: true,
};

describe('dev panel task components', () => {
  it('renders package manager card and runs install command', () => {
    const onRunCommand = vi.fn(async () => undefined);
    render(<PackageManagerCard packageManager="pnpm" projectType="node" onRunCommand={onRunCommand} />);

    expect(screen.getByText('pnpm · node')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /install/i }));
    expect(onRunCommand).toHaveBeenCalledWith('pnpm install');
  });

  it('renders script rows, favorites, run state, and empty script lists', () => {
    const onRunScript = vi.fn(async () => undefined);
    const onToggleFavorite = vi.fn();
    const script = { name: 'dev', command: 'pnpm dev' };
    const { rerender } = render(
      <TaskScriptRow
        script={script}
        isFavorite
        runState={{ status: 'sent', ranAt: Date.now() }}
        onRunScript={onRunScript}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    expect(screen.getByText('sent')).toBeDefined();
    fireEvent.click(screen.getByTitle('Remove favorite'));
    fireEvent.click(screen.getByRole('button', { name: /run/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith('dev');
    expect(onRunScript).toHaveBeenCalledWith('pnpm dev');

    rerender(<TaskScriptList scripts={[]} favoriteScripts={new Set()} scriptRunState={{}} onRunScript={onRunScript} onToggleFavorite={onToggleFavorite} />);
    expect(screen.getByText('No runnable scripts detected')).toBeDefined();
  });

  it('renders warnings and env checklist empty/populated states', () => {
    const warning = { packageName: 'vite', severity: 'info' as const, message: 'Update available' };
    render(<DependencyWarningItem warning={warning} />);
    expect(screen.getByText('vite')).toBeDefined();

    const { rerender } = render(<DependencyWarningList warnings={[]} />);
    expect(screen.getByText('No dependency warnings.')).toBeDefined();
    rerender(<DependencyWarningList warnings={[info.dependencyWarnings[0]!]} />);
    expect(screen.getByText('left-pad')).toBeDefined();

    rerender(<EnvChecklist items={[]} />);
    expect(screen.getByText('Add .env.example to enable this checklist.')).toBeDefined();
    rerender(<EnvChecklist items={info.envChecklist} />);
    expect(screen.getByText('1/2')).toBeDefined();

    rerender(<EnvChecklistItem item={info.envChecklist[1]!} />);
    expect(screen.getByText('API_KEY')).toBeDefined();
  });

  it('renders the full task dashboard and wires actions', () => {
    const onRunScript = vi.fn(async () => undefined);
    const onToggleFavorite = vi.fn();
    render(<TaskDashboard info={info} favoriteScripts={new Set(['dev'])} scriptRunState={{ 'pnpm dev': { status: 'queued', ranAt: Date.now() } }} onRunScript={onRunScript} onToggleFavorite={onToggleFavorite} />);

    expect(screen.getByText('Project Tasks')).toBeDefined();
    expect(screen.getByText('Health Checks')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /run/i }));
    expect(onRunScript).toHaveBeenCalledWith('pnpm dev');
  });
});
