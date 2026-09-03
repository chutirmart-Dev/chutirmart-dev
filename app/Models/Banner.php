<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'image_path', 'position', 'link_url', 'sort_order', 'status', 'scheduled_at', 'expires_at'];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Normalize stored path to clean relative path on save.
     */
    public function setImagePathAttribute(?string $value): void
    {
        if ($value && ! preg_match('#^https?://#', $value)) {
            $this->attributes['image_path'] = MediaService::cleanRelativePath($value);
        } else {
            $this->attributes['image_path'] = $value;
        }
    }

    /**
     * Resolve image path to active dynamic asset URL with fallback.
     */
    public function getImagePathAttribute(?string $value): ?string
    {
        return MediaService::resolveUrl($value, 'banner');
    }

    /**
     * Automatically clean up image file on deletion safely.
     */
    protected static function booted(): void
    {
        static::deleting(function (Banner $banner) {
            $rawPath = $banner->getRawOriginal('image_path');
            if ($rawPath) {
                MediaService::deleteImage($rawPath);
            }
        });
    }
}
