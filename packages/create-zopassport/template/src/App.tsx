import React, { useState, useEffect } from 'react';
import { ZoPassportSDK } from 'zopassport';
import { ZoLanding, ZoPassportPage, WalletFullPage } from 'zopassport/react';
import type { ZoUser } from 'zopassport';

// Get client key from environment
const CLIENT_KEY = import.meta.env.VITE_ZO_CLIENT_KEY || '';
const API_URL = import.meta.env.VITE_ZO_API_URL;

// Validate configuration
if (!CLIENT_KEY || CLIENT_KEY === 'your-client-key-here') {
  console.error(`
╔════════════════════════════════════════════════════════════╗
║                    ⚠️  CONFIGURATION ERROR                  ║
╠════════════════════════════════════════════════════════════╣
║  Missing ZO_CLIENT_KEY!                                    ║
║                                                            ║
║  1. Copy .env.example to .env                              ║
║     cp .env.example .env                                   ║
║                                                            ║
║  2. Edit .env and add your client key                      ║
║     VITE_ZO_CLIENT_KEY=your-actual-key                     ║
║                                                            ║
║  Get your key at: https://zo.xyz/developers                ║
╚════════════════════════════════════════════════════════════╝
  `);
}

// Initialize SDK
const sdk = new ZoPassportSDK({
  clientKey: CLIENT_KEY,
  baseUrl: API_URL,
  autoRefresh: true,
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
      console.warn('[App] Could not fetch wallet balance, using default:', error);
      // Don't throw - just keep the existing balance
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        if (sdk.isAuthenticated) {
          const profile = await sdk.getProfile();
          if (profile) {
            setUser(profile);
            setScreen('passport');
            // Fetch wallet balance
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
    // Fetch wallet balance
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
      <div style={styles.loadingContainer}>
        <div style={styles.loader} />
        <p style={styles.loadingText}>Loading Zo Passport...</p>
      </div>
    );
  }

  // Config error screen
  if (!CLIENT_KEY || CLIENT_KEY === 'your-client-key-here') {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h1 style={styles.errorTitle}>Configuration Required</h1>
          <p style={styles.errorText}>
            Your Zo Passport needs a client key to connect to the Zo World.
          </p>
          <div style={styles.codeBlock}>
            <p style={styles.codeComment}># 1. Copy the example config</p>
            <code>cp .env.example .env</code>
            <p style={styles.codeComment}># 2. Edit .env with your key</p>
            <code>VITE_ZO_CLIENT_KEY=your-key</code>
            <p style={styles.codeComment}># 3. Restart the dev server</p>
            <code>npm run dev</code>
          </div>
          <a 
            href="https://zo.xyz/developers" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.getKeyButton}
          >
            Get Your Client Key →
          </a>
        </div>
      </div>
    );
  }

  // Landing / Auth screen
  if (screen === 'landing') {
    return (
      <ZoLanding
        onAuthSuccess={handleAuthSuccess}
        sendOTP={handleSendOTP}
        verifyOTP={handleVerifyOTP}
      />
    );
  }

  // Main Passport screen
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <img 
          src="/figma-assets/landing-zo-logo.png" 
          alt="Zo" 
          style={styles.logo}
        />
        <button onClick={handleLogout} style={styles.logoutButton}>
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
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#000',
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  },
  // Error
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #000 0%, #1a1a2e 100%)',
    padding: '24px',
  },
  errorCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '48px',
    maxWidth: '500px',
    textAlign: 'center' as const,
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  errorTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '16px',
  },
  errorText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '16px',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  codeBlock: {
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'left' as const,
    fontFamily: 'monospace',
    fontSize: '14px',
    marginBottom: '24px',
  },
  codeComment: {
    color: 'rgba(255,255,255,0.4)',
    margin: '8px 0 4px 0',
    fontSize: '12px',
  },
  getKeyButton: {
    display: 'inline-block',
    background: '#fff',
    color: '#000',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '16px',
    transition: 'transform 0.2s',
  },
  // Main container
  container: {
    minHeight: '100%',
    background: '#000',
  },
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: '#000',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    flexShrink: 0,
  },
  logo: {
    width: '36px',
    height: '36px',
  },
  logoutButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
};

export default App;



