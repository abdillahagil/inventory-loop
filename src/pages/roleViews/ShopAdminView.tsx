import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, ShoppingBag, Store, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { getShops } from '@/services/shopService';
import { useInventory } from '@/hooks/use-inventory';
import { StockItem } from '@/types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StockTable from '@/components/StockTable';

const ShopAdminView = () => {
  const { user } = useUserStore();
  const { useAllInventory, useUpdateInventoryItem, useDeleteInventoryItem } = useInventory();
  const { data: inventoryItems, isLoading, refetch: refetchInventory } = useAllInventory();
  const updateInventoryMutation = useUpdateInventoryItem();
  const deleteInventoryMutation = useDeleteInventoryItem();
  
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
  
  // State for edit product form
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    quantity: 0,
  });
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  
  // Fetch shop data
  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops,
    enabled: true
  });

  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('shop-inventory');

  // Get inventory data
  const items = inventoryItems || [];
  
  // Get shop names assigned to the current user
  const assignedShopNames = user?.location ? user.location.split(',').map(name => name.trim()) : [];
  
  // Get products assigned to the user's shops
  const shopItems = items.filter(item => 
    assignedShopNames.includes(item.location)
  );
  
  // Get sales items (assuming that items with status 'Low' could represent sold items)
  // Modify this filter based on the actual property you use to track sales
  const salesItems = items.filter(item => 
    assignedShopNames.includes(item.location) && item.status === 'Low'
  );
  
  // Filter displayed items based on search query and active tab
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'shop-inventory') {
      return matchesSearch && assignedShopNames.includes(item.location);
    } else if (activeTab === 'sales') {
      return matchesSearch && assignedShopNames.includes(item.location) && item.status === 'Low';
    }
    
    return matchesSearch;
  });

  // Handle input changes for edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: name === 'quantity' ? Number(value) : value,
    });
  };

  // Handler for opening the edit modal
  const handleEditClick = (item: StockItem) => {
    setItemToEdit(item);
    setEditedProduct({
      name: item.name,
      quantity: item.quantity,
    });
    setShowEditModal(true);
  };
  
  // Handler for submitting edits
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemToEdit) return;
    
    const updates: Partial<StockItem> = {
      name: editedProduct.name,
      quantity: editedProduct.quantity,
    };
    
    updateInventoryMutation.mutate(
      { id: itemToEdit.id, updates },
      {
        onSuccess: async (data) => {
          // Force a manual refetch to ensure all changes are visible
          await refetchInventory();
          setShowEditModal(false);
          setItemToEdit(null);
        },
        onError: (error) => {
          console.error('Update failed:', error);
        }
      }
    );
  };
  
  // Handler for opening delete confirmation
  const handleDeleteClick = (item: StockItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };
  
  // Handler for confirming deletion
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    deleteInventoryMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      }
    });
  };

  // Calculate statistics
  const totalStock = shopItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSales = salesItems.length;
  const totalRevenue = salesItems.reduce((sum, item) => sum + (item.price || 0), 0);
  
  // Calculate shop statistics
  const shopStats = assignedShopNames.map(shopName => {
    const shopProducts = items.filter(item => item.location === shopName);
    const shopSales = shopProducts.filter(item => item.status === 'Low');
    
    return {
      name: shopName,
      totalProducts: shopProducts.length,
      totalSales: shopSales.length,
      revenue: shopSales.reduce((sum, item) => sum + (item.price || 0), 0)
    };
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shop Management</h1>
        <p className="text-gray-600">
          Manage inventory and sales for {assignedShopNames.length > 0 
            ? assignedShopNames.join(', ') 
            : 'your assigned shops'}
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="flex flex-wrap gap-2 mb-4 w-full">
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-blue-100 p-2 rounded-lg mr-2">
            <Package size={18} className="text-stock-blue-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Total Stock</h3>
            <p className="text-lg font-semibold">{totalStock}</p>
            <p className="text-[10px] text-gray-400 truncate">{shopItems.length} unique products</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-green-100 p-2 rounded-lg mr-2">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Total Sales</h3>
            <p className="text-lg font-semibold">{totalSales}</p>
            <p className="text-[10px] text-gray-400 truncate">${totalRevenue.toFixed(2)} revenue</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-purple-100 p-2 rounded-lg mr-2">
            <Store size={18} className="text-purple-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">My Shops</h3>
            <p className="text-lg font-semibold">{assignedShopNames.length}</p>
            <p className="text-[10px] text-gray-400 truncate">Assigned locations</p>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="shop-inventory">Shop Inventory ({shopItems.length})</TabsTrigger>
          <TabsTrigger value="sales">Sales ({salesItems.length})</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Products table */}
      <div>
        <StockTable 
          title={`${activeTab === 'shop-inventory' ? 'Products' : 'Sales'} (${filteredItems.length})`}
          items={filteredItems}
          isLoading={isLoading}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          hideCostPrice={true}
        />
      </div>
      
      {/* Shop stats */}
      {shopStats.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Shop Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopStats.map(shop => (
              <Card key={shop.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{shop.name}</CardTitle>
                  <CardDescription>Shop performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Products:</span>
                      <span className="font-medium">{shop.totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Sales:</span>
                      <span className="font-medium">{shop.totalSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Revenue:</span>
                      <span className="font-medium">${shop.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* If no shops assigned */}
      {assignedShopNames.length === 0 && (
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800">No Shops Assigned</h3>
                <p className="text-amber-700">
                  You don't have any shops assigned to your account yet. Please contact an administrator
                  to assign shops to your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && itemToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditModal(false);
                  setItemToEdit(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedProduct.name}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={editedProduct.quantity}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setItemToEdit(null);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateInventoryMutation.isPending}
                >
                  {updateInventoryMutation.isPending ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{itemToDelete.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={deleteInventoryMutation.isPending}
              >
                {deleteInventoryMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopAdminView; 