<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogView;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class BlogViewSeeder extends Seeder
{
    public function run(): void
    {
        $blogs = Blog::all();
        if ($blogs->isEmpty()) {
            return; // no blogs to attach views
        }

        // For each blog, create a variable number of views
        $blogs->each(function ($blog) {
            $count = random_int(25, 150);
            BlogView::factory()->count($count)->create(['blog_id' => $blog->id]);
        });

        // Sync the denormalized blogs.views counter to match blog_views counts
        // Reset all to 0 first, then set exact counts via a JOIN update
        DB::table('blogs')->update(['views' => 0]);
        DB::statement(
            'UPDATE blogs b
             JOIN (
               SELECT blog_id, COUNT(*) AS cnt
               FROM blog_views
               GROUP BY blog_id
             ) v ON v.blog_id = b.id
             SET b.views = v.cnt'
        );
    }
}
