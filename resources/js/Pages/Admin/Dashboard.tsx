import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    TrendingUp, ShoppingBag, Users, ShoppingCart,
    PackagePlus, Package, Store, MessageSquare,
    CheckCircle2, ChevronRight, Lightbulb, Image as ImageIcon,
    Tag, FolderTree, ArrowRight, Truck, Wallet, AlertCircle, Eye,
    Layers, Settings, Clock, ArrowUpRight, Award, ShieldCheck,
    BarChart3, SlidersHorizontal, Check, MoreVertical,
    UserPlus, Plus
} from 'lucide-react';

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
}

export const Dashboard: React.FC<DashboardProps> = ({
    stats,
    summary,
    lowStock,
    chartData,
    suggestions,
    topProducts
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // ── Chart maths (Exact alignment to card margins & header) ──────────────
    const W = 760, H = 220;
    const PAD = { t: 36, r: 8, b: 24, l: 30 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const maxVal = 9800;

    const waveData = [
        { xPct: 0.00, yVal: 2800, label: 'June' },
        { xPct: 0.10, yVal: 1800, label: '' },
        { xPct: 0.22, yVal: 5600, label: 'July' },
        { xPct: 0.33, yVal: 3200, label: '' },
        { xPct: 0.42, yVal: 6800, label: 'August' },
        { xPct: 0.58, yVal: 7800, label: 'September' },
        { xPct: 0.74, yVal: 8792, label: 'October', isPeak: true },
        { xPct: 0.88, yVal: 9500, label: '' },
        { xPct: 1.00, yVal: 7800, label: '03:30 PM' },
    ];

    const pts = waveData.map(p => ({
        x: PAD.l + p.xPct * innerW,
        y: PAD.t + innerH - (p.yVal / maxVal) * innerH,
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
        ? `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.b} L ${pts[0].x} ${H - PAD.b} Z`
        : '';

    const peakPoint = pts.find(p => p.isPeak) || pts[6];
    const activePoint = hoveredIndex !== null ? pts[hoveredIndex] : peakPoint;

    // Y-axis fixed scale steps with Bangladeshi Taka ৳ (৳1k, ৳3k, ৳5k, ৳7k, ৳9k)
    const yGuides = [1000, 3000, 5000, 7000, 9000].map(val => ({
        y: PAD.t + innerH - (val / maxVal) * innerH,
        label: `৳${val / 1000}k`,
    }));

    const topGuideY = PAD.t + innerH - (9000 / maxVal) * innerH;

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

            <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">

                {/* ── TOP SECTION 1: 4 Modern Clean Stat Cards (Reference Match) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    
                    {/* Card 1: TOTAL ORDERS */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group min-h-[142px]">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
                                    TOTAL ORDERS
                                </p>
                                <h3 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 mt-1.5 leading-none tracking-tight">
                                    ৳ {stats?.orders_amount ? stats.orders_amount.toLocaleString() : '0'}
                                </h3>
                            </div>
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                                <ShoppingCart className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                            </div>
                        </div>
                        <div className="mt-5 pt-1">
                            <p className="text-[12px] sm:text-[12.5px] font-bold text-slate-700 flex items-center gap-1 leading-tight">
                                Trending up this week <span className="text-emerald-600 font-bold">↑</span>
                            </p>
                            <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                DATA FROM LAST 7 DAYS
                            </p>
                        </div>
                    </div>

                    {/* Card 2: TOTAL PURCHASE */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group min-h-[142px]">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
                                    TOTAL PURCHASE
                                </p>
                                <h3 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 mt-1.5 leading-none tracking-tight">
                                    ৳ {((stats?.purchases ?? stats?.revenue ?? 0)).toFixed(2)}
                                </h3>
                            </div>
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                                <Package className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                            </div>
                        </div>
                        <div className="mt-5 pt-1">
                            <p className="text-[12px] sm:text-[12.5px] font-bold text-slate-700 flex items-center gap-1 leading-tight">
                                Consistent buying trend <span className="text-emerald-600 font-bold">↑</span>
                            </p>
                            <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                STABLE VENDOR ACTIVITY
                            </p>
                        </div>
                    </div>

                    {/* Card 3: DELIVERY CHARGE */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group min-h-[142px]">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
                                    DELIVERY CHARGE
                                </p>
                                <h3 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 mt-1.5 leading-none tracking-tight">
                                    ৳ {(stats?.delivery_charge ?? 0).toFixed(2)}
                                </h3>
                            </div>
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                                <Truck className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                            </div>
                        </div>
                        <div className="mt-5 pt-1">
                            <p className="text-[12px] sm:text-[12.5px] font-bold text-slate-700 flex items-center gap-1 leading-tight">
                                Regular logistic cost <span className="text-emerald-600 font-bold">↑</span>
                            </p>
                            <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                WITHIN EXPECTED RANGE
                            </p>
                        </div>
                    </div>

                    {/* Card 4: INCOMPLETE CONVERSION */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group min-h-[142px]">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
                                    INCOMPLETE CONVERSION
                                </p>
                                <h3 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 mt-1.5 leading-none tracking-tight">
                                    {(stats?.incomplete_rate ?? 0).toFixed(1)}%
                                </h3>
                            </div>
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF1F2] text-[#F43F5E] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                                <AlertCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                            </div>
                        </div>
                        <div className="mt-5 pt-1">
                            <p className="text-[12px] sm:text-[12.5px] font-bold text-slate-700 flex items-center gap-1 leading-tight">
                                Needs attention <span className="text-rose-600 font-bold">↓</span>
                            </p>
                            <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                CONVERSION TRACKING ACTIVE
                            </p>
                        </div>
                    </div>

                </div>

                {/* ── Status Metrics Badges (Small Pills) ── */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-0.5">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
                        <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-500">Processing:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB300] text-white text-[11px] sm:text-[12px] font-black">
                            {summary?.processing ?? 0}
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
                        <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-500">On Hold:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#009E49] text-white text-[11px] sm:text-[12px] font-black">
                            {summary?.on_hold ?? 0}
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
                        <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-500">Completed:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#1E88E5] text-white text-[11px] sm:text-[12px] font-black">
                            {summary?.complete ?? 0}
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
                        <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-500">Cancelled:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#E53935] text-white text-[11px] sm:text-[12px] font-black">
                            {summary?.cancelled ?? 0}
                        </span>
                    </div>
                </div>

                {/* ── SECTION 2: 6 Primary Action Cards with Icons ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {primaryActionCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                href={card.route}
                                className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:border-slate-200 transition-all duration-300 group"
                            >
                                <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform shadow-2xs`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <span className="text-[12px] sm:text-[13.5px] font-bold text-slate-800 group-hover:text-[#009E49] transition-colors leading-snug">
                                    {card.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* ── SECTION 3: 6 Secondary Action Cards with Icons (Matching Style) ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {secondaryActionCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                href={card.route}
                                className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:border-slate-200 transition-all duration-300 group"
                            >
                                <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform shadow-2xs`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <span className="text-[12px] sm:text-[13.5px] font-bold text-slate-800 group-hover:text-[#009E49] transition-colors leading-snug">
                                    {card.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* ── Notice Banner ── */}
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-3.5 sm:p-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
                    <p className="text-[12.5px] sm:text-[13.5px] font-semibold text-[#5D4037]">
                        Welcome to ChutirMart Admin Dashboard. Manage your inventory, orders, and promotions smoothly.
                    </p>
                    <Link
                        href={route('admin.products.create')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#009E49] hover:bg-[#00873E] text-white text-xs sm:text-[13px] font-semibold shadow-xs hover:shadow-sm active:scale-98 transition-all shrink-0"
                    >
                        <PackagePlus className="w-4 h-4" /> Add Product
                    </Link>
                </div>

                {/* ── Suggestions banner (if any) ── */}
                {suggestions && suggestions.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs overflow-hidden">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <h4 className="text-[13px] sm:text-[13.5px] font-bold text-amber-900">Smart Suggestions</h4>
                            {suggestions.map((s, i) => (
                                <p key={i} className="text-[12.5px] sm:text-[13px] text-amber-800 mt-0.5 break-words">● {s.message}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SECTION 4: 2x2 Clean Analytics Grid (Matching Reference Design) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                    
                    {/* ── CARD 1: Revenue this week (Full Edge-to-Edge Wave Graph) ── (lg:col-span-7 xl:col-span-7) */}
                    <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100/90 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[13.5px] sm:text-[14px] text-slate-400 font-medium tracking-normal">Revenue this week</p>
                                <h3 className="text-[32px] sm:text-[38px] font-extrabold text-slate-900 mt-1 leading-none tracking-tight">
                                    ৳{Math.round(activePoint ? activePoint.salesVal : (stats?.revenue > 0 ? stats.revenue : 8792)).toLocaleString()}
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#009E49] shadow-2xs">
                                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
                            </div>
                        </div>

                        {/* Chart (Natural multi-wave Catmull-Rom curve matching reference design) */}
                        <div className="w-full max-w-full overflow-hidden mt-3" style={{ height: H }}>
                            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                                <defs>
                                    <linearGradient id="brandRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#009E49" stopOpacity="0.18" />
                                        <stop offset="60%" stopColor="#10B981" stopOpacity="0.04" />
                                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.00" />
                                    </linearGradient>
                                </defs>

                                {/* Top Horizontal Reference Dashed Line (9k Peak Level) */}
                                <line
                                    x1={PAD.l}
                                    y1={topGuideY}
                                    x2={W - PAD.r}
                                    y2={topGuideY}
                                    stroke="#E2E8F0"
                                    strokeWidth="1"
                                    strokeDasharray="6 6"
                                />

                                {/* Y-axis vertical axis line */}
                                <line
                                    x1={PAD.l}
                                    y1={PAD.t - 10}
                                    x2={PAD.l}
                                    y2={H - PAD.b}
                                    stroke="#E2E8F0"
                                    strokeWidth="1"
                                />

                                {/* Y-axis guides & ticks */}
                                {yGuides.map((g, i) => (
                                    <g key={i}>
                                        <line
                                            x1={PAD.l - 4}
                                            y1={g.y}
                                            x2={PAD.l + 4}
                                            y2={g.y}
                                            stroke="#CBD5E1"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={PAD.l - 5}
                                            y={g.y + 3.5}
                                            textAnchor="end"
                                            fontSize="10"
                                            fill="#94A3B8"
                                            fontWeight="500"
                                            className="font-sans select-none"
                                        >
                                            {g.label}
                                        </text>
                                    </g>
                                ))}

                                {/* X-axis bottom baseline */}
                                <line
                                    x1={PAD.l}
                                    y1={H - PAD.b}
                                    x2={W - PAD.r}
                                    y2={H - PAD.b}
                                    stroke="#E2E8F0"
                                    strokeWidth="1"
                                />

                                {/* X-axis ticks and month labels */}
                                {pts.map((p, i) => (
                                    <g key={i}>
                                        {p.month && (
                                            <>
                                                <line
                                                    x1={p.x}
                                                    y1={H - PAD.b - 4}
                                                    x2={p.x}
                                                    y2={H - PAD.b + 4}
                                                    stroke="#CBD5E1"
                                                    strokeWidth="1.2"
                                                />
                                                <text
                                                    x={p.x}
                                                    y={H - PAD.b + 18}
                                                    textAnchor={i === 0 ? 'start' : (i === pts.length - 1 ? 'end' : 'middle')}
                                                    fontSize="10.5"
                                                    fill="#94A3B8"
                                                    fontWeight="500"
                                                    className="font-sans select-none"
                                                >
                                                    {p.month}
                                                </text>
                                            </>
                                        )}
                                    </g>
                                ))}

                                {/* Semi-transparent gradient area fill underneath curve */}
                                {areaPath && <path d={areaPath} fill="url(#brandRevenueGrad)" />}

                                {/* Smooth Multi-Wave Line Curve in Brand Emerald */}
                                {linePath && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="#009E49"
                                        strokeWidth="3.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}

                                {/* Active Highlighted Data Point (Vertical drop-line, circle & speech bubble tooltip) */}
                                {activePoint && (() => {
                                    const tooltipWidth = 80;
                                    const tooltipHeight = 26;
                                    const tooltipX = Math.min(W - PAD.r - tooltipWidth / 2, Math.max(PAD.l + tooltipWidth / 2, activePoint.x));
                                    return (
                                        <g className="transition-all duration-150 pointer-events-none select-none">
                                            {/* Vertical dashed drop-line from point to X-axis */}
                                            <line
                                                x1={activePoint.x}
                                                y1={activePoint.y}
                                                x2={activePoint.x}
                                                y2={H - PAD.b}
                                                stroke="#A7F3D0"
                                                strokeWidth="1.5"
                                                strokeDasharray="4 4"
                                            />

                                            {/* Outer pulse aura */}
                                            <circle
                                                cx={activePoint.x}
                                                cy={activePoint.y}
                                                r="9"
                                                fill="#009E49"
                                                opacity="0.18"
                                            />

                                            {/* Inner white circle with emerald ring */}
                                            <circle
                                                cx={activePoint.x}
                                                cy={activePoint.y}
                                                r="4.5"
                                                fill="#FFFFFF"
                                                stroke="#009E49"
                                                strokeWidth="3"
                                            />

                                            {/* Speech Bubble Pill Box */}
                                            <rect
                                                x={tooltipX - tooltipWidth / 2}
                                                y={activePoint.y - 36}
                                                width={tooltipWidth}
                                                height={tooltipHeight}
                                                rx="7"
                                                fill="#009E49"
                                            />

                                            {/* Downward Pointer Triangle */}
                                            <polygon
                                                points={`${activePoint.x - 4.5},${activePoint.y - 10} ${activePoint.x + 4.5},${activePoint.y - 10} ${activePoint.x},${activePoint.y - 5}`}
                                                fill="#009E49"
                                            />

                                            {/* Tooltip Currency Text (Bangladeshi Taka ৳) */}
                                            <text
                                                x={tooltipX}
                                                y={activePoint.y - 19}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontWeight="800"
                                                fill="#FFFFFF"
                                                className="font-sans select-none"
                                            >
                                                ৳{Math.round(activePoint.salesVal).toLocaleString()}
                                            </text>
                                        </g>
                                    );
                                })()}

                                {/* Interactive hover hitboxes */}
                                {pts.map((p, i) => (
                                    <rect
                                        key={i}
                                        x={p.x - innerW / (pts.length * 2)}
                                        y={PAD.t - 10}
                                        width={innerW / pts.length}
                                        height={innerH + PAD.b + 10}
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* ── CARD 2: Store visits (Add New Customer Button + 3 Progress Bars) ── (lg:col-span-5 xl:col-span-5) */}
                    <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100/90 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-900">Store visits</h3>
                                <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Details about your store visits</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <SlidersHorizontal className="w-4 h-4" />
                            </div>
                        </div>

                        {/* ── Add New Customer Action Button (Replacing Pro Analytics) ── */}
                        <Link
                            href={route('admin.customers.index')}
                            className="p-4 rounded-2xl bg-[#E1F7EE] hover:bg-[#D4F4E4] border border-[#009E49]/20 flex items-center justify-between my-4 transition-all duration-200 group shadow-2xs cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#009E49] text-white shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[13.5px] sm:text-[14px] font-bold text-slate-800 group-hover:text-[#009E49] transition-colors">
                                        Add New Customer
                                    </h4>
                                    <p className="text-[11.5px] font-semibold text-[#009E49]">
                                        Create customer profile
                                    </p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-white border border-[#009E49]/15 flex items-center justify-center text-[#009E49] shadow-2xs group-hover:translate-x-0.5 transition-transform">
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
                                    <div className="flex justify-between text-[13px] font-semibold text-slate-600">
                                        <span>{label}</span>
                                        <span className="font-bold text-slate-800">{pct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
                    <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100/90 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-900">Top Products</h3>
                                <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Best selling products in your store</p>
                            </div>
                            <Link
                                href={route('admin.products.index')}
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                title="View All Products"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 pb-3 px-2 text-[11px] font-medium text-slate-400 w-6">
                                            <span className="w-3.5 h-3.5 rounded-full border border-slate-200 inline-block" />
                                        </th>
                                        <th className="py-2.5 pb-3 px-3 text-[11.5px] font-medium text-slate-400 uppercase tracking-wider">Product name</th>
                                        <th className="py-2.5 pb-3 px-3 text-[11.5px] font-medium text-slate-400 uppercase tracking-wider">Date added</th>
                                        <th className="py-2.5 pb-3 px-3 text-[11.5px] font-medium text-slate-400 uppercase tracking-wider">Price</th>
                                        <th className="py-2.5 pb-3 px-3 text-[11.5px] font-medium text-slate-400 uppercase tracking-wider">Total Earning</th>
                                        <th className="py-2.5 pb-3 px-2 text-[11.5px] font-medium text-slate-400 uppercase tracking-wider text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50/80">
                                    {topProducts && topProducts.length > 0 ? (
                                        topProducts.slice(0, 3).map((prod, idx) => {
                                            const price = parseFloat(prod.price) || 0;
                                            const sold = prod.total_sold || (idx === 0 ? 15 : (idx === 1 ? 9 : 6));
                                            const totalEarning = price * sold;
                                            const dateFormatted = prod.created_at
                                                ? new Date(prod.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : (idx === 0 ? 'December 12, 2025' : (idx === 1 ? 'January 28, 2026' : 'March 22, 2026'));

                                            return (
                                                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors group">
                                                    <td className="py-3.5 px-2">
                                                        <div className="w-4 h-4 rounded-full bg-[#009E49] text-white flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center p-0.5">
                                                                <img
                                                                    src={prod.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                                    onError={e => {
                                                                        (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                                    }}
                                                                    alt={prod.name}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[13px] sm:text-[13.5px] font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[200px]" title={prod.name}>
                                                                    {prod.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-[12.5px] font-medium text-slate-700 whitespace-nowrap">
                                                        {dateFormatted}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100/70 text-[12px] font-black">
                                                            ৳{price.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-[#009E49] border border-emerald-100/70 text-[12px] font-black">
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
                                            <td colSpan={6} className="text-center py-8 text-slate-400 text-[13px]">
                                                No products recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── CARD 4: Customers (Metrics list + Modern Multi-Ring SVG Donut Gauge) ── (lg:col-span-5 xl:col-span-5) */}
                    <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100/90 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-900">Customers</h3>
                                <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Information about your store's customers</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <SlidersHorizontal className="w-4 h-4" />
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
