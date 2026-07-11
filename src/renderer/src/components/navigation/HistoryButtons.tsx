import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HistoryButtonsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  variant?: 'default' | 'explorer';
}

export function HistoryButtons({ canGoBack, canGoForward, onBack, onForward, variant = 'default' }: HistoryButtonsProps): React.JSX.Element {
  const buttonClass =
    variant === 'explorer'
      ? 'flex h-8 w-8 items-center justify-center rounded text-current/70 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-white/5'
      : 'flex h-7 w-7 items-center justify-center rounded-shell text-current/70 hover:bg-shell-sidebar disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        aria-label="Back"
        disabled={!canGoBack}
        onClick={onBack}
        className={buttonClass}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        aria-label="Forward"
        disabled={!canGoForward}
        onClick={onForward}
        className={buttonClass}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
