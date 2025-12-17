// src/components/wallet/WalletScreen.tsx
import { useState, useCallback, useMemo, memo as memo5 } from "react";
import {
  View as View6,
  Text as Text4,
  ScrollView as ScrollView2,
  Pressable as Pressable2,
  ActivityIndicator as ActivityIndicator2,
  StyleSheet as StyleSheet7,
  SafeAreaView
} from "react-native";
import Animated3, { FadeIn as FadeIn2, FadeOut, FadeInUp, FadeOutUp, FadeInDown } from "react-native-reanimated";

// src/components/wallet/WalletCard.tsx
import { memo as memo2, useEffect as useEffect2 } from "react";
import { View as View3, Text, Image as Image3, Pressable, StyleSheet as StyleSheet4 } from "react-native";
import Animated2, {
  useSharedValue as useSharedValue2,
  useAnimatedStyle as useAnimatedStyle2,
  withTiming as withTiming2,
  FadeIn
} from "react-native-reanimated";

// src/components/wallet/MovingShine.tsx
import { memo, useEffect } from "react";
import { Image, StyleSheet as StyleSheet2 } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming
} from "react-native-reanimated";

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

// src/components/wallet/styles/walletStyles.ts
import { StyleSheet } from "react-native";
var walletStyles = StyleSheet.create({
  // Layout
  flex: {
    flex: 1
  },
  screen: {
    flex: 1,
    backgroundColor: WALLET_COLORS.background
  },
  container: {
    flexDirection: "column-reverse"
  },
  // Header
  header: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "flex-start"
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  // Wallet Card
  cardPressContainer: {
    padding: 24,
    paddingBottom: 0,
    paddingTop: 8
  },
  card: {
    aspectRatio: WALLET_DIMENSIONS.cardAspectRatio,
    width: "100%",
    borderRadius: WALLET_DIMENSIONS.cardBorderRadius,
    backgroundColor: WALLET_COLORS.cardBackground
  },
  cardContainer: {
    margin: 24,
    flex: 1,
    alignSelf: "stretch",
    backgroundColor: WALLET_COLORS.cardInner,
    borderRadius: WALLET_DIMENSIONS.innerBorderRadius,
    paddingBottom: 4
  },
  cardContent: {
    flex: 1,
    padding: 16,
    backgroundColor: WALLET_COLORS.cardContent,
    borderRadius: WALLET_DIMENSIONS.innerBorderRadius,
    borderWidth: 1,
    borderColor: WALLET_COLORS.cardBorder
  },
  cardShadow: {
    width: "80%",
    height: 24,
    backgroundColor: WALLET_COLORS.shadowDark,
    position: "absolute",
    top: "45%",
    left: "10%",
    shadowColor: "black",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 5
  },
  // Balance
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  balanceWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4
  },
  // User Info
  avatarInfo: {
    flexDirection: "row",
    gap: 8
  },
  // Card Cover
  cardCover: {
    aspectRatio: WALLET_DIMENSIONS.coverAspectRatio,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: WALLET_DIMENSIONS.innerBorderRadius,
    borderBottomRightRadius: WALLET_DIMENSIONS.innerBorderRadius,
    overflow: "hidden"
  },
  cardCoverTextContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  // Shine Effect
  shineContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  shineEffect: {
    position: "absolute",
    width: 150,
    left: -60,
    top: -140,
    bottom: 0
  },
  // Text Styles
  whiteText: {
    color: WALLET_COLORS.textWhite
  },
  grayText: {
    color: WALLET_COLORS.textGray
  },
  // Token
  tokenVideo: {
    width: WALLET_DIMENSIONS.tokenVideoSize,
    height: WALLET_DIMENSIONS.tokenVideoSize,
    borderRadius: WALLET_DIMENSIONS.tokenVideoSize,
    overflow: "hidden"
  },
  token: {
    width: WALLET_DIMENSIONS.tokenSize,
    height: WALLET_DIMENSIONS.tokenSize
  },
  tokenContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  textShadow: {
    shadowRadius: 8,
    shadowOpacity: 1
  },
  // Transactions
  txnContent: {
    alignSelf: "stretch",
    paddingHorizontal: 24,
    gap: 32,
    paddingBottom: 24,
    paddingTop: 40
  },
  txnRow: {
    minHeight: 40,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center"
  },
  iconBgTilted: {
    transform: [{ rotate: "-45deg" }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center"
  },
  // States
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 240
  },
  openBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WALLET_COLORS.background,
    opacity: 0.8
  },
  zoDescriptionContainer: {
    position: "absolute",
    bottom: 140
  },
  description: {
    paddingHorizontal: 24,
    color: WALLET_COLORS.textWhite
  },
  // Spacing
  bar: {
    height: 56
  }
});

