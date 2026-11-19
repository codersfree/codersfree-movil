import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';

type Props = {
  progress: number;
  showLabel?: boolean;
  thick?: boolean;
};

/** Barra de avance del curso (0 a 100). Completo, se pinta de verde. */
export function ProgressBar({ progress, showLabel = true, thick = false }: Props) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  const fill = value === 100 ? colors.green : colors.cyan;

  return (
    <View style={styles.row}>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Avance del curso"
        accessibilityValue={{ min: 0, max: 100, now: value }}
        style={[styles.track, thick && styles.thick]}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: fill }]} />
      </View>
      {showLabel ? <Text style={[styles.label, { color: fill }]}>{value}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  track: {
    flex: 1,
    height: spacing.sm,
    borderRadius: radii.round,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  thick: {
    height: spacing.sm + 2,
  },
  fill: {
    height: '100%',
    borderRadius: radii.round,
  },
  label: {
    minWidth: spacing.xxl + spacing.sm,
    textAlign: 'right',
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.small,
  },
});
