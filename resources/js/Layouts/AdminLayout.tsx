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
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
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

    /* ── Derive admin base path from Ziggy so subdirectory installs work ── */
    const getAdminBase = (): string => {
        if (typeof window === 'undefined') return '/admin';
        try {
            const full = route('admin.dashboard');
            const pathname = new URL(full, window.location.origin).pathname;
            // route('admin.dashboard') may end with /dashboard or just /admin
            return pathname.replace(/\/dashboard$/, '').replace(/\/$/, '') || '/admin';
        } catch {
            return '/admin';
        }
    };

    /* ── Relative path helper (strips admin base) ─────────────────────── */
    const getRelativePath = (): string => {
        const raw = typeof window !== 'undefined' ? window.location.pathname : '';
        const base = getAdminBase();
        const rel = raw.startsWith(base) ? raw.slice(base.length).replace(/\/$/, '') : raw;
        return rel || '/';
    };

    /* ── Precise Single-Active Item Helper ──────────────────────────────── */
    const isUrlMatch = (itemKey?: string, _itemRoute?: string) => {
        const rel = getRelativePath();

        switch (itemKey) {
            case 'dashboard':
                return rel === '/' || rel === '' || rel === '/dashboard';
            case 'products':
                return ['/products', '/categories', '/brands', '/tags', '/attributes', '/reviews']
                    .some(p => rel === p || rel.startsWith(p + '/'));
            case 'orders':
                return rel === '/orders' || rel.startsWith('/orders/');
            case 'customers':
                return rel === '/customers' || rel.startsWith('/customers/');
            case 'messages':
                return rel === '/messages' || rel.startsWith('/messages/');
            case 'store':
                // Only /banners and /landing-pages — /settings is handled by standalone 'settings' item
                return ['/banners', '/landing-pages']
                    .some(p => rel === p || rel.startsWith(p + '/'));
            case 'integrations':
                return rel === '/integrations' || rel.startsWith('/integrations/');
            case 'help':
                return rel === '/help' || rel.startsWith('/help/');
            case 'settings':
                return rel === '/settings';
            default:
                return false;
        }
    };

    /* ── Helper for Submenu Item Active State ── */
    const isSubmenuActive = (parentKey: string, subKey: string) => {
        const rel = getRelativePath();

        if (parentKey === 'products') {
            if (subKey === 'all') return rel === '/products';
            if (subKey === 'create') return rel === '/products/create';
            if (subKey === 'categories') return rel === '/categories' || rel.startsWith('/categories/');
            if (subKey === 'brands') return rel === '/brands' || rel.startsWith('/brands/');
            if (subKey === 'tags') return rel === '/tags' || rel.startsWith('/tags/');
            if (subKey === 'attributes') return rel === '/attributes' || rel.startsWith('/attributes/');
            if (subKey === 'reviews') return rel === '/reviews' || rel.startsWith('/reviews/');
        }

        if (parentKey === 'orders') {
            // status is a path param: /orders/all, /orders/processing, /orders/on_hold etc.
            if (subKey === 'all') return rel === '/orders' || rel === '/orders/all';
            if (subKey === 'processing') return rel === '/orders/processing';
            if (subKey === 'on_hold') return rel === '/orders/on_hold';
            if (subKey === 'complete') return rel === '/orders/complete';
            if (subKey === 'cancelled') return rel === '/orders/cancelled';
        }

        if (parentKey === 'store') {
            if (subKey === 'settings') return rel === '/settings';
            if (subKey === 'banners') return rel === '/banners' || rel.startsWith('/banners/');
            if (subKey === 'landing_pages') return rel === '/landing-pages' || rel.startsWith('/landing-pages/');
        }

        return false;
    };

    useEffect(() => {
        const rel = getRelativePath();

        if (['/products', '/categories', '/brands', '/tags', '/attributes', '/reviews']
                .some(p => rel === p || rel.startsWith(p + '/'))) {
            setExpandedMenu('products');
        } else if (rel === '/orders' || rel.startsWith('/orders/')) {
            setExpandedMenu('orders');
        } else if (['/settings', '/banners', '/landing-pages']
                .some(p => rel === p || rel.startsWith(p + '/'))) {
            setExpandedMenu('store');
        }
    }, [url]);

    const handleLogout = () => router.post(route('admin.logout'));
    const toggleSubmenu = (menu: string) => {
        setExpandedMenu(prev => prev === menu ? null : menu);
    };

    /* ── Navigation groups ─────────────────────────────────────────────── */
    const navSections = [
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
                {
                    label: 'Settings',
                    icon: Settings,
                    key: 'settings',
                    route: route('admin.settings.index'),
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
                            <div className={isCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-0.5'}>
                                {section.items.map((item, idx) => {
                                    const IconComponent = item.icon;
                                    const isActive = isUrlMatch(item.key, item.route);

                                    // ── Collapsed Mini Mode (Icons with Flyout Menus & Tooltips) ──
                                    if (isCollapsed) {
                                        return (
                                            <div key={idx} className="relative group flex items-center justify-center w-full">
                                                {item.submenu ? (
                                                    <button
                                                        onClick={() => toggleSubmenu(item.key!)}
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                                                            isActive
                                                                ? 'bg-[#009E49] text-white shadow-2xs'
                                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/90'
                                                        }`}
                                                    >
                                                        <IconComponent className="w-4 h-4 stroke-[2]" />
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={item.route!}
                                                        prefetch
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
                                                            isActive
                                                                ? 'bg-[#009E49] text-white shadow-2xs'
                                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/90'
                                                        }`}
                                                    >
                                                        <IconComponent className="w-4 h-4 stroke-[2]" />
                                                    </Link>
                                                )}

                                                {/* Flyout Submenu Popover on Hover (Collapsed Mode) */}
                                                {item.submenu ? (
                                                    <div className="absolute left-full top-0 ml-2 py-2 px-1.5 bg-white border border-slate-200/90 rounded-xl shadow-lg min-w-[180px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 text-left pointer-events-auto">
                                                        <div className="px-2.5 pb-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                                                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                                                {item.label}
                                                            </p>
                                                            {isActive && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#009E49]" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            {item.submenu.map((sub: any, subIdx: number) => {
                                                                const isSubActive = isSubmenuActive(item.key, sub.key);
                                                                return (
                                                                    <Link
                                                                        key={subIdx}
                                                                        href={sub.route}
                                                                        prefetch
                                                                        className={`flex items-center px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                                                                            isSubActive
                                                                                ? 'bg-[#009E49] text-white font-semibold shadow-2xs'
                                                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                                        }`}
                                                                    >
                                                                        {sub.label}
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
                                        const isExpanded = expandedMenu === item.key;

                                        return (
                                            <div key={idx} className="space-y-0.5">
                                                <button
                                                    onClick={() => toggleSubmenu(item.key!)}
                                                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer
                                                        transition-colors duration-150 ease-in-out ${
                                                        isActive
                                                            ? 'bg-emerald-50/80 text-[#009E49] font-semibold'
                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <IconComponent className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-[#009E49]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                                        <span>{item.label}</span>
                                                    </div>
                                                    <ChevronRight
                                                        className={`w-3.5 h-3.5 shrink-0
                                                            transition-transform duration-200
                                                            ${isExpanded ? 'rotate-90' : 'rotate-0'}
                                                            ${isActive ? 'text-[#009E49]' : 'text-slate-300 group-hover:text-slate-500'}`}
                                                    />
                                                </button>

                                                <div
                                                    style={{
                                                        maxHeight: isExpanded ? '320px' : '0px',
                                                        opacity: isExpanded ? 1 : 0,
                                                        transition: isExpanded
                                                            ? 'max-height 240ms cubic-bezier(0.4,0,0.2,1), opacity 150ms ease-in'
                                                            : 'max-height 180ms cubic-bezier(0.4,0,1,1), opacity 100ms ease-out',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <div className="ml-3.5 pl-3 border-l border-slate-200/90 space-y-0.5 py-1 my-0.5">
                                                        {item.submenu.map((sub: any, subIdx: number) => {
                                                            const isSubActive = isSubmenuActive(item.key, sub.key);
                                                            return (
                                                                <Link
                                                                    key={subIdx}
                                                                    href={sub.route}
                                                                    prefetch
                                                                    className={`flex items-center px-2.5 py-1.5 rounded-md text-[12.5px] font-medium
                                                                        transition-colors duration-150 ${
                                                                        isSubActive
                                                                            ? 'bg-[#009E49] text-white font-semibold shadow-2xs'
                                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                                                    }`}
                                                                >
                                                                    {sub.label}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={item.route!}
                                            prefetch
                                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                                                transition-colors duration-150 ease-in-out ${
                                                isActive
                                                    ? 'bg-[#009E49] text-white font-semibold shadow-2xs'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                            }`}
                                        >
                                            <IconComponent className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                            <span>{item.label}</span>
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border border-[#009E49]/30 bg-[#E1F7EE]/70 text-[#009E49] text-[12px] sm:text-[12.5px] font-bold hover:bg-[#009E49] hover:text-white transition-all shadow-2xs shrink-0"
                                title="Visit Live Storefront"
                            >
                                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#009E49] shrink-0" />
                                <span className="inline">Store</span>
                                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
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
                <main className="p-4 sm:p-6 md:p-8 flex-grow w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    );
};

export default AdminLayout;
