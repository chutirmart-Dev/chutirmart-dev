<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'product_code', 'short_description', 'description',
        'price', 'compare_at_price', 'discount_type', 'discount_value',
        'cost_price', 'stock_quantity', 'low_stock_threshold', 'brand_id',
        'youtube_url', 'meta_title', 'meta_description', 'status', 'total_sold',
    ];

    protected $appends = ['discounted_price', 'discount_percentage'];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_category');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function mainImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_main', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // Accessors
    public function getDiscountedPriceAttribute(): float
    {
        $price = (float) ($this->price ?? 0);

        switch ($this->discount_type) {
            case 'percentage':
                return round($price * (1 - ((float) $this->discount_value) / 100), 2);
            case 'fixed':
                return max(0, round($price - ((float) $this->discount_value), 2));
            default:
                return round($price, 2);
        }
    }

    public function getDiscountPercentageAttribute(): int
    {
        if ($this->discount_type === 'percentage') {
            return (int) $this->discount_value;
        }

        if ($this->discount_type === 'fixed' && $this->price > 0) {
            return (int) round(($this->discount_value / $this->price) * 100);
        }

        return 0;
    }
}
