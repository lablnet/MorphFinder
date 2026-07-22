import { useState, useEffect } from 'react';
import { Archive, CheckCircle, FileArchive, Loader2, X, XCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@lablnet/ui';
import { ipc } from '@renderer/services/ipc';
import type { IpcEvents } from '@shared/ipc/contract';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function ArchiveProgressModal() {
  const [operationsMap, setOperationsMap] = useState<Record<string, IpcEvents['archive:progress']>>({});

  useEffect(() => {
    return ipc.on('archive:progress', (data) => {
      setOperationsMap((prev) => {
        const next = { ...prev, [data.operationId]: data };
        return next;
      });

      if (data.done) {
        const timer = setTimeout(() => {
          setOperationsMap((prev) => {
            const next = { ...prev };
            delete next[data.operationId];
            return next;
          });
        }, 2500);
        return () => clearTimeout(timer);
      }
      return undefined;
    });
  }, []);

  const activeOperations = Object.values(operationsMap);
  if (activeOperations.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-h-[80vh] overflow-y-auto pr-1">
      {activeOperations.map((progress) => {
        const fileName = progress.currentPath.split('/').pop() || 'Archive';

        return (
          <Card
            key={progress.operationId}
            className="w-96 border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4 dark:border-slate-800 dark:bg-slate-900/95"
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                    {progress.type === 'compress' ? (
                      <FileArchive className="size-5" />
                    ) : (
                      <Archive className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {progress.type === 'compress' ? 'Compressing Archive' : 'Extracting Archive'}
                    </h4>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {fileName}
                    </p>
                  </div>
                </div>

                {progress.done ? (
                  progress.error ? (
                    <XCircle className="size-5 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle className="size-5 text-teal-500 shrink-0" />
                  )
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <Loader2 className="size-4 animate-spin text-teal-600 dark:text-teal-400" />
                    <Button
                      aria-label="Cancel operation"
                      onClick={() => {
                        if (progress.operationId) {
                          void ipc.invoke('archive:cancel', { operationId: progress.operationId });
                        }
                        setOperationsMap((prev) => {
                          const next = { ...prev };
                          delete next[progress.operationId];
                          return next;
                        });
                      }}
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
                  <span>{progress.done ? (progress.error ? 'Failed' : 'Completed') : `${progress.percent}%`}</span>
                  <span>
                    {formatBytes(progress.bytesProcessed)}
                    {progress.totalBytes > 0 && ` / ${formatBytes(progress.totalBytes)}`}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-teal-600 transition-all duration-200 dark:bg-teal-400"
                    style={{ width: `${progress.done ? 100 : progress.percent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
