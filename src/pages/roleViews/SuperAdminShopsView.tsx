import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Store, 
  ShoppingBag, 
  MapPin 
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { 
  getShops, 
  createShop, 
  updateShop, 
  deleteShop, 
  Shop, 
  ShopFormData 
} from '@/services/shopService';

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

// Form validation schema for shop
const shopFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  location: z.string().min(3, { message: 'Location is required' }),
  isActive: z.boolean().default(true)
});

// Define explicitly with required fields
type ShopFormValues = {
  name: string;
  location: string;
  isActive: boolean;
};

const SuperAdminShopsView = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deletingShop, setDeletingShop] = useState<Shop | null>(null);

  // Fetch shops from service
  const { data: shops, isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops
  });

  // Create shop mutation
  const createShopMutation = useMutation({
    mutationFn: (data: ShopFormData) => createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop created successfully');
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create shop';
      toast.error(errorMessage);
    }
  });

  // Update shop mutation
  const updateShopMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShopFormData }) => 
      updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop updated successfully');
      setEditingShop(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update shop');
    }
  });

  // Delete shop mutation
  const deleteShopMutation = useMutation({
    mutationFn: deleteShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop deleted successfully');
      setDeletingShop(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete shop');
    }
  });

  // Add shop form
  const addForm = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      location: '',
      isActive: true
    }
  });

  // Edit shop form
  const editForm = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      location: '',
      isActive: true
    }
  });

  // Form submission handlers
  const onCreateSubmit = (data: ShopFormValues) => {
    createShopMutation.mutate(data);
  };

  const onEditSubmit = (data: ShopFormValues) => {
    if (!editingShop) return;
    updateShopMutation.mutate({ id: editingShop.id, data });
  };

  // Set edit form values when editing shop is changed
  React.useEffect(() => {
    if (editingShop) {
      editForm.reset({
        name: editingShop.name,
        location: editingShop.location,
        isActive: editingShop.isActive
      });
    }
  }, [editingShop, editForm]);

  // Handle delete
  const handleDelete = () => {
    if (!deletingShop) return;
    deleteShopMutation.mutate(deletingShop.id);
  };

  // Get total number of shops for statistics
  const getTotalCapacity = () => {
    return shops?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Shops</h1>
          <p className="text-gray-600">Manage retail shops and their details</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Shop</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Shop</DialogTitle>
              <DialogDescription>
                Create a new retail shop location in the system
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name" {...field} />
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
                        <Input placeholder="Enter location (e.g. Mall of India, City Center)" {...field} />
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
                          Active shops can sell inventory and receive stock
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
                    disabled={createShopMutation.isPending}
                  >
                    {createShopMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : 'Create Shop'}
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
              <Store className="h-4 w-4 mr-2 text-blue-500" />
              Total Shops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shops?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-green-500" />
              Retail Outlets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalCapacity()} stores
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
              {new Set(shops?.map(s => s.location)).size || 0} locations
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Shops</CardTitle>
          <CardDescription>List of all retail shop locations in the system</CardDescription>
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
                {shops && shops.length > 0 ? (
                  shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.location}</TableCell>
                      <TableCell>
                        <Badge variant={shop.isActive ? "default" : "secondary"}>
                          {shop.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={editingShop?.id === shop.id} onOpenChange={(open) => !open && setEditingShop(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setEditingShop(shop)}
                              >
                                <Pencil size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Shop</DialogTitle>
                                <DialogDescription>
                                  Update shop details and information
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Shop Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter shop name" {...field} />
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
                                          <Input placeholder="Enter location (e.g. Mall of India, City Center)" {...field} />
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
                                            Active shops can sell inventory and receive stock
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
                                      disabled={updateShopMutation.isPending}
                                    >
                                      {updateShopMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Updating...
                                        </>
                                      ) : 'Update Shop'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={deletingShop?.id === shop.id} onOpenChange={(open) => !open && setDeletingShop(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => setDeletingShop(shop)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the shop "{shop.name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="mt-4 p-4 bg-red-50 rounded-md text-red-800 text-sm">
                                <p className="font-semibold">Warning:</p>
                                <p>Deleting this shop will also affect:</p>
                                <ul className="list-disc pl-5 mt-2">
                                  <li>Existing inventory in this shop</li>
                                  <li>Sales records linked to this shop</li>
                                  <li>Transfers in progress to this shop</li>
                                  <li>Historical records linked to this shop</li>
                                </ul>
                              </div>
                              
                              <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                  <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleDelete}
                                  disabled={deleteShopMutation.isPending}
                                >
                                  {deleteShopMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : 'Delete Shop'}
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
                      No shops found
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

export default SuperAdminShopsView; 