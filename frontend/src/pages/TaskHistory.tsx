import { useState } from 'react';
import { useUserTasks } from '@/hooks/useUserTasks';
import {
  Search, ExternalLink, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, RefreshCw, Wallet
} from 'lucide-react';
import { useAccount } from 'wagmi';

export default function TaskHistory() {
  const { isConnected } = useAccount();
  const { tasks, loading, refresh } = useUserTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'DISPUTED': return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'SUBMITTED': return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'ACCEPTED': return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default: return <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      DISPUTED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      SUBMITTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      ACCEPTED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      OPEN: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your task history
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
          <p className="text-gray-600 dark:text-gray-400">Loading from blockchain...</p>
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
              Task History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              All your tasks — live from blockchain
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200
                     dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-colors text-gray-600 dark:text-gray-400"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Payment Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.reduce((sum, t) => sum + parseFloat(t.payment || '0'), 0).toFixed(2)} MON
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.length > 0
                ? ((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border
                      border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by description..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900
                         border border-gray-200 dark:border-gray-700 rounded-lg
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900
                         border border-gray-200 dark:border-gray-700 rounded-lg
                         text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                      {tasks.length === 0
                        ? 'No tasks found for your wallet.'
                        : 'No tasks match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.taskId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-2 max-w-xs">
                              {task.description}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Task #{task.taskId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {parseFloat(task.payment).toFixed(2)} MON
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {task.worker && task.worker !== '0x0000000000000000000000000000000000000000'
                          ? `${task.worker.slice(0, 6)}...${task.worker.slice(-4)}`
                          : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        {task.proofUrl ? (
                          <a
                            href={task.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600
                                     dark:text-blue-400 hover:underline text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Proof</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}