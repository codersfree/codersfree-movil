import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';
import { Button } from './Button';
import { Icon } from './Icon';

/** Tarjeta esqueleto mientras cargan los datos (plantilla "Estados"). */
export function SkeletonCard() {
  return (
    <View style={styles.skeleton} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.skeletonCover} />
      <View style={styles.skeletonLines}>
        <View style={[styles.line, { width: '85%' }]} />
        <View style={[styles.line, styles.lineSoft, { width: '55%' }]} />
        <View style={[styles.line, styles.lineSoft, { width: '30%' }]} />
      </View>
    </View>
  );
}

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

/** Error de conexión con "Reintentar" (plantilla "Estados"). */
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Icon name="error" color={colors.red} size={44} />
      <Text style={styles.errorTitle}>{title.toUpperCase()}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <View style={styles.retry}>
        <Button title="Reintentar" variant="outline" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  skeletonCover: {
    width: sizes.coverThumbWidth,
    height: sizes.coverThumbHeight,
    borderRadius: radii.chip + 2,
    backgroundColor: colors.border,
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm + 2,
    paddingTop: spacing.xs + 2,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  lineSoft: {
    backgroundColor: colors.grid,
  },
  error: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl - 4,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  errorTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.card,
    color: colors.snow,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.xs,
  },
});
