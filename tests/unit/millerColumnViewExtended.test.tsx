import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { FileView } from '../../src/renderer/src/components/files/FileView';

describe('FileView Component Coverage', () => {
  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it('renders FileView container', () => {
    const { container } = render(
      <FileView
        nodes={[]}
        selectedPaths={new Set()}
        viewMode="grid"
        onSelect={vi.fn()}
        onOpen={vi.fn()}
      />
    );
    expect(container).toBeDefined();
  });
});
