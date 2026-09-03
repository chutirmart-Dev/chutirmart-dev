import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, SlidersHorizontal } from 'lucide-react';

interface ShopProps {
    products: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: any[];
    brands: any[];
    filters: {
        q?: string;
        category?: string;
        brand?: string;
        min_price?: string;
        max_price?: string;
        sort?: string;
    };
}

export const Shop: React.FC<ShopProps> = ({ products, categories, brands, filters }) => {
    const safeFilters = (Array.isArray(filters) || !filters) ? {} : filters;
    const [minPrice, setMinPrice] = useState(safeFilters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(safeFilters.max_price || '');
    const [selectedSort, setSelectedSort] = useState(safeFilters.sort || 'default');

    const applyFilters = (updatedParams: Record<string, any> = {}) => {
        const queryParams: Record<string, any> = {
            ...safeFilters,
            min_price: minPrice,
            max_price: maxPrice,
            sort: selectedSort,
            ...updatedParams
        };

        // Remove empty values
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        router.get(route('shop'), queryParams, { preserveState: true });
    };

    const handleSortChange = (value: string | null) => {
        if (value) {
            setSelectedSort(value);
            applyFilters({ sort: value });
        }
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedSort('default');
        router.visit(route('shop'));
    };

    const FilterContent = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">ক্যাটাগরি</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {categories.map(cat => (
                        <Link 
                            key={cat.id} 
                            href={route('shop', { ...safeFilters, category: cat.slug })}
                            className={`block text-xs md:text-sm font-medium py-1 hover:text-primary transition-colors ${safeFilters.category === cat.slug ? 'text-primary font-bold' : 'text-gray-600'}`}
                        >
                            {cat.name} ({cat.products_count})
                        </Link>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200/80 pt-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">ব্র্যান্ড</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {brands.map(brand => (
                        <Link 
                            key={brand.id} 
                            href={route('shop', { ...safeFilters, brand: brand.slug })}
                            className={`block text-xs md:text-sm font-medium py-1 hover:text-primary transition-colors ${safeFilters.brand === brand.slug ? 'text-primary font-bold' : 'text-gray-600'}`}
                        >
                            {brand.name} ({brand.products_count})
                        </Link>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200/80 pt-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">মূল্য পরিসীমা</h3>
                <div className="flex gap-2 items-center">
                    <Input 
                        placeholder="সর্বনিম্ন" 
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        type="number"
                        className="h-9 text-xs"
                    />
                    <span className="text-gray-400 text-xs">থেকে</span>
                    <Input 
                        placeholder="সর্বোচ্চ" 
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        type="number"
                        className="h-9 text-xs"
                    />
                </div>
                <div className="flex gap-2 mt-3">
                    <Button onClick={() => applyFilters()} size="sm" className="flex-1 bg-primary text-white h-8 text-xs font-semibold">
                        ফিল্টার করুন
                    </Button>
                    <Button onClick={clearFilters} size="sm" variant="outline" className="h-8 text-xs font-semibold border-gray-300">
                        মুছে ফেলুন
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <StorefrontLayout>
            <Head title="আমাদের পণ্য সমূহ" />

            <div className="container py-6">
                {/* Breadcrumb & Sort controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-[#E3E0D8] shadow-sm">
                    <div>
                        <span className="text-xs text-gray-400">হোম › শপ</span>
                        <h1 className="text-base md:text-lg font-bold text-gray-800 mt-1">
                            {safeFilters.category ? `ক্যাটাগরি: ${safeFilters.category}` : 'আমাদের শপ'} ({products.total} টি পণ্য)
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto self-end">
                        {/* Mobile Filter Trigger */}
                        <Sheet>
                            <SheetTrigger className="md:hidden flex items-center gap-1 text-xs h-9 px-3 border border-gray-300 bg-white rounded-lg cursor-pointer">
                                <Filter className="w-4 h-4" />
                                ফিল্টার
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-white">
                                <SheetHeader>
                                    <SheetTitle className="text-left">ফিল্টার প্রোডাক্ট</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterContent />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Sort Dropdown */}
                        <Select value={selectedSort} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs border-[#E3E0D8] focus:ring-primary rounded-lg bg-white">
                                <SelectValue placeholder="সাজান" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="default" className="text-xs">ডিফল্ট</SelectItem>
                                <SelectItem value="price_low_high" className="text-xs">মূল্য: কম থেকে বেশি</SelectItem>
                                <SelectItem value="price_high_low" className="text-xs">মূল্য: বেশি থেকে কম</SelectItem>
                                <SelectItem value="newest" className="text-xs">নতুন প্রোডাক্টস</SelectItem>
                                <SelectItem value="best_selling" className="text-xs">সেরা বিক্রিত</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Main Shop Body */}
                <div className="flex gap-6">
                    {/* Left Sidebar (Desktop) */}
                    <aside className="w-[260px] shrink-0 hidden md:block bg-white border border-[#E3E0D8] p-5 rounded-2xl shadow-sm h-fit">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
                                <SlidersHorizontal className="w-4 h-4 text-primary" /> ফিল্টার সমূহ
                            </span>
                            {(safeFilters.category || safeFilters.brand || safeFilters.min_price || safeFilters.max_price || safeFilters.q) && (
                                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">ক্লিয়ার</button>
                            )}
                        </div>
                        <FilterContent />
                    </aside>

                    {/* Products Grid Area */}
                    <div className="flex-grow space-y-8">
                        {products.data.length === 0 ? (
                            <div className="bg-white border border-[#E3E0D8] rounded-2xl p-12 text-center shadow-sm">
                                <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-gray-700">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-4">অনুগ্রহ করে ফিল্টার পরিবর্তন বা পরিষ্কার করুন।</p>
                                <Button onClick={clearFilters} className="bg-primary text-white hover:bg-primary/95 text-xs font-bold px-5">
                                    ফিল্টার পরিষ্কার করুন
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                    {products.data.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {products.last_page > 1 && (
                                    <div className="flex justify-center items-center gap-1.5 pt-4">
                                        {products.links.map((link, idx) => {
                                            if (link.url === null) return null;

                                            return (
                                                <Link 
                                                    key={idx}
                                                    href={link.url}
                                                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${link.active ? 'bg-primary border-primary text-white' : 'border-[#E3E0D8] bg-white text-gray-700 hover:border-primary hover:text-primary transition-colors'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default Shop;
