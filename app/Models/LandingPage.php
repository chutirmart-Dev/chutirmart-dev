<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LandingPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'hero_headline', 'hero_subtext', 'hero_image_path',
        'product_id', 'sections', 'cta_button_text', 'facebook_pixel_id', 'ga_id', 'status',
    ];

    protected $casts = [
        'sections' => 'json',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Normalize stored path to clean relative path on save.
     */
    public function setHeroImagePathAttribute(?string $value): void
    {
        if ($value && ! preg_match('#^https?://#', $value)) {
            $this->attributes['hero_image_path'] = MediaService::cleanRelativePath($value);
        } else {
            $this->attributes['hero_image_path'] = $value;
        }
    }

    /**
     * Dynamic URL with fallback.
     */
    public function getHeroImagePathAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return MediaService::resolveUrl($value, 'banner');
    }

    /**
     * Clean up physical image file on delete.
     */
    protected static function booted(): void
    {
        static::deleting(function (LandingPage $page) {
            $rawPath = $page->getRawOriginal('hero_image_path');
            if ($rawPath) {
                MediaService::deleteImage($rawPath);
            }
        });
    }
}
