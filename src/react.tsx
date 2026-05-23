// zopassport/react
// React-specific exports for the Zo Passport SDK

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ZoPassportSDK, ZoPassportSDKConfig } from './ZoPassportSDK';
import { executeRecaptcha } from './lib/utils/recaptcha';
import type { ZoUser } from './lib/types';

// Re-export components
export * from './components';

// Re-export hooks
export * from './hooks';

// Re-export types
export * from './lib/types';

// =====================
// Context
// =====================

interface ZoPassportContextValue {
  sdk: ZoPassportSDK | null;
  user: ZoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOTP: (countryCode: string, phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (countryCode: string, phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ZoPassportContext = createContext<ZoPassportContextValue | null>(null);

// =====================
// Provider
// =====================

export interface ZoPassportProviderProps {
  children: ReactNode;
  clientKey: string;
  baseUrl?: string;
  autoRefresh?: boolean;
  /**
   * Google reCAPTCHA v3 site key. When set, the Provider's `sendOTP` wrapper
   * automatically loads grecaptcha, runs `execute(siteKey, { action: 'request_otp' })`,
   * and forwards the token to the backend. Required for the built-in
   * `<ZoAuth>` / `<ZoLanding>` components to work, since the backend now
   * requires a captcha token on every OTP request.
   */
  recaptchaSiteKey?: string;
}

export function ZoPassportProvider({
  children,
  clientKey,
  baseUrl,
  autoRefresh = true,
  recaptchaSiteKey,
}: ZoPassportProviderProps) {
  const [sdk, setSdk] = useState<ZoPassportSDK | null>(null);
  const [user, setUser] = useState<ZoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize SDK
  useEffect(() => {
    const passportSdk = new ZoPassportSDK({
      clientKey,
      baseUrl,
      autoRefresh,
    });

    setSdk(passportSdk);

    // Load existing session - must await ready() first to ensure session is loaded from storage
    const loadSession = async () => {
      setIsLoading(true);
      try {
        // Wait for SDK to finish loading session from storage
        await passportSdk.ready();
        
        if (passportSdk.isAuthenticated) {
          const profile = await passportSdk.getProfile();
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('[ZoPassport] Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    return () => {
      passportSdk.destroy();
    };
  }, [clientKey, baseUrl, autoRefresh]);

  // Send OTP. The backend requires a Google reCAPTCHA v3 token; if
  // `recaptchaSiteKey` was passed to the Provider we resolve it here so
  // callers (and built-in components) don't have to.
  const sendOTP = async (countryCode: string, phoneNumber: string) => {
    if (!sdk) return { success: false, message: 'SDK not initialized' };
    if (!recaptchaSiteKey) {
      return {
        success: false,
        message: 'ZoPassportProvider: recaptchaSiteKey is required for OTP. Pass it as a prop or call sdk.auth.sendOTP(cc, phone, captchaToken) directly.',
      };
    }
    try {
      const captchaToken = await executeRecaptcha(recaptchaSiteKey, 'request_otp');
      return sdk.auth.sendOTP(countryCode, phoneNumber, captchaToken);
    } catch (err: any) {
      return { success: false, message: err?.message || 'reCAPTCHA failed' };
    }
  };

  // Verify OTP
  const verifyOTP = async (countryCode: string, phoneNumber: string, otp: string) => {
    if (!sdk) return { success: false, error: 'SDK not initialized' };
    
    const result = await sdk.loginWithPhone(countryCode, phoneNumber, otp);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  // Logout
  const logout = async () => {
    if (!sdk) return;
    await sdk.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (!sdk) return;
    const profile = await sdk.getProfile();
    if (profile) {
      setUser(profile);
    }
  };

  const value: ZoPassportContextValue = {
    sdk,
    user,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile,
  };

  return (
    <ZoPassportContext.Provider value={value}>
      {children}
    </ZoPassportContext.Provider>
  );
}

// =====================
// Hook
// =====================

export function useZoPassport(): ZoPassportContextValue {
  const context = useContext(ZoPassportContext);
  if (!context) {
    throw new Error('useZoPassport must be used within a ZoPassportProvider');
  }
  return context;
}

// =====================
// Re-export SDK
// =====================

export { ZoPassportSDK } from './ZoPassportSDK';

