import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Option<T> = { value: T; label: string };

type Props<T> = {
  label: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
};

/** Elección única en chips (categoría, nivel) con su error debajo. */
export function ChoiceChips<T extends string | number>({ label, options, value, onChange, error }: Props<T>) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipSelected, error && !selected ? styles.chipError : null]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: sizes.chip,
    justifyContent: 'center',
    paddingHorizontal: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.round,
  },
  chipSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan,
  },
  chipError: {
    borderColor: colors.red,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
  chipTextSelected: {
    fontFamily: fonts.bodySemiBold,
    color: colors.night,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.red,
  },
});
