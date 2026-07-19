import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@renderer/components/ui/Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeDefined();
  });

  it('applies error styles when error prop is true', () => {
    const { container } = render(<Input error placeholder="Error field" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('border-red-500');
  });
});
