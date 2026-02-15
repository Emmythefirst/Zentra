import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';

export const ZEN_TOKEN_ADDRESS = import.meta.env.VITE_ZEN_TOKEN_ADDRESS as `0x${string}`;
const TASK_ESCROW_ADDRESS = import.meta.env.VITE_TASK_ESCROW_ADDRESS as `0x${string}`;

const TASK_ESCROW_ABI = [
  {
    inputs: [{ name: '_description', type: 'string' }],
    name: 'createTask',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_description', type: 'string' },
      { name: '_token', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'createTaskWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_taskId', type: 'uint256' }],
    name: 'acceptTask',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_taskId', type: 'uint256' },
      { name: '_proofUrl', type: 'string' }
    ],
    name: 'submitWork',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_taskId', type: 'uint256' }],
    name: 'verifyAndRelease',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_taskId', type: 'uint256' }],
    name: 'cancelTask',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
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
          { name: 'token', type: 'address' },
          { name: 'description', type: 'string' },
          { name: 'proofUrl', type: 'string' },
          { name: 'status', type: 'uint8' }
        ]
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTotalTasks',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'taskCounter',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_taskId', type: 'uint256' }],
    name: 'isTaskAvailable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'taskId', type: 'uint256' },
      { indexed: true, name: 'employer', type: 'address' },
      { indexed: false, name: 'payment', type: 'uint256' },
      { indexed: false, name: 'token', type: 'address' },
      { indexed: false, name: 'description', type: 'string' }
    ],
    name: 'TaskCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'taskId', type: 'uint256' },
      { indexed: false, name: 'proofUrl', type: 'string' }
    ],
    name: 'WorkSubmitted',
    type: 'event'
  }
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

function usePolling(hash: string | undefined) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!hash) {
      setIsConfirming(false);
      setIsConfirmed(false);
      return;
    }

    console.log('🔍 Starting manual polling for:', hash);
    setIsConfirming(true);

    let attempts = 0;
    const maxAttempts = 30;

    const checkTransaction = async () => {
      attempts++;
      console.log(`⏳ Checking transaction (attempt ${attempts}/${maxAttempts})...`);

      try {
        const response = await fetch('https://testnet-rpc.monad.xyz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [hash],
          }),
        });

        const data = await response.json();
        if (data.result && data.result.blockNumber) {
          console.log('✅ TRANSACTION CONFIRMED!');
          setIsConfirmed(true);
          setIsConfirming(false);
        } else if (attempts < maxAttempts) {
          setTimeout(checkTransaction, 1000);
        } else {
          console.log('⏰ Timeout - stopping polling');
          setIsConfirming(false);
        }
      } catch (err) {
        console.error('❌ Error checking transaction:', err);
        if (attempts < maxAttempts) setTimeout(checkTransaction, 1000);
        else setIsConfirming(false);
      }
    };

    const timeout = setTimeout(checkTransaction, 2000);
    return () => clearTimeout(timeout);
  }, [hash]);

  return { isConfirming, isConfirmed };
}

export function useTaskEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isConfirming, isConfirmed } = usePolling(hash);

  useEffect(() => {
    console.log('🔗 Contract Hook State:', { hash, isPending, error });
  }, [hash, isPending, error]);

  useEffect(() => {
    console.log('⏳ Confirmation State:', { isConfirming, isConfirmed, hash });
  }, [isConfirming, isConfirmed, hash]);

  // Create task with native MON
  const createTask = (
    _worker: string,
    description: string,
    paymentAmount: string,
    _paymentToken: string
  ) => {
    console.log('🚀 Creating task (MON):', { description, paymentAmount });
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'createTask',
      args: [description],
      value: parseEther(paymentAmount),
    });
  };

  // Step 1 of ZEN flow: approve escrow to spend ZEN
  const approveZen = (amount: string) => {
    console.log('🪙 Approving ZEN spend:', amount);
    writeContract({
      address: ZEN_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [TASK_ESCROW_ADDRESS, parseEther(amount)],
    });
  };

  // Step 2 of ZEN flow: create task after approval confirmed
  const createTaskWithZen = (description: string, amount: string) => {
    console.log('🚀 Creating task (ZEN):', { description, amount });
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'createTaskWithToken',
      args: [description, ZEN_TOKEN_ADDRESS, parseEther(amount)],
    });
  };

  const acceptTask = (taskId: bigint) => {
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'acceptTask',
      args: [taskId],
    });
  };

  const submitWork = (taskId: bigint, proofUrl: string) => {
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'submitWork',
      args: [taskId, proofUrl],
    });
  };

  const verifyAndRelease = (taskId: bigint) => {
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'verifyAndRelease',
      args: [taskId],
    });
  };

  return {
    createTask,
    approveZen,
    createTaskWithZen,
    acceptTask,
    submitWork,
    verifyAndRelease,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export function useTask(taskId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: TASK_ESCROW_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: 'getTask',
    args: [taskId],
  });
  return { task: data, isLoading, error };
}

export function useTotalTasks() {
  const { data, isLoading, error } = useReadContract({
    address: TASK_ESCROW_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: 'getTotalTasks',
  });
  return { totalTasks: data ? Number(data) : 0, isLoading, error };
}

export function useZenBalance(address: string) {
  const { data, isLoading } = useReadContract({
    address: ZEN_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });
  return { balance: data ?? 0n, isLoading };
}