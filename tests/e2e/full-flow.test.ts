import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoPassportSDK } from '../../src/ZoPassportSDK';
import { MemoryStorageAdapter, STORAGE_KEYS } from '../../src/lib/utils/storage';
import { createMockAuthResponse, createMockUser } from '../helpers';

/**
 * End-to-End Tests
 *
 * These tests simulate complete user flows from start to finish,
 * testing the SDK as a black box through its public API.
 * All HTTP calls are mocked but the full internal flow is exercised.
 */
describe('E2E: Complete User Journey', () => {
  let sdk: ZoPassportSDK;
  let storage: MemoryStorageAdapter;
  let mock: MockAdapter;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Mock fetch to fail fast so on-chain balance falls back to API
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('No RPC in tests'));

    storage = new MemoryStorageAdapter();
    sdk = new ZoPassportSDK({
      clientKey: 'e2e-test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    mock = new MockAdapter(sdk.auth['client'].axiosInstance);
  });

  afterEach(() => {
    sdk.destroy();
    mock.restore();
    globalThis.fetch = originalFetch;
  });

  it('should complete full signup flow: OTP → Login → Profile → Avatar → Wallet', async () => {
    // ============ Step 1: Send OTP ============
    mock.onPost('/api/v1/auth/login/mobile/otp/').reply(200, {
      message: 'OTP sent to +91 9876543210',
    });

    const otpResult = await sdk.auth.sendOTP('91', '9876543210', 'test-captcha-token');
    expect(otpResult.success).toBe(true);

    // ============ Step 2: Verify OTP & Login ============
    const authResponse = createMockAuthResponse({
      user: createMockUser({
        first_name: '',
        last_name: '',
        bio: '',
        avatar: undefined,
      }),
    });
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);

    const loginResult = await sdk.loginWithPhone('91', '9876543210', '123456');
    expect(loginResult.success).toBe(true);
    expect(sdk.isAuthenticated).toBe(true);
    expect(sdk.user!.first_name).toBe('');

    // ============ Step 3: Update Profile (Onboarding) ============
    const updatedUser = createMockUser({
      first_name: 'Samurai',
      bio: 'Explorer of the world',
      place_name: 'Goa',
      body_type: 'bro',
    });
    mock.onPost('/api/v1/profile/me/').reply(200, updatedUser);

    const profileResult = await sdk.updateProfile({
      first_name: 'Samurai',
      bio: 'Explorer of the world',
      place_name: 'Goa',
      body_type: 'bro',
    });
    expect(profileResult.success).toBe(true);
    expect(sdk.user!.first_name).toBe('Samurai');
    expect(sdk.user!.place_name).toBe('Goa');

    // ============ Step 4: Generate Avatar ============
    mock.onPost('/api/v1/avatar/generate/').reply(200, {
      task_id: 'avatar-e2e-task',
      status: 'pending',
      message: 'Avatar generation started',
    });

    mock.onGet('/api/v1/avatar/status/avatar-e2e-task/').reply(200, {
      task_id: 'avatar-e2e-task',
      status: 'completed',
      result: { avatar_url: 'https://avatars.zo.xyz/samurai.png' },
    });

    const avatarResult = await sdk.generateAvatar('bro');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(avatarResult.success).toBe(true);
    expect(avatarResult.avatarUrl).toBe('https://avatars.zo.xyz/samurai.png');

    // ============ Step 5: Check Wallet Balance ============
    mock.onGet('/api/v1/web3/token/airdrops/summary').reply(200, {
      data: { total_amount: 500 },
    });

    const balance = await sdk.getWalletBalance();
    expect(balance).toBe(500);

    // ============ Step 6: View Transactions ============
    mock.onGet('/api/v1/profile/completion-grants/claims').reply(200, {
      data: {
        results: [
          {
            id: 'txn-welcome',
            amount: 100,
            description: 'Welcome bonus',
            action: 'deposit',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            claimed_at: '2024-01-01',
            grant: { id: 'g1', name: 'Welcome', description: 'Welcome bonus' },
          },
          {
            id: 'txn-profile',
            amount: 200,
            description: 'Profile completion',
            action: 'deposit',
            created_at: '2024-01-02',
            updated_at: '2024-01-02',
            claimed_at: '2024-01-02',
            grant: { id: 'g2', name: 'Profile', description: 'Complete profile' },
          },
        ],
        count: 2,
        next: null,
        previous: null,
      },
    });

    const txResult = await sdk.getWalletTransactions();
    expect(txResult.transactions).toHaveLength(2);
    expect(txResult.transactions[0].amount).toBe(100);
    expect(txResult.transactions[1].amount).toBe(200);

    // ============ Step 7: Refresh Profile ============
    const refreshedUser = createMockUser({
      first_name: 'Samurai',
      avatar: { image: 'https://avatars.zo.xyz/samurai.png', status: 'completed' },
    });
    mock.onGet('/api/v1/profile/me/').reply(200, refreshedUser);

    const profile = await sdk.getProfile();
    expect(profile!.avatar!.image).toBe('https://avatars.zo.xyz/samurai.png');
  });

  it('should handle login → logout → re-login flow', async () => {
    // Login
    const authResponse = createMockAuthResponse();
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);
    await sdk.loginWithPhone('91', '9876543210', '123456');
    expect(sdk.isAuthenticated).toBe(true);

    // Logout
    await sdk.logout();
    expect(sdk.isAuthenticated).toBe(false);
    expect(sdk.user).toBeNull();

    // Verify storage cleared
    expect(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();

    // Re-login with different user
    const newAuthResponse = createMockAuthResponse({
      user: createMockUser({ id: 'new-user-id', first_name: 'NewUser' }),
      access_token: 'new-token',
    });
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, newAuthResponse);

    const relogin = await sdk.loginWithPhone('91', '1111111111', '654321');
    expect(relogin.success).toBe(true);
    expect(sdk.user!.id).toBe('new-user-id');
    expect(sdk.user!.first_name).toBe('NewUser');
  });

  it('should handle session persistence across SDK instances', async () => {
    // Login with first SDK instance
    const authResponse = createMockAuthResponse();
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);
    await sdk.loginWithPhone('91', '9876543210', '123456');
    sdk.destroy();

    // Create new SDK instance with same storage
    const sdk2 = new ZoPassportSDK({
      clientKey: 'e2e-test-key',
      storageAdapter: storage,
      autoRefresh: false,
    });

    await sdk2.ready();
    expect(sdk2.isAuthenticated).toBe(true);
    expect(sdk2.user!.id).toBe('test-user-id-123');

    sdk2.destroy();
  });

  it('should handle error recovery: failed profile update then retry', async () => {
    // Login
    const authResponse = createMockAuthResponse();
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);
    await sdk.loginWithPhone('91', '9876543210', '123456');

    // First update fails
    mock.onPost('/api/v1/profile/me/').replyOnce(500);

    const failResult = await sdk.updateProfile({ first_name: 'Retry' });
    expect(failResult.success).toBe(false);

    // Retry succeeds
    mock.onPost('/api/v1/profile/me/').reply(200, createMockUser({ first_name: 'Retry' }));

    const retryResult = await sdk.updateProfile({ first_name: 'Retry' });
    expect(retryResult.success).toBe(true);
    expect(sdk.user!.first_name).toBe('Retry');
  });

  it('should handle network failure during OTP send gracefully', async () => {
    mock.onPost('/api/v1/auth/login/mobile/otp/').networkError();

    const result = await sdk.auth.sendOTP('91', '9876543210', 'test-captcha-token');
    expect(result.success).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('should protect profile endpoint when not authenticated', async () => {
    const profile = await sdk.getProfile();
    expect(profile).toBeNull();

    const update = await sdk.updateProfile({ first_name: 'Hack' });
    expect(update.success).toBe(false);
    expect(update.error).toBe('Not authenticated');

    const avatar = await sdk.generateAvatar('bro');
    expect(avatar.success).toBe(false);
    expect(avatar.error).toBe('Not authenticated');
  });
});
