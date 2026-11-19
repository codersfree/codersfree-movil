import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';
import { Button } from './Button';
import { Notice } from './Notice';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  error?: string | null;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
};

/** Hoja inferior con un formulario corto (sección o lección del temario). */
export function FormSheet({ visible, title, subtitle, error, saving, onSave, onClose, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {title.toUpperCase()}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {error ? <Notice type="error" message={error} /> : null}
          {children}
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button title="Cancelar" variant="outline" onPress={onClose} disabled={saving} />
            </View>
            <View style={styles.action}>
              <Button title="Guardar" onPress={onSave} loading={saving} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    gap: spacing.md + 2,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screen,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    backgroundColor: colors.surface,
  },
  handle: {
    alignSelf: 'center',
    width: spacing.xxl + spacing.sm,
    height: spacing.xs,
    borderRadius: radii.round,
    backgroundColor: colors.borderStrong,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.subtitle,
    color: colors.snow,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  action: {
    flex: 1,
  },
});
