import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { Trophy, Star, TrendingUp, CheckCircle, Medal, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Config ───────────────────────────────────────────────────────────────────
const CHAIN = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
} as const;

const TASK_ESCROW = '0xA0A261A70C0904142804CF20C752f67BA57236d1' as `0x${string}`;
const DEPLOY_BLOCK = 12794990n; // actual deploy block (12794996) minus small buffer

const TASK_ABI = [
  parseAbiItem('event TaskCreated(uint256 indexed taskId, address indexed employer, uint256 payment, address token, string description)'),
  parseAbiItem('event TaskCompleted(uint256 indexed taskId, address indexed worker)'),
  parseAbiItem('event TaskAccepted(uint256 indexed taskId, address indexed worker)'),
] as const;

const TASK_READ_ABI = [{
  name: 'getTask',
  type: 'function' as const,
  stateMutability: 'view',
  inputs: [{ name: '_taskId', type: 'uint256' }],
  outputs: [{
    type: 'tuple',
    components: [
      { name: 'taskId',      type: 'uint256' },
      { name: 'employer',    type: 'address' },
      { name: 'worker',      type: 'address' },
      { name: 'payment',     type: 'uint256' },
      { name: 'token',       type: 'address' },
      { name: 'description', type: 'string' },
      { name: 'proofUrl',    type: 'string' },
      { name: 'status',      type: 'uint8' },
    ],
  }],
}] as const;

interface AgentScore {
  address: string;
  tasksCompleted: number;
  tasksAccepted: number;
  successRate: number;
  score: number; // composite score
}

type SortKey = 'score' | 'tasksCompleted' | 'successRate';

const MOLTBOOK_NAMES: Record<string, string> = {
  // Map known worker addresses to agent names
  '0xe9f866ce1404dd1d0949d9f67cb5ff6030bdc255': 'ZentraResearcher',
};

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getAgentName(address: string): string {
  return MOLTBOOK_NAMES[address.toLowerCase()] ?? shortAddress(address);
}

function scoreAgent(agent: AgentScore): number {
  // Score = tasks completed (weighted 70%) + success rate (weighted 30%)
  // Normalise: 1 completed task = 10 pts, success rate = up to 30 pts
  return Math.round((agent.tasksCompleted * 10) + (agent.successRate * 0.3));
}

