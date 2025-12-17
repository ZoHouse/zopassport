# 🌍 Zo Passport SDK

> **One line reputation to rule the world**
>
> Phone OTP → Avatar → Passport → Wallet

Complete authentication, onboarding, and passport experience for Zo World applications.

---

## 🚀 Quick Start - Get Running in 4 Commands

```bash
# 1. Create project and install
mkdir my-zopassport && cd my-zopassport
npm install zopassport

# 2. Initialize the app
npx create-zopassport

# 3. Configure your client key
cp .env.example .env
# Edit .env: VITE_ZO_CLIENT_KEY=your-actual-key

# 4. Run the app
npm install && npm run dev
```

**That's it!** 🎉 Your full Zo Passport app is running at `http://localhost:5173`

🔑 Get your client key at: **[https://zo.xyz/developers](https://zo.xyz/developers)**

📖 [**Full Installation Guide →**](./INSTALL.md)

---

## 📦 What's Included

After `npm install zopassport`, you get:

✅ **Complete Demo App** - Full working phone → passport → wallet flow
✅ **All Dependencies** - React, Vite, TypeScript pre-configured
✅ **All Assets** - Images, videos, icons bundled
✅ **Environment Template** - Just add your client key

---

## 🎯 For Developers - Use as SDK

Want to integrate into your existing app? Use it as a library:

### 1. Initialize the SDK

```typescript
import { ZoPassportSDK } from 'zopassport';

const sdk = new ZoPassportSDK({
  clientKey: 'your-client-key',
  autoRefresh: true,
});
```

### 2. React Integration

```tsx
import { ZoPassportProvider, useZoPassport, ZoLanding, ZoOnboarding, ZoPassportCard } from 'zopassport/react';

function App() {
  return (
    <ZoPassportProvider clientKey="your-client-key">
      <YourApp />
    </ZoPassportProvider>
  );
}

function YourApp() {
  const { isAuthenticated, user, sendOTP, verifyOTP } = useZoPassport();

  if (!isAuthenticated) {
    return (
      <ZoLanding
        onAuthSuccess={(userId, user) => console.log('Logged in!', user)}
        sendOTP={sendOTP}
        verifyOTP={verifyOTP}
      />
    );
  }

  return (
    <div>
      <ZoPassportCard
        profile={{
          avatar: user.avatar?.image,
          name: user.first_name,
          isFounder: user.membership === 'founder',
        }}
        completion={{ done: 8, total: 10 }}
      />
    </div>
  );
}
```

## Features

### ✅ Authentication
- Phone number + OTP authentication
- Automatic token refresh
- Session persistence

### ✅ Avatar Generation
- Choose body type (Bro/Bae)
- AI-powered avatar generation
- Polling status updates

### ✅ Passport Card
- Leather texture design
- Founder/Citizen variants
- Progress ring indicator

### ✅ Onboarding Flow
- Nickname input
- Location detection
- Avatar preview

## Components

### `<ZoLanding />`
Full-screen landing page with video background and auth modal.

```tsx
<ZoLanding
  onAuthSuccess={(userId, user) => {}}
  sendOTP={async (code, phone) => sdk.auth.sendOTP(code, phone)}
  verifyOTP={async (code, phone, otp) => sdk.auth.verifyOTP(code, phone, otp)}
  videoUrl="/videos/background.mp4"
  logoUrl="/zo-logo.png"
  title="ZOHMMM!"
/>
```

### `<ZoOnboarding />`
Complete onboarding flow component.

```tsx
<ZoOnboarding
  onComplete={(data) => console.log(data)}
  updateProfile={(updates) => sdk.updateProfile(updates)}
  getProfile={() => sdk.getProfile()}
/>
```

### `<ZoPassportCard />`
Passport card display component.

```tsx
<ZoPassportCard
  profile={{
    avatar: 'https://...',
    name: 'Samurai',
    isFounder: true,
  }}
  completion={{ done: 8, total: 10 }}
/>
```

### `<ZoAuth />`
Standalone phone OTP authentication component.

```tsx
<ZoAuth
  onSuccess={(userId, user) => {}}
  onClose={() => {}}
  sendOTP={sendOTP}
  verifyOTP={verifyOTP}
/>
```

### `<PhoneInput />` & `<OTPInput />`
Low-level input components for custom auth flows.

## Hooks

### `useZoPassport()`
Main hook for authentication state and operations.

```tsx
const {
  sdk,
  user,
  isAuthenticated,
  isLoading,
  sendOTP,
  verifyOTP,
  logout,
  refreshProfile,
} = useZoPassport();
```

### `useProfile()`
Profile operations and completion tracking.

```tsx
const {
  user,
  completion,
  isFounder,
  updateProfile,
  reload,
} = useProfile();
```

### `useAvatar()`
Avatar generation operations.

```tsx
const {
  avatarUrl,
  isGenerating,
  generateAvatar,
} = useAvatar();
```

## Assets Required

Include these assets in your `public/` folder:

```
public/
├── figma-assets/
│   └── landing-zo-logo.png          # Zo logo
├── videos/
│   └── loading-screen-background.mp4 # Background video
├── bro.png                          # Bro avatar preview
├── bae.png                          # Bae avatar preview
├── Cultural Stickers/               # Culture icons
│   ├── Travel&Adventure.png
│   ├── Design.png
│   ├── Science&Technology.png
│   ├── Food.png
│   ├── Music&Entertainment.png
│   ├── Photography.png
│   ├── Health&Fitness.png
│   ├── Sport.png
│   ├── Literature&Stories.png
│   ├── Television&Cinema.png
│   ├── Spiritual.png
│   ├── Nature&Wildlife.png
│   ├── Business.png
│   ├── Law.png
│   ├── Home&Lifestyle.png
│   ├── Game.png
│   └── Stories&Journal.png
└── images/
    └── rank1.jpeg                   # Fallback avatar
```

## CDN Assets

The SDK uses these CDN URLs for passport backgrounds:

- **Founder Background**: `https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png`
- **Citizen Background**: `https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png`

You can override these via props.

## Storage Adapters

### Web (Default)
Uses `localStorage` automatically.

### React Native
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ZoPassportSDK, AsyncStorageAdapter } from 'zopassport';

