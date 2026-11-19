import { Linking, Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { colors, fonts, fontSizes, radii, spacing } from '@/theme';
import type { PhotoSource } from './useProfilePhoto';

type Props = {
  source: PhotoSource | null;
  onClose: () => void;
};

const COPY: Record<PhotoSource, { title: string; message: string }> = {
  camera: {
    title: 'Sin acceso a la cámara',
    message:
      'Para tomarte la foto de perfil, Coders Free necesita usar tu cámara. Negaste el permiso; puedes activarlo en los ajustes del celular.',
  },
  gallery: {
    title: 'Sin acceso a la galería',
    message:
      'Para elegir tu foto de perfil, Coders Free necesita ver tus fotos. Negaste el permiso; puedes activarlo en los ajustes del celular.',
  },
};

/** Explica por qué hace falta el permiso negado y ofrece abrir los ajustes. */
export function PermissionDialog({ source, onClose }: Props) {
  const copy = source ? COPY[source] : null;

  const openSettings = () => {
    onClose();
    Linking.openSettings();
  };

  return (
    <Modal visible={source !== null} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        {copy ? (
          <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
            <View style={styles.iconCircle}>
              <Icon name="cameraOff" color={colors.orange} size={30} />
            </View>
            <Text style={styles.title} accessibilityRole="header">
              {copy.title.toUpperCase()}
            </Text>
            <Text style={styles.message}>{copy.message}</Text>
            <View style={styles.actions}>
              <Button title="Abrir ajustes" onPress={openSettings} />
              <Button title="Ahora no" variant="ghost" onPress={onClose} />
            </View>
          </View>
        ) : null}
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
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl - 4,
    paddingBottom: spacing.xl - 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.card + 4,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.orange,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.subtitle,
    color: colors.snow,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
  },
});
