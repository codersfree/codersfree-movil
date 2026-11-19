import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Icon, type IconName } from '@/components/Icon';
import { colors, fonts, fontSizes, sizes } from '@/theme';

type ScreenOptions = NonNullable<ComponentProps<typeof Tabs>['screenOptions']>;

/** Barra de pestañas de las plantillas Alumno e Instructor. */
export function tabScreenOptions(variant: 'tienda' | 'panel', bottomInset: number): ScreenOptions {
  return {
    header: () => <AppHeader variant={variant} />,
    sceneStyle: { backgroundColor: colors.night },
    tabBarActiveTintColor: colors.cyan,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: {
      height: sizes.tabBar + bottomInset,
      paddingBottom: bottomInset,
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    },
    tabBarLabelStyle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSizes.label,
    },
  };
}

export function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} color={color} />;
  };
}
