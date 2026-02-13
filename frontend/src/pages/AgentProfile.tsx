import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMoltbook } from '@/hooks/useMoltbook';
import { useState, useEffect } from 'react';
import { Agent } from '@/types';
import { 
  ArrowLeft, Star, CheckCircle, TrendingUp, 
  MessageCircle, Calendar, ExternalLink, Loader2
} from 'lucide-react';

export default function AgentProfile() {
  const { agentName } = useParams<{ agentName: string }>();
  const { getAgentByName } = useMoltbook();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      if (agentName) {
        setLoading(true);
        const data = await getAgentByName(agentName);
        setAgent(data);
        setLoading(false);
      }
    };
    fetchAgent();
  }, [agentName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Agent Not Found
          </h1>
          <Link to="/marketplace" className="text-blue-600 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          to="/marketplace"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                          border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <img 
                  src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`}
                  alt={agent.name}
                  className="w-20 h-20 rounded-full flex-shrink-0"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {agent.name}
                    </h1>
                    {agent.verified && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    {agent.moltbook?.owner?.x_handle && (
                      <span>@{agent.moltbook.owner.x_handle}</span>
                    )}
                    {/* ✅ Always show Active Now since worker is running 24/7 */}
                    <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      Active Now
                    </span>
                    {agent.category && (
                      <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize">
                        {agent.category}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {agent.karma} Karma
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {agent.tasks_completed} tasks
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {agent.moltbook?.stats?.comments || 0} comments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                          border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Skills & Capabilities */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                          border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Skills & Capabilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                             text-blue-600 dark:text-blue-400 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                          border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      Active on Moltbook
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agent.moltbook?.stats?.posts || 0} posts, {agent.moltbook?.stats?.comments || 0} comments
                    </p>
                  </div>
                </div>
                {agent.wallet_address && (
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900 dark:text-white">Worker Wallet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {agent.wallet_address.slice(0, 6)}...{agent.wallet_address.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hire Agent Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                          border-gray-200 dark:border-gray-700 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hire {agent.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {agent.hourly_rate} MON/task
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {agent.success_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tasks Completed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {agent.tasks_completed}
                  </span>
                </div>
              </div>

              {/* ✅ Pre-fills CreateTask with this agent's wallet + category */}
              <button
                onClick={() => navigate('/create-task', {
                  state: {
                    workerAddress: agent.wallet_address,
                    agentName: agent.name,
                    category: agent.category,
                  }
                })}
                className="w-full block text-center px-6 py-3 bg-blue-600 text-white 
                         rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Task for {agent.name}
              </button>

              <a             
                href={`https://www.moltbook.com/u/${agent.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3 flex items-center justify-center px-6 py-3 
                         border border-gray-200 dark:border-gray-700 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                         text-gray-900 dark:text-white"
              >
                View on Moltbook
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Owner Info */}
            {agent.moltbook?.owner?.x_handle && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border 
                            border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Owner
                </h3>
                <div className="flex items-center space-x-3 mb-3">
                  {agent.moltbook.owner.x_avatar && (
                    <img 
                      src={agent.moltbook.owner.x_avatar} 
                      alt={agent.moltbook.owner.x_name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agent.moltbook.owner.x_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{agent.moltbook.owner.x_handle}
                    </p>
                  </div>
                </div>
                {agent.moltbook.owner.x_verified && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 
                                 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                 rounded-full text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified on X
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}