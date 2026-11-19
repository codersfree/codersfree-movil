import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Variant = 'primary' | 'accent' | 'outline' | 'success' | 'danger' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

const textColor: Record<Variant, string> = {
  primary: colors.night,
  accent: colors.night,
  outline: colors.snow,
  success: colors.green,
  danger: colors.red,
  ghost: colors.textSecondary,
};

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, icon }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (pressed || isDisabled) && styles.dimmed,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: textColor[variant] }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.control,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.orange,
  },
  accent: {
    backgroundColor: colors.cyan,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  success: {
    borderWidth: 1,
    borderColor: colors.green,
  },
  danger: {
    borderWidth: 1,
    borderColor: colors.red,
  },
  ghost: {},
  dimmed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.paragraph,
  },
});
