<?php

namespace Database\Factories;

use App\Enums\CourseLevel;
use App\Enums\CourseStatus;
use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::ucfirst(fake()->unique()->words(3, true));

        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(),
            'level' => fake()->randomElement(CourseLevel::cases()),
            'price' => fake()->randomElement(['39.90', '59.90', '69.90', '79.90']),
            'status' => CourseStatus::Draft,
        ];
    }

    /**
     * A course visible in the catalog.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CourseStatus::Published,
            'published_at' => now(),
        ]);
    }

    /**
     * Add sections with lessons to the course.
     */
    public function withSyllabus(int $sections = 2, int $lessonsPerSection = 3): static
    {
        return $this->has(
            Section::factory()
                ->count($sections)
                ->sequence(fn ($sequence) => ['position' => $sequence->index + 1])
                ->has(
                    Lesson::factory()
                        ->count($lessonsPerSection)
                        ->sequence(fn ($sequence) => ['position' => $sequence->index + 1])
                )
        );
    }
}
