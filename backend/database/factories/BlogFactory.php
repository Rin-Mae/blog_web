<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Blog>
 */
class BlogFactory extends Factory
{
    protected $model = Blog::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(6, true);
        $slugBase = Str::slug($title);
        $slug = $slugBase . '-' . Str::random(6);

        // Prefer bloggers; fall back to any user
        $authorId = User::role('blogger')->inRandomOrder()->value('id')
            ?? User::inRandomOrder()->value('id');

        return [
            'user_id' => $authorId,
            'title' => $title,
            'featured_image' => null,
            'content' => $this->faker->paragraphs(6, true),
            'subheader' => $this->faker->sentence(12, true),
            'slug' => $slug,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => now(),
        ];
    }
}