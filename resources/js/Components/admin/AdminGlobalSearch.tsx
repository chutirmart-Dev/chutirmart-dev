import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    Search,
    X,
    Loader2,
    ShoppingCart,
    Package,
    Users,
    ArrowRight,
    Compass,
    Tag,
    FolderTree,
    Truck,
    Settings,
    Plus,
    LayoutDashboard,
    Layers,
    Image,
    MessageSquare,
    HelpCircle,
    SlidersHorizontal,
    Star,
    Hash,
    PlusCircle,
    CornerDownLeft,
} from 'lucide-react';
import { StatusPill } from './ui';

interface SearchOrder {
    id: number;
    order_number: string;
    customer_name: string;
    mobile: string;
    total: number;
    status: string;
    payment_status: string;
    date: string;
    url: string;
}

interface SearchProduct {
    id: number;
    name: string;
    product_code: string;
    price: string | number;
    stock: number;
    status: string;
    image: string | null;
    url: string;
}

interface SearchCustomer {
    id: number | null;
    name: string;
    mobile: string;
    email: string | null;
    district: string | null;
    orders_count: number;
    url: string;
}

interface SearchPage {
    title: string;
    route: string;
    icon: string;
    category?: string;
    badge?: string;
}

interface SearchResults {
    orders: SearchOrder[];
    products: SearchProduct[];
    customers: SearchCustomer[];
    pages: SearchPage[];
}

const PAGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
    LayoutDashboard,
    Package,
    Plus,
    FolderTree,
    Tag,
    Hash,
    SlidersHorizontal,
    Star,
    ShoppingCart,
    PlusCircle,
    Users,
    Image,
    Layers,
    Truck,
    Settings,
    MessageSquare,
    HelpCircle,
    Compass,
};

