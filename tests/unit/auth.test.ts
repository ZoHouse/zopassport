import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ZoApiClient } from '../../src/lib/api/client';
import { ZoAuth } from '../../src/lib/api/auth';
import { MemoryStorageAdapter } from '../../src/lib/utils/storage';
import { createMockAuthResponse, createMockUser } from '../helpers';

describe('ZoAuth', () => {
  let mock: MockAdapter;
  let client: ZoApiClient;
  let auth: ZoAuth;

  beforeEach(() => {
    const storage = new MemoryStorageAdapter();
    client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });
    mock = new MockAdapter(client.axiosInstance);
    auth = new ZoAuth(client);
  });

  // ==================
  // sendOTP
  // ==================
  describe('sendOTP', () => {
    it('should return success when OTP is sent', async () => {
      mock.onPost('/api/v1/auth/login/mobile/otp/').reply(200, {
        message: 'OTP sent successfully',
      });

      const result = await auth.sendOTP('91', '9876543210');
      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent successfully');
    });

    it('should send correct payload', async () => {
      mock.onPost('/api/v1/auth/login/mobile/otp/').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.mobile_country_code).toBe('91');
        expect(data.mobile_number).toBe('9876543210');
        expect(data.message_channel).toBe('');
        return [200, { message: 'OTP sent' }];
      });

      await auth.sendOTP('91', '9876543210');
    });

    it('should return failure on server error', async () => {
      mock.onPost('/api/v1/auth/login/mobile/otp/').reply(500, {
        detail: 'Internal server error',
      });

      const result = await auth.sendOTP('91', '9876543210');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
    });

    it('should return failure on network error', async () => {
      mock.onPost('/api/v1/auth/login/mobile/otp/').networkError();

      const result = await auth.sendOTP('91', '9876543210');
      expect(result.success).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should handle error response with message field', async () => {
      mock.onPost('/api/v1/auth/login/mobile/otp/').reply(400, {
        message: 'Invalid phone number',
      });

      const result = await auth.sendOTP('91', '123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid phone number');
    });

    it('should handle error response with error field', async () => {
      mock.onPost('/api/v1/auth/login/mobile/otp/').reply(400, {
        error: 'Rate limit exceeded',
      });

      const result = await auth.sendOTP('91', '9876543210');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Rate limit exceeded');
    });
  });

  // ==================
  // verifyOTP
  // ==================
  describe('verifyOTP', () => {
    it('should return user data on successful verification', async () => {
      const authResponse = createMockAuthResponse();
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.user.id).toBe('test-user-id-123');
      expect(result.data!.access_token).toBe('test-access-token');
    });

    it('should send correct payload', async () => {
      const authResponse = createMockAuthResponse();
      mock.onPost('/api/v1/auth/login/mobile/').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.mobile_country_code).toBe('1');
        expect(data.mobile_number).toBe('5551234567');
        expect(data.otp).toBe('999999');
        return [200, authResponse];
      });

      await auth.verifyOTP('1', '5551234567', '999999');
    });

    it('should return error on invalid OTP', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(400, {
        errors: ['Invalid OTP'],
      });

      const result = await auth.verifyOTP('91', '9876543210', '000000');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP');
    });

    it('should return error on expired OTP', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(400, {
        detail: 'OTP has expired',
      });

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toBe('OTP has expired');
    });

    it('should handle string response data', async () => {
      const authResponse = createMockAuthResponse();
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, JSON.stringify(authResponse));

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      expect(result.success).toBe(true);
    });

    it('should return error for invalid JSON string response', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, 'not-json');

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      // axios will parse it, so it might not be a string.
      // If response is a raw string 'not-json', it will fail validation
      expect(result.success).toBe(false);
    });

    it('should return error when response missing user', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, {
        access_token: 'token',
      });

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response');
    });

    it('should return error when response missing access_token', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').reply(200, {
        user: createMockUser(),
      });

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response');
    });

    it('should handle network error', async () => {
      mock.onPost('/api/v1/auth/login/mobile/').networkError();

      const result = await auth.verifyOTP('91', '9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });
  });

  // ==================
  // refreshAccessToken
  // ==================
  describe('refreshAccessToken', () => {
    it('should return new tokens on success', async () => {
      const tokenData = {
        access: 'new-access',
        refresh: 'new-refresh',
        access_expiry: '2099-12-31T23:59:59Z',
        refresh_expiry: '2099-12-31T23:59:59Z',
      };
      mock.onPost('/api/v1/auth/token/refresh/').reply(200, tokenData);

      const result = await auth.refreshAccessToken('old-refresh-token');
      expect(result.success).toBe(true);
      expect(result.tokens!.access).toBe('new-access');
      expect(result.tokens!.refresh).toBe('new-refresh');
    });

    it('should return error on failure', async () => {
      mock.onPost('/api/v1/auth/token/refresh/').reply(401, {
        detail: 'Token expired',
      });

      const result = await auth.refreshAccessToken('bad-token');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to refresh authentication');
    });
  });

  // ==================
  // checkLoginStatus
  // ==================
  describe('checkLoginStatus', () => {
    it('should return authenticated true when valid', async () => {
      mock.onGet('/api/v1/auth/login/check/').reply(200, {
        authenticated: true,
      });

      const result = await auth.checkLoginStatus('valid-token');
      expect(result.success).toBe(true);
      expect(result.isAuthenticated).toBe(true);
    });

    it('should return authenticated false when invalid', async () => {
      mock.onGet('/api/v1/auth/login/check/').reply(200, {
        authenticated: false,
      });

      const result = await auth.checkLoginStatus('invalid-token');
      expect(result.success).toBe(true);
      expect(result.isAuthenticated).toBe(false);
    });

    it('should return false on error', async () => {
      mock.onGet('/api/v1/auth/login/check/').reply(401);

      const result = await auth.checkLoginStatus('expired-token');
      expect(result.success).toBe(false);
      expect(result.isAuthenticated).toBe(false);
    });
  });
});
