import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  readDirectory,
  pathExists,
  openPath,
  showItemInFolder,
  readFileContent,
  wellKnownDirectories,
  trashPaths,
  deletePermanently,
  emptyTrash,
} from '../../src/main/services/fileSystemService';

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((name) => `/mock/${name}`),
  },
  shell: {
    openPath: vi.fn().mockResolvedValue(''),
    showItemInFolder: vi.fn(),
    trashItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('fileSystemService Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets well-known directories', () => {
    const dirs = wellKnownDirectories();
    expect(dirs).toHaveProperty('home');
    expect(dirs).toHaveProperty('desktop');
    expect(dirs).toHaveProperty('documents');
    expect(dirs).toHaveProperty('downloads');
  });

  it('checks pathExists for current directory', async () => {
    const cwd = process.cwd();
    const exists = await pathExists(cwd);
    expect(exists).toBe(true);
  });

  it('reads directory and reads file content', async () => {
    const cwd = process.cwd();
    const listing = await readDirectory(cwd, false);
    expect(listing).toHaveProperty('nodes');

    const pkgPath = `${cwd}/package.json`;
    const fileContent = await readFileContent(pkgPath, 100);
    expect(fileContent.content).toBeDefined();
    expect(fileContent.encoding).toBe('utf-8');
  });

  it('handles trash and shell operations', async () => {
    const cwd = process.cwd();
    await openPath(cwd);
    showItemInFolder(cwd);
    await trashPaths(['/tmp/mockfile']);
    await deletePermanently(['/tmp/mockfile']);
    await emptyTrash();
  });
});
