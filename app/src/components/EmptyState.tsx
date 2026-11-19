import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';

type Props = {
  title: string;
  message: string;
};

/** Estado "lista vacía" de la plantilla "Estados". */
export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.box}>
      <Image source={require('@/assets/images/logo-robot.png')} style={styles.robot} accessibilityIgnoresInvertColors />
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.xl - 4,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radii.card,
  },
  robot: {
    width: 56,
    height: 56,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.card,
    color: colors.snow,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
