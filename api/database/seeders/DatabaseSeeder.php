<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        User::factory()->instructor()->create([
            'name' => 'Coders Free',
            'email' => 'instructor@codersfree.com',
        ]);

        User::factory()->create([
            'name' => 'María Ríos',
            'email' => 'alumno@codersfree.com',
        ]);

        $this->call(CatalogSeeder::class);
    }
}
