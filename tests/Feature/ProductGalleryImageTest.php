<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Services\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductGalleryImageTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->admin = User::factory()->create();
        $this->category = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_create_product_with_main_and_multiple_gallery_images(): void
    {
        // 1x1 transparent PNG data URIs
        $mainImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $gallery1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        $gallery2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==';

        $response = $this->actingAs($this->admin)->post(route('admin.products.store'), [
            'name' => 'Premium Cotton Shirt',
            'price' => 1200,
            'compare_at_price' => 1500,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'stock_quantity' => 25,
            'description' => 'High quality cotton shirt',
            'status' => 'active',
            'categories' => [$this->category->id],
            'main_image' => $mainImage,
            'gallery_images' => [$gallery1, $gallery2],
        ]);

        $response->assertRedirect(route('admin.products.index'));

        $product = Product::where('name', 'Premium Cotton Shirt')->first();
        $this->assertNotNull($product);

        // Check images in DB
        $images = $product->images;
        $this->assertCount(3, $images);

        $mainImg = $images->where('is_main', true)->first();
        $this->assertNotNull($mainImg);
        $this->assertEquals(0, $mainImg->sort_order);

        $galleryImages = $images->where('is_main', false)->values();
        $this->assertCount(2, $galleryImages);
    }

    public function test_admin_can_add_new_gallery_images_on_product_update(): void
    {
        $product = Product::create([
            'name' => 'Original Watch',
            'slug' => 'original-watch',
            'product_code' => 'PRD-WTC001',
            'price' => 3000,
            'discount_type' => 'none',
            'discount_value' => 0,
            'stock_quantity' => 10,
            'description' => 'A great watch',
            'status' => 'active',
        ]);
        $product->categories()->attach($this->category->id);

        $base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $mainPath = MediaService::storeImage($base64, 'products', 1000);
        ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $mainPath,
            'sort_order' => 0,
            'is_main' => true,
        ]);

        $newGallery1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        $newGallery2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==';

        $response = $this->actingAs($this->admin)->put(route('admin.products.update', $product->id), [
            'name' => 'Original Watch Updated',
            'price' => 3200,
            'discount_type' => 'none',
            'discount_value' => 0,
            'stock_quantity' => 8,
            'description' => 'Updated watch description',
            'status' => 'active',
            'categories' => [$this->category->id],
            'new_gallery_images' => [$newGallery1, $newGallery2],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(3, $product->images()->count());
    }

    public function test_storage_fallback_route_serves_physical_storage_file(): void
    {
        $testFile = 'products/test-image.webp';
        Storage::disk('public')->put($testFile, 'dummy-image-bytes');

        // Note: Storage::fake uses virtual disks, so let's write to actual storage_path for the HTTP test
        $fullPath = storage_path('app/public/test-route-check.webp');
        file_put_contents($fullPath, 'fake-webp-data');

        try {
            $response = $this->get('/storage/test-route-check.webp');
            $response->assertOk();
            $this->assertStringContainsString('max-age=31536000', (string) $response->headers->get('Cache-Control'));
        } finally {
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }
    }

    public function test_storage_fallback_route_returns_404_for_missing_file(): void
    {
        $response = $this->get('/storage/non-existent-missing-file-xyz.webp');
        $response->assertNotFound();
    }
}
