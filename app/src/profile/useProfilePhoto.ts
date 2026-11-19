import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

export type PhotoSource = 'camera' | 'gallery';

export type PickedPhoto = {
  uri: string;
  mimeType?: string | null;
};

/**
 * Pide el permiso de cámara o galería antes de abrirlas.
 * Si se niega, deja `deniedSource` para mostrar la explicación y el botón de ajustes.
 * `aspect` define el recorte: cuadrado para el perfil, 16:9 para la portada de un curso.
 */
export function useProfilePhoto(aspect: [number, number] = [1, 1]) {
  const [aspectX, aspectY] = aspect;
  const [picked, setPicked] = useState<PickedPhoto | null>(null);
  const [deniedSource, setDeniedSource] = useState<PhotoSource | null>(null);

  const pick = useCallback(async (source: PhotoSource) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setDeniedSource(source);
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [aspectX, aspectY],
      quality: 0.7,
    };
    const result =
      source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPicked({ uri: asset.uri, mimeType: asset.mimeType });
    }
  }, [aspectX, aspectY]);

  return {
    picked,
    deniedSource,
    pick,
    clearPicked: useCallback(() => setPicked(null), []),
    clearDenied: useCallback(() => setDeniedSource(null), []),
  };
}
