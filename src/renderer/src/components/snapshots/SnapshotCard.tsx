import { Badge, Button, Card, CardContent } from '@lablnet/ui';
import { Download, Folder, Play, Trash2 } from 'lucide-react';
import type { WorkspaceSnapshot } from '@shared/types/workspaceSnapshots';

interface SnapshotCardProps {
  snapshot: WorkspaceSnapshot;
  onRestore: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SnapshotCard({ snapshot, onRestore, onExport, onDelete }: SnapshotCardProps) {
  const formattedDate = new Date(snapshot.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="group border-slate-200 bg-white transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{snapshot.name}</h4>
              <Badge variant="outline" className="capitalize text-xs">
                {snapshot.shell}
              </Badge>
            </div>
            {snapshot.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {snapshot.description}
              </p>
            )}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            {formattedDate}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {snapshot.tabs.slice(0, 3).map((tab) => (
            <Badge
              key={tab.id}
              variant="secondary"
              className="gap-1 bg-slate-100 text-xs font-normal text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Folder className="size-3 text-slate-400" />
              {tab.title}
            </Badge>
          ))}
          {snapshot.tabs.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal text-slate-500">
              +{snapshot.tabs.length - 3} more
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <Button
            className="gap-1.5 text-xs"
            onClick={() => onRestore(snapshot.id)}
            size="sm"
          >
            <Play className="size-3.5 fill-current" />
            Restore Session
          </Button>

          <div className="flex items-center gap-1">
            <Button
              aria-label="Export Snapshot"
              onClick={() => onExport(snapshot.id)}
              size="icon"
              variant="ghost"
              className="size-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Download className="size-4" />
            </Button>
            <Button
              aria-label="Delete Snapshot"
              onClick={() => onDelete(snapshot.id)}
              size="icon"
              variant="ghost"
              className="size-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
