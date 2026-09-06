<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariation extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'sku', 'price', 'sale_price',
        'stock_quantity', 'stock_status', 'image_path', 'weight', 'status',
    ];

    protected $casts = [
        'price' => 'float',
        'sale_price' => 'float',
        'stock_quantity' => 'integer',
        'weight' => 'float',
    ];

    protected $appends = ['label', 'effective_price'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The attribute options that make up this variation (e.g., Size=M + Color=Black).
     */
    public function options(): BelongsToMany
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_variation_options',
            'variation_id',
            'option_id'
        )->with('attribute');
    }

    /**
     * Scope: only active variations.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Accessor: human-readable label like "M / Black".
     */
    public function getLabelAttribute(): string
    {
        return $this->options->pluck('value')->implode(' / ');
    }

    /**
     * Accessor: the effective selling price (falls back to product's discounted price).
     */
    public function getEffectivePriceAttribute(): float
    {
        if ($this->sale_price !== null) {
            return (float) $this->sale_price;
        }

        if ($this->price !== null) {
            return (float) $this->price;
        }

        return (float) ($this->product?->discounted_price ?? 0);
    }
}
