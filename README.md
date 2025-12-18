# 🌍 Zo Passport SDK

> **One line reputation to rule the world**
>
> Phone OTP → Avatar → Passport → Wallet

Complete authentication, onboarding, and passport experience for Zo World applications.

---

## 🚀 Quick Start - Single Command!

```bash
# Create a new Zo Passport app
npx create-zopassport my-app

cd my-app
cp .env.example .env    # Add your VITE_ZO_CLIENT_KEY
npm install && npm run dev
```

**That's it!** 🎉 Your full Zo Passport app is running at `http://localhost:5173`

🔑 Get your client key at: **[https://zo.xyz/developers](https://zo.xyz/developers)**

---

## 📦 What's Included

When you run `npx create-zopassport`, you get:

✅ **Complete Demo App** - Full working phone → passport → wallet flow  
✅ **All Dependencies** - React, Vite, TypeScript pre-configured  
✅ **All Assets** - Images, videos, icons bundled  
✅ **Environment Template** - Just add your client key  

---

## 🎯 Use as SDK in Existing Apps

Want to integrate into your existing app? Install the SDK:

```bash
npm install zopassport
```

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
import { ZoPassportProvider, useZoPassport, ZoLanding, ZoPassportCard } from 'zopassport/react';

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
    <ZoPassportCard
      profile={{
        avatar: user.avatar?.image,
        name: user.first_name,
        isFounder: user.membership === 'founder',
      }}
      completion={{ done: 8, total: 10 }}
    />
  );
}
```

---

## Features

- **Authentication** - Phone number + OTP, auto token refresh, session persistence
- **Avatar Generation** - Choose body type (Bro/Bae), AI-powered generation
- **Passport Card** - Leather texture design, Founder/Citizen variants
- **Onboarding Flow** - Nickname, location, avatar preview
- **Wallet** - Balance, transaction history

---

## Components

### `<ZoLanding />`
Full-screen landing page with video background and auth modal.

```tsx
<ZoLanding
  onAuthSuccess={(userId, user) => {}}
  sendOTP={async (code, phone) => sdk.auth.sendOTP(code, phone)}
  verifyOTP={async (code, phone, otp) => sdk.auth.verifyOTP(code, phone, otp)}
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
  profile={{ avatar: 'https://...', name: 'Samurai', isFounder: true }}
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

---

## Hooks

### `useZoPassport()`
```tsx
const { sdk, user, isAuthenticated, isLoading, sendOTP, verifyOTP, logout, refreshProfile } = useZoPassport();
```

### `useProfile()`
```tsx
const { user, completion, isFounder, updateProfile, reload } = useProfile();
```

### `useAvatar()`
```tsx
const { avatarUrl, isGenerating, generateAvatar } = useAvatar();
```

---

## Wallet Integration

```tsx
import { WalletScreen, WalletCard } from 'zopassport/react';

// Full wallet screen
<WalletScreen onBack={() => console.log('Back')} />

// Wallet card widget
<WalletCard balance={100} user={user} isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
```

---

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

---

## TypeScript

Full TypeScript support:

```typescript
import type { ZoUser, ZoAuthResponse, ZoProfileUpdatePayload, ZoPassportConfig } from 'zopassport';
```

---

## Vite Configuration

```typescript
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

## License

MIT © Zo World Team
