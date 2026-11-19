import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';
import type { PhotoSource } from './useProfilePhoto';

type Props = {
  visible: boolean;
  onChoose: (source: PhotoSource) => void;
  onClose: () => void;
};

function Option({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
      <Icon name={icon} color={colors.cyan} />
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

/** Hoja "Foto de perfil": tomar foto o elegir de la galería. */
export function PhotoSheet({ visible, onChoose, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]} accessibilityViewIsModal>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            FOTO DE PERFIL
          </Text>
          <Text style={styles.subtitle}>Tómate una foto o elige una de tu galería.</Text>
        </View>
        <Option icon="camera" label="Tomar foto" onPress={() => onChoose('camera')} />
        <Option icon="gallery" label="Elegir de la galería" onPress={() => onChoose('gallery')} />
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    gap: spacing.md,
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
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  header: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.subtitle,
    color: colors.snow,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  option: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  optionPressed: {
    borderColor: colors.cyan,
  },
  optionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.paragraph,
    color: colors.snow,
  },
  cancel: {
    height: sizes.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.paragraph,
    color: colors.textSecondary,
  },
});
