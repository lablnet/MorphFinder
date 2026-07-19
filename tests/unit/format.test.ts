import { describe, expect, it } from 'vitest';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';

describe('formatBytes', () => {
  it('returns -- for 0 bytes', () => {
    expect(formatBytes(0)).toBe('--');
  });

  it('formats bytes correctly without decimal', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('formats KB, MB, GB correctly with 1 decimal place', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1.0 MB');
    expect(formatBytes(1073741824)).toBe('1.0 GB');
  });

  it('caps at TB for huge numbers', () => {
    expect(formatBytes(1099511627776 * 10)).toBe('10.0 TB');
  });
});

describe('formatModifiedDate', () => {
  it('formats timestamp into localized string', () => {
    const timestamp = new Date('2026-01-01T12:00:00Z').getTime();
    const result = formatModifiedDate(timestamp);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
