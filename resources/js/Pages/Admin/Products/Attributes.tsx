import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { Save, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface AttributesProps {
    attributes: any[];
}

export const Attributes: React.FC<AttributesProps> = ({ attributes }) => {
    const attrForm = useForm({
        name: '',
        type: 'text',
    });

    const valForm = useForm({
        attribute_id: '',
        value: '',
        color_hex: '#000000',
    });

    const handleAttrSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        attrForm.post(route('admin.attributes.store'), {
            onSuccess: () => {
                toast.success('Attribute type created successfully! 🎉');
                attrForm.reset();
            },
            onError: () => toast.error('Failed to create attribute type.')
        });
    };

    const handleValSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!valForm.data.attribute_id) {
            toast.error('Please select an attribute type.');
            return;
        }

        valForm.post(route('admin.attributes.value.store'), {
            onSuccess: () => {
                toast.success('Attribute value added successfully! 🎉');
                valForm.reset('value', 'color_hex');
            },
            onError: () => toast.error('Failed to add attribute value.')
        });
    };

    return (
        <AdminLayout>
            <Head title="Attributes" />
            <PageHeader title="Attributes" subtitle="Manage product variants like colors and sizes" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: View Existing */}
                <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-[14px] font-black text-[#1A1A2E] mb-3">Existing Attributes</h3>
                    {attributes.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-[#E8E7FF] p-8 text-center text-[#9096B0] text-sm">
                            <Tag className="w-8 h-8 mx-auto mb-2 text-[#E8E7FF]" />
                            No attributes created yet.
                        </div>
                    ) : (
                        attributes.map(attr => (
                            <AdminCard key={attr.id}>
                                <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0EFFE]">
                                    <span className="text-[13px] font-black text-[#1A1A2E]">{attr.name}</span>
                                    <span className="text-[9px] font-mono font-bold tracking-wider text-[#009E49] bg-[#E6F5EC] px-2 py-0.5 rounded-lg uppercase">
                                        {attr.type}
                                    </span>
                                </div>
                                <div className="p-4 flex flex-wrap gap-2">
                                    {attr.values?.map((val: any) => (
                                        <div 
                                            key={val.id} 
                                            className="flex items-center gap-1.5 bg-[#F8F7FF] border border-[#E8E7FF] rounded-xl px-2.5 py-1 text-xs font-bold text-[#2D3048]"
                                        >
                                            {attr.type === 'color' && val.color_hex && (
                                                <span style={{ backgroundColor: val.color_hex }} className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" />
                                            )}
                                            <span>{val.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </AdminCard>
                        ))
                    )}
                </div>

                {/* Right Column: Creation Forms */}
                <div className="lg:col-span-6 space-y-6">
                    {/* 1. Attribute Type */}
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-4">1. Create Attribute Type</h3>
                        <form onSubmit={handleAttrSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Attribute Name</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. Size or Color" 
                                        value={attrForm.data.name}
                                        onChange={e => attrForm.setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Attribute Type</FieldLabel>
                                    <AdminSelect
                                        value={attrForm.data.type}
                                        onChange={e => attrForm.setData('type', e.target.value)}
                                    >
                                        <option value="text">Text (S, M, L, XL)</option>
                                        <option value="color">Color Palette</option>
                                    </AdminSelect>
                                </div>
                            </div>
                            <SaveBtn type="submit" disabled={attrForm.processing} className="w-full">
                                <Save className="w-4 h-4" />
                                {attrForm.processing ? 'Creating...' : 'Create Type'}
                            </SaveBtn>
                        </form>
                    </AdminCard>

                    {/* 2. Attribute Value */}
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-4">2. Add Attribute Value</h3>
                        <form onSubmit={handleValSubmit} className="space-y-4">
                            <div>
                                <FieldLabel required>Select Attribute Type</FieldLabel>
                                <AdminSelect
                                    value={valForm.data.attribute_id}
                                    onChange={e => valForm.setData('attribute_id', e.target.value)}
                                    required
                                >
                                    <option value="">Choose Attribute</option>
                                    {attributes.map(attr => (
                                        <option key={attr.id} value={attr.id}>{attr.name}</option>
                                    ))}
                                </AdminSelect>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Value / Name</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. Red or XL" 
                                        value={valForm.data.value}
                                        onChange={e => valForm.setData('value', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Color hex code (if color type)</FieldLabel>
                                    <div className="flex gap-2.5 items-center">
                                        <input 
                                            type="color"
                                            value={valForm.data.color_hex}
                                            onChange={e => valForm.setData('color_hex', e.target.value)}
                                            className="h-10 w-14 rounded-xl border border-[#E8E7FF] bg-[#F8F7FF] cursor-pointer p-1"
                                        />
                                        <span className="font-mono text-xs font-bold text-[#9096B0]">{valForm.data.color_hex}</span>
                                    </div>
                                </div>
                            </div>

                            <SaveBtn type="submit" disabled={valForm.processing} className="w-full">
                                <Save className="w-4 h-4" />
                                {valForm.processing ? 'Adding...' : 'Add Value'}
                            </SaveBtn>
                        </form>
                    </AdminCard>
                </div>

            </div>
        </AdminLayout>
    );
};

export default Attributes;
