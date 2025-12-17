// src/components/ZoPassportPage.tsx
// Full Passport Page with all profile information - Mobile Responsive

import React, { useEffect } from 'react';
import { ZoPassportCard } from './ZoPassportCard';
import { WalletCard } from './wallet'; // Uses WalletCardWeb (web-compatible)
import type { ZoUser } from '../lib/types';
import { CULTURE_STICKERS } from '../../assets';

// Extended culture sticker mapping with aliases for flexible matching
const CULTURE_STICKER_MAP: Record<string, string> = {
  // Base mappings from CULTURE_STICKERS
  ...CULTURE_STICKERS,
  // Aliases for common variations
  'game': CULTURE_STICKERS.gaming,
  'games': CULTURE_STICKERS.gaming,
  'sport': CULTURE_STICKERS.sports,
  // Full name variants (for when API returns full names)
  'travel & adventure': CULTURE_STICKERS.travel,
  'science & technology': CULTURE_STICKERS.tech,
  'music & entertainment': CULTURE_STICKERS.music,
  'health & fitness': CULTURE_STICKERS.fitness,
  'literature & stories': CULTURE_STICKERS.literature,
  'television & cinema': CULTURE_STICKERS.cinema,
  'nature & wildlife': CULTURE_STICKERS.nature,
  'home & lifestyle': CULTURE_STICKERS.lifestyle,
  'stories & journal': CULTURE_STICKERS.stories,
  // Special cultures
  'follow-your-heart': '/cultural-stickers/FollowYourHeart.png',
  'followyourheart': '/cultural-stickers/FollowYourHeart.png',
  'follow your heart': '/cultural-stickers/FollowYourHeart.png',
  'law & order': CULTURE_STICKERS.law,
};

// Culture can be a string (culture key) or an object with key/name/icon
type CultureItem = string | { key?: string; name?: string; icon?: string };

const getCultureSticker = (culture: CultureItem): string => {
  // Handle string cultures (just the key)
  if (typeof culture === 'string') {
    const keyMatch = CULTURE_STICKER_MAP[culture.toLowerCase()];
    if (keyMatch) return keyMatch;
    return '/cultural-stickers/FollowYourHeart.png';
  }
  // Handle object cultures
  if (culture.key) {
    const keyMatch = CULTURE_STICKER_MAP[culture.key.toLowerCase()];
    if (keyMatch) return keyMatch;
  }
  if (culture.name) {
    const nameMatch = CULTURE_STICKER_MAP[culture.name.toLowerCase()];
    if (nameMatch) return nameMatch;
    const nameLower = culture.name.toLowerCase();
    for (const [mapKey, path] of Object.entries(CULTURE_STICKER_MAP)) {
      if (nameLower.includes(mapKey) || mapKey.includes(nameLower)) {
        return path;
      }
    }
  }
  if (culture.icon && !culture.icon.includes('proxy.cdn.zo.xyz/profile/culture')) {
    return culture.icon;
  }
  return '/cultural-stickers/FollowYourHeart.png';
};

const getCultureName = (culture: CultureItem): string => {
  if (typeof culture === 'string') return culture;
  return culture.name || culture.key || 'Culture';
};

const getCultureKey = (culture: CultureItem): string => {
  if (typeof culture === 'string') return culture;
  return culture.key || culture.name || '';
};

export interface ZoPassportPageProps {
  user: ZoUser | null;
  balance?: number;
  completion?: { done: number; total: number };
  walletOpen?: boolean;
  onWalletToggle?: () => void;
  onRemoveCulture?: (cultureKey: string) => void;
}

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Not set';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatPhone = (phone?: string, countryCode?: string): string => {
  if (!phone) return 'Not set';
  return countryCode ? `${countryCode}${phone}` : phone;
};

import { injectStyles } from '../lib/utils/styles';

