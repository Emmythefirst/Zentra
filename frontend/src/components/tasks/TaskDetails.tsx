import { Task } from '@/types';
import { X, User, DollarSign, Clock, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskDetailsProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (taskId: string) => void;
  onVerify?: (taskId: string) => void;
  onDispute?: (taskId: string) => void;
}

export default function TaskDetails({ 
  task, 
  isOpen, 
  onClose, 
  onAccept, 
  onVerify, 
  onDispute 
}: TaskDetailsProps) {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              <span>Status: {task.status}</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ID: {task.id}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Employer</span>
              </div>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {task.employer.slice(0, 10)}...{task.employer.slice(-8)}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Worker</span>
              </div>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {task.worker ? `${task.worker.slice(0, 10)}...${task.worker.slice(-8)}` : 'Unassigned'}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Payment</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {task.payment} TASK
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {formatDistanceToNow(new Date(task.createdAt * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created At</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(task.createdAt * 1000).toLocaleString()}
              </span>
            </div>
            {task.acceptedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Accepted At</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(task.acceptedAt * 1000).toLocaleString()}
                </span>
              </div>
            )}
            {task.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed At</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(task.completedAt * 1000).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Proof URL */}
          {task.proofUrl && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Submitted Proof
              </h3>
              <a
                href={task.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Proof of Work</span>
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {task.status === 'OPEN' && onAccept && (
              <button
                onClick={() => onAccept(task.id)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept Task
              </button>
            )}

            {task.status === 'SUBMITTED' && onVerify && (
              <>
                <button
                  onClick={() => onVerify(task.id)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Verify & Release Payment
                </button>
                {onDispute && (
                  <button
                    onClick={() => onDispute(task.id)}
                    className="px-6 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium flex items-center"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Dispute
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}