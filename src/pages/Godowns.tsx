import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

// Import role-specific views
import SuperAdminGodowns from './SuperAdminGodowns';
// Import the component from roleViews
import { GodownAdminView } from './roleViews';

// Error boundary component for Godowns
class GodownsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Godowns Page Error]:', error);
    console.error('[Component Stack]:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Godowns Page Error</h1>
          <Card className="p-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">An error occurred rendering the Godowns page</h3>
                <p className="text-red-700">
                  {this.state.error?.toString()}
                </p>
              </div>
            </div>
            <details className="mt-2 border border-red-200 rounded-md p-2">
              <summary className="cursor-pointer text-blue-600 font-medium">
                Technical Details (for developers)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96 p-2 bg-gray-50 rounded">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingView = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <p className="text-gray-600">Loading godowns...</p>
  </div>
);

const Godowns: React.FC = () => {
  const { user, isAuthenticated } = useUserStore();
  const isSuperAdmin = user?.role === 'superadmin';
  const isGodownAdmin = user?.role === 'godownadmin';

  // Enhanced debug information
  console.log('Godowns Page Rendering - Debug Info:', { 
    userExists: !!user,
    isAuthenticated,
    isSuperAdmin,
    isGodownAdmin,
    timestamp: new Date().toISOString()
  });

  return (
    <GodownsErrorBoundary>
      {/* Show loading view while checking auth state */}
      {!user && <LoadingView />}

      {/* SuperAdmin view */}
      {isSuperAdmin && (
        <React.Suspense fallback={<LoadingView />}>
          <SuperAdminGodowns />
        </React.Suspense>
      )}

      {/* GodownAdmin view */}
      {isGodownAdmin && (
        <React.Suspense fallback={<LoadingView />}>
          <GodownAdminView />
        </React.Suspense>
      )}

      {/* Access denied view - only show if user is authenticated but not authorized */}
      {user && !isSuperAdmin && !isGodownAdmin && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Godowns</h1>
          <Card className="p-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800">Access Denied</h3>
                <p className="text-amber-700">
                  You need to be logged in as a SuperAdmin or GodownAdmin to view godowns.
                  {user ? ` Current role: ${user.role}` : ' You are not logged in.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </GodownsErrorBoundary>
  );
};

export default Godowns; 