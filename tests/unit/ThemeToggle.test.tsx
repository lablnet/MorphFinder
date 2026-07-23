import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '@renderer/components/chrome/ThemeToggle';

describe('ThemeToggle', () => {
  it('renders trigger with aria-label', () => {
    const handleChange = vi.fn();
    render(<ThemeToggle mode="system" onChange={handleChange} />);
    const trigger = screen.getByLabelText('Change theme');
    expect(trigger).toBeDefined();
  });
});
