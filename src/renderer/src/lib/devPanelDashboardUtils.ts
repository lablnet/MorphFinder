import type { DevScript } from '@shared/types/devPanel';
import type { DevPanelTab } from '@renderer/hooks/files/useDevPanel';

export const devPanelTabs: Array<{ id: DevPanelTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'env', label: 'Env Vars' },
];

export function isDevPanelTabEnabled(tab: DevPanelTab, hasScripts: boolean, hasDeps: boolean, hasEnv: boolean): boolean {
  if (tab === 'scripts') return hasScripts;
  if (tab === 'dependencies') return hasDeps;
  if (tab === 'env') return hasEnv;
  return true;
}

export function favoriteFirstScripts(scripts: DevScript[], favoriteScripts: Set<string>): DevScript[] {
  return [...scripts].sort((left, right) => {
    const leftFavorite = favoriteScripts.has(left.name);
    const rightFavorite = favoriteScripts.has(right.name);
    if (leftFavorite === rightFavorite) return left.name.localeCompare(right.name);
    return leftFavorite ? -1 : 1;
  });
}

export function packageManagerInstallCommand(packageManager: string | null): string | null {
  if (packageManager === 'pnpm') return 'pnpm install';
  if (packageManager === 'yarn') return 'yarn install';
  if (packageManager === 'npm') return 'npm install';
  if (packageManager === 'bun') return 'bun install';
  if (packageManager === 'cargo') return 'cargo fetch';
  if (packageManager === 'poetry') return 'poetry install';
  if (packageManager === 'pipenv') return 'pipenv install';
  if (packageManager === 'pip') return 'pip install -r requirements.txt';
  if (packageManager === 'composer') return 'composer install';
  if (packageManager === 'bundler') return 'bundle install';
  return null;
}

export function devPanelFavoritesKey(scanPath: string): string {
  return `morphfinder.devpanel.favoriteScripts.${scanPath}`;
}

export function readDevPanelFavorites(scanPath: string): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(devPanelFavoritesKey(scanPath)) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function writeDevPanelFavorites(scanPath: string, favorites: Set<string>): void {
  window.localStorage.setItem(devPanelFavoritesKey(scanPath), JSON.stringify([...favorites]));
}