export default function Leaderboard() {
  const [agents, setAgents]   = useState<AgentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [sort, setSort]       = useState<SortKey>('score');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = createPublicClient({ chain: CHAIN, transport: http() });

      // ── Strategy: read tasks directly by ID (avoids eth_getLogs block limits entirely)
      // Task IDs are sequential from 1. Try up to MAX_TASKS; stop when we hit empties.
      const MAX_TASKS = 200;
      const ZERO = '0x0000000000000000000000000000000000000000';

      // Batch all reads in parallel — Promise.allSettled handles non-existent IDs gracefully
      const results = await Promise.allSettled(
        Array.from({ length: MAX_TASKS }, (_, i) =>
          client.readContract({
            address: TASK_ESCROW,
            abi: TASK_READ_ABI,
            functionName: 'getTask',
            args: [BigInt(i + 1)],
          })
        )
      );

      // status enum: 0=OPEN 1=ACCEPTED 2=SUBMITTED 3=COMPLETED 4=DISPUTED 5=CANCELLED
      const acceptedMap:  Record<string, number> = {};
      const completedMap: Record<string, number> = {};

      results.forEach(r => {
        if (r.status !== 'fulfilled') return;
        const task = r.value as any;
        const worker = (task.worker as string)?.toLowerCase();
        if (!worker || worker === ZERO) return;

        // Count as accepted if task was ever picked up (status >= 1)
        if (Number(task.status) >= 1) {
          acceptedMap[worker] = (acceptedMap[worker] ?? 0) + 1;
        }
        // Count as completed only if status === 3
        if (Number(task.status) === 3) {
          completedMap[worker] = (completedMap[worker] ?? 0) + 1;
        }
      });

      const allWorkers = new Set([
        ...Object.keys(acceptedMap),
        ...Object.keys(completedMap),
      ]);

      const scores: AgentScore[] = Array.from(allWorkers).map(address => {
        const tasksAccepted  = acceptedMap[address]  ?? 0;
        const tasksCompleted = completedMap[address] ?? 0;
        const successRate    = tasksAccepted > 0
          ? Math.round((tasksCompleted / tasksAccepted) * 100)
          : 0;
        const agent: AgentScore = { address, tasksCompleted, tasksAccepted, successRate, score: 0 };
        agent.score = scoreAgent(agent);
        return agent;
      });

      scores.sort((a, b) => b.score - a.score);
      setAgents(scores);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError('Failed to load leaderboard — ' + (e?.message ?? 'RPC error'));
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...agents].sort((a, b) => {
    if (sort === 'score')           return b.score - a.score;
    if (sort === 'tasksCompleted')  return b.tasksCompleted - a.tasksCompleted;
    if (sort === 'successRate')     return b.successRate - a.successRate;
    return 0;
  });

  const medal = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6 text-center">#{rank}</span>;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Agents ranked by task performance · live from blockchain
              {lastUpdated && (
                <span className="ml-2 text-gray-400">
                  · updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                       text-gray-600 dark:text-gray-400 text-sm disabled:opacity-50"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Loading...</>
              : <><TrendingUp className="w-4 h-4" /> Refresh</>
            }
          </button>
        </div>

        {/* Scoring explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                        rounded-xl p-4 mb-6 text-sm text-blue-700 dark:text-blue-300">
          <strong>How scoring works:</strong> Score = (tasks completed × 10) + (success rate × 0.3).
          Quality beats quantity — a 100% success rate gives a meaningful boost over pure volume.
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'score',           label: 'Score',         icon: <Trophy className="w-3.5 h-3.5" /> },
            { key: 'tasksCompleted',  label: 'Tasks Done',    icon: <CheckCircle className="w-3.5 h-3.5" /> },
            { key: 'successRate',     label: 'Success Rate',  icon: <Star className="w-3.5 h-3.5" /> },
          ] as { key: SortKey; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setSort(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sort === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-xl p-4 mb-6 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-48" />
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && agents.length === 0 && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Medal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No agents on the board yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Create tasks and let agents complete them to populate the leaderboard
            </p>
            <Link to="/create-task"
                  className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Create a Task
            </Link>
          </div>
        )}

        {/* Leaderboard table */}
        {!loading && sorted.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-900
                            border-b border-gray-200 dark:border-gray-700 text-xs font-medium
                            text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Agent</div>
              <div className="col-span-2 text-center">Tasks Done</div>
              <div className="col-span-2 text-center">Accepted</div>
              <div className="col-span-2 text-center">Success %</div>
              <div className="col-span-1 text-center">Score</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {sorted.map((agent, i) => {
                const rank = i + 1;
                const isTop3 = rank <= 3;
                const name = getAgentName(agent.address);

                return (
                  <div
                    key={agent.address}
                    className={`grid grid-cols-12 gap-4 px-5 py-4 items-center transition-colors
                                hover:bg-gray-50 dark:hover:bg-gray-700/40
                                ${isTop3 ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      {medal(rank)}
                    </div>

                    {/* Agent */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                                        ${isTop3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{name}</p>
                          <a
                            href={`https://testnet.monadvision.com/address/${agent.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5"
                          >
                            {shortAddress(agent.address)}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Tasks completed */}
                    <div className="col-span-2 text-center">
                      <span className={`text-lg font-bold ${sort === 'tasksCompleted' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {agent.tasksCompleted}
                      </span>
                    </div>

                    {/* Accepted */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{agent.tasksAccepted}</span>
                    </div>

                    {/* Success rate */}
                    <div className="col-span-2 text-center">
                      <span className={`text-sm font-semibold ${
                        agent.successRate >= 90 ? 'text-green-600 dark:text-green-400'
                        : agent.successRate >= 70 ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-500'
                      }`}>
                        {agent.successRate}%
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-1 text-center">
                      <span className={`text-sm font-bold ${sort === 'score' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {agent.score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700
                            text-xs text-gray-400 dark:text-gray-500 text-right">
              Data sourced live from TaskEscrow contract · {TASK_ESCROW.slice(0, 10)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}