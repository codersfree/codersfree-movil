import { router, Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { tabIcon, tabScreenOptions } from '@/navigation/tabOptions';

/** Plantilla Alumno. El visitante ve lo mismo; Mis cursos y Perfil lo llevan a iniciar sesión. */
export default function AlumnoLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // El navegador de pestañas guarda los listeners del primer render; la ref siempre tiene la sesión actual.
  const hasSession = useRef(user !== null);
  useEffect(() => {
    hasSession.current = user !== null;
  }, [user]);

  const requireSession = {
    tabPress: (event: { preventDefault: () => void }) => {
      if (!hasSession.current) {
        event.preventDefault();
        router.push('/login');
      }
    },
  };

  return (
    <Tabs screenOptions={tabScreenOptions('tienda', insets.bottom)}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen
        name="mis-cursos"
        options={{ title: 'Mis cursos', tabBarIcon: tabIcon('book') }}
        listeners={requireSession}
      />
      <Tabs.Screen name="deseos" options={{ title: 'Deseos', tabBarIcon: tabIcon('heart') }} />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }}
        listeners={requireSession}
      />
    </Tabs>
  );
}
