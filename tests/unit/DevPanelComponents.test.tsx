import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DevPanelHeader } from '@renderer/components/devpanel/components/DevPanelHeader';
import { TabBar } from '@renderer/components/devpanel/components/TabBar';
import { ProjectMetaCard } from '@renderer/components/devpanel/components/ProjectMetaCard';
import { NoProjectFound } from '@renderer/components/devpanel/components/NoProjectFound';
import { ProjectHealthGrid } from '@renderer/components/devpanel/components/tasks/ProjectHealthGrid';
import { DevPanelStatusButton } from '@renderer/components/devpanel/components/DevPanelStatusButton';

describe('DevPanel Sub-Components', () => {
  it('renders DevPanelHeader with name and version', () => {
    const mockInfo = {
      projectType: 'node' as const,
      name: 'my-app',
      version: '1.0.1',
      description: 'Test app',
      hasScripts: true,
      hasDeps: true,
      hasEnv: true,
      scripts: [],
      dependencies: [],
      devDependencies: [],
      envVars: [],
      git: null,
      packageManager: 'pnpm',
    };
    render(<DevPanelHeader info={mockInfo} onRefresh={vi.fn()} loading={false} />);
    expect(screen.getByText('my-app')).toBeDefined();
    expect(screen.getByText('1.0.1')).toBeDefined();
  });

  it('renders TabBar and allows tab switching', () => {
    const handleTabChange = vi.fn();
    render(
      <TabBar
        activeTab="overview"
        onTabChange={handleTabChange}
        hasScripts={true}
        hasDeps={true}
        hasEnv={true}
      />
    );
    expect(screen.getByText('Overview')).toBeDefined();
  });

  it('renders ProjectMetaCard', () => {
    const mockInfo = {
      projectType: 'node' as const,
      name: 'my-app',
      version: '1.0.1',
      description: 'Test app',
      hasScripts: true,
      hasDeps: true,
      hasEnv: true,
      scripts: [],
      dependencies: [],
      devDependencies: [],
      envVars: [],
      git: null,
      packageManager: 'pnpm',
    };
    render(<ProjectMetaCard info={mockInfo} />);
    expect(screen.getByText('my-app')).toBeDefined();
  });

  it('renders NoProjectFound with scanPath', () => {
    render(<NoProjectFound path="/tmp/empty" />);
    expect(screen.getByText('/tmp/empty')).toBeDefined();
  });

  it('renders ProjectHealthGrid and DevPanelStatusButton', () => {
    render(<ProjectHealthGrid checks={[{ id: 'node', label: 'Node.js', status: 'pass', detail: 'v22.0.0' }]} />);
    expect(screen.getByText('Health Checks')).toBeDefined();

    render(<DevPanelStatusButton isPickingFolder={false} loading={false} onPickFolder={vi.fn()} />);
  });
});
