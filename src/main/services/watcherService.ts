import { subscribe, type AsyncSubscription } from '@parcel/watcher';
import type { WebContents } from 'electron';

interface WatchEntry {
  subscription: AsyncSubscription;
  refCount: number;
}

const watchesByPath = new Map<string, WatchEntry>();

/** Debounces bursts of individual file events (e.g. a large copy) into one refresh signal. */
function debounce(fn: () => void, delayMs: number): () => void {
  let handle: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (handle !== null) clearTimeout(handle);
    handle = setTimeout(fn, delayMs);
  };
}

/**
 * Refcounted per-directory watch: multiple tabs open on the same path share one
 * native subscription. Every open tab's directory is watched non-recursively —
 * MorphFinder re-lists on navigation, so descendant changes aren't needed here.
 */
export function watchDirectory(path: string, webContents: WebContents): () => void {
  const existing = watchesByPath.get(path);
  if (existing !== undefined) {
    existing.refCount += 1;
    return () => unwatchDirectory(path);
  }

  const notifyChanged = debounce(() => {
    if (!webContents.isDestroyed()) {
      webContents.send('fs:changed', { path });
    }
  }, 150);

  const subscriptionPromise = subscribe(path, (error) => {
    if (error === null) notifyChanged();
  });

  watchesByPath.set(path, {
    // Placeholder resolved below; readable immediately for refcount bookkeeping.
    subscription: { unsubscribe: async () => undefined },
    refCount: 1,
  });

  void subscriptionPromise.then((subscription) => {
    const entry = watchesByPath.get(path);
    if (entry === undefined) {
      // Directory was unwatched before the native subscription resolved.
      void subscription.unsubscribe();
      return;
    }
    entry.subscription = subscription;
  });

  return () => unwatchDirectory(path);
}

function unwatchDirectory(path: string): void {
  const entry = watchesByPath.get(path);
  if (entry === undefined) return;

  entry.refCount -= 1;
  if (entry.refCount > 0) return;

  watchesByPath.delete(path);
  void entry.subscription.unsubscribe();
}

export async function disposeAllWatchers(): Promise<void> {
  const entries = [...watchesByPath.values()];
  watchesByPath.clear();
  await Promise.all(entries.map((entry) => entry.subscription.unsubscribe()));
}
