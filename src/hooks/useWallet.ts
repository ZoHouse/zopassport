// Combined Wallet Hook - Extracted from Zostel app
import { useCallback } from 'react';
import type { AxiosInstance } from 'axios';
import { useWalletBalance } from './useWalletBalance';
import { useTransactions } from './useTransactions';

// Minimal interface for API client (Axios-compatible)
interface ApiClient {
  get: AxiosInstance['get'];
}

interface UseWalletOptions {
  autoRefetch?: boolean;
  refetchInterval?: number;
}

/**
 * Combined hook for wallet functionality
 * Fetches both balance and transactions
 * 
 * @param apiClient - Axios instance or compatible client with .get() method
 * @param options - Configuration options
 */
export const useWallet = (
  apiClient?: ApiClient | null,
  options?: UseWalletOptions
) => {
  const {
    balance,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance,
  } = useWalletBalance(apiClient, options);

  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
    loadMore,
  } = useTransactions(apiClient, options);

  const isLoading = isLoadingBalance || isLoadingTransactions;
  const error = balanceError || transactionsError;

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchBalance(), refetchTransactions()]);
  }, [refetchBalance, refetchTransactions]);

  return {
    balance,
    transactions,
    isLoading,
    error,
    refetch: refetchAll,
    loadMore,
  };
};
