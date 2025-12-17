// Wallet Asset URLs - Production CDN
export const WALLET_ASSETS = {
  walletBackground:
    'https://proxy.cdn.zo.xyz/gallery/media/images/2e1fe74c-673c-4acd-a5aa-4ac13027dfb2_20250706072110.png',
  walletCover:
    'https://proxy.cdn.zo.xyz/gallery/media/images/aeb1d508-c511-46a9-b4f8-260ea8825c6a_20250706072152.png',
  shine:
    'https://proxy.cdn.zo.xyz/gallery/media/images/2a117a82-e399-4278-8eac-0d5b9209d150_20250706073538.png',
} as const;

export const WALLET_COLORS = {
  background: '#111111',
  cardBackground: '#222222',
  cardInner: 'rgba(255, 255, 255, 0.24)',
  cardContent: '#111111',
  cardBorder: 'rgba(255, 255, 255, 0.16)',
  textWhite: '#FFFFFF',
  textGray: 'rgba(255, 255, 255, 0.44)',
  zoGreen: '#00C853',
  shadowDark: 'rgba(25, 25, 25, 1)',
} as const;

export const WALLET_DIMENSIONS = {
  cardAspectRatio: 312 / 200,
  coverAspectRatio: 312 / 120,
  cardBorderRadius: 16,
  innerBorderRadius: 12,
  avatarSize: 32,
  tokenSize: 16,
  tokenVideoSize: 24,
} as const;

export const ANIMATIONS = {
  shineDuration: 1500,
  cardTransition: 300,
  fadeInDuration: 500,
} as const;

