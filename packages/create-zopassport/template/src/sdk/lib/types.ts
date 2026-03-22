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
// Booking Types
// =====================

export interface ZoBooking {
  id: string;
  property_name?: string;
  check_in_datetime?: string;
  check_out_datetime?: string;
  booking_status?: string;
  created_at?: string;
}

export interface ZoTrip {
  id: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at?: string;
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
// Culture Types
// =====================

export const ZO_CULTURES = [
  { id: 'travel', name: 'Travel & Adventure', icon: '/Cultural Stickers/Travel&Adventure.png' },
  { id: 'design', name: 'Design', icon: '/Cultural Stickers/Design.png' },
  { id: 'tech', name: 'Science & Technology', icon: '/Cultural Stickers/Science&Technology.png' },
  { id: 'food', name: 'Food', icon: '/Cultural Stickers/Food.png' },
  { id: 'music', name: 'Music & Entertainment', icon: '/Cultural Stickers/Music&Entertainment.png' },
  { id: 'photography', name: 'Photography', icon: '/Cultural Stickers/Photography.png' },
  { id: 'fitness', name: 'Health & Fitness', icon: '/Cultural Stickers/Health&Fitness.png' },
  { id: 'sports', name: 'Sport', icon: '/Cultural Stickers/Sport.png' },
  { id: 'literature', name: 'Literature & Stories', icon: '/Cultural Stickers/Literature&Stories.png' },
  { id: 'cinema', name: 'Television & Cinema', icon: '/Cultural Stickers/Television&Cinema.png' },
  { id: 'spiritual', name: 'Spiritual', icon: '/Cultural Stickers/Spiritual.png' },
  { id: 'nature', name: 'Nature & Wildlife', icon: '/Cultural Stickers/Nature&Wildlife.png' },
  { id: 'business', name: 'Business', icon: '/Cultural Stickers/Business.png' },
  { id: 'law', name: 'Law', icon: '/Cultural Stickers/Law.png' },
  { id: 'lifestyle', name: 'Home & Lifestyle', icon: '/Cultural Stickers/Home&Lifestyle.png' },
  { id: 'gaming', name: 'Game', icon: '/Cultural Stickers/Game.png' },
  { id: 'stories', name: 'Stories & Journal', icon: '/Cultural Stickers/Stories&Journal.png' },
] as const;

export type ZoCultureId = typeof ZO_CULTURES[number]['id'];

// =====================
// Wallet Types
// =====================

export * from './types/wallet';

