"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react.tsx
var react_exports = {};
__export(react_exports, {
  FounderBadge: () => FounderBadge,
  OTPInput: () => OTPInput,
  PhoneInput: () => PhoneInput,
  WalletCard: () => WalletCardWeb,
  WalletFullPage: () => WalletFullPage,
  ZoAuth: () => ZoAuth2,
  ZoAvatar: () => ZoAvatar2,
  ZoLanding: () => ZoLanding,
  ZoOnboarding: () => ZoOnboarding,
  ZoPassportCard: () => ZoPassportCard,
  ZoPassportPage: () => ZoPassportPage,
  ZoPassportProvider: () => ZoPassportProvider,
  ZoPassportSDK: () => ZoPassportSDK,
  ZoProgressRing: () => ZoProgressRing,
  useAuth: () => useAuth,
  useAvatar: () => useAvatar,
  useProfile: () => useProfile,
  useTransactions: () => useTransactions,
  useWallet: () => useWallet,
  useWalletBalance: () => useWalletBalance,
  useZoPassport: () => useZoPassport
});
module.exports = __toCommonJS(react_exports);
var import_react18 = require("react");

// src/lib/api/client.ts
var import_axios = __toESM(require("axios"));

// src/lib/utils/logger.ts
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};
var Logger = class {
  constructor() {
    this.config = {
      enabled: false,
      level: "warn",
      prefix: "[ZoPassport]"
    };
  }
  /**
   * Configure the logger
   * @param options - Logger configuration
   */
  configure(options) {
    this.config = { ...this.config, ...options };
  }
  /**
   * Enable debug logging
   */
  enable() {
    this.config.enabled = true;
  }
  /**
   * Disable all logging
   */
  disable() {
    this.config.enabled = false;
  }
  /**
   * Set log level
   */
  setLevel(level) {
    this.config.level = level;
  }
  shouldLog(level) {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }
  debug(...args) {
    if (this.shouldLog("debug")) {
      console.log(this.config.prefix, ...args);
    }
  }
  info(...args) {
    if (this.shouldLog("info")) {
      console.info(this.config.prefix, ...args);
    }
  }
  warn(...args) {
    if (this.shouldLog("warn")) {
      console.warn(this.config.prefix, ...args);
    }
  }
  error(...args) {
    if (this.shouldLog("error")) {
      console.error(this.config.prefix, ...args);
    }
  }
};
var logger = new Logger();

// src/lib/utils/storage.ts
var STORAGE_KEYS = {
  ACCESS_TOKEN: "zo_access_token",
  REFRESH_TOKEN: "zo_refresh_token",
  TOKEN_EXPIRY: "zo_token_expiry",
  REFRESH_EXPIRY: "zo_refresh_expiry",
  USER: "zo_user",
  CLIENT_DEVICE_ID: "zo_device_id",
  CLIENT_DEVICE_SECRET: "zo_device_secret",
  AVATAR_URL: "zo_avatar_url",
  NICKNAME: "zo_nickname",
  CITY: "zo_city",
  BODY_TYPE: "zo_body_type"
};
var LocalStorageAdapter = class {
  async getItem(key) {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.warn(`LocalStorage.getItem failed for key "${key}":`, error);
      return null;
    }
  }
  async setItem(key, value) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.warn(`LocalStorage.setItem failed for key "${key}":`, error);
    }
  }
  async removeItem(key) {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.warn(`LocalStorage.removeItem failed for key "${key}":`, error);
    }
  }
};

// src/lib/api/client.ts
function generateDeviceCredentials() {
  let deviceId;
  let deviceSecret;
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    deviceId = `web-${crypto.randomUUID()}`;
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    deviceSecret = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    deviceSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  return { deviceId, deviceSecret };
}
var ZoApiClient = class {
  constructor(config) {
    this.config = config;
    this.storage = config.storageAdapter || new LocalStorageAdapter();
    this.client = import_axios.default.create({
      baseURL: config.baseUrl || "https://api.io.zo.xyz",
      timeout: config.timeout || 1e4,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    this.setupInterceptors();
  }
  async setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      config.headers["client-key"] = this.config.clientKey;
      const credentials = await this.getOrCreateDeviceCredentials();
      config.headers["client-device-id"] = credentials.deviceId;
      config.headers["client-device-secret"] = credentials.deviceSecret;
      const token = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            try {
              const response = await this.client.post("/api/v1/auth/token/refresh/", {
                refresh_token: refreshToken
              });
              if (response.data?.access) {
                await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
                if (response.data.refresh) {
                  await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
                }
                originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              await this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              await this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
  async getOrCreateDeviceCredentials() {
    const storedId = await this.storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    const storedSecret = await this.storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET);
    if (storedId && storedSecret) {
      return { deviceId: storedId, deviceSecret: storedSecret };
    }
    const credentials = generateDeviceCredentials();
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, credentials.deviceId);
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, credentials.deviceSecret);
    return credentials;
  }
  get axiosInstance() {
    return this.client;
  }
  getStorage() {
    return this.storage;
  }
};

// src/lib/api/auth.ts
var ZoAuth = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Send OTP to phone number
   * Step 1 of ZO phone authentication
   *
   * @param captchaToken Google reCAPTCHA v3 response token. Required by the
   *   backend. On web, use the `executeRecaptcha()` helper or call
   *   `grecaptcha.execute(siteKey, { action: 'request_otp' })` yourself.
   *   On React Native, run your platform's captcha SDK and pass the result.
   */
  async sendOTP(countryCode, phoneNumber, captchaToken) {
    try {
      const payload = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        message_channel: "",
        // Empty string as per ZO API spec
        captcha_response_token: captchaToken
      };
      const response = await this.client.axiosInstance.post(
        "/api/v1/auth/login/mobile/otp/",
        payload
      );
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || "OTP sent successfully"
        };
      }
      return {
        success: false,
        message: response.data?.message || `Unexpected status: ${response.status}`
      };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || errorData?.error || error.message || "Failed to send OTP";
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  /**
   * Verify OTP and authenticate user
   * Step 2 of ZO phone authentication
   * Returns full auth response with tokens and user profile
   */
  async verifyOTP(countryCode, phoneNumber, otp) {
    try {
      const payload = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        otp
      };
      const response = await this.client.axiosInstance.post(
        "/api/v1/auth/login/mobile/",
        payload
      );
      let responseData;
      if (typeof response.data === "string") {
        try {
          responseData = JSON.parse(response.data);
        } catch {
          return {
            success: false,
            error: "Invalid response format from authentication service"
          };
        }
      } else {
        responseData = response.data;
      }
      if (!responseData || !responseData.user || !responseData.access_token) {
        return {
          success: false,
          error: "Invalid response structure from authentication service"
        };
      }
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await this.client.axiosInstance.post("/api/v1/auth/token/refresh/", {
        refresh_token: refreshToken
      });
      return {
        success: true,
        tokens: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to refresh authentication"
      };
    }
  }
  /**
   * Check if user is authenticated
   */
  async checkLoginStatus(accessToken) {
    try {
      const response = await this.client.axiosInstance.get("/api/v1/auth/login/check/", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return {
        success: true,
        isAuthenticated: response.data.authenticated === true
      };
    } catch {
      return {
        success: false,
        isAuthenticated: false
      };
    }
  }
  /**
   * Extract error message from various ZO API error formats
   */
  extractErrorMessage(error) {
    const errorData = error.response?.data;
    if (errorData) {
      if (errorData.errors && Array.isArray(errorData.errors)) {
        return errorData.errors[0] || "Invalid OTP";
      }
      if (errorData.detail) return errorData.detail;
      if (errorData.message) return errorData.message;
      if (errorData.error) return errorData.error;
    }
    return "Authentication failed";
  }
};

// src/lib/api/profile.ts
var ZoProfile = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Get user profile
   */
  async getProfile(accessToken) {
    try {
      const response = await this.client.axiosInstance.get(
        "/api/v1/profile/me/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        profile: response.data
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to fetch profile"
      };
    }
  }
  /**
   * Update user profile (partial updates supported)
   */
  async updateProfile(accessToken, updates) {
    try {
      const response = await this.client.axiosInstance.post(
        "/api/v1/profile/me/",
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        profile: response.data
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to update profile"
      };
    }
  }
};

