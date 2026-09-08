import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, ShoppingBag, Heart, Tag, MapPin, CreditCard,
    Star, LifeBuoy, User, CalendarHeart, Lock, Users, Trash2,
    LogOut, Package, Truck, ShoppingCart, Wallet, Store,
    ChevronRight, Menu, X, ExternalLink, Clock, CheckCircle2,
    XCircle, AlertCircle, RefreshCw, ArrowRight, Home, Globe,
    ArrowUpRight, Copy, Check, Search, Filter, Phone, MessageSquare,
    ShieldCheck, Sparkles, Plus, Edit2, AlertTriangle, Send, Eye,
    ChevronLeft, ChevronDown
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    variant_info?: Record<string, any> | null;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    mobile?: string;
    district?: string;
    thana?: string;
    address?: string;
    subtotal?: number;
    delivery_charge?: number;
    coupon_discount?: number;
    courier_name?: string;
    total: number;
    status: string;
    payment_method: string;
    payment_status?: string;
    created_at: string;
    courier_tracking_code?: string;
    consignment_id?: string;
    tracking_url?: string;
    items?: OrderItem[];
}

interface Stats {
    total_orders: number;
    running_orders: number;
    amount_spent: number;
}

interface DashboardProps {
    stats: Stats;
    recent_orders: Order[];
}

type TabType =
    | 'dashboard'
    | 'orders'
    | 'wishlist'
    | 'coupons'
    | 'addresses'
    | 'payments'
    | 'reviews'
    | 'support'
    | 'profile'
    | 'special_day'
    | 'password'
    | 'agent'
    | 'delete_account';

interface NavItem {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasSub?: boolean;
    count?: number;
    danger?: boolean;
}

