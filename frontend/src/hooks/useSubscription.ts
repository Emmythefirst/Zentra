import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { ZEN_TOKEN_ADDRESS, SUBSCRIPTION_PRICE } from './useZenBalance';

// ─── Contract addresses ───────────────────────────────────────────────────────
// TODO: replace with deployed address after running forge script
export const SUBSCRIPTION_CONTRACT = import.meta.env.VITE_SUBSCRIPTION_CONTRACT as `0x${string}`;
export const SUBSCRIPTION_DURATION_DAYS = 30;
export const HOLDER_COOLDOWN_HOURS = 24; // 1 task per 24h for holders
export const HOLDER_DAILY_LIMIT = 3;

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const ZEN_APPROVE_ABI = [
{
name: 'approve',
type: 'function' as const,
stateMutability: 'nonpayable',
inputs: [
{ name: 'spender', type: 'address' },
{ name: 'amount',  type: 'uint256' },
],
outputs: [{ type: 'bool' }],
},
] as const;

const SUBSCRIPTION_ABI = [
{
name: 'isSubscribed',
type: 'function' as const,
stateMutability: 'view',
inputs: [
{ name: 'user',    type: 'address' },
{ name: 'agentId', type: 'bytes32' },
],
outputs: [{ type: 'bool' }],
},
{
name: 'getExpiry',
type: 'function' as const,
stateMutability: 'view',
inputs: [
{ name: 'user',    type: 'address' },
{ name: 'agentId', type: 'bytes32' },
],
outputs: [{ type: 'uint256' }],
},
{
name: 'subscribe',
type: 'function' as const,
stateMutability: 'nonpayable',
inputs: [{ name: 'agentId', type: 'bytes32' }],
outputs: [],
},
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toAgentIdBytes(agentId: string): `0x${string}` {
return keccak256(toBytes(agentId));
}

function holderKey(agentId: string, address: string) {
return `zentra_holder_${agentId}_${address.toLowerCase()}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSubscription(agentId: string) {
const { address, isConnected } = useAccount();
const [pending, setPending]   = useState(false);
const [step, setStep]         = useState<'idle' | 'approving' | 'subscribing'>('idle');
const [error, setError]       = useState<string | null>(null);

const agentIdBytes = toAgentIdBytes(agentId);
const deployed     = SUBSCRIPTION_CONTRACT !== '0x0000000000000000000000000000000000000000';

// ── On-chain subscription check ──
const { data: onChainSubscribed, refetch: refetchSub } = useReadContract({
address: SUBSCRIPTION_CONTRACT,
abi: SUBSCRIPTION_ABI,
functionName: 'isSubscribed',
args: address ? [address, agentIdBytes] : undefined,
query: { enabled: !!address && isConnected && deployed },
});

const { data: expiryTimestamp } = useReadContract({
address: SUBSCRIPTION_CONTRACT,
abi: SUBSCRIPTION_ABI,
functionName: 'getExpiry',
args: address ? [address, agentIdBytes] : undefined,
query: { enabled: !!address && isConnected && deployed },
});

const isSubscribed = onChainSubscribed === true;

const getDaysLeft = (): number => {
if (!expiryTimestamp) return 0;
const ms = Number(expiryTimestamp) * 1000 - Date.now();
return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
};

// ── Holder daily limit (localStorage) ──
const hasHolderAccessToday = (): boolean => {
  if (!address) return false;
  try {
    const raw = localStorage.getItem(holderKey(agentId, address));
    if (!raw) return true;
    const { date, count } = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) return true; // new day — reset
    return count < HOLDER_DAILY_LIMIT;
  } catch {
    return true;
  }
};

const getHolderCooldownHours = (): number => {
  // Hours until midnight when count resets
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
};

const recordHolderAccess = () => {
  if (!address) return;
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(holderKey(agentId, address));
    let count = 0;
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) count = data.count;
    }
    localStorage.setItem(
      holderKey(agentId, address),
      JSON.stringify({ date: today, count: count + 1 })
    );
  } catch {}
};

// ── Subscribe (approve + subscribe) ──
const { writeContractAsync } = useWriteContract();

const subscribe = async (): Promise<boolean> => {
if (!address)    { setError('Connect your wallet first'); return false; }
if (!deployed)   { setError('Subscription contract not deployed yet'); return false; }

setError(null);
setPending(true);

try {
  // Step 1: Approve ZEN
  setStep('approving');
  const approveTx = await writeContractAsync({
    address: ZEN_TOKEN_ADDRESS,
    abi: ZEN_APPROVE_ABI,
    functionName: 'approve',
    args: [SUBSCRIPTION_CONTRACT, parseEther(SUBSCRIPTION_PRICE.toString())],
  });
  console.log('✅ ZEN approved:', approveTx);

  // Step 2: Subscribe
  setStep('subscribing');
  const subscribeTx = await writeContractAsync({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    functionName: 'subscribe',
    args: [agentIdBytes],
  });
  console.log('✅ Subscribed:', subscribeTx);

  await refetchSub();
  return true;

} catch (e: any) {
  const msg = e?.shortMessage || e?.message || 'Subscription failed';
  setError(
    msg.includes('insufficient') || msg.includes('transfer')
      ? 'Insufficient ZEN balance'
      : msg.includes('rejected') || msg.includes('denied')
      ? 'Transaction rejected'
      : msg
  );
  return false;
} finally {
  setPending(false);
  setStep('idle');
}

};

const getTasksUsedToday = (): number => {
  if (!address) return 0;
  try {
    const raw = localStorage.getItem(holderKey(agentId, address));
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    return date === today ? count : 0;
  } catch {
    return 0;
  }
};

return {
isSubscribed,
getDaysLeft,
subscribe,
pending,
step,
error,
hasHolderAccessToday,
getHolderCooldownHours,
recordHolderAccess,
getTasksUsedToday,
};
}