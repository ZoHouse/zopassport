// src/lib/utils/storage.ts
// Storage adapters for token persistence

/**
 * Storage adapter interface
 * Implement this to provide custom storage (e.g., AsyncStorage for React Native)
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Storage keys used by the SDK
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'zo_access_token',
  REFRESH_TOKEN: 'zo_refresh_token',
  TOKEN_EXPIRY: 'zo_token_expiry',
  REFRESH_EXPIRY: 'zo_refresh_expiry',
  USER: 'zo_user',
  CLIENT_DEVICE_ID: 'zo_device_id',
  CLIENT_DEVICE_SECRET: 'zo_device_secret',
  AVATAR_URL: 'zo_avatar_url',
  NICKNAME: 'zo_nickname',
  CITY: 'zo_city',
  BODY_TYPE: 'zo_body_type',
} as const;

/**
 * LocalStorage adapter for web browsers
 */
export class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail (storage full, private mode, etc.)
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
}

/**
 * AsyncStorage adapter for React Native
 * Provide AsyncStorage from @react-native-async-storage/async-storage
 */
export class AsyncStorageAdapter implements StorageAdapter {
  private storage: any;

  constructor(asyncStorage: any) {
    this.storage = asyncStorage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.storage.setItem(key, value);
    } catch {
      // Silently fail
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
}

/**
 * In-memory storage adapter (for SSR or testing)
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}
