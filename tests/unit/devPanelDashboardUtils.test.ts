import { describe, expect, it, beforeEach } from 'vitest';
import {
  devPanelTabs,
  isDevPanelTabEnabled,
  favoriteFirstScripts,
  packageManagerInstallCommand,
  devPanelFavoritesKey,
  readDevPanelFavorites,
  writeDevPanelFavorites,
} from '@renderer/lib/devPanelDashboardUtils';
import type { DevScript } from '@shared/types/devPanel';

describe('devPanelDashboardUtils', () => {
  describe('devPanelTabs', () => {
    it('defines standard tabs', () => {
      expect(devPanelTabs).toHaveLength(5);
      expect(devPanelTabs.map((t) => t.id)).toEqual(['overview', 'tasks', 'scripts', 'dependencies', 'env']);
    });
  });

  describe('isDevPanelTabEnabled', () => {
    it('returns true for overview and tasks regardless of flags', () => {
      expect(isDevPanelTabEnabled('overview', false, false, false)).toBe(true);
      expect(isDevPanelTabEnabled('tasks', false, false, false)).toBe(true);
    });

    it('checks flag for scripts, dependencies, and env', () => {
      expect(isDevPanelTabEnabled('scripts', true, false, false)).toBe(true);
      expect(isDevPanelTabEnabled('scripts', false, false, false)).toBe(false);

      expect(isDevPanelTabEnabled('dependencies', false, true, false)).toBe(true);
      expect(isDevPanelTabEnabled('dependencies', false, false, false)).toBe(false);

      expect(isDevPanelTabEnabled('env', false, false, true)).toBe(true);
      expect(isDevPanelTabEnabled('env', false, false, false)).toBe(false);
    });
  });

  describe('favoriteFirstScripts', () => {
    const scripts: DevScript[] = [
      { name: 'build', command: 'tsc' },
      { name: 'test', command: 'vitest' },
      { name: 'dev', command: 'vite' },
    ];

    it('sorts favorite scripts first', () => {
      const favorites = new Set(['test']);
      const sorted = favoriteFirstScripts(scripts, favorites);
      expect(sorted[0].name).toBe('test');
      expect(sorted.map((s) => s.name)).toEqual(['test', 'build', 'dev']);
    });

    it('sorts alphabetically when favorite status matches', () => {
      const sorted = favoriteFirstScripts(scripts, new Set());
      expect(sorted.map((s) => s.name)).toEqual(['build', 'dev', 'test']);
    });
  });

  describe('packageManagerInstallCommand', () => {
    it('maps package managers to install commands', () => {
      expect(packageManagerInstallCommand('pnpm')).toBe('pnpm install');
      expect(packageManagerInstallCommand('yarn')).toBe('yarn install');
      expect(packageManagerInstallCommand('npm')).toBe('npm install');
      expect(packageManagerInstallCommand('bun')).toBe('bun install');
      expect(packageManagerInstallCommand('cargo')).toBe('cargo fetch');
      expect(packageManagerInstallCommand('poetry')).toBe('poetry install');
      expect(packageManagerInstallCommand('pipenv')).toBe('pipenv install');
      expect(packageManagerInstallCommand('pip')).toBe('pip install -r requirements.txt');
      expect(packageManagerInstallCommand('composer')).toBe('composer install');
      expect(packageManagerInstallCommand('bundler')).toBe('bundle install');
      expect(packageManagerInstallCommand('unknown')).toBeNull();
      expect(packageManagerInstallCommand(null)).toBeNull();
    });
  });

  describe('localStorage favorites', () => {
    const scanPath = '/projects/my-app';

    beforeEach(() => {
      window.localStorage.clear();
    });

    it('generates proper favorites key', () => {
      expect(devPanelFavoritesKey(scanPath)).toBe('morphfinder.devpanel.favoriteScripts./projects/my-app');
    });

    it('reads and writes favorite script sets', () => {
      expect(readDevPanelFavorites(scanPath)).toEqual(new Set());
      
      const favorites = new Set(['dev', 'test']);
      writeDevPanelFavorites(scanPath, favorites);
      
      expect(readDevPanelFavorites(scanPath)).toEqual(favorites);
    });

    it('handles invalid json gracefully', () => {
      window.localStorage.setItem(devPanelFavoritesKey(scanPath), 'invalid json');
      expect(readDevPanelFavorites(scanPath)).toEqual(new Set());
    });
  });
});