// src/lib/api/avatar.ts
var ZoAvatar = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Generate avatar for user
   */
  async generateAvatar(accessToken, bodyType) {
    try {
      const payload = {
        body_type: bodyType
      };
      const response = await this.client.axiosInstance.post(
        "/api/v1/avatar/generate/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        task_id: response.data.task_id,
        status: response.data.status
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to generate avatar"
      };
    }
  }
  /**
   * Check avatar generation status
   */
  async getAvatarStatus(accessToken, taskId) {
    try {
      const response = await this.client.axiosInstance.get(
        `/api/v1/avatar/status/${taskId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        status: response.data.status,
        avatarUrl: response.data.result?.avatar_url
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to get avatar status"
      };
    }
  }
  /**
   * Poll avatar status until completion
   */
  async pollAvatarStatus(accessToken, taskId, options = {}) {
    const {
      onProgress,
      onComplete,
      onError,
      maxAttempts = 30,
      interval = 2e3
    } = options;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        const timeoutError = "Avatar generation timed out";
        onError?.(timeoutError);
        return;
      }
      const result = await this.getAvatarStatus(accessToken, taskId);
      if (!result.success) {
        onError?.(result.error || "Unknown error");
        return;
      }
      onProgress?.(result.status || "unknown");
      if (result.status === "completed" && result.avatarUrl) {
        onComplete?.(result.avatarUrl);
        return;
      }
      if (result.status === "failed") {
        onError?.("Avatar generation failed");
        return;
      }
      setTimeout(() => {
        poll().catch((err) => onError?.(String(err)));
      }, interval);
    };
    poll().catch((err) => onError?.(String(err)));
  }
};

// src/lib/api/wallet.ts
var ZO_TOKEN_CONFIG = {
  base: {
    rpc: "https://mainnet.base.org",
    contractAddress: "0x111142c7ecaf39797b7865b82034269962142069",
    // $Zo token on Base
    decimals: 18
  },
  avalanche: {
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    contractAddress: "0x111142c7ecaf39797b7865b82034269962142069",
    // $Zo token on Avalanche (update if different)
    decimals: 18
  }
};
var ERC20_BALANCE_ABI = "0x70a08231";
var ZoWallet = class {
  constructor(client) {
    this.cachedBalance = 0;
    this.userWalletAddress = null;
    this.network = "base";
    this.client = client;
  }
  /**
   * Set the user's wallet address for on-chain queries
   */
  setWalletAddress(address, network = "base") {
    this.userWalletAddress = address;
    this.network = network;
    logger.debug(`Wallet address set: ${address} on ${network}`);
  }
  /**
   * Get wallet balance - tries on-chain first, then API fallback
   * @returns Wallet balance amount
   */
  async getBalance() {
    if (this.userWalletAddress) {
      try {
        const onChainBalance = await this.getOnChainBalance();
        if (onChainBalance !== null) {
          this.cachedBalance = onChainBalance;
          return onChainBalance;
        }
      } catch (error) {
        logger.warn("On-chain balance check failed, falling back to API:", error);
      }
    }
    const apiBalance = await this.getBalanceFromAPI();
    if (apiBalance !== null) {
      return apiBalance;
    }
    logger.debug("Returning cached/default balance:", this.cachedBalance);
    return this.cachedBalance;
  }
  /**
   * Fetch balance directly from blockchain via JSON-RPC
   */
  async getOnChainBalance() {
    if (!this.userWalletAddress) {
      logger.warn("No wallet address set for on-chain query");
      return null;
    }
    const config = ZO_TOKEN_CONFIG[this.network];
    try {
      const paddedAddress = this.userWalletAddress.toLowerCase().replace("0x", "").padStart(64, "0");
      const data = ERC20_BALANCE_ABI + paddedAddress;
      const response = await fetch(config.rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: config.contractAddress,
              data
            },
            "latest"
          ]
        })
      });
      const result = await response.json();
      if (result.error) {
        logger.warn("RPC error:", result.error);
        return null;
      }
      if (typeof result.result !== "string" || !result.result.startsWith("0x")) {
        logger.warn("Invalid RPC response format:", result.result);
        return null;
      }
      const rawBalance = BigInt(result.result);
      const balance = Number(rawBalance) / Math.pow(10, config.decimals);
      logger.debug(`On-chain balance fetched: ${balance} $Zo`);
      return balance;
    } catch (error) {
      logger.warn("Failed to fetch on-chain balance:", error);
      return null;
    }
  }
  /**
   * Fetch balance from Zo API endpoints (tries multiple endpoints with fallback)
   */
  async getBalanceFromAPI() {
    const endpoints = [
      "/api/v1/web3/token/airdrops/summary",
      "/api/v1/wallet/balance",
      "/api/v1/profile/wallet"
    ];
    const errors = [];
    for (const endpoint of endpoints) {
      try {
        const response = await this.client.axiosInstance.get(endpoint);
        const balance = response.data?.data?.total_amount ?? response.data?.balance ?? response.data?.total_amount;
        if (typeof balance === "number") {
          logger.debug(`Balance fetched from API ${endpoint}:`, balance);
          this.cachedBalance = balance;
          return balance;
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          errors.push({
            endpoint,
            status: error?.response?.status,
            message: error?.message || "Unknown error"
          });
        }
      }
    }
    if (errors.length > 0) {
      logger.warn("All balance API endpoints failed:", errors);
    }
    return null;
  }
  /**
   * Get transaction history
   * @param page - Optional page number for pagination
   * @returns Array of transactions
   */
  async getTransactions(page) {
    const endpoints = [
      page ? `/api/v1/profile/completion-grants/claims?page=${page}` : "/api/v1/profile/completion-grants/claims",
      page ? `/api/v1/wallet/transactions?page=${page}` : "/api/v1/wallet/transactions"
    ];
    const errors = [];
    for (const url of endpoints) {
      try {
        const response = await this.client.axiosInstance.get(url);
        const data = response.data?.data || response.data;
        return {
          transactions: data?.results ?? data?.transactions ?? [],
          next: data?.next,
          previous: data?.previous,
          count: data?.count ?? 0
        };
      } catch (error) {
        if (error?.response?.status !== 404) {
          errors.push({
            endpoint: url,
            status: error?.response?.status,
            message: error?.message || "Unknown error"
          });
        }
      }
    }
    if (errors.length > 0) {
      logger.warn("All transaction API endpoints failed:", errors);
    }
    return {
      transactions: [],
      next: void 0,
      previous: void 0,
      count: 0
    };
  }
};

// src/lib/errors.ts
var ZoSDKError = class extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ZoSDKError";
    this.code = code;
  }
};
var ZoValidationError = class extends ZoSDKError {
  constructor(message, field) {
    super(message, "VALIDATION_ERROR");
    this.name = "ZoValidationError";
    this.field = field;
  }
};
var ZoConfigError = class extends ZoSDKError {
  constructor(message) {
    super(message, "CONFIG_ERROR");
    this.name = "ZoConfigError";
  }
};

// src/lib/utils/validation.ts
function validatePhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (!cleaned || cleaned.length < 7 || cleaned.length > 15) {
    throw new ZoValidationError(
      `Invalid phone number "${phoneNumber}". Must be 7-15 digits.`,
      "phoneNumber"
    );
  }
}
function validateCountryCode(countryCode) {
  const cleaned = countryCode.replace(/\D/g, "");
  if (!cleaned || cleaned.length < 1 || cleaned.length > 4) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". Must be 1-4 digits.`,
      "countryCode"
    );
  }
}
function validateOTP(otp) {
  const cleaned = otp.replace(/\D/g, "");
  if (!cleaned || cleaned.length < 4 || cleaned.length > 8) {
    throw new ZoValidationError(
      "Invalid OTP. Must be 4-8 digits.",
      "otp"
    );
  }
}
function validateConfig(config) {
  if (!config.clientKey || typeof config.clientKey !== "string" || config.clientKey.trim() === "") {
    throw new ZoConfigError(
      'Missing or empty "clientKey". You must provide a valid client key to use the Zo Passport SDK. Request one from the Zo World team at https://zo.xyz/developers'
    );
  }
}

