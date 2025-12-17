// zopassport/react-native
// React Native-specific exports for the Zo Passport SDK
// NOTE: This entry point requires react-native and react-native-reanimated

// =====================
// React Native Components
// =====================

// Wallet components (React Native)
export {
  WalletScreen,
  WalletCard,
  TransactionList,
  TransactionItem,
  MovingShine,
  ZoToken,
  ZoTokenVideo,
} from './components/wallet/index.native';

// =====================
// Types
// =====================

export type {
  WalletCardProps,
  WalletScreenProps,
  WalletUser,
  Transaction,
  TransactionListProps,
  TransactionItemProps,
  MovingShineProps,
} from './lib/types/wallet';

// =====================
// Re-export core SDK (framework-agnostic)
// =====================

export { ZoPassportSDK } from './ZoPassportSDK';
export type { ZoPassportSDKConfig } from './ZoPassportSDK';
export * from './lib/types';

// =====================
// Storage adapters
// =====================

export {
  AsyncStorageAdapter,
  MemoryStorageAdapter,
  STORAGE_KEYS,
  type StorageAdapter,
} from './lib/utils/storage';

