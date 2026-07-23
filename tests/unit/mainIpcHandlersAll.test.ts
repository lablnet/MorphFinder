import { describe, it, vi, beforeEach } from 'vitest';
import { createFsHandlers } from '../../src/main/ipc/fs.handlers';
import { createShellHandlers } from '../../src/main/ipc/shell.handlers';
import { createNativeHandlers } from '../../src/main/ipc/native.handlers';
import { createCacheHandlers } from '../../src/main/ipc/cache.handlers';
import { createAnalyzerHandlers } from '../../src/main/ipc/analyzer.handlers';
import { createGitHandlers } from '../../src/main/ipc/git.handlers';
import { createDevPanelHandlers } from '../../src/main/ipc/devpanel.handlers';
import { createAnnotationHandlers } from '../../src/main/ipc/annotations.handlers';
import { createSearchHandlers } from '../../src/main/ipc/search.handlers';
import { createSmartCollectionsHandlers } from '../../src/main/ipc/smartCollections.handlers';
import { createDuplicateHandlers } from '../../src/main/ipc/duplicates.handlers';
import { createFileTimelineHandlers } from '../../src/main/ipc/fileTimeline.handlers';
import { createSnapshotHandlers } from '../../src/main/ipc/snapshots.handlers';
import { createArchiveHandlers } from '../../src/main/ipc/archive.handlers';

const mockWin: any = {
  id: 1,
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: {
    isDestroyed: vi.fn().mockReturnValue(false),
    send: vi.fn(),
  },
};

vi.mock('../../src/main/services/fileSystemService', () => ({
  readDirectory: vi.fn().mockResolvedValue({ nodes: [] }),
  statPath: vi.fn().mockResolvedValue({ kind: 'file', size: 100 }),
  existsPath: vi.fn().mockResolvedValue(true),
  pathExists: vi.fn().mockResolvedValue(true),
  openPath: vi.fn().mockResolvedValue(undefined),
  showItemInFolder: vi.fn(),
  renameEntry: vi.fn().mockResolvedValue({ name: 'renamed' }),
  readFileContent: vi.fn().mockResolvedValue({ content: 'test', mimeType: 'text/plain', size: 4 }),
  writeFileContent: vi.fn().mockResolvedValue(undefined),
  createFolder: vi.fn().mockResolvedValue('/tmp/newfolder'),
  trashPaths: vi.fn().mockResolvedValue(undefined),
  copyItems: vi.fn().mockResolvedValue(undefined),
  moveItems: vi.fn().mockResolvedValue(undefined),
  renameItem: vi.fn().mockResolvedValue('/tmp/renamed'),
  getWellKnownDirectories: vi.fn().mockResolvedValue({ home: '/home' }),
  watchDirectory: vi.fn().mockResolvedValue('watcher-1'),
  unwatchDirectory: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/main/services/cacheCleanerService', () => ({
  scanCaches: vi.fn().mockResolvedValue({ items: [], totalSizeBytes: 0 }),
  cleanCaches: vi.fn().mockResolvedValue({ cleanedBytes: 0, cleanedCount: 0 }),
}));

vi.mock('../../src/main/services/archiveService', () => ({
  archiveService: {
    compress: vi.fn().mockResolvedValue({ archivePath: '/tmp/archive.zip' }),
    extract: vi.fn().mockResolvedValue({ extractedDir: '/tmp/extracted' }),
    cancel: vi.fn(),
  },
}));

vi.mock('electron', async (importOriginal) => {
  const actual = await importOriginal<typeof import('electron')>();
  return {
    ...actual,
    app: {
      isPackaged: false,
      getAppPath: () => '/app',
      getPath: () => '/home',
      name: 'MorphFinder',
    },
    shell: {
      openPath: vi.fn().mockResolvedValue(''),
      showItemInFolder: vi.fn(),
      trashItem: vi.fn().mockResolvedValue(undefined),
    },
    dialog: {
      showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['/tmp/selected'] }),
      showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: '/tmp/saved.txt' }),
    },
    BrowserWindow: {
      fromWebContents: vi.fn(() => mockWin),
      getFocusedWindow: vi.fn(() => mockWin),
      getAllWindows: vi.fn(() => [mockWin]),
    },
  };
});

describe('All Main IPC Handlers Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exercises fs handlers', async () => {
    const handlers = createFsHandlers(mockWin);
    await handlers['fs:readDirectory']({ path: '/tmp', includeHidden: false });
    await handlers['fs:readFile']({ path: '/tmp/file.txt' });
    await handlers['fs:createFolder']({ parentPath: '/tmp', name: 'newfolder' });
    await handlers['fs:rename']({ path: '/tmp/old', newName: 'new' });
    await handlers['fs:operate']({ kind: 'copy', sourcePaths: ['/tmp/a'], destinationDir: '/tmp/b' });
  });

  it('exercises shell handlers', async () => {
    const handlers = createShellHandlers(mockWin);
    await handlers['shell:open']({ path: '/tmp/file.txt' });
    await handlers['shell:showInFolder']({ path: '/tmp/file.txt' });
    await handlers['shell:selectFolder']({ defaultPath: '/tmp' });
  });

  it('exercises native handlers', async () => {
    const handlers = createNativeHandlers();
    await handlers['native:capabilities'](undefined);
    await handlers['native:metadata']({ path: process.cwd() });
    await handlers['native:openWithApps']({ path: process.cwd() });
    await handlers['native:getLocations'](undefined);
  });

  it('exercises cache handlers', async () => {
    const handlers = createCacheHandlers();
    await handlers['cache:scan'](undefined);
  });

  it('exercises analyzer handlers', async () => {
    const handlers = createAnalyzerHandlers(mockWin);
    await handlers['analyzer:scan']({ path: '/tmp' });
  });

  it('exercises git, devpanel, annotations, search handlers', async () => {
    const gitHandlers = createGitHandlers(mockWin);
    await gitHandlers['git:status']({ path: process.cwd() });

    const devHandlers = createDevPanelHandlers();
    await devHandlers['devpanel:scan']({ path: process.cwd() });

    const annHandlers = createAnnotationHandlers();
    await annHandlers['annotations:get']({ path: '/tmp' });

    const searchHandlers = createSearchHandlers();
    await searchHandlers['search:files']({ rootPath: '/tmp', query: 'test' });
  });

  it('exercises smartCollections, duplicates, fileTimeline, snapshots, archive handlers', async () => {
    const smartHandlers = createSmartCollectionsHandlers();
    await smartHandlers['smartCollections:scan']({ name: 'docs', roots: ['/tmp'], rules: [] });

    const dupHandlers = createDuplicateHandlers(mockWin);
    await dupHandlers['duplicates:scan']({ roots: ['/tmp'] } as any);

    const timelineHandlers = createFileTimelineHandlers();
    await timelineHandlers['timeline:scan']({ path: '/tmp' });

    const snapHandlers = createSnapshotHandlers();
    await snapHandlers['snapshots:list'](undefined);

    const archHandlers = createArchiveHandlers(mockWin);
    await archHandlers['archive:compress']({ paths: ['/tmp/file.txt'] });
  });
});
