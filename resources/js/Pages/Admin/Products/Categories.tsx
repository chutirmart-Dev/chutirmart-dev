import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, AdminSelect, FieldLabel, StatusPill } from '@/components/admin/ui';
import { Save, FolderTree } from 'lucide-react';
import { toast } from 'sonner';

interface CategoriesProps { categories: any[]; }

export const Categories: React.FC<CategoriesProps> = ({ categories }) => {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', parent_id: '', icon: '', sort_order: '0', status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => { toast.success('Category added!'); reset(); },
            onError: () => toast.error('Failed to create category.'),
        });
    };

    const roots = categories.filter(c => !c.parent_id);

    return (
        <AdminLayout>
            <Head title="Categories" />
            <PageHeader title="Categories" subtitle="Manage product categories and subcategories" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Listing */}
                <div className="lg:col-span-8">
                    <AdminCard className="overflow-hidden">
                        <CardHead title="All Categories" subtitle={`${categories.length} categories`} />
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F0EFFE]">
                                    {['Icon', 'Category Name', 'Parent', 'Products', 'Status'].map(h => (
                                        <th key={h} className="text-left text-[10px] font-black text-[#9096B0] uppercase tracking-[0.1em] px-5 py-3.5">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-16 text-[#9096B0] text-sm">
                                        <FolderTree className="w-10 h-10 mx-auto mb-3 text-[#E8E7FF]" />
                                        No categories yet
                                    </td></tr>
                                ) : categories.map(cat => (
                                    <tr key={cat.id} className="border-b border-[#FAFDFB] hover:bg-[#FAFDFB] transition-colors">
                                        <td className="px-5 py-3">
                                            {cat.icon ? (
                                                <span className="text-xl">{cat.icon}</span>
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-[#E6F5EC] text-[#009E49] flex items-center justify-center font-black text-xs">
                                                    {cat.name.charAt(0)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[13px] font-bold ${cat.parent_id ? 'text-[#009E49] pl-4 border-l-2 border-[#E6F5EC]' : 'text-[#1A1A2E]'}`}>
                                                {cat.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-[12px] text-[#9096B0]">{cat.parent?.name || '—'}</td>
                                        <td className="px-5 py-3 text-[13px] font-bold text-[#1A1A2E]">{cat.products_count || 0}</td>
                                        <td className="px-5 py-3"><StatusPill status={cat.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </AdminCard>
                </div>

                {/* Add Form */}
                <div className="lg:col-span-4">
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Add New Category</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <FieldLabel required>Category Name</FieldLabel>
                                <AdminInput placeholder="e.g., Electronics" value={data.name} onChange={e => setData('name', e.target.value)} required error={errors.name} />
                            </div>
                            <div>
                                <FieldLabel>Parent Category</FieldLabel>
                                <AdminSelect value={data.parent_id} onChange={e => setData('parent_id', e.target.value)}>
                                    <option value="">None (Top Level)</option>
                                    {roots.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </AdminSelect>
                            </div>
                            <div>
                                <FieldLabel>Icon (Emoji)</FieldLabel>
                                <AdminInput placeholder="e.g., 📱" value={data.icon} onChange={e => setData('icon', e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>Sort Order</FieldLabel>
                                <AdminInput type="number" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} />
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
                                {processing ? 'Saving...' : 'Save Category'}
                            </SaveBtn>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Categories;
