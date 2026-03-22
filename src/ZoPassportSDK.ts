/**
 * @module ZoPassportSDK
 * Main SDK class — single entry point for the Zo Passport experience.
 *
 * @example
 * ```ts
 * import { ZoPassportSDK } from 'zopassport';
 *
 * const sdk = new ZoPassportSDK({ clientKey: 'your-client-key' });
 * await sdk.ready();
 *
 * // Send OTP
 * await sdk.auth.sendOTP('91', '9876543210');
 *
 * // Verify OTP & login
 * const { success, user } = await sdk.loginWithPhone('91', '9876543210', '123456');
 * ```
 */

import { ZoApiClient, ZoPassportConfig } from './lib/api/client';
import { ZoAuth } from './lib/api/auth';
import { ZoProfile } from './lib/api/profile';
import { ZoAvatar } from './lib/api/avatar';
import { ZoWallet } from './lib/api/wallet';
import { LocalStorageAdapter, AsyncStorageAdapter, StorageAdapter, STORAGE_KEYS } from './lib/utils/storage';
import { logger } from './lib/utils/logger';
import { validateConfig, validatePhoneNumber, validateCountryCode, validateOTP } from './lib/utils/validation';
import type { ZoUser, ZoAuthResponse, Transaction } from './lib/types';

/** Configuration options for {@link ZoPassportSDK}. */
export interface ZoPassportSDKConfig extends ZoPassportConfig {
  /** Custom storage adapter. Defaults to `LocalStorageAdapter` (web) or pass `AsyncStorageAdapter` for React Native. */
  storageAdapter?: StorageAdapter;
  /** Enable automatic access-token refresh. Default: `true`. */
  autoRefresh?: boolean;
  /** Token refresh check interval in milliseconds. Default: `60000` (1 min). */
  refreshInterval?: number;
  /** Enable debug logging to the console. Default: `false`. */
  debug?: boolean;
}

/**
 * The main Zo Passport SDK.
 *
 * Provides authentication, profile management, avatar generation, and wallet
 * functionality through a single, easy-to-use API.
 *
 * @example
 * ```ts
 * const sdk = new ZoPassportSDK({
 *   clientKey: 'your-key',
 *   autoRefresh: true,
 *   debug: false,
 * });
 * ```
 */
export class ZoPassportSDK {
  private client: ZoApiClient;
  private storage: StorageAdapter;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private _readyPromise: Promise<void>;

  /** Low-level auth API. Use {@link loginWithPhone} for the high-level flow. */
  public auth: ZoAuth;
  /** Low-level profile API. Use {@link getProfile} / {@link updateProfile} instead. */
  public profile: ZoProfile;
  /** Low-level avatar API. Use {@link generateAvatar} for the high-level flow. */
  public avatar: ZoAvatar;
  /** Low-level wallet API. Use {@link getWalletBalance} / {@link getWalletTransactions} instead. */
  public wallet: ZoWallet;

  private _user: ZoUser | null = null;
  private _isAuthenticated: boolean = false;

  /**
   * Create a new SDK instance.
   *
   * @param config - SDK configuration. `clientKey` is required.
   * @throws {ZoConfigError} if `clientKey` is missing or empty.
   *
   * @example
   * ```ts
   * const sdk = new ZoPassportSDK({ clientKey: 'your-key' });
   * await sdk.ready(); // wait for session restore
   * ```
   */
  constructor(config: ZoPassportSDKConfig) {
    validateConfig(config);

    if (config.debug) {
      logger.enable();
      logger.setLevel('debug');
    }

    this.storage = config.storageAdapter || new LocalStorageAdapter();

    this.client = new ZoApiClient({
      ...config,
      storageAdapter: this.storage,
    });

    this.auth = new ZoAuth(this.client);
    this.profile = new ZoProfile(this.client);
    this.avatar = new ZoAvatar(this.client);
    this.wallet = new ZoWallet(this.client);

    if (config.autoRefresh !== false) {
      this.startAutoRefresh(config.refreshInterval || 60000);
    }

    this._readyPromise = this.loadSession();

    logger.debug('SDK initialized with config:', {
      baseUrl: config.baseUrl,
      autoRefresh: config.autoRefresh !== false,
    });
  }

