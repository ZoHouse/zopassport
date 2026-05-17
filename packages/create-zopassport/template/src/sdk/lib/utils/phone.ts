// src/lib/utils/phone.ts
// Phone number utilities backed by libphonenumber-js (mobile metadata).

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  isValidPhoneNumber as libIsValidPhoneNumber,
  AsYouType,
  type CountryCode as LibCountryCode,
} from 'libphonenumber-js/mobile';

export interface Country {
  /** Dial code without the leading `+` (e.g. "1", "91", "971"). */
  code: string;
  /** ISO 3166-1 alpha-2 country code (e.g. "US", "IN", "AE"). */
  country: string;
  /** Flag emoji derived from the ISO code. */
  flag: string;
  /** Human-readable English country name. */
  name: string;
}

function isoToFlag(iso: string): string {
  if (!iso || iso.length !== 2) return '';
  const upper = iso.toUpperCase();
  const A = 0x1f1e6;
  const codePoints = [
    A + (upper.charCodeAt(0) - 65),
    A + (upper.charCodeAt(1) - 65),
  ];
  return String.fromCodePoint(...codePoints);
}

let displayNames: Intl.DisplayNames | undefined;
function getCountryName(iso: string): string {
  if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
    if (!displayNames) {
      try {
        displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
      } catch {
        displayNames = undefined;
      }
    }
    if (displayNames) {
      const name = displayNames.of(iso);
      if (name) return name;
    }
  }
  return iso;
}

function buildCountryList(): Country[] {
  const list: Country[] = [];
  for (const iso of getCountries()) {
    let dial: string;
    try {
      dial = getCountryCallingCode(iso);
    } catch {
      continue;
    }
    list.push({
      code: dial,
      country: iso,
      flag: isoToFlag(iso),
      name: getCountryName(iso),
    });
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

export const COUNTRY_CODES: readonly Country[] = buildCountryList();

export function getCountryByDialCode(code: string): Country | undefined {
  const cleaned = code.replace(/^\+/, '');
  return COUNTRY_CODES.find(c => c.code === cleaned);
}

export function getCountryByIso(iso: string): Country | undefined {
  const upper = iso.toUpperCase();
  return COUNTRY_CODES.find(c => c.country === upper);
}

/** Lookup a country by either dial code or ISO code (back-compat alias). */
export function getCountryByCode(code: string): Country | undefined {
  return getCountryByDialCode(code) ?? getCountryByIso(code);
}

export function formatPhoneNumber(phone: string, country?: string): string {
  if (!phone) return '';

  if (country) {
    const iso = resolveIso(country);
    if (iso) {
      const parsed = parsePhoneNumberFromString(phone, iso as LibCountryCode);
      if (parsed) return parsed.formatNational();
      return new AsYouType(iso as LibCountryCode).input(phone);
    }
  }

  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return cleaned;
}

export function parsePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isValidPhoneNumber(phone: string, country?: string): boolean {
  if (!phone) return false;

  if (country) {
    const iso = resolveIso(country);
    if (iso) {
      try {
        return libIsValidPhoneNumber(phone, iso as LibCountryCode);
      } catch {
        return false;
      }
    }
  }

  const cleaned = parsePhoneNumber(phone);
  return cleaned.length >= 7 && cleaned.length <= 15;
}

export function formatAsYouType(phone: string, country: string): string {
  const iso = resolveIso(country);
  if (!iso) return phone;
  return new AsYouType(iso as LibCountryCode).input(phone);
}

function resolveIso(input: string): string | undefined {
  if (!input) return undefined;
  const upper = input.toUpperCase();
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) {
    return getCountryByIso(upper) ? upper : undefined;
  }
  const byDial = getCountryByDialCode(input);
  return byDial?.country;
}
