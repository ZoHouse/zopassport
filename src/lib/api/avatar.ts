// src/lib/api/avatar.ts
// ZO API avatar generation functions

import { ZoApiClient } from './client';
import type {
  ZoAvatarGenerateRequest,
  ZoAvatarGenerateResponse,
  ZoAvatarStatusResponse,
  ZoErrorResponse,
} from '../types';

export class ZoAvatar {
  constructor(private client: ZoApiClient) {}

  /**
   * Generate avatar for user
   */
  async generateAvatar(
    accessToken: string,
    bodyType: 'bro' | 'bae'
  ): Promise<{
    success: boolean;
    task_id?: string;
    status?: string;
    error?: string;
  }> {
    try {
      const payload: ZoAvatarGenerateRequest = {
        body_type: bodyType,
      };

      const response = await this.client.axiosInstance.post<ZoAvatarGenerateResponse>(
        '/api/v1/avatar/generate/',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: true,
        task_id: response.data.task_id,
        status: response.data.status,
      };
    } catch (error: any) {
      const errorData = error.response?.data as ZoErrorResponse;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || 'Failed to generate avatar',
      };
    }
  }

  /**
   * Check avatar generation status
   */
  async getAvatarStatus(
    accessToken: string,
    taskId: string
  ): Promise<{
    success: boolean;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    avatarUrl?: string;
    error?: string;
  }> {
    try {
      const response = await this.client.axiosInstance.get<ZoAvatarStatusResponse>(
        `/api/v1/avatar/status/${taskId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        avatarUrl: response.data.result?.avatar_url,
      };
    } catch (error: any) {
      const errorData = error.response?.data as ZoErrorResponse;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || 'Failed to get avatar status',
      };
    }
  }

  /**
   * Poll avatar status until completion
   */
  async pollAvatarStatus(
    accessToken: string,
    taskId: string,
    options: {
      onProgress?: (status: string) => void;
      onComplete?: (avatarUrl: string) => void;
      onError?: (error: string) => void;
      maxAttempts?: number;
      interval?: number;
    } = {}
  ): Promise<void> {
    const {
      onProgress,
      onComplete,
      onError,
      maxAttempts = 30,
      interval = 2000,
    } = options;

    let attempts = 0;

    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        const timeoutError = 'Avatar generation timed out';
        onError?.(timeoutError);
        return;
      }

      const result = await this.getAvatarStatus(accessToken, taskId);

      if (!result.success) {
        onError?.(result.error || 'Unknown error');
        return;
      }

      onProgress?.(result.status || 'unknown');

      if (result.status === 'completed' && result.avatarUrl) {
        onComplete?.(result.avatarUrl);
        return;
      }

      if (result.status === 'failed') {
        onError?.('Avatar generation failed');
        return;
      }

      // Continue polling
      setTimeout(poll, interval);
    };

    poll();
  }
}