// src/components/wallet/MovingShine.tsx
import { jsx } from "react/jsx-runtime";
var MovingShine = memo(
  ({ duration = ANIMATIONS.shineDuration }) => {
    const tx = useSharedValue(-100);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: "30deg" }, { translateX: tx.value }]
    }));
    useEffect(() => {
      tx.value = withRepeat(withTiming(420, { duration }), -1, false);
    }, [duration]);
    return /* @__PURE__ */ jsx(Animated.View, { style: [styles.shineEffect, animatedStyle], children: /* @__PURE__ */ jsx(
      Image,
      {
        source: { uri: WALLET_ASSETS.shine },
        style: StyleSheet2.absoluteFillObject,
        resizeMode: "cover"
      }
    ) });
  }
);
MovingShine.displayName = "MovingShine";
var styles = StyleSheet2.create({
  shineEffect: walletStyles.shineEffect
});

// src/components/wallet/ZoToken.tsx
import { View as View2, Image as Image2, StyleSheet as StyleSheet3 } from "react-native";
import { jsx as jsx2 } from "react/jsx-runtime";
var ZO_COIN_GIF = "/zo-coin.gif";
var ZoToken = ({ size = 16, style, source = ZO_COIN_GIF }) => {
  return /* @__PURE__ */ jsx2(View2, { style: [{ width: size, height: size }, style], children: /* @__PURE__ */ jsx2(
    Image2,
    {
      source: { uri: source },
      style: {
        width: size,
        height: size,
        borderRadius: size / 2
      },
      resizeMode: "cover"
    }
  ) });
};
var ZoTokenVideo = ({ size = 24, style, source = ZO_COIN_GIF }) => {
  return /* @__PURE__ */ jsx2(
    View2,
    {
      style: [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden"
        },
        style
      ],
      children: /* @__PURE__ */ jsx2(
        Image2,
        {
          source: { uri: source },
          style: {
            width: size,
            height: size
          },
          resizeMode: "cover"
        }
      )
    }
  );
};
var styles2 = StyleSheet3.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  }
});

// src/lib/utils/wallet.ts
var formatBalance = (balance) => {
  if (balance === 0) return "0";
  const formatted = balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return formatted;
};
var formatWalletAddress = (address) => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
var formatNickname = (nickname) => {
  if (!nickname) return "";
  return nickname.startsWith("@") ? nickname : `@${nickname}`;
};
var getTransactionColor = (action) => {
  return action === "spend" ? "#FF4444" : "#00C853";
};

// src/components/wallet/WalletCard.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var WalletCard = memo2(
  ({ balance, user, isOpen = false, onToggle, isLoading }) => {
    const bgY = useSharedValue2(0);
    const cardY = useSharedValue2(0);
    const animatedBackgroundStyle = useAnimatedStyle2(() => ({
      transform: [{ translateY: bgY.value }]
    }));
    const animatedCardStyle = useAnimatedStyle2(() => ({
      transform: [{ translateY: cardY.value }]
    }));
    useEffect2(() => {
      bgY.value = withTiming2(isOpen ? 200 : 0, { duration: ANIMATIONS.cardTransition });
      cardY.value = withTiming2(isOpen ? -150 : 0, { duration: ANIMATIONS.cardTransition });
    }, [isOpen]);
    const displayName = user.nickname ? formatNickname(user.nickname) : user.first_name || "You";
    const walletText = `${displayName}'s wallet`;
    return /* @__PURE__ */ jsx3(
      Pressable,
      {
        style: styles3.cardPressContainer,
        onPress: onToggle,
        children: /* @__PURE__ */ jsxs(Animated2.View, { style: [styles3.card, animatedBackgroundStyle], children: [
          /* @__PURE__ */ jsx3(
            Image3,
            {
              source: { uri: WALLET_ASSETS.walletBackground },
              style: StyleSheet4.absoluteFillObject,
              resizeMode: "contain"
            }
          ),
          /* @__PURE__ */ jsx3(
            Animated2.View,
            {
              style: styles3.cardShadow,
              entering: FadeIn.duration(ANIMATIONS.fadeInDuration)
            }
          ),
          /* @__PURE__ */ jsx3(Animated2.View, { style: [styles3.cardContainer, animatedCardStyle], children: /* @__PURE__ */ jsxs(View3, { style: styles3.cardContent, children: [
            /* @__PURE__ */ jsxs(View3, { style: styles3.balanceRow, children: [
              /* @__PURE__ */ jsxs(View3, { style: styles3.balanceWrapper, children: [
                /* @__PURE__ */ jsx3(Text, { style: [styles3.whiteText, styles3.balanceAmount], children: formatBalance(balance) }),
                /* @__PURE__ */ jsx3(Text, { style: [styles3.grayText, styles3.currency], children: "$Zo" })
              ] }),
              /* @__PURE__ */ jsx3(ZoTokenVideo, { size: 24 })
            ] }),
            /* @__PURE__ */ jsx3(View3, { style: styles3.flex }),
            user && /* @__PURE__ */ jsxs(View3, { style: styles3.avatarInfo, children: [
              user.avatar?.image && /* @__PURE__ */ jsx3(
                Image3,
                {
                  source: { uri: user.avatar.image },
                  style: styles3.avatar
                }
              ),
              /* @__PURE__ */ jsxs(View3, { style: styles3.flex, children: [
                /* @__PURE__ */ jsx3(Text, { style: [styles3.whiteText, styles3.userName], children: displayName }),
                /* @__PURE__ */ jsx3(Text, { style: [styles3.grayText, styles3.walletAddress], children: formatWalletAddress(user.wallet_address || "") })
              ] })
            ] }),
            /* @__PURE__ */ jsx3(View3, { style: styles3.shineContainer, children: /* @__PURE__ */ jsx3(MovingShine, {}) })
          ] }) }),
          /* @__PURE__ */ jsxs(View3, { style: styles3.cardCover, children: [
            /* @__PURE__ */ jsx3(
              Image3,
              {
                source: { uri: WALLET_ASSETS.walletCover },
                style: StyleSheet4.absoluteFillObject,
                resizeMode: "cover"
              }
            ),
            /* @__PURE__ */ jsx3(View3, { style: styles3.cardCoverTextContainer, children: /* @__PURE__ */ jsx3(Text, { style: [styles3.grayText, styles3.cardCoverText], children: walletText }) })
          ] })
        ] })
      }
    );
  }
);
WalletCard.displayName = "WalletCard";
var styles3 = StyleSheet4.create({
  ...walletStyles,
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700"
  },
  currency: {
    fontSize: 12
  },
  userName: {
    fontSize: 16,
    fontWeight: "600"
  },
  walletAddress: {
    fontSize: 12
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  cardCoverText: {
    fontSize: 16,
    fontWeight: "600"
  }
});

