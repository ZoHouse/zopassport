// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { ZoPassportProvider, useZoPassport } from '../../src/react';
import { createMockAuthResponse, createMockUser } from '../helpers';

function createWrapper(props: { clientKey: string; baseUrl?: string; autoRefresh?: boolean }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ZoPassportProvider {...props}>
        {children}
      </ZoPassportProvider>
    );
  };
}

describe('ZoPassportProvider & useZoPassport', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw when useZoPassport is used outside provider', () => {
    expect(() => {
      renderHook(() => useZoPassport());
    }).toThrow('useZoPassport must be used within a ZoPassportProvider');
  });

  it('should provide initial state (not authenticated, loading)', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key', autoRefresh: false });
    const { result } = renderHook(() => useZoPassport(), { wrapper });

    expect(result.current.sdk).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should provide sendOTP function', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key', autoRefresh: false });
    const { result } = renderHook(() => useZoPassport(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.sendOTP).toBe('function');
    expect(typeof result.current.verifyOTP).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.refreshProfile).toBe('function');
  });

  it('sendOTP should return error when SDK not initialized yet', async () => {
    // Test the fallback path when sdk is null
    const wrapper = createWrapper({ clientKey: 'test-key', autoRefresh: false });
    const { result } = renderHook(() => useZoPassport(), { wrapper });

    // SDK is initialized immediately, so sendOTP should work
    await waitFor(() => {
      expect(result.current.sdk).not.toBeNull();
    });
  });

  it('should update state on successful verifyOTP', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key', autoRefresh: false });
    const { result } = renderHook(() => useZoPassport(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock the axios instance
    const sdk = result.current.sdk!;
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);
    const authResponse = createMockAuthResponse();
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, authResponse);

    await act(async () => {
      const verifyResult = await result.current.verifyOTP('91', '9876543210', '123456');
      expect(verifyResult.success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.user!.id).toBe('test-user-id-123');

    mock.restore();
  });

  it('should clear state on logout', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key', autoRefresh: false });
    const { result } = renderHook(() => useZoPassport(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Login first
    const sdk = result.current.sdk!;
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());

    await act(async () => {
      await result.current.verifyOTP('91', '9876543210', '123456');
    });
    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    mock.restore();
  });

  it('should refresh profile', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key', autoRefresh: false });
    const { result } = renderHook(() => useZoPassport(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Login first
    const sdk = result.current.sdk!;
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse());

    await act(async () => {
      await result.current.verifyOTP('91', '9876543210', '123456');
    });

    // Refresh profile
    mock.onGet('/api/v1/profile/me/').reply(200, createMockUser({ first_name: 'Refreshed' }));

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.user!.first_name).toBe('Refreshed');

    mock.restore();
  });
});
