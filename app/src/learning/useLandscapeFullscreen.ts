import { Accelerometer } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/** Umbrales en g: el eje con la gravedad indica cómo está sostenido el celular. */
const LANDSCAPE_X = 0.7;
const LANDSCAPE_MAX_Y = 0.5;
const PORTRAIT_Y = 0.7;
const UPDATE_INTERVAL_MS = 300;

export type SensorState = 'checking' | 'active' | 'unavailable' | 'denied';

/**
 * H10 · Con el acelerómetro detecta si el celular está en horizontal y pasa a pantalla completa;
 * al volver a vertical, sale. El sensor solo vive mientras la pantalla está montada.
 */
export function useLandscapeFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);
  const [sensor, setSensor] = useState<SensorState>('checking');
  const fullscreenRef = useRef(false);

  const apply = useCallback((next: boolean) => {
    if (fullscreenRef.current === next) {
      return;
    }
    fullscreenRef.current = next;
    setFullscreen(next);
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(
        next ? ScreenOrientation.OrientationLock.LANDSCAPE : ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    async function start() {
      // En la web no se gira la pantalla: queda el botón de pantalla completa.
      const available = Platform.OS !== 'web' && (await Accelerometer.isAvailableAsync().catch(() => false));
      if (!available) {
        if (!cancelled) setSensor('unavailable');
        return;
      }
      const permission = await Accelerometer.requestPermissionsAsync();
      if (cancelled) return;
      if (!permission.granted) {
        setSensor('denied');
        return;
      }

      try {
        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
        subscription = Accelerometer.addListener(({ x, y }) => {
          if (Math.abs(x) > LANDSCAPE_X && Math.abs(y) < LANDSCAPE_MAX_Y) {
            apply(true);
          } else if (Math.abs(y) > PORTRAIT_Y) {
            apply(false);
          }
        });
        setSensor('active');
      } catch {
        setSensor('unavailable');
      }
    }

    start();

    // Limpieza: se libera el sensor y la app vuelve a vertical al salir de la lección.
    return () => {
      cancelled = true;
      subscription?.remove();
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => undefined);
      }
    };
  }, [apply]);

  return {
    fullscreen,
    sensor,
    enter: useCallback(() => apply(true), [apply]),
    exit: useCallback(() => apply(false), [apply]),
  };
}