// src/components/wallet/TransactionList.tsx
import { memo as memo4 } from "react";
import { View as View5, Text as Text3, ActivityIndicator, StyleSheet as StyleSheet6 } from "react-native";

// src/components/wallet/TransactionItem.tsx
import { memo as memo3 } from "react";
import { View as View4, Text as Text2, StyleSheet as StyleSheet5 } from "react-native";
import moment from "moment";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var StatusIcon = memo3(() => {
  return /* @__PURE__ */ jsx4(View4, { style: styles4.iconBgTilted, children: /* @__PURE__ */ jsx4(Text2, { style: styles4.iconText, children: "\u2190" }) });
});
StatusIcon.displayName = "StatusIcon";
var TransactionItem = memo3(
  ({ transaction, showDate = true }) => {
    const color = getTransactionColor(transaction.action);
    const formattedAmount = formatBalance(transaction.amount);
    return /* @__PURE__ */ jsxs2(View4, { style: styles4.txnRow, children: [
      /* @__PURE__ */ jsx4(StatusIcon, {}),
      /* @__PURE__ */ jsxs2(View4, { style: styles4.flex, children: [
        /* @__PURE__ */ jsx4(Text2, { style: styles4.description, children: transaction.description }),
        showDate && transaction.claimed_at && /* @__PURE__ */ jsx4(Text2, { style: styles4.date, children: moment(transaction.claimed_at).format("DD MMM hh:mm A") })
      ] }),
      /* @__PURE__ */ jsxs2(View4, { style: styles4.tokenContainer, children: [
        /* @__PURE__ */ jsxs2(
          Text2,
          {
            style: [
              styles4.textShadow,
              {
                shadowColor: color,
                color,
                fontWeight: "600",
                fontSize: 16
              }
            ],
            children: [
              "+ ",
              formattedAmount
            ]
          }
        ),
        /* @__PURE__ */ jsx4(ZoToken, { size: 16 })
      ] })
    ] });
  }
);
TransactionItem.displayName = "TransactionItem";
var styles4 = StyleSheet5.create({
  txnRow: walletStyles.txnRow,
  iconBgTilted: walletStyles.iconBgTilted,
  tokenContainer: walletStyles.tokenContainer,
  textShadow: walletStyles.textShadow,
  flex: {
    flex: 1
  },
  iconText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16
  },
  description: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500"
  },
  date: {
    color: "rgba(255, 255, 255, 0.44)",
    fontSize: 12,
    marginTop: 2
  }
});

