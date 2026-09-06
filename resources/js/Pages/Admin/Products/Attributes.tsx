import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader, AdminInput, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { Tag, Plus, Edit2, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Save, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AttributeOption {
    id: number;
    value: string;
    slug: string;
    color_hex: string | null;
    image_path: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
}

interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'text' | 'color' | 'image';
    status: 'active' | 'inactive';
    sort_order: number;
    values: AttributeOption[];
    values_count: number;
}

interface AttributesProps {
    attributes: Attribute[];
}

export const Attributes: React.FC<AttributesProps> = ({ attributes }) => {
    const [expandedAttr, setExpandedAttr] = useState<number | null>(null);
    const [editingAttr, setEditingAttr] = useState<number | null>(null);
    const [editingOption, setEditingOption] = useState<number | null>(null);
    const [showCreateAttr, setShowCreateAttr] = useState(false);
    const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null);

    // Create Attribute Form
    const createAttrForm = useForm({ name: '', type: 'text' as 'text' | 'color' | 'image', sort_order: '0' });

    // Edit Attribute Form
    const editAttrForm = useForm({ name: '', type: 'text' as 'text' | 'color' | 'image', status: 'active' as 'active' | 'inactive', sort_order: '0' });

    // Add Option Form
    const addOptionForm = useForm({ value: '', color_hex: '#000000', sort_order: '0' });

    // Edit Option Form
    const editOptionForm = useForm({ value: '', color_hex: '#000000', status: 'active' as 'active' | 'inactive', sort_order: '0' });

    const handleCreateAttr = (e: React.FormEvent) => {
        e.preventDefault();
        createAttrForm.post(route('admin.attributes.store'), {
            onSuccess: () => {
                toast.success('অ্যাট্রিবিউট তৈরি করা হয়েছে! 🎉');
                createAttrForm.reset();
                setShowCreateAttr(false);
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const startEditAttr = (attr: Attribute) => {
        editAttrForm.setData({
            name: attr.name,
            type: attr.type,
            status: attr.status,
            sort_order: String(attr.sort_order),
        });
        setEditingAttr(attr.id);
    };

    const handleEditAttr = (e: React.FormEvent, attrId: number) => {
        e.preventDefault();
        editAttrForm.put(route('admin.attributes.update', attrId), {
            onSuccess: () => {
                toast.success('অ্যাট্রিবিউট আপডেট করা হয়েছে!');
                setEditingAttr(null);
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleDeleteAttr = (attr: Attribute) => {
        if (!confirm(`"${attr.name}" মুছে ফেলতে চান?`)) return;
        router.delete(route('admin.attributes.destroy', attr.id), {
            onSuccess: () => toast.success('অ্যাট্রিবিউট মুছে ফেলা হয়েছে।'),
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleToggleAttr = (attr: Attribute) => {
        router.post(route('admin.attributes.toggle-status', attr.id), {}, {
            onSuccess: () => toast.success(`${attr.name} এখন ${attr.status === 'active' ? 'Inactive' : 'Active'}।`),
        });
    };

    // Option handlers
    const handleAddOption = (e: React.FormEvent, attrId: number) => {
        e.preventDefault();
        addOptionForm.post(route('admin.attributes.options.store', attrId), {
            onSuccess: () => {
                toast.success('অপশন যোগ করা হয়েছে! ✅');
                addOptionForm.reset();
                setAddingOptionFor(null);
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const startEditOption = (option: AttributeOption) => {
        editOptionForm.setData({
            value: option.value,
            color_hex: option.color_hex || '#000000',
            status: option.status,
            sort_order: String(option.sort_order),
        });
        setEditingOption(option.id);
    };

    const handleEditOption = (e: React.FormEvent, attrId: number, optionId: number) => {
        e.preventDefault();
        editOptionForm.put(route('admin.attributes.options.update', { attributeId: attrId, optionId }), {
            onSuccess: () => {
                toast.success('অপশন আপডেট করা হয়েছে!');
                setEditingOption(null);
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleDeleteOption = (attrId: number, option: AttributeOption) => {
        if (!confirm(`"${option.value}" মুছে ফেলতে চান?`)) return;
        router.delete(route('admin.attributes.options.destroy', { attributeId: attrId, optionId: option.id }), {
            onSuccess: () => toast.success('অপশন মুছে ফেলা হয়েছে।'),
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleToggleOption = (attrId: number, option: AttributeOption) => {
        router.post(route('admin.attributes.options.toggle-status', { attributeId: attrId, optionId: option.id }), {}, {
            onSuccess: () => toast.success(`${option.value} এখন ${option.status === 'active' ? 'Inactive' : 'Active'}।`),
        });
    };

    const typeLabel = (type: string) => {
        if (type === 'color') return 'Color';
        if (type === 'image') return 'Image';
        return 'Text';
    };

    const typeColors: Record<string, string> = {
        text: 'bg-blue-50 text-blue-700',
        color: 'bg-purple-50 text-purple-700',
        image: 'bg-orange-50 text-orange-700',
    };

    return (
        <AdminLayout>
            <Head title="Attributes — Product Management" />
            <PageHeader title="Product Attributes" subtitle="Manage dynamic product attributes (Size, Color, Weight) and their options" />

            {/* Create Attribute Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowCreateAttr(!showCreateAttr)}
                    className="flex items-center gap-2 bg-[#009E49] hover:bg-[#008038] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    নতুন Attribute তৈরি করুন
                </button>
            </div>

            {/* Create Attribute Form */}
            {showCreateAttr && (
                <AdminCard className="p-5 mb-5 border-[#009E49]/30 bg-[#F0FFF7]">
                    <h3 className="text-sm font-black text-[#009E49] mb-4">✨ নতুন Attribute তৈরি</h3>
                    <form onSubmit={handleCreateAttr} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                            <FieldLabel required>Attribute Name</FieldLabel>
                            <AdminInput
                                placeholder="e.g. Size, Color, Weight"
                                value={createAttrForm.data.name}
                                onChange={e => createAttrForm.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <FieldLabel>Type</FieldLabel>
                            <AdminSelect
                                value={createAttrForm.data.type}
                                onChange={e => createAttrForm.setData('type', e.target.value as 'text' | 'color' | 'image')}
                            >
                                <option value="text">Text (S, M, L / 250g, 500g)</option>
                                <option value="color">Color (with HEX picker)</option>
                                <option value="image">Image (thumbnail options)</option>
                            </AdminSelect>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={createAttrForm.processing}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-[#009E49] hover:bg-[#008038] disabled:opacity-60 text-white text-sm font-bold h-10 rounded-xl cursor-pointer transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                                তৈরি করুন
                            </button>
                            <button type="button" onClick={() => setShowCreateAttr(false)} className="px-3 h-10 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </AdminCard>
            )}

            {/* Attributes List */}
            {attributes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E7FF] p-12 text-center">
                    <Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-400 text-sm">কোনো অ্যাট্রিবিউট নেই। উপরের বোতামে ক্লিক করে তৈরি করুন।</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {attributes.map(attr => (
                        <AdminCard key={attr.id} className="overflow-hidden">
                            {/* Attribute Row */}
                            {editingAttr === attr.id ? (
                                <form onSubmit={e => handleEditAttr(e, attr.id)} className="p-4 bg-amber-50 border-b border-amber-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                    <div>
                                        <FieldLabel required>Name</FieldLabel>
                                        <AdminInput value={editAttrForm.data.name} onChange={e => editAttrForm.setData('name', e.target.value)} required />
                                    </div>
                                    <div>
                                        <FieldLabel>Type</FieldLabel>
                                        <AdminSelect value={editAttrForm.data.type} onChange={e => editAttrForm.setData('type', e.target.value as 'text' | 'color' | 'image')}>
                                            <option value="text">Text</option>
                                            <option value="color">Color</option>
                                            <option value="image">Image</option>
                                        </AdminSelect>
                                    </div>
                                    <div>
                                        <FieldLabel>Status</FieldLabel>
                                        <AdminSelect value={editAttrForm.data.status} onChange={e => editAttrForm.setData('status', e.target.value as 'active' | 'inactive')}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </AdminSelect>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={editAttrForm.processing} className="flex-1 flex items-center justify-center gap-1 bg-[#009E49] text-white text-xs font-bold h-9 rounded-lg cursor-pointer">
                                            <Check className="w-3.5 h-3.5" /> Save
                                        </button>
                                        <button type="button" onClick={() => setEditingAttr(null)} className="px-3 h-9 border border-gray-200 rounded-lg text-gray-500 text-xs cursor-pointer">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                                    {/* Status Toggle */}
                                    <button onClick={() => handleToggleAttr(attr)} className="cursor-pointer" title={attr.status === 'active' ? 'Click to deactivate' : 'Click to activate'}>
                                        {attr.status === 'active'
                                            ? <ToggleRight className="w-7 h-7 text-[#009E49]" />
                                            : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[13px] font-black text-[#1A1A2E]">{attr.name}</span>
                                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase ${typeColors[attr.type] || 'bg-gray-100 text-gray-600'}`}>
                                                {typeLabel(attr.type)}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{attr.values?.length || 0} options</span>
                                            {attr.status === 'inactive' && (
                                                <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md">INACTIVE</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => startEditAttr(attr)}
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAttr(attr)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setExpandedAttr(expandedAttr === attr.id ? null : attr.id)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 cursor-pointer transition-colors"
                                        >
                                            Manage Options
                                            {expandedAttr === attr.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Options Panel (expandable) */}
                            {expandedAttr === attr.id && (
                                <div className="bg-gray-50/70">
                                    {/* Options Table */}
                                    {attr.values && attr.values.length > 0 ? (
                                        <div className="p-3">
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 bg-gray-50">
                                                            <th className="text-left px-3 py-2 font-black text-gray-600">Option</th>
                                                            {attr.type === 'color' && <th className="text-left px-3 py-2 font-black text-gray-600">Color</th>}
                                                            <th className="text-left px-3 py-2 font-black text-gray-600">Sort</th>
                                                            <th className="text-left px-3 py-2 font-black text-gray-600">Status</th>
                                                            <th className="text-right px-3 py-2 font-black text-gray-600">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {attr.values.map(option => (
                                                            <React.Fragment key={option.id}>
                                                                {editingOption === option.id ? (
                                                                    <tr className="bg-amber-50">
                                                                        <td colSpan={attr.type === 'color' ? 5 : 4} className="p-3">
                                                                            <form onSubmit={e => handleEditOption(e, attr.id, option.id)} className="flex gap-2 items-end flex-wrap">
                                                                                <div className="flex-1 min-w-[120px]">
                                                                                    <FieldLabel required>Value</FieldLabel>
                                                                                    <AdminInput value={editOptionForm.data.value} onChange={e => editOptionForm.setData('value', e.target.value)} required />
                                                                                </div>
                                                                                {attr.type === 'color' && (
                                                                                    <div>
                                                                                        <FieldLabel>HEX</FieldLabel>
                                                                                        <div className="flex gap-1.5 items-center">
                                                                                            <input type="color" value={editOptionForm.data.color_hex} onChange={e => editOptionForm.setData('color_hex', e.target.value)} className="h-9 w-12 rounded-lg border border-gray-300 p-1 cursor-pointer" />
                                                                                            <span className="font-mono text-xs text-gray-500">{editOptionForm.data.color_hex}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                <div className="w-28">
                                                                                    <FieldLabel>Status</FieldLabel>
                                                                                    <AdminSelect value={editOptionForm.data.status} onChange={e => editOptionForm.setData('status', e.target.value as 'active' | 'inactive')}>
                                                                                        <option value="active">Active</option>
                                                                                        <option value="inactive">Inactive</option>
                                                                                    </AdminSelect>
                                                                                </div>
                                                                                <div className="flex gap-1.5">
                                                                                    <button type="submit" disabled={editOptionForm.processing} className="flex items-center gap-1 bg-[#009E49] text-white text-xs font-bold px-3 h-9 rounded-lg cursor-pointer">
                                                                                        <Check className="w-3 h-3" /> Save
                                                                                    </button>
                                                                                    <button type="button" onClick={() => setEditingOption(null)} className="px-3 h-9 border border-gray-200 rounded-lg text-gray-500 text-xs cursor-pointer">Cancel</button>
                                                                                </div>
                                                                            </form>
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                                                        <td className="px-3 py-2">
                                                                            <span className="font-bold text-gray-800">{option.value}</span>
                                                                        </td>
                                                                        {attr.type === 'color' && (
                                                                            <td className="px-3 py-2">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    {option.color_hex && (
                                                                                        <span style={{ backgroundColor: option.color_hex }} className="w-5 h-5 rounded-full border border-black/10 shrink-0" />
                                                                                    )}
                                                                                    <span className="font-mono text-gray-500">{option.color_hex || '—'}</span>
                                                                                </div>
                                                                            </td>
                                                                        )}
                                                                        <td className="px-3 py-2 text-gray-500">{option.sort_order}</td>
                                                                        <td className="px-3 py-2">
                                                                            <button onClick={() => handleToggleOption(attr.id, option)} className="cursor-pointer" title="Toggle status">
                                                                                {option.status === 'active'
                                                                                    ? <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md">ACTIVE</span>
                                                                                    : <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md">INACTIVE</span>}
                                                                            </button>
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right">
                                                                            <div className="flex items-center gap-1 justify-end">
                                                                                <button onClick={() => startEditOption(option)} className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer" title="Edit">
                                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button onClick={() => handleDeleteOption(attr.id, option)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" title="Delete">
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
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-400">
                                            কোনো অপশন নেই। নিচের ফর্মে যোগ করুন।
                                        </div>
                                    )}

                                    {/* Add Option Form */}
                                    {addingOptionFor === attr.id ? (
                                        <form onSubmit={e => handleAddOption(e, attr.id)} className="p-3 border-t border-gray-200 bg-white flex gap-2 items-end flex-wrap">
                                            <div className="flex-1 min-w-[140px]">
                                                <FieldLabel required>Option Value</FieldLabel>
                                                <AdminInput placeholder={attr.type === 'color' ? 'e.g. Red' : 'e.g. Small'} value={addOptionForm.data.value} onChange={e => addOptionForm.setData('value', e.target.value)} required />
                                            </div>
                                            {attr.type === 'color' && (
                                                <div>
                                                    <FieldLabel>HEX Color</FieldLabel>
                                                    <div className="flex gap-1.5 items-center">
                                                        <input type="color" value={addOptionForm.data.color_hex} onChange={e => addOptionForm.setData('color_hex', e.target.value)} className="h-9 w-12 rounded-lg border border-gray-300 p-1 cursor-pointer" />
                                                        <span className="font-mono text-xs text-gray-500">{addOptionForm.data.color_hex}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-1.5">
                                                <button type="submit" disabled={addOptionForm.processing} className="flex items-center gap-1 bg-[#009E49] text-white text-xs font-bold px-3 h-9 rounded-lg cursor-pointer">
                                                    <Check className="w-3 h-3" /> Add
                                                </button>
                                                <button type="button" onClick={() => setAddingOptionFor(null)} className="px-3 h-9 border border-gray-200 rounded-lg text-gray-500 text-xs cursor-pointer">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-3 border-t border-gray-200">
                                            <button
                                                onClick={() => setAddingOptionFor(attr.id)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-[#009E49] hover:text-[#008038] cursor-pointer transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                নতুন Option যোগ করুন
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AdminCard>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default Attributes;
