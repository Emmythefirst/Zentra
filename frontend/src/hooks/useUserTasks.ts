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

const TASK_ESCROW_ADDRESS = '0x5906127D1A62eD149c30a426Abe72C6EDF5BAe7b' as `0x${string}`;

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
      // Step 1: Get total task count from contract
      const total = await client.readContract({
        address: TASK_ESCROW_ADDRESS,
        abi: TASK_ESCROW_ABI,
        functionName: 'getTotalTasks',
      });

      const totalCount = Number(total);
      console.log(`📋 Total tasks on chain: ${totalCount}`);

      // Step 2: Fetch all tasks and filter by this user's address
      const allTasks = [];
      for (let i = 1; i <= totalCount; i++) {
        try {
          const task: any = await client.readContract({
            address: TASK_ESCROW_ADDRESS,
            abi: TASK_ESCROW_ABI,
            functionName: 'getTask',
            args: [BigInt(i)],
          });

          // Show tasks where user is employer OR worker
          if (
            task.employer.toLowerCase() === address.toLowerCase() ||
            task.worker.toLowerCase() === address.toLowerCase()
          ) {
            allTasks.push({
              taskId: Number(task.taskId),
              employer: task.employer,
              worker: task.worker,
              description: task.description,
              payment: formatEther(task.payment),
              proofUrl: task.proofUrl,
              status: STATUS_MAP[task.status] || 'UNKNOWN',
              createdAt: new Date().toISOString(), // contract doesn't store this
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