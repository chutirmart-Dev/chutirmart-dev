<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductImage;
use App\Services\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaStorageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_media_service_stores_image_with_clean_relative_path_and_webp_extension(): void
    {
        $file = UploadedFile::fake()->image('test_product.jpg', 800, 800);
        $path = MediaService::storeImage($file, 'products', 1000);

        $this->assertStringStartsWith('products/', $path);
        $this->assertStringEndsWith('.webp', $path);
        $this->assertStringNotContainsString('storage/', $path);
        $this->assertStringNotContainsString('http', $path);

        Storage::disk('public')->assertExists($path);
    }

    public function test_media_service_handles_base64_image_upload(): void
    {
        $base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $path = MediaService::storeImage($base64, 'banners', 1200);

        $this->assertStringStartsWith('banners/', $path);
        $this->assertStringEndsWith('.webp', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_product_image_model_stores_clean_path_and_resolves_dynamic_url(): void
    {
        $product = Product::create([
            'name' => 'Sample Product',
            'slug' => 'sample-product',
            'product_code' => 'PRD-SMP001',
            'price' => 500,
            'stock_quantity' => 10,
            'description' => 'Test description',
            'status' => 'active',
        ]);

        $file = UploadedFile::fake()->image('shoe.jpg', 600, 600);
        $relPath = MediaService::storeImage($file, 'products', 1000);

        $img = ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $relPath,
            'sort_order' => 0,
            'is_main' => true,
        ]);

        // Raw database attribute must be relative path
        $this->assertEquals($relPath, $img->getRawOriginal('image_path'));

        // Accessor provides live asset URL
        $this->assertStringContainsString('storage/'.$relPath, $img->image_path);
    }

    public function test_missing_image_resolves_to_local_default_fallback(): void
    {
        $fallback = MediaService::resolveUrl('non_existent_file.webp', 'product');
        $this->assertStringContainsString('storage/defaults/default-product.svg', $fallback);

        $bannerFallback = MediaService::resolveUrl(null, 'banner');
        $this->assertStringContainsString('storage/defaults/default-banner.svg', $bannerFallback);
    }

    public function test_safe_delete_removes_physical_file_without_exceptions(): void
    {
        $file = UploadedFile::fake()->image('banner.jpg', 1200, 400);
        $path = MediaService::storeImage($file, 'banners', 1600);

        Storage::disk('public')->assertExists($path);

        $deleted = MediaService::deleteImage($path);
        $this->assertTrue($deleted);
        Storage::disk('public')->assertMissing($path);

        // Deleting non-existent file should be idempotent and safe
        $this->assertTrue(MediaService::deleteImage('banners/non_existent.webp'));
    }
}
