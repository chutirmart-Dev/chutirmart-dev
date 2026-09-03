import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader, SaveBtn, AdminInput, AdminTextarea, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { UploadCloud, X, Save, ArrowLeft, Images } from 'lucide-react';
import { toast } from 'sonner';

interface EditProps {
    product: any;
    brands: any[];
    categories: any[];
}

export const Edit: React.FC<EditProps> = ({ product, brands, categories }) => {
    // Find initial main image id
    const initialMainImage = product.images?.find((img: any) => img.is_main) || product.images?.[0];

    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        price: product.price,
        compare_at_price: product.compare_at_price || '',
        discount_type: product.discount_type,
        discount_value: product.discount_value,
        stock_quantity: product.stock_quantity,
        description: product.description || '',
        status: product.status,
        brand_id: product.brand_id || '',
        categories: product.categories.map((c: any) => c.id) as number[],
        main_image_id: (initialMainImage?.id || null) as number | null,
        new_main_image: '' as string,
        new_gallery_images: [] as string[],
        deleted_image_ids: [] as number[],
        youtube_url: product.youtube_url || '',
    });

    const [existingImages, setExistingImages] = useState<any[]>(product.images || []);

    const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({
                    ...prev,
                    new_main_image: reader.result as string,
                }));
                toast.success('New Main Image uploaded! Click Update Product to save.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
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
            new_gallery_images: [...prev.new_gallery_images, ...newBase64Images],
        }));
        e.target.value = ''; // Reset input so same images can be re-selected if needed
        toast.success(`${newBase64Images.length} new gallery image(s) added! 🖼️`);
    };

    // Promote an existing gallery image to become Main Image
    const handleSetExistingAsMain = (imageId: number) => {
        setData(prev => ({
            ...prev,
            main_image_id: imageId,
            new_main_image: '', // Clear any pending new main image
        }));
        toast.success('Selected image set as Primary Main Image! ⭐');
    };

    // Promote a new uploaded gallery image to become Main Image
    const handleSetNewGalleryAsMain = (index: number) => {
        const selected = data.new_gallery_images[index];
        const newGallery = data.new_gallery_images.filter((_, i) => i !== index);
        
        setData(prev => ({
            ...prev,
            new_main_image: selected,
            new_gallery_images: newGallery,
        }));
        toast.success('Selected new upload set as Primary Main Image! ⭐');
    };

    // Delete an existing image
    const handleDeleteExistingImage = (imageId: number) => {
        const updatedDeleted = [...data.deleted_image_ids, imageId];
        const remainingExisting = existingImages.filter(img => img.id !== imageId && !updatedDeleted.includes(img.id));
        
        let newMainId = data.main_image_id;
        if (data.main_image_id === imageId) {
            newMainId = remainingExisting[0]?.id || null;
        }

        setData(prev => ({
            ...prev,
            deleted_image_ids: updatedDeleted,
            main_image_id: newMainId,
        }));
        toast.info('Image marked for removal.');
    };

    // Remove a newly added gallery upload
    const handleRemoveNewGalleryImage = (index: number) => {
        setData(prev => ({
            ...prev,
            new_gallery_images: prev.new_gallery_images.filter((_, i) => i !== index),
        }));
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
        
        const activeExistingImages = existingImages.filter(img => !data.deleted_image_ids.includes(img.id));
        const totalImagesCount = activeExistingImages.length + data.new_gallery_images.length + (data.new_main_image ? 1 : 0);

        if (totalImagesCount === 0) {
            toast.error('Please keep or upload at least 1 product image.');
            return;
        }

        if (data.categories.length === 0) {
            toast.error('Please select at least 1 category.');
            return;
        }

        put(route('admin.products.update', { id: product.id }), {
            onSuccess: () => toast.success('Product updated successfully! 🎉'),
            onError: () => toast.error('Please verify details and submit again.')
        });
    };

    // Identify active main image for UI
    const activeExistingMain = !data.new_main_image 
        ? existingImages.find(img => img.id === data.main_image_id && !data.deleted_image_ids.includes(img.id))
        : null;

    // Remaining existing gallery images (excluding main and deleted)
    const activeExistingGallery = existingImages.filter(img => 
        !data.deleted_image_ids.includes(img.id) && 
        (data.new_main_image ? true : img.id !== data.main_image_id)
    );

    return (
        <AdminLayout>
            <Head title={`Edit Product: ${product.name}`} />

            <div className="flex items-center gap-3 mb-5">
                <Link href={route('admin.products.index')}>
                    <button className="w-8 h-8 rounded-xl bg-white border border-[#E6F5EC] flex items-center justify-center text-gray-500 hover:border-[#009E49] hover:text-[#009E49] transition-all shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </Link>
                <div>
                    <h2 className="text-xl font-black text-[#1A1A2E]">Edit Product</h2>
                    <p className="text-xs text-[#9096B0] mt-0.5">Modify parameters for "{product.name}".</p>
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
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required 
                                    error={errors.name}
                                />
                            </div>
                            <div>
                                <FieldLabel required>Description (HTML Supported)</FieldLabel>
                                <AdminTextarea 
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
                                    type="url"
                                    value={data.youtube_url}
                                    onChange={e => setData('youtube_url', e.target.value)}
                                />
                            </div>
                        </div>
                    </AdminCard>

                    {/* Separated Image Management Sections */}
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
                                        <p className="text-[11px] text-[#9096B0]">The primary thumbnail displayed in shop cards, category listings, and checkout.</p>
                                    </div>
                                </div>
                            </div>

                            {data.new_main_image ? (
                                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7]">
                                    <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-[#009E49] bg-white shadow-sm flex-shrink-0 group">
                                        <img src={data.new_main_image} className="w-full h-full object-cover" alt="New Main Preview" />
                                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
                                            ★ NEW MAIN
                                        </span>
                                    </div>
                                    <div className="space-y-2.5 text-center sm:text-left flex-1">
                                        <p className="text-sm font-bold text-gray-800">New Primary Cover Uploaded</p>
                                        <p className="text-xs text-gray-500">This new upload will replace the previous primary thumbnail upon saving.</p>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                            <label className="px-3.5 py-2 rounded-xl bg-white border border-[#009E49] text-xs font-bold text-[#009E49] hover:bg-[#009E49] hover:text-white cursor-pointer transition-all shadow-2xs">
                                                Change New Main Image
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setData('new_main_image', '')}
                                                className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all shadow-2xs"
                                            >
                                                Revert to Existing Main
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : activeExistingMain ? (
                                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7]">
                                    <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-[#009E49] bg-white shadow-sm flex-shrink-0 group">
                                        <img src={activeExistingMain.image_path} className="w-full h-full object-cover" alt="Current Main" />
                                        <span className="absolute bottom-1.5 left-1.5 bg-[#009E49] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
                                            ★ CURRENT MAIN
                                        </span>
                                    </div>
                                    <div className="space-y-2.5 text-center sm:text-left flex-1">
                                        <p className="text-sm font-bold text-gray-800">Current Primary Image Active</p>
                                        <p className="text-xs text-gray-500">You can upload a brand new main image or choose any image from the gallery below to make it Main.</p>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                            <label className="px-3.5 py-2 rounded-xl bg-white border border-[#009E49] text-xs font-bold text-[#009E49] hover:bg-[#009E49] hover:text-white cursor-pointer transition-all shadow-2xs">
                                                Upload New Main Image
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    className="group relative block w-full border-2 border-dashed border-[#009E49]/40 rounded-2xl bg-[#FAFDFB] hover:bg-[#F0FDF4] hover:border-[#009E49] transition-all duration-200 cursor-pointer"
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#009E49]', 'bg-[#F0FDF4]'); }}
                                    onDragLeave={e => { e.currentTarget.classList.remove('border-[#009E49]', 'bg-[#F0FDF4]'); }}
                                    onDrop={e => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-[#009E49]', 'bg-[#F0FDF4]');
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setData('new_main_image', reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCFCE7] shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <UploadCloud className="w-6 h-6 text-[#009E49]" />
                                        </div>
                                        <p className="text-[14px] font-bold text-[#1A1A2E] mb-1">Click to upload Main Product Image</p>
                                        <p className="text-[12px] text-[#9096B0] mb-3">JPEG, PNG, WebP · Max 5 MB</p>
                                        <span className="px-4 py-1.5 rounded-xl bg-white border border-[#009E49] text-[12px] font-bold text-[#009E49] shadow-2xs group-hover:bg-[#009E49] group-hover:text-white transition-all">
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
                                    <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 flex items-center justify-center">
                                        <Images className="w-4 h-4 text-[#009E49]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-black text-[#1A1A2E]">Product Gallery Images (গ্যালারি ছবি সমূহ)</h3>
                                        <p className="text-[11px] text-[#9096B0]">Additional photos shown in product single page gallery & zoom preview.</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-[#009E49] bg-[#E6F5EC] px-2.5 py-1 rounded-lg">
                                    {activeExistingGallery.length + data.new_gallery_images.length} Images
                                </span>
                            </div>

                            {/* Gallery Upload Drop Zone */}
                            <label
                                className="group relative block w-full border-2 border-dashed border-[#86EFAC] rounded-2xl bg-[#FAFDFB] hover:bg-[#F0FDF4] hover:border-[#009E49] transition-all duration-200 cursor-pointer mb-5"
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
                                        new_gallery_images: [...prev.new_gallery_images, ...newBase64Images],
                                    }));
                                    toast.success(`${newBase64Images.length} gallery image(s) dropped! 🖼️`);
                                }}
                            >
                                <div className="flex flex-col items-center justify-center py-7 px-6 text-center">
                                    <div className="w-11 h-11 rounded-2xl bg-white border border-[#DCFCE7] shadow-sm flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                        <UploadCloud className="w-5 h-5 text-[#009E49]" />
                                    </div>
                                    <p className="text-[13px] font-bold text-[#1A1A2E] mb-0.5">Upload new gallery images</p>
                                    <p className="text-[11px] text-[#9096B0] mb-3">JPEG, PNG, WebP · Max 5 MB each</p>
                                    <span className="px-4 py-1.5 rounded-xl bg-white border border-[#E6F5EC] text-[12px] font-bold text-[#009E49] shadow-2xs group-hover:bg-[#009E49] group-hover:text-white transition-all">
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

                            {/* Gallery Images List */}
                            {(activeExistingGallery.length > 0 || data.new_gallery_images.length > 0) && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {/* Existing Gallery Images */}
                                    {activeExistingGallery.map((img, idx) => (
                                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-[#E6F5EC] bg-[#FAFDFB] group shadow-2xs">
                                            <img src={img.image_path} className="w-full h-full object-cover" alt={`Gallery ${idx + 1}`} />
                                            
                                            {/* Action Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                                        #{idx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteExistingImage(img.id)}
                                                        className="w-6 h-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 border-none transition-all cursor-pointer shadow-xs"
                                                        title="Delete image"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSetExistingAsMain(img.id)}
                                                    className="w-full py-1.5 px-2 rounded-lg bg-[#009E49] hover:bg-[#00873E] text-white text-[10px] font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1"
                                                >
                                                    ★ Set as Main
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Newly Added Gallery Uploads */}
                                    {data.new_gallery_images.map((src, idx) => (
                                        <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-emerald-400 bg-emerald-50/50 group shadow-2xs">
                                            <img src={src} className="w-full h-full object-cover" alt={`New Upload ${idx + 1}`} />
                                            
                                            {/* Action Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                                        NEW
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNewGalleryImage(idx)}
                                                        className="w-6 h-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 border-none transition-all cursor-pointer shadow-xs"
                                                        title="Remove upload"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSetNewGalleryAsMain(idx)}
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
                    <SaveBtn type="submit" disabled={processing} className="w-full py-3.5 text-base">
                        <Save className="w-5 h-5" />
                        {processing ? 'Updating...' : 'Update Product'}
                    </SaveBtn>
                </div>

            </form>
        </AdminLayout>
    );
};

export default Edit;
