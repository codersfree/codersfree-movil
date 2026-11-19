import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, fontSizes, letterSpacing, radii, sizes, spacing } from '@/theme';

type Props = {
  uri: string | null;
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** Portada del curso; sin imagen, un marcador con el robot y la categoría. */
export function CourseCover({ uri, label, style }: Props) {
  if (uri) {
    return (
      <View style={[styles.box, style]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
      </View>
    );
  }

  return (
    <View style={[styles.box, styles.placeholder, style]}>
      <Image source={require('@/assets/images/logo-robot.png')} style={styles.robot} />
      <Text style={styles.label} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
    borderRadius: radii.chip + 2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  robot: {
    width: sizes.robotSmall,
    height: sizes.robotSmall,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.tiny,
    letterSpacing: letterSpacing.tight,
    color: colors.textMuted,
  },
});
