import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabIcon, tabScreenOptions } from '@/navigation/tabOptions';

/** Panel instructor (solo con permiso): Cursos y Ventas. Tienda vuelve a la tienda. */
export default function InstructorLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={tabScreenOptions('panel', insets.bottom)}>
      <Tabs.Screen name="index" options={{ title: 'Cursos', tabBarIcon: tabIcon('courses') }} />
      <Tabs.Screen name="ventas" options={{ title: 'Ventas', tabBarIcon: tabIcon('sales') }} />
    </Tabs>
  );
}
