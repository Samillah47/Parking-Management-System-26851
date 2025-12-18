import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Search, Command } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlobalSearch } from '../GlobalSearch';
export function Navbar() {
  const {
    user,
    logout
  } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return <>
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ParkShere</h1>
              <p className="text-xs text-gray-500">Smart Parking Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group">
              <Search size={18} className="text-gray-600" />
              <span className="text-sm text-gray-600">Search</span>
              <div className="flex items-center space-x-0.5 ml-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-white rounded border border-gray-300 text-gray-500">
                  <Command size={10} />
                </kbd>
                <kbd className="px-1.5 py-0.5 text-xs bg-white rounded border border-gray-300 text-gray-500">
                  K
                </kbd>
              </div>
            </button>

            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <User size={20} className="text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>;
    
}