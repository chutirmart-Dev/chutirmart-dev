<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    /**
     * Store and optimize an uploaded image or base64 data.
     * Always returns clean relative path (e.g., 'products/01HXYZ...webp').
     */
    public static function storeImage(
        string|UploadedFile $image,
        string $folder = 'products',
        ?int $maxWidth = 1600,
        int $quality = 85
    ): string {
        // Boost memory limit during image manipulation if constrained
        $currentMemory = ini_get('memory_limit');
        if ($currentMemory && $currentMemory !== '-1') {
            $val = (int) $currentMemory;
            $unit = strtolower(substr(trim($currentMemory), -1));
            $bytes = match ($unit) {
                'g' => $val * 1024 * 1024 * 1024,
                'm' => $val * 1024 * 1024,
                'k' => $val * 1024,
                default => $val,
            };
            if ($bytes < 256 * 1024 * 1024) {
                @ini_set('memory_limit', '256M');
            }
        }

        $folder = trim(str_replace('\\', '/', $folder), '/');
        // Ensure destination folder physically exists on disk (crucial for Linux/cPanel)
        $physicalFolder = storage_path('app/public/'.$folder);
        if (! is_dir($physicalFolder)) {
            @mkdir($physicalFolder, 0775, true);
        }

        $rawBytes = null;
        $originalExt = 'webp';

        if ($image instanceof UploadedFile) {
            $rawBytes = file_get_contents($image->getRealPath());
            $originalExt = strtolower($image->getClientOriginalExtension() ?: 'webp');
        } elseif (is_string($image)) {
            // Check for Base64 Data URI
            if (preg_match('/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.*)$/s', $image, $matches)) {
                $mime = $matches[1];
                $base64Data = str_replace(' ', '+', $matches[2]);
                $rawBytes = base64_decode($base64Data);

                if (str_contains($mime, 'x-icon') || str_contains($mime, 'vnd.microsoft.icon')) {
                    $originalExt = 'ico';
                } elseif (str_contains($mime, 'svg')) {
                    $originalExt = 'svg';
                } elseif (str_contains($mime, 'png')) {
                    $originalExt = 'png';
                } elseif (str_contains($mime, 'gif')) {
                    $originalExt = 'gif';
                } elseif (str_contains($mime, 'webp')) {
                    $originalExt = 'webp';
                } else {
                    $originalExt = 'jpeg';
                }
            } elseif (preg_match('#^https?://#', $image)) {
                // If it's already an external URL
                return $image;
            } elseif (! preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\xFF]/', $image) && (str_contains($image, '/') || str_contains($image, '.'))) {
                // Already a clean relative path or filename
                return self::cleanRelativePath($image);
            } else {
                // Raw binary image data
                $rawBytes = $image;
                $originalExt = 'webp';
            }
        }

        if (! $rawBytes) {
            throw new \InvalidArgumentException('Invalid image payload provided.');
        }

        // Special handling for SVG & ICO: store directly without raster conversion
        if (in_array($originalExt, ['svg', 'ico'])) {
            $filename = Str::random(24).'.'.$originalExt;
            $relPath = "{$folder}/{$filename}";
            $saved = Storage::disk('public')->put($relPath, $rawBytes);
            if (! $saved) {
                @file_put_contents(storage_path('app/public/'.$relPath), $rawBytes);
            }

            return $relPath;
        }

        // Convert raster images to optimized WebP if GD is supported
        $optimizedData = self::convertAndOptimizeToWebp($rawBytes, $maxWidth, $quality, $originalExt);
        $finalExt = $optimizedData['ext'];
        $finalBytes = $optimizedData['data'];

        $filename = Str::random(24).'.'.$finalExt;
        $relPath = "{$folder}/{$filename}";

        $saved = Storage::disk('public')->put($relPath, $finalBytes);
        if (! $saved) {
            @file_put_contents(storage_path('app/public/'.$relPath), $finalBytes);
        }

        return $relPath;
    }

    /**
     * Convert binary image data to WebP (with resize and transparency preservation).
     */
    private static function convertAndOptimizeToWebp(string $rawBytes, ?int $maxWidth = 1600, int $quality = 85, string $originalExt = 'webp'): array
    {
        if (! extension_loaded('gd') || ! function_exists('imagecreatefromstring')) {
            return ['data' => $rawBytes, 'ext' => $originalExt];
        }

        $image = @imagecreatefromstring($rawBytes);
        if (! $image) {
            return ['data' => $rawBytes, 'ext' => $originalExt];
        }

        if (! imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }

        $width = imagesx($image);
        $height = imagesy($image);

        // Resize if oversized
        if ($maxWidth && $width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = (int) round(($height / $width) * $maxWidth);

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
            imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);

            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        } else {
            imagealphablending($image, false);
            imagesavealpha($image, true);
        }

        $supportsWebp = function_exists('imagewebp') && (! function_exists('imagetypes') || (imagetypes() & IMG_WEBP));

        // Convert to WebP or JPEG buffer
        ob_start();
        if ($supportsWebp) {
            imagewebp($image, null, $quality);
            $ext = 'webp';
        } else {
            imagejpeg($image, null, $quality);
            $ext = 'jpeg';
        }
        $data = ob_get_clean();
        imagedestroy($image);

        return [
            'data' => $data ?: $rawBytes,
            'ext' => $data ? $ext : $originalExt,
        ];
    }

    /**
     * Safely delete a file from public storage disk without throwing if missing.
     */
    public static function deleteImage(?string $path): bool
    {
        if (! $path) {
            return true;
        }

        $clean = self::cleanRelativePath($path);
        if (! $clean) {
            return true;
        }

        // Never delete default fallback placeholders
        if (str_starts_with($clean, 'defaults/')) {
            return true;
        }

        if (Storage::disk('public')->exists($clean)) {
            return Storage::disk('public')->delete($clean);
        }

        return true;
    }

    /**
     * Resolve a database path or fallback to a live dynamic URL.
     */
    public static function resolveUrl(?string $path, string $fallbackType = 'product'): string
    {
        if (! $path || trim($path) === '') {
            return self::getFallbackUrl($fallbackType);
        }

        // External URLs (e.g. CDNs or external placeholders)
        if (preg_match('#^https?://#', $path)) {
            if (str_contains($path, 'localhost') || str_contains($path, '127.0.0.1')) {
                $path = self::cleanRelativePath($path);
            } else {
                return $path;
            }
        }

        $clean = self::cleanRelativePath($path);

        if (! $clean) {
            return self::getFallbackUrl($fallbackType);
        }

        // Verify physical file exists on disk, checking Storage disk, storage_path, and public_path
        $existsOnDisk = Storage::disk('public')->exists($clean)
            || @file_exists(storage_path('app/public/'.$clean))
            || @file_exists(public_path('storage/'.$clean));

        if (! $existsOnDisk) {
            $pathInfo = pathinfo($clean);
            $dir = (isset($pathInfo['dirname']) && $pathInfo['dirname'] !== '.' && $pathInfo['dirname'] !== '') ? $pathInfo['dirname'].'/' : '';
            $filename = $pathInfo['filename'] ?? '';
            $found = null;
            foreach (['webp', 'jpg', 'jpeg', 'png', 'svg', 'ico'] as $altExt) {
                $altCandidate = $dir.$filename.'.'.$altExt;
                if (Storage::disk('public')->exists($altCandidate)
                    || @file_exists(storage_path('app/public/'.$altCandidate))
                    || @file_exists(public_path('storage/'.$altCandidate))) {
                    $found = $altCandidate;
                    break;
                }
            }

            if ($found) {
                $clean = $found;
            } else {
                return self::getFallbackUrl($fallbackType);
            }
        }

        return asset('storage/'.$clean);
    }

    /**
     * Normalize any messy database path to pure relative path.
     * e.g. "http://localhost/storage/products/1.jpg" -> "products/1.jpg"
     * e.g. "storage/products/1.jpg" -> "products/1.jpg"
     * e.g. "/products/1.jpg" -> "products/1.jpg"
     */
    public static function cleanRelativePath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $path = trim($path);
        // Normalize Windows backslashes to forward slashes for Linux compatibility
        $path = str_replace('\\', '/', $path);

        // Strip full domain with /storage/ or localhost prefix
        if (preg_match('#^https?://[^/]+(?:/[^/]+)*/storage/(.*)$#i', $path, $m)) {
            $path = $m[1];
        }

        // Strip leading storage/ or /storage/
        $path = preg_replace('#^/?storage/#i', '', $path);

        return ltrim($path, '/');
    }

    /**
     * Get fallback default placeholder asset URL.
     */
    public static function getFallbackUrl(string $type = 'product'): string
    {
        $relPath = match ($type) {
            'banner' => 'defaults/default-banner.svg',
            'logo' => 'defaults/default-logo.svg',
            'avatar' => 'defaults/default-avatar.svg',
            default => 'defaults/default-product.svg',
        };

        return asset('storage/'.$relPath);
    }
}
