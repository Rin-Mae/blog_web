<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Services\BlogViewService;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function show(Request $request, int $id, BlogViewService $viewService)
    {
        $blog = Blog::findOrFail($id);

        $viewService->recordView($blog->id, $request);

        return response()->json($blog);
    }
}
