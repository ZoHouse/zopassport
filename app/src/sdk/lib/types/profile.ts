// src/lib/types/profile.ts
// Profile-related types

import { ZoUser } from './auth';

export interface ZoProfileResponse extends ZoUser {
  mobile_country_code: string;
}

export interface ZoProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  bio?: string;
  date_of_birth?: string;
  place_name?: string;
  body_type?: 'bro' | 'bae';
}

