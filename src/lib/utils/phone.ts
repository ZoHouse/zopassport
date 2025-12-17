// src/lib/utils/phone.ts
// Phone number formatting utilities

export const COUNTRY_CODES = [
  { code: '1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: '60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: '63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
] as const;

/**
 * Format phone number for display
 * e.g., "5551234567" → "555-123-4567"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return cleaned;
}

/**
 * Parse phone number to clean digits only
 * Removes all non-digit characters
 */
export function parsePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

