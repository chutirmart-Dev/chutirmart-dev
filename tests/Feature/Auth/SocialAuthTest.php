<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_redirect_handles_unconfigured_credentials_gracefully(): void
    {
        config(['services.google.client_id' => null]);

        $response = $this->get(route('auth.google'));

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');
    }

    public function test_google_redirect_redirects_to_accounts_google_when_configured(): void
    {
        config([
            'services.google.client_id' => 'test-google-client-id.apps.googleusercontent.com',
            'services.google.client_secret' => 'test-secret',
            'services.google.redirect' => 'http://localhost/chutirmart/public/auth/google/callback',
        ]);

        $response = $this->get(route('auth.google'));

        $response->assertRedirect();
        $this->assertStringContainsString('accounts.google.com/o/oauth2/v2/auth', $response->headers->get('Location'));
        $this->assertStringContainsString('client_id=test-google-client-id', $response->headers->get('Location'));
    }

    public function test_google_callback_handles_cancellation(): void
    {
        $response = $this->get(route('auth.google.callback', ['error' => 'access_denied']));

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');
    }
}
