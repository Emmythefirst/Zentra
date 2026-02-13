import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Clock, Wallet, Search, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { createPublicClient, http, formatEther } from 'viem';
import { useTaskEscrow } from '@/hooks/useContract';

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
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
    outputs: [{
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
    }],
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

interface Task {
  taskId: number;
  description: string;
  payment: string;
  employer: string;
  status: string;
}

export default function AvailableTasks() {
  const { address, isConnected } = useAccount();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOpenTasks = async () => {
    setLoading(true);
    try {
      const total = await client.readContract({
        address: TASK_ESCROW_ADDRESS,
        abi: TASK_ESCROW_ABI,
        functionName: 'getTotalTasks',
      });

      const totalCount = Number(total);
      const openTasks: Task[] = [];

      for (let i = 1; i <= totalCount; i++) {
        try {
          const task: any = await client.readContract({
            address: TASK_ESCROW_ADDRESS,
            abi: TASK_ESCROW_ABI,
            functionName: 'getTask',
            args: [BigInt(i)],
          });

          // Only show OPEN tasks (status === 0) not created by current user
          if (
            task.status === 0 &&
            task.employer.toLowerCase() !== address?.toLowerCase()
          ) {
            openTasks.push({
              taskId: Number(task.taskId),
              description: task.description,
              payment: formatEther(task.payment),
              employer: task.employer,
              status: 'OPEN',
            });
          }
        } catch (err) {
          console.error(`Error fetching task ${i}:`, err);
        }
      }

      setTasks(openTasks);
    } catch (err) {
      console.error('Error fetching open tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) fetchOpenTasks();
  }, [address, isConnected]);

  const filteredTasks = tasks.filter(task =>
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to browse and accept tasks
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading tasks from blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Available Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Open tasks posted by employers — live from blockchain
            </p>
          </div>
          <button
            onClick={fetchOpenTasks}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200
                     dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-colors text-gray-600 dark:text-gray-400"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200
                       dark:border-gray-700 rounded-lg text-gray-900 dark:text-white
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          <span className="font-semibold text-gray-900 dark:text-white">
            {filteredTasks.length}
          </span> tasks available
        </p>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                        dark:border-gray-700 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No open tasks right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task.taskId} task={task} onAccepted={fetchOpenTasks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onAccepted }: { task: Task; onAccepted: () => void }) {
  const { address } = useAccount();
  const { acceptTask, isPending, isConfirming, isConfirmed, hash } = useTaskEscrow();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setShowSuccess(true);
      setTimeout(() => onAccepted(), 2000);
    }
  }, [isConfirmed]);

  if (showSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500
                    dark:border-green-400 p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Task Accepted!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Successfully accepted on-chain
        </p>
        {hash && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
            Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                  dark:border-gray-700 p-6 hover:shadow-lg transition-all">
      <p className="text-gray-900 dark:text-white font-medium mb-4 line-clamp-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-4 pb-4 border-b
                    border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {parseFloat(task.payment).toFixed(2)} MON
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">You receive</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {(parseFloat(task.payment) * 0.95).toFixed(2)} MON
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600
                    dark:text-gray-400 mb-4">
        <span className="font-mono">
          By: {task.employer.slice(0, 6)}...{task.employer.slice(-4)}
        </span>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600
                       dark:text-green-400 rounded-full text-xs font-medium">
          OPEN
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-4">Task #{task.taskId}</p>

      <button
        onClick={() => acceptTask(BigInt(task.taskId))}
        disabled={isPending || isConfirming}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center"
      >
        {isPending ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Confirm in Wallet...</>
        ) : isConfirming ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Accepting on Chain...</>
        ) : (
          'Accept Task'
        )}
      </button>
    </div>
  );
}