import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileContextMenu } from '../../src/renderer/src/components/files/FileContextMenu';
import { OperationProgressContainer } from '../../src/renderer/src/components/files/OperationProgressContainer';
import { nextSelectionForKeyboard, normalizedSelectionRect } from '../../src/renderer/src/components/files/selection';

describe('File Context Menu & Selection Utils Coverage', () => {
  it('renders FileContextMenu', () => {
    const mockNode = {
      path: '/tmp/test.txt',
      name: 'test.txt',
      kind: 'file' as const,
      sizeInBytes: 2048,
      modifiedAt: Date.now(),
      createdAt: Date.now(),
      isHidden: false,
      extension: 'txt',
    };

    const state = {
      x: 100,
      y: 100,
      hasTarget: true,
      canPaste: true,
      node: mockNode,
      activePath: '/tmp/test.txt',
    };

    render(<FileContextMenu state={state} onAction={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText('Open')).toBeDefined();
  });

  it('renders OperationProgressContainer', () => {
    render(<OperationProgressContainer />);
  });

  it('computes next selection for keyboard', () => {
    const nodes = [
      { path: '/tmp/a', name: 'a', kind: 'file' as const, sizeInBytes: 10, modifiedAt: 1, createdAt: 1, isHidden: false, extension: 'txt' },
      { path: '/tmp/b', name: 'b', kind: 'file' as const, sizeInBytes: 10, modifiedAt: 1, createdAt: 1, isHidden: false, extension: 'txt' },
    ];
    const res = nextSelectionForKeyboard(nodes, ['/tmp/a'], 'ArrowDown', { extend: false });
    expect(res.paths).toEqual(['/tmp/b']);
  });

  it('computes normalized selection rect', () => {
    const rect = normalizedSelectionRect({ x: 10, y: 10 }, { x: 50, y: 50 });
    expect(rect).toEqual({ left: 10, top: 10, right: 50, bottom: 50 });
  });
});
