import { readdir, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import type { FileTimelineItem, FileTimelineScanRequest, FileTimelineScanResult } from '@shared/types/fileTimeline';
import { getGitStatus } from './gitService';

const SKIPPED_DIRS = new Set([
  '.git',
  'node_modules',
  '.cache',
  '.next',
  '.turbo',
  'dist',
  'build',
  'out',
  'coverage',
  'Library',
  'Applications',
  'System',
  'Volumes',
  'private',
  'proc',
  'dev',
  'sys',
  'run',
  'tmp',
  'var',
]);

function shouldSkipDir(name: string, includeHidden: boolean): boolean {
  if (!includeHidden && name.startsWith('.')) return true;
  return SKIPPED_DIRS.has(name);
}

function toTimelineItem(path: string, sizeInBytes: number, createdAt: number, modifiedAt: number): FileTimelineItem {
  const eventKind = createdAt >= modifiedAt - 1000 ? 'created' : 'modified';
  return {
    path,
    name: basename(path),
    extension: extname(path).replace(/^\./, '').toLowerCase(),
    sizeInBytes,
    createdAt,
    modifiedAt,
    eventAt: Math.max(createdAt, modifiedAt),
    eventKind,
  };
}

export async function scanFileTimeline(request: FileTimelineScanRequest): Promise<FileTimelineScanResult> {
  const cutoff = Date.now() - request.days * 24 * 60 * 60 * 1000;
  const items: FileTimelineItem[] = [];
  let scannedCount = 0;

  async function walk(dirPath: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (items.length >= request.maxItems) return;
      if (!request.includeHidden && entry.name.startsWith('.')) continue;

      const entryPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!shouldSkipDir(entry.name, request.includeHidden)) await walk(entryPath);
        continue;
      }
      if (!entry.isFile()) continue;

      scannedCount += 1;
      try {
        const details = await stat(entryPath);
        const createdAt = details.birthtimeMs;
        const modifiedAt = details.mtimeMs;
        if (Math.max(createdAt, modifiedAt) < cutoff) continue;
        items.push(toTimelineItem(entryPath, details.size, createdAt, modifiedAt));
      } catch {
        continue;
      }
    }
  }

  await walk(request.rootPath);

  const gitStatus = await getGitStatus(request.rootPath);
  const withGit = items.map((item) => {
    const status = gitStatus.statusMap[item.path];
    return status === undefined ? item : { ...item, gitStatus: status };
  });

  withGit.sort((left, right) => right.eventAt - left.eventAt);

  return {
    rootPath: request.rootPath,
    items: withGit,
    scannedCount,
    isGitRepo: gitStatus.isRepo,
    repoRoot: gitStatus.repoRoot,
  };
}
