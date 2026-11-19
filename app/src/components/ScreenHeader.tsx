import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, sizes, spacing } from '@/theme';
import { Icon } from './Icon';

type Props = {
  title: string;
  subtitle?: ReactNode;
  icon?: 'back' | 'close';
  onBack?: () => void;
};

/** Barra superior de pantallas apiladas: volver (o cerrar) y título. */
export function ScreenHeader({ title, subtitle, icon = 'back', onBack }: Props) {
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={icon === 'close' ? 'Cerrar' : 'Volver'}
        onPress={goBack}
        style={styles.back}>
        <Icon name={icon} size={icon === 'close' ? 22 : 24} />
      </Pressable>
      <View style={styles.texts}>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: sizes.header,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.night,
  },
  back: {
    width: sizes.touch,
    height: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.card,
    color: colors.snow,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    color: colors.textMuted,
  },
});
