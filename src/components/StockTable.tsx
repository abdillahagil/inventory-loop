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
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  categoryOptions?: string[];
  selectedCategory?: string;
  setSelectedCategory?: (c: string) => void;
  locationOptions?: string[];
  selectedLocation?: string;
  setSelectedLocation?: (l: string) => void;
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
  hideCostPrice = false,
  searchQuery = '',
  setSearchQuery,
  categoryOptions = [],
  selectedCategory = '',
  setSelectedCategory,
  locationOptions = [],
  selectedLocation = '',
  setSelectedLocation
}: StockTableProps) {
  // Filter items based on search, category, and location
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesLocation = !selectedLocation || item.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div>
      {/* Always show search and filter bar, even if no products */}
      <div className="flex flex-col md:flex-row md:items-center mb-4 gap-2">
        <div className="flex items-center gap-4 w-full">
          <h2 className="text-lg font-semibold whitespace-nowrap">{title}</h2>
          <div className="flex flex-wrap items-center gap-2 ml-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500 w-44"
                value={searchQuery}
                onChange={e => setSearchQuery && setSearchQuery(e.target.value)}
              />
            </div>
            {/* Category Filter - always visible and enabled */}
            {setSelectedCategory && (
              <select
                className="border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                disabled={false}
              >
                <option value="">All Categories</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            {/* Location Filter - always visible and enabled */}
            {setSelectedLocation && (
              <select
                className="border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                disabled={false}
              >
                <option value="">All Locations</option>
                {locationOptions.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto" style={{ overflowY: 'scroll', maxHeight: '500px', minHeight: '300px', height: '400px' }}>
        <table className="data-table w-full text-center">
          <thead>
            <tr>
              <th className="whitespace-nowrap text-center" style={{ width: '13%' }}>Name</th>
              <th className="text-center" style={{ width: '13%' }}>Category</th>
              <th className="text-center" style={{ width: '11%' }}>Quantity</th>
              {!hideCostPrice && <th className="text-center" style={{ width: '12%' }}>Cost Price</th>}
              <th className="text-center" style={{ width: '12%' }}>Price</th>
              <th className="text-center" style={{ width: '11%' }}>Status</th>
              <th className="text-center" style={{ width: '13%' }}>Location</th>
              <th className="text-center" style={{ width: '13%' }}>Last Updated</th>
              <th className="text-center" style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(5).fill(0).map((_, index) => (
                <tr key={`loading-${index}`}>
                  <td className="text-center"><Skeleton className="h-5 w-full" /></td>
                  <td className="text-center"><Skeleton className="h-5 w-full" /></td>
                  {hideCostPrice ? null : <td className="text-center"><Skeleton className="h-5 w-full" /></td>}
                  <td className="text-center"><Skeleton className="h-5 w-full" /></td>
                  <td className="text-center"><Skeleton className="h-5 w-full" /></td>
                  <td className="text-center"><Skeleton className="h-5 w-20" /></td>
                  <td className="text-center"><Skeleton className="h-5 w-full" /></td>
                  <td className="text-center"><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))
              : filteredItems.length > 0 ? filteredItems.map((item, idx) => {
                const cells = [];
                const cellClass = "text-center align-middle !p-0";
                cells.push(<td key="name" className={"font-medium " + cellClass}><div className="flex items-center justify-center h-full min-h-[48px] w-full">{item.name}</div></td>);
                cells.push(<td key="cat" className={cellClass}><div className="flex items-center justify-center h-full min-h-[48px] w-full">{item.category || '-'}</div></td>);
                cells.push(<td key="qty" className={cellClass}><div className="flex items-center justify-center h-full min-h-[48px] w-full">{item.quantity}</div></td>);
                if (!hideCostPrice) {
                  cells.push(
                    <td key="cost" className={cellClass}>
                      <div className="flex items-center justify-center h-full min-h-[48px] w-full">
                        {item.costPrice ? (typeof item.costPrice === 'number'
                          ? `$${item.costPrice.toFixed(2)}`
                          : `$${item.costPrice}`) : '-'}
                      </div>
                    </td>
                  );
                }
                cells.push(
                  <td key="price" className={cellClass}>
                    <div className="flex items-center justify-center h-full min-h-[48px] w-full">
                      {item.price && item.costPrice ? (
                        <>
                          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${safeNumber(item.price) > safeNumber(item.costPrice) * 1.3
                            ? 'bg-green-500'
                            : safeNumber(item.price) > safeNumber(item.costPrice) * 1.1
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                            }`}></span>
                          <span>{typeof item.price === 'number'
                            ? `$${item.price.toFixed(2)}`
                            : `$${item.price}`}</span>
                        </>
                      ) : item.price ? (typeof item.price === 'number'
                        ? `$${item.price.toFixed(2)}`
                        : `$${item.price}`) : '-'}
                    </div>
                  </td>
                );
                cells.push(
                  <td key="status" className={cellClass}>
                    <div className="flex items-center justify-center h-full min-h-[48px] w-full">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Low'
                        ? 'bg-alert-red text-white'
                        : item.status === 'High'
                          ? 'bg-alert-amber text-white'
                          : 'bg-alert-green text-white'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                );
                // Capitalize first letter of godown name for display
                const displayLocation = item.location ? item.location.charAt(0).toUpperCase() + item.location.slice(1) : '';
                cells.push(
                  <td key="loc" className={cellClass}><div className="flex items-center justify-center h-full min-h-[48px] w-full">{displayLocation}</div></td>
                );
                cells.push(
                  <td key="last" className={cellClass}><div className="flex items-center justify-center h-full min-h-[48px] w-full">{item.lastUpdated}</div></td>
                );
                cells.push(
                  <td key="actions" className={cellClass}>
                    <div className="flex items-center justify-center h-full min-h-[48px] w-full space-x-2">
                      {showAssignButton && item.location === 'Unassigned' && onAssignClick && (
                        <button
                          onClick={() => onAssignClick(item)}
                          className="text-sm text-blue-500 hover:text-blue-700"
                          title="Assign to godown"
                        >
                          <Warehouse size={16} />
                        </button>
                      )}
                      {/* Only show edit button if delete button is also allowed (godownadmin or superadmin) */}
                      {onEditClick && !hideEditButton(item) && !hideDeleteButton(item) && (
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
            `Showing 1-${filteredItems.length} of ${filteredItems.length} items`
          )}
        </div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}

export default StockTable;
