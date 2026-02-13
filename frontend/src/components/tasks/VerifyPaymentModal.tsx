import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useTaskEscrow } from '@/hooks/useContract';

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskDescription: string;
  proofUrl?: string;
  payment: string;
  onSuccess?: () => void;
}

export default function VerifyPaymentModal({ 
  isOpen, 
  onClose, 
  taskId, 
  taskDescription,
  proofUrl,
  payment,
  onSuccess 
}: VerifyPaymentModalProps) {
  const { verifyAndRelease, isPending, isConfirming, isConfirmed, hash } = useTaskEscrow();
  const [error, setError] = useState<string | null>(null);

  // Handle success - UPDATE LOCALSTORAGE
  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Payment released on blockchain!');
      
      // ✅ UPDATE LOCALSTORAGE - Mark task as COMPLETED
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('zentra_tasks_')) {
          const tasksJson = localStorage.getItem(key);
          if (tasksJson) {
            try {
              const tasks = JSON.parse(tasksJson);
              const updatedTasks = tasks.map((t: any) => 
                t.taskId === taskId 
                  ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
                  : t
              );
              localStorage.setItem(key, JSON.stringify(updatedTasks));
              console.log('💾 Task status updated to COMPLETED in localStorage');
            } catch (err) {
              console.error('Error updating task:', err);
            }
          }
        }
      }
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    }
  }, [isConfirmed, taskId, onSuccess, onClose]);

  const handleVerify = () => {
    console.log('✅ Verifying and releasing payment for task:', taskId);
    
    try {
      verifyAndRelease(BigInt(taskId));
    } catch (err) {
      console.error('Error verifying task:', err);
      setError('Failed to verify task. Please try again.');
    }
  };

  if (!isOpen) return null;

  // Success screen
  if (isConfirmed) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Released!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {payment} MON has been released to the worker
          </p>
          {hash && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all mb-4">
              Tx: {hash}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verify & Release Payment
          </h2>
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task</p>
            <p className="text-gray-900 dark:text-white font-medium mb-3">
              {taskDescription}
            </p>
            
            {/* Proof URL */}
            {proofUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Submitted Proof</p>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 
                           hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm break-all">{proofUrl}</span>
                </a>
              </div>
            )}
          </div>

          {/* Payment Breakdown */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 
                        dark:border-blue-800 rounded-lg p-4 space-y-2">
            <p className="text-blue-900 dark:text-blue-200 font-medium text-sm mb-3">
              Payment Breakdown
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-blue-800 dark:text-blue-300">Worker receives</span>
              <span className="font-medium text-blue-900 dark:text-blue-200">
                {(parseFloat(payment) * 0.95).toFixed(2)} MON (95%)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-800 dark:text-blue-300">Platform fee</span>
              <span className="font-medium text-blue-900 dark:text-blue-200">
                {(parseFloat(payment) * 0.05).toFixed(2)} MON (5%)
              </span>
            </div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-700 flex justify-between">
              <span className="font-medium text-blue-900 dark:text-blue-200">Total</span>
              <span className="font-semibold text-blue-900 dark:text-blue-200">
                {payment} MON
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 
                        dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-900 dark:text-yellow-200 font-medium text-sm mb-1">
                Review the proof before releasing payment
              </p>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Once you release payment, this action cannot be undone. Make sure the work meets your requirements.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 
                          dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 
                       rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 
                       dark:hover:bg-gray-700 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isPending || isConfirming}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg 
                       hover:bg-green-700 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isPending ? 'Confirm in Wallet...' : 'Releasing Payment...'}
                </>
              ) : (
                'Verify & Release Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}