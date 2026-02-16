import { useReadContract, useBalance } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';

export const ZEN_TOKEN_ADDRESS  = import.meta.env.VITE_ZEN_TOKEN_ADDRESS as `0x${string}`;
export const HOLDER_THRESHOLD   = 10_000;   // ZEN (display units)
export const SUBSCRIPTION_PRICE = 50_000;   // ZEN (display units)
export const MON_HOLDER_THRESHOLD = parseEther('10'); // 10 MON
export const HOLDER_TASK_LIMIT  = 3;        // tasks/day for holders

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function' as const,
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export function useZenBalance() {
  const { address, isConnected } = useAccount();

  const { data: rawBalance, isLoading: zenLoading } = useReadContract({
    address: ZEN_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  const { data: monBalanceData, isLoading: monLoading } = useBalance({
    address: address as `0x${string}`,
    query: { enabled: !!address && isConnected },
  });

  const balanceWei     = rawBalance ?? 0n;
  const balanceNum     = Number(formatEther(balanceWei));
  const balanceDisplay = balanceNum.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const monBalanceWei  = monBalanceData?.value ?? 0n;
  const monBalanceNum  = Number(formatEther(monBalanceWei));

  // Holder = 10k+ ZEN OR 10+ MON
  const isZenHolder    = balanceNum >= HOLDER_THRESHOLD;
  const isMonHolder    = monBalanceWei >= MON_HOLDER_THRESHOLD;
  const isHolder       = isZenHolder || isMonHolder;

  const canSubscribe   = balanceNum >= SUBSCRIPTION_PRICE;

  return {
    balanceWei,
    balanceNum,
    balanceDisplay,
    monBalanceNum,
    isHolder,       // holds 10k+ ZEN or 10+ MON → 3 tasks/day on verified agents
    isZenHolder,    // specifically ZEN holder (for UI differentiation if needed)
    isMonHolder,    // specifically MON holder
    canSubscribe,   // holds 50k+ ZEN → can afford subscription
    isLoading: zenLoading || monLoading,
  };
}