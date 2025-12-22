// src/components/ZoAvatar.tsx
// Avatar display component with initials fallback (no default image)

import React, { useState, useEffect } from 'react';

export interface ZoAvatarProps {
  /** Avatar image URL */
  src?: string;
  /** User name (for alt text and initials) */
  name?: string;
  /** Size in pixels (default: 120) */
  size?: number;
  /** Additional CSS class */
  className?: string;
}

export const ZoAvatar: React.FC<ZoAvatarProps> = ({
  src,
  name = 'User',
  size = 120,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(src || null);
  const [hasError, setHasError] = useState(false);

  // Update imgSrc when src prop changes
  useEffect(() => {
    setImgSrc(src || null);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(null); // Show initials on error instead of fallback image
    }
  };

  // Generate initials for text fallback
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`zo-avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={name}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span
          style={{
            fontSize: size * 0.4,
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'Rubik, system-ui, sans-serif',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};