// src/ZoPassportSDK.ts
var ZoPassportSDK = class {
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
  constructor(config) {
    this.refreshTimer = null;
    this._user = null;
    this._isAuthenticated = false;
    validateConfig(config);
    if (config.debug) {
      logger.enable();
      logger.setLevel("debug");
    }
    this.storage = config.storageAdapter || new LocalStorageAdapter();
    this.client = new ZoApiClient({
      ...config,
      storageAdapter: this.storage
    });
    this.auth = new ZoAuth(this.client);
    this.profile = new ZoProfile(this.client);
    this.avatar = new ZoAvatar(this.client);
    this.wallet = new ZoWallet(this.client);
    if (config.autoRefresh !== false) {
      this.startAutoRefresh(config.refreshInterval || 6e4);
    }
    this._readyPromise = this.loadSession();
    logger.debug("SDK initialized with config:", {
      baseUrl: config.baseUrl,
      autoRefresh: config.autoRefresh !== false
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
  async ready() {
    return this._readyPromise;
  }
  // ── Session Management ───────────────────────────────────
  async loadSession() {
    try {
      const userJson = await this.storage.getItem(STORAGE_KEYS.USER);
      const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (userJson && accessToken) {
        this._user = JSON.parse(userJson);
        this._isAuthenticated = true;
      }
    } catch (error) {
      logger.warn("Failed to load session:", error);
    }
  }
  async saveSession(authResponse) {
    await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.access_token);
    await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refresh_token);
    await this.storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, authResponse.access_token_expiry);
    await this.storage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, authResponse.refresh_token_expiry);
    await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, authResponse.device_id || "");
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, authResponse.device_secret || "");
    this._user = authResponse.user;
    this._isAuthenticated = true;
  }
  async clearSession() {
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
  startAutoRefresh(interval) {
    this.refreshTimer = setInterval(async () => {
      await this.refreshTokenIfNeeded();
    }, interval);
  }
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  async refreshTokenIfNeeded() {
    const tokenExpiry = await this.storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!tokenExpiry || !refreshToken) return;
    const expiryDate = new Date(tokenExpiry);
    const now = /* @__PURE__ */ new Date();
    const twoMinutes = 2 * 60 * 1e3;
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
  get user() {
    return this._user;
  }
  /** Whether the user has an active session. */
  get isAuthenticated() {
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
  async loginWithPhone(countryCode, phoneNumber, otp) {
    validateCountryCode(countryCode);
    validatePhoneNumber(phoneNumber);
    validateOTP(otp);
    const result = await this.auth.verifyOTP(countryCode, phoneNumber, otp);
    if (result.success && result.data) {
      await this.saveSession(result.data);
      if (result.data.user?.wallet_address) {
        this.wallet.setWalletAddress(result.data.user.wallet_address, "base");
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
  async logout() {
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
  async getProfile() {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;
    const result = await this.profile.getProfile(accessToken);
    if (result.success && result.profile) {
      this._user = result.profile;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));
      if (result.profile.wallet_address) {
        this.wallet.setWalletAddress(result.profile.wallet_address, "base");
      }
      return result.profile;
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
  async updateProfile(updates) {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: "Not authenticated" };
    const result = await this.profile.updateProfile(accessToken, updates);
    if (result.success && result.profile) {
      this._user = result.profile;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));
      return { success: true, profile: result.profile };
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
  async generateAvatar(bodyType) {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: "Not authenticated" };
    const startResult = await this.avatar.generateAvatar(accessToken, bodyType);
    if (!startResult.success || !startResult.task_id) {
      return { success: false, error: startResult.error };
    }
    return new Promise((resolve) => {
      this.avatar.pollAvatarStatus(accessToken, startResult.task_id, {
        onComplete: (avatarUrl) => {
          resolve({ success: true, avatarUrl });
        },
        onError: (error) => {
          resolve({ success: false, error });
        }
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
  async getWalletBalance() {
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
  async getWalletTransactions(page) {
    return this.wallet.getTransactions(page);
  }
  /**
   * Destroy the SDK instance. Stops auto-refresh timers.
   * Call this when unmounting your app or switching users.
   */
  destroy() {
    this.stopAutoRefresh();
  }
};

// src/lib/utils/recaptcha.ts
var SCRIPT_ATTR = "data-zopassport-recaptcha";
function loadScript(siteKey) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[${SCRIPT_ATTR}]`);
    if (existing) {
      if (window.grecaptcha) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA script")));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.setAttribute(SCRIPT_ATTR, "");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
    document.head.appendChild(script);
  });
}
async function executeRecaptcha(siteKey, action = "request_otp") {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("executeRecaptcha is web-only. On React Native, pass a captchaToken to sdk.auth.sendOTP directly.");
  }
  if (!siteKey) {
    throw new Error("executeRecaptcha: siteKey is required");
  }
  await loadScript(siteKey);
  if (!window.grecaptcha) {
    throw new Error("reCAPTCHA loaded but window.grecaptcha is undefined");
  }
  await new Promise((resolve) => window.grecaptcha.ready(() => resolve()));
  return window.grecaptcha.execute(siteKey, { action });
}

// src/components/ZoProgressRing.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var ZoProgressRing = ({
  progress,
  size = 140,
  strokeWidth = 4,
  primaryColor = "#FFFFFF",
  secondaryColor = "rgba(255,255,255,0.2)"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress / 100 * circumference;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, style: { transform: "rotate(-90deg)" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r: radius,
        strokeWidth,
        fill: "none",
        stroke: secondaryColor
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r: radius,
        stroke: primaryColor,
        strokeWidth,
        fill: "none",
        strokeDasharray: circumference,
        strokeDashoffset,
        strokeLinecap: "round",
        style: { transition: "stroke-dashoffset 0.5s ease-in-out" }
      }
    )
  ] });
};

// src/components/FounderBadge.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var FounderBadge = ({ size = 32 }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: size, height: size, viewBox: "0 0 28 28", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "path",
    {
      d: "M12.0117 3.15234C13.1449 2.14828 14.8551 2.14828 15.9883 3.15234L16.0996 3.25684L17.7715 4.89453L20.1123 4.91895L20.2646 4.92383C21.7758 5.01516 22.9848 6.22423 23.0762 7.73535L23.0811 7.8877L23.1045 10.2275L24.7432 11.9004L24.8477 12.0117C25.8517 13.1449 25.8517 14.8551 24.8477 15.9883L24.7432 16.0996L23.1045 17.7715L23.0811 20.1123C23.0646 21.6938 21.8262 22.9818 20.2646 23.0762L20.1123 23.0811L17.7715 23.1045L16.0996 24.7432C14.9697 25.8498 13.1826 25.8852 12.0117 24.8477L11.9004 24.7432L10.2275 23.1045L7.8877 23.0811C6.30625 23.0646 5.01821 21.8262 4.92383 20.2646L4.91895 20.1123L4.89453 17.7715L3.25684 16.0996C2.11446 14.9333 2.11446 13.0667 3.25684 11.9004L4.89453 10.2275L4.91895 7.8877L4.92383 7.73535C5.01821 6.17382 6.30624 4.93536 7.8877 4.91895L10.2275 4.89453L11.9004 3.25684L12.0117 3.15234Z",
      fill: "#FF2F8E",
      stroke: "#111111",
      strokeWidth: "4",
      strokeLinejoin: "round"
    }
  ),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "path",
    {
      d: "M13.5008 16.1741H15.8997C16.4443 16.1741 16.8858 16.6156 16.8858 17.1602C16.8858 17.7048 16.4443 18.1463 15.8997 18.1463H12.2286C11.4558 18.1463 10.8293 17.5199 10.8293 16.7471C10.8293 16.4219 10.9425 16.1069 11.1495 15.8562L14.0743 12.3137H11.8434C11.2988 12.3137 10.8573 11.8722 10.8573 11.3276C10.8573 10.783 11.2988 10.3415 11.8434 10.3415H15.4226C16.1921 10.3415 16.8158 10.9652 16.8158 11.7347C16.8158 12.0634 16.6996 12.3816 16.4876 12.6329L13.5008 16.1741Z",
      fill: "white"
    }
  )
] });

// src/components/ZoAvatar.tsx
var import_react = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var ZoAvatar2 = ({
  src,
  name = "User",
  size = 120,
  className = ""
}) => {
  const [imgSrc, setImgSrc] = (0, import_react.useState)(src || null);
  const [hasError, setHasError] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    setImgSrc(src || null);
    setHasError(false);
  }, [src]);
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(null);
    }
  };
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      className: `zo-avatar ${className}`,
      style: {
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      children: imgSrc ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "img",
        {
          src: imgSrc,
          alt: name,
          onError: handleError,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          style: {
            fontSize: size * 0.4,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "Rubik, system-ui, sans-serif"
          },
          children: initials
        }
      )
    }
  );
};

// src/components/ZoPassportCard.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var FOUNDER_BG = "https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png";
var CITIZEN_BG = "https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png";
var ZoPassportCard = ({
  profile,
  completion,
  className = "",
  founderBgUrl = FOUNDER_BG,
  citizenBgUrl = CITIZEN_BG
}) => {
  const isFounder = profile?.isFounder || false;
  const name = profile?.name || "New Citizen";
  const avatar = profile?.avatar;
  const done = completion?.done || 0;
  const total = completion?.total || 1;
  const progress = Math.min(100, Math.max(0, done / total * 100));
  const bgImage = isFounder ? founderBgUrl : citizenBgUrl;
  const textColor = isFounder ? "white" : "#111111";
  const shadowStyle = isFounder ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : "0 20px 25px -5px rgba(241, 86, 63, 0.5), 0 8px 10px -6px rgba(241, 86, 63, 0.1)";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: `zo-passport-card ${className}`,
      style: {
        position: "relative",
        width: "234px",
        height: "300px",
        borderRadius: "0 20px 20px 0",
        overflow: "hidden",
        fontFamily: "Rubik, system-ui, sans-serif",
        boxShadow: shadowStyle
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "img",
          {
            src: bgImage,
            alt: "Passport Background",
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              top: "-10px"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              ZoProgressRing,
              {
                progress,
                size: 140,
                strokeWidth: 4,
                primaryColor: isFounder ? "#FFFFFF" : "#111111",
                secondaryColor: isFounder ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              top: "-10px"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "div",
                {
                  style: {
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    overflow: "hidden"
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ZoAvatar2, { src: avatar, name, size: 120 })
                }
              ),
              isFounder && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "div",
                {
                  style: {
                    position: "absolute",
                    bottom: "84px",
                    right: "60px"
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FounderBadge, { size: 32 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            style: {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "16px",
              textAlign: "center",
              padding: "0 16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "p",
                {
                  style: {
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "18px",
                    lineHeight: "24px",
                    color: textColor,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  },
                  children: name
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "p",
                {
                  style: {
                    margin: 0,
                    fontSize: "10px",
                    lineHeight: "14px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: textColor,
                    opacity: 0.7
                  },
                  children: isFounder ? "Founder of Zo World" : "Citizen of Zo World"
                }
              )
            ]
          }
        )
      ]
    }
  );
};

// src/components/ZoPassportPage.tsx
var import_react4 = require("react");

// src/components/wallet/WalletCardWeb.tsx
var import_react2 = require("react");

// src/lib/utils/wallet.ts
var formatBalance = (balance) => {
  if (balance === 0) return "0";
  const formatted = balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return formatted;
};
var formatWalletAddress = (address) => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
var formatNickname = (nickname) => {
  if (!nickname) return "";
  return nickname.startsWith("@") ? nickname : `@${nickname}`;
};

// src/lib/utils/styles.ts
var styleRefCounts = /* @__PURE__ */ new Map();
function injectStyles(styleId, css) {
  if (typeof document === "undefined") {
    return () => {
    };
  }
  const currentCount = styleRefCounts.get(styleId) || 0;
  if (currentCount === 0) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }
  styleRefCounts.set(styleId, currentCount + 1);
  return () => {
    const count = styleRefCounts.get(styleId) || 0;
    if (count <= 1) {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
      styleRefCounts.delete(styleId);
    } else {
      styleRefCounts.set(styleId, count - 1);
    }
  };
}

// src/components/wallet/WalletCardWeb.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var ZO_COIN_URL = "/zo-coin.gif";
var STYLE_ID = "zo-wallet-card-web-styles";
var CSS = `
    .zo-wallet-card-web {
      position: relative;
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1.6;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      font-family: 'Rubik', system-ui, sans-serif;
    }

    .zo-wallet-card-web:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }

    .zo-wallet-card-web.is-open {
      transform: translateY(-20px);
    }

    .zo-wallet-card-web-inner {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 20px;
      z-index: 1;
    }

    .zo-wallet-card-web-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.05),
        transparent
      );
      animation: zo-wallet-shine 3s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes zo-wallet-shine {
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
    }

    .zo-wallet-card-web-balance-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .zo-wallet-card-web-balance-wrapper {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .zo-wallet-card-web-balance {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .zo-wallet-card-web-currency {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
    }

    .zo-wallet-card-web-coin {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .zo-wallet-card-web-spacer {
      flex: 1;
    }

    .zo-wallet-card-web-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .zo-wallet-card-web-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.15);
    }

    .zo-wallet-card-web-avatar-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #333 0%, #222 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      border: 2px solid rgba(255,255,255,0.15);
    }

    .zo-wallet-card-web-user-info {
      flex: 1;
      min-width: 0;
    }

    .zo-wallet-card-web-username {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .zo-wallet-card-web-address {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      margin: 0;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .zo-wallet-card-web-loading {
      opacity: 0.5;
    }

    .zo-wallet-card-web-cover {
      position: absolute;
      inset: 0;
      background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
      z-index: 2;
    }

    .zo-wallet-card-web.is-open .zo-wallet-card-web-cover {
      opacity: 0;
      pointer-events: none;
    }

    .zo-wallet-card-web-cover-text {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      font-weight: 500;
    }

    .zo-wallet-card-web-stitch {
      position: absolute;
      inset: 6px;
      border: 1px dashed rgba(255,255,255,0.15);
      border-radius: 12px;
      pointer-events: none;
    }
`;
var WalletCardWeb = (0, import_react2.memo)(({
  balance,
  user,
  isOpen = false,
  onToggle,
  isLoading = false
}) => {
  (0, import_react2.useEffect)(() => {
    const cleanup = injectStyles(STYLE_ID, CSS);
    return cleanup;
  }, []);
  const displayName = user.nickname ? formatNickname(user.nickname) : user.first_name || "You";
  const walletText = `${user.first_name || "Your"}'s wallet`;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      className: `zo-wallet-card-web ${isOpen ? "is-open" : ""} ${isLoading ? "zo-wallet-card-web-loading" : ""}`,
      onClick: onToggle,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "zo-wallet-card-web-shine" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "zo-wallet-card-web-stitch" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "zo-wallet-card-web-inner", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "zo-wallet-card-web-balance-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "zo-wallet-card-web-balance-wrapper", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "zo-wallet-card-web-balance", children: isLoading ? "..." : formatBalance(balance) }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "zo-wallet-card-web-currency", children: "$Zo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "img",
              {
                src: ZO_COIN_URL,
                alt: "Zo Coin",
                className: "zo-wallet-card-web-coin"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "zo-wallet-card-web-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "zo-wallet-card-web-user", children: [
            user.avatar?.image ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "img",
              {
                src: user.avatar.image,
                alt: displayName,
                className: "zo-wallet-card-web-avatar"
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "zo-wallet-card-web-avatar-placeholder", children: (user.first_name?.[0] || "Z").toUpperCase() }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "zo-wallet-card-web-user-info", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "zo-wallet-card-web-username", children: displayName }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "zo-wallet-card-web-address", children: formatWalletAddress(user.wallet_address || "") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "zo-wallet-card-web-cover", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "zo-wallet-card-web-cover-text", children: walletText }) })
      ]
    }
  );
});
WalletCardWeb.displayName = "WalletCardWeb";

