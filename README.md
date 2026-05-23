# Zo Passport SDK

> Phone OTP &rarr; Avatar &rarr; Passport &rarr; Wallet

Complete authentication, onboarding, and wallet integration for [Zo World](https://zo.xyz) applications.

> **Important — Client Key Required**
>
> You **must** obtain a client key from the Zo World team before using this SDK.
> The SDK will throw a `ZoConfigError` at initialization if the key is missing.
> Request yours at **[zo.xyz/developers](https://zo.xyz/developers)**.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [SDK API Reference](#sdk-api-reference)
- [React Integration](#react-integration)
- [React Native](#react-native)
- [Error Handling](#error-handling)
- [Storage Adapters](#storage-adapters)
- [TypeScript](#typescript)
- [Testing](#testing)
- [Vite Configuration](#vite-configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install zopassport
```

Or scaffold a complete demo app instantly:

```bash
npx create-zopassport my-app
cd my-app
cp .env.example .env   # paste your client key
npm install && npm run dev
```

---

## Quick Start

```ts
import { ZoPassportSDK, executeRecaptcha } from 'zopassport';

const sdk = new ZoPassportSDK({
  clientKey: 'your-client-key',   // required
  autoRefresh: true,               // auto-refresh tokens (default: true)
});

// Wait for any existing session to load from storage
await sdk.ready();

// Step 1: resolve reCAPTCHA v3 token, then send OTP.
// Backend requires a captcha_response_token on every OTP request.
const captchaToken = await executeRecaptcha(RECAPTCHA_SITE_KEY, 'request_otp');
await sdk.auth.sendOTP('91', '9876543210', captchaToken);

// Step 2 — Verify OTP & log in
const { success, user, error } = await sdk.loginWithPhone('91', '9876543210', '123456');

if (success) {
  console.log('Welcome', user.first_name);
}
```

> **reCAPTCHA is required.** The Zo backend rejects OTP requests without a Google reCAPTCHA v3 response token. Web apps can use the bundled `executeRecaptcha()` helper, or pass a token from their own grecaptcha integration. React Native apps run their platform's captcha SDK and pass the token directly to `sdk.auth.sendOTP(...)`.

---

## SDK API Reference

### `new ZoPassportSDK(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientKey` | `string` | *required* | Your Zo API client key |
| `baseUrl` | `string` | `https://api.io.zo.xyz` | API base URL |
| `timeout` | `number` | `10000` | Request timeout (ms) |
| `storageAdapter` | `StorageAdapter` | `LocalStorageAdapter` | Token persistence layer |
| `autoRefresh` | `boolean` | `true` | Auto-refresh tokens before expiry |
| `refreshInterval` | `number` | `60000` | Token refresh check interval (ms) |
| `debug` | `boolean` | `false` | Log debug info to console |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `sdk.user` | `ZoUser \| null` | Current authenticated user |
| `sdk.isAuthenticated` | `boolean` | Whether a session is active |

### Methods

#### `sdk.ready(): Promise<void>`
Wait for session restoration from storage. Call before checking `isAuthenticated`.

#### `sdk.auth.sendOTP(countryCode, phoneNumber, captchaToken): Promise<Result>`
Send an OTP to the given phone number. `captchaToken` is a Google reCAPTCHA v3 response token, required by the backend on every request.

```ts
const token = await executeRecaptcha(RECAPTCHA_SITE_KEY, 'request_otp');
await sdk.auth.sendOTP('91', '9876543210', token);
```

#### `sdk.loginWithPhone(countryCode, phoneNumber, otp): Promise<Result>`
Full OTP verification + session save + wallet setup.

```ts
const { success, user, error } = await sdk.loginWithPhone('91', '9876543210', '123456');
```

#### `sdk.logout(): Promise<void>`
Clear all tokens, user data, and stop auto-refresh.

#### `sdk.getProfile(): Promise<ZoUser | null>`
Fetch the latest profile from the API.

#### `sdk.updateProfile(updates): Promise<Result>`
Partial profile update.

```ts
await sdk.updateProfile({ first_name: 'Samurai', bio: 'Explorer', body_type: 'bro' });
```

#### `sdk.generateAvatar(bodyType): Promise<Result>`
Generate an AI avatar. Polls until completion.

```ts
const { success, avatarUrl } = await sdk.generateAvatar('bro');
```

#### `sdk.getWalletBalance(): Promise<number>`
Get $Zo token balance (on-chain with API fallback).

#### `sdk.getWalletTransactions(page?): Promise<TransactionsResult>`
Paginated transaction history.

#### `sdk.destroy(): void`
Stop timers and clean up. Call on unmount.

### Low-Level APIs

The SDK also exposes module-level APIs for advanced use:

```ts
sdk.auth.sendOTP(countryCode, phoneNumber)
sdk.auth.verifyOTP(countryCode, phoneNumber, otp)
sdk.auth.refreshAccessToken(refreshToken)
sdk.auth.checkLoginStatus(accessToken)
sdk.profile.getProfile(accessToken)
sdk.profile.updateProfile(accessToken, updates)
sdk.avatar.generateAvatar(accessToken, bodyType)
sdk.avatar.getAvatarStatus(accessToken, taskId)
sdk.wallet.setWalletAddress(address, network)
sdk.wallet.getBalance()
sdk.wallet.getTransactions(page)
```

---

## React Integration

### Provider Setup

```tsx
import { ZoPassportProvider, useZoPassport } from 'zopassport/react';

function App() {
  return (
    <ZoPassportProvider
      clientKey="your-client-key"
      recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}
    >
      <YourApp />
    </ZoPassportProvider>
  );
}
```

When `recaptchaSiteKey` is set, the Provider's `sendOTP` wrapper automatically loads the grecaptcha v3 script, runs the challenge, and forwards the token. Built-in `<ZoAuth>` and `<ZoLanding>` components work without any further changes.

### `useZoPassport()` Hook

```tsx
const {
  sdk,              // ZoPassportSDK instance
  user,             // ZoUser | null
  isAuthenticated,  // boolean
  isLoading,        // boolean — true while restoring session
  sendOTP,          // (countryCode, phone) => Promise
  verifyOTP,        // (countryCode, phone, otp) => Promise
  logout,           // () => Promise
  refreshProfile,   // () => Promise
} = useZoPassport();
```

### Ready-Made Components

```tsx
import {
  ZoLanding,        // Full-screen landing with video + auth modal
  ZoAuth,           // Standalone phone OTP component
  ZoOnboarding,     // Onboarding flow (name, location, avatar)
  ZoPassportCard,   // Passport display card
  ZoAvatar,         // Avatar display/generation
  WalletScreen,     // Full wallet page
  WalletCard,       // Wallet balance card
} from 'zopassport/react';
```

### Additional Hooks

```tsx
import { useAuth, useProfile, useAvatar, useWallet } from 'zopassport/react';

// useAuth — manages OTP flow state
const { otpSent, sendOTP, verifyOTP, logout } = useAuth();

// useProfile — profile data + completion tracking
const { user, completion, isFounder, updateProfile } = useProfile();

// useAvatar — avatar generation state
const { avatarUrl, isGenerating, generateAvatar } = useAvatar();

// useWallet — balance + transactions
const { balance, transactions, isLoading, refetch } = useWallet(apiClient);
```

---

## React Native

```ts
import { ZoPassportSDK, AsyncStorageAdapter } from 'zopassport';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sdk = new ZoPassportSDK({
  clientKey: 'your-key',
  storageAdapter: new AsyncStorageAdapter(AsyncStorage),
});
```

React Native components are available via:

```ts
import { WalletScreen, WalletCard, TransactionList } from 'zopassport/react-native';
```

---

## Error Handling

The SDK provides typed error classes for precise error handling:

```ts
import {
  ZoSDKError,           // Base — catch all SDK errors
  ZoConfigError,        // Invalid config (missing clientKey)
  ZoValidationError,    // Invalid input (bad phone, OTP)
  ZoAuthError,          // Authentication failure
  ZoNetworkError,       // Network/connectivity issues
  ZoNotAuthenticatedError, // Action requires login
} from 'zopassport';

try {
  await sdk.loginWithPhone('91', '123', '1234');
} catch (err) {
  if (err instanceof ZoValidationError) {
    console.log(`Invalid ${err.field}: ${err.message}`);
  }
}
```

All errors extend `ZoSDKError` which extends `Error`, so `instanceof` checks work as expected.

---

## Storage Adapters

| Adapter | Environment | Import |
|---------|-------------|--------|
| `LocalStorageAdapter` | Web (default) | `'zopassport'` |
| `AsyncStorageAdapter` | React Native | `'zopassport'` |
| `MemoryStorageAdapter` | SSR / Testing | `'zopassport'` |

Implement the `StorageAdapter` interface for custom storage:

```ts
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

---

## TypeScript

Full type exports:

```ts
import type {
  ZoUser,
  ZoAuthResponse,
  ZoProfileUpdatePayload,
  ZoPassportConfig,
  Transaction,
  StorageAdapter,
} from 'zopassport';
```

---

## Testing

```bash
npm test                 # all tests
npm run test:unit        # unit tests only
npm run test:integration # integration tests
npm run test:e2e         # end-to-end flows
npm run test:coverage    # with coverage report
npm run test:watch       # watch mode
```

Use `MemoryStorageAdapter` in tests:

```ts
import { ZoPassportSDK, MemoryStorageAdapter } from 'zopassport';

const sdk = new ZoPassportSDK({
  clientKey: 'test-key',
  storageAdapter: new MemoryStorageAdapter(),
  autoRefresh: false,
});
```

---

## Vite Configuration

If using React Native Web components in a Vite project:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-reanimated': path.resolve(__dirname, './reanimated-mock.js'),
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
  },
  define: { global: 'window' },
});
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

---

## License

[MIT](./LICENSE) &copy; Zo World Team
