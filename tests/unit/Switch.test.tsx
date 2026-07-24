import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '@renderer/components/ui/Switch';

describe('Switch', () => {
  it('renders switch element with accessibility role and checked state', () => {
    render(<Switch checked={true} aria-label="Toggle setting" />);
    const switchBtn = screen.getByRole('switch', { name: 'Toggle setting' });
    expect(switchBtn).toBeDefined();
    expect(switchBtn.getAttribute('aria-checked')).toBe('true');
  });

  it('renders with label and toggles on click', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={handleCheckedChange} label="Enable notifications" id="notif-switch" />);

    expect(screen.getByText('Enable notifications')).toBeDefined();
    const switchBtn = screen.getByRole('switch');
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(switchBtn);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('handles label click to trigger toggle', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={handleCheckedChange} label="Show hidden" id="hidden-switch" />);

    fireEvent.click(screen.getByText('Show hidden'));
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('respects disabled state and prevents click callbacks', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch checked={false} disabled={true} onCheckedChange={handleCheckedChange} label="Disabled switch" />);

    const switchBtn = screen.getByRole('switch');
    expect((switchBtn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(switchBtn);
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it('applies shell specific styles when shellId is provided', () => {
    const { container: explorerContainer } = render(<Switch checked={true} shellId="explorer" />);
    const switchBtn = explorerContainer.querySelector('button');
    expect(switchBtn?.className).toContain('rounded-sm');

    const { container: defaultContainer } = render(<Switch checked={true} shellId="finder" />);
    const defaultBtn = defaultContainer.querySelector('button');
    expect(defaultBtn?.className).toContain('rounded-full');
  });

  it('supports size prop variants', () => {
    const { container: smContainer } = render(<Switch checked={false} size="sm" />);
    const smBtn = smContainer.querySelector('button');
    expect(smBtn?.className).toContain('h-5 w-9');

    const { container: defaultContainer } = render(<Switch checked={false} size="default" />);
    const defaultBtn = defaultContainer.querySelector('button');
    expect(defaultBtn?.className).toContain('h-6 w-11');
  });

  it('applies correct translation classes when checked and unchecked', () => {
    const { container: uncheckedContainer } = render(<Switch checked={false} size="sm" />);
    const uncheckedThumb = uncheckedContainer.querySelector('span');
    expect(uncheckedThumb?.className).toContain('translate-x-[2px]');

    const { container: checkedContainer } = render(<Switch checked={true} size="sm" />);
    const checkedThumb = checkedContainer.querySelector('span');
    expect(checkedThumb?.className).toContain('translate-x-[18px]');
  });
});
