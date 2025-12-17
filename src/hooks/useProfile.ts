// src/hooks/useProfile.ts
// Hook for profile operations

import { useState, useCallback, useEffect } from 'react';
import { useZoPassport } from '../react';
import type { ZoUser, ZoProfileUpdatePayload } from '../lib/types';

export function useProfile() {
  const { sdk, user, isAuthenticated, refreshProfile } = useZoPassport();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile completion calculation
  const completion = user ? calculateCompletion(user) : { done: 0, total: 10, percentage: 0 };

  // Founder status
  const isFounder = user?.membership === 'founder';

  // Update profile
  const updateProfile = useCallback(async (updates: ZoProfileUpdatePayload) => {
    if (!sdk) return { success: false, error: 'SDK not initialized' };

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.updateProfile(updates);
      if (!result.success) {
        setError(result.error || 'Failed to update profile');
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  // Refresh profile
  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    completion,
    isFounder,
    updateProfile,
    reload,
  };
}

// Helper function to calculate profile completion
function calculateCompletion(user: ZoUser): { done: number; total: number; percentage: number } {
  const fields = [
    user.first_name,
    user.last_name,
    user.bio,
    user.date_of_birth,
    user.place_name,
    user.body_type,
    user.pfp_image,
    user.email_address,
    user.wallet_address,
    (user.cultures?.length ?? 0) > 0,
  ];

  const done = fields.filter(f => !!f).length;
  const total = fields.length;
  const percentage = Math.round((done / total) * 100);

  return { done, total, percentage };
}

