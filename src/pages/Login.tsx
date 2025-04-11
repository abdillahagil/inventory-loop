import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Lock, Building, Store, Loader2 } from 'lucide-react';

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
import { useUserStore, UserRole } from '@/store/userStore';
import { authAPI } from '@/services/api';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
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
      email: '',
      password: '',
      userType: 'superadmin'
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Call the API for authentication
      const userData = await authAPI.login({
        email: values.email,
        password: values.password,
        userType: values.userType
      });
      
      // Debug the user data received from the server
      console.log('Login API response userData:', userData);
      
      // Store token in localStorage
      localStorage.setItem('token', userData.token);
      
      // For debugging purposes
      const userForStore = {
        id: userData.id,
        name: userData.name,
        role: userData.role as UserRole,
        location: userData.location
      };
      console.log('Storing user in store:', userForStore);
      
      // Update state
      login(userForStore);
      
      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          className="pl-10" 
                          {...field} 
                        />
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
          <div className="mt-4 text-center w-full">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
