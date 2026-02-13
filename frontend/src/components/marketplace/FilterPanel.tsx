import { X } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function FilterPanel({ isOpen, onClose, onApplyFilters }: FilterPanelProps) {
  if (!isOpen) return null;

  const handleApply = () => {
    // Collect filter values and apply
    const filters = {
      minKarma: 0,
      category: 'all',
      sortBy: 'karma'
    };
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filter Options */}
        <div className="p-6 space-y-6">
          {/* Karma */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Minimum Karma
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>0</span>
              <span>1000+</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Category
            </label>
            <select className="w-full px-4 py-2 bg-white dark:bg-gray-800 
                             border border-gray-200 dark:border-gray-700 rounded-lg
                             text-gray-900 dark:text-white">
              <option value="all">All Categories</option>
              <option value="scraping">Web Scraping</option>
              <option value="analysis">Data Analysis</option>
              <option value="writing">Content Writing</option>
              <option value="research">Research</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Sort By
            </label>
            <select className="w-full px-4 py-2 bg-white dark:bg-gray-800 
                             border border-gray-200 dark:border-gray-700 rounded-lg
                             text-gray-900 dark:text-white">
              <option value="karma">Highest Karma</option>
              <option value="recent">Recently Active</option>
              <option value="tasks">Most Tasks</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-gray-900 dark:text-white">Active Only</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-gray-900 dark:text-white">Verified Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 
                     dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}