// src/components/wallet/TransactionList.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var TransactionList = memo4(
  ({ transactions, isLoading, onEndReached }) => {
    if (isLoading && !transactions?.length) {
      return /* @__PURE__ */ jsx5(View5, { style: styles5.loader, children: /* @__PURE__ */ jsx5(ActivityIndicator, { size: "large", color: "#00C853" }) });
    }
    if (!transactions?.length) {
      return /* @__PURE__ */ jsxs3(View5, { style: styles5.emptyState, children: [
        /* @__PURE__ */ jsx5(Text3, { style: styles5.emptyText, children: "No transactions yet" }),
        /* @__PURE__ */ jsx5(Text3, { style: styles5.emptySubtext, children: "Complete quests to earn $Zo tokens" })
      ] });
    }
    return /* @__PURE__ */ jsx5(View5, { style: styles5.txnContent, children: transactions.map((transaction, index) => /* @__PURE__ */ jsx5(TransactionItem, { transaction }, transaction.id || index)) });
  }
);
TransactionList.displayName = "TransactionList";
var styles5 = StyleSheet6.create({
  txnContent: walletStyles.txnContent,
  loader: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },
  emptySubtext: {
    color: "rgba(255, 255, 255, 0.44)",
    fontSize: 14,
    textAlign: "center"
  }
});

// src/components/wallet/WalletScreen.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var WalletScreen = memo5(({
  user,
  balance,
  transactions,
  isLoading: isLoadingProp = false,
  onBack
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const isLoading = isLoadingProp;
  const toggleView = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsTitleVisible(scrollY > 200);
  }, []);
  const backdrop = useMemo(
    () => isOpen ? /* @__PURE__ */ jsx6(Pressable2, { onPress: toggleView, style: styles6.openBg, children: /* @__PURE__ */ jsx6(View6, {}) }) : null,
    [isOpen, toggleView]
  );
  const description = useMemo(
    () => isOpen ? /* @__PURE__ */ jsx6(Animated3.View, { entering: FadeIn2, exiting: FadeOut, style: styles6.zoDescriptionContainer, children: /* @__PURE__ */ jsx6(Text4, { style: styles6.description, children: "Get Zo World coins as airdrop by completing quests, stay & trips." }) }) : null,
    [isOpen]
  );
  const walletText = `${user.nickname || user.first_name}'s wallet`;
  return /* @__PURE__ */ jsxs4(View6, { style: styles6.screen, children: [
    /* @__PURE__ */ jsxs4(View6, { style: styles6.header, children: [
      /* @__PURE__ */ jsx6(Pressable2, { onPress: onBack, children: /* @__PURE__ */ jsx6(Text4, { style: styles6.backButton, children: "\u2190" }) }),
      /* @__PURE__ */ jsx6(Animated3.View, { pointerEvents: "none", style: styles6.titleContainer, children: isTitleVisible && /* @__PURE__ */ jsx6(Animated3.View, { entering: FadeInUp, exiting: FadeOutUp, children: /* @__PURE__ */ jsx6(Text4, { style: [styles6.whiteText, styles6.headerTitle], children: walletText }) }) })
    ] }),
    /* @__PURE__ */ jsx6(
      ScrollView2,
      {
        contentContainerStyle: styles6.container,
        onScroll: handleScroll,
        scrollEventThrottle: 16,
        showsVerticalScrollIndicator: false,
        children: isLoading ? /* @__PURE__ */ jsx6(Animated3.View, { entering: FadeIn2, exiting: FadeOut, style: styles6.loader, children: /* @__PURE__ */ jsx6(ActivityIndicator2, { size: "large", color: "#00C853" }) }, "loader") : /* @__PURE__ */ jsxs4(Animated3.View, { entering: FadeInDown, style: styles6.container, children: [
          /* @__PURE__ */ jsx6(SafeAreaView, {}),
          /* @__PURE__ */ jsx6(TransactionList, { transactions, isLoading: false }),
          backdrop,
          /* @__PURE__ */ jsx6(
            WalletCard,
            {
              balance,
              user,
              isOpen,
              onToggle: toggleView,
              isLoading
            }
          ),
          /* @__PURE__ */ jsx6(View6, { style: styles6.bar }),
          /* @__PURE__ */ jsx6(SafeAreaView, {})
        ] })
      }
    ),
    description
  ] });
});
WalletScreen.displayName = "WalletScreen";
var styles6 = StyleSheet7.create({
  ...walletStyles,
  backButton: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600"
  }
});

// src/lib/api/client.ts
import axios from "axios";

// src/lib/utils/logger.ts
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};
var Logger = class {
  constructor() {
    this.config = {
      enabled: false,
      level: "warn",
      prefix: "[ZoPassport]"
    };
  }
  /**
   * Configure the logger
   * @param options - Logger configuration
   */
  configure(options) {
    this.config = { ...this.config, ...options };
  }
  /**
   * Enable debug logging
   */
  enable() {
    this.config.enabled = true;
  }
  /**
   * Disable all logging
   */
  disable() {
    this.config.enabled = false;
  }
  /**
   * Set log level
   */
  setLevel(level) {
    this.config.level = level;
  }
  shouldLog(level) {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }
  debug(...args) {
    if (this.shouldLog("debug")) {
      console.log(this.config.prefix, ...args);
    }
  }
  info(...args) {
    if (this.shouldLog("info")) {
      console.info(this.config.prefix, ...args);
    }
  }
  warn(...args) {
    if (this.shouldLog("warn")) {
      console.warn(this.config.prefix, ...args);
    }
  }
  error(...args) {
    if (this.shouldLog("error")) {
      console.error(this.config.prefix, ...args);
    }
  }
};
var logger = new Logger();

