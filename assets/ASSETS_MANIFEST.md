# Zo Passport SDK - Assets Manifest

All required assets for the complete phone → avatar → passport flow.

## 📂 Directory Structure

```
assets/
├── bro.png                         # Male avatar preview (256x256)
├── bae.png                         # Female avatar preview (256x256)
├── zo-fallback.png                 # Default fallback avatar
├── zo-coin.gif                     # Animated $Zo coin
│
├── figma-assets/
│   └── landing-zo-logo.png         # Zo logo (60x60)
│
├── videos/
│   ├── loading-screen-background.mp4   # Landing/onboarding bg video
│   └── opening-disks.mp4               # Portal animation
│
├── images/
│   └── rank1.jpeg                  # Fallback avatar
│
├── cultural-stickers/              # 17 culture icons
│   ├── Business.png
│   ├── Design.png
│   ├── Food.png
│   ├── Game.png
│   ├── Health&Fitness.png
│   ├── Home&Lifestyle.png
│   ├── Law.png
│   ├── Literature&Stories.png
│   ├── Music&Entertainment.png
│   ├── Nature&Wildlife.png
│   ├── Photography.png
│   ├── Science&Technology.png
│   ├── Spiritual.png
│   ├── Sport.png
│   ├── Stories&Journal.png
│   ├── Television&Cinema.png
│   └── Travel&Adventure.png
│
└── lotties/
    ├── loader.json                 # Loading animation
    └── spinner.json                # Button spinner
```

## 🌐 CDN Assets (Not Bundled)

These are loaded from Zo CDN and don't need to be bundled:

| Asset | URL |
|-------|-----|
| Founder Passport BG | `https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png` |
| Citizen Passport BG | `https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png` |

## 📦 Usage

### Copy to Public Folder

```bash
# Copy all assets to your public folder
cp -r packages/zopassport/assets/* public/
```

### Import Paths (After copying to public/)

```tsx
// In your components
const videoUrl = '/videos/loading-screen-background.mp4';
const logoUrl = '/figma-assets/landing-zo-logo.png';
const broAvatarUrl = '/bro.png';
const baeAvatarUrl = '/bae.png';
```

### Or Reference from SDK

```tsx
import { ZoLanding } from '@zo/passport/react';

<ZoLanding
  videoUrl="/assets/videos/loading-screen-background.mp4"
  logoUrl="/assets/figma-assets/landing-zo-logo.png"
/>
```

## 📊 File Sizes

| Asset | Size (approx) |
|-------|---------------|
| loading-screen-background.mp4 | ~2 MB |
| opening-disks.mp4 | ~500 KB |
| Cultural stickers (all) | ~200 KB |
| Avatar previews | ~50 KB each |
| Lotties | ~10 KB each |

**Total Bundle**: ~3 MB

## 🎨 Culture Sticker Mapping

| ID | Name | File |
|----|------|------|
| `travel` | Travel & Adventure | `Travel&Adventure.png` |
| `design` | Design | `Design.png` |
| `tech` | Science & Technology | `Science&Technology.png` |
| `food` | Food | `Food.png` |
| `music` | Music & Entertainment | `Music&Entertainment.png` |
| `photography` | Photography | `Photography.png` |
| `fitness` | Health & Fitness | `Health&Fitness.png` |
| `sports` | Sport | `Sport.png` |
| `literature` | Literature & Stories | `Literature&Stories.png` |
| `cinema` | Television & Cinema | `Television&Cinema.png` |
| `spiritual` | Spiritual | `Spiritual.png` |
| `nature` | Nature & Wildlife | `Nature&Wildlife.png` |
| `business` | Business | `Business.png` |
| `law` | Law | `Law.png` |
| `lifestyle` | Home & Lifestyle | `Home&Lifestyle.png` |
| `gaming` | Game | `Game.png` |
| `stories` | Stories & Journal | `Stories&Journal.png` |

---

*Generated: December 2025*

