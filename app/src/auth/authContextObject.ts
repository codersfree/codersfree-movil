import { createContext } from 'react';

import type { RegisterData, User } from '@/api/auth';

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  /** Si el usuario tiene el permiso (se llama igual que la ruta de la API). */
  can: (permission: string) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
};

/**
 * El contexto vive en su propio archivo para que Fast Refresh no lo vuelva a crear
 * cada vez que se edita AuthProvider (si no, useAuth deja de encontrar el proveedor).
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
