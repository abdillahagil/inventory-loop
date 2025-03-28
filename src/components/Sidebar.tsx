
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Transfer, 
  ShoppingCart, 
  Users, 
  Settings, 
  Boxes, 
  Store,
  BarChart, 
  FileText,
  Truck 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { name: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
  { name: 'Godowns', icon: <Boxes size={20} />, path: '/godowns' },
  { name: 'Shops', icon: <Store size={20} />, path: '/shops' },
  { name: 'Transfers', icon: <Transfer size={20} />, path: '/transfers' },
  { name: 'Dispatches', icon: <Truck size={20} />, path: '/dispatches' },
  { name: 'Sales', icon: <ShoppingCart size={20} />, path: '/sales' },
  { name: 'Reports', icon: <BarChart size={20} />, path: '/reports' },
  { name: 'Users', icon: <Users size={20} />, path: '/users' },
  { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

const Sidebar = () => {
  return (
    <div className="h-full w-64 bg-sidebar text-sidebar-foreground shadow-lg flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold flex items-center">
          <Package className="mr-2" />
          StockMaster
        </h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
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
