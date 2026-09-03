<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'customer_name', 'rating', 'review_text', 'status', 'verified'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
