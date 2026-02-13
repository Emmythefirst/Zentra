import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

// Monad Testnet Configuration
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { 
      name: 'MonadVision', 
      url: 'https://testnet.monadvision.com' 
    },
  },
  testnet: true,
} as const;

//Monad Mainnet Configuration
export const monadMainnet = {
  id: 143,  // Mainnet Chain ID
  name: 'Monad Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },  // Mainnet RPC
    public: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { 
      name: 'MonadVision', 
      url: 'https://monadvision.com'  // Mainnet explorer
    },
  },
  testnet: false,
} as const;

export const config = getDefaultConfig({
  appName: 'Zentra',
  projectId: 'f27386478a37b6dd0f3d1c1e2faa60e5', // Get from https://cloud.walletconnect.com
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: false,
});