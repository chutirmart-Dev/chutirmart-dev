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
                <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide mb-3 font-bangla">ক্যাটাগরি</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                    {categories.map(cat => (
                        <Link 
                            key={cat.id} 
                            href={route('shop', { ...safeFilters, category: cat.slug })}
                            className={`block text-sm sm:text-base font-medium py-1 hover:text-primary transition-colors font-bangla ${safeFilters.category === cat.slug ? 'text-primary font-bold' : 'text-gray-700'}`}
                        >
                            {cat.name} ({cat.products_count})
                        </Link>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200/80 pt-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide mb-3 font-bangla">ব্র্যান্ড</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                    {brands.map(brand => (
                        <Link 
                            key={brand.id} 
                            href={route('shop', { ...safeFilters, brand: brand.slug })}
                            className={`block text-sm sm:text-base font-medium py-1 hover:text-primary transition-colors font-bangla ${safeFilters.brand === brand.slug ? 'text-primary font-bold' : 'text-gray-700'}`}
                        >
                            {brand.name} ({brand.products_count})
                        </Link>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200/80 pt-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide mb-3 font-bangla">মূল্য পরিসীমা</h3>
                <div className="flex gap-2 items-center font-bangla">
                    <Input 
                        placeholder="সর্বনিম্ন" 
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        type="number"
                        className="h-10 text-sm"
                    />
                    <span className="text-gray-500 text-sm">থেকে</span>
                    <Input 
                        placeholder="সর্বোচ্চ" 
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        type="number"
                        className="h-10 text-sm"
                    />
                </div>
                <div className="flex gap-2 mt-3 font-bangla">
                    <Button onClick={() => applyFilters()} size="sm" className="flex-1 bg-primary text-white h-9 text-xs sm:text-sm font-bold">
                        ফিল্টার করুন
                    </Button>
                    <Button onClick={clearFilters} size="sm" variant="outline" className="h-9 text-xs sm:text-sm font-bold border-gray-300 text-gray-700">
                        মুছে ফেলুন
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <StorefrontLayout>
            <Head title="আমাদের পণ্য সমূহ" />

            <div className="container py-4 sm:py-6">
                {/* Breadcrumb & Sort controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 bg-white p-3.5 sm:p-5 rounded-lg border border-[#E3E0D8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-bangla">
                    <div>
                        <span className="text-xs sm:text-sm text-gray-500">হোম › শপ</span>
                        <h1 className="text-base sm:text-lg md:text-2xl font-black text-gray-900 mt-1">
                            {safeFilters.category ? `ক্যাটাগরি: ${safeFilters.category}` : 'আমাদের শপ'} ({products.total} টি পণ্য)
                        </h1>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {/* Mobile Filter Trigger */}
                        <Sheet>
                            <SheetTrigger className="md:hidden flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold h-10 px-4 border border-gray-200 bg-white hover:bg-gray-50 rounded-md cursor-pointer shadow-2xs shrink-0">
                                <Filter className="w-4 h-4 text-[#009E49]" />
                                ফিল্টার
                                {(safeFilters.category || safeFilters.brand || safeFilters.min_price || safeFilters.max_price) && (
                                    <span className="w-2 h-2 rounded-full bg-[#009E49]" />
                                )}
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-white p-5 overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle className="text-left font-black text-lg flex items-center justify-between font-bangla">
                                        <span>ফিল্টার প্রোডাক্ট</span>
                                        {(safeFilters.category || safeFilters.brand || safeFilters.min_price || safeFilters.max_price) && (
                                            <button onClick={clearFilters} className="text-xs text-red-500 font-bold">ক্লিয়ার</button>
                                        )}
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-4">
                                    <FilterContent />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Sort Dropdown */}
                        <Select value={selectedSort} onValueChange={handleSortChange}>
                            <SelectTrigger className="flex-1 sm:w-[200px] h-10 text-xs sm:text-sm border-gray-200 focus:ring-primary rounded-md bg-white shadow-2xs font-semibold">
                                <SelectValue placeholder="সাজান" />
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-md shadow-lg border-gray-100 font-bangla">
                                <SelectItem value="default" className="text-xs sm:text-sm">ডিফল্ট</SelectItem>
                                <SelectItem value="price_low_high" className="text-xs sm:text-sm">মূল্য: কম থেকে বেশি</SelectItem>
                                <SelectItem value="price_high_low" className="text-xs sm:text-sm">মূল্য: বেশি থেকে কম</SelectItem>
                                <SelectItem value="newest" className="text-xs sm:text-sm">নতুন প্রোডাক্টস</SelectItem>
                                <SelectItem value="best_selling" className="text-xs sm:text-sm">সেরা বিক্রিত</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mobile Horizontal App Category Chips Bar */}
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pb-3 mb-2 select-none font-bangla">
                    <Link
                        href={route('shop')}
                        className={`shrink-0 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all ${
                            !safeFilters.category
                                ? 'bg-[#009E49] text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        সব পণ্য
                    </Link>
                    {categories.map(cat => {
                        const isActive = safeFilters.category === cat.slug;
                        return (
                            <Link
                                key={cat.id}
                                href={route('shop', { ...safeFilters, category: cat.slug })}
                                className={`shrink-0 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                                    isActive
                                        ? 'bg-[#009E49] text-white shadow-xs'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {cat.icon && <span className="text-sm">{cat.icon}</span>}
                                <span>{cat.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Main Shop Body */}
                <div className="flex gap-6">
                    {/* Left Sidebar (Desktop) */}
                    <aside className="w-[270px] shrink-0 hidden md:block bg-white border border-[#E3E0D8] p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 font-bangla">
                            <span className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                                <SlidersHorizontal className="w-4 h-4 text-primary" /> ফিল্টার সমূহ
                            </span>
                            {(safeFilters.category || safeFilters.brand || safeFilters.min_price || safeFilters.max_price || safeFilters.q) && (
                                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-bold">ক্লিয়ার</button>
                            )}
                        </div>
                        <FilterContent />
                    </aside>

                    {/* Products Grid Area */}
                    <div className="flex-grow space-y-8">
                        {products.data.length === 0 ? (
                            <div className="bg-white border border-[#E3E0D8] rounded-lg p-8 sm:p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                                <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-800 font-bangla">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
                                <p className="text-sm sm:text-base text-gray-600 mt-1 mb-5 font-bangla">অনুগ্রহ করে ফিল্টার পরিবর্তন বা পরিষ্কার করুন।</p>
                                <Button onClick={clearFilters} className="bg-primary text-white hover:bg-primary/95 text-sm font-bold px-6 h-11 rounded-md font-bangla">
                                    ফিল্টার পরিষ্কার করুন
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-4 md:gap-5">
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
                                                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold ${link.active ? 'bg-primary border-primary text-white' : 'border-[#E3E0D8] bg-white text-gray-700 hover:border-primary hover:text-primary transition-colors'}`}
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
