import axios from 'axios';
import { StockItem, Activity, Transfer } from '@/types';

/**
 * API client for interacting with the external Node.js backend
 */

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
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
    fetchWithErrorHandling<StockItem[]>(`${API_URL}/inventory`),

  // Get low stock items
  getLowStockItems: () =>
    fetchWithErrorHandling<StockItem[]>(`${API_URL}/inventory/low-stock`),

  // Add new inventory item
  addInventoryItem: (item: Omit<StockItem, 'id'>) =>
    fetchWithErrorHandling<StockItem>(`${API_URL}/inventory`, {
      method: 'POST',
      body: JSON.stringify({
        // If it's a new product (for superadmin)
        name: item.name,
        sku: item.sku,
        category: item.category && item.category.trim() !== '' ? item.category : 'Uncategorized',
        price: item.price,
        costPrice: item.costPrice,
        // Inventory details
        location: "Unassigned", // Always use Unassigned as location is removed from form
        quantity: item.quantity,
        unit: item.unit || 'pcs', // Default unit value
        minimumStockLevel: item.quantity > 10 ? Math.floor(item.quantity * 0.2) : 5, // Set minimum stock level as 20% of initial quantity or 5
      }),
    }),

  // Update inventory item
  updateInventoryItem: (id: string, updates: Partial<StockItem>) => {
    console.log('API service: updating inventory item', id, 'with updates:', updates);

    // For debugging purposes, log the token being used for authorization
    const token = localStorage.getItem('token');
    console.log('API service: using token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token found');

    return fetchWithErrorHandling<StockItem>(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }).then(response => {
      console.log('API service: update response received:', response);
      return response;
    }).catch(error => {
      console.error('API service: update failed with error:', error);
      // Log more details for debugging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    });
  },

  // Delete inventory item
  deleteInventoryItem: (id: string) =>
    fetchWithErrorHandling<void>(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Transfers service for managing stock transfers
 */
export const transfersService = {
  // Get all transfers
  getTransfers: () =>
    fetchWithErrorHandling<Transfer[]>(`${API_URL}/transfers`),

  // Create a new transfer
  createTransfer: (transferData: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchWithErrorHandling<Transfer>(`${API_URL}/transfers`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    }),

  // Get transfer by ID
  getTransferById: (id: string) =>
    fetchWithErrorHandling<Transfer>(`${API_URL}/transfers/${id}`),

  // Update transfer status
  updateTransferStatus: (id: string, status: Transfer['status']) =>
    fetchWithErrorHandling<Transfer>(`${API_URL}/transfers/${id}/status`, {
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
    fetchWithErrorHandling<Activity[]>(`${API_URL}/activities`),
};

// Auth services
export const authAPI = {
  login: async (credentials: { email: string; password: string; userType: string }) => {
    console.log('Login attempt with:', {
      ...credentials,
      password: '[REDACTED]'
    });

    // Include both email and username fields for backward compatibility
    const payload = {
      ...credentials,
      username: credentials.email
    };

    console.log('Sending login payload with both fields:', {
      ...payload,
      password: '[REDACTED]'
    });

    try {
      const response = await api.post('/auth/login', payload);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    location?: string;
  }) => {
    console.log('Registering user with data:', {
      ...userData,
      password: userData.password ? '[REDACTED]' : undefined
    });

    // Create payload with both email and username (same value) for backward compatibility
    const payload = {
      ...userData,
      username: userData.email // Include username field with the same value as email
    };

    console.log('Sending payload with both email and username:', {
      ...payload,
      password: '[REDACTED]'
    });

    try {
      // First try with native fetch to rule out Axios issues
      console.log('Trying with native fetch...');
      const fetchResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log('Registration successful with fetch:', data);
        return data;
      }

      const errorText = await fetchResponse.text();
      console.error('Fetch failed with status:', fetchResponse.status, 'Response:', errorText);

      // If fetch fails, try with axios as fallback
      console.log('Falling back to axios...');
      const response = await api.post('/auth/register', payload);
      console.log('Registration successful with axios:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// User services
export const userAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    const userData = response.data;

    // For godownadmin users, process the location string to create locationIds
    if (userData.role === 'godownadmin' && userData.location) {
      // This helps the frontend populate the form correctly
      console.log('Processing godownadmin location in API response:', userData.location);
      userData.locationIds = []; // Initialize empty array to avoid undefined
    }

    return userData;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Product services
export const productAPI = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Inventory services
export const inventoryAPI = {
  getInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },
  getInventoryById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },
  createInventory: async (inventoryData: any) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },
  updateInventory: async (id: string, inventoryData: any) => {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
  },
  deleteInventory: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};

export default api;