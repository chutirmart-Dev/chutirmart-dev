import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, FieldLabel } from '@/components/admin/ui';
import { Save, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface TagsProps {
    tags: any[];
}

export const Tags: React.FC<TagsProps> = ({ tags }) => {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tags.store'), {
            onSuccess: () => {
                toast.success('Tag added successfully! 🎉');
                reset();
            },
            onError: () => toast.error('Failed to create tag.')
        });
    };

    return (
        <AdminLayout>
            <Head title="Tags" />
            <PageHeader title="Tags" subtitle="Manage product search tags and labels" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Listing */}
                <div className="lg:col-span-8">
                    <AdminCard className="overflow-hidden">
                        <CardHead title="All Tags" subtitle={`${tags.length} tags`} />
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F0EFFE]">
                                    {['Tag Name', 'Associated Products'].map(h => (
                                        <th key={h} className="text-left text-[10px] font-black text-[#9096B0] uppercase tracking-[0.1em] px-5 py-3.5">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tags.length === 0 ? (
                                    <tr><td colSpan={2} className="text-center py-16 text-[#9096B0] text-sm">
                                        <Tag className="w-10 h-10 mx-auto mb-3 text-[#E8E7FF]" />
                                        No tags yet
                                    </td></tr>
                                ) : tags.map(tag => (
                                    <tr key={tag.id} className="border-b border-[#FAFDFB] hover:bg-[#FAFDFB] transition-colors">
                                        <td className="px-5 py-3.5 font-mono text-[13px] font-bold text-[#009E49]">
                                            #{tag.name}
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] font-bold text-[#1A1A2E]">
                                            {tag.products_count || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </AdminCard>
                </div>

                {/* Right: Add Form */}
                <div className="lg:col-span-4">
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Add New Tag</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <FieldLabel required>Tag Name</FieldLabel>
                                <AdminInput 
                                    placeholder="e.g. summer-hot" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required 
                                    error={errors.name} 
                                />
                            </div>
                            <SaveBtn type="submit" disabled={processing} className="w-full">
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Tag'}
                            </SaveBtn>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Tags;
