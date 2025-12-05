<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'featured_image',
        'content',
        'subheader',
        'slug',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function viewEvents()
    {
        return $this->hasMany(BlogView::class, 'blog_id');
    }
}
