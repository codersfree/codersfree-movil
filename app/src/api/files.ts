import { File } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Arma un FormData con una imagen local (cámara o galería).
 * En el SDK 58 el fetch global es expo/fetch: no acepta { uri, name, type }, sino un File de expo-file-system.
 * En la web no existe expo-file-system, así que se usa el Blob del navegador.
 */
export async function imageFormData(field: string, uri: string, mimeType?: string | null) {
  const extension = (mimeType ?? 'image/jpeg').split('/')[1] ?? 'jpg';
  const form = new FormData();
  const image = Platform.OS === 'web' ? await (await fetch(uri)).blob() : (new File(uri) as unknown as Blob);
  form.append(field, image, `${field}.${extension}`);
  return form;
}
