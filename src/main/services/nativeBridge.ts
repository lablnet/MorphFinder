import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, extname } from 'node:path';
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
  const nativeDirectory = process.platform === 'darwin' ? 'macos' : 'windows-linux';
  const developmentPath = join(process.cwd(), 'native', nativeDirectory, 'MorphNative.node');
  if (!app.isPackaged) return [developmentPath];
  return [join(process.resourcesPath, 'MorphNative.node'), developmentPath];
}

function loadAddon(): MorphNativeAddon | null {
  if (process.platform !== 'darwin' && process.platform !== 'win32' && process.platform !== 'linux') return null;
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

function commandOutput(command: string, args: string[]): string | null {
  try {
    return execFileSync(command, args, { encoding: 'utf8', windowsHide: true, timeout: 2500 }).trim();
  } catch {
    return null;
  }
}

function powershell(script: string): string | null {
  return commandOutput('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script]);
}

function escapePowerShellString(value: string): string {
  return value.replaceAll("'", "''");
}

function getExtensionKind(path: string): string | null {
  const extension = extname(path).replace(/^\./, '').toUpperCase();
  if (extension === '') return null;
  return `${extension} File`;
}

function getWindowsMetadata(path: string): NativeMetadata {
  const escapedPath = escapePowerShellString(path);
  const script = [
    `$item = Get-Item -LiteralPath '${escapedPath}' -ErrorAction Stop`,
    '$shell = New-Object -ComObject Shell.Application',
    '$folder = $shell.Namespace($item.DirectoryName)',
    '$folderItem = $folder.ParseName($item.Name)',
    '$kind = $folder.GetDetailsOf($folderItem, 2)',
    '$comment = $folder.GetDetailsOf($folderItem, 24)',
    '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
    '[System.Text.Json.JsonSerializer]::Serialize(@{ kind = $kind; comment = $comment })',
  ].join('; ');
  const result = powershell(script);
  if (result === null) return { tags: [], spotlightKind: getExtensionKind(path), spotlightComment: null };
  const metadata = parseJson<{ kind?: string; comment?: string }>(result, {});
  return {
    tags: [],
    spotlightKind: metadata.kind?.trim() || getExtensionKind(path),
    spotlightComment: metadata.comment?.trim() || null,
  };
}

function getLinuxMetadata(path: string): NativeMetadata {
  const mimeType = commandOutput('xdg-mime', ['query', 'filetype', path])
    ?? commandOutput('file', ['--brief', '--mime-type', path]);
  const comment = commandOutput('gio', ['info', '--attributes=metadata::nautilus-icon-position', path]);
  return {
    tags: [],
    spotlightKind: mimeType,
    spotlightComment: comment === null || comment === '' ? null : comment,
  };
}

function getWindowsOpenWithApps(path: string): OpenWithApp[] {
  const extension = extname(path);
  if (extension === '') return [];
  const escapedExtension = escapePowerShellString(extension);
  const script = [
    `$extension = '${escapedExtension}'`,
    '$progId = (Get-ItemProperty -LiteralPath "Registry::HKEY_CLASSES_ROOT\\$extension" -ErrorAction SilentlyContinue)."(default)"',
    '$apps = @()',
    'if ($progId) { $apps += [pscustomobject]@{ name = $progId; bundleId = $progId; iconDataUrl = $null; isDefault = $true } }',
    '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
    '[System.Text.Json.JsonSerializer]::Serialize($apps)',
  ].join('; ');
  const result = powershell(script);
  return result === null ? [] : parseJson<OpenWithApp[]>(result, []);
}

function desktopFileNameToAppName(value: string): string {
  return basename(value, '.desktop').replaceAll('-', ' ');
}

function getLinuxOpenWithApps(path: string): OpenWithApp[] {
  const mimeType = commandOutput('xdg-mime', ['query', 'filetype', path]);
  if (mimeType === null || mimeType === '') return [];
  const defaultDesktopFile = commandOutput('xdg-mime', ['query', 'default', mimeType]);
  const apps: OpenWithApp[] = [];
  if (defaultDesktopFile !== null && defaultDesktopFile !== '') {
    apps.push({
      name: desktopFileNameToAppName(defaultDesktopFile),
      bundleId: defaultDesktopFile,
      iconDataUrl: null,
      isDefault: true,
    });
  }
  return apps;
}

export function nativeCapabilities(): NativeCapabilities {
  if (process.platform === 'darwin') {
    const isAvailable = addon !== null;
    return { isAvailable, supportsTags: isAvailable, supportsThumbnails: true, supportsOpenWith: isAvailable };
  }

  if (process.platform === 'win32') {
    return { isAvailable: true, supportsTags: false, supportsThumbnails: true, supportsOpenWith: true };
  }

  if (process.platform === 'linux') {
    return { isAvailable: true, supportsTags: false, supportsThumbnails: true, supportsOpenWith: true };
  }

  return { isAvailable: false, supportsTags: false, supportsThumbnails: false, supportsOpenWith: false };
}

export function getNativeMetadata(path: string): NativeMetadata {
  if (addon !== null) {
    return parseJson(addon.getMetadata(path), { tags: [], spotlightKind: null, spotlightComment: null });
  }
  if (process.platform === 'win32') return getWindowsMetadata(path);
  if (process.platform === 'linux') return getLinuxMetadata(path);
  return { tags: [], spotlightKind: null, spotlightComment: null };
}

export function setNativeTags(path: string, tags: FinderTag[]): void {
  if (process.platform === 'darwin') addon?.setTags(path, JSON.stringify(tags));
}

export function getNativeThumbnail(path: string, width: number, height: number, scale: number): NativeThumbnail | null {
  const key = `${path}:${width}x${height}@${scale}`;
  const cached = thumbnailCache.get(key);
  if (cached !== undefined) return cached;

  if (addon !== null) {
    try {
      const thumbnail = parseJson<NativeThumbnail | null>(addon.getThumbnail(path, width, height, scale), null);
      if (thumbnail !== null) {
        thumbnailCache.set(key, thumbnail);
        return thumbnail;
      }
    } catch {
      // Fall through to Electron's cross-platform image loader.
    }
  }

  try {
    const img = nativeImage.createFromPath(path);
    if (!img.isEmpty()) {
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);
      const resized = img.resize({ width: targetWidth, height: targetHeight, quality: 'good' });
      const thumbnail: NativeThumbnail = {
        dataUrl: resized.toDataURL(),
        width: targetWidth,
        height: targetHeight,
      };
      thumbnailCache.set(key, thumbnail);
      return thumbnail;
    }
  } catch {
    // Some file types cannot be decoded by Electron directly.
  }

  return null;
}

export function getOpenWithApps(path: string): OpenWithApp[] {
  if (addon !== null) return parseJson(addon.getOpenWithApps(path), []);
  if (process.platform === 'win32') return getWindowsOpenWithApps(path);
  if (process.platform === 'linux') return getLinuxOpenWithApps(path);
  return [];
}
