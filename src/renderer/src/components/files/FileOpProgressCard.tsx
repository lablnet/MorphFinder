import { CheckCircle, Copy, Loader2, X, XCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@lablnet/ui';
import type { FileOpProgressItem } from '@renderer/hooks/files/useFileOperationProgress';

interface FileOpProgressCardProps {
  item: FileOpProgressItem;
  onCancel: (id: string) => void;
}

export function FileOpProgressCard({ item, onCancel }: FileOpProgressCardProps) {
  const percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 100;

  return (
    <Card className="w-96 border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4 dark:border-slate-800 dark:bg-slate-900/95">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Copy className="size-5" />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                File Operation
              </h4>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {item.completed} of {item.total} items ({item.fileName})
              </p>
            </div>
          </div>

          {item.done ? (
            item.error ? (
              <XCircle className="size-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle className="size-5 text-teal-500 shrink-0" />
            )
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Loader2 className="size-4 animate-spin text-teal-600 dark:text-teal-400" />
              <Button
                aria-label="Cancel file operation"
                onClick={() => onCancel(item.operationId)}
                size="icon"
                variant="ghost"
                className="size-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                title="Cancel Operation"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>{item.done ? (item.error ? 'Failed' : 'Completed') : `${percent}%`}</span>
            <span>{item.completed} / {item.total} files</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-teal-600 transition-all duration-200 dark:bg-teal-400"
              style={{ width: `${item.done ? 100 : percent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
