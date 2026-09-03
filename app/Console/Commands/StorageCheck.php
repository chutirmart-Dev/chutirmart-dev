<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\LandingPage;
use App\Models\ProductImage;
use App\Models\StoreSetting;
use App\Services\MediaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class StorageCheck extends Command
{
    protected $signature = 'storage:check';

    protected $description = 'Perform a complete health check on the media and storage system';

    public function handle(): int
    {
        $this->info('========================================');
        $this->info('STORAGE HEALTH REPORT');
        $this->info('========================================');

        $totalRecords = 0;
        $existingFiles = 0;
        $missingFiles = 0;
        $brokenPaths = 0;
        $invalidUrls = 0;
        $hardcodedUrls = 0;
        $referencedFiles = [];
        $fileHashes = [];
        $duplicateFiles = 0;

        // 1. Product Images
        $productImages = ProductImage::all();
        foreach ($productImages as $img) {
            $totalRecords++;
            $raw = $img->getRawOriginal('image_path');
            $this->inspectPath($raw, $existingFiles, $missingFiles, $brokenPaths, $invalidUrls, $hardcodedUrls, $referencedFiles);
        }

        // 2. Banners
        $banners = Banner::all();
        foreach ($banners as $banner) {
            $totalRecords++;
            $raw = $banner->getRawOriginal('image_path');
            $this->inspectPath($raw, $existingFiles, $missingFiles, $brokenPaths, $invalidUrls, $hardcodedUrls, $referencedFiles);
        }

        // 3. Store Settings
        $settings = StoreSetting::whereIn('key', ['site_logo', 'site_logo_mobile', 'favicon'])->get();
        foreach ($settings as $setting) {
            $raw = $setting->getRawOriginal('value');
            if ($raw) {
                $totalRecords++;
                $this->inspectPath($raw, $existingFiles, $missingFiles, $brokenPaths, $invalidUrls, $hardcodedUrls, $referencedFiles);
            }
        }

        // 4. Brands
        $brands = Brand::whereNotNull('logo_path')->get();
        foreach ($brands as $brand) {
            $totalRecords++;
            $raw = $brand->getRawOriginal('logo_path');
            $this->inspectPath($raw, $existingFiles, $missingFiles, $brokenPaths, $invalidUrls, $hardcodedUrls, $referencedFiles);
        }

        // 5. Landing Pages
        $landingPages = LandingPage::whereNotNull('hero_image_path')->get();
        foreach ($landingPages as $lp) {
            $totalRecords++;
            $raw = $lp->getRawOriginal('hero_image_path');
            $this->inspectPath($raw, $existingFiles, $missingFiles, $brokenPaths, $invalidUrls, $hardcodedUrls, $referencedFiles);
        }

        // 6. Scan Physical Storage for Orphan Files & Duplicates
        $allPhysicalFiles = Storage::disk('public')->allFiles();
        $orphanFiles = 0;

        foreach ($allPhysicalFiles as $physicalFile) {
            if ($physicalFile === '.gitignore' || str_starts_with($physicalFile, 'defaults/')) {
                continue;
            }

            // Check duplicate by MD5 hash
            try {
                $content = Storage::disk('public')->get($physicalFile);
                $hash = md5($content);
                if (isset($fileHashes[$hash])) {
                    $duplicateFiles++;
                } else {
                    $fileHashes[$hash] = $physicalFile;
                }
            } catch (\Throwable $e) {
                // ignore
            }

            if (! in_array($physicalFile, $referencedFiles, true)) {
                $orphanFiles++;
            }
        }

        // Storage Symlink check
        $symlinkHealthy = is_dir(public_path('storage'));

        $this->line("Total Image Records: {$totalRecords}");
        $this->line("Existing Files:      {$existingFiles}");
        $this->line("Missing Files:       {$missingFiles}");
        $this->line("Broken Paths:        {$brokenPaths}");
        $this->line("Orphan Files:        {$orphanFiles}");
        $this->line("Hardcoded URLs:      {$hardcodedUrls}");
        $this->line("Invalid URLs:        {$invalidUrls}");
        $this->line("Duplicate Files:     {$duplicateFiles}");
        $this->line('Symlink Status:      '.($symlinkHealthy ? 'ACTIVE (public/storage)' : 'BROKEN/MISSING'));

        $this->newLine();

        $isHealthy = ($missingFiles === 0 && $brokenPaths === 0 && $invalidUrls === 0 && $hardcodedUrls === 0 && $symlinkHealthy);

        if ($isHealthy) {
            $this->info('STATUS: HEALTHY');

            return Command::SUCCESS;
        } else {
            $this->warn('STATUS: NEEDS ATTENTION');

            return Command::SUCCESS;
        }
    }

    private function inspectPath(
        ?string $raw,
        int &$existingFiles,
        int &$missingFiles,
        int &$brokenPaths,
        int &$invalidUrls,
        int &$hardcodedUrls,
        array &$referencedFiles
    ): void {
        if (! $raw || trim($raw) === '') {
            $missingFiles++;

            return;
        }

        if (str_contains($raw, 'localhost') || str_contains($raw, '127.0.0.1') || preg_match('#^https?://#', $raw)) {
            if (str_contains($raw, 'localhost') || str_contains($raw, '127.0.0.1')) {
                $hardcodedUrls++;
            }
            if (! filter_var($raw, FILTER_VALIDATE_URL)) {
                $invalidUrls++;
            }
        }

        // Check if database path contains unnecessary prefix like 'storage/'
        if (str_starts_with($raw, 'storage/') || str_starts_with($raw, '/storage/')) {
            $brokenPaths++;
        }

        $cleanRel = MediaService::cleanRelativePath($raw);
        if ($cleanRel && ! preg_match('#^https?://#', $cleanRel)) {
            $referencedFiles[] = $cleanRel;
            if (Storage::disk('public')->exists($cleanRel)) {
                $existingFiles++;
            } else {
                $missingFiles++;
            }
        } elseif (preg_match('#^https?://#', $cleanRel)) {
            // External URL (considered existing if valid URL)
            if (filter_var($cleanRel, FILTER_VALIDATE_URL)) {
                $existingFiles++;
            } else {
                $missingFiles++;
            }
        }
    }
}
