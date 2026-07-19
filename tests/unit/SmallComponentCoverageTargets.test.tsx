import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NamePromptDialog } from '../../src/renderer/src/components/ui/NamePromptDialog';
import { DolphinStatusBar } from '../../src/renderer/src/layouts/dolphin/DolphinStatusBar';
import { ExplorerStatusBar } from '../../src/renderer/src/layouts/explorer/ExplorerStatusBar';
import { FinderStatusBar } from '../../src/renderer/src/layouts/finder/FinderStatusBar';

describe('small component coverage targets', () => {
  it('covers NamePromptDialog confirm, change, escape, cancel, and backdrop behavior', () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <NamePromptDialog
        prompt={{ title: 'New Folder', defaultValue: 'Untitled', value: 'Draft' }}
        onChange={onChange}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const input = screen.getByLabelText('New Folder') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Final' } });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('presentation'));
    fireEvent.mouseDown(container.querySelector('form')!);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    fireEvent.click(screen.getByRole('button', { name: /ok/i }));

    expect(onChange).toHaveBeenCalledWith('Final');
    expect(onCancel).toHaveBeenCalledTimes(3);
    expect(onConfirm).toHaveBeenCalledWith('Draft');
  });

  it('renders all shell status bars with children', () => {
    render(
      <>
        <FinderStatusBar>finder ready</FinderStatusBar>
        <ExplorerStatusBar>explorer ready</ExplorerStatusBar>
        <DolphinStatusBar>dolphin ready</DolphinStatusBar>
      </>,
    );

    expect(screen.getByText('finder ready')).toBeDefined();
    expect(screen.getByText('explorer ready')).toBeDefined();
    expect(screen.getByText('dolphin ready')).toBeDefined();
  });
});
