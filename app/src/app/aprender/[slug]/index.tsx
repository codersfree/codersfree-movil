import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LearningSection } from '@/api/learning';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorState } from '@/components/States';
import { Eyebrow } from '@/components/Typography';
import { flattenLessons, useMyCourse } from '@/learning/useMyCourse';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

/** H08 · Temario de un curso comprado con lecciones vistas y pendientes. */
export default function TemarioScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { course, error, retry } = useMyCourse(slug);

  const next = useMemo(() => {
    if (!course) return null;
    const lessons = flattenLessons(course);
    return lessons.find((lesson) => !lesson.completed) ?? lessons[0] ?? null;
  }, [course]);

  const openLesson = (lessonId: number) =>
    router.push({ pathname: '/aprender/[slug]/[lessonId]', params: { slug, lessonId: String(lessonId) } });

  if (!course) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader title="Temario" />
        <View style={styles.center}>
          {error ? (
            <ErrorState title="No pudimos cargar el temario" message="Revisa tu conexión e inténtalo otra vez." onRetry={retry} />
          ) : (
            <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando el temario" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const allDone = course.lessons_count > 0 && course.completed_lessons_count === course.lessons_count;

  const header = (
    <View style={styles.progressCard}>
      <View style={styles.progressTop}>
        <Eyebrow>Tu avance</Eyebrow>
        <Text style={styles.progressValue}>{course.progress}%</Text>
      </View>
      <ProgressBar progress={course.progress} showLabel={false} thick />
      <Text style={styles.progressText}>
        {course.completed_lessons_count} de {course.lessons_count} lecciones vistas
      </Text>
      {next ? (
        <Button
          title={allDone ? 'Volver a ver el curso' : `Continuar: ${next.title}`}
          onPress={() => openLesson(next.id)}
          icon={<Icon name="play" color={colors.night} size={20} />}
        />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title={course.title} />
      <FlatList
        data={course.sections}
        keyExtractor={(section) => String(section.id)}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => <SectionCard section={item} index={index} onOpen={openLesson} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function SectionCard({ section, index, onOpen }: { section: LearningSection; index: number; onOpen: (id: number) => void }) {
  const done = section.lessons.filter((lesson) => lesson.completed).length;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {index + 1} · {section.title}
        </Text>
        <Text style={styles.sectionCount}>
          {done}/{section.lessons.length}
        </Text>
      </View>
      {section.lessons.map((lesson) => (
        <Pressable
          key={lesson.id}
          accessibilityRole="link"
          accessibilityLabel={`${lesson.title}, ${lesson.completed ? 'vista' : 'pendiente'}`}
          onPress={() => onOpen(lesson.id)}
          style={({ pressed }) => [styles.lesson, pressed && styles.lessonPressed]}>
          {lesson.completed ? (
            <View style={styles.checkDone}>
              <Icon name="check" color={colors.night} size={14} />
            </View>
          ) : (
            <View style={styles.checkPending} />
          )}
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const CHECK_SIZE = 22;

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
    paddingTop: spacing.xl - 4,
  },
  progressCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  progressValue: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.title - 6,
    color: colors.cyan,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.md,
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
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md + 2,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  sectionCount: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.label,
    color: colors.textMuted,
  },
  lesson: {
    minHeight: sizes.touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lessonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  checkDone: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: radii.round,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkPending: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: radii.round,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  lessonTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
});
