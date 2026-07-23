import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebContents } from 'electron';

const watcherMock = vi.hoisted(() => ({
  callbacks: new Map<string, (error: Error | null) => void>(),
  unsubscribes: new Map<string, ReturnType<typeof vi.fn>>(),
  subscribe: vi.fn(async (path: string, callback: (error: Error | null) => void) => {
    const unsubscribe = vi.fn(async () => undefined);
    watcherMock.callbacks.set(path, callback);
    watcherMock.unsubscribes.set(path, unsubscribe);
    return { unsubscribe };
  }),
}));

vi.mock('@parcel/watcher', () => ({
  subscribe: watcherMock.subscribe,
}));

describe('watcherService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    watcherMock.callbacks.clear();
    watcherMock.unsubscribes.clear();
    watcherMock.subscribe.mockClear();
    vi.resetModules();
  });

  it('debounces change notifications and ignores watcher errors', async () => {
    const { watchDirectory, disposeAllWatchers } = await import('../../../src/main/services/watcherService');
    const webContents = {
      isDestroyed: vi.fn(() => false),
      send: vi.fn(),
    } as unknown as WebContents;

    watchDirectory('/project', webContents);
    await vi.runAllTimersAsync();

    watcherMock.callbacks.get('/project')?.(null);
    watcherMock.callbacks.get('/project')?.(new Error('ignored'));
    watcherMock.callbacks.get('/project')?.(null);

    vi.advanceTimersByTime(149);
    expect(webContents.send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(webContents.send).toHaveBeenCalledTimes(1);
    expect(webContents.send).toHaveBeenCalledWith('fs:changed', { path: '/project' });

    await disposeAllWatchers();
    vi.useRealTimers();
  });

  it('shares subscriptions per path and unsubscribes after final release', async () => {
    const { watchDirectory, disposeAllWatchers } = await import('../../../src/main/services/watcherService');
    const webContents = {
      isDestroyed: vi.fn(() => false),
      send: vi.fn(),
    } as unknown as WebContents;

    const unwatchA = watchDirectory('/shared', webContents);
    const unwatchB = watchDirectory('/shared', webContents);
    await vi.runAllTimersAsync();

    expect(watcherMock.subscribe).toHaveBeenCalledTimes(1);

    unwatchA();
    expect(watcherMock.unsubscribes.get('/shared')).not.toHaveBeenCalled();

    unwatchB();
    expect(watcherMock.unsubscribes.get('/shared')).toHaveBeenCalledTimes(1);

    await disposeAllWatchers();
    vi.useRealTimers();
  });

  it('unsubscribes late native subscriptions when disposed before resolution', async () => {
    let resolveSubscription: (subscription: { unsubscribe: () => Promise<void> }) => void = () => {};
    const lateUnsubscribe = vi.fn(async () => undefined);
    watcherMock.subscribe.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubscription = resolve;
      }),
    );

    const { watchDirectory, disposeAllWatchers } = await import('../../../src/main/services/watcherService');
    const webContents = {
      isDestroyed: vi.fn(() => false),
      send: vi.fn(),
    } as unknown as WebContents;

    watchDirectory('/late', webContents);
    await disposeAllWatchers();
    resolveSubscription({ unsubscribe: lateUnsubscribe });
    await Promise.resolve();

    expect(lateUnsubscribe).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
