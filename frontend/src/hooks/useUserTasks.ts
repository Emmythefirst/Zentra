import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { createPublicClient, http, formatEther } from 'viem';

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
} as const;

const client = createPublicClient({
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz'),
});

const TASK_ESCROW_ADDRESS = import.meta.env.VITE_TASK_ESCROW_ADDRESS as `0x${string}`;
export const ZEN_TOKEN_ADDRESS = import.meta.env.VITE_ZEN_TOKEN_ADDRESS as string;
const TASK_ESCROW_ABI = [
  {
    inputs: [{ name: '_taskId', type: 'uint256' }],
    name: 'getTask',
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'taskId', type: 'uint256' },
          { name: 'employer', type: 'address' },
          { name: 'worker', type: 'address' },
          { name: 'payment', type: 'uint256' },
          { name: 'token', type: 'address' },     // ← new field, must match contract order
          { name: 'description', type: 'string' },
          { name: 'proofUrl', type: 'string' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalTasks',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const STATUS_MAP: Record<number, string> = {
  0: 'OPEN',
  1: 'ACCEPTED',
  2: 'SUBMITTED',
  3: 'COMPLETED',
  4: 'CANCELLED',
};

export function useUserTasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!address) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const total = await client.readContract({
        address: TASK_ESCROW_ADDRESS,
        abi: TASK_ESCROW_ABI,
        functionName: 'getTotalTasks',
      });

      const totalCount = Number(total);
      console.log(`📋 Total tasks on chain: ${totalCount}`);

      const allTasks = [];
      for (let i = 1; i <= totalCount; i++) {
        try {
          const task: any = await client.readContract({
            address: TASK_ESCROW_ADDRESS,
            abi: TASK_ESCROW_ABI,
            functionName: 'getTask',
            args: [BigInt(i)],
          });

          if (
            task.employer.toLowerCase() === address.toLowerCase() ||
            task.worker.toLowerCase() === address.toLowerCase()
          ) {
            const isZen = task.token?.toLowerCase() === ZEN_TOKEN_ADDRESS.toLowerCase();
            allTasks.push({
              taskId: Number(task.taskId),
              employer: task.employer,
              worker: task.worker,
              description: task.description,
              payment: formatEther(task.payment),
              paymentToken: isZen ? 'ZEN' : 'MON',   // human-readable token
              tokenAddress: task.token,
              proofUrl: task.proofUrl,
              status: STATUS_MAP[task.status] || 'UNKNOWN',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error(`Error fetching task ${i}:`, err);
        }
      }

      console.log(`✅ Found ${allTasks.length} tasks for ${address}`);
      setTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks from chain:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [address]);

  return { tasks, loading, refresh: fetchTasks };
}