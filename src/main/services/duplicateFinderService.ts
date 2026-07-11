import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { DuplicateFile, DuplicateGroup, DuplicateScanRequest, DuplicateScanResult } from '@shared/types/duplicates';

const DEFAULT_MIN_SIZE_BYTES = 1024;
const SKIP_DESCEND_DIRS = new Set([
  '.git',
  'node_modules',
  '.cache',
  '.next',
  '.turbo',
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
  'Windows',
  'Program Files',
  'Program Files (x86)',
  'ProgramData',
  '$Recycle.Bin',
  '.Trash',
]);

interface CandidateFile {
  path: string;
  name: string;
  sizeInBytes: number;
  modifiedAt: number;
}

interface ScanState {
  scannedCount: number;
  hashedCount: number;
  cancelled: boolean;
  startedAt: number;
  lastProgressAt: number;
}

interface DuplicateProgress {
  phase: 'scanning' | 'hashing';
  scannedCount: number;
  hashedCount: number;
  groupsFound: number;
  currentPath: string;
  groups: DuplicateGroup[];
}

let cancelRequested = false;
let activeHashStream: ReturnType<typeof createReadStream> | null = null;

export function cancelDuplicateScan(): void {
  cancelRequested = true;
  activeHashStream?.destroy();
}

function isHiddenName(name: string): boolean {
  return name.startsWith('.');
}

function shouldStop(state: ScanState): boolean {
  if (cancelRequested) {
    state.cancelled = true;
    return true;
  }
  return false;
}

function groupsFromHashBuckets(hashBuckets: Map<string, DuplicateFile[]>): DuplicateGroup[] {
  return [...hashBuckets.values()]
    .filter((files) => files.length > 1)
    .map((files) => ({
      id: `${files[0]!.sizeInBytes}:${files[0]!.hash}`,
      hash: files[0]!.hash,
      sizeInBytes: files[0]!.sizeInBytes,
      files: files.sort((left, right) => right.modifiedAt - left.modifiedAt),
    }))
    .sort((left, right) => right.sizeInBytes - left.sizeInBytes);
}

function emitProgress(
  state: ScanState,
  onProgress: ((progress: DuplicateProgress) => void) | undefined,
  phase: DuplicateProgress['phase'],
  currentPath: string,
  groups: DuplicateGroup[],
  force = false,
): void {
  if (onProgress === undefined) return;
  const now = Date.now();
  if (!force && now - state.lastProgressAt < 150) return;
  state.lastProgressAt = now;
  onProgress({
    phase,
    scannedCount: state.scannedCount,
    hashedCount: state.hashedCount,
    groupsFound: groups.length,
    currentPath,
    groups,
  });
}

async function hashFile(path: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (cancelRequested) {
      resolve(null);
      return;
    }
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    activeHashStream = stream;
    let settled = false;
    const finish = (value: string | null): void => {
      if (settled) return;
      settled = true;
      if (activeHashStream === stream) activeHashStream = null;
      resolve(value);
    };
    stream.on('data', (chunk) => {
      if (cancelRequested) {
        stream.destroy();
        return;
      }
      hash.update(chunk);
    });
    stream.on('error', () => finish(null));
    stream.on('close', () => {
      if (cancelRequested) finish(null);
    });
    stream.on('end', () => finish(cancelRequested ? null : hash.digest('hex')));
  });
}

export async function scanDuplicates(
  request: DuplicateScanRequest,
  onProgress?: (progress: DuplicateProgress) => void,
): Promise<DuplicateScanResult> {
  cancelRequested = false;
  const minSizeBytes = request.minSizeBytes ?? DEFAULT_MIN_SIZE_BYTES;
  const state: ScanState = { scannedCount: 0, hashedCount: 0, cancelled: false, startedAt: Date.now(), lastProgressAt: 0 };
  const sizeBuckets = new Map<number, CandidateFile[]>();
  const hashBuckets = new Map<string, DuplicateFile[]>();
  const hashedPaths = new Set<string>();

  async function hashCandidateBucket(bucket: CandidateFile[]): Promise<void> {
    if (bucket.length < 2) return;
    for (const file of bucket) {
      if (hashedPaths.has(file.path) || shouldStop(state)) continue;
      hashedPaths.add(file.path);
      const hash = await hashFile(file.path);
      if (shouldStop(state)) break;
      if (hash === null) continue;
      state.hashedCount += 1;
      const key = `${file.sizeInBytes}:${hash}`;
      const files = hashBuckets.get(key) ?? [];
      files.push({ ...file, hash });
      hashBuckets.set(key, files);
      emitProgress(state, onProgress, 'hashing', file.path, groupsFromHashBuckets(hashBuckets), true);
    }
  }

  async function walk(dirPath: string, depth: number): Promise<void> {
    if (shouldStop(state)) return;

    let entries: string[];
    try {
      entries = await readdir(dirPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!request.includeHidden && isHiddenName(entry)) continue;
      if (shouldStop(state)) return;

      const path = join(dirPath, entry);
      try {
        const stats = await lstat(path);
        state.scannedCount += 1;
        emitProgress(state, onProgress, 'scanning', path, []);

        if (stats.isSymbolicLink()) continue;
        if (stats.isDirectory()) {
          if (!SKIP_DESCEND_DIRS.has(entry)) {
            await walk(path, depth + 1);
          }
          continue;
        }
        if (!stats.isFile() || stats.size < minSizeBytes) continue;

        const bucket = sizeBuckets.get(stats.size) ?? [];
        const candidate = {
          path,
          name: basename(path),
          sizeInBytes: stats.size,
          modifiedAt: stats.mtimeMs,
        };
        bucket.push(candidate);
        sizeBuckets.set(stats.size, bucket);
        await hashCandidateBucket(bucket);
      } catch {
        continue;
      }
    }
  }

  for (const root of request.roots) {
    await walk(root, 0);
    if (state.cancelled) break;
  }

  const groups = groupsFromHashBuckets(hashBuckets);

  emitProgress(state, onProgress, 'hashing', '', groups, true);
  cancelRequested = false;

  return {
    groups,
    scannedCount: state.scannedCount,
    hashedCount: state.hashedCount,
    truncated: false,
  };
}
