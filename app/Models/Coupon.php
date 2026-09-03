<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount',
        'max_uses', 'used_count', 'expires_at', 'status',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function isValidForAmount(float $amount): bool
    {
        if ($this->status !== 'active') {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }
        if ($amount < $this->min_order_amount) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        if (! $this->isValidForAmount($amount)) {
            return 0.0;
        }

        if ($this->type === 'percentage') {
            return round($amount * ($this->value / 100), 2);
        }

        return min($amount, (float) $this->value);
    }
}
