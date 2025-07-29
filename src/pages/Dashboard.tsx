import React from 'react';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/StatCard';
import StockTable from '@/components/StockTable';
import ActivityLog from '@/components/ActivityLog';
import { Package, ShoppingCart, ArrowDownUp, AlertCircle } from 'lucide-react';
import { useInventory } from '@/hooks/use-inventory';
import { activityService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';

// Fallback sample data in case the API is not available
const sampleInventoryData = [
  { id: '1', name: 'Laptop Dell XPS 13', sku: 'LAP-DEL-001', category: 'Electronics', location: 'Main Warehouse', quantity: 24, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-10' },
  { id: '2', name: 'iPhone 13 Pro', sku: 'PHN-APP-002', category: 'Electronics', location: 'Main Warehouse', quantity: 5, unit: 'pcs', status: 'Low' as const, lastUpdated: '2023-06-09' },
  { id: '3', name: 'Wireless Headphones', sku: 'AUD-SNY-003', category: 'Electronics', location: 'Downtown Shop', quantity: 32, unit: 'pcs', status: 'High' as const, lastUpdated: '2023-06-08' },
  { id: '4', name: 'Smart Watch Series 7', sku: 'WTC-APP-004', category: 'Wearables', location: 'Mall Branch', quantity: 18, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-07' },
  { id: '5', name: 'Gaming Mouse', sku: 'ACC-LOG-005', category: 'Accessories', location: 'Main Warehouse', quantity: 41, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-06' },
];

const sampleActivities = [
  { id: '1', user: 'John Doe', action: 'transferred 10 Laptops from', target: 'Main Warehouse to Downtown Shop', timestamp: '2 hours ago' },
  { id: '2', user: 'Sarah Smith', action: 'updated inventory count for', target: 'iPhone 13 Pro', timestamp: '3 hours ago' },
  { id: '3', user: 'Mike Johnson', action: 'created a sales invoice for', target: '$1,250.00', timestamp: '5 hours ago' },
  { id: '4', user: 'Emily Davis', action: 'approved dispatch request for', target: 'Downtown Shop', timestamp: '1 day ago' },
  { id: '5', user: 'Alex Turner', action: 'added new product', target: 'Gaming Mouse', timestamp: '1 day ago' },
];

const Dashboard = () => {
  const { toast } = useToast();
  const { useLowStockItems } = useInventory();
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Fetch low stock items from API
  const { data: lowStockItems, isLoading: isLoadingLowStock, error: lowStockError } = useLowStockItems();
  
  // Fetch recent activities
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: activityService.getRecentActivities,
  });
  
  React.useEffect(() => {
    // Demo notification
    setTimeout(() => {
      toast({
        title: "Low Stock Alert",
        description: "iPhone 13 Pro is running low on inventory (5 left)",
        variant: "destructive",
      });
    }, 1500);
    
    // Log API errors if they occur
    if (lowStockError) {
      console.error('Failed to fetch low stock items:', lowStockError);
    }
  }, [toast, lowStockError]);

  // Use API data if available, otherwise fall back to sample data
  const displayedLowStockItems = lowStockItems || sampleInventoryData;
  const displayedActivities = recentActivities || sampleActivities;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your stock management system</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4 w-full">
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-blue-100 p-2 rounded-lg mr-2">
            <Package size={18} className="text-blue-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Total Inventory</h3>
            <p className="text-lg font-semibold">1,245</p>
            <p className="text-[10px] text-gray-400 truncate">All items</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-green-100 p-2 rounded-lg mr-2">
            <ShoppingCart size={18} className="text-green-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Monthly Sales</h3>
            <p className="text-lg font-semibold">$24,500</p>
            <p className="text-[10px] text-gray-400 truncate">This month</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-amber-100 p-2 rounded-lg mr-2">
            <ArrowDownUp size={18} className="text-amber-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Active Transfers</h3>
            <p className="text-lg font-semibold">8 transfers</p>
            <p className="text-[10px] text-gray-400 truncate">Ongoing</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-red-100 p-2 rounded-lg mr-2">
            <AlertCircle size={18} className="text-red-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Low Stock Alerts</h3>
            <p className="text-lg font-semibold">{isLoadingLowStock ? '...' : displayedLowStockItems.filter(item => item.status === 'Low').length} items</p>
            <p className="text-[10px] text-gray-400 truncate">Requires attention</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockTable 
            title="Low Stock Items"
            items={displayedLowStockItems}
            isLoading={isLoadingLowStock}
            hideCostPrice={!isSuperAdmin}
          />
        </div>
        <div>
          <ActivityLog 
            activities={displayedActivities} 
            isLoading={isLoadingActivities}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