  /**
   * Wait for the SDK to finish loading any existing session from storage.
   * Call this before checking {@link isAuthenticated} right after construction.
   *
   * @example
   * ```ts
   * await sdk.ready();
   * if (sdk.isAuthenticated) { ... }
   * ```
   */
  async ready(): Promise<void> {
    return this._readyPromise;
  }

  // ── Session Management ───────────────────────────────────

  private async loadSession(): Promise<void> {
    try {
      const userJson = await this.storage.getItem(STORAGE_KEYS.USER);
      const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (userJson && accessToken) {
        this._user = JSON.parse(userJson);
        this._isAuthenticated = true;
      }
    } catch (error) {
      logger.warn('Failed to load session:', error);
    }
  }

  private async saveSession(authResponse: ZoAuthResponse): Promise<void> {
    await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.access_token);
    await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refresh_token);
    await this.storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, authResponse.access_token_expiry);
    await this.storage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, authResponse.refresh_token_expiry);
    await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, authResponse.device_id || '');
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, authResponse.device_secret || '');

    this._user = authResponse.user;
    this._isAuthenticated = true;
  }

  async clearSession(): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await this.storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    await this.storage.removeItem(STORAGE_KEYS.REFRESH_EXPIRY);
    await this.storage.removeItem(STORAGE_KEYS.USER);
    await this.storage.removeItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    await this.storage.removeItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET);

    this._user = null;
    this._isAuthenticated = false;
  }

  // ── Auto Token Refresh ───────────────────────────────────

  private startAutoRefresh(interval: number): void {
    this.refreshTimer = setInterval(async () => {
      await this.refreshTokenIfNeeded();
    }, interval);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    const tokenExpiry = await this.storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!tokenExpiry || !refreshToken) return;

    const expiryDate = new Date(tokenExpiry);
    const now = new Date();
    const twoMinutes = 2 * 60 * 1000;

    if (expiryDate.getTime() - now.getTime() < twoMinutes) {
      const result = await this.auth.refreshAccessToken(refreshToken);
      if (result.success && result.tokens) {
        await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.tokens.access);
        await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.tokens.refresh);
        await this.storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, result.tokens.access_expiry);
        await this.storage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, result.tokens.refresh_expiry);
      }
    }
  }

  // ── Public API ───────────────────────────────────────────

  /** The currently authenticated user, or `null` if not logged in. */
  get user(): ZoUser | null {
    return this._user;
  }

  /** Whether the user has an active session. */
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  /**
   * Authenticate via phone OTP. This is the high-level login method that
   * verifies the OTP, saves the session, and sets up the wallet.
   *
   * @param countryCode - Country dial code, e.g. `"91"` for India, `"1"` for US.
   * @param phoneNumber - Phone number without country code, e.g. `"9876543210"`.
   * @param otp - The OTP code received via SMS.
   * @returns Object with `success`, `user` (on success), or `error` (on failure).
   * @throws {ZoValidationError} if any input is invalid.
   *
   * @example
   * ```ts
   * // Step 1: Send OTP
   * await sdk.auth.sendOTP('91', '9876543210');
   *
   * // Step 2: Verify & login
   * const result = await sdk.loginWithPhone('91', '9876543210', '123456');
   * if (result.success) {
   *   console.log('Logged in as', result.user.first_name);
   * }
   * ```
   */
  async loginWithPhone(
    countryCode: string,
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; user?: ZoUser; error?: string }> {
    validateCountryCode(countryCode);
    validatePhoneNumber(phoneNumber);
    validateOTP(otp);

    const result = await this.auth.verifyOTP(countryCode, phoneNumber, otp);

    if (result.success && result.data) {
      await this.saveSession(result.data);

      if (result.data.user?.wallet_address) {
        this.wallet.setWalletAddress(result.data.user.wallet_address, 'base');
      }

      return { success: true, user: result.data.user };
    }

    return { success: false, error: result.error };
  }

  /**
   * Log out the current user. Clears tokens, user data, and stops auto-refresh.
   *
   * @example
   * ```ts
   * await sdk.logout();
   * console.log(sdk.isAuthenticated); // false
   * ```
   */
  async logout(): Promise<void> {
    await this.clearSession();
    this.stopAutoRefresh();
  }

  /**
   * Fetch the current user's profile from the API and update the local cache.
   *
   * @returns The user profile, or `null` if not authenticated or fetch failed.
   *
   * @example
   * ```ts
   * const profile = await sdk.getProfile();
   * console.log(profile?.first_name, profile?.wallet_address);
   * ```
   */
  async getProfile(): Promise<ZoUser | null> {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;

    const result = await this.profile.getProfile(accessToken);
    if (result.success && result.profile) {
      this._user = result.profile as ZoUser;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));

      if (result.profile.wallet_address) {
        this.wallet.setWalletAddress(result.profile.wallet_address, 'base');
      }

      return result.profile as ZoUser;
    }

    return null;
  }

  /**
   * Update the authenticated user's profile. Supports partial updates.
   *
   * @param updates - Fields to update. All fields are optional.
   * @returns Object with `success`, `profile` (on success), or `error` (on failure).
   *
   * @example
   * ```ts
   * const result = await sdk.updateProfile({
   *   first_name: 'Samurai',
   *   bio: 'Explorer',
   *   body_type: 'bro',
   * });
   * ```
   */
  async updateProfile(updates: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    date_of_birth?: string;
    place_name?: string;
    body_type?: 'bro' | 'bae';
  }): Promise<{ success: boolean; profile?: ZoUser; error?: string }> {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: 'Not authenticated' };

    const result = await this.profile.updateProfile(accessToken, updates);
    if (result.success && result.profile) {
      this._user = result.profile as ZoUser;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));
      return { success: true, profile: result.profile as ZoUser };
    }

    return { success: false, error: result.error };
  }

  /**
   * Generate an AI avatar for the current user.
   * Starts generation and polls until completion or failure.
   *
   * @param bodyType - Avatar body type: `"bro"` or `"bae"`.
   * @returns Object with `success`, `avatarUrl` (on success), or `error` (on failure).
   *
   * @example
   * ```ts
   * const result = await sdk.generateAvatar('bro');
   * if (result.success) {
   *   console.log('Avatar URL:', result.avatarUrl);
   * }
   * ```
   */
  async generateAvatar(bodyType: 'bro' | 'bae'): Promise<{
    success: boolean;
    avatarUrl?: string;
    error?: string;
  }> {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: 'Not authenticated' };

    const startResult = await this.avatar.generateAvatar(accessToken, bodyType);
    if (!startResult.success || !startResult.task_id) {
      return { success: false, error: startResult.error };
    }

    return new Promise((resolve) => {
      this.avatar.pollAvatarStatus(accessToken, startResult.task_id!, {
        onComplete: (avatarUrl) => {
          resolve({ success: true, avatarUrl });
        },
        onError: (error) => {
          resolve({ success: false, error });
        },
      });
    });
  }

  /**
   * Get the user's $Zo token balance.
   * Tries on-chain balance first (if wallet address is set), then falls back to API.
   *
   * @returns The balance as a number.
   *
   * @example
   * ```ts
   * const balance = await sdk.getWalletBalance();
   * console.log(`Balance: ${balance} $Zo`);
   * ```
   */
  async getWalletBalance(): Promise<number> {
    return this.wallet.getBalance();
  }

  /**
   * Get the user's transaction history with pagination.
   *
   * @param page - Page number for pagination (optional).
   * @returns Object with `transactions` array, `count`, `next`, and `previous` cursor URLs.
   *
   * @example
   * ```ts
   * const { transactions, count } = await sdk.getWalletTransactions();
   * transactions.forEach(tx => console.log(tx.description, tx.amount));
   * ```
   */
  async getWalletTransactions(page?: number): Promise<{
    transactions: Transaction[];
    next?: string;
    previous?: string;
    count: number;
  }> {
    return this.wallet.getTransactions(page);
  }

  /**
   * Destroy the SDK instance. Stops auto-refresh timers.
   * Call this when unmounting your app or switching users.
   */
  destroy(): void {
    this.stopAutoRefresh();
  }
}
