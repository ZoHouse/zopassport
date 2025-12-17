// src/hooks/useAvatar.ts
// Hook for avatar operations

import { useState, useCallback } from 'react';
import { useZoPassport } from '../react';

export function useAvatar() {
  const { sdk, user, refreshProfile } = useZoPassport();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Current avatar URL
  const avatarUrl = user?.avatar?.image || user?.pfp_image;

  // Avatar status
  const avatarStatus = user?.avatar?.status || 'completed';

  // Generate avatar
  const generateAvatar = useCallback(async (bodyType: 'bro' | 'bae') => {
    if (!sdk) return { success: false, error: 'SDK not initialized' };

    setIsGenerating(true);
    setProgress('pending');
    setError(null);

    try {
      const result = await sdk.generateAvatar(bodyType);
      
      if (result.success) {
        // Refresh profile to get new avatar
        await refreshProfile();
      } else {
        setError(result.error || 'Failed to generate avatar');
      }

      return result;
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, [sdk, refreshProfile]);

  return {
    avatarUrl,
    avatarStatus,
    isGenerating,
    progress,
    error,
    generateAvatar,
  };
}

