import React, { useState, useEffect } from 'react';
import { ZoPassportSDK } from 'zopassport-sdk';
import { 
  ZoLanding, 
  ZoPassportPage, 
  WalletFullPage,
  ZoPassportProvider 
} from 'zopassport-sdk/react';
import type { ZoUser } from 'zopassport-sdk';
import './App.css';

// Get client key from environment or use demo key
const CLIENT_KEY = import.meta.env.VITE_ZO_CLIENT_KEY || 'demo-client-key';
const API_URL = import.meta.env.VITE_ZO_API_URL;

// Initialize SDK
const sdk = new ZoPassportSDK({
  clientKey: CLIENT_KEY,
  baseUrl: API_URL,
  autoRefresh: true,
  debug: true, // Enable debug logging
});

type Screen = 'landing' | 'passport' | 'wallet';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<ZoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletOpen, setWalletOpen] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const balance = await sdk.getWalletBalance();
      console.log('[App] Wallet balance fetched:', balance);
      setWalletBalance(balance);
    } catch (error) {
      console.warn('[App] Could not fetch wallet balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Wait for SDK to load session from storage
        await sdk.ready();
        
        if (sdk.isAuthenticated) {
          const profile = await sdk.getProfile();
          if (profile) {
            setUser(profile);
            setScreen('passport');
            await fetchWalletBalance();
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Refresh balance when wallet opens
  useEffect(() => {
    if (walletOpen) {
      fetchWalletBalance();
    }
  }, [walletOpen]);

  // Auth handlers
  const handleSendOTP = async (countryCode: string, phoneNumber: string) => {
    return sdk.auth.sendOTP(countryCode, phoneNumber);
  };

  const handleVerifyOTP = async (countryCode: string, phoneNumber: string, otp: string) => {
    const result = await sdk.loginWithPhone(countryCode, phoneNumber, otp);
    if (result.success && result.user) {
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  };

  const handleAuthSuccess = async (userId: string, userData: ZoUser) => {
    setUser(userData);
    setScreen('passport');
    try {
      const balance = await sdk.getWalletBalance();
      setWalletBalance(balance);
    } catch (e) {
      console.error('Failed to fetch wallet:', e);
    }
  };

  const handleLogout = async () => {
    await sdk.logout();
    setUser(null);
    setScreen('landing');
    setWalletBalance(0);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p className="loading-text">Loading Zo Passport...</p>
      </div>
    );
  }

  // Landing / Auth screen
  if (screen === 'landing') {
    return (
      <ZoPassportProvider clientKey={CLIENT_KEY}>
        <ZoLanding
          onAuthSuccess={handleAuthSuccess}
          sendOTP={handleSendOTP}
          verifyOTP={handleVerifyOTP}
          videoUrl="/videos/loading-screen-background.mp4"
          logoUrl="/figma-assets/landing-zo-logo.png"
        />
      </ZoPassportProvider>
    );
  }

  // Main Passport screen
  return (
    <ZoPassportProvider clientKey={CLIENT_KEY}>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <img 
            src="/figma-assets/landing-zo-logo.png" 
            alt="Zo" 
            className="app-logo"
          />
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>

        {/* Full Passport Page */}
        <ZoPassportPage
          user={user}
          balance={walletBalance}
          completion={{ done: 8, total: 10 }}
          walletOpen={walletOpen}
          onWalletToggle={() => setWalletOpen(!walletOpen)}
        />

        {/* Wallet Full Screen */}
        {walletOpen && (
          <WalletFullPage
            user={user}
            balance={walletBalance}
            onClose={() => setWalletOpen(false)}
            isLoading={isLoadingBalance}
            onRefresh={fetchWalletBalance}
          />
        )}
      </div>
    </ZoPassportProvider>
  );
}

export default App;
