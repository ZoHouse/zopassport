// Wallet components - Default exports are web-compatible
// For React Native components, import from 'zopassport/react-native'

// Web-compatible exports (default)
export { WalletCardWeb as WalletCard } from './WalletCardWeb';
export { WalletFullPage } from './WalletFullPage';

// Re-export types for convenience
export type { 
  WalletCardProps, 
  WalletScreenProps, 
  WalletUser, 
  Transaction,
} from '../../lib/types/wallet';