// src/lib/utils/storage.ts
var STORAGE_KEYS = {
  ACCESS_TOKEN: "zo_access_token",
  REFRESH_TOKEN: "zo_refresh_token",
  TOKEN_EXPIRY: "zo_token_expiry",
  REFRESH_EXPIRY: "zo_refresh_expiry",
  USER: "zo_user",
  CLIENT_DEVICE_ID: "zo_device_id",
  CLIENT_DEVICE_SECRET: "zo_device_secret",
  AVATAR_URL: "zo_avatar_url",
  NICKNAME: "zo_nickname",
  CITY: "zo_city",
  BODY_TYPE: "zo_body_type"
};
var LocalStorageAdapter = class {
  async getItem(key) {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.warn(`LocalStorage.getItem failed for key "${key}":`, error);
      return null;
    }
  }
  async setItem(key, value) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.warn(`LocalStorage.setItem failed for key "${key}":`, error);
    }
  }
  async removeItem(key) {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.warn(`LocalStorage.removeItem failed for key "${key}":`, error);
    }
  }
};
var AsyncStorageAdapter = class {
  constructor(asyncStorage) {
    this.storage = asyncStorage;
  }
  async getItem(key) {
    try {
      return await this.storage.getItem(key);
    } catch (error) {
      logger.warn(`AsyncStorage.getItem failed for key "${key}":`, error);
      return null;
    }
  }
  async setItem(key, value) {
    try {
      await this.storage.setItem(key, value);
    } catch (error) {
      logger.warn(`AsyncStorage.setItem failed for key "${key}":`, error);
    }
  }
  async removeItem(key) {
    try {
      await this.storage.removeItem(key);
    } catch (error) {
      logger.warn(`AsyncStorage.removeItem failed for key "${key}":`, error);
    }
  }
};
var MemoryStorageAdapter = class {
  constructor() {
    this.store = /* @__PURE__ */ new Map();
  }
  async getItem(key) {
    return this.store.get(key) || null;
  }
  async setItem(key, value) {
    this.store.set(key, value);
  }
  async removeItem(key) {
    this.store.delete(key);
  }
  /** Clear all stored data (useful for testing) */
  clear() {
    this.store.clear();
  }
};

// src/lib/api/client.ts
function generateDeviceCredentials() {
  const deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const deviceSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return { deviceId, deviceSecret };
}
var ZoApiClient = class {
  constructor(config) {
    this.config = config;
    this.storage = config.storageAdapter || new LocalStorageAdapter();
    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.io.zo.xyz",
      timeout: config.timeout || 1e4,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    this.setupInterceptors();
  }
  async setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      config.headers["client-key"] = this.config.clientKey;
      const credentials = await this.getOrCreateDeviceCredentials();
      config.headers["client-device-id"] = credentials.deviceId;
      config.headers["client-device-secret"] = credentials.deviceSecret;
      const token = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            try {
              const response = await this.client.post("/api/v1/auth/token/refresh/", {
                refresh_token: refreshToken
              });
              if (response.data?.access) {
                await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
                if (response.data.refresh) {
                  await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
                }
                originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              await this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              await this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
  async getOrCreateDeviceCredentials() {
    const storedId = await this.storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    const storedSecret = await this.storage.getItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET);
    if (storedId && storedSecret) {
      return { deviceId: storedId, deviceSecret: storedSecret };
    }
    const credentials = generateDeviceCredentials();
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, credentials.deviceId);
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, credentials.deviceSecret);
    return credentials;
  }
  get axiosInstance() {
    return this.client;
  }
  getStorage() {
    return this.storage;
  }
};

