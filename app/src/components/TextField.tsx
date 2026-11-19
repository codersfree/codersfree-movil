import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

/** Campo con etiqueta y el mensaje de error de la API debajo. */
export function TextField({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs + 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
  input: {
    height: sizes.control,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.snow,
    fontFamily: fonts.body,
    fontSize: fontSizes.paragraph,
  },
  inputError: {
    borderColor: colors.red,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.4,
    color: colors.red,
  },
});
