import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, AdminPagination, StatusPill, IconBtn, PageHeader } from '@/components/admin/ui';
import {
    Eye, ShoppingBag, Plus, Search, Clock,
    AlertCircle, CheckCircle2, XCircle, Trash2, FileQuestion, ShoppingCart,
    Truck, Send, RefreshCw, Copy, ExternalLink, CheckSquare, Square,
    ChevronDown, ChevronLeft, ChevronRight, BarChart2, X, Loader2, TrendingUp, RotateCcw, Package, ShieldCheck,
    Phone, MessageSquare, MapPin, ArrowRight
} from 'lucide-react';

import { toast, Toaster } from 'sonner';



/* ─────────────────────────────────────────────────────
 *  Custom Courier Dropdown — fully styled, brand colors
 * ───────────────────────────────────────────────────── */
const COURIER_OPTIONS = [
    { value: 'steadfast', label: 'Steadfast',  emoji: '🚚' },
    { value: 'paperfly',  label: 'Paperfly',   emoji: '📬' },
    { value: 'carrybee',  label: 'Carrybee',   emoji: '🐝' },
    { value: 'pathao',    label: 'Pathao',      emoji: '🛵' },
    { value: 'redx',      label: 'RedX',        emoji: '🔴' },
    { value: 'custom',    label: 'Custom',      emoji: '📦' },
];

interface CourierSelectProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}

