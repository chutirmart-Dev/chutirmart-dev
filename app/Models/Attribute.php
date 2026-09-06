<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attribute extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'type', 'status', 'sort_order'];

    /**
     * All values/options for this attribute.
     */
    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class)->orderBy('sort_order');
    }

    /**
     * Only active options for this attribute.
     */
    public function activeValues(): HasMany
    {
        return $this->hasMany(AttributeValue::class)
            ->where('status', 'active')
            ->orderBy('sort_order');
    }

    /**
     * Scope: only active attributes.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
