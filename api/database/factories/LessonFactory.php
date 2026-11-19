<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\Section;
use Database\Seeders\CatalogSeeder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'section_id' => Section::factory(),
            'title' => Str::ucfirst(fake()->words(4, true)),
            'video_url' => fake()->randomElement(CatalogSeeder::SAMPLE_VIDEOS),
            'position' => 1,
        ];
    }
}
