import { readdir, lstat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import type { FileSystemNode } from '@shared/types/fileSystem';
import type { SmartCollectionId, SmartCollectionRequest, SmartCollectionResult } from '@shared/types/smartCollections';
import { listDirectoryAnnotations } from './directoryAnnotationService';

const MAX_SCANNED_ENTRIES = 12_000;
const MAX_RESULTS = 200;
const MAX_DEPTH = 5;
const MAX_SCAN_MS = 7000;
const LARGE_FILE_BYTES = 100 * 1024 * 1024;
const RECENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const OLD_DOWNLOAD_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SKIP_DESCEND_DIRS = new Set([
  '.git',
  'node_modules',
  '.cache',
  '.next',
  '.turbo',
  'Library',
  'Applications',
  'Movies',
  'Music',
  'Pictures',
  '.Trash',
]);
const BUILD_ARTIFACT_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'target',
]);

interface WalkState {
  nodes: FileSystemNode[];
  scannedCount: number;
  truncated: boolean;
  startedAt: number;
}

function isHiddenName(name: string): boolean {
  return name.startsWith('.');
}

async function toNode(path: string): Promise<FileSystemNode | null> {
  try {
    const stats = await lstat(path);
    const name = basename(path) || path;
    const isDirectory = stats.isDirectory();
    return {
      path,
      name,
      kind: stats.isSymbolicLink() ? 'symlink' : isDirectory ? 'directory' : 'file',
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

function pushResult(state: WalkState, node: FileSystemNode): void {
  if (state.nodes.some((existing) => existing.path === node.path)) return;
  state.nodes.push(node);
  if (state.nodes.length >= MAX_RESULTS) state.truncated = true;
}

function shouldStop(state: WalkState, depth: number): boolean {
  if (state.truncated || depth > MAX_DEPTH) return true;
  if (state.scannedCount >= MAX_SCANNED_ENTRIES || state.nodes.length >= MAX_RESULTS) {
    state.truncated = true;
    return true;
  }
  if (Date.now() - state.startedAt >= MAX_SCAN_MS) {
    state.truncated = true;
    return true;
  }
  return false;
}

function canDescend(node: FileSystemNode, request: SmartCollectionRequest, depth: number): boolean {
  if (node.kind !== 'directory' || depth >= MAX_DEPTH) return false;
  if (SKIP_DESCEND_DIRS.has(node.name)) return false;
  if (!request.includeHidden && node.isHidden) return false;
  return true;
}

function isScreenshot(node: FileSystemNode): boolean {
  if (node.kind !== 'file') return false;
  const name = node.name.toLowerCase();
  const imageExtension = ['png', 'jpg', 'jpeg', 'webp'].includes(node.extension);
  return imageExtension && (name.includes('screenshot') || name.includes('screen shot'));
}

function isOldDownload(node: FileSystemNode, now: number): boolean {
  return node.kind === 'file' && now - node.modifiedAt >= OLD_DOWNLOAD_AGE_MS;
}

function shouldInclude(id: SmartCollectionId, node: FileSystemNode, now: number): boolean {
  if (id === 'recent') return now - node.modifiedAt <= RECENT_AGE_MS;
  if (id === 'large') return node.kind === 'file' && node.sizeInBytes >= LARGE_FILE_BYTES;
  if (id === 'screenshots') return isScreenshot(node);
  if (id === 'old-downloads') return isOldDownload(node, now);
  if (id === 'build-artifacts') return node.kind === 'directory' && BUILD_ARTIFACT_DIRS.has(node.name);
  return false;
}

async function walkRoots(
  request: SmartCollectionRequest,
  visitor: (node: FileSystemNode, state: WalkState) => Promise<void> | void,
): Promise<WalkState> {
  const state: WalkState = { nodes: [], scannedCount: 0, truncated: false, startedAt: Date.now() };

  async function walk(dirPath: string, depth: number): Promise<void> {
    if (shouldStop(state, depth)) return;

    let entries: string[];
    try {
      entries = await readdir(dirPath);
    } catch {
      return;
    }

    entries.sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }));

    for (const entry of entries) {
      const isHidden = isHiddenName(entry);
      if (!request.includeHidden && isHidden) continue;
      if (shouldStop(state, depth)) return;

      const path = join(dirPath, entry);
      const node = await toNode(path);
      if (node === null) continue;
      state.scannedCount += 1;
      await visitor(node, state);

      if (canDescend(node, request, depth)) {
        await walk(node.path, depth + 1);
      }
    }
  }

  for (const root of request.roots) {
    await walk(root, 0);
    if (state.truncated) break;
  }

  return state;
}

async function collectSimple(request: SmartCollectionRequest): Promise<WalkState> {
  const now = Date.now();
  const state = await walkRoots(request, (node, currentState) => {
    if (shouldInclude(request.id, node, now)) pushResult(currentState, node);
  });
  return state;
}

async function collectEmptyFolders(request: SmartCollectionRequest): Promise<WalkState> {
  const state = await walkRoots(request, async (node, currentState) => {
    if (node.kind !== 'directory') return;
    try {
      const entries = await readdir(node.path);
      const visibleEntries = request.includeHidden ? entries : entries.filter((entry) => !isHiddenName(entry));
      if (visibleEntries.length === 0) pushResult(currentState, node);
    } catch {
      return;
    }
  });
  return state;
}

async function collectDuplicates(request: SmartCollectionRequest): Promise<WalkState> {
  const buckets = new Map<string, FileSystemNode[]>();
  const state = await walkRoots(request, (node) => {
    if (node.kind !== 'file' || node.sizeInBytes === 0) return;
    const key = `${node.sizeInBytes}:${node.name.toLowerCase()}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(node);
    buckets.set(key, bucket);
  });

  state.nodes = [...buckets.values()]
    .filter((bucket) => bucket.length > 1)
    .flat()
    .slice(0, MAX_RESULTS);
  state.truncated = state.truncated || state.nodes.length >= MAX_RESULTS;
  return state;
}

async function collectAnnotated(): Promise<WalkState> {
  const annotations = await listDirectoryAnnotations();
  const state: WalkState = { nodes: [], scannedCount: annotations.length, truncated: false, startedAt: Date.now() };
  for (const annotation of annotations) {
    if (annotation.tags.length === 0 && annotation.notes.trim().length === 0) continue;
    const node = await toNode(annotation.path);
    if (node !== null) pushResult(state, node);
  }
  return state;
}

function sortResults(id: SmartCollectionId, nodes: FileSystemNode[]): FileSystemNode[] {
  if (id === 'large' || id === 'duplicates' || id === 'build-artifacts') {
    return [...nodes].sort((left, right) => right.sizeInBytes - left.sizeInBytes);
  }
  return [...nodes].sort((left, right) => right.modifiedAt - left.modifiedAt);
}

export async function scanSmartCollection(request: SmartCollectionRequest): Promise<SmartCollectionResult> {
  const state = request.id === 'annotated'
    ? await collectAnnotated()
    : request.id === 'duplicates'
      ? await collectDuplicates(request)
      : request.id === 'empty-folders'
        ? await collectEmptyFolders(request)
        : await collectSimple(request);

  return {
    id: request.id,
    nodes: sortResults(request.id, state.nodes).slice(0, MAX_RESULTS),
    scannedCount: state.scannedCount,
    truncated: state.truncated,
  };
}
