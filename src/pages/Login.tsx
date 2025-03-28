
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Lock, Building, Store } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  userType: z.enum(['superadmin', 'godownadmin', 'shopadmin'])
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Setup form with validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      userType: 'superadmin'
    }
  });

  // Mock user data for demo purposes
  const mockUsers = [
    { username: 'superadmin', password: 'password123', type: 'superadmin' },
    { username: 'godown1', password: 'password123', type: 'godownadmin', location: 'Main Warehouse' },
    { username: 'godown2', password: 'password123', type: 'godownadmin', location: 'Secondary Warehouse' },
    { username: 'shop1', password: 'password123', type: 'shopadmin', location: 'Downtown Shop' },
    { username: 'shop2', password: 'password123', type: 'shopadmin', location: 'Mall Branch' }
  ];

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(
      u => u.username === values.username && 
           u.password === values.password && 
           u.type === values.userType
    );
    
    if (user) {
      login({
        id: user.username,
        name: user.username,
        role: user.type,
        location: 'location' in user ? user.location : undefined
      });
      
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">StockMaster Login</CardTitle>
          <CardDescription>
            Login to access your inventory management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login As</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={field.value === 'superadmin' ? 'default' : 'outline'}
                        className={`flex flex-col items-center justify-center h-24 ${
                          field.value === 'superadmin' ? 'bg-stock-blue-600' : ''
                        }`}
                        onClick={() => form.setValue('userType', 'superadmin')}
                      >
                        <User className="h-6 w-6 mb-2" />
                        <span>Super Admin</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={field.value === 'godownadmin' ? 'default' : 'outline'}
                        className={`flex flex-col items-center justify-center h-24 ${
                          field.value === 'godownadmin' ? 'bg-stock-blue-600' : ''
                        }`}
                        onClick={() => form.setValue('userType', 'godownadmin')}
                      >
                        <Building className="h-6 w-6 mb-2" />
                        <span>Godown Admin</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={field.value === 'shopadmin' ? 'default' : 'outline'}
                        className={`flex flex-col items-center justify-center h-24 ${
                          field.value === 'shopadmin' ? 'bg-stock-blue-600' : ''
                        }`}
                        onClick={() => form.setValue('userType', 'shopadmin')}
                      >
                        <Store className="h-6 w-6 mb-2" />
                        <span>Shop Admin</span>
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter your username" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Enter your password" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-stock-blue-600 hover:bg-stock-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : 'Log in'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center w-full">
            <p className="mb-2">Demo Accounts:</p>
            <p>Super Admin: superadmin / password123</p>
            <p>Godown Admin: godown1 / password123</p>
            <p>Shop Admin: shop1 / password123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
