import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoApiClient } from '../../src/lib/api/client';
import { MemoryStorageAdapter, STORAGE_KEYS } from '../../src/lib/utils/storage';

describe('ZoApiClient', () => {
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
  });

  it('should create an axios instance with default baseURL', () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });

    expect(client.axiosInstance).toBeDefined();
    expect(client.axiosInstance.defaults.baseURL).toBe('https://api.io.zo.xyz');
  });

  it('should use custom baseURL when provided', () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      baseUrl: 'https://custom.api.com',
      storageAdapter: storage,
    });

    expect(client.axiosInstance.defaults.baseURL).toBe('https://custom.api.com');
  });

  it('should use custom timeout when provided', () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      timeout: 5000,
      storageAdapter: storage,
    });

    expect(client.axiosInstance.defaults.timeout).toBe(5000);
  });

  it('should default timeout to 10000', () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });

    expect(client.axiosInstance.defaults.timeout).toBe(10000);
  });

  it('should set content-type headers', () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });

    expect(client.axiosInstance.defaults.headers['Content-Type']).toBe('application/json');
    expect(client.axiosInstance.defaults.headers['Accept']).toBe('application/json');
  });

  it('should return storage adapter via getStorage()', () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });

    expect(client.getStorage()).toBe(storage);
  });

  it('should generate and store device credentials when none exist', async () => {
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });
    const mock = new MockAdapter(client.axiosInstance);
    mock.onGet('/test').reply(200, { ok: true });

    await client.axiosInstance.get('/test');

    const deviceId = await storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    const deviceSecret = await storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET);

    expect(deviceId).toBeTruthy();
    expect(deviceId).toMatch(/^web-/);
    expect(deviceSecret).toBeTruthy();
    mock.restore();
  });

  it('should reuse existing device credentials from storage', async () => {
    await storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, 'existing-device-id');
    await storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, 'existing-device-secret');

    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });
    const mock = new MockAdapter(client.axiosInstance);
    mock.onGet('/test').reply(200, { ok: true });

    await client.axiosInstance.get('/test');

    const deviceId = await storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    expect(deviceId).toBe('existing-device-id');
    mock.restore();
  });
});

// ============================================================
// Client Interceptors - Request Headers
// ============================================================
describe('ZoApiClient Request Interceptors', () => {
  let client: ZoApiClient;
  let mock: MockAdapter;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    client = new ZoApiClient({
      clientKey: 'my-client-key',
      storageAdapter: storage,
    });
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should add client-key header to all requests', async () => {
    mock.onGet('/test').reply((config) => {
      expect(config.headers!['client-key']).toBe('my-client-key');
      return [200, { ok: true }];
    });
    await client.axiosInstance.get('/test');
  });

  it('should add device ID and secret headers', async () => {
    mock.onGet('/test').reply((config) => {
      expect(config.headers!['client-device-id']).toBeTruthy();
      expect(config.headers!['client-device-secret']).toBeTruthy();
      return [200, { ok: true }];
    });
    await client.axiosInstance.get('/test');
  });

  it('should add Authorization header when access token exists', async () => {
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'my-access-token');
    mock.onGet('/test').reply((config) => {
      expect(config.headers!['Authorization']).toBe('Bearer my-access-token');
      return [200, { ok: true }];
    });
    await client.axiosInstance.get('/test');
  });

  it('should NOT add Authorization header when no access token', async () => {
    mock.onGet('/test').reply((config) => {
      expect(config.headers!['Authorization']).toBeUndefined();
      return [200, { ok: true }];
    });
    await client.axiosInstance.get('/test');
  });

  it('should not retry on 401 if no refresh token exists', async () => {
    mock.onGet('/api/protected').reply(401, { detail: 'Unauthorized' });
    await expect(client.axiosInstance.get('/api/protected')).rejects.toThrow();
  });
});
