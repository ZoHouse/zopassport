// src/lib/api/client.ts
// ZO API HTTP client configuration

import axios, { AxiosInstance } from 'axios';
import { StorageAdapter, STORAGE_KEYS, LocalStorageAdapter } from '../utils/storage';

export interface ZoPassportConfig {
  /** Your ZO client key (required) */
  clientKey: string;
  /** API base URL (default: https://api.io.zo.xyz) */
  baseUrl?: string;
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** Storage adapter for tokens (default: LocalStorageAdapter) */
  storageAdapter?: StorageAdapter;
}

/**
 * Generate new device credentials
 */
function generateDeviceCredentials(): { deviceId: string; deviceSecret: string } {
  let deviceId: string;
  let deviceSecret: string;

  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    deviceId = `web-${crypto.randomUUID()}`;
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    deviceSecret = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without Web Crypto API
    deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    deviceSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  return { deviceId, deviceSecret };
}

export class ZoApiClient {
  private client: AxiosInstance;
  private config: ZoPassportConfig;
  private storage: StorageAdapter;

  constructor(config: ZoPassportConfig) {
    this.config = config;
    this.storage = config.storageAdapter || new LocalStorageAdapter();

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.io.zo.xyz',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private async setupInterceptors() {
    // Request interceptor: Add required headers
    this.client.interceptors.request.use(async (config) => {
      // Always add client key
      config.headers['client-key'] = this.config.clientKey;

      // Get or generate device credentials
      const credentials = await this.getOrCreateDeviceCredentials();
      config.headers['client-device-id'] = credentials.deviceId;
      config.headers['client-device-secret'] = credentials.deviceSecret;

      // Add auth token if available
      const token = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    });

    // Response interceptor: Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            try {
              const response = await this.client.post('/api/v1/auth/token/refresh/', {
                refresh_token: refreshToken,
              });

              if (response.data?.access) {
                await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
                if (response.data.refresh) {
                  await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
                }

                // Retry original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - clear session
              await this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              await this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async getOrCreateDeviceCredentials(): Promise<{ deviceId: string; deviceSecret: string }> {
    // Try to get from storage
    const storedId = await this.storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    const storedSecret = await this.storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET);

    if (storedId && storedSecret) {
      return { deviceId: storedId, deviceSecret: storedSecret };
    }

    // Generate new credentials
    const credentials = generateDeviceCredentials();

    // Save to storage
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, credentials.deviceId);
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, credentials.deviceSecret);

    return credentials;
  }

  get axiosInstance(): AxiosInstance {
    return this.client;
  }

  getStorage(): StorageAdapter {
    return this.storage;
  }
}

