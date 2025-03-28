
import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="md:hidden mr-3">
          {/* Mobile menu button (can be implemented later) */}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stock-blue-500 w-64"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1 bg-alert-red rounded-full w-2 h-2"></span>
        </button>
        <div className="flex items-center">
          <div className="mr-3 text-right hidden sm:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-stock-blue-600 flex items-center justify-center text-white">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
