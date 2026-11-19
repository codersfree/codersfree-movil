import type { Category } from './catalog';
import { apiRequest } from './client';

export type LearningLesson = {
  id: number;
  title: string;
  position: number;
  video_url: string;
  completed: boolean;
};

export type LearningSection = {
  id: number;
  title: string;
  position: number;
  lessons: LearningLesson[];
};

export type MyCourse = {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  category: Category;
  lessons_count: number;
  completed_lessons_count: number;
  progress: number;
  sections?: LearningSection[];
};

export async function fetchMyCourses() {
  const { data } = await apiRequest<{ data: MyCourse[] }>('/my-courses');
  return data;
}

export async function fetchMyCourse(slug: string) {
  const { data } = await apiRequest<{ data: MyCourse & { sections: LearningSection[] } }>(
    `/my-courses/${encodeURIComponent(slug)}`,
  );
  return data;
}

/** Marca o desmarca una lección como vista; devuelve el avance actualizado del curso. */
export async function setLessonCompleted(lessonId: number, completed: boolean) {
  const { data } = await apiRequest<{ data: MyCourse }>(`/lessons/${lessonId}/completion`, {
    method: completed ? 'POST' : 'DELETE',
  });
  return data;
}
