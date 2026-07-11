import { readdir, lstat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { SpaceAnalyzerNode, SpaceAnalyzerResult } from '../../shared/types/spaceAnalyzer';

const execAsync = promisify(exec);

let isScanAborted = false;

export function abortScan(): void {
  isScanAborted = true;
}

/**
 * Custom concurrency-limiting map helper.
 * This prevents running out of file descriptors (EMFILE error) when traversing massive directory trees recursively.
 */
async function limitConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const promises: Promise<void>[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const curIndex = index++;
      const item = items[curIndex];
      if (item === undefined) continue;
      results[curIndex] = await fn(item);
    }
  }

  for (let i = 0; i < Math.min(limit, items.length); i++) {
    promises.push(worker());
  }

  await Promise.all(promises);
  return results;
}

/**
 * Fetch disk total and free space for the path partition.
 */
export async function getDiskSpace(targetPath: string): Promise<{ total: number; free: number }> {
  const isWindows = process.platform === 'win32';
  try {
    if (isWindows) {
      const drive = targetPath.match(/^[a-zA-Z]:/)?.[0] ?? 'C:';
      const { stdout } = await execAsync(`wmic logicaldisk where DeviceID="${drive}" get FreeSpace,Size /format:list`);
      const freeMatch = stdout.match(/FreeSpace=(\d+)/i);
      const sizeMatch = stdout.match(/Size=(\d+)/i);
      if (freeMatch && sizeMatch && freeMatch[1] && sizeMatch[1]) {
        return {
          free: parseInt(freeMatch[1], 10),
          total: parseInt(sizeMatch[1], 10),
        };
      }
    } else {
      // macOS / Linux
      const { stdout } = await execAsync(`df -k "${targetPath}"`);
      const lines = stdout.trim().split('\n');
      const dataLine = lines[1];
      if (dataLine) {
        const parts = dataLine.split(/\s+/);
        const totalKB = parseInt(parts[1] ?? '0', 10);
        const freeKB = parseInt(parts[3] ?? '0', 10);
        if (totalKB > 0 && freeKB > 0) {
          return {
            total: totalKB * 1024,
            free: freeKB * 1024,
          };
        }
      }
    }
  } catch (err) {
    console.error('Failed to get disk space:', err);
  }
  return { total: 0, free: 0 };
}

/**
 * Inner recursive function to scan directory size and report file increments.
 * Tracks visited inodes to avoid double counting hard links. Skips symlinks.
 */
