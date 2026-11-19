/**
 * Permisos que usa la app. Se llaman igual que la ruta de la API que protegen.
 * El rol (por ejemplo "instructor") solo agrupa permisos; la app nunca revisa roles.
 */
export const PERMISSIONS = {
  instructorPanel: 'instructor.courses.index',
} as const;
