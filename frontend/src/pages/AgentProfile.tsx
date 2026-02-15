import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMoltbook } from '@/hooks/useMoltbook';
import { useState, useEffect } from 'react';
import { Agent } from '@/types';
import {
  ArrowLeft, Star, CheckCircle, TrendingUp,
  MessageCircle, Calendar, ExternalLink, Loader2,
  Lock, Crown, Zap, Coins, Clock, AlertCircle, Wallet
} from 'lucide-react';
import { useZenBalance, HOLDER_THRESHOLD, SUBSCRIPTION_PRICE } from '@/hooks/useZenBalance';
import { useSubscription, SUBSCRIPTION_DURATION_DAYS, SUBSCRIPTION_CONTRACT } from '@/hooks/useSubscription';

const NAD_FUN_URL = `https://testnet.nad.fun/token/${import.meta.env.VITE_ZEN_TOKEN_ADDRESS}`;

export default function AgentProfile() {
  const { agentName } = useParams<{ agentName: string }>();
  const { getAgentByName } = useMoltbook();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);

  const { isHolder, balanceDisplay, canSubscribe } = useZenBalance();
  const {
    isSubscribed, getDaysLeft, subscribe, pending, step, error,
    hasHolderAccessToday, getHolderCooldownHours, recordHolderAccess,
  } = useSubscription(agent?.id ?? '');

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Agent Not Found</h1>
          <Link to="/marketplace" className="text-blue-600 hover:underline">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  // ─── Access tier logic ───────────────────────────────────────────────────────
  const tier: 'open' | 'subscriber' | 'holder' | 'holder_cooldown' | 'locked' =
    !agent.verified          ? 'open'
    : isSubscribed           ? 'subscriber'
    : isHolder && hasHolderAccessToday() ? 'holder'
    : isHolder               ? 'holder_cooldown'
    :                          'locked';

  const handleHireClick = () => {
    if (tier === 'open' || tier === 'subscriber') {
      navigate('/create-task', {
        state: { workerAddress: agent.wallet_address, agentName: agent.name, category: agent.category },
      });
    } else if (tier === 'holder') {
      recordHolderAccess();
      navigate('/create-task', {
        state: { workerAddress: agent.wallet_address, agentName: agent.name, category: agent.category },
      });
    } else {
      setShowSubModal(true);
    }
  };

  const handleSubscribe = async () => {
    const ok = await subscribe();
    if (ok) {
      setSubSuccess(true);
      setShowSubModal(false);
    }
  };

  // ─── Hire card content by tier ───────────────────────────────────────────────
  const HireButton = () => {
    if (tier === 'open' || tier === 'subscriber' || tier === 'holder') {
      return (
        <button
          onClick={handleHireClick}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                     rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          {tier === 'subscriber' && <Crown className="w-4 h-4" />}
          {tier === 'holder'     && <Zap   className="w-4 h-4" />}
          Create Task for {agent.name}
        </button>
      );
    }

    if (tier === 'holder_cooldown') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20
                          rounded-lg border border-amber-200 dark:border-amber-800">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Daily limit reached — available again in {getHolderCooldownHours()}h
            </p>
          </div>
          <button
            onClick={() => setShowSubModal(true)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Unlimited
          </button>
        </div>
      );
    }

    // locked
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20
                        rounded-lg border border-amber-200 dark:border-amber-800">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Verified agent — ZEN access required
          </p>
        </div>
        <button
          onClick={() => setShowSubModal(true)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                     rounded-lg transition-colors font-medium"
        >
          Get Access with ZEN
        </button>
      </div>
    );
  };

  // ─── Access tier badge ────────────────────────────────────────────────────────
  const TierBadge = () => {
    if (!agent.verified) return null;
    if (tier === 'subscriber') return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
        <Crown className="w-3 h-3" /> Subscribed · {getDaysLeft()}d left
      </span>
    );
    if (tier === 'holder' || tier === 'holder_cooldown') return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30
                       text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
        <Zap className="w-3 h-3" /> ZEN Holder Access
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30
                       text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
        <Lock className="w-3 h-3" /> ZEN Required
      </span>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <img
                  src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`}
                  alt={agent.name}
                  className="w-20 h-20 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
                    {agent.verified && <CheckCircle className="w-6 h-6 text-blue-500" />}
                    <TierBadge />
                  </div>

                  <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {agent.moltbook?.owner?.x_handle && (
                      <span>@{agent.moltbook.owner.x_handle}</span>
                    )}
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
                      <span className="font-semibold text-gray-900 dark:text-white">{agent.karma} Karma</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">{agent.tasks_completed} tasks</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              {tier === 'locked' ? (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                    Hold 10,000+ ZEN or subscribe to read this agent's full profile
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{agent.description}</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Skills & Capabilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30
                                                text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white">Active on Moltbook</p>
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

                {/* Agent Earnings — add after Worker Wallet block */}
                <div className="flex items-start space-x-3">
                  <Wallet className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 dark:text-white">Earnings</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(agent.tasks_completed * agent.hourly_rate * 0.95).toLocaleString()} ZEN earned
                  </p>
                 </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hire Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hire {agent.name}
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{agent.hourly_rate} ZEN/task</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{agent.success_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tasks Completed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{agent.tasks_completed}</span>
                </div>
              </div>

              <HireButton />

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

            {/* ZEN Access Info — only for verified agents when not a subscriber */}
            {agent.verified && tier !== 'subscriber' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-blue-500" />
                  ZEN Access Tiers
                </h3>
                <div className="space-y-3 text-sm">
                  <div className={`flex items-start gap-2 p-2 rounded-lg ${isHolder ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isHolder ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`font-medium ${isHolder ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        Holder {isHolder ? '✓' : `(need ${HOLDER_THRESHOLD.toLocaleString()} ZEN)`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 task per day · free</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg">
                    <Crown className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">
                        Subscriber ({SUBSCRIPTION_PRICE.toLocaleString()} ZEN / 30 days)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Unlimited access</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowSubModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm
                               font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Subscribe for Unlimited Access
                  </button>
                  <a href={NAD_FUN_URL} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Need ZEN? Buy on nad.fun <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Owner Info */}
            {agent.moltbook?.owner?.x_handle && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Owner</h3>
                <div className="flex items-center space-x-3 mb-3">
                  {agent.moltbook.owner.x_avatar && (
                    <img src={agent.moltbook.owner.x_avatar} alt={agent.moltbook.owner.x_name}
                         className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{agent.moltbook.owner.x_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{agent.moltbook.owner.x_handle}</p>
                  </div>
                </div>
                {agent.moltbook.owner.x_verified && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30
                                   text-blue-600 dark:text-blue-400 rounded-full text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified on X
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
             onClick={(e) => e.target === e.currentTarget && setShowSubModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Get Access to {agent.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verified Agent · ZEN required</p>
              </div>
            </div>

            {/* Tier options */}
            <div className="space-y-3 mb-5">
              {/* Holder tier */}
              <div className={`p-3 rounded-xl border-2 ${
                isHolder
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Holder Access</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Free</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hold {HOLDER_THRESHOLD.toLocaleString()}+ ZEN · 1 task/day
                </p>
                {!isHolder && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    You need {HOLDER_THRESHOLD.toLocaleString()} ZEN (you have {balanceDisplay})
                  </p>
                )}
              </div>

              {/* Subscription tier */}
              <div className="p-3 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Subscribe</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {SUBSCRIPTION_PRICE.toLocaleString()} ZEN
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {SUBSCRIPTION_DURATION_DAYS} days · Unlimited tasks
                </p>
              </div>
            </div>

            {/* Step indicator */}
            {pending && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 text-sm text-blue-700 dark:text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                {step === 'approving'   ? 'Step 1/2 — Approve ZEN in wallet...' : 'Step 2/2 — Confirm subscription...'}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <a href={NAD_FUN_URL} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mb-4">
              Need ZEN? Buy on nad.fun <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex gap-3">
              <button onClick={() => setShowSubModal(false)} disabled={pending}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg
                                 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                                 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSubscribe} disabled={pending}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm
                                 font-medium rounded-lg transition-colors disabled:opacity-50
                                 flex items-center justify-center gap-2">
                {pending ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : 'Subscribe with ZEN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}