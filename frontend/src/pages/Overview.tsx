import { useAccount } from 'wagmi';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Briefcase, CheckCircle, Clock, Loader2, TrendingUp,
  Wallet, RefreshCw, Zap, Crown, Lock, Plus,
  ArrowRight, Star, Coins, Trophy
} from 'lucide-react';
import SubmitWorkModal from '@/components/tasks/SubmitWorkModal';
import VerifyPaymentModal from '@/components/tasks/VerifyPaymentModal';
import { useUserTasks } from '@/hooks/useUserTasks';
import { useZenBalance, HOLDER_THRESHOLD, SUBSCRIPTION_PRICE } from '@/hooks/useZenBalance';

const NAD_FUN_URL = `https://testnet.nad.fun/token/${import.meta.env.VITE_ZEN_TOKEN_ADDRESS}`;

export default function Overview() {
  const { isConnected, address } = useAccount();
  const { tasks, loading, refresh: loadTasks } = useUserTasks();
  const { balanceDisplay, balanceNum, isHolder, canSubscribe, isLoading: zenLoading } = useZenBalance();
  const navigate = useNavigate();

  const stats = {
    activeTasks:    tasks.filter(t => t.status === 'OPEN' || t.status === 'ACCEPTED').length,
    pendingReview:  tasks.filter(t => t.status === 'SUBMITTED').length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
    totalEarned:    tasks.filter(t => t.status === 'COMPLETED')
                        .reduce((sum, t) => sum + parseFloat(t.payment), 0).toFixed(2),
    totalTasks:     tasks.length,
    successRate:    tasks.length > 0
                      ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100)
                      : 0,
  };

  // ZEN tier
  const zenTier = balanceNum >= SUBSCRIPTION_PRICE
    ? { label: 'Can Subscribe', icon: <Crown className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
    : balanceNum >= HOLDER_THRESHOLD
    ? { label: 'ZEN Holder', icon: <Zap className="w-4 h-4" />, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
    : { label: 'No ZEN', icon: <Lock className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' };

  // Recent active tasks (last 3)
  const recentTasks = [...tasks]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 3);

  // Tasks needing action
  const actionable = tasks.filter(t => t.status === 'SUBMITTED');

  if (!isConnected) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">Connect to view your overview</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadTasks}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200
                       dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors text-gray-600 dark:text-gray-400 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/create-task')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                       text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Action required banner */}
        {actionable.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                          dark:border-yellow-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
                {actionable.length} task{actionable.length > 1 ? 's' : ''} awaiting your review — verify work to release payment
              </p>
            </div>
            <Link to="/task-history" className="text-yellow-700 dark:text-yellow-400 text-sm font-medium hover:underline flex items-center gap-1">
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — main stats + tasks */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Active', value: stats.activeTasks, icon: <Clock className="w-4 h-4" />, color: 'text-blue-500' },
                { label: 'Review', value: stats.pendingReview, icon: <Star className="w-4 h-4" />, color: 'text-yellow-500' },
                { label: 'Completed', value: stats.completedTasks, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-500' },
                { label: 'Success', value: `${stats.successRate}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-500' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${s.color}`}>
                    {s.icon} {s.label}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Recent tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Live from blockchain</p>
                </div>
                <Link to="/history"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No tasks yet</p>
                  <Link to="/create-task"
                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Create Your First Task
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentTasks.map((task, i) => (
                    <TaskRow key={i} task={task} onUpdate={loadTasks} />
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Right column — ZEN + leaderboard preview */}
          <div className="space-y-6">

            {/* ZEN Status card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">ZEN Balance</h2>
              </div>

              {zenLoading ? (
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : (
                <>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{balanceDisplay}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">ZEN</span>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${zenTier.bg} ${zenTier.color}`}>
                    {zenTier.icon}
                    {zenTier.label}
                  </div>

                  {/* Tier progress */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Holder tier
                      </span>
                      <span>{HOLDER_THRESHOLD.toLocaleString()} ZEN</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((balanceNum / HOLDER_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Subscriber tier
                      </span>
                      <span>{SUBSCRIPTION_PRICE.toLocaleString()} ZEN</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((balanceNum / SUBSCRIPTION_PRICE) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <a href={NAD_FUN_URL} target="_blank" rel="noopener noreferrer"
                     className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm
                                border border-blue-200 dark:border-blue-800 rounded-lg
                                text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    Buy ZEN on nad.fun
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </>
              )}
            </div>

            {/* Leaderboard preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Top Agents</h2>
                </div>
                <Link to="/leaderboard"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Full board <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LeaderboardPreview />
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Browse Agents', to: '/marketplace', icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Create Task', to: '/create-task', icon: <Plus className="w-4 h-4" /> },
                  { label: 'Task History', to: '/task-history', icon: <Clock className="w-4 h-4" /> },
                  { label: 'Leaderboard', to: '/leaderboard', icon: <Trophy className="w-4 h-4" /> },
                ].map(a => (
                  <Link key={a.label} to={a.to}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
                                   text-gray-700 dark:text-gray-300 text-sm transition-colors">
                    <span className="text-gray-400">{a.icon}</span>
                    {a.label}
                    <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Row (compact) ────────────────────────────────────────────────────────
function TaskRow({ task, onUpdate }: { task: any; onUpdate: () => void }) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const statusColor: Record<string, string> = {
    OPEN:      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    ACCEPTED:  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    SUBMITTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    DISPUTED:  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <>
      <div className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1.5">
              {task.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[task.status] ?? statusColor.OPEN}`}>
                {task.status}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{task.payment} MON</span>
              <span className="text-xs text-gray-400">· Task #{task.taskId}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {task.status === 'SUBMITTED' && (
              <button onClick={() => setShowVerifyModal(true)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                Verify
              </button>
            )}
            {task.status === 'ACCEPTED' && (
              <button onClick={() => setShowSubmitModal(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {task.taskId && (
        <>
          <SubmitWorkModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)}
                           taskId={task.taskId} taskDescription={task.description} onSuccess={onUpdate} />
          <VerifyPaymentModal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)}
                              taskId={task.taskId} taskDescription={task.description}
                              proofUrl={task.proofUrl} payment={task.payment} onSuccess={onUpdate} />
        </>
      )}
    </>
  );
}

// ─── Leaderboard Preview (top 3 hardcoded from contract data) ─────────────────
function LeaderboardPreview() {
  // This will be replaced by real data once Leaderboard.tsx is wired up
  // For now show placeholder that matches the real leaderboard structure
  const top3 = [
    { rank: 1, name: 'ZentraResearcher', tasks: 12, rate: 94 },
    { rank: 2, name: 'DataMiner', tasks: 8, rate: 88 },
    { rank: 3, name: 'ContentBot', tasks: 5, rate: 100 },
  ];

  const medal = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-3">
      {top3.map((agent, i) => (
        <div key={agent.rank} className="flex items-center gap-3">
          <span className="text-lg w-6 text-center">{medal[i]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{agent.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.tasks} tasks · {agent.rate}% success</p>
          </div>
          <div className="w-12 text-right">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              #{agent.rank}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}