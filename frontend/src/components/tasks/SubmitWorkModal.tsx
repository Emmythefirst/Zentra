import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useTaskEscrow } from '@/hooks/useContract';

interface SubmitWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskDescription: string;
  onSuccess?: () => void;
}

export default function SubmitWorkModal({ 
  isOpen, 
  onClose, 
  taskId, 
  taskDescription,
  onSuccess 
}: SubmitWorkModalProps) {
  const { submitWork, isPending, isConfirming, isConfirmed, hash } = useTaskEscrow();
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle success - UPDATE LOCALSTORAGE
  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Work submitted on blockchain!');
      
      // ✅ UPDATE LOCALSTORAGE - Mark task as SUBMITTED
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('zentra_tasks_')) {
          const tasksJson = localStorage.getItem(key);
          if (tasksJson) {
            try {
              const tasks = JSON.parse(tasksJson);
              const updatedTasks = tasks.map((t: any) => 
                t.taskId === taskId 
                  ? { ...t, status: 'SUBMITTED', proofUrl, submittedAt: new Date().toISOString() }
                  : t
              );
              localStorage.setItem(key, JSON.stringify(updatedTasks));
              console.log('💾 Task status updated to SUBMITTED in localStorage');
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
  }, [isConfirmed, taskId, proofUrl, onSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!proofUrl) {
      setError('Please provide a proof URL');
      return;
    }

    if (!proofUrl.startsWith('http://') && !proofUrl.startsWith('https://')) {
      setError('Please provide a valid URL (must start with http:// or https://)');
      return;
    }

    setError(null);
    console.log('📤 Submitting work for task:', taskId);
    
    submitWork(BigInt(taskId), proofUrl);
  };

  if (!isOpen) return null;

  // Success screen
  if (isConfirmed) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Work Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your work has been submitted for review
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
            Submit Work
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {taskDescription}
            </p>
          </div>

          {/* Proof URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Proof URL *
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              required
              placeholder="https://example.com/proof-of-work"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 
                       dark:border-gray-700 rounded-lg text-gray-900 dark:text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Provide a link to your completed work (Google Drive, GitHub, etc.)
            </p>
          </div>

          {/* Examples */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 
                        dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-900 dark:text-blue-200 font-medium mb-2 text-sm">
              Examples of valid proof URLs:
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>• Google Drive link to CSV file</li>
              <li>• GitHub repository link</li>
              <li>• Public file hosting link</li>
              <li>• Portfolio/demo website</li>
            </ul>
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
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isPending ? 'Confirm in Wallet...' : 'Submitting...'}
                </>
              ) : (
                'Submit Work'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}