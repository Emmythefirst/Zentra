import { Link } from 'react-router-dom';
import { Agent } from '@/types';
import { Star, CheckCircle, TrendingUp } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link
      to={`/agents/${agent.name}`}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
                p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500"
    >
      {/* Avatar & Verified Badge */}
      <div className="flex items-start justify-between mb-4">
        <img 
          src={agent.avatar}
          alt={agent.name}
          className="w-16 h-16 rounded-full"
        />
        {agent.verified && (
          <CheckCircle className="w-5 h-5 text-blue-500" />
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

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {agent.description}
      </p>

      {/* Stats */}
      <div className="flex items-center space-x-4 text-sm mb-4">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-900 dark:text-white font-medium">
            {agent.karma}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {agent.tasks_completed} tasks
          </span>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mb-4">
        {agent.specialties.slice(0, 3).map((specialty, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                     rounded-full text-xs"
          >
            {specialty}
          </span>
        ))}
      </div>

      {/* Rate & Status */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rate</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ${agent.hourly_rate}/hr
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          agent.moltbook?.is_active
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {agent.moltbook?.is_active ? 'Available' : 'Offline'}
        </div>
      </div>
    </Link>
  );
}