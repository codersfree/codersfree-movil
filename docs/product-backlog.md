# Product Backlog

Deducido del lienzo de referencia (identidad y flujos de tienda, autenticación, perfil e instructor) y recortado para que quepa en el plazo. El criterio para elegir historias no es tener todas las funciones de la referencia, sino cubrir la mayor cantidad de temas de las separatas.

## Temas del curso (separatas)
| ID | Tema | Separata |
|---|---|---|
| C1 | Componentes y estilos (diseño móvil) | S03, S04 |
| C2 | Eventos y estado | S05 |
| C3 | Navegación | S06 |
| C4 | Hooks (useState, useEffect, useContext, hooks propios) | S07, S08, S11 |
| C5 | Consumo de API (fetch) | S09 |
| C6 | Almacenamiento local (AsyncStorage / SecureStore) | S10 |
| C7 | Cámara | S12 |
| C8 | Sensores (acelerómetro) | S13 |
| C9 | Permisos (Android) | S14 |
| C10 | Notificaciones push | S15 |
| C11 | Rendimiento (FlatList, memo, useMemo/useCallback) | S15 |

## Usuarios
Visitante, Alumno e Instructor (CodersFree). Ver product-goal.md.

## Orden y épicas
Prioridad: **MVP** (entra en el Sprint 1) o **Después** (solo si sobra tiempo).

### E1 · Autenticación
**H01 · Registro** (MVP) · Temas: C1, C2, C4, C5, C6
Como visitante, quiero crear una cuenta para comprar y llevar cursos.
- Pide nombre, correo, contraseña (mínimo 8) y su confirmación.
- Si hay errores, los muestra debajo de cada campo con el mensaje que devuelve la API.
- Al registrarse, entra directo a la app con la sesión iniciada.
- El token se guarda en SecureStore.

**H02 · Iniciar y cerrar sesión** (MVP) · Temas: C2, C3, C4, C5, C6
Como alumno o instructor, quiero entrar con mi correo y contraseña para usar mi cuenta.
- Con datos incorrectos, muestra un aviso arriba del formulario.
- Si cierro la app y la vuelvo a abrir, sigo con la sesión iniciada (token en SecureStore).
- La sesión vive en un contexto (useContext) que usan todas las pantallas.
- "Cerrar sesión" borra el token y vuelve al inicio sin sesión.
- Según el rol, la app muestra la navegación de alumno o la de instructor.

**H03 · Foto de perfil con la cámara** (MVP) · Temas: C5, C7, C9
Como alumno, quiero tomarme una foto o elegirla de la galería para usarla en mi perfil.
- La primera vez pide el permiso de cámara (o de galería); si lo niego, explica por qué hace falta y ofrece abrir los ajustes.
- Muestra una vista previa antes de guardar.
- Al guardar, la foto se sube a la API y aparece en el perfil.
- Sin foto, se ven las iniciales.

### E2 · Catálogo
**H04 · Inicio con el catálogo** (MVP) · Temas: C1, C3, C4, C5, C11
Como visitante, quiero ver los cursos publicados para elegir uno.
- Muestra categorías y la lista de cursos publicados (portada, título, instructor, precio).
- La lista usa FlatList con paginación al bajar (scroll infinito) y tarjetas memorizadas.
- Mientras carga, muestra un indicador; si falla la conexión, un aviso con "Reintentar".
- Puedo filtrar por categoría y buscar por título.

**H05 · Detalle del curso** (MVP) · Temas: C1, C3, C5
Como visitante, quiero ver el detalle de un curso para decidir si lo compro.
- Muestra portada, título, descripción, nivel, precio, instructor y temario (secciones y lecciones).
- Si no tengo sesión, "Comprar" me lleva a iniciar sesión.
- Si ya lo compré, el botón dice "Ir al curso".

**H06 · Lista de deseos** (Después) · Temas: C2, C4, C6
Como visitante, quiero guardar cursos que me interesan para verlos luego.
- Un corazón en la tarjeta y en el detalle agrega o quita el curso.
- La lista se guarda en AsyncStorage y se mantiene al cerrar la app.
- Tiene su propia pantalla.

### E3 · Compra
**H07 · Comprar un curso con Izipay** (MVP) · Temas: C2, C3, C5
Como alumno, quiero pagar un curso con tarjeta para poder llevarlo.
- Desde el detalle, "Comprar" muestra un resumen con el curso y el precio en soles.
- Al pulsar "Pagar", se abre el formulario de pago de Izipay (entorno de pruebas) dentro de la app.
- Con una tarjeta de prueba aprobada, la API confirma el pago con Izipay, registra la compra y me matricula; veo un mensaje de éxito y el curso aparece en "Mis cursos".
- Con una tarjeta rechazada, veo el motivo y puedo intentar de nuevo; no se crea la matrícula.
- No puedo comprar dos veces el mismo curso.

