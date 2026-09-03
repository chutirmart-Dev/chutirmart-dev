<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'image_path', 'sort_order', 'is_main'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

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
     * Resolve product image to active dynamic asset URL with fallback protection.
     */
    public function getImagePathAttribute(?string $value): ?string
    {
        return MediaService::resolveUrl($value, 'product');
    }

    /**
     * Clean up physical disk file safely on delete.
     */
    protected static function booted(): void
    {
        static::deleting(function (ProductImage $img) {
            $rawPath = $img->getRawOriginal('image_path');
            if ($rawPath) {
                MediaService::deleteImage($rawPath);
            }
        });
    }
}
