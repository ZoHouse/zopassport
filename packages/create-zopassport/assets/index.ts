// Asset path constants for Zo Passport SDK
// Use these when configuring components

export const ASSETS = {
  // Core avatars
  BRO_AVATAR: '/bro.png',
  BAE_AVATAR: '/bae.png',
  FALLBACK_AVATAR: '/zo-fallback.png',
  DEFAULT_AVATAR: '/images/rank1.jpeg',

  // Branding
  ZO_LOGO: '/figma-assets/landing-zo-logo.png',
  ZO_COIN: '/zo-coin.gif',

  // Videos
  LANDING_VIDEO: '/videos/loading-screen-background.mp4',
  PORTAL_VIDEO: '/videos/opening-disks.mp4',

  // Passport backgrounds (CDN)
  FOUNDER_BG: 'https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png',
  CITIZEN_BG: 'https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png',

  // Lotties
  LOADER: '/lotties/loader.json',
  SPINNER: '/lotties/spinner.json',
} as const;

// Cultural sticker paths
export const CULTURE_STICKERS = {
  travel: '/cultural-stickers/Travel&Adventure.png',
  design: '/cultural-stickers/Design.png',
  tech: '/cultural-stickers/Science&Technology.png',
  food: '/cultural-stickers/Food.png',
  music: '/cultural-stickers/Music&Entertainment.png',
  photography: '/cultural-stickers/Photography.png',
  fitness: '/cultural-stickers/Health&Fitness.png',
  sports: '/cultural-stickers/Sport.png',
  literature: '/cultural-stickers/Literature&Stories.png',
  cinema: '/cultural-stickers/Television&Cinema.png',
  spiritual: '/cultural-stickers/Spiritual.png',
  nature: '/cultural-stickers/Nature&Wildlife.png',
  business: '/cultural-stickers/Business.png',
  law: '/cultural-stickers/Law.png',
  lifestyle: '/cultural-stickers/Home&Lifestyle.png',
  gaming: '/cultural-stickers/Game.png',
  stories: '/cultural-stickers/Stories&Journal.png',
} as const;

// Culture metadata
export const CULTURES = [
  { id: 'travel', name: 'Travel & Adventure', icon: CULTURE_STICKERS.travel },
  { id: 'design', name: 'Design', icon: CULTURE_STICKERS.design },
  { id: 'tech', name: 'Science & Technology', icon: CULTURE_STICKERS.tech },
  { id: 'food', name: 'Food', icon: CULTURE_STICKERS.food },
  { id: 'music', name: 'Music & Entertainment', icon: CULTURE_STICKERS.music },
  { id: 'photography', name: 'Photography', icon: CULTURE_STICKERS.photography },
  { id: 'fitness', name: 'Health & Fitness', icon: CULTURE_STICKERS.fitness },
  { id: 'sports', name: 'Sport', icon: CULTURE_STICKERS.sports },
  { id: 'literature', name: 'Literature & Stories', icon: CULTURE_STICKERS.literature },
  { id: 'cinema', name: 'Television & Cinema', icon: CULTURE_STICKERS.cinema },
  { id: 'spiritual', name: 'Spiritual', icon: CULTURE_STICKERS.spiritual },
  { id: 'nature', name: 'Nature & Wildlife', icon: CULTURE_STICKERS.nature },
  { id: 'business', name: 'Business', icon: CULTURE_STICKERS.business },
  { id: 'law', name: 'Law', icon: CULTURE_STICKERS.law },
  { id: 'lifestyle', name: 'Home & Lifestyle', icon: CULTURE_STICKERS.lifestyle },
  { id: 'gaming', name: 'Game', icon: CULTURE_STICKERS.gaming },
  { id: 'stories', name: 'Stories & Journal', icon: CULTURE_STICKERS.stories },
] as const;

export type CultureId = typeof CULTURES[number]['id'];

// =====================
// Wallet Assets
// =====================

export * from './wallet/constants';