// src/lib/api/auth.ts
var ZoAuth = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Send OTP to phone number
   * Step 1 of ZO phone authentication
   */
  async sendOTP(countryCode, phoneNumber) {
    try {
      const payload = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        message_channel: ""
        // Empty string as per ZO API spec
      };
      const response = await this.client.axiosInstance.post(
        "/api/v1/auth/login/mobile/otp/",
        payload
      );
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || "OTP sent successfully"
        };
      }
      return {
        success: false,
        message: response.data?.message || `Unexpected status: ${response.status}`
      };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || errorData?.error || error.message || "Failed to send OTP";
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  /**
   * Verify OTP and authenticate user
   * Step 2 of ZO phone authentication
   * Returns full auth response with tokens and user profile
   */
  async verifyOTP(countryCode, phoneNumber, otp) {
    try {
      const payload = {
        mobile_country_code: countryCode,
        mobile_number: phoneNumber,
        otp
      };
      const response = await this.client.axiosInstance.post(
        "/api/v1/auth/login/mobile/",
        payload
      );
      let responseData;
      if (typeof response.data === "string") {
        try {
          responseData = JSON.parse(response.data);
        } catch {
          return {
            success: false,
            error: "Invalid response format from authentication service"
          };
        }
      } else {
        responseData = response.data;
      }
      if (!responseData || !responseData.user || !responseData.access_token) {
        return {
          success: false,
          error: "Invalid response structure from authentication service"
        };
      }
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await this.client.axiosInstance.post("/api/v1/auth/token/refresh/", {
        refresh_token: refreshToken
      });
      return {
        success: true,
        tokens: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to refresh authentication"
      };
    }
  }
  /**
   * Check if user is authenticated
   */
  async checkLoginStatus(accessToken) {
    try {
      const response = await this.client.axiosInstance.get("/api/v1/auth/login/check/", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return {
        success: true,
        isAuthenticated: response.data.authenticated === true
      };
    } catch {
      return {
        success: false,
        isAuthenticated: false
      };
    }
  }
  /**
   * Extract error message from various ZO API error formats
   */
  extractErrorMessage(error) {
    const errorData = error.response?.data;
    if (errorData) {
      if (errorData.errors && Array.isArray(errorData.errors)) {
        return errorData.errors[0] || "Invalid OTP";
      }
      if (errorData.detail) return errorData.detail;
      if (errorData.message) return errorData.message;
      if (errorData.error) return errorData.error;
    }
    return "Authentication failed";
  }
};

// src/lib/api/profile.ts
var ZoProfile = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Get user profile
   */
  async getProfile(accessToken) {
    try {
      const response = await this.client.axiosInstance.get(
        "/api/v1/profile/me/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        profile: response.data
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to fetch profile"
      };
    }
  }
  /**
   * Update user profile (partial updates supported)
   */
  async updateProfile(accessToken, updates) {
    try {
      const response = await this.client.axiosInstance.post(
        "/api/v1/profile/me/",
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        profile: response.data
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to update profile"
      };
    }
  }
};

