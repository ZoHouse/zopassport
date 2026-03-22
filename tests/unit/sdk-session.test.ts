import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoPassportSDK } from '../../src/ZoPassportSDK';
import { MemoryStorageAdapter, STORAGE_KEYS } from '../../src/lib/utils/storage';
import { createMockAuthResponse, createMockUser } from '../helpers';

describe('ZoPassportSDK Session Edge Cases', () => {
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
  });

  it('should handle corrupted user JSON in storage gracefully', async () => {
    await storage.setItem(STORAGE_KEYS.USER, 'NOT-VALID-JSON');
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'some-token');

    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });

    await sdk.ready();
    // Should not crash, should not be authenticated
    expect(sdk.isAuthenticated).toBe(false);
    sdk.destroy();
  });

  it('should handle missing access token but present user in storage', async () => {
    await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(createMockUser()));
    // No access token

    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });

    await sdk.ready();
    expect(sdk.isAuthenticated).toBe(false);
    sdk.destroy();
  });

  it('should clear all session keys on clearSession', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    // Login
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
    await sdk.loginWithPhone('91', '9876543210', '123456');

    // Verify all keys are set
    expect(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeTruthy();
    expect(await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeTruthy();
    expect(await storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)).toBeTruthy();
    expect(await storage.getItem(STORAGE_KEYS.REFRESH_EXPIRY)).toBeTruthy();
    expect(await storage.getItem(STORAGE_KEYS.USER)).toBeTruthy();

    // Logout
    await sdk.logout();

    // Verify all keys are cleared
    expect(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.REFRESH_EXPIRY)).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.USER)).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_ID)).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET)).toBeNull();

    sdk.destroy();
    mock.restore();
  });

  it('should handle getProfile setting wallet address', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    // Login
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
    await sdk.loginWithPhone('91', '9876543210', '123456');

    // Get profile with wallet address
    mock.onGet('/api/v1/profile/me/').reply(200, createMockUser({
      wallet_address: '0xNewWalletAddress123',
    }));

    const profile = await sdk.getProfile();
    expect(profile!.wallet_address).toBe('0xNewWalletAddress123');

    sdk.destroy();
    mock.restore();
  });

  it('should handle getProfile returning failure', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    // Login
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
    await sdk.loginWithPhone('91', '9876543210', '123456');

    // Profile fetch fails
    mock.onGet('/api/v1/profile/me/').reply(500);

    const profile = await sdk.getProfile();
    expect(profile).toBeNull();

    sdk.destroy();
    mock.restore();
  });

  it('should handle updateProfile failure and return error', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    // Login
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
    await sdk.loginWithPhone('91', '9876543210', '123456');

    // Update fails
    mock.onPost('/api/v1/profile/me/').reply(400, {
      message: 'Validation error',
    });

    const result = await sdk.updateProfile({ first_name: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation error');

    sdk.destroy();
    mock.restore();
  });

  it('should handle avatar generation failure at start', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    // Login
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());
    await sdk.loginWithPhone('91', '9876543210', '123456');

    // Avatar generation fails
    mock.onPost('/api/v1/avatar/generate/').reply(500, {
      detail: 'Service unavailable',
    });

    const result = await sdk.generateAvatar('bro');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Service unavailable');

    sdk.destroy();
    mock.restore();
  });

  it('should handle loginWithPhone with user without wallet_address', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    const authResponse = createMockAuthResponse({
      user: createMockUser({ wallet_address: '' }),
    });
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);

    const result = await sdk.loginWithPhone('91', '9876543210', '123456');
    expect(result.success).toBe(true);

    sdk.destroy();
    mock.restore();
  });

  it('should handle refreshTokenIfNeeded with no token expiry', async () => {
    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });

    // Call refreshTokenIfNeeded via the private method
    await (sdk as any).refreshTokenIfNeeded();
    // Should not throw - just returns early
    expect(sdk.isAuthenticated).toBe(false);

    sdk.destroy();
  });

  it('should handle refreshTokenIfNeeded when token not close to expiry', async () => {
    await storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, new Date(Date.now() + 10 * 60 * 1000).toISOString());
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');

    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });

    await (sdk as any).refreshTokenIfNeeded();
    // Should not try to refresh since it's 10 mins away
    expect(await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh-token');

    sdk.destroy();
  });

  it('should handle refreshTokenIfNeeded when refresh succeeds', async () => {
    await storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, new Date(Date.now() + 30 * 1000).toISOString());
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'valid-refresh');

    const sdk = new ZoPassportSDK({
      clientKey: 'test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);

    mock.onPost('/api/v1/auth/token/refresh/').reply(200, {
      access: 'new-access',
      refresh: 'new-refresh',
      access_expiry: '2099-12-31T23:59:59Z',
      refresh_expiry: '2099-12-31T23:59:59Z',
    });

    await (sdk as any).refreshTokenIfNeeded();
    expect(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('new-access');

    sdk.destroy();
    mock.restore();
  });
});
