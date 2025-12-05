<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Storage;

/**
 * App\Models\User
 *
 * @mixin \Spatie\Permission\Traits\HasRoles
 * @method \Illuminate\Support\Collection getRoleNames()
 * @method \Illuminate\Support\Collection getAllPermissions()
 * @method bool hasRole(string|array $roles)
 * @method \Spatie\Permission\Models\Role|\Spatie\Permission\Models\Permission assignRole(...$roles)
 * @method \Spatie\Permission\Models\Permission givePermissionTo(...$permissions)
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstname',
        'lastname',
        'middlename',
        'gender',
        'age',
        'address',
        'birthdate',
        'contact_number',
        'email',
        'profile_image_path',
        'password',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected $appends = [
        'profile_image_url',
    ];

    public function getProfileImageUrlAttribute(): ?string
    {
        return $this->profile_image_path
            ? asset(Storage::url($this->profile_image_path))
            : null;
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($user) {
            if (!$user->hasAnyRole(['blogger', 'admin'])) {
                $user->assignRole('blogger');
            }
        });
    }

    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }
}
