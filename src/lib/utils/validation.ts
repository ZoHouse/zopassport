import { ZoValidationError, ZoConfigError } from '../errors';
import { getCountryByDialCode, getCountryByIso, isValidPhoneNumber } from './phone';

/**
 * Validate a phone number. If a country (ISO code or dial code) is supplied,
 * uses libphonenumber-js country-specific rules. Otherwise falls back to a
 * permissive 7-15 digit E.164 length check.
 * @throws {ZoValidationError} if the phone number is invalid
 */
export function validatePhoneNumber(phoneNumber: string, country?: string): void {
  if (country) {
    if (!isValidPhoneNumber(phoneNumber, country)) {
      throw new ZoValidationError(
        `Invalid phone number "${phoneNumber}" for country "${country}".`,
        'phoneNumber'
      );
    }
    return;
  }

  const cleaned = phoneNumber.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 7 || cleaned.length > 15) {
    throw new ZoValidationError(
      `Invalid phone number "${phoneNumber}". Must be 7-15 digits.`,
      'phoneNumber'
    );
  }
}

/**
 * Validate a country code. Accepts either an ISO 3166-1 alpha-2 code
 * (e.g. "IN") or a dial code (1-4 digits, e.g. "91").
 * @throws {ZoValidationError} if the country code is invalid
 */
export function validateCountryCode(countryCode: string): void {
  if (!countryCode) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". Must be a dial code (1-4 digits) or ISO 3166-1 alpha-2 code.`,
      'countryCode'
    );
  }

  const upper = countryCode.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    if (!getCountryByIso(upper)) {
      throw new ZoValidationError(
        `Invalid country code "${countryCode}". Unknown ISO 3166-1 alpha-2 code.`,
        'countryCode'
      );
    }
    return;
  }

  const cleaned = countryCode.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 1 || cleaned.length > 4) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". Must be 1-4 digits.`,
      'countryCode'
    );
  }
  if (!getCountryByDialCode(cleaned)) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". No country uses this dial code.`,
      'countryCode'
    );
  }
}

/**
 * Validate an OTP code (4-8 digits).
 * @throws {ZoValidationError} if the OTP is invalid
 */
export function validateOTP(otp: string): void {
  const cleaned = otp.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 4 || cleaned.length > 8) {
    throw new ZoValidationError(
      'Invalid OTP. Must be 4-8 digits.',
      'otp'
    );
  }
}

/**
 * Validate SDK configuration.
 * @throws {ZoConfigError} if the config is invalid
 */
export function validateConfig(config: { clientKey: string }): void {
  if (!config.clientKey || typeof config.clientKey !== 'string' || config.clientKey.trim() === '') {
    throw new ZoConfigError(
      'Missing or empty "clientKey". You must provide a valid client key to use the Zo Passport SDK. ' +
      'Request one from the Zo World team at https://zo.xyz/developers'
    );
  }
}
