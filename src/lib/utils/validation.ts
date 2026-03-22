import { ZoValidationError, ZoConfigError } from '../errors';

/**
 * Validate a phone number (digits only, 7-15 chars per E.164).
 * @throws {ZoValidationError} if the phone number is invalid
 */
export function validatePhoneNumber(phoneNumber: string): void {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 7 || cleaned.length > 15) {
    throw new ZoValidationError(
      `Invalid phone number "${phoneNumber}". Must be 7-15 digits.`,
      'phoneNumber'
    );
  }
}

/**
 * Validate a country code (1-4 digits).
 * @throws {ZoValidationError} if the country code is invalid
 */
export function validateCountryCode(countryCode: string): void {
  const cleaned = countryCode.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 1 || cleaned.length > 4) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". Must be 1-4 digits.`,
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
