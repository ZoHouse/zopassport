// src/components/OTPInput.tsx
// 6-digit OTP input component

import React, { useRef, useEffect } from 'react';

export interface OTPInputProps {
  /** Current OTP value array */
  value: string[];
  /** Callback when OTP changes */
  onChange: (otp: string[]) => void;
  /** Callback when all 6 digits entered */
  onComplete?: (otp: string) => void;
  /** Number of digits (default: 6) */
  length?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Auto-focus first input */
  autoFocus?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  error,
  autoFocus = true,
  className = '',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    if (inputValue && !/^\d$/.test(inputValue)) return;

    const newOtp = [...value];
    newOtp[index] = inputValue;
    onChange(newOtp);

    // Auto-focus next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newOtp.every(digit => digit !== '') && index === length - 1) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: move to previous input
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    const digits = pastedData.replace(/\D/g, '').split('');
    
    if (digits.length > 0) {
      const newOtp = [...value];
      digits.forEach((digit, i) => {
        if (i < length) newOtp[i] = digit;
      });
      onChange(newOtp);
      
      // Focus last filled input or the one after
      const focusIndex = Math.min(digits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      
      if (newOtp.every(digit => digit !== '')) {
        onComplete?.(newOtp.join(''));
      }
    }
  };

  return (
    <div className={`zo-otp-input ${className}`}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              width: '48px',
              height: '56px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: error
                ? '1px solid #ef4444'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontFamily: 'Rubik, system-ui, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p
          style={{
            color: '#ef4444',
            fontSize: '14px',
            marginTop: '8px',
            textAlign: 'center',
            fontFamily: 'Rubik, system-ui, sans-serif',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

