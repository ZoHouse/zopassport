// src/lib/api/profile.ts
// ZO API profile functions

import { ZoApiClient } from './client';
import { StorageAdapter } from '../utils/storage';
import type { ZoProfileResponse, ZoProfileUpdatePayload, ZoErrorResponse } from '../types';

export class ZoProfile {
  constructor(
    private client: ZoApiClient,
    private storage: StorageAdapter
  ) {}

  /**
   * Get user profile
   */
  async getProfile(accessToken: string): Promise<{
    success: boolean;
    profile?: ZoProfileResponse;
    error?: string;
  }> {
    try {
      const response = await this.client.axiosInstance.get<ZoProfileResponse>(
        '/api/v1/profile/me/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: true,
        profile: response.data,
      };
    } catch (error: any) {
      const errorData = error.response?.data as ZoErrorResponse;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || 'Failed to fetch profile',
      };
    }
  }

  /**
   * Update user profile (partial updates supported)
   */
  async updateProfile(
    accessToken: string,
    updates: ZoProfileUpdatePayload
  ): Promise<{
    success: boolean;
    profile?: ZoProfileResponse;
    error?: string;
  }> {
    try {
      const response = await this.client.axiosInstance.post<ZoProfileResponse>(
        '/api/v1/profile/me/',
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: true,
        profile: response.data,
      };
    } catch (error: any) {
      const errorData = error.response?.data as ZoErrorResponse;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || 'Failed to update profile',
      };
    }
  }
}

