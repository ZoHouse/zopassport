import { useState, useEffect } from 'react';
import { ZoPassportSDK } from 'zopassport-sdk';
import { WalletCard, WalletFullPage, ZoPassportProvider } from 'zopassport-sdk/react';
import './App.css';

// Initialize SDK
const sdk = new ZoPassportSDK({
  clientKey: 'test-client-key',
});
console.log('SDK Initialized:', sdk);

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock user for demo
  const user = {
    id: 'demo-user',
    first_name: 'Samurai',
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    avatar: {
      status: 'completed' as const,
      image: 'https://i.pravatar.cc/150?img=11'
    }
  };

  // Wallet user format for WalletCard
  const walletUser = {
    first_name: user.first_name,
    nickname: '@samuraizan',
    wallet_address: user.wallet_address,
    avatar: user.avatar?.image ? { image: user.avatar.image } : undefined,
  };

  useEffect(() => {
    // Simulate fetching balance
    setTimeout(() => {
      setBalance(1250);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <ZoPassportProvider clientKey="test-client-key">
      <div className="app-container">
        <h1>Zo Passport Universal UI Demo</h1>

        <div className="card-container">
          <h2>Wallet Card Widget (Web)</h2>
          <div style={{ position: 'relative', height: '220px', width: '100%', maxWidth: '400px' }}>
            <WalletCard
              balance={balance}
              user={walletUser}
              isOpen={isOpen}
              onToggle={() => setIsOpen(!isOpen)}
              isLoading={loading}
            />
          </div>
        </div>

        {isOpen && (
          <WalletFullPage
            user={user}
            balance={balance}
            onClose={() => setIsOpen(false)}
            isLoading={loading}
          />
        )}
      </div>
    </ZoPassportProvider>
  );
}

export default App;