const sdk = new ZoPassportSDK({
  clientKey: 'your-key',
  storageAdapter: new AsyncStorageAdapter(AsyncStorage),
});
```

### Server-Side / Testing
```tsx
import { ZoPassportSDK, MemoryStorageAdapter } from 'zopassport';

const sdk = new ZoPassportSDK({
  clientKey: 'your-key',
  storageAdapter: new MemoryStorageAdapter(),
});
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  ZoUser,
  ZoAuthResponse,
  ZoProfileUpdatePayload,
  ZoPassportConfig,
} from 'zopassport';
```

## License

MIT © Zo World Team

## Wallet Integration

The SDK includes a built-in wallet system for managing Zo World assets.

### Framework-Agnostic Usage

```typescript
// Get wallet balance
const balance = await sdk.wallet.getBalance();
console.log('Balance:', balance.total_amount);

// Get transaction history
const transactions = await sdk.wallet.getTransactions();
console.log('Transactions:', transactions);
```

### React Components

The SDK provides ready-to-use wallet components:

```tsx
import { WalletScreen, WalletCard } from 'zopassport/react';

// Full wallet screen
<WalletScreen onBack={() => console.log('Back')} />

// Wallet card widget
<WalletCard 
  balance={100} 
  user={user} 
  isOpen={isOpen} 
  onToggle={() => setIsOpen(!isOpen)} 
/>
```

### React Hooks

```tsx
import { useWalletBalance, useTransactions } from 'zopassport/react';

const MyWallet = () => {
  const { balance, isLoading } = useWalletBalance(sdk.client);
  const { transactions } = useTransactions(sdk.client);

  return <div>Balance: {balance}</div>;
};
```

## Universal UI Support (Web + Mobile)

The SDK's UI components are built with React Native but can run on the web using `react-native-web`.

### Vite Configuration

To use the UI components in a Vite app, configure your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      // Mock reanimated if not using web-compatible version
      'react-native-reanimated': path.resolve(__dirname, './reanimated-mock.js'),
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
  },
  define: {
    global: 'window',
  },
});
```

### Next.js Configuration

For Next.js, use `next-transpile-modules`:

```javascript
const withTM = require('next-transpile-modules')([
  'zopassport',
  'react-native-web',
]);

module.exports = withTM({
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    return config;
  },
});
```

