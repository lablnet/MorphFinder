import { Clock3 } from 'lucide-react';

export function FileTimelineEmptyState({ isLoading }: { isLoading: boolean }): React.JSX.Element {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 text-current/50">
      <Clock3 size={30} className={isLoading ? 'animate-pulse text-shell-accent' : ''} />
      <span>{isLoading ? 'Building timeline...' : 'No recent file activity found.'}</span>
    </div>
  );
}
