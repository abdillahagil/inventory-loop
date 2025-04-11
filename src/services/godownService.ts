import api from './api';

export interface Godown {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GodownFormData {
  name: string;
  location: string;
  isActive: boolean;
}

// Get all godowns
export const getGodowns = async (): Promise<Godown[]> => {
  return api.get('/godowns').then(response => response.data);
};

// Get godown by ID
export const getGodownById = async (id: string): Promise<Godown> => {
  return api.get(`/godowns/${id}`).then(response => response.data);
};

// Create a new godown
export const createGodown = async (godownData: GodownFormData): Promise<Godown> => {
  return api.post('/godowns', godownData).then(response => response.data);
};

// Update an existing godown
export const updateGodown = async (id: string, godownData: GodownFormData): Promise<Godown> => {
  return api.put(`/godowns/${id}`, godownData).then(response => response.data);
};

// Delete a godown
export const deleteGodown = async (id: string): Promise<{ message: string }> => {
  return api.delete(`/godowns/${id}`).then(response => response.data);
}; 