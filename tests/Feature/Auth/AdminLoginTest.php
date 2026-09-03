<?php

namespace Tests\Feature\Auth;

use App\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_screen_can_be_rendered(): void
    {
        $response = $this->get(route('admin.login'));
        $response->assertStatus(200);
    }

    public function test_admin_users_can_authenticate(): void
    {
        $admin = AdminUser::create([
            'name' => 'Admin User',
            'email' => 'admin@chutirmart.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
        ]);

        $response = $this->post(route('admin.login'), [
            'email' => 'admin@chutirmart.com',
            'password' => 'admin123',
        ]);

        $this->assertAuthenticatedAs($admin, 'admin');
        $response->assertRedirect(route('admin.dashboard'));
    }
}
