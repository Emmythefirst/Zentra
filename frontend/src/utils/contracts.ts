import { parseEther, formatEther } from 'viem';

// Contract addresses on Monad Testnet
export const CONTRACTS = {
  TASK_ESCROW: '0x5906127D1A62eD149c30a426Abe72C6EDF5BAe7b', // Your deployed address
  TASK_TOKEN: '0x0000000000000000000000000000000000000000', // Native MON for now
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
    case TaskStatus.OPEN:
      return 'OPEN';
    case TaskStatus.ACCEPTED:
      return 'ACCEPTED';
    case TaskStatus.SUBMITTED:
      return 'SUBMITTED';
    case TaskStatus.COMPLETED:
      return 'COMPLETED';
    case TaskStatus.DISPUTED:
      return 'DISPUTED';
    case TaskStatus.CANCELLED:
      return 'CANCELLED';
    default:
      return 'UNKNOWN';
  }
}

// Helpers for working with payments
export const PaymentUtils = {
  // Convert TASK amount to wei
  toWei: (amount: string): bigint => {
    return parseEther(amount);
  },

  // Convert wei to TASK amount
  fromWei: (wei: bigint): string => {
    return formatEther(wei);
  },

  // Calculate platform fee (5%)
  calculateFee: (amount: string): string => {
    const value = parseFloat(amount);
    return (value * 0.05).toFixed(2);
  },

  // Calculate worker receive amount (95%)
  calculateWorkerAmount: (amount: string): string => {
    const value = parseFloat(amount);
    return (value * 0.95).toFixed(2);
  },

  // Format amount for display
  formatAmount: (amount: string | bigint): string => {
    if (typeof amount === 'bigint') {
      return parseFloat(formatEther(amount)).toFixed(2);
    }
    return parseFloat(amount).toFixed(2);
  },
};

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Get block explorer URL
export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = 'https://testnet.monadvision.com';
  return `${baseUrl}/${type}/${hash}`;
}