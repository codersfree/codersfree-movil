import { StyleSheet, Text, View, type TextProps } from 'react-native';

import { colors, fonts, fontSizes, letterSpacing, radii, spacing } from '@/theme';

/** Título en mayúsculas con el cursor naranja de la marca. */
export function Title({ children }: { children: string }) {
  return (
    <Text style={styles.title} accessibilityRole="header">
      {children.toUpperCase()}
      <Text style={styles.cursor}> ▮</Text>
    </Text>
  );
}

/** Etiqueta pequeña en mono, naranja (sobre contenido) o cian con borde (chip). */
export function Eyebrow({ children, variant = 'plain' }: { children: string; variant?: 'plain' | 'chip' }) {
  if (variant === 'chip') {
    return (
      <View style={styles.chip}>
        <Text style={styles.chipText}>{children.toUpperCase()}</Text>
      </View>
    );
  }
  return <Text style={styles.eyebrow}>{children.toUpperCase()}</Text>;
}

export function Paragraph({ style, ...props }: TextProps) {
  return <Text style={[styles.paragraph, style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.title,
    lineHeight: fontSizes.title * 1.15,
    color: colors.snow,
  },
  cursor: {
    color: colors.orange,
  },
  eyebrow: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
    color: colors.orange,
  },
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.cyan,
    borderRadius: radii.chip - 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
    color: colors.cyan,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSizes.paragraph,
    lineHeight: fontSizes.paragraph * 1.5,
    color: colors.textSecondary,
  },
});
