// src/components/PhoneInput.tsx
// Phone number input with a searchable country picker.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  COUNTRY_CODES,
  parsePhoneNumber,
} from 'zopassport';

type Country = (typeof COUNTRY_CODES)[number];

export interface PhoneInputProps {
  /** Current phone number value (digits only). */
  value: string;
  /** Current country code: either dial code ("91") or ISO ("IN"). */
  countryCode: string;
  /** Callback when phone number changes. */
  onChange: (phone: string) => void;
  /** Callback when country changes. Emits the dial code (e.g. "91"). */
  onCountryChange: (code: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Error message. */
  error?: string;
  /** Additional CSS class. */
  className?: string;
}

function resolveCountry(input: string): Country | undefined {
  if (!input) return undefined;
  const upper = input.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    return COUNTRY_CODES.find(c => c.country === upper);
  }
  const cleaned = input.replace(/^\+/, '');
  return COUNTRY_CODES.find(c => c.code === cleaned);
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
  const selectedCountry = resolveCountry(countryCode) ?? COUNTRY_CODES[0];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.code.includes(q.replace(/^\+/, ''))
    );
  }, [query]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = parsePhoneNumber(e.target.value);
    onChange(digits);
  };

  const handleSelect = (country: Country) => {
    onCountryChange(country.code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={`zo-phone-input ${className}`} ref={containerRef}>
      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
        <button
          type="button"
          onClick={() => !disabled && setOpen(o => !o)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            flex: '0 0 auto',
            minWidth: '110px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'white',
            fontFamily: 'Rubik, system-ui, sans-serif',
            fontSize: '14px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span>
            {selectedCountry.flag} +{selectedCountry.code}
          </span>
          <span style={{ opacity: 0.6, fontSize: '10px' }}>▾</span>
        </button>

        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 1,
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

        {open && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 50,
              width: '320px',
              maxHeight: '320px',
              overflow: 'hidden',
              backgroundColor: 'rgba(20, 20, 24, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Rubik, system-ui, sans-serif',
            }}
          >
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search country or code..."
              style={{
                margin: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <div
              style={{
                overflowY: 'auto',
                maxHeight: '260px',
              }}
            >
              {filteredCountries.length === 0 && (
                <div
                  style={{
                    padding: '12px 16px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                  }}
                >
                  No matches.
                </div>
              )}
              {filteredCountries.map(country => {
                const isSelected = country.country === selectedCountry.country;
                return (
                  <button
                    key={country.country}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(country)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: isSelected
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent';
                    }}
                  >
                    <span
                      style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                    >
                      <span style={{ fontSize: '18px' }}>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                    <span style={{ opacity: 0.7, fontSize: '13px' }}>
                      +{country.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
