import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CourseSummary } from '@/api/catalog';
import { CourseCover } from '@/components/CourseCover';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

type Props = {
  course: CourseSummary;
  onPress: (slug: string) => void;
};

/** Tarjeta del catálogo. Va memorizada: solo se vuelve a dibujar si cambia su curso. */
function CourseCardBase({ course, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${course.title}, ${course.instructor.name}, ${course.level_label}, ${course.price_label}`}
      onPress={() => onPress(course.slug)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <CourseCover uri={course.cover_url} label={course.category.name} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {course.instructor.name} · {course.level_label}
        </Text>
        <Text style={styles.price}>{course.price_label}</Text>
      </View>
    </Pressable>
  );
}

export const CourseCard = memo(CourseCardBase);

export const COURSE_CARD_HEIGHT = 104;

const styles = StyleSheet.create({
  card: {
    height: COURSE_CARD_HEIGHT,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  pressed: {
    borderColor: colors.cyan,
  },
  cover: {
    width: sizes.coverThumbWidth,
    height: sizes.coverThumbHeight,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.paragraph,
    lineHeight: fontSizes.paragraph * 1.3,
    color: colors.snow,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  price: {
    marginTop: 'auto',
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.body,
    color: colors.cyan,
  },
});
