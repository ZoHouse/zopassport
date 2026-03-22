import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MemoryStorageAdapter, STORAGE_KEYS } from '../src/lib/utils/storage';
import type { ZoAuthResponse, ZoUser } from '../src/lib/types';

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides: Partial<ZoUser> = {}): ZoUser {
  return {
    id: 'test-user-id-123',
    pid: 'PID123',
    first_name: 'Test',
    last_name: 'User',
    mobile_number: '9876543210',
    email_address: 'test@zo.xyz',
    date_of_birth: '1990-01-01',
    bio: 'Test bio',
    pfp_image: 'https://example.com/avatar.png',
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    membership: 'citizen',
    body_type: 'bro',
    place_name: 'Mumbai',
    home_location: { lat: 19.076, lng: 72.8777 },
    cultures: [{ key: 'tech', name: 'Technology', icon: '💻', description: 'Tech culture' }],
    founder_tokens: [],
    avatar: { image: 'https://example.com/avatar.png', status: 'completed' },
    ...overrides,
  } as ZoUser;
}

/**
 * Create a mock auth response
 */
export function createMockAuthResponse(overrides: Partial<ZoAuthResponse> = {}): ZoAuthResponse {
  return {
    token: 'test-access-token',
    valid_till: '2099-12-31T23:59:59Z',
    access_token: 'test-access-token',
    access_token_expiry: '2099-12-31T23:59:59Z',
    refresh_token: 'test-refresh-token',
    refresh_token_expiry: '2099-12-31T23:59:59Z',
    client_key: 'test-client-key',
    device_id: 'test-device-id',
    device_secret: 'test-device-secret',
    device_info: {},
    user: createMockUser(),
    ...overrides,
  } as ZoAuthResponse;
}

/**
 * Create a pre-authenticated storage adapter
 */
export async function createAuthenticatedStorage(): Promise<MemoryStorageAdapter> {
  const storage = new MemoryStorageAdapter();
  const authResponse = createMockAuthResponse();
  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.access_token);
  await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refresh_token);
  await storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, authResponse.access_token_expiry);
  await storage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, authResponse.refresh_token_expiry);
  await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
  await storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, authResponse.device_id);
  await storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, authResponse.device_secret);
  return storage;
}
