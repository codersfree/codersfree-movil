import { router, useFocusEffect } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fetchMyCourses, type MyCourse } from '@/api/learning';
import { Button } from '@/components/Button';
import { CourseCover } from '@/components/CourseCover';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { ErrorState, SkeletonCard } from '@/components/States';
import { Eyebrow, Title } from '@/components/Typography';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Status = 'loading' | 'ready' | 'error';

/** H08 · Mis cursos: los cursos comprados con su avance. */
export default function MisCursosScreen() {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setCourses(await fetchMyCourses());
      setStatus('ready');
    } catch {
      setStatus((current) => (current === 'ready' ? current : 'error'));
    }
  }, []);

  // Al volver de una lección, el avance se actualiza.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openCourse = useCallback((slug: string) => {
    router.push({ pathname: '/aprender/[slug]', params: { slug } });
  }, []);

  const header = (
    <View style={styles.heading}>
      <Eyebrow>Aprendizaje</Eyebrow>
      <Title>Mis cursos</Title>
    </View>
  );

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
      <View style={styles.states}>
        <EmptyState title="Aún no tienes cursos" message="Los cursos que compres aparecerán aquí con tu avance." />
        <Button title="Explorar cursos" onPress={() => router.navigate('/')} />
      </View>
    );

  return (
    <FlatList
      style={styles.root}
      data={status === 'ready' ? courses : []}
      keyExtractor={(course) => String(course.id)}
      renderItem={({ item }) => <MyCourseCard course={item} onPress={openCourse} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={refresh}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const MyCourseCard = memo(function MyCourseCard({ course, onPress }: { course: MyCourse; onPress: (slug: string) => void }) {
  const summary =
    course.completed_lessons_count === 0
      ? 'Aún no empiezas'
      : `${course.completed_lessons_count} de ${course.lessons_count} lecciones vistas`;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${course.title}, ${summary}, avance ${course.progress}%`}
      onPress={() => onPress(course.slug)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardTop}>
        <CourseCover uri={course.cover_url} label={course.category.name} style={styles.cover} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.cardMeta}>{summary}</Text>
        </View>
      </View>
      <ProgressBar progress={course.progress} />
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
    paddingBottom: spacing.xl,
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
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cover: {
    width: sizes.coverThumbWidth - spacing.lg,
    height: sizes.coverThumbHeight - spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.paragraph,
    lineHeight: fontSizes.paragraph * 1.3,
    color: colors.snow,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
});
