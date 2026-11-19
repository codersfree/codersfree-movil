import { useVideoPlayer, VideoView } from 'expo-video';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setLessonCompleted } from '@/api/learning';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { ProgressBar } from '@/components/ProgressBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorState } from '@/components/States';
import { useLandscapeFullscreen } from '@/learning/useLandscapeFullscreen';
import { flattenLessons, useMyCourse } from '@/learning/useMyCourse';
import { colors, fonts, fontSizes, letterSpacing, radii, sizes, spacing } from '@/theme';

/** H09 · Lección: video, marcar como vista y lección anterior / siguiente. H10 · pantalla completa al girar. */
export default function LeccionScreen() {
  const { slug, lessonId } = useLocalSearchParams<{ slug: string; lessonId: string }>();
  const { course, setCourse, error, retry } = useMyCourse(slug);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { fullscreen, sensor, enter, exit } = useLandscapeFullscreen();

  const lessons = useMemo(() => (course ? flattenLessons(course) : []), [course]);
  const index = lessons.findIndex((lesson) => String(lesson.id) === lessonId);
  const lesson = index >= 0 ? lessons[index] : null;
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;

  const goTo = (id: number) =>
    router.replace({ pathname: '/aprender/[slug]/[lessonId]', params: { slug, lessonId: String(id) } });

  const toggleCompleted = async () => {
    if (!course || !lesson) return;
    const completed = !lesson.completed;
    setSaving(true);
    setNotice(null);
    try {
      const progress = await setLessonCompleted(lesson.id, completed);
      setCourse({
        ...course,
        progress: progress.progress,
        completed_lessons_count: progress.completed_lessons_count,
        sections: course.sections.map((section) => ({
          ...section,
          lessons: section.lessons.map((item) => (item.id === lesson.id ? { ...item, completed } : item)),
        })),
      });
      setNotice(
        completed
          ? { type: 'success', message: `Lección vista. Tu avance subió a ${progress.progress}%.` }
          : { type: 'success', message: `Lección desmarcada. Tu avance es ${progress.progress}%.` },
      );
    } catch {
      setNotice({ type: 'error', message: 'No pudimos guardar tu avance. Inténtalo otra vez.' });
    } finally {
      setSaving(false);
    }
  };

  if (!course || !lesson) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader title="Lección" />
        <View style={styles.center}>
          {error || (course && !lesson) ? (
            <ErrorState title="No pudimos cargar la lección" message="Revisa tu conexión e inténtalo otra vez." onRetry={retry} />
          ) : (
            <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando la lección" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (fullscreen) {
    return (
      <View style={styles.fullscreen}>
        <StatusBar hidden />
        <LessonVideo key={lesson.id} uri={lesson.video_url} style={StyleSheet.absoluteFill} />
        <Pressable accessibilityRole="button" accessibilityLabel="Salir de pantalla completa" onPress={exit} style={styles.exitFullscreen}>
          <Icon name="close" size={22} />
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        title={course.title}
        subtitle={`Lección ${index + 1} de ${lessons.length}`}
        onBack={() => router.back()}
      />
      <View style={styles.videoBox}>
        <LessonVideo key={lesson.id} uri={lesson.video_url} style={styles.video} />
        <Pressable accessibilityRole="button" accessibilityLabel="Ver en pantalla completa" onPress={enter} style={styles.fullscreenButton}>
          <Text style={styles.fullscreenHint}>
            {sensor === 'active' ? 'Gira para pantalla completa' : 'Pantalla completa'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>
          SECCIÓN {lesson.sectionIndex + 1} · {lesson.sectionTitle.toUpperCase()}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {lesson.title}
        </Text>
        <ProgressBar progress={course.progress} />

        {sensor === 'denied' || sensor === 'unavailable' ? (
          <Text style={styles.sensorNote}>
            {sensor === 'denied'
              ? 'Sin permiso para el sensor de movimiento: usa el botón Pantalla completa del video.'
              : 'Tu celular no tiene acelerómetro: usa el botón Pantalla completa del video.'}
          </Text>
        ) : null}

        {notice ? <Notice type={notice.type} message={notice.message} /> : null}

        {lesson.completed ? (
          <Button
            title="Vista · desmarcar"
            variant="success"
            onPress={toggleCompleted}
            loading={saving}
            icon={<Icon name="check" color={colors.green} size={20} />}
          />
        ) : (
          <Button
            title="Marcar como vista"
            onPress={toggleCompleted}
            loading={saving}
            icon={<Icon name="check" color={colors.night} size={20} />}
          />
        )}

        <View style={styles.nav}>
          <View style={styles.navButton}>
            <Button
              title="Anterior"
              variant="outline"
              disabled={!previous}
              onPress={() => previous && goTo(previous.id)}
              icon={<Icon name="back" size={18} />}
            />
          </View>
          <View style={styles.navButton}>
            <Button
              title="Siguiente"
              variant="outline"
              disabled={!next}
              onPress={() => next && goTo(next.id)}
              icon={<Icon name="forward" size={18} />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Reproductor de la lección (expo-video). Se crea uno por lección y se libera al desmontar. */
function LessonVideo({ uri, style }: { uri: string; style: object }) {
  const player = useVideoPlayer(uri);

  return <VideoView player={player} style={style} contentFit="contain" nativeControls />;
}

const VIDEO_RATIO = 9 / 16;

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
  videoBox: {
    width: '100%',
    aspectRatio: 1 / VIDEO_RATIO,
    backgroundColor: colors.black,
  },
  video: {
    flex: 1,
  },
  fullscreenButton: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    minHeight: sizes.touch - 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.overlay,
  },
  fullscreenHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.label,
    color: colors.label,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.black,
  },
  exitFullscreen: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: radii.round,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    gap: spacing.md + 2,
    padding: spacing.screen,
    paddingTop: spacing.xl - 4,
  },
  section: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
    color: colors.orange,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.title - 2,
    lineHeight: (fontSizes.title - 2) * 1.15,
    color: colors.snow,
  },
  sensorNote: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.5,
    color: colors.textMuted,
  },
  nav: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
  },
});