// src/components/wallet/WalletFullPage.tsx
var import_react3 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
var ZO_COIN_URL2 = "/zo-coin.gif";
var STYLE_ID2 = "zo-wallet-fullpage-styles";
var CSS2 = `
    .zo-wallet-fullpage {
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: 'Rubik', system-ui, sans-serif;
      color: #fff;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .zo-wallet-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: sticky;
      top: 0;
      background: #000;
      z-index: 10;
    }
    
    .zo-wallet-back {
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .zo-wallet-header-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    
    .zo-wallet-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 60px;
    }
    
    /* Wallet Card - Leather Style */
    .zo-wallet-leather-card {
      position: relative;
      width: 100%;
      max-width: 360px;
      aspect-ratio: 1.6;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 2px dashed rgba(255,255,255,0.15);
      box-shadow: 
        0 20px 40px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1);
      margin-bottom: 24px;
    }
    
    .zo-wallet-leather-bg {
      position: absolute;
      inset: 0;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.5;
    }
    
    .zo-wallet-leather-content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 24px;
    }
    
    /* Balance Section */
    .zo-wallet-balance-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: auto;
    }
    
    .zo-wallet-balance-left {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    
    .zo-wallet-balance-amount {
      font-size: 42px;
      font-weight: 700;
      margin: 0;
      color: #fff;
    }
    
    .zo-wallet-balance-currency {
      font-size: 16px;
      color: rgba(255,255,255,0.6);
    }
    
    .zo-wallet-coin {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    
    /* User Section */
    .zo-wallet-user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .zo-wallet-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.2);
    }
    
    .zo-wallet-user-details {
      flex: 1;
    }
    
    .zo-wallet-user-name {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 2px 0;
      color: #fff;
    }
    
    .zo-wallet-user-address {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      margin: 0;
      font-family: monospace;
    }
    
    /* Wallet Label */
    .zo-wallet-label {
      text-align: center;
      padding: 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      margin-top: 8px;
    }
    
    .zo-wallet-label-text {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      margin: 0;
    }
    
    /* Info Section */
    .zo-wallet-info-section {
      width: 100%;
      max-width: 360px;
      margin-top: 24px;
    }
    
    .zo-wallet-info-title {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .zo-wallet-info-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
    }
    
    .zo-wallet-info-text {
      font-size: 13px;
      color: rgba(255,255,255,0.6);
      line-height: 1.6;
      margin: 0;
    }
    
    /* Stitching Effect */
    .zo-wallet-stitch {
      position: absolute;
      border: 1px dashed rgba(255,255,255,0.2);
      border-radius: 12px;
      inset: 8px;
      pointer-events: none;
    }
    
    @media (min-width: 768px) {
      .zo-wallet-leather-card {
        max-width: 420px;
      }
      
      .zo-wallet-balance-amount {
        font-size: 56px;
      }
      
      .zo-wallet-coin {
        width: 56px;
        height: 56px;
      }
      
      .zo-wallet-leather-content {
        padding: 32px;
      }
    }
`;
var WalletFullPage = ({
  user,
  balance,
  onClose,
  zoCoinUrl = ZO_COIN_URL2,
  isLoading = false,
  onRefresh
}) => {
  (0, import_react3.useEffect)(() => {
    const cleanupStyles = injectStyles(STYLE_ID2, CSS2);
    document.body.style.overflow = "hidden";
    return () => {
      cleanupStyles();
      document.body.style.overflow = "";
    };
  }, []);
  const displayName = user?.first_name || "Citizen";
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-fullpage", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "zo-wallet-back", onClick: onClose, children: "\u2190" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h1", { className: "zo-wallet-header-title", children: [
        displayName,
        "'s Wallet"
      ] }),
      onRefresh && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          className: "zo-wallet-refresh",
          onClick: onRefresh,
          disabled: isLoading,
          style: {
            marginLeft: "auto",
            background: "none",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#fff",
            cursor: isLoading ? "wait" : "pointer",
            fontSize: "12px",
            opacity: isLoading ? 0.5 : 1
          },
          children: isLoading ? "..." : "\u21BB Refresh"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-content", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-leather-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "zo-wallet-leather-bg" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "zo-wallet-stitch" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-leather-content", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-balance-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-balance-left", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { className: "zo-wallet-balance-amount", style: { opacity: isLoading ? 0.5 : 1 }, children: isLoading ? "..." : balance }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "zo-wallet-balance-currency", children: "$Zo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "img",
              {
                src: zoCoinUrl,
                alt: "Zo Coin",
                className: "zo-wallet-coin",
                style: {
                  animation: isLoading ? "spin 1s linear infinite" : "none"
                }
              }
            )
          ] }),
          user && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-user-section", children: [
            (user.avatar?.image || user.pfp_image) && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "img",
              {
                src: user.avatar?.image || user.pfp_image,
                alt: displayName,
                className: "zo-wallet-avatar"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-user-details", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "zo-wallet-user-name", children: displayName }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "zo-wallet-user-address", children: formatWalletAddress(user.wallet_address || "") })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "zo-wallet-label", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "zo-wallet-label-text", children: [
        displayName,
        "'s wallet"
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "zo-wallet-info-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "zo-wallet-info-title", children: "About $Zo" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "zo-wallet-info-card", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "zo-wallet-info-text", children: "Earn $Zo tokens by completing quests, exploring locations, booking stays, and participating in the Zo World ecosystem." }) })
      ] })
    ] })
  ] });
};

// assets/index.ts
var CULTURE_STICKERS = {
  travel: "/cultural-stickers/Travel&Adventure.png",
  design: "/cultural-stickers/Design.png",
  tech: "/cultural-stickers/Science&Technology.png",
  food: "/cultural-stickers/Food.png",
  music: "/cultural-stickers/Music&Entertainment.png",
  photography: "/cultural-stickers/Photography.png",
  fitness: "/cultural-stickers/Health&Fitness.png",
  sports: "/cultural-stickers/Sport.png",
  literature: "/cultural-stickers/Literature&Stories.png",
  cinema: "/cultural-stickers/Television&Cinema.png",
  spiritual: "/cultural-stickers/Spiritual.png",
  nature: "/cultural-stickers/Nature&Wildlife.png",
  business: "/cultural-stickers/Business.png",
  law: "/cultural-stickers/Law.png",
  lifestyle: "/cultural-stickers/Home&Lifestyle.png",
  gaming: "/cultural-stickers/Game.png",
  stories: "/cultural-stickers/Stories&Journal.png"
};
var CULTURES = [
  { id: "travel", name: "Travel & Adventure", icon: CULTURE_STICKERS.travel },
  { id: "design", name: "Design", icon: CULTURE_STICKERS.design },
  { id: "tech", name: "Science & Technology", icon: CULTURE_STICKERS.tech },
  { id: "food", name: "Food", icon: CULTURE_STICKERS.food },
  { id: "music", name: "Music & Entertainment", icon: CULTURE_STICKERS.music },
  { id: "photography", name: "Photography", icon: CULTURE_STICKERS.photography },
  { id: "fitness", name: "Health & Fitness", icon: CULTURE_STICKERS.fitness },
  { id: "sports", name: "Sport", icon: CULTURE_STICKERS.sports },
  { id: "literature", name: "Literature & Stories", icon: CULTURE_STICKERS.literature },
  { id: "cinema", name: "Television & Cinema", icon: CULTURE_STICKERS.cinema },
  { id: "spiritual", name: "Spiritual", icon: CULTURE_STICKERS.spiritual },
  { id: "nature", name: "Nature & Wildlife", icon: CULTURE_STICKERS.nature },
  { id: "business", name: "Business", icon: CULTURE_STICKERS.business },
  { id: "law", name: "Law", icon: CULTURE_STICKERS.law },
  { id: "lifestyle", name: "Home & Lifestyle", icon: CULTURE_STICKERS.lifestyle },
  { id: "gaming", name: "Game", icon: CULTURE_STICKERS.gaming },
  { id: "stories", name: "Stories & Journal", icon: CULTURE_STICKERS.stories }
];

