import { router, useFocusEffect } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fetchInstructorCourses, type InstructorCourse } from '@/api/instructor';
import { CourseCover } from '@/components/CourseCover';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { ErrorState, SkeletonCard } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import { Eyebrow, Title } from '@/components/Typography';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Status = 'loading' | 'ready' | 'error';

/** H12 · Mis cursos del instructor con su estado, y el botón Nuevo curso. */
export default function CursosInstructorScreen() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setCourses(await fetchInstructorCourses());
      setStatus('ready');
    } catch {
      setStatus((current) => (current === 'ready' ? current : 'error'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openCourse = useCallback((slug: string) => {
    router.push({ pathname: '/panel/curso/[slug]', params: { slug } });
  }, []);

  const empty =
    status === 'loading' ? (
      <View style={styles.states}>
        {[0, 1, 2].map((key) => (
          <SkeletonCard key={key} />
        ))}
      </View>
    ) : status === 'error' ? (
      <ErrorState
        title="No pudimos cargar tus cursos"
        message="Revisa tu conexión e inténtalo otra vez."
        onRetry={() => {
          setStatus('loading');
          load();
        }}
      />
    ) : (
      <EmptyState
        title="Aún no creas cursos"
        message="Toca Nuevo curso para crear el primero. Se guarda como borrador hasta que lo publiques."
      />
    );

  return (
    <View style={styles.root}>
      <FlatList
        data={status === 'ready' ? courses : []}
        keyExtractor={(course) => String(course.id)}
        renderItem={({ item }) => <InstructorCourseCard course={item} onPress={openCourse} />}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Eyebrow>Instructor</Eyebrow>
            <Title>Mis cursos</Title>
          </View>
        }
        ListEmptyComponent={empty}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await load();
          setRefreshing(false);
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nuevo curso"
        onPress={() => router.push({ pathname: '/panel/curso/[slug]', params: { slug: 'nuevo' } })}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Icon name="plus" color={colors.night} size={20} />
        <Text style={styles.fabText}>Nuevo curso</Text>
      </Pressable>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const InstructorCourseCard = memo(function InstructorCourseCard({
  course,
  onPress,
}: {
  course: InstructorCourse;
  onPress: (slug: string) => void;
}) {
  const sections = course.sections_count ?? 0;
  const lessons = course.lessons_count ?? 0;
  const detail = `${sections} ${sections === 1 ? 'sección' : 'secciones'} · ${lessons} ${lessons === 1 ? 'lección' : 'lecciones'}`;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${course.title}, ${course.status === 'published' ? 'publicado' : 'borrador'}, ${detail}`}
      onPress={() => onPress(course.slug)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <CourseCover uri={course.cover_url} label={course.category?.name ?? 'Curso'} style={styles.cover} />
      <View style={styles.cardInfo}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {course.title}
          </Text>
          <StatusBadge status={course.status} />
        </View>
        <Text style={styles.cardMeta}>{detail}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: sizes.control + spacing.xxl * 2,
  },
  heading: {
    gap: spacing.xs + 2,
    paddingTop: spacing.xl - 4,
    paddingBottom: spacing.md + 2,
  },
  states: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    borderColor: colors.cyan,
  },
  cover: {
    width: sizes.coverThumbWidth - spacing.lg,
    height: sizes.coverThumbHeight - spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.3,
    color: colors.snow,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.screen,
    bottom: spacing.lg + 4,
    height: sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl - 4,
    borderRadius: radii.round,
    backgroundColor: colors.orange,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.paragraph,
    color: colors.night,
  },
});
