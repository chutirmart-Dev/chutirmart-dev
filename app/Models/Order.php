<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

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
        'user_id',
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
        'user_agent',
        'fbp',
        'fbc',
        'meta_purchase_event_id',
        'meta_purchase_sent',
        'meta_purchase_sent_at',
    ];

    protected $casts = [
        'courier_response' => 'array',
        'courier_sent_at' => 'datetime',
        'subtotal' => 'float',
        'delivery_charge' => 'float',
        'coupon_discount' => 'float',
        'total' => 'float',
        'meta_purchase_sent' => 'boolean',
        'meta_purchase_sent_at' => 'datetime',
    ];

    protected $appends = [
        'tracking_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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

    /**
     * Generate a concise 3-digit order number (e.g. CHU-101, CHU-102, ... CHU-123).
     */
    public static function generateOrderNumber(): string
    {
        // Find the highest numeric suffix in CHU-{number} format
        $isSqlite = DB::connection()->getDriverName() === 'sqlite';
        if ($isSqlite) {
            $latestOrderNumber = static::where('order_number', 'LIKE', 'CHU-%')
                ->where('order_number', 'NOT LIKE', 'CHU-%-%')
                ->latest('id')
                ->value('order_number');
        } else {
            $latestOrderNumber = static::where('order_number', 'REGEXP', '^CHU-[0-9]+$')
                ->where('order_number', 'NOT LIKE', 'CHU-%-%')
                ->orderByRaw('CAST(SUBSTRING(order_number, 5) AS UNSIGNED) DESC')
                ->value('order_number');
        }

        $nextNumber = 101;
        if ($latestOrderNumber && preg_match('/^CHU-(\d+)$/', $latestOrderNumber, $matches)) {
            $lastVal = (int) $matches[1];
            // If the last order is within normal sequential bounds (< 10000), increment it
            if ($lastVal < 10000) {
                $nextNumber = max(101, $lastVal + 1);
            }
        }

        // Guarantee uniqueness
        while (static::where('order_number', 'CHU-'.$nextNumber)->exists()) {
            $nextNumber++;
        }

        return 'CHU-'.$nextNumber;
    }
}
