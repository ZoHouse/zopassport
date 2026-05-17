import { describe, it, expect } from 'vitest';
import {
  formatPhoneNumber,
  parsePhoneNumber,
  isValidPhoneNumber,
  formatAsYouType,
  getCountryByDialCode,
  getCountryByIso,
  COUNTRY_CODES,
} from '../../src/lib/utils/phone';

describe('formatPhoneNumber', () => {
  it('falls back to dash grouping for a 10-digit number without country', () => {
    expect(formatPhoneNumber('5551234567')).toBe('555-123-4567');
  });

  it('strips non-digit chars before fallback formatting', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('555-123-4567');
  });

  it('returns cleaned digits when no country and not 10 digits', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });

  it('formats via libphonenumber when country supplied (US ISO)', () => {
    expect(formatPhoneNumber('5551234567', 'US')).toBe('(555) 123-4567');
  });

  it('formats via libphonenumber when country supplied (India dial code)', () => {
    // India national format prepends the trunk prefix "0".
    expect(formatPhoneNumber('9876543210', '91')).toBe('098765 43210');
  });

  it('handles empty string', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});

describe('parsePhoneNumber', () => {
  it('removes all non-digit characters', () => {
    expect(parsePhoneNumber('+1 (555) 123-4567')).toBe('15551234567');
  });

  it('returns same string if already digits-only', () => {
    expect(parsePhoneNumber('1234567890')).toBe('1234567890');
  });

  it('handles empty string', () => {
    expect(parsePhoneNumber('')).toBe('');
  });

  it('strips letters and special chars', () => {
    expect(parsePhoneNumber('abc-123-def-456')).toBe('123456');
  });
});

describe('isValidPhoneNumber', () => {
  it('returns false for empty input', () => {
    expect(isValidPhoneNumber('')).toBe(false);
  });

  it('validates a known good Indian mobile against ISO IN', () => {
    expect(isValidPhoneNumber('9876543210', 'IN')).toBe(true);
  });

  it('rejects a too-short number against ISO IN', () => {
    expect(isValidPhoneNumber('123', 'IN')).toBe(false);
  });

  it('validates a US number against dial code 1', () => {
    expect(isValidPhoneNumber('2025550123', '1')).toBe(true);
  });

  it('falls back to E.164 length check when no country given', () => {
    expect(isValidPhoneNumber('1234567')).toBe(true);
    expect(isValidPhoneNumber('123')).toBe(false);
  });
});

describe('formatAsYouType', () => {
  it('returns input unchanged when country unknown', () => {
    expect(formatAsYouType('123', 'ZZ')).toBe('123');
  });

  it('formats partial input progressively for US', () => {
    const out = formatAsYouType('555', 'US');
    expect(out.replace(/\D/g, '')).toBe('555');
  });
});

describe('country lookups', () => {
  it('finds India by ISO', () => {
    const india = getCountryByIso('IN');
    expect(india).toBeDefined();
    expect(india!.code).toBe('91');
  });

  it('finds India by dial code', () => {
    const india = getCountryByDialCode('91');
    expect(india).toBeDefined();
    expect(india!.country).toBe('IN');
  });

  it('finds dial code with leading + stripped', () => {
    const india = getCountryByDialCode('+91');
    expect(india?.country).toBe('IN');
  });

  it('returns undefined for unknown ISO', () => {
    expect(getCountryByIso('ZZ')).toBeUndefined();
  });
});

describe('COUNTRY_CODES', () => {
  it('contains India with code 91', () => {
    const india = COUNTRY_CODES.find(c => c.country === 'IN');
    expect(india).toBeDefined();
    expect(india!.code).toBe('91');
  });

  it('contains US with code 1', () => {
    const us = COUNTRY_CODES.find(c => c.country === 'US');
    expect(us).toBeDefined();
    expect(us!.code).toBe('1');
  });

  it('contains at least 200 countries (full ITU-T list)', () => {
    expect(COUNTRY_CODES.length).toBeGreaterThanOrEqual(200);
  });

  it('each entry has code, country, flag, and name', () => {
    for (const entry of COUNTRY_CODES) {
      expect(entry.code).toBeTruthy();
      expect(entry.country).toBeTruthy();
      expect(entry.flag).toBeTruthy();
      expect(entry.name).toBeTruthy();
    }
  });

  it('is sorted alphabetically by name', () => {
    for (let i = 1; i < COUNTRY_CODES.length; i++) {
      expect(
        COUNTRY_CODES[i - 1].name.localeCompare(COUNTRY_CODES[i].name)
      ).toBeLessThanOrEqual(0);
    }
  });
});