// src/components/ZoPassportPage.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var CULTURE_STICKER_MAP = {
  // Base mappings from CULTURE_STICKERS
  ...CULTURE_STICKERS,
  // Aliases for common variations
  "game": CULTURE_STICKERS.gaming,
  "games": CULTURE_STICKERS.gaming,
  "sport": CULTURE_STICKERS.sports,
  // Full name variants (for when API returns full names)
  "travel & adventure": CULTURE_STICKERS.travel,
  "science & technology": CULTURE_STICKERS.tech,
  "music & entertainment": CULTURE_STICKERS.music,
  "health & fitness": CULTURE_STICKERS.fitness,
  "literature & stories": CULTURE_STICKERS.literature,
  "television & cinema": CULTURE_STICKERS.cinema,
  "nature & wildlife": CULTURE_STICKERS.nature,
  "home & lifestyle": CULTURE_STICKERS.lifestyle,
  "stories & journal": CULTURE_STICKERS.stories,
  // Special cultures
  "follow-your-heart": "/cultural-stickers/FollowYourHeart.png",
  "followyourheart": "/cultural-stickers/FollowYourHeart.png",
  "follow your heart": "/cultural-stickers/FollowYourHeart.png",
  "law & order": CULTURE_STICKERS.law
};
var getCultureSticker = (culture) => {
  if (typeof culture === "string") {
    const keyMatch = CULTURE_STICKER_MAP[culture.toLowerCase()];
    if (keyMatch) return keyMatch;
    return "/cultural-stickers/FollowYourHeart.png";
  }
  if (culture.key) {
    const keyMatch = CULTURE_STICKER_MAP[culture.key.toLowerCase()];
    if (keyMatch) return keyMatch;
  }
  if (culture.name) {
    const nameMatch = CULTURE_STICKER_MAP[culture.name.toLowerCase()];
    if (nameMatch) return nameMatch;
    const nameLower = culture.name.toLowerCase();
    for (const [mapKey, path] of Object.entries(CULTURE_STICKER_MAP)) {
      if (nameLower.includes(mapKey) || mapKey.includes(nameLower)) {
        return path;
      }
    }
  }
  if (culture.icon && !culture.icon.includes("proxy.cdn.zo.xyz/profile/culture")) {
    return culture.icon;
  }
  return "/cultural-stickers/FollowYourHeart.png";
};
var getCultureName = (culture) => {
  if (typeof culture === "string") return culture;
  return culture.name || culture.key || "Culture";
};
var getCultureKey = (culture) => {
  if (typeof culture === "string") return culture;
  return culture.key || culture.name || "";
};
var formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
};
var formatPhone = (phone, countryCode) => {
  if (!phone) return "Not set";
  return countryCode ? `${countryCode}${phone}` : phone;
};
var STYLE_ID3 = "zo-passport-responsive-styles";
var CSS3 = `
    .zo-passport-container {
      width: 100%;
      min-height: auto;
      background: #000000;
      color: #FFFFFF;
      font-family: 'Rubik', system-ui, sans-serif;
      padding: 16px;
      padding-bottom: 60px;
      box-sizing: border-box;
    }
    
    .zo-passport-header {
      margin-bottom: 24px;
      text-align: center;
    }
    
    .zo-passport-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      font-family: 'Syne', system-ui, sans-serif;
    }
    
    .zo-passport-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin: 4px 0 0 0;
    }
    
    .zo-passport-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .zo-passport-card-section {
      display: flex;
      justify-content: center;
    }
    
    .zo-passport-section {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 20px;
    }
    
    .zo-passport-section-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 16px 0;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .zo-passport-info-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .zo-passport-info-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .zo-passport-info-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .zo-passport-info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    
    .zo-passport-info-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .zo-passport-info-value {
      font-size: 13px;
      color: #FFFFFF;
      word-break: break-word;
    }
    
    .zo-passport-wallet-wrapper {
      margin-bottom: 16px;
    }
    
    .zo-passport-cultures {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
    }
    
    .zo-passport-cultures-header {
      margin-bottom: 12px;
    }
    
    .zo-passport-cultures-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .zo-passport-culture-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .zo-passport-culture-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 6px 10px;
    }
    
    .zo-passport-culture-sticker {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
    
    .zo-passport-culture-name {
      font-size: 11px;
      color: #FFFFFF;
      font-weight: 500;
    }
    
    .zo-passport-culture-remove {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      margin-left: 2px;
    }
    
    .zo-passport-loading {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      text-align: center;
      padding: 40px;
    }
    
    /* Tablet (768px+) */
    @media (min-width: 768px) {
      .zo-passport-container {
        padding: 24px;
      }
      
      .zo-passport-header {
        text-align: left;
        margin-bottom: 32px;
      }
      
      .zo-passport-title {
        font-size: 28px;
      }
      
      .zo-passport-subtitle {
        font-size: 14px;
      }
      
      .zo-passport-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 32px;
      }
      
      .zo-passport-card-section {
        justify-content: flex-start;
      }
      
      .zo-passport-content-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      
      .zo-passport-section-title {
        font-size: 15px;
        margin-bottom: 20px;
      }
      
      .zo-passport-info-icon {
        font-size: 18px;
        width: 24px;
      }
      
      .zo-passport-info-label {
        font-size: 11px;
      }
      
      .zo-passport-info-value {
        font-size: 14px;
      }
      
      .zo-passport-culture-sticker {
        width: 18px;
        height: 18px;
      }
      
      .zo-passport-culture-name {
        font-size: 12px;
      }
    }
    
    /* Desktop (1024px+) */
    @media (min-width: 1024px) {
      .zo-passport-container {
        padding: 40px;
      }
      
      .zo-passport-header {
        margin-bottom: 40px;
      }
      
      .zo-passport-title {
        font-size: 32px;
      }
      
      .zo-passport-grid {
        grid-template-columns: auto 1fr 1fr;
        gap: 48px;
      }
      
      .zo-passport-content-columns {
        display: contents;
      }
      
      .zo-passport-section {
        padding: 24px;
      }
      
      .zo-passport-info-list {
        gap: 20px;
      }
      
      .zo-passport-culture-sticker {
        width: 20px;
        height: 20px;
      }
      
      .zo-passport-culture-name {
        font-size: 13px;
      }
    }
`;
var ZoPassportPage = ({
  user,
  balance = 0,
  completion = { done: 0, total: 10 },
  walletOpen = false,
  onWalletToggle,
  onRemoveCulture
}) => {
  (0, import_react4.useEffect)(() => {
    const cleanup = injectStyles(STYLE_ID3, CSS3);
    return cleanup;
  }, []);
  if (!user) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "zo-passport-container", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "zo-passport-loading", children: "Loading passport..." }) });
  }
  const isFounder = user.membership === "founder";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Not set";
  const cultures = user.cultures || [];
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-container", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h1", { className: "zo-passport-title", children: "Zo Passport" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "zo-passport-subtitle", children: "Your identity in Zo World" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "zo-passport-card-section", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        ZoPassportCard,
        {
          profile: {
            avatar: user.avatar?.image || user.pfp_image,
            name: user.first_name || "Citizen",
            isFounder
          },
          completion
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-content-columns", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "zo-passport-section-title", children: "General Information" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-info-list", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u270F\uFE0F", label: "Full Name", value: fullName }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u{1F464}", label: "Short Bio", value: user.bio || "Not set" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u{1F382}", label: "Born on", value: formatDate(user.date_of_birth) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u{1F9EC}", label: "Body Type", value: user.body_type ? user.body_type.charAt(0).toUpperCase() + user.body_type.slice(1) : "Not set" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u{1F4CD}", label: "Location", value: user.place_name || "Not set" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "zo-passport-section-title", style: { marginTop: 24 }, children: "Communication" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-info-list", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u{1F4E7}", label: "Email", value: user.email_address || "Not set" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(InfoRow, { icon: "\u{1F4F1}", label: "Phone", value: formatPhone(user.mobile_number) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "zo-passport-section-title", children: "For the Culture" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "zo-passport-wallet-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            WalletCardWeb,
            {
              balance,
              user: {
                avatar: user.avatar?.image ? { image: user.avatar.image } : void 0,
                first_name: user.first_name || "Citizen",
                nickname: user.first_name,
                wallet_address: user.wallet_address || ""
              },
              isOpen: walletOpen,
              onToggle: onWalletToggle
            }
          ) }),
          cultures.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-cultures", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "zo-passport-cultures-header", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "zo-passport-cultures-title", children: [
              "Selected Cultures (",
              cultures.length,
              ")"
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "zo-passport-culture-tags", children: cultures.map((culture, index) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              CultureTag,
              {
                stickerUrl: getCultureSticker(culture),
                name: getCultureName(culture),
                onRemove: onRemoveCulture ? () => onRemoveCulture(getCultureKey(culture)) : void 0
              },
              getCultureKey(culture) || index
            )) })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var InfoRow = ({ icon, label, value }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-info-row", children: [
  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "zo-passport-info-icon", children: icon }),
  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-info-content", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "zo-passport-info-label", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "zo-passport-info-value", children: value })
  ] })
] });
var CultureTag = ({ stickerUrl, name, onRemove }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "zo-passport-culture-tag", children: [
  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "img",
    {
      src: stickerUrl,
      alt: name,
      className: "zo-passport-culture-sticker",
      onError: (e) => {
        e.target.style.display = "none";
      }
    }
  ),
  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "zo-passport-culture-name", children: name }),
  onRemove && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { className: "zo-passport-culture-remove", onClick: onRemove, children: "\xD7" })
] });

