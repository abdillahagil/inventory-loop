import { userAPI } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'godownadmin' | 'shopadmin' | 'staff';
  location: string;
  locationId?: string; // For single location assignment
  locationIds?: string[]; // Array of location IDs for multi-facility assignments
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  name: string;
  role: 'superadmin' | 'godownadmin' | 'shopadmin' | 'staff';
  location: string;
  locationId?: string; // For single location assignment
  locationIds?: string[]; // Array of location IDs for multi-facility assignments
  isActive: boolean;
}

export const getUsers = async (): Promise<User[]> => {
  return userAPI.getUsers();
};

export const getUserById = async (id: string): Promise<User> => {
  return userAPI.getUserById(id);
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  return userAPI.createUser(userData);
};

export const updateUser = async (id: string, userData: UserFormData): Promise<User> => {
  return userAPI.updateUser(id, userData);
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  return userAPI.deleteUser(id);
};

export const getUserRoles = (): { value: User['role']; label: string }[] => {
  return [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'godownadmin', label: 'Godown Admin' },
    { value: 'shopadmin', label: 'Shop Admin' },
    { value: 'staff', label: 'Staff' },
  ];
}; 