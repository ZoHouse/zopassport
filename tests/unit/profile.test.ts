import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoApiClient } from '../../src/lib/api/client';
import { ZoProfile } from '../../src/lib/api/profile';
import { MemoryStorageAdapter } from '../../src/lib/utils/storage';
import { createMockUser } from '../helpers';

describe('ZoProfile', () => {
  let mock: MockAdapter;
  let profile: ZoProfile;

  beforeEach(() => {
    const storage = new MemoryStorageAdapter();
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });
    mock = new MockAdapter(client.axiosInstance);
    profile = new ZoProfile(client);
  });

  describe('getProfile', () => {
    it('should return profile on success', async () => {
      const mockUser = createMockUser();
      mock.onGet('/api/v1/profile/me/').reply(200, mockUser);

      const result = await profile.getProfile('valid-token');
      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile!.id).toBe('test-user-id-123');
    });

    it('should return error on 401', async () => {
      mock.onGet('/api/v1/profile/me/').reply(401, {
        detail: 'Authentication credentials were not provided.',
      });

      const result = await profile.getProfile('bad-token');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication credentials were not provided.');
    });

    it('should handle generic server error', async () => {
      mock.onGet('/api/v1/profile/me/').reply(500);

      const result = await profile.getProfile('token');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch profile');
    });

    it('should handle network error', async () => {
      mock.onGet('/api/v1/profile/me/').networkError();

      const result = await profile.getProfile('token');
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return updated data', async () => {
      const updatedUser = createMockUser({ first_name: 'Updated' });
      mock.onPost('/api/v1/profile/me/').reply(200, updatedUser);

      const result = await profile.updateProfile('valid-token', {
        first_name: 'Updated',
      });
      expect(result.success).toBe(true);
      expect(result.profile!.first_name).toBe('Updated');
    });

    it('should send correct payload', async () => {
      mock.onPost('/api/v1/profile/me/').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.first_name).toBe('John');
        expect(data.bio).toBe('Hello world');
        return [200, createMockUser({ first_name: 'John', bio: 'Hello world' })];
      });

      await profile.updateProfile('token', {
        first_name: 'John',
        bio: 'Hello world',
      });
    });

    it('should return error on validation failure', async () => {
      mock.onPost('/api/v1/profile/me/').reply(400, {
        message: 'Invalid date format for date_of_birth',
      });

      const result = await profile.updateProfile('token', {
        date_of_birth: 'invalid-date',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid date format for date_of_birth');
    });

    it('should handle 401 unauthorized', async () => {
      mock.onPost('/api/v1/profile/me/').reply(401, {
        detail: 'Token expired',
      });

      const result = await profile.updateProfile('expired-token', {
        first_name: 'Test',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Token expired');
    });
  });
});
