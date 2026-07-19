import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SaveSnapshotForm } from '../../src/renderer/src/components/snapshots/SaveSnapshotForm';
import { SnapshotCard } from '../../src/renderer/src/components/snapshots/SnapshotCard';
import { SnapshotEmptyState } from '../../src/renderer/src/components/snapshots/SnapshotEmptyState';
import type { WorkspaceSnapshot } from '../../src/shared/types/workspaceSnapshots';

const snapshot: WorkspaceSnapshot = {
  id: 'snap-1',
  name: 'Sprint Workspace',
  description: 'Focused folders for release work',
  createdAt: '2026-07-23T03:00:00.000Z',
  updatedAt: '2026-07-23T03:00:00.000Z',
  shell: 'finder',
  themeMode: 'dark',
  activeTabPath: '/repo',
  tabs: [
    { id: '1', path: '/repo/src', title: 'src' },
    { id: '2', path: '/repo/tests', title: 'tests' },
    { id: '3', path: '/repo/docs', title: 'docs' },
    { id: '4', path: '/repo/build', title: 'build' },
  ],
};

describe('snapshot components', () => {
  it('renders empty state and starts saving current session', () => {
    const onSaveCurrent = vi.fn();
    render(<SnapshotEmptyState onSaveCurrent={onSaveCurrent} />);

    expect(screen.getByText('No Workspace Snapshots')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /freeze current session/i }));
    expect(onSaveCurrent).toHaveBeenCalledTimes(1);
  });

  it('submits trimmed snapshot data and toggles saving state', async () => {
    const onSave = vi.fn(async () => undefined);
    const onCancel = vi.fn();
    render(<SaveSnapshotForm defaultName=" Default Name " onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByPlaceholderText('e.g. Frontend Refactor Setup');
    fireEvent.change(nameInput, { target: { value: '  Release Layout  ' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Tab 1: components, Tab 2: styles'), {
      target: { value: '  API and UI tabs  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save snapshot/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Release Layout', 'API and UI tabs');
    });
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels the save form and prevents blank submissions', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<SaveSnapshotForm defaultName="Draft" onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(screen.getByDisplayValue('Draft'), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: /save snapshot/i })).toHaveProperty('disabled', true);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('renders snapshot cards and dispatches restore, export, and delete actions', () => {
    const onRestore = vi.fn();
    const onExport = vi.fn();
    const onDelete = vi.fn();
    render(<SnapshotCard snapshot={snapshot} onRestore={onRestore} onExport={onExport} onDelete={onDelete} />);

    expect(screen.getByText('Sprint Workspace')).toBeTruthy();
    expect(screen.getByText('Focused folders for release work')).toBeTruthy();
    expect(screen.getByText('finder')).toBeTruthy();
    expect(screen.getByText('+1 more')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /restore session/i }));
    fireEvent.click(screen.getByRole('button', { name: /export snapshot/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete snapshot/i }));

    expect(onRestore).toHaveBeenCalledWith('snap-1');
    expect(onExport).toHaveBeenCalledWith('snap-1');
    expect(onDelete).toHaveBeenCalledWith('snap-1');
  });
});
