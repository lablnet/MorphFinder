import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runFileOperation } from '@main/services/fileOperationService';
import { trashPaths } from '@main/services/fileSystemService';

vi.mock('@main/services/fileSystemService', () => ({
  trashPaths: vi.fn().mockResolvedValue(undefined),
}));

const trashPathsMock = vi.mocked(trashPaths);

const { accessMock, cpMock, renameMock } = vi.hoisted(() => ({
  accessMock: vi.fn().mockRejectedValue(new Error('not found')),
  cpMock: vi.fn().mockResolvedValue(undefined),
  renameMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    default: {
      ...actual,
      access: accessMock,
      cp: cpMock,
      rename: renameMock,
    },
    access: accessMock,
    cp: cpMock,
    rename: renameMock,
  };
});

function webContents() {
  return {
    isDestroyed: vi.fn(() => false),
    send: vi.fn(),
  };
}

describe('runFileOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMock.mockRejectedValue(new Error('not found'));
  });

  it('emits initial and completed progress for copy batches', async () => {
    const contents = webContents();
    const operationId = await runFileOperation(
      { kind: 'copy', sourcePaths: ['/src/a.txt', '/src/b.txt'], destinationDir: '/dest' },
      contents,
    );

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

    await runFileOperation({ kind: 'move', sourcePaths: ['/src/a.txt'], destinationDir: '/dest' }, contents);

    expect(renameMock).toHaveBeenCalledWith('/src/a.txt', '/dest/a.txt');
  });

  it('uses a duplicate name when copying into an existing destination', async () => {
    const contents = webContents();
    accessMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('not found'));

    await runFileOperation({ kind: 'copy', sourcePaths: ['/src/a.txt'], destinationDir: '/src' }, contents);

    expect(cpMock).toHaveBeenCalledWith('/src/a.txt', '/src/a_copy.txt', {
      recursive: true,
      errorOnExist: false,
      force: true,
    });
  });

  it('trashes each source path', async () => {
    const contents = webContents();

    await runFileOperation({ kind: 'trash', sourcePaths: ['/src/a.txt', '/src/b.txt'] }, contents);

    expect(trashPathsMock).toHaveBeenNthCalledWith(1, ['/src/a.txt']);
    expect(trashPathsMock).toHaveBeenNthCalledWith(2, ['/src/b.txt']);
  });

  it('reports an error when copy or move lacks a destination', async () => {
    const contents = webContents();
    const operationId = await runFileOperation({ kind: 'copy', sourcePaths: ['/src/a.txt'] }, contents);

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

    await runFileOperation({ kind: 'trash', sourcePaths: ['/src/a.txt'] }, contents);

    expect(contents.send).not.toHaveBeenCalled();
  });
});
