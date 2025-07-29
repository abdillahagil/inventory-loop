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
}

interface StockTableProps {
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

function StockTable({
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
}: StockTableProps) {
  return (
    <div>
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
                <th className="whitespace-nowrap" style={{ width: '18%' }}>Name</th>
                <th className="text-left" style={{ width: '14%' }}>Category</th>
                <th className="text-right" style={{ width: '10%' }}>Quantity</th>
                {!hideCostPrice && <th className="text-right" style={{ width: '12%' }}>Cost Price</th>}
                <th className="text-right" style={{ width: '12%' }}>Price</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '12%' }}>Location</th>
                <th style={{ width: '12%' }}>Last Updated</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(5).fill(0).map((_, index) => (
                  <tr key={`loading-${index}`}>
                    <td><Skeleton className="h-5 w-full" /></td>
                    <td><Skeleton className="h-5 w-full" /></td>
                    {hideCostPrice ? null : <td><Skeleton className="h-5 w-full" /></td>}
                    <td><Skeleton className="h-5 w-full" /></td>
                    <td><Skeleton className="h-5 w-full" /></td>
                    <td><Skeleton className="h-5 w-full" /></td>
                    <td><Skeleton className="h-5 w-20" /></td>
                    <td><Skeleton className="h-5 w-full" /></td>
                    <td><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
                : items.length > 0 ? items.map((item, idx) => {
                  const cells = [];
                  cells.push(<td key="name" className="font-medium">{item.name}</td>);
                  cells.push(<td key="cat" className="text-left">{item.category || '-'}</td>);
                  cells.push(<td key="qty" className="text-right">{item.quantity}</td>);
                  if (!hideCostPrice) {
                    cells.push(
                      <td key="cost" className="text-right">
                        {item.costPrice ? (typeof item.costPrice === 'number'
                          ? `$${item.costPrice.toFixed(2)}`
                          : `$${item.costPrice}`) : '-'}
                      </td>
                    );
                  }
                  cells.push(
                    <td key="price" className="text-right">
                      {item.price && item.costPrice ? (
                        <div className="flex items-center justify-end group relative">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${safeNumber(item.price) > safeNumber(item.costPrice) * 1.3
                            ? 'bg-green-500'
                            : safeNumber(item.price) > safeNumber(item.costPrice) * 1.1
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                            }`}></span>
                          <span>{typeof item.price === 'number'
                            ? `$${item.price.toFixed(2)}`
                            : `$${item.price}`}</span>
                        </div>
                      ) : item.price ? (typeof item.price === 'number'
                        ? `$${item.price.toFixed(2)}`
                        : `$${item.price}`) : '-'}
                    </td>
                  );
                  cells.push(
                    <td key="status">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Low'
                        ? 'bg-alert-red text-white'
                        : item.status === 'High'
                          ? 'bg-alert-amber text-white'
                          : 'bg-alert-green text-white'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                  );
                  cells.push(
                    <td key="loc">{item.location}</td>
                  );
                  cells.push(
                    <td key="last">{item.lastUpdated}</td>
                  );
                  cells.push(
                    <td key="actions">
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
                  );
                  return <tr key={item.id || idx}>{cells}</tr>;
                }) : (
                  <tr>
                    <td colSpan={hideCostPrice ? 8 : 9} className="text-center py-4 text-gray-500">
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
    </div>
  );
}

export default StockTable;