### E4 · Aprendizaje
**H08 · Mis cursos** (MVP) · Temas: C3, C5, C11
Como alumno, quiero ver los cursos que compré y mi avance en cada uno.
- Lista mis cursos con su porcentaje de avance.
- Al tocar uno, abre su temario con las lecciones marcadas como vistas o pendientes.

**H09 · Ver una lección** (MVP) · Temas: C2, C4, C5
Como alumno, quiero ver el video de cada lección y marcarla como vista.
- Reproduce el video de la lección dentro de la app.
- "Marcar como vista" guarda el avance en la API y actualiza el porcentaje.
- Botones para ir a la lección anterior y a la siguiente.

**H10 · Pantalla completa al girar el celular** (MVP) · Temas: C4, C8
Como alumno, quiero girar el celular para ver la lección en pantalla completa.
- Con el acelerómetro detecta si el celular está en horizontal y pasa el video a pantalla completa; al volver a vertical, sale.
- El sensor se activa solo en la pantalla de la lección y se libera al salir (limpieza en useEffect).

**H11 · Recordatorio de estudio** (Después) · Temas: C6, C9, C10
Como alumno, quiero programar un recordatorio diario para no dejar mis cursos.
- Elijo una hora y recibo una notificación local cada día.
- La hora se guarda en AsyncStorage.

### E5 · Instructor
**H12 · Crear y editar un curso** (MVP) · Temas: C1, C2, C5, C7, C9
Como instructor, quiero crear un curso desde la app para venderlo.
- Pide título, descripción, categoría, nivel y precio, y valida los campos.
- La portada se toma con la cámara o se elige de la galería (con su permiso).
- El curso se crea como borrador y lo puedo editar.
- Veo la lista de mis cursos con su estado (borrador o publicado).

**H13 · Temario del curso** (MVP) · Temas: C2, C4, C5
Como instructor, quiero agregar secciones y lecciones para armar el contenido.
- Agrego, edito y elimino secciones.
- Dentro de cada sección agrego, edito y elimino lecciones (título y URL del video).

**H14 · Publicar un curso** (MVP) · Temas: C5, C10
Como instructor, quiero publicar un curso para que los alumnos lo vean y lo compren.
- Solo se publica si tiene al menos una lección; si no, avisa por qué.
- Al publicar, aparece en el catálogo.
- Los alumnos reciben una notificación push "Nuevo curso: …" (ver H15).

**H15 · Recibir notificaciones push** (MVP) · Temas: C9, C10, C3
Como alumno, quiero recibir avisos de cursos nuevos.
- Al iniciar sesión, la app pide el permiso de notificaciones y envía su token a la API.
- Recibo la notificación aunque la app esté cerrada.
- Al tocarla, abre el detalle del curso.

**H16 · Resumen de ventas** (Después) · Temas: C1, C5, C11
Como instructor, quiero ver cuántos alumnos y cuánto he vendido por curso.
- Muestra totales y una lista por curso.

## Temas cubiertos
| Tema | Historias MVP |
|---|---|
| C1 Componentes y estilos | H01, H04, H05, H12 |
| C2 Eventos y estado | H01, H02, H07, H09, H12, H13 |
| C3 Navegación | H02, H04, H05, H08, H15 |
| C4 Hooks | H01, H02, H04, H09, H10, H13 |
| C5 Consumo de API | casi todas |
| C6 AsyncStorage / SecureStore | H01, H02 (SecureStore). AsyncStorage solo en H06/H11 (Después) |
| C7 Cámara | H03, H12 |
| C8 Sensores | H10 |
| C9 Permisos | H03, H12, H15 |
| C10 Notificaciones push | H14, H15 |
| C11 Rendimiento | H04, H08 |

**Sin cubrir en el MVP:** ninguno. Solo AsyncStorage (separata S10) queda cubierto por SecureStore, que es su versión segura. Si quieres AsyncStorage tal cual, la opción más barata es subir **H06 · Lista de deseos** al MVP.

## Fuera del alcance (está en la referencia, pero no aporta temas nuevos)
Verificación de correo, recuperar contraseña, verificación en dos pasos, roles y panel de administración, carrito con varios cursos, suscripción y rutas.
