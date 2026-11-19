import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Category } from '@/api/catalog';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/api/client';
import {
  createCourse,
  fetchInstructorCategories,
  fetchInstructorCourse,
  publishCourse,
  updateCourse,
  uploadCourseCover,
  type CourseForm,
  type InstructorCourse,
  type Level,
} from '@/api/instructor';
import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/ChoiceChips';
import { Icon } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorState } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import { TextField } from '@/components/TextField';
import { PermissionDialog } from '@/profile/PermissionDialog';
import { PhotoSheet } from '@/profile/PhotoSheet';
import { useProfilePhoto, type PhotoSource } from '@/profile/useProfilePhoto';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

const NEW = 'nuevo';

const LEVELS: { value: Level; label: string }[] = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

const EMPTY_FORM: CourseForm = { title: '', description: '', category_id: null, level: 'basico', price: '' };

type Field = keyof CourseForm;
type NoticeState = { type: 'success' | 'error'; message: string; toSyllabus?: boolean } | null;

function toForm(course: InstructorCourse): CourseForm {
  return {
    title: course.title,
    description: course.description,
    category_id: course.category_id,
    level: course.level,
    price: course.price,
  };
}

/** H12 · Crear y editar un curso (portada con cámara o galería). H14 · Publicar. */
export default function EditorCursoScreen() {
  const { slug, saved } = useLocalSearchParams<{ slug: string; saved?: string }>();
  const isNew = slug === NEW;
  const [course, setCourse] = useState<InstructorCourse | null>(null);
  const [form, setForm] = useState<CourseForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Field | 'cover', string>>>({});
  const [notice, setNotice] = useState<NoticeState>(saved ? { type: 'success', message: 'Curso creado como borrador.' } : null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const { picked, deniedSource, pick, clearPicked, clearDenied } = useProfilePhoto([16, 9]);
  const formLoaded = useRef(false);

  useEffect(() => {
    fetchInstructorCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Al volver del temario se recargan los conteos de secciones y lecciones.
  useFocusEffect(
    useCallback(() => {
      if (isNew) return;
      let active = true;
      fetchInstructorCourse(slug)
        .then((data) => {
          if (!active) return;
          // El formulario se llena solo la primera vez, para no borrar lo que el instructor está escribiendo.
          if (!formLoaded.current) {
            formLoaded.current = true;
            setForm(toForm(data));
          }
          setCourse(data);
          setLoadError(false);
        })
        .catch(() => active && setLoadError(true));
      return () => {
        active = false;
      };
    }, [slug, isNew]),
  );

  const setField = <K extends Field>(field: K) => (value: CourseForm[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  const choose = (source: PhotoSource) => {
    setSheetVisible(false);
    pick(source);
  };

  const save = async () => {
    setSaving(true);
    setErrors({});
    setNotice(null);
    try {
      const payload = { ...form, title: form.title.trim(), description: form.description.trim(), price: form.price.replace(',', '.') };
      let result = isNew ? await createCourse(payload) : await updateCourse(slug, payload);
      if (picked) {
        result = await uploadCourseCover(result.slug, picked.uri, picked.mimeType);
        clearPicked();
      }
      if (isNew) {
        router.replace({ pathname: '/panel/curso/[slug]', params: { slug: result.slug, saved: '1' } });
        return;
      }
      setCourse(result);
      setNotice({ type: 'success', message: 'Cambios guardados.' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors({
          title: error.field('title'),
          description: error.field('description'),
          category_id: error.field('category_id'),
          level: error.field('level'),
          price: error.field('price'),
          cover: error.field('cover'),
        });
        setNotice({ type: 'error', message: 'Revisa los campos marcados.' });
      } else {
        setNotice({ type: 'error', message: error instanceof ApiError && error.status !== 0 ? error.message : NETWORK_ERROR_MESSAGE });
      }
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setNotice(null);
    try {
      setCourse(await publishCourse(slug));
      setNotice({ type: 'success', message: 'Curso publicado. Ya aparece en el catálogo y avisamos a los alumnos.' });
    } catch (error) {
      const noLessons = error instanceof ApiError && error.status === 422;
      setNotice({
        type: 'error',
        message: error instanceof ApiError && error.status !== 0 ? error.message : NETWORK_ERROR_MESSAGE,
        toSyllabus: noLessons,
      });
    } finally {
      setPublishing(false);
    }
  };

  const openSyllabus = () => router.push({ pathname: '/panel/temario/[slug]', params: { slug } });

  if (!isNew && !course) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader title="Editar curso" />
        <View style={styles.center}>
          {loadError ? (
            <ErrorState title="No pudimos cargar el curso" message="Revisa tu conexión e inténtalo otra vez." onRetry={() => router.replace({ pathname: '/panel/curso/[slug]', params: { slug } })} />
          ) : (
            <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando el curso" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const coverUri = picked?.uri ?? course?.cover_url ?? null;
  const lessons = course?.lessons_count ?? 0;
  const sections = course?.sections_count ?? 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        title={isNew ? 'Nuevo curso' : 'Editar curso'}
        right={course ? <StatusBadge status={course.status} /> : undefined}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {notice ? (
          <View style={styles.noticeBox}>
            <Notice type={notice.type} message={notice.message} />
            {notice.toSyllabus ? (
              <Pressable accessibilityRole="link" onPress={openSyllabus} style={styles.inlineLink}>
                <Text style={styles.inlineLinkText}>Ir al temario</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.coverField}>
          <Text style={styles.label}>Portada</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={coverUri ? 'Cambiar portada' : 'Agregar portada'}
            onPress={() => setSheetVisible(true)}
            style={[styles.cover, errors.cover ? styles.coverError : null]}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <View style={styles.coverEmpty}>
                <Icon name="camera" color={colors.cyan} />
                <Text style={styles.coverText}>Tomar foto o elegir de la galería</Text>
              </View>
            )}
          </Pressable>
          {errors.cover ? <Text style={styles.error}>{errors.cover}</Text> : null}
        </View>

        <TextField label="Título" value={form.title} onChangeText={setField('title')} error={errors.title} placeholder="Ej.: Docker para desarrolladores" />
        <TextField
          label="Descripción"
          value={form.description}
          onChangeText={setField('description')}
          error={errors.description}
          multiline
          numberOfLines={4}
          style={styles.textarea}
          placeholder="¿Qué aprenderá el alumno?"
        />
        <ChoiceChips
          label="Categoría"
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          value={form.category_id}
          onChange={setField('category_id')}
          error={errors.category_id}
        />
        <ChoiceChips label="Nivel" options={LEVELS} value={form.level} onChange={setField('level')} error={errors.level} />
        <TextField
          label="Precio (S/)"
          value={form.price}
          onChangeText={setField('price')}
          error={errors.price}
          keyboardType="decimal-pad"
          placeholder="59.90"
        />

        {!isNew ? (
          <Pressable accessibilityRole="link" onPress={openSyllabus} style={({ pressed }) => [styles.syllabus, pressed && styles.syllabusPressed]}>
            <View style={styles.syllabusText}>
              <Text style={styles.syllabusTitle}>Temario</Text>
              <Text style={styles.syllabusMeta}>
                {sections} {sections === 1 ? 'sección' : 'secciones'} · {lessons} {lessons === 1 ? 'lección' : 'lecciones'}
              </Text>
            </View>
            <Icon name="forward" color={colors.cyan} size={20} />
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.bar}>
        {isNew ? (
          <View style={styles.barButton}>
            <Button title="Crear borrador" onPress={save} loading={saving} />
          </View>
        ) : (
          <>
            <View style={styles.barButton}>
              {course?.status === 'published' ? (
                <Button
                  title="Ver en la tienda"
                  variant="outline"
                  onPress={() => router.push({ pathname: '/curso/[slug]', params: { slug } })}
                />
              ) : (
                <Button title="Publicar" variant="success" onPress={publish} loading={publishing} disabled={saving} />
              )}
            </View>
            <View style={styles.barButton}>
              <Button title="Guardar" onPress={save} loading={saving} disabled={publishing} />
            </View>
          </>
        )}
      </View>

      <PhotoSheet
        visible={sheetVisible}
        onChoose={choose}
        onClose={() => setSheetVisible(false)}
        title="Portada del curso"
        subtitle="Toma una foto o elige una imagen de tu galería."
      />
      <PermissionDialog source={deniedSource} onClose={clearDenied} purpose="portada" />
    </SafeAreaView>
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
    gap: spacing.lg,
    padding: spacing.screen,
  },
  noticeBox: {
    gap: spacing.xs,
  },
  inlineLink: {
    alignSelf: 'flex-start',
    minHeight: sizes.touch - 4,
    justifyContent: 'center',
  },
  inlineLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.cyan,
  },
  coverField: {
    gap: spacing.xs + 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
  cover: {
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceRaised,
  },
  coverError: {
    borderColor: colors.red,
  },
  coverEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  coverText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.chip,
    color: colors.textSecondary,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.red,
  },
  textarea: {
    height: sizes.textarea,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  syllabus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.control,
    backgroundColor: colors.surface,
  },
  syllabusPressed: {
    borderColor: colors.cyan,
  },
  syllabusText: {
    flex: 1,
    gap: 2,
  },
  syllabusTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  syllabusMeta: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  barButton: {
    flex: 1,
  },
});
