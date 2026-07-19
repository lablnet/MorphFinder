import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellSwitcher } from '@renderer/components/chrome/ShellSwitcher';

describe('ShellSwitcher', () => {
  it('renders trigger button with active shell label', () => {
    const handleSelect = vi.fn();
    render(<ShellSwitcher activeShell="finder" onSelect={handleSelect} />);

    const trigger = screen.getByLabelText('Switch shell');
    expect(trigger).toBeDefined();
    expect(trigger.textContent).toContain('Finder');
  });
});
