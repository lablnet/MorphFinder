import { describe, expect, it } from 'vitest';
import { createFsHandlers } from '../../src/main/ipc/fs.handlers';
import { createShellHandlers } from '../../src/main/ipc/shell.handlers';
import { createNativeHandlers } from '../../src/main/ipc/native.handlers';
import { createCacheHandlers } from '../../src/main/ipc/cache.handlers';
import { createAnalyzerHandlers } from '../../src/main/ipc/analyzer.handlers';
import { createGitHandlers } from '../../src/main/ipc/git.handlers';
import { createTerminalHandlers } from '../../src/main/ipc/terminal.handlers';
import { createDevPanelHandlers } from '../../src/main/ipc/devpanel.handlers';
import { createAnnotationHandlers } from '../../src/main/ipc/annotations.handlers';
import { createSearchHandlers } from '../../src/main/ipc/search.handlers';
import { createSmartCollectionsHandlers } from '../../src/main/ipc/smartCollections.handlers';
import { createDuplicateHandlers } from '../../src/main/ipc/duplicates.handlers';
import { createFileTimelineHandlers } from '../../src/main/ipc/fileTimeline.handlers';
import { createSnapshotHandlers } from '../../src/main/ipc/snapshots.handlers';
import { createArchiveHandlers } from '../../src/main/ipc/archive.handlers';
import type { BrowserWindow } from 'electron';

describe('IPC Contract Handlers Map', () => {
  const dummyWindow = {} as BrowserWindow;

  it('aggregates all IPC channel handlers cleanly', () => {
    const allHandlers = {
      ...createFsHandlers(dummyWindow),
      ...createShellHandlers(dummyWindow),
      ...createNativeHandlers(),
      ...createCacheHandlers(),
      ...createAnalyzerHandlers(dummyWindow),
      ...createGitHandlers(dummyWindow),
      ...createTerminalHandlers(dummyWindow),
      ...createDevPanelHandlers(),
      ...createAnnotationHandlers(),
      ...createSearchHandlers(),
      ...createSmartCollectionsHandlers(),
      ...createDuplicateHandlers(dummyWindow),
      ...createFileTimelineHandlers(),
      ...createSnapshotHandlers(),
      ...createArchiveHandlers(dummyWindow),
    };

    const channels = Object.keys(allHandlers);
    expect(channels).toContain('fs:readDirectory');
    expect(channels).toContain('shell:showInFolder');
    expect(channels).toContain('native:capabilities');
    expect(channels).toContain('cache:scan');
    expect(channels).toContain('git:status');
    expect(channels).toContain('snapshots:list');
    expect(channels).toContain('archive:compress');
    expect(channels.length).toBeGreaterThanOrEqual(30);
  });
});
