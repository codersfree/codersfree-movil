<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public const INSTRUCTOR_ROLE = 'instructor';

    /**
     * Permisos del panel instructor. Cada uno se llama igual que la ruta que protege.
     *
     * @var list<string>
     */
    public const INSTRUCTOR_PERMISSIONS = [
        'instructor.categories.index',
        'instructor.courses.index',
        'instructor.courses.store',
        'instructor.courses.show',
        'instructor.courses.update',
        'instructor.courses.cover',
        'instructor.courses.publish',
        'instructor.sections.store',
        'instructor.sections.update',
        'instructor.sections.destroy',
        'instructor.lessons.store',
        'instructor.lessons.update',
        'instructor.lessons.destroy',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        self::instructorRole();
    }

    /**
     * Crea (si falta) el rol instructor con todos sus permisos y lo devuelve.
     */
    public static function instructorRole(): Role
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::INSTRUCTOR_PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        // Con WithoutModelEvents spatie no limpia su caché solo; se limpia aquí.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $role = Role::findOrCreate(self::INSTRUCTOR_ROLE);
        $role->syncPermissions(self::INSTRUCTOR_PERMISSIONS);

        return $role;
    }
}
