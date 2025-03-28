
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transfers" element={<Transfers />} />
            {/* Placeholder routes for future implementation */}
            <Route path="/godowns" element={<Dashboard />} />
            <Route path="/shops" element={<Dashboard />} />
            <Route path="/dispatches" element={<Dashboard />} />
            <Route path="/sales" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/users" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
