// src/lib/api/wallet.ts
// Framework-agnostic Wallet API

import { ZoApiClient } from './client';
import { logger } from '../utils/logger';
import type { BalanceResponse, TransactionsResponse, Transaction } from '../types/wallet';

// $Zo Token Configuration
const ZO_TOKEN_CONFIG = {
    base: {
        rpc: 'https://mainnet.base.org',
        contractAddress: '0x111142c7ecaf39797b7865b82034269962142069', // $Zo token on Base
        decimals: 18,
    },
    avalanche: {
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        contractAddress: '0x111142c7ecaf39797b7865b82034269962142069', // $Zo token on Avalanche (update if different)
        decimals: 18,
    },
};

// ERC-20 balanceOf ABI (minimal)
const ERC20_BALANCE_ABI = '0x70a08231'; // balanceOf(address)

export class ZoWallet {
    private client: ZoApiClient;
    private cachedBalance: number = 0;
    private userWalletAddress: string | null = null;
    private network: 'base' | 'avalanche' = 'base';

    constructor(client: ZoApiClient) {
        this.client = client;
    }

    /**
     * Set the user's wallet address for on-chain queries
     */
    setWalletAddress(address: string, network: 'base' | 'avalanche' = 'base') {
        this.userWalletAddress = address;
        this.network = network;
        logger.debug(`Wallet address set: ${address} on ${network}`);
    }

    /**
     * Get wallet balance - tries on-chain first, then API fallback
     * @returns Wallet balance amount
     */
    async getBalance(): Promise<number> {
        // Try on-chain balance first if wallet address is set
        if (this.userWalletAddress) {
            try {
                const onChainBalance = await this.getOnChainBalance();
                if (onChainBalance !== null) {
                    this.cachedBalance = onChainBalance;
                    return onChainBalance;
                }
            } catch (error) {
                logger.warn('On-chain balance check failed, falling back to API:', error);
            }
        }

        // Fallback to API endpoints
        const apiBalance = await this.getBalanceFromAPI();
        if (apiBalance !== null) {
            return apiBalance;
        }

        // Return cached balance or 0
        logger.debug('Returning cached/default balance:', this.cachedBalance);
        return this.cachedBalance;
    }

    /**
     * Fetch balance directly from blockchain via JSON-RPC
     */
    private async getOnChainBalance(): Promise<number | null> {
        if (!this.userWalletAddress) {
            logger.warn('No wallet address set for on-chain query');
            return null;
        }

        const config = ZO_TOKEN_CONFIG[this.network];

        try {
            // Prepare the eth_call for balanceOf(address)
            const paddedAddress = this.userWalletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
            const data = ERC20_BALANCE_ABI + paddedAddress;

            const response = await fetch(config.rpc, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_call',
                    params: [
                        {
                            to: config.contractAddress,
                            data: data,
                        },
                        'latest',
                    ],
                }),
            });

            const result = await response.json();
            
            if (result.error) {
                logger.warn('RPC error:', result.error);
                return null;
            }

            // Parse the hex balance
            const rawBalance = BigInt(result.result || '0x0');
            const balance = Number(rawBalance) / Math.pow(10, config.decimals);
            
            logger.debug(`On-chain balance fetched: ${balance} $Zo`);
            return balance;
        } catch (error) {
            logger.warn('Failed to fetch on-chain balance:', error);
            return null;
        }
    }

    /**
     * Fetch balance from Zo API endpoints (tries multiple endpoints with fallback)
     */
    private async getBalanceFromAPI(): Promise<number | null> {
        const endpoints = [
            '/api/v1/web3/token/airdrops/summary',
            '/api/v1/wallet/balance',
            '/api/v1/profile/wallet',
        ];

        const errors: Array<{ endpoint: string; status?: number; message: string }> = [];

        for (const endpoint of endpoints) {
            try {
                const response = await this.client.axiosInstance.get<BalanceResponse>(endpoint);
                const balance = response.data?.data?.total_amount 
                    ?? (response.data as any)?.balance
                    ?? (response.data as any)?.total_amount;
                
                if (typeof balance === 'number') {
                    logger.debug(`Balance fetched from API ${endpoint}:`, balance);
                    this.cachedBalance = balance;
                    return balance;
                }
            } catch (error: any) {
                // Collect error info for debugging (skip 404s as they're expected)
                if (error?.response?.status !== 404) {
                    errors.push({
                        endpoint,
                        status: error?.response?.status,
                        message: error?.message || 'Unknown error',
                    });
                }
            }
        }

        // Log aggregated errors if all endpoints failed
        if (errors.length > 0) {
            logger.warn('All balance API endpoints failed:', errors);
        }

        return null;
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
        const endpoints = [
            page ? `/api/v1/profile/completion-grants/claims?page=${page}` : '/api/v1/profile/completion-grants/claims',
            page ? `/api/v1/wallet/transactions?page=${page}` : '/api/v1/wallet/transactions',
        ];

        const errors: Array<{ endpoint: string; status?: number; message: string }> = [];

        for (const url of endpoints) {
            try {
                const response = await this.client.axiosInstance.get<TransactionsResponse>(url);
                // Handle multiple API response formats
                const data = (response.data?.data || response.data) as {
                    results?: Transaction[];
                    transactions?: Transaction[];
                    next?: string;
                    previous?: string;
                    count?: number;
                };
                
                return {
                    transactions: data?.results ?? data?.transactions ?? [],
                    next: data?.next,
                    previous: data?.previous,
                    count: data?.count ?? 0,
                };
            } catch (error: any) {
                // Collect error info for debugging (skip 404s as they're expected)
                if (error?.response?.status !== 404) {
                    errors.push({
                        endpoint: url,
                        status: error?.response?.status,
                        message: error?.message || 'Unknown error',
                    });
                }
            }
        }

        // Log aggregated errors if all endpoints failed
        if (errors.length > 0) {
            logger.warn('All transaction API endpoints failed:', errors);
        }

        // Return empty if all endpoints fail
        return {
            transactions: [],
            next: undefined,
            previous: undefined,
            count: 0,
        };
    }
}
