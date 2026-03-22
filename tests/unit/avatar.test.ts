import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoApiClient } from '../../src/lib/api/client';
import { ZoAvatar } from '../../src/lib/api/avatar';
import { MemoryStorageAdapter } from '../../src/lib/utils/storage';

describe('ZoAvatar', () => {
  let mock: MockAdapter;
  let avatar: ZoAvatar;

  beforeEach(() => {
    const storage = new MemoryStorageAdapter();
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });
    mock = new MockAdapter(client.axiosInstance);
    avatar = new ZoAvatar(client);
  });

  describe('generateAvatar', () => {
    it('should start avatar generation and return task_id', async () => {
      mock.onPost('/api/v1/avatar/generate/').reply(200, {
        task_id: 'task-123',
        status: 'pending',
        message: 'Avatar generation started',
      });

      const result = await avatar.generateAvatar('valid-token', 'bro');
      expect(result.success).toBe(true);
      expect(result.task_id).toBe('task-123');
      expect(result.status).toBe('pending');
    });

    it('should send correct body_type in payload', async () => {
      mock.onPost('/api/v1/avatar/generate/').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.body_type).toBe('bae');
        return [200, { task_id: 'task-456', status: 'pending', message: 'ok' }];
      });

      await avatar.generateAvatar('token', 'bae');
    });

    it('should return error on failure', async () => {
      mock.onPost('/api/v1/avatar/generate/').reply(500, {
        detail: 'Generation service unavailable',
      });

      const result = await avatar.generateAvatar('token', 'bro');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Generation service unavailable');
    });

    it('should handle 401', async () => {
      mock.onPost('/api/v1/avatar/generate/').reply(401, {
        detail: 'Unauthorized',
      });

      const result = await avatar.generateAvatar('bad-token', 'bro');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getAvatarStatus', () => {
    it('should return completed status with avatar URL', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(200, {
        task_id: 'task-123',
        status: 'completed',
        result: { avatar_url: 'https://example.com/avatar.png' },
      });

      const result = await avatar.getAvatarStatus('token', 'task-123');
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should return pending status', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(200, {
        task_id: 'task-123',
        status: 'pending',
      });

      const result = await avatar.getAvatarStatus('token', 'task-123');
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.avatarUrl).toBeUndefined();
    });

    it('should return processing status', async () => {
      mock.onGet('/api/v1/avatar/status/task-456/').reply(200, {
        task_id: 'task-456',
        status: 'processing',
      });

      const result = await avatar.getAvatarStatus('token', 'task-456');
      expect(result.success).toBe(true);
      expect(result.status).toBe('processing');
    });

    it('should return failed status', async () => {
      mock.onGet('/api/v1/avatar/status/task-789/').reply(200, {
        task_id: 'task-789',
        status: 'failed',
        error: 'Generation failed',
      });

      const result = await avatar.getAvatarStatus('token', 'task-789');
      expect(result.success).toBe(true);
      expect(result.status).toBe('failed');
    });

    it('should handle server error', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(500);

      const result = await avatar.getAvatarStatus('token', 'task-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get avatar status');
    });
  });

  describe('pollAvatarStatus', () => {
    it('should call onComplete when status is completed', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(200, {
        task_id: 'task-123',
        status: 'completed',
        result: { avatar_url: 'https://example.com/avatar.png' },
      });

      const onComplete = vi.fn();
      await avatar.pollAvatarStatus('token', 'task-123', {
        onComplete,
        interval: 10,
      });

      // Wait for async poll
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onComplete).toHaveBeenCalledWith('https://example.com/avatar.png');
    });

    it('should call onError when status is failed', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(200, {
        task_id: 'task-123',
        status: 'failed',
      });

      const onError = vi.fn();
      await avatar.pollAvatarStatus('token', 'task-123', {
        onError,
        interval: 10,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onError).toHaveBeenCalledWith('Avatar generation failed');
    });

    it('should call onError when API call fails', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(500);

      const onError = vi.fn();
      await avatar.pollAvatarStatus('token', 'task-123', {
        onError,
        interval: 10,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onError).toHaveBeenCalled();
    });

    it('should call onProgress with status updates', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(200, {
        task_id: 'task-123',
        status: 'completed',
        result: { avatar_url: 'https://example.com/avatar.png' },
      });

      const onProgress = vi.fn();
      const onComplete = vi.fn();
      await avatar.pollAvatarStatus('token', 'task-123', {
        onProgress,
        onComplete,
        interval: 10,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onProgress).toHaveBeenCalledWith('completed');
    });

    it('should timeout after maxAttempts', async () => {
      mock.onGet('/api/v1/avatar/status/task-123/').reply(200, {
        task_id: 'task-123',
        status: 'processing',
      });

      const onError = vi.fn();
      await avatar.pollAvatarStatus('token', 'task-123', {
        onError,
        maxAttempts: 1,
        interval: 10,
      });

      // First poll: processing, second poll: exceeds maxAttempts
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onError).toHaveBeenCalledWith('Avatar generation timed out');
    });
  });
});
