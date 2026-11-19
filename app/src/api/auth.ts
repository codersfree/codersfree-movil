import { apiRequest } from './client';
import { imageFormData } from './files';

export type User = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  photo_url: string | null;
  created_at: string | null;
};

type TokenResponse = { token: string; user: User };

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export function register(data: RegisterData) {
  return apiRequest<TokenResponse>('/register', { method: 'POST', body: data });
}

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>('/login', { method: 'POST', body: { email, password } });
}

export function logout() {
  return apiRequest<void>('/logout', { method: 'POST' });
}

export async function fetchUser() {
  const { data } = await apiRequest<{ data: User }>('/user');
  return data;
}

export async function uploadProfilePhoto(uri: string, mimeType?: string | null) {
  const form = await imageFormData('photo', uri, mimeType);
  const { data } = await apiRequest<{ data: User }>('/user/photo', { method: 'POST', body: form });
  return data;
}

/** Guarda el token de notificaciones de este celular para el usuario. */
export function savePushToken(token: string) {
  return apiRequest<void>('/push-tokens', { method: 'POST', body: { token } });
}

/** Olvida el token de notificaciones de este celular (al cerrar sesión). */
export function deletePushToken(token: string) {
  return apiRequest<void>('/push-tokens', { method: 'DELETE', body: { token } });
}
