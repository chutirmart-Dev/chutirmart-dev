<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminAttributeController extends Controller
{
    // ─── Attributes ──────────────────────────────────────────────────────────

    public function index()
    {
        $attributes = Attribute::withCount('values')
            ->with(['values' => fn ($q) => $q->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Products/Attributes', [
            'attributes' => $attributes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name',
            'type' => 'required|in:text,color,image',
            'sort_order' => 'nullable|integer',
        ]);

        Attribute::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'type' => $request->type,
            'status' => 'active',
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return back()->with('success', 'অ্যাট্রিবিউট তৈরি করা হয়েছে।');
    }

    public function update(Request $request, string $id)
    {
        $attribute = Attribute::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name,'.$attribute->id,
            'type' => 'required|in:text,color,image',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
        ]);

        $attribute->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'type' => $request->type,
            'status' => $request->status,
            'sort_order' => $request->sort_order ?? $attribute->sort_order,
        ]);

        return back()->with('success', 'অ্যাট্রিবিউট আপডেট করা হয়েছে।');
    }

    public function destroy(string $id)
    {
        $attribute = Attribute::withCount('values')->findOrFail($id);

        // Check if any product variation uses an option of this attribute
        $inUse = DB::table('product_attribute_options')
            ->where('attribute_id', $attribute->id)
            ->exists();

        if ($inUse) {
            return back()->withErrors(['attribute' => 'এই অ্যাট্রিবিউটটি কোনো পণ্যে ব্যবহৃত হচ্ছে। প্রথমে সেই পণ্য থেকে সরান।']);
        }

        $attribute->delete();

        return back()->with('success', 'অ্যাট্রিবিউট মুছে ফেলা হয়েছে।');
    }

    public function toggleStatus(string $id)
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->status = $attribute->status === 'active' ? 'inactive' : 'active';
        $attribute->save();

        $label = $attribute->status === 'active' ? 'Active' : 'Inactive';

        return back()->with('success', "{$attribute->name} এখন {$label}।");
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:attributes,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            Attribute::where('id', $item['id'])->update(['sort_order' => $item['order']]);
        }

        return back()->with('success', 'সাজানো সম্পন্ন হয়েছে।');
    }

    // ─── Attribute Options ────────────────────────────────────────────────────

    public function storeOption(Request $request, string $attributeId)
    {
        $attribute = Attribute::findOrFail($attributeId);

        $request->validate([
            'value' => 'required|string|max:255',
            'color_hex' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'image' => 'nullable|string', // base64 or path
        ]);

        // Check duplicate value in same attribute
        $exists = AttributeValue::where('attribute_id', $attribute->id)
            ->where('value', $request->value)
            ->exists();
        if ($exists) {
            return back()->withErrors(['value' => "এই অ্যাট্রিবিউটে '{$request->value}' ইতিমধ্যে আছে।"]);
        }

        $imagePath = null;
        if ($request->filled('image') && str_starts_with($request->image, 'data:image')) {
            $imagePath = MediaService::storeImage($request->image, 'attributes', 400);
        }

        AttributeValue::create([
            'attribute_id' => $attribute->id,
            'value' => $request->value,
            'slug' => Str::slug($request->value).'-'.time(),
            'color_hex' => $request->color_hex,
            'status' => 'active',
            'sort_order' => $request->sort_order ?? 0,
            'image_path' => $imagePath,
        ]);

        return back()->with('success', 'অপশন যোগ করা হয়েছে।');
    }

    public function updateOption(Request $request, string $attributeId, string $optionId)
    {
        $option = AttributeValue::where('attribute_id', $attributeId)->findOrFail($optionId);

        $request->validate([
            'value' => 'required|string|max:255',
            'color_hex' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|string',
        ]);

        // Check duplicate (exclude self)
        $exists = AttributeValue::where('attribute_id', $attributeId)
            ->where('value', $request->value)
            ->where('id', '!=', $option->id)
            ->exists();
        if ($exists) {
            return back()->withErrors(['value' => "এই অ্যাট্রিবিউটে '{$request->value}' ইতিমধ্যে আছে।"]);
        }

        $imagePath = $option->image_path;
        if ($request->filled('image') && str_starts_with($request->image, 'data:image')) {
            $imagePath = MediaService::storeImage($request->image, 'attributes', 400);
        }

        $option->update([
            'value' => $request->value,
            'slug' => Str::slug($request->value).'-'.$option->id,
            'color_hex' => $request->color_hex,
            'status' => $request->status,
            'sort_order' => $request->sort_order ?? $option->sort_order,
            'image_path' => $imagePath,
        ]);

        return back()->with('success', 'অপশন আপডেট করা হয়েছে।');
    }

    public function destroyOption(string $attributeId, string $optionId)
    {
        $option = AttributeValue::where('attribute_id', $attributeId)->findOrFail($optionId);

        $inUse = DB::table('product_attribute_options')
            ->where('option_id', $option->id)
            ->exists();

        if ($inUse) {
            return back()->withErrors(['option' => 'এই অপশনটি কোনো পণ্যে ব্যবহৃত হচ্ছে।']);
        }

        $option->delete();

        return back()->with('success', 'অপশন মুছে ফেলা হয়েছে।');
    }

    public function toggleOptionStatus(string $attributeId, string $optionId)
    {
        $option = AttributeValue::where('attribute_id', $attributeId)->findOrFail($optionId);
        $option->status = $option->status === 'active' ? 'inactive' : 'active';
        $option->save();

        $label = $option->status === 'active' ? 'Active' : 'Inactive';

        return back()->with('success', "{$option->value} এখন {$label}।");
    }

    public function reorderOptions(Request $request, string $attributeId)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:attribute_values,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            AttributeValue::where('id', $item['id'])
                ->where('attribute_id', $attributeId)
                ->update(['sort_order' => $item['order']]);
        }

        return back()->with('success', 'সাজানো সম্পন্ন হয়েছে।');
    }
}
