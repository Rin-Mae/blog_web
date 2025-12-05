<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure there are authors; prefer users with 'blogger' role
        $bloggerCount = User::role('blogger')->count();
        if ($bloggerCount === 0) {
            // If no bloggers, just ensure some users exist
            if (User::count() === 0) {
                User::factory()->count(10)->create();
            }
        }

        // Create blogs distributed across available bloggers
        $totalBlogs = 100;
        Blog::factory()->count($totalBlogs)->create();
    }
}
