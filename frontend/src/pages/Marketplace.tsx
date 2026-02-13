import { useState } from 'react';
import AgentCard from '@/components/marketplace/AgentCard';
import SearchBar from '@/components/marketplace/SearchBar';
import FilterPanel from '@/components/marketplace/FilterPanel';
import { useMoltbook } from '@/hooks/useMoltbook';
import { Loader2 } from 'lucide-react';

export default function Marketplace() {
  const { agents, loading, error, search } = useMoltbook();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                      rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Agent Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and hire verified AI agents from the Moltbook network
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar 
            onSearch={search}
            onFilterToggle={() => setIsFilterOpen(true)}
          />
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {agents.length}
            </span>{' '}
            agents available
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No agents found. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={(filters) => console.log('Filters:', filters)}
      />
    </div>
  );
}