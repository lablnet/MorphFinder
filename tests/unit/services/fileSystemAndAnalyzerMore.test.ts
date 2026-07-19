import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createFolder,
  deletePermanently,
  emptyTrash,
  openPath,
  pathExists,
  readDirectory,
  readFileContent,
  renameEntry,
  restoreFromTrash,
  showItemInFolder,
  trashPaths,
  wellKnownDirectories,
} from '../../../src/main/services/fileSystemService';
import { abortScan, getDiskSpace, scanDirectorySize } from '../../../src/main/services/spaceAnalyzerService';

const electronState = vi.hoisted(() => ({
  trashItem: vi.fn(async () => undefined),
  openPath: vi.fn(async () => ''),
  showItemInFolder: vi.fn(),
  paths: { home: '/mock/home', desktop: '/mock/desktop', documents: '/mock/documents', downloads: '/mock/downloads' } as Record<string, string>,
}));

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => electronState.paths[name] ?? `/mock/${name}`,
  },
  shell: {
    trashItem: (...args: any[]) => electronState.trashItem(...args),
    openPath: (...args: any[]) => electronState.openPath(...args),
    showItemInFolder: (...args: any[]) => electronState.showItemInFolder(...args),
  },
}));

let root: string;

async function makeTempRoot() {
  root = await mkdtemp(join(tmpdir(), 'morphfinder-tests-'));
  electronState.paths = {
    home: root,
    desktop: join(root, 'Desktop'),
    documents: join(root, 'Documents'),
    downloads: join(root, 'Downloads'),
  };
  await mkdir(electronState.paths.desktop, { recursive: true });
  await mkdir(electronState.paths.documents, { recursive: true });
  await mkdir(electronState.paths.downloads, { recursive: true });
}

describe('file system and analyzer services', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await makeTempRoot();
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('reads directories, creates folders, renames entries, and reads text/binary content', async () => {
    await writeFile(join(root, 'file.txt'), 'hello');
    await writeFile(join(root, '.hidden'), 'secret');
    await writeFile(join(root, 'bin.dat'), Buffer.from([0, 1, 2, 3]));

    const visible = await readDirectory(root, false);
    const visibleNames = visible.nodes.map((node) => node.name);
    expect(visibleNames).toEqual(expect.arrayContaining(['bin.dat', 'file.txt']));
    expect(visibleNames).not.toContain('.hidden');

    const all = await readDirectory(root, true);
    expect(all.nodes.some((node) => node.name === '.hidden' && node.isHidden)).toBe(true);

    const created = await createFolder(root, 'created');
    expect(created.kind).toBe('directory');

    const renamed = await renameEntry(join(root, 'file.txt'), 'renamed.md');
    expect(renamed.name).toBe('renamed.md');
    await expect(renameEntry(join(root, 'renamed.md'), 'bin.dat')).rejects.toThrow(/already exists/i);

    expect(await pathExists(join(root, 'renamed.md'))).toBe(true);
    expect(await pathExists(join(root, 'missing.md'))).toBe(false);

    const text = await readFileContent(join(root, 'renamed.md'));
    expect(text).toMatchObject({ content: 'hello', encoding: 'utf-8', truncated: false, totalBytes: 5 });

    const binary = await readFileContent(join(root, 'bin.dat'));
    expect(binary.encoding).toBe('base64');

    await writeFile(join(root, 'long.txt'), 'abcdef');
    const truncated = await readFileContent(join(root, 'long.txt'), 3);
    expect(truncated).toMatchObject({ content: 'abc', truncated: true, totalBytes: 6 });
  });

  it('wraps electron shell helpers and destructive filesystem helpers', async () => {
    await writeFile(join(root, 'delete-me.txt'), 'gone');
    await deletePermanently([join(root, 'delete-me.txt')]);
    expect(await pathExists(join(root, 'delete-me.txt'))).toBe(false);

    await trashPaths(['/tmp/a', '/tmp/b']);
    expect(electronState.trashItem).toHaveBeenCalledTimes(2);

    electronState.openPath.mockResolvedValueOnce('denied');
    await expect(openPath('/blocked')).rejects.toThrow('denied');
    electronState.openPath.mockResolvedValueOnce('');
    await openPath('/ok');

    showItemInFolder('/shown');
    expect(electronState.showItemInFolder).toHaveBeenCalledWith('/shown');
    expect(wellKnownDirectories()).toEqual(electronState.paths);

    await mkdir(join(root, '.Trash'));
    await writeFile(join(root, '.Trash', 'old.txt'), 'trash');
    await emptyTrash();

    await writeFile(join(root, 'from-trash.txt'), 'restore');
    await restoreFromTrash([join(root, 'from-trash.txt')]);
  });

  it('scans directory sizes, skips symlinks, groups large child lists, and can abort', async () => {
    await mkdir(join(root, 'src'));
    await writeFile(join(root, 'src', 'a.txt'), 'a'.repeat(10));
    await writeFile(join(root, 'b.txt'), 'b'.repeat(20));
    await symlink(join(root, 'src'), join(root, 'link-to-src'));

    const progress: Array<{ path: string; count: number; size: number }> = [];
    const result = await scanDirectorySize(root, (path, count, size) => progress.push({ path, count, size }));
    expect(result.rootNode.isDirectory).toBe(true);
    expect(result.rootNode.size).toBeGreaterThanOrEqual(30);
    expect(result.rootNode.children?.some((child) => child.name === 'link-to-src')).toBe(false);
    expect(progress.length).toBeGreaterThan(0);

    const disk = await getDiskSpace(root);
    expect(disk.total).toBeGreaterThanOrEqual(0);

    abortScan();
    await expect(scanDirectorySize(root)).resolves.toMatchObject({ rootNode: expect.objectContaining({ path: root }) });
  });
});
