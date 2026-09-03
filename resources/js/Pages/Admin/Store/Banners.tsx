import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, FieldLabel, IconBtn } from '@/components/admin/ui';
import { Trash2, UploadCloud, X, Save, Info, Pencil, Check, XCircle, LayoutGrid, Sliders, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
    id: number;
    title: string | null;
    position?: 'slider' | 'side';
    image_path: string;
    link_url: string | null;
    sort_order: number;
    status: string;
}

interface BannersProps {
    banners: Banner[];
}

/* ─────────────────────────────────────────────
   Inline Edit Row
───────────────────────────────────────────── */
function BannerEditRow({
    banner,
    index,
    onCancel,
}: {
    banner: Banner;
    index: number;
    onCancel: () => void;
}) {
    const { data, setData, put, processing } = useForm({
        title:    banner.title    ?? '',
        position: banner.position ?? 'slider',
        link_url: banner.link_url ?? '',
        image:    '',
    });

    const [previewImage, setPreviewImage] = useState<string>(banner.image_path);
    const [newImageSelected, setNewImageSelected] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreviewImage(base64);
                setData('image', base64);
                setNewImageSelected(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.banners.update', { id: banner.id }), {
            onSuccess: () => {
                toast.success('ব্যানার আপডেট করা হয়েছে! 🎉');
                onCancel();
            },
            onError: () => toast.error('ব্যানার আপডেট ব্যর্থ হয়েছে।'),
        });
    };

    const isSide = data.position === 'side';
    const sizeHint = isSide ? '600 × 500 px' : '1200 × 500 px';

    return (
        <tr className="border-b border-[#F0EFFE] bg-[#F8F7FF]">
            <td colSpan={6} className="px-5 py-5">
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#009E49] flex items-center justify-center text-[10px] font-black text-white">
                            {index + 1}
                        </span>
                        <p className="text-[13px] font-black text-[#1A1A2E]">ব্যানার সম্পাদনা করুন</p>
                        <span className="text-[10px] text-[#9096B0] font-mono bg-white px-2 py-0.5 rounded-full border border-[#E8E7FF]">
                            প্রস্তাবিত সাইজ: {sizeHint}
                        </span>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        {/* Image Preview & Upload */}
                        <div>
                            <FieldLabel>ব্যানার ছবি</FieldLabel>
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-[#009E49]/30 bg-white group cursor-pointer">
                                <img
                                    src={previewImage}
                                    alt="Banner Preview"
                                    className="w-full h-full object-cover"
                                />
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <UploadCloud className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[11px] text-white font-bold">ছবি পরিবর্তন করুন</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {newImageSelected && (
                                    <span className="absolute top-1.5 left-1.5 bg-[#009E49] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                        নতুন ছবি
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Position, Title & Link */}
                        <div className="md:col-span-2 flex flex-col gap-3">
                            <div>
                                <FieldLabel>ব্যানার টাইপ / অবস্থান</FieldLabel>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setData('position', 'slider')}
                                        className={`flex items-center gap-2 p-2 rounded-xl border text-[12px] font-bold transition-all cursor-pointer ${
                                            data.position === 'slider'
                                                ? 'border-[#009E49] bg-emerald-50 text-[#009E49]'
                                                : 'border-[#E8E7FF] bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Sliders className="w-4 h-4 shrink-0" />
                                        <span>🖼️ Main Slider</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('position', 'side')}
                                        className={`flex items-center gap-2 p-2 rounded-xl border text-[12px] font-bold transition-all cursor-pointer ${
                                            data.position === 'side'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-[#E8E7FF] bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <LayoutGrid className="w-4 h-4 shrink-0" />
                                        <span>🟦 Side Banner</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <FieldLabel>ব্যানার শিরোনাম (ঐচ্ছিক)</FieldLabel>
                                <AdminInput
                                    placeholder="যেমন: গ্রীষ্মকালীন অফার"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <FieldLabel>লিংক URL (ঐচ্ছিক)</FieldLabel>
                                <AdminInput
                                    placeholder="যেমন: /shop?category=electronics"
                                    value={data.link_url}
                                    onChange={e => setData('link_url', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <SaveBtn type="submit" disabled={processing}>
                                    <Check className="w-4 h-4" />
                                    {processing ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                                </SaveBtn>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#9096B0] bg-white border border-[#E8E7FF] hover:bg-[#F8F7FF] transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <XCircle className="w-4 h-4" />
                                    বাতিল
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </td>
        </tr>
    );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export const Banners: React.FC<BannersProps> = ({ banners }) => {
    const { data, setData, post, processing, reset } = useForm({
        title:    '',
        position: 'slider', // 'slider' | 'side'
        link_url: '',
        image:    '',
    });

    const [previewImage, setPreviewImage] = useState<string>('');
    const [editingId,    setEditingId]    = useState<number | null>(null);
    const [filterType,   setFilterType]   = useState<'all' | 'slider' | 'side'>('all');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreviewImage(base64);
                setData('image', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePreview = () => {
        setPreviewImage('');
        setData('image', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.image) {
            toast.error('অনুগ্রহ করে একটি ব্যানার ছবি আপলোড করুন।');
            return;
        }
        post(route('admin.banners.store'), {
            onSuccess: () => {
                toast.success('ব্যানার সফলভাবে যোগ করা হয়েছে! 🎉');
                reset();
                setPreviewImage('');
            },
            onError: () => toast.error('ব্যানার তৈরি ব্যর্থ হয়েছে।'),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('এই ব্যানারটি মুছে ফেলতে চান?')) {
            router.delete(route('admin.banners.destroy', { id }), {
                onSuccess: () => toast.success('ব্যানার মুছে ফেলা হয়েছে।'),
                onError:   () => toast.error('ব্যানার মুছতে ব্যর্থ হয়েছে।'),
            });
        }
    };

    const sliderBanners = banners.filter(b => (b.position || 'slider') === 'slider');
    const sideBanners   = banners.filter(b => b.position === 'side');

    const filteredBanners = filterType === 'all'
        ? banners
        : filterType === 'slider'
        ? sliderBanners
        : sideBanners;

    return (
        <AdminLayout>
            <Head title="Home Banners" />

            <PageHeader
                title="Home Banners"
                subtitle="Homepage এর Main Slider ও Side Banner সমূহ যোগ, সম্পাদনা ও নিয়ন্ত্রণ করুন।"
            />

            {/* ── Size & Position Guide Box ── */}
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-[#009E49] mt-0.5 shrink-0" />
                <div className="text-sm text-gray-800 w-full">
                    <p className="font-black text-[#009E49] mb-2">📐 ব্যানার সাইজ ও টাইপ গাইড</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                            onClick={() => { setData('position', 'slider'); setFilterType('slider'); }}
                            className={`bg-white rounded-xl p-3 border transition-all cursor-pointer hover:shadow-md ${
                                data.position === 'slider' ? 'border-[#009E49] ring-2 ring-[#009E49]/20' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-[#009E49] text-xs">🖼️ Main Slider Banner</p>
                                <span className="bg-emerald-100 text-[#009E49] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {sliderBanners.length}টি সক্রিয়
                                </span>
                            </div>
                            <p className="text-xs font-mono font-black text-gray-800">1200 × 500 px</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Ratio: 12:5 · JPG/PNG/WebP · Max 2MB</p>
                            <p className="text-[11px] text-gray-600 font-medium mt-1">Homepage এর বাম পাশে carousel slider হিসেবে পর্যায়ক্রমে দেখাবে।</p>
                        </div>

                        <div
                            onClick={() => { setData('position', 'side'); setFilterType('side'); }}
                            className={`bg-white rounded-xl p-3 border transition-all cursor-pointer hover:shadow-md ${
                                data.position === 'side' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-blue-700 text-xs">🟦 Side Banner (ডান পাশের ছবি)</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sideBanners.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {sideBanners.length > 0 ? `${sideBanners.length}টি সক্রিয়` : 'খালি (Default দেখাবে)'}
                                </span>
                            </div>
                            <p className="text-xs font-mono font-black text-gray-800">600 × 500 px</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Ratio: 6:5 · JPG/PNG/WebP · Max 1MB</p>
                            <p className="text-[11px] text-gray-600 font-medium mt-1">Homepage এর ডান পাশে static promotion ছবি হিসেবে স্থায়ীভাবে দেখাবে।</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ── Left: Banner List ── */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                                filterType === 'all'
                                    ? 'bg-white text-[#1A1A2E] shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            সকল ব্যানার ({banners.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('slider')}
                            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                filterType === 'slider'
                                    ? 'bg-[#009E49] text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            মেইন স্লাইডার ({sliderBanners.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('side')}
                            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                filterType === 'side'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            সাইড ব্যানার ({sideBanners.length})
                        </button>
                    </div>

                    <AdminCard className="overflow-hidden">
                        <CardHead
                            title="সক্রিয় Homepage Banners"
                            subtitle={`${filteredBanners.length}টি ব্যানার তালিকাভুক্ত আছে`}
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#F0EFFE]">
                                        {['#', 'ব্যানার ছবি', 'টাইপ / অবস্থান', 'শিরোনাম', 'লিংক', 'Actions'].map((h, i) => (
                                            <th
                                                key={h}
                                                className={`text-left text-[10px] font-black text-[#9096B0] uppercase tracking-[0.1em] px-4 py-3.5 ${i === 5 ? 'text-right' : ''}`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBanners.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-[#9096B0] text-sm">
                                                {filterType === 'side'
                                                    ? 'কোনো সাইড ব্যানার যোগ করা হয়নি। ডান পাশের ফর্ম থেকে "Side Banner" নির্বাচন করে আপলোড করুন।'
                                                    : 'কোনো ব্যানার পাওয়া যায়নি।'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBanners.map((banner, idx) =>
                                            editingId === banner.id ? (
                                                <BannerEditRow
                                                    key={banner.id}
                                                    banner={banner}
                                                    index={idx}
                                                    onCancel={() => setEditingId(null)}
                                                />
                                            ) : (
                                                <tr
                                                    key={banner.id}
                                                    className="border-b border-[#F8F7FF] hover:bg-[#FBFAFF] transition-colors"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="w-6 h-6 rounded-lg bg-[#F0EFFE] flex items-center justify-center text-[10px] font-black text-[#6C6C9A]">
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <img
                                                            src={banner.image_path}
                                                            alt={banner.title || 'Banner'}
                                                            className="w-24 h-12 object-cover rounded-md border border-slate-200/80 shadow-2xs"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {banner.position === 'side' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                                <LayoutGrid className="w-3 h-3" />
                                                                Side Banner
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#009E49] border border-emerald-200">
                                                                <Sliders className="w-3 h-3" />
                                                                Main Slider
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-[13px] font-bold text-[#1A1A2E]">
                                                            {banner.title || <span className="text-gray-400 font-normal italic">শিরোনামহীন</span>}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-[12px] font-mono text-[#9096B0] max-w-[120px] truncate">
                                                        {banner.link_url || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <IconBtn
                                                                color="blue"
                                                                onClick={() => setEditingId(banner.id)}
                                                                title="ব্যানার সম্পাদনা করুন"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </IconBtn>
                                                            <IconBtn
                                                                color="red"
                                                                onClick={() => handleDelete(banner.id)}
                                                                title="ব্যানার মুছুন"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </IconBtn>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </AdminCard>
                </div>

                {/* ── Right: Add Form ── */}
                <div className="lg:col-span-4">
                    <AdminCard className="p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <ImageIcon className="w-4 h-4 text-[#009E49]" />
                            <h3 className="text-[14px] font-black text-[#1A1A2E]">নতুন ব্যানার যোগ করুন</h3>
                        </div>
                        <p className="text-[11px] text-[#9096B0] mb-4">
                            সঠিক টাইপ সিলেক্ট করে ছবি আপলোড করুন।
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ── Position / Type Selector ── */}
                            <div>
                                <FieldLabel required>ব্যানার টাইপ নির্বাচন করুন</FieldLabel>
                                <div className="grid grid-cols-2 gap-2 mt-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setData('position', 'slider')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                            data.position === 'slider'
                                                ? 'border-[#009E49] bg-emerald-50 text-[#009E49] shadow-xs'
                                                : 'border-[#E8E7FF] bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Sliders className="w-5 h-5 mb-1 text-[#009E49]" />
                                        <span className="text-[12px] font-black">Main Slider</span>
                                        <span className="text-[9px] text-gray-500 font-mono mt-0.5">1200×500 px</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('position', 'side')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                            data.position === 'side'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                                                : 'border-[#E8E7FF] bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <LayoutGrid className="w-5 h-5 mb-1 text-blue-600" />
                                        <span className="text-[12px] font-black">Side Banner</span>
                                        <span className="text-[9px] text-gray-500 font-mono mt-0.5">600×500 px</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <FieldLabel>ব্যানার শিরোনাম (ঐচ্ছিক)</FieldLabel>
                                <AdminInput
                                    placeholder={data.position === 'side' ? 'যেমন: সাইড অফার ব্যানার' : 'যেমন: গ্রীষ্মকালীন বিশেষ অফার'}
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                            </div>

                            <div>
                                <FieldLabel>লিংক URL (ঐচ্ছিক)</FieldLabel>
                                <AdminInput
                                    placeholder="যেমন: /shop?category=electronics"
                                    value={data.link_url}
                                    onChange={e => setData('link_url', e.target.value)}
                                />
                            </div>

                            <div>
                                <FieldLabel required>ব্যানার ছবি</FieldLabel>
                                <p className="text-[10px] text-[#9096B0] mb-1.5 font-mono">
                                    {data.position === 'side'
                                        ? '📐 সাইড ব্যানারের জন্য প্রস্তাবিত: 600 × 500 px'
                                        : '📐 মেইন স্লাইডারের জন্য প্রস্তাবিত: 1200 × 500 px'}
                                </p>
                                {previewImage ? (
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#E8E7FF] bg-[#F8F7FF]">
                                        <img
                                            src={previewImage}
                                            className="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemovePreview}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-xl bg-black/60 text-white flex items-center justify-center hover:bg-red-500 border-none transition-all cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className={`group relative block w-full border-2 border-dashed rounded-2xl bg-[#FAFAFE] hover:bg-[#F5F3FF] transition-all duration-200 cursor-pointer ${
                                            data.position === 'side'
                                                ? 'border-blue-300 hover:border-blue-600'
                                                : 'border-[#DDDAF8] hover:border-[#009E49]'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E7FF] shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                                                <UploadCloud className={`w-6 h-6 ${data.position === 'side' ? 'text-blue-600' : 'text-[#009E49]'}`} />
                                            </div>
                                            <p className="text-[13px] font-bold text-[#1A1A2E] mb-1">
                                                {data.position === 'side' ? 'সাইড ব্যানার ছবি আপলোড করুন' : 'স্লাইডার ব্যানার ছবি আপলোড করুন'}
                                            </p>
                                            <p className="text-[11px] text-[#9096B0] mb-3">JPG, PNG, WebP (Drag & Drop)</p>
                                            <span className={`px-4 py-1.5 rounded-xl bg-white border border-[#E8E7FF] text-[11px] font-bold text-[#1A1A2E] shadow-sm transition-all ${
                                                data.position === 'side'
                                                    ? 'group-hover:border-blue-600 group-hover:text-blue-600'
                                                    : 'group-hover:border-[#009E49] group-hover:text-[#009E49]'
                                            }`}>
                                                Browse File
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <SaveBtn type="submit" disabled={processing} className="w-full">
                                <Save className="w-4 h-4" />
                                {processing ? 'সংরক্ষণ হচ্ছে...' : data.position === 'side' ? 'সাইড ব্যানার সংরক্ষণ করুন' : 'স্লাইডার ব্যানার সংরক্ষণ করুন'}
                            </SaveBtn>
                        </form>
                    </AdminCard>
                </div>

            </div>
        </AdminLayout>
    );
};

export default Banners;