export const AdminGlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResults>({
        orders: [],
        products: [],
        customers: [],
        pages: [],
    });
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Global keyboard shortcut: Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perform Search API request
    const performSearch = useCallback(async (searchQuery: string) => {
        const trimmed = searchQuery.trim();
        setIsLoading(true);

        try {
            let searchUrl = '/admin/api/search';
            try {
                if (typeof route === 'function') {
                    searchUrl = route('admin.api.search');
                }
            } catch (e) {
                // fallback for non-ziggy contexts
            }

            const res = await fetch(`${searchUrl}?q=${encodeURIComponent(trimmed)}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (res.ok) {
                const data = await res.json();
                setResults({
                    orders: Array.isArray(data.orders) ? data.orders : [],
                    products: Array.isArray(data.products) ? data.products : [],
                    customers: Array.isArray(data.customers) ? data.customers : [],
                    pages: Array.isArray(data.pages) ? data.pages : [],
                });
                setSelectedIndex(-1);
            }
        } catch (err) {
            console.error('Admin search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            performSearch(val);
        }, 160);
    };

    // Flatten all navigable items for arrow key navigation
    const allNavigableItems = [
        ...results.pages.map(p => ({ type: 'page', title: p.title, url: p.route })),
        ...results.orders.map(o => ({ type: 'order', title: o.order_number, url: o.url })),
        ...results.products.map(p => ({ type: 'product', title: p.name, url: p.url })),
        ...results.customers.map(c => ({ type: 'customer', title: c.name, url: c.url })),
    ];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || allNavigableItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < allNavigableItems.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : allNavigableItems.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < allNavigableItems.length) {
                navigateTo(allNavigableItems[selectedIndex].url);
            } else if (allNavigableItems.length > 0) {
                navigateTo(allNavigableItems[0].url);
            }
        }
    };

    const navigateTo = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.visit(url);
    };

    const totalResultsCount =
        results.orders.length + results.products.length + results.customers.length;

    const hasAnyResults =
        totalResultsCount > 0 || results.pages.length > 0;

    return (
        <div ref={containerRef} className="relative w-full max-w-lg min-w-0">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
                <Search className={`absolute left-3.5 w-4 h-4 transition-colors duration-150 pointer-events-none ${
                    isOpen ? 'text-[#009E49]' : 'text-slate-400'
                }`} />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        if (!query.trim() && results.pages.length === 0) {
                            performSearch('');
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search orders, products, customers... (Ctrl + K)"
                    className={`w-full h-10 pl-10 pr-20 rounded-lg border text-[13px] transition-all duration-150 ${
                        isOpen
                            ? 'bg-white border-[#009E49] ring-2 ring-[#009E49]/15 shadow-sm text-slate-800'
                            : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                    } placeholder-slate-400 focus:outline-none`}
                />

                {/* Right controls: Loading / Clear / Shortcut hint */}
                <div className="absolute right-2.5 flex items-center gap-1.5">
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#009E49] animate-spin" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                performSearch('');
                                inputRef.current?.focus();
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition-colors"
                            title="Clear search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                            <span className="text-[11px]">⌘</span>K
                        </kbd>
                    )}
                </div>
            </div>

            {/* Floating Results Popover */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-[75vh] flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    {/* Header info */}
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>
                            {query.trim()
                                ? `Results for "${query}" (${totalResultsCount} found)`
                                : '⚡ Quick Jump & Navigation'}
                        </span>
                        <span className="text-[10.5px] text-slate-400 hidden sm:inline">
                            [↑↓ Navigate] [↵ Select] [Esc Close]
                        </span>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto p-2 space-y-3.5 divide-y divide-slate-100">
                        {/* 1. Quick Pages / Navigation Matches */}
                        {results.pages.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Navigation</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    {results.pages.map((page, idx) => {
                                        const IconComp = PAGE_ICONS[page.icon] || Compass;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => navigateTo(page.route)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[12.5px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#009E49] transition-colors border-none cursor-pointer group"
                                            >
                                                <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-[#009E49] flex items-center justify-center shrink-0 transition-colors">
                                                    <IconComp className="w-4 h-4" />
                                                </div>
                                                <span className="truncate">{page.title}</span>
                                                {page.badge && (
                                                    <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {page.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. Orders Section */}
                        {results.orders.length > 0 && (
                            <div className="pt-2 space-y-1">
                                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Orders ({results.orders.length})</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigateTo(`/admin/orders?q=${encodeURIComponent(query)}`)}
                                        className="text-[11px] text-[#009E49] hover:underline border-none bg-transparent cursor-pointer font-bold flex items-center gap-0.5"
                                    >
                                        View all <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {results.orders.map(order => (
                                        <button
                                            key={order.id}
                                            type="button"
                                            onClick={() => navigateTo(order.url)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors border-none text-left cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="font-mono text-xs font-bold text-[#009E49] bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60 shrink-0">
                                                    #{order.order_number}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#009E49] transition-colors">
                                                        {order.customer_name}
                                                    </div>
                                                    <div className="text-[11.5px] text-slate-400 font-mono">
                                                        {order.mobile} {order.date && `• ${order.date}`}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 ml-2">
                                                <div className="text-right">
                                                    <div className="text-[13px] font-black text-slate-800">
                                                        ৳{order.total}
                                                    </div>
                                                    <div className="mt-0.5">
                                                        <StatusPill status={order.status} />
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#009E49] group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Products Section */}
                        {results.products.length > 0 && (
                            <div className="pt-2 space-y-1">
                                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Products ({results.products.length})</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigateTo(`/admin/products?q=${encodeURIComponent(query)}`)}
                                        className="text-[11px] text-[#009E49] hover:underline border-none bg-transparent cursor-pointer font-bold flex items-center gap-0.5"
                                    >
                                        View all <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {results.products.map(product => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => navigateTo(product.url)}
                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border-none text-left cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                                                        onError={e => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#009E49] transition-colors">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-[11.5px] text-slate-400 font-mono">
                                                        {product.product_code || 'No SKU'} • Stock: {product.stock}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 shrink-0 ml-2">
                                                <div className="text-right">
                                                    <div className="text-[13px] font-black text-slate-800">
                                                        ৳{product.price}
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        product.stock > 0
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-rose-50 text-rose-700'
                                                    }`}>
                                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#009E49] group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Customers Section */}
                        {results.customers.length > 0 && (
                            <div className="pt-2 space-y-1">
                                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Customers ({results.customers.length})</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigateTo(`/admin/customers?q=${encodeURIComponent(query)}`)}
                                        className="text-[11px] text-[#009E49] hover:underline border-none bg-transparent cursor-pointer font-bold flex items-center gap-0.5"
                                    >
                                        View all <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {results.customers.map((customer, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => navigateTo(customer.url)}
                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border-none text-left cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                    {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#009E49] transition-colors">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-[11.5px] text-slate-400 font-mono">
                                                        {customer.mobile} {customer.district && `• ${customer.district}`}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 shrink-0 ml-2">
                                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    {customer.orders_count} orders
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#009E49] group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && query.trim() && !hasAnyResults && (
                            <div className="py-10 text-center px-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <h4 className="text-[14px] font-bold text-slate-700">
                                    "{query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    অনুগ্রহ করে সঠিক অর্ডার নম্বর (#CHU-...), কাস্টমার নাম, মোবাইল নম্বর বা পণ্যের নাম দিয়ে চেষ্টা করুন।
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer bar */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>ChutirMart Dashboard Global Search</span>
                        <span className="flex items-center gap-1 font-mono">
                            Press <CornerDownLeft className="w-3 h-3 inline" /> to open
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
