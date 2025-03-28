
/**
 * Represents an inventory stock item in the system
 */
export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  status: 'Low' | 'Normal' | 'High';
  lastUpdated: string;
}

/**
 * Represents a transfer between locations
 */
export interface Transfer {
  id: string;
  sourceLocation: string;
  destinationLocation: string;
  items: TransferItem[];
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents an item in a transfer
 */
export interface TransferItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Represents a user activity in the system
 */
export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}