// src/lib/utils/phone.ts
var COUNTRY_CODES = [
  { code: "1", country: "US", flag: "\u{1F1FA}\u{1F1F8}", name: "United States" },
  { code: "91", country: "IN", flag: "\u{1F1EE}\u{1F1F3}", name: "India" },
  { code: "44", country: "GB", flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom" },
  { code: "86", country: "CN", flag: "\u{1F1E8}\u{1F1F3}", name: "China" },
  { code: "81", country: "JP", flag: "\u{1F1EF}\u{1F1F5}", name: "Japan" },
  { code: "82", country: "KR", flag: "\u{1F1F0}\u{1F1F7}", name: "South Korea" },
  { code: "33", country: "FR", flag: "\u{1F1EB}\u{1F1F7}", name: "France" },
  { code: "49", country: "DE", flag: "\u{1F1E9}\u{1F1EA}", name: "Germany" },
  { code: "7", country: "RU", flag: "\u{1F1F7}\u{1F1FA}", name: "Russia" },
  { code: "55", country: "BR", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil" },
  { code: "61", country: "AU", flag: "\u{1F1E6}\u{1F1FA}", name: "Australia" },
  { code: "65", country: "SG", flag: "\u{1F1F8}\u{1F1EC}", name: "Singapore" },
  { code: "971", country: "AE", flag: "\u{1F1E6}\u{1F1EA}", name: "UAE" },
  { code: "966", country: "SA", flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia" },
  { code: "62", country: "ID", flag: "\u{1F1EE}\u{1F1E9}", name: "Indonesia" },
  { code: "60", country: "MY", flag: "\u{1F1F2}\u{1F1FE}", name: "Malaysia" },
  { code: "66", country: "TH", flag: "\u{1F1F9}\u{1F1ED}", name: "Thailand" },
  { code: "84", country: "VN", flag: "\u{1F1FB}\u{1F1F3}", name: "Vietnam" },
  { code: "63", country: "PH", flag: "\u{1F1F5}\u{1F1ED}", name: "Philippines" },
  { code: "31", country: "NL", flag: "\u{1F1F3}\u{1F1F1}", name: "Netherlands" }
];
function parsePhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}

// src/components/PhoneInput.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var PhoneInput = ({
  value,
  countryCode,
  onChange,
  onCountryChange,
  placeholder = "555-123-4567",
  disabled = false,
  error,
  className = ""
}) => {
  const handlePhoneChange = (e) => {
    const digits = parsePhoneNumber(e.target.value);
    onChange(digits);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: `zo-phone-input ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: "8px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "select",
        {
          value: countryCode,
          onChange: (e) => onCountryChange(e.target.value),
          disabled,
          style: {
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "white",
            fontFamily: "Rubik, system-ui, sans-serif",
            fontSize: "14px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1
          },
          children: COUNTRY_CODES.map((country) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("option", { value: country.code, style: { backgroundColor: "black" }, children: [
            country.flag,
            " +",
            country.code
          ] }, country.code))
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          type: "tel",
          value,
          onChange: handlePhoneChange,
          placeholder,
          disabled,
          style: {
            flex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: error ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "white",
            fontFamily: "Rubik, system-ui, sans-serif",
            fontSize: "14px",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.5 : 1
          }
        }
      )
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "p",
      {
        style: {
          color: "#ef4444",
          fontSize: "14px",
          marginTop: "8px",
          fontFamily: "Rubik, system-ui, sans-serif"
        },
        children: error
      }
    )
  ] });
};

// src/components/OTPInput.tsx
var import_react5 = require("react");
var import_jsx_runtime9 = require("react/jsx-runtime");
var OTPInput = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  error,
  autoFocus = true,
  className = ""
}) => {
  const inputRefs = (0, import_react5.useRef)([]);
  (0, import_react5.useEffect)(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);
  (0, import_react5.useEffect)(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);
  const handleChange = (index, inputValue) => {
    if (inputValue && !/^\d$/.test(inputValue)) return;
    const newOtp = [...value];
    newOtp[index] = inputValue;
    onChange(newOtp);
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== "") && index === length - 1) {
      onComplete?.(newOtp.join(""));
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const digits = pastedData.replace(/\D/g, "").split("");
    if (digits.length > 0) {
      const newOtp = [...value];
      digits.forEach((digit, i) => {
        if (i < length) newOtp[i] = digit;
      });
      onChange(newOtp);
      const focusIndex = Math.min(digits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      if (newOtp.every((digit) => digit !== "")) {
        onComplete?.(newOtp.join(""));
      }
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `zo-otp-input ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { display: "flex", gap: "8px", justifyContent: "center" }, children: Array.from({ length }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "input",
      {
        ref: (el) => {
          inputRefs.current[index] = el;
        },
        type: "text",
        inputMode: "numeric",
        maxLength: 1,
        value: value[index] || "",
        onChange: (e) => handleChange(index, e.target.value),
        onKeyDown: (e) => handleKeyDown(index, e),
        onPaste: handlePaste,
        disabled,
        style: {
          width: "48px",
          height: "56px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: error ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          textAlign: "center",
          color: "white",
          fontFamily: "Rubik, system-ui, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.5 : 1
        }
      },
      index
    )) }),
    error && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "p",
      {
        style: {
          color: "#ef4444",
          fontSize: "14px",
          marginTop: "8px",
          textAlign: "center",
          fontFamily: "Rubik, system-ui, sans-serif"
        },
        children: error
      }
    )
  ] });
};

// src/components/ZoAuth.tsx
var import_react6 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
var ZoAuth2 = ({
  onSuccess,
  onClose,
  sendOTP,
  verifyOTP,
  defaultCountryCode = "91",
  showCloseButton = true,
  className = ""
}) => {
  const [step, setStep] = (0, import_react6.useState)("phone");
  const [countryCode, setCountryCode] = (0, import_react6.useState)(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = (0, import_react6.useState)("");
  const [otp, setOtp] = (0, import_react6.useState)(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = (0, import_react6.useState)(false);
  const [error, setError] = (0, import_react6.useState)(null);
  const [resendCooldown, setResendCooldown] = (0, import_react6.useState)(0);
  (0, import_react6.useEffect)(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1e3);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await sendOTP(countryCode, phoneNumber);
      if (result.success) {
        setStep("otp");
        setResendCooldown(60);
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOTP = async (otpString) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOTP(countryCode, phoneNumber, otpString);
      if (result.success && result.user) {
        onSuccess(result.user.id || "", result.user);
      } else {
        setError(result.error || "Invalid verification code");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      setError(err.message || "Invalid verification code");
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
  };
  const containerStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    padding: "24px 32px",
    fontFamily: "Rubik, system-ui, sans-serif"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: `zo-auth ${className}`, style: containerStyle, children: [
    showCloseButton && onClose && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "button",
      {
        onClick: onClose,
        style: {
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(255, 255, 255, 0.6)"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
      }
    ),
    step === "phone" && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "div",
        {
          style: {
            width: "64px",
            height: "64px",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "h2",
        {
          style: {
            textAlign: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "8px",
            fontFamily: "Syne, system-ui, sans-serif"
          },
          children: "Enter Your Phone Number"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "p",
        {
          style: {
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            marginBottom: "24px"
          },
          children: "We'll send you a verification code"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        PhoneInput,
        {
          value: phoneNumber,
          countryCode,
          onChange: setPhoneNumber,
          onCountryChange: setCountryCode,
          disabled: isLoading,
          error: error || void 0
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          onClick: handleSendOTP,
          disabled: isLoading || phoneNumber.length < 10,
          style: {
            width: "100%",
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "black",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            color: "white",
            fontWeight: 500,
            fontSize: "16px",
            cursor: isLoading || phoneNumber.length < 10 ? "not-allowed" : "pointer",
            opacity: isLoading || phoneNumber.length < 10 ? 0.5 : 1
          },
          children: isLoading ? "Sending Code..." : "Send Code"
        }
      )
    ] }),
    step === "otp" && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "div",
        {
          style: {
            width: "64px",
            height: "64px",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "h2",
        {
          style: {
            textAlign: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "8px",
            fontFamily: "Syne, system-ui, sans-serif"
          },
          children: "Enter Verification Code"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
        "p",
        {
          style: {
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            marginBottom: "24px"
          },
          children: [
            "We sent a code to +",
            countryCode,
            " ",
            phoneNumber
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        OTPInput,
        {
          value: otp,
          onChange: setOtp,
          onComplete: handleVerifyOTP,
          disabled: isLoading,
          error: error || void 0
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          onClick: () => handleVerifyOTP(otp.join("")),
          disabled: isLoading || otp.some((d) => !d),
          style: {
            width: "100%",
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "black",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            color: "white",
            fontWeight: 500,
            fontSize: "16px",
            cursor: isLoading || otp.some((d) => !d) ? "not-allowed" : "pointer",
            opacity: isLoading || otp.some((d) => !d) ? 0.5 : 1
          },
          children: isLoading ? "Verifying..." : "Verify"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          onClick: handleResendOTP,
          disabled: resendCooldown > 0,
          style: {
            backgroundColor: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
            opacity: resendCooldown > 0 ? 0.5 : 1
          },
          children: resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive? Resend code"
        }
      ) })
    ] })
  ] });
};

