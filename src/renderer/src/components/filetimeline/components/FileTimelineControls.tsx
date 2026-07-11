import { cn } from '@lablnet/ui';
import { timelineDayOptions } from '@renderer/lib/fileTimelineUtils';

export function FileTimelineControls({
  days,
  disabled,
  onDaysChange,
}: {
  days: number;
  disabled: boolean;
  onDaysChange: (days: number) => void;
}): React.JSX.Element {
  return (
    <div className="mb-4 flex items-center justify-between rounded-shell border border-shell-border bg-shell-sidebar/25 p-3">
      <div>
        <div className="text-xs font-semibold text-current">Activity Window</div>
        <div className="text-[11px] text-current/45">Created and modified files, newest first.</div>
      </div>
      <div className="flex rounded-shell border border-shell-border bg-shell-surface p-0.5">
        {timelineDayOptions.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onDaysChange(option)}
            className={cn(
              'rounded px-3 py-1.5 text-xs font-medium transition-colors',
              days === option ? 'bg-shell-accent text-white' : 'text-current/60 hover:bg-shell-sidebar hover:text-current',
            )}
          >
            {option}d
          </button>
        ))}
      </div>
    </div>
  );
}
