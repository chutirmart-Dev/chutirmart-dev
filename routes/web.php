<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminCourierController;
use App\Http\Controllers\AdminCustomerController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AdminStoreController;
use App\Http\Controllers\AdminTaxonomyController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShopController;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/page/{slug}', [PageController::class, 'landingPage'])->name('landing.show');

// Dynamic Sitemap
Route::get('/sitemap.xml', function () {
    $products = Product::where('status', 'active')->select('slug', 'updated_at')->get();
    $categories = Category::where('status', 'active')->select('slug', 'updated_at')->get();

    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    $staticUrls = [
        route('home'),
        route('shop'),
        route('about'),
        route('terms'),
    ];

    foreach ($staticUrls as $url) {
        $xml .= '<url><loc>'.htmlspecialchars($url).'</loc><changefreq>daily</changefreq><priority>1.0</priority></url>';
    }

    foreach ($categories as $cat) {
        $xml .= '<url><loc>'.htmlspecialchars(route('shop', ['category' => $cat->slug])).'</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>';
    }

    foreach ($products as $prod) {
        $xml .= '<url><loc>'.htmlspecialchars(route('product.show', ['slug' => $prod->slug])).'</loc><lastmod>'.$prod->updated_at->toAtomString().'</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>';
    }

    $xml .= '</urlset>';

    return response($xml, 200, ['Content-Type' => 'application/xml']);
})->name('sitemap');

// Cart & Checkout
Route::post('/cart/validate-coupon', [CheckoutController::class, 'validateCoupon'])->name('cart.validate-coupon');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder'])->name('checkout.place-order');
Route::get('/order/confirmation/{orderNumber}', [OrderController::class, 'confirmation'])->name('order.confirmation');
Route::post('/track-order', [OrderController::class, 'track'])->name('order.track');

// AJAX locations helper
Route::get('/api/thanas', [CheckoutController::class, 'getThanas'])->name('api.thanas');
Route::get('/api/search-suggest', [SearchController::class, 'suggest'])->name('api.search.suggest');

/*
|--------------------------------------------------------------------------
| Admin Auth & Panel Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    // Admin login/logout
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

    // Protected Admin Routes
    Route::middleware('admin.auth')->group(function () {
        // Dashboard Home
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // Products Management
        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('/products/{id}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{id}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy'])->name('products.destroy');

        // Reviews approval
        Route::get('/reviews', [AdminProductController::class, 'reviews'])->name('reviews.index');
        Route::put('/reviews/{id}', [AdminProductController::class, 'updateReviewStatus'])->name('reviews.update');

        // Taxonomies CRUD (Brands, Categories, Tags, Attributes)
        Route::get('/brands', [AdminTaxonomyController::class, 'brands'])->name('brands.index');
        Route::post('/brands', [AdminTaxonomyController::class, 'storeBrand'])->name('brands.store');

        Route::get('/categories', [AdminTaxonomyController::class, 'categories'])->name('categories.index');
        Route::post('/categories', [AdminTaxonomyController::class, 'storeCategory'])->name('categories.store');

        Route::get('/tags', [AdminTaxonomyController::class, 'tags'])->name('tags.index');
        Route::post('/tags', [AdminTaxonomyController::class, 'storeTag'])->name('tags.store');

        Route::get('/attributes', [AdminTaxonomyController::class, 'attributes'])->name('attributes.index');
        Route::post('/attributes', [AdminTaxonomyController::class, 'storeAttribute'])->name('attributes.store');
        Route::post('/attributes/value', [AdminTaxonomyController::class, 'storeAttributeValue'])->name('attributes.value.store');

        // Orders Management
        Route::get('/orders/create', [AdminOrderController::class, 'create'])->name('orders.create');
        Route::post('/orders', [AdminOrderController::class, 'store'])->name('orders.store');
        Route::get('/orders/{status?}', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/detail/{id}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update');

        // Courier Actions
        Route::post('/orders/{id}/courier/send', [AdminCourierController::class, 'sendOrder'])->name('orders.courier.send');
        Route::post('/orders/{id}/courier/track', [AdminCourierController::class, 'trackOrder'])->name('orders.courier.track');
        Route::post('/orders/courier/bulk-send', [AdminCourierController::class, 'bulkSend'])->name('orders.courier.bulk-send');
        Route::post('/courier/check-balance', [AdminCourierController::class, 'checkBalance'])->name('courier.check-balance');
        Route::post('/courier/test-connection', [AdminCourierController::class, 'testConnection'])->name('courier.test-connection');

        // Customers Management
        Route::match(['get', 'post'], '/customers/courier-stats/{mobile?}', [AdminCustomerController::class, 'courierStats'])->name('customers.courier-stats');
        Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');
        Route::post('/customers', [AdminCustomerController::class, 'store'])->name('customers.store');
        Route::get('/customers/{id}/purchases', [AdminCustomerController::class, 'purchaseHistory'])->name('customers.purchases');

        // Store Management (Settings, Banners, Landing Pages)
        Route::get('/settings', [AdminStoreController::class, 'settings'])->name('settings.index');
        Route::put('/settings', [AdminStoreController::class, 'updateSettings'])->name('settings.update');
        Route::get('/messages', [AdminStoreController::class, 'messages'])->name('messages.index');
        Route::get('/help', [AdminStoreController::class, 'help'])->name('help.index');
        Route::get('/integrations', [AdminStoreController::class, 'integrations'])->name('integrations.index');

        Route::get('/banners', [AdminStoreController::class, 'banners'])->name('banners.index');
        Route::post('/banners', [AdminStoreController::class, 'storeBanner'])->name('banners.store');
        Route::put('/banners/{id}', [AdminStoreController::class, 'updateBanner'])->name('banners.update');
        Route::delete('/banners/{id}', [AdminStoreController::class, 'destroyBanner'])->name('banners.destroy');

        Route::get('/landing-pages', [AdminStoreController::class, 'landingPages'])->name('landing-pages.index');
        Route::get('/landing-pages/create', [AdminStoreController::class, 'createLandingPage'])->name('landing-pages.create');
        Route::post('/landing-pages', [AdminStoreController::class, 'storeLandingPage'])->name('landing-pages.store');
        Route::get('/landing-pages/{id}/edit', [AdminStoreController::class, 'editLandingPage'])->name('landing-pages.edit');
        Route::put('/landing-pages/{id}', [AdminStoreController::class, 'updateLandingPage'])->name('landing-pages.update');
        Route::post('/landing-pages/{id}/duplicate', [AdminStoreController::class, 'duplicateLandingPage'])->name('landing-pages.duplicate');
        Route::delete('/landing-pages/{id}', [AdminStoreController::class, 'destroyLandingPage'])->name('landing-pages.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| User Profile Scaffolding (Breeze default, kept intact)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
