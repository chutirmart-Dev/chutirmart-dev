<?php

namespace App\Http\Controllers;

use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminFileManagerController extends Controller
{
    /**
     * Display a listing of the media files in the file manager.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $selectedFolder = $request->query('folder', 'all');
        $search = trim((string) $request->query('search', ''));
        $sort = (string) $request->query('sort', 'newest');

        $baseDir = storage_path('app/public');
        if (! is_dir($baseDir)) {
            @mkdir($baseDir, 0775, true);
        }

        // Known standard folders and scan existing folders
        $knownFolders = [
            'products',
            'banners',
            'categories',
            'brands',
            'logos',
            'media',
            'landing-pages',
            'store-settings',
            'users',
            'reviews',
            'defaults',
        ];

        $subDirs = is_dir($baseDir) ? File::directories($baseDir) : [];
        $folderNames = array_map(function ($dir): string {
            return basename($dir);
        }, $subDirs);

        $allFolders = array_values(array_unique(array_merge($knownFolders, $folderNames)));
        sort($allFolders);

        $folderCounts = array_fill_keys($allFolders, 0);
        $totalCount = 0;
        $totalBytes = 0;
        $filesList = [];

        // Allowed image/media extensions
        $allowedExtensions = ['webp', 'jpg', 'jpeg', 'png', 'svg', 'gif', 'ico'];

        foreach ($allFolders as $folder) {
            $folderPath = $baseDir.DIRECTORY_SEPARATOR.$folder;
            if (! is_dir($folderPath)) {
                continue;
            }

            $files = File::files($folderPath);
            foreach ($files as $file) {
                $ext = strtolower($file->getExtension());
                if (! in_array($ext, $allowedExtensions, true)) {
                    continue;
                }

                $totalCount++;
                $fileBytes = $file->getSize();
                $totalBytes += $fileBytes;
                $folderCounts[$folder] = ($folderCounts[$folder] ?? 0) + 1;

                $filename = $file->getFilename();
                $relativePath = $folder.'/'.$filename;

                // Check search match
                if ($search !== '' && ! str_contains(strtolower($filename), strtolower($search))) {
                    continue;
                }

                // Check folder filter
                if ($selectedFolder !== 'all' && $selectedFolder !== $folder) {
                    continue;
                }

                $mtime = $file->getMTime();

                $filesList[] = [
                    'id' => md5($relativePath),
                    'name' => $filename,
                    'folder' => $folder,
                    'path' => $relativePath,
                    'url' => asset('storage/'.$relativePath),
                    'size' => $this->formatBytes($fileBytes),
                    'size_bytes' => $fileBytes,
                    'extension' => $ext,
                    'mime_type' => $this->getMimeType($ext),
                    'dimensions' => $this->getImageDimensions($file->getRealPath(), $ext),
                    'modified_at' => date('M d, Y h:i A', $mtime),
                    'timestamp' => $mtime,
                ];
            }
        }

        // Also check root public files if any
        $rootFiles = is_dir($baseDir) ? File::files($baseDir) : [];
        foreach ($rootFiles as $file) {
            $ext = strtolower($file->getExtension());
            if (! in_array($ext, $allowedExtensions, true)) {
                continue;
            }

            $totalCount++;
            $fileBytes = $file->getSize();
            $totalBytes += $fileBytes;
            $folderCounts['other'] = ($folderCounts['other'] ?? 0) + 1;

            $filename = $file->getFilename();
            $relativePath = $filename;

            if ($search !== '' && ! str_contains(strtolower($filename), strtolower($search))) {
                continue;
            }

            if ($selectedFolder !== 'all' && $selectedFolder !== 'other') {
                continue;
            }

            $mtime = $file->getMTime();

            $filesList[] = [
                'id' => md5($relativePath),
                'name' => $filename,
                'folder' => 'root',
                'path' => $relativePath,
                'url' => asset('storage/'.$relativePath),
                'size' => $this->formatBytes($fileBytes),
                'size_bytes' => $fileBytes,
                'extension' => $ext,
                'mime_type' => $this->getMimeType($ext),
                'dimensions' => $this->getImageDimensions($file->getRealPath(), $ext),
                'modified_at' => date('M d, Y h:i A', $mtime),
                'timestamp' => $mtime,
            ];
        }

        // Sort files
        usort($filesList, function (array $a, array $b) use ($sort): int {
            return match ($sort) {
                'oldest' => $a['timestamp'] <=> $b['timestamp'],
                'size_desc' => $b['size_bytes'] <=> $a['size_bytes'],
                'size_asc' => $a['size_bytes'] <=> $b['size_bytes'],
                'name_asc' => strcasecmp($a['name'], $b['name']),
                'name_desc' => strcasecmp($b['name'], $a['name']),
                default => $b['timestamp'] <=> $a['timestamp'],
            };
        });

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'files' => $filesList,
                'folders' => $allFolders,
                'folderCounts' => $folderCounts,
                'selectedFolder' => $selectedFolder,
                'search' => $search,
                'sort' => $sort,
                'stats' => [
                    'total_files' => $totalCount,
                    'total_size' => $this->formatBytes($totalBytes),
                    'total_bytes' => $totalBytes,
                ],
            ]);
        }

        return Inertia::render('Admin/FileManager', [
            'files' => $filesList,
            'folders' => $allFolders,
            'folderCounts' => $folderCounts,
            'selectedFolder' => $selectedFolder,
            'search' => $search,
            'sort' => $sort,
            'stats' => [
                'total_files' => $totalCount,
                'total_size' => $this->formatBytes($totalBytes),
                'total_bytes' => $totalBytes,
            ],
        ]);
    }

    /**
     * Upload one or multiple media files.
     */
    public function upload(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|mimes:jpeg,png,jpg,webp,gif,svg,ico|max:15360', // max 15MB
            'folder' => 'nullable|string|max:50',
        ]);

        $folder = $request->input('folder', 'media');
        $folder = trim(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $folder));
        if (empty($folder)) {
            $folder = 'media';
        }

        $uploadedCount = 0;
        $uploadedList = [];
        $files = $request->file('files');

        if (is_array($files)) {
            foreach ($files as $file) {
                if (! $file->isValid()) {
                    continue;
                }

                try {
                    $relPath = MediaService::storeImage($file, $folder);
                    $fullPath = storage_path('app/public/'.$relPath);
                    $fileBytes = file_exists($fullPath) ? filesize($fullPath) : 0;
                    $ext = pathinfo($relPath, PATHINFO_EXTENSION);
                    $mtime = file_exists($fullPath) ? filemtime($fullPath) : time();

                    $uploadedList[] = [
                        'id' => md5($relPath),
                        'name' => basename($relPath),
                        'folder' => $folder,
                        'path' => $relPath,
                        'url' => asset('storage/'.$relPath),
                        'size' => $this->formatBytes($fileBytes),
                        'size_bytes' => $fileBytes,
                        'extension' => $ext,
                        'mime_type' => $this->getMimeType($ext),
                        'dimensions' => $this->getImageDimensions($fullPath, $ext),
                        'modified_at' => date('M d, Y h:i A', $mtime),
                        'timestamp' => $mtime,
                    ];
                    $uploadedCount++;
                } catch (\Throwable $e) {
                    // Continue with next file
                }
            }
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'uploaded' => $uploadedList,
                'message' => $uploadedCount > 1
                    ? "{$uploadedCount} files uploaded successfully to {$folder}!"
                    : "File uploaded successfully to {$folder}!",
            ]);
        }

        return redirect()->back()->with(
            'success',
            $uploadedCount > 1
                ? "{$uploadedCount} files uploaded successfully to {$folder}!"
                : "File uploaded successfully to {$folder}!"
        );
    }

    /**
     * Delete a single media file.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        $cleanPath = MediaService::cleanRelativePath($path);

        if (! $cleanPath || str_starts_with($cleanPath, 'defaults/')) {
            return redirect()->back()->with('error', 'Cannot delete default system files.');
        }

        if (Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        } elseif (file_exists(storage_path('app/public/'.$cleanPath))) {
            @unlink(storage_path('app/public/'.$cleanPath));
        }

        return redirect()->back()->with('success', 'File deleted successfully.');
    }

    /**
     * Delete multiple media files in bulk.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'paths' => 'required|array|min:1',
            'paths.*' => 'required|string',
        ]);

        $paths = $request->input('paths', []);
        $deletedCount = 0;

        foreach ($paths as $path) {
            $cleanPath = MediaService::cleanRelativePath($path);
            if (! $cleanPath || str_starts_with($cleanPath, 'defaults/')) {
                continue;
            }

            if (Storage::disk('public')->exists($cleanPath)) {
                Storage::disk('public')->delete($cleanPath);
                $deletedCount++;
            } elseif (file_exists(storage_path('app/public/'.$cleanPath))) {
                @unlink(storage_path('app/public/'.$cleanPath));
                $deletedCount++;
            }
        }

        return redirect()->back()->with('success', "{$deletedCount} file(s) deleted successfully.");
    }

    /**
     * Format raw bytes into human readable size string.
     */
    private function formatBytes(int $bytes, int $precision = 1): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $base = log($bytes, 1024);
        $floorBase = (int) floor($base);

        return round(pow(1024, $base - $floorBase), $precision).' '.($units[$floorBase] ?? 'B');
    }

    /**
     * Get image dimensions if available.
     */
    private function getImageDimensions(string $realPath, string $ext): ?string
    {
        if (in_array($ext, ['svg', 'ico'], true)) {
            return null;
        }

        try {
            $info = @getimagesize($realPath);
            if ($info && isset($info[0], $info[1])) {
                return $info[0].' × '.$info[1];
            }
        } catch (\Throwable $e) {
            // Ignore error
        }

        return null;
    }

    /**
     * Get human-readable MIME type label.
     */
    private function getMimeType(string $ext): string
    {
        return match ($ext) {
            'webp' => 'image/webp',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            default => 'image/'.$ext,
        };
    }
}
