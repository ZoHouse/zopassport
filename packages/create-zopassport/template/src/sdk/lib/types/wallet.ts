// src/lib/types/wallet.ts
// Wallet-related types

// Existing wallet types
export interface ZoWallet {
  address: string;
  network: 'base' | 'avalanche';
  balance?: number;
}

export interface ZoTokenBalanceResponse {
  balance: number;
  currency: {
    name: string;
    symbol: string;
  };
}

// Wallet balance and transaction types
export interface WalletBalance {
  total_amount: number;
  currency: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  updated_at: string;
  amount: number;
  description: string;
  claimed_at: string;
  grant: {
    id: string;
    name: string;
    description: string;
  };
  action: 'deposit' | 'spend';
}

export interface WalletUser {
  avatar?: {
    image: string;
  };
  first_name: string;
  nickname?: string;
  wallet_address: string;
}

// API Response types
export interface BalanceResponse {
  data: {
    total_amount: number;
  };
}

export interface TransactionsResponse {
  data: {
    results: Transaction[];
    next?: string;
    previous?: string;
    count: number;
  };
}

// Formatted types for display
export interface FormattedTransaction {
  id: string;
  description: string;
  amount: string;
  date: string;
  timestamp: string;
  action: 'deposit' | 'spend';
  color: string;
}

// React Component Props (optional, for React components)
export interface WalletCardProps {
  balance: number;
  user: WalletUser;
  isOpen?: boolean;
  onToggle?: () => void;
  isLoading?: boolean;
}

export interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
}

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEndReached?: () => void;
}

export interface MovingShineProps {
  duration?: number;
}

export interface WalletScreenProps {
  onBack?: () => void;
}

