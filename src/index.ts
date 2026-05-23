// zopassport SDK
// Main entry point

// API Client
export { ZoApiClient, type ZoPassportConfig } from './lib/api/client';

// Auth API
export { ZoAuth } from './lib/api/auth';

// Profile API
export { ZoProfile } from './lib/api/profile';

// Avatar API
export { ZoAvatar } from './lib/api/avatar';

// Wallet API
export { ZoWallet } from './lib/api/wallet';

// Storage
export {
  LocalStorageAdapter,
  AsyncStorageAdapter,
  MemoryStorageAdapter,
  STORAGE_KEYS,
  type StorageAdapter,
} from './lib/utils/storage';

// Phone utilities
export { formatPhoneNumber, parsePhoneNumber, COUNTRY_CODES } from './lib/utils/phone';

// reCAPTCHA helper (web only)
export { executeRecaptcha } from './lib/utils/recaptcha';

// Wallet utilities
export * from './lib/utils/wallet';

// Logger (for advanced debugging)
export { logger } from './lib/utils/logger';

// Errors
export {
  ZoSDKError,
  ZoAuthError,
  ZoNetworkError,
  ZoValidationError,
  ZoNotAuthenticatedError,
  ZoConfigError,
} from './lib/errors';

// Types
export * from './lib/types';

// Main SDK class
export { ZoPassportSDK } from './ZoPassportSDK';

// Asset constants
export { ASSETS, CULTURE_STICKERS, CULTURES, type CultureId } from '../assets/index';

