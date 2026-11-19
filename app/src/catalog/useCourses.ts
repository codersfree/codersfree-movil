import { useCallback, useEffect, useState } from 'react';

import { fetchCourses, type CourseSummary } from '@/api/catalog';

type Filters = {
  category: string | null;
  search: string;
};

type ListState = {
  /** Filtros a los que corresponde esta lista; si no coinciden con los actuales, se está cargando. */
  key: string | null;
  courses: CourseSummary[];
  page: number;
  lastPage: number;
  error: boolean;
};

const EMPTY: ListState = { key: null, courses: [], page: 1, lastPage: 1, error: false };

/**
 * Cursos publicados con paginación al bajar (scroll infinito).
 * Al cambiar la categoría o la búsqueda se vuelve a la página 1.
 */
export function useCourses({ category, search }: Filters) {
  const term = search.trim();
  const key = `${category ?? ''}|${term}`;
  const [state, setState] = useState<ListState>(EMPTY);
  const [attempt, setAttempt] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCourses({ page: 1, category, search: term })
      .then((result) => {
        if (active) {
          setState({ key, courses: result.data, page: result.meta.current_page, lastPage: result.meta.last_page, error: false });
        }
      })
      .catch(() => {
        if (active) {
          setState({ ...EMPTY, key, error: true });
        }
      });
    return () => {
      active = false;
    };
  }, [key, category, term, attempt]);

  const loading = state.key !== key;

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || state.page >= state.lastPage) {
      return;
    }
    setLoadingMore(true);
    try {
      const result = await fetchCourses({ page: state.page + 1, category, search: term });
      setState((current) =>
        current.key === key
          ? { ...current, courses: [...current.courses, ...result.data], page: result.meta.current_page, lastPage: result.meta.last_page, error: false }
          : current,
      );
    } catch {
      setState((current) => (current.key === key ? { ...current, error: true } : current));
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, state.page, state.lastPage, category, term, key]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await fetchCourses({ page: 1, category, search: term });
      setState({ key, courses: result.data, page: result.meta.current_page, lastPage: result.meta.last_page, error: false });
    } catch {
      setState((current) => ({ ...current, error: true }));
    } finally {
      setRefreshing(false);
    }
  }, [category, term, key]);

  const retry = useCallback(() => {
    if (state.courses.length > 0) {
      loadMore();
      return;
    }
    setState(EMPTY);
    setAttempt((value) => value + 1);
  }, [state.courses.length, loadMore]);

  return {
    courses: loading ? [] : state.courses,
    loading,
    loadingMore,
    refreshing,
    error: !loading && state.error,
    retry,
    refresh,
    loadMore: () => {
      if (!state.error) {
        loadMore();
      }
    },
  };
}
