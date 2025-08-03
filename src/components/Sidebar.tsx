import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  Users,
  Settings,
  Warehouse,
  Store,
  BarChart,
  FileText,
  Truck
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const Sidebar = () => {
  const { user } = useUserStore();
  const userRole = user?.role || 'guest';

  // Define nav items with role-based visibility
  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/',
      roles: ['superadmin', 'godownadmin', 'shopadmin']
    },
    {
      name: 'Inventory',
      icon: <Package size={20} />,
      path: '/inventory',
      roles: ['superadmin', 'godownadmin', 'shopadmin']
    },
    {
      name: 'Godowns',
      icon: <Warehouse size={20} />,
      path: '/godowns',
      roles: ['superadmin', 'godownadmin']
    },
    {
      name: 'Shops',
      icon: <Store size={20} />,
      path: '/shops',
      roles: ['superadmin', 'shopadmin']
    },
    {
      name: 'Transfers',
      icon: <ArrowLeftRight size={20} />,
      path: '/transfers',
      roles: ['superadmin', 'godownadmin']
    },
    {
      name: 'Dispatches',
      icon: <Truck size={20} />,
      path: '/dispatches',
      roles: ['superadmin', 'godownadmin']
    },
    {
      name: 'Sales',
      icon: <ShoppingCart size={20} />,
      path: '/sales',
      roles: ['superadmin', 'shopadmin']
    },
    {
      name: 'Reports',
      icon: <BarChart size={20} />,
      path: '/reports',
      roles: ['superadmin', 'godownadmin', 'shopadmin']
    },
    {
      name: 'Users',
      icon: <Users size={20} />,
      path: '/users',
      roles: ['superadmin']
    },
    {
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
      roles: ['superadmin']
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="h-full w-48 bg-sidebar text-sidebar-foreground shadow-lg flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold flex items-center">
          <Package className="mr-2" />
          StockMaster
        </h1>
        {user?.location && (
          <p className="text-xs mt-1 text-sidebar-foreground/70">
            {user.location
              .split(',')
              .map(loc => loc.trim())
              .map(loc => loc.charAt(0).toUpperCase() + loc.slice(1))
              .join(', ')}
          </p>
        )}
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'hover:bg-white/10'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
