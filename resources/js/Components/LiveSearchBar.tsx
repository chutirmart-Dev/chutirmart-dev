import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { trackSearch } from '@/lib/gtm';
import { Search, X, Loader2, TrendingUp, Clock, ArrowRight, Tag, ShoppingBag, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface SuggestedProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    discounted_price: number;
    discount_percentage: number;
    in_stock: boolean;
    category?: string;
    image: string;
    url: string;
}

interface SuggestedCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
    url: string;
}

interface SearchApiResponse {
    products?: SuggestedProduct[] | Record<string, SuggestedProduct>;
    related_products?: SuggestedProduct[] | Record<string, SuggestedProduct>;
    categories?: SuggestedCategory[] | Record<string, SuggestedCategory>;
    query?: string;
    is_popular?: boolean;
}

interface LiveSearchBarProps {
    className?: string;
    inputClassName?: string;
    mobileMode?: boolean;
    onCloseMobile?: () => void;
}

const POPULAR_SEARCH_TERMS = [
    'Search in ChutirMart...',
    'Smart Watch',
    'Mini Fan',
    'Water Spray Gun',
    'Kitchen Storage',
    'Spice Jar',
    'Nebulizer'
];

const RECENT_SEARCHES_KEY = 'chutirmart_recent_searches';

/**
 * Safely convert any value (array, object or undefined) to a typed array
 */
const toSafeArray = <T,>(val: any): T[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') return Object.values(val) as T[];
    return [];
};

/**
 * Resolve the search suggestion API endpoint across all environments
 * (e.g. root domain, XAMPP subfolder /chutirmart/public, port 8000, etc.)
 */
const getSearchSuggestUrl = (searchTerm: string): string => {
    try {
        if (typeof route === 'function') {
            return route('api.search.suggest', { q: searchTerm });
        }
    } catch {
        // Continue to fallback
    }

    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const match = path.match(/^(.*?\/public)/);
    const basePath = match ? match[1] : '';
    return `${basePath}/api/search-suggest?q=${encodeURIComponent(searchTerm)}`;
};