interface NavGroup {
    groupTitle: string;
    items: NavItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:    { label: 'Pending',    color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',    icon: <Clock className="w-3 h-3" /> },
    confirmed:  { label: 'Confirmed',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',      icon: <CheckCircle2 className="w-3 h-3" /> },
    processing: { label: 'Processing', color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200',  icon: <RefreshCw className="w-3 h-3" /> },
    shipped:    { label: 'Shipped',    color: 'text-[#009E49]',   bg: 'bg-emerald-50 border-emerald-200', icon: <Truck className="w-3 h-3" /> },
    delivered:  { label: 'Delivered',  color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300', icon: <CheckCircle2 className="w-3 h-3" /> },
    cancelled:  { label: 'Cancelled',  color: 'text-[#E2231A]',   bg: 'bg-red-50 border-red-200',        icon: <XCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase() ?? 'pending';
    const cfg = STATUS_CONFIG[key] ?? {
        label: status || 'Pending',
        color: 'text-slate-600',
        bg: 'bg-slate-100 border-slate-200',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[12px] sm:text-[12.5px] font-bold border ${cfg.bg} ${cfg.color}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

function formatDate(dateStr: string) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function formatCurrency(amount: number) {
    return `৳${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const TICKET_CATEGORIES = [
    {
        id: 'Order Issue',
        label: 'Order Status / Delay',
        description: 'Tracking, dispatch delay or delivery updates',
        icon: Truck,
        iconBg: 'bg-emerald-50 text-[#009E49]',
    },
    {
        id: 'Product Quality',
        label: 'Product Defect / Quality',
        description: 'Damaged item, quality concern or wrong product',
        icon: Sparkles,
        iconBg: 'bg-amber-50 text-amber-600',
    },
    {
        id: 'Refund',
        label: 'Return & Refund',
        description: 'Return request, refund status or exchange',
        icon: RefreshCw,
        iconBg: 'bg-blue-50 text-blue-600',
    },
    {
        id: 'Payment',
        label: 'Payment / Billing',
        description: 'bKash, Nagad, card charge or invoice issue',
        icon: CreditCard,
        iconBg: 'bg-purple-50 text-purple-600',
    },
    {
        id: 'Other',
        label: 'Other Inquiry',
        description: 'General questions and account support',
        icon: MessageSquare,
        iconBg: 'bg-slate-100 text-slate-600',
    },
];

export default function CustomerDashboard({ stats, recent_orders = [] }: DashboardProps) {
    const { auth, store_settings } = usePage().props as any;
    const user = auth?.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    // Orders Filter & Modal state
    const [orderFilter, setOrderFilter] = useState('all');
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Coupon tab state
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [testCouponInput, setTestCouponInput] = useState('');
    const [testCouponResult, setTestCouponResult] = useState<string | null>(null);

    // Address tab state
    const [savedAddresses, setSavedAddresses] = useState([
        {
            id: 1,
            title: 'Default Delivery Address',
            name: user?.name || 'Customer',
            phone: user?.phone || '01700000000',
            district: 'Dhaka',
            thana: 'Mirpur',
            address: 'House #12, Road #4, Mirpur-10, Dhaka',
            isDefault: true,
        },
    ]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        district: 'Dhaka',
        thana: '',
        address: '',
    });

    // Support ticket state
    const [tickets, setTickets] = useState([
        { id: 'TKT-8921', subject: 'Order delivery inquiry', status: 'Resolved', date: '2026-08-28', priority: 'Medium' },
    ]);
    const [newTicket, setNewTicket] = useState({ subject: '', category: 'Order Issue', message: '' });
    const [ticketSuccess, setTicketSuccess] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Review state
    const [reviews, setReviews] = useState<Array<{ id: number; product: string; rating: number; comment: string; date: string }>>([]);
    const [reviewForm, setReviewForm] = useState({ product: '', rating: 5, comment: '' });
    const [reviewSuccess, setReviewSuccess] = useState(false);

    // Profile state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [profileSaved, setProfileSaved] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordSaved, setPasswordSaved] = useState(false);

    // Special Day state
    const [specialDays, setSpecialDays] = useState({
        birthday: '',
        anniversary: '',
    });
    const [specialSaved, setSpecialSaved] = useState(false);

    // Agent application state
    const [agentForm, setAgentForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        district: 'Dhaka',
        profession: '',
        experience: '',
    });
    const [agentSubmitted, setAgentSubmitted] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return recent_orders.filter((order) => {
            const matchesSearch =
                order.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                (order.mobile && order.mobile.includes(orderSearch)) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()));

            if (!matchesSearch) return false;
            if (orderFilter === 'all') return true;
            return order.status?.toLowerCase() === orderFilter.toLowerCase();
        });
    }, [recent_orders, orderFilter, orderSearch]);

    // Stat Cards
    const statCards = [
        {
            label: 'Total Orders',
            value: stats.total_orders,
            icon: Package,
            gradient: 'from-[#009E49] to-[#007536]',
            glow: 'shadow-[0_4px_16px_rgba(0,158,73,0.18)]',
            tab: 'orders' as TabType,
        },
        {
            label: 'Active Orders',
            value: stats.running_orders,
            icon: Truck,
            gradient: 'from-blue-600 to-blue-700',
            glow: 'shadow-[0_4px_16px_rgba(37,99,235,0.18)]',
            tab: 'orders' as TabType,
        },
        {
            label: 'Cart Items',
            value: 0,
            icon: ShoppingCart,
            gradient: 'from-violet-600 to-violet-700',
            glow: 'shadow-[0_4px_16px_rgba(124,58,237,0.18)]',
            href: route('shop'),
        },
        {
            label: 'Wishlist Items',
            value: 0,
            icon: Heart,
            gradient: 'from-[#E2231A] to-[#b51a14]',
            glow: 'shadow-[0_4px_16px_rgba(226,35,26,0.18)]',
            tab: 'wishlist' as TabType,
        },
        {
            label: 'Total Spent',
            value: formatCurrency(stats.amount_spent),
            icon: Wallet,
            gradient: 'from-amber-500 to-amber-600',
            glow: 'shadow-[0_4px_16px_rgba(245,158,11,0.18)]',
            isAmount: true,
            tab: 'orders' as TabType,
        },
        {
            label: 'Support Tickets',
            value: tickets.length,
            icon: LifeBuoy,
            gradient: 'from-teal-600 to-teal-700',
            glow: 'shadow-[0_4px_16px_rgba(13,148,136,0.18)]',
            tab: 'support' as TabType,
        },
    ];

    // Navigation Menu Structure (matches reference image layout)
    const navGroups: NavGroup[] = [
        {
            groupTitle: 'MAIN MENU',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hasSub: false },
                { id: 'orders', label: 'My Orders', icon: ShoppingBag, hasSub: true, count: stats.total_orders },
                { id: 'wishlist', label: 'Wishlist', icon: Heart, hasSub: true },
                { id: 'coupons', label: 'Promo & Coupons', icon: Tag, hasSub: true },
                { id: 'addresses', label: 'My Addresses', icon: MapPin, hasSub: false },
                { id: 'payments', label: 'Payment Methods', icon: CreditCard, hasSub: false },
                { id: 'reviews', label: 'Product Reviews', icon: Star, hasSub: false },
                { id: 'support', label: 'Support Tickets', icon: LifeBuoy, hasSub: false, count: tickets.length },
            ],
        },
        {
            groupTitle: 'ACCOUNT & SETTINGS',
            items: [
                { id: 'profile', label: 'Manage Profile', icon: User, hasSub: true },
                { id: 'special_day', label: 'Special Days', icon: CalendarHeart, hasSub: false },
                { id: 'password', label: 'Change Password', icon: Lock, hasSub: false },
                { id: 'agent', label: 'Become an Agent', icon: Users, hasSub: false },
                { id: 'delete_account', label: 'Delete Account', icon: Trash2, hasSub: false, danger: true },
            ],
        },
    ];

    const getTabTitle = (tab: TabType) => {
        switch (tab) {
            case 'dashboard': return 'Account Dashboard';
            case 'orders': return 'My Orders';
            case 'wishlist': return 'My Wishlist';
            case 'coupons': return 'Promo Codes & Coupons';
            case 'addresses': return 'Delivery Addresses';
            case 'payments': return 'Payment Methods';
            case 'reviews': return 'Product Reviews';
            case 'support': return 'Support Tickets';
            case 'profile': return 'Manage Profile';
            case 'special_day': return 'Special Days & Rewards';
            case 'password': return 'Change Password';
            case 'agent': return 'Become an Agent';
            case 'delete_account': return 'Delete Account';
            default: return 'Customer Portal';
        }
    };

    // Sidebar Content Component
    const SidebarContent = () => (
        <aside className="flex flex-col h-full bg-white text-slate-700 select-none border-r border-slate-200/80">
            {/* Header: Logo + Collapse Button */}
            <div className={`flex items-center justify-between border-b border-slate-100 min-h-[76px] transition-all duration-200 ${
                sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-3'
            }`}>
                <Link href={route('home')} className="inline-flex items-center gap-2.5 no-underline min-w-0">
                    {store_settings?.site_logo ? (
                        <img
                            src={store_settings.site_logo}
                            alt={store_settings?.site_name ?? 'ChutirMart'}
                            className={`w-auto object-contain transition-all duration-200 ${
                                sidebarCollapsed ? 'h-9 max-w-[48px]' : 'h-12 sm:h-14 max-w-[190px]'
                            }`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#009E49] flex items-center justify-center shadow-sm shrink-0">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            {!sidebarCollapsed && (
                                <span className="text-xl font-black tracking-tight">
                                    <span className="text-[#009E49]">Chutir</span>
                                    <span className="text-[#E2231A]">Mart</span>
                                </span>
                            )}
                        </div>
                    )}
                </Link>

                <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer shrink-0 ml-2"
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Scrollable Nav Section */}
            <nav className={`flex-1 overflow-y-auto space-y-4 py-3.5 transition-all duration-200 ${
                sidebarCollapsed ? 'px-3' : 'px-4'
            }`}>
                {navGroups.map((group) => (
                    <div key={group.groupTitle} className="space-y-1">
                        {!sidebarCollapsed && (
                            <p className="px-3 py-1 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                                {group.groupTitle}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const isActive = activeTab === item.id;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(item.id as TabType);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left border-none cursor-pointer group ${
                                        isActive
                                            ? 'bg-[#009E49] text-white shadow-sm font-bold'
                                            : item.danger
                                            ? 'text-red-500 hover:bg-red-50 hover:text-red-600 font-medium'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.danger ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-800'}`} />
                                    {!sidebarCollapsed && (
                                        <>
                                            <span className="text-sm flex-1 truncate">{item.label}</span>
                                            {item.count !== undefined && item.count > 0 && (
                                                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                                                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {item.count}
                                                </span>
                                            )}
                                            {item.hasSub && (
                                                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Actions: Visit Store & User Profile */}
            <div className={`py-3 border-t border-slate-100 space-y-2 transition-all duration-200 ${
                sidebarCollapsed ? 'px-3' : 'px-4'
            }`}>
                {/* Visit Store Button matching reference */}
                <Link
                    href={route('home')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 text-[#009E49] border border-[#009E49]/30 hover:bg-emerald-100/70 font-bold text-xs transition-all no-underline shadow-xs"
                >
                    <Globe className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                        <>
                            <span>Visit Store</span>
                            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                        </>
                    )}
                </Link>

                {/* User card at bottom */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#009E49] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{((user?.name || 'U').charAt(0) + ((user?.name || '').split(' ')[1]?.charAt(0) || '')).toUpperCase()}</span>
                            )}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-800 truncate leading-tight">
                                    {user?.name || 'Customer'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {user?.email || user?.phone || 'Customer Account'}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Sign Out"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#E2231A] hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800">
            <Head title={`${getTabTitle(activeTab)} — ${store_settings?.site_name ?? 'ChutirMart'}`} />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-250 ease-in-out lg:hidden ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="relative h-full shadow-2xl">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-4 right-3 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer border-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <SidebarContent />
                </div>
            </div>

            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <div className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-200 ${
                    sidebarCollapsed ? 'w-20' : 'w-72 xl:w-80'
                }`}>
                    <SidebarContent />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-4 pb-24 sm:p-6 sm:pb-8 lg:p-8 space-y-6">

                    {/* Top Sticky Header Bar */}
                    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] -mx-4 -mt-4 px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-3.5 lg:-mx-8 lg:-mt-8 lg:px-8 lg:py-4 transition-all mb-6">
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-2xs text-slate-700 hover:text-[#009E49] hover:border-[#009E49]/40 active:scale-95 transition-all cursor-pointer border border-slate-200/90 lg:hidden shrink-0"
                                    aria-label="Open sidebar menu"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                                        {getTabTitle(activeTab)}
                                    </h1>
                                    <p className="text-[13px] text-slate-500 mt-0.5 hidden sm:block truncate">
                                        Welcome back, <span className="font-bold text-slate-700">{user?.name || 'Valued Customer'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <Link
                                    href={route('home')}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-lg bg-[#009E49] hover:bg-[#008A40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:shadow-[#009E49]/20 hover:-translate-y-0.5 active:scale-98 transition-all no-underline shrink-0 select-none group"
                                    title="Visit Live Storefront"
                                >
                                    <Store className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                                    <span>Visit Store</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all hidden sm:inline" />
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 1: DASHBOARD OVERVIEW
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Stat Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {statCards.map((card) => {
                                    const Icon = card.icon;
                                    return (
                                        <div
                                            key={card.label}
                                            onClick={() => {
                                                if (card.tab) setActiveTab(card.tab);
                                                if (card.href) router.visit(card.href);
                                            }}
                                            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-center gap-3 sm:gap-4 cursor-pointer group"
                                        >
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} ${card.glow} flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-black leading-tight ${card.isAmount ? 'text-xl sm:text-2xl text-[#009E49]' : 'text-2xl sm:text-3xl text-slate-900'}`}>
                                                    {card.value}
                                                </p>
                                                <p className="text-[13px] sm:text-[14px] text-slate-600 font-bold mt-1 truncate">{card.label}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quick Action Shortcuts */}
                            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                                <h3 className="text-[15px] sm:text-[16px] font-extrabold text-slate-900 mb-3.5 flex items-center gap-2">
                                    <Sparkles className="w-4.5 h-4.5 text-[#009E49]" /> Quick Shortcuts
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-left border border-slate-200/70 hover:border-[#009E49]/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group min-w-0"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] sm:text-[14px] font-bold text-slate-800 line-clamp-1 truncate">
                                                Track Orders
                                            </p>
                                            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium line-clamp-1 truncate mt-0.5">
                                                Live parcel tracking
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('coupons')}
                                        className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-left border border-slate-200/70 hover:border-[#009E49]/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group min-w-0"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Tag className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] sm:text-[14px] font-bold text-slate-800 line-clamp-1 truncate">
                                                Promo Offers
                                            </p>
                                            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium line-clamp-1 truncate mt-0.5">
                                                Available coupons
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('addresses')}
                                        className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-left border border-slate-200/70 hover:border-[#009E49]/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group min-w-0"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] sm:text-[14px] font-bold text-slate-800 line-clamp-1 truncate">
                                                Addresses
                                            </p>
                                            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium line-clamp-1 truncate mt-0.5">
                                                Manage delivery spot
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('support')}
                                        className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-left border border-slate-200/70 hover:border-[#009E49]/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group min-w-0"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <LifeBuoy className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] sm:text-[14px] font-bold text-slate-800 line-clamp-1 truncate">
                                                Support Desk
                                            </p>
                                            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium line-clamp-1 truncate mt-0.5">
                                                Get 24/7 help
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Orders Overview */}
                            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-[#009E49] flex items-center justify-center text-white">
                                            <ShoppingBag className="w-4.5 h-4.5" />
                                        </div>
                                        <h2 className="text-[15px] sm:text-base font-black text-slate-900">Recent Orders</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('orders')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] sm:text-[13px] font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer border-none"
                                    >
                                        View All Orders <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {recent_orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                            <Package className="w-7 h-7 text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 mb-1">No Orders Placed Yet</h3>
                                        <p className="text-[13px] text-slate-500 mb-4">You haven't placed any orders yet. Discover our premium groceries and authentic treats!</p>
                                        <Link
                                            href={route('shop')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold shadow-xs hover:bg-[#008A40] transition-all no-underline"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            <span>Start Shopping</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Order Cards (block sm:hidden) */}
                                        <div className="block sm:hidden divide-y divide-slate-100 p-3.5 space-y-3">
                                            {recent_orders.slice(0, 5).map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-[#009E49]/40 hover:shadow-xs transition-all duration-200"
                                                >
                                                    {/* Top Row: Order Number Badge + Status Pill */}
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="w-2 h-2 rounded-full bg-[#009E49] shrink-0" />
                                                            <span className="text-[13.5px] font-black text-slate-900 tracking-tight whitespace-nowrap">
                                                                #{order.order_number}
                                                            </span>
                                                        </div>
                                                        <div className="shrink-0">
                                                            <StatusBadge status={order.status} />
                                                        </div>
                                                    </div>

                                                    {/* Middle Row: Date, Payment, and Bold Total */}
                                                    <div className="flex items-center justify-between py-2 border-y border-slate-100/90 my-2 text-xs text-slate-500">
                                                        <div>
                                                            <p className="font-medium text-slate-500">{formatDate(order.created_at)}</p>
                                                            <p className="font-semibold text-slate-700 capitalize mt-0.5">
                                                                {order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || 'Payment')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                                                            <span className="text-[16px] font-black text-[#009E49]">
                                                                {formatCurrency(order.total)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Row: Actions (Full Width / Touch-Friendly Buttons) */}
                                                    <div className="flex items-center gap-2 pt-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="flex-1 h-9 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#009E49] text-slate-700 hover:text-white transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer active:scale-98 shadow-2xs group"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                                                            <span>View Details</span>
                                                        </button>
                                                        {order.tracking_url && (
                                                            <a
                                                                href={order.tracking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 h-9 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-[#009E49] text-[#009E49] hover:text-white transition-all flex items-center justify-center gap-1.5 no-underline active:scale-98 shadow-2xs"
                                                            >
                                                                <span>Track Parcel</span>
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Order Table (hidden sm:block) */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">Order Number</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Date</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Total</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Status</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap hidden md:table-cell">Payment</th>
                                                        <th className="text-right text-[12px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {recent_orders.slice(0, 5).map((order) => (
                                                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                                <span className="text-[14px] sm:text-[14.5px] font-bold text-slate-900">#{order.order_number}</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                <span className="text-[13px] font-medium text-slate-500">{formatDate(order.created_at)}</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                <span className="text-[14.5px] font-black text-[#009E49]">{formatCurrency(order.total)}</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                <StatusBadge status={order.status} />
                                                            </td>
                                                            <td className="px-4 py-3.5 hidden md:table-cell whitespace-nowrap">
                                                                <span className="text-[13px] text-slate-600 font-semibold">
                                                                    {order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || '—')}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedOrder(order)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-slate-100 text-slate-700 hover:bg-[#009E49] hover:text-white transition-all border-none cursor-pointer group"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                                                                    <span>Details</span>
                                                                </button>
                                                                {order.tracking_url && (
                                                                    <a
                                                                        href={order.tracking_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-emerald-50 text-[#009E49] hover:bg-emerald-100 transition-colors no-underline"
                                                                    >
                                                                        Track <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 2: MY ORDERS (FULL MANAGEMENT)
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            {/* Search and Filters */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                                    <div className="relative w-full sm:w-80">
                                        <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                            placeholder="Search by order #, phone..."
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49] bg-slate-50/50"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                                        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => setOrderFilter(tab)}
                                                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] sm:text-[13px] font-bold capitalize transition-colors shrink-0 border-none cursor-pointer ${
                                                    orderFilter === tab
                                                        ? 'bg-[#009E49] text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                                {filteredOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                            <Package className="w-7 h-7 text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 mb-1">No Orders Found</h3>
                                        <p className="text-[13px] text-slate-500 mb-4">No orders match your filter criteria or search query.</p>
                                        <Link
                                            href={route('shop')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold no-underline"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            <span>Shop Products</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Order Cards (block sm:hidden) */}
                                        <div className="block sm:hidden divide-y divide-slate-100 p-3.5 space-y-3">
                                            {filteredOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-[#009E49]/40 hover:shadow-xs transition-all duration-200"
                                                >
                                                    {/* Top: Order # and Status */}
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="w-2 h-2 rounded-full bg-[#009E49] shrink-0" />
                                                            <span className="text-[13.5px] font-black text-slate-900 tracking-tight whitespace-nowrap">
                                                                #{order.order_number}
                                                            </span>
                                                        </div>
                                                        <div className="shrink-0">
                                                            <StatusBadge status={order.status} />
                                                        </div>
                                                    </div>

                                                    {order.courier_name && (
                                                        <p className="text-[11.5px] text-slate-500 font-medium capitalize mb-2">
                                                            Courier: <span className="font-bold text-slate-700">{order.courier_name}</span>
                                                        </p>
                                                    )}

                                                    {/* Middle: Date, Payment, and Amount */}
                                                    <div className="flex items-center justify-between py-2 border-y border-slate-100/90 my-2 text-xs text-slate-500">
                                                        <div>
                                                            <p className="font-medium text-slate-500">{formatDate(order.created_at)}</p>
                                                            <p className="font-bold text-slate-700 mt-0.5">
                                                                {order.items?.length ?? 1} item(s) • <span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || 'Payment')}</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                                                            <span className="text-[16px] font-black text-[#009E49]">
                                                                {formatCurrency(order.total)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bottom: Action Buttons */}
                                                    <div className="flex items-center gap-2 pt-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="flex-1 h-9 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#009E49] text-slate-700 hover:text-white transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer active:scale-98 shadow-2xs group"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                                                            <span>View Details</span>
                                                        </button>
                                                        {order.tracking_url && (
                                                            <a
                                                                href={order.tracking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 h-9 rounded-lg text-xs font-bold bg-[#009E49] text-white hover:bg-[#008A40] transition-colors flex items-center justify-center gap-1.5 no-underline active:scale-98 shadow-xs"
                                                            >
                                                                <span>Track Parcel</span>
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Order Table (hidden sm:block) */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">Order Number</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Date</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Items</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Total Amount</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Status</th>
                                                        <th className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap hidden md:table-cell">Payment</th>
                                                        <th className="text-right text-[12px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredOrders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                                                            <td className="px-5 py-4 whitespace-nowrap">
                                                                <span className="text-[14.5px] sm:text-[15px] font-black text-slate-900">#{order.order_number}</span>
                                                                {order.courier_name && (
                                                                    <p className="text-[12px] text-slate-500 font-medium capitalize mt-0.5">Courier: {order.courier_name}</p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 text-[13px] text-slate-600 whitespace-nowrap">
                                                                {formatDate(order.created_at)}
                                                            </td>
                                                            <td className="px-4 py-4 text-[13.5px] font-bold text-slate-700 whitespace-nowrap">
                                                                {order.items?.length ?? 1} item(s)
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span className="text-[14.5px] sm:text-[15px] font-black text-[#009E49]">{formatCurrency(order.total)}</span>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <StatusBadge status={order.status} />
                                                            </td>
                                                            <td className="px-4 py-4 hidden md:table-cell whitespace-nowrap">
                                                                <span className="text-[13px] font-semibold text-slate-600 capitalize">
                                                                    {order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || '—')}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedOrder(order)}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] sm:text-[13px] font-bold bg-slate-100 text-slate-700 hover:bg-[#009E49] hover:text-white transition-all border-none cursor-pointer group"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                                                                    <span>Details</span>
                                                                </button>
                                                                {order.tracking_url && (
                                                                    <a
                                                                        href={order.tracking_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-[12.5px] sm:text-[13px] font-bold bg-[#009E49] text-white hover:bg-[#008A40] transition-colors no-underline shadow-xs"
                                                                    >
                                                                        Track Parcel <ExternalLink className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 3: WISHLIST
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'wishlist' && (
                        <div className="bg-white rounded-xl p-8 border border-slate-200/80 shadow-xs text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-[#E2231A] flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-1">Your Wishlist is Empty</h2>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                                Save items you love by clicking the heart icon while browsing our store, and review them anytime right here!
                            </p>
                            <Link
                                href={route('shop')}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#009E49] text-white text-sm font-bold shadow-xs hover:bg-[#008A40] transition-all no-underline"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Explore Catalog</span>
                            </Link>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 4: PROMO CODES & COUPONS
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'coupons' && (
                        <div className="space-y-6">
                            {/* Promo Banner */}
                            <div className="rounded-xl bg-gradient-to-r from-[#009E49] to-[#007536] text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <span className="px-3 py-1 rounded-md bg-white/20 text-white text-[12px] font-bold uppercase tracking-wider">
                                        Special Welcome Discount
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-black mt-2">Save up to 15% on Fresh Groceries</h2>
                                    <p className="text-sm text-emerald-100 mt-1 max-w-lg">
                                        Use promo codes during checkout to enjoy instant discounts and free delivery perks!
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard('CHUTIR10')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#009E49] font-black text-sm shadow-md hover:bg-emerald-50 transition-colors border-none cursor-pointer"
                                    >
                                        {copiedCode === 'CHUTIR10' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copiedCode === 'CHUTIR10' ? 'Code Copied!' : 'Copy Code: CHUTIR10'}
                                    </button>
                                </div>
                            </div>

                            {/* Available Coupon Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { code: 'WELCOME50', discount: '৳50 OFF', desc: 'Flat ৳50 discount on your first order', min: 'Min. Order ৳500', exp: 'Valid forever' },
                                    { code: 'CHUTIR10', discount: '10% OFF', desc: '10% discount on all premium items', min: 'Min. Order ৳1,000', exp: 'Expires end of month' },
                                    { code: 'FREESHIP', discount: 'Free Delivery', desc: 'Free home delivery across Bangladesh', min: 'Min. Order ৳1,500', exp: 'Limited time' },
                                ].map((coupon) => (
                                    <div key={coupon.code} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#009E49] text-[12.5px] font-extrabold border border-emerald-200">
                                                    {coupon.discount}
                                                </span>
                                                <span className="text-[12px] text-slate-500 font-semibold">{coupon.exp}</span>
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 tracking-wider font-mono">{coupon.code}</h3>
                                            <p className="text-[13px] text-slate-600 mt-1">{coupon.desc}</p>
                                            <p className="text-[12px] text-slate-400 font-medium mt-2">{coupon.min}</p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-[12px] font-bold text-[#009E49]">Active Promo</span>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(coupon.code)}
                                                className="inline-flex items-center gap-1 text-[13px] font-bold text-slate-700 hover:text-[#009E49] transition-colors border-none bg-transparent cursor-pointer"
                                            >
                                                {copiedCode === coupon.code ? (
                                                    <span className="text-[#009E49] flex items-center gap-1 font-bold">
                                                        <Check className="w-3.5 h-3.5" /> Copied
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Copy className="w-3.5 h-3.5" /> Copy
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Checker */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs max-w-md">
                                <h3 className="text-[15px] font-bold text-slate-900 mb-2">Check Coupon Validity</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={testCouponInput}
                                        onChange={(e) => setTestCouponInput(e.target.value)}
                                        placeholder="Enter coupon code..."
                                        className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49] uppercase font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const code = testCouponInput.trim().toUpperCase();
                                            if (!code) return;
                                            if (['WELCOME50', 'CHUTIR10', 'FREESHIP'].includes(code)) {
                                                setTestCouponResult(`Valid coupon! You get special discount on ${code}.`);
                                            } else {
                                                setTestCouponResult('This coupon code is currently inactive or expired.');
                                            }
                                        }}
                                        className="px-4 py-2.5 bg-[#009E49] text-white rounded-lg text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer"
                                    >
                                        Verify
                                    </button>
                                </div>
                                {testCouponResult && (
                                    <p className={`text-[13px] mt-2 font-medium ${testCouponResult.includes('Valid') ? 'text-[#009E49]' : 'text-red-500'}`}>
                                        {testCouponResult}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 5: MY ADDRESSES
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'addresses' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] text-slate-500 font-medium">Manage your shipping and billing delivery locations.</p>
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add New Address
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {savedAddresses.map((addr) => (
                                    <div key={addr.id} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[12.5px] font-extrabold text-[#009E49] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                                {addr.title}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-[15px] font-bold text-slate-900 mt-2">{addr.name}</h4>
                                        <p className="text-[13.5px] text-slate-600 mt-1 font-semibold">{addr.phone}</p>
                                        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
                                            {addr.address}, {addr.thana}, {addr.district}
                                        </p>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddressForm({
                                                        name: addr.name,
                                                        phone: addr.phone,
                                                        district: addr.district,
                                                        thana: addr.thana,
                                                        address: addr.address,
                                                    });
                                                    setShowAddressModal(true);
                                                }}
                                                className="inline-flex items-center gap-1 text-[13px] font-bold text-slate-600 hover:text-[#009E49] transition-colors border-none bg-transparent cursor-pointer"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 6: PAYMENT METHODS
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-5 border border-emerald-200/80 shadow-xs relative">
                                    <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#009E49] text-[12px] font-extrabold border border-emerald-200">
                                        Primary
                                    </span>
                                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#009E49] flex items-center justify-center mb-3.5">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900">Cash on Delivery (COD)</h3>
                                    <p className="text-[13px] text-slate-600 mt-1">Pay with cash when your package arrives at your doorstep.</p>
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <span className="text-[12.5px] font-bold text-[#009E49]">✓ Enabled for all orders</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                                    <div className="w-11 h-11 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-3.5 font-black text-sm">
                                        MFS
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900">bKash / Nagad / Rocket</h3>
                                    <p className="text-[13px] text-slate-600 mt-1">Instant mobile wallet payments available securely during checkout.</p>
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <span className="text-[12.5px] font-bold text-slate-500">Available at Checkout</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                                    <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900">Debit / Credit Cards</h3>
                                    <p className="text-[13px] text-slate-600 mt-1">Visa, MasterCard, and UnionPay processed via encrypted gateway.</p>
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <span className="text-[12.5px] font-bold text-slate-500">256-Bit SSL Protected</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#009E49] flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-slate-900">100% Safe & Secure Payments</h4>
                                    <p className="text-[13px] text-slate-500 mt-0.5">
                                        All transactions on ChutirMart are encrypted with industry-standard protocols. We never store your card details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 7: PRODUCT REVIEWS
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-5">
                            {/* New review form */}
                            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs max-w-2xl">
                                <h3 className="text-base font-bold text-slate-900 mb-1">Write a Product Review</h3>
                                <p className="text-[13px] text-slate-500 mb-4">Share your feedback to help others choose the right products.</p>

                                {reviewSuccess && (
                                    <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-bold text-[#009E49] flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Thank you! Your review has been submitted for approval.
                                    </div>
                                )}

                                <div className="space-y-3.5">
                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Product Name</label>
                                        <input
                                            type="text"
                                            value={reviewForm.product}
                                            onChange={(e) => setReviewForm({ ...reviewForm, product: e.target.value })}
                                            placeholder="Enter product name..."
                                            className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Rating</label>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="p-1 border-none bg-transparent cursor-pointer"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 transition-colors ${
                                                            star <= reviewForm.rating
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-slate-200'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-[13px] font-bold text-slate-600 ml-2">
                                                {reviewForm.rating} / 5 Stars
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Your Review</label>
                                        <textarea
                                            rows={3}
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            placeholder="Write about the quality, delivery, and your experience..."
                                            className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!reviewForm.product || !reviewForm.comment) return;
                                            setReviews([
                                                ...reviews,
                                                {
                                                    id: Date.now(),
                                                    product: reviewForm.product,
                                                    rating: reviewForm.rating,
                                                    comment: reviewForm.comment,
                                                    date: new Date().toISOString(),
                                                },
                                            ]);
                                            setReviewForm({ product: '', rating: 5, comment: '' });
                                            setReviewSuccess(true);
                                            setTimeout(() => setReviewSuccess(false), 3000);
                                        }}
                                        className="px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer shadow-xs"
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </div>

                            {/* Submitted Reviews */}
                            {reviews.length > 0 && (
                                <div className="space-y-3 max-w-2xl">
                                    <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Your Submitted Reviews</h4>
                                    {reviews.map((rev) => (
                                        <div key={rev.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                                            <div className="flex items-center justify-between mb-1">
                                                <h5 className="text-[14px] font-bold text-slate-800">{rev.product}</h5>
                                                <div className="flex items-center text-amber-400">
                                                    {Array.from({ length: rev.rating }).map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-slate-600 mt-1">{rev.comment}</p>
                                            <p className="text-[12px] text-slate-400 mt-2">{formatDate(rev.date)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 8: SUPPORT TICKETS
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'support' && (
                        <div className="space-y-5">
                            {/* Contact channels */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <a
                                    href="https://wa.me/8801700000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 no-underline hover:border-[#009E49] transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-lg bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-900">WhatsApp Support</p>
                                        <p className="text-[12.5px] text-slate-500">Live chat anytime</p>
                                    </div>
                                </a>

                                <a
                                    href="tel:01700000000"
                                    className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 no-underline hover:border-[#009E49] transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-900">Customer Helpline</p>
                                        <p className="text-[12.5px] text-slate-500">Call 10 AM - 10 PM</p>
                                    </div>
                                </a>

                                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                        <LifeBuoy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-900">Ticket Response Time</p>
                                        <p className="text-[12.5px] text-slate-500">Usually within 2-4 hours</p>
                                    </div>
                                </div>
                            </div>

                            {/* Create Ticket */}
                            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs max-w-2xl">
                                <h3 className="text-base font-bold text-slate-900 mb-1">Open a New Support Ticket</h3>
                                <p className="text-[13px] text-slate-500 mb-4">Have an issue with an order or product? Our support team is here to assist you.</p>

                                {ticketSuccess && (
                                    <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-bold text-[#009E49] flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Support ticket created successfully! We will contact you soon.
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Subject</label>
                                        <input
                                            type="text"
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                            placeholder="Brief description of the issue..."
                                            className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#009E49] focus:ring-3 focus:ring-[#009E49]/15 transition-all bg-white"
                                        />
                                    </div>

                                    {/* Modern Branded Category Select */}
                                    <div className="relative" ref={categoryDropdownRef}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[13px] font-bold text-slate-700">Category</label>
                                            <span className="text-[11px] font-medium text-[#009E49] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                Support Topic
                                            </span>
                                        </div>

                                        {(() => {
                                            const currentCat = TICKET_CATEGORIES.find(c => c.id === newTicket.category) || TICKET_CATEGORIES[0];
                                            const CurrentCatIcon = currentCat.icon;
                                            return (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCategoryOpen(prev => !prev)}
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-left bg-white flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer ${
                                                            isCategoryOpen
                                                                ? 'border-[#009E49] ring-3 ring-[#009E49]/15 shadow-sm'
                                                                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentCat.iconBg}`}>
                                                                <CurrentCatIcon className="w-4 h-4" />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                                                                    {currentCat.label}
                                                                </p>
                                                                <p className="text-[11.5px] text-slate-500 truncate mt-0.5">
                                                                    {currentCat.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-[#009E49]' : ''}`} />
                                                    </button>

                                                    {isCategoryOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xl shadow-slate-900/10 z-40 overflow-hidden py-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
                                                            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                                                                Choose Category
                                                            </div>
                                                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                                                                {TICKET_CATEGORIES.map((cat) => {
                                                                    const CatIcon = cat.icon;
                                                                    const isSelected = newTicket.category === cat.id;
                                                                    return (
                                                                        <button
                                                                            key={cat.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setNewTicket({ ...newTicket, category: cat.id });
                                                                                setIsCategoryOpen(false);
                                                                            }}
                                                                            className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                                                                isSelected
                                                                                    ? 'bg-emerald-50/80 text-[#009E49]'
                                                                                    : 'hover:bg-slate-50 text-slate-700'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-3 min-w-0">
                                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                                                    isSelected ? 'bg-[#009E49] text-white shadow-xs' : cat.iconBg
                                                                                }`}>
                                                                                    <CatIcon className="w-4 h-4" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-[13.5px] leading-tight ${
                                                                                        isSelected ? 'text-[#009E49] font-bold' : 'text-slate-800 font-medium'
                                                                                    }`}>
                                                                                        {cat.label}
                                                                                    </p>
                                                                                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                                                                                        {cat.description}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 ml-2">
                                                                                    <Check className="w-3.5 h-3.5 text-[#009E49] stroke-[2.5]" />
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Message</label>
                                        <textarea
                                            rows={3}
                                            value={newTicket.message}
                                            onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                            placeholder="Provide order number and full details..."
                                            className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#009E49] focus:ring-3 focus:ring-[#009E49]/15 transition-all bg-white"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!newTicket.subject || !newTicket.message) return;
                                            setTickets([
                                                ...tickets,
                                                {
                                                    id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                                                    subject: newTicket.subject,
                                                    status: 'Open',
                                                    date: new Date().toISOString().split('T')[0],
                                                    priority: 'High',
                                                },
                                            ]);
                                            setNewTicket({ subject: '', category: 'Order Issue', message: '' });
                                            setTicketSuccess(true);
                                            setTimeout(() => setTicketSuccess(false), 3000);
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] active:scale-[0.98] transition-all border-none cursor-pointer shadow-xs hover:shadow-md hover:shadow-emerald-600/20"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Submit Ticket
                                    </button>
                                </div>
                            </div>

                            {/* Existing Tickets List */}
                            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden max-w-3xl">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h4 className="text-[14.5px] font-bold text-slate-900">Your Support Tickets</h4>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {tickets.map((tkt) => (
                                        <div key={tkt.id} className="p-4 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-bold text-slate-900 font-mono">#{tkt.id}</span>
                                                    <span className={`text-[12px] px-2.5 py-0.5 rounded-md font-bold ${
                                                        tkt.status === 'Resolved'
                                                            ? 'bg-emerald-50 text-[#009E49]'
                                                            : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                        {tkt.status}
                                                    </span>
                                                </div>
                                                <p className="text-[13.5px] text-slate-800 mt-1 font-medium">{tkt.subject}</p>
                                                <p className="text-[12px] text-slate-400 mt-0.5">Created: {tkt.date}</p>
                                            </div>
                                            <span className="text-[12.5px] text-slate-500 font-semibold">Priority: {tkt.priority}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 9: MANAGE PROFILE
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs max-w-xl space-y-5">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                                <p className="text-[13px] text-slate-500 mt-0.5">Update your contact information and identity.</p>
                            </div>

                            {profileSaved && (
                                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-bold text-[#009E49] flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                                </div>
                            )}

                            <div className="flex items-center gap-4 py-3 border-y border-slate-100">
                                <div className="w-14 h-14 rounded-full bg-[#009E49] text-white flex items-center justify-center font-black text-xl shadow-xs">
                                    {((profileForm.name || 'U').charAt(0)).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-slate-900">{profileForm.name || 'Customer'}</h4>
                                    <p className="text-[13px] text-slate-500">{profileForm.email || profileForm.phone}</p>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.patch(route('profile.update'), {
                                        name: profileForm.name,
                                        email: profileForm.email,
                                    }, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setProfileSaved(true);
                                            setTimeout(() => setProfileSaved(false), 3000);
                                        },
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        disabled
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-[12px] text-slate-400 mt-1">Contact customer care to update registered phone number.</p>
                                </div>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer shadow-xs"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 10: SPECIAL DAYS
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'special_day' && (
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs max-w-xl space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Celebrate Your Special Days</h3>
                                <p className="text-[13px] text-slate-500 mt-0.5">
                                    Register your birthday or anniversary to receive surprise gift vouchers and exclusive discounts from ChutirMart!
                                </p>
                            </div>

                            {specialSaved && (
                                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-bold text-[#009E49] flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Special dates saved! Look forward to exciting surprises on your occasions.
                                </div>
                            )}

                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Your Birthday</label>
                                    <input
                                        type="date"
                                        value={specialDays.birthday}
                                        onChange={(e) => setSpecialDays({ ...specialDays, birthday: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Wedding / Family Anniversary (Optional)</label>
                                    <input
                                        type="date"
                                        value={specialDays.anniversary}
                                        onChange={(e) => setSpecialDays({ ...specialDays, anniversary: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSpecialSaved(true);
                                        setTimeout(() => setSpecialSaved(false), 3000);
                                    }}
                                    className="px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer shadow-xs"
                                >
                                    Save Special Dates
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 11: CHANGE PASSWORD
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'password' && (
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs max-w-xl space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                                <p className="text-[13px] text-slate-500 mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
                            </div>

                            {passwordSaved && (
                                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-bold text-[#009E49] flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Password updated successfully!
                                </div>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.put(route('password.update'), {
                                        current_password: passwordForm.current,
                                        password: passwordForm.newPassword,
                                        password_confirmation: passwordForm.confirmPassword,
                                    }, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setPasswordSaved(true);
                                            setPasswordForm({ current: '', newPassword: '', confirmPassword: '' });
                                            setTimeout(() => setPasswordSaved(false), 3000);
                                        },
                                    });
                                }}
                                className="space-y-3.5"
                            >
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer shadow-xs"
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 12: BECOME AN AGENT
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'agent' && (
                        <div className="space-y-5 max-w-2xl">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-6 text-white shadow-xs">
                                <span className="px-2.5 py-1 rounded-md bg-white/20 text-[11px] font-extrabold uppercase tracking-wider">
                                    Partner Program
                                </span>
                                <h3 className="text-xl font-black mt-2">Become a ChutirMart Agent & Earn Regular Income</h3>
                                <p className="text-[13px] text-emerald-100 mt-1">
                                    Represent authentic local goods, groceries, and seasonal fruits in your locality and earn high commissions on every fulfilled order!
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                                <h4 className="text-base font-bold text-slate-900">Agent Application Form</h4>

                                {agentSubmitted ? (
                                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-bold text-[#009E49] flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        Your agent application has been submitted! Our partner onboarding manager will reach out within 24 hours.
                                    </div>
                                ) : (
                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Your Name</label>
                                            <input
                                                type="text"
                                                value={agentForm.name}
                                                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Contact Phone</label>
                                            <input
                                                type="tel"
                                                value={agentForm.phone}
                                                onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">District / Locality</label>
                                            <input
                                                type="text"
                                                value={agentForm.district}
                                                onChange={(e) => setAgentForm({ ...agentForm, district: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Current Profession</label>
                                            <input
                                                type="text"
                                                value={agentForm.profession}
                                                onChange={(e) => setAgentForm({ ...agentForm, profession: e.target.value })}
                                                placeholder="e.g. Shop Owner, Business, Freelancer..."
                                                className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Why do you want to become an agent?</label>
                                            <textarea
                                                rows={3}
                                                value={agentForm.experience}
                                                onChange={(e) => setAgentForm({ ...agentForm, experience: e.target.value })}
                                                placeholder="Describe your customer network and sales goals..."
                                                className="w-full px-3.5 py-2.5 text-[13.5px] sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setAgentSubmitted(true)}
                                            className="px-5 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer shadow-xs"
                                        >
                                            Submit Agent Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 13: DELETE ACCOUNT
                    ───────────────────────────────────────────────────────────── */}
                    {activeTab === 'delete_account' && (
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-red-200 shadow-xs max-w-xl space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-base font-bold">Permanently Delete Account</h3>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-relaxed">
                                Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-colors border-none cursor-pointer shadow-xs"
                            >
                                Delete Account
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-8 pb-4">
                        <p className="text-[12px] text-slate-400 font-medium">
                            © {new Date().getFullYear()} {store_settings?.site_name ?? 'ChutirMart'} — All Rights Reserved
                        </p>
                    </div>
                </main>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MOBILE APP STICKY BOTTOM NAVIGATION BAR
            ───────────────────────────────────────────────────────────── */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
                <button
                    type="button"
                    onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors border-none bg-transparent cursor-pointer ${
                        activeTab === 'dashboard' ? 'text-[#009E49] font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 tracking-tight">Overview</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setActiveTab('orders'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors border-none bg-transparent cursor-pointer relative ${
                        activeTab === 'orders' ? 'text-[#009E49] font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
                    }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    {stats.total_orders > 0 && (
                        <span className="absolute top-0.5 right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9.5px] font-black flex items-center justify-center">
                            {stats.total_orders}
                        </span>
                    )}
                    <span className="text-[11px] mt-0.5 tracking-tight">Orders</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setActiveTab('wishlist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors border-none bg-transparent cursor-pointer relative ${
                        activeTab === 'wishlist' ? 'text-[#009E49] font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
                    }`}
                >
                    <Heart className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 tracking-tight">Wishlist</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setActiveTab('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors border-none bg-transparent cursor-pointer ${
                        activeTab === 'profile' ? 'text-[#009E49] font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
                    }`}
                >
                    <User className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 tracking-tight">Profile</span>
                </button>
                <Link
                    href={route('home')}
                    className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-500 hover:text-[#009E49] font-medium transition-colors no-underline cursor-pointer"
                >
                    <Store className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 tracking-tight">Shop</span>
                </Link>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                ORDER DETAILS MODAL
            ───────────────────────────────────────────────────────────── */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Order #{selectedOrder.order_number}</h3>
                                <p className="text-[12.5px] text-slate-500 mt-0.5">Placed on {formatDate(selectedOrder.created_at)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Order status card */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                                <div className="mt-1">
                                    <StatusBadge status={selectedOrder.status} />
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Payment</span>
                                <p className="text-[13px] font-bold text-slate-800 mt-1 capitalize">
                                    {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}
                                </p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                            <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Ordered Items</h4>
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="p-3.5 flex items-center justify-between">
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800">{item.product_name}</p>
                                                <p className="text-[12px] text-slate-500 mt-0.5">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                                            </div>
                                            <span className="text-[13.5px] font-black text-slate-900">{formatCurrency(item.total_price)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[12.5px] text-slate-500 italic">Product details included in invoice.</p>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-[13px]">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                            </div>
                            {selectedOrder.delivery_charge !== undefined && selectedOrder.delivery_charge > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Delivery Charge</span>
                                    <span className="font-semibold">{formatCurrency(selectedOrder.delivery_charge)}</span>
                                </div>
                            )}
                            {selectedOrder.coupon_discount !== undefined && selectedOrder.coupon_discount > 0 && (
                                <div className="flex justify-between text-[#009E49] font-bold">
                                    <span>Coupon Discount</span>
                                    <span>-{formatCurrency(selectedOrder.coupon_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-900 font-black pt-2 border-t border-slate-200 text-sm">
                                <span>Total</span>
                                <span className="text-[#009E49] text-[15px]">{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>

                        {/* Courier Tracking */}
                        {selectedOrder.tracking_url && (
                            <a
                                href={selectedOrder.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#009E49] text-white text-[13px] font-bold no-underline hover:bg-[#008A40] transition-colors"
                            >
                                <span>Track with {selectedOrder.courier_name || 'Courier'}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                ADD / EDIT ADDRESS MODAL
            ───────────────────────────────────────────────────────────── */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Delivery Address</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddressModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Recipient Name</label>
                                <input
                                    type="text"
                                    value={addressForm.name}
                                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">District</label>
                                    <input
                                        type="text"
                                        value={addressForm.district}
                                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Thana / Area</label>
                                    <input
                                        type="text"
                                        value={addressForm.thana}
                                        onChange={(e) => setAddressForm({ ...addressForm, thana: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Street Address</label>
                                <textarea
                                    rows={2}
                                    value={addressForm.address}
                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                    placeholder="House, Road, Block, Flat number..."
                                    className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#009E49]"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!addressForm.name || !addressForm.address) return;
                                    setSavedAddresses([
                                        {
                                            id: Date.now(),
                                            title: 'Saved Address',
                                            name: addressForm.name,
                                            phone: addressForm.phone,
                                            district: addressForm.district,
                                            thana: addressForm.thana,
                                            address: addressForm.address,
                                            isDefault: savedAddresses.length === 0,
                                        },
                                    ]);
                                    setShowAddressModal(false);
                                }}
                                className="w-full py-2.5 rounded-lg bg-[#009E49] text-white text-[13.5px] font-bold hover:bg-[#008A40] transition-colors border-none cursor-pointer shadow-xs"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                DELETE ACCOUNT CONFIRMATION MODAL
            ───────────────────────────────────────────────────────────── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-red-600">Confirm Account Deletion</h3>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-[13px] text-slate-600 leading-relaxed">
                            Are you sure you want to delete your account? Once deleted, all your orders and history will be lost. Please enter your password to confirm.
                        </p>

                        <div>
                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your password..."
                                className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg border border-slate-200 focus:outline-none focus:border-red-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-bold hover:bg-slate-200 transition-colors border-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!deletePassword) return;
                                    router.delete(route('profile.destroy'), {
                                        data: { password: deletePassword },
                                    });
                                }}
                                className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-colors border-none cursor-pointer"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

