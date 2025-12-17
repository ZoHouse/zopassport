# 🚀 Zo Passport - Quick Start

> **One line reputation to rule the world**

Get your complete phone OTP → passport → wallet app running in under 2 minutes.

---

## Installation

```bash
# 1. Create project directory
mkdir my-zopassport && cd my-zopassport

# 2. Install the package
npm install zopassport

# 3. Initialize (copies app, assets, config)
npx create-zopassport

# 4. Configure your client key
cp .env.example .env
# Edit .env: VITE_ZO_CLIENT_KEY=your-actual-key-here

# 5. Install dependencies and run
npm install && npm run dev
```

🎉 **Done!** Your app is running at `http://localhost:5173`

---

## Get Your Client Key

1. Visit: **https://zo.xyz/developers**
2. Create an app
3. Copy your client key
4. Paste in `.env` file

---

## What You Get

After installation, you have a **complete working app** with:

✅ Phone OTP Authentication
✅ Avatar Generation & Selection
✅ Passport Card Display
✅ Wallet with Balance & Transactions
✅ Reputation Tracking
✅ All Assets (images, videos, icons)

---

## Project Structure

```
my-zopassport/
├── src/
│   ├── App.tsx              # Main app component
│   ├── components/          # UI components from SDK
│   └── main.tsx             # Entry point
├── public/
│   └── assets/              # Images, videos, stickers
├── .env.example             # Config template
├── .env                     # Your config (add client key here)
└── package.json             # Dependencies
```

---

## Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
```

---

## Customization

The demo app imports from `zopassport`:

```tsx
// Import SDK
import { ZoPassportSDK } from 'zopassport';

// Import React components
import {
  ZoLanding,
  ZoPassportCard,
  WalletScreen
} from 'zopassport/react';

// Use in your app
const sdk = new ZoPassportSDK({
  clientKey: import.meta.env.VITE_ZO_CLIENT_KEY
});
```

You can customize:
- UI colors and branding
- Component layouts
- Add your own features
- Integrate with your backend

---

## Troubleshooting

**"Missing client key" error?**
- Make sure `.env` exists (copy from `.env.example`)
- Add your actual key (not `your-client-key-here`)
- Restart dev server

**Assets not loading?**
- Run `npx create-zopassport` again
- Check `public/assets/` folder exists

**Module errors?**
- Delete `node_modules` and run `npm install` again
- Make sure Node.js version is 18+

---

## Next Steps

📖 **[Full Documentation](./INSTALL.md)**
🎯 **[SDK Reference](./README.md)**
🐛 **[Report Issues](https://github.com/zo-world/zopassport/issues)**
💬 **[Join Discord](https://discord.gg/zoworld)**

---

**Built with 🌍 Zo World** | One line reputation to rule the world
