<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class AdminUser extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'admin_users';

    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar_path', 'last_login_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Normalize stored path to clean relative path on save.
     */
    public function setAvatarPathAttribute(?string $value): void
    {
        if ($value && ! preg_match('#^https?://#', $value)) {
            $this->attributes['avatar_path'] = MediaService::cleanRelativePath($value);
        } else {
            $this->attributes['avatar_path'] = $value;
        }
    }

    /**
     * Dynamic URL with avatar fallback.
     */
    public function getAvatarPathAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return MediaService::resolveUrl($value, 'avatar');
    }

    /**
     * Clean up physical avatar file on delete.
     */
    protected static function booted(): void
    {
        static::deleting(function (AdminUser $user) {
            $rawPath = $user->getRawOriginal('avatar_path');
            if ($rawPath) {
                MediaService::deleteImage($rawPath);
            }
        });
    }
}
