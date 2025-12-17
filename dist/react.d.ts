import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
import { AxiosInstance } from 'axios';

/**
 * Storage adapter interface
 * Implement this to provide custom storage (e.g., AsyncStorage for React Native)
 */
interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
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

declare class ZoAuth$1 {
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

declare class ZoAvatar$1 {
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

interface ZoPassportSDKConfig extends ZoPassportConfig {
    /** Optional: Provide a custom storage adapter (default: LocalStorageAdapter) */
    storageAdapter?: StorageAdapter;
    /** Optional: Enable auto token refresh (default: true) */
    autoRefresh?: boolean;
    /** Optional: Token refresh interval in ms (default: 60000 = 1 minute) */
    refreshInterval?: number;
    /** Optional: Enable debug logging (default: false) */
    debug?: boolean;
}
declare class ZoPassportSDK {
    private client;
    private storage;
    private refreshTimer;
    private _readyPromise;
    auth: ZoAuth$1;
    profile: ZoProfile;
    avatar: ZoAvatar$1;
    wallet: ZoWallet;
    private _user;
    private _isAuthenticated;
    constructor(config: ZoPassportSDKConfig);
    /**
     * Wait for the SDK to be ready (session loaded from storage)
     * Use this if you need to check isAuthenticated immediately after construction
     */
    ready(): Promise<void>;
    private loadSession;
    private saveSession;
    clearSession(): Promise<void>;
    private startAutoRefresh;
    private stopAutoRefresh;
    private refreshTokenIfNeeded;
    get user(): ZoUser | null;
    get isAuthenticated(): boolean;
    /**
     * Complete phone authentication flow
     */
    loginWithPhone(countryCode: string, phoneNumber: string, otp: string): Promise<{
        success: boolean;
        user?: ZoUser;
        error?: string;
    }>;
    /**
     * Logout and clear session
     */
    logout(): Promise<void>;
    /**
     * Get current user profile
     */
    getProfile(): Promise<ZoUser | null>;
    /**
     * Update user profile
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
     * Generate avatar
     */
    generateAvatar(bodyType: 'bro' | 'bae'): Promise<{
        success: boolean;
        avatarUrl?: string;
        error?: string;
    }>;
    /**
     * Get wallet balance
     */
    getWalletBalance(): Promise<number>;
    /**
     * Get wallet transactions
     */
    getWalletTransactions(page?: number): Promise<{
        transactions: Transaction[];
        next?: string;
        previous?: string;
        count: number;
    }>;
    /**
     * Cleanup
     */
    destroy(): void;
}

interface ZoPassportCardProps {
    /** User profile data */
    profile: {
        avatar?: string;
        name?: string;
        isFounder?: boolean;
    };
    /** Profile completion */
    completion: {
        done: number;
        total: number;
    };
    /** Additional CSS class */
    className?: string;
    /** Optional: Override founder background URL */
    founderBgUrl?: string;
    /** Optional: Override citizen background URL */
    citizenBgUrl?: string;
    /** Optional: Default avatar fallback URL */
    defaultAvatarUrl?: string;
}
declare const ZoPassportCard: React.FC<ZoPassportCardProps>;

interface ZoPassportPageProps {
    user: ZoUser | null;
    balance?: number;
    completion?: {
        done: number;
        total: number;
    };
    walletOpen?: boolean;
    onWalletToggle?: () => void;
    onRemoveCulture?: (cultureKey: string) => void;
}
declare const ZoPassportPage: React.FC<ZoPassportPageProps>;

interface ZoProgressRingProps {
    /** Progress percentage (0-100) */
    progress: number;
    /** Size in pixels (default: 140) */
    size?: number;
    /** Stroke width in pixels (default: 4) */
    strokeWidth?: number;
    /** Primary stroke color (default: #FFFFFF) */
    primaryColor?: string;
    /** Secondary/background stroke color (default: rgba(255,255,255,0.2)) */
    secondaryColor?: string;
}
declare const ZoProgressRing: React.FC<ZoProgressRingProps>;

interface ZoAvatarProps {
    /** Avatar image URL */
    src?: string;
    /** User name (for alt text and fallback) */
    name?: string;
    /** Size in pixels (default: 120) */
    size?: number;
    /** Fallback image URL */
    fallbackUrl?: string;
    /** Additional CSS class */
    className?: string;
}
declare const ZoAvatar: React.FC<ZoAvatarProps>;

interface PhoneInputProps {
    /** Current phone number value */
    value: string;
    /** Current country code (without +) */
    countryCode: string;
    /** Callback when phone number changes */
    onChange: (phone: string) => void;
    /** Callback when country code changes */
    onCountryChange: (code: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Error message */
    error?: string;
    /** Additional CSS class */
    className?: string;
}
declare const PhoneInput: React.FC<PhoneInputProps>;

interface OTPInputProps {
    /** Current OTP value array */
    value: string[];
    /** Callback when OTP changes */
    onChange: (otp: string[]) => void;
    /** Callback when all 6 digits entered */
    onComplete?: (otp: string) => void;
    /** Number of digits (default: 6) */
    length?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Error message */
    error?: string;
    /** Auto-focus first input */
    autoFocus?: boolean;
    /** Additional CSS class */
    className?: string;
}
declare const OTPInput: React.FC<OTPInputProps>;

interface ZoAuthProps {
    /** Callback when auth is successful */
    onSuccess: (userId: string, user: any) => void;
    /** Callback to close modal */
    onClose?: () => void;
    /** Send OTP function (from SDK) */
    sendOTP: (countryCode: string, phoneNumber: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    /** Verify OTP function (from SDK) */
    verifyOTP: (countryCode: string, phoneNumber: string, otp: string) => Promise<{
        success: boolean;
        user?: ZoUser;
        error?: string;
    }>;
    /** Default country code (default: '91') */
    defaultCountryCode?: string;
    /** Show close button */
    showCloseButton?: boolean;
    /** Additional CSS class */
    className?: string;
}
declare const ZoAuth: React.FC<ZoAuthProps>;

interface ZoLandingProps {
    /** Callback when user successfully authenticates */
    onAuthSuccess: (userId: string, user: any) => void;
    /** Send OTP function (from SDK) */
    sendOTP: (countryCode: string, phoneNumber: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    /** Verify OTP function (from SDK) */
    verifyOTP: (countryCode: string, phoneNumber: string, otp: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    /** Video background URL */
    videoUrl?: string;
    /** Zo logo URL */
    logoUrl?: string;
    /** Title text */
    title?: string;
    /** Subtitle lines */
    subtitles?: string[];
    /** Button text */
    buttonText?: string;
    /** Additional CSS class */
    className?: string;
}
declare const ZoLanding: React.FC<ZoLandingProps>;

interface ZoOnboardingProps {
    /** Callback when onboarding is complete */
    onComplete: (userData: OnboardingData) => void;
    /** Update profile function (from SDK) */
    updateProfile: (updates: {
        first_name?: string;
        body_type?: 'bro' | 'bae';
        place_name?: string;
    }) => Promise<{
        success: boolean;
        error?: string;
    }>;
    /** Get profile function (from SDK) to poll for avatar */
    getProfile: () => Promise<any>;
    /** Video background URL */
    videoUrl?: string;
    /** Zo logo URL */
    logoUrl?: string;
    /** Bro avatar preview URL */
    broAvatarUrl?: string;
    /** Bae avatar preview URL */
    baeAvatarUrl?: string;
    /** Additional CSS class */
    className?: string;
}
interface OnboardingData {
    nickname: string;
    bodyType: 'bro' | 'bae';
    city: string;
    avatarUrl: string | null;
}
declare const ZoOnboarding: React.FC<ZoOnboardingProps>;

interface FounderBadgeProps {
    /** Size in pixels (default: 32) */
    size?: number;
}
declare const FounderBadge: React.FC<FounderBadgeProps>;

declare const WalletCardWeb: React.FC<WalletCardProps>;

interface WalletFullPageProps {
    user: ZoUser | null;
    balance: number;
    onClose: () => void;
    zoCoinUrl?: string;
    isLoading?: boolean;
    onRefresh?: () => void;
}
declare const WalletFullPage: React.FC<WalletFullPageProps>;

declare function useAuth(): {
    user: ZoUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    otpSent: boolean;
    phoneNumber: string;
    countryCode: string;
    sendOTP: (code: string, phone: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOTP: (otp: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    logout: () => Promise<void>;
};

declare function useProfile(): {
    user: ZoUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    completion: {
        done: number;
        total: number;
        percentage: number;
    };
    isFounder: boolean;
    updateProfile: (updates: ZoProfileUpdatePayload) => Promise<{
        success: boolean;
        profile?: ZoUser;
        error?: string;
    }>;
    reload: () => Promise<void>;
};

declare function useAvatar(): {
    avatarUrl: string | undefined;
    avatarStatus: "pending" | "processing" | "completed" | "failed";
    isGenerating: boolean;
    progress: string | null;
    error: string | null;
    generateAvatar: (bodyType: "bro" | "bae") => Promise<{
        success: boolean;
        avatarUrl?: string;
        error?: string;
    }>;
};

interface ApiClient$2 {
    get: AxiosInstance['get'];
}
interface UseWalletOptions {
    autoRefetch?: boolean;
    refetchInterval?: number;
}
/**
 * Combined hook for wallet functionality
 * Fetches both balance and transactions
 *
 * @param apiClient - Axios instance or compatible client with .get() method
 * @param options - Configuration options
 */
declare const useWallet: (apiClient?: ApiClient$2 | null, options?: UseWalletOptions) => {
    balance: number;
    transactions: Transaction[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
};

interface ApiClient$1 {
    get: AxiosInstance['get'];
}
interface UseWalletBalanceOptions {
    autoRefetch?: boolean;
    refetchInterval?: number;
}
/**
 * Hook to fetch wallet balance
 * Uses API: GET /api/v1/web3/token/airdrops/summary
 *
 * @param apiClient - Axios instance or compatible client with .get() method
 * @param options - Configuration options
 */
declare const useWalletBalance: (apiClient?: ApiClient$1 | null, options?: UseWalletBalanceOptions) => {
    balance: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};

interface ApiClient {
    get: AxiosInstance['get'];
}
interface UseTransactionsOptions {
    limit?: number;
    autoRefetch?: boolean;
}
/**
 * Hook to fetch transaction history
 * Uses API: GET /api/v1/profile/completion-grants/claims
 *
 * @param apiClient - Axios instance or compatible client with .get() method
 * @param options - Configuration options
 */
declare const useTransactions: (apiClient?: ApiClient | null, options?: UseTransactionsOptions) => {
    transactions: Transaction[];
    isLoading: boolean;
    error: Error | null;
    hasMore: boolean;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
};

interface ZoPassportContextValue {
    sdk: ZoPassportSDK | null;
    user: ZoUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    sendOTP: (countryCode: string, phoneNumber: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOTP: (countryCode: string, phoneNumber: string, otp: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}
interface ZoPassportProviderProps {
    children: ReactNode;
    clientKey: string;
    baseUrl?: string;
    autoRefresh?: boolean;
}
declare function ZoPassportProvider({ children, clientKey, baseUrl, autoRefresh, }: ZoPassportProviderProps): react_jsx_runtime.JSX.Element;
declare function useZoPassport(): ZoPassportContextValue;

export { type BalanceResponse, type FormattedTransaction, FounderBadge, type MovingShineProps, OTPInput, type OTPInputProps, PhoneInput, type PhoneInputProps, type Transaction, type TransactionItemProps, type TransactionListProps, type TransactionsResponse, type WalletBalance, WalletCardWeb as WalletCard, type WalletCardProps, WalletFullPage, type WalletScreenProps, type WalletUser, ZoAuth, type ZoAuthOTPRequest, type ZoAuthOTPVerifyRequest, type ZoAuthProps, type ZoAuthResponse, ZoAvatar, type ZoAvatarGenerateRequest, type ZoAvatarGenerateResponse, type ZoAvatarProps, type ZoAvatarStatusResponse, type ZoErrorResponse, ZoLanding, type ZoLandingProps, ZoOnboarding, type ZoOnboardingProps, ZoPassportCard, type ZoPassportCardProps, type ZoPassportCompletion, ZoPassportPage, type ZoPassportPageProps, type ZoPassportProfile, ZoPassportProvider, type ZoPassportProviderProps, ZoPassportSDK, type ZoProfileResponse, type ZoProfileUpdatePayload, ZoProgressRing, type ZoProgressRingProps, type ZoTokenBalanceResponse, type ZoTokenRefreshResponse, type ZoUser, type ZoWallet$1 as ZoWallet, useAuth, useAvatar, useProfile, useTransactions, useWallet, useWalletBalance, useZoPassport };
