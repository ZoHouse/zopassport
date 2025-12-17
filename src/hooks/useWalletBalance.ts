// Wallet Balance Hook - Extracted from Zostel app
import { useState, useEffect, useCallback } from 'react';
import type { AxiosInstance } from 'axios';

// Minimal interface for API client (Axios-compatible)
interface ApiClient {
  get: AxiosInstance['get'];
}

interface UseWalletBalanceOptions {
  autoRefetch?: boolean;
  refetchInterval?: number;
}

/**
 * Hook to fetch wallet balance
 * Uses API: GET /api/v1/web3/token/airdrops/summary
 * 
 * @param apiClient - Axios instance or compatible client with .get() method
 * @param options - Configuration options
 */
export const useWalletBalance = (
  apiClient?: ApiClient | null,
  options?: UseWalletBalanceOptions
) => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!apiClient) {
      setError(new Error('API client not provided'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/v1/web3/token/airdrops/summary');
      const amount = response.data?.data?.total_amount ?? 0;
      setBalance(amount);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchBalance();

    // Auto-refetch if enabled
    if (options?.autoRefetch) {
      const interval = setInterval(fetchBalance, options.refetchInterval || 30000);
      return () => clearInterval(interval);
    }
  }, [fetchBalance, options?.autoRefetch, options?.refetchInterval]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
};
