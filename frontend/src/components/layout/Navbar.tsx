import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 
                    border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Zentra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/marketplace" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 
                         dark:hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 
                         dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/create-task" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 
                         dark:hover:text-white transition-colors"
            >
              Create Task
            </Link>
            <Link
              to="/tasks"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 
                         dark:hover:text-white transition-colors"
            >
              Available Tasks
            </Link>
            <Link
              to="/history"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 
                         dark:hover:text-white transition-colors"
            >
              Task History
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4 space-y-3">
            <Link 
              to="/marketplace" 
              className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/create-task" 
              className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Task
            </Link>
            <Link
              to="/tasks"
              className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800"
               onClick={() => setIsMenuOpen(false)}          
            >
              Available Tasks
            </Link>
            <Link
              to="/history"
              className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800"
               onClick={() => setIsMenuOpen(false)}          
            >
              Task History
            </Link>
            <div className="pt-4 flex items-center justify-between">
              <ThemeToggle />
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}