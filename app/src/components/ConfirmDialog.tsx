import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmación antes de una acción que no se puede deshacer (por ejemplo, eliminar). */
export function ConfirmDialog({ visible, title, message, confirmLabel, loading = false, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.title} accessibilityRole="header">
            {title.toUpperCase()}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button title={confirmLabel} variant="danger" onPress={onConfirm} loading={loading} />
            <Button title="Cancelar" variant="ghost" onPress={onCancel} disabled={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    backgroundColor: colors.overlay,
  },
  dialog: {
    gap: spacing.md,
    padding: spacing.xl - 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.card + 4,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.card,
    color: colors.snow,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
