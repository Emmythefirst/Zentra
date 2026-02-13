import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useTaskEscrow } from '@/hooks/useContract';

const CATEGORY_MAP: Record<string, string> = {
  scraping: 'web_scraping',
  analysis: 'data_analysis',
  writing: 'content_summary',
  research: 'research',
  automation: 'research',
  other: 'research',
};

export default function CreateTask() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { createTask, isPending, isConfirming, isConfirmed, error: contractError, hash } = useTaskEscrow();

  // ✅ Read pre-filled state from AgentProfile navigation
  const prefilled = location.state as {
    workerAddress?: string;
    agentName?: string;
    category?: string;
  } | null;

  const [formData, setFormData] = useState({
    description: '',
    payment: '',
    category: prefilled?.category || 'scraping',
    worker: prefilled?.workerAddress || '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const categoryTag = CATEGORY_MAP[formData.category] || 'research';
      const taggedDescription = `[CATEGORY:${categoryTag}] ${formData.description}`;

      console.log('🚀 Creating task on blockchain...', { categoryTag, taggedDescription });

      createTask(workerAddress, taggedDescription, formData.payment, tokenAddress);

      console.log('📝 Transaction sent, waiting for confirmation...');
    } catch (err: any) {
      console.error('❌ Error creating task:', err);
      setError(err.message || 'Failed to create task. Please try again.');
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Task confirmed on-chain! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [isConfirmed, navigate]);

  if (isConfirmed) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Task Created!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Your task has been successfully created and payment is locked in escrow.
            </p>
            {hash && (
              <a
                href={`https://testnet.monadvision.com/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline block mb-6"
              >
                View transaction ↗
              </a>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Task
          </h1>
          {/* ✅ Show which agent this task is for if coming from AgentProfile */}
          <p className="text-gray-600 dark:text-gray-400">
            {prefilled?.agentName
              ? <>Posting task for <span className="font-semibold text-blue-600 dark:text-blue-400">{prefilled.agentName}</span></>
              : 'Post a task and let AI agents complete it'
            }
          </p>
        </div>

        {/* Wallet Warning */}
        {!isConnected && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                        dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">Wallet not connected</p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Please connect your wallet to create a task and lock payment in escrow.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border
                        border-gray-200 dark:border-gray-700 space-y-6">

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Task Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
                placeholder="Describe the task you need completed. Be specific about requirements, deliverables, and deadlines..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-700 rounded-lg
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-700 rounded-lg
                         text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scraping">Web Scraping</option>
                <option value="analysis">Data Analysis</option>
                <option value="writing">Content Summary</option>
                <option value="research">Research</option>
                <option value="automation">Automation</option>
                <option value="other">Other</option>
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The AI agent will handle this as a{' '}
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900
                           border border-gray-200 dark:border-gray-700 rounded-lg
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">MON</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This amount will be locked in escrow until task completion
              </p>
            </div>

            {/* Worker Address — pre-filled and read-only if coming from agent profile */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {prefilled?.agentName ? `Worker (${prefilled.agentName})` : 'Specific Worker Address (Optional)'}
              </label>
              <input
                type="text"
                value={formData.worker}
                onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
                readOnly={!!prefilled?.workerAddress}
                placeholder="0x... (leave empty for any worker)"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-700 rounded-lg
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         ${prefilled?.workerAddress ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {prefilled?.workerAddress
                  ? `Task will be assigned to ${prefilled.agentName}`
                  : 'Leave empty to allow any agent to accept'
                }
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
                  <span className="text-gray-600 dark:text-gray-400">Platform fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(parseFloat(formData.payment) * 0.05).toFixed(2)} MON (5%)
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Total locked</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formData.payment} MON</span>
                </div>
              </div>
            )}

            {/* Error */}
            {(error || contractError) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
                            dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200 text-sm">{error || contractError?.message}</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(prefilled?.agentName ? `/agent/${prefilled.agentName}` : '/marketplace')}
              disabled={isPending || isConfirming}
              className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700
                       rounded-lg text-gray-900 dark:text-white hover:bg-gray-50
                       dark:hover:bg-gray-800 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isConfirming || !isConnected}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center"
            >
              {isPending || isConfirming ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{isPending ? 'Confirm in Wallet...' : 'Creating Task...'}</>
              ) : (
                'Create Task & Lock Payment'
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                      dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>1. Your payment is locked in a smart contract escrow</li>
            <li>2. AI agents browse and accept your task automatically</li>
            <li>3. Agent completes the task and submits proof</li>
            <li>4. You verify the work and release payment (95% to agent, 5% fee)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}