import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader, StatusPill, IconBtn } from '@/components/admin/ui';
import { Plus, Trash2, Link as LinkIcon, Eye, FileText, Edit, Copy, Search, ExternalLink, CopyPlus } from 'lucide-react';
import { toast } from 'sonner';

interface LandingPagesProps {
    pages?: any[];
    landingPages?: any[];
    products?: any[];
}

export const LandingPages: React.FC<LandingPagesProps> = ({ pages, landingPages, products }) => {
    const list = landingPages || pages || [];
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    const filtered = list.filter(p => {
        const matchesSearch = !search.trim() || 
            p.title?.toLowerCase().includes(search.toLowerCase()) || 
            p.slug?.toLowerCase().includes(search.toLowerCase()) ||
            p.product?.name?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this landing page?')) {
            router.delete(route('admin.landing-pages.destroy', { id }), {
                onSuccess: () => toast.success('Landing page deleted successfully.'),
                onError: () => toast.error('Failed to delete landing page.')
            });
        }
    };

    const handleDuplicate = (id: number) => {
        router.post(route('admin.landing-pages.duplicate', { id }), {}, {
            onSuccess: () => toast.success('Landing page duplicated successfully! 📋'),
            onError: () => toast.error('Failed to duplicate landing page.')
        });
    };

    const handleCopyUrl = (slug: string) => {
        try {
            const fullUrl = route('landing.show', { slug });
            navigator.clipboard.writeText(fullUrl);
            toast.success('Landing page URL copied to clipboard! 📋');
        } catch {
            const fullUrl = `${window.location.origin}/page/${slug}`;
            navigator.clipboard.writeText(fullUrl);
            toast.success('Landing page URL copied to clipboard! 📋');
        }
    };

    const publishedCount = list.filter(p => p.status === 'published').length;
    const draftCount = list.filter(p => p.status === 'draft').length;

    return (
        <AdminLayout>
            <Head title="Landing Pages" />

            <PageHeader 
                title="Landing Page Manager" 
                subtitle="High-converting dedicated storefront campaign landing pages for Facebook/TikTok Ads."
                action={
                    <Link href={route('admin.landing-pages.create')}>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#007F3B] transition-all shadow-[0_4px_14px_rgba(0,158,73,0.2)] border-none cursor-pointer">
                            <Plus className="w-4 h-4" /> Create New Landing Page
                        </button>
                    </Link>
                }
            />

            {/* Top Stats and Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <AdminCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-[#9096B0]">Total Landing Pages</p>
                        <p className="text-2xl font-black text-[#1A1A2E] mt-1">{list.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009E49] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                </AdminCard>

                <AdminCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-[#9096B0]">Published Pages</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Eye className="w-5 h-5" />
                    </div>
                </AdminCard>

                <AdminCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-[#9096B0]">Drafts</p>
                        <p className="text-2xl font-black text-amber-600 mt-1">{draftCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Edit className="w-5 h-5" />
                    </div>
                </AdminCard>

                {/* Filter Tabs */}
                <div className="bg-white border border-[#EBEDF2] rounded-2xl p-1.5 flex items-center gap-1 shadow-xs">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border-none cursor-pointer ${
                            statusFilter === 'all' ? 'bg-[#009E49] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        All ({list.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('published')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border-none cursor-pointer ${
                            statusFilter === 'published' ? 'bg-[#009E49] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Active ({publishedCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('draft')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border-none cursor-pointer ${
                            statusFilter === 'draft' ? 'bg-[#009E49] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Draft ({draftCount})
                    </button>
                </div>
            </div>

            {/* Search Box */}
            <AdminCard className="p-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#C0C6D8]" />
                    <input
                        type="text"
                        placeholder="Search landing pages by title, slug, or product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#EBEDF2] bg-[#F7F8FA] text-[14px] text-[#2D3048] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
                    />
                </div>
            </AdminCard>

            {/* Table */}
            <AdminCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#F0EFFE] bg-[#FAFDFB]">
                                {['Page Details', 'Public Campaign URL', 'Associated Product', 'Status', 'Actions'].map((h, i) => (
                                    <th key={h} className={`text-left text-[11px] font-black text-[#9096B0] uppercase tracking-[0.08em] px-5 py-4 ${i === 4 ? 'text-right' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-[#9096B0] text-sm">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="font-bold text-gray-700">No landing pages found</p>
                                        <p className="text-xs text-gray-400 mt-1">Create your first landing page to boost direct product sales.</p>
                                        <Link href={route('admin.landing-pages.create')} className="inline-block mt-4">
                                            <button className="px-4 py-2 bg-[#009E49] text-white text-xs font-bold rounded-xl border-none cursor-pointer hover:bg-[#007F3B]">
                                                Create Now
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ) : filtered.map(page => (
                                <tr key={page.id} className="border-b border-[#F8F7FF] hover:bg-[#FAFDFB] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {page.hero_image_path ? (
                                                <img 
                                                    src={page.hero_image_path} 
                                                    alt={page.title} 
                                                    className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0" 
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009E49] shrink-0 font-black">
                                                    LP
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-[14px] font-bold text-[#1A1A2E] line-clamp-1">{page.title}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{page.hero_headline || 'No hero headline'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={route('landing.show', { slug: page.slug })} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[13px] font-mono font-bold text-[#009E49] hover:underline"
                                            >
                                                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                                                <span>/page/{page.slug}</span>
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyUrl(page.slug)}
                                                title="Copy public link"
                                                className="p-1.5 text-gray-400 hover:text-[#009E49] hover:bg-emerald-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[13px] text-gray-600 font-medium max-w-[220px]">
                                        {page.product ? (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                                <span className="truncate">{page.product.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusPill status={page.status === 'published' ? 'complete' : 'draft'} />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a 
                                                href={route('landing.show', { slug: page.slug })} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                title="Preview Live Page"
                                                className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors inline-flex items-center justify-center"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Link 
                                                href={route('admin.landing-pages.edit', { id: page.id })}
                                                title="Edit Landing Page"
                                                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors inline-flex items-center justify-center"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                type="button"
                                                onClick={() => handleDuplicate(page.id)}
                                                title="Duplicate Landing Page"
                                                className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors inline-flex items-center justify-center border-none cursor-pointer"
                                            >
                                                <CopyPlus className="w-4 h-4" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleDelete(page.id)}
                                                title="Delete Landing Page"
                                                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors inline-flex items-center justify-center border-none cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </AdminLayout>
    );
};

export default LandingPages;
