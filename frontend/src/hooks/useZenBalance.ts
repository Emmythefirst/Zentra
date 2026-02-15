import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

export const ZEN_TOKEN_ADDRESS  = import.meta.env.VITE_ZEN_TOKEN_ADDRESS as `0x${string}`;
export const HOLDER_THRESHOLD   = 10_000;   // ZEN (display units)
export const SUBSCRIPTION_PRICE = 50_000;   // ZEN (display units)

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

const { data: rawBalance, isLoading } = useReadContract({
address: ZEN_TOKEN_ADDRESS,
abi: ERC20_ABI,
functionName: 'balanceOf',
args: address ? [address] : undefined,
query: { enabled: !!address && isConnected },
});

const balanceWei    = rawBalance ?? 0n;
const balanceNum    = Number(formatEther(balanceWei));
const balanceDisplay = balanceNum.toLocaleString(undefined, { maximumFractionDigits: 0 });

const isHolder      = balanceNum >= HOLDER_THRESHOLD;
const canSubscribe  = balanceNum >= SUBSCRIPTION_PRICE;

return {
balanceWei,
balanceNum,
balanceDisplay,
isHolder,       // holds 10k+ ZEN → 1 task/day on verified agents
canSubscribe,   // holds 50k+ ZEN → can afford subscription
isLoading,
};
}