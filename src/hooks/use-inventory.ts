import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { StockItem } from '@/types';

/**
 * Custom hook for inventory operations using React Query
 */
export function useInventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all inventory
  const useAllInventory = () => 
    useQuery({
      queryKey: ['inventory'],
      queryFn: inventoryService.getInventory,
    });

  // Get low stock items
  const useLowStockItems = () => 
    useQuery({
      queryKey: ['inventory', 'low-stock'],
      queryFn: inventoryService.getLowStockItems,
    });

  // Add inventory item
  const useAddInventoryItem = () => 
    useMutation({
      mutationFn: inventoryService.addInventoryItem,
      onSuccess: () => {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast({
          title: 'Success',
          description: 'Inventory item added successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: `Failed to add item: ${error.message}`,
          variant: 'destructive',
        });
      },
    });

  // Update inventory item
  const useUpdateInventoryItem = () => 
    useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<StockItem> }) => 
        inventoryService.updateInventoryItem(id, updates),
      onSuccess: (data) => {
        console.log('Update success in hook with data:', data);
        // Force a full refresh to ensure we get the latest data
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        // Update the cache directly as well for immediate UI update
        queryClient.setQueryData(['inventory'], (oldData: StockItem[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(item => 
            item.id === data.id ? { ...item, ...data } : item
          );
        });
        
        toast({
          title: 'Success',
          description: 'Inventory item updated successfully',
        });
      },
      onError: (error: Error) => {
        console.error('Update error in hook:', error);
        toast({
          title: 'Error',
          description: `Failed to update item: ${error.message}`,
          variant: 'destructive',
        });
      },
    });

  // Delete inventory item
  const useDeleteInventoryItem = () => 
    useMutation({
      mutationFn: inventoryService.deleteInventoryItem,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast({
          title: 'Success',
          description: 'Inventory item deleted successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: `Failed to delete item: ${error.message}`,
          variant: 'destructive',
        });
      },
    });

  return {
    useAllInventory,
    useLowStockItems,
    useAddInventoryItem,
    useUpdateInventoryItem,
    useDeleteInventoryItem,
  };
}
