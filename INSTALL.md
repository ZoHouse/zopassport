# 🌍 Zo Passport - Installation Guide

> One line reputation to rule the world

## Quick Start

Get your full phone OTP → passport → wallet app running in 4 commands:

```bash
# 1. Create a new directory and install the package
mkdir my-zopassport && cd my-zopassport
npm install zopassport

# 2. Initialize your app (copies all files and assets)
npx create-zopassport

# 3. Set up your client key
cp .env.example .env
# Edit .env and add: VITE_ZO_CLIENT_KEY=your-key-here

# 4. Install dependencies and run
npm install
npm run dev
```

🎉 Your Zo Passport app is now running at `http://localhost:5173`

## What You Get

After running `npx create-zopassport`, you get a complete working app with:

- ✅ **Phone OTP Authentication** - SMS verification flow
- ✅ **Avatar Generation** - AI-powered profile avatars
- ✅ **Passport Card** - Beautiful leather-textured passport
- ✅ **Wallet Integration** - Full Zo World wallet with transactions
- ✅ **Reputation System** - One line reputation tracking
- ✅ **All Assets** - Images, videos, icons pre-bundled

## Getting Your Client Key

1. Visit [https://zo.xyz/developers](https://zo.xyz/developers)
2. Create a new application
3. Copy your client key
4. Paste it in your `.env` file:

```bash
VITE_ZO_CLIENT_KEY=zok_live_abc123xyz...
```

## File Structure

After installation, you'll have:

```
my-zopassport/
├── src/
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/
│   └── assets/           # Images, videos, icons
├── .env.example          # Environment template
├── .env                  # Your config (create this)
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
└── index.html            # HTML entry
```

## Customization

The demo app uses `zopassport` as a dependency. You can:

### Change the API URL

```typescript
// In .env
VITE_ZO_API_URL=https://your-api.zo.xyz
```

### Customize Components

```tsx
import { ZoPassportSDK, ZoLanding, ZoPassportCard } from 'zopassport';
import { ZoLanding, WalletScreen } from 'zopassport/react';

// Use the components in your own app
function MyCustomApp() {
  const sdk = new ZoPassportSDK({ clientKey: 'your-key' });

  return (
    <YourLayout>
      <ZoLanding onAuthSuccess={handleAuth} />
      <ZoPassportCard profile={user} />
      <WalletScreen />
    </YourLayout>
  );
}
```

### Add Your Branding

Edit `src/App.tsx` to customize:
- Welcome messages
- Color schemes
- Layout structure
- Additional features

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Troubleshooting

### "Missing client key" error

Make sure you:
1. Created `.env` file (copy from `.env.example`)
2. Added your actual client key (not `your-client-key-here`)
3. Restarted the dev server after editing `.env`

### Assets not loading

Assets are bundled in `public/assets/`. If missing, run:

```bash
npm install zopassport --force
```

### Module resolution errors

For Vite projects, ensure `vite.config.ts` has:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
```

## Deploy to Production

Build and deploy anywhere:

```bash
npm run build
# Deploy the 'dist' folder to:
# - Vercel
# - Netlify
# - Cloudflare Pages
# - Any static host
```

## Support

- 📖 Full docs: [https://docs.zo.xyz](https://docs.zo.xyz)
- 🐛 Report issues: [https://github.com/zo-world/zopassport/issues](https://github.com/zo-world/zopassport/issues)
- 💬 Discord: [https://discord.gg/zoworld](https://discord.gg/zoworld)

---

**🌍 Built with Zo World** | One line reputation to rule the world
