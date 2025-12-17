// Web-compatible wallet component exports
// These components use CSS and DOM APIs, safe for web environments

export { WalletCardWeb as WalletCard } from './WalletCardWeb';
export { WalletFullPage } from './WalletFullPage';

// Re-export types
export type { WalletCardProps, WalletScreenProps, WalletUser, Transaction } from '../../lib/types/wallet';

