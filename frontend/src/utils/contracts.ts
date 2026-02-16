import { parseEther, formatEther } from 'viem';

// Contract addresses on Monad Testnet
export const CONTRACTS = {
  TASK_ESCROW: import.meta.env.VITE_TASK_ESCROW_ADDRESS as string,
  TASK_TOKEN: '0x0000000000000000000000000000000000000000', // Native MON
} as const;

// ZEN token deployed on nad.fun testnet
export const ZEN_TOKEN = {
  ADDRESS: import.meta.env.VITE_ZEN_TOKEN_ADDRESS as string,
  SYMBOL: 'ZEN',
  NAME: 'Zen',
  NAD_FUN_URL: '/get-zen',
  EXPLORER_URL: 'https://testnet.monadvision.com/address/0x02300a68a6cA7E65FD0Fd95b17108F2AC7867777',
} as const;

// Task status enum matching contract
export enum TaskStatus {
  OPEN = 0,
  ACCEPTED = 1,
  SUBMITTED = 2,
  COMPLETED = 3,
  DISPUTED = 4,
  CANCELLED = 5,
}

// Convert status number to string
export function getTaskStatusString(status: number): string {
  switch (status) {
    case TaskStatus.OPEN:      return 'OPEN';
    case TaskStatus.ACCEPTED:  return 'ACCEPTED';
    case TaskStatus.SUBMITTED: return 'SUBMITTED';
    case TaskStatus.COMPLETED: return 'COMPLETED';
    case TaskStatus.DISPUTED:  return 'DISPUTED';
    case TaskStatus.CANCELLED: return 'CANCELLED';
    default:                   return 'UNKNOWN';
  }
}

// Helpers for working with payments
export const PaymentUtils = {
  toWei: (amount: string): bigint => parseEther(amount),
  fromWei: (wei: bigint): string => formatEther(wei),
  calculateFee: (amount: string): string => (parseFloat(amount) * 0.05).toFixed(2),
  calculateWorkerAmount: (amount: string): string => (parseFloat(amount) * 0.95).toFixed(2),
  formatAmount: (amount: string | bigint): string => {
    if (typeof amount === 'bigint') return parseFloat(formatEther(amount)).toFixed(2);
    return parseFloat(amount).toFixed(2);
  },
};

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  return `https://testnet.monadvision.com/${type}/${hash}`;
}