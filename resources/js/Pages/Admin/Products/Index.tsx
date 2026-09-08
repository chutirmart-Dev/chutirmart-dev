import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, AdminPagination, PageHeader, AdminSelect } from '@/components/admin/ui';
import {
    Edit,
    Trash2,
    Plus,
    Search,
    Eye,
    Package,
    Flame,
    Sparkles,
    Zap,
    Loader2,
    X,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface IndexProps {
    products: { data: any[]; links: any[]; total: number; };
    filters: { q?: string; status?: string; featured?: string; };
}

export const Index: React.FC<IndexProps> = ({ products, filters }) => {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [featuredFilter, setFeaturedFilter] = useState(filters.featured || 'all');
    const [isSearching, setIsSearching] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const applyFilters = (updatedParams = {}) => {
        setIsSearching(true);
        const params: any = {
            q: searchQuery.trim(),
            status: statusFilter === 'all' ? '' : statusFilter,
            featured: featuredFilter === 'all' ? '' : featuredFilter,
            ...updatedParams,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('admin.products.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            applyFilters({ q: val.trim() });
        }, 220);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        applyFilters({ q: '' });
    };

    const handleToggleFeatured = (productId: number, feature: 'is_best_selling' | 'is_new_arrival' | 'is_featured') => {
        setTogglingId(`${productId}-${feature}`);
        router.post(
            route('admin.products.toggle-featured', { id: productId }),
            { feature },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const labels: Record<string, string> = {
                        is_best_selling: '🔥 সর্বাধিক বিক্রিত পণ্য',
                        is_new_arrival: '✨ নতুন পণ্য সমূহ',
                        is_featured: '⚡ Just For You (আপনার জন্য পণ্য)',
                    };
                    const label = labels[feature] || 'শোকেস';
                    toast.success(`${label} স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে!`);
                },
                onError: () => toast.error('স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।'),
                onFinish: () => setTogglingId(null),
            }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('এই পণ্যটি মুছে ফেলতে চান?')) {
            router.delete(route('admin.products.destroy', { id }), {
                onSuccess: () => toast.success('পণ্য মুছে ফেলা হয়েছে।'),
                onError: () => toast.error('মুছতে ব্যর্থ হয়েছে।'),
            });
        }
    };

    const handleToggleStatus = (productId: number) => {
        router.post(
            route('admin.products.toggle-status', { id: productId }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে!'),
                onError: () => toast.error('স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।'),
            }
        );
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
            draft:    'bg-amber-50 text-amber-700 border-amber-200',
            archived: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${map[s] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Toaster position="top-center" richColors />
            <Head title="Products Management | ChutirMart" />
            <div className="space-y-6">

                {/* ── Header ── */}
                <PageHeader
                    title="Products"
                    subtitle={`${products.total} টি পণ্য আপনার স্টোরে আছে`}
                    action={
                        <Link href={route('admin.products.create')}>
                            <button className="h-11 sm:h-12 px-5 rounded-lg bg-[#009E49] hover:bg-[#007F3B] text-white text-[13.5px] sm:text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md border-none cursor-pointer active:scale-98">
                                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                                <span>Add New Product</span>
                            </button>
                        </Link>
                    }
                />

                {/* ── Filters Bar ── */}
                <AdminCard className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <form onSubmit={e => { e.preventDefault(); applyFilters(); }} className="relative flex-1">
                            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                                isSearching || searchQuery ? 'text-[#009E49]' : 'text-slate-400'
                            }`} />
                            <input
                                type="text"
                                placeholder="পণ্যের নাম বা প্রোডাক্ট কোড দিয়ে খুঁজুন..."
                                value={searchQuery}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full h-10 pl-10 pr-20 rounded-lg border border-slate-200 bg-slate-50/70 text-[13px] sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {isSearching && (
                                    <Loader2 className="w-3.5 h-3.5 text-[#009E49] animate-spin" />
                                )}
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Featured Showcase Filter */}
                        <div className="w-full sm:w-[210px] min-w-0">
                            <AdminSelect
                                value={featuredFilter}
                                onChange={e => {
                                    setFeaturedFilter(e.target.value);
                                    applyFilters({ featured: e.target.value === 'all' ? '' : e.target.value });
                                }}
                            >
                                <option value="all">হোমপেজ সেকশন: All</option>
                                <option value="best_selling">🔥 সর্বাধিক বিক্রিত পণ্য</option>
                                <option value="new_arrival">✨ নতুন পণ্য সমূহ</option>
                                <option value="just_for_you">⚡ Just For You</option>
                            </AdminSelect>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full sm:w-[155px] min-w-0">
                            <AdminSelect
                                value={statusFilter}
                                onChange={e => {
                                    setStatusFilter(e.target.value);
                                    applyFilters({ status: e.target.value === 'all' ? '' : e.target.value });
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </AdminSelect>
                        </div>
                    </div>
                </AdminCard>

                {/* ── Products Table ── */}
                <AdminCard className="overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                        <h3 className="text-[15px] font-black text-slate-800">All Products</h3>
                        <span className="text-[11.5px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold">
                            {products.total} products
                        </span>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                            <p className="text-[15px] font-semibold text-slate-700">কোনো পণ্য পাওয়া যায়নি</p>
                            <p className="text-[13px] mt-1 text-slate-400">নতুন পণ্য যোগ করুন অথবা ফিল্টার পরিবর্তন করুন</p>
                        </div>
                    ) : (
                        <>
                            {/* ── Mobile View: Product Cards (md:hidden) ── */}
                            <div className="block md:hidden divide-y divide-slate-100 bg-slate-50/50 p-3 space-y-3">
                                {products.data.map(product => (
                                    <div key={product.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center shadow-2xs">
                                                <img
                                                    src={product.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                    onError={e => {
                                                        (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                    }}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {product.product_code || '—'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(product.id)}
                                                        className="border-none bg-transparent p-0 cursor-pointer"
                                                        title="Click to toggle status"
                                                    >
                                                        {statusBadge(product.status)}
                                                    </button>
                                                </div>
                                                <h4 className="text-[14px] font-bold text-slate-800 truncate mt-1">{product.name}</h4>
                                                <p className="text-[11.5px] text-slate-400">{product.brand?.name || 'No brand'}</p>
                                            </div>
                                        </div>

                                        {/* Price & Stock Row */}
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</span>
                                                <div className="text-[15px] font-black text-slate-800">৳{product.price}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock</span>
                                                <div className={`text-[13px] font-bold ${product.stock_quantity <= 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                    {product.stock_quantity} in stock
                                                </div>
                                            </div>
                                        </div>

                                        {/* Homepage Showcase Badges */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(product.id, 'is_best_selling')}
                                                disabled={togglingId === `${product.id}-is_best_selling`}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                    product.is_best_selling
                                                        ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-2xs'
                                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                                }`}
                                            >
                                                <Flame className={`w-3.5 h-3.5 ${product.is_best_selling ? 'text-orange-500 fill-orange-500' : 'text-slate-400'}`} />
                                                <span>সর্বাধিক বিক্রিত</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(product.id, 'is_new_arrival')}
                                                disabled={togglingId === `${product.id}-is_new_arrival`}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                    product.is_new_arrival
                                                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                                }`}
                                            >
                                                <Sparkles className={`w-3.5 h-3.5 ${product.is_new_arrival ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                                <span>নতুন পণ্য</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(product.id, 'is_featured')}
                                                disabled={togglingId === `${product.id}-is_featured`}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                    product.is_featured
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                                }`}
                                            >
                                                <Zap className={`w-3.5 h-3.5 ${product.is_featured ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
                                                <span>Just For You</span>
                                            </button>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="pt-2.5 border-t border-slate-100 grid grid-cols-5 gap-2">
                                            <Link href={route('product.show', { slug: product.slug })} target="_blank" className="col-span-2">
                                                <button className="w-full h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer transition-colors active:scale-98">
                                                    <Eye className="w-4 h-4 stroke-[2.2]" />
                                                    <span>View</span>
                                                </button>
                                            </Link>
                                            <Link href={route('admin.products.edit', { id: product.id })} className="col-span-2">
                                                <button className="w-full h-10 rounded-lg bg-[#009E49] hover:bg-[#00873E] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer transition-colors shadow-xs hover:shadow-sm active:scale-98">
                                                    <Edit className="w-4 h-4 stroke-[2.2]" />
                                                    <span>Edit</span>
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="col-span-1 h-10 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white flex items-center justify-center border border-rose-200/60 hover:border-rose-500 cursor-pointer transition-all active:scale-98"
                                                title="Delete Product"
                                            >
                                                <Trash2 className="w-4 h-4 stroke-[2.2]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Desktop View: Products Table (hidden md:block) ── */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80">
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3.5 w-16">IMG</th>
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Product</th>
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Code</th>
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Price</th>
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Stock</th>
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Status</th>
                                            <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">হোমপেজ সেকশন (Showcase)</th>
                                            <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3.5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {products.data.map(product => (
                                            <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center shadow-2xs">
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
                                                <td className="px-4 py-3.5">
                                                    <p className="text-[13.5px] font-bold text-slate-800 max-w-[220px] truncate">{product.name}</p>
                                                    <p className="text-[11.5px] text-slate-400 mt-0.5">{product.brand?.name || '—'}</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11.5px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">{product.product_code || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[13.5px] font-black text-slate-800">৳{product.price}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-[12.5px] font-bold ${product.stock_quantity <= 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                        {product.stock_quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(product.id)}
                                                        className="border-none bg-transparent p-0 cursor-pointer hover:opacity-85 transition-opacity"
                                                        title={`Click to change status to ${product.status === 'active' ? 'Draft' : 'Active'}`}
                                                    >
                                                        {statusBadge(product.status)}
                                                    </button>
                                                </td>

                                                {/* Homepage Showcase Column */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {/* Best Selling Toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleFeatured(product.id, 'is_best_selling')}
                                                            disabled={togglingId === `${product.id}-is_best_selling`}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                                                                product.is_best_selling
                                                                    ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-2xs'
                                                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/50'
                                                            }`}
                                                            title={product.is_best_selling ? "Click to remove from '🔥 সর্বাধিক বিক্রিত পণ্য'" : "Click to add to '🔥 সর্বাধিক বিক্রিত পণ্য'"}
                                                        >
                                                            <Flame className={`w-3.5 h-3.5 ${product.is_best_selling ? 'text-orange-500 fill-orange-500' : 'text-slate-400'}`} />
                                                            <span>সর্বাধিক বিক্রিত</span>
                                                        </button>

                                                        {/* New Arrival Toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleFeatured(product.id, 'is_new_arrival')}
                                                            disabled={togglingId === `${product.id}-is_new_arrival`}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                                                                product.is_new_arrival
                                                                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                                                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50'
                                                            }`}
                                                            title={product.is_new_arrival ? "Click to remove from '✨ নতুন পণ্য সমূহ'" : "Click to add to '✨ নতুন পণ্য সমূহ'"}
                                                        >
                                                            <Sparkles className={`w-3.5 h-3.5 ${product.is_new_arrival ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                                            <span>নতুন পণ্য</span>
                                                        </button>

                                                        {/* Just For You Toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleFeatured(product.id, 'is_featured')}
                                                            disabled={togglingId === `${product.id}-is_featured`}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                                                                product.is_featured
                                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                                                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                                                            }`}
                                                            title={product.is_featured ? "Click to remove from '⚡ Just For You'" : "Click to add to '⚡ Just For You'"}
                                                        >
                                                            <Zap className={`w-3.5 h-3.5 ${product.is_featured ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
                                                            <span>Just For You</span>
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={route('product.show', { slug: product.slug })} target="_blank">
                                                            <button className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-[#009E49] transition-all flex items-center justify-center border-none cursor-pointer active:scale-95" title="View Storefront">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <Link href={route('admin.products.edit', { id: product.id })}>
                                                            <button className="w-9 h-9 rounded-lg bg-emerald-50 text-[#009E49] hover:bg-[#009E49] hover:text-white transition-all flex items-center justify-center border-none cursor-pointer active:scale-95" title="Edit Product">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer active:scale-95"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    <AdminPagination links={products.links} />
                </AdminCard>
            </div>
        </AdminLayout>
    );
};
export default Index;
