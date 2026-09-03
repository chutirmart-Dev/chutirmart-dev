<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Tag;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminTaxonomyController extends Controller
{
    // Brands
    public function brands()
    {
        $brands = Brand::withCount('products')->orderBy('name')->get();

        return Inertia::render('Admin/Products/Brands', [
            'brands' => $brands,
        ]);
    }

    public function storeBrand(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
            'description' => 'nullable|string',
            'logo_path' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $logoPath = $request->logo_path;
        if ($logoPath && str_starts_with($logoPath, 'data:image')) {
            $logoPath = MediaService::storeImage($logoPath, 'brands', 600);
        }

        Brand::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'logo_path' => $logoPath,
            'status' => $request->status,
        ]);

        return back()->with('success', 'ব্র্যান্ড যোগ করা হয়েছে।');
    }

    // Categories
    public function categories()
    {
        $categories = Category::with('parent')
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/Products/Categories', [
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string',
            'sort_order' => 'required|integer',
            'status' => 'required|in:active,inactive',
        ]);

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'icon' => $request->icon,
            'sort_order' => $request->sort_order,
            'status' => $request->status,
        ]);

        return back()->with('success', 'ক্যাটাগরি যোগ করা হয়েছে।');
    }

    // Tags
    public function tags()
    {
        $tags = Tag::withCount('products')->orderBy('name')->get();

        return Inertia::render('Admin/Products/Tags', [
            'tags' => $tags,
        ]);
    }

    public function storeTag(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
        ]);

        Tag::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return back()->with('success', 'ট্যাগ যোগ করা হয়েছে।');
    }

    // Attributes
    public function attributes()
    {
        $attributes = Attribute::with('values')->orderBy('name')->get();

        return Inertia::render('Admin/Products/Attributes', [
            'attributes' => $attributes,
        ]);
    }

    public function storeAttribute(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name',
            'type' => 'required|in:color,text',
        ]);

        Attribute::create($request->only(['name', 'type']));

        return back()->with('success', 'অ্যাট্রিবিউট যোগ করা হয়েছে।');
    }

    public function storeAttributeValue(Request $request)
    {
        $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255',
            'color_hex' => 'nullable|string|size:7',
        ]);

        AttributeValue::create($request->only(['attribute_id', 'value', 'color_hex']));

        return back()->with('success', 'অ্যাট্রিবিউট ভ্যালু যোগ করা হয়েছে।');
    }
}
