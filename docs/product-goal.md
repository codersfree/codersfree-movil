# Product Goal

**CodersFree Móvil:** que un alumno pueda descubrir, comprar y llevar los cursos de CodersFree desde su celular Android, y que CodersFree pueda subir y publicar esos cursos desde la misma app, usando los temas del curso Desarrollo de Aplicaciones Móviles (S01 a S15).

## Primer resultado útil (MVP)
Al 2026-11-19, 6 PM (Lima), la app permite:
1. Crear cuenta e iniciar sesión.
2. Ver el catálogo y el detalle de un curso.
3. Comprar un curso con Izipay (entorno de pruebas) y verlo en "Mis cursos".
4. Ver las lecciones y llevar el progreso.
5. Que CodersFree cree un curso con su temario, lo publique y avise a los alumnos con una notificación push.

## Usuarios
- **Visitante:** abre la app sin cuenta y mira el catálogo.
- **Alumno:** compra cursos y los lleva desde la app.
- **Instructor (CodersFree):** crea, edita y publica cursos desde la app.

## Suposiciones por confirmar
- Izipay se usa solo en su entorno de pruebas, con tarjetas de prueba. Hacen falta las credenciales de prueba de Izipay.
- Solo existe una cuenta de instructor, la de CodersFree, creada con un seeder. No hay registro de instructores.
- Cada lección tiene un video por URL (MP4) que se reproduce en la app.
- La app es solo para Android (Expo); la API es Laravel con tokens (Sanctum).
