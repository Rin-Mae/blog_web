<?php

use App\Http\Controllers\admin\AdminDashboardController;
use App\Http\Controllers\admin\ManagePostsController;
use App\Http\Controllers\admin\ManageUsersController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthenticateController;
use App\Http\Controllers\blogger\BloggerController;
use App\Http\Controllers\public\PublicController;
use App\Http\Controllers\Public\PublicBlogController;
use Illuminate\Support\Facades\Route;
use App\Models\Blog;
use App\Services\BlogViewService;
use Illuminate\Http\Request;

Route::controller(AuthenticateController::class)->group(function () {
    Route::post('login', 'login')->name('login');  //done
    Route::post('register', 'register')->name('register');  //done
});

// Public endpoints (no auth required)
Route::get('blogs/trending', [PublicBlogController::class, 'trending'])->name('public.blogs.trending');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthenticateController::class, 'logout'])  //done
        ->name('logout');

    Route::get('user', [AuthenticateController::class, 'user'])->name('user'); //done

    Route::prefix('admin')->middleware('role:admin')->group(function () {

        Route::resource('users', ManageUsersController::class)
            ->only(['index', 'show', 'edit', 'update', 'destroy']);
        Route::patch('users/status/{id}', [ManageUsersController::class, 'updateStatus'])
            ->name('admin.users.updateStatus');

        Route::controller(AdminDashboardController::class)->group(function () {
            Route::get('dashboard/summary', 'summary')->name('admin.dashboard.summary');
            Route::get('dashboard/trends', 'trafficTrends')->name('admin.dashboard.trends');
            Route::get('dashboard/leaderboards', 'leaderboards')->name('admin.dashboard.leaderboards');
            Route::get('dashboard/activity', 'recentActivity')->name('admin.dashboard.activity');
        });

        Route::get('profile', [ProfileController::class, 'show'])->name('admin.profile');
        Route::patch('profile', [ProfileController::class, 'update'])->name('admin.profile.update');

        Route::get('posts', [ManagePostsController::class, 'index'])->name('admin.posts.index');
        Route::get('posts/{id}', [ManagePostsController::class, 'show'])->name('admin.posts.show');
        Route::delete('posts/{id}', [ManagePostsController::class, 'destroy'])->name('admin.posts.delete');
    });

    Route::prefix('blogger')->middleware('role:blogger')->group(function () {
        Route::get('most-viewed-blogs', [BloggerController::class, 'mostViewedBlogs'])
            ->name('blogger.mostViewedBlogs');

        Route::get('blogs', [BloggerController::class, 'index'])
            ->name('blogger.blogs.index');

        Route::post('blogs', [BloggerController::class, 'store'])
            ->name('blogger.blogs.store');
        Route::get('blogs/{id}', [BloggerController::class, 'blogDetails'])->name('blogger.blogs.details');
        Route::patch('blogs/{id}', [BloggerController::class, 'update'])
            ->name('blogger.blogs.update');
        Route::delete('blogs/{id}', [BloggerController::class, 'destroy'])
            ->name('blogger.blogs.delete');


        Route::get('profile', [ProfileController::class, 'show'])->name('blogger.profile');
        Route::patch('profile', [ProfileController::class, 'update'])->name('blogger.profile.update');
        Route::patch('profile/settings/{id}', [BloggerController::class, 'updateAccount'])
            ->name('blogger.profile.updateSettings');
    });
});

Route::prefix('public')->group(function () {
    Route::get('blogs', [PublicController::class, 'index'])->name('public.blogs.index');
    Route::get('blogs/{id}', function (Request $request, int $id) {
        $service = app(BlogViewService::class);
        $service->recordView($id, $request);
        $controller = app(PublicController::class);
        return $controller->show($id);
    })->name('public.blogs.show');
    Route::get('blogs/random/{count?}', [PublicController::class, 'randomBlogs'])
        ->name('public.blogs.random');
});
