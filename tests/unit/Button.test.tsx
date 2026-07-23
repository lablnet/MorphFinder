import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@renderer/components/ui/Button';

describe('Button', () => {
  it('renders button element with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies explorer rounded classes when shellId is explorer', () => {
    const { container } = render(<Button shellId="explorer">Explorer Button</Button>);
    expect(container.firstChild).toBeDefined();
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('rounded');
  });

  it('supports accent and outline variants', () => {
    const { container: accentContainer } = render(<Button variant="accent">Accent</Button>);
    const accentBtn = accentContainer.querySelector('button');
    expect(accentBtn?.className).toContain('bg-[color:var(--shell-accent)]');

    const { container: outlineContainer } = render(<Button variant="outline">Outline</Button>);
    const outlineBtn = outlineContainer.querySelector('button');
    expect(outlineBtn?.className).toContain('border-shell-border');
  });
});
