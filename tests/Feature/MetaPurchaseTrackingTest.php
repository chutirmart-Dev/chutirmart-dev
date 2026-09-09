<?php

namespace Tests\Feature;

use App\Jobs\SendMetaPurchaseEvent;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\User;
use App\Services\ConversionTrackingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class MetaPurchaseTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_status_update_to_complete_dispatches_send_meta_purchase_event_job(): void
    {
        Queue::fake([SendMetaPurchaseEvent::class]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'CHU-TEST-001',
            'customer_name' => 'John Doe',
            'mobile' => '01711223344',
            'district' => 'Dhaka',
            'address' => 'Mirpur-10, Dhaka',
            'subtotal' => 1500,
            'delivery_charge' => 80,
            'total' => 1580,
            'status' => 'processing',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'meta_purchase_sent' => false,
        ]);

        $response = $this->actingAs($user)->put(route('admin.orders.update', ['id' => $order->id]), [
            'status' => 'complete',
            'payment_status' => 'paid',
            'internal_notes' => 'Customer confirmed delivery',
        ]);

        $response->assertStatus(302);

        Queue::assertPushed(SendMetaPurchaseEvent::class, function ($job) use ($order) {
            return $job->order->id === $order->id;
        });
    }

    public function test_order_status_update_from_complete_to_complete_does_not_redispatch_job(): void
    {
        Queue::fake([SendMetaPurchaseEvent::class]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'CHU-TEST-002',
            'customer_name' => 'Jane Doe',
            'mobile' => '01722334455',
            'district' => 'Gazipur',
            'address' => 'Gazipur Chowrasta',
            'subtotal' => 2000,
            'delivery_charge' => 80,
            'total' => 2080,
            'status' => 'complete',
            'payment_status' => 'paid',
            'payment_method' => 'cod',
            'meta_purchase_sent' => true,
            'meta_purchase_event_id' => 'uuid-existing-test',
        ]);

        $response = $this->actingAs($user)->put(route('admin.orders.update', ['id' => $order->id]), [
            'status' => 'complete',
            'payment_status' => 'paid',
        ]);

        $response->assertStatus(302);

        Queue::assertNotPushed(SendMetaPurchaseEvent::class);
    }

    public function test_order_status_update_to_other_statuses_does_not_dispatch_job(): void
    {
        Queue::fake([SendMetaPurchaseEvent::class]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'CHU-TEST-003',
            'customer_name' => 'Test User',
            'mobile' => '01733445566',
            'district' => 'Sylhet',
            'address' => 'Zindabazar',
            'subtotal' => 1000,
            'delivery_charge' => 130,
            'total' => 1130,
            'status' => 'processing',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'meta_purchase_sent' => false,
        ]);

        $response = $this->actingAs($user)->put(route('admin.orders.update', ['id' => $order->id]), [
            'status' => 'cancelled',
            'payment_status' => 'pending',
        ]);

        $response->assertStatus(302);

        Queue::assertNotPushed(SendMetaPurchaseEvent::class);
    }

    public function test_meta_conversions_api_service_sends_purchase_event_and_updates_order(): void
    {
        Config::set('services.meta.pixel_id', '1234567890');
        Config::set('services.meta.access_token', 'test_access_token_EAAC');
        Config::set('services.meta.test_event_code', 'TEST_EVENT_999');

        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'events_received' => 1,
                'fbtrace_id' => 'test_trace_123',
            ], 200),
        ]);

        $customer = Customer::create([
            'name' => 'Rahim Ahmed',
            'mobile' => '01812345678',
            'email' => 'rahim@example.com',
            'district' => 'Chittagong',
        ]);

        $product = Product::create([
            'name' => 'Wireless Smart Earbuds',
            'slug' => 'wireless-smart-earbuds',
            'product_code' => 'SKU-EARBUDS-01',
            'price' => 1200,
            'status' => 'active',
            'stock_quantity' => 20,
        ]);

        $order = Order::create([
            'order_number' => 'CHU-TEST-004',
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'mobile' => $customer->mobile,
            'district' => 'Chittagong',
            'address' => 'Agrabad, Chittagong',
            'subtotal' => 1200,
            'delivery_charge' => 130,
            'total' => 1330,
            'status' => 'complete',
            'payment_status' => 'paid',
            'payment_method' => 'cod',
            'meta_purchase_sent' => false,
            'ip_address' => '103.25.12.1',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 1,
            'unit_price' => 1200,
            'total_price' => 1200,
        ]);

        /** @var ConversionTrackingService $service */
        $service = app(ConversionTrackingService::class);
        $service->trackPurchase($order);

        $order->refresh();

        $this->assertTrue($order->meta_purchase_sent);
        $this->assertNotNull($order->meta_purchase_event_id);
        $this->assertNotNull($order->meta_purchase_sent_at);

        Http::assertSent(function ($request) use ($order) {
            $data = $request['data'][0];

            $hasPurchaseName = $data['event_name'] === 'Purchase';
            $hasEventId = $data['event_id'] === $order->meta_purchase_event_id;
            $hasCorrectValue = $data['custom_data']['value'] == 1330.0;
            $hasCurrency = $data['custom_data']['currency'] === 'BDT';
            $hasOrderId = $data['custom_data']['order_id'] === 'CHU-TEST-004';
            $hasTestCode = $data['test_event_code'] === 'TEST_EVENT_999';

            // Check hashed phone and email
            $hashedPhone = hash('sha256', '8801812345678');
            $hashedEmail = hash('sha256', 'rahim@example.com');
            $hasHashedPhone = in_array($hashedPhone, $data['user_data']['ph']);
            $hasHashedEmail = in_array($hashedEmail, $data['user_data']['em']);

            return $hasPurchaseName && $hasEventId && $hasCorrectValue && $hasCurrency && $hasOrderId && $hasTestCode && $hasHashedPhone && $hasHashedEmail;
        });
    }

    public function test_meta_conversions_api_service_idempotency_prevents_duplicate_calls(): void
    {
        Config::set('services.meta.pixel_id', '1234567890');
        Config::set('services.meta.access_token', 'test_access_token_EAAC');

        Http::fake();

        $order = Order::create([
            'order_number' => 'CHU-TEST-005',
            'customer_name' => 'Already Sent Customer',
            'mobile' => '01799887766',
            'district' => 'Dhaka',
            'address' => 'Dhanmondi, Dhaka',
            'subtotal' => 2500,
            'delivery_charge' => 80,
            'total' => 2580,
            'status' => 'complete',
            'payment_status' => 'paid',
            'payment_method' => 'cod',
            'meta_purchase_sent' => true,
            'meta_purchase_event_id' => 'uuid-already-sent',
            'meta_purchase_sent_at' => now(),
        ]);

        /** @var ConversionTrackingService $service */
        $service = app(ConversionTrackingService::class);
        $service->trackPurchase($order);

        Http::assertNothingSent();
    }

    public function test_checkout_order_placement_saves_tracking_fields_and_holds_meta_event_when_admin_confirmed_mode(): void
    {
        Queue::fake([SendMetaPurchaseEvent::class]);

        // Default mode is admin_confirmed
        StoreSetting::setValue('facebook_purchase_trigger', 'admin_confirmed');

        $product = Product::create([
            'name' => 'Organic Honey',
            'slug' => 'organic-honey',
            'product_code' => 'SKU-HONEY-01',
            'price' => 850,
            'status' => 'active',
            'stock_quantity' => 50,
        ]);

        $response = $this->withServerVariables([
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestBrowser',
            'REMOTE_ADDR' => '103.100.50.25',
        ])->withUnencryptedCookies([
            '_fbp' => 'fb.1.1680000000.123456789',
            '_fbc' => 'fb.1.1680000000.IwAR_test_click_id',
        ])->post(route('checkout.place-order'), [
            'customer_name' => 'Akash Khan',
            'mobile' => '01711223344',
            'district' => 'Dhaka',
            'thana' => 'Mirpur',
            'address' => 'Mirpur DOHS, Road 5',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => 850,
                ],
            ],
        ]);

        $response->assertStatus(302);

        $order = Order::where('mobile', '01711223344')->first();
        $this->assertNotNull($order);
        $this->assertNotNull($order->meta_purchase_event_id);
        $this->assertEquals('fb.1.1680000000.123456789', $order->fbp);
        $this->assertEquals('fb.1.1680000000.IwAR_test_click_id', $order->fbc);
        $this->assertStringContainsString('TestBrowser', (string) $order->user_agent);

        // Under admin_confirmed mode, event is held until admin confirms/completes the order
        Queue::assertNotPushed(SendMetaPurchaseEvent::class);
    }

    public function test_checkout_order_placement_dispatches_when_instant_checkout_mode(): void
    {
        Queue::fake([SendMetaPurchaseEvent::class]);

        StoreSetting::setValue('facebook_purchase_trigger', 'instant_checkout');

        $product = Product::create([
            'name' => 'Organic Ghee',
            'slug' => 'organic-ghee',
            'product_code' => 'SKU-GHEE-01',
            'price' => 1200,
            'status' => 'active',
            'stock_quantity' => 25,
        ]);

        $response = $this->withServerVariables([
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InstantBrowser',
            'REMOTE_ADDR' => '103.100.50.99',
        ])->withUnencryptedCookies([
            '_fbp' => 'fb.1.1680000000.instant_fbp',
            '_fbc' => 'fb.1.1680000000.instant_fbc',
        ])->post(route('checkout.place-order'), [
            'customer_name' => 'Instant Buyer',
            'mobile' => '01799001122',
            'district' => 'Dhaka',
            'thana' => 'Gulshan',
            'address' => 'Gulshan-2, Road 11',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => 1200,
                ],
            ],
        ]);

        $response->assertStatus(302);

        $order = Order::where('mobile', '01799001122')->first();
        $this->assertNotNull($order);

        Queue::assertPushed(SendMetaPurchaseEvent::class, function ($job) use ($order) {
            return $job->order->id === $order->id;
        });
    }

    public function test_admin_can_manually_send_meta_purchase_event(): void
    {
        Config::set('services.meta.pixel_id', '1234567890');
        Config::set('services.meta.access_token', 'test_access_token_EAAC');

        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'events_received' => 1,
                'fbtrace_id' => 'trace_manual_send_123',
            ], 200),
        ]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'CHU-MANUAL-001',
            'customer_name' => 'Manual Customer',
            'mobile' => '01788776655',
            'district' => 'Dhaka',
            'address' => 'Banani, Dhaka',
            'subtotal' => 3000,
            'delivery_charge' => 80,
            'total' => 3080,
            'status' => 'processing',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'meta_purchase_sent' => false,
        ]);

        $response = $this->actingAs($user)->post(route('admin.orders.send-meta-purchase', ['id' => $order->id]));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $order->refresh();
        $this->assertTrue($order->meta_purchase_sent);
        $this->assertNotNull($order->meta_purchase_sent_at);
    }

    public function test_meta_conversions_api_service_test_connection_endpoint(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'events_received' => 1,
                'fbtrace_id' => 'trace_test_capi_999',
            ], 200),
        ]);

        $response = $this->actingAs($user)->post(route('admin.integrations.test-meta-capi'), [
            'pixel_id' => '9876543210',
            'access_token' => 'EAAC_fake_token_for_testing',
            'test_event_code' => 'TEST12345',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'events_received' => 1,
            'fbtrace_id' => 'trace_test_capi_999',
        ]);
    }

    public function test_meta_conversions_api_uses_order_stored_user_agent_and_cookies(): void
    {
        Config::set('services.meta.pixel_id', '1234567890');
        Config::set('services.meta.access_token', 'test_access_token_EAAC');

        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'events_received' => 1,
            ], 200),
        ]);

        $order = Order::create([
            'order_number' => 'CHU-TEST-STORED-01',
            'customer_name' => 'Tanvir Hasan',
            'mobile' => '01755667788',
            'district' => 'Dhaka',
            'address' => 'Uttara, Sector 3',
            'subtotal' => 1800,
            'delivery_charge' => 80,
            'total' => 1880,
            'status' => 'processing',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'ip_address' => '103.20.10.5',
            'user_agent' => 'SpecificCustomerBrowser/2.0',
            'fbp' => 'fb.1.1690000000.987654321',
            'fbc' => 'fb.1.1690000000.click_id_999',
            'meta_purchase_sent' => false,
        ]);

        /** @var ConversionTrackingService $service */
        $service = app(ConversionTrackingService::class);
        $service->trackPurchase($order);

        $order->refresh();
        $this->assertTrue($order->meta_purchase_sent);

        Http::assertSent(function ($request) {
            $userData = $request['data'][0]['user_data'];

            return $userData['client_ip_address'] === '103.20.10.5'
                && $userData['client_user_agent'] === 'SpecificCustomerBrowser/2.0'
                && $userData['fbp'] === 'fb.1.1690000000.987654321'
                && $userData['fbc'] === 'fb.1.1690000000.click_id_999';
        });
    }
}
