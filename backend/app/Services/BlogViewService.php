<?php

namespace App\Services;

use App\Models\BlogView;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BlogViewService
{
    /**
     * Record a unique blog view with cooldown logic.
     *
     * @param int $blogId
     * @param Request $request
     * @param int|null $cooldownMinutes Optional override for cooldown duration
     * @return bool True when a new view was recorded, false if skipped due to cooldown
     */
    public function recordView(int $blogId, Request $request, ?int $cooldownMinutes = null): bool
    {
        $cooldownMinutes = $cooldownMinutes ?? (int) (config('blog.view_cooldown_minutes', 60));
        $cooldownFrom = Carbon::now()->subMinutes($cooldownMinutes);

        $user = $request->user();
        $userId = $user ? $user->id : null;
        $ip = $request->ip();
        $userAgent = (string) $request->userAgent();

        $query = BlogView::query()->where('blog_id', $blogId)
            ->where('created_at', '>=', $cooldownFrom);

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('user_id', null)
                ->where('ip', $ip)
                ->where('user_agent', $userAgent);
        }

        $exists = $query->exists();
        if ($exists) {
            return false;
        }

        BlogView::create([
            'blog_id' => $blogId,
            'user_id' => $userId,
            'ip' => $ip,
            'user_agent' => $userAgent,
        ]);

        return true;
    }
}
