import { useState, useEffect, useTransition, useRef } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { CacheTarget, CacheScanResult, CacheCleanResult } from '@shared/types/cache';

export interface ProgressState {
  total: number;
  current: number;
  currentTargetName: string;
  freedBytes: number;
}

// Utility to format byte size nicely
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function useCacheCleaner() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [targets, setTargets] = useState<CacheTarget[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [freedMessage, setFreedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'size'>('size');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Double Confirmation State
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  // Deletion Progress State
  const [progressState, setProgressState] = useState<ProgressState>({
    total: 0,
    current: 0,
    currentTargetName: '',
    freedBytes: 0,
  });

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

  // Filter list of targets
  const filteredTargets = targets.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort list of targets
  const sortedTargets = [...filteredTargets].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortBy === 'size') {
      comparison = a.sizeInBytes - b.sizeInBytes;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleToggleSelectAll = (): void => {
    if (selectedIds.size === sortedTargets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTargets.map((t) => t.id)));
    }
  };

  const cancelRef = useRef(false);

  const handleCancelClean = (): void => {
    cancelRef.current = true;
  };

  const handleClean = async (): Promise<void> => {
    if (selectedIds.size === 0) return;
    cancelRef.current = false;
    setCleaning(true);
    setFreedMessage(null);
    setErrors({});

    const targetIdArray = Array.from(selectedIds);
    setProgressState({
      total: targetIdArray.length,
      current: 0,
      currentTargetName: '',
      freedBytes: 0,
    });

    let totalFreed = 0;
    const newErrors: Record<string, string> = {};
    let wasCancelled = false;

    for (let i = 0; i < targetIdArray.length; i++) {
      if (cancelRef.current) {
        wasCancelled = true;
        break;
      }

      const targetId = targetIdArray[i];
      if (targetId === undefined) continue;
      const target = targets.find((t) => t.id === targetId);
      if (target) {
        setProgressState((prev) => ({
          ...prev,
          currentTargetName: target.name,
        }));
      }

      try {
        const result: CacheCleanResult = await ipc.invoke('cache:clean', {
          targetIds: [targetId],
        });

        if (result.cleanedSizes[targetId]) {
          totalFreed += result.cleanedSizes[targetId];
        }
        if (result.errors[targetId]) {
          newErrors[targetId] = result.errors[targetId];
        }
      } catch (err) {
        newErrors[targetId] = err instanceof Error ? err.message : String(err);
      }

      setProgressState((prev) => ({
        ...prev,
        current: i + 1,
        freedBytes: totalFreed,
      }));

      if (cancelRef.current) {
        wasCancelled = true;
        break;
      }

      // Satisfying micro-delay (80ms) so users can witness real-time progress transitions
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    startTransition(() => {
      if (wasCancelled) {
        setFreedMessage(`Deletion cancelled. Reclaimed ${formatBytes(totalFreed)} of storage space.`);
      } else {
        setFreedMessage(`Successfully reclaimed ${formatBytes(totalFreed)} of storage space!`);
      }
      setErrors(newErrors);
    });

    setCleaning(false);
    await performScan();
  };

  const toggleSort = (field: 'name' | 'category' | 'size'): void => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'size' ? 'desc' : 'asc');
    }
  };

  // Calculating overall sizes
  const totalScannedSize = targets.reduce((sum, t) => sum + t.sizeInBytes, 0);
  const totalSelectedSize = targets
    .filter((t) => selectedIds.has(t.id))
    .reduce((sum, t) => sum + t.sizeInBytes, 0);

  const hasApplicationSupportSelected = targets.some(
    (t) => selectedIds.has(t.id) && t.category === 'Application'
  );

  return {
    isSupported,
    targets,
    selectedIds,
    scanning,
    cleaning,
    freedMessage,
    errors,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    showFirstConfirm,
    setShowFirstConfirm,
    showSecondConfirm,
    setShowSecondConfirm,
    progressState,
    performScan,
    handleToggleSelect,
    handleToggleSelectAll,
    handleClean,
    handleCancelClean,
    toggleSort,
    sortedTargets,
    totalScannedSize,
    totalSelectedSize,
    hasApplicationSupportSelected,
  };
}
