<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'mobile', 'email', 'address', 'district',
        'total_orders', 'total_spent', 'status',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
