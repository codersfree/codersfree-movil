<?php

namespace Database\Seeders;

use App\Enums\CourseLevel;
use App\Enums\CourseStatus;
use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Categorías y cursos de ejemplo de Coders Free para que el catálogo no esté vacío.
 */
class CatalogSeeder extends Seeder
{
    /**
     * Videos públicos de prueba; las lecciones de ejemplo los alternan.
     *
     * @var list<string>
     */
    public const SAMPLE_VIDEOS = [
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    ];

    /**
     * @var array<string, list<array{title: string, level: CourseLevel, price: string, description: string, sections: array<string, list<string>>}>>
     */
    private const CATALOG = [
        'Laravel' => [
            ['title' => 'Laravel desde cero', 'level' => CourseLevel::Basico, 'price' => '59.90', 'description' => 'Aprende a crear aplicaciones web con Laravel: rutas, controladores, vistas, base de datos con Eloquent y autenticación.', 'sections' => [
                'Introducción' => ['¿Qué es Laravel?', 'Instalación y primer proyecto', 'Estructura de carpetas'],
                'Rutas y controladores' => ['Definir rutas', 'Controladores', 'Parámetros y nombres de ruta', 'Middleware'],
                'Base de datos' => ['Migraciones', 'Modelos con Eloquent', 'Relaciones'],
            ]],
            ['title' => 'API REST con Laravel y Sanctum', 'level' => CourseLevel::Intermedio, 'price' => '69.90', 'description' => 'Construye una API REST profesional con autenticación por tokens, validación y recursos.', 'sections' => [
                'Fundamentos de una API' => ['Qué es REST', 'Rutas de API y versiones', 'Respuestas JSON'],
                'Autenticación con Sanctum' => ['Tokens de acceso', 'Registro e inicio de sesión', 'Proteger rutas'],
                'Buenas prácticas' => ['Form Requests', 'API Resources', 'Pruebas con Pest'],
            ]],
            ['title' => 'Livewire paso a paso', 'level' => CourseLevel::Intermedio, 'price' => '59.90', 'description' => 'Crea interfaces dinámicas sin salir de PHP usando componentes de Livewire.', 'sections' => [
                'Primeros componentes' => ['Instalación', 'Propiedades y acciones', 'Formularios'],
                'Proyecto práctico' => ['Lista de tareas', 'Búsqueda en vivo', 'Paginación'],
            ]],
            ['title' => 'Laravel avanzado: colas y eventos', 'level' => CourseLevel::Avanzado, 'price' => '79.90', 'description' => 'Lleva tus aplicaciones al siguiente nivel con colas, eventos, notificaciones y tareas programadas.', 'sections' => [
                'Colas' => ['Jobs y workers', 'Reintentos y fallos', 'Horizon'],
                'Eventos y notificaciones' => ['Eventos y listeners', 'Notificaciones por correo', 'Tareas programadas'],
            ]],
        ],
        'React Native' => [
            ['title' => 'React Native con Expo', 'level' => CourseLevel::Intermedio, 'price' => '79.90', 'description' => 'Desarrolla apps móviles para Android e iOS con React Native y Expo Router.', 'sections' => [
                'Primeros pasos' => ['Crear el proyecto con Expo', 'Componentes básicos', 'Estilos'],
                'Navegación' => ['Expo Router', 'Pestañas y pilas', 'Rutas protegidas'],
                'Datos' => ['Consumir una API', 'Contexto y hooks propios', 'SecureStore'],
            ]],
            ['title' => 'Hooks de React en la práctica', 'level' => CourseLevel::Basico, 'price' => '39.90', 'description' => 'Domina useState, useEffect, useContext y crea tus propios hooks.', 'sections' => [
                'Hooks básicos' => ['useState', 'useEffect', 'useRef'],
                'Hooks avanzados' => ['useContext', 'useMemo y useCallback', 'Hooks propios'],
            ]],
            ['title' => 'Apps nativas: cámara, sensores y notificaciones', 'level' => CourseLevel::Avanzado, 'price' => '69.90', 'description' => 'Usa las capacidades del celular: cámara, acelerómetro, permisos y notificaciones push.', 'sections' => [
                'Permisos y cámara' => ['Pedir permisos', 'Tomar fotos', 'Galería'],
                'Sensores y push' => ['Acelerómetro', 'Notificaciones locales', 'Notificaciones push'],
            ]],
        ],
        'Frontend' => [
            ['title' => 'Tailwind CSS práctico', 'level' => CourseLevel::Basico, 'price' => '39.90', 'description' => 'Diseña interfaces modernas y responsivas con las clases utilitarias de Tailwind CSS.', 'sections' => [
                'Fundamentos' => ['Instalación', 'Clases utilitarias', 'Colores y tipografía'],
                'Diseño responsivo' => ['Breakpoints', 'Flexbox y Grid', 'Modo oscuro'],
            ]],
            ['title' => 'JavaScript moderno', 'level' => CourseLevel::Basico, 'price' => '49.90', 'description' => 'Aprende JavaScript desde lo básico hasta promesas, async/await y módulos.', 'sections' => [
                'Lo esencial' => ['Variables y tipos', 'Funciones', 'Arreglos y objetos'],
                'Asincronía' => ['Promesas', 'async/await', 'fetch'],
            ]],
            ['title' => 'Vue 3 desde cero', 'level' => CourseLevel::Intermedio, 'price' => '59.90', 'description' => 'Construye aplicaciones reactivas con Vue 3 y la Composition API.', 'sections' => [
                'Composition API' => ['ref y reactive', 'computed y watch', 'Componentes'],
                'Proyecto' => ['Vue Router', 'Pinia', 'Consumir una API'],
            ]],
        ],
        'Bases de datos' => [
            ['title' => 'MySQL para desarrolladores', 'level' => CourseLevel::Basico, 'price' => '49.90', 'description' => 'Diseña tablas, escribe consultas y entiende índices y relaciones en MySQL.', 'sections' => [
                'Consultas' => ['SELECT y filtros', 'JOIN', 'Agrupaciones'],
                'Diseño' => ['Normalización', 'Claves foráneas', 'Índices'],
            ]],
            ['title' => 'Git y GitHub', 'level' => CourseLevel::Basico, 'price' => '39.90', 'description' => 'Controla las versiones de tus proyectos y trabaja en equipo con ramas y pull requests.', 'sections' => [
                'Git' => ['Commits', 'Ramas', 'Merge y conflictos'],
                'GitHub' => ['Repositorios remotos', 'Pull requests', 'Revisión de código'],
            ]],
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $instructor = User::where('email', 'instructor@codersfree.com')->firstOrFail();
        $publishedAt = now()->subDays(30);

        foreach (self::CATALOG as $categoryName => $courses) {
            $category = Category::firstOrCreate(['slug' => Str::slug($categoryName)], ['name' => $categoryName]);

            foreach ($courses as $data) {
                $course = Course::create([
                    'user_id' => $instructor->id,
                    'category_id' => $category->id,
                    'title' => $data['title'],
                    'slug' => Str::slug($data['title']),
                    'description' => $data['description'],
                    'level' => $data['level'],
                    'price' => $data['price'],
                    'status' => CourseStatus::Published,
                    'published_at' => $publishedAt = $publishedAt->copy()->addDay(),
                ]);

                $sectionPosition = 1;
                foreach ($data['sections'] as $sectionTitle => $lessons) {
                    $section = $course->sections()->create(['title' => $sectionTitle, 'position' => $sectionPosition++]);

                    foreach ($lessons as $index => $lessonTitle) {
                        $section->lessons()->create([
                            'title' => $lessonTitle,
                            'video_url' => self::SAMPLE_VIDEOS[$index % count(self::SAMPLE_VIDEOS)],
                            'position' => $index + 1,
                        ]);
                    }
                }
            }
        }

        // El alumno de ejemplo ya tiene un curso, para ver "Ir al curso" en el detalle.
        User::where('email', 'alumno@codersfree.com')->first()
            ?->enrolledCourses()
            ->syncWithoutDetaching([Course::where('slug', 'git-y-github')->value('id')]);
    }
}
