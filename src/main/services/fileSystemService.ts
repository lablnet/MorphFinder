import { basename, extname, join } from 'node:path';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readdir, readFile, rename as fsRename, rm, stat } from 'node:fs/promises';
import { app, shell } from 'electron';
import type { DirectoryListing, FileSystemNode } from '@shared/types/fileSystem';
import type { FileContentResponse } from '@shared/types/fileViewer';
import { MAX_FILE_READ_BYTES } from '@shared/types/fileViewer';

function isHiddenName(name: string): boolean {
  // Windows hidden attribute isn't exposed via node:fs without a native call;
  // dotfile convention is the cross-platform baseline every shell recognizes.
  return name.startsWith('.');
}

async function toFileSystemNode(parentDir: string, name: string): Promise<FileSystemNode | null> {
  const path = join(parentDir, name);
  try {
    const stats = await stat(path);
    return {
      path,
      name,
      kind: stats.isDirectory() ? 'directory' : stats.isSymbolicLink() ? 'symlink' : 'file',
      sizeInBytes: stats.size,
      modifiedAt: stats.mtimeMs,
      createdAt: stats.birthtimeMs,
      isHidden: isHiddenName(name),
      extension: stats.isDirectory() ? '' : extname(name).replace(/^\./, '').toLowerCase(),
    };
  } catch {
    // Permission-denied or a broken symlink target — caller marks the listing partial.
    return null;
  }
}

export async function readDirectory(path: string, includeHidden: boolean): Promise<DirectoryListing> {
  const entries = await readdir(path);
  const visibleEntries = includeHidden ? entries : entries.filter((name) => !isHiddenName(name));

  const results = await Promise.all(visibleEntries.map((name) => toFileSystemNode(path, name)));
  const nodes = results.filter((node): node is FileSystemNode => node !== null);

  return { path, nodes, hasPartialResults: nodes.length !== visibleEntries.length };
}

export async function renameEntry(path: string, newName: string): Promise<FileSystemNode> {
  const parentDir = join(path, '..');
  const destination = join(parentDir, newName);
  if (destination !== path && await pathExists(destination)) {
    throw new Error(`A file or folder named "${newName}" already exists.`);
  }
  await fsRename(path, destination);
  const node = await toFileSystemNode(parentDir, newName);
  if (node === null) throw new Error(`Renamed entry is no longer accessible: ${destination}`);
  return node;
}

export async function createFolder(parentPath: string, name: string): Promise<FileSystemNode> {
  const path = join(parentPath, name);
  await mkdir(path);
  const node = await toFileSystemNode(parentPath, name);
  if (node === null) throw new Error(`Created folder is not accessible: ${path}`);
  return node;
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function wellKnownDirectories(): {
  home: string;
  desktop: string;
  documents: string;
  downloads: string;
} {
  return {
    home: app.getPath('home'),
    desktop: app.getPath('desktop'),
    documents: app.getPath('documents'),
    downloads: app.getPath('downloads'),
  };
}

export async function trashPaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    await shell.trashItem(path);
  }
}

export async function deletePermanently(paths: string[]): Promise<void> {
  for (const path of paths) {
    await rm(path, { recursive: true, force: true });
  }
}

export async function emptyTrash(): Promise<void> {
  const trashPath = join(app.getPath('home'), '.Trash');
  try {
    const items = await readdir(trashPath);
    for (const item of items) {
      await rm(join(trashPath, item), { recursive: true, force: true });
    }
  } catch {
    // Trash may be empty or unreadable
  }
}

export async function restoreFromTrash(paths: string[]): Promise<void> {
  const desktopPath = app.getPath('desktop');
  for (const path of paths) {
    const filename = basename(path);
    const dest = join(desktopPath, filename);
    await fsRename(path, dest);
  }
}

export async function openPath(path: string): Promise<void> {
  const errorMessage = await shell.openPath(path);
  if (errorMessage !== '') throw new Error(errorMessage);
}

export function showItemInFolder(path: string): void {
  shell.showItemInFolder(path);
}

/** Known text-like extensions where we skip the binary heuristic. */
const KNOWN_TEXT_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts',
  'json', 'jsonc', 'json5', 'yaml', 'yml', 'toml', 'ini', 'cfg',
  'html', 'htm', 'css', 'scss', 'sass', 'less', 'xml', 'svg',
  'md', 'mdx', 'markdown', 'txt', 'log', 'csv', 'tsv',
  'py', 'rb', 'rs', 'go', 'java', 'kt', 'c', 'h', 'cpp', 'hpp', 'cs',
  'swift', 'dart', 'lua', 'r', 'pl', 'php', 'sh', 'bash', 'zsh',
  'sql', 'graphql', 'prisma', 'vue', 'svelte', 'astro',
  'diff', 'patch', 'env', 'gitignore', 'editorconfig', 'prettierrc',
  'dockerfile', 'makefile',
]);

function isBinaryBuffer(buffer: Buffer): boolean {
  // Check first 8KB for null bytes — a simple but effective heuristic.
  const checkLength = Math.min(buffer.length, 8192);
  for (let i = 0; i < checkLength; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

export async function readFileContent(
  path: string,
  maxBytes?: number,
): Promise<FileContentResponse> {
  const cap = maxBytes ?? MAX_FILE_READ_BYTES;
  const stats = await stat(path);
  const totalBytes = stats.size;
  const truncated = totalBytes > cap;

  const buffer = truncated
    ? await readPartialFile(path, cap)
    : await readFile(path);

  const ext = extname(path).replace(/^\./, '').toLowerCase();
  const isText = KNOWN_TEXT_EXTENSIONS.has(ext) || !isBinaryBuffer(buffer);

  return {
    content: isText ? buffer.toString('utf-8') : buffer.toString('base64'),
    encoding: isText ? 'utf-8' : 'base64',
    truncated,
    totalBytes,
  };
}

async function readPartialFile(path: string, bytes: number): Promise<Buffer> {
  const { open } = await import('node:fs/promises');
  const handle = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    await handle.read(buffer, 0, bytes, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}