const STYLE_ID = 'zo-passport-responsive-styles';
const CSS = `
    .zo-passport-container {
      width: 100%;
      min-height: auto;
      background: #000000;
      color: #FFFFFF;
      font-family: 'Rubik', system-ui, sans-serif;
      padding: 16px;
      padding-bottom: 60px;
      box-sizing: border-box;
    }
    
    .zo-passport-header {
      margin-bottom: 24px;
      text-align: center;
    }
    
    .zo-passport-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      font-family: 'Syne', system-ui, sans-serif;
    }
    
    .zo-passport-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin: 4px 0 0 0;
    }
    
    .zo-passport-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .zo-passport-card-section {
      display: flex;
      justify-content: center;
    }
    
    .zo-passport-section {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 20px;
    }
    
    .zo-passport-section-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 16px 0;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .zo-passport-info-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .zo-passport-info-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .zo-passport-info-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .zo-passport-info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    
    .zo-passport-info-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .zo-passport-info-value {
      font-size: 13px;
      color: #FFFFFF;
      word-break: break-word;
    }
    
    .zo-passport-wallet-wrapper {
      margin-bottom: 16px;
    }
    
    .zo-passport-cultures {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
    }
    
    .zo-passport-cultures-header {
      margin-bottom: 12px;
    }
    
    .zo-passport-cultures-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .zo-passport-culture-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .zo-passport-culture-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 6px 10px;
    }
    
    .zo-passport-culture-sticker {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
    
    .zo-passport-culture-name {
      font-size: 11px;
      color: #FFFFFF;
      font-weight: 500;
    }
    
    .zo-passport-culture-remove {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      margin-left: 2px;
    }
    
    .zo-passport-loading {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      text-align: center;
      padding: 40px;
    }
    
    /* Tablet (768px+) */
    @media (min-width: 768px) {
      .zo-passport-container {
        padding: 24px;
      }
      
      .zo-passport-header {
        text-align: left;
        margin-bottom: 32px;
      }
      
      .zo-passport-title {
        font-size: 28px;
      }
      
      .zo-passport-subtitle {
        font-size: 14px;
      }
      
      .zo-passport-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 32px;
      }
      
      .zo-passport-card-section {
        justify-content: flex-start;
      }
      
      .zo-passport-content-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      
      .zo-passport-section-title {
        font-size: 15px;
        margin-bottom: 20px;
      }
      
      .zo-passport-info-icon {
        font-size: 18px;
        width: 24px;
      }
      
      .zo-passport-info-label {
        font-size: 11px;
      }
      
      .zo-passport-info-value {
        font-size: 14px;
      }
      
      .zo-passport-culture-sticker {
        width: 18px;
        height: 18px;
      }
      
      .zo-passport-culture-name {
        font-size: 12px;
      }
    }
    
    /* Desktop (1024px+) */
    @media (min-width: 1024px) {
      .zo-passport-container {
        padding: 40px;
      }
      
      .zo-passport-header {
        margin-bottom: 40px;
      }
      
      .zo-passport-title {
        font-size: 32px;
      }
      
      .zo-passport-grid {
        grid-template-columns: auto 1fr 1fr;
        gap: 48px;
      }
      
      .zo-passport-content-columns {
        display: contents;
      }
      
      .zo-passport-section {
        padding: 24px;
      }
      
      .zo-passport-info-list {
        gap: 20px;
      }
      
      .zo-passport-culture-sticker {
        width: 20px;
        height: 20px;
      }
      
      .zo-passport-culture-name {
        font-size: 13px;
      }
    }
`;

