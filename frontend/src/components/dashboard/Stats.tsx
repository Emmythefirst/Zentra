import { CheckCircle, Clock, TrendingUp, Wallet } from 'lucide-react';

interface StatsProps {
  activeTasks: number;
  completedTasks: number;
  totalEarned: string;
  reputation: number;
}

export default function Stats({ activeTasks, completedTasks, totalEarned, reputation }: StatsProps) {
  const stats = [
    {
      label: 'Active Tasks',
      value: activeTasks,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'Total Earned',
      value: `${totalEarned} TASK`,
      icon: Wallet,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      label: 'Reputation',
      value: reputation,
      icon: TrendingUp,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}