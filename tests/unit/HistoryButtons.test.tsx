import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryButtons } from '@renderer/components/navigation/HistoryButtons';

describe('HistoryButtons', () => {
  it('renders Back and Forward buttons and triggers callbacks', () => {
    const handleBack = vi.fn();
    const handleForward = vi.fn();

    render(
      <HistoryButtons
        canGoBack={true}
        canGoForward={true}
        onBack={handleBack}
        onForward={handleForward}
      />
    );

    const backBtn = screen.getByLabelText('Back');
    const fwdBtn = screen.getByLabelText('Forward');

    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);

    fireEvent.click(fwdBtn);
    expect(handleForward).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when canGoBack or canGoForward are false', () => {
    render(
      <HistoryButtons
        canGoBack={false}
        canGoForward={false}
        onBack={vi.fn()}
        onForward={vi.fn()}
      />
    );

    const backBtn = screen.getByLabelText('Back') as HTMLButtonElement;
    const fwdBtn = screen.getByLabelText('Forward') as HTMLButtonElement;

    expect(backBtn.disabled).toBe(true);
    expect(fwdBtn.disabled).toBe(true);
  });
});
