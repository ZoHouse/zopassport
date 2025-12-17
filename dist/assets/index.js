"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// assets/index.ts
var index_exports = {};
__export(index_exports, {
  ANIMATIONS: () => ANIMATIONS,
  ASSETS: () => ASSETS,
  CULTURES: () => CULTURES,
  CULTURE_STICKERS: () => CULTURE_STICKERS,
  WALLET_ASSETS: () => WALLET_ASSETS,
  WALLET_COLORS: () => WALLET_COLORS,
  WALLET_DIMENSIONS: () => WALLET_DIMENSIONS
});
module.exports = __toCommonJS(index_exports);

// assets/wallet/constants.ts
var WALLET_ASSETS = {
  walletBackground: "https://proxy.cdn.zo.xyz/gallery/media/images/2e1fe74c-673c-4acd-a5aa-4ac13027dfb2_20250706072110.png",
  walletCover: "https://proxy.cdn.zo.xyz/gallery/media/images/aeb1d508-c511-46a9-b4f8-260ea8825c6a_20250706072152.png",
  shine: "https://proxy.cdn.zo.xyz/gallery/media/images/2a117a82-e399-4278-8eac-0d5b9209d150_20250706073538.png"
};
var WALLET_COLORS = {
  background: "#111111",
  cardBackground: "#222222",
  cardInner: "rgba(255, 255, 255, 0.24)",
  cardContent: "#111111",
  cardBorder: "rgba(255, 255, 255, 0.16)",
  textWhite: "#FFFFFF",
  textGray: "rgba(255, 255, 255, 0.44)",
  zoGreen: "#00C853",
  shadowDark: "rgba(25, 25, 25, 1)"
};
var WALLET_DIMENSIONS = {
  cardAspectRatio: 312 / 200,
  coverAspectRatio: 312 / 120,
  cardBorderRadius: 16,
  innerBorderRadius: 12,
  avatarSize: 32,
  tokenSize: 16,
  tokenVideoSize: 24
};
var ANIMATIONS = {
  shineDuration: 1500,
  cardTransition: 300,
  fadeInDuration: 500
};

// assets/index.ts
var ASSETS = {
  // Core avatars
  BRO_AVATAR: "/bro.png",
  BAE_AVATAR: "/bae.png",
  FALLBACK_AVATAR: "/zo-fallback.png",
  DEFAULT_AVATAR: "/images/rank1.jpeg",
  // Branding
  ZO_LOGO: "/figma-assets/landing-zo-logo.png",
  ZO_COIN: "/zo-coin.gif",
  // Videos
  LANDING_VIDEO: "/videos/loading-screen-background.mp4",
  PORTAL_VIDEO: "/videos/opening-disks.mp4",
  // Passport backgrounds (CDN)
  FOUNDER_BG: "https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png",
  CITIZEN_BG: "https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png",
  // Lotties
  LOADER: "/lotties/loader.json",
  SPINNER: "/lotties/spinner.json"
};
var CULTURE_STICKERS = {
  travel: "/cultural-stickers/Travel&Adventure.png",
  design: "/cultural-stickers/Design.png",
  tech: "/cultural-stickers/Science&Technology.png",
  food: "/cultural-stickers/Food.png",
  music: "/cultural-stickers/Music&Entertainment.png",
  photography: "/cultural-stickers/Photography.png",
  fitness: "/cultural-stickers/Health&Fitness.png",
  sports: "/cultural-stickers/Sport.png",
  literature: "/cultural-stickers/Literature&Stories.png",
  cinema: "/cultural-stickers/Television&Cinema.png",
  spiritual: "/cultural-stickers/Spiritual.png",
  nature: "/cultural-stickers/Nature&Wildlife.png",
  business: "/cultural-stickers/Business.png",
  law: "/cultural-stickers/Law.png",
  lifestyle: "/cultural-stickers/Home&Lifestyle.png",
  gaming: "/cultural-stickers/Game.png",
  stories: "/cultural-stickers/Stories&Journal.png"
};
var CULTURES = [
  { id: "travel", name: "Travel & Adventure", icon: CULTURE_STICKERS.travel },
  { id: "design", name: "Design", icon: CULTURE_STICKERS.design },
  { id: "tech", name: "Science & Technology", icon: CULTURE_STICKERS.tech },
  { id: "food", name: "Food", icon: CULTURE_STICKERS.food },
  { id: "music", name: "Music & Entertainment", icon: CULTURE_STICKERS.music },
  { id: "photography", name: "Photography", icon: CULTURE_STICKERS.photography },
  { id: "fitness", name: "Health & Fitness", icon: CULTURE_STICKERS.fitness },
  { id: "sports", name: "Sport", icon: CULTURE_STICKERS.sports },
  { id: "literature", name: "Literature & Stories", icon: CULTURE_STICKERS.literature },
  { id: "cinema", name: "Television & Cinema", icon: CULTURE_STICKERS.cinema },
  { id: "spiritual", name: "Spiritual", icon: CULTURE_STICKERS.spiritual },
  { id: "nature", name: "Nature & Wildlife", icon: CULTURE_STICKERS.nature },
  { id: "business", name: "Business", icon: CULTURE_STICKERS.business },
  { id: "law", name: "Law", icon: CULTURE_STICKERS.law },
  { id: "lifestyle", name: "Home & Lifestyle", icon: CULTURE_STICKERS.lifestyle },
  { id: "gaming", name: "Game", icon: CULTURE_STICKERS.gaming },
  { id: "stories", name: "Stories & Journal", icon: CULTURE_STICKERS.stories }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ANIMATIONS,
  ASSETS,
  CULTURES,
  CULTURE_STICKERS,
  WALLET_ASSETS,
  WALLET_COLORS,
  WALLET_DIMENSIONS
});
//# sourceMappingURL=index.js.map