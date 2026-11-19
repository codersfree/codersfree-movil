import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';
import type { PickedPhoto } from './useProfilePhoto';

type Props = {
  photo: PickedPhoto | null;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onChooseAnother: () => void;
  onClose: () => void;
};

/** Vista previa de la foto antes de subirla a la API. */
export function PhotoPreview({ photo, saving, error, onSave, onChooseAnother, onClose }: Props) {
  return (
    <Modal visible={photo !== null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onClose} style={styles.back}>
            <Icon name="back" />
          </Pressable>
          <Text style={styles.headerTitle}>Vista previa</Text>
        </View>
        <View style={styles.content}>
          {photo ? (
            <Image
              source={{ uri: photo.uri }}
              style={styles.photo}
              contentFit="cover"
              accessibilityLabel="Foto elegida, recortada en círculo"
            />
          ) : null}
          <View style={styles.texts}>
            <Text style={styles.title}>¿USAR ESTA FOTO?</Text>
            <Text style={styles.subtitle}>Así se verá en tu perfil.</Text>
          </View>
          {error ? <Notice type="error" message={error} /> : null}
          <View style={styles.actions}>
            <Button title="Guardar foto" onPress={onSave} loading={saving} />
            <Button title="Elegir otra" variant="outline" onPress={onChooseAnother} disabled={saving} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  header: {
    height: sizes.header,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: sizes.touch,
    height: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.card,
    color: colors.snow,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xl - 4,
    paddingTop: spacing.xxl + spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  photo: {
    width: sizes.preview,
    height: sizes.preview,
    borderRadius: radii.round,
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  texts: {
    alignItems: 'center',
    gap: spacing.xs + 2,
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
  actions: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
