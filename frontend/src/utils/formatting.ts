import { formatDistanceToNow, format } from 'date-fns';

// Format addresses for display
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Format large numbers with K, M, B suffixes
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// Format token amounts
export function formatTokenAmount(amount: string | number, decimals: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(decimals);
}

// Format percentages
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format timestamps
export function formatTimestamp(timestamp: number | Date, style: 'relative' | 'absolute' = 'relative'): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
  
  if (style === 'relative') {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  return format(date, 'MMM dd, yyyy HH:mm');
}

// Format date only
export function formatDate(timestamp: number | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
  return format(date, 'MMM dd, yyyy');
}

// Format time only
export function formatTime(timestamp: number | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
  return format(date, 'HH:mm:ss');
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Format karma/reputation score
export function formatKarma(karma: number): string {
  return formatNumber(karma);
}

// Convert bytes to human-readable size
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}