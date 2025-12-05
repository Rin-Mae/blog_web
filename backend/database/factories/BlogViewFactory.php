<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\BlogView;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogView>
 */
class BlogViewFactory extends Factory
{
    protected $model = BlogView::class;

    public function definition(): array
    {
        $blogId = Blog::inRandomOrder()->value('id') ?? Blog::factory()->create()->id;
        $viewerQuery = User::query();
        $userId = $this->faker->boolean(50) ? ($viewerQuery->inRandomOrder()->value('id')) : null; // 50% logged-in views
        return [
            'blog_id' => $blogId,
            'user_id' => $userId,
            'ip' => $this->faker->ipv4(),
            'user_agent' => substr($this->faker->userAgent(), 0, 512),
            'created_at' => $this->faker->dateTimeBetween('-90 days', 'now'),
            'updated_at' => now(),
        ];
    }
}