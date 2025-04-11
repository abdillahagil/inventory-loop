import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, SquareStack, AlertTriangle, Layers, X, Check } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { getGodowns } from '@/services/godownService';
import { useInventory } from '@/hooks/use-inventory';
import { StockItem } from '@/types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import StockTable from '@/components/StockTable';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define a proper error boundary class component
class ErrorBoundaryClass extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("Error boundary caught an error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in component:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">An error occurred</h3>
                <p className="text-red-700">
                  {this.state.error ? this.state.error.message : 'An unknown error occurred'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingView = () => (
  <div className="flex justify-center items-center h-64">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin">
        <SquareStack size={24} />
      </div>
      <p className="text-gray-500">Loading godown data...</p>
    </div>
  </div>
);

// No godowns assigned view
const NoGodownsView = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">My Godowns</h1>
    <Card className="p-6 bg-amber-50 border-amber-200">
      <div className="flex items-center gap-4">
        <AlertTriangle className="h-10 w-10 text-amber-600" />
        <div>
          <h3 className="text-lg font-semibold text-amber-800">No Godowns Assigned</h3>
          <p className="text-amber-700">
            You don't have any godowns assigned to your account yet. Please contact a system administrator.
          </p>
        </div>
      </div>
    </Card>
  </div>
);

// The main component that will be exported
const GodownAdminView: React.FC = () => {
  console.log('GodownAdminView component initializing');
  
  try {
    return (
      <ErrorBoundaryClass>
        <GodownContent />
      </ErrorBoundaryClass>
    );
  } catch (error) {
    console.error('Critical error in GodownAdminView:', error);
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Critical Error</h2>
        <p className="text-red-700">
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    );
  }
};

