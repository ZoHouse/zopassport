// src/components/PhoneInput.tsx
// Phone number input with country code selector

import React, { useState } from 'react';
import { COUNTRY_CODES, parsePhoneNumber } from '../lib/utils/phone';

export interface PhoneInputProps {
  /** Current phone number value */
  value: string;
  /** Current country code (without +) */
  countryCode: string;
  /** Callback when phone number changes */
  onChange: (phone: string) => void;
  /** Callback when country code changes */
  onCountryChange: (code: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Additional CSS class */
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  countryCode,
  onChange,
  onCountryChange,
  placeholder = '555-123-4567',
  disabled = false,
  error,
  className = '',
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = parsePhoneNumber(e.target.value);
    onChange(digits);
  };

  return (
    <div className={`zo-phone-input ${className}`}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Country Code Selector */}
        <select
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          disabled={disabled}
          style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'white',
            fontFamily: 'Rubik, system-ui, sans-serif',
            fontSize: '14px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code} style={{ backgroundColor: 'black' }}>
              {country.flag} +{country.code}
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: error
              ? '1px solid #ef4444'
              : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'white',
            fontFamily: 'Rubik, system-ui, sans-serif',
            fontSize: '14px',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p
          style={{
            color: '#ef4444',
            fontSize: '14px',
            marginTop: '8px',
            fontFamily: 'Rubik, system-ui, sans-serif',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

