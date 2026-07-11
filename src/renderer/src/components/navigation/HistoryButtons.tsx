import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface HistoryButtonsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  variant?: 'default' | 'explorer';
}

export function HistoryButtons({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  variant = 'default',
}: HistoryButtonsProps): React.JSX.Element {
  const isExplorer = variant === 'explorer';
  const shellId = isExplorer ? 'explorer' : 'default';

  return (
    <div className="flex items-center gap-0.5">
      <Button
        aria-label="Back"
        disabled={!canGoBack}
        onClick={onBack}
        size="icon"
        shellId={shellId}
        className={isExplorer ? 'h-8 w-8' : undefined}
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        aria-label="Forward"
        disabled={!canGoForward}
        onClick={onForward}
        size="icon"
        shellId={shellId}
        className={isExplorer ? 'h-8 w-8' : undefined}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
