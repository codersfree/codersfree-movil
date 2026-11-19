import type { Category } from './catalog';
import { apiRequest } from './client';
import { imageFormData } from './files';

export type Level = 'basico' | 'intermedio' | 'avanzado';

export type InstructorLesson = { id: number; title: string; video_url: string; position: number };

export type InstructorSection = { id: number; title: string; position: number; lessons: InstructorLesson[] };

export type InstructorCourse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category_id: number;
  category?: Category;
  level: Level;
  level_label: string;
  price: string;
  price_label: string;
  cover_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  sections_count?: number;
  lessons_count?: number;
  sections?: InstructorSection[];
};

export type CourseForm = {
  title: string;
  description: string;
  category_id: number | null;
  level: Level;
  price: string;
};

export type LessonForm = { title: string; video_url: string };

type One = { data: InstructorCourse };

export async function fetchInstructorCategories() {
  const { data } = await apiRequest<{ data: Category[] }>('/instructor/categories');
  return data;
}

export async function fetchInstructorCourses() {
  const { data } = await apiRequest<{ data: InstructorCourse[] }>('/instructor/courses');
  return data;
}

export async function fetchInstructorCourse(slug: string) {
  return (await apiRequest<One>(`/instructor/courses/${encodeURIComponent(slug)}`)).data;
}

export async function createCourse(form: CourseForm) {
  return (await apiRequest<One>('/instructor/courses', { method: 'POST', body: form })).data;
}

export async function updateCourse(slug: string, form: CourseForm) {
  return (await apiRequest<One>(`/instructor/courses/${encodeURIComponent(slug)}`, { method: 'PUT', body: form })).data;
}

export async function uploadCourseCover(slug: string, uri: string, mimeType?: string | null) {
  const form = await imageFormData('cover', uri, mimeType);
  return (await apiRequest<One>(`/instructor/courses/${encodeURIComponent(slug)}/cover`, { method: 'POST', body: form })).data;
}

export async function publishCourse(slug: string) {
  return (await apiRequest<One>(`/instructor/courses/${encodeURIComponent(slug)}/publish`, { method: 'POST' })).data;
}

export async function createSection(courseSlug: string, title: string) {
  return (await apiRequest<One>(`/instructor/courses/${encodeURIComponent(courseSlug)}/sections`, { method: 'POST', body: { title } })).data;
}

export async function updateSection(sectionId: number, title: string) {
  return (await apiRequest<One>(`/instructor/sections/${sectionId}`, { method: 'PUT', body: { title } })).data;
}

export async function deleteSection(sectionId: number) {
  return (await apiRequest<One>(`/instructor/sections/${sectionId}`, { method: 'DELETE' })).data;
}

export async function createLesson(sectionId: number, form: LessonForm) {
  return (await apiRequest<One>(`/instructor/sections/${sectionId}/lessons`, { method: 'POST', body: form })).data;
}

export async function updateLesson(lessonId: number, form: LessonForm) {
  return (await apiRequest<One>(`/instructor/lessons/${lessonId}`, { method: 'PUT', body: form })).data;
}

export async function deleteLesson(lessonId: number) {
  return (await apiRequest<One>(`/instructor/lessons/${lessonId}`, { method: 'DELETE' })).data;
}
