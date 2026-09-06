<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'type'];

    /**
     * Resolve image URL dynamically with fallback.
     */
    public static function normalizeUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        return MediaService::resolveUrl($url, 'logo');
    }

    /**
     * Retrieve all settings in a single cached batch query (eliminates N+1 bottleneck).
     */
    public static function getAllCached(): array
    {
        $raw = Cache::remember('store_settings_all', 3600, function () {
            $settings = self::all();
            $result = [];

            foreach ($settings as $setting) {
                $val = match ($setting->type) {
                    'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                    'number' => (float) $setting->value,
                    'json' => json_decode($setting->value, true),
                    default => $setting->value,
                };

                $result[$setting->key] = $val;
            }

            return $result;
        });

        // Resolve logo and favicon dynamically per request (never locks to a specific host/domain)
        foreach (['site_logo', 'site_logo_mobile', 'favicon'] as $mediaKey) {
            if (! empty($raw[$mediaKey]) && is_string($raw[$mediaKey])) {
                $raw[$mediaKey] = self::normalizeUrl($raw[$mediaKey]);
            }
        }

        return $raw;
    }

    public static function getValue(string $key, $default = null)
    {
        $all = self::getAllCached();

        return $all[$key] ?? $default;
    }

    public static function setValue(string $key, $value, string $type = 'text'): void
    {
        // For media settings, clean path before database storage
        if (in_array($key, ['site_logo', 'site_logo_mobile', 'favicon']) && is_string($value)) {
            $value = MediaService::cleanRelativePath($value) ?: $value;
        }

        $val = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;
        self::updateOrCreate(['key' => $key], ['value' => $val, 'type' => $type]);
        Cache::forget('store_settings_all');
    }
}
