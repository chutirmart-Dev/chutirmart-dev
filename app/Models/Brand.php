<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'logo_path', 'description', 'status'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Normalize stored path to clean relative path on save.
     */
    public function setLogoPathAttribute(?string $value): void
    {
        if ($value && ! preg_match('#^https?://#', $value)) {
            $this->attributes['logo_path'] = MediaService::cleanRelativePath($value);
        } else {
            $this->attributes['logo_path'] = $value;
        }
    }

    /**
     * Dynamic URL with fallback.
     */
    public function getLogoPathAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return MediaService::resolveUrl($value, 'logo');
    }

    /**
     * Clean up physical logo file on delete.
     */
    protected static function booted(): void
    {
        static::deleting(function (Brand $brand) {
            $rawPath = $brand->getRawOriginal('logo_path');
            if ($rawPath) {
                MediaService::deleteImage($rawPath);
            }
        });
    }
}
