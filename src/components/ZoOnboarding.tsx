// src/components/ZoOnboarding.tsx
// Onboarding flow: nickname, body type, location, avatar generation

import React, { useState, useEffect, useRef } from 'react';

export interface ZoOnboardingProps {
  /** Callback when onboarding is complete */
  onComplete: (userData: OnboardingData) => void;
  /** Update profile function (from SDK) */
  updateProfile: (updates: { first_name?: string; body_type?: 'bro' | 'bae'; place_name?: string }) => Promise<{ success: boolean; error?: string }>;
  /** Get profile function (from SDK) to poll for avatar */
  getProfile: () => Promise<any>;
  /** Video background URL */
  videoUrl?: string;
  /** Zo logo URL */
  logoUrl?: string;
  /** Bro avatar preview URL */
  broAvatarUrl?: string;
  /** Bae avatar preview URL */
  baeAvatarUrl?: string;
  /** Additional CSS class */
  className?: string;
}

export interface OnboardingData {
  nickname: string;
  bodyType: 'bro' | 'bae';
  city: string;
  avatarUrl: string | null;
}

type Step = 'input' | 'generating' | 'success';

export const ZoOnboarding: React.FC<ZoOnboardingProps> = ({
  onComplete,
  updateProfile,
  getProfile,
  videoUrl = '/videos/loading-screen-background.mp4',
  logoUrl = '/figma-assets/landing-zo-logo.png',
  broAvatarUrl = '/bro.png',
  baeAvatarUrl = '/bae.png',
  className = '',
}) => {
  // State
  const [step, setStep] = useState<Step>('input');
  const [nickname, setNickname] = useState('');
  const [bodyType, setBodyType] = useState<'bro' | 'bae'>('bro');
  const [city, setCity] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Refs for polling
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  // Validation
  const isNicknameValid = nickname.length >= 4 && nickname.length <= 16 && /^[a-z0-9]*$/.test(nickname);
  const canSubmit = isNicknameValid && locationEnabled && bodyType && !isSaving;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  // Handle nickname change
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value.toLowerCase());
    setError('');
  };

  // Handle location enable
  const handleLocationEnable = () => {
    if ('geolocation' in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const detectedCity = data.city || data.locality || data.principalSubdivision || 'Unknown City';

            setCity(detectedCity);
            setLocationEnabled(true);
            setIsLoadingLocation(false);
            setError('');
          } catch (err) {
            console.error('Failed to get city:', err);
            setError('Failed to detect location. Please try again.');
            setLocationEnabled(false);
            setIsLoadingLocation(false);
          }
        },
        (err) => {
          console.error('Location error:', err);
          setError('Location access denied. Please enable permissions.');
          setLocationEnabled(false);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSaving(true);
    setError('');

    try {
      // Update profile via SDK
      const result = await updateProfile({
        first_name: nickname,
        body_type: bodyType,
        place_name: city,
      });

      if (!result.success) {
        throw new Error(result.error || 'Profile update failed');
      }

      // Transition to generating step
      setStep('generating');

      // Start polling for avatar
      pollForAvatar();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError('Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  // Poll for avatar
  const pollForAvatar = async () => {
    attemptsRef.current += 1;
    const maxAttempts = 30;

    if (attemptsRef.current > maxAttempts) {
      // Timeout - use default avatar
      setAvatarUrl(bodyType === 'bro' ? broAvatarUrl : baeAvatarUrl);
      setStep('success');
      return;
    }

    try {
      const profile = await getProfile();

      if (profile?.avatar?.image) {
        setAvatarUrl(profile.avatar.image);
        setTimeout(() => setStep('success'), 1000);
        return;
      }

      // Poll again in 1s
      pollingRef.current = setTimeout(pollForAvatar, 1000);
    } catch (err) {
      console.error('Polling error:', err);
      pollingRef.current = setTimeout(pollForAvatar, 1000);
    }
  };

  // Handle complete
  const handleComplete = () => {
    onComplete({
      nickname,
      bodyType,
      city,
      avatarUrl,
    });
  };

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
    <div className={`zo-onboarding ${className}`} style={containerStyle}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, transparent, black)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Zo Logo */}
      <div style={{ position: 'absolute', left: '24px', top: '40px', width: '40px', height: '40px', zIndex: 50 }}>
        <img src={logoUrl} alt="Zo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          paddingTop: '120px',
          paddingBottom: '40px',
        }}
      >
        {/* INPUT STEP */}
        {step === 'input' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '360px', padding: '0 24px' }}>
            {/* Title */}
            <h1
              style={{
                fontFamily: 'Syne, system-ui, sans-serif',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.32px',
                lineHeight: 1.2,
                marginBottom: '24px',
                fontSize: 'clamp(24px, 6vw, 48px)',
              }}
            >
              WHO ARE YOU?
            </h1>

            {/* Subtitle */}
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
                lineHeight: 1.5,
                marginBottom: '40px',
                fontSize: 'clamp(14px, 2vw, 16px)',
              }}
            >
              A difficult question, I know. We'll get to it.
              <br />
              But let's start with choosing a nick.
            </p>

            {/* Nickname Input */}
            <input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="samurai"
              maxLength={16}
              style={{
                width: '100%',
                height: '56px',
                padding: '0 20px',
                backgroundColor: 'black',
                border: '1px solid #49494A',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                marginBottom: '40px',
              }}
              autoFocus
            />

            {/* Body Type Selection */}
            <div style={{ width: '100%', marginBottom: '32px' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
                Choose your avatar style
              </p>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {/* Bae Option */}
                <button
                  onClick={() => setBodyType('bae')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: '16px',
                    border: bodyType === 'bae' ? '2px solid #CFFF50' : '2px solid rgba(255, 255, 255, 0.3)',
                    backgroundColor: bodyType === 'bae' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    minWidth: '120px',
                    transform: bodyType === 'bae' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <img src={baeAvatarUrl} alt="Bae" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>Bae</span>
                </button>

                {/* Bro Option */}
                <button
                  onClick={() => setBodyType('bro')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: '16px',
                    border: bodyType === 'bro' ? '2px solid #CFFF50' : '2px solid rgba(255, 255, 255, 0.3)',
                    backgroundColor: bodyType === 'bro' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    minWidth: '120px',
                    transform: bodyType === 'bro' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <img src={broAvatarUrl} alt="Bro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>Bro</span>
                </button>
              </div>
            </div>

            {/* Location Button */}
            <div style={{ width: '100%', marginBottom: '24px' }}>
              {!locationEnabled ? (
                <button
                  onClick={handleLocationEnable}
                  disabled={isLoadingLocation}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    cursor: isLoadingLocation ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  📍 {isLoadingLocation ? 'Detecting...' : 'Enable Location'}
                </button>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: 'rgba(207, 255, 80, 0.1)',
                    border: '1px solid rgba(207, 255, 80, 0.5)',
                    borderRadius: '12px',
                    color: '#CFFF50',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  📍 <span style={{ color: 'white' }}>{city}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                color: 'black',
                fontSize: '16px',
                fontWeight: 500,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              {isSaving ? 'Processing...' : 'Get Citizenship'}
            </button>

            {/* Error */}
            {error && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* GENERATING STEP */}
        {step === 'generating' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={bodyType === 'bro' ? broAvatarUrl : baeAvatarUrl}
                alt="Generating..."
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.8,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Avatar */}
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.6)',
                overflow: 'hidden',
              }}
            >
              <img
                src={avatarUrl || (bodyType === 'bro' ? broAvatarUrl : baeAvatarUrl)}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Success Button */}
            <button
              onClick={handleComplete}
              style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '360px',
                height: '56px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                color: 'black',
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              Zo Zo Zo! Let's Go
            </button>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

