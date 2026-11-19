import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { PERMISSIONS } from '@/auth/permissions';
import { usePushNotifications } from '@/notifications/push';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator fontsLoaded={fontsLoaded} />
    </AuthProvider>
  );
}

/** La tienda es para todos; el panel instructor solo con su permiso; login y registro solo sin sesión. */
function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { user, isLoading, can } = useAuth();
  const ready = fontsLoaded && !isLoading;

  // H15 · Con sesión iniciada se pide el permiso de notificaciones y se registra el celular.
  usePushNotifications(ready && user ? user.id : null);

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.night } }}>
      <Stack.Screen name="(alumno)" />
      <Stack.Screen name="curso/[slug]" />

      <Stack.Protected guard={!!user}>
        <Stack.Screen name="compra/[slug]" />
        <Stack.Screen name="compra/pago" options={{ gestureEnabled: false }} />
        <Stack.Screen name="compra/resultado" options={{ gestureEnabled: false }} />
        <Stack.Screen name="aprender/[slug]/index" />
        <Stack.Screen name="aprender/[slug]/[lessonId]" />
      </Stack.Protected>

      <Stack.Protected guard={can(PERMISSIONS.instructorPanel)}>
        <Stack.Screen name="instructor" />
        <Stack.Screen name="panel/curso/[slug]" />
        <Stack.Screen name="panel/temario/[slug]" />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
    </Stack>
  );
}
