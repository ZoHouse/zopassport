// src/lib/types/avatar.ts
// Avatar-related types

export interface ZoAvatarGenerateRequest {
  body_type: 'bro' | 'bae';
}

export interface ZoAvatarGenerateResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
}

export interface ZoAvatarStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    avatar_url: string;
  };
  error?: string;
}

