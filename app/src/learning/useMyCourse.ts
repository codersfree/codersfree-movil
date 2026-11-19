import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { LearningLesson, LearningSection, MyCourse } from '@/api/learning';
import { fetchMyCourse } from '@/api/learning';

export type CourseWithSyllabus = MyCourse & { sections: LearningSection[] };

export type FlatLesson = LearningLesson & { sectionTitle: string; sectionIndex: number };

/** Lecciones del temario en orden, para Anterior / Siguiente y "Continuar". */
export function flattenLessons(course: CourseWithSyllabus): FlatLesson[] {
  return course.sections.flatMap((section, sectionIndex) =>
    section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title, sectionIndex })),
  );
}

/** Temario de un curso comprado; se vuelve a pedir cada vez que la pantalla gana el foco. */
export function useMyCourse(slug: string) {
  const [course, setCourse] = useState<CourseWithSyllabus | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setCourse(await fetchMyCourse(slug));
      setError(false);
    } catch {
      setError(true);
    }
  }, [slug]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { course, setCourse, error, retry: load };
}