async function scanDirectorySizeRecursive(
  dirPath: string,
  maxDepth: number,
  currentDepth: number,
  reportProgress: (scannedPath: string, incrementalSize: number, incrementalFiles: number) => void,
  visitedInodes: Set<string>
): Promise<SpaceAnalyzerNode> {
  if (isScanAborted) {
    throw new Error('Scan cancelled by user');
  }
  const nodeName = basename(dirPath) || dirPath;

  try {
    const rootStat = await lstat(dirPath);

    if (rootStat.isSymbolicLink()) {
      return {
        name: nodeName,
        path: dirPath,
        size: 0,
        isDirectory: false,
        fileCount: 0,
      };
    }

    const inodeKey = `${rootStat.dev}:${rootStat.ino}`;
    if (visitedInodes.has(inodeKey)) {
      return {
        name: nodeName,
        path: dirPath,
        size: 0,
        isDirectory: rootStat.isDirectory(),
        fileCount: 0,
      };
    }
    visitedInodes.add(inodeKey);

    if (!rootStat.isDirectory()) {
      reportProgress(dirPath, rootStat.size, 1);
      return {
        name: nodeName,
        path: dirPath,
        size: rootStat.size,
        isDirectory: false,
        fileCount: 0,
      };
    }

    const entries = await readdir(dirPath, { withFileTypes: true });
    let totalSize = 0;
    let totalFiles = 0;

    // Process entries with controlled concurrency of 10 concurrent operations
    const childNodes = await limitConcurrency(entries, 10, async (entry) => {
      const fullPath = join(dirPath, entry.name);
      try {
        if (entry.isSymbolicLink()) {
          return null; // Ignore symlinks to prevent loops
        }

        if (entry.isDirectory()) {
          return await scanDirectorySizeRecursive(
            fullPath,
            maxDepth,
            currentDepth + 1,
            reportProgress,
            visitedInodes
          );
        } else {
          const fileStat = await lstat(fullPath);
          const childInodeKey = `${fileStat.dev}:${fileStat.ino}`;
          
          if (visitedInodes.has(childInodeKey)) {
            return null; // Hard link already counted
          }
          visitedInodes.add(childInodeKey);

          reportProgress(fullPath, fileStat.size, 1);
          return {
            name: entry.name,
            path: fullPath,
            size: fileStat.size,
            isDirectory: false,
            fileCount: 0,
          };
        }
      } catch {
        return null;
      }
    });

    const activeChildren: SpaceAnalyzerNode[] = [];
    for (const child of childNodes) {
      if (child) {
        totalSize += child.size;
        totalFiles += child.isDirectory ? child.fileCount : 1;
        activeChildren.push(child);
      }
    }

    // Sort by size descending
    activeChildren.sort((a, b) => b.size - a.size);

    let finalChildren: SpaceAnalyzerNode[] | undefined;

    if (currentDepth < maxDepth) {
      if (activeChildren.length > 15) {
        const top15 = activeChildren.slice(0, 15);
        const rest = activeChildren.slice(15);
        const restSize = rest.reduce((sum, c) => sum + c.size, 0);
        const restFiles = rest.reduce((sum, c) => sum + (c.isDirectory ? c.fileCount : 1), 0);

        top15.push({
          name: '[Other Files & Folders]',
          path: join(dirPath, '__other__'),
          size: restSize,
          isDirectory: false,
          fileCount: restFiles,
        });
        finalChildren = top15;
      } else {
        finalChildren = activeChildren;
      }
    }

    const resultNode: SpaceAnalyzerNode = {
      name: nodeName,
      path: dirPath,
      size: totalSize,
      isDirectory: true,
      fileCount: totalFiles,
    };

    if (finalChildren !== undefined) {
      resultNode.children = finalChildren;
    }

    return resultNode;
  } catch (error) {
    return {
      name: nodeName,
      path: dirPath,
      size: 0,
      isDirectory: true,
      fileCount: 0,
      children: [],
    };
  }
}

/**
 * Scan a directory path and report size statistics.
 * Calls progress callback during scanning to give feedback to UI.
 * Returns both scanned tree structure and disk partition sizes (total, free).
 */
export async function scanDirectorySize(
  dirPath: string,
  onProgress?: (scannedPath: string, fileCount: number, size: number) => void
): Promise<SpaceAnalyzerResult> {
  isScanAborted = false;
  const progressState = {
    fileCount: 0,
    totalSize: 0,
    lastReportTime: Date.now(),
  };

  const reportProgress = (scannedPath: string, incrementalSize: number, incrementalFiles: number) => {
    progressState.fileCount += incrementalFiles;
    progressState.totalSize += incrementalSize;
    const now = Date.now();
    // Throttle progress updates to avoid IPC overload
    if (now - progressState.lastReportTime > 100 || progressState.fileCount % 200 === 0) {
      progressState.lastReportTime = now;
      if (onProgress) {
        onProgress(scannedPath, progressState.fileCount, progressState.totalSize);
      }
    }
  };

  const visitedInodes = new Set<string>();
  const [rootNode, diskSpace] = await Promise.all([
    scanDirectorySizeRecursive(dirPath, 4, 0, reportProgress, visitedInodes),
    getDiskSpace(dirPath),
  ]);

  if (onProgress) {
    onProgress(rootNode.path, progressState.fileCount, rootNode.size);
  }

  return {
    rootNode,
    diskTotal: diskSpace.total,
    diskFree: diskSpace.free,
  };
}
