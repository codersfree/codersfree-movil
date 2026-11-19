import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { uploadProfilePhoto } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { PERMISSIONS } from '@/auth/permissions';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { Eyebrow, Title } from '@/components/Typography';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';
import { PermissionDialog } from './PermissionDialog';
import { PhotoPreview } from './PhotoPreview';
import { PhotoSheet } from './PhotoSheet';
import { useProfilePhoto, type PhotoSource } from './useProfilePhoto';

const memberSince = new Intl.DateTimeFormat('es-PE', { month: 'short', year: 'numeric' });

/** Perfil (H03): foto con cámara o galería, iniciales sin foto y cerrar sesión (H02). */
export function ProfileScreen() {
  const { user, can, signOut, updateUser } = useAuth();
  const { picked, deniedSource, pick, clearPicked, clearDenied } = useProfilePhoto();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) {
    return null;
  }

  const choose = (source: PhotoSource) => {
    setSheetVisible(false);
    setSaved(false);
    pick(source);
  };

  const closePreview = () => {
    clearPicked();
    setUploadError(null);
  };

  const chooseAnother = () => {
    closePreview();
    setSheetVisible(true);
  };

  const savePhoto = async () => {
    if (!picked) {
      return;
    }
    setSaving(true);
    setUploadError(null);
    try {
      const updated = await uploadProfilePhoto(picked.uri, picked.mimeType);
      await updateUser(updated);
      clearPicked();
      setSaved(true);
    } catch (error) {
      setUploadError(
        error instanceof ApiError
          ? (error.field('photo') ?? error.message)
          : 'No pudimos guardar la foto. Inténtalo otra vez.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } finally {
      // La pantalla sigue montada en su pestaña; si no se reinicia, el botón queda cargando al volver a entrar.
      setSigningOut(false);
      setSaved(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Eyebrow>Tu cuenta</Eyebrow>
          <Title>Mi perfil</Title>
        </View>

        {saved ? <Notice type="success" message="Foto de perfil actualizada." /> : null}

        <View style={styles.identity}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
            onPress={() => setSheetVisible(true)}>
            <Avatar name={user.name} uri={user.photo_url} />
            <View style={styles.badge}>
              <Icon name="camera" color={colors.night} size={18} />
            </View>
          </Pressable>
          <View style={styles.identityText}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setSheetVisible(true)} style={styles.link}>
            <Text style={styles.linkText}>{user.photo_url ? 'Cambiar foto' : 'Agregar foto'}</Text>
          </Pressable>
        </View>

        {can(PERMISSIONS.instructorPanel) ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Panel instructor. Crea, edita y publica tus cursos."
            onPress={() => router.push('/instructor')}
            style={({ pressed }) => [styles.panelLink, pressed && styles.panelLinkPressed]}>
            <View style={styles.panelIcon}>
              <Image source={require('@/assets/images/logo-robot.png')} style={styles.panelRobot} />
            </View>
            <View style={styles.panelText}>
              <Text style={styles.panelTitle}>Panel instructor</Text>
              <Text style={styles.panelSubtitle}>Crea, edita y publica tus cursos.</Text>
            </View>
            <Icon name="forward" color={colors.orange} size={22} />
          </Pressable>
        ) : null}

        {user.created_at ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Miembro desde</Text>
            <Text style={styles.cardValue}>{memberSince.format(new Date(user.created_at))}</Text>
          </View>
        ) : null}

        <View style={styles.signOut}>
          <Button
            title="Cerrar sesión"
            variant="danger"
            onPress={handleSignOut}
            loading={signingOut}
            icon={<Icon name="logout" color={colors.red} size={20} />}
          />
        </View>
      </ScrollView>

      <PhotoSheet visible={sheetVisible} onChoose={choose} onClose={() => setSheetVisible(false)} />
      <PermissionDialog source={deniedSource} onClose={clearDenied} />
      <PhotoPreview
        photo={picked}
        saving={saving}
        error={uploadError}
        onSave={savePhoto}
        onChooseAnother={chooseAnother}
        onClose={closePreview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.xl,
  },
  heading: {
    gap: spacing.xs + 2,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.md + 2,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: sizes.avatarBadge,
    height: sizes.avatarBadge,
    borderRadius: radii.round,
    borderWidth: 3,
    borderColor: colors.night,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  name: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.subtitle,
    color: colors.snow,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  panelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceRaised,
  },
  panelLinkPressed: {
    opacity: 0.8,
  },
  panelIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelRobot: {
    width: 30,
    height: 30,
  },
  panelText: {
    flex: 1,
    gap: 2,
  },
  panelTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.paragraph,
    color: colors.snow,
  },
  panelSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  link: {
    minHeight: sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  linkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.cyan,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  cardLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  cardValue: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  signOut: {
    marginTop: 'auto',
  },
});
