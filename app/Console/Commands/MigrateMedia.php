<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\LandingPage;
use App\Models\ProductImage;
use App\Models\StoreSetting;
use App\Services\MediaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class MigrateMedia extends Command
{
    protected $signature = 'storage:migrate-media {--optimize : Compress and convert existing images to WebP}';

    protected $description = 'Safely normalize all database paths and migrate external/legacy media to local optimized storage';

    public function handle(): int
    {
        $this->info('========================================');
        $this->info('MIGRATING & NORMALIZING MEDIA STORAGE');
        $this->info('========================================');

        $dbFixed = 0;
        $externalDownloaded = 0;
        $filesOptimized = 0;

        // 1. Normalize Product Images & Migrate External Placeholders
        $productImages = ProductImage::all();
        foreach ($productImages as $img) {
            $raw = $img->getRawOriginal('image_path');
            if (! $raw) {
                continue;
            }

            // Handle external placeholder URLs (e.g. from initial seeder)
            if (preg_match('#^https?://#', $raw) && ! str_contains($raw, 'localhost') && ! str_contains($raw, '127.0.0.1')) {
                $this->line("Downloading external image for ProductImage #{$img->id}: {$raw}");
                try {
                    $response = Http::withoutVerifying()->timeout(15)->get($raw);
                    if ($response->successful()) {
                        $storedPath = MediaService::storeImage($response->body(), 'products', 1000);
                        DB::table('product_images')->where('id', $img->id)->update(['image_path' => $storedPath]);
                        $externalDownloaded++;
                        $this->info("  -> Saved as {$storedPath}");

                        continue;
                    }
                } catch (\Throwable $e) {
                    $this->warn('  -> Could not download external image, setting fallback: '.$e->getMessage());
                }
            }

            // Clean relative path (strip storage/ or domain)
            $clean = MediaService::cleanRelativePath($raw);
            if ($clean && $clean !== $raw) {
                DB::table('product_images')->where('id', $img->id)->update(['image_path' => $clean]);
                $dbFixed++;
            }
        }

        // 2. Normalize Banners
        $banners = Banner::all();
        foreach ($banners as $b) {
            $raw = $b->getRawOriginal('image_path');
            if (! $raw) {
                continue;
            }

            $clean = MediaService::cleanRelativePath($raw);
            if ($clean && $clean !== $raw) {
                DB::table('banners')->where('id', $b->id)->update(['image_path' => $clean]);
                $dbFixed++;
            }
        }

        // 3. Normalize Store Settings
        $settingKeys = ['site_logo', 'site_logo_mobile', 'favicon'];
        foreach ($settingKeys as $key) {
            $raw = StoreSetting::where('key', $key)->value('value');
            if (! $raw) {
                continue;
            }

            $clean = MediaService::cleanRelativePath($raw);
            if ($clean && $clean !== $raw) {
                StoreSetting::setValue($key, $clean);
                $dbFixed++;
            }
        }

        // 4. Normalize Brands
        $brands = Brand::all();
        foreach ($brands as $br) {
            $raw = $br->getRawOriginal('logo_path');
            if (! $raw) {
                continue;
            }

            $clean = MediaService::cleanRelativePath($raw);
            if ($clean && $clean !== $raw) {
                DB::table('brands')->where('id', $br->id)->update(['logo_path' => $clean]);
                $dbFixed++;
            }
        }

        // 5. Normalize Landing Pages
        $landingPages = LandingPage::all();
        foreach ($landingPages as $lp) {
            $raw = $lp->getRawOriginal('hero_image_path');
            if (! $raw) {
                continue;
            }

            $clean = MediaService::cleanRelativePath($raw);
            if ($clean && $clean !== $raw) {
                DB::table('landing_pages')->where('id', $lp->id)->update(['hero_image_path' => $clean]);
                $dbFixed++;
            }
        }

        // 6. Optimize Oversized Physical Files
        $this->newLine();
        $this->info('Scanning and optimizing oversized disk images...');
        $allFiles = Storage::disk('public')->allFiles();

        foreach ($allFiles as $relFile) {
            if ($relFile === '.gitignore' || str_starts_with($relFile, 'defaults/')) {
                continue;
            }

            $size = Storage::disk('public')->size($relFile);
            $ext = strtolower(pathinfo($relFile, PATHINFO_EXTENSION));

            // Optimize if jpeg/png or > 200KB
            if ($ext !== 'svg' && $ext !== 'ico') {
                $rawBytes = Storage::disk('public')->get($relFile);
                $folder = dirname($relFile);
                if ($folder === '.') {
                    $folder = 'products';
                }
                $maxWidth = str_contains($folder, 'banner') ? 1600 : 1000;

                try {
                    $newPath = MediaService::storeImage($rawBytes, $folder, $maxWidth, 80);
                    if ($newPath !== $relFile) {
                        $newSize = Storage::disk('public')->size($newPath);
                        $oldKb = round($size / 1024);
                        $newKb = round($newSize / 1024);
                        $this->line("  Optimized: {$relFile} ({$oldKb} KB) -> {$newPath} ({$newKb} KB)");

                        // Update DB references
                        DB::table('product_images')->where('image_path', $relFile)->orWhere('image_path', 'storage/'.$relFile)->update(['image_path' => $newPath]);
                        DB::table('banners')->where('image_path', $relFile)->orWhere('image_path', 'storage/'.$relFile)->update(['image_path' => $newPath]);
                        foreach (['site_logo', 'site_logo_mobile', 'favicon'] as $sk) {
                            $val = StoreSetting::where('key', $sk)->value('value');
                            if ($val === $relFile || $val === 'storage/'.$relFile) {
                                StoreSetting::setValue($sk, $newPath);
                            }
                        }

                        // Remove old unoptimized file
                        Storage::disk('public')->delete($relFile);
                        $filesOptimized++;
                    }
                } catch (\Throwable $e) {
                    $this->warn("  Could not optimize {$relFile}: ".$e->getMessage());
                }
            }
        }

        $this->newLine();
        $this->info('Migration completed:');
        $this->info("  - Normalized DB records: {$dbFixed}");
        $this->info("  - Downloaded external placeholders: {$externalDownloaded}");
        $this->info("  - Optimized disk files: {$filesOptimized}");

        return Command::SUCCESS;
    }
}
