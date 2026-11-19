import { apiRequest } from './client';

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type CourseSummary = {
  id: number;
  slug: string;
  title: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  level_label: string;
  price: string;
  price_label: string;
  cover_url: string | null;
  category: Category;
  instructor: { id: number; name: string };
};

export type Lesson = { id: number; title: string; position: number };

export type Section = { id: number; title: string; position: number; lessons: Lesson[] };

export type CourseDetail = CourseSummary & {
  description: string;
  lessons_count: number;
  sections: Section[];
  is_enrolled: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

export async function fetchCategories() {
  const { data } = await apiRequest<{ data: Category[] }>('/categories');
  return data;
}

export function fetchCourses({ page, category, search }: { page: number; category?: string | null; search?: string }) {
  const params = new URLSearchParams({ page: String(page) });
  if (category) {
    params.set('category', category);
  }
  if (search) {
    params.set('search', search);
  }
  return apiRequest<Paginated<CourseSummary>>(`/courses?${params.toString()}`);
}

export async function fetchCourse(slug: string) {
  const { data } = await apiRequest<{ data: CourseDetail }>(`/courses/${encodeURIComponent(slug)}`);
  return data;
}
