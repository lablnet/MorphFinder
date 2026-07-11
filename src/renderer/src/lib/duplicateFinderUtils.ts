import type { DuplicateScanRequest } from '@shared/types/duplicates';
import type { FileSystemNode } from '@shared/types/fileSystem';

export type DuplicateScanScope = NonNullable<DuplicateScanRequest['scope']> | 'custom';

export const duplicateScanScopeOptions: Array<{ id: DuplicateScanScope; label: string }> = [
  { id: 'workspaces', label: 'Work Folders' },
  { id: 'home', label: 'Home/Profile' },
  { id: 'all', label: 'Everything' },
  { id: 'custom', label: 'Custom' },
];

export function duplicateScopeDescription(scope: DuplicateScanScope, customFolder: string | null): string {
  if (scope === 'workspaces') return 'Desktop, Documents, Downloads, and common code folders.';
  if (scope === 'home') return 'Your full user profile/home folder, with heavy system folders skipped.';
  if (scope === 'custom') return customFolder ?? 'Choose one folder to scan.';
  return 'OS root/drive scan. Use Stop whenever you have enough results.';
}

export function duplicateFileNode(path: string, name: string, sizeInBytes: number, modifiedAt: number): FileSystemNode {
  const extension = name.includes('.') ? name.split('.').at(-1)?.toLowerCase() ?? '' : '';
  return {
    path,
    name,
    kind: 'file',
    sizeInBytes,
    modifiedAt,
    createdAt: modifiedAt,
    isHidden: name.startsWith('.'),
    extension,
  };
}

export function duplicateRoots(
  wellKnownDirs: { home: string; desktop: string; documents: string; downloads: string } | null,
  scope: DuplicateScanScope,
  customFolder: string | null,
): string[] {
  if (wellKnownDirs === null) return [];
  if (scope === 'custom') return customFolder === null ? [] : [customFolder];
  if (scope === 'home') return [wellKnownDirs.home];
  if (scope === 'all') {
    if (currentPlatform() === 'win32') {
      const drive = wellKnownDirs.home.match(/^[a-zA-Z]:/)?.[0] ?? 'C:';
      return [`${drive}\\`];
    }
    return ['/'];
  }
  return [
    wellKnownDirs.downloads,
    wellKnownDirs.desktop,
    wellKnownDirs.documents,
    `${wellKnownDirs.home}/projects`,
    `${wellKnownDirs.home}/Developer`,
    `${wellKnownDirs.home}/Code`,
    `${wellKnownDirs.home}/Workspace`,
  ];
}

function currentPlatform(): 'win32' | 'darwin' | 'linux' {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) return 'win32';
  if (platform.includes('mac')) return 'darwin';
  return 'linux';
}
