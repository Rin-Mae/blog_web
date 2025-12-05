<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicBlogController extends Controller
{
    /**
     * Return top trending blogs (most viewed) for public consumption.
     *
     * GET /api/blogs/trending
     */
    public function trending()
    {
        $limit = (int) request()->query('limit', 5);

        $blogs = Blog::with(['user:id,firstname,lastname'])
            ->withCount(['viewEvents as views_count'])
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get(['id', 'user_id', 'title', 'subheader', 'featured_image', 'created_at']);

        $blogs->transform(function ($blog) {
            $path = $blog->featured_image;
            if (!$path) {
                $blog->featured_image_url = null;
                return $blog;
            }

            if (Str::startsWith($path, ['http://', 'https://'])) {
                $blog->featured_image_url = $path;
                return $blog;
            }

            if (Str::startsWith($path, '/storage/')) {
                $blog->featured_image_url = url($path);
                return $blog;
            }

            if (Str::startsWith($path, 'storage/')) {
                $blog->featured_image_url = url('/' . $path);
                return $blog;
            }

            if (Str::startsWith($path, 'public/')) {
                $path = Str::substr($path, 7);
            }

            $relative = Storage::url($path);
            $blog->featured_image_url = url($relative);
            return $blog;
        });

        return response()->json([
            'data' => $blogs,
        ]);
    }

    /**
     * Public show blog by id
     * GET /api/blogs/{id}
     */
    public function show($id)
    {
        $blog = Blog::with(['user:id,firstname,lastname'])
            ->withCount(['viewEvents as views_count'])
            ->find($id, ['id', 'user_id', 'title', 'subheader', 'content', 'featured_image', 'created_at']);

        if (!$blog) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $path = $blog->featured_image;
        if (!$path) {
            $blog->featured_image_url = null;
        } else {
            if (Str::startsWith($path, ['http://', 'https://'])) {
                $blog->featured_image_url = $path;
            } elseif (Str::startsWith($path, '/storage/')) {
                $blog->featured_image_url = url($path);
            } elseif (Str::startsWith($path, 'storage/')) {
                $blog->featured_image_url = url('/' . $path);
            } else {
                if (Str::startsWith($path, 'public/')) {
                    $path = Str::substr($path, 7);
                }
                $relative = Storage::url($path);
                $blog->featured_image_url = url($relative);
            }
        }

        return response()->json(['data' => $blog]);
    }
}
