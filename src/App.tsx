
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Transfers from "./pages/Transfers";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Routes accessible to all authenticated users */}
              <Route path="/inventory" element={<Inventory />} />
              
              {/* Super Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                <Route path="/users" element={<Dashboard />} />
                <Route path="/settings" element={<Dashboard />} />
              </Route>
              
              {/* Super Admin and Godown Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['superadmin', 'godownadmin']} />}>
                <Route path="/godowns" element={<Dashboard />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/dispatches" element={<Dashboard />} />
              </Route>
              
              {/* Super Admin and Shop Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['superadmin', 'shopadmin']} />}>
                <Route path="/shops" element={<Dashboard />} />
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
);

export default App;
