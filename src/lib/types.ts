// src/lib/types.ts
// TypeScript types for Zo Passport SDK

// =====================
// User & Profile Types
// =====================

export interface ZoUser {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  date_of_birth?: string;
  place_name?: string;
  body_type?: 'bro' | 'bae';
  pfp_image?: string;
  email_address?: string;
  mobile_country_code?: string;
  mobile_number?: string;
  wallet_address?: string;
  membership?: 'citizen' | 'founder';
  cultures?: string[];
  avatar?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    image?: string;
  };
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ZoProfileResponse {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  date_of_birth?: string;
  location?: {
    place_name?: string;
    latitude?: number;
    longitude?: number;
  };
  body_type?: 'bro' | 'bae';
  pfp_image?: string;
  email_address?: string;
  mobile_country_code?: string;
  mobile_number?: string;
  wallet_address?: string;
  zo_membership?: string;
  cultures?: string[];
  avatar?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    image?: string;
  };
  founder_nfts?: any[];
  founder_nfts_count?: number;
  role?: string;
}

export interface ZoProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  bio?: string;
  date_of_birth?: string;
  place_name?: string;
  body_type?: 'bro' | 'bae';
  pfp_image?: string;
  cultures?: string[];
}

// =====================
// Auth Types
// =====================

export interface ZoAuthOTPRequest {
  mobile_country_code: string;
  mobile_number: string;
  message_channel: string;
}

export interface ZoAuthOTPVerifyRequest {
  mobile_country_code: string;
  mobile_number: string;
  otp: string;
}

export interface ZoAuthResponse {
  user: ZoUser;
  access_token: string;
  refresh_token: string;
  access_token_expiry: string;
  refresh_token_expiry: string;
  device_id?: string;
  device_secret?: string;
}

export interface ZoTokenRefreshResponse {
  access: string;
  refresh: string;
  access_expiry: string;
  refresh_expiry: string;
}

// =====================
// Avatar Types
// =====================

export interface ZoAvatarGenerateRequest {
  body_type: 'bro' | 'bae';
}

export interface ZoAvatarGenerateResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ZoAvatarStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    avatar_url?: string;
  };
}

// =====================
// Error Types
// =====================

export interface ZoErrorResponse {
  success?: boolean;
  error?: string;
  message?: string;
  detail?: string;
  errors?: string[];
}

// =====================
// Component Props Types
// =====================

export interface ZoPassportProfile {
  avatar?: string;
  name?: string;
  isFounder?: boolean;
}

export interface ZoPassportCompletion {
  done: number;
  total: number;
}

// =====================
// Culture Types (re-exported from assets/index.ts)
// =====================

// Note: CULTURES and CULTURE_STICKERS are exported from assets/index.ts
// Import them via: import { CULTURES, CULTURE_STICKERS, CultureId } from 'zopassport/assets'

// =====================
// Wallet Types
// =====================

export * from './types/wallet';

