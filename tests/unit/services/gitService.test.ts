import { describe, expect, it } from 'vitest';
import { getGitStatus, getGitHistory } from '@main/services/gitService';
import { resolve } from 'node:path';

describe('gitService', () => {
  const currentDir = resolve('.');

  it('inspects current workspace git status', async () => {
    const status = await getGitStatus(currentDir);
    expect(status.isInstalled).toBe(true);
    expect(status.isRepo).toBe(true);
    expect(typeof status.branch).toBe('string');
    expect(typeof status.repoRoot).toBe('string');
    expect(typeof status.statusMap).toBe('object');
  });

  it('fetches git history for current workspace', async () => {
    const history = await getGitHistory(currentDir);
    expect(Array.isArray(history)).toBe(true);
    if (history.length > 0) {
      expect(history[0]).toHaveProperty('hash');
      expect(history[0]).toHaveProperty('author');
      expect(history[0]).toHaveProperty('date');
      expect(history[0]).toHaveProperty('message');
    }
  });

  it('handles non-repository paths gracefully', async () => {
    const status = await getGitStatus('/tmp');
    expect(status.isInstalled).toBe(true);
    expect(status.isRepo).toBe(false);
    expect(status.statusMap).toEqual({});

    const history = await getGitHistory('/tmp');
    expect(history).toEqual([]);
  });
});
