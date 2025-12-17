// Wallet Styles - Extracted from Zostel app
import { StyleSheet } from 'react-native';
import { WALLET_COLORS, WALLET_DIMENSIONS } from '../../../../assets/wallet/constants';

export const walletStyles = StyleSheet.create({
  // Layout
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: WALLET_COLORS.background,
  },
  container: {
    flexDirection: 'column-reverse',
  },
  
  // Header
  header: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Wallet Card
  cardPressContainer: {
    padding: 24,
    paddingBottom: 0,
    paddingTop: 8,
  },
  card: {
    aspectRatio: WALLET_DIMENSIONS.cardAspectRatio,
    width: '100%',
    borderRadius: WALLET_DIMENSIONS.cardBorderRadius,
    backgroundColor: WALLET_COLORS.cardBackground,
  },
  cardContainer: {
    margin: 24,
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: WALLET_COLORS.cardInner,
    borderRadius: WALLET_DIMENSIONS.innerBorderRadius,
    paddingBottom: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    backgroundColor: WALLET_COLORS.cardContent,
    borderRadius: WALLET_DIMENSIONS.innerBorderRadius,
    borderWidth: 1,
    borderColor: WALLET_COLORS.cardBorder,
  },
  cardShadow: {
    width: '80%',
    height: 24,
    backgroundColor: WALLET_COLORS.shadowDark,
    position: 'absolute',
    top: '45%',
    left: '10%',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 5,
  },
  
  // Balance
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  
  // User Info
  avatarInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // Card Cover
  cardCover: {
    aspectRatio: WALLET_DIMENSIONS.coverAspectRatio,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: WALLET_DIMENSIONS.innerBorderRadius,
    borderBottomRightRadius: WALLET_DIMENSIONS.innerBorderRadius,
    overflow: 'hidden',
  },
  cardCoverTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Shine Effect
  shineContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shineEffect: {
    position: 'absolute',
    width: 150,
    left: -60,
    top: -140,
    bottom: 0,
  },
  
  // Text Styles
  whiteText: {
    color: WALLET_COLORS.textWhite,
  },
  grayText: {
    color: WALLET_COLORS.textGray,
  },
  
  // Token
  tokenVideo: {
    width: WALLET_DIMENSIONS.tokenVideoSize,
    height: WALLET_DIMENSIONS.tokenVideoSize,
    borderRadius: WALLET_DIMENSIONS.tokenVideoSize,
    overflow: 'hidden',
  },
  token: {
    width: WALLET_DIMENSIONS.tokenSize,
    height: WALLET_DIMENSIONS.tokenSize,
  },
  tokenContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textShadow: {
    shadowRadius: 8,
    shadowOpacity: 1,
  },
  
  // Transactions
  txnContent: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    gap: 32,
    paddingBottom: 24,
    paddingTop: 40,
  },
  txnRow: {
    minHeight: 40,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBgTilted: {
    transform: [{ rotate: '-45deg' }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // States
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 240,
  },
  openBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WALLET_COLORS.background,
    opacity: 0.8,
  },
  zoDescriptionContainer: {
    position: 'absolute',
    bottom: 140,
  },
  description: {
    paddingHorizontal: 24,
    color: WALLET_COLORS.textWhite,
  },
  
  // Spacing
  bar: {
    height: 56,
  },
});

export default walletStyles;

