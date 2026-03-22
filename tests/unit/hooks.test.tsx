// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { ZoPassportProvider, useZoPassport } from '../../src/react';
import { useAuth } from '../../src/hooks/useAuth';
import { useProfile } from '../../src/hooks/useProfile';
import { useAvatar } from '../../src/hooks/useAvatar';
import { createMockAuthResponse, createMockUser } from '../helpers';

function createWrapper(props: { clientKey: string }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ZoPassportProvider clientKey={props.clientKey} autoRefresh={false}>
        {children}
      </ZoPassportProvider>
    );
  };
}

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('should expose auth state and methods', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.otpSent).toBe(false);
    expect(result.current.countryCode).toBe('91');
    expect(typeof result.current.sendOTP).toBe('function');
    expect(typeof result.current.verifyOTP).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should update otpSent on successful sendOTP', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => {
      const passport = useZoPassport();
      const auth = useAuth();
      return { passport, auth };
    }, { wrapper });

    await waitFor(() => {
      expect(result.current.passport.isLoading).toBe(false);
    });

    const sdk = result.current.passport.sdk!;
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);
    mock.onPost('/api/v1/auth/login/mobile/otp/').reply(200, {
      message: 'OTP sent',
    });

    await act(async () => {
      const res = await result.current.auth.sendOTP('91', '9876543210');
      expect(res.success).toBe(true);
    });

    expect(result.current.auth.otpSent).toBe(true);
    expect(result.current.auth.phoneNumber).toBe('9876543210');
    expect(result.current.auth.countryCode).toBe('91');

    mock.restore();
  });

  it('should handle logout and reset state', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.otpSent).toBe(false);
    expect(result.current.phoneNumber).toBe('');
  });
});

describe('useProfile hook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('should expose profile state', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(typeof result.current.updateProfile).toBe('function');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isFounder).toBe(false);
    expect(result.current.completion).toEqual({ done: 0, total: 10, percentage: 0 });
  });

  it('should calculate completion for authenticated user', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => {
      const passport = useZoPassport();
      const profile = useProfile();
      return { passport, profile };
    }, { wrapper });

    await waitFor(() => {
      expect(result.current.passport.isLoading).toBe(false);
    });

    // Login
    const sdk = result.current.passport.sdk!;
    const mock = new MockAdapter(sdk.auth['client'].axiosInstance);
    mock.onPost('/api/v1/auth/login/mobile/').reply(200, createMockAuthResponse({
      user: createMockUser({
        first_name: 'Test',
        last_name: 'User',
        bio: 'Bio',
        membership: 'founder',
      }),
    }));

    await act(async () => {
      await result.current.passport.verifyOTP('91', '9876543210', '123456');
    });

    expect(result.current.profile.isFounder).toBe(true);
    expect(result.current.profile.completion.done).toBeGreaterThan(0);
    expect(result.current.profile.completion.total).toBe(10);

    mock.restore();
  });

  it('should return error when updating profile without SDK', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(typeof result.current.updateProfile).toBe('function');
    });

    // updateProfile calls sdk.updateProfile which returns "Not authenticated"
    const res = await result.current.updateProfile({ first_name: 'Test' });
    expect(res.success).toBe(false);
  });
});

describe('useAvatar hook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('should expose avatar state', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => useAvatar(), { wrapper });

    await waitFor(() => {
      expect(typeof result.current.generateAvatar).toBe('function');
    });

    expect(result.current.avatarUrl).toBeUndefined();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.progress).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return error when generating avatar without authentication', async () => {
    const wrapper = createWrapper({ clientKey: 'test-key' });
    const { result } = renderHook(() => useAvatar(), { wrapper });

    await waitFor(() => {
      expect(typeof result.current.generateAvatar).toBe('function');
    });

    let genResult: any;
    await act(async () => {
      genResult = await result.current.generateAvatar('bro');
    });

    expect(genResult.success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});
