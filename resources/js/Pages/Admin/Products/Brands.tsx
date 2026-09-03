import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, AdminSelect, FieldLabel, StatusPill } from '@/components/admin/ui';
import { Save, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface BrandsProps { brands: any[]; }

export const Brands: React.FC<BrandsProps> = ({ brands }) => {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', description: '', status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.brands.store'), {
            onSuccess: () => { toast.success('Brand added!'); reset(); },
            onError: () => toast.error('Failed to create brand.'),
        });
    };

    return (
        <AdminLayout>
            <Head title="Brands" />
            <PageHeader title="Brands" subtitle="Manage your store's product brands" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Listing */}
                <div className="lg:col-span-8">
                    <AdminCard className="overflow-hidden">
                        <CardHead title="All Brands" subtitle={`${brands.length} brands`} />
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F0EFFE]">
                                    {['Brand Name', 'Products', 'Status'].map(h => (
                                        <th key={h} className="text-left text-[10px] font-black text-[#9096B0] uppercase tracking-[0.1em] px-5 py-3.5">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {brands.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-16 text-[#9096B0] text-sm">
                                        <Tag className="w-10 h-10 mx-auto mb-3 text-[#E8E7FF]" />
                                        No brands yet
                                    </td></tr>
                                ) : brands.map(brand => (
                                    <tr key={brand.id} className="border-b border-[#FAFDFB] hover:bg-[#FAFDFB] transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-[#E6F5EC] text-[#009E49] flex items-center justify-center font-black text-xs">
                                                    {brand.name.charAt(0)}
                                                </div>
                                                <span className="text-[13px] font-bold text-[#1A1A2E]">{brand.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] font-bold text-[#1A1A2E]">{brand.products_count || 0}</td>
                                        <td className="px-5 py-3.5"><StatusPill status={brand.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </AdminCard>
                </div>

                {/* Add Form */}
                <div className="lg:col-span-4">
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Add New Brand</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <FieldLabel required>Brand Name</FieldLabel>
                                <AdminInput placeholder="e.g., Xiaomi" value={data.name} onChange={e => setData('name', e.target.value)} required error={errors.name} />
                            </div>
                            <div>
                                <FieldLabel>Description</FieldLabel>
                                <AdminInput placeholder="Short description..." value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>Status</FieldLabel>
                                <AdminSelect value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </AdminSelect>
                            </div>
                            <SaveBtn type="submit" disabled={processing} className="w-full">
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Brand'}
                            </SaveBtn>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Brands;
