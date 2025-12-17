// src/lib/api/auth.ts
// ZO API authentication functions

import { ZoApiClient } from './client';
import type {
  ZoAuthOTPRequest,
  ZoAuthOTPVerifyRequest,
  ZoAuthResponse,
  ZoErrorResponse,
} from '../types';

export class ZoAuth {
  constructor(private client: ZoApiClient) {}

  /**
   * Send OTP to phone number
   * Step 1 of ZO phone authentication
   */
  async sendOTP(
    countryCode: string,
    phoneNumber: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload: ZoAuthOTPRequest = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        message_channel: '', // Empty string as per ZO API spec
      };

      const response = await this.client.axiosInstance.post(
        '/api/v1/auth/login/mobile/otp/',
        payload
      );

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || 'OTP sent successfully',
        };
      }

      return {
        success: false,
        message: response.data?.message || `Unexpected status: ${response.status}`,
      };
    } catch (error: any) {
      const errorData = error.response?.data as ZoErrorResponse;
      const errorMessage = errorData?.detail || errorData?.message || errorData?.error || error.message || 'Failed to send OTP';

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Verify OTP and authenticate user
   * Step 2 of ZO phone authentication
   * Returns full auth response with tokens and user profile
   */
  async verifyOTP(
    countryCode: string,
    phoneNumber: string,
    otp: string
  ): Promise<{
    success: boolean;
    data?: ZoAuthResponse;
    error?: string;
  }> {
    try {
      const payload: ZoAuthOTPVerifyRequest = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        otp,
      };

      const response = await this.client.axiosInstance.post<ZoAuthResponse>(
        '/api/v1/auth/login/mobile/',
        payload
      );

      // Parse response data if it's a string
      let responseData: ZoAuthResponse;
      if (typeof response.data === 'string') {
        try {
          responseData = JSON.parse(response.data);
        } catch {
          return {
            success: false,
            error: 'Invalid response format from authentication service',
          };
        }
      } else {
        responseData = response.data;
      }

      // Validate response structure
      if (!responseData || !responseData.user || !responseData.access_token) {
        return {
          success: false,
          error: 'Invalid response structure from authentication service',
        };
      }

      // Note: Session storage is handled by ZoPassportSDK.saveSession()
      return {
        success: true,
        data: responseData,
      };
    } catch (error: any) {
      const errorMessage = this.extractErrorMessage(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<{
    success: boolean;
    tokens?: {
      access: string;
      refresh: string;
      access_expiry: string;
      refresh_expiry: string;
    };
    error?: string;
  }> {
    try {
      const response = await this.client.axiosInstance.post('/api/v1/auth/token/refresh/', {
        refresh_token: refreshToken,
      });

      return {
        success: true,
        tokens: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to refresh authentication',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkLoginStatus(accessToken: string): Promise<{
    success: boolean;
    isAuthenticated: boolean;
  }> {
    try {
      const response = await this.client.axiosInstance.get('/api/v1/auth/login/check/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        isAuthenticated: response.data.authenticated === true,
      };
    } catch {
      return {
        success: false,
        isAuthenticated: false,
      };
    }
  }

  /**
   * Extract error message from various ZO API error formats
   */
  private extractErrorMessage(error: any): string {
    const errorData = error.response?.data;

    if (errorData) {
      // Format 1: { success: false, errors: [...] }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        return errorData.errors[0] || 'Invalid OTP';
      }
      // Format 2: { detail: "...", message: "..." }
      if (errorData.detail) return errorData.detail;
      if (errorData.message) return errorData.message;
      // Format 3: { error: "..." }
      if (errorData.error) return errorData.error;
    }

    return 'Authentication failed';
  }
}

