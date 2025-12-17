// src/components/ZoPassportCard.tsx
// Leather passport card component

import React from 'react';
import { ZoProgressRing } from './ZoProgressRing';
import { FounderBadge } from './FounderBadge';
import { ZoAvatar } from './ZoAvatar';

// CDN URLs for passport backgrounds
const FOUNDER_BG = 'https://proxy.cdn.zo.xyz/gallery/media/images/a1659b07-94f0-4490-9b3c-3366715d9717_20250515053726.png';
const CITIZEN_BG = 'https://proxy.cdn.zo.xyz/gallery/media/images/bda9da5a-eefe-411d-8d90-667c80024463_20250515053805.png';

export interface ZoPassportCardProps {
  /** User profile data */
  profile: {
    avatar?: string;
    name?: string;
    isFounder?: boolean;
  };
  /** Profile completion */
  completion: {
    done: number;
    total: number;
  };
  /** Additional CSS class */
  className?: string;
  /** Optional: Override founder background URL */
  founderBgUrl?: string;
  /** Optional: Override citizen background URL */
  citizenBgUrl?: string;
  /** Optional: Default avatar fallback URL */
  defaultAvatarUrl?: string;
}

export const ZoPassportCard: React.FC<ZoPassportCardProps> = ({
  profile,
  completion,
  className = '',
  founderBgUrl = FOUNDER_BG,
  citizenBgUrl = CITIZEN_BG,
  defaultAvatarUrl = '/images/rank1.jpeg',
}) => {
  const isFounder = profile?.isFounder || false;
  const name = profile?.name || 'New Citizen';
  const avatar = profile?.avatar || defaultAvatarUrl;
  const done = completion?.done || 0;
  const total = completion?.total || 1;
  const progress = Math.min(100, Math.max(0, (done / total) * 100));

  const bgImage = isFounder ? founderBgUrl : citizenBgUrl;
  const textColor = isFounder ? 'white' : '#111111';
  const shadowStyle = isFounder
    ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    : '0 20px 25px -5px rgba(241, 86, 63, 0.5), 0 8px 10px -6px rgba(241, 86, 63, 0.1)';

  return (
    <div
      className={`zo-passport-card ${className}`}
      style={{
        position: 'relative',
        width: '234px',
        height: '300px',
        borderRadius: '0 20px 20px 0',
        overflow: 'hidden',
        fontFamily: 'Rubik, system-ui, sans-serif',
        boxShadow: shadowStyle,
      }}
    >
      {/* Background Image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img
          src={bgImage}
          alt="Passport Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Circular Progress - Centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: '-10px',
        }}
      >
        <ZoProgressRing
          progress={progress}
          size={140}
          strokeWidth={4}
          primaryColor={isFounder ? '#FFFFFF' : '#111111'}
          secondaryColor={isFounder ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
        />
      </div>

      {/* Avatar - Centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: '-10px',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <ZoAvatar src={avatar} name={name} size={120} />
        </div>

        {/* Founder Badge */}
        {isFounder && (
          <div
            style={{
              position: 'absolute',
              bottom: '84px',
              right: '60px',
            }}
          >
            <FounderBadge size={32} />
          </div>
        )}
      </div>

      {/* Text Container - Bottom */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '16px',
          textAlign: 'center',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '24px',
            color: textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '10px',
            lineHeight: '14px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: textColor,
            opacity: 0.7,
          }}
        >
          {isFounder ? 'Founder of Zo World' : 'Citizen of Zo World'}
        </p>
      </div>
    </div>
  );
};

