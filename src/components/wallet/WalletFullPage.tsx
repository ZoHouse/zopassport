// WalletFullPage.tsx - Full screen wallet page matching passport wallet design
import React, { useEffect } from 'react';
import type { ZoUser } from '../../lib/types';
import { formatWalletAddress } from '../../lib/utils/wallet';
import { injectStyles } from '../../lib/utils/styles';

// Zo coin asset
const ZO_COIN_URL = '/zo-coin.gif';

// Wallet background (leather texture)
const WALLET_BG = 'https://proxy.cdn.zo.xyz/public/wallet-background.png';

export interface WalletFullPageProps {
  user: ZoUser | null;
  balance: number;
  onClose: () => void;
  zoCoinUrl?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const STYLE_ID = 'zo-wallet-fullpage-styles';
const CSS = `
    .zo-wallet-fullpage {
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: 'Rubik', system-ui, sans-serif;
      color: #fff;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .zo-wallet-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: sticky;
      top: 0;
      background: #000;
      z-index: 10;
    }
    
    .zo-wallet-back {
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .zo-wallet-header-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    
    .zo-wallet-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 60px;
    }
    
    /* Wallet Card - Leather Style */
    .zo-wallet-leather-card {
      position: relative;
      width: 100%;
      max-width: 360px;
      aspect-ratio: 1.6;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 2px dashed rgba(255,255,255,0.15);
      box-shadow: 
        0 20px 40px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1);
      margin-bottom: 24px;
    }
    
    .zo-wallet-leather-bg {
      position: absolute;
      inset: 0;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.5;
    }
    
    .zo-wallet-leather-content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 24px;
    }
    
    /* Balance Section */
    .zo-wallet-balance-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: auto;
    }
    
    .zo-wallet-balance-left {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    
    .zo-wallet-balance-amount {
      font-size: 42px;
      font-weight: 700;
      margin: 0;
      color: #fff;
    }
    
    .zo-wallet-balance-currency {
      font-size: 16px;
      color: rgba(255,255,255,0.6);
    }
    
    .zo-wallet-coin {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    
    /* User Section */
    .zo-wallet-user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .zo-wallet-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.2);
    }
    
    .zo-wallet-user-details {
      flex: 1;
    }
    
    .zo-wallet-user-name {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 2px 0;
      color: #fff;
    }
    
    .zo-wallet-user-address {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      margin: 0;
      font-family: monospace;
    }
    
    /* Wallet Label */
    .zo-wallet-label {
      text-align: center;
      padding: 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      margin-top: 8px;
    }
    
    .zo-wallet-label-text {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      margin: 0;
    }
    
    /* Info Section */
    .zo-wallet-info-section {
      width: 100%;
      max-width: 360px;
      margin-top: 24px;
    }
    
    .zo-wallet-info-title {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .zo-wallet-info-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
    }
    
    .zo-wallet-info-text {
      font-size: 13px;
      color: rgba(255,255,255,0.6);
      line-height: 1.6;
      margin: 0;
    }
    
    /* Stitching Effect */
    .zo-wallet-stitch {
      position: absolute;
      border: 1px dashed rgba(255,255,255,0.2);
      border-radius: 12px;
      inset: 8px;
      pointer-events: none;
    }
    
    @media (min-width: 768px) {
      .zo-wallet-leather-card {
        max-width: 420px;
      }
      
      .zo-wallet-balance-amount {
        font-size: 56px;
      }
      
      .zo-wallet-coin {
        width: 56px;
        height: 56px;
      }
      
      .zo-wallet-leather-content {
        padding: 32px;
      }
    }
`;

export const WalletFullPage: React.FC<WalletFullPageProps> = ({
  user,
  balance,
  onClose,
  zoCoinUrl = ZO_COIN_URL,
  isLoading = false,
  onRefresh,
}) => {
  useEffect(() => {
    const cleanupStyles = injectStyles(STYLE_ID, CSS);
    document.body.style.overflow = 'hidden';
    return () => {
      cleanupStyles();
      document.body.style.overflow = '';
    };
  }, []);

  const displayName = user?.first_name || 'Citizen';

  return (
    <div className="zo-wallet-fullpage">
      {/* Header */}
      <div className="zo-wallet-header">
        <button className="zo-wallet-back" onClick={onClose}>
          ←
        </button>
        <h1 className="zo-wallet-header-title">{displayName}'s Wallet</h1>
        {onRefresh && (
          <button 
            className="zo-wallet-refresh" 
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              cursor: isLoading ? 'wait' : 'pointer',
              fontSize: '12px',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? '...' : '↻ Refresh'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="zo-wallet-content">
        {/* Leather Wallet Card */}
        <div className="zo-wallet-leather-card">
          <div className="zo-wallet-leather-bg" />
          <div className="zo-wallet-stitch" />
          
          <div className="zo-wallet-leather-content">
            {/* Balance */}
            <div className="zo-wallet-balance-section">
              <div className="zo-wallet-balance-left">
                <h2 className="zo-wallet-balance-amount" style={{ opacity: isLoading ? 0.5 : 1 }}>
                  {isLoading ? '...' : balance}
                </h2>
                <span className="zo-wallet-balance-currency">$Zo</span>
              </div>
              <img 
                src={zoCoinUrl} 
                alt="Zo Coin" 
                className="zo-wallet-coin"
                style={{ 
                  animation: isLoading ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </div>

            {/* User Info */}
            {user && (
              <div className="zo-wallet-user-section">
                {(user.avatar?.image || user.pfp_image) && (
                  <img 
                    src={user.avatar?.image || user.pfp_image} 
                    alt={displayName}
                    className="zo-wallet-avatar"
                  />
                )}
                <div className="zo-wallet-user-details">
                  <p className="zo-wallet-user-name">{displayName}</p>
                  <p className="zo-wallet-user-address">
                    {formatWalletAddress(user.wallet_address || '')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Label */}
        <div className="zo-wallet-label">
          <p className="zo-wallet-label-text">{displayName}'s wallet</p>
        </div>

        {/* Info Section */}
        <div className="zo-wallet-info-section">
          <h3 className="zo-wallet-info-title">About $Zo</h3>
          <div className="zo-wallet-info-card">
            <p className="zo-wallet-info-text">
              Earn $Zo tokens by completing quests, exploring locations, 
              booking stays, and participating in the Zo World ecosystem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletFullPage;
