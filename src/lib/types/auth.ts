// src/lib/types/auth.ts
// Authentication-related types

export interface ZoAuthOTPRequest {
  mobile_country_code: string;
  mobile_number: string;
  message_channel?: string;
  // Google reCAPTCHA v3 token. Required by backend; obtain via
  // grecaptcha.execute(siteKey, { action: 'request_otp' }) or the
  // executeRecaptcha() helper exported from this package.
  captcha_response_token: string;
}

export interface ZoAuthOTPVerifyRequest {
  mobile_country_code: string;
  mobile_number: string;
  otp: string;
}

export interface ZoAuthTokens {
  access: string;
  refresh: string;
  access_expiry: string;
  refresh_expiry: string;
}

export interface ZoAuthResponse {
  // Legacy fields (for backward compatibility)
  token: string;  // Same as access_token
  valid_till: string;  // Same as access_token_expiry
  
  // Current fields
  access_token: string;
  access_token_expiry: string;
  refresh_token: string;
  refresh_token_expiry: string;
  client_key: string;
  device_id: string;
  device_secret: string;
  device_info: Record<string, any>;
  user: ZoUser;
}

export interface ZoUser {
  id: string;  // UUID
  pid: string;  // PID123
  first_name: string;
  last_name: string;
  mobile_number: string;
  email_address: string;
  date_of_birth: string | null;
  bio: string;
  pfp_image: string;
  wallet_address: string;  // Auto-provisioned during auth
  membership: 'founder' | 'citizen' | 'none';
  body_type: 'bro' | 'bae';
  place_name: string;
  home_location: {
    lat: number;
    lng: number;
  } | null;
  cultures: Array<{
    key: string;
    name: string;
    icon: string;
    description: string;
  }>;
  founder_tokens: string[];  // Array of token IDs like ["523", "204"]
  avatar?: {
    image: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
}

export interface ZoErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
  errors?: string[];
  success?: boolean;
}

