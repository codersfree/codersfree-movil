import { memo } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

import type { Category } from '@/api/catalog';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Props = {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

const ALL = { id: 0, name: 'Todos', slug: '' } satisfies Category;

/** Categorías en chips deslizables; "Todos" primero. */
function CategoryChipsBase({ categories, selected, onSelect }: Props) {
  return (
    <FlatList
      horizontal
      data={[ALL, ...categories]}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      accessibilityRole="tablist"
      renderItem={({ item }) => {
        const active = (item.slug || null) === selected;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.slug || null)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.text, active && styles.textActive]}>{item.name}</Text>
          </Pressable>
        );
      }}
    />
  );
}

export const CategoryChips = memo(CategoryChipsBase);

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
  },
  chip: {
    height: sizes.chip,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.round,
  },
  chipActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
  textActive: {
    fontFamily: fonts.bodySemiBold,
    color: colors.night,
  },
});
