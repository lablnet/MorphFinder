import { describe, expect, it } from 'vitest';
import { classifyFileSystemError } from '../../src/renderer/src/lib/fileSystemError';

describe('classifyFileSystemError', () => {
  it.each(['EACCES: denied', 'EPERM operation', 'Permission denied'])('classifies permission errors: %s', (message) => {
    expect(classifyFileSystemError(message)).toBe('permission');
  });

  it.each(['ENOENT: missing', 'ENODEV: no device', 'ESTALE handle', 'volume not mounted', 'disk ejected'])('classifies unavailable volumes: %s', (message) => {
    expect(classifyFileSystemError(message)).toBe('unavailable');
  });

  it('keeps unknown errors generic', () => {
    expect(classifyFileSystemError('Unexpected I/O failure')).toBe('generic');
  });
});
