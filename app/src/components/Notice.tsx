import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';
import { Icon } from './Icon';

type Props = {
  type: 'success' | 'error';
  message: string;
};

/** Aviso de éxito o error (plantilla "Estados"). */
export function Notice({ type, message }: Props) {
  const color = type === 'success' ? colors.green : colors.red;

  return (
    <View
      accessibilityRole={type === 'error' ? 'alert' : 'summary'}
      style={[styles.notice, { borderColor: color }]}>
      <Icon name={type === 'success' ? 'check' : 'error'} color={color} size={22} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceRaised,
  },
  text: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.4,
    color: colors.snow,
  },
});
