// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MemoryStorageAdapter,
  LocalStorageAdapter,
  AsyncStorageAdapter,
  STORAGE_KEYS,
} from '../../src/lib/utils/storage';

// ============================================================
// MemoryStorageAdapter
// ============================================================
describe('MemoryStorageAdapter', () => {
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
  });

  it('should return null for non-existent key', async () => {
    expect(await storage.getItem('missing')).toBeNull();
  });

  it('should set and get an item', async () => {
    await storage.setItem('key', 'value');
    expect(await storage.getItem('key')).toBe('value');
  });

  it('should overwrite existing value', async () => {
    await storage.setItem('key', 'v1');
    await storage.setItem('key', 'v2');
    expect(await storage.getItem('key')).toBe('v2');
  });

  it('should remove an item', async () => {
    await storage.setItem('key', 'value');
    await storage.removeItem('key');
    expect(await storage.getItem('key')).toBeNull();
  });

  it('should not throw when removing non-existent key', async () => {
    await expect(storage.removeItem('nope')).resolves.toBeUndefined();
  });

  it('should clear all items', async () => {
    await storage.setItem('a', '1');
    await storage.setItem('b', '2');
    storage.clear();
    expect(await storage.getItem('a')).toBeNull();
    expect(await storage.getItem('b')).toBeNull();
  });
});

// ============================================================
// LocalStorageAdapter
// ============================================================
describe('LocalStorageAdapter', () => {
  let storage: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageAdapter();
  });

  it('should get and set items via localStorage', async () => {
    await storage.setItem('test_key', 'test_value');
    expect(await storage.getItem('test_key')).toBe('test_value');
  });

  it('should remove items', async () => {
    await storage.setItem('test_key', 'test_value');
    await storage.removeItem('test_key');
    expect(await storage.getItem('test_key')).toBeNull();
  });

  it('should return null for missing keys', async () => {
    expect(await storage.getItem('does_not_exist')).toBeNull();
  });
});

// ============================================================
// AsyncStorageAdapter
// ============================================================
describe('AsyncStorageAdapter', () => {
  it('should delegate to provided async storage implementation', async () => {
    const mockStore: Record<string, string> = {};
    const mockAsyncStorage = {
      getItem: async (key: string) => mockStore[key] ?? null,
      setItem: async (key: string, value: string) => { mockStore[key] = value; },
      removeItem: async (key: string) => { delete mockStore[key]; },
    };

    const adapter = new AsyncStorageAdapter(mockAsyncStorage);

    await adapter.setItem('k', 'v');
    expect(await adapter.getItem('k')).toBe('v');
    await adapter.removeItem('k');
    expect(await adapter.getItem('k')).toBeNull();
  });

  it('should handle errors gracefully and return null on getItem failure', async () => {
    const failingStorage = {
      getItem: async () => { throw new Error('fail'); },
      setItem: async () => { throw new Error('fail'); },
      removeItem: async () => { throw new Error('fail'); },
    };

    const adapter = new AsyncStorageAdapter(failingStorage);
    expect(await adapter.getItem('k')).toBeNull();
    // setItem and removeItem should not throw
    await expect(adapter.setItem('k', 'v')).resolves.toBeUndefined();
    await expect(adapter.removeItem('k')).resolves.toBeUndefined();
  });
});

// ============================================================
// STORAGE_KEYS
// ============================================================
describe('STORAGE_KEYS', () => {
  it('should define all required keys', () => {
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBe('zo_access_token');
    expect(STORAGE_KEYS.REFRESH_TOKEN).toBe('zo_refresh_token');
    expect(STORAGE_KEYS.TOKEN_EXPIRY).toBe('zo_token_expiry');
    expect(STORAGE_KEYS.REFRESH_EXPIRY).toBe('zo_refresh_expiry');
    expect(STORAGE_KEYS.USER).toBe('zo_user');
    expect(STORAGE_KEYS.CLIENT_DEVICE_ID).toBe('zo_device_id');
    expect(STORAGE_KEYS.CLIENT_DEVICE_SECRET).toBe('zo_device_secret');
    expect(STORAGE_KEYS.AVATAR_URL).toBe('zo_avatar_url');
    expect(STORAGE_KEYS.NICKNAME).toBe('zo_nickname');
    expect(STORAGE_KEYS.CITY).toBe('zo_city');
    expect(STORAGE_KEYS.BODY_TYPE).toBe('zo_body_type');
  });
});
