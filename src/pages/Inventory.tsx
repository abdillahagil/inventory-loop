import React, { useState, useEffect } from 'react';
import StockTable from '@/components/StockTable';
import { Button } from '@/components/ui/button';
import {
  Plus,
  FileText,
  Upload,
  Download,
  Package,
  AlertTriangle,
  Search,
  X,
  Check
} from 'lucide-react';
import { useInventory } from '@/hooks/use-inventory';
import { useUserStore } from '@/store/userStore';
import { StockItem } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { inventoryService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { getGodowns } from '@/services/godownService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Inventory = () => {
  // State for product/category/location filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const { useAllInventory, useAddInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } = useInventory();
  const { data: inventoryItems, isLoading, refetch } = useAllInventory();
  const addInventoryMutation = useAddInventoryItem();
  const updateInventoryMutation = useUpdateInventoryItem();
  const deleteInventoryMutation = useDeleteInventoryItem();

  // Get current user from store to check role
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'superadmin';
  const isGodownAdmin = user?.role === 'godownadmin';

  // Fetch godown data
  const { data: godowns = [] } = useQuery({
    queryKey: ['godowns'],
    queryFn: getGodowns,
    enabled: true // Always fetch godowns data
  });

  // Use all godowns returned from the API for GodownAdmin
  // The server already filters the godowns based on user role and permissions
  const userGodowns = godowns;

  // Use API data only - no fallback to sample data
  const items = inventoryItems || [];

  // State for active tab
  const [activeTab, setActiveTab] = useState('all-products');

  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // State for managing add product modal
  const [showAddModal, setShowAddModal] = useState(false);

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
  // Only allow quantity change for assigned products
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  const [editError, setEditError] = useState<string>('');

  // State for confirming delete when quantity is set to 0
  const [showZeroDeleteConfirm, setShowZeroDeleteConfirm] = useState(false);

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  // State for assign location modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [itemToAssign, setItemToAssign] = useState<StockItem | null>(null);
  const [selectedGodown, setSelectedGodown] = useState<string>('');

  // State for the new product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    location: 'Unassigned', // Default to Unassigned
    quantity: 0,
    price: 0,
    costPrice: 0,
  });

  // State for edit product form
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    quantity: 0,
    price: 0,
    costPrice: 0,
    category: '',
  });

  // State for godowns fetched directly from API
  const [directFetchedGodowns, setDirectFetchedGodowns] = useState<any[]>([]);

  // State for quantity to assign
  const [assignQuantity, setAssignQuantity] = useState(0);

  // Handle input changes for add form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === 'quantity' || name === 'price' || name === 'costPrice'
        ? Number(value)
        : value,
    });
  };

  // Handle input changes for edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: name === 'quantity' || name === 'price' || name === 'costPrice'
        ? Number(value)
        : value,
    });
  };

  // Reset form
  const resetForm = () => {
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      location: 'Unassigned', // Set default location to Unassigned
      quantity: 0,
      price: 0,
      costPrice: 0,
    });
  };

  // Handler for opening the edit modal
  const handleEditClick = (item: StockItem) => {
    setItemToEdit(item);
    setEditedQuantity(item.quantity);
    setEditError('');
    setShowEditModal(true);
  };

  // Handler for submitting edits
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;
    setEditError('');

    // Only allow quantity change for assigned products
    const originalQuantity = itemToEdit.quantity;
    const newQuantity = editedQuantity;
    const diff = newQuantity - originalQuantity;

    // Find corresponding unassigned product
    const unassignedProduct = items.find(item => item.productId === itemToEdit.productId && item.location === 'Unassigned');

    if (newQuantity === 0) {
      setShowZeroDeleteConfirm(true);
      return;
    }

    if (diff === 0) {
      setShowEditModal(false);
      setItemToEdit(null);
      return;
    }

    if (diff > 0) {
      // Increasing assigned quantity, must decrease unassigned
      if (unassignedProduct) {
        if (unassignedProduct.quantity >= diff) {
          // Proceed: update assigned, update unassigned
          updateInventoryMutation.mutate(
            { id: itemToEdit.id, updates: { quantity: newQuantity } },
            {
              onSuccess: async () => {
                updateInventoryMutation.mutate(
                  { id: unassignedProduct.id, updates: { quantity: unassignedProduct.quantity - diff } },
                  {
                    onSuccess: async () => {
                      await refetch();
                      setShowEditModal(false);
                      setItemToEdit(null);
                    },
                    onError: (error) => {
                      setEditError('Failed to update unassigned product.');
                    }
                  }
                );
              },
              onError: (error) => {
                setEditError('Failed to update assigned product.');
              }
            }
          );
        } else {
          setEditError('Not enough unassigned stock available.');
        }
      } else {
        setEditError('No unassigned product available. Please add unassigned stock first.');
      }
    } else {
      // Decreasing assigned quantity, must increase unassigned
      if (unassignedProduct) {
        updateInventoryMutation.mutate(
          { id: itemToEdit.id, updates: { quantity: newQuantity } },
          {
            onSuccess: async () => {
              updateInventoryMutation.mutate(
                { id: unassignedProduct.id, updates: { quantity: unassignedProduct.quantity + Math.abs(diff) } },
                {
                  onSuccess: async () => {
                    await refetch();
                    setShowEditModal(false);
                    setItemToEdit(null);
                  },
                  onError: (error) => {
                    setEditError('Failed to update unassigned product.');
                  }
                }
              );
            },
            onError: (error) => {
              setEditError('Failed to update assigned product.');
            }
          }
        );
      } else {
        // If no unassigned product, create one
        setEditError('No unassigned product available. Please add unassigned stock first.');
      }
    }
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

  // Generate a random SKU
  const generateSKU = (productName: string) => {
    const prefix = productName.substring(0, 3).toUpperCase().replace(/\s+/g, '');
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${randomNum}`;
  };

  // Handle form submission
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate SKU if not provided since the field was removed
    const sku = generateSKU(newProduct.name);

    // Use the category from the form, or fallback to 'Uncategorized' if empty
    const productToAdd = {
      ...newProduct,
      sku,
      category: newProduct.category && newProduct.category.trim() !== '' ? newProduct.category : 'Uncategorized',
      status: 'Normal' as const, // Default status
      unit: 'pcs', // Default unit since we're removing units
      location: "Unassigned", // Default to "Unassigned" for all products
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    addInventoryMutation.mutate(productToAdd, {
      onSuccess: () => {
        setShowAddModal(false);
        resetForm();
      }
    });
  };

  // Compute statistics from inventory data
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.status === 'Low');

  // Get unassigned items
  const unassignedItems = items.filter(item => item.location === 'Unassigned');

  // Get items assigned to user's godowns
  const userGodownItems = items.filter(item => {
    return userGodowns.some(godown => item.location === godown.name);
  });

  // Filter displayed items based on search query and active tab
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Different filters based on active tab
    if (activeTab === 'all-products') {
      return matchesSearch;
    } else if (activeTab === 'unassigned') {
      return matchesSearch && item.location === 'Unassigned';
    } else if (activeTab === 'my-godowns' && isGodownAdmin) {
      return matchesSearch && userGodowns.some(godown => item.location === godown.name);
    } else if (activeTab === 'godowns' && isSuperAdmin) {
      return matchesSearch && item.location !== 'Unassigned';
    }

    return matchesSearch;
  });

  // Debug function to test the API directly
  const testUpdateAPI = async () => {
    if (!itemToEdit) {
      console.error('No item selected for testing');
      return;
    }

    try {
      console.log('Testing direct API call with:', itemToEdit.id);
      const testUpdate = {
        name: editedProduct.name,
        quantity: editedProduct.quantity,
        price: editedProduct.price,
        costPrice: editedProduct.costPrice,
      };

      console.log('Test update payload:', testUpdate);
      const result = await inventoryService.updateInventoryItem(itemToEdit.id, testUpdate);
      console.log('Direct API call result:', result);
    } catch (error) {
      console.error('Direct API call failed:', error);
    }
  };

  // Handler for assigning location
  const handleAssignClick = (item: StockItem) => {
    setItemToAssign(item);
    setSelectedGodown('');
    setAssignQuantity(item.quantity); // Initialize with the full quantity

    // Directly fetch godowns to ensure we have the latest data
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/godowns`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(fetchedGodowns => {
        // If we got godowns directly from the API, use them
        if (fetchedGodowns && fetchedGodowns.length > 0) {
          // For GodownAdmin users, if the server didn't filter correctly, apply additional client-side filtering
          if (user?.role === 'godownadmin' && user?.location) {
            const assignedGodownNames = user.location.split(',').map(name => name.trim());

            // Only include godowns that match the user's assigned locations
            const filteredGodowns = fetchedGodowns.filter(godown =>
              assignedGodownNames.includes(godown.name)
            );

            setDirectFetchedGodowns(filteredGodowns);
          } else {
            // For SuperAdmin, use all godowns
            setDirectFetchedGodowns(fetchedGodowns);
          }
        } else {
          // No godowns found
          setDirectFetchedGodowns([]);
        }
      })
      .catch(error => {
        console.error('Failed to fetch godowns directly:', error);
        setDirectFetchedGodowns([]);
      });

    setShowAssignModal(true);
  };

  // Handler for submitting location assignment
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemToAssign || !selectedGodown || !assignQuantity || assignQuantity <= 0 || assignQuantity > itemToAssign.quantity) {
      console.log('Missing required data or invalid quantity:', { itemToAssign, selectedGodown, assignQuantity });
      return;
    }

    // Find the selected godown
    const foundGodown = [...directFetchedGodowns, ...godowns].find(g => g.id === selectedGodown);

    if (!foundGodown) {
      console.error('Selected godown not found in available godowns!');
      return;
    }

    const selectedGodownName = foundGodown.name;

    // Calculate remaining quantity
    const remainingQuantity = itemToAssign.quantity - assignQuantity;

    // First, update the original item to have the remaining quantity
    const updateOriginalItem = {
      quantity: remainingQuantity,
      location: "Unassigned" // Keep the original item in Unassigned
    };

    // Check if an item with the same product and location already exists
    const existingItem = items.find(item =>
      item.productId === itemToAssign.productId &&
      item.location === selectedGodownName
    );

    // Make the API calls
    try {
      // First update the original item
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inventory/${itemToAssign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updateOriginalItem)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          if (existingItem) {
            // If an item with the same product and location exists, update its quantity
            const updatedQuantity = existingItem.quantity + assignQuantity;
            return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inventory/${existingItem.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
              },
              body: JSON.stringify({ quantity: updatedQuantity })
            });
          } else {
            // Create a new item for the assigned portion
            const newAssignedItem = {
              name: itemToAssign.name,
              sku: itemToAssign.sku,
              category: itemToAssign.category,
              location: selectedGodownName,
              quantity: assignQuantity,
              unit: itemToAssign.unit,
              status: itemToAssign.status,
              price: itemToAssign.price,
              costPrice: itemToAssign.costPrice,
              productId: itemToAssign.productId
            };

            return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inventory`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
              },
              body: JSON.stringify(newAssignedItem)
            });
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          refetch();
          setShowAssignModal(false);
          setItemToAssign(null);
          setSelectedGodown('');
          setAssignQuantity(0);
        })
        .catch(error => {
          console.error('Assignment failed:', error);
          alert(`Failed to assign product: ${error.message}`);
        });
    } catch (error) {
      console.error('Exception during fetch:', error);
    }
  };

  // For debugging - log all godowns but don't expose sensitive information
  console.log('Number of godowns from API:', godowns.length);
  console.log('Current user role:', user?.role);

  // Get the current token for API requests but don't log the complete token
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage and track your product inventory across all locations</p>
        </div>
        <div className="flex space-x-2">
          {(isSuperAdmin || isGodownAdmin) && (
            <Button
              className="bg-stock-blue-600 hover:bg-stock-blue-700 flex items-center"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} className="mr-1" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Inventory summary cards - responsive and flexible layout */}
      <div className="flex flex-wrap gap-2 mb-4 w-full">
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-blue-100 p-2 rounded-lg mr-2">
            <Package size={18} className="text-blue-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Total Products</h3>
            <p className="text-lg font-semibold">{items.length}</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-green-100 p-2 rounded-lg mr-2">
            <Package size={18} className="text-green-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Total Stock</h3>
            <p className="text-lg font-semibold">{totalItems}</p>
          </div>
        </div>
        <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
          <div className="bg-red-100 p-2 rounded-lg mr-2">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div className="truncate">
            <h3 className="text-gray-500 text-xs truncate">Low Stock</h3>
            <p className="text-lg font-semibold">{lowStockItems.length}</p>
          </div>
        </div>
        {isGodownAdmin && (
          <div className="stock-card flex items-center p-2 flex-grow min-w-0 max-w-full basis-0">
            <div className="bg-amber-100 p-2 rounded-lg mr-2">
              <Package size={18} className="text-amber-600" />
            </div>
            <div className="truncate">
              <h3 className="text-gray-500 text-xs truncate">Unassigned</h3>
              <p className="text-lg font-semibold">{unassignedItems.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Product tabs for GodownAdmin - moved above table */}
      {(isGodownAdmin || isSuperAdmin) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
          <TabsList>
            <TabsTrigger value="all-products">All Products</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned ({unassignedItems.length})</TabsTrigger>
            {isGodownAdmin ? (
              <TabsTrigger value="my-godowns">My Godowns ({userGodownItems.length})</TabsTrigger>
            ) : (
              <TabsTrigger value="godowns">Godowns ({items.length - unassignedItems.length})</TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      )}

      {/* StockTable with search and filters */}
      <div>
        <StockTable
          title={`Products (${filteredItems.length})`}
          items={filteredItems}
          isLoading={isLoading}
          onEditClick={(isSuperAdmin || isGodownAdmin) ? handleEditClick : undefined}
          onDeleteClick={(isSuperAdmin || isGodownAdmin) ? handleDeleteClick : undefined}
          onAssignClick={isGodownAdmin ? handleAssignClick : undefined}
          showAssignButton={isGodownAdmin && (activeTab === 'unassigned' || activeTab === 'all-products')}
          hideEditButton={() => !(isSuperAdmin || isGodownAdmin)}
          hideDeleteButton={() => !(isSuperAdmin || isGodownAdmin)}
          hideCostPrice={!isSuperAdmin}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryOptions={[...new Set(items.map(i => i.category).filter(Boolean))]}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          locationOptions={[...new Set(items.map(i => i.location).filter(Boolean))]}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                      placeholder="Enter category"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                    placeholder="Enter quantity"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price*
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      name="costPrice"
                      value={newProduct.costPrice}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                      placeholder="Enter cost price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price*
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                      placeholder="Enter selling price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addInventoryMutation.isPending}
                >
                  {addInventoryMutation.isPending ? 'Adding...' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && itemToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Assigned Product Quantity</h2>
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
                    Quantity*
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={editedQuantity}
                    onChange={e => setEditedQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500"
                    min="0"
                    required
                  />
                </div>
                {editError && (
                  <div className="text-red-600 text-sm mt-2">{editError}</div>
                )}
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
                  {updateInventoryMutation.isPending ? 'Updating...' : 'Update Quantity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}

      {/* Zero Quantity Delete Confirmation Dialog */}
      {showZeroDeleteConfirm && itemToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{itemToEdit.name}</span> from this godown? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowZeroDeleteConfirm(false);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // Actually delete the assigned product
                  const originalQuantity = itemToEdit.quantity;
                  const unassignedProduct = items.find(item => item.productId === itemToEdit.productId && item.location === 'Unassigned');
                  deleteInventoryMutation.mutate(itemToEdit.id, {
                    onSuccess: async () => {
                      if (unassignedProduct) {
                        updateInventoryMutation.mutate(
                          { id: unassignedProduct.id, updates: { quantity: unassignedProduct.quantity + originalQuantity } },
                          {
                            onSuccess: async () => {
                              await refetch();
                              setShowZeroDeleteConfirm(false);
                              setShowEditModal(false);
                              setItemToEdit(null);
                            },
                            onError: (error) => {
                              setEditError('Failed to update unassigned product.');
                            }
                          }
                        );
                      } else {
                        await refetch();
                        setShowZeroDeleteConfirm(false);
                        setShowEditModal(false);
                        setItemToEdit(null);
                      }
                    },
                    onError: (error) => {
                      setEditError('Failed to delete assigned product.');
                    }
                  });
                }}
                type="button"
                disabled={deleteInventoryMutation.isPending}
              >
                {deleteInventoryMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
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

      {/* Assign Location Modal */}
      {showAssignModal && itemToAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Product to Godown</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAssignModal(false);
                  setItemToAssign(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  {isGodownAdmin ? (
                    <>Assign <span className="font-semibold">{itemToAssign.name}</span> to one of your assigned godowns:</>
                  ) : (
                    <>Assign <span className="font-semibold">{itemToAssign.name}</span> to a godown:</>
                  )}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Godown*
                    </label>
                    <Select
                      value={selectedGodown}
                      onValueChange={setSelectedGodown}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a godown" />
                      </SelectTrigger>
                      <SelectContent>
                        {directFetchedGodowns.length > 0 ? (
                          // Use directly fetched godowns if available
                          directFetchedGodowns.map(godown => (
                            <SelectItem key={godown.id} value={godown.id}>
                              {godown.name}
                            </SelectItem>
                          ))
                        ) : (
                          godowns.map(godown => (
                            <SelectItem key={godown.id} value={godown.id}>
                              {godown.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {directFetchedGodowns.length === 0 && godowns.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        {isGodownAdmin ?
                          "No godowns are assigned to you. Please contact an administrator." :
                          "No godowns available. Please create godowns first."}
                      </p>
                    )}
                    {isGodownAdmin && directFetchedGodowns.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Note: You can only assign to godowns that have been assigned to you.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity to Assign*
                    </label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min="1"
                        max={itemToAssign.quantity}
                        value={assignQuantity}
                        onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
                        className="w-full"
                        placeholder="Enter quantity"
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        of {itemToAssign.quantity} available
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      The remaining quantity will stay in Unassigned inventory.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false);
                    setItemToAssign(null);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedGodown || !assignQuantity || assignQuantity <= 0 || assignQuantity > itemToAssign.quantity || updateInventoryMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateInventoryMutation.isPending
                    ? 'Assigning...'
                    : (
                      <span className="flex items-center">
                        <Check size={16} className="mr-1" />
                        Assign
                      </span>
                    )
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;