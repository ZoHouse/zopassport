import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, parsePhoneNumber, COUNTRY_CODES } from '../../src/lib/utils/phone';

describe('formatPhoneNumber', () => {
  it('should format 10-digit US number with dashes', () => {
    expect(formatPhoneNumber('5551234567')).toBe('555-123-4567');
  });

  it('should strip non-digit chars before formatting', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('555-123-4567');
  });

  it('should return cleaned number when not 10 digits', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });

  it('should return cleaned number for international (>10 digits)', () => {
    expect(formatPhoneNumber('919876543210')).toBe('919876543210');
  });

  it('should handle empty string', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});

describe('parsePhoneNumber', () => {
  it('should remove all non-digit characters', () => {
    expect(parsePhoneNumber('+1 (555) 123-4567')).toBe('15551234567');
  });

  it('should return same string if already digits-only', () => {
    expect(parsePhoneNumber('1234567890')).toBe('1234567890');
  });

  it('should handle empty string', () => {
    expect(parsePhoneNumber('')).toBe('');
  });

  it('should strip letters and special chars', () => {
    expect(parsePhoneNumber('abc-123-def-456')).toBe('123456');
  });
});

describe('COUNTRY_CODES', () => {
  it('should contain India with code 91', () => {
    const india = COUNTRY_CODES.find(c => c.country === 'IN');
    expect(india).toBeDefined();
    expect(india!.code).toBe('91');
  });

  it('should contain US with code 1', () => {
    const us = COUNTRY_CODES.find(c => c.country === 'US');
    expect(us).toBeDefined();
    expect(us!.code).toBe('1');
  });

  it('should have at least 15 entries', () => {
    expect(COUNTRY_CODES.length).toBeGreaterThanOrEqual(15);
  });

  it('each entry should have code, country, flag, and name', () => {
    for (const entry of COUNTRY_CODES) {
      expect(entry.code).toBeTruthy();
      expect(entry.country).toBeTruthy();
      expect(entry.flag).toBeTruthy();
      expect(entry.name).toBeTruthy();
    }
  });
});
