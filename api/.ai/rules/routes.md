---
paths:
  - routes/api.php
---

# Routes

## API bajo /api/v1 y siempre JSON
Toda la API va en routes/api.php con prefijo /api/v1 y responde siempre JSON (también los errores).

## Autenticación con tokens de Sanctum
La autenticación es con tokens de Sanctum; las rutas privadas usan el middleware auth:sanctum.
