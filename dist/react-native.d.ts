import React from 'react';
import { AxiosInstance } from 'axios';

interface ZoWallet$1 {
    address: string;
    network: 'base' | 'avalanche';
    balance?: number;
}
interface ZoTokenBalanceResponse {
    balance: number;
    currency: {
        name: string;
        symbol: string;
    };
}
interface WalletBalance {
    total_amount: number;
    currency: string;
}
interface Transaction {
    id: string;
    created_at: string;
    updated_at: string;
    amount: number;
    description: string;
    claimed_at: string;
    grant: {
        id: string;
        name: string;
        description: string;
    };
    action: 'deposit' | 'spend';
}
interface WalletUser {
    avatar?: {
        image: string;
    };
    first_name: string;
    nickname?: string;
    wallet_address: string;
}
interface BalanceResponse {
    data: {
        total_amount: number;
    };
}
interface TransactionsResponse {
    data: {
        results: Transaction[];
        next?: string;
        previous?: string;
        count: number;
    };
}
interface FormattedTransaction {
    id: string;
    description: string;
    amount: string;
    date: string;
    timestamp: string;
    action: 'deposit' | 'spend';
    color: string;
}
interface WalletCardProps {
    balance: number;
    user: WalletUser;
    isOpen?: boolean;
    onToggle?: () => void;
    isLoading?: boolean;
}
interface TransactionItemProps {
    transaction: Transaction;
    showDate?: boolean;
}
interface TransactionListProps {
    transactions: Transaction[];
    isLoading?: boolean;
    onEndReached?: () => void;
}
interface MovingShineProps {
    duration?: number;
}
interface WalletScreenProps {
    /** User data for the wallet */
    user: WalletUser;
    /** Current balance */
    balance: number;
    /** Transaction history */
    transactions: Transaction[];
    /** Loading state */
    isLoading?: boolean;
    /** Callback when back button is pressed */
    onBack?: () => void;
}

declare const WalletScreen: React.FC<WalletScreenProps>;

declare const WalletCard: React.FC<WalletCardProps>;

declare const TransactionList: React.FC<TransactionListProps>;

declare const TransactionItem: React.FC<TransactionItemProps>;

declare const MovingShine: React.FC<MovingShineProps>;

interface ZoTokenProps {
    size?: number;
    style?: any;
    /** Custom source URL for the Zo coin */
    source?: string;
}
/**
 * Static $Zo Token Icon - uses the animated zo-coin.gif
 */
declare const ZoToken: React.FC<ZoTokenProps>;
/**
 * Animated $Zo Token Video Component
 * Uses the zo-coin.gif animated image
 */
declare const ZoTokenVideo: React.FC<ZoTokenProps>;

/**
 * Storage adapter interface
 * Implement this to provide custom storage (e.g., AsyncStorage for React Native)
 */
interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
/**
 * Storage keys used by the SDK
 */
declare const STORAGE_KEYS: {
    readonly ACCESS_TOKEN: "zo_access_token";
    readonly REFRESH_TOKEN: "zo_refresh_token";
    readonly TOKEN_EXPIRY: "zo_token_expiry";
    readonly REFRESH_EXPIRY: "zo_refresh_expiry";
    readonly USER: "zo_user";
    readonly CLIENT_DEVICE_ID: "zo_device_id";
    readonly CLIENT_DEVICE_SECRET: "zo_device_secret";
    readonly AVATAR_URL: "zo_avatar_url";
    readonly NICKNAME: "zo_nickname";
    readonly CITY: "zo_city";
    readonly BODY_TYPE: "zo_body_type";
};
/**
 * AsyncStorage adapter for React Native
 * Provide AsyncStorage from @react-native-async-storage/async-storage
 */
