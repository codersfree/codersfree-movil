import { use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import * as authApi from '@/api/auth';
import type { RegisterData, User } from '@/api/auth';
import { ApiError, TOKEN_KEY } from '@/api/client';
import { AuthContext } from './authContextObject';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secureStorage';

/** Clave del usuario en caché (datos no sensibles junto al token). */
const USER_KEY = 'codersfree.user';

/** Sesión de la app: el token vive en SecureStore y el usuario en el contexto. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveSession = useCallback(async (token: string, nextUser: User) => {
    await setSecureItem(TOKEN_KEY, token);
    await setSecureItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(async () => {
    await deleteSecureItem(TOKEN_KEY);
    await deleteSecureItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token = await getSecureItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      const cached = await getSecureItem(USER_KEY);
      if (cached) {
        setUser(JSON.parse(cached) as User);
      }
      setIsLoading(false);

      try {
        const freshUser = await authApi.fetchUser();
        await setSecureItem(USER_KEY, JSON.stringify(freshUser));
        setUser(freshUser);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearSession();
        }
      }
    }

    restoreSession();
  }, [clearSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { token, user: nextUser } = await authApi.login(email, password);
      await saveSession(token, nextUser);
    },
    [saveSession],
  );

  const signUp = useCallback(
    async (data: RegisterData) => {
      const { token, user: nextUser } = await authApi.register(data);
      await saveSession(token, nextUser);
    },
    [saveSession],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Si la API no responde, igual se cierra la sesión en el celular.
    }
    await clearSession();
  }, [clearSession]);

  const updateUser = useCallback(async (nextUser: User) => {
    await setSecureItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const can = useCallback((permission: string) => user?.permissions?.includes(permission) ?? false, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      can,
      signIn,
      signUp,
      signOut,
      updateUser,
    }),
    [user, isLoading, can, signIn, signUp, signOut, updateUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return value;
}
