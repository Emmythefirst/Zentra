import { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTaskEscrow } from '@/hooks/useContract';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Map frontend category values to executor task types
const CATEGORY_MAP: Record<string, string> = {
  scraping: 'web_scraping',
  analysis: 'data_analysis',
  writing: 'content_summary',
  research: 'research',
  automation: 'research',
  other: 'research',
};

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const { address, isConnected } = useAccount();
  const { createTask, isPending, isConfirming, error: contractError } = useTaskEscrow();

  const [formData, setFormData] = useState({
    description: '',
    payment: '',
    category: 'scraping',
    worker: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (formData.description.length < 50) {
      setError('Description must be at least 50 characters');
      return;
    }

    if (parseFloat(formData.payment) < 1) {
      setError('Payment must be at least 1 MON');
      return;
    }

    setError(null);

    try {
      const workerAddress = formData.worker || '0x0000000000000000000000000000000000000000';
      const tokenAddress = '0x0000000000000000000000000000000000000000';

      // ✅ Embed category tag so worker knows exactly what to do
      const categoryTag = CATEGORY_MAP[formData.category] || 'research';
      const taggedDescription = `[CATEGORY:${categoryTag}] ${formData.description}`;

      console.log('🚀 Creating task from modal...', { categoryTag, taggedDescription });

      createTask(
        workerAddress,
        taggedDescription,
        formData.payment,
        tokenAddress
      );

      console.log('✅ Task created successfully!');

      setFormData({ description: '', payment: '', category: 'scraping', worker: '' });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      console.error('❌ Error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Task
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

          {/* Wallet Warning */}
          {!isConnected && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">Wallet not connected</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">Connect your wallet to create tasks</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Task Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
              placeholder="Describe the task in detail. Include requirements, deliverables, and deadline..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {formData.description.length}/50 characters minimum
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scraping">Web Scraping</option>
              <option value="analysis">Data Analysis</option>
              <option value="writing">Content Summary</option>
              <option value="research">Research</option>
              <option value="automation">Automation</option>
              <option value="other">Other</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The AI agent will be instructed to handle this as a{' '}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {CATEGORY_MAP[formData.category]?.replace('_', ' ')}
              </span>{' '}task
            </p>
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Payment Amount (MON) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                min="1"
                step="0.1"
                required
                placeholder="5.0"
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">MON</span>
            </div>
          </div>

          {/* Worker Address */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Specific Worker Address (Optional)
            </label>
            <input
              type="text"
              value={formData.worker}
              onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
              placeholder="0x... (leave empty for any worker)"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Leave empty to allow any agent to accept
            </p>
          </div>

          {/* Payment Breakdown */}
          {formData.payment && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Worker receives</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(parseFloat(formData.payment) * 0.95).toFixed(2)} MON (95%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Platform fee (5%)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(parseFloat(formData.payment) * 0.05).toFixed(2)} MON (5%)
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formData.payment} MON</span>
              </div>
            </div>
          )}

          {/* Error */}
          {(error || contractError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error || contractError?.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isConfirming || !isConnected}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isPending || isConfirming ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{isPending ? 'Confirm in Wallet...' : 'Creating...'}</>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}