// src/components/ZoAuth.tsx
// Complete phone OTP authentication flow component

import React, { useState, useEffect } from 'react';
import { PhoneInput } from './PhoneInput';
import { OTPInput } from './OTPInput';

import type { ZoUser } from '../lib/types';

export interface ZoAuthProps {
  /** Callback when auth is successful */
  onSuccess: (userId: string, user: any) => void;
  /** Callback to close modal */
  onClose?: () => void;
  /** Send OTP function (from SDK) */
  sendOTP: (countryCode: string, phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  /** Verify OTP function (from SDK) */
  verifyOTP: (countryCode: string, phoneNumber: string, otp: string) => Promise<{ success: boolean; user?: ZoUser; error?: string }>;
  /** Default country code (default: '91') */
  defaultCountryCode?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Additional CSS class */
  className?: string;
}

type Step = 'phone' | 'otp';

export const ZoAuth: React.FC<ZoAuthProps> = ({
  onSuccess,
  onClose,
  sendOTP,
  verifyOTP,
  defaultCountryCode = '91',
  showCloseButton = true,
  className = '',
}) => {
  const [step, setStep] = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendOTP(countryCode, phoneNumber);

      if (result.success) {
        setStep('otp');
        setResendCooldown(60);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otpString: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOTP(countryCode, phoneNumber, otpString);

      if (result.success && result.user) {
        onSuccess(result.user.id || '', result.user);
      } else {
        setError(result.error || 'Invalid verification code');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '24px',
    padding: '24px 32px',
    fontFamily: 'Rubik, system-ui, sans-serif',
  };

  return (
    <div className={`zo-auth ${className}`} style={containerStyle}>
      {/* Close Button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Step 1: Phone Input */}
      {step === 'phone' && (
        <div>
          {/* Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>

          {/* Title */}
          <h2
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '8px',
              fontFamily: 'Syne, system-ui, sans-serif',
            }}
          >
            Enter Your Phone Number
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            We'll send you a verification code
          </p>

          {/* Phone Input */}
          <PhoneInput
            value={phoneNumber}
            countryCode={countryCode}
            onChange={setPhoneNumber}
            onCountryChange={setCountryCode}
            disabled={isLoading}
            error={error || undefined}
          />

          {/* Send Button */}
          <button
            onClick={handleSendOTP}
            disabled={isLoading || phoneNumber.length < 10}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'black',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 500,
              fontSize: '16px',
              cursor: isLoading || phoneNumber.length < 10 ? 'not-allowed' : 'pointer',
              opacity: isLoading || phoneNumber.length < 10 ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Sending Code...' : 'Send Code'}
          </button>
        </div>
      )}

      {/* Step 2: OTP Input */}
      {step === 'otp' && (
        <div>
          {/* Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title */}
          <h2
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '8px',
              fontFamily: 'Syne, system-ui, sans-serif',
            }}
          >
            Enter Verification Code
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            We sent a code to +{countryCode} {phoneNumber}
          </p>

          {/* OTP Input */}
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={handleVerifyOTP}
            disabled={isLoading}
            error={error || undefined}
          />

          {/* Verify Button */}
          <button
            onClick={() => handleVerifyOTP(otp.join(''))}
            disabled={isLoading || otp.some(d => !d)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'black',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 500,
              fontSize: '16px',
              cursor: isLoading || otp.some(d => !d) ? 'not-allowed' : 'pointer',
              opacity: isLoading || otp.some(d => !d) ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          {/* Resend Link */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={handleResendOTP}
              disabled={resendCooldown > 0}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                opacity: resendCooldown > 0 ? 0.5 : 1,
              }}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive? Resend code"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

