import { describe, it, expect } from 'vitest';
import { isSafeMorphFilePath } from '../../src/main/security';

describe('isSafeMorphFilePath', () => {
  it('allows safe local asset paths', () => {
    expect(isSafeMorphFilePath('/Users/user/Pictures/photo.jpg')).toBe(true);
    expect(isSafeMorphFilePath('/Users/user/Documents/notes.md')).toBe(true);
    expect(isSafeMorphFilePath('C:\\Users\\user\\Videos\\movie.mp4')).toBe(true);
    expect(isSafeMorphFilePath('/var/data/project/src/index.ts')).toBe(true);
  });

  it('rejects access to sensitive directory structures', () => {
    expect(isSafeMorphFilePath('/Users/user/.ssh/id_rsa')).toBe(false);
    expect(isSafeMorphFilePath('/Users/user/.aws/credentials')).toBe(false);
    expect(isSafeMorphFilePath('/Users/user/.gnupg/secring.gpg')).toBe(false);
    expect(isSafeMorphFilePath('/etc/passwd')).toBe(false);
    expect(isSafeMorphFilePath('/proc/self/cmdline')).toBe(false);
    expect(isSafeMorphFilePath('C:\\Windows\\System32\\config\\SAM')).toBe(false);
  });

  it('rejects dangerous filenames and secret files', () => {
    expect(isSafeMorphFilePath('/project/.env')).toBe(false);
    expect(isSafeMorphFilePath('/project/.env.local')).toBe(false);
    expect(isSafeMorphFilePath('/project/id_rsa')).toBe(false);
    expect(isSafeMorphFilePath('/project/shadow')).toBe(false);
  });

  it('rejects secret/key file extensions', () => {
    expect(isSafeMorphFilePath('/project/server.pem')).toBe(false);
    expect(isSafeMorphFilePath('/project/private.key')).toBe(false);
    expect(isSafeMorphFilePath('/project/cert.p12')).toBe(false);
  });
});
