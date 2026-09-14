<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'customer_name',
        'customer_designation',
        'customer_avatar',
        'rating',
        'review_text',
        'status',
        'verified',
        'show_on_home',
        'sort_order',
    ];

    protected $casts = [
        'rating' => 'integer',
        'verified' => 'boolean',
        'show_on_home' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'avatar_url',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the resolved public URL for customer avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (empty($this->customer_avatar)) {
            return null;
        }

        return MediaService::resolveUrl($this->customer_avatar, 'avatar');
    }
}
