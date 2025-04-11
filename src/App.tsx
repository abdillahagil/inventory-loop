import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { ErrorInfo } from "react";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Transfers from "./pages/Transfers";
import Users from "./pages/Users";
import Godowns from "./pages/Godowns";
import Shops from "./pages/Shops";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a global error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-800 font-medium">{this.state.error?.toString()}</p>
            </div>
            <details className="mt-4 border border-gray-200 rounded-md p-2">
              <summary className="cursor-pointer text-blue-600 font-medium">
                Error details (for developers)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Non-protected shop route */}
            <Route path="/shops" element={
              <MainLayout>
                <Shops />
              </MainLayout>
            } />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Routes accessible to all authenticated users */}
                <Route path="/inventory" element={<Inventory />} />
                
                {/* Super Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                  <Route path="/users" element={<Users />} />
                  <Route path="/settings" element={<Dashboard />} />
                </Route>
                
                {/* Super Admin and Godown Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin', 'godownadmin']} />}>
                  <Route path="/godowns" element={<Godowns />} />
                  <Route path="/transfers" element={<Transfers />} />
                  <Route path="/dispatches" element={<Dashboard />} />
                </Route>
                
                {/* Super Admin and Shop Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin', 'shopadmin']} />}>
                  <Route path="/sales" element={<Dashboard />} />
                </Route>
                
                {/* Reports - All admin types */}
                <Route path="/reports" element={<Dashboard />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
