import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, NETWORK_ERROR_MESSAGE } from '@/api/client';
import {
  createLesson,
  createSection,
  deleteLesson,
  deleteSection,
  fetchInstructorCourse,
  updateLesson,
  updateSection,
  type InstructorCourse,
  type InstructorLesson,
  type InstructorSection,
} from '@/api/instructor';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormSheet } from '@/components/FormSheet';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorState } from '@/components/States';
import { TextField } from '@/components/TextField';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Editing =
  | { kind: 'section'; section?: InstructorSection }
  | { kind: 'lesson'; section: InstructorSection; lesson?: InstructorLesson }
  | null;

type Deleting = { kind: 'section'; section: InstructorSection } | { kind: 'lesson'; lesson: InstructorLesson } | null;

/** H13 · Temario del curso: agregar, editar y eliminar secciones y lecciones. */
export default function TemarioEditorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [course, setCourse] = useState<InstructorCourse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<Editing>(null);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; video_url?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Deleting>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchInstructorCourse(slug)
      .then((data) => active && setCourse(data))
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, [slug, attempt]);

  const openForm = (next: NonNullable<Editing>) => {
    setEditing(next);
    setTitle(next.kind === 'section' ? (next.section?.title ?? '') : (next.lesson?.title ?? ''));
    setVideoUrl(next.kind === 'lesson' ? (next.lesson?.video_url ?? '') : '');
    setFieldErrors({});
    setFormError(null);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const updated =
        editing.kind === 'section'
          ? editing.section
            ? await updateSection(editing.section.id, title.trim())
            : await createSection(slug, title.trim())
          : editing.lesson
            ? await updateLesson(editing.lesson.id, { title: title.trim(), video_url: videoUrl.trim() })
            : await createLesson(editing.section.id, { title: title.trim(), video_url: videoUrl.trim() });
      setCourse(updated);
      setEditing(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setFieldErrors({ title: error.field('title'), video_url: error.field('video_url') });
      } else {
        setFormError(error instanceof ApiError && error.status !== 0 ? error.message : NETWORK_ERROR_MESSAGE);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      setCourse(deleting.kind === 'section' ? await deleteSection(deleting.section.id) : await deleteLesson(deleting.lesson.id));
      setDeleting(null);
    } catch {
      setDeleting(null);
      setFormError(NETWORK_ERROR_MESSAGE);
    } finally {
      setRemoving(false);
    }
  };

  if (!course) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader title="Temario" />
        <View style={styles.center}>
          {loadError ? (
            <ErrorState
              title="No pudimos cargar el temario"
              message="Revisa tu conexión e inténtalo otra vez."
              onRetry={() => {
                setLoadError(false);
                setAttempt((value) => value + 1);
              }}
            />
          ) : (
            <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando el temario" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const sections = course.sections ?? [];
  const sheetTitle =
    editing?.kind === 'section'
      ? editing.section
        ? 'Editar sección'
        : 'Nueva sección'
      : editing?.kind === 'lesson'
        ? editing.lesson
          ? 'Editar lección'
          : 'Nueva lección'
        : '';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="Temario" subtitle={course.title} />
      <FlatList
        data={sections}
        keyExtractor={(section) => String(section.id)}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no hay secciones. Agrega la primera para organizar las lecciones.</Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {index + 1} · {item.title}
              </Text>
              <IconButton icon="pencil" label={`Editar sección ${item.title}`} onPress={() => openForm({ kind: 'section', section: item })} />
              <IconButton icon="trash" danger label={`Eliminar sección ${item.title}`} onPress={() => setDeleting({ kind: 'section', section: item })} />
            </View>
            {item.lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lesson}>
                <Icon name="play" color={colors.cyan} size={16} />
                <View style={styles.lessonText}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonUrl} numberOfLines={1}>
                    {lesson.video_url}
                  </Text>
                </View>
                <IconButton icon="pencil" label={`Editar lección ${lesson.title}`} onPress={() => openForm({ kind: 'lesson', section: item, lesson })} />
                <IconButton icon="trash" danger label={`Eliminar lección ${lesson.title}`} onPress={() => setDeleting({ kind: 'lesson', lesson })} />
              </View>
            ))}
            <Pressable accessibilityRole="button" onPress={() => openForm({ kind: 'lesson', section: item })} style={styles.addLesson}>
              <Icon name="plus" color={colors.cyan} size={18} />
              <Text style={styles.addLessonText}>Agregar lección</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Agregar sección" variant="outline" onPress={() => openForm({ kind: 'section' })} icon={<Icon name="plus" size={18} />} />
          </View>
        }
      />

      <FormSheet
        visible={editing !== null}
        title={sheetTitle}
        subtitle={editing?.kind === 'lesson' ? `En la sección ${editing.section.title}` : undefined}
        error={formError}
        saving={saving}
        onSave={save}
        onClose={() => setEditing(null)}>
        <TextField label="Título" value={title} onChangeText={setTitle} error={fieldErrors.title} />
        {editing?.kind === 'lesson' ? (
          <TextField
            label="URL del video"
            value={videoUrl}
            onChangeText={setVideoUrl}
            error={fieldErrors.video_url}
            placeholder="https://…"
            autoCapitalize="none"
            keyboardType="url"
          />
        ) : null}
      </FormSheet>

      <ConfirmDialog
        visible={deleting !== null}
        title={deleting?.kind === 'section' ? 'Eliminar sección' : 'Eliminar lección'}
        message={
          deleting?.kind === 'section'
            ? `Se eliminará "${deleting.section.title}" con todas sus lecciones. No se puede deshacer.`
            : `Se eliminará "${deleting?.kind === 'lesson' ? deleting.lesson.title : ''}". No se puede deshacer.`
        }
        confirmLabel="Eliminar"
        loading={removing}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function IconButton({ icon, label, onPress, danger = false }: { icon: 'pencil' | 'trash'; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Icon name={icon} color={danger ? colors.red : colors.textSecondary} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },
  content: {
    padding: spacing.screen,
  },
  separator: {
    height: spacing.md + 2,
  },
  empty: {
    paddingVertical: spacing.lg,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
    color: colors.textSecondary,
  },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingLeft: spacing.md + 2,
    paddingRight: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md + 2,
    paddingRight: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lessonText: {
    flex: 1,
    gap: 2,
    paddingLeft: spacing.sm,
  },
  lessonTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
  lessonUrl: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.tiny + 1,
    color: colors.textMuted,
  },
  iconButton: {
    width: sizes.touch - 4,
    height: sizes.touch - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLesson: {
    minHeight: sizes.touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md + 2,
  },
  addLessonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.chip,
    color: colors.cyan,
  },
  footer: {
    marginTop: spacing.lg,
  },
});
