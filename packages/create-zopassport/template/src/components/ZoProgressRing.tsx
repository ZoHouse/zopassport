// src/components/ZoProgressRing.tsx
// Circular progress ring component

import React from 'react';

export interface ZoProgressRingProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Size in pixels (default: 140) */
  size?: number;
  /** Stroke width in pixels (default: 4) */
  strokeWidth?: number;
  /** Primary stroke color (default: #FFFFFF) */
  primaryColor?: string;
  /** Secondary/background stroke color (default: rgba(255,255,255,0.2)) */
  secondaryColor?: string;
}

export const ZoProgressRing: React.FC<ZoProgressRingProps> = ({
  progress,
  size = 140,
  strokeWidth = 4,
  primaryColor = '#FFFFFF',
  secondaryColor = 'rgba(255,255,255,0.2)',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        stroke={secondaryColor}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
    </svg>
  );
};

