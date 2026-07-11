import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { FileSearchRequest, FileSearchResult } from '@shared/types/fileSearch';
import type { FileSystemNode } from '@shared/types/fileSystem';

const DEFAULT_MAX_RESULTS = 60;
const DEFAULT_MAX_DEPTH = 5;
const MAX_SCANNED_ENTRIES = 20_000;
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'out',
  'build',
  '.next',
  '.turbo',
  '.cache',
]);

function isHiddenName(name: string): boolean {
  return name.startsWith('.');
}

function scoreName(name: string, query: string): number {
  const lowerName = name.toLowerCase();
  if (lowerName === query) return 0;
  if (lowerName.startsWith(query)) return 1;
  if (lowerName.includes(query)) return 2;
  return 3;
}

async function toSearchNode(parentDir: string, name: string): Promise<FileSystemNode | null> {
  const path = join(parentDir, name);
  try {
    const stats = await stat(path);
    const isDirectory = stats.isDirectory();
    return {
      path,
      name,
      kind: isDirectory ? 'directory' : stats.isSymbolicLink() ? 'symlink' : 'file',
      sizeInBytes: stats.size,
      modifiedAt: stats.mtimeMs,
      createdAt: stats.birthtimeMs,
      isHidden: isHiddenName(name),
      extension: isDirectory ? '' : extname(name).replace(/^\./, '').toLowerCase(),
    };
  } catch {
    return null;
  }
}

export async function searchFiles(request: FileSearchRequest): Promise<FileSearchResult> {
  const query = request.query.trim().toLowerCase();
  const maxResults = request.maxResults ?? DEFAULT_MAX_RESULTS;
  const maxDepth = request.maxDepth ?? DEFAULT_MAX_DEPTH;
  const matches: FileSystemNode[] = [];
  let scannedCount = 0;
  let truncated = false;

  if (query.length < 2) {
    return { rootPath: request.rootPath, query: request.query, matches, scannedCount, truncated };
  }

  async function walk(dirPath: string, depth: number): Promise<void> {
    if (truncated || depth > maxDepth || matches.length >= maxResults || scannedCount >= MAX_SCANNED_ENTRIES) {
      truncated = true;
      return;
    }

    let entries: string[];
    try {
      entries = await readdir(dirPath);
    } catch {
      return;
    }

    entries.sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }));

    for (const name of entries) {
      if (!request.includeHidden && isHiddenName(name)) continue;
      if (scannedCount >= MAX_SCANNED_ENTRIES || matches.length >= maxResults) {
        truncated = true;
        return;
      }

      scannedCount += 1;
      const node = await toSearchNode(dirPath, name);
      if (node === null) continue;

      if (node.name.toLowerCase().includes(query)) {
        matches.push(node);
        matches.sort((left, right) => {
          const scoreDelta = scoreName(left.name, query) - scoreName(right.name, query);
          if (scoreDelta !== 0) return scoreDelta;
          if (left.kind !== right.kind) return left.kind === 'directory' ? -1 : 1;
          return left.path.localeCompare(right.path, undefined, { sensitivity: 'base' });
        });
      }

      if (
        node.kind === 'directory' &&
        depth < maxDepth &&
        !IGNORED_DIRECTORIES.has(node.name) &&
        (request.includeHidden || !node.isHidden)
      ) {
        await walk(node.path, depth + 1);
      }
    }
  }

  await walk(request.rootPath, 0);

  return {
    rootPath: request.rootPath,
    query: request.query,
    matches: matches.slice(0, maxResults),
    scannedCount,
    truncated,
  };
}
