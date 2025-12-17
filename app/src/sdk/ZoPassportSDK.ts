// ZoPassportSDK - Main SDK class
// One-stop initialization for the entire Zo Passport experience

import { ZoApiClient, ZoPassportConfig } from './lib/api/client';
import { ZoAuth } from './lib/api/auth';
import { ZoProfile } from './lib/api/profile';
import { ZoAvatar } from './lib/api/avatar';
import { ZoWallet } from './lib/api/wallet';
import { LocalStorageAdapter, AsyncStorageAdapter, StorageAdapter, STORAGE_KEYS } from './lib/utils/storage';
import type { ZoUser, ZoAuthResponse, Transaction } from './lib/types';

export interface ZoPassportSDKConfig extends ZoPassportConfig {
  /** Optional: Provide a custom storage adapter (default: LocalStorageAdapter) */
  storageAdapter?: StorageAdapter;
  /** Optional: Enable auto token refresh (default: true) */
  autoRefresh?: boolean;
  /** Optional: Token refresh interval in ms (default: 60000 = 1 minute) */
  refreshInterval?: number;
}

export class ZoPassportSDK {
  private client: ZoApiClient;
  private storage: StorageAdapter;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  public auth: ZoAuth;
  public profile: ZoProfile;
  public avatar: ZoAvatar;
  public wallet: ZoWallet;

  private _user: ZoUser | null = null;
  private _isAuthenticated: boolean = false;

  constructor(config: ZoPassportSDKConfig) {
    // Initialize storage adapter
    this.storage = config.storageAdapter || new LocalStorageAdapter();

    // Initialize API client
    this.client = new ZoApiClient({
      ...config,
      storageAdapter: this.storage,
    });

    // Initialize API modules
    this.auth = new ZoAuth(this.client, this.storage);
    this.profile = new ZoProfile(this.client, this.storage);
    this.avatar = new ZoAvatar(this.client, this.storage);
    this.wallet = new ZoWallet(this.client);

    // Start auto-refresh if enabled
    if (config.autoRefresh !== false) {
      this.startAutoRefresh(config.refreshInterval || 60000);
    }

    // Load existing session
    this.loadSession();
  }

  // =====================
  // Session Management
  // =====================

  private async loadSession(): Promise<void> {
    try {
      const userJson = await this.storage.getItem(STORAGE_KEYS.USER);
      const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (userJson && accessToken) {
        this._user = JSON.parse(userJson);
        this._isAuthenticated = true;
      }
    } catch (error) {
      console.warn('[ZoPassport] Failed to load session:', error);
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

  // =====================
  // Auto Token Refresh
  // =====================

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

    // Refresh if expiring within 2 minutes
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

  // =====================
  // Public API
  // =====================

  get user(): ZoUser | null {
    return this._user;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  /**
   * Complete phone authentication flow
   */
  async loginWithPhone(
    countryCode: string,
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; user?: ZoUser; error?: string }> {
    const result = await this.auth.verifyOTP(countryCode, phoneNumber, otp);

    if (result.success && result.data) {
      await this.saveSession(result.data);
      return { success: true, user: result.data.user };
    }

    return { success: false, error: result.error };
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    await this.clearSession();
    this.stopAutoRefresh();
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ZoUser | null> {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;

    const result = await this.profile.getProfile(accessToken);
    if (result.success && result.profile) {
      this._user = result.profile as ZoUser;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));
      return result.profile as ZoUser;
    }

    return null;
  }

  /**
   * Update user profile
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
   * Generate avatar
   */
  async generateAvatar(bodyType: 'bro' | 'bae'): Promise<{
    success: boolean;
    avatarUrl?: string;
    error?: string;
  }> {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: 'Not authenticated' };

    // Start generation
    const startResult = await this.avatar.generateAvatar(accessToken, bodyType);
    if (!startResult.success || !startResult.task_id) {
      return { success: false, error: startResult.error };
    }

    // Poll for completion
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
   * Get wallet balance
   */
  async getWalletBalance(): Promise<number> {
    return this.wallet.getBalance();
  }

  /**
   * Get wallet transactions
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
   * Cleanup
   */
  destroy(): void {
    this.stopAutoRefresh();
  }
}