export const LiveSearchBar: React.FC<LiveSearchBarProps> = ({
    className = '',
    inputClassName = '',
    mobileMode = false,
    onCloseMobile
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchApiResponse | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    // Dynamic rotating placeholder
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = ['Search in Chutir Mart...', 'Smart Watch...', 'Mini Fan...', '12 Pcs Spice Jar...', 'Kitchen Rack...'];

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const cacheRef = useRef<Map<string, SearchApiResponse>>(new Map());

    // Safe normalized lists derived from results
    const directProducts = toSafeArray<SuggestedProduct>(results?.products);
    const relatedProducts = toSafeArray<SuggestedProduct>(results?.related_products);
    const categoriesList = toSafeArray<SuggestedCategory>(results?.categories);
    const allProductsList = [...directProducts, ...relatedProducts];

    const hasDirectProducts = directProducts.length > 0;
    const hasRelatedProducts = relatedProducts.length > 0;
    const hasCategories = categoriesList.length > 0;
    const isShowingPopular = Boolean(results?.is_popular && !query.trim());

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed.slice(0, 6));
                }
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    // Save term to recent searches
    const saveRecentSearch = (term: string) => {
        const clean = term.trim();
        if (!clean) return;
        try {
            const filtered = [clean, ...recentSearches.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
            setRecentSearches(filtered);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
        } catch {
            // Ignore quota errors
        }
    };

    // Clear recent searches
    const clearRecentSearches = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch {
            // Ignore
        }
    };

    // Cycle placeholder terms
    useEffect(() => {
        if (query) return;
        const interval = setInterval(() => {
            setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
        }, 3200);
        return () => clearInterval(interval);
    }, [query, placeholders.length]);

    // Handle outside click to dismiss dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perform Fast Debounced API Query
    const fetchSuggestions = useCallback(async (searchTerm: string) => {
        const trimmed = searchTerm.trim();

        // Check local client-side memory cache first (0ms latency)
        if (cacheRef.current.has(trimmed)) {
            setResults(cacheRef.current.get(trimmed)!);
            setIsLoading(false);
            setIsOpen(true);
            return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsLoading(true);

        try {
            const endpoint = getSearchSuggestUrl(trimmed);
            const response = await axios.get(endpoint, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data: SearchApiResponse = response.data || {};
            cacheRef.current.set(trimmed, data);
            setResults(data);
            setIsOpen(true);
        } catch (error: any) {
            if (!axios.isCancel(error) && error?.name !== 'AbortError' && error?.name !== 'CanceledError') {
                console.error('Search suggestion error:', error);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
            }
        }
    }, []);

    // Debounce query changes (150ms for ultra-responsive feel)
    useEffect(() => {
        const trimmed = query.trim();

        if (!trimmed) {
            setSelectedIndex(-1);
            if (isOpen) {
                fetchSuggestions('');
            }
            return;
        }

        setSelectedIndex(-1);
        const timer = setTimeout(() => {
            fetchSuggestions(trimmed);
        }, 150);

        return () => clearTimeout(timer);
    }, [query, isOpen, fetchSuggestions]);

    // Navigate to full search results page
    const executeSearch = (searchTerm: string) => {
        const clean = searchTerm.trim();
        if (!clean) return;
        trackSearch(clean);
        saveRecentSearch(clean);
        setIsOpen(false);
        if (onCloseMobile) onCloseMobile();
        router.visit(route('shop', { q: clean }));
    };

    // Navigate directly to product page
    const navigateToProduct = (product: SuggestedProduct) => {
        saveRecentSearch(product.name);
        setIsOpen(false);
        if (onCloseMobile) onCloseMobile();
        router.visit(product.url);
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIndex >= 0 && allProductsList[selectedIndex]) {
            navigateToProduct(allProductsList[selectedIndex]);
        } else if (query.trim()) {
            executeSearch(query);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setIsOpen(true);
                return;
            }
        }

        const count = allProductsList.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < count - 1 ? prev + 1 : -1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > -1 ? prev - 1 : count - 1));
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    // Highlight matching tokens in product title
    const renderHighlightedName = (name: string, highlight: string) => {
        if (!highlight.trim()) return name;
        const words = highlight
            .trim()
            .split(/[\s\-_,.]+/)
            .filter(w => w.length >= 2)
            .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        if (words.length === 0) return name;

        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        const parts = name.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className="text-[#009E49] font-black bg-emerald-50/90 px-0.5 rounded">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    // Render single product row
    const renderProductItem = (product: SuggestedProduct, globalIdx: number, isRelated = false) => {
        const isSelected = selectedIndex === globalIdx;
        const hasDiscount = product.discount_percentage > 0 && product.discounted_price < product.price;

        return (
            <div
                key={`${product.id}-${globalIdx}`}
                onClick={() => navigateToProduct(product)}
                onMouseEnter={() => setSelectedIndex(globalIdx)}
                className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-[#009E49] pl-2.5'
                        : 'hover:bg-gray-50/90'
                }`}
            >
                {/* Thumbnail Image */}
                <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100 relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={e => {
                            (e.target as HTMLImageElement).src = '/storage/defaults/default-product.png';
                        }}
                    />
                    {hasDiscount && (
                        <span className="absolute top-0 right-0 bg-[#E2231A] text-white text-[8px] font-black px-1 rounded-bl">
                            -{product.discount_percentage}%
                        </span>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate leading-snug">
                        {renderHighlightedName(product.name, query)}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        {/* Category */}
                        {product.category && (
                            <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                                {product.category}
                            </span>
                        )}

                        {/* Stock Badge */}
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${
                            product.in_stock ? 'text-[#009E49]' : 'text-red-500'
                        }`}>
                            {product.in_stock ? (
                                <>
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    স্টকে আছে
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    স্টক আউট
                                </>
                            )}
                        </span>

                        {isRelated && (
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                                সম্পর্কিত
                            </span>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-[#009E49]">
                        ৳{product.discounted_price}
                    </div>
                    {hasDiscount && (
                        <div className="text-[10px] text-gray-400 line-through">
                            ৳{product.price}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input Form Bar - Styled to exact user screenshot with branding green */}
            <form 
                onSubmit={handleSubmit} 
                className={`relative flex items-center w-full bg-white border-2 border-[#009E49] rounded-lg p-1 shadow-xs transition-all duration-200 focus-within:ring-2 focus-within:ring-[#009E49]/20 ${
                    mobileMode ? 'h-11' : 'h-[50px]'
                }`}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsOpen(true);
                        if (!results) {
                            fetchSuggestions(query);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholders[placeholderIndex]}
                    autoComplete="off"
                    spellCheck={false}
                    className={`flex-1 min-w-0 bg-transparent px-3 text-gray-900 placeholder:text-gray-400 outline-none border-none focus:outline-none focus:ring-0 ${
                        mobileMode ? 'text-xs' : 'text-[15px]'
                    } ${inputClassName}`}
                />

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1 h-full">
                    {/* Clear Button */}
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setSelectedIndex(-1);
                                inputRef.current?.focus();
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="px-1.5">
                            <Loader2 className="w-4 h-4 animate-spin text-[#009E49]" />
                        </div>
                    )}

                    {/* Rectangular Green Search Button matching screenshot */}
                    <button
                        type="submit"
                        aria-label="Search"
                        className="bg-[#009E49] hover:bg-[#007F3B] text-white px-5 sm:px-6 h-full rounded-md font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-xs shrink-0 select-none cursor-pointer"
                    >
                        <Search className="w-4 h-4 stroke-[2.5]" />
                        <span className="font-latin tracking-wide">Search</span>
                    </button>
                </div>
            </form>

            {/* Live Suggestion Dropdown */}
            {isOpen && (
                <div 
                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.04)] border border-gray-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{ minWidth: mobileMode ? '100%' : '400px' }}
                >
                    <div className="max-h-[75vh] md:max-h-[480px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                        
                        {/* Section A: Recent & Popular Searches when query is empty */}
                        {!query.trim() && (
                            <div className="p-3.5 space-y-3">
                                {recentSearches.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2 px-1">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                সাম্প্রতিক অনুসন্ধান
                                            </span>
                                            <button
                                                type="button"
                                                onClick={clearRecentSearches}
                                                className="text-[11px] text-gray-400 hover:text-red-500 font-normal transition-colors"
                                            >
                                                মুছে ফেলুন
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {recentSearches.map((term, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => {
                                                        setQuery(term);
                                                        executeSearch(term);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 hover:bg-emerald-50 hover:text-[#009E49] text-gray-700 text-xs rounded-full border border-gray-100 transition-colors"
                                                >
                                                    <span>{term}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2 px-1">
                                        <TrendingUp className="w-3.5 h-3.5 text-[#009E49]" />
                                        জনপ্রিয় সার্চ (Trending Searches)
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {POPULAR_SEARCH_TERMS.map((term, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setQuery(term);
                                                    executeSearch(term);
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 hover:bg-emerald-50 hover:text-[#009E49] text-gray-700 text-xs rounded-full border border-gray-100 transition-colors"
                                            >
                                                <span>{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section B: Matching Categories */}
                        {hasCategories && (
                            <div className="p-3 bg-[#FAF9F5]">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5 px-1">
                                    <Tag className="w-3 h-3 text-[#009E49]" />
                                    ক্যাটাগরি সমূহ
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categoriesList.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setIsOpen(false);
                                                if (onCloseMobile) onCloseMobile();
                                                router.visit(cat.url);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-[#009E49] text-gray-800 text-xs font-semibold rounded-lg border border-gray-200 shadow-2xs transition-all group"
                                        >
                                            <span>{cat.name}</span>
                                            {cat.count > 0 && (
                                                <span className="text-[10px] text-gray-400 group-hover:text-[#009E49]">
                                                    ({cat.count})
                                                </span>
                                            )}
                                            <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#009E49] transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section C: Loading State in Dropdown */}
                        {isLoading && !hasDirectProducts && !hasRelatedProducts && (
                            <div className="p-8 text-center space-y-2">
                                <Loader2 className="w-6 h-6 animate-spin text-[#009E49] mx-auto" />
                                <div className="text-xs text-gray-500 font-medium">পণ্য খোঁজা হচ্ছে...</div>
                            </div>
                        )}

                        {/* Section D: Direct / Exact Matching Products */}
                        {hasDirectProducts && (
                            <div className="py-2">
                                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <ShoppingBag className="w-3.5 h-3.5 text-[#009E49]" />
                                        {isShowingPopular ? 'জনপ্রিয় পণ্য সমূহ' : `পণ্য সমূহ (${directProducts.length})`}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-normal">
                                        ক্লিক করে বিস্তারিত দেখুন
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {directProducts.map((product, idx) =>
                                        renderProductItem(product, idx, false)
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section E: Related Products (সম্পর্কিত পণ্য) */}
                        {query.trim() && hasRelatedProducts && (
                            <div className="py-2 bg-gray-50/50">
                                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    সম্পর্কিত পণ্য সমূহ (Related Products)
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {relatedProducts.map((product, idx) =>
                                        renderProductItem(
                                            product,
                                            directProducts.length + idx,
                                            true
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section F: Absolute Fallback Empty State */}
                        {!isLoading && query.trim() && !hasDirectProducts && !hasRelatedProducts && !hasCategories && (
                            <div className="p-6 text-center space-y-2">
                                <div className="w-10 h-10 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-bold text-gray-700">
                                    "{query}" এর জন্য সরাসরি কোনো পণ্য পাওয়া যায়নি
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    ভিন্ন কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন বা সব পণ্য ব্রাউজ করুন।
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Section G: Dropdown Footer / View All Link */}
                    {query.trim() && (
                        <div 
                            onClick={() => executeSearch(query)}
                            className="bg-gray-50 hover:bg-emerald-50 px-4 py-2.5 border-t border-gray-100 flex items-center justify-between cursor-pointer transition-colors group"
                        >
                            <span className="text-xs font-bold text-[#009E49] flex items-center gap-1.5 group-hover:underline">
                                <Search className="w-3.5 h-3.5" />
                                "{query}" এর সব ফলাফল দেখুন
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                Enter চাপুন <ArrowRight className="w-3 h-3 text-[#009E49] group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
