import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

export type PhotoSource = 'camera' | 'gallery';

export type PickedPhoto = {
  uri: string;
  mimeType?: string | null;
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

/**
 * Pide el permiso de cámara o galería antes de abrirlas.
 * Si se niega, deja `deniedSource` para mostrar la explicación y el botón de ajustes.
 */
export function useProfilePhoto() {
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

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPicked({ uri: asset.uri, mimeType: asset.mimeType });
    }
  }, []);

  return {
    picked,
    deniedSource,
    pick,
    clearPicked: useCallback(() => setPicked(null), []),
    clearDenied: useCallback(() => setDeniedSource(null), []),
  };
}
