<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

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

        if (str_starts_with($this->customer_avatar, 'http://') || str_starts_with($this->customer_avatar, 'https://')) {
            return $this->customer_avatar;
        }

        if (str_starts_with($this->customer_avatar, '/storage/')) {
            return $this->customer_avatar;
        }

        return Storage::url($this->customer_avatar);
    }
}
