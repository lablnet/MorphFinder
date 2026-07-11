import { useEffect, useState, useTransition } from 'react';
import {
  Trash2,
  RefreshCw,
  Info,
  CheckSquare,
  Square,
  ShieldAlert,
  Server,
  FolderOpen,
  Terminal,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { ipc } from '@renderer/services/ipc';
import type { CacheTarget, CacheScanResult, CacheCleanResult } from '@shared/types/cache';
import { Button } from '../ui/Button';

// Utility to format byte size nicely
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function CacheCleaner(): React.JSX.Element {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [targets, setTargets] = useState<CacheTarget[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [freedMessage, setFreedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  // Perform initial scan
  const performScan = async (): Promise<void> => {
    setScanning(true);
    setFreedMessage(null);
    setErrors({});
    try {
      const result: CacheScanResult = await ipc.invoke('cache:scan', undefined);
      setIsSupported(result.isSupported);
      if (result.isSupported) {
        setTargets(result.targets);
        // Pre-select everything that is developer/system cache by default
        const initialSelected = new Set<string>();
        result.targets.forEach((t) => {
          if (t.category === 'Developer' || t.category === 'System') {
            initialSelected.add(t.id);
          }
        });
        setSelectedIds(initialSelected);
      }
    } catch (err) {
      console.error('Cache scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    void performScan();
  }, []);

  const handleToggleSelect = (id: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = (): void => {
    if (selectedIds.size === targets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(targets.map((t) => t.id)));
    }
  };

  const handleClean = async (): Promise<void> => {
    if (selectedIds.size === 0) return;
    setCleaning(true);
    setFreedMessage(null);
    setErrors({});

    try {
      const result: CacheCleanResult = await ipc.invoke('cache:clean', {
        targetIds: Array.from(selectedIds),
      });

      let totalFreed = 0;
      Object.entries(result.cleanedSizes).forEach(([, size]) => {
        totalFreed += size;
      });

      startTransition(() => {
        setFreedMessage(`Successfully reclaimed ${formatBytes(totalFreed)} of storage space!`);
        setErrors(result.errors);
      });

      // Re-scan to update sizes
      await performScan();
    } catch (err) {
      console.error('Cache cleaning failed:', err);
    } finally {
      setCleaning(false);
    }
  };

  // Determine category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Developer':
        return <Terminal size={15} className="text-blue-500 dark:text-blue-400" />;
      case 'AI':
        return <Cpu size={15} className="text-purple-500 dark:text-purple-400" />;
      case 'Application':
        return <FolderOpen size={15} className="text-yellow-500 dark:text-yellow-400" />;
      default:
        return <Server size={15} className="text-green-500 dark:text-green-400" />;
    }
  };

  // Unsupported Platform View (Coming Soon)
  if (isSupported === false) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 bg-shell-surface text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-shell-accent to-purple-600 opacity-30 blur-md"></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-shell-sidebar border border-shell-border text-current/80">
            <Trash2 size={30} className="animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight text-current">Cache Cleaner</h2>
        <p className="text-current/60 max-w-md mb-6 leading-relaxed">
          Storage scanning and automated cleaning is currently available on macOS to clean pnpm, npm, Gradle, and Apple Application Support caches.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-shell-accent/10 text-shell-accent border border-shell-accent/25">
          <Layers size={12} />
          Windows & Linux Support Coming Soon
        </span>
      </div>
    );
  }

  // Calculating overall sizes
  const totalScannedSize = targets.reduce((sum, t) => sum + t.sizeInBytes, 0);
  const totalSelectedSize = targets
    .filter((t) => selectedIds.has(t.id))
    .reduce((sum, t) => sum + t.sizeInBytes, 0);

  const hasApplicationSupportSelected = targets.some(
    (t) => selectedIds.has(t.id) && t.category === 'Application'
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-shell-surface text-sm">
      {/* View Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-shell-border p-4 bg-shell-surface/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-current">Cache Cleaner Dashboard</h2>
            <p className="text-xs text-current/50">Analyze and clean up developer dependencies and app support bloat.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => void performScan()} disabled={scanning || cleaning} variant="ghost" size="icon">
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          </Button>
          <Button
            onClick={() => void handleClean()}
            disabled={cleaning || scanning || selectedIds.size === 0}
            variant="accent"
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <Trash2 size={14} />
            {cleaning ? 'Cleaning...' : `Clean ${formatBytes(totalSelectedSize)}`}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner Messages */}
        {freedMessage && (
          <div className="flex items-start gap-3 rounded-shell bg-green-500/10 border border-green-500/20 p-3 text-green-700 dark:text-green-400">
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs leading-none mb-1">Clean Complete</p>
              <p className="text-xs opacity-90">{freedMessage}</p>
            </div>
          </div>
        )}

        {hasApplicationSupportSelected && (
          <div className="flex items-start gap-3 rounded-shell bg-yellow-500/10 border border-yellow-500/20 p-3 text-yellow-700 dark:text-yellow-400">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs leading-none mb-1">Application Reset Warning</p>
              <p className="text-xs opacity-90">
                You have selected Application Data folders (e.g. Cursor, Claude). Cleaning these folders completely resets local settings, cache history, and active sessions for those apps.
              </p>
            </div>
          </div>
        )}

        {/* Space Overview Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 transition-all hover:shadow-sm">
            <p className="text-xs font-medium text-current/40 mb-1 uppercase tracking-wider">Total Scanned Caches</p>
            <p className="text-2xl font-bold tracking-tight text-current">
              {scanning ? 'Calculating...' : formatBytes(totalScannedSize)}
            </p>
          </div>
          <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 transition-all hover:shadow-sm">
            <p className="text-xs font-medium text-current/40 mb-1 uppercase tracking-wider">Selected to Clean</p>
            <p className="text-2xl font-bold tracking-tight text-shell-accent">
              {formatBytes(totalSelectedSize)}
            </p>
          </div>
          <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 transition-all hover:shadow-sm">
            <p className="text-xs font-medium text-current/40 mb-1 uppercase tracking-wider">Selected Items</p>
            <p className="text-2xl font-bold tracking-tight text-current">
              {selectedIds.size} <span className="text-xs font-normal text-current/40">of {targets.length} targets</span>
            </p>
          </div>
        </div>

        {/* Cache List */}
        {scanning && targets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-current/50 gap-2">
            <RefreshCw size={24} className="animate-spin text-shell-accent" />
            <p className="text-xs font-medium">Scanning folders & calculating sizes...</p>
          </div>
        ) : targets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-current/40 gap-1 border border-dashed border-shell-border rounded-shell">
            <CheckCircle size={24} className="text-current/20" />
            <p className="text-xs font-semibold">Your developer caches are already clean!</p>
          </div>
        ) : (
          <div className="border border-shell-border rounded-shell overflow-hidden bg-shell-surface">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-shell-border bg-shell-sidebar/50 px-4 py-2.5 text-xs font-semibold text-current/50">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 hover:text-current transition-colors text-left"
              >
                {selectedIds.size === targets.length ? (
                  <CheckSquare size={14} className="text-shell-accent" />
                ) : selectedIds.size > 0 ? (
                  <div className="h-3.5 w-3.5 flex items-center justify-center rounded-sm bg-shell-accent text-white">
                    <div className="h-0.5 w-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <Square size={14} />
                )}
                <span>Target Folder</span>
              </button>
              <div className="flex items-center gap-6">
                <span>Category</span>
                <span className="w-20 text-right">Size</span>
              </div>
            </div>

            {/* List Entries */}
            <div className="divide-y divide-shell-border">
              {targets.map((target) => {
                const isSelected = selectedIds.has(target.id);
                const hasError = errors[target.id] !== undefined;

                return (
                  <div
                    key={target.id}
                    className={`flex items-start justify-between px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                      isSelected ? 'bg-shell-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 mr-4">
                      <button
                        onClick={() => handleToggleSelect(target.id)}
                        className="mt-0.5 text-current/60 hover:text-shell-accent transition-colors shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={14} className="text-shell-accent" />
                        ) : (
                          <Square size={14} />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-current truncate">{target.name}</span>
                          {target.category === 'Application' && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium">
                              <AlertTriangle size={8} />
                              Resets App
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-current/50 mb-1 leading-snug">{target.description}</p>
                        <span className="text-[10px] font-mono text-current/45 bg-shell-sidebar px-1.5 py-0.5 rounded border border-shell-border break-all">
                          {target.path}
                        </span>

                        {hasError && (
                          <p className="text-[11px] text-red-500 mt-1 font-medium">
                            Error: {errors[target.id]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 pt-0.5">
                      <span className="flex items-center gap-1.5 text-xs text-current/60">
                        {getCategoryIcon(target.category)}
                        {target.category}
                      </span>
                      <span className="w-20 text-right font-semibold text-current">
                        {formatBytes(target.sizeInBytes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Info Footer */}
      <div className="flex shrink-0 items-start gap-2 border-t border-shell-border bg-shell-sidebar p-3 text-xs text-current/50">
        <Info size={14} className="shrink-0 text-shell-accent mt-0.5" />
        <p className="leading-normal">
          Clearing caches removes temporary download and build files. Active packages in use by current projects may take slightly longer to fetch or build the next time they are run. System operations do not require administrator password since all targets reside within user boundaries.
        </p>
      </div>
    </div>
  );
}
