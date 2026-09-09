import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    TrendingUp, ShoppingBag, Users, ShoppingCart,
    PackagePlus, Package, Store, MessageSquare,
    CheckCircle2, ChevronRight, Lightbulb, Image as ImageIcon,
    Tag, FolderTree, ArrowRight, Truck, Wallet, AlertCircle, Eye,
    Layers, Settings, Clock, ArrowUpRight, Award, ShieldCheck,
    BarChart3, SlidersHorizontal, Check, MoreVertical,
    UserPlus, Plus, XCircle, Calendar, ChevronDown
} from 'lucide-react';

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Today Order', bangla: 'আজকের অর্ডার', icon: '📅' },
    { value: 'yesterday', label: 'Yesterday Order', bangla: 'গতকালকের অর্ডার', icon: '⏳' },
    { value: '7_days', label: '7 Days Order', bangla: 'বিগত ৭ দিন', icon: '🗓️' },
    { value: '30_days', label: '30 Days Order', bangla: 'বিগত ৩০ দিন', icon: '📆' },
    { value: '1_year', label: '1 Year Order', bangla: 'বিগত ১ বছর', icon: '📊' },
    { value: 'all', label: 'All Time Orders', bangla: 'সর্বমোট অর্ডার', icon: '🌐' },
];

interface DashboardProps {
    stats: {
        sales: number;
        revenue: number;
        purchases?: number;
        orders: number;
        orders_amount?: number;
        delivery_charge?: number;
        incomplete_rate?: number;
        customers: number;
    };
    summary: {
        processing: number;
        on_hold: number;
        complete: number;
        cancelled: number;
    };
    lowStock: any[];
    chartData: any[];
    suggestions: any[];
    topProducts: any[];
    selectedPeriod?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
    stats,
    summary,
    lowStock,
    chartData,
    suggestions,
    topProducts,
    selectedPeriod = 'all',
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [periodOpen, setPeriodOpen] = useState(false);
    const periodRef = useRef<HTMLDivElement>(null);

    const currentPeriod = selectedPeriod || 'all';
    const activePeriodObj = PERIOD_OPTIONS.find(p => p.value === currentPeriod) || PERIOD_OPTIONS[5];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
                setPeriodOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelectPeriod = (newPeriod: string) => {
        setPeriodOpen(false);
        router.get(route('admin.dashboard'), { period: newPeriod }, { preserveState: true, preserveScroll: true });
    };

    // ── Chart maths (Responsive wave graph with crisp typography) ──────────────
    const W = 600, H = 180;
    const maxVal = 9800;

    const waveData = [
        { xPct: 0.00, yVal: 2800, label: 'June' },
        { xPct: 0.10, yVal: 1800, label: '' },
        { xPct: 0.22, yVal: 5600, label: 'July' },
        { xPct: 0.33, yVal: 3200, label: '' },
        { xPct: 0.44, yVal: 6800, label: 'August' },
        { xPct: 0.58, yVal: 7800, label: 'September' },
        { xPct: 0.74, yVal: 8792, label: 'October', isPeak: true },
        { xPct: 0.88, yVal: 9500, label: '' },
        { xPct: 1.00, yVal: 7800, label: '03:30 PM' },
    ];

    const pts = waveData.map(p => ({
        x: p.xPct * W,
        y: H - (p.yVal / maxVal) * H,
        xPct: p.xPct,
        yPct: (H - (p.yVal / maxVal) * H) / H,
        salesVal: p.yVal,
        month: p.label,
        isPeak: !!p.isPeak,
    }));

