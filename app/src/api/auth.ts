import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { apiRequest } from './client';

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
  const extension = (mimeType ?? 'image/jpeg').split('/')[1] ?? 'jpg';
  const form = new FormData();

  // En el SDK 58 el fetch global es expo/fetch: no acepta { uri, name, type }, sino un File de expo-file-system.
  // En la web no existe expo-file-system, así que se usa el Blob del navegador.
  const photo = Platform.OS === 'web' ? await (await fetch(uri)).blob() : (new File(uri) as unknown as Blob);
  form.append('photo', photo, `perfil.${extension}`);

  const { data } = await apiRequest<{ data: User }>('/user/photo', { method: 'POST', body: form });
  return data;
}
