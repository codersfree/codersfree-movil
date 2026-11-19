import { getSecureItem } from '@/auth/secureStorage';

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? ''}/api/v1`;

export const TOKEN_KEY = 'codersfree.token';

export type ValidationErrors = Record<string, string[]>;

/** Error de la API con el mensaje y los errores por campo que devuelve Laravel. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: ValidationErrors = {},
  ) {
    super(message);
  }

  /** Primer mensaje de error de un campo, o undefined. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0];
  }
}

export const NETWORK_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo otra vez.';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

/** Único cliente de la API: agrega la URL base, el token y maneja los errores. */
export async function apiRequest<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const token = await getSecureItem(TOKEN_KEY);
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? 'Ocurrió un error. Inténtalo otra vez.', response.status, data?.errors ?? {});
  }

  return data as T;
}
