<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'customer_name',
        'mobile',
        'district',
        'thana',
        'address',
        'customer_id',
        'subtotal',
        'delivery_charge',
        'coupon_discount',
        'total',
        'coupon_code',
        'coupon_id',
        'payment_method',
        'payment_status',
        'courier_name',
        'consignment_id',
        'courier_tracking_code',
        'courier_status',
        'courier_response',
        'courier_sent_at',
        'status',
        'special_notes',
        'internal_notes',
        'ip_address',
    ];

    protected $casts = [
        'courier_response' => 'array',
        'courier_sent_at' => 'datetime',
        'subtotal' => 'float',
        'delivery_charge' => 'float',
        'coupon_discount' => 'float',
        'total' => 'float',
    ];

    protected $appends = [
        'tracking_url',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getTrackingUrlAttribute(): ?string
    {
        if (! $this->courier_tracking_code && ! $this->consignment_id) {
            return null;
        }

        $code = $this->courier_tracking_code ?: $this->consignment_id;
        $courier = strtolower($this->courier_name ?? '');

        return match ($courier) {
            'steadfast' => "https://steadfast.com.bd/t/{$code}",
            'paperfly' => "https://paperfly.com.bd/tracking.php?tracking_id={$code}",
            'carrybee' => "https://carrybee.com/track/{$code}",
            'pathao' => "https://merchant.pathao.com/tracking?consignment_id={$code}",
            'redx' => "https://redx.com.bd/track-parcel/?trackingId={$code}",
            default => null,
        };
    }
}
