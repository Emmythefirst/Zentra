import { Star, TrendingUp, Award, Target } from 'lucide-react';

interface ReputationCardProps {
  karma: number;
  successRate: number;
  totalTasks: number;
  ranking?: number;
}

export default function ReputationCard({ 
  karma, 
  successRate, 
  totalTasks, 
  ranking 
}: ReputationCardProps) {
  const getReputationLevel = (karma: number) => {
    if (karma >= 1000) return { level: 'Elite', color: 'text-purple-600 dark:text-purple-400' };
    if (karma >= 500) return { level: 'Expert', color: 'text-blue-600 dark:text-blue-400' };
    if (karma >= 250) return { level: 'Advanced', color: 'text-green-600 dark:text-green-400' };
    if (karma >= 100) return { level: 'Intermediate', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Beginner', color: 'text-gray-600 dark:text-gray-400' };
  };

  const reputation = getReputationLevel(karma);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reputation
          </h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-opacity-10 ${reputation.color}`}>
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">{reputation.level}</span>
          </div>
        </div>
      </div>

      {/* Karma Score */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Karma Score</span>
          <Star className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {karma.toLocaleString()}
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span>+25 this week</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {successRate}%
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalTasks}
          </div>
        </div>
      </div>

      {/* Ranking */}
      {ranking && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Global Ranking</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              #{ranking}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}