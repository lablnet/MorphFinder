import { basename, parse, resolve } from 'node:path';
import { app } from 'electron';
import { isVirtualPath } from '@shared/virtualLocations';

function normalized(path: string): string {
  return resolve(path);
}

export function assertFilesystemPath(path: string, operation: string): void {
  if (path.length === 0 || isVirtualPath(path)) {
    throw new Error(`${operation} requires a real filesystem path.`);
  }
}

export function assertFilesystemPaths(paths: string[], operation: string): void {
  if (paths.length === 0) throw new Error(`${operation} requires at least one path.`);
  for (const path of paths) assertFilesystemPath(path, operation);
}

export function assertSafePermanentDeleteTargets(paths: string[]): void {
  assertFilesystemPaths(paths, 'Permanent delete');
  const home = normalized(app.getPath('home'));
  for (const path of paths) {
    const target = normalized(path);
    const root = parse(target).root;
    if (target === root || target === home) {
      throw new Error(`Refusing to permanently delete protected path: ${path}`);
    }
    if (basename(target).length === 0) {
      throw new Error(`Refusing to permanently delete ambiguous path: ${path}`);
    }
  }
}
