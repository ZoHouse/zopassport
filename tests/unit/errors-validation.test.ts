import { describe, it, expect } from 'vitest';
import {
  ZoSDKError,
  ZoAuthError,
  ZoNetworkError,
  ZoValidationError,
  ZoNotAuthenticatedError,
  ZoConfigError,
} from '../../src/lib/errors';
import {
  validatePhoneNumber,
  validateCountryCode,
  validateOTP,
  validateConfig,
} from '../../src/lib/utils/validation';
import { ZoPassportSDK } from '../../src/ZoPassportSDK';
import { MemoryStorageAdapter } from '../../src/lib/utils/storage';

// ============================================================
// Error Classes
// ============================================================
describe('Error Classes', () => {
  it('ZoSDKError should have name, message, and code', () => {
    const err = new ZoSDKError('test', 'TEST_CODE');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ZoSDKError');
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
  });

  it('ZoAuthError should extend ZoSDKError with statusCode', () => {
    const err = new ZoAuthError('Unauthorized', 401);
    expect(err).toBeInstanceOf(ZoSDKError);
    expect(err.name).toBe('ZoAuthError');
    expect(err.code).toBe('AUTH_ERROR');
    expect(err.statusCode).toBe(401);
  });

  it('ZoNetworkError should have default message', () => {
    const err = new ZoNetworkError();
    expect(err).toBeInstanceOf(ZoSDKError);
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.message).toContain('Network request failed');
  });

  it('ZoValidationError should have field name', () => {
    const err = new ZoValidationError('Bad phone', 'phoneNumber');
    expect(err).toBeInstanceOf(ZoSDKError);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.field).toBe('phoneNumber');
  });

  it('ZoNotAuthenticatedError should have correct code', () => {
    const err = new ZoNotAuthenticatedError();
    expect(err).toBeInstanceOf(ZoSDKError);
    expect(err.code).toBe('NOT_AUTHENTICATED');
  });

  it('ZoConfigError should have correct code', () => {
    const err = new ZoConfigError('Missing key');
    expect(err).toBeInstanceOf(ZoSDKError);
    expect(err.code).toBe('CONFIG_ERROR');
  });

  it('all errors should be catchable as ZoSDKError', () => {
    const errors = [
      new ZoAuthError('x'),
      new ZoNetworkError(),
      new ZoValidationError('x'),
      new ZoNotAuthenticatedError(),
      new ZoConfigError('x'),
    ];
    for (const err of errors) {
      expect(err).toBeInstanceOf(ZoSDKError);
      expect(err).toBeInstanceOf(Error);
    }
  });
});

// ============================================================
// Validation Functions
// ============================================================
describe('validatePhoneNumber', () => {
  it('should pass for valid 10-digit number', () => {
    expect(() => validatePhoneNumber('9876543210')).not.toThrow();
  });

  it('should pass for 7-digit number', () => {
    expect(() => validatePhoneNumber('1234567')).not.toThrow();
  });

  it('should pass for number with formatting', () => {
    expect(() => validatePhoneNumber('+91 98765-43210')).not.toThrow();
  });

  it('should throw for too-short number', () => {
    expect(() => validatePhoneNumber('12345')).toThrow(ZoValidationError);
  });

  it('should throw for empty string', () => {
    expect(() => validatePhoneNumber('')).toThrow(ZoValidationError);
  });

  it('should throw with field name', () => {
    try {
      validatePhoneNumber('123');
    } catch (e: any) {
      expect(e.field).toBe('phoneNumber');
    }
  });
});

describe('validateCountryCode', () => {
  it('should pass for valid code', () => {
    expect(() => validateCountryCode('91')).not.toThrow();
    expect(() => validateCountryCode('1')).not.toThrow();
    expect(() => validateCountryCode('971')).not.toThrow();
  });

  it('should throw for empty code', () => {
    expect(() => validateCountryCode('')).toThrow(ZoValidationError);
  });

  it('should throw for too-long code', () => {
    expect(() => validateCountryCode('12345')).toThrow(ZoValidationError);
  });
});

describe('validateOTP', () => {
  it('should pass for 6-digit OTP', () => {
    expect(() => validateOTP('123456')).not.toThrow();
  });

  it('should pass for 4-digit OTP', () => {
    expect(() => validateOTP('1234')).not.toThrow();
  });

  it('should throw for 3-digit OTP', () => {
    expect(() => validateOTP('123')).toThrow(ZoValidationError);
  });

  it('should throw for empty OTP', () => {
    expect(() => validateOTP('')).toThrow(ZoValidationError);
  });
});

describe('validateConfig', () => {
  it('should pass for valid config', () => {
    expect(() => validateConfig({ clientKey: 'abc123' })).not.toThrow();
  });

  it('should throw for empty clientKey', () => {
    expect(() => validateConfig({ clientKey: '' })).toThrow(ZoConfigError);
  });

  it('should throw for whitespace-only clientKey', () => {
    expect(() => validateConfig({ clientKey: '   ' })).toThrow(ZoConfigError);
  });

  it('should throw with helpful message', () => {
    try {
      validateConfig({ clientKey: '' });
    } catch (e: any) {
      expect(e.message).toContain('clientKey');
      expect(e.message).toContain('zo.xyz/developers');
    }
  });
});

// ============================================================
// SDK Config Validation Integration
// ============================================================
describe('SDK Config Validation', () => {
  it('should throw ZoConfigError when clientKey is missing', () => {
    expect(() => {
      new ZoPassportSDK({
        clientKey: '',
        storageAdapter: new MemoryStorageAdapter(),
        autoRefresh: false,
      });
    }).toThrow(ZoConfigError);
  });

  it('should throw ZoConfigError for whitespace clientKey', () => {
    expect(() => {
      new ZoPassportSDK({
        clientKey: '  ',
        storageAdapter: new MemoryStorageAdapter(),
        autoRefresh: false,
      });
    }).toThrow(ZoConfigError);
  });

  it('should not throw for valid clientKey', () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'valid-key-123',
      storageAdapter: new MemoryStorageAdapter(),
      autoRefresh: false,
    });
    expect(sdk).toBeDefined();
    sdk.destroy();
  });
});
