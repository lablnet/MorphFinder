import { describe, expect, it } from 'vitest';
import { contextActionsForState } from '@renderer/components/files/FileContextMenu';

describe('contextActionsForState', () => {
  it('shows file operations when a file or folder is targeted', () => {
    expect(contextActionsForState({ hasTarget: true })).toEqual([
      'open',
      'open-with-system',
      'rename',
      'copy',
      'cut',
      'trash',
      'annotate',
      'show-in-folder',
      'paste',
      'new-folder',
      'refresh',
    ]);
  });

  it('shows background operations when no file is targeted', () => {
    expect(contextActionsForState({ hasTarget: false })).toEqual(['paste', 'new-folder', 'refresh']);
  });

  it('shows trash-specific operations when targeted inside trash', () => {
    expect(contextActionsForState({ hasTarget: true, activePath: '/Users/test/.Trash' })).toEqual([
      'open',
      'open-with-system',
      'restore',
      'delete-permanently',
      'details',
      'show-in-folder',
    ]);
  });

  it('shows empty trash option when right-clicking background inside trash', () => {
    expect(contextActionsForState({ hasTarget: false, activePath: '/Users/test/.Trash' })).toEqual([
      'empty-trash',
      'refresh',
    ]);
  });
});
