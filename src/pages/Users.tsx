import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, createUser, updateUser, deleteUser, getUserRoles, User, UserFormData } from '@/services/userService';
import { getGodowns, Godown } from '@/services/godownService';
import { getShops, Shop } from '@/services/shopService';
import { Loader2, User as UserIcon, UserPlus, Building, Store, Pencil, Trash2, ShieldAlert, Warehouse } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUserStore } from '@/store/userStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form validation schema
const userFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional(),
  name: z.string().min(2, { message: 'Name is required' }),
  role: z.enum(['superadmin', 'godownadmin', 'shopadmin', 'staff']),
  locationId: z.string().optional(),
  locationIds: z.array(z.string()).optional(),
  isActive: z.boolean().default(true)
});

type UserFormValues = z.infer<typeof userFormSchema>;

const Users = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUserStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch users list
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Fetch godowns list
  const { data: godowns = [] } = useQuery({
    queryKey: ['godowns'],
    queryFn: getGodowns,
  });

  // Fetch shops list
  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops,
  });

  // Filter users based on the active tab
  const filteredUsers = users.filter(user => {
    if (activeTab === "all") return true;
    if (activeTab === "godownadmins") return user.role === "godownadmin";
    if (activeTab === "shopadmins") return user.role === "shopadmin";
    if (activeTab === "superadmins") return user.role === "superadmin";
    if (activeTab === "staff") return user.role === "staff";
    return true;
  });

  // Mutation for creating a user
  const createUserMutation = useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    }
  });

  // Mutation for updating a user
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string, userData: UserFormData }) => 
      updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    }
  });

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeletingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  // Add user form
  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'shopadmin',
      locationId: '',
      locationIds: [],
      isActive: true
    }
  });

  // Edit user form
  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema.omit({ password: true }).merge(
      z.object({ password: z.string().optional() })
    )),
    defaultValues: {
      email: '',
      name: '',
      role: 'shopadmin',
      locationId: '',
      locationIds: [],
      isActive: true
    }
  });

  // Watch the role field to show/hide location selection
  const addFormRole = addForm.watch('role');
  const editFormRole = editForm.watch('role');

  // Set up edit form when editing user changes
  React.useEffect(() => {
    if (editingUser) {
      // For godownadmin users, we need to parse the comma-separated location string 
      // into the locationIds array to properly populate the checkboxes
      let locationIds: string[] = [];
      
      if (editingUser.role === 'godownadmin' && editingUser.location) {
        console.log('Processing godownadmin locations:', editingUser.location);
        
        // Get location names from the comma-separated string
        const locationNames = editingUser.location.split(',').map(name => name.trim());
        
        // Map location names back to location IDs using the godowns array
        locationIds = locationNames.reduce((ids, locationName) => {
          const godown = godowns.find(g => g.name === locationName);
          if (godown) {
            console.log(`Found godown ID ${godown.id} for location ${locationName}`);
            ids.push(godown.id);
          } else {
            console.log(`Could not find godown ID for location: ${locationName}`);
          }
          return ids;
        }, [] as string[]);
      }
      
      // If we were provided locationIds directly, use those instead
      if (editingUser.locationIds && editingUser.locationIds.length > 0) {
        console.log('Using provided locationIds:', editingUser.locationIds);
        locationIds = editingUser.locationIds;
      }
      
      console.log('Setting locationIds for edit form:', locationIds);
      
      editForm.reset({
        email: editingUser.email,
        name: editingUser.name,
        role: editingUser.role,
        locationId: editingUser.locationId || '',
        locationIds: locationIds,
        isActive: editingUser.isActive
      });
    }
  }, [editingUser, editForm, godowns]);

  // Handle create user form submission
  const onCreateSubmit = (values: UserFormValues) => {
    console.log('Creating user with values:', values);
    
    // Prepare the data based on the role
    const userData: UserFormData = {
      email: values.email,
      password: values.password,
      name: values.name,
      role: values.role,
      isActive: values.isActive,
      location: ''
    };

    // Set location based on role
    if (values.role === 'godownadmin') {
      userData.locationIds = values.locationIds || [];
      userData.location = getMultipleLocationNames(values.locationIds);
      console.log('Godown admin locationIds:', userData.locationIds);
      console.log('Godown admin location string:', userData.location);
    } else if (values.role === 'shopadmin') {
      userData.locationId = values.locationId;
      userData.location = getLocationName(values.role, values.locationId);
    }
    
    createUserMutation.mutate(userData);
  };

  // Handle edit user form submission
  const onEditSubmit = (values: UserFormValues) => {
    console.log('Updating user with values:', values);
    
    const userData: UserFormData = {
      email: values.email,
      name: values.name,
      role: values.role,
      isActive: values.isActive,
      location: ''
    };
    
    // Only include password if it's not empty
    if (values.password) {
      userData.password = values.password;
    }
    
    // Set location based on role
    if (values.role === 'godownadmin') {
      userData.locationIds = values.locationIds || [];
      userData.location = getMultipleLocationNames(values.locationIds);
      console.log('Godown admin locationIds:', userData.locationIds);
      console.log('Godown admin location string:', userData.location);
    } else if (values.role === 'shopadmin') {
      userData.locationId = values.locationId;
      userData.location = getLocationName(values.role, values.locationId);
    }
    
    updateUserMutation.mutate({ id: editingUser?.id || '', userData });
  };

  // Helper function to get location name from ID
  const getLocationName = (role: string, locationId?: string): string => {
    if (!locationId) return '';
    
    if (role === 'godownadmin') {
      const godown = godowns.find(g => g.id === locationId);
      return godown ? godown.name : '';
    } 
    else if (role === 'shopadmin') {
      const shop = shops.find(s => s.id === locationId);
      return shop ? shop.name : '';
    }
    
    return '';
  };

  // Helper function to get multiple location names as string
  const getMultipleLocationNames = (locationIds: string[] = []): string => {
    if (!locationIds.length) return '';

    const names = locationIds.map(id => {
      const godown = godowns.find(g => g.id === id);
      return godown ? godown.name : '';
    }).filter(Boolean);

    console.log('Got multiple location names:', names.join(', '));
    return names.join(', ');
  };

  // Handle delete user confirmation
  const handleDelete = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  // Function to get role badge component
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-red-500">{role}</Badge>;
      case 'godownadmin':
        return <Badge className="bg-blue-500">{role}</Badge>;
      case 'shopadmin':
        return <Badge className="bg-green-500">{role}</Badge>;
      case 'staff':
        return <Badge className="bg-gray-500">{role}</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Get location icon by role
  const getLocationIcon = (role: string) => {
    switch (role) {
      case 'godownadmin':
        return <Warehouse size={16} className="text-blue-500 mr-1" />;
      case 'shopadmin':
        return <Store size={16} className="text-green-500 mr-1" />;
      default:
        return null;
    }
  };

  // Cannot edit or delete yourself or users with same or higher role
  const canModifyUser = (targetUser: User | null) => {
    if (!currentUser) return false;
    if (!targetUser) return false;
    if (targetUser.id === currentUser.id) return false;
    
    const roleHierarchy = { 'superadmin': 3, 'godownadmin': 2, 'shopadmin': 1, 'staff': 0 };
    const currentUserRoleLevel = roleHierarchy[currentUser.role] || 0;
    const targetUserRoleLevel = roleHierarchy[targetUser.role] || 0;
    
    return currentUserRoleLevel > targetUserRoleLevel;
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate access level
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto pr-2 -mr-2">
            <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onCreateSubmit)} className="space-y-3">
                <FormField
                  control={addForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getUserRoles().map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                  {/* Multi-select for godown admins */}
                  {addFormRole === 'godownadmin' && (
                  <FormField
                    control={addForm.control}
                      name="locationIds"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Assign Godowns</FormLabel>
                          <div className="border rounded-md p-3">
                            <div className="text-xs text-gray-500 mb-2">
                              Select godowns to manage
                            </div>
                            <div className="max-h-28 overflow-y-auto pr-1">
                              {godowns.length === 0 ? (
                                <div className="text-xs text-gray-500 italic">
                                  No godowns available to assign
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-1">
                                  {godowns.map(godown => (
                                    <div key={godown.id} className="flex items-center space-x-1">
                                      <input
                                        type="checkbox"
                                        id={`godown-${godown.id}`}
                                        checked={field.value?.includes(godown.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            field.onChange([...(field.value || []), godown.id]);
                                          } else {
                                            field.onChange(field.value?.filter(id => id !== godown.id) || []);
                                          }
                                        }}
                                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <label htmlFor={`godown-${godown.id}`} className="text-xs font-medium text-gray-700 truncate">
                                        {godown.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {field.value?.length || 0} godowns selected
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Single select for shop admins */}
                  {addFormRole === 'shopadmin' && (
                    <FormField
                      control={addForm.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign Shop</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shop to manage" />
                              </SelectTrigger>
                        </FormControl>
                            <SelectContent>
                              {shops.map(shop => (
                                <SelectItem key={shop.id} value={shop.id}>
                                  {shop.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {shops.length === 0 && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                              No shops available to assign. Please create shops first.
                            </div>
                          )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
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
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create User
                  </Button>
                </DialogFooter>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* User Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Godown Admins</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'godownadmin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Admins</CardTitle>
            <Store className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'shopadmin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User List with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all user accounts in the system</CardDescription>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="godownadmins">Godown Admins</TabsTrigger>
              <TabsTrigger value="shopadmins">Shop Admins</TabsTrigger>
              <TabsTrigger value="superadmins">Super Admins</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.role === 'godownadmin' && user.locationIds?.length ? (
                            <div className="flex items-center">
                              <Warehouse size={16} className="text-blue-500 mr-1 flex-shrink-0" />
                              <span className="truncate" title={getMultipleLocationNames(user.locationIds)}>
                                {getMultipleLocationNames(user.locationIds)}
                              </span>
                            </div>
                          ) : user.location ? (
                            <div className="flex items-center">
                              {getLocationIcon(user.role)}
                              <span>{user.location}</span>
                            </div>
                          ) : null}
                        </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                              size="sm"
                                disabled={!canModifyUser(user)}
                                onClick={() => setEditingUser(user)}
                              >
                                <Pencil size={16} />
                              </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={!canModifyUser(user)}
                              onClick={() => setDeletingUser(user)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
              Update user details and permissions
                                </DialogDescription>
                              </DialogHeader>
                              
          <div className="max-h-[calc(90vh-180px)] overflow-y-auto pr-2 -mr-2">
                              <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (leave empty to keep current)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="role"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select 
                                          onValueChange={field.onChange} 
                                          defaultValue={field.value}
                        value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {getUserRoles().map(role => (
                                              <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                {/* Multi-select for godown admins in edit form */}
                {editFormRole === 'godownadmin' && (
                                    <FormField
                                      control={editForm.control}
                    name="locationIds"
                                      render={({ field }) => (
                                        <FormItem>
                        <FormLabel>Assign Godowns</FormLabel>
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-gray-500 mb-2">
                            Select godowns to manage
                          </div>
                          <div className="max-h-28 overflow-y-auto pr-1">
                            {godowns.length === 0 ? (
                              <div className="text-xs text-gray-500 italic">
                                No godowns available to assign
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-1">
                                {godowns.map(godown => (
                                  <div key={godown.id} className="flex items-center space-x-1">
                                    <input
                                      type="checkbox"
                                      id={`edit-godown-${godown.id}`}
                                      checked={field.value?.includes(godown.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([...(field.value || []), godown.id]);
                                        } else {
                                          field.onChange(field.value?.filter(id => id !== godown.id) || []);
                                        }
                                      }}
                                      className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`edit-godown-${godown.id}`} className="text-xs font-medium text-gray-700 truncate">
                                      {godown.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {field.value?.length || 0} godowns selected
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Single select for shop admins in edit form */}
                {editFormRole === 'shopadmin' && (
                  <FormField
                    control={editForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Shop</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shop to manage" />
                            </SelectTrigger>
                                          </FormControl>
                          <SelectContent>
                            {shops.map(shop => (
                              <SelectItem key={shop.id} value={shop.id}>
                                {shop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {shops.length === 0 && (
                          <div className="text-xs text-gray-500 mt-1 italic">
                            No shops available to assign. Please create shops first.
                          </div>
                        )}
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="isActive"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
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
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update User
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
          </div>
                            </DialogContent>
                          </Dialog>
                          
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              
          <div className="py-4">
            {deletingUser && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {deletingUser.name}</p>
                <p><strong>Email:</strong> {deletingUser.email}</p>
                <p><strong>Role:</strong> {deletingUser.role}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleDelete}
                                  disabled={deleteUserMutation.isPending}
                                >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
    </div>
  );
};

export default Users; 