import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, AdminPagination, StatusPill, PageHeader } from '@/components/admin/ui';
import { Edit, Trash2, Plus, Search, Eye, Package } from 'lucide-react';
import { toast } from 'sonner';

interface IndexProps {
    products: { data: any[]; links: any[]; total: number; };
    filters: { q?: string; status?: string; };
}

export const Index: React.FC<IndexProps> = ({ products, filters }) => {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const applyFilters = (updatedParams = {}) => {
        const params: any = { q: searchQuery, status: statusFilter === 'all' ? '' : statusFilter, ...updatedParams };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('admin.products.index'), params, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('এই পণ্যটি মুছে ফেলতে চান?')) {
            router.delete(route('admin.products.destroy', { id }), {
                onSuccess: () => toast.success('পণ্য মুছে ফেলা হয়েছে।'),
                onError: () => toast.error('মুছতে ব্যর্থ হয়েছে।'),
            });
        }
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            active:   'bg-emerald-50 text-emerald-600 border border-emerald-100',
            draft:    'bg-amber-50 text-amber-600 border border-amber-100',
            archived: 'bg-gray-100 text-gray-500 border border-gray-200',
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${map[s] || 'bg-gray-100 text-gray-500'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title="Products" />
            <div className="space-y-6">

                {/* ── Header ── */}
                <PageHeader
                    title="Products"
                    subtitle={`${products.total} টি পণ্য আপনার স্টোরে আছে`}
                    action={
                        <Link href={route('admin.products.create')}>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009E49] text-white text-[14px] font-bold hover:bg-[#007F3B] transition-all shadow-[0_4px_14px_rgba(0,158,73,0.2)] border-none cursor-pointer">
                                <Plus className="w-4 h-4" /> Add New Product
                            </button>
                        </Link>
                    }
                />

                {/* ── Filters ── */}
                <AdminCard className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <form onSubmit={e => { e.preventDefault(); applyFilters(); }} className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#C0C6D8]" />
                            <input
                                type="text"
                                placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#EBEDF2] bg-[#F7F8FA] text-[14px] text-[#2D3048] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
                            />
                        </form>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value === 'all' ? '' : e.target.value }); }}
                            className="h-11 px-4 rounded-xl border border-[#EBEDF2] bg-[#F7F8FA] text-[14px] text-[#2D3048] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all cursor-pointer min-w-[160px]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </AdminCard>

                {/* ── Table ── */}
                <AdminCard className="overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEDF2]">
                        <h3 className="text-[15px] font-black text-[#1A1A2E]">All Products</h3>
                        <span className="text-[12px] text-[#9096B0] bg-[#F7F8FA] px-3 py-1 rounded-full font-semibold">{products.total} products</span>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#EBEDF2] bg-[#F7F8FA]">
                                <th className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-6 py-3.5 w-16">IMG</th>
                                <th className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-4 py-3.5">Product</th>
                                <th className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-4 py-3.5">Code</th>
                                <th className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-4 py-3.5">Price</th>
                                <th className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-4 py-3.5">Stock</th>
                                <th className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-4 py-3.5">Status</th>
                                <th className="text-right text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-6 py-3.5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 text-[#9096B0]">
                                        <Package className="w-12 h-12 mx-auto mb-3 text-[#EBEDF2]" />
                                        <p className="text-[15px] font-semibold">কোনো পণ্য পাওয়া যায়নি</p>
                                        <p className="text-[13px] mt-1">নতুন পণ্য যোগ করুন</p>
                                    </td>
                                </tr>
                            ) : products.data.map(product => (
                                <tr key={product.id} className="border-b border-[#F7F8FA] hover:bg-[#FAFBFC] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-slate-200/80 bg-[#F7F8FA] flex items-center justify-center shadow-2xs">
                                            <img
                                                src={product.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                }}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-[14px] font-bold text-[#1A1A2E] max-w-[220px] truncate">{product.name}</p>
                                        <p className="text-[12px] text-[#9096B0] mt-0.5">{product.brand?.name || '—'}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[12px] font-mono font-bold text-[#6C6C9A] bg-[#F0EFFE] px-2.5 py-1 rounded-lg">{product.product_code || '—'}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[14px] font-black text-[#1A1A2E]">৳{product.price}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-[14px] font-bold ${product.stock_quantity <= 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">{statusBadge(product.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={route('product.show', { slug: product.slug })} target="_blank">
                                                <button className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#6C47FF] hover:bg-[#6C47FF] hover:text-white transition-all flex items-center justify-center border-none cursor-pointer" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <Link href={route('admin.products.edit', { id: product.id })}>
                                                <button className="w-9 h-9 rounded-xl bg-[#E3FAF0] text-[#16A34A] hover:bg-[#16A34A] hover:text-white transition-all flex items-center justify-center border-none cursor-pointer" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <AdminPagination links={products.links} />
                </AdminCard>
            </div>
        </AdminLayout>
    );
};

export default Index;
