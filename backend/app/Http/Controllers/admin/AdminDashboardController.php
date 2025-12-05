<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogView;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function summary()
    {
        $totalBlogs = Blog::count();
        $totalBloggers = User::role('blogger')->count();
        $totalViews = BlogView::count();
        $totalViewsMonth = BlogView::where('created_at', '>=', now()->subMonth())->count();
        $totalViewsWeek = BlogView::where('created_at', '>=', now()->subWeek())->count();
        return compact('totalBlogs', 'totalBloggers', 'totalViews', 'totalViewsMonth', 'totalViewsWeek');
    }

    public function trafficTrends()
    {
        $start = now()->subMonths(11)->startOfMonth();
        $raw = BlogView::where('created_at', '>=', $start)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as views')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $m = now()->subMonths($i)->format('Y-m');
            $months->push([
                'month' => $m,
                'views' => (int) ($raw[$m]->views ?? 0),
            ]);
        }

        $blogsPerMonth = Blog::where('created_at', '>=', $start)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as newBlogs')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'trafficOverTime' => $months,
            'blogsPerMonth' => $blogsPerMonth,
        ]);
    }

    public function leaderboards()
    {
        // Top 5 blogs by total views (from events)
        $topBlogs = BlogView::selectRaw('blog_id, COUNT(*) as views')
            ->groupBy('blog_id')
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                $blog = Blog::find($row->blog_id);
                return [
                    'id' => $row->blog_id,
                    'title' => $blog?->title ?? 'Unknown',
                    'views' => (int) $row->views,
                ];
            });

        // Top bloggers by views: sum views for blogs authored by each user
        $topBloggers = BlogView::join('blogs', 'blog_views.blog_id', '=', 'blogs.id')
            ->join('users', 'blogs.user_id', '=', 'users.id')
            ->selectRaw('users.id as id, CONCAT(users.firstname, " ", users.lastname) as name, COUNT(blog_views.id) as views')
            ->groupBy('users.id', 'users.firstname', 'users.lastname')
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->name ?? 'Unknown',
                    'views' => (int) $row->views,
                ];
            });

        return response()->json([
            'topBlogs' => $topBlogs,
            'topBloggers' => $topBloggers,
        ]);
    }

    public function recentActivity(Request $request)
    {
        // Return a simple, non-paginated recent blogs list limited by `perPage`.
        $perPage = (int) ($request->query('perPage', 10));
        $perPage = $perPage > 0 && $perPage <= 50 ? $perPage : 10;

        $blogs = Blog::with('user')
            ->orderByDesc('created_at')
            ->take($perPage)
            ->get();

        $items = $blogs->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'author' => trim(($b->user->firstname ?? '') . ' ' . ($b->user->lastname ?? '')) ?: ($b->user->email ?? 'Unknown'),
                'created' => $b->created_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'recentBlogs' => $items,
        ]);
    }
}
