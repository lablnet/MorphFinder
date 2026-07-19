import { describe, expect, it } from 'vitest';
import {
  duplicateScanScopeOptions,
  duplicateScopeDescription,
  duplicateFileNode,
  duplicateRoots,
} from '@renderer/lib/duplicateFinderUtils';

describe('duplicateFinderUtils', () => {
  describe('duplicateScanScopeOptions', () => {
    it('contains standard scope options', () => {
      expect(duplicateScanScopeOptions).toHaveLength(4);
      expect(duplicateScanScopeOptions.map((o) => o.id)).toEqual(['workspaces', 'home', 'all', 'custom']);
    });
  });

  describe('duplicateScopeDescription', () => {
    it('returns appropriate descriptions for each scope', () => {
      expect(duplicateScopeDescription('workspaces', null)).toContain('Desktop, Documents');
      expect(duplicateScopeDescription('home', null)).toContain('full user profile');
      expect(duplicateScopeDescription('custom', '/custom/path')).toBe('/custom/path');
      expect(duplicateScopeDescription('custom', null)).toBe('Choose one folder to scan.');
      expect(duplicateScopeDescription('all', null)).toContain('OS root/drive scan');
    });
  });

  describe('duplicateFileNode', () => {
    it('constructs a FileSystemNode object', () => {
      const node = duplicateFileNode('/tmp/test.txt', 'test.txt', 1024, 1600000000000);
      expect(node).toEqual({
        path: '/tmp/test.txt',
        name: 'test.txt',
        kind: 'file',
        sizeInBytes: 1024,
        modifiedAt: 1600000000000,
        createdAt: 1600000000000,
        isHidden: false,
        extension: 'txt',
      });
    });

    it('identifies hidden files and files without extensions', () => {
      const hiddenNode = duplicateFileNode('/tmp/.env', '.env', 100, 1600000000000);
      expect(hiddenNode.isHidden).toBe(true);
      expect(hiddenNode.extension).toBe('env');

      const noExtNode = duplicateFileNode('/tmp/LICENSE', 'LICENSE', 100, 1600000000000);
      expect(noExtNode.isHidden).toBe(false);
      expect(noExtNode.extension).toBe('');
    });
  });

  describe('duplicateRoots', () => {
    const wellKnownDirs = {
      home: '/Users/test',
      desktop: '/Users/test/Desktop',
      documents: '/Users/test/Documents',
      downloads: '/Users/test/Downloads',
    };

    it('returns empty array if wellKnownDirs is null', () => {
      expect(duplicateRoots(null, 'workspaces', null)).toEqual([]);
    });

    it('handles custom scope', () => {
      expect(duplicateRoots(wellKnownDirs, 'custom', '/my/dir')).toEqual(['/my/dir']);
      expect(duplicateRoots(wellKnownDirs, 'custom', null)).toEqual([]);
    });

    it('handles home scope', () => {
      expect(duplicateRoots(wellKnownDirs, 'home', null)).toEqual(['/Users/test']);
    });

    it('handles all scope', () => {
      expect(duplicateRoots(wellKnownDirs, 'all', null)).toEqual(['/']);
    });

    it('handles workspaces scope', () => {
      const roots = duplicateRoots(wellKnownDirs, 'workspaces', null);
      expect(roots).toContain('/Users/test/Downloads');
      expect(roots).toContain('/Users/test/Desktop');
      expect(roots).toContain('/Users/test/Documents');
    });
  });
});
