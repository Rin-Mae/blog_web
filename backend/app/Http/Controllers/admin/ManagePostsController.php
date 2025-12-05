<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ManagePostsController extends Controller
{
    public function index()
    {
        $perPage = (int) request()->query('per_page', 12);
        $search = trim((string) request()->query('search', ''));
        $sort = (string) request()->query('sort', 'published_desc');

        $blogs = Blog::with(['user:id,firstname,lastname'])
            ->withCount(['viewEvents as views_count'])
            ->addSelect(['id', 'user_id', 'title', 'subheader', 'featured_image', 'created_at'])
            ->when($search !== '', function ($q) use ($search) {
                $needle = preg_replace('/\s+/', ' ', strtolower($search));

                $q->where(function ($qq) use ($needle) {
                    $qq->whereRaw('LOWER(title) LIKE ?', ["%{$needle}%"])
                        ->orWhereHas('user', function ($uq) use ($needle) {
                            $uq->whereRaw("LOWER(CONCAT(COALESCE(firstname,''),' ',COALESCE(lastname,''))) LIKE ?", ["%{$needle}%"])
                                ->orWhereRaw('LOWER(firstname) LIKE ?', ["%{$needle}%"])
                                ->orWhereRaw('LOWER(lastname) LIKE ?', ["%{$needle}%"]);
                        });
                });
            })
            ->when(true, function ($q) use ($sort) {
                switch ($sort) {
                    case 'published_asc':
                        $q->orderBy('created_at', 'asc')
                            ->orderBy('id', 'asc');
                        break;
                    case 'views_desc':
                        $q->orderBy('views_count', 'desc')
                            ->orderBy('id', 'desc');
                        break;
                    case 'views_asc':
                        $q->orderBy('views_count', 'asc')
                            ->orderBy('id', 'asc');
                        break;
                    case 'title_asc':
                        $q->orderByRaw('LOWER(title) ASC')
                            ->orderBy('id', 'asc');
                        break;
                    case 'title_desc':
                        $q->orderByRaw('LOWER(title) DESC')
                            ->orderBy('id', 'desc');
                        break;
                    case 'published_desc':
                    default:
                        $q->orderBy('created_at', 'desc')
                            ->orderBy('id', 'desc');
                        break;
                }
            })
            ->paginate($perPage);

        $blogs->getCollection()->transform(function ($blog) {
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

        return response()->json($blogs);
    }

    public function show($id)
    {
        $blog = Blog::with(['user:id,firstname,lastname'])->findOrFail($id);

        return response()->json($blog);
    }

    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();

        return response()->json([
            'message' => 'Blog post deleted successfully.',
        ]);
    }
}
