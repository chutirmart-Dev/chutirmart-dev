import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, AdminTextarea, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { UploadCloud, X, Save, ArrowLeft, Images } from 'lucide-react';
import { toast } from 'sonner';
import { VariationsSection } from '@/components/admin/VariationsSection';
import { compressImageFile } from '@/lib/imageCompression';

interface CreateProps {
    brands: any[];
    categories: any[];
    attributes: any[];
}

export const Create: React.FC<CreateProps> = ({ brands, categories, attributes }) => {
    const [selectedAttributeOptions, setSelectedAttributeOptions] = useState<Record<number, number[]>>({});
    const [isOptimizingImages, setIsOptimizingImages] = useState(false);
    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        price: '',
        compare_at_price: '',
        discount_type: 'none',
        discount_value: '0' as string | number,
        stock_quantity: '10' as string | number,
        description: '',
        status: 'active',
        is_best_selling: false,
        is_new_arrival: false,
        is_featured: false,
        brand_id: '',
        categories: [] as number[],
        main_image: '', // single base64 string
        gallery_images: [] as string[], // array of base64 strings
        youtube_url: '',
        selected_attribute_options: [] as {attribute_id: number; option_ids: number[]}[],
    });

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file.');
                return;
            }
            try {
                const compressed = await compressImageFile(file);
                setData('main_image', compressed);
                toast.success('Main Image uploaded and optimized! ✨');
            } catch (err) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setData('main_image', reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        setIsOptimizingImages(true);
        const toastId = toast.loading(`Optimizing ${imageFiles.length} gallery image(s)... ⏳`);

        try {
            const compressedImages = await Promise.all(
                imageFiles.map(file => compressImageFile(file))
            );
            setData(prev => ({
                ...prev,
                gallery_images: [...prev.gallery_images, ...compressedImages],
            }));
            e.target.value = ''; // Reset input so same images can be re-selected if needed
            toast.success(`${compressedImages.length} gallery image(s) optimized and added! 🖼️`, { id: toastId });
        } catch (error) {
            const readPromises = imageFiles.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });

            const newBase64Images = await Promise.all(readPromises);
            setData(prev => ({
                ...prev,
                gallery_images: [...prev.gallery_images, ...newBase64Images],
            }));
            e.target.value = '';
            toast.success(`${newBase64Images.length} gallery image(s) added! 🖼️`, { id: toastId });
        } finally {
            setIsOptimizingImages(false);
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        setData('gallery_images', data.gallery_images.filter((_, i) => i !== index));
    };

    // Promote a gallery image to be the Main Image
    const handlePromoteToMain = (index: number) => {
        const selectedGalleryImage = data.gallery_images[index];
        const oldMain = data.main_image;
        
        const newGallery = data.gallery_images.filter((_, i) => i !== index);
        if (oldMain) {
            newGallery.push(oldMain);
        }

        setData(prev => ({
            ...prev,
            main_image: selectedGalleryImage,
            gallery_images: newGallery,
        }));
        toast.success('Selected image set as Main Product Image! ⭐');
    };

    const handleCategoryCheck = (id: number, checked: boolean) => {
        let updatedCats = [...data.categories];
        if (checked) {
            updatedCats.push(id);
        } else {
            updatedCats = updatedCats.filter(cId => cId !== id);
        }
        setData('categories', updatedCats);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.main_image && data.gallery_images.length === 0) {
            toast.error('Please add at least 1 product image (Main Image or Gallery Image).');
            return;
        }

        if (data.categories.length === 0) {
            toast.error('Please select at least 1 category.');
            return;
        }

        // Convert selected options to array format for backend
        const attributeOptionsArray = Object.entries(selectedAttributeOptions)
            .filter(([_, ids]) => ids.length > 0)
            .map(([attrId, optionIds]) => ({ attribute_id: Number(attrId), option_ids: optionIds }));
        
        transform((formData) => ({
            ...formData,
            selected_attribute_options: attributeOptionsArray,
        }));

        post(route('admin.products.store'), {
            onSuccess: () => toast.success('Product added successfully! 🎉'),
            onError: () => toast.error('Please verify details and submit again.')
        });
    };

    return (
        <AdminLayout>
            <Head title="Add New Product" />

            <div className="flex items-center gap-3 mb-5">
                <Link href={route('admin.products.index')}>
                    <button className="w-8 h-8 rounded-xl bg-white border border-[#E6F5EC] flex items-center justify-center text-gray-500 hover:border-[#009E49] hover:text-[#009E49] transition-all shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </Link>
                <div>
                    <h2 className="text-xl font-black text-[#1A1A2E]">Add New Product</h2>
                    <p className="text-xs text-[#9096B0] mt-0.5">Fill in the details to create a new product.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Information */}
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Product Information</h3>
                        <div className="space-y-4">
                            <div>
                                <FieldLabel required>Product Name</FieldLabel>
                                <AdminInput 
                                    placeholder="e.g. Mini Portable Fan" 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required 
                                    error={errors.name}
                                />
                            </div>
                            <div>
                                <FieldLabel required>Description (HTML Supported)</FieldLabel>
                                <AdminTextarea 
                                    placeholder="Write something detailed about the product..." 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={6}
                                    required
                                    error={errors.description}
                                />
                            </div>
                        </div>
                    </AdminCard>

                    {/* Pricing & Inventory */}
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Pricing & Inventory</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel required>Sale Price (৳)</FieldLabel>
                                <AdminInput 
                                    placeholder="e.g. 1200" 
                                    type="number"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    required 
                                    error={errors.price}
                                />
                            </div>
                            <div>
                                <FieldLabel>Regular Price (৳) (Strikethrough)</FieldLabel>
                                <AdminInput 
                                    placeholder="e.g. 1500" 
                                    type="number"
                                    value={data.compare_at_price}
                                    onChange={e => setData('compare_at_price', e.target.value)}
                                />
                            </div>
                            <div>
                                <FieldLabel>Discount Type</FieldLabel>
                                <AdminSelect value={data.discount_type} onChange={e => setData('discount_type', e.target.value)}>
                                    <option value="none">None</option>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (৳)</option>
                                </AdminSelect>
                            </div>
                            <div>
                                <FieldLabel>Discount Value</FieldLabel>
                                <AdminInput 
                                    type="number"
                                    value={data.discount_value}
                                    onChange={e => setData('discount_value', e.target.value)}
                                />
                            </div>
                            <div>
                                <FieldLabel required>Stock Quantity</FieldLabel>
                                <AdminInput 
                                    placeholder="e.g. 50" 
                                    type="number"
                                    value={data.stock_quantity}
                                    onChange={e => setData('stock_quantity', e.target.value)}
                                    required 
                                    error={errors.stock_quantity}
                                />
                            </div>
                            <div>
                                <FieldLabel>YouTube Review Link</FieldLabel>
                                <AdminInput 
                                    placeholder="https://youtube.com/watch?..." 
                                    type="url"
                                    value={data.youtube_url}
                                    onChange={e => setData('youtube_url', e.target.value)}
                                />
                            </div>
                        </div>
                    </AdminCard>

                    {/* Dedicated Image Sections */}
                    <div className="space-y-6">
                        {/* Section 1: Main Product Image */}
                        <AdminCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 flex items-center justify-center">
                                        <Images className="w-4 h-4 text-[#009E49]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[14px] font-black text-[#1A1A2E]">Main Product Image (মেইন ছবি)</h3>
                                            <span className="bg-[#009E49] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                Primary Cover
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#9096B0]">This image is shown as the primary thumbnail on product cards, category catalogs, and checkout.</p>
                                    </div>
                                </div>
                            </div>

                            {data.main_image ? (
                                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
                                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-[#009E49] bg-white shadow-sm flex-shrink-0 group">
                                        <img src={data.main_image} className="w-full h-full object-cover" alt="Main Product Preview" />
                                        <span className="absolute bottom-1.5 left-1.5 bg-[#009E49] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
                                            ★ MAIN
                                        </span>
                                    </div>
                                    <div className="space-y-2.5 text-center sm:text-left flex-1">
                                        <p className="text-sm font-bold text-gray-800">Primary Product Image Selected</p>
                                        <p className="text-xs text-gray-500">Ready to save. You can change this image anytime or promote another image from the gallery.</p>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                            <label className="px-3.5 py-2 rounded-lg bg-white border border-[#009E49] text-xs font-bold text-[#009E49] hover:bg-[#009E49] hover:text-white cursor-pointer transition-all shadow-2xs">
                                                Change Main Image
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setData('main_image', '')}
                                                className="px-3.5 py-2 rounded-lg bg-white border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-all shadow-2xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    className="group relative block w-full border-2 border-dashed border-[#009E49]/40 rounded-xl bg-[#FAFDFB] hover:bg-[#F0FDF4] hover:border-[#009E49] transition-all duration-200 cursor-pointer"
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#009E49]', 'bg-[#F0FDF4]'); }}
                                    onDragLeave={e => { e.currentTarget.classList.remove('border-[#009E49]', 'bg-[#F0FDF4]'); }}
                                    onDrop={e => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-[#009E49]', 'bg-[#F0FDF4]');
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setData('main_image', reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                                        <div className="w-12 h-12 rounded-lg bg-white border border-[#DCFCE7] shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <UploadCloud className="w-6 h-6 text-[#009E49]" />
                                        </div>
                                        <p className="text-[14px] font-bold text-[#1A1A2E] mb-1">Click to upload Main Product Image</p>
                                        <p className="text-[12px] text-[#9096B0] mb-3">JPEG, PNG, WebP · Max 5 MB</p>
                                        <span className="px-4 py-1.5 rounded-lg bg-white border border-[#009E49] text-[12px] font-bold text-[#009E49] shadow-2xs group-hover:bg-[#009E49] group-hover:text-white transition-all">
                                            Select Main Image
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </AdminCard>

                        {/* Section 2: Product Gallery Images */}
                        <AdminCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#009E49]/10 flex items-center justify-center">
                                        <Images className="w-4 h-4 text-[#009E49]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-black text-[#1A1A2E]">Product Gallery Images (গ্যালারি ছবি সমূহ)</h3>
                                        <p className="text-[11px] text-[#9096B0]">Additional photos shown in product single page gallery & zoom preview.</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-[#009E49] bg-[#E6F5EC] px-2.5 py-1 rounded-lg">
                                    {data.gallery_images.length} Images
                                </span>
                            </div>

                            {/* Gallery Upload Drop Zone */}
                            <label
                                className="group relative block w-full border-2 border-dashed border-[#86EFAC] rounded-xl bg-[#FAFDFB] hover:bg-[#F0FDF4] hover:border-[#009E49] transition-all duration-200 cursor-pointer mb-4"
                                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#009E49]', 'bg-[#F0FDF4]'); }}
                                onDragLeave={e => { e.currentTarget.classList.remove('border-[#009E49]', 'bg-[#F0FDF4]'); }}
                                onDrop={async e => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-[#009E49]', 'bg-[#F0FDF4]');
                                    const files = e.dataTransfer.files;
                                    if (!files || files.length === 0) return;

                                    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
                                    if (imageFiles.length === 0) return;

                                    const readPromises = imageFiles.map(file => {
                                        return new Promise<string>((resolve) => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => resolve(reader.result as string);
                                            reader.readAsDataURL(file);
                                        });
                                    });

                                    const newBase64Images = await Promise.all(readPromises);
                                    setData(prev => ({
                                        ...prev,
                                        gallery_images: [...prev.gallery_images, ...newBase64Images],
                                    }));
                                    toast.success(`${newBase64Images.length} gallery image(s) dropped! 🖼️`);
                                }}
                            >
                                <div className="flex flex-col items-center justify-center py-7 px-6 text-center">
                                    <div className="w-11 h-11 rounded-lg bg-white border border-[#DCFCE7] shadow-sm flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                        <UploadCloud className="w-5 h-5 text-[#009E49]" />
                                    </div>
                                    <p className="text-[13px] font-bold text-[#1A1A2E] mb-0.5">Choose multiple gallery files or drag & drop here</p>
                                    <p className="text-[11px] text-[#9096B0] mb-3">JPEG, PNG, WebP · Max 5 MB each</p>
                                    <span className="px-4 py-1.5 rounded-lg bg-white border border-[#E6F5EC] text-[12px] font-bold text-[#009E49] shadow-2xs group-hover:bg-[#009E49] group-hover:text-white transition-all">
                                        Browse Gallery Files
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleGalleryImageUpload}
                                    className="hidden"
                                />
                            </label>

                            {/* Gallery Previews */}
                            {data.gallery_images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {data.gallery_images.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E6F5EC] bg-[#FAFDFB] group shadow-2xs">
                                            <img src={src} className="w-full h-full object-cover" alt={`Gallery ${idx + 1}`} />
                                            
                                            {/* Action Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                                        #{idx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveGalleryImage(idx)}
                                                        className="w-6 h-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 border-none transition-all cursor-pointer shadow-xs"
                                                        title="Delete image"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handlePromoteToMain(idx)}
                                                    className="w-full py-1.5 px-2 rounded-lg bg-[#009E49] hover:bg-[#00873E] text-white text-[10px] font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1"
                                                >
                                                    ★ Set as Main
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </AdminCard>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Status & Brand */}
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Status & Brand</h3>
                        <div className="space-y-4">
                            <div>
                                <FieldLabel>Status</FieldLabel>
                                <AdminSelect value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </AdminSelect>
                            </div>
                            <div>
                                <FieldLabel>Brand</FieldLabel>
                                <AdminSelect value={data.brand_id} onChange={e => setData('brand_id', e.target.value)}>
                                    <option value="">Select Brand</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </AdminSelect>
                            </div>
                        </div>
                    </AdminCard>

                    {/* Homepage Showcase (হোমপেজ সেকশন) */}
                    <AdminCard className="p-6">
                        <div className="mb-4">
                            <h3 className="text-[14px] font-black text-[#1A1A2E]">Homepage Showcase</h3>
                            <p className="text-[11px] text-[#9096B0] mt-0.5">হোমপেজে প্রদর্শনের সেকশন সিলেক্ট করুন</p>
                        </div>

                        <div className="space-y-3">
                            <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                data.is_best_selling
                                    ? 'bg-orange-50/70 border-orange-200'
                                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={data.is_best_selling}
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setData(prev => ({
                                            ...prev,
                                            is_best_selling: checked,
                                            is_new_arrival: checked ? false : prev.is_new_arrival,
                                            status: checked && prev.status === 'draft' ? 'active' : prev.status,
                                        }));
                                    }}
                                    className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <span>🔥</span> সর্বাধিক বিক্রিত পণ্য
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                        হোমপেজের "🔥 সর্বাধিক বিক্রিত পণ্য" সেকশনে সবার আগে দেখাবে
                                    </p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                data.is_new_arrival
                                    ? 'bg-amber-50/70 border-amber-200'
                                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={data.is_new_arrival}
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setData(prev => ({
                                            ...prev,
                                            is_new_arrival: checked,
                                            is_best_selling: checked ? false : prev.is_best_selling,
                                            status: checked && prev.status === 'draft' ? 'active' : prev.status,
                                        }));
                                    }}
                                    className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <span>✨</span> নতুন পণ্য সমূহ
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                        হোমপেজের "✨ নতুন পণ্য সমূহ" সেকশনে সবার আগে দেখাবে
                                    </p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                data.is_featured
                                    ? 'bg-emerald-50/70 border-emerald-200'
                                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setData(prev => ({
                                            ...prev,
                                            is_featured: checked,
                                            status: checked && prev.status === 'draft' ? 'active' : prev.status,
                                        }));
                                    }}
                                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <span>⚡</span> Just For You (আপনার জন্য পণ্য)
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                        হোমপেজের "⚡ Just For You" সেকশনে সবার আগে দেখাবে
                                    </p>
                                </div>
                            </label>
                        </div>
                    </AdminCard>

                    {/* Categories */}
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Categories</h3>
                        <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                            {categories.map(cat => {
                                const isChecked = data.categories.includes(cat.id);
                                return (
                                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input 
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={e => handleCategoryCheck(cat.id, e.target.checked)}
                                            className="w-4 h-4 rounded text-[#009E49] accent-[#009E49] border-[#E6F5EC] focus:ring-[#009E49]/20 cursor-pointer"
                                            style={{ accentColor: '#009E49' }}
                                        />
                                        <span className={`text-[13px] font-bold transition-colors ${isChecked ? 'text-[#009E49]' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </AdminCard>

                    {/* Save Button */}
                    <SaveBtn type="submit" disabled={processing || isOptimizingImages} className="w-full py-3.5 text-base">
                        <Save className="w-5 h-5" />
                        {isOptimizingImages ? 'Optimizing Images...' : (processing ? 'Saving...' : 'Save Product')}
                    </SaveBtn>
                </div>

                {/* Full-width: Variations Section */}
                <div className="col-span-1 lg:col-span-12 mt-2">
                    <h3 className="text-[15px] font-black text-[#1A1A2E] mb-3">⚡ Product Attributes & Variations</h3>
                    <VariationsSection
                        productId={null}
                        attributes={attributes}
                        initialSelectedOptions={selectedAttributeOptions}
                        initialVariations={[]}
                        onSelectionChange={setSelectedAttributeOptions}
                    />
                </div>

            </form>
        </AdminLayout>
    );
};

export default Create;
