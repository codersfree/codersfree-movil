# Sprint 1

- **Duración:** 2026-11-19, de 11:30 a 17:30 (Lima). Sprint Review y entrega: 17:30 a 18:00.
- **Capacidad:** 6 h (una persona: Product Owner, Scrum Master y Developer).
- **Estimado:** 5.5 h (0.5 h de margen).

## Sprint Goal
Tener el MVP de CodersFree Móvil funcionando en Android: el alumno se registra, compra un curso con Izipay (pruebas) y lo lleva con su avance, y CodersFree crea, publica y avisa de sus cursos desde la app.

## Historias
H01, H02, H03, H04, H05, H07, H08, H09, H10, H12, H13, H14, H15 (ver product-backlog.md).

## Cómo es el producto
- La marca es **Coders Free**: identidad del lienzo (colores, tipografías, el robot como logo). Textos en español de Perú y precios en soles (S/).
- CodersFree vende cursos de programación. Un curso tiene categoría, nivel (básico, intermedio, avanzado), precio, portada, y un temario de secciones con lecciones en video.
- Hay dos experiencias en la app: la del **alumno** (catálogo, compra, Mis cursos, lecciones) y la del **instructor** (Mis cursos como instructor, editor del curso). Cambia según el rol de la cuenta.
- La única cuenta de instructor es la de CodersFree y se crea con un seeder. Se cargan cursos de ejemplo con seeders para que el catálogo no esté vacío.
- El cobro es con Izipay en entorno de pruebas, con tarjetas de prueba.

## Tareas

### Preparación base
| ID | Tarea | Horas | Hecho |
|---|---|---|---|
| T01 | Crear el repo e instalar Laravel 13 con Boost en api/, Expo SDK 58 en app/ y el MCP de Expo | 0.4 | [x] |
| T02 | Lienzo de Claude Design: identidad visual (desde la referencia) y plantillas base (acceso, alumno, instructor) | 0.3 | [x] |
| T03 | CLAUDE.md de la raíz y docs/rules-base.md | 0.2 | [x] |
| T04 | PR con docs/ y CLAUDE.md; después del merge, `php artisan boost:update` | 0.1 | [x] |

### Grupo 1 · Autenticación (H01, H02 y H03)
| ID | Tarea | Horas | Hecho |
|---|---|---|---|
| T05 | Diseño: registro, inicio de sesión y perfil con foto | 0.2 | [x] |
| T06 | Construcción: API con Sanctum (registro, login, logout, usuario, foto) y app (navegación por rol, contexto de sesión, token en SecureStore, foto con expo-image-picker) | 0.6 | [x] |
| T07 | Revisión de H01, H02 y H03 y PR | 0.2 | [x] |

### Grupo 2 · Catálogo y compra (H04, H05 y H07)
| ID | Tarea | Horas | Hecho |
|---|---|---|---|
| T08 | Diseño: inicio con catálogo, detalle del curso y pago | 0.2 | [x] |
| T09 | Construcción: API de categorías, cursos (paginados) y compras; app con FlatList optimizada. Izipay: la API crea el formToken con las credenciales de prueba, la app muestra el formulario de Izipay en un WebView (react-native-webview) y la API valida la respuesta (hash) antes de matricular | 1.0 | [x] |
| T10 | Revisión de H04, H05 y H07 y PR | 0.3 | [x] |

### Grupo 3 · Aprendizaje (H08, H09 y H10)
| ID | Tarea | Horas | Hecho |
|---|---|---|---|
| T11 | Diseño: Mis cursos, temario con avance y lección | 0.15 | [ ] |
| T12 | Construcción: API de mis cursos y avance; app con expo-video, y pantalla completa al girar con el acelerómetro (expo-sensors) y expo-screen-orientation | 0.45 | [ ] |
| T13 | Revisión de H08, H09 y H10 y PR | 0.15 | [ ] |

### Grupo 4 · Instructor y notificaciones (H12, H13, H14 y H15)
| ID | Tarea | Horas | Hecho |
|---|---|---|---|
| T14 | Diseño: mis cursos del instructor, editor del curso y temario | 0.2 | [ ] |
| T15 | Construcción: API de cursos del instructor, secciones, lecciones, publicar y tokens push; envío con la API de Expo Push desde Laravel; app con portada por cámara/galería y expo-notifications. La push no funciona en Expo Go (desde el SDK 53): usar un development build (`npx expo run:android` o `eas build --profile development`), lanzado apenas termine el Grupo 1 | 0.8 | [ ] |
| T16 | Revisión de H12, H13, H14 y H15 y PR | 0.25 | [ ] |

**Total:** 5.5 h

## Si se atrasa
Recortar primero H10 (sensor) y luego H03 (cámara del perfil); la cámara sigue cubierta por la portada del curso en H12.
