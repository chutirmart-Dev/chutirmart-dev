import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AdminCard, AdminInput, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { Layers, Zap, Edit2, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface AttributeOption {
    id: number;
    value: string;
    color_hex: string | null;
    image_path: string | null;
    status: 'active' | 'inactive';
}

interface Attribute {
    id: number;
    name: string;
    type: 'text' | 'color' | 'image';
    status: 'active' | 'inactive';
    values: AttributeOption[];
}

interface Variation {
    id: number;
    sku: string | null;
    price: number | null;
    sale_price: number | null;
    stock_quantity: number;
    stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
    status: 'active' | 'inactive';
    option_ids: number[];
    options?: { id: number; value: string; attribute?: { name: string } }[];
}

interface VariationsSectionProps {
    productId: number | null; // null when creating (not yet saved)
    attributes: Attribute[];
    initialSelectedOptions: Record<number, number[]>; // {attrId: [optionId, ...]}
    initialVariations: Variation[];
    onSelectionChange: (selectedOptions: Record<number, number[]>) => void;
}

export const VariationsSection: React.FC<VariationsSectionProps> = ({
    productId,
    attributes,
    initialSelectedOptions,
    initialVariations,
    onSelectionChange,
}) => {
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>(initialSelectedOptions || {});
    const [variations, setVariations] = useState<Variation[]>(initialVariations || []);
    const [editingVariation, setEditingVariation] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showVariations, setShowVariations] = useState(true);

    useEffect(() => {
        setVariations(initialVariations || []);
    }, [initialVariations]);

    useEffect(() => {
        setSelectedOptions(initialSelectedOptions || {});
    }, [initialSelectedOptions]);

    const editVarForm = useForm({
        sku: '',
        price: '',
        sale_price: '',
        stock_quantity: '0',
        stock_status: 'in_stock' as 'in_stock' | 'out_of_stock' | 'backorder',
        status: 'active' as 'active' | 'inactive',
    });

    const toggleOption = (attrId: number, optionId: number) => {
        const current = selectedOptions[attrId] || [];
        const updated = current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId];

        const newSelections = { ...selectedOptions, [attrId]: updated };
        if (updated.length === 0) {
            delete newSelections[attrId];
        }
        setSelectedOptions(newSelections);
        onSelectionChange(newSelections);
    };

    const isOptionSelected = (attrId: number, optionId: number) =>
        (selectedOptions[attrId] || []).includes(optionId);

    const handleGenerate = () => {
        if (!productId) {
            toast.error('প্রথমে পণ্যটি সেভ করুন, তারপর ভ্যারিয়েশন তৈরি করুন।');
            return;
        }

        const hasSelections = Object.values(selectedOptions).some(ids => ids.length > 0);
        if (!hasSelections) {
            toast.error('অন্তত একটি অ্যাট্রিবিউটের কিছু অপশন সিলেক্ট করুন।');
            return;
        }

        const attributeOptionsArray = Object.entries(selectedOptions)
            .filter(([_, ids]) => ids.length > 0)
            .map(([attrId, optionIds]) => ({ attribute_id: Number(attrId), option_ids: optionIds }));

        setIsGenerating(true);
        router.post(route('admin.products.variations.generate', productId), {
            selected_attribute_options: attributeOptionsArray,
        }, {
            onSuccess: () => {
                toast.success('ভ্যারিয়েশন তৈরি হয়েছে! ✅');
                setIsGenerating(false);
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
                setIsGenerating(false);
            },
        });
    };

    const startEditVariation = (v: Variation) => {
        editVarForm.setData({
            sku: v.sku || '',
            price: v.price !== null ? String(v.price) : '',
            sale_price: v.sale_price !== null ? String(v.sale_price) : '',
            stock_quantity: String(v.stock_quantity),
            stock_status: v.stock_status,
            status: v.status,
        });
        setEditingVariation(v.id);
    };

    const handleEditVariation = (e: React.FormEvent, v: Variation) => {
        e.preventDefault();
        if (!productId) return;

        editVarForm.put(route('admin.products.variations.update', { id: productId, vid: v.id }), {
            onSuccess: () => {
                toast.success('ভ্যারিয়েশন আপডেট হয়েছে!');
                setEditingVariation(null);
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleDeleteVariation = (v: Variation) => {
        if (!productId) return;
        if (!confirm('এই ভ্যারিয়েশনটি মুছে ফেলতে চান?')) return;

        router.delete(route('admin.products.variations.destroy', { id: productId, vid: v.id }), {
            onSuccess: () => toast.success('ভ্যারিয়েশন মুছে ফেলা হয়েছে।'),
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const getVariationLabel = (v: Variation): string => {
        if (v.options && v.options.length > 0) {
            return v.options.map(o => o.value).join(' / ');
        }
        return `Variation #${v.id}`;
    };

    const activeAttributes = attributes.filter(a => a.status === 'active' && a.values?.length > 0);

    return (
        <div className="space-y-4">
            {/* Step 1: Select Attribute Options */}
            <AdminCard>
                <div className="px-5 py-3 border-b border-[#F0EFFE] bg-[#F8F7FF] rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#009E49]" />
                        <span className="text-[13px] font-black text-[#1A1A2E]">Step 1 — অ্যাট্রিবিউট ও অপশন নির্বাচন করুন</span>
                    </div>
                    <p className="text-xs text-[#9096B0] mt-0.5">এই পণ্যে কোন কোন অপশন আছে তা সিলেক্ট করুন (e.g. Size: S, M, L)</p>
                </div>

                <div className="p-5">
                    {activeAttributes.length === 0 ? (
                        <div className="text-center py-6 text-sm text-gray-400">
                            কোনো অ্যাট্রিবিউট সক্রিয় নেই।{' '}
                            <a href={route('admin.attributes.index')} className="text-[#009E49] font-bold underline">
                                এখানে ক্লিক করে তৈরি করুন
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {activeAttributes.map(attr => (
                                <div key={attr.id}>
                                    <div className="text-xs font-black text-[#1A1A2E] mb-2">
                                        {attr.name}
                                        <span className="ml-1.5 text-[9px] font-mono font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">{attr.type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.values.filter(v => v.status === 'active').map(option => {
                                            const isSelected = isOptionSelected(attr.id, option.id);
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => toggleOption(attr.id, option.id)}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'bg-[#009E49] text-white border-[#009E49] shadow-sm'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#009E49]/50'
                                                    }`}
                                                >
                                                    {attr.type === 'color' && option.color_hex && (
                                                        <span
                                                            style={{ backgroundColor: option.color_hex }}
                                                            className="w-3 h-3 rounded-full border border-black/10"
                                                        />
                                                    )}
                                                    {option.value}
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdminCard>

            {/* Step 2: Generate Variations */}
            <AdminCard className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-[13.5px] sm:text-[14px] font-black text-[#1A1A2E]">Step 2 — ভ্যারিয়েশন তৈরি করুন</span>
                        </div>
                        <p className="text-[12px] sm:text-[13px] text-[#9096B0] mt-1 leading-relaxed">
                            সব সিলেক্ট করা অপশনের combination automatically তৈরি হবে।
                            {productId == null && ' (পণ্য সেভ করার পর এই বোতামে ক্লিক করুন)'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !productId}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] disabled:opacity-50 text-white text-[12.5px] sm:text-[13px] font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all shadow-xs shrink-0 whitespace-nowrap border-none"
                    >
                        <Zap className="w-4 h-4 shrink-0" />
                        <span>{isGenerating ? 'তৈরি হচ্ছে...' : 'ভ্যারিয়েশন Generate করুন'}</span>
                    </button>
                </div>
            </AdminCard>

            {/* Step 3: Variation Table */}
            {variations.length > 0 && (
                <AdminCard>
                    <div
                        className="px-5 py-3 border-b border-[#F0EFFE] flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setShowVariations(!showVariations)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#1A1A2E]">Step 3 — ভ্যারিয়েশন সেটআপ করুন</span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-md">{variations.length} টি</span>
                        </div>
                        {showVariations ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>

                    {showVariations && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left px-4 py-2.5 font-black text-gray-600">Variation</th>
                                        <th className="text-left px-4 py-2.5 font-black text-gray-600">SKU</th>
                                        <th className="text-left px-4 py-2.5 font-black text-gray-600">Price (৳)</th>
                                        <th className="text-left px-4 py-2.5 font-black text-gray-600">Sale Price (৳)</th>
                                        <th className="text-left px-4 py-2.5 font-black text-gray-600">Stock</th>
                                        <th className="text-left px-4 py-2.5 font-black text-gray-600">Status</th>
                                        <th className="text-right px-4 py-2.5 font-black text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variations.map(v => (
                                        <React.Fragment key={v.id}>
                                            {editingVariation === v.id ? (
                                                <tr className="bg-amber-50">
                                                    <td colSpan={7} className="p-3">
                                                        <form onSubmit={e => handleEditVariation(e, v)} className="space-y-2">
                                                            <div className="text-xs font-black text-gray-600 mb-2">Editing: {getVariationLabel(v)}</div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                                                <div>
                                                                    <FieldLabel>SKU</FieldLabel>
                                                                    <AdminInput placeholder="SKU" value={editVarForm.data.sku} onChange={e => editVarForm.setData('sku', e.target.value)} />
                                                                </div>
                                                                <div>
                                                                    <FieldLabel>Price (৳)</FieldLabel>
                                                                    <AdminInput type="number" placeholder="(blank = product price)" value={editVarForm.data.price} onChange={e => editVarForm.setData('price', e.target.value)} />
                                                                </div>
                                                                <div>
                                                                    <FieldLabel>Sale Price (৳)</FieldLabel>
                                                                    <AdminInput type="number" placeholder="Optional" value={editVarForm.data.sale_price} onChange={e => editVarForm.setData('sale_price', e.target.value)} />
                                                                </div>
                                                                <div>
                                                                    <FieldLabel required>Stock</FieldLabel>
                                                                    <AdminInput type="number" value={editVarForm.data.stock_quantity} onChange={e => editVarForm.setData('stock_quantity', e.target.value)} required />
                                                                </div>
                                                                <div>
                                                                    <FieldLabel>Stock Status</FieldLabel>
                                                                    <AdminSelect value={editVarForm.data.stock_status} onChange={e => editVarForm.setData('stock_status', e.target.value as 'in_stock' | 'out_of_stock' | 'backorder')}>
                                                                        <option value="in_stock">In Stock</option>
                                                                        <option value="out_of_stock">Out of Stock</option>
                                                                        <option value="backorder">Backorder</option>
                                                                    </AdminSelect>
                                                                </div>
                                                                <div>
                                                                    <FieldLabel>Status</FieldLabel>
                                                                    <AdminSelect value={editVarForm.data.status} onChange={e => editVarForm.setData('status', e.target.value as 'active' | 'inactive')}>
                                                                        <option value="active">Active</option>
                                                                        <option value="inactive">Inactive</option>
                                                                    </AdminSelect>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 pt-1">
                                                                <button type="submit" disabled={editVarForm.processing} className="flex items-center gap-1 bg-[#009E49] text-white text-xs font-bold px-3 h-8 rounded-lg cursor-pointer">
                                                                    <Check className="w-3 h-3" /> Save
                                                                </button>
                                                                <button type="button" onClick={() => setEditingVariation(null)} className="flex items-center gap-1 px-3 h-8 border border-gray-200 rounded-lg text-gray-500 text-xs cursor-pointer">
                                                                    <X className="w-3 h-3" /> Cancel
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                                    <td className="px-4 py-2.5">
                                                        <span className="font-bold text-gray-800">{getVariationLabel(v)}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 font-mono text-gray-500">{v.sku || '—'}</td>
                                                    <td className="px-4 py-2.5">{v.price !== null ? `৳${v.price}` : <span className="text-gray-400 italic">product price</span>}</td>
                                                    <td className="px-4 py-2.5">{v.sale_price !== null ? `৳${v.sale_price}` : '—'}</td>
                                                    <td className="px-4 py-2.5 font-bold">{v.stock_quantity}</td>
                                                    <td className="px-4 py-2.5">
                                                        {v.status === 'active'
                                                            ? <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md">ACTIVE</span>
                                                            : <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md">INACTIVE</span>}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <button onClick={() => startEditVariation(v)} className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer" title="Edit">
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => handleDeleteVariation(v)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" title="Delete">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            )}
        </div>
    );
};

export default VariationsSection;
