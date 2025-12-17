// src/lib/api/wallet.ts
// Framework-agnostic Wallet API

import { ZoApiClient } from './client';
import type { BalanceResponse, TransactionsResponse, Transaction } from '../types/wallet';

export class ZoWallet {
    private client: ZoApiClient;

    constructor(client: ZoApiClient) {
        this.client = client;
    }

    /**
     * Get wallet balance
     * @returns Wallet balance amount
     */
    async getBalance(): Promise<number> {
        try {
            const response = await this.client.axiosInstance.get<BalanceResponse>(
                '/api/v1/web3/token/airdrops/summary'
            );
            return response.data?.data?.total_amount ?? 0;
        } catch (error) {
            console.error('[ZoWallet] Failed to fetch balance:', error);
            throw error;
        }
    }

    /**
     * Get transaction history
     * @param page - Optional page number for pagination
     * @returns Array of transactions
     */
    async getTransactions(page?: number): Promise<{
        transactions: Transaction[];
        next?: string;
        previous?: string;
        count: number;
    }> {
        try {
            const url = page
                ? `/api/v1/profile/completion-grants/claims?page=${page}`
                : '/api/v1/profile/completion-grants/claims';

            const response = await this.client.axiosInstance.get<TransactionsResponse>(url);

            return {
                transactions: response.data?.data?.results ?? [],
                next: response.data?.data?.next,
                previous: response.data?.data?.previous,
                count: response.data?.data?.count ?? 0,
            };
        } catch (error) {
            console.error('[ZoWallet] Failed to fetch transactions:', error);
            throw error;
        }
    }
}
