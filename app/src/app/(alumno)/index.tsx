import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { fetchCategories, type Category, type CourseSummary } from '@/api/catalog';
import { CategoryChips } from '@/catalog/CategoryChips';
import { COURSE_CARD_HEIGHT, CourseCard } from '@/catalog/CourseCard';
import { useCourses } from '@/catalog/useCourses';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { ErrorState, SkeletonCard } from '@/components/States';
import { Eyebrow, Title } from '@/components/Typography';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

const SEARCH_DELAY_MS = 400;
const ITEM_HEIGHT = COURSE_CARD_HEIGHT + spacing.md;

/** H04 · Inicio con el catálogo: categorías, búsqueda y lista paginada de cursos publicados. */
export default function InicioScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const { courses, loading, loadingMore, refreshing, error, retry, refresh, loadMore } = useCourses({ category, search });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Espera a que el usuario deje de escribir antes de buscar.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const openCourse = useCallback((slug: string) => {
    router.push({ pathname: '/curso/[slug]', params: { slug } });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CourseSummary }) => (
      <View style={styles.item}>
        <CourseCard course={item} onPress={openCourse} />
      </View>
    ),
    [openCourse],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    [],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.heading}>
          <Eyebrow>Catálogo</Eyebrow>
          <Title>Cursos</Title>
        </View>
        <View style={styles.search}>
          <Icon name="search" color={colors.textMuted} size={22} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por título"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Buscar cursos por título"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchText ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => setSearchText('')} style={styles.clear}>
              <Icon name="close" color={colors.textSecondary} size={20} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.chips}>
          <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        </View>
      </View>
    ),
    [searchText, categories, category],
  );

  const body = loading ? (
    <View style={styles.states}>
      {[0, 1, 2, 3].map((key) => (
        <SkeletonCard key={key} />
      ))}
    </View>
  ) : error && courses.length === 0 ? (
    <View style={styles.states}>
      <ErrorState title="No pudimos cargar los cursos" message="Revisa tu conexión e inténtalo otra vez." onRetry={retry} />
    </View>
  ) : (
    <View style={styles.states}>
      <EmptyState
        title={search ? 'Sin resultados' : 'Aún no hay cursos'}
        message={
          search
            ? `No hay cursos que coincidan con “${search}”. Prueba con otra palabra o elige otra categoría.`
            : 'Pronto verás aquí los cursos de Coders Free.'
        }
      />
    </View>
  );

  const footer = loadingMore ? (
    <View style={styles.footer} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.cyan} />
      <Text style={styles.footerText}>Cargando más cursos…</Text>
    </View>
  ) : error && courses.length > 0 ? (
    <Pressable accessibilityRole="button" onPress={retry} style={styles.footer}>
      <Text style={styles.footerError}>No pudimos cargar más. Toca para reintentar.</Text>
    </Pressable>
  ) : undefined;

  return (
    <FlatList
      style={styles.root}
      data={loading ? [] : courses}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ListHeaderComponent={header}
      ListEmptyComponent={body}
      ListFooterComponent={footer}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={refresh}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={6}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.md + 2,
    paddingTop: spacing.xl - 4,
    paddingBottom: spacing.md + 2,
  },
  heading: {
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.screen,
  },
  search: {
    height: sizes.control,
    marginHorizontal: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingLeft: spacing.md + 2,
    paddingRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.control,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: fontSizes.paragraph,
    color: colors.snow,
  },
  clear: {
    width: sizes.touch,
    height: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    marginTop: spacing.xs,
  },
  states: {
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
  },
  item: {
    paddingHorizontal: spacing.screen,
  },
  separator: {
    height: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.lg,
    minHeight: sizes.touch,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  footerError: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.small,
    color: colors.red,
  },
});
