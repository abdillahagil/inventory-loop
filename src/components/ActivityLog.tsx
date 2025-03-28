
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

interface ActivityLogProps {
  activities: Activity[];
  isLoading?: boolean;
}

const ActivityLog = ({ activities, isLoading = false }: ActivityLogProps) => {
  return (
    <div className="stock-card">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      
      {isLoading ? (
        // Loading skeleton
        <div className="space-y-3">
          {Array(5).fill(0).map((_, index) => (
            <div key={`loading-${index}`} className="border-b border-gray-100 pb-3">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-3 space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        // Actual data
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="font-medium">{activity.user}</div>
              <div className="text-sm text-gray-600">
                {activity.action} <span className="font-medium">{activity.target}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
            </div>
          ))}
        </div>
      ) : (
        // No data
        <div className="text-center py-8 text-gray-500">
          No recent activity
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