export const ZoPassportPage: React.FC<ZoPassportPageProps> = ({
  user,
  balance = 0,
  completion = { done: 0, total: 10 },
  walletOpen = false,
  onWalletToggle,
  onRemoveCulture,
}) => {
  useEffect(() => {
    const cleanup = injectStyles(STYLE_ID, CSS);
    return cleanup;
  }, []);

  if (!user) {
    return (
      <div className="zo-passport-container">
        <p className="zo-passport-loading">Loading passport...</p>
      </div>
    );
  }

  const isFounder = user.membership === 'founder';
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Not set';
  const cultures = user.cultures || [];

  return (
    <div className="zo-passport-container">
      {/* Header */}
      <div className="zo-passport-header">
        <h1 className="zo-passport-title">Zo Passport</h1>
        <p className="zo-passport-subtitle">Your identity in Zo World</p>
      </div>

      {/* Main Content Grid */}
      <div className="zo-passport-grid">
        {/* Passport Card */}
        <div className="zo-passport-card-section">
          <ZoPassportCard
            profile={{
              avatar: user.avatar?.image || user.pfp_image,
              name: user.first_name || 'Citizen',
              isFounder,
            }}
            completion={completion}
          />
        </div>

        {/* Content Columns */}
        <div className="zo-passport-content-columns">
          {/* General Information */}
          <div className="zo-passport-section">
            <h2 className="zo-passport-section-title">General Information</h2>
            <div className="zo-passport-info-list">
              <InfoRow icon="✏️" label="Full Name" value={fullName} />
              <InfoRow icon="👤" label="Short Bio" value={user.bio || 'Not set'} />
              <InfoRow icon="🎂" label="Born on" value={formatDate(user.date_of_birth)} />
              <InfoRow icon="🧬" label="Body Type" value={user.body_type ? user.body_type.charAt(0).toUpperCase() + user.body_type.slice(1) : 'Not set'} />
              <InfoRow icon="📍" label="Location" value={user.place_name || 'Not set'} />
            </div>

            {/* Communication */}
            <h2 className="zo-passport-section-title" style={{ marginTop: 24 }}>Communication</h2>
            <div className="zo-passport-info-list">
              <InfoRow icon="📧" label="Email" value={user.email_address || 'Not set'} />
              <InfoRow icon="📱" label="Phone" value={formatPhone(user.mobile_number)} />
            </div>
          </div>

          {/* Wallet & Cultures */}
          <div className="zo-passport-section">
            <h2 className="zo-passport-section-title">For the Culture</h2>
            
            {/* Wallet Card */}
            <div className="zo-passport-wallet-wrapper">
              <WalletCard
                balance={balance}
                user={{
                  avatar: user.avatar?.image ? { image: user.avatar.image } : undefined,
                  first_name: user.first_name || 'Citizen',
                  nickname: user.first_name,
                  wallet_address: user.wallet_address || '',
                }}
                isOpen={walletOpen}
                onToggle={onWalletToggle}
              />
            </div>

            {/* Cultures */}
            {cultures.length > 0 && (
              <div className="zo-passport-cultures">
                <div className="zo-passport-cultures-header">
                  <span className="zo-passport-cultures-title">
                    Selected Cultures ({cultures.length})
                  </span>
                </div>
                <div className="zo-passport-culture-tags">
                  {cultures.map((culture, index) => (
                    <CultureTag
                      key={getCultureKey(culture) || index}
                      stickerUrl={getCultureSticker(culture)}
                      name={getCultureName(culture)}
                      onRemove={onRemoveCulture ? () => onRemoveCulture(getCultureKey(culture)) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Row Component
const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="zo-passport-info-row">
    <span className="zo-passport-info-icon">{icon}</span>
    <div className="zo-passport-info-content">
      <span className="zo-passport-info-label">{label}</span>
      <span className="zo-passport-info-value">{value}</span>
    </div>
  </div>
);

// Culture Tag Component
const CultureTag: React.FC<{ stickerUrl: string; name: string; onRemove?: () => void }> = ({ stickerUrl, name, onRemove }) => (
  <div className="zo-passport-culture-tag">
    <img 
      src={stickerUrl} 
      alt={name} 
      className="zo-passport-culture-sticker"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <span className="zo-passport-culture-name">{name}</span>
    {onRemove && (
      <button className="zo-passport-culture-remove" onClick={onRemove}>×</button>
    )}
  </div>
);

export default ZoPassportPage;
