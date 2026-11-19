# CodersFree Móvil

App móvil (Android) para que CodersFree venda sus cursos y los alumnos los lleven desde la app. Proyecto final del curso Desarrollo de Aplicaciones Móviles, hecho con Scrum por una sola persona (Victor), que cumple los tres roles.

- `api/`: Laravel 13 con Laravel Boost (guidelines en `api/CLAUDE.md`, convenciones en `api/.ai/rules/`).
- `app/`: Expo (SDK 58, Expo Router, TypeScript). Convenciones en `app/CLAUDE.md`. Usa el MCP de Expo para la documentación.
- `docs/`: product-goal, product-backlog, definition-of-done, rules-base y sprint-N. Son la fuente de verdad del alcance.
- Lienzo de Claude Design: https://claude.ai/artifact/7b5NbctLvXZJcyBDSHNbk3 (identidad visual, plantillas base y una página por épica).

## Cómo se trabaja

El trabajo va por **grupos de historias** del `docs/sprint-N.md` del sprint actual. Cada grupo tiene sus tareas (Diseño, Construcción y Revisión) y **una rama y un PR**. Haz un grupo a la vez.

### Antes de empezar un grupo
1. Si es el primer grupo del proyecto y las rules base aún no están registradas, regístralas sin preguntar desde `docs/rules-base.md`: las de la API en `api/.ai/rules/` con record-rule y las de la app en `app/CLAUDE.md`. Van en la rama y el PR de ese grupo.
2. Lee los criterios de aceptación de las historias del grupo en `docs/product-backlog.md` y la sección "Cómo es el producto" del sprint.
3. Crea la rama del grupo desde `main` (por ejemplo `grupo-1-autenticacion`).

### Diseño (si el grupo tiene pantallas)
- Crea las pantallas en el lienzo, en la página de su épica (si no existe, créala), a partir de las plantillas base y en formato celular (390 × 844).
- Cada diseño lleva el ID de su historia en el nombre (por ejemplo "H01 · Registro"). Incluye los estados que pidan los criterios (errores, vacío, cargando).
- Muéstrame los diseños y **espera mi aprobación** antes de pasar a Construcción.

### Construcción
- Primero la API y luego la app.
- La base de datos la diseñas tú; usa factories y seeders con datos de ejemplo.
- Si hay pantallas, constrúyelas desde los diseños aprobados, tomando del lienzo los logos e imágenes de marca.
- Usa las librerías que indica la tarea de Construcción del sprint. Si hace falta algo técnico que no está ahí, pregúntame antes.

### Revisión
- Revisa cada criterio de aceptación y cada punto de `docs/definition-of-done.md`, y muéstrame cuáles cumple y cuáles no.
- **Espera a que yo pruebe en el celular** y dé el visto bueno. Recién ahí abre el PR del grupo hacia `main`.

### Siempre
- Marca cada tarea terminada (`[x]`) en el `docs/sprint-N.md` del sprint actual, dentro de la rama del grupo.
- Registra una rule solo cuando yo te lo pida (por ejemplo, "anota esto en las rules"). Si no lo pido, aplica el cambio y no preguntes si debe ser rule.
- Textos de la app en español (Perú) y precios en soles (S/).
