// src/hooks/useAuth.ts
// Hook for authentication state and operations

import { useState, useCallback } from 'react';
import { useZoPassport } from '../react';

export function useAuth() {
  const { sdk, user, isAuthenticated, isLoading, sendOTP, verifyOTP, logout } = useZoPassport();
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('91');

  const handleSendOTP = useCallback(async (code: string, phone: string) => {
    setCountryCode(code);
    setPhoneNumber(phone);
    const result = await sendOTP(code, phone);
    if (result.success) {
      setOtpSent(true);
    }
    return result;
  }, [sendOTP]);

  const handleVerifyOTP = useCallback(async (otp: string) => {
    const result = await verifyOTP(countryCode, phoneNumber, otp);
    if (result.success) {
      setOtpSent(false);
    }
    return result;
  }, [verifyOTP, countryCode, phoneNumber]);

  const handleLogout = useCallback(async () => {
    await logout();
    setOtpSent(false);
    setPhoneNumber('');
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    otpSent,
    phoneNumber,
    countryCode,
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    logout: handleLogout,
  };
}