// src/components/ZoLanding.tsx
var import_react7 = require("react");
var import_jsx_runtime11 = require("react/jsx-runtime");
var ZoLanding = ({
  onAuthSuccess,
  sendOTP,
  verifyOTP,
  videoUrl = "/videos/loading-screen-background.mp4",
  logoUrl = "/figma-assets/landing-zo-logo.png",
  title = "ZOHMMM!",
  subtitles = [
    "Welcome to Zo World",
    "A parallel reality where you live your best life, by following your heart.",
    "Are you ready to tune in, Anon?"
  ],
  buttonText = "Tune into Zo World",
  className = ""
}) => {
  const [showAuth, setShowAuth] = (0, import_react7.useState)(false);
  const containerStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "black",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "Rubik, system-ui, sans-serif"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: `zo-landing ${className}`, style: containerStyle, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "video",
      {
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        style: {
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          pointerEvents: "none"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("source", { src: videoUrl, type: "video/mp4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 50%, black)",
          zIndex: 2,
          pointerEvents: "none"
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "img",
      {
        src: logoUrl,
        alt: "Zo",
        style: {
          position: "absolute",
          left: "24px",
          top: "40px",
          width: "40px",
          height: "40px",
          objectFit: "cover",
          zIndex: 10
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: "800px",
              gap: "32px"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { textAlign: "center" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                  "h1",
                  {
                    style: {
                      fontFamily: "Syne, system-ui, sans-serif",
                      fontSize: "clamp(32px, 8vw, 72px)",
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1.1,
                      letterSpacing: "0.32px",
                      textTransform: "uppercase",
                      margin: 0
                    },
                    children: title
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                  "div",
                  {
                    style: {
                      marginTop: "16px",
                      fontSize: "clamp(16px, 3vw, 24px)",
                      color: "white",
                      lineHeight: 1.5
                    },
                    children: subtitles.map((text, i) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { style: { margin: "8px 0" }, children: text }, i))
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                "button",
                {
                  onClick: () => setShowAuth(true),
                  style: {
                    backgroundColor: "black",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    width: "100%",
                    maxWidth: "400px",
                    height: "64px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                    "span",
                    {
                      style: {
                        fontFamily: "Rubik, system-ui, sans-serif",
                        fontSize: "18px",
                        fontWeight: 500,
                        color: "white"
                      },
                      children: buttonText
                    }
                  )
                }
              )
            ]
          }
        )
      }
    ),
    showAuth && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 1e4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            "div",
            {
              onClick: () => setShowAuth(false),
              style: {
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(4px)"
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { position: "relative", zIndex: 1 }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            ZoAuth2,
            {
              onSuccess: (userId, user) => {
                setShowAuth(false);
                onAuthSuccess(userId, user);
              },
              onClose: () => setShowAuth(false),
              sendOTP,
              verifyOTP
            }
          ) })
        ]
      }
    )
  ] });
};

