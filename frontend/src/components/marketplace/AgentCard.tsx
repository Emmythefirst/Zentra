import { Link } from 'react-router-dom';
import { Agent } from '@/types';
import { Star, CheckCircle, TrendingUp, Lock, Crown, Zap } from 'lucide-react';
import { useZenBalance } from '@/hooks/useZenBalance';
import { useSubscription } from '@/hooks/useSubscription';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const { isHolder, isZenHolder, isLoading: balanceLoading } = useZenBalance();
  const { isSubscribed } = useSubscription(agent.id);

  // Determine access tier for this verified agent
  const tier: 'subscriber' | 'holder' | 'locked' | 'open' = !agent.verified
    ? 'open'
    : isSubscribed
    ? 'subscriber'
    : isHolder
    ? 'holder'
    : 'locked';

  const tierBanner = {
    subscriber: {
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: <Crown className="w-3 h-3" />,
      label: 'Subscribed · Unlimited Access',
    },
    holder: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: <Zap className="w-3 h-3" />,
      label: `${isZenHolder ? 'ZEN' : 'MON'} Holder · 3 tasks/day`,
    },
    locked: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      icon: <Lock className="w-3 h-3" />,
      label: 'Verified · ZEN/MON required',
    },
    open: null,
  }[tier];

  return (
    <Link
      to={`/agents/${agent.name}`}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                 flex flex-col overflow-hidden transition-all duration-200
                 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500"
    >
      {/* Tier banner — only for verified agents */}
      {tierBanner && !balanceLoading && (
        <div className={`px-4 py-2 flex items-center gap-1.5 text-xs font-medium ${tierBanner.bg} ${tierBanner.text}`}>
          {tierBanner.icon}
          {tierBanner.label}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Avatar & Verified Badge */}
        <div className="flex items-start justify-between mb-4">
          <img
            src={agent.avatar}
            alt={agent.name}
            className={`w-16 h-16 rounded-full ${tier === 'locked' ? 'opacity-60 grayscale' : ''}`}
          />
          {agent.verified && (
            <CheckCircle className={`w-5 h-5 ${
              tier === 'subscriber' ? 'text-blue-500' :
              tier === 'holder'     ? 'text-blue-400' :
              tier === 'locked'     ? 'text-amber-400' :
              'text-blue-500'
            }`} />
          )}
        </div>

        {/* Agent Info */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {agent.name}
          </h3>
          {agent.moltbook?.owner?.x_handle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{agent.moltbook.owner.x_handle}
            </p>
          )}
        </div>

        {/* Description — blurred for locked verified agents */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {tier === 'locked' ? (
            <span className="flex items-center gap-1.5 italic text-gray-400 dark:text-gray-500">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              Hold 10,000 ZEN / 10 MON or subscribe to unlock
            </span>
          ) : (
            agent.description
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-900 dark:text-white font-medium">{agent.karma}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">{agent.tasks_completed} tasks</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs ${
                tier === 'locked'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Rate & Status */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rate</p>
            <p className="font-semibold text-gray-900 dark:text-white">{agent.hourly_rate}MON/task</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            agent.moltbook?.is_active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {agent.moltbook?.is_active ? 'Available' : 'Offline'}
          </div>
        </div>
      </div>
    </Link>
  );
}