const CourierSelect: React.FC<CourierSelectProps> = ({ value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = COURIER_OPTIONS.find(o => o.value === value) || COURIER_OPTIONS[0];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative select-none">
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(prev => !prev)}
                className={`
                    flex items-center gap-1.5 h-8 px-2.5 rounded-lg
                    bg-white
                    border ${open ? 'border-[#009E49] ring-2 ring-[#009E49]/15' : 'border-slate-200 hover:border-[#009E49]/50'}
                    text-[12px] font-semibold text-slate-700 hover:text-[#009E49]
                    shadow-2xs
                    transition-all duration-150
                    cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    whitespace-nowrap
                `}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-[#009E49] shrink-0" />
                <span>{selected.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-[#009E49]' : ''}`} />
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="
                    absolute left-0 top-[calc(100%+4px)] z-50
                    w-38
                    bg-white
                    rounded-lg
                    border border-slate-200
                    shadow-lg
                    p-1
                    animate-in fade-in zoom-in-95 duration-100
                ">
                    {COURIER_OPTIONS.map((opt, idx) => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`
                                    w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md
                                    text-[11.5px] text-left font-medium
                                    transition-colors duration-100 cursor-pointer border-none
                                    ${isSelected
                                        ? 'bg-[#009E49] text-white font-semibold shadow-2xs'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                `}
                            >
                                <span className="text-[12px]">{opt.emoji}</span>
                                <span>{opt.label}</span>
                                {isSelected && (
                                    <CheckCircle2 className="w-3 h-3 ml-auto text-white" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────
 *  Customer Success Rate Modal (Steadfast-style popup)
 * ───────────────────────────────────────────────────── */
interface CourierStats {
    customer_name: string;
    mobile: string;
    total_orders: number;
    delivered: number;
    cancelled: number;
    processing: number;
    total_spent: number;
    courier_sent: number;
    success_rate: number;
    has_fraud?: boolean;
    fraud_reports?: any[];
    source?: string;
}

const CustomerSuccessModal: React.FC<{
    mobile: string | null;
    customerName: string;
    courierName?: string;
    onClose: () => void;
}> = ({ mobile, customerName, courierName = 'SteadFast', onClose }) => {
    const [stats, setStats] = useState<CourierStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadStats = () => {
        if (!mobile) return;
        setLoading(true);
        setErrorMsg(null);
        setStats(null);

        // Derive accurate endpoint based on current page URL so subfolder installations (e.g. /chutirmart/public) never 404
        let url = '';
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const adminIdx = path.indexOf('/admin');
            if (adminIdx !== -1) {
                const adminBase = path.substring(0, adminIdx + 6);
                url = `${adminBase}/customers/courier-stats?mobile=${encodeURIComponent(mobile)}`;
            }
        }
        if (!url) {
            try {
                url = route('admin.customers.courier-stats', { mobile });
            } catch {
                url = `/admin/customers/courier-stats?mobile=${encodeURIComponent(mobile)}`;
            }
        }

        fetch(url, {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(async res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load courier stats:', err);
                setErrorMsg('কুরিয়ার ডাটা লোড করা সম্ভব হয়নি।');
                setLoading(false);
            });
    };


    useEffect(() => {
        loadStats();
    }, [mobile]);

    if (!mobile) return null;

    const formattedTitle = courierName
        ? courierName.charAt(0).toUpperCase() + courierName.slice(1).toLowerCase()
        : 'SteadFast';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[370px] overflow-hidden p-6 animate-in zoom-in-95 duration-200 border border-slate-100">

                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#006837]" />
                        <h3 className="text-[17px] font-extrabold text-[#0F291E]">
                            {formattedTitle === 'Steadfast' ? 'SteadFast' : formattedTitle} Success Rate
                        </h3>
                        {stats?.source === 'steadfast_live' && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Live
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border-none cursor-pointer"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="pt-4 pb-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2.5">
                            <Loader2 className="w-7 h-7 text-[#006837] animate-spin" />
                            <p className="text-[12px] text-slate-400 font-medium">SteadFast লাইভ হিস্ট্রি লোড হচ্ছে...</p>
                        </div>
                    ) : errorMsg || !stats ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 font-bold text-xs mb-3">{errorMsg || 'কোনো ডাটা পাওয়া যায়নি'}</p>
                            <button
                                type="button"
                                onClick={loadStats}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
                            >
                                আবার চেষ্টা করুন
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Live Fraud Check Status Banner (Matching Steadfast Portal) */}
                            <div className={`mb-3.5 p-2.5 rounded-lg flex items-center gap-2 text-[12px] font-bold ${
                                stats.has_fraud
                                    ? 'bg-red-50 border border-red-200 text-red-700'
                                    : 'bg-[#EAF8EE] border border-[#D2EED9] text-[#0F291E]'
                            }`}>
                                <ShieldCheck className={`w-4 h-4 shrink-0 ${stats.has_fraud ? 'text-red-600' : 'text-[#009E49]'}`} />
                                <span>
                                    {stats.has_fraud
                                        ? `সতর্কতা: ${stats.fraud_reports?.length || 1}টি ফ্রড রিপোর্ট পাওয়া গেছে!`
                                        : 'The number has no fraud history!'}
                                </span>
                            </div>

                            {/* Total Orders */}
                            <div className="flex items-center justify-between py-2 text-[14px]">
                                <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    <span>Total Orders:</span>
                                </div>
                                <span className="font-bold text-slate-800 text-[15px]">
                                    {stats.total_orders}
                                </span>
                            </div>

                            <div className="border-b border-dashed border-slate-200/80 my-2.5" />

                            {/* Total Delivered */}
                            <div className="flex items-center justify-between py-2 text-[14px]">
                                <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Total Delivered:</span>
                                </div>
                                <span className="font-bold text-slate-800 text-[15px]">
                                    {stats.delivered}
                                </span>
                            </div>

                            <div className="border-b border-dashed border-slate-200/80 my-2.5" />

                            {/* Total Cancelled */}
                            <div className="flex items-center justify-between py-2 text-[14px]">
                                <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span>Total Cancelled:</span>
                                </div>
                                <span className="font-bold text-slate-800 text-[15px]">
                                    {stats.cancelled}
                                </span>
                            </div>

                            {/* Success Ratio Box */}
                            <div className="mt-5 mb-5 p-4 rounded-lg bg-[#EAF8EE] border border-[#D2EED9]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[14px] font-bold text-[#0F291E]">Success Ratio</span>
                                    <span className="text-[18px] font-extrabold text-[#006837]">
                                        {stats.success_rate}%
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-[#C9E7D1] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 bg-[#009E49]"
                                        style={{ width: `${stats.success_rate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>



                {/* Footer / Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-[#005E26] hover:bg-[#004B1E] text-white font-bold text-[15px] border-none cursor-pointer transition-colors shadow-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
};



interface IndexProps {
    orders: { data: any[]; links: any[]; total: number; };
    status: string;
    filters: { q?: string; };
    couriers?: Array<{
        id: string;
        name: string;
        is_enabled: boolean;
        is_default: boolean;
    }>;
    stats: {
        all: number;
        processing: number;
        on_hold: number;
        complete: number;
        cancelled: number;
        trash: number;
        incomplete: number;
    };
}

export const Index: React.FC<IndexProps> = ({ orders, status = 'all', filters, couriers = [], stats }) => {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedBulkCourier, setSelectedBulkCourier] = useState<string>('steadfast');
    const [isSubmittingCourier, setIsSubmittingCourier] = useState<number | null>(null);
    // Per-row courier selection: { [orderId]: 'steadfast' | 'paperfly' | ... }
    const [rowCourierMap, setRowCourierMap] = useState<Record<number, string>>({});
    // Customer stats modal
    const [statsModal, setStatsModal] = useState<{ mobile: string; name: string; courier?: string } | null>(null);

    // Mobile Status Tabs Carousel logic
    const statusTabsRef = useRef<HTMLDivElement>(null);
    const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
    const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
    const [isDraggingTabs, setIsDraggingTabs] = useState(false);
    const [hasDraggedTabs, setHasDraggedTabs] = useState(false);
    const tabsStartX = useRef(0);
    const tabsStartScroll = useRef(0);

    const checkTabsScroll = () => {
        if (!statusTabsRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = statusTabsRef.current;
        setCanScrollTabsLeft(scrollLeft > 5);
        setCanScrollTabsRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    useEffect(() => {
        checkTabsScroll();
        const el = statusTabsRef.current;
        if (!el) return;

        el.addEventListener('scroll', checkTabsScroll, { passive: true });
        window.addEventListener('resize', checkTabsScroll);

        return () => {
            el.removeEventListener('scroll', checkTabsScroll);
            window.removeEventListener('resize', checkTabsScroll);
        };
    }, []);

    // Auto-center active status tab on status change or initial render
    useEffect(() => {
        if (!statusTabsRef.current) return;
        const activeBtn = statusTabsRef.current.querySelector<HTMLElement>(`[data-status-tab="${status}"]`);
        if (activeBtn) {
            const container = statusTabsRef.current;
            const targetScroll = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.offsetWidth / 2);
            container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
        }
        setTimeout(checkTabsScroll, 300);
    }, [status]);

    const handleTabsMouseDown = (e: React.MouseEvent) => {
        if (!statusTabsRef.current) return;
        setIsDraggingTabs(true);
        setHasDraggedTabs(false);
        tabsStartX.current = e.pageX - statusTabsRef.current.offsetLeft;
        tabsStartScroll.current = statusTabsRef.current.scrollLeft;
    };

    const handleTabsMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingTabs || !statusTabsRef.current) return;
        e.preventDefault();
        const x = e.pageX - statusTabsRef.current.offsetLeft;
        const walk = (x - tabsStartX.current) * 1.4;
        if (Math.abs(walk) > 4) {
            setHasDraggedTabs(true);
        }
        statusTabsRef.current.scrollLeft = tabsStartScroll.current - walk;
    };

    const handleTabsMouseUpOrLeave = () => {
        setIsDraggingTabs(false);
        setTimeout(() => setHasDraggedTabs(false), 50);
    };

    const scrollTabs = (direction: 'left' | 'right') => {
        if (!statusTabsRef.current) return;
        const distance = 200;
        statusTabsRef.current.scrollBy({
            left: direction === 'left' ? -distance : distance,
            behavior: 'smooth',
        });
    };

    const getRowCourier = (orderId: number) => rowCourierMap[orderId] || 'steadfast';
    const setRowCourier = (orderId: number, val: string) =>
        setRowCourierMap(prev => ({ ...prev, [orderId]: val }));

    const triggerSearch = (queryVal: string) => {
        setIsSearching(true);
        router.get(
            route('admin.orders.index', { status }),
            queryVal.trim() ? { q: queryVal.trim() } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            triggerSearch(val);
        }, 220);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        triggerSearch('');
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        triggerSearch(searchQuery);
    };

    const handleSelectAll = () => {
        if (selectedOrders.length === orders.data.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.data.map(o => o.id));
        }
    };

    const toggleSelectOrder = (id: number) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSendToCourier = (orderId: number, courierName?: string) => {
        setIsSubmittingCourier(orderId);
        router.post(route('admin.orders.courier.send', { id: orderId }), {
            courier_name: courierName
        }, {
            onSuccess: () => {
                setIsSubmittingCourier(null);
                toast.success('Order sent to Courier! 📦');
            },
            onError: (err) => {
                setIsSubmittingCourier(null);
                toast.error(String(Object.values(err)[0] || 'Failed to send to courier.'));
            }
        });
    };

    const handleTrackCourier = (orderId: number) => {
        setIsSubmittingCourier(orderId);
        router.post(route('admin.orders.courier.track', { id: orderId }), {}, {
            onSuccess: () => {
                setIsSubmittingCourier(null);
                toast.success('Courier tracking status refreshed! 🔄');
            },
            onError: () => {
                setIsSubmittingCourier(null);
                toast.error('Failed to track courier status.');
            }
        });
    };

    const handleBulkSendCourier = () => {
        if (selectedOrders.length === 0) {
            toast.error('Please select at least one order.');
            return;
        }

        router.post(route('admin.orders.courier.bulk-send'), {
            order_ids: selectedOrders,
            courier_name: selectedBulkCourier
        }, {
            onSuccess: () => {
                setSelectedOrders([]);
                toast.success('Selected orders sent to Courier! 🚚');
            },
            onError: () => toast.error('Bulk courier dispatch failed.')
        });
    };

    const handleCopyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard! 📋`);
    };

    const ACTIVE_CARD = 'ring-2 ring-[#009E49] border-[#009E49]/50 bg-[#E1F7EE]/60 shadow-xs';

    const statusCards = [
        {
            key: 'all',
            label: 'All Orders',
            count: stats.all ?? 0,
            icon: ShoppingBag,
            iconBg: 'bg-[#E1F7EE]',
            iconColor: 'text-[#009E49]',
            sub: 'Total Placed',
        },
        {
            key: 'processing',
            label: 'Processing',
            count: stats.processing ?? 0,
            icon: Clock,
            iconBg: 'bg-[#FFF3E0]',
            iconColor: 'text-[#F57C00]',
            sub: 'Needs Action',
        },
        {
            key: 'on_hold',
            label: 'On Hold',
            count: stats.on_hold ?? 0,
            icon: AlertCircle,
            iconBg: 'bg-[#EDE7F6]',
            iconColor: 'text-[#5E35B1]',
            sub: 'Awaiting Review',
        },
        {
            key: 'complete',
            label: 'Completed',
            count: stats.complete ?? 0,
            icon: CheckCircle2,
            iconBg: 'bg-[#E8F5E9]',
            iconColor: 'text-[#2E7D32]',
            sub: 'Delivered',
        },
        {
            key: 'cancelled',
            label: 'Cancelled',
            count: stats.cancelled ?? 0,
            icon: XCircle,
            iconBg: 'bg-[#FFEBEE]',
            iconColor: 'text-[#C62828]',
            sub: 'Void / Returned',
        },
        {
            key: 'trash',
            label: 'Trash',
            count: stats.trash ?? 0,
            icon: Trash2,
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-500',
            sub: 'Deleted',
        },
        {
            key: 'incomplete',
            label: 'Incomplete',
            count: stats.incomplete ?? 0,
            icon: FileQuestion,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            sub: 'Abandoned',
        },
    ];

    return (
        <AdminLayout>
            <Toaster position="top-center" richColors />
            <Head title="Order Management & Courier Shipping | ChutirMart" />

            <div className="w-full max-w-full space-y-6">
                <PageHeader
                    title="Order Management"
                    subtitle="Track customer orders, manage statuses, and dispatch parcels to couriers in real time."
                    action={
                        <Link href={route('admin.orders.create')}>
                            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#009E49] text-white text-xs font-semibold shadow-xs hover:bg-[#007F3B] hover:shadow-sm active:scale-98 transition-all border-none cursor-pointer select-none">
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Create Order</span>
                            </button>
                        </Link>
                    }
                />

                {/* ── Mobile Status Carousel (Touch Swipe + Drag + Arrow Controls) ── */}
                <div className="md:hidden relative group select-none">
                    {/* Left Carousel Arrow */}
                    {canScrollTabsLeft && (
                        <button
                            type="button"
                            onClick={() => scrollTabs('left')}
                            aria-label="Scroll left"
                            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200/90 hover:bg-[#009E49] hover:text-white transition-all active:scale-90 cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}

                    {/* Scrollable Track */}
                    <div
                        ref={statusTabsRef}
                        onMouseDown={handleTabsMouseDown}
                        onMouseMove={handleTabsMouseMove}
                        onMouseUp={handleTabsMouseUpOrLeave}
                        onMouseLeave={handleTabsMouseUpOrLeave}
                        className={`flex items-center gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 no-scrollbar scroll-smooth ${
                            isDraggingTabs ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        {statusCards.map(card => {
                            const Icon = card.icon;
                            const isSelected = status === card.key;
                            return (
                                <Link
                                    key={card.key}
                                    data-status-tab={card.key}
                                    href={route('admin.orders.index', { status: card.key })}
                                    onClick={(e) => {
                                        if (hasDraggedTabs) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-all no-underline select-none active:scale-95 ${
                                        isSelected
                                            ? 'bg-[#009E49] text-white shadow-xs ring-2 ring-[#009E49]/25'
                                            : 'bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : card.iconColor}`} />
                                    <span>{card.label}</span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {card.count}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Carousel Arrow */}
                    {canScrollTabsRight && (
                        <button
                            type="button"
                            onClick={() => scrollTabs('right')}
                            aria-label="Scroll right"
                            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200/90 hover:bg-[#009E49] hover:text-white transition-all active:scale-90 cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── Desktop Status Grid ── */}
                <div className="hidden md:grid sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    {statusCards.map(card => {
                        const Icon = card.icon;
                        const isSelected = status === card.key;
                        return (
                            <Link
                                key={card.key}
                                href={route('admin.orders.index', { status: card.key })}
                                className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                                    isSelected
                                        ? ACTIVE_CARD
                                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                                }`}
                            >
                                <div className="min-w-0">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 truncate">
                                        {card.label}
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                                        {card.count}
                                    </div>
                                </div>
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ml-2`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* ── Search & Bulk Action Bar ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                                isSearching || searchQuery ? 'text-[#009E49]' : 'text-slate-400'
                            }`} />
                            <input
                                type="text"
                                placeholder="অর্ডার নম্বর, কাস্টমারের নাম, মোবাইল বা ট্র্যাকিং কোড দিয়ে খুঁজুন..."
                                value={searchQuery}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full h-10 pl-10 pr-20 rounded-lg border border-slate-200 bg-white text-[13px] sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all shadow-2xs"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {isSearching && (
                                    <Loader2 className="w-3.5 h-3.5 text-[#009E49] animate-spin" />
                                )}
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Bulk Courier Dispatch Action Bar */}
                    {selectedOrders.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-300 p-2 sm:p-1.5 sm:px-3 rounded-lg animate-in fade-in duration-150">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-900 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                                    {selectedOrders.length} Selected
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrders([])}
                                    className="text-[11px] text-slate-500 hover:text-slate-800 underline bg-transparent border-none cursor-pointer p-0"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <CourierSelect
                                    value={selectedBulkCourier}
                                    onChange={val => setSelectedBulkCourier(val)}
                                />
                                <button
                                    type="button"
                                    onClick={handleBulkSendCourier}
                                    className="h-8 px-3 rounded-lg bg-[#009E49] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#007F3B] transition-colors border-none cursor-pointer shrink-0"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send to Courier</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Orders Container ── */}
                <AdminCard className="overflow-hidden border-slate-200/80">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 border-none bg-transparent cursor-pointer p-0 select-none"
                                title="Select All"
                            >
                                {selectedOrders.length > 0 && selectedOrders.length === orders.data.length ? (
                                    <CheckSquare className="w-5 h-5 text-[#009E49]" />
                                ) : (
                                    <Square className="w-5 h-5 text-gray-400" />
                                )}
                                <h3 className="text-[14px] sm:text-[15px] font-black text-slate-800">Order List</h3>
                            </button>
                        </div>
                        <span className="text-[11.5px] sm:text-[12px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold">
                            {orders.total} orders
                        </span>
                    </div>

                    {orders.data.length === 0 ? (
                        <div className="text-center py-16 sm:py-20 text-slate-400 px-4">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-[15px] font-semibold text-slate-600">কোনো অর্ডার পাওয়া যায়নি</p>
                        </div>
                    ) : (
                        <>
                            {/* ── Mobile View: Native App-Style Order Cards (md:hidden) ── */}
                            <div className="block md:hidden divide-y divide-slate-100 bg-slate-50/50 p-3 space-y-3">
                                {orders.data.map(order => {
                                    const isSelected = selectedOrders.includes(order.id);
                                    const hasCourier = Boolean(order.courier_tracking_code || order.consignment_id);
                                    const cleanPhone = order.mobile ? order.mobile.replace(/\D/g, '') : '';
                                    const whatsappPhone = cleanPhone.startsWith('88') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
                                    const whatsappUrl = cleanPhone ? `https://wa.me/${whatsappPhone}` : null;
                                    const telUrl = order.mobile ? `tel:${order.mobile.replace(/\s+/g, '')}` : null;

                                    return (
                                        <div
                                            key={order.id}
                                            className={`bg-white rounded-xl border transition-all p-3.5 sm:p-4 shadow-2xs ${
                                                isSelected ? 'border-[#009E49] ring-2 ring-[#009E49]/20 bg-emerald-50/10' : 'border-slate-200/80'
                                            }`}
                                        >
                                            {/* Top: Checkbox, Order Number, Date, Status */}
                                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectOrder(order.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#009E49] focus:ring-[#009E49] cursor-pointer"
                                                    />
                                                    <Link
                                                        href={route('admin.orders.show', { id: order.id })}
                                                        className="font-mono text-[13.5px] font-black text-[#009E49] hover:underline"
                                                    >
                                                        #{order.order_number}
                                                    </Link>
                                                </div>
                                                <StatusPill status={order.status} />
                                            </div>

                                            {/* Customer & Contact Actions */}
                                            <div className="py-2.5 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[14px] font-bold text-slate-800">{order.customer_name}</h4>
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                {order.district && (
                                                    <p className="text-[12px] text-slate-500 flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{order.district}</span>
                                                    </p>
                                                )}

                                                {/* One-Tap Contact Actions: Call, WhatsApp, Steadfast Rate */}
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    {telUrl && (
                                                        <a
                                                            href={telUrl}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#009E49] border border-emerald-200/80 text-[11px] font-bold transition-all active:scale-95 no-underline"
                                                            title={`Call ${order.mobile}`}
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            <span>{order.mobile}</span>
                                                        </a>
                                                    )}

                                                    {whatsappUrl && (
                                                        <a
                                                            href={whatsappUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 text-[11px] font-bold transition-all active:scale-95 no-underline"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <MessageSquare className="w-3 h-3 text-[#25D366]" />
                                                            <span>WhatsApp</span>
                                                        </a>
                                                    )}

                                                    {order.mobile && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setStatsModal({
                                                                mobile: order.mobile,
                                                                name: order.customer_name,
                                                                courier: getRowCourier(order.id)
                                                            })}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer"
                                                            title="Customer Delivery Rate"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                            <span>Rate</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price & Payment Summary */}
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 my-2">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</span>
                                                    <div className="text-[16px] font-black text-slate-800">৳{order.total}</div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="text-[11px] font-bold text-slate-600 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-md inline-block">
                                                        {order.payment_method || 'COD'}
                                                    </div>
                                                    <div>
                                                        <StatusPill status={order.payment_status} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Courier Shipping & Dispatch Section */}
                                            <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courier & Shipping</div>
                                                {hasCourier ? (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                                                    {order.courier_name || 'Courier'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    {order.courier_status || 'Sent'}
                                                                </span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleTrackCourier(order.id)}
                                                                disabled={isSubmittingCourier === order.id}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#009E49] text-[10.5px] font-bold cursor-pointer transition-all disabled:opacity-50"
                                                                title="Refresh Live Courier Status"
                                                            >
                                                                <RefreshCw className={`w-3 h-3 ${isSubmittingCourier === order.id ? 'animate-spin' : ''}`} />
                                                                <span>Refresh</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 bg-white p-1.5 rounded-lg border border-slate-200">
                                                            <span className="truncate">{order.courier_tracking_code || order.consignment_id}</span>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopyText(order.courier_tracking_code || order.consignment_id, 'Tracking Code')}
                                                                    className="p-1 text-slate-400 hover:text-emerald-600 border-none bg-transparent cursor-pointer"
                                                                    title="Copy Tracking"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </button>
                                                                {order.tracking_url && (
                                                                    <a
                                                                        href={order.tracking_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1 text-slate-400 hover:text-blue-600"
                                                                        title="Open Courier Portal Tracking"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <CourierSelect
                                                                value={getRowCourier(order.id)}
                                                                onChange={val => setRowCourier(order.id, val)}
                                                                disabled={isSubmittingCourier === order.id}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSendToCourier(order.id, getRowCourier(order.id))}
                                                            disabled={isSubmittingCourier === order.id}
                                                            className="h-8 px-3 rounded-lg bg-[#009E49] hover:bg-[#00873E] text-white text-[12px] font-bold border-none shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                                                        >
                                                            {isSubmittingCourier === order.id ? (
                                                                <>
                                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                    <span>Sending...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="w-3.5 h-3.5" />
                                                                    <span>Send</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Action Footer */}
                                            <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-end">
                                                <Link
                                                    href={route('admin.orders.show', { id: order.id })}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#009E49] hover:text-white text-[#009E49] text-[12px] font-bold transition-colors no-underline"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View Details</span>
                                                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Desktop View: Full Data Table (hidden md:block) ── */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200/80 bg-slate-50/80">
                                            <th className="w-10 px-4 py-3.5 text-center"></th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Order No.</th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Customer</th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Total Price</th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Status</th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Courier & Tracking</th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Date</th>
                                            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {orders.data.map(order => {
                                            const isSelected = selectedOrders.includes(order.id);
                                            const hasCourier = Boolean(order.courier_tracking_code || order.consignment_id);

                                            return (
                                                <tr key={order.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                                                    <td className="px-4 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectOrder(order.id)}
                                                            className="w-4 h-4 rounded border-gray-300 text-[#009E49] focus:ring-[#009E49] cursor-pointer"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="font-mono text-[13.5px] font-bold text-[#009E49]">
                                                            #{order.order_number}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-semibold">{order.payment_method?.toUpperCase()}</div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="text-[13.5px] font-bold text-slate-800">{order.customer_name}</div>
                                                        <div className="text-[12px] text-slate-500 font-mono mt-0.5">{order.mobile}</div>
                                                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{order.district}</div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="text-[14px] font-black text-slate-800">৳{order.total}</div>
                                                        <div className="mt-1">
                                                            <StatusPill status={order.payment_status} />
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <StatusPill status={order.status} />
                                                    </td>

                                                    {/* Courier & Tracking Column */}
                                                    <td className="px-4 py-4">
                                                        {hasCourier ? (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                                                        {order.courier_name || 'Courier'}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {order.courier_status || 'Sent'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-700">
                                                                    <span>{order.courier_tracking_code || order.consignment_id}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopyText(order.courier_tracking_code || order.consignment_id, 'Tracking Code')}
                                                                        className="text-gray-400 hover:text-emerald-600 border-none bg-transparent cursor-pointer p-0.5"
                                                                        title="Copy Tracking"
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </button>
                                                                    {order.tracking_url && (
                                                                        <a 
                                                                            href={order.tracking_url} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="text-gray-400 hover:text-blue-600"
                                                                            title="Open Courier Portal Tracking"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                    {order.mobile && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setStatsModal({
                                                                                mobile: order.mobile,
                                                                                name: order.customer_name,
                                                                                courier: order.courier_name || 'SteadFast'
                                                                            })}
                                                                            className="text-gray-400 hover:text-[#005E26] border-none bg-transparent cursor-pointer p-0.5 ml-1"
                                                                            title="কাস্টমার সাকসেস রেট দেখুন"
                                                                        >
                                                                            <RotateCcw className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* ── Per-row Courier Select + Send Button ── */
                                                            <div className="flex items-center gap-2">
                                                                <CourierSelect
                                                                    value={getRowCourier(order.id)}
                                                                    onChange={val => setRowCourier(order.id, val)}
                                                                    disabled={isSubmittingCourier === order.id}
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSendToCourier(order.id, getRowCourier(order.id))}
                                                                    disabled={isSubmittingCourier === order.id}
                                                                    className="
                                                                        h-8 px-3 rounded-lg
                                                                        bg-[#009E49] hover:bg-[#00873E] active:scale-98
                                                                        text-white text-[12px] font-semibold
                                                                        border-none
                                                                        shadow-xs hover:shadow-sm
                                                                        transition-all duration-150
                                                                        flex items-center gap-1.5
                                                                        cursor-pointer
                                                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                                                                        whitespace-nowrap select-none
                                                                    "
                                                                    title={`Send to ${getRowCourier(order.id)} Courier`}
                                                                >
                                                                    {isSubmittingCourier === order.id ? (
                                                                        <>
                                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                            <span>Sending...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Send className="w-3.5 h-3.5" />
                                                                            <span>Send</span>
                                                                        </>
                                                                    )}
                                                                </button>

                                                                {order.mobile && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setStatsModal({
                                                                            mobile: order.mobile,
                                                                            name: order.customer_name,
                                                                            courier: getRowCourier(order.id)
                                                                        })}
                                                                        className="
                                                                            w-8 h-8 rounded-lg
                                                                            bg-slate-100 hover:bg-slate-200
                                                                            border border-slate-200
                                                                            text-slate-600 hover:text-[#009E49]
                                                                            flex items-center justify-center
                                                                            transition-all duration-150
                                                                            cursor-pointer
                                                                            shrink-0
                                                                            shadow-2xs
                                                                        "
                                                                        title={`${order.customer_name} এর কুরিয়ার সাকসেস রেট দেখুন`}
                                                                    >
                                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-[12px] text-slate-500 font-medium whitespace-nowrap">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {hasCourier && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTrackCourier(order.id)}
                                                                    disabled={isSubmittingCourier === order.id}
                                                                    className="
                                                                        p-2 rounded-xl
                                                                        bg-slate-100 hover:bg-slate-200
                                                                        text-slate-600 hover:text-[#009E49]
                                                                        shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,158,73,0.15)]
                                                                        border-none cursor-pointer
                                                                        transition-all duration-150
                                                                        disabled:opacity-50
                                                                    "
                                                                    title="Refresh Live Courier Status"
                                                                >
                                                                    <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingCourier === order.id ? 'animate-spin' : ''}`} />
                                                                </button>
                                                            )}
                                                            <Link href={route('admin.orders.show', { id: order.id })}>
                                                                <IconBtn color="orange" title="View Order Details">
                                                                    <Eye className="w-4 h-4" />
                                                                </IconBtn>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    <AdminPagination links={orders.links} />
                </AdminCard>
            </div>

            {/* ── Customer Success Rate Modal (Steadfast UI) ── */}
            {statsModal && (
                <CustomerSuccessModal
                    mobile={statsModal.mobile}
                    customerName={statsModal.name}
                    courierName={statsModal.courier}
                    onClose={() => setStatsModal(null)}
                />
            )}
        </AdminLayout>
    );
};

export default Index;
