# Rules base

Convenciones que ya sabemos desde el inicio. Claude Code las registra al empezar el primer grupo: las de la API en `api/.ai/rules/` (record-rule) y las de la app en `app/CLAUDE.md`.

## API (api/)
1. Toda la API va bajo `routes/api.php`, con prefijo `/api/v1`, y responde siempre JSON.
2. La autenticación es con tokens de Sanctum; las rutas privadas usan `auth:sanctum`.
3. La validación va en Form Requests y las respuestas en API Resources. Los mensajes de validación, en español.
4. Los permisos por rol (alumno o instructor) se revisan con Policies.
5. Las credenciales externas (Izipay, Expo Push) van en `.env` y se leen desde `config/services.php`, nunca en el código.
6. Cada endpoint nuevo tiene al menos una prueba con Pest.

## App (app/)
1. Los colores, tipografías, tamaños, espacios y bordes de la identidad viven en `src/theme.ts` y se usan desde ahí; nunca valores sueltos en las pantallas.
2. Las llamadas a la API pasan por un solo cliente (`src/api/`), que agrega el token y la URL base desde una variable de entorno (`EXPO_PUBLIC_API_URL`).
3. El token se guarda en SecureStore; AsyncStorage solo para datos no sensibles.
4. La sesión vive en un contexto (`AuthContext`) con un hook propio (`useAuth`).
5. Las listas de datos usan `FlatList` (nunca `map` dentro de un `ScrollView`).
6. Toda pantalla que pide datos muestra los estados de carga, error con "Reintentar" y vacío, como en la plantilla "Estados".
7. Antes de usar cámara, galería, sensores o notificaciones se pide el permiso, y se maneja el caso de que se niegue.
