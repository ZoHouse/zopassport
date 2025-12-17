// WalletCardWeb.tsx - Web-compatible Wallet Card Component
// Uses CSS and DOM APIs instead of React Native primitives

import React, { useEffect, memo } from 'react';
import { formatBalance, formatWalletAddress, formatNickname } from '../../lib/utils/wallet';
import { injectStyles } from '../../lib/utils/styles';
import type { WalletCardProps } from '../../lib/types/wallet';

// Zo coin asset
const ZO_COIN_URL = '/zo-coin.gif';

const STYLE_ID = 'zo-wallet-card-web-styles';
const CSS = `
    .zo-wallet-card-web {
      position: relative;
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1.6;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      font-family: 'Rubik', system-ui, sans-serif;
    }

    .zo-wallet-card-web:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }

    .zo-wallet-card-web.is-open {
      transform: translateY(-20px);
    }

    .zo-wallet-card-web-inner {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 20px;
      z-index: 1;
    }

    .zo-wallet-card-web-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.05),
        transparent
      );
      animation: zo-wallet-shine 3s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes zo-wallet-shine {
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
    }

    .zo-wallet-card-web-balance-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .zo-wallet-card-web-balance-wrapper {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .zo-wallet-card-web-balance {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .zo-wallet-card-web-currency {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
    }

    .zo-wallet-card-web-coin {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .zo-wallet-card-web-spacer {
      flex: 1;
    }

    .zo-wallet-card-web-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .zo-wallet-card-web-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.15);
    }

    .zo-wallet-card-web-avatar-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #333 0%, #222 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      border: 2px solid rgba(255,255,255,0.15);
    }

    .zo-wallet-card-web-user-info {
      flex: 1;
      min-width: 0;
    }

    .zo-wallet-card-web-username {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .zo-wallet-card-web-address {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      margin: 0;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .zo-wallet-card-web-loading {
      opacity: 0.5;
    }

    .zo-wallet-card-web-cover {
      position: absolute;
      inset: 0;
      background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
      z-index: 2;
    }

    .zo-wallet-card-web.is-open .zo-wallet-card-web-cover {
      opacity: 0;
      pointer-events: none;
    }

    .zo-wallet-card-web-cover-text {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      font-weight: 500;
    }

    .zo-wallet-card-web-stitch {
      position: absolute;
      inset: 6px;
      border: 1px dashed rgba(255,255,255,0.15);
      border-radius: 12px;
      pointer-events: none;
    }
`;

export const WalletCardWeb: React.FC<WalletCardProps> = memo(({
  balance,
  user,
  isOpen = false,
  onToggle,
  isLoading = false,
}) => {
  useEffect(() => {
    const cleanup = injectStyles(STYLE_ID, CSS);
    return cleanup;
  }, []);

  const displayName = user.nickname
    ? formatNickname(user.nickname)
    : user.first_name || 'You';

  const walletText = `${user.first_name || 'Your'}'s wallet`;

  return (
    <div
      className={`zo-wallet-card-web ${isOpen ? 'is-open' : ''} ${isLoading ? 'zo-wallet-card-web-loading' : ''}`}
      onClick={onToggle}
    >
      {/* Shine Effect */}
      <div className="zo-wallet-card-web-shine" />
      
      {/* Stitch Effect */}
      <div className="zo-wallet-card-web-stitch" />

      {/* Card Content */}
      <div className="zo-wallet-card-web-inner">
        {/* Balance Row */}
        <div className="zo-wallet-card-web-balance-row">
          <div className="zo-wallet-card-web-balance-wrapper">
            <p className="zo-wallet-card-web-balance">
              {isLoading ? '...' : formatBalance(balance)}
            </p>
            <span className="zo-wallet-card-web-currency">$Zo</span>
          </div>
          <img
            src={ZO_COIN_URL}
            alt="Zo Coin"
            className="zo-wallet-card-web-coin"
          />
        </div>

        <div className="zo-wallet-card-web-spacer" />

        {/* User Info */}
        <div className="zo-wallet-card-web-user">
          {user.avatar?.image ? (
            <img
              src={user.avatar.image}
              alt={displayName}
              className="zo-wallet-card-web-avatar"
            />
          ) : (
            <div className="zo-wallet-card-web-avatar-placeholder">
              {(user.first_name?.[0] || 'Z').toUpperCase()}
            </div>
          )}
          <div className="zo-wallet-card-web-user-info">
            <p className="zo-wallet-card-web-username">{displayName}</p>
            <p className="zo-wallet-card-web-address">
              {formatWalletAddress(user.wallet_address || '')}
            </p>
          </div>
        </div>
      </div>

      {/* Cover (shown when closed) */}
      <div className="zo-wallet-card-web-cover">
        <span className="zo-wallet-card-web-cover-text">{walletText}</span>
      </div>
    </div>
  );
});

WalletCardWeb.displayName = 'WalletCardWeb';

export default WalletCardWeb;