    // Catmull-Rom → cubic bezier for natural wave curve
    const smooth = (points: typeof pts) => {
        if (points.length < 2) return '';
        let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];
            const cp1x = p1.x + (p2.x - p0.x) / 4.5;
            const cp1y = p1.y + (p2.y - p0.y) / 4.5;
            const cp2x = p2.x - (p3.x - p1.x) / 4.5;
            const cp2y = p2.y - (p3.y - p1.y) / 4.5;
            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
        return d;
    };

    const linePath = smooth(pts);
    const areaPath = pts.length > 0
        ? `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`
        : '';

    const peakPoint = pts.find(p => p.isPeak) || pts[6];
    const activePoint = hoveredIndex !== null ? pts[hoveredIndex] : peakPoint;

    // Y-axis fixed scale steps with Bangladeshi Taka ৳ (৳9k, ৳7k, ৳5k, ৳3k, ৳1k)
    const yGuides = [9000, 7000, 5000, 3000, 1000].map(val => ({
        val,
        y: H - (val / maxVal) * H,
        yPct: (H - (val / maxVal) * H) / H,
        label: `৳${val / 1000}k`,
    }));

    /* ── Primary Quick Action Cards ── */
    const primaryActionCards = [
        {
            title: 'Add Product',
            icon: PackagePlus,
            bg: 'bg-[#E1F7EE]',
            color: 'text-[#009E49]',
            route: route('admin.products.create'),
        },
        {
            title: 'Manage Orders',
            icon: ShoppingCart,
            bg: 'bg-[#FFF3E0]',
            color: 'text-[#F57C00]',
            route: route('admin.orders.index'),
        },
        {
            title: 'All Products',
            icon: Package,
            bg: 'bg-[#FFEBEE]',
            color: 'text-[#E53935]',
            route: route('admin.products.index'),
        },
        {
            title: 'Home Banners',
            icon: ImageIcon,
            bg: 'bg-[#E3F2FD]',
            color: 'text-[#1E88E5]',
            route: route('admin.banners.index'),
        },
        {
            title: 'Customers',
            icon: Users,
            bg: 'bg-[#E8F5E9]',
            color: 'text-[#2E7D32]',
            route: route('admin.customers.index'),
        },
        {
            title: 'Messages & Help',
            icon: MessageSquare,
            bg: 'bg-[#E0F7FA]',
            color: 'text-[#00ACC1]',
            route: route('admin.messages.index'),
        },
    ];

    /* ── Secondary Quick Action Cards (With Icons) ── */
    const secondaryActionCards = [
        {
            title: 'Categories',
            icon: FolderTree,
            bg: 'bg-[#F3E5F5]',
            color: 'text-[#8E24AA]',
            route: route('admin.categories.index'),
        },
        {
            title: 'Brands',
            icon: Tag,
            bg: 'bg-[#E0F2F1]',
            color: 'text-[#00897B]',
            route: route('admin.brands.index'),
        },
        {
            title: 'Landing Pages',
            icon: Layers,
            bg: 'bg-[#FFF8E1]',
            color: 'text-[#F57F17]',
            route: route('admin.landing-pages.index'),
        },
        {
            title: 'Store Settings',
            icon: Store,
            bg: 'bg-[#EDE7F6]',
            color: 'text-[#5E35B1]',
            route: route('admin.settings.index'),
        },
        {
            title: 'Courier & Integrations',
            icon: Truck,
            bg: 'bg-[#FCE4EC]',
            color: 'text-[#D81B60]',
            route: route('admin.integrations.index'),
        },
        {
            title: 'Help Center',
            icon: ShieldCheck,
            bg: 'bg-[#E8EAF6]',
            color: 'text-[#3949AB]',
            route: route('admin.help.index'),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-5 sm:space-y-6 w-full max-w-full">

                {/* ── Dashboard Header with Time Period Filter Dropdown ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <h2 className="text-[18px] sm:text-[20px] font-black text-[#1A1A2E] tracking-tight">
                            Dashboard Overview
                        </h2>
                        <p className="text-[11.5px] sm:text-[12px] text-slate-500 mt-0.5">
                            ফিল্টার: <span className="font-bold text-[#009E49]">{activePeriodObj.label} ({activePeriodObj.bangla})</span> এর অর্ডার ও আয় পরিসংখ্যান
                        </p>
                    </div>

                    {/* Dropdown Selector */}
                    <div ref={periodRef} className="relative select-none w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setPeriodOpen(prev => !prev)}
                            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 h-11 sm:h-11 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 text-[14px] sm:text-[14.5px] font-bold shadow-2xs hover:border-[#009E49]/40 transition-all cursor-pointer active:scale-98"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Calendar className="w-4.5 h-4.5 text-[#009E49] shrink-0" />
                                <span className="text-[16px]">{activePeriodObj.icon}</span>
                                <span className="truncate">{activePeriodObj.label}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${periodOpen ? 'rotate-180 text-[#009E49]' : ''}`} />
                        </button>

                        {periodOpen && (
                            <div className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] z-50 w-full sm:w-76 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        সময়কাল নির্বাচন করুন
                                    </span>
                                    <span className="text-[11px] font-extrabold text-[#009E49] bg-[#009E49]/10 px-2 py-0.5 rounded-full">
                                        Filter
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {PERIOD_OPTIONS.map((opt) => {
                                        const isSelected = opt.value === currentPeriod;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleSelectPeriod(opt.value)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border-none ${
                                                    isSelected
                                                        ? 'bg-[#009E49] text-white font-black shadow-md shadow-[#009E49]/20'
                                                        : 'text-slate-800 hover:bg-slate-100/80 hover:text-[#009E49]'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <span className="text-[18px] shrink-0">{opt.icon}</span>
                                                    <span className="text-[14px] font-bold">{opt.label}</span>
                                                </span>
                                                <span className={`text-[12px] font-semibold ${isSelected ? 'text-emerald-100 font-bold' : 'text-slate-500'}`}>
                                                    {opt.bangla}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── TOP SECTION 1: 4 Stat Cards (2 Columns on Mobile, 4 on Desktop with Smooth Modern Styling) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 pt-1 sm:pt-2">
                    
                    {/* Card 1: Total Orders */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-[#009E49] hover:border-[#009E49] hover:shadow-[0_16px_32px_rgba(0,158,73,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-out will-change-transform transform-gpu flex flex-col justify-between group min-h-[135px] sm:min-h-[160px] cursor-pointer select-none">
                        <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0 font-bold shadow-2xs group-hover:bg-white/20 group-hover:text-white transition-all duration-300 ease-out">
                                    <ShoppingCart className="w-4 h-4 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-[13px] sm:text-[16px] font-bold text-slate-800 group-hover:text-white leading-tight truncate transition-colors duration-300 ease-out">
                                        Total Orders
                                    </h4>
                                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 group-hover:text-emerald-100 uppercase tracking-wider mt-0.5 transition-colors duration-300 ease-out">
                                        ORD
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="p-1.5 -mr-1 rounded-lg text-slate-400 group-hover:text-white/90 hover:bg-slate-100 group-hover:hover:bg-white/20 transition-colors duration-200 cursor-pointer border-none bg-transparent hidden sm:inline-flex"
                                title="More options"
                            >
                                <MoreVertical className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        <div className="my-2 sm:my-2.5">
                            <h3 className="text-[17px] xs:text-[20px] sm:text-[28px] lg:text-[30px] font-black text-slate-900 group-hover:text-white leading-tight tracking-tight truncate transition-colors duration-300 ease-out">
                                ৳{stats?.orders_amount ? Number(stats.orders_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                            </h3>
                        </div>

                        <div>
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[13px] font-bold bg-[#E8F8F0] text-[#009E49] border border-transparent group-hover:bg-white/20 group-hover:text-white group-hover:border-white/20 transition-all duration-300 ease-out">
                                <span className="text-[10px] sm:text-[12px]">↑</span>
                                <span>5.2%</span>
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Total Purchase */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-[#009E49] hover:border-[#009E49] hover:shadow-[0_16px_32px_rgba(0,158,73,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-out will-change-transform transform-gpu flex flex-col justify-between group min-h-[135px] sm:min-h-[160px] cursor-pointer select-none">
                        <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0 font-bold shadow-2xs group-hover:bg-white/20 group-hover:text-white transition-all duration-300 ease-out">
                                    <Package className="w-4 h-4 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-[13px] sm:text-[16px] font-bold text-slate-800 group-hover:text-white leading-tight truncate transition-colors duration-300 ease-out">
                                        Total Purchase
                                    </h4>
                                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 group-hover:text-emerald-100 uppercase tracking-wider mt-0.5 transition-colors duration-300 ease-out">
                                        PUR
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="p-1.5 -mr-1 rounded-lg text-slate-400 group-hover:text-white/90 hover:bg-slate-100 group-hover:hover:bg-white/20 transition-colors duration-200 cursor-pointer border-none bg-transparent hidden sm:inline-flex"
                                title="More options"
                            >
                                <MoreVertical className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        <div className="my-2 sm:my-2.5">
                            <h3 className="text-[17px] xs:text-[20px] sm:text-[28px] lg:text-[30px] font-black text-slate-900 group-hover:text-white leading-tight tracking-tight truncate transition-colors duration-300 ease-out">
                                ৳{Number(stats?.purchases ?? stats?.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div>
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[13px] font-bold bg-[#E8F8F0] text-[#009E49] border border-transparent group-hover:bg-white/20 group-hover:text-white group-hover:border-white/20 transition-all duration-300 ease-out">
                                <span className="text-[10px] sm:text-[12px]">↑</span>
                                <span>3.1%</span>
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Total Revenue */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-[#009E49] hover:border-[#009E49] hover:shadow-[0_16px_32px_rgba(0,158,73,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-out will-change-transform transform-gpu flex flex-col justify-between group min-h-[135px] sm:min-h-[160px] cursor-pointer select-none">
                        <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0 font-bold shadow-2xs group-hover:bg-white/20 group-hover:text-white transition-all duration-300 ease-out">
                                    <TrendingUp className="w-4 h-4 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-[13px] sm:text-[16px] font-bold text-slate-800 group-hover:text-white leading-tight truncate transition-colors duration-300 ease-out">
                                        Total Revenue
                                    </h4>
                                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 group-hover:text-emerald-100 uppercase tracking-wider mt-0.5 transition-colors duration-300 ease-out">
                                        REV
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="p-1.5 -mr-1 rounded-lg text-slate-400 group-hover:text-white/90 hover:bg-slate-100 group-hover:hover:bg-white/20 transition-colors duration-200 cursor-pointer border-none bg-transparent hidden sm:inline-flex"
                                title="More options"
                            >
                                <MoreVertical className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        <div className="my-2 sm:my-2.5">
                            <h3 className="text-[17px] xs:text-[20px] sm:text-[28px] lg:text-[30px] font-black text-slate-900 group-hover:text-white leading-tight tracking-tight truncate transition-colors duration-300 ease-out">
                                ৳{Number(stats?.revenue ?? stats?.sales ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div>
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[13px] font-bold bg-[#E8F8F0] text-[#009E49] border border-transparent group-hover:bg-white/20 group-hover:text-white group-hover:border-white/20 transition-all duration-300 ease-out">
                                <span className="text-[10px] sm:text-[12px]">↑</span>
                                <span>5.2%</span>
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Delivery Charge */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-[#009E49] hover:border-[#009E49] hover:shadow-[0_16px_32px_rgba(0,158,73,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-out will-change-transform transform-gpu flex flex-col justify-between group min-h-[135px] sm:min-h-[160px] cursor-pointer select-none">
                        <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0 font-bold shadow-2xs group-hover:bg-white/20 group-hover:text-white transition-all duration-300 ease-out">
                                    <Truck className="w-4 h-4 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-[13px] sm:text-[16px] font-bold text-slate-800 group-hover:text-white leading-tight truncate transition-colors duration-300 ease-out">
                                        Delivery Charge
                                    </h4>
                                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 group-hover:text-emerald-100 uppercase tracking-wider mt-0.5 transition-colors duration-300 ease-out">
                                        LOGISTICS
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="p-1.5 -mr-1 rounded-lg text-slate-400 group-hover:text-white/90 hover:bg-slate-100 group-hover:hover:bg-white/20 transition-colors duration-200 cursor-pointer border-none bg-transparent hidden sm:inline-flex"
                                title="More options"
                            >
                                <MoreVertical className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        <div className="my-2 sm:my-2.5">
                            <h3 className="text-[17px] xs:text-[20px] sm:text-[28px] lg:text-[30px] font-black text-slate-900 group-hover:text-white leading-tight tracking-tight truncate transition-colors duration-300 ease-out">
                                ৳{Number(stats?.delivery_charge ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div>
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[13px] font-bold bg-[#E8F8F0] text-[#009E49] border border-transparent group-hover:bg-white/20 group-hover:text-white group-hover:border-white/20 transition-all duration-300 ease-out">
                                <span className="text-[10px] sm:text-[12px]">↑</span>
                                <span>6.3%</span>
                            </span>
                        </div>
                    </div>

                </div>

                {/* ── Status Metrics Badges (Modern 2-Col Mobile & 4-Col Desktop Grid) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {/* Processing */}
                    <Link
                        href={route('admin.orders.index', { status: 'processing' })}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#FFB300]/60 hover:bg-amber-50/10 transition-all duration-200 group cursor-pointer no-underline active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#FFB300] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                Processing
                            </span>
                        </div>
                        <span className="px-2.5 py-1 min-w-7 rounded-lg bg-[#FFB300] text-white text-[12px] sm:text-[13px] font-black text-center shadow-2xs shrink-0">
                            {summary?.processing ?? 0}
                        </span>
                    </Link>

                    {/* On Hold */}
                    <Link
                        href={route('admin.orders.index', { status: 'on_hold' })}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#009E49]/60 hover:bg-emerald-50/10 transition-all duration-200 group cursor-pointer no-underline active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#009E49] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                On Hold
                            </span>
                        </div>
                        <span className="px-2.5 py-1 min-w-7 rounded-lg bg-[#009E49] text-white text-[12px] sm:text-[13px] font-black text-center shadow-2xs shrink-0">
                            {summary?.on_hold ?? 0}
                        </span>
                    </Link>

                    {/* Completed */}
                    <Link
                        href={route('admin.orders.index', { status: 'complete' })}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#1E88E5]/60 hover:bg-blue-50/10 transition-all duration-200 group cursor-pointer no-underline active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E88E5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                Completed
                            </span>
                        </div>
                        <span className="px-2.5 py-1 min-w-7 rounded-lg bg-[#1E88E5] text-white text-[12px] sm:text-[13px] font-black text-center shadow-2xs shrink-0">
                            {summary?.complete ?? 0}
                        </span>
                    </Link>

                    {/* Cancelled */}
                    <Link
                        href={route('admin.orders.index', { status: 'cancelled' })}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#E53935]/60 hover:bg-red-50/10 transition-all duration-200 group cursor-pointer no-underline active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E53935] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                <XCircle className="w-4 h-4" />
                            </div>
                            <span className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                Cancelled
                            </span>
                        </div>
                        <span className="px-2.5 py-1 min-w-7 rounded-lg bg-[#E53935] text-white text-[12px] sm:text-[13px] font-black text-center shadow-2xs shrink-0">
                            {summary?.cancelled ?? 0}
                        </span>
                    </Link>
                </div>

                {/* ── SECTION 2: 6 Primary Action Cards with Icons ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {primaryActionCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                href={card.route}
                                className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_26px_rgba(0,158,73,0.22)] hover:bg-[#009E49] hover:border-[#009E49] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-lg ${card.bg} ${card.color} group-hover:bg-white group-hover:text-[#009E49] flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-all duration-200 shadow-2xs group-hover:shadow-md`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 group-hover:text-white transition-colors duration-200 leading-snug">
                                    {card.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* ── SECTION 3: 6 Secondary Action Cards with Icons ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {secondaryActionCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                href={card.route}
                                className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_26px_rgba(0,158,73,0.22)] hover:bg-[#009E49] hover:border-[#009E49] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-lg ${card.bg} ${card.color} group-hover:bg-white group-hover:text-[#009E49] flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-all duration-200 shadow-2xs group-hover:shadow-md`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 group-hover:text-white transition-colors duration-200 leading-snug">
                                    {card.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* ── Notice Banner ── */}
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-4 sm:p-5 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
                    <p className="text-[14px] sm:text-[15px] font-semibold text-[#5D4037]">
                        Welcome to ChutirMart Admin Dashboard. Manage your inventory, orders, and promotions smoothly.
                    </p>
                    <Link
                        href={route('admin.products.create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#009E49] hover:bg-[#00873E] text-white text-[13.5px] sm:text-[14px] font-bold shadow-xs hover:shadow-md hover:shadow-[#009E49]/30 hover:-translate-y-0.5 active:scale-98 transition-all shrink-0"
                    >
                        <PackagePlus className="w-4.5 h-4.5" /> Add Product
                    </Link>
                </div>

                {/* ── Suggestions banner (if any) ── */}
                {suggestions && suggestions.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs overflow-hidden">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <h4 className="text-[13.5px] sm:text-[14px] font-bold text-amber-900">Smart Suggestions</h4>
                            {suggestions.map((s, i) => (
                                <p key={i} className="text-[12.5px] sm:text-[13px] text-amber-800 mt-0.5 break-words">● {s.message}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SECTION 4: 2x2 Clean Analytics Grid (Matching Reference Design) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                    
                    {/* ── CARD 1: Revenue this week (Full Edge-to-Edge Wave Graph) ── (lg:col-span-7 xl:col-span-7) */}
                    <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,158,73,0.12)] hover:border-[#009E49]/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[14px] sm:text-[15px] text-slate-500 font-semibold tracking-normal">Revenue this week</p>
                                <h3 className="text-[32px] sm:text-[40px] font-extrabold text-slate-900 mt-1 leading-none tracking-tight">
                                    ৳{Math.round(activePoint ? activePoint.salesVal : (stats?.revenue > 0 ? stats.revenue : 8792)).toLocaleString()}
                                </h3>
                            </div>
                            <div className="w-11 h-11 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-[#009E49] shadow-2xs">
                                <BarChart3 className="w-5.5 h-5.5 stroke-[2.2]" />
                            </div>
                        </div>

                        {/* Chart Container: Y-axis (HTML) + Wave Canvas (SVG) + Tooltip (HTML) + X-axis (HTML) */}
                        <div className="w-full mt-4 sm:mt-5">
                            {/* Top row: Left Y-axis labels + Right Graph Canvas */}
                            <div className="flex items-start gap-1.5 sm:gap-2.5 w-full">
                                {/* Left Y-axis column (Crisp, High-Contrast, Real Responsive Fonts) */}
                                <div className="relative w-8 sm:w-10 h-[175px] sm:h-[215px] shrink-0 select-none">
                                    {yGuides.map((g, i) => (
                                        <span
                                            key={i}
                                            className="absolute right-0 -translate-y-1/2 text-[11px] sm:text-[12.5px] font-bold text-slate-400 tracking-tight"
                                            style={{ top: `${g.yPct * 100}%` }}
                                        >
                                            {g.label}
                                        </span>
                                    ))}
                                </div>

                                {/* Right Graph Canvas & Overlay Container */}
                                <div className="flex-1 min-w-0">
                                    <div className="relative w-full h-[175px] sm:h-[215px]">
                                        {/* SVG Wave Graph & Grid */}
                                        <svg
                                            viewBox={`0 0 ${W} ${H}`}
                                            preserveAspectRatio="none"
                                            className="w-full h-full overflow-visible"
                                        >
                                            <defs>
                                                <linearGradient id="brandRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#009E49" stopOpacity="0.22" />
                                                    <stop offset="60%" stopColor="#10B981" stopOpacity="0.05" />
                                                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.00" />
                                                </linearGradient>
                                            </defs>

                                            {/* Horizontal Reference Dashed Lines */}
                                            {yGuides.map((g, i) => (
                                                <line
                                                    key={i}
                                                    x1="0"
                                                    y1={g.y}
                                                    x2={W}
                                                    y2={g.y}
                                                    stroke="#E2E8F0"
                                                    strokeWidth={g.val === 9000 ? "1.2" : "1"}
                                                    strokeDasharray={g.val === 9000 ? "6 6" : "4 4"}
                                                />
                                            ))}

                                            {/* Y-axis vertical baseline */}
                                            <line
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2={H}
                                                stroke="#E2E8F0"
                                                strokeWidth="1.5"
                                            />

                                            {/* X-axis bottom baseline */}
                                            <line
                                                x1="0"
                                                y1={H}
                                                x2={W}
                                                y2={H}
                                                stroke="#E2E8F0"
                                                strokeWidth="1.5"
                                            />

                                            {/* Semi-transparent gradient area fill underneath curve */}
                                            {areaPath && <path d={areaPath} fill="url(#brandRevenueGrad)" />}

                                            {/* Smooth Multi-Wave Line Curve in Brand Emerald */}
                                            {linePath && (
                                                <path
                                                    d={linePath}
                                                    fill="none"
                                                    stroke="#009E49"
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            )}
                                        </svg>

                                        {/* Active Data Point Indicator & Tooltip */}
                                        {activePoint && (
                                            <>
                                                {/* Vertical dashed drop line */}
                                                <div
                                                    className="absolute bottom-0 w-px border-l-2 border-dashed border-emerald-400 pointer-events-none transition-all duration-150"
                                                    style={{
                                                        left: `${activePoint.xPct * 100}%`,
                                                        top: `${activePoint.yPct * 100}%`,
                                                    }}
                                                />

                                                {/* Active Point Circle (HTML 1:1 round, animated pulse ring) */}
                                                <div
                                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-all duration-150"
                                                    style={{
                                                        left: `${activePoint.xPct * 100}%`,
                                                        top: `${activePoint.yPct * 100}%`,
                                                    }}
                                                >
                                                    <span className="absolute -inset-2 rounded-full bg-[#009E49]/25 animate-ping" />
                                                    <span className="relative block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-[3px] border-[#009E49] shadow-sm" />
                                                </div>

                                                {/* Tooltip Speech Bubble (Large, High-Contrast, Easily Readable) */}
                                                <div
                                                    className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-[calc(100%+10px)] flex flex-col items-center transition-all duration-150 ease-out select-none"
                                                    style={{
                                                        left: `${Math.min(90, Math.max(10, activePoint.xPct * 100))}%`,
                                                        top: `${activePoint.yPct * 100}%`,
                                                    }}
                                                >
                                                    <div className="px-3 py-1.5 rounded-lg bg-[#009E49] text-white text-[13px] sm:text-[14.5px] font-black shadow-lg tracking-tight whitespace-nowrap flex items-center gap-1">
                                                        <span>৳{Math.round(activePoint.salesVal).toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#009E49] -mt-px" />
                                                </div>
                                            </>
                                        )}

                                        {/* Interactive hover/tap hitboxes */}
                                        <div className="absolute inset-0 flex z-20">
                                            {pts.map((p, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 h-full cursor-pointer"
                                                    onMouseEnter={() => setHoveredIndex(i)}
                                                    onTouchStart={() => setHoveredIndex(i)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* X-axis Month Labels (Crisp, High-Contrast, Big & Responsive) */}
                                    <div className="relative w-full h-6 mt-2.5 select-none">
                                        {waveData.filter(d => d.label).map((p, idx, arr) => {
                                            const isFirst = idx === 0;
                                            const isLast = idx === arr.length - 1;
                                            const isHighlighted = activePoint?.month === p.label;
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`absolute text-[11px] sm:text-[13px] font-bold tracking-tight whitespace-nowrap transition-colors cursor-pointer ${
                                                        p.isPeak || isHighlighted
                                                            ? 'text-[#009E49] font-black'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    } ${
                                                        isFirst ? 'left-0' : isLast ? 'right-0' : '-translate-x-1/2'
                                                    }`}
                                                    style={!isFirst && !isLast ? { left: `${p.xPct * 100}%` } : undefined}
                                                    onClick={() => {
                                                        const ptIdx = pts.findIndex(pt => pt.month === p.label);
                                                        if (ptIdx !== -1) setHoveredIndex(ptIdx);
                                                    }}
                                                >
                                                    {p.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 2: Store visits (Add New Customer Button + 3 Progress Bars) ── (lg:col-span-5 xl:col-span-5) */}
                    <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-xl p-6 sm:p-7 flex flex-col justify-between border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,158,73,0.12)] hover:border-[#009E49]/40 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-[18px] sm:text-[19px] font-extrabold text-slate-900">Store visits</h3>
                                <p className="text-[13px] text-slate-500 font-semibold mt-0.5">Details about your store visits</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <SlidersHorizontal className="w-4.5 h-4.5" />
                            </div>
                        </div>

                        {/* ── Add New Customer Action Button (With Branding Hover & Modern Shadow) ── */}
                        <Link
                            href={route('admin.customers.index')}
                            className="p-3.5 rounded-lg bg-[#E1F7EE] hover:bg-[#009E49] border border-[#009E49]/25 hover:border-[#009E49] flex items-center justify-between my-3 transition-all duration-200 group shadow-2xs hover:shadow-[0_10px_24px_rgba(0,158,73,0.25)] hover:-translate-y-0.5 cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-lg bg-[#009E49] group-hover:bg-white text-white group-hover:text-[#009E49] shadow-xs flex items-center justify-center group-hover:scale-105 transition-all">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[14.5px] sm:text-[15px] font-bold text-slate-800 group-hover:text-white transition-colors">
                                        Add New Customer
                                    </h4>
                                    <p className="text-[12.5px] font-bold text-[#009E49] group-hover:text-emerald-100 transition-colors">
                                        Create customer profile
                                    </p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#009E49]/15 flex items-center justify-center text-[#009E49] shadow-2xs group-hover:bg-white group-hover:text-[#009E49] group-hover:translate-x-0.5 transition-all">
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                            </div>
                        </Link>

                        {/* 3 Progress Bars */}
                        <div className="space-y-4 my-1">
                            {[
                                { label: 'Men', pct: 30, color: '#F97316' },
                                { label: 'Women', pct: 70, color: '#009E49' },
                                { label: 'Visits/day', pct: 60, color: '#F43F5E' },
                            ].map(({ label, pct, color }) => (
                                <div key={label} className="space-y-1.5">
                                    <div className="flex justify-between text-[13.5px] font-bold text-slate-700">
                                        <span>{label}</span>
                                        <span className="font-extrabold text-slate-900">{pct}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── CARD 3: Top Products (Clean list with thumbnail, date, price pill, earnings pill, action) ── (lg:col-span-7 xl:col-span-7) */}
                    <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-xl p-6 sm:p-7 flex flex-col justify-between border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,158,73,0.12)] hover:border-[#009E49]/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-[18px] sm:text-[19px] font-extrabold text-slate-900">Top Products</h3>
                                <p className="text-[13px] text-slate-500 font-semibold mt-0.5">Best selling products in your store</p>
                            </div>
                            <Link
                                href={route('admin.products.index')}
                                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                title="View All Products"
                            >
                                <SlidersHorizontal className="w-4.5 h-4.5" />
                            </Link>
                        </div>

                        {/* Top Products Table with Responsive scroll */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="pb-3 px-2 w-8">#</th>
                                        <th className="pb-3 px-3">Product</th>
                                        <th className="pb-3 px-3">Date</th>
                                        <th className="pb-3 px-3">Price</th>
                                        <th className="pb-3 px-3">Earnings</th>
                                        <th className="pb-3 px-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/80">
                                    {topProducts && topProducts.length > 0 ? (
                                        topProducts.slice(0, 4).map((prod, i) => {
                                            const price = Number(prod.price || prod.selling_price || 1200);
                                            const totalEarning = Number(prod.total_earnings || prod.revenue || price * (prod.sales_count || 12));
                                            const dateFormatted = prod.created_at ? new Date(prod.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '24 Apr';

                                            return (
                                                <tr key={prod.id || i} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="py-3.5 px-2">
                                                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-[#009E49] flex items-center justify-center font-bold text-[11px]">
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center p-0.5">
                                                                <img
                                                                    src={prod.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                                    onError={e => {
                                                                        (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                                    }}
                                                                    alt={prod.name}
                                                                    className="w-full h-full object-cover rounded-md"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[13.5px] sm:text-[14px] font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[200px]" title={prod.name}>
                                                                    {prod.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-[13px] font-semibold text-slate-600 whitespace-nowrap">
                                                        {dateFormatted}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100/70 text-[12.5px] font-black">
                                                            ৳{price.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-[#009E49] border border-emerald-100/70 text-[12.5px] font-black">
                                                            ৳{totalEarning.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-2 text-right">
                                                        <Link
                                                            href={route('admin.products.edit', { id: prod.id })}
                                                            className="w-7 h-7 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-400 text-[13.5px]">
                                                No products recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── CARD 4: Customers (Metrics list + Modern Multi-Ring SVG Donut Gauge) ── (lg:col-span-5 xl:col-span-5) */}
                    <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-xl p-6 sm:p-7 flex flex-col justify-between border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,158,73,0.12)] hover:border-[#009E49]/40 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-[18px] sm:text-[19px] font-extrabold text-slate-900">Customers</h3>
                                <p className="text-[13px] text-slate-500 font-semibold mt-0.5">Information about your store's customers</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <SlidersHorizontal className="w-4.5 h-4.5" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 my-auto py-2">
                            {/* Left Metric Items */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#009E49]" />
                                        <span className="text-[12.5px] font-semibold text-slate-500">Current customers</span>
                                    </div>
                                    <p className="text-[15px] sm:text-[16px] font-black text-slate-800 pl-4 mt-0.5">66%</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                                        <span className="text-[12.5px] font-semibold text-slate-500">New customers</span>
                                    </div>
                                    <p className="text-[15px] sm:text-[16px] font-black text-slate-800 pl-4 mt-0.5">48%</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                        <span className="text-[12.5px] font-semibold text-slate-500">Retargeted customers</span>
                                    </div>
                                    <p className="text-[15px] sm:text-[16px] font-black text-slate-800 pl-4 mt-0.5">25%</p>
                                </div>
                            </div>

                            {/* Right Multi-Ring Circular Donut Gauge */}
                            <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                    <defs>
                                        <linearGradient id="custGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#009E49" />
                                            <stop offset="60%" stopColor="#10B981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    {/* Background base ring */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="46"
                                        stroke="#F1F5F9"
                                        strokeWidth="11"
                                        fill="none"
                                    />
                                    {/* Amber Ring (Retargeted) */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="46"
                                        stroke="#F59E0B"
                                        strokeWidth="11"
                                        fill="none"
                                        strokeDasharray="289"
                                        strokeDashoffset="216"
                                        strokeLinecap="round"
                                    />
                                    {/* Rose Ring (New) */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="46"
                                        stroke="#F43F5E"
                                        strokeWidth="11"
                                        fill="none"
                                        strokeDasharray="289"
                                        strokeDashoffset="150"
                                        strokeLinecap="round"
                                    />
                                    {/* Emerald Brand Ring (Current) */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="46"
                                        stroke="url(#custGrad)"
                                        strokeWidth="11"
                                        fill="none"
                                        strokeDasharray="289"
                                        strokeDashoffset="98"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                                    <span className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-none">139%</span>
                                    <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
};

export default Dashboard;
