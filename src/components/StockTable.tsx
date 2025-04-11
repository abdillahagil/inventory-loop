import React from 'react';
import { ArrowUpDown, Search, Filter, Edit, Trash2, SendToBack, Warehouse } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StockItem } from '@/types';

// Utility function to safely convert price values to numbers
const safeNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export interface StockTableProps {
  title: string;
  items: StockItem[];
  isLoading?: boolean;
  onEditClick?: (item: StockItem) => void;
  onDeleteClick?: (item: StockItem) => void;
  onAssignClick?: (item: StockItem) => void;
  showAssignButton?: boolean;
  hideEditButton?: (item: StockItem) => boolean;
  hideDeleteButton?: (item: StockItem) => boolean;
  hideCostPrice?: boolean;
}

const StockTable = ({ 
  title, 
  items, 
  isLoading = false, 
  onEditClick, 
  onDeleteClick, 
  onAssignClick,
  showAssignButton = false,
  hideEditButton = () => false,
  hideDeleteButton = () => false,
  hideCostPrice = false
}: StockTableProps) => {
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
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="whitespace-nowrap w-1/3">
                <div className="flex items-center cursor-pointer">
                  Item Name
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th className="whitespace-nowrap text-right w-1/12">Quantity</th>
              {!hideCostPrice && (
                <th className="whitespace-nowrap text-right w-1/6">Cost Price</th>
              )}
              <th className="whitespace-nowrap text-right w-1/6">
                <div className="flex items-center justify-end group relative">
                  <span>Selling Price</span>
                  <span className="ml-1 text-gray-400 text-xs">ⓘ</span>
                  <div className="hidden group-hover:block absolute right-0 top-6 w-48 bg-white p-2 shadow-lg rounded-md text-xs text-left z-10">
                    <p className="mb-1">Profit margin indicators:</p>
                    <div className="flex items-center mb-1">
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-green-500"></span>
                      <span>High (&gt;30%)</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-amber-500"></span>
                      <span>Medium (10-30%)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-red-500"></span>
                      <span>Low (&lt;10%)</span>
                    </div>
                  </div>
                </div>
              </th>
              <th className="whitespace-nowrap w-1/12">Status</th>
              <th className="whitespace-nowrap w-1/6">Location</th>
              <th className="whitespace-nowrap w-1/6">Last Updated</th>
              <th className="whitespace-nowrap w-1/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array(5).fill(0).map((_, index) => (
                <tr key={`loading-${index}`}>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  {!hideCostPrice && <td><Skeleton className="h-5 w-full" /></td>}
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-20" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                  <td><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))
            ) : items.length > 0 ? (
              // Actual data
              items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  {!hideCostPrice && (
                    <td className="text-right">
                      {item.costPrice ? (typeof item.costPrice === 'number' 
                        ? `$${item.costPrice.toFixed(2)}` 
                        : `$${item.costPrice}`) : '-'}
                    </td>
                  )}
                  <td className="text-right">
                    {item.price && item.costPrice ? (
                      <div className="flex items-center justify-end group relative">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                          safeNumber(item.price) > safeNumber(item.costPrice) * 1.3 
                            ? 'bg-green-500' 
                            : safeNumber(item.price) > safeNumber(item.costPrice) * 1.1
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}></span>
                        <span>{typeof item.price === 'number' 
                          ? `$${item.price.toFixed(2)}` 
                          : `$${item.price}`}</span>
                        
                        {/* Profit margin tooltip */}
                        <div className="hidden group-hover:block absolute right-0 bottom-6 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          Profit Margin: {safeNumber(item.costPrice) > 0 
                            ? `${Math.round((safeNumber(item.price) - safeNumber(item.costPrice)) / safeNumber(item.costPrice) * 100)}%` 
                            : 'N/A'}
                        </div>
                      </div>
                    ) : item.price ? (typeof item.price === 'number' 
                      ? `$${item.price.toFixed(2)}` 
                      : `$${item.price}`) : '-'}
                  </td>
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
                  <td>{item.location}</td>
                  <td>{item.lastUpdated}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {showAssignButton && item.location === 'Unassigned' && onAssignClick && (
                        <button
                          onClick={() => onAssignClick(item)}
                          className="text-sm text-blue-500 hover:text-blue-700"
                          title="Assign to godown"
                        >
                          <Warehouse size={16} />
                        </button>
                      )}
                      {onEditClick && !hideEditButton(item) && (
                        <button
                          onClick={() => onEditClick(item)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDeleteClick && !hideDeleteButton(item) && (
                        <button
                          onClick={() => onDeleteClick(item)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // No data
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
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
