
import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';

const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <div className="mr-3 text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'superadmin' 
                    ? 'Super Admin' 
                    : user?.role === 'godownadmin'
                      ? `Godown Admin${user.location ? ` (${user.location})` : ''}`
                      : `Shop Admin${user.location ? ` (${user.location})` : ''}`
                  }
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-stock-blue-600 flex items-center justify-center text-white">
                <User size={18} />
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-alert-red focus:text-alert-red cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
