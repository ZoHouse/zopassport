declare const WALLET_ASSETS: {
    readonly walletBackground: "https://proxy.cdn.zo.xyz/gallery/media/images/2e1fe74c-673c-4acd-a5aa-4ac13027dfb2_20250706072110.png";
    readonly walletCover: "https://proxy.cdn.zo.xyz/gallery/media/images/aeb1d508-c511-46a9-b4f8-260ea8825c6a_20250706072152.png";
    readonly shine: "https://proxy.cdn.zo.xyz/gallery/media/images/2a117a82-e399-4278-8eac-0d5b9209d150_20250706073538.png";
};
declare const WALLET_COLORS: {
    readonly background: "#111111";
    readonly cardBackground: "#222222";
    readonly cardInner: "rgba(255, 255, 255, 0.24)";
    readonly cardContent: "#111111";
    readonly cardBorder: "rgba(255, 255, 255, 0.16)";
    readonly textWhite: "#FFFFFF";
    readonly textGray: "rgba(255, 255, 255, 0.44)";
    readonly zoGreen: "#00C853";
    readonly shadowDark: "rgba(25, 25, 25, 1)";
};
declare const WALLET_DIMENSIONS: {
    readonly cardAspectRatio: number;
    readonly coverAspectRatio: number;
    readonly cardBorderRadius: 16;
    readonly innerBorderRadius: 12;
    readonly avatarSize: 32;
    readonly tokenSize: 16;
    readonly tokenVideoSize: 24;
};
declare const ANIMATIONS: {
    readonly shineDuration: 1500;
    readonly cardTransition: 300;
    readonly fadeInDuration: 500;
};

declare const ASSETS: {
    readonly BRO_AVATAR: "/bro.png";
    readonly BAE_AVATAR: "/bae.png";
    readonly FALLBACK_AVATAR: "/zo-fallback.png";
    readonly DEFAULT_AVATAR: "/images/rank1.jpeg";
    readonly ZO_LOGO: "/figma-assets/landing-zo-logo.png";
    readonly ZO_COIN: "/zo-coin.gif";
    readonly LANDING_VIDEO: "/videos/loading-screen-background.mp4";
    readonly PORTAL_VIDEO: "/videos/opening-disks.mp4";
    readonly FOUNDER_BG: "https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png";
    readonly CITIZEN_BG: "https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png";
    readonly LOADER: "/lotties/loader.json";
    readonly SPINNER: "/lotties/spinner.json";
};
declare const CULTURE_STICKERS: {
    readonly travel: "/cultural-stickers/Travel&Adventure.png";
    readonly design: "/cultural-stickers/Design.png";
    readonly tech: "/cultural-stickers/Science&Technology.png";
    readonly food: "/cultural-stickers/Food.png";
    readonly music: "/cultural-stickers/Music&Entertainment.png";
    readonly photography: "/cultural-stickers/Photography.png";
    readonly fitness: "/cultural-stickers/Health&Fitness.png";
    readonly sports: "/cultural-stickers/Sport.png";
    readonly literature: "/cultural-stickers/Literature&Stories.png";
    readonly cinema: "/cultural-stickers/Television&Cinema.png";
    readonly spiritual: "/cultural-stickers/Spiritual.png";
    readonly nature: "/cultural-stickers/Nature&Wildlife.png";
    readonly business: "/cultural-stickers/Business.png";
    readonly law: "/cultural-stickers/Law.png";
    readonly lifestyle: "/cultural-stickers/Home&Lifestyle.png";
    readonly gaming: "/cultural-stickers/Game.png";
    readonly stories: "/cultural-stickers/Stories&Journal.png";
};
declare const CULTURES: readonly [{
    readonly id: "travel";
    readonly name: "Travel & Adventure";
    readonly icon: "/cultural-stickers/Travel&Adventure.png";
}, {
    readonly id: "design";
    readonly name: "Design";
    readonly icon: "/cultural-stickers/Design.png";
}, {
    readonly id: "tech";
    readonly name: "Science & Technology";
    readonly icon: "/cultural-stickers/Science&Technology.png";
}, {
    readonly id: "food";
    readonly name: "Food";
    readonly icon: "/cultural-stickers/Food.png";
}, {
    readonly id: "music";
    readonly name: "Music & Entertainment";
    readonly icon: "/cultural-stickers/Music&Entertainment.png";
}, {
    readonly id: "photography";
    readonly name: "Photography";
    readonly icon: "/cultural-stickers/Photography.png";
}, {
    readonly id: "fitness";
    readonly name: "Health & Fitness";
    readonly icon: "/cultural-stickers/Health&Fitness.png";
}, {
    readonly id: "sports";
    readonly name: "Sport";
    readonly icon: "/cultural-stickers/Sport.png";
}, {
    readonly id: "literature";
    readonly name: "Literature & Stories";
    readonly icon: "/cultural-stickers/Literature&Stories.png";
}, {
    readonly id: "cinema";
    readonly name: "Television & Cinema";
    readonly icon: "/cultural-stickers/Television&Cinema.png";
}, {
    readonly id: "spiritual";
    readonly name: "Spiritual";
    readonly icon: "/cultural-stickers/Spiritual.png";
}, {
    readonly id: "nature";
    readonly name: "Nature & Wildlife";
    readonly icon: "/cultural-stickers/Nature&Wildlife.png";
}, {
    readonly id: "business";
    readonly name: "Business";
    readonly icon: "/cultural-stickers/Business.png";
}, {
    readonly id: "law";
    readonly name: "Law";
    readonly icon: "/cultural-stickers/Law.png";
}, {
    readonly id: "lifestyle";
    readonly name: "Home & Lifestyle";
    readonly icon: "/cultural-stickers/Home&Lifestyle.png";
}, {
    readonly id: "gaming";
    readonly name: "Game";
    readonly icon: "/cultural-stickers/Game.png";
}, {
    readonly id: "stories";
    readonly name: "Stories & Journal";
    readonly icon: "/cultural-stickers/Stories&Journal.png";
}];
type CultureId = typeof CULTURES[number]['id'];

export { ANIMATIONS, ASSETS, CULTURES, CULTURE_STICKERS, type CultureId, WALLET_ASSETS, WALLET_COLORS, WALLET_DIMENSIONS };
