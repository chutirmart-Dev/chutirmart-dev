<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_new_users_can_register_with_phone_number(): void
    {
        $response = $this->post('/register', [
            'name' => 'Phone User',
            'phone' => '01711223344',
            'email' => 'phoneuser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'name' => 'Phone User',
            'phone' => '01711223344',
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_new_users_can_register_with_phone_only(): void
    {
        $response = $this->post('/register', [
            'name' => 'Mobile Only User',
            'phone' => '01899887766',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'name' => 'Mobile Only User',
            'phone' => '01899887766',
            'email' => null,
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
