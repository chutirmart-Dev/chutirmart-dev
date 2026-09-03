<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchSuggestionTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_suggestion_returns_json_structure(): void
    {
        $response = $this->getJson('/api/search-suggest?q=Smart');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'products',
                'categories',
                'query',
                'is_popular',
            ]);
    }

    public function test_search_suggestion_handles_empty_query(): void
    {
        $response = $this->getJson('/api/search-suggest?q=');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'products',
                'categories',
                'query',
                'is_popular',
            ]);
    }

    public function test_search_suggestion_matches_fuzzy_typos_and_multiword(): void
    {
        Product::create([
            'name' => 'High-Speed Rechargeable Water Spray Gun',
            'slug' => 'high-speed-rechargeable-water-spray-gun',
            'price' => 1800,
            'status' => 'active',
            'stock_quantity' => 10,
        ]);

        $response = $this->getJson('/api/search-suggest?q=High+Spped+Reacharbale+At');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertNotEmpty($data['products']);
        $this->assertEquals('High-Speed Rechargeable Water Spray Gun', $data['products'][0]['name']);
    }
}
