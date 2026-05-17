// src/lib/api/client.ts
import axios from "axios";

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
var AsyncStorageAdapter = class {
  constructor(asyncStorage) {
    this.storage = asyncStorage;
  }
  async getItem(key) {
    try {
      return await this.storage.getItem(key);
    } catch (error) {
      logger.warn(`AsyncStorage.getItem failed for key "${key}":`, error);
      return null;
    }
  }
  async setItem(key, value) {
    try {
      await this.storage.setItem(key, value);
    } catch (error) {
      logger.warn(`AsyncStorage.setItem failed for key "${key}":`, error);
    }
  }
  async removeItem(key) {
    try {
      await this.storage.removeItem(key);
    } catch (error) {
      logger.warn(`AsyncStorage.removeItem failed for key "${key}":`, error);
    }
  }
};
var MemoryStorageAdapter = class {
  constructor() {
    this.store = /* @__PURE__ */ new Map();
  }
  async getItem(key) {
    return this.store.get(key) || null;
  }
  async setItem(key, value) {
    this.store.set(key, value);
  }
  async removeItem(key) {
    this.store.delete(key);
  }
  /** Clear all stored data (useful for testing) */
  clear() {
    this.store.clear();
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
    this.client = axios.create({
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
   */
  async sendOTP(countryCode, phoneNumber) {
    try {
      const payload = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        message_channel: ""
        // Empty string as per ZO API spec
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

// src/lib/utils/phone.ts
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  isValidPhoneNumber as libIsValidPhoneNumber,
  AsYouType
} from "libphonenumber-js/mobile";
function isoToFlag(iso) {
  if (!iso || iso.length !== 2) return "";
  const upper = iso.toUpperCase();
  const A = 127462;
  const codePoints = [
    A + (upper.charCodeAt(0) - 65),
    A + (upper.charCodeAt(1) - 65)
  ];
  return String.fromCodePoint(...codePoints);
}
var displayNames;
function getCountryName(iso) {
  if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
    if (!displayNames) {
      try {
        displayNames = new Intl.DisplayNames(["en"], { type: "region" });
      } catch {
        displayNames = void 0;
      }
    }
    if (displayNames) {
      const name = displayNames.of(iso);
      if (name) return name;
    }
  }
  return iso;
}
function buildCountryList() {
  const list = [];
  for (const iso of getCountries()) {
    let dial;
    try {
      dial = getCountryCallingCode(iso);
    } catch {
      continue;
    }
    list.push({
      code: dial,
      country: iso,
      flag: isoToFlag(iso),
      name: getCountryName(iso)
    });
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
var COUNTRY_CODES = buildCountryList();
function getCountryByDialCode(code) {
  const cleaned = code.replace(/^\+/, "");
  return COUNTRY_CODES.find((c) => c.code === cleaned);
}
function getCountryByIso(iso) {
  const upper = iso.toUpperCase();
  return COUNTRY_CODES.find((c) => c.country === upper);
}
function formatPhoneNumber(phone, country) {
  if (!phone) return "";
  if (country) {
    const iso = resolveIso(country);
    if (iso) {
      const parsed = parsePhoneNumberFromString(phone, iso);
      if (parsed) return parsed.formatNational();
      return new AsYouType(iso).input(phone);
    }
  }
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return cleaned;
}
function parsePhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}
function isValidPhoneNumber(phone, country) {
  if (!phone) return false;
  if (country) {
    const iso = resolveIso(country);
    if (iso) {
      try {
        return libIsValidPhoneNumber(phone, iso);
      } catch {
        return false;
      }
    }
  }
  const cleaned = parsePhoneNumber(phone);
  return cleaned.length >= 7 && cleaned.length <= 15;
}
function formatAsYouType(phone, country) {
  const iso = resolveIso(country);
  if (!iso) return phone;
  return new AsYouType(iso).input(phone);
}
function resolveIso(input) {
  if (!input) return void 0;
  const upper = input.toUpperCase();
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) {
    return getCountryByIso(upper) ? upper : void 0;
  }
  const byDial = getCountryByDialCode(input);
  return byDial?.country;
}

// src/lib/utils/wallet.ts
var formatBalance = (balance) => {
  if (balance === 0) return "0";
  const formatted = balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return formatted;
};
var formatBalanceShort = (balance) => {
  if (balance === 0) return "0";
  if (balance < 1e3) return formatBalance(balance);
  if (balance < 1e6) return `${(balance / 1e3).toFixed(1)}K`;
  return `${(balance / 1e6).toFixed(1)}M`;
};
var formatWalletAddress = (address) => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
var formatNickname = (nickname) => {
  if (!nickname) return "";
  return nickname.startsWith("@") ? nickname : `@${nickname}`;
};
var formatTransactionAmount = (amount, action) => {
  const formatted = formatBalance(amount);
  return action === "spend" ? `- ${formatted}` : `+ ${formatted}`;
};
var getTransactionColor = (action) => {
  return action === "spend" ? "#FF4444" : "#00C853";
};

// src/lib/errors.ts
var ZoSDKError = class extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ZoSDKError";
    this.code = code;
  }
};
var ZoAuthError = class extends ZoSDKError {
  constructor(message, statusCode) {
    super(message, "AUTH_ERROR");
    this.name = "ZoAuthError";
    this.statusCode = statusCode;
  }
};
var ZoNetworkError = class extends ZoSDKError {
  constructor(message = "Network request failed. Check your connection and try again.") {
    super(message, "NETWORK_ERROR");
    this.name = "ZoNetworkError";
  }
};
var ZoValidationError = class extends ZoSDKError {
  constructor(message, field) {
    super(message, "VALIDATION_ERROR");
    this.name = "ZoValidationError";
    this.field = field;
  }
};
var ZoNotAuthenticatedError = class extends ZoSDKError {
  constructor() {
    super("Not authenticated. Call loginWithPhone() first.", "NOT_AUTHENTICATED");
    this.name = "ZoNotAuthenticatedError";
  }
};
var ZoConfigError = class extends ZoSDKError {
  constructor(message) {
    super(message, "CONFIG_ERROR");
    this.name = "ZoConfigError";
  }
};

// src/lib/utils/validation.ts
function validatePhoneNumber(phoneNumber, country) {
  if (country) {
    if (!isValidPhoneNumber(phoneNumber, country)) {
      throw new ZoValidationError(
        `Invalid phone number "${phoneNumber}" for country "${country}".`,
        "phoneNumber"
      );
    }
    return;
  }
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (!cleaned || cleaned.length < 7 || cleaned.length > 15) {
    throw new ZoValidationError(
      `Invalid phone number "${phoneNumber}". Must be 7-15 digits.`,
      "phoneNumber"
    );
  }
}
function validateCountryCode(countryCode) {
  if (!countryCode) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". Must be a dial code (1-4 digits) or ISO 3166-1 alpha-2 code.`,
      "countryCode"
    );
  }
  const upper = countryCode.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    if (!getCountryByIso(upper)) {
      throw new ZoValidationError(
        `Invalid country code "${countryCode}". Unknown ISO 3166-1 alpha-2 code.`,
        "countryCode"
      );
    }
    return;
  }
  const cleaned = countryCode.replace(/\D/g, "");
  if (!cleaned || cleaned.length < 1 || cleaned.length > 4) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". Must be 1-4 digits.`,
      "countryCode"
    );
  }
  if (!getCountryByDialCode(cleaned)) {
    throw new ZoValidationError(
      `Invalid country code "${countryCode}". No country uses this dial code.`,
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

// assets/index.ts
var ASSETS = {
  // Core avatars
  BRO_AVATAR: "/bro.png",
  BAE_AVATAR: "/bae.png",
  FALLBACK_AVATAR: "/zo-fallback.png",
  DEFAULT_AVATAR: "/images/rank1.jpeg",
  // Branding
  ZO_LOGO: "/figma-assets/landing-zo-logo.png",
  ZO_COIN: "/zo-coin.gif",
  // Videos
  LANDING_VIDEO: "/videos/loading-screen-background.mp4",
  PORTAL_VIDEO: "/videos/opening-disks.mp4",
  // Passport backgrounds (CDN)
  FOUNDER_BG: "https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png",
  CITIZEN_BG: "https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png",
  // Lotties
  LOADER: "/lotties/loader.json",
  SPINNER: "/lotties/spinner.json"
};
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
export {
  ASSETS,
  AsyncStorageAdapter,
  COUNTRY_CODES,
  CULTURES,
  CULTURE_STICKERS,
  LocalStorageAdapter,
  MemoryStorageAdapter,
  STORAGE_KEYS,
  ZoApiClient,
  ZoAuth,
  ZoAuthError,
  ZoAvatar,
  ZoConfigError,
  ZoNetworkError,
  ZoNotAuthenticatedError,
  ZoPassportSDK,
  ZoProfile,
  ZoSDKError,
  ZoValidationError,
  ZoWallet,
  formatAsYouType,
  formatBalance,
  formatBalanceShort,
  formatNickname,
  formatPhoneNumber,
  formatTransactionAmount,
  formatWalletAddress,
  getCountryByDialCode,
  getCountryByIso,
  getTransactionColor,
  isValidPhoneNumber,
  logger,
  parsePhoneNumber
};
//# sourceMappingURL=index.mjs.map