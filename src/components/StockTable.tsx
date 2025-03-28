
import React from 'react';
import { ArrowUpDown, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  status: 'Low' | 'Normal' | 'High';
  lastUpdated: string;
}

interface StockTableProps {
  title: string;
  items: StockItem[];
  isLoading?: boolean;
}

const StockTable = ({ title, items, isLoading = false }: StockTableProps) => {
  return (
    <div className="stock-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500 w-48"
            />
          </div>
          <button className="flex items-center p-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={16} className="mr-1" />
            Filter
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="whitespace-nowrap">
                <div className="flex items-center cursor-pointer">
                  Item Name
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th className="whitespace-nowrap">SKU</th>
              <th className="whitespace-nowrap">Category</th>
              <th className="whitespace-nowrap">Location</th>
              <th className="whitespace-nowrap text-right">Quantity</th>
              <th className="whitespace-nowrap">Status</th>
              <th className="whitespace-nowrap">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array(5).fill(0).map((_, index) => (
                <tr key={`loading-${index}`}>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-20" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))
            ) : items.length > 0 ? (
              // Actual data
              items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>{item.location}</td>
                  <td className="text-right">{item.quantity} {item.unit}</td>
                  <td>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Low' 
                        ? 'bg-alert-red text-white' 
                        : item.status === 'High'
                          ? 'bg-alert-amber text-white'
                          : 'bg-alert-green text-white'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.lastUpdated}</td>
                </tr>
              ))
            ) : (
              // No data
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="text-gray-500">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            `Showing 1-${items.length} of ${items.length} items`
          )}
        </div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default StockTable;
