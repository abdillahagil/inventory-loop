import axios from 'axios';

// Create a public API client without auth interceptor
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface Shop {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ShopFormData {
  name: string;
  location: string;
  isActive: boolean;
}

// Get all shops
export const getShops = async (): Promise<Shop[]> => {
  return publicApi.get('/shops').then(response => response.data);
};

// Get shop by ID
export const getShopById = async (id: string): Promise<Shop> => {
  return publicApi.get(`/shops/${id}`).then(response => response.data);
};

// Create a new shop
export const createShop = async (shopData: ShopFormData): Promise<Shop> => {
  return publicApi.post('/shops', shopData).then(response => response.data);
};

// Update an existing shop
export const updateShop = async (id: string, shopData: ShopFormData): Promise<Shop> => {
  return publicApi.put(`/shops/${id}`, shopData).then(response => response.data);
};

// Delete a shop
export const deleteShop = async (id: string): Promise<{ message: string }> => {
  return publicApi.delete(`/shops/${id}`).then(response => response.data);
}; 