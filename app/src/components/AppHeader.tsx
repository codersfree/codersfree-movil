import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, fontSizes, letterSpacing, radii, sizes, spacing } from '@/theme';
import { Icon } from './Icon';

type Props = {
  variant?: 'tienda' | 'panel';
};

/** Vuelve a la tienda desde el panel instructor. */
function goToStore() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

/** Barra superior: tienda (logo horizontal) o panel instructor (robot, PANEL INSTRUCTOR y botón Tienda). */
export function AppHeader({ variant = 'tienda' }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        variant === 'panel' && styles.panelHeader,
        { paddingTop: insets.top, height: sizes.header + insets.top },
      ]}>
      {variant === 'tienda' ? (
        <>
          <Image
            source={require('@/assets/images/logo-horizontal.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Coders Free"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Notificaciones" style={styles.action}>
            <Icon name="bell" />
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.panelBrand}>
            <Image source={require('@/assets/images/logo-robot.png')} style={styles.robot} accessibilityLabel="Coders Free" />
            <View style={styles.panelChip}>
              <Text style={styles.panelChipText}>INSTRUCTOR</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a la tienda"
            onPress={goToStore}
            style={styles.storeButton}>
            <Icon name="home" size={22} />
            <Text style={styles.storeText}>Tienda</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.night,
  },
  panelHeader: {
    backgroundColor: colors.surface,
  },
  logo: {
    width: 121,
    height: 32,
  },
  action: {
    width: sizes.touch,
    height: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  robot: {
    width: 36,
    height: 36,
  },
  panelChip: {
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radii.chip - 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  panelChipText: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
    color: colors.orange,
  },
  storeButton: {
    height: sizes.touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
  },
  storeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
});
