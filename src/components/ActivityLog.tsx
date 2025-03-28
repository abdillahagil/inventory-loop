
import React from 'react';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

const ActivityLog = ({ activities }: ActivityLogProps) => {
  return (
    <div className="stock-card">
      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
            <div className="w-9 h-9 rounded-full bg-stock-blue-100 flex items-center justify-center text-stock-blue-700 mr-3 flex-shrink-0">
              {activity.user.charAt(0)}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>{' '}
                <span>{activity.action}</span>{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      {activities.length > 5 && (
        <div className="mt-3 text-center">
          <button className="text-stock-blue-600 text-sm hover:underline">
            View All Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
