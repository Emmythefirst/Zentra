import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
}

export default function SearchBar({ onSearch, onFilterToggle }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents by name, skill, or description..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 
                   border border-gray-200 dark:border-gray-700 rounded-lg
                   text-gray-900 dark:text-white placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Button */}
      <button
        type="button"
        onClick={onFilterToggle}
        className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-gray-900 
                 border border-gray-200 dark:border-gray-700 rounded-lg
                 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="hidden sm:inline text-gray-900 dark:text-white font-medium">
          Filters
        </span>
      </button>

      {/* Search Button */}
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                 hover:bg-blue-700 transition-colors font-medium"
      >
        Search
      </button>
    </form>
  );
}