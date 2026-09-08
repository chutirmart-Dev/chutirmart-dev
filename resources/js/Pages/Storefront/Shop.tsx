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

const DualRangeSlider: React.FC<{
    min: number;
    max: number;
    step?: number;
    minValue: number;
    maxValue: number;
    onChange: (newMin: number, newMax: number) => void;
    onAfterChange?: (newMin: number, newMax: number) => void;
}> = ({ min, max, step = 50, minValue, maxValue, onChange, onAfterChange }) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const draggingRef = React.useRef<'min' | 'max' | null>(null);
    const valuesRef = React.useRef({ min: minValue, max: maxValue });

    React.useEffect(() => {
        valuesRef.current = { min: minValue, max: maxValue };
    }, [minValue, maxValue]);

    const getValueFromPointer = (clientX: number) => {
        if (!trackRef.current) return min;
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawValue = min + ratio * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const clickedVal = getValueFromPointer(e.clientX);
        const { min: curMin, max: curMax } = valuesRef.current;
        const distToMin = Math.abs(clickedVal - curMin);
        const distToMax = Math.abs(clickedVal - curMax);
        const thumb = distToMin <= distToMax ? 'min' : 'max';
        draggingRef.current = thumb;

        e.currentTarget.setPointerCapture(e.pointerId);

        let newMin = curMin;
        let newMax = curMax;
        if (thumb === 'min') {
            newMin = Math.min(clickedVal, curMax - step);
        } else {
            newMax = Math.max(clickedVal, curMin + step);
        }
        valuesRef.current = { min: newMin, max: newMax };
        onChange(newMin, newMax);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return;
        e.preventDefault();
        const currentVal = getValueFromPointer(e.clientX);
        const { min: curMin, max: curMax } = valuesRef.current;

        let newMin = curMin;
        let newMax = curMax;
        if (draggingRef.current === 'min') {
            newMin = Math.min(currentVal, curMax - step);
        } else {
            newMax = Math.max(currentVal, curMin + step);
        }
        valuesRef.current = { min: newMin, max: newMax };
        onChange(newMin, newMax);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (draggingRef.current) {
            draggingRef.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            onAfterChange?.(valuesRef.current.min, valuesRef.current.max);
        }
    };

    const minPercent = Math.max(0, Math.min(100, ((minValue - min) / (max - min)) * 100));
    const maxPercent = Math.max(0, Math.min(100, ((maxValue - min) / (max - min)) * 100));

    return (
        <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-10 flex items-center cursor-pointer touch-none select-none py-2"
        >
            {/* Base Gray Track */}
            <div className="w-full h-2 bg-gray-200 rounded-full pointer-events-none" />

            {/* Active Filled Brand Color Track */}
            <div
                className="absolute h-2 bg-[#009E49] rounded-full pointer-events-none"
                style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                }}
            />

            {/* Min Thumb */}
            <div
                role="slider"
                aria-valuenow={minValue}
                aria-label="Minimum price"
                className="absolute w-6 h-6 -ml-3 bg-[#009E49] rounded-full border-[3.5px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-125 transition-transform pointer-events-none z-10"
                style={{ left: `${minPercent}%` }}
            />

            {/* Max Thumb */}
            <div
                role="slider"
                aria-valuenow={maxValue}
                aria-label="Maximum price"
                className="absolute w-6 h-6 -ml-3 bg-[#009E49] rounded-full border-[3.5px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-125 transition-transform pointer-events-none z-10"
                style={{ left: `${maxPercent}%` }}
            />
        </div>
    );
};

