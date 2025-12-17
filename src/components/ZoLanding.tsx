// src/components/ZoLanding.tsx
// Landing page component with video background

import React, { useState } from 'react';
import { ZoAuth } from './ZoAuth';

export interface ZoLandingProps {
  /** Callback when user successfully authenticates */
  onAuthSuccess: (userId: string, user: any) => void;
  /** Send OTP function (from SDK) */
  sendOTP: (countryCode: string, phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  /** Verify OTP function (from SDK) */
  verifyOTP: (countryCode: string, phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  /** Video background URL */
  videoUrl?: string;
  /** Zo logo URL */
  logoUrl?: string;
  /** Title text */
  title?: string;
  /** Subtitle lines */
  subtitles?: string[];
  /** Button text */
  buttonText?: string;
  /** Additional CSS class */
  className?: string;
}

export const ZoLanding: React.FC<ZoLandingProps> = ({
  onAuthSuccess,
  sendOTP,
  verifyOTP,
  videoUrl = '/videos/loading-screen-background.mp4',
  logoUrl = '/figma-assets/landing-zo-logo.png',
  title = 'ZOHMMM!',
  subtitles = [
    'Welcome to Zo World',
    'A parallel reality where you live your best life, by following your heart.',
    'Are you ready to tune in, Anon?',
  ],
  buttonText = 'Tune into Zo World',
  className = '',
}) => {
  const [showAuth, setShowAuth] = useState(false);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'black',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: 'Rubik, system-ui, sans-serif',
  };

  return (
    <div className={`zo-landing ${className}`} style={containerStyle}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, black)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Zo Logo */}
      <img
        src={logoUrl}
        alt="Zo"
        style={{
          position: 'absolute',
          left: '24px',
          top: '40px',
          width: '40px',
          height: '40px',
          objectFit: 'cover',
          zIndex: 10,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '800px',
            gap: '32px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: 'Syne, system-ui, sans-serif',
                fontSize: 'clamp(32px, 8vw, 72px)',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
                letterSpacing: '0.32px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {title}
            </h1>

            <div
              style={{
                marginTop: '16px',
                fontSize: 'clamp(16px, 3vw, 24px)',
                color: 'white',
                lineHeight: 1.5,
              }}
            >
              {subtitles.map((text, i) => (
                <p key={i} style={{ margin: '8px 0' }}>
                  {text}
                </p>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowAuth(true)}
            style={{
              backgroundColor: 'black',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px 20px',
              width: '100%',
              maxWidth: '400px',
              height: '64px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            <span
              style={{
                fontFamily: 'Rubik, system-ui, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
                color: 'white',
              }}
            >
              {buttonText}
            </span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setShowAuth(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Auth Component */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ZoAuth
              onSuccess={(userId, user) => {
                setShowAuth(false);
                onAuthSuccess(userId, user);
              }}
              onClose={() => setShowAuth(false)}
              sendOTP={sendOTP}
              verifyOTP={verifyOTP}
            />
          </div>
        </div>
      )}
    </div>
  );
};

