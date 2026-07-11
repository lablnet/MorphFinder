import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cp, rename } from 'node:fs/promises';
import { runFileOperation } from '@main/services/fileOperationService';
import { trashPaths } from '@main/services/fileSystemService';

vi.mock('node:fs/promises', () => ({
  cp: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@main/services/fileSystemService', () => ({
  trashPaths: vi.fn().mockResolvedValue(undefined),
}));

const cpMock = vi.mocked(cp);
const renameMock = vi.mocked(rename);
const trashPathsMock = vi.mocked(trashPaths);

function webContents() {
  return {
    isDestroyed: vi.fn(() => false),
    send: vi.fn(),
  };
}

async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

describe('runFileOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits initial and completed progress for copy batches', async () => {
    const contents = webContents();
    const operationId = runFileOperation(
      { kind: 'copy', sourcePaths: ['/src/a.txt', '/src/b.txt'], destinationDir: '/dest' },
      contents,
    );

    await flushPromises();

    expect(cpMock).toHaveBeenNthCalledWith(1, '/src/a.txt', '/dest/a.txt', {
      recursive: true,
      errorOnExist: false,
      force: true,
    });
    expect(cpMock).toHaveBeenNthCalledWith(2, '/src/b.txt', '/dest/b.txt', {
      recursive: true,
      errorOnExist: false,
      force: true,
    });
    expect(contents.send).toHaveBeenCalledWith('fs:operationProgress', {
      operationId,
      completed: 0,
      total: 2,
      currentPath: '/src/a.txt',
      done: false,
      error: undefined,
    });
    expect(contents.send).toHaveBeenLastCalledWith('fs:operationProgress', {
      operationId,
      completed: 2,
      total: 2,
      currentPath: '/src/b.txt',
      done: true,
      error: undefined,
    });
  });

  it('moves files by renaming them into the destination directory', async () => {
    const contents = webContents();

    runFileOperation({ kind: 'move', sourcePaths: ['/src/a.txt'], destinationDir: '/dest' }, contents);
    await flushPromises();

    expect(renameMock).toHaveBeenCalledWith('/src/a.txt', '/dest/a.txt');
  });

  it('trashes each source path', async () => {
    const contents = webContents();

    runFileOperation({ kind: 'trash', sourcePaths: ['/src/a.txt', '/src/b.txt'] }, contents);
    await flushPromises();

    expect(trashPathsMock).toHaveBeenNthCalledWith(1, ['/src/a.txt']);
    expect(trashPathsMock).toHaveBeenNthCalledWith(2, ['/src/b.txt']);
  });

  it('reports an error when copy or move lacks a destination', async () => {
    const contents = webContents();
    const operationId = runFileOperation({ kind: 'copy', sourcePaths: ['/src/a.txt'] }, contents);

    await flushPromises();

    expect(contents.send).toHaveBeenLastCalledWith('fs:operationProgress', {
      operationId,
      completed: 0,
      total: 1,
      currentPath: '',
      done: true,
      error: 'copy requires a destinationDir',
    });
  });

  it('does not emit progress to a destroyed webContents', async () => {
    const contents = webContents();
    contents.isDestroyed.mockReturnValue(true);

    runFileOperation({ kind: 'trash', sourcePaths: ['/src/a.txt'] }, contents);
    await flushPromises();

    expect(contents.send).not.toHaveBeenCalled();
  });
});