// src/components/ZoOnboarding.tsx
var import_react8 = require("react");
var import_jsx_runtime12 = require("react/jsx-runtime");
var ZoOnboarding = ({
  onComplete,
  updateProfile,
  getProfile,
  videoUrl = "/videos/loading-screen-background.mp4",
  logoUrl = "/figma-assets/landing-zo-logo.png",
  broAvatarUrl = "/bro.png",
  baeAvatarUrl = "/bae.png",
  className = ""
}) => {
  const [step, setStep] = (0, import_react8.useState)("input");
  const [nickname, setNickname] = (0, import_react8.useState)("");
  const [bodyType, setBodyType] = (0, import_react8.useState)("bro");
  const [city, setCity] = (0, import_react8.useState)("");
  const [locationEnabled, setLocationEnabled] = (0, import_react8.useState)(false);
  const [isLoadingLocation, setIsLoadingLocation] = (0, import_react8.useState)(false);
  const [isSaving, setIsSaving] = (0, import_react8.useState)(false);
  const [error, setError] = (0, import_react8.useState)("");
  const [avatarUrl, setAvatarUrl] = (0, import_react8.useState)(null);
  const pollingRef = (0, import_react8.useRef)(null);
  const attemptsRef = (0, import_react8.useRef)(0);
  const isNicknameValid = nickname.length >= 4 && nickname.length <= 16 && /^[a-z0-9]*$/.test(nickname);
  const canSubmit = isNicknameValid && locationEnabled && bodyType && !isSaving;
  (0, import_react8.useEffect)(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);
  const handleNicknameChange = (e) => {
    setNickname(e.target.value.toLowerCase());
    setError("");
  };
  const handleLocationEnable = () => {
    if ("geolocation" in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const detectedCity = data.city || data.locality || data.principalSubdivision || "Unknown City";
            setCity(detectedCity);
            setLocationEnabled(true);
            setIsLoadingLocation(false);
            setError("");
          } catch (err) {
            console.error("Failed to get city:", err);
            setError("Failed to detect location. Please try again.");
            setLocationEnabled(false);
            setIsLoadingLocation(false);
          }
        },
        (err) => {
          console.error("Location error:", err);
          setError("Location access denied. Please enable permissions.");
          setLocationEnabled(false);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    setError("");
    try {
      const result = await updateProfile({
        first_name: nickname,
        body_type: bodyType,
        place_name: city
      });
      if (!result.success) {
        throw new Error(result.error || "Profile update failed");
      }
      setStep("generating");
      pollForAvatar();
    } catch (err) {
      console.error("Error saving user:", err);
      setError("Failed to save. Please try again.");
      setIsSaving(false);
    }
  };
  const pollForAvatar = async () => {
    attemptsRef.current += 1;
    const maxAttempts = 30;
    if (attemptsRef.current > maxAttempts) {
      setAvatarUrl(bodyType === "bro" ? broAvatarUrl : baeAvatarUrl);
      setStep("success");
      return;
    }
    try {
      const profile = await getProfile();
      if (profile?.avatar?.image) {
        setAvatarUrl(profile.avatar.image);
        setTimeout(() => setStep("success"), 1e3);
        return;
      }
      pollingRef.current = setTimeout(pollForAvatar, 1e3);
    } catch (err) {
      console.error("Polling error:", err);
      pollingRef.current = setTimeout(pollForAvatar, 1e3);
    }
  };
  const handleComplete = () => {
    onComplete({
      nickname,
      bodyType,
      city,
      avatarUrl
    });
  };
  const containerStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "black",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "Rubik, system-ui, sans-serif"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: `zo-onboarding ${className}`, style: containerStyle, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "video",
      {
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: "none"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("source", { src: videoUrl, type: "video/mp4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent, transparent, black)",
          zIndex: 0,
          pointerEvents: "none"
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { position: "absolute", left: "24px", top: "40px", width: "40px", height: "40px", zIndex: 50 }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("img", { src: logoUrl, alt: "Zo", style: { width: "100%", height: "100%", objectFit: "cover" } }) }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          paddingTop: "120px",
          paddingBottom: "40px"
        },
        children: [
          step === "input" && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "360px", padding: "0 24px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "h1",
              {
                style: {
                  fontFamily: "Syne, system-ui, sans-serif",
                  fontWeight: 800,
                  color: "white",
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.32px",
                  lineHeight: 1.2,
                  marginBottom: "24px",
                  fontSize: "clamp(24px, 6vw, 48px)"
                },
                children: "WHO ARE YOU?"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
              "p",
              {
                style: {
                  color: "rgba(255, 255, 255, 0.6)",
                  textAlign: "center",
                  lineHeight: 1.5,
                  marginBottom: "40px",
                  fontSize: "clamp(14px, 2vw, 16px)"
                },
                children: [
                  "A difficult question, I know. We'll get to it.",
                  /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("br", {}),
                  "But let's start with choosing a nick."
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "input",
              {
                type: "text",
                value: nickname,
                onChange: handleNicknameChange,
                placeholder: "samurai",
                maxLength: 16,
                style: {
                  width: "100%",
                  height: "56px",
                  padding: "0 20px",
                  backgroundColor: "black",
                  border: "1px solid #49494A",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "16px",
                  marginBottom: "40px"
                },
                autoFocus: true
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { width: "100%", marginBottom: "32px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { style: { color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", textAlign: "center", marginBottom: "16px" }, children: "Choose your avatar style" }),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", gap: "16px", justifyContent: "center" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
                  "button",
                  {
                    onClick: () => setBodyType("bae"),
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: "16px",
                      borderRadius: "16px",
                      border: bodyType === "bae" ? "2px solid #CFFF50" : "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: bodyType === "bae" ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)",
                      cursor: "pointer",
                      minWidth: "120px",
                      transform: bodyType === "bae" ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.3s"
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(255, 255, 255, 0.1)" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("img", { src: baeAvatarUrl, alt: "Bae", style: { width: "100%", height: "100%", objectFit: "cover" } }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { color: "white", fontSize: "14px", fontWeight: 500 }, children: "Bae" })
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
                  "button",
                  {
                    onClick: () => setBodyType("bro"),
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: "16px",
                      borderRadius: "16px",
                      border: bodyType === "bro" ? "2px solid #CFFF50" : "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: bodyType === "bro" ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)",
                      cursor: "pointer",
                      minWidth: "120px",
                      transform: bodyType === "bro" ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.3s"
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(255, 255, 255, 0.1)" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("img", { src: broAvatarUrl, alt: "Bro", style: { width: "100%", height: "100%", objectFit: "cover" } }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { color: "white", fontSize: "14px", fontWeight: 500 }, children: "Bro" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { width: "100%", marginBottom: "24px" }, children: !locationEnabled ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
              "button",
              {
                onClick: handleLocationEnable,
                disabled: isLoadingLocation,
                style: {
                  width: "100%",
                  height: "48px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  cursor: isLoadingLocation ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                },
                children: [
                  "\u{1F4CD} ",
                  isLoadingLocation ? "Detecting..." : "Enable Location"
                ]
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
              "div",
              {
                style: {
                  width: "100%",
                  height: "48px",
                  backgroundColor: "rgba(207, 255, 80, 0.1)",
                  border: "1px solid rgba(207, 255, 80, 0.5)",
                  borderRadius: "12px",
                  color: "#CFFF50",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                },
                children: [
                  "\u{1F4CD} ",
                  /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { color: "white" }, children: city })
                ]
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "button",
              {
                onClick: handleSubmit,
                disabled: !canSubmit,
                style: {
                  width: "100%",
                  height: "56px",
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  color: "black",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.5
                },
                children: isSaving ? "Processing..." : "Get Citizenship"
              }
            ),
            error && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { style: { color: "#ef4444", fontSize: "14px", marginTop: "16px", textAlign: "center" }, children: error })
          ] }),
          step === "generating" && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "div",
            {
              style: {
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                "img",
                {
                  src: bodyType === "bro" ? broAvatarUrl : baeAvatarUrl,
                  alt: "Generating...",
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.8,
                    animation: "pulse 2s ease-in-out infinite"
                  }
                }
              )
            }
          ) }),
          step === "success" && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "div",
              {
                style: {
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  border: "4px solid white",
                  boxShadow: "0 0 40px rgba(255, 255, 255, 0.6)",
                  overflow: "hidden"
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                  "img",
                  {
                    src: avatarUrl || (bodyType === "bro" ? broAvatarUrl : baeAvatarUrl),
                    alt: "Avatar",
                    style: { width: "100%", height: "100%", objectFit: "cover" }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "button",
              {
                onClick: handleComplete,
                style: {
                  position: "fixed",
                  bottom: "40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "90%",
                  maxWidth: "360px",
                  height: "56px",
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  color: "black",
                  fontSize: "16px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                },
                children: "Zo Zo Zo! Let's Go"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("style", { children: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      ` })
  ] });
};

// src/hooks/useAuth.ts
var import_react9 = require("react");
function useAuth() {
  const { sdk, user, isAuthenticated, isLoading, sendOTP, verifyOTP, logout } = useZoPassport();
  const [otpSent, setOtpSent] = (0, import_react9.useState)(false);
  const [phoneNumber, setPhoneNumber] = (0, import_react9.useState)("");
  const [countryCode, setCountryCode] = (0, import_react9.useState)("91");
  const handleSendOTP = (0, import_react9.useCallback)(async (code, phone) => {
    setCountryCode(code);
    setPhoneNumber(phone);
    const result = await sendOTP(code, phone);
    if (result.success) {
      setOtpSent(true);
    }
    return result;
  }, [sendOTP]);
  const handleVerifyOTP = (0, import_react9.useCallback)(async (otp) => {
    const result = await verifyOTP(countryCode, phoneNumber, otp);
    if (result.success) {
      setOtpSent(false);
    }
    return result;
  }, [verifyOTP, countryCode, phoneNumber]);
  const handleLogout = (0, import_react9.useCallback)(async () => {
    await logout();
    setOtpSent(false);
    setPhoneNumber("");
  }, [logout]);
  return {
    user,
    isAuthenticated,
    isLoading,
    otpSent,
    phoneNumber,
    countryCode,
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    logout: handleLogout
  };
}

// src/hooks/useProfile.ts
var import_react11 = require("react");
function useProfile() {
  const { sdk, user, isAuthenticated, refreshProfile } = useZoPassport();
  const [isLoading, setIsLoading] = (0, import_react11.useState)(false);
  const [error, setError] = (0, import_react11.useState)(null);
  const completion = user ? calculateCompletion(user) : { done: 0, total: 10, percentage: 0 };
  const isFounder = user?.membership === "founder";
  const updateProfile = (0, import_react11.useCallback)(async (updates) => {
    if (!sdk) return { success: false, error: "SDK not initialized" };
    setIsLoading(true);
    setError(null);
    try {
      const result = await sdk.updateProfile(updates);
      if (!result.success) {
        setError(result.error || "Failed to update profile");
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);
  const reload = (0, import_react11.useCallback)(async () => {
    setIsLoading(true);
    try {
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    completion,
    isFounder,
    updateProfile,
    reload
  };
}
function calculateCompletion(user) {
  const fields = [
    user.first_name,
    user.last_name,
    user.bio,
    user.date_of_birth,
    user.place_name,
    user.body_type,
    user.pfp_image,
    user.email_address,
    user.wallet_address,
    (user.cultures?.length ?? 0) > 0
  ];
  const done = fields.filter((f) => !!f).length;
  const total = fields.length;
  const percentage = Math.round(done / total * 100);
  return { done, total, percentage };
}

// src/hooks/useAvatar.ts
var import_react13 = require("react");
function useAvatar() {
  const { sdk, user, refreshProfile } = useZoPassport();
  const [isGenerating, setIsGenerating] = (0, import_react13.useState)(false);
  const [progress, setProgress] = (0, import_react13.useState)(null);
  const [error, setError] = (0, import_react13.useState)(null);
  const avatarUrl = user?.avatar?.image || user?.pfp_image;
  const avatarStatus = user?.avatar?.status || "completed";
  const generateAvatar = (0, import_react13.useCallback)(async (bodyType) => {
    if (!sdk) return { success: false, error: "SDK not initialized" };
    setIsGenerating(true);
    setProgress("pending");
    setError(null);
    try {
      const result = await sdk.generateAvatar(bodyType);
      if (result.success) {
        await refreshProfile();
      } else {
        setError(result.error || "Failed to generate avatar");
      }
      return result;
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, [sdk, refreshProfile]);
  return {
    avatarUrl,
    avatarStatus,
    isGenerating,
    progress,
    error,
    generateAvatar
  };
}

// src/hooks/useWallet.ts
var import_react17 = require("react");

// src/hooks/useWalletBalance.ts
var import_react15 = require("react");
var useWalletBalance = (apiClient, options) => {
  const [balance, setBalance] = (0, import_react15.useState)(0);
  const [isLoading, setIsLoading] = (0, import_react15.useState)(true);
  const [error, setError] = (0, import_react15.useState)(null);
  const fetchBalance = (0, import_react15.useCallback)(async () => {
    if (!apiClient) {
      setError(new Error("API client not provided"));
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/v1/web3/token/airdrops/summary");
      const amount = response.data?.data?.total_amount ?? 0;
      setBalance(amount);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);
  (0, import_react15.useEffect)(() => {
    fetchBalance();
    if (options?.autoRefetch) {
      const interval = setInterval(fetchBalance, options.refetchInterval || 3e4);
      return () => clearInterval(interval);
    }
  }, [fetchBalance, options?.autoRefetch, options?.refetchInterval]);
  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance
  };
};

// src/hooks/useTransactions.ts
var import_react16 = require("react");
var useTransactions = (apiClient, options) => {
  const [transactions, setTransactions] = (0, import_react16.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react16.useState)(true);
  const [error, setError] = (0, import_react16.useState)(null);
  const [hasMore, setHasMore] = (0, import_react16.useState)(false);
  const fetchTransactions = (0, import_react16.useCallback)(async () => {
    if (!apiClient) {
      setError(new Error("API client not provided"));
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/v1/profile/completion-grants/claims", {
        params: {
          limit: options?.limit || 20
        }
      });
      const results = response.data?.data?.results ?? [];
      setTransactions(results);
      setHasMore(!!response.data?.data?.next);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, options?.limit]);
  const loadMore = (0, import_react16.useCallback)(async () => {
    if (!hasMore || isLoading) return;
  }, [hasMore, isLoading]);
  (0, import_react16.useEffect)(() => {
    fetchTransactions();
    if (options?.autoRefetch) {
      const interval = setInterval(fetchTransactions, 6e4);
      return () => clearInterval(interval);
    }
  }, [fetchTransactions, options?.autoRefetch]);
  return {
    transactions,
    isLoading,
    error,
    hasMore,
    refetch: fetchTransactions,
    loadMore
  };
};

// src/hooks/useWallet.ts
var useWallet = (apiClient, options) => {
  const {
    balance,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance
  } = useWalletBalance(apiClient, options);
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
    loadMore
  } = useTransactions(apiClient, options);
  const isLoading = isLoadingBalance || isLoadingTransactions;
  const error = balanceError || transactionsError;
  const refetchAll = (0, import_react17.useCallback)(async () => {
    await Promise.all([refetchBalance(), refetchTransactions()]);
  }, [refetchBalance, refetchTransactions]);
  return {
    balance,
    transactions,
    isLoading,
    error,
    refetch: refetchAll,
    loadMore
  };
};

// src/react.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var ZoPassportContext = (0, import_react18.createContext)(null);
function ZoPassportProvider({
  children,
  clientKey,
  baseUrl,
  autoRefresh = true,
  recaptchaSiteKey
}) {
  const [sdk, setSdk] = (0, import_react18.useState)(null);
  const [user, setUser] = (0, import_react18.useState)(null);
  const [isAuthenticated, setIsAuthenticated] = (0, import_react18.useState)(false);
  const [isLoading, setIsLoading] = (0, import_react18.useState)(true);
  (0, import_react18.useEffect)(() => {
    const passportSdk = new ZoPassportSDK({
      clientKey,
      baseUrl,
      autoRefresh
    });
    setSdk(passportSdk);
    const loadSession = async () => {
      setIsLoading(true);
      try {
        await passportSdk.ready();
        if (passportSdk.isAuthenticated) {
          const profile = await passportSdk.getProfile();
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("[ZoPassport] Failed to load session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
    return () => {
      passportSdk.destroy();
    };
  }, [clientKey, baseUrl, autoRefresh]);
  const sendOTP = async (countryCode, phoneNumber) => {
    if (!sdk) return { success: false, message: "SDK not initialized" };
    if (!recaptchaSiteKey) {
      return {
        success: false,
        message: "ZoPassportProvider: recaptchaSiteKey is required for OTP. Pass it as a prop or call sdk.auth.sendOTP(cc, phone, captchaToken) directly."
      };
    }
    try {
      const captchaToken = await executeRecaptcha(recaptchaSiteKey, "request_otp");
      return sdk.auth.sendOTP(countryCode, phoneNumber, captchaToken);
    } catch (err) {
      return { success: false, message: err?.message || "reCAPTCHA failed" };
    }
  };
  const verifyOTP = async (countryCode, phoneNumber, otp) => {
    if (!sdk) return { success: false, error: "SDK not initialized" };
    const result = await sdk.loginWithPhone(countryCode, phoneNumber, otp);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };
  const logout = async () => {
    if (!sdk) return;
    await sdk.logout();
    setUser(null);
    setIsAuthenticated(false);
  };
  const refreshProfile = async () => {
    if (!sdk) return;
    const profile = await sdk.getProfile();
    if (profile) {
      setUser(profile);
    }
  };
  const value = {
    sdk,
    user,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile
  };
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ZoPassportContext.Provider, { value, children });
}
function useZoPassport() {
  const context = (0, import_react18.useContext)(ZoPassportContext);
  if (!context) {
    throw new Error("useZoPassport must be used within a ZoPassportProvider");
  }
  return context;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FounderBadge,
  OTPInput,
  PhoneInput,
  WalletCard,
  WalletFullPage,
  ZoAuth,
  ZoAvatar,
  ZoLanding,
  ZoOnboarding,
  ZoPassportCard,
  ZoPassportPage,
  ZoPassportProvider,
  ZoPassportSDK,
  ZoProgressRing,
  useAuth,
  useAvatar,
  useProfile,
  useTransactions,
  useWallet,
  useWalletBalance,
  useZoPassport
});
//# sourceMappingURL=react.js.map