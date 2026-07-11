import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { app, nativeImage } from 'electron';
import type { FinderTag, NativeCapabilities, NativeMetadata, NativeThumbnail, OpenWithApp } from '@shared/types/native';
import { ThumbnailLruCache } from './thumbnailCache';

interface MorphNativeAddon {
  getMetadata: (path: string) => string;
  setTags: (path: string, tagsJson: string) => void;
  getThumbnail: (path: string, width: number, height: number, scale: number) => string;
  getOpenWithApps: (path: string) => string;
}

const requireFn = createRequire(import.meta.url);
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
      return requireFn(candidate) as MorphNativeAddon;
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
  const appendLog = (msg: string) => {
    try {
      const fs = requireFn('node:fs');
      fs.appendFileSync('/Users/lablnet/projects/lablnet/apps/MorphFinder/debug_thumbnail.log', `${new Date().toISOString()} - ${msg}\n`);
    } catch {}
  };

  appendLog(`getNativeThumbnail called for: ${path}`);

  const key = `${path}:${width}x${height}@${scale}`;
  const cached = thumbnailCache.get(key);
  if (cached !== undefined) {
    appendLog(`Cache hit for ${path}`);
    return cached;
  }

  if (addon !== null) {
    try {
      appendLog(`Calling addon.getThumbnail for ${path}`);
      const thumbnail = parseJson<NativeThumbnail | null>(addon.getThumbnail(path, width, height, scale), null);
      if (thumbnail !== null) {
        appendLog(`Addon succeeded for ${path}`);
        thumbnailCache.set(key, thumbnail);
        return thumbnail;
      }
      appendLog(`Addon returned null for ${path}`);
    } catch (err) {
      appendLog(`Addon threw error for ${path}: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    appendLog(`Addon is null`);
  }

  // Fallback: Try Electron's nativeImage (handles magic byte parsing directly)
  try {
    appendLog(`Trying nativeImage fallback for ${path}`);
    const img = nativeImage.createFromPath(path);
    appendLog(`nativeImage loaded. isEmpty: ${img.isEmpty()}`);
    if (!img.isEmpty()) {
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);
      const resized = img.resize({ width: targetWidth, height: targetHeight, quality: 'good' });
      const thumbnail: NativeThumbnail = {
        dataUrl: resized.toDataURL(),
        width: targetWidth,
        height: targetHeight,
      };
      appendLog(`nativeImage fallback succeeded. DataURL length: ${thumbnail.dataUrl.length}`);
      thumbnailCache.set(key, thumbnail);
      return thumbnail;
    }
  } catch (err) {
    appendLog(`nativeImage fallback failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  appendLog(`Returning null for ${path}`);
  return null;
}

export function getOpenWithApps(path: string): OpenWithApp[] {
  if (addon === null) return [];
  return parseJson(addon.getOpenWithApps(path), []);
}
