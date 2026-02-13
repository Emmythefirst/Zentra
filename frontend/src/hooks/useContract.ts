import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';

// TaskEscrow Contract ABI
const TASK_ESCROW_ABI = [
  {
    inputs: [
      { name: '_description', type: 'string' }
    ],
    name: 'createTask',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
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

// Your deployed TaskEscrow contract on Monad Testnet
const TASK_ESCROW_ADDRESS = '0x5906127D1A62eD149c30a426Abe72C6EDF5BAe7b' as const;

export function useTaskEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Manual polling for Monad Testnet
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
        console.log('📦 Receipt data:', data);

        if (data.result && data.result.blockNumber) {
          console.log('✅✅✅ TRANSACTION CONFIRMED!');
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
        if (attempts < maxAttempts) {
          setTimeout(checkTransaction, 1000);
        } else {
          setIsConfirming(false);
        }
      }
    };

    const timeout = setTimeout(checkTransaction, 2000);
    return () => clearTimeout(timeout);
  }, [hash]);

  // Log states
  useEffect(() => {
    console.log('🔗 Contract Hook State:', { hash, isPending, error });
  }, [hash, isPending, error]);

  useEffect(() => {
    console.log('⏳ Confirmation State:', { isConfirming, isConfirmed, hash });
  }, [isConfirming, isConfirmed, hash]);

  // Create a new task - only description needed, payment sent as msg.value
  const createTask = (
    _worker: string,        // kept for API compatibility
    description: string,
    paymentAmount: string,
    _paymentToken: string   // kept for API compatibility
  ) => {
    console.log('🚀 Creating task with params:', {
      description,
      paymentAmount,
      valueInWei: parseEther(paymentAmount).toString()
    });

    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'createTask',
      args: [description],
      value: parseEther(paymentAmount),
    });

    console.log('✅ writeContract called - MetaMask should popup');
  };

  // Accept a task
  const acceptTask = (taskId: bigint) => {
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'acceptTask',
      args: [taskId],
    });
  };

  // Submit work proof
  const submitWork = (taskId: bigint, proofUrl: string) => {
    writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'submitWork',
      args: [taskId, proofUrl],
    });
  };

  // Verify and release payment
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

// Hook to read a single task
export function useTask(taskId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: TASK_ESCROW_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: 'getTask',
    args: [taskId],
  });

  return {
    task: data,
    isLoading,
    error,
  };
}

// Hook to read total task count
export function useTotalTasks() {
  const { data, isLoading, error } = useReadContract({
    address: TASK_ESCROW_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: 'getTotalTasks',
  });

  return {
    totalTasks: data ? Number(data) : 0,
    isLoading,
    error,
  };
}