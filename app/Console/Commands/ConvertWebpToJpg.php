<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ConvertWebpToJpg extends Command
{
    protected $signature = 'images:convert-webp-to-jpg
                            {--dry-run : Preview changes without actually converting}
                            {--quality=85 : JPG quality 1-100}';

    protected $description = 'Convert all WebP images to JPG and update database paths';

    /**
     * Database tables and their image path columns.
     * table => [column, ...columns]
     */
    private array $imageColumns = [
        'product_images' => ['image_path'],
        'banners' => ['image_path'],
        'brands' => ['logo_path'],
        'landing_pages' => ['hero_image_path'],
        'admin_users' => ['avatar_path'],
        'store_settings' => ['value'], // type='image' rows only
        'users' => ['avatar'],
    ];

    private bool $dryRun = false;

    private int $quality = 85;

    private int $converted = 0;

    private int $dbUpdated = 0;

    private int $skipped = 0;

    private int $errors = 0;

    public function handle(): int
    {
        $this->dryRun = $this->option('dry-run');
        $this->quality = (int) $this->option('quality');

        $this->info('');
        $this->info('╔══════════════════════════════════════════╗');
        $this->info('║  ChutirMart WebP → JPG Converter         ║');
        $this->info('╚══════════════════════════════════════════╝');

        if ($this->dryRun) {
            $this->warn('  [DRY RUN MODE] No files will be changed.');
        }

        $this->info("  Quality: {$this->quality}%");
        $this->info('');

        // Step 1: Scan storage for WebP files and convert them
        $this->convertStorageFiles();

        // Step 2: Update all database paths
        $this->updateDatabase();

        // Summary
        $this->info('');
        $this->info('═══════════════════════════════════════════');
        $this->info("  Files converted : {$this->converted}");
        $this->info("  DB rows updated : {$this->dbUpdated}");
        $this->info("  Skipped         : {$this->skipped}");
        $this->info("  Errors          : {$this->errors}");
        $this->info('═══════════════════════════════════════════');

        if (! $this->dryRun && $this->converted > 0) {
            $this->info('');
            $this->info('✅ Conversion complete!');
            $this->info('   Now copy the updated storage/ to chutirmart-deploy/');
            $this->info('   and export + import the updated database.');
        }

        return Command::SUCCESS;
    }

    /**
     * Walk storage/app/public and convert every .webp file.
     */
    private function convertStorageFiles(): void
    {
        $basePath = storage_path('app/public');
        $webpFiles = $this->findWebpFiles($basePath);

        $this->info('  Found '.count($webpFiles).' WebP file(s) in storage/app/public');
        $this->info('');

        $bar = $this->output->createProgressBar(count($webpFiles));
        $bar->start();

        foreach ($webpFiles as $webpPath) {
            $jpgPath = preg_replace('/\.webp$/i', '.jpg', $webpPath);

            if (! $this->dryRun) {
                if ($this->convertWebpToJpg($webpPath, $jpgPath)) {
                    $this->converted++;
                    // Delete the original webp
                    @unlink($webpPath);
                } else {
                    $this->errors++;
                    $this->newLine();
                    $this->error("  Failed: {$webpPath}");
                }
            } else {
                $rel = str_replace($basePath.DIRECTORY_SEPARATOR, '', $webpPath);
                $this->newLine();
                $this->line("  [DRY] Would convert: {$rel}");
                $this->converted++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    /**
     * Update database: replace .webp extensions with .jpg in all image columns.
     */
    private function updateDatabase(): void
    {
        $this->info('  Updating database paths...');
        $this->info('');

        foreach ($this->imageColumns as $table => $columns) {
            // Check if table exists
            if (! $this->tableExists($table)) {
                $this->line("  SKIP: table `{$table}` not found");

                continue;
            }

            foreach ($columns as $column) {
                // Check if column exists
                if (! $this->columnExists($table, $column)) {
                    $this->line("  SKIP: column `{$table}.{$column}` not found");

                    continue;
                }

                // Special case: store_settings only for type='image' rows
                $query = DB::table($table);
                if ($table === 'store_settings' && $column === 'value') {
                    $query->where('type', 'image');
                }

                $count = $query->where($column, 'like', '%.webp')->count();

                if ($count === 0) {
                    $this->line("  OK (no webp): {$table}.{$column}");

                    continue;
                }

                if (! $this->dryRun) {
                    // MySQL REPLACE approach: handles all cases
                    DB::table($table)
                        ->when($table === 'store_settings' && $column === 'value', fn ($q) => $q->where('type', 'image'))
                        ->where($column, 'like', '%.webp')
                        ->update([
                            $column => DB::raw("REPLACE(`{$column}`, '.webp', '.jpg')"),
                        ]);
                    $this->dbUpdated += $count;
                    $this->info("  ✔ Updated {$count} row(s): {$table}.{$column}");
                } else {
                    $this->line("  [DRY] Would update {$count} row(s): {$table}.{$column}");
                    $this->dbUpdated += $count;
                }
            }
        }
    }

    /**
     * Convert a single image file to JPG using GD.
     * Handles files with wrong .webp extension (actual PNG/JPG saved as .webp).
     */
    private function convertWebpToJpg(string $source, string $destination): bool
    {
        try {
            $info = @getimagesize($source);
            if (! $info) {
                return false;
            }

            $image = match ($info[2]) {
                IMAGETYPE_WEBP => @imagecreatefromwebp($source),
                IMAGETYPE_PNG => @imagecreatefrompng($source),
                IMAGETYPE_JPEG => @imagecreatefromjpeg($source),
                IMAGETYPE_GIF => @imagecreatefromgif($source),
                default => false,
            };

            if ($image === false) {
                return false;
            }

            // Flatten transparency to white background (for PNG/WebP with alpha)
            $width = imagesx($image);
            $height = imagesy($image);
            $jpgCanvas = imagecreatetruecolor($width, $height);
            $white = imagecolorallocate($jpgCanvas, 255, 255, 255);
            imagefill($jpgCanvas, 0, 0, $white);
            imagecopy($jpgCanvas, $image, 0, 0, 0, 0, $width, $height);
            imagedestroy($image);

            $result = imagejpeg($jpgCanvas, $destination, $this->quality);
            imagedestroy($jpgCanvas);

            return $result;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Recursively find all .webp files under a directory.
     *
     * @return string[]
     */
    private function findWebpFiles(string $directory): array
    {
        $files = [];

        if (! is_dir($directory)) {
            return $files;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'webp') {
                $files[] = $file->getRealPath();
            }
        }

        return $files;
    }

    private function tableExists(string $table): bool
    {
        try {
            DB::select("SHOW TABLES LIKE '{$table}'");

            return count(DB::select("SHOW TABLES LIKE '{$table}'")) > 0;
        } catch (\Throwable) {
            return false;
        }
    }

    private function columnExists(string $table, string $column): bool
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");

            return count($columns) > 0;
        } catch (\Throwable) {
            return false;
        }
    }
}