declare class AsyncStorageAdapter implements StorageAdapter {
    private storage;
    constructor(asyncStorage: AsyncStorageAdapter['storage']);
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
/**
 * In-memory storage adapter (for SSR or testing)
 */
declare class MemoryStorageAdapter implements StorageAdapter {
    private store;
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    /** Clear all stored data (useful for testing) */
    clear(): void;
}

interface ZoPassportConfig {
    /** Your ZO client key (required) */
    clientKey: string;
    /** API base URL (default: https://api.io.zo.xyz) */
    baseUrl?: string;
    /** Request timeout in ms (default: 10000) */
    timeout?: number;
    /** Storage adapter for tokens (default: LocalStorageAdapter) */
    storageAdapter?: StorageAdapter;
}
declare class ZoApiClient {
    private client;
    private config;
    private storage;
    constructor(config: ZoPassportConfig);
    private setupInterceptors;
    private getOrCreateDeviceCredentials;
    get axiosInstance(): AxiosInstance;
    getStorage(): StorageAdapter;
}

interface ZoUser {
    id: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    date_of_birth?: string;
    place_name?: string;
    body_type?: 'bro' | 'bae';
    pfp_image?: string;
    email_address?: string;
    mobile_country_code?: string;
    mobile_number?: string;
    wallet_address?: string;
    membership?: 'citizen' | 'founder';
    cultures?: string[];
    avatar?: {
        status: 'pending' | 'processing' | 'completed' | 'failed';
        image?: string;
    };
    role?: string;
    created_at?: string;
    updated_at?: string;
}
interface ZoProfileResponse {
    id: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    date_of_birth?: string;
    location?: {
        place_name?: string;
        latitude?: number;
        longitude?: number;
    };
    body_type?: 'bro' | 'bae';
    pfp_image?: string;
    email_address?: string;
    mobile_country_code?: string;
    mobile_number?: string;
    wallet_address?: string;
    zo_membership?: string;
    cultures?: string[];
    avatar?: {
        status: 'pending' | 'processing' | 'completed' | 'failed';
        image?: string;
    };
    founder_nfts?: any[];
    founder_nfts_count?: number;
    role?: string;
}
interface ZoProfileUpdatePayload {
    first_name?: string;
    last_name?: string;
    bio?: string;
    date_of_birth?: string;
    place_name?: string;
    body_type?: 'bro' | 'bae';
    pfp_image?: string;
    cultures?: string[];
}
interface ZoAuthOTPRequest {
    mobile_country_code: string;
    mobile_number: string;
    message_channel: string;
}
interface ZoAuthOTPVerifyRequest {
    mobile_country_code: string;
    mobile_number: string;
    otp: string;
}
interface ZoAuthResponse {
    user: ZoUser;
    access_token: string;
    refresh_token: string;
    access_token_expiry: string;
    refresh_token_expiry: string;
    device_id?: string;
    device_secret?: string;
}
interface ZoTokenRefreshResponse {
    access: string;
    refresh: string;
    access_expiry: string;
    refresh_expiry: string;
}
interface ZoAvatarGenerateRequest {
    body_type: 'bro' | 'bae';
}
interface ZoAvatarGenerateResponse {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}
interface ZoAvatarStatusResponse {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: {
        avatar_url?: string;
    };
}
interface ZoErrorResponse {
    success?: boolean;
    error?: string;
    message?: string;
    detail?: string;
    errors?: string[];
}
interface ZoPassportProfile {
    avatar?: string;
    name?: string;
    isFounder?: boolean;
}
interface ZoPassportCompletion {
    done: number;
    total: number;
}

declare class ZoAuth {
    private client;
    constructor(client: ZoApiClient);
    /**
     * Send OTP to phone number
     * Step 1 of ZO phone authentication
     */
    sendOTP(countryCode: string, phoneNumber: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Verify OTP and authenticate user
     * Step 2 of ZO phone authentication
     * Returns full auth response with tokens and user profile
     */
    verifyOTP(countryCode: string, phoneNumber: string, otp: string): Promise<{
        success: boolean;
        data?: ZoAuthResponse;
        error?: string;
    }>;
    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(refreshToken: string): Promise<{
        success: boolean;
        tokens?: {
            access: string;
            refresh: string;
            access_expiry: string;
            refresh_expiry: string;
        };
        error?: string;
    }>;
    /**
     * Check if user is authenticated
     */
    checkLoginStatus(accessToken: string): Promise<{
        success: boolean;
        isAuthenticated: boolean;
    }>;
    /**
     * Extract error message from various ZO API error formats
     */
    private extractErrorMessage;
}

declare class ZoProfile {
    private client;
    constructor(client: ZoApiClient);
    /**
     * Get user profile
     */
    getProfile(accessToken: string): Promise<{
        success: boolean;
        profile?: ZoProfileResponse;
        error?: string;
    }>;
    /**
     * Update user profile (partial updates supported)
     */
    updateProfile(accessToken: string, updates: ZoProfileUpdatePayload): Promise<{
        success: boolean;
        profile?: ZoProfileResponse;
        error?: string;
    }>;
}

declare class ZoAvatar {
    private client;
    constructor(client: ZoApiClient);
    /**
     * Generate avatar for user
     */
    generateAvatar(accessToken: string, bodyType: 'bro' | 'bae'): Promise<{
        success: boolean;
        task_id?: string;
        status?: string;
        error?: string;
    }>;
    /**
     * Check avatar generation status
     */
    getAvatarStatus(accessToken: string, taskId: string): Promise<{
        success: boolean;
        status?: 'pending' | 'processing' | 'completed' | 'failed';
        avatarUrl?: string;
        error?: string;
    }>;
    /**
     * Poll avatar status until completion
     */
    pollAvatarStatus(accessToken: string, taskId: string, options?: {
        onProgress?: (status: string) => void;
        onComplete?: (avatarUrl: string) => void;
        onError?: (error: string) => void;
        maxAttempts?: number;
        interval?: number;
    }): Promise<void>;
}

declare class ZoWallet {
    private client;
    private cachedBalance;
    private userWalletAddress;
    private network;
    constructor(client: ZoApiClient);
    /**
     * Set the user's wallet address for on-chain queries
     */
    setWalletAddress(address: string, network?: 'base' | 'avalanche'): void;
    /**
     * Get wallet balance - tries on-chain first, then API fallback
     * @returns Wallet balance amount
     */
    getBalance(): Promise<number>;
    /**
     * Fetch balance directly from blockchain via JSON-RPC
     */
    private getOnChainBalance;
    /**
     * Fetch balance from Zo API endpoints (tries multiple endpoints with fallback)
     */
    private getBalanceFromAPI;
    /**
     * Get transaction history
     * @param page - Optional page number for pagination
     * @returns Array of transactions
     */
    getTransactions(page?: number): Promise<{
        transactions: Transaction[];
        next?: string;
        previous?: string;
        count: number;
    }>;
}

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

/** Configuration options for {@link ZoPassportSDK}. */
interface ZoPassportSDKConfig extends ZoPassportConfig {
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
declare class ZoPassportSDK {
    private client;
    private storage;
    private refreshTimer;
    private _readyPromise;
    /** Low-level auth API. Use {@link loginWithPhone} for the high-level flow. */
    auth: ZoAuth;
    /** Low-level profile API. Use {@link getProfile} / {@link updateProfile} instead. */
    profile: ZoProfile;
    /** Low-level avatar API. Use {@link generateAvatar} for the high-level flow. */
    avatar: ZoAvatar;
    /** Low-level wallet API. Use {@link getWalletBalance} / {@link getWalletTransactions} instead. */
    wallet: ZoWallet;
    private _user;
    private _isAuthenticated;
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
    constructor(config: ZoPassportSDKConfig);
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
    ready(): Promise<void>;
    private loadSession;
    private saveSession;
    clearSession(): Promise<void>;
    private startAutoRefresh;
    private stopAutoRefresh;
    private refreshTokenIfNeeded;
    /** The currently authenticated user, or `null` if not logged in. */
    get user(): ZoUser | null;
    /** Whether the user has an active session. */
    get isAuthenticated(): boolean;
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
    loginWithPhone(countryCode: string, phoneNumber: string, otp: string): Promise<{
        success: boolean;
        user?: ZoUser;
        error?: string;
    }>;
    /**
     * Log out the current user. Clears tokens, user data, and stops auto-refresh.
     *
     * @example
     * ```ts
     * await sdk.logout();
     * console.log(sdk.isAuthenticated); // false
     * ```
     */
    logout(): Promise<void>;
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
    getProfile(): Promise<ZoUser | null>;
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
    updateProfile(updates: {
        first_name?: string;
        last_name?: string;
        bio?: string;
        date_of_birth?: string;
        place_name?: string;
        body_type?: 'bro' | 'bae';
    }): Promise<{
        success: boolean;
        profile?: ZoUser;
        error?: string;
    }>;
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
    generateAvatar(bodyType: 'bro' | 'bae'): Promise<{
        success: boolean;
        avatarUrl?: string;
        error?: string;
    }>;
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
    getWalletBalance(): Promise<number>;
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
    getWalletTransactions(page?: number): Promise<{
        transactions: Transaction[];
        next?: string;
        previous?: string;
        count: number;
    }>;
    /**
     * Destroy the SDK instance. Stops auto-refresh timers.
     * Call this when unmounting your app or switching users.
     */
    destroy(): void;
}

export { AsyncStorageAdapter, type BalanceResponse, type FormattedTransaction, MemoryStorageAdapter, MovingShine, type MovingShineProps, STORAGE_KEYS, type StorageAdapter, type Transaction, TransactionItem, type TransactionItemProps, TransactionList, type TransactionListProps, type TransactionsResponse, type WalletBalance, WalletCard, type WalletCardProps, WalletScreen, type WalletScreenProps, type WalletUser, type ZoAuthOTPRequest, type ZoAuthOTPVerifyRequest, type ZoAuthResponse, type ZoAvatarGenerateRequest, type ZoAvatarGenerateResponse, type ZoAvatarStatusResponse, type ZoErrorResponse, type ZoPassportCompletion, type ZoPassportProfile, ZoPassportSDK, type ZoPassportSDKConfig, type ZoProfileResponse, type ZoProfileUpdatePayload, ZoToken, type ZoTokenBalanceResponse, type ZoTokenRefreshResponse, ZoTokenVideo, type ZoUser, type ZoWallet$1 as ZoWallet };
