
/**
 * API client for interacting with the external Node.js backend
 */

// Base URL for the API - replace with your actual backend URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Inventory service for managing stock items
 */
export const inventoryService = {
  // Get all inventory items
  getInventory: () => 
    fetchWithErrorHandling<StockItem[]>(`${API_BASE_URL}/inventory`),

  // Get low stock items
  getLowStockItems: () => 
    fetchWithErrorHandling<StockItem[]>(`${API_BASE_URL}/inventory/low-stock`),

  // Add new inventory item
  addInventoryItem: (item: Omit<StockItem, 'id'>) => 
    fetchWithErrorHandling<StockItem>(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  // Update inventory item
  updateInventoryItem: (id: string, updates: Partial<StockItem>) => 
    fetchWithErrorHandling<StockItem>(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete inventory item
  deleteInventoryItem: (id: string) => 
    fetchWithErrorHandling<void>(`${API_BASE_URL}/inventory/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Transfers service for managing stock transfers
 */
export const transfersService = {
  // Get all transfers
  getTransfers: () => 
    fetchWithErrorHandling<any[]>(`${API_BASE_URL}/transfers`),

  // Create a new transfer
  createTransfer: (transferData: any) => 
    fetchWithErrorHandling<any>(`${API_BASE_URL}/transfers`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    }),

  // Get transfer by ID
  getTransferById: (id: string) => 
    fetchWithErrorHandling<any>(`${API_BASE_URL}/transfers/${id}`),

  // Update transfer status
  updateTransferStatus: (id: string, status: string) => 
    fetchWithErrorHandling<any>(`${API_BASE_URL}/transfers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

/**
 * Activity service for tracking user activities
 */
export const activityService = {
  // Get recent activities
  getRecentActivities: () => 
    fetchWithErrorHandling<any[]>(`${API_BASE_URL}/activities`),
};