// Content component that handles data fetching and rendering
const GodownContent: React.FC = () => {
  const { user } = useUserStore();
  console.log('GodownContent - User from store:', user);
  
  // Utility function to safely convert price values to numbers
  const safeNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  // Only proceed with the query if we have a user
  if (!user) {
    return (
      <Card className="p-6 bg-amber-50">
        <CardHeader>
          <CardTitle>No User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User information is not available. You may need to log in again.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { useAllInventory, useUpdateInventoryItem, useDeleteInventoryItem } = useInventory();
  console.log('GodownContent - Inventory hook loaded');
  
  const { data: inventoryItems, isLoading: isLoadingInventory, refetch: refetchInventory } = useAllInventory();
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
  
  // Fetch godown data
  const { data: godowns = [], isLoading: isLoadingGodowns } = useQuery({
    queryKey: ['godowns'],
    queryFn: getGodowns,
    enabled: true // Always fetch godowns data
  });
  
  console.log('GodownContent - Data loaded:', { 
    inventoryCount: inventoryItems?.length || 0,
    godownsCount: godowns?.length || 0,
    isLoadingInventory,
    isLoadingGodowns
  });

  // Get inventory data
  const items = inventoryItems || [];
  
  // Get godown names assigned to the current user
  const assignedGodownNames = user?.location ? user.location.split(',').map(name => name.trim()) : [];
  
  // Get assigned godown objects from the fetched godowns
  const userGodowns = godowns.filter(godown => 
    assignedGodownNames.includes(godown.name)
  );

  // State for the currently selected godown
  const [activeGodown, setActiveGodown] = useState<string | null>(null);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [itemToAssign, setItemToAssign] = useState<StockItem | null>(null);
  const [selectedGodown, setSelectedGodown] = useState<string>('');
  const [assignQuantity, setAssignQuantity] = useState(0);
  const [directFetchedGodowns, setDirectFetchedGodowns] = useState<any[]>([]);
  
  // Set active godown to the first available godown when data is loaded
  useEffect(() => {
    if (userGodowns.length > 0 && !activeGodown) {
      setActiveGodown(userGodowns[0].name);
    }
  }, [userGodowns, activeGodown]);
  
  // Get items for the active godown
  const activeGodownItems = items.filter(item => 
    item.location === activeGodown
  );
  
  // Get unassigned items
  const unassignedItems = items.filter(item => item.location === 'Unassigned');
  
  // Get all items assigned to any of the user's godowns
  const allAssignedItems = items.filter(item => 
    assignedGodownNames.includes(item.location)
  );
  
  // Calculate statistics for the active godown
  const totalActiveGodownItems = activeGodownItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueActiveGodownProducts = activeGodownItems.length;
  const lowStockActiveGodownItems = activeGodownItems.filter(item => item.status === 'Low').length;
  
  // Calculate total statistics across all godowns
  const totalItems = allAssignedItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = allAssignedItems.length;
  
  // Filter items based on search query
  const filteredItems = activeGodownItems.filter(item => 
    !searchQuery || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const isLoading = isLoadingInventory || isLoadingGodowns;
  
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
    
    console.log('Sending update with data:', updates);
    console.log('Item being edited:', itemToEdit);
    
    updateInventoryMutation.mutate(
      { id: itemToEdit.id, updates },
      {
        onSuccess: async (data) => {
          console.log('Update success response:', data);
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
  
  // Handler for assigning location
  const handleAssignClick = (item: StockItem) => {
    console.log('Assign clicked for item:', item);
    setItemToAssign(item);
    setSelectedGodown('');
    setAssignQuantity(0); // Initialize with blank quantity instead of full quantity
    
    // Directly fetch godowns to ensure we have the latest data
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/godowns`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        // For GodownAdmin users, filter to only include assigned godowns
        const assignedGodownNames = user?.location ? user.location.split(',').map(name => name.trim()) : [];
        
        // Only include godowns that match the user's assigned locations
        const filteredGodowns = fetchedGodowns.filter(godown => 
          assignedGodownNames.includes(godown.name)
        );
        
        setDirectFetchedGodowns(filteredGodowns);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
              'Authorization': `Bearer ${localStorage.getItem('token')}`
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
              'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        // Refresh the inventory data using React Query's refetch
        refetchInventory();
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
  
  // Handle if there are no godowns assigned
  if (!isLoading && (assignedGodownNames.length === 0 || userGodowns.length === 0)) {
    return <NoGodownsView />;
  }
  
  // Loading state
  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Godowns</h1>
        <p className="text-gray-600">
          Manage inventory across {assignedGodownNames.length} assigned location{assignedGodownNames.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stock-card flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <Package size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">Total Inventory</h3>
            <p className="text-2xl font-semibold">{totalItems}</p>
            <p className="text-xs text-gray-500">{uniqueProducts} unique products</p>
          </div>
        </div>
        
        <div className="stock-card flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="bg-amber-100 p-3 rounded-lg mr-4">
            <SquareStack size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">My Godowns</h3>
            <p className="text-2xl font-semibold">{userGodowns.length}</p>
            <p className="text-xs text-gray-500">Assigned locations</p>
          </div>
        </div>
        
        <div className="stock-card flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <Layers size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">Unassigned Products</h3>
            <p className="text-2xl font-semibold">{unassignedItems.length}</p>
            <p className="text-xs text-gray-500">Waiting for assignment</p>
          </div>
        </div>
      </div>
      
      {/* Godown Toggle Tabs */}
      {userGodowns.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Select Godown</h2>
          <Tabs
            value={activeGodown || ''}
            onValueChange={setActiveGodown}
            className="w-full"
          >
            <TabsList className="mb-4">
              {userGodowns.map((godown) => (
                <TabsTrigger key={godown.id} value={godown.name}>
                  {godown.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
      
      {/* Active Godown Content */}
      {activeGodown && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">{activeGodown}</h2>
                <p className="text-gray-600">
                  {uniqueActiveGodownProducts} products · {totalActiveGodownItems} items in stock
                </p>
              </div>
              <Badge variant={lowStockActiveGodownItems > 0 ? "destructive" : "outline"}>
                {lowStockActiveGodownItems} low stock items
              </Badge>
            </div>
            
            {/* Godown Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Package className="h-4 w-4 mr-2 text-blue-600" />
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalActiveGodownItems}</div>
                  <p className="text-xs text-muted-foreground">{uniqueActiveGodownProducts} unique products</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                    Low Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lowStockActiveGodownItems}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <SquareStack className="h-4 w-4 mr-2 text-green-600" />
                    {/* Find the godown location from the godowns array */}
                    {userGodowns.find(g => g.name === activeGodown)?.location || 'Location'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {userGodowns.find(g => g.name === activeGodown)?.isActive ? 'Active' : 'Inactive'} godown
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search products in ${activeGodown}...`}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Products Table */}
            <StockTable
              title="Godown Inventory"
              items={filteredItems}
              isLoading={isLoading}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onAssignClick={handleAssignClick}
              showAssignButton={false}
              hideEditButton={(item) => false}
              hideDeleteButton={(item) => false}
              hideCostPrice={true}
            />
          </div>
          
          {/* Unassigned Products Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Unassigned Products</h2>
            {unassignedItems.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Products Waiting for Assignment</CardTitle>
                  <CardDescription>
                    {unassignedItems.length} products can be assigned to your godowns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StockTable 
                    items={unassignedItems}
                    isLoading={false}
                    showAssignButton={true}
                    title="Unassigned Products"
                    onAssignClick={handleAssignClick}
                    hideCostPrice={true}
                  />
                </CardContent>
                <CardFooter className="border-t bg-gray-50 px-6 py-3">
                  <p className="text-sm text-muted-foreground">
                    Assign these products to your godowns using the "Assign" button.
                  </p>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">No Unassigned Products</h3>
                      <p className="text-gray-500">
                        All products have been assigned to godowns.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
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
      
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        itemToAssign={itemToAssign}
        selectedGodown={selectedGodown}
        setSelectedGodown={setSelectedGodown}
        assignQuantity={assignQuantity}
        setAssignQuantity={setAssignQuantity}
        onSubmit={handleAssignSubmit}
        godowns={godowns}
        directFetchedGodowns={directFetchedGodowns}
      />
    </div>
  );
};

export default GodownAdminView;

// Add the AssignModal component at the end of the file
const AssignModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  itemToAssign: StockItem | null;
  selectedGodown: string;
  setSelectedGodown: (value: string) => void;
  assignQuantity: number;
  setAssignQuantity: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  godowns: any[];
  directFetchedGodowns: any[];
}> = ({
  isOpen,
  onClose,
  itemToAssign,
  selectedGodown,
  setSelectedGodown,
  assignQuantity,
  setAssignQuantity,
  onSubmit,
  godowns,
  directFetchedGodowns
}) => {
  if (!isOpen || !itemToAssign) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assign Product to Godown</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Assign <span className="font-semibold">{itemToAssign.name}</span> to one of your assigned godowns:
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
                    No godowns are assigned to you. Please contact an administrator.
                  </p>
                )}
                {directFetchedGodowns.length > 0 && (
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
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!selectedGodown || !assignQuantity || assignQuantity <= 0 || assignQuantity > itemToAssign.quantity}
              className="bg-green-600 hover:bg-green-700"
            >
              <span className="flex items-center">
                <Check size={16} className="mr-1" />
                Assign
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 