export const Shop: React.FC<ShopProps> = ({ products, categories, brands, filters }) => {
    const safeFilters = (Array.isArray(filters) || !filters) ? {} : filters;
    const DEFAULT_MAX_PRICE = 5000;
    const [minPrice, setMinPrice] = useState(safeFilters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(safeFilters.max_price || '');
    const [sliderMin, setSliderMin] = useState<number>(Number(safeFilters.min_price) || 0);
    const [sliderMax, setSliderMax] = useState<number>(Number(safeFilters.max_price) || DEFAULT_MAX_PRICE);
    const [selectedSort, setSelectedSort] = useState(safeFilters.sort || 'default');

    React.useEffect(() => {
        setSliderMin(Number(safeFilters.min_price) || 0);
        setSliderMax(Number(safeFilters.max_price) || DEFAULT_MAX_PRICE);
        setMinPrice(safeFilters.min_price || '');
        setMaxPrice(safeFilters.max_price || '');
    }, [safeFilters.min_price, safeFilters.max_price]);

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
        setSliderMin(0);
        setSliderMax(DEFAULT_MAX_PRICE);
        setSelectedSort('default');
        router.visit(route('shop'));
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Categories Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-[#009E49] rounded-full" />
                        <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wider font-bangla">
                            ক্যাটাগরি
                        </h3>
                    </div>
                    {safeFilters.category && (
                        <button 
                            onClick={() => {
                                const newFilters = { ...safeFilters };
                                delete newFilters.category;
                                router.visit(route('shop', newFilters));
                            }}
                            className="text-xs font-bold text-red-500 hover:underline font-bangla cursor-pointer"
                        >
                            রিমুভ
                        </button>
                    )}
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1.5">
                    {/* All Categories Option */}
                    <Link
                        href={route('shop', { ...safeFilters, category: undefined })}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[14.5px] sm:text-[15.5px] font-medium transition-all ${
                            !safeFilters.category
                                ? 'bg-emerald-50 text-[#009E49] font-bold border border-emerald-200/70 shadow-2xs'
                                : 'text-gray-800 hover:bg-gray-50 hover:text-[#009E49]'
                        }`}
                    >
                        <span className="flex items-center gap-2.5 truncate font-bangla">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${!safeFilters.category ? 'bg-[#009E49]' : 'bg-transparent'}`} />
                            সব ক্যাটাগরি
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-latin shrink-0 ${
                            !safeFilters.category
                                ? 'bg-[#009E49] text-white'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100/60 group-hover:text-[#009E49]'
                        }`}>
                            {products.total}
                        </span>
                    </Link>

                    {categories.map(cat => {
                        const isActive = safeFilters.category === cat.slug;
                        return (
                            <Link 
                                key={cat.id} 
                                href={route('shop', { ...safeFilters, category: cat.slug })}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[14.5px] sm:text-[15.5px] font-medium transition-all ${
                                    isActive
                                        ? 'bg-emerald-50 text-[#009E49] font-bold border border-emerald-200/70 shadow-2xs'
                                        : 'text-gray-800 hover:bg-gray-50 hover:text-[#009E49]'
                                }`}
                            >
                                <span className="flex items-center gap-2.5 truncate font-bangla">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#009E49]' : 'bg-gray-300 group-hover:bg-[#009E49]'}`} />
                                    {cat.icon && <span className="text-base shrink-0">{cat.icon}</span>}
                                    <span className="truncate">{cat.name}</span>
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-latin shrink-0 ${
                                    isActive 
                                        ? 'bg-[#009E49] text-white' 
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100/60 group-hover:text-[#009E49]'
                                }`}>
                                    {cat.products_count}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Brands Section */}
            <div className="border-t border-gray-150 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-[#009E49] rounded-full" />
                        <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wider font-bangla">
                            ব্র্যান্ড
                        </h3>
                    </div>
                    {safeFilters.brand && (
                        <button 
                            onClick={() => {
                                const newFilters = { ...safeFilters };
                                delete newFilters.brand;
                                router.visit(route('shop', newFilters));
                            }}
                            className="text-xs font-bold text-red-500 hover:underline font-bangla cursor-pointer"
                        >
                            রিমুভ
                        </button>
                    )}
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1.5">
                    {brands.map(brand => {
                        const isActive = safeFilters.brand === brand.slug;
                        return (
                            <Link 
                                key={brand.id} 
                                href={route('shop', { ...safeFilters, brand: brand.slug })}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[14.5px] sm:text-[15.5px] font-medium transition-all ${
                                    isActive
                                        ? 'bg-emerald-50 text-[#009E49] font-bold border border-emerald-200/70 shadow-2xs'
                                        : 'text-gray-800 hover:bg-gray-50 hover:text-[#009E49]'
                                }`}
                            >
                                <span className="flex items-center gap-2.5 truncate font-bangla">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#009E49]' : 'bg-gray-300 group-hover:bg-[#009E49]'}`} />
                                    <span className="truncate">{brand.name}</span>
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-latin shrink-0 ${
                                    isActive 
                                        ? 'bg-[#009E49] text-white' 
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100/60 group-hover:text-[#009E49]'
                                }`}>
                                    {brand.products_count}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Price Range Section Matching Reference Image */}
            <div className="border-t border-gray-150 pt-4">
                {/* Header matching Reference Image 1 with title, minus icon, and accent line */}
                <div className="relative pb-2 mb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider font-latin">
                            PRICE RANGE
                        </h3>
                        <span className="text-gray-400 font-bold select-none text-base">—</span>
                    </div>
                    {/* Brand Color Underline Bar */}
                    <div className="absolute -bottom-[1px] left-0 h-[3px] w-14 bg-[#009E49] rounded-full" />
                </div>

                {/* Price Display Labels Row matching Reference Image */}
                <div className="flex justify-between items-center text-sm sm:text-base font-bold text-gray-900 font-latin pt-1 mb-3">
                    <span className="bg-gray-100/80 px-2 py-0.5 rounded text-gray-800">
                        ৳ {sliderMin.toLocaleString()}
                    </span>
                    <span className="bg-gray-100/80 px-2 py-0.5 rounded text-gray-800">
                        ৳ {sliderMax.toLocaleString()}
                    </span>
                </div>

                {/* Dual Interactive Range Slider matching Reference Image Track & Thumbs */}
                <div className="mb-2">
                    <DualRangeSlider
                        min={0}
                        max={DEFAULT_MAX_PRICE}
                        step={50}
                        minValue={sliderMin}
                        maxValue={sliderMax}
                        onChange={(newMin, newMax) => {
                            setSliderMin(newMin);
                            setSliderMax(newMax);
                            setMinPrice(newMin > 0 ? String(newMin) : '');
                            setMaxPrice(newMax < DEFAULT_MAX_PRICE ? String(newMax) : '');
                        }}
                        onAfterChange={(finalMin, finalMax) => {
                            applyFilters({
                                min_price: finalMin > 0 ? finalMin : '',
                                max_price: finalMax < DEFAULT_MAX_PRICE ? finalMax : '',
                            });
                        }}
                    />
                </div>

                {/* Filter Action Buttons */}
                <div className="flex gap-2 pt-1 font-bangla">
                    <Button 
                        onClick={() => applyFilters({ min_price: sliderMin > 0 ? sliderMin : '', max_price: sliderMax < DEFAULT_MAX_PRICE ? sliderMax : '' })} 
                        size="sm" 
                        className="flex-1 bg-[#009E49] hover:bg-[#008038] text-white h-9 text-xs sm:text-sm font-bold rounded-md shadow-xs active:scale-95 transition-all border-none cursor-pointer"
                    >
                        ফিল্টার করুন
                    </Button>
                    {(sliderMin > 0 || sliderMax < DEFAULT_MAX_PRICE || safeFilters.min_price || safeFilters.max_price) && (
                        <Button 
                            onClick={() => {
                                setSliderMin(0);
                                setSliderMax(DEFAULT_MAX_PRICE);
                                setMinPrice('');
                                setMaxPrice('');
                                applyFilters({ min_price: '', max_price: '' });
                            }} 
                            size="sm" 
                            variant="outline" 
                            className="h-9 px-3 text-xs sm:text-sm font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 rounded-md transition-all cursor-pointer"
                        >
                            রিসেট
                        </Button>
                    )}
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
                            <SheetContent side="left" className="bg-white p-5 overflow-y-auto w-[85vw] max-w-xs">
                                <SheetHeader className="pb-3 border-b border-gray-150">
                                    <SheetTitle className="text-left font-black text-base flex items-center justify-between font-bangla">
                                        <span className="flex items-center gap-1.5 text-gray-900">
                                            <Filter className="w-4 h-4 text-[#009E49]" />
                                            ফিল্টার প্রোডাক্ট
                                        </span>
                                        {(safeFilters.category || safeFilters.brand || safeFilters.min_price || safeFilters.max_price) && (
                                            <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline cursor-pointer">ক্লিয়ার করুন</button>
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
                            <SelectTrigger className="flex-1 sm:w-[205px] h-10 text-xs sm:text-sm border border-gray-200 hover:border-[#009E49]/60 focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/15 rounded-md bg-white shadow-2xs font-bold text-gray-800 transition-all cursor-pointer font-bangla px-3 gap-2">
                                <div className="flex items-center gap-1.5 truncate">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#009E49] shrink-0 stroke-[2.2]" />
                                    <SelectValue placeholder="সাজান" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white/98 backdrop-blur-md rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-gray-200/90 p-1.5 min-w-[205px] font-bangla z-50">
                                <SelectItem value="default" className="text-xs sm:text-sm py-2 px-2.5 rounded-md font-medium cursor-pointer">
                                    ডিফল্ট
                                </SelectItem>
                                <SelectItem value="price_low_high" className="text-xs sm:text-sm py-2 px-2.5 rounded-md font-medium cursor-pointer">
                                    মূল্য: কম থেকে বেশি
                                </SelectItem>
                                <SelectItem value="price_high_low" className="text-xs sm:text-sm py-2 px-2.5 rounded-md font-medium cursor-pointer">
                                    মূল্য: বেশি থেকে কম
                                </SelectItem>
                                <SelectItem value="newest" className="text-xs sm:text-sm py-2 px-2.5 rounded-md font-medium cursor-pointer">
                                    নতুন প্রোডাক্টস
                                </SelectItem>
                                <SelectItem value="best_selling" className="text-xs sm:text-sm py-2 px-2.5 rounded-md font-medium cursor-pointer">
                                    সেরা বিক্রিত
                                </SelectItem>
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
