import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'superadmin' | 'godownadmin' | 'shopadmin' | 'staff';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  location?: string;
  locationIds?: string[]; // Array of location IDs for godown admins
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
    }
  )
);
