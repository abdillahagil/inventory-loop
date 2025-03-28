
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transfersService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Transfer } from '@/types';

/**
 * Custom hook for transfer operations using React Query
 */
export function useTransfers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all transfers
  const useAllTransfers = () => 
    useQuery({
      queryKey: ['transfers'],
      queryFn: transfersService.getTransfers,
    });

  // Get transfer by ID
  const useTransferById = (id: string) => 
    useQuery({
      queryKey: ['transfers', id],
      queryFn: () => transfersService.getTransferById(id),
      enabled: !!id,
    });

  // Create transfer
  const useCreateTransfer = () => 
    useMutation({
      mutationFn: transfersService.createTransfer,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transfers'] });
        toast({
          title: 'Success',
          description: 'Transfer created successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: `Failed to create transfer: ${error.message}`,
          variant: 'destructive',
        });
      },
    });

  // Update transfer status
  const useUpdateTransferStatus = () => 
    useMutation({
      mutationFn: ({ id, status }: { id: string; status: Transfer['status'] }) => 
        transfersService.updateTransferStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transfers'] });
        toast({
          title: 'Success',
          description: 'Transfer status updated successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: `Failed to update transfer status: ${error.message}`,
          variant: 'destructive',
        });
      },
    });

  return {
    useAllTransfers,
    useTransferById,
    useCreateTransfer,
    useUpdateTransferStatus,
  };
}
