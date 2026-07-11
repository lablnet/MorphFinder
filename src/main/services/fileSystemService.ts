import { extname, join } from 'node:path';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readdir, rename as fsRename, stat } from 'node:fs/promises';
import { app, shell } from 'electron';
import type { DirectoryListing, FileSystemNode } from '@shared/types/fileSystem';

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

export async function openPath(path: string): Promise<void> {
  const errorMessage = await shell.openPath(path);
  if (errorMessage !== '') throw new Error(errorMessage);
}

export function showItemInFolder(path: string): void {
  shell.showItemInFolder(path);
}
