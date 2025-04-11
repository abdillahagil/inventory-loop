import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Package, 
  SquareStack, 
  MapPin 
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUserStore } from '@/store/userStore';
import { 
  getGodowns, 
  createGodown, 
  updateGodown, 
  deleteGodown, 
  Godown, 
  GodownFormData 
} from '@/services/godownService';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Form validation schema for godown
const godownFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  location: z.string().min(3, { message: 'Location is required' }),
  isActive: z.boolean().default(true)
});

// Define explicitly with required fields to match GodownFormData
type GodownFormValues = {
  name: string;
  location: string;
  isActive: boolean;
};

const SuperAdminGodowns = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [deletingGodown, setDeletingGodown] = useState<Godown | null>(null);

  // Fetch godowns from service
  const { data: godowns, isLoading } = useQuery({
    queryKey: ['godowns'],
    queryFn: getGodowns
  });

  // Create godown mutation
  const createGodownMutation = useMutation({
    mutationFn: (data: GodownFormData) => createGodown(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godowns'] });
      toast.success('Godown created successfully');
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      console.error('Create godown error details:', error);
      // Improved error handling
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create godown';
      toast.error(errorMessage);
    }
  });

  // Update godown mutation
  const updateGodownMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GodownFormData }) => 
      updateGodown(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godowns'] });
      toast.success('Godown updated successfully');
      setEditingGodown(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update godown');
    }
  });

  // Delete godown mutation
  const deleteGodownMutation = useMutation({
    mutationFn: deleteGodown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godowns'] });
      toast.success('Godown deleted successfully');
      setDeletingGodown(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete godown');
    }
  });

  // Add godown form
  const addForm = useForm<GodownFormValues>({
    resolver: zodResolver(godownFormSchema),
    defaultValues: {
      name: '',
      location: '',
      isActive: true
    }
  });

  // Edit godown form
  const editForm = useForm<GodownFormValues>({
    resolver: zodResolver(godownFormSchema),
    defaultValues: {
      name: '',
      location: '',
      isActive: true
    }
  });

  // Set up edit form when editing godown changes
  React.useEffect(() => {
    if (editingGodown) {
      editForm.reset({
        name: editingGodown.name,
        location: editingGodown.location,
        isActive: editingGodown.isActive
      });
    }
  }, [editingGodown, editForm]);

  // Handle create godown form submission
  const onCreateSubmit = (values: GodownFormValues) => {
    // Explicitly cast as GodownFormData since the schema ensures all required fields are present
    createGodownMutation.mutate(values as GodownFormData);
  };

  // Handle edit godown form submission
  const onEditSubmit = (values: GodownFormValues) => {
    if (editingGodown) {
      updateGodownMutation.mutate({ 
        id: editingGodown.id, 
        data: values as GodownFormData 
      });
    }
  };

  // Handle delete godown confirmation
  const handleDelete = () => {
    if (deletingGodown) {
      deleteGodownMutation.mutate(deletingGodown.id);
    }
  };

  // Calculate total capacity (sum of all godowns)
  const getTotalCapacity = () => {
    const total = godowns?.reduce((sum, g) => sum + 1, 0) || 0;
    return total;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Godowns</h1>
          <p className="text-gray-600">Manage warehouse locations and their details</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Godown</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Godown</DialogTitle>
              <DialogDescription>
                Create a new warehouse location in the system
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Godown Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter godown name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location (e.g. Mumbai Main, Delhi North)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Status</FormLabel>
                        <FormDescription>
                          Active godowns can receive and dispatch inventory
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={createGodownMutation.isPending}
                  >
                    {createGodownMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : 'Create Godown'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <SquareStack className="h-4 w-4 mr-2 text-blue-500" />
              Total Godowns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{godowns?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Package className="h-4 w-4 mr-2 text-green-500" />
              Storage Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalCapacity()} warehouses
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-purple-500" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(godowns?.map(g => g.location)).size || 0} locations
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Godowns</CardTitle>
          <CardDescription>List of all warehouse locations in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {godowns && godowns.length > 0 ? (
                  godowns.map((godown) => (
                    <TableRow key={godown.id}>
                      <TableCell className="font-medium">{godown.name}</TableCell>
                      <TableCell>{godown.location}</TableCell>
                      <TableCell>
                        <Badge variant={godown.isActive ? "default" : "secondary"}>
                          {godown.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={editingGodown?.id === godown.id} onOpenChange={(open) => !open && setEditingGodown(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setEditingGodown(godown)}
                              >
                                <Pencil size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Godown</DialogTitle>
                                <DialogDescription>
                                  Update godown details and information
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Godown Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter godown name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="location"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter location (e.g. Mumbai Main, Delhi North)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="isActive"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                          <FormLabel>Status</FormLabel>
                                          <FormDescription>
                                            Active godowns can receive and dispatch inventory
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                      type="submit" 
                                      disabled={updateGodownMutation.isPending}
                                    >
                                      {updateGodownMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Updating...
                                        </>
                                      ) : 'Update Godown'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={deletingGodown?.id === godown.id} onOpenChange={(open) => !open && setDeletingGodown(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => setDeletingGodown(godown)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the godown "{godown.name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="mt-4 p-4 bg-red-50 rounded-md text-red-800 text-sm">
                                <p className="font-semibold">Warning:</p>
                                <p>Deleting this godown will also affect:</p>
                                <ul className="list-disc pl-5 mt-2">
                                  <li>Existing inventory in this location</li>
                                  <li>Transfers in progress to/from this location</li>
                                  <li>Historical records linked to this location</li>
                                </ul>
                              </div>
                              
                              <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                  <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleDelete}
                                  disabled={deleteGodownMutation.isPending}
                                >
                                  {deleteGodownMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : 'Delete Godown'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No godowns found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminGodowns; 