import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { app } from 'electron';
import type { FinderTag, NativeCapabilities, NativeMetadata, NativeThumbnail, OpenWithApp } from '@shared/types/native';
import { ThumbnailLruCache } from './thumbnailCache';

interface MorphNativeAddon {
  getMetadata: (path: string) => string;
  setTags: (path: string, tagsJson: string) => void;
  getThumbnail: (path: string, width: number, height: number, scale: number) => string;
  getOpenWithApps: (path: string) => string;
}

const require = createRequire(import.meta.url);
const thumbnailCache = new ThumbnailLruCache(256);

function addonCandidates(): string[] {
  const developmentPath = join(process.cwd(), 'native', 'macos', 'MorphNative.node');
  if (!app.isPackaged) return [developmentPath];
  return [join(process.resourcesPath, 'MorphNative.node'), developmentPath];
}

function loadAddon(): MorphNativeAddon | null {
  if (process.platform !== 'darwin') return null;
  for (const candidate of addonCandidates()) {
    if (!existsSync(candidate)) continue;
    try {
      return require(candidate) as MorphNativeAddon;
    } catch {
      // Try the next location; release builds use resources, development uses native/macos.
    }
  }
  return null;
}

const addon = loadAddon();

function parseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function nativeCapabilities(): NativeCapabilities {
  const isAvailable = addon !== null;
  return { isAvailable, supportsTags: isAvailable, supportsThumbnails: isAvailable, supportsOpenWith: isAvailable };
}

export function getNativeMetadata(path: string): NativeMetadata {
  if (addon === null) return { tags: [], spotlightKind: null, spotlightComment: null };
  return parseJson(addon.getMetadata(path), { tags: [], spotlightKind: null, spotlightComment: null });
}

export function setNativeTags(path: string, tags: FinderTag[]): void {
  addon?.setTags(path, JSON.stringify(tags));
}

export function getNativeThumbnail(path: string, width: number, height: number, scale: number): NativeThumbnail | null {
  if (addon === null) return null;
  const key = `${path}:${width}x${height}@${scale}`;
  const cached = thumbnailCache.get(key);
  if (cached !== undefined) return cached;
  const thumbnail = parseJson<NativeThumbnail | null>(addon.getThumbnail(path, width, height, scale), null);
  if (thumbnail !== null) thumbnailCache.set(key, thumbnail);
  return thumbnail;
}

export function getOpenWithApps(path: string): OpenWithApp[] {
  if (addon === null) return [];
  return parseJson(addon.getOpenWithApps(path), []);
}
