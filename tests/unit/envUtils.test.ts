import { describe, expect, it } from 'vitest';
import { isSensitiveEnvKey } from '@renderer/lib/envUtils';

describe('envUtils', () => {
  describe('isSensitiveEnvKey', () => {
    it('identifies secret, token, password keys as sensitive', () => {
      expect(isSensitiveEnvKey('API_SECRET')).toBe(true);
      expect(isSensitiveEnvKey('GITHUB_TOKEN')).toBe(true);
      expect(isSensitiveEnvKey('DATABASE_PASSWORD')).toBe(true);
      expect(isSensitiveEnvKey('DB_PASS')).toBe(true);
      expect(isSensitiveEnvKey('APP_KEY')).toBe(true);
      expect(isSensitiveEnvKey('AUTH_HEADER')).toBe(true);
    });

    it('returns false for non-sensitive keys', () => {
      expect(isSensitiveEnvKey('NODE_ENV')).toBe(false);
      expect(isSensitiveEnvKey('PORT')).toBe(false);
      expect(isSensitiveEnvKey('PATH')).toBe(false);
      expect(isSensitiveEnvKey('HOME')).toBe(false);
    });
  });
});
