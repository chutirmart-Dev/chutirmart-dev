import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid, ShoppingBag, Package, Users,
    Store, Image as ImageIcon, MessageSquare, Zap, HelpCircle,
    Settings, LogOut, Bell, ChevronDown, ChevronRight,
    Menu, X, Search, Globe, ShieldCheck, Tag,
    Layers, Truck, ArrowUpRight, ChevronsLeft, ChevronsRight,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { AdminGlobalSearch } from '@/components/admin/AdminGlobalSearch';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { auth, store_settings, flash } = usePage().props as any;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    /* ── Initial Expanded Menu Helper (Synchronous on mount) ── */
    const getInitialExpandedMenu = (currentUrl?: string): string | null => {
        const rawUrl = currentUrl || (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '');
        const [pathPart] = rawUrl.split('?');
        const adminIndex = pathPart.indexOf('/admin');
        let rel = adminIndex !== -1 ? pathPart.slice(adminIndex + 6) : pathPart;
        rel = rel.replace(/\/$/, '');
        if (!rel || rel === '') rel = '/';

        if (['/settings', '/banners', '/landing-pages'].some(p => rel === p || rel.startsWith(p + '/'))) {
            return 'store';
        }
        if (['/products', '/categories', '/brands', '/tags', '/attributes', '/reviews'].some(p => rel === p || rel.startsWith(p + '/'))) {
            return 'products';
        }
        if (rel === '/orders' || rel.startsWith('/orders/')) {
            return 'orders';
        }
        return null;
    };

    const [expandedMenu, setExpandedMenu] = useState<string | null>(() => getInitialExpandedMenu(url));
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // ── Collapsible Mini Sidebar State (persisted in localStorage) ──────────
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('admin_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    interface NavSubItem {
        label: string;
        key: string;
        route: string;
    }

    interface NavItem {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        key: string;
        route?: string;
        defaultRoute?: string;
        submenu?: NavSubItem[];
    }

    interface NavSection {
        group: string;
        items: NavItem[];
    }

    /* ── Normalized Relative Path & Query Helper ─────────────────────── */
    const getNormalizedPath = (): { path: string; params: URLSearchParams } => {
        const rawUrl = url || (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '');
        const [pathPart, queryPart] = rawUrl.split('?');
        const params = new URLSearchParams(queryPart || (typeof window !== 'undefined' ? window.location.search : ''));

        // Strip admin base (works whether running on domain.com/admin or localhost/chutirmart/public/admin)
        const adminIndex = pathPart.indexOf('/admin');
        let rel = adminIndex !== -1 ? pathPart.slice(adminIndex + 6) : pathPart;
        rel = rel.replace(/\/$/, '');
        if (!rel || rel === '') {
            rel = '/';
        }
        return { path: rel, params };
    };

    /* ── Precise Single-Active Item Helper ──────────────────────────────── */
    const isUrlMatch = (itemKey?: string) => {
        const { path } = getNormalizedPath();

        switch (itemKey) {
            case 'dashboard':
                return path === '/' || path === '/dashboard';
            case 'products':
                return ['/products', '/categories', '/brands', '/tags', '/attributes', '/reviews']
                    .some(p => path === p || path.startsWith(p + '/'));
            case 'orders':
                return path === '/orders' || path.startsWith('/orders/');
            case 'customers':
                return path === '/customers' || path.startsWith('/customers/');
            case 'messages':
                return path === '/messages' || path.startsWith('/messages/');
            case 'store':
                return ['/settings', '/banners', '/landing-pages']
                    .some(p => path === p || path.startsWith(p + '/'));
            case 'integrations':
                return path === '/integrations' || path.startsWith('/integrations/');
            case 'help':
                return path === '/help' || path.startsWith('/help/');
            default:
                return false;
        }
    };

    /* ── Helper for Submenu Item Active State ── */
    const isSubmenuActive = (parentKey: string, subKey: string) => {
        const { path, params } = getNormalizedPath();
        const statusParam = params.get('status');

        if (parentKey === 'products') {
            if (subKey === 'all') return path === '/products' || (path.startsWith('/products/') && path !== '/products/create');
            if (subKey === 'create') return path === '/products/create';
            if (subKey === 'categories') return path === '/categories' || path.startsWith('/categories/');
            if (subKey === 'brands') return path === '/brands' || path.startsWith('/brands/');
            if (subKey === 'tags') return path === '/tags' || path.startsWith('/tags/');
            if (subKey === 'attributes') return path === '/attributes' || path.startsWith('/attributes/');
            if (subKey === 'reviews') return path === '/reviews' || path.startsWith('/reviews/');
        }

        if (parentKey === 'orders') {
            if (subKey === 'all') {
                return (path === '/orders' || path === '/orders/all') && (!statusParam || statusParam === 'all');
            }
            if (subKey === 'processing') return path === '/orders/processing' || statusParam === 'processing';
            if (subKey === 'on_hold') return path === '/orders/on_hold' || statusParam === 'on_hold';
            if (subKey === 'complete') return path === '/orders/complete' || statusParam === 'complete';
            if (subKey === 'cancelled') return path === '/orders/cancelled' || statusParam === 'cancelled';
        }

        if (parentKey === 'store') {
            if (subKey === 'settings') return path === '/settings' || path.startsWith('/settings/');
            if (subKey === 'banners') return path === '/banners' || path.startsWith('/banners/');
            if (subKey === 'landing_pages') return path === '/landing-pages' || path.startsWith('/landing-pages/');
        }

        return false;
    };

    useEffect(() => {
        setIsSidebarOpen(false);
        const { path } = getNormalizedPath();

        if (['/products', '/categories', '/brands', '/tags', '/attributes', '/reviews']
                .some(p => path === p || path.startsWith(p + '/'))) {
            setExpandedMenu('products');
        } else if (path === '/orders' || path.startsWith('/orders/')) {
            setExpandedMenu('orders');
        } else if (['/settings', '/banners', '/landing-pages']
                .some(p => path === p || path.startsWith(p + '/'))) {
            setExpandedMenu('store');
        }
    }, [url]);

    const handleLogout = () => router.post(route('admin.logout'));

    const toggleSubmenu = (menu: string) => {
        setExpandedMenu(prev => prev === menu ? null : menu);
    };

    const handleParentClick = (item: NavItem) => {
        const isActive = isUrlMatch(item.key);
        if (!isActive && item.defaultRoute) {
            setExpandedMenu(item.key);
            router.visit(item.defaultRoute);
        } else {
            toggleSubmenu(item.key);
        }
    };

    /* ── Navigation groups ─────────────────────────────────────────────── */
    const navSections: NavSection[] = [
        {
            group: 'MAIN MENU',
            items: [
                {
                    label: 'Dashboard',
                    icon: LayoutGrid,
                    key: 'dashboard',
                    route: route('admin.dashboard'),
                },
                {
                    label: 'Products',
                    icon: Package,
                    key: 'products',
                    defaultRoute: route('admin.products.index'),
                    submenu: [
                        { label: 'All Products', key: 'all',        route: route('admin.products.index') },
                        { label: 'Add Product',  key: 'create',     route: route('admin.products.create') },
                        { label: 'Categories',   key: 'categories', route: route('admin.categories.index') },
                        { label: 'Brands',       key: 'brands',     route: route('admin.brands.index') },
                        { label: 'Tags',         key: 'tags',       route: route('admin.tags.index') },
                        { label: 'Attributes',   key: 'attributes', route: route('admin.attributes.index') },
                        { label: 'Reviews',      key: 'reviews',    route: route('admin.reviews.index') },
                    ],
                },
                {
                    label: 'Orders',
                    icon: ShoppingBag,
                    key: 'orders',
                    defaultRoute: route('admin.orders.index', { status: 'all' }),
                    submenu: [
                        { label: 'All Orders',  key: 'all',        route: route('admin.orders.index', { status: 'all' }) },
                        { label: 'Processing',  key: 'processing', route: route('admin.orders.index', { status: 'processing' }) },
                        { label: 'On Hold',     key: 'on_hold',    route: route('admin.orders.index', { status: 'on_hold' }) },
                        { label: 'Completed',   key: 'complete',   route: route('admin.orders.index', { status: 'complete' }) },
                        { label: 'Cancelled',   key: 'cancelled',  route: route('admin.orders.index', { status: 'cancelled' }) },
                    ],
                },
                {
                    label: 'Customers',
                    icon: Users,
                    key: 'customers',
                    route: route('admin.customers.index'),
                },
                {
                    label: 'Messages',
                    icon: MessageSquare,
                    key: 'messages',
                    route: route('admin.messages.index'),
                },
            ],
        },
        {
            group: 'STORE MANAGEMENT',
            items: [
                {
                    label: 'Store Settings',
                    icon: Store,
                    key: 'store',
                    defaultRoute: route('admin.settings.index'),
                    submenu: [
                        { label: 'General Settings', key: 'settings',      route: route('admin.settings.index') },
                        { label: 'Home Banners',     key: 'banners',       route: route('admin.banners.index') },
                        { label: 'Landing Pages',    key: 'landing_pages', route: route('admin.landing-pages.index') },
                    ],
                },
                {
                    label: 'Integrations',
                    icon: Zap,
                    key: 'integrations',
                    route: route('admin.integrations.index'),
                },
                {
                    label: 'Help Center',
                    icon: HelpCircle,
                    key: 'help',
                    route: route('admin.help.index'),
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#F4F6F9] text-[#1E293B] flex font-sans antialiased w-full max-w-full overflow-x-clip">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ──────────────────────────────────────────────────────────────
             *  Sidebar (Collapsible 240px expanded / 76px mini on desktop)
             * ────────────────────────────────────────────────────────────── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 shadow-xs ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 ${
                    isCollapsed ? 'md:w-[76px]' : 'md:w-[240px]'
                } w-[240px]`}
            >
                
                {/* ── Brand Header (With Mini / Full Toggle) ── */}
                <div className={`border-b border-slate-100 shrink-0 transition-all duration-300 ${
                    isCollapsed ? 'p-3 flex flex-col items-center justify-center' : 'p-4 flex items-center justify-between'
                }`}>
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            <Link href={route('admin.dashboard')} className="group flex items-center justify-center" title={store_settings?.site_name || 'ChutirMart'}>
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#009E49] via-[#00B853] to-[#0FD669] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,158,73,0.3)] group-hover:scale-105 transition-transform">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                            </Link>
                            <button
                                onClick={toggleCollapse}
                                className="w-8 h-8 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-[#009E49] flex items-center justify-center transition-colors cursor-pointer"
                                title="Expand Sidebar"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href={route('admin.dashboard')} className="flex items-center gap-2 group rounded-xl px-2 py-1 transition-colors hover:bg-emerald-50">
                                {store_settings?.site_logo ? (
                                    <img 
                                        src={store_settings.site_logo} 
                                        alt={store_settings.site_name || 'ChutirMart'} 
                                        className="h-9 max-w-[140px] w-auto object-contain" 
                                        onError={e => {
                                            (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#009E49] via-[#00B853] to-[#0FD669] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,158,73,0.3)] group-hover:scale-105 transition-transform">
                                            <ShoppingBag className="w-4.5 h-4.5" />
                                        </div>
                                        <h2 className="text-[15px] font-black text-slate-800 tracking-tight leading-tight">
                                            {store_settings?.site_name || 'ChutirMart'}
                                        </h2>
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={toggleCollapse}
                                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Collapse Sidebar"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* ── Nav Items ── */}
                <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2 py-3 space-y-4' : 'px-3.5 py-4 space-y-5'}`} style={{ scrollbarWidth: 'none' }}>
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx}>
                            {!isCollapsed && section.group && (
                                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                                    {section.group}
                                </p>
                            )}
                            <div className={isCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
                                {section.items.map((item, idx) => {
                                    const IconComponent = item.icon;
                                    const isActive = isUrlMatch(item.key);
                                    const isExpanded = expandedMenu === item.key;
                                    const isHighlighted = isActive || isExpanded;

                                    // ── Collapsed Mini Mode (Icons with Flyout Menus & Tooltips) ──
                                    if (isCollapsed) {
                                        return (
                                            <div key={idx} className="relative group flex items-center justify-center w-full">
                                                {item.submenu ? (
                                                    <button
                                                        onClick={() => handleParentClick(item)}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border-none ${
                                                            isHighlighted
                                                                ? 'bg-[#009E49] text-white shadow-xs'
                                                                : 'text-slate-500 hover:text-[#009E49] hover:bg-emerald-50/80 bg-transparent'
                                                        }`}
                                                        title={item.label}
                                                    >
                                                        <IconComponent className="w-4 h-4 stroke-[2]" />
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={item.route!}
                                                        prefetch
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                                            isActive
                                                                ? 'bg-[#009E49] text-white shadow-xs'
                                                                : 'text-slate-500 hover:text-[#009E49] hover:bg-emerald-50/80'
                                                        }`}
                                                        title={item.label}
                                                    >
                                                        <IconComponent className="w-4 h-4 stroke-[2]" />
                                                    </Link>
                                                )}

                                                {/* Flyout Submenu Popover on Hover (Collapsed Mode) */}
                                                {item.submenu ? (
                                                    <div className="absolute left-full top-0 ml-2 py-2 px-1.5 bg-white border border-slate-200/90 rounded-xl shadow-lg min-w-[185px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-left pointer-events-auto">
                                                        <div className="px-2.5 pb-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                                                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                                                {item.label}
                                                            </p>
                                                            {isHighlighted && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#009E49]" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            {item.submenu.map((sub, subIdx) => {
                                                                const isSubActive = isSubmenuActive(item.key, sub.key);
                                                                return (
                                                                    <Link
                                                                        key={subIdx}
                                                                        href={sub.route}
                                                                        prefetch
                                                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                                                                            isSubActive
                                                                                ? 'bg-[#009E49] text-white font-bold shadow-xs'
                                                                                : 'text-slate-600 hover:text-[#009E49] hover:bg-emerald-50/80'
                                                                        }`}
                                                                    >
                                                                        <span
                                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                                isSubActive ? 'bg-white' : 'bg-slate-300'
                                                                            }`}
                                                                        />
                                                                        <span>{sub.label}</span>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Floating Tooltip (Collapsed Mode) */
                                                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11.5px] font-semibold rounded-md shadow-md whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 pointer-events-none">
                                                        {item.label}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // ── Full Expanded Mode ──
                                    if (item.submenu) {
                                        return (
                                            <div key={idx} className="space-y-0.5">
                                                <div
                                                    onClick={() => handleParentClick(item)}
                                                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] cursor-pointer select-none
                                                        transition-all duration-200 ease-out border ${
                                                        isHighlighted
                                                            ? 'bg-emerald-50 text-[#009E49] font-bold border-emerald-200/80 shadow-2xs'
                                                            : 'text-slate-600 hover:text-[#009E49] hover:bg-emerald-50/50 hover:border-emerald-100/70 border-transparent hover:translate-x-0.5 font-medium'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <IconComponent
                                                            className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                                                                isHighlighted ? 'text-[#009E49]' : 'text-slate-400 group-hover:text-[#009E49]'
                                                            }`}
                                                        />
                                                        <span className="tracking-tight">{item.label}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSubmenu(item.key);
                                                        }}
                                                        className={`p-1 rounded-md transition-colors duration-200 cursor-pointer border-none bg-transparent ${
                                                            isHighlighted
                                                                ? 'text-[#009E49] hover:bg-emerald-100/60'
                                                                : 'text-slate-400 hover:bg-slate-200/60 group-hover:text-[#009E49]'
                                                        }`}
                                                        title={isExpanded ? 'Collapse menu' : 'Expand menu'}
                                                    >
                                                        <ChevronRight
                                                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-out ${
                                                                isExpanded ? 'rotate-90' : 'rotate-0'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Smooth CSS Grid Accordion */}
                                                <div
                                                    className={`grid transition-all duration-300 ease-in-out ${
                                                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                                                    }`}
                                                >
                                                    <div className="overflow-hidden">
                                                        <div className="ml-3.5 pl-3 border-l-2 border-emerald-100/90 space-y-1 py-1 my-0.5">
                                                            {item.submenu.map((sub, subIdx) => {
                                                                const isSubActive = isSubmenuActive(item.key, sub.key);
                                                                return (
                                                                    <Link
                                                                        key={subIdx}
                                                                        href={sub.route}
                                                                        prefetch
                                                                        className={`group/sub flex items-center px-2.5 py-1.5 rounded-lg text-[12.5px] select-none
                                                                            transition-all duration-200 ease-out ${
                                                                            isSubActive
                                                                                ? 'bg-[#009E49] text-white font-bold shadow-xs translate-x-1'
                                                                                : 'text-slate-600 hover:text-[#009E49] hover:bg-emerald-50/80 hover:translate-x-1 font-medium'
                                                                        }`}
                                                                    >
                                                                        <span
                                                                            className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 transition-all duration-200 ${
                                                                                isSubActive
                                                                                    ? 'bg-white scale-110 shadow-xs'
                                                                                    : 'bg-slate-300 group-hover/sub:bg-[#009E49] group-hover/sub:scale-110'
                                                                            }`}
                                                                        />
                                                                        <span>{sub.label}</span>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // ── Full Expanded Single Item ──
                                    return (
                                        <Link
                                            key={idx}
                                            href={item.route!}
                                            prefetch
                                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] select-none
                                                transition-all duration-200 ease-out border ${
                                                isActive
                                                    ? 'bg-[#009E49] text-white font-bold shadow-xs border-[#009E49]'
                                                    : 'text-slate-600 hover:text-[#009E49] hover:bg-emerald-50/60 hover:border-emerald-100/70 border-transparent hover:translate-x-0.5 font-medium'
                                            }`}
                                        >
                                            <IconComponent
                                                className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#009E49]'
                                                }`}
                                            />
                                            <span className="tracking-tight">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── User Profile Footer & Visit Store Button ── */}
                <div className={`border-t border-slate-100 bg-slate-50/50 shrink-0 transition-all duration-300 ${
                    isCollapsed ? 'p-2.5 flex flex-col items-center gap-2.5' : 'p-3.5 space-y-2.5'
                }`}>
                    {isCollapsed ? (
                        <>
                            <Link
                                href={route('home')}
                                target="_blank"
                                className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-[#009E49] hover:text-white text-[#009E49] flex items-center justify-center transition-all shadow-2xs relative group"
                                title="Visit Live Storefront"
                            >
                                <Globe className="w-5 h-5" />
                                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-semibold rounded-xl shadow-lg whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 pointer-events-none">
                                    Visit Store
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer relative group"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-semibold rounded-xl shadow-lg whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 pointer-events-none">
                                    Logout
                                </div>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route('home')}
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 text-[#009E49] hover:bg-[#009E49] hover:text-white font-bold text-[13px] transition-all border border-emerald-200/60 shadow-2xs group"
                            >
                                <Globe className="w-4 h-4 text-[#009E49] group-hover:text-white transition-colors" />
                                <span>Visit Store</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'Admin')}&background=009E49&color=fff&size=80`}
                                        alt={auth?.user?.name || 'Admin'}
                                        className="w-8 h-8 rounded-full ring-2 ring-emerald-100 shrink-0"
                                    />
                                    <div className="min-w-0 text-left">
                                        <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">{auth?.user?.name || 'Admin'}</p>
                                        <p className="text-[11px] text-slate-400 truncate leading-tight">{auth?.user?.email || 'admin@store.com'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors shrink-0"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* ──────────────────────────────────────────────────────────────
             *  Main Content Area (Smooth padding transition matching sidebar)
             * ────────────────────────────────────────────────────────────── */}
            <div className={`flex-1 flex flex-col transition-[padding] duration-300 ease-in-out min-h-screen w-full max-w-full overflow-x-clip ${
                isCollapsed ? 'md:pl-[76px]' : 'md:pl-[240px]'
            }`}>
                
                {/* ── Topbar (Fixed Sticky at Top of Screen on Scroll) ── */}
                <header className="h-[64px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 md:px-8 sticky top-0 z-40 shadow-xs w-full max-w-full">
                    <div className="w-full h-full flex items-center justify-between gap-4">
                        
                        {/* Left: Mobile Toggle, Desktop Collapse Toggle & Search Box */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-md">
                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-1.5 sm:p-2 text-slate-600 hover:text-[#009E49] hover:bg-slate-50 rounded-xl border-none bg-transparent cursor-pointer shrink-0"
                                aria-label="Toggle Sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Desktop Sidebar Toggle Button */}
                            <button
                                onClick={toggleCollapse}
                                className="hidden md:flex p-2 text-slate-500 hover:text-[#009E49] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                            >
                                {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                            </button>

                            {/* Omnisearch: Orders, Products, Customers, Navigation */}
                            <AdminGlobalSearch />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {/* Live Store Pill */}
                            <Link
                                href={route('home')}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border border-[#009E49]/30 bg-[#E1F7EE]/70 text-[#009E49] text-[12px] sm:text-[12.5px] font-bold hover:bg-[#009E49] hover:text-white transition-all shadow-2xs shrink-0"
                                title="Visit Live Storefront"
                            >
                                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#009E49] shrink-0" />
                                <span className="hidden xs:inline sm:inline">Store</span>
                                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden xs:inline" />
                            </Link>

                            {/* Notification Bell */}
                            <button className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border-none cursor-pointer shrink-0">
                                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center border-2 border-white">
                                    3
                                </span>
                            </button>

                            <div className="w-px h-5 sm:h-6 bg-slate-200" />

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-50 border-none bg-transparent cursor-pointer transition-all shrink-0"
                                >
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'Admin')}&background=009E49&color=fff&size=80`}
                                        alt="Admin"
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-emerald-200"
                                    />
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xs:inline" />
                                </button>

                                {isProfileDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="text-[13.5px] font-bold text-slate-800">{auth?.user?.name || 'Administrator'}</p>
                                                <p className="text-[11.5px] text-slate-400">{auth?.user?.email || 'admin@store.com'}</p>
                                            </div>
                                            <Link
                                                href={route('admin.settings.index')}
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-[#009E49] hover:bg-emerald-50/50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4" /> Store Settings
                                            </Link>
                                            <Link
                                                href={route('home')}
                                                target="_blank"
                                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-[#009E49] hover:bg-emerald-50/50 transition-colors"
                                            >
                                                <Globe className="w-4 h-4" /> Visit Storefront
                                            </Link>
                                            <div className="border-t border-slate-100 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50 text-left border-none bg-transparent cursor-pointer transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Page Content (Full Width Left-aligned with consistent padding) ── */}
                <main className="p-4 pb-24 sm:p-6 sm:pb-8 md:p-8 flex-grow w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* ── Mobile App Bottom Navigation Bar (Native App Feel) ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around">
                <Link
                    href={route('admin.dashboard')}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors no-underline ${
                        isUrlMatch('dashboard')
                            ? 'text-[#009E49] font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-medium'
                    }`}
                >
                    <LayoutGrid className="w-5 h-5 mb-0.5" />
                    <span className="text-[10.5px]">Dashboard</span>
                </Link>

                <Link
                    href={route('admin.orders.index')}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors no-underline relative ${
                        isUrlMatch('orders')
                            ? 'text-[#009E49] font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-medium'
                    }`}
                >
                    <ShoppingBag className="w-5 h-5 mb-0.5" />
                    <span className="text-[10.5px]">Orders</span>
                    {isUrlMatch('orders') && (
                        <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#009E49]" />
                    )}
                </Link>

                <Link
                    href={route('admin.products.index')}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors no-underline ${
                        isUrlMatch('products')
                            ? 'text-[#009E49] font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-medium'
                    }`}
                >
                    <Package className="w-5 h-5 mb-0.5" />
                    <span className="text-[10.5px]">Products</span>
                </Link>

                <Link
                    href={route('admin.settings.index')}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors no-underline ${
                        isUrlMatch('settings')
                            ? 'text-[#009E49] font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-medium'
                    }`}
                >
                    <Settings className="w-5 h-5 mb-0.5" />
                    <span className="text-[10.5px]">Settings</span>
                </Link>

                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-medium border-none bg-transparent cursor-pointer"
                >
                    <Menu className="w-5 h-5 mb-0.5" />
                    <span className="text-[10.5px]">Menu</span>
                </button>
            </nav>

            <Toaster position="top-right" richColors />
        </div>
    );
};

export default AdminLayout;
