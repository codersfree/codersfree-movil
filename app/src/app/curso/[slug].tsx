import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchCourse, type CourseDetail, type Section } from '@/api/catalog';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/Button';
import { CourseCover } from '@/components/CourseCover';
import { Icon } from '@/components/Icon';
import { ErrorState } from '@/components/States';
import { colors, fonts, fontSizes, letterSpacing, radii, sizes, spacing } from '@/theme';
import { Image } from 'expo-image';

/** H05 · Detalle del curso con su temario. "Comprar" o "Ir al curso" según si ya es suyo. */
export default function CursoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCourse(slug);
      setCourse(data);
      setOpen((current) => (current.size ? current : new Set(data.sections[0] ? [data.sections[0].id] : [])));
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? 'Este curso ya no está disponible.' : 'Revisa tu conexión e inténtalo otra vez.');
    }
  }, [slug]);

  // Se recarga al volver (por ejemplo, después de comprar) para mostrar "Ir al curso".
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggle = useCallback((id: number) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const buy = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push({ pathname: '/compra/[slug]', params: { slug } });
  };

  const back = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={[styles.back, { top: insets.top + spacing.md }]}>
      <Icon name="back" size={22} />
    </Pressable>
  );

  if (!course) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          {error ? (
            <ErrorState title="No pudimos cargar el curso" message={error} onRetry={load} />
          ) : (
            <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando el curso" />
          )}
        </View>
        {back}
      </SafeAreaView>
    );
  }

  const header = (
    <View>
      <CourseCover uri={course.cover_url} label={course.category.name} style={styles.cover} />
      <View style={styles.info}>
        <View style={styles.chips}>
          <Text style={[styles.chip, styles.chipCyan]}>{course.category.name.toUpperCase()}</Text>
          <Text style={[styles.chip, styles.chipOrange]}>{course.level_label.toUpperCase()}</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {course.title}
        </Text>
        <View style={styles.instructor}>
          <View style={styles.instructorAvatar}>
            <Image source={require('@/assets/images/logo-robot.png')} style={styles.instructorRobot} />
          </View>
          <Text style={styles.instructorText}>
            Por <Text style={styles.instructorName}>{course.instructor.name}</Text>
          </Text>
        </View>
        <Text style={styles.description}>{course.description}</Text>
        <Text style={styles.syllabusTitle}>TEMARIO · {course.lessons_count} LECCIONES</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={course.sections}
        keyExtractor={(section) => String(section.id)}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => (
          <SectionItem section={item} index={index} expanded={open.has(item.id)} onToggle={toggle} />
        )}
        contentContainerStyle={{ paddingBottom: sizes.bottomBar + insets.bottom + spacing.xl }}
      />
      {back}
      <View style={[styles.bar, { paddingBottom: spacing.lg + insets.bottom }]}>
        {course.is_enrolled ? (
          <View style={styles.owned}>
            <Icon name="check" color={colors.green} size={20} />
            <Text style={styles.ownedText}>Ya es tuyo</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.priceLabel}>Precio</Text>
            <Text style={styles.price}>{course.price_label}</Text>
          </View>
        )}
        <View style={styles.barButton}>
          {course.is_enrolled ? (
            <Button title="Ir al curso" variant="accent" onPress={() => router.replace('/mis-cursos')} />
          ) : (
            <Button title="Comprar" onPress={buy} />
          )}
        </View>
      </View>
    </View>
  );
}

type SectionItemProps = {
  section: Section;
  index: number;
  expanded: boolean;
  onToggle: (id: number) => void;
};

function SectionItem({ section, index, expanded, onToggle }: SectionItemProps) {
  return (
    <View style={[styles.section, index === 0 && styles.sectionFirst]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => onToggle(section.id)}
        style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {index + 1} · {section.title}
        </Text>
        <Text style={styles.sectionCount}>
          {section.lessons.length} {section.lessons.length === 1 ? 'lección' : 'lecciones'} {expanded ? '▴' : '▾'}
        </Text>
      </Pressable>
      {expanded
        ? section.lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lesson}>
              <Icon name="play" color={colors.cyan} size={18} />
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </View>
          ))
        : null}
    </View>
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
  back: {
    position: 'absolute',
    left: spacing.md,
    width: sizes.touch - 4,
    height: sizes.touch - 4,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    height: sizes.coverHero,
    borderRadius: 0,
    borderWidth: 0,
  },
  info: {
    gap: spacing.md + 2,
    padding: spacing.screen,
    paddingTop: spacing.lg + 2,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.tight,
    borderWidth: 1,
    borderRadius: radii.chip - 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  chipCyan: {
    color: colors.cyan,
    borderColor: colors.cyan,
  },
  chipOrange: {
    color: colors.orange,
    borderColor: colors.orange,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.title - 2,
    lineHeight: (fontSizes.title - 2) * 1.15,
    color: colors.snow,
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  instructorAvatar: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorRobot: {
    width: sizes.robotTiny,
    height: sizes.robotTiny,
  },
  instructorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  instructorName: {
    fontFamily: fonts.bodySemiBold,
    color: colors.snow,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.55,
    color: colors.textSecondary,
  },
  syllabusTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.heading,
    fontSize: fontSizes.card,
    color: colors.snow,
  },
  section: {
    marginHorizontal: spacing.screen,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  sectionHeader: {
    minHeight: sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  sectionCount: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lessonTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    color: colors.label,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md + 2,
    paddingHorizontal: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  priceLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    color: colors.textMuted,
  },
  price: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.subtitle,
    color: colors.cyan,
  },
  owned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ownedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.chip,
    color: colors.green,
  },
  barButton: {
    flex: 1,
  },
});
