# Definition of Done

Una historia está terminada cuando cumple todo esto:

1. Cumple todos sus criterios de aceptación del product-backlog.md.
2. Sus pantallas se construyeron desde los diseños aprobados en el lienzo y usan los colores y tipografías del archivo de tema de la app (nada de valores sueltos).
3. La API valida los datos y responde con JSON; las rutas que lo requieren están protegidas con token (Sanctum).
4. La API tiene pruebas (Pest/PHPUnit) de lo principal de la historia, y pasan.
5. La app muestra estados de carga, error y lista vacía donde hay datos de la API.
6. Si usa cámara, galería, sensores o notificaciones, pide el permiso y maneja el caso de que se niegue.
7. La probé en un celular Android con Expo Go (o build de desarrollo) y funciona.
8. Sin errores ni advertencias en rojo en la consola de Expo; sin errores de lint/formato (Pint en api/).
9. Está en el PR de su grupo, mergeado a main, y su tarea está marcada en docs/sprint-N.md.
