import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Briefcase, CheckCircle, Clock, Loader2,
  TrendingUp, Wallet, RefreshCw
} from 'lucide-react';
import SubmitWorkModal from '@/components/tasks/SubmitWorkModal';
import VerifyPaymentModal from '@/components/tasks/VerifyPaymentModal';
import { useUserTasks } from '@/hooks/useUserTasks';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { tasks, loading, refresh: loadTasks } = useUserTasks();

  // Calculate stats from on-chain tasks
  const stats = {
    activeTasks: tasks.filter(t => t.status === 'OPEN' || t.status === 'ACCEPTED').length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
    totalEarned: tasks
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + parseFloat(t.payment), 0)
      .toFixed(2),
    totalTasks: tasks.length,
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to view your dashboard
            </p>
          </div>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your tasks and track your performance
            </p>
          </div>
          <button
            onClick={loadTasks}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 
                     dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     transition-colors text-gray-600 dark:text-gray-400"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                        border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Active Tasks</span>
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.activeTasks}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                        border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.completedTasks}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                        border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Total Earned</span>
              <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalEarned} <span className="text-lg">MON</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                        border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Total Tasks</span>
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalTasks}
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border 
                      border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Tasks
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Live from blockchain — showing tasks where you are employer or worker
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No tasks yet. Create your first task to get started!
                </p>
                <Link
                  to="/create-task"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg 
                           hover:bg-blue-700 transition-colors"
                >
                  Create Your First Task
                </Link>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskRow key={index} task={task} onUpdate={loadTasks} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Row Component
function TaskRow({ task, onUpdate }: { task: any; onUpdate: () => void }) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  return (
    <>
      <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {task.description}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.status === 'OPEN'
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                  : task.status === 'ACCEPTED'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : task.status === 'SUBMITTED'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : task.status === 'COMPLETED'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
              }`}>
                {task.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{task.payment} MON</span>
              <span>•</span>
              <span>Task #{task.taskId}</span>
              {task.worker && task.worker !== '0x0000000000000000000000000000000000000000' && (
                <>
                  <span>•</span>
                  <span>Worker: {task.worker.slice(0, 6)}...{task.worker.slice(-4)}</span>
                </>
              )}
              {task.proofUrl && (
                <>
                  <span>•</span>
                  <a
                    href={task.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Proof
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {task.status === 'ACCEPTED' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors text-sm"
            >
              Submit Work
            </button>
          )}

          {task.status === 'SUBMITTED' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg 
                         hover:bg-green-700 transition-colors text-sm"
              >
                Verify & Release Payment
              </button>
              <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 
                               rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                               transition-colors text-sm text-gray-900 dark:text-white">
                Dispute
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Work Modal */}
      {task.taskId && (
        <SubmitWorkModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          taskId={task.taskId}
          taskDescription={task.description}
          onSuccess={onUpdate}
        />
      )}

      {/* Verify Payment Modal */}
      {task.taskId && (
        <VerifyPaymentModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          taskId={task.taskId}
          taskDescription={task.description}
          proofUrl={task.proofUrl}
          payment={task.payment}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}