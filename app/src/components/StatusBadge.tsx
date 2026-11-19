import { StyleSheet, Text } from 'react-native';

import { colors, fonts, fontSizes, letterSpacing, radii, spacing } from '@/theme';

/** Estado de un curso del instructor: BORRADOR (naranja) o PUBLICADO (verde). */
export function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  const published = status === 'published';
  const color = published ? colors.green : colors.orange;

  return <Text style={[styles.badge, { color, borderColor: color }]}>{published ? 'PUBLICADO' : 'BORRADOR'}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.tiny + 1,
    letterSpacing: letterSpacing.tight,
    borderWidth: 1,
    borderRadius: radii.chip - 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
  },
});
