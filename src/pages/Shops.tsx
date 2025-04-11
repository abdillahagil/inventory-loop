import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

// Import role-specific views
import { ShopAdminView, SuperAdminShopsView } from './roleViews';

const Shops = () => {
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'superadmin';
  const isShopAdmin = user?.role === 'shopadmin';

  // Debug information
  console.log('User role:', user?.role);

  // If it's a ShopAdmin, render the ShopAdminView component
  if (isShopAdmin) {
    return <ShopAdminView />;
  }

  // If it's a SuperAdmin, they can see the shop management dashboard
  if (isSuperAdmin) {
    return <SuperAdminShopsView />;
  }

  // If not authenticated or user role is not suitable, show access denied
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-amber-50 border-amber-200">
        <CardContent className="p-0">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800">Access Denied</h3>
              <p className="text-amber-700">
                You need to be logged in as a SuperAdmin or ShopAdmin to view shops.
                {user ? ` Current role: ${user.role}` : ' You are not logged in.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Shops; 