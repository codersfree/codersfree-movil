@AGENTS.md

# Convenciones de CodersFree Móvil

1. Los colores, tipografías, tamaños, espacios y bordes de la identidad viven en `src/theme.ts` y se usan desde ahí; nunca valores sueltos en las pantallas.
2. Las llamadas a la API pasan por un solo cliente (`src/api/`), que agrega el token y la URL base desde una variable de entorno (`EXPO_PUBLIC_API_URL`).
3. El token se guarda en SecureStore; AsyncStorage solo para datos no sensibles.
4. La sesión vive en un contexto (`AuthContext`) con un hook propio (`useAuth`).
5. Las listas de datos usan `FlatList` (nunca `map` dentro de un `ScrollView`).
6. Toda pantalla que pide datos muestra los estados de carga, error con "Reintentar" y vacío, como en la plantilla "Estados".
7. Antes de usar cámara, galería, sensores o notificaciones se pide el permiso, y se maneja el caso de que se niegue.
