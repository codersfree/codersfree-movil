import Constants, { ExecutionEnvironment } from 'expo-constants';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { deletePushToken, savePushToken } from '@/api/auth';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/auth/secureStorage';

const PUSH_TOKEN_KEY = 'codersfree.push-token';

/**
 * Las push no funcionan en Expo Go (desde el SDK 53) ni en la web: solo en un development build.
 * Por eso expo-notifications se carga con import dinámico y solo cuando hay soporte.
 */
export const pushSupported =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let modulePromise: Promise<NotificationsModule> | null = null;

function loadNotifications(): Promise<NotificationsModule> {
  if (!modulePromise) {
    modulePromise = import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      return Notifications;
    });
  }
  return modulePromise;
}

export type PushRegistration = 'granted' | 'denied' | 'unsupported' | 'error';

/** Pide el permiso de notificaciones y envía el token de este celular a la API. */
export async function registerForPush(): Promise<PushRegistration> {
  if (!pushSupported) {
    return 'unsupported';
  }

  const Notifications = await loadNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Cursos nuevos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    // Sin permiso la app sigue funcionando normal, solo que sin avisos.
    return 'denied';
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn('Notificaciones: falta el projectId de EAS (ejecuta `eas init`).');
    return 'error';
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await savePushToken(token);
    await setSecureItem(PUSH_TOKEN_KEY, token);
    return 'granted';
  } catch (error) {
    console.warn('Notificaciones: no se pudo registrar el token.', error);
    return 'error';
  }
}

/** Al cerrar sesión, la API olvida el token de este celular (así no recibe avisos de otra cuenta). */
export async function forgetPushToken() {
  const token = await getSecureItem(PUSH_TOKEN_KEY);
  if (!token) {
    return;
  }
  try {
    await deletePushToken(token);
  } catch {
    // Si falla, la API lo reemplaza cuando otra cuenta inicie sesión en este celular.
  }
  await deleteSecureItem(PUSH_TOKEN_KEY);
}

function openFromNotification(data: unknown) {
  const slug = (data as { type?: string; slug?: string } | undefined)?.slug;
  if (slug) {
    router.push({ pathname: '/curso/[slug]', params: { slug } });
  }
}

/**
 * H15 · Al iniciar sesión registra el celular; al tocar una notificación abre el detalle del curso
 * (también si la app estaba cerrada).
 */
export function usePushNotifications(userId: number | null) {
  useEffect(() => {
    if (userId !== null) {
      registerForPush();
    }
  }, [userId]);

  useEffect(() => {
    if (!pushSupported) {
      return;
    }
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    loadNotifications().then(async (Notifications) => {
      if (cancelled) return;
      subscription = Notifications.addNotificationResponseReceivedListener((response) =>
        openFromNotification(response.notification.request.content.data),
      );
      const last = await Notifications.getLastNotificationResponseAsync();
      if (last && !cancelled) {
        openFromNotification(last.notification.request.content.data);
        await Notifications.clearLastNotificationResponseAsync();
      }
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);
}