// src/lib/api/avatar.ts
var ZoAvatar = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Generate avatar for user
   */
  async generateAvatar(accessToken, bodyType) {
    try {
      const payload = {
        body_type: bodyType
      };
      const response = await this.client.axiosInstance.post(
        "/api/v1/avatar/generate/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        task_id: response.data.task_id,
        status: response.data.status
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to generate avatar"
      };
    }
  }
  /**
   * Check avatar generation status
   */
  async getAvatarStatus(accessToken, taskId) {
    try {
      const response = await this.client.axiosInstance.get(
        `/api/v1/avatar/status/${taskId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return {
        success: true,
        status: response.data.status,
        avatarUrl: response.data.result?.avatar_url
      };
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        error: errorData?.detail || errorData?.message || "Failed to get avatar status"
      };
    }
  }
  /**
   * Poll avatar status until completion
   */
  async pollAvatarStatus(accessToken, taskId, options = {}) {
    const {
      onProgress,
      onComplete,
      onError,
      maxAttempts = 30,
      interval = 2e3
    } = options;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        const timeoutError = "Avatar generation timed out";
        onError?.(timeoutError);
        return;
      }
      const result = await this.getAvatarStatus(accessToken, taskId);
      if (!result.success) {
        onError?.(result.error || "Unknown error");
        return;
      }
      onProgress?.(result.status || "unknown");
      if (result.status === "completed" && result.avatarUrl) {
        onComplete?.(result.avatarUrl);
        return;
      }
      if (result.status === "failed") {
        onError?.("Avatar generation failed");
        return;
      }
      setTimeout(poll, interval);
    };
    poll();
  }
};

// src/lib/api/wallet.ts
var ZO_TOKEN_CONFIG = {
  base: {
    rpc: "https://mainnet.base.org",
    contractAddress: "0x111142c7ecaf39797b7865b82034269962142069",
    // $Zo token on Base
    decimals: 18
  },
  avalanche: {
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    contractAddress: "0x111142c7ecaf39797b7865b82034269962142069",
    // $Zo token on Avalanche (update if different)
    decimals: 18
  }
};
var ERC20_BALANCE_ABI = "0x70a08231";
var ZoWallet = class {
  constructor(client) {
    this.cachedBalance = 0;
    this.userWalletAddress = null;
    this.network = "base";
    this.client = client;
  }
  /**
   * Set the user's wallet address for on-chain queries
   */
  setWalletAddress(address, network = "base") {
    this.userWalletAddress = address;
    this.network = network;
    logger.debug(`Wallet address set: ${address} on ${network}`);
  }
  /**
   * Get wallet balance - tries on-chain first, then API fallback
   * @returns Wallet balance amount
   */
  async getBalance() {
    if (this.userWalletAddress) {
      try {
        const onChainBalance = await this.getOnChainBalance();
        if (onChainBalance !== null) {
          this.cachedBalance = onChainBalance;
          return onChainBalance;
        }
      } catch (error) {
        logger.warn("On-chain balance check failed, falling back to API:", error);
      }
    }
    const apiBalance = await this.getBalanceFromAPI();
    if (apiBalance !== null) {
      return apiBalance;
    }
    logger.debug("Returning cached/default balance:", this.cachedBalance);
    return this.cachedBalance;
  }
  /**
   * Fetch balance directly from blockchain via JSON-RPC
   */
  async getOnChainBalance() {
    if (!this.userWalletAddress) {
      logger.warn("No wallet address set for on-chain query");
      return null;
    }
    const config = ZO_TOKEN_CONFIG[this.network];
    try {
      const paddedAddress = this.userWalletAddress.toLowerCase().replace("0x", "").padStart(64, "0");
      const data = ERC20_BALANCE_ABI + paddedAddress;
      const response = await fetch(config.rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: config.contractAddress,
              data
            },
            "latest"
          ]
        })
      });
      const result = await response.json();
      if (result.error) {
        logger.warn("RPC error:", result.error);
        return null;
      }
      const rawBalance = BigInt(result.result || "0x0");
      const balance = Number(rawBalance) / Math.pow(10, config.decimals);
      logger.debug(`On-chain balance fetched: ${balance} $Zo`);
      return balance;
    } catch (error) {
      logger.warn("Failed to fetch on-chain balance:", error);
      return null;
    }
  }
  /**
   * Fetch balance from Zo API endpoints (tries multiple endpoints with fallback)
   */
  async getBalanceFromAPI() {
    const endpoints = [
      "/api/v1/web3/token/airdrops/summary",
      "/api/v1/wallet/balance",
      "/api/v1/profile/wallet"
    ];
    const errors = [];
    for (const endpoint of endpoints) {
      try {
        const response = await this.client.axiosInstance.get(endpoint);
        const balance = response.data?.data?.total_amount ?? response.data?.balance ?? response.data?.total_amount;
        if (typeof balance === "number") {
          logger.debug(`Balance fetched from API ${endpoint}:`, balance);
          this.cachedBalance = balance;
          return balance;
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          errors.push({
            endpoint,
            status: error?.response?.status,
            message: error?.message || "Unknown error"
          });
        }
      }
    }
    if (errors.length > 0) {
      logger.warn("All balance API endpoints failed:", errors);
    }
    return null;
  }
  /**
   * Get transaction history
   * @param page - Optional page number for pagination
   * @returns Array of transactions
   */
  async getTransactions(page) {
    const endpoints = [
      page ? `/api/v1/profile/completion-grants/claims?page=${page}` : "/api/v1/profile/completion-grants/claims",
      page ? `/api/v1/wallet/transactions?page=${page}` : "/api/v1/wallet/transactions"
    ];
    const errors = [];
    for (const url of endpoints) {
      try {
        const response = await this.client.axiosInstance.get(url);
        const data = response.data?.data || response.data;
        return {
          transactions: data?.results ?? data?.transactions ?? [],
          next: data?.next,
          previous: data?.previous,
          count: data?.count ?? 0
        };
      } catch (error) {
        if (error?.response?.status !== 404) {
          errors.push({
            endpoint: url,
            status: error?.response?.status,
            message: error?.message || "Unknown error"
          });
        }
      }
    }
    if (errors.length > 0) {
      logger.warn("All transaction API endpoints failed:", errors);
    }
    return {
      transactions: [],
      next: void 0,
      previous: void 0,
      count: 0
    };
  }
};

// src/ZoPassportSDK.ts
var ZoPassportSDK = class {
  constructor(config) {
    this.refreshTimer = null;
    this._user = null;
    this._isAuthenticated = false;
    if (config.debug) {
      logger.enable();
      logger.setLevel("debug");
    }
    this.storage = config.storageAdapter || new LocalStorageAdapter();
    this.client = new ZoApiClient({
      ...config,
      storageAdapter: this.storage
    });
    this.auth = new ZoAuth(this.client);
    this.profile = new ZoProfile(this.client);
    this.avatar = new ZoAvatar(this.client);
    this.wallet = new ZoWallet(this.client);
    if (config.autoRefresh !== false) {
      this.startAutoRefresh(config.refreshInterval || 6e4);
    }
    this._readyPromise = this.loadSession();
    logger.debug("SDK initialized with config:", {
      baseUrl: config.baseUrl,
      autoRefresh: config.autoRefresh !== false
    });
  }
  /**
   * Wait for the SDK to be ready (session loaded from storage)
   * Use this if you need to check isAuthenticated immediately after construction
   */
  async ready() {
    return this._readyPromise;
  }
  // =====================
  // Session Management
  // =====================
  async loadSession() {
    try {
      const userJson = await this.storage.getItem(STORAGE_KEYS.USER);
      const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (userJson && accessToken) {
        this._user = JSON.parse(userJson);
        this._isAuthenticated = true;
      }
    } catch (error) {
      logger.warn("Failed to load session:", error);
    }
  }
  async saveSession(authResponse) {
    await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.access_token);
    await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refresh_token);
    await this.storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, authResponse.access_token_expiry);
    await this.storage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, authResponse.refresh_token_expiry);
    await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_ID, authResponse.device_id || "");
    await this.storage.setItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET, authResponse.device_secret || "");
    this._user = authResponse.user;
    this._isAuthenticated = true;
  }
  async clearSession() {
    await this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await this.storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    await this.storage.removeItem(STORAGE_KEYS.REFRESH_EXPIRY);
    await this.storage.removeItem(STORAGE_KEYS.USER);
    await this.storage.removeItem(STORAGE_KEYS.CLIENT_DEVICE_ID);
    await this.storage.removeItem(STORAGE_KEYS.CLIENT_DEVICE_SECRET);
    this._user = null;
    this._isAuthenticated = false;
  }
  // =====================
  // Auto Token Refresh
  // =====================
  startAutoRefresh(interval) {
    this.refreshTimer = setInterval(async () => {
      await this.refreshTokenIfNeeded();
    }, interval);
  }
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  async refreshTokenIfNeeded() {
    const tokenExpiry = await this.storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!tokenExpiry || !refreshToken) return;
    const expiryDate = new Date(tokenExpiry);
    const now = /* @__PURE__ */ new Date();
    const twoMinutes = 2 * 60 * 1e3;
    if (expiryDate.getTime() - now.getTime() < twoMinutes) {
      const result = await this.auth.refreshAccessToken(refreshToken);
      if (result.success && result.tokens) {
        await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.tokens.access);
        await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.tokens.refresh);
        await this.storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, result.tokens.access_expiry);
        await this.storage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, result.tokens.refresh_expiry);
      }
    }
  }
  // =====================
  // Public API
  // =====================
  get user() {
    return this._user;
  }
  get isAuthenticated() {
    return this._isAuthenticated;
  }
  /**
   * Complete phone authentication flow
   */
  async loginWithPhone(countryCode, phoneNumber, otp) {
    const result = await this.auth.verifyOTP(countryCode, phoneNumber, otp);
    if (result.success && result.data) {
      await this.saveSession(result.data);
      if (result.data.user?.wallet_address) {
        this.wallet.setWalletAddress(result.data.user.wallet_address, "base");
      }
      return { success: true, user: result.data.user };
    }
    return { success: false, error: result.error };
  }
  /**
   * Logout and clear session
   */
  async logout() {
    await this.clearSession();
    this.stopAutoRefresh();
  }
  /**
   * Get current user profile
   */
  async getProfile() {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;
    const result = await this.profile.getProfile(accessToken);
    if (result.success && result.profile) {
      this._user = result.profile;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));
      if (result.profile.wallet_address) {
        this.wallet.setWalletAddress(result.profile.wallet_address, "base");
      }
      return result.profile;
    }
    return null;
  }
  /**
   * Update user profile
   */
  async updateProfile(updates) {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: "Not authenticated" };
    const result = await this.profile.updateProfile(accessToken, updates);
    if (result.success && result.profile) {
      this._user = result.profile;
      await this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.profile));
      return { success: true, profile: result.profile };
    }
    return { success: false, error: result.error };
  }
  /**
   * Generate avatar
   */
  async generateAvatar(bodyType) {
    const accessToken = await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return { success: false, error: "Not authenticated" };
    const startResult = await this.avatar.generateAvatar(accessToken, bodyType);
    if (!startResult.success || !startResult.task_id) {
      return { success: false, error: startResult.error };
    }
    return new Promise((resolve) => {
      this.avatar.pollAvatarStatus(accessToken, startResult.task_id, {
        onComplete: (avatarUrl) => {
          resolve({ success: true, avatarUrl });
        },
        onError: (error) => {
          resolve({ success: false, error });
        }
      });
    });
  }
  /**
   * Get wallet balance
   */
  async getWalletBalance() {
    return this.wallet.getBalance();
  }
  /**
   * Get wallet transactions
   */
  async getWalletTransactions(page) {
    return this.wallet.getTransactions(page);
  }
  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoRefresh();
  }
};
export {
  AsyncStorageAdapter,
  MemoryStorageAdapter,
  MovingShine,
  STORAGE_KEYS,
  TransactionItem,
  TransactionList,
  WalletCard,
  WalletScreen,
  ZoPassportSDK,
  ZoToken,
  ZoTokenVideo
};
//# sourceMappingURL=react-native.mjs.map