import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoPassportSDK } from '../../src/ZoPassportSDK';
import { MemoryStorageAdapter, STORAGE_KEYS } from '../../src/lib/utils/storage';
import { createMockAuthResponse, createMockUser, createAuthenticatedStorage } from '../helpers';

describe('ZoPassportSDK Auth & Session', () => {
  let sdk: ZoPassportSDK;
  let storage: MemoryStorageAdapter;
  let mock: MockAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    sdk = new ZoPassportSDK({
      clientKey: 'test-client-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    mock = new MockAdapter(sdk.auth['client'].axiosInstance);
  });

  afterEach(() => {
    sdk.destroy();
    mock.restore();
  });

  describe('Initialization', () => {
    it('should initialize with required config', () => {
      expect(sdk).toBeDefined();
      expect(sdk.auth).toBeDefined();
      expect(sdk.profile).toBeDefined();
      expect(sdk.avatar).toBeDefined();
      expect(sdk.wallet).toBeDefined();
    });

    it('should not be authenticated initially', async () => {
      await sdk.ready();
      expect(sdk.isAuthenticated).toBe(false);
      expect(sdk.user).toBeNull();
    });

    it('should restore session from storage on init', async () => {
      const authenticatedStorage = await createAuthenticatedStorage();
      const sdkWithSession = new ZoPassportSDK({
        clientKey: 'test-key',
        storageAdapter: authenticatedStorage,
        autoRefresh: false,
      });
      await sdkWithSession.ready();
      expect(sdkWithSession.isAuthenticated).toBe(true);
      expect(sdkWithSession.user!.id).toBe('test-user-id-123');
      sdkWithSession.destroy();
    });

    it('should enable debug logging when debug=true', () => {
      const debugSdk = new ZoPassportSDK({
        clientKey: 'test-key',
        storageAdapter: storage,
        autoRefresh: false,
        debug: true,
      });
      expect(debugSdk).toBeDefined();
      debugSdk.destroy();
    });
  });

  describe('loginWithPhone', () => {
    it('should authenticate user and save session', async () => {
      const authResponse = createMockAuthResponse();
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);

      const result = await sdk.loginWithPhone('91', '9876543210', '123456');
      expect(result.success).toBe(true);
      expect(result.user!.id).toBe('test-user-id-123');
      expect(sdk.isAuthenticated).toBe(true);

      expect(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('test-access-token');
      expect(await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('test-refresh-token');
    });

    it('should set wallet address after login', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
      await sdk.loginWithPhone('91', '9876543210', '123456');
      expect(sdk.user!.wallet_address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    });

    it('should return error on invalid OTP', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(400, { errors: ['Invalid OTP'] });
      const result = await sdk.loginWithPhone('91', '9876543210', '000000');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP');
      expect(sdk.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear session and user data', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
      await sdk.loginWithPhone('91', '9876543210', '123456');
      expect(sdk.isAuthenticated).toBe(true);

      await sdk.logout();
      expect(sdk.isAuthenticated).toBe(false);
      expect(sdk.user).toBeNull();
      expect(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return null when not authenticated', async () => {
      expect(await sdk.getProfile()).toBeNull();
    });

    it('should return profile when authenticated', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
      await sdk.loginWithPhone('91', '9876543210', '123456');

      mock.onGet('/api/v1/profile/me/').reply(200, createMockUser({ first_name: 'ProfileTest' }));
      const profile = await sdk.getProfile();
      expect(profile!.first_name).toBe('ProfileTest');
    });
  });

  describe('updateProfile', () => {
    it('should return error when not authenticated', async () => {
      const result = await sdk.updateProfile({ first_name: 'Test' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should update profile and return updated data', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
      await sdk.loginWithPhone('91', '9876543210', '123456');

      mock.onPost('/api/v1/profile/me/').reply(200, createMockUser({ first_name: 'NewName' }));
      const result = await sdk.updateProfile({ first_name: 'NewName' });
      expect(result.success).toBe(true);
      expect(result.profile!.first_name).toBe('NewName');
    });
  });

  describe('generateAvatar', () => {
    it('should return error when not authenticated', async () => {
      const result = await sdk.generateAvatar('bro');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });
});
