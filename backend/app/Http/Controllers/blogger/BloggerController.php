<?php

namespace App\Http\Controllers\blogger;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class BloggerController extends Controller
{
    public function mostViewedBlogs()
    {
        $user = Auth::user();

        $myTopBlogs = Blog::where('user_id', $user->id)
            ->withCount(['viewEvents as views'])
            ->orderByDesc('views')
            ->limit(3)
            ->get(['id', 'title', 'subheader', 'slug', 'featured_image', 'created_at']);

        return response()->json([
            'data' => $myTopBlogs,
        ]);
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        $blogs = Blog::where('user_id', $user->id)
            ->withCount(['viewEvents as views'])
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'subheader', 'slug', 'featured_image', 'created_at']);

        return response()->json([
            'data' => $blogs,
        ]);
    } 

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subheader' => 'nullable|string|max:255',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:5120',
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $i = 1;
        while (Blog::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i++;
        }

        $imageUrl = null;
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('blogs', 'public');
            $imageUrl = '/storage/' . $path;
        }

        $blog = Blog::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'subheader' => $validated['subheader'] ?? null,
            'slug' => $slug,
            'featured_image' => $imageUrl,
        ]);

        return response()->json([
            'message' => 'Blog created successfully',
            'data' => $blog,
        ], 201);
    }

    public function blogDetails($id)
    {
        $user = Auth::user();

        $blog = Blog::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$blog) {
            return response()->json([
                'message' => 'Blog not found',
            ], 404);
        }

        return response()->json([
            'data' => $blog,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $blog = Blog::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$blog) {
            return response()->json([
                'message' => 'Blog not found',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subheader' => 'nullable|string|max:255',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:5120',
            'remove_featured_image' => 'nullable|boolean',
        ]);

        $blog->title = $validated['title'];
        $blog->subheader = $validated['subheader'] ?? null;
        $blog->content = $validated['content'];

        // Handle featured image replacement/removal
        if ($request->hasFile('featured_image')) {
            // Delete old image if exists
            if ($blog->featured_image) {
                $relative = ltrim(str_replace('/storage/', '', $blog->featured_image), '/');
                if ($relative) {
                    Storage::disk('public')->delete($relative);
                }
            }
            $path = $request->file('featured_image')->store('blogs', 'public');
            $blog->featured_image = '/storage/' . $path;
        } elseif ($request->boolean('remove_featured_image')) {
            if ($blog->featured_image) {
                $relative = ltrim(str_replace('/storage/', '', $blog->featured_image), '/');
                if ($relative) {
                    Storage::disk('public')->delete($relative);
                }
            }
            $blog->featured_image = null;
        }

        $blog->save();

        return response()->json([
            'message' => 'Blog updated successfully',
            'data' => $blog,
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();

        $blog = Blog::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$blog) {
            return response()->json([
                'message' => 'Blog not found',
            ], 404);
        }

        if ($blog->featured_image) {
            $relative = ltrim(str_replace('/storage/', '', $blog->featured_image), '/');
            if ($relative) {
                Storage::disk('public')->delete($relative);
            }
        }

        $blog->delete();

        return response()->json([
            'message' => 'Blog deleted successfully',
        ]);
    }

    public function updateAccount($id)
    {
        $user = request()->user();

        $validator = Validator::make(request()->all(), [
            'action' => ['required', 'in:activate,deactivate,delete'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $action = request()->input('action');

        if ($action === 'activate') {
            if ($user->status === 'active') {
                return response()->json(['message' => 'Account is already active', 'status' => $user->status]);
            }
            $user->status = 'active';
            $user->save();

            return response()->json(['message' => 'Account activated successfully', 'status' => $user->status]);
        }

        if ($action === 'deactivate') {
            if ($user->status === 'deactivated') {
                return response()->json(['message' => 'Account is already deactivated', 'status' => $user->status]);
            }
            $user->status = 'deactivated';
            $user->save();

            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            return response()->json(['message' => 'Account deactivated successfully', 'status' => $user->status]);
        }

        $blogs = Blog::where('user_id', $user->id)->get(['id', 'featured_image']);
        foreach ($blogs as $blog) {
            if ($blog->featured_image) {
                $relative = ltrim(str_replace('/storage/', '', $blog->featured_image), '/');
                if ($relative) {
                    Storage::disk('public')->delete($relative);
                }
            }
        }
        Blog::where('user_id', $user->id)->delete();

        if (!empty($user->profile_image_path)) {
            $oldPath = ltrim(preg_replace('#^storage/#i', '', $user->profile_image_path), '/');
            if ($oldPath) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        // Finally delete user
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
}