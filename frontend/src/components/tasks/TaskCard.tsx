import { Clock, User, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Task } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onAccept?: (taskId: string) => void;
  onVerify?: (taskId: string) => void;
  showActions?: boolean;
}

export default function TaskCard({ task, onAccept, onVerify, showActions = true }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'ACCEPTED':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'SUBMITTED':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'DISPUTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'DISPUTED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {task.description}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{task.worker || 'Open'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(task.createdAt * 1000), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {getStatusIcon(task.status)}
          <span>{task.status}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {task.payment} TASK
          </span>
        </div>

        {showActions && (
          <div>
            {task.status === 'OPEN' && onAccept && (
              <button
                onClick={() => onAccept(task.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors text-sm font-medium"
              >
                Accept Task
              </button>
            )}
            {task.status === 'SUBMITTED' && onVerify && (
              <button
                onClick={() => onVerify(task.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors text-sm font-medium"
              >
                Verify & Pay
              </button>
            )}
          </div>
        )}
      </div>

      {/* Proof URL */}
      {task.proofUrl && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={task.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View Submitted Proof →
          </a>
        </div>
      )}
    </div>
  );
}