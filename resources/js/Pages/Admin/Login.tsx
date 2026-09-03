import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, 
    Sparkles, TrendingUp, CreditCard, ShoppingBag, Package, Truck, 
    Star, AlertTriangle, ChevronLeft, ChevronRight, Users, Award
} from 'lucide-react';

export const Login: React.FC = () => {
    const { store_settings } = usePage().props as any;
    const [showPassword, setShowPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const totalSlides = 4;

    // Continuous auto-sliding carousel every 3.5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % totalSlides);
        }, 3500);
        return () => clearInterval(timer);
    }, [totalSlides]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.login'));
    };

    const handleFillDemo = () => {
        setData({
            email: 'admin@chutirmart.com',
            password: 'admin123',
            remember: true,
        });
    };

    const slidesMeta = [
        {
            title: "Speedy, Easy and Fast",
            subtitle: `${store_settings?.site_name || 'ChutirMart'} admin panel lets you monitor live orders, manage inventory, and optimize sales in real-time.`
        },
        {
            title: "Smart Product & Stock Control",
            subtitle: "Manage product variants, barcode SKUs, catalog pricing, and get automated low-stock warnings."
        },
        {
            title: "Real-time Orders & Dispatch",
            subtitle: "Streamline checkout fulfillment, assign delivery couriers, and generate instant printable invoices."
        },
        {
            title: "Customer Insights & Growth",
            subtitle: "Track customer lifetime value, review ratings, reward repeat buyers, and grow your brand."
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#F2F5F3] flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans antialiased selection:bg-[#009E49] selection:text-white">
            <Head title={`Sign In - ${store_settings?.site_name || 'ChutirMart'} Admin`} />

            {/* Main Split Container Card */}
            <div className="w-full max-w-[1240px] min-h-[740px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,158,73,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100">
                
                {/* ── LEFT HERO BRAND PANEL (SMOOTH SLIDING CAROUSEL) ───────── */}
                <div className="lg:col-span-6 bg-gradient-to-br from-[#009E49] via-[#008A40] to-[#006830] p-8 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden text-white select-none">
                    
                    {/* Decorative Background Ambient Glows */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#E2231A]/25 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Top-right decorative dashed matrix */}
                    <div className="absolute top-8 right-8 grid grid-cols-3 gap-1.5 opacity-25 pointer-events-none">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                        ))}
                    </div>

                    {/* 1. Header: Brand Logo & Navigation Controls */}
                    <div className="relative z-10 flex items-center justify-between">
                        {store_settings?.site_logo ? (
                            <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-white/20 flex items-center">
                                <img 
                                    src={store_settings.site_logo} 
                                    alt={store_settings?.site_name || "ChutirMart"} 
                                    className="h-8 w-auto object-contain" 
                                    onError={e => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="bg-white px-4 py-2 rounded-2xl shadow-md flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-[#009E49] flex items-center justify-center text-white shadow-xs">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                <div className="flex items-center text-xl font-black font-bangla tracking-tight">
                                    <span className="text-[#009E49]">ছুটির</span>
                                    <span className="text-[#E2231A] ml-0.5">মার্ট</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 font-latin border-l border-slate-200 pl-2 uppercase tracking-wider">
                                    Admin
                                </span>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/10">
                            <button 
                                type="button"
                                onClick={() => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)}
                                className="w-7 h-7 rounded-lg hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border-none bg-transparent"
                                title="Previous Slide"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCurrentSlide(prev => (prev + 1) % totalSlides)}
                                className="w-7 h-7 rounded-lg hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border-none bg-transparent"
                                title="Next Slide"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 2. Middle: Smooth Sliding Viewport (Horizontal Track) */}
                    <div className="my-6 md:my-8 relative z-10 overflow-hidden w-full min-h-[365px] flex items-center">
                        <div 
                            className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            
                            {/* ── SLIDE 0: FINANCIAL & SALES GROWTH ──────────────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-slate-100">
                                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#009E49] flex items-center justify-center shrink-0">
                                            <CreditCard className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Payment Received</p>
                                            <p className="text-[11px] font-black text-[#009E49]">+৳34,908.00</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-3 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex flex-col items-center text-center gap-0.5 border border-slate-100 min-w-[120px]">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009E49] flex items-center justify-center">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 leading-tight">Transfer successful</p>
                                        <p className="text-[11px] font-black text-slate-900">৳35,798.00</p>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400">Total Income</p>
                                                <p className="text-lg font-black text-[#009E49] tracking-tight">৳24,908.00</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] font-bold text-slate-400">Expenses</p>
                                                <p className="text-sm font-bold text-[#E2231A]">৳1,028.00</p>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        <div className="relative h-24 w-full my-2 flex items-center justify-center">
                                            <div className="absolute top-1 left-1/3 -translate-x-1/2 bg-[#E2231A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md z-10 flex items-center gap-1">
                                                <span>৳5,052</span>
                                            </div>
                                            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                                <defs>
                                                    <linearGradient id="brandChartGrad0" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#009E49" stopOpacity="0.35" />
                                                        <stop offset="100%" stopColor="#009E49" stopOpacity="0.0" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M 0,80 Q 50,40 100,25 T 200,60 T 300,30 L 300,100 L 0,100 Z" fill="url(#brandChartGrad0)" />
                                                <path d="M 0,80 Q 50,40 100,25 T 200,60 T 300,30" fill="none" stroke="#009E49" strokeWidth="3.5" strokeLinecap="round" />
                                                <circle cx="100" cy="25" r="4.5" fill="#E2231A" stroke="#FFFFFF" strokeWidth="2.5" />
                                            </svg>
                                        </div>

                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 border-b border-slate-100 pb-2.5 mb-2.5">
                                            <span>Jan 12</span>
                                            <span>Jan 13</span>
                                            <span>Jan 14</span>
                                            <span>Jan 15</span>
                                        </div>

                                        <div className="space-y-1.5 text-[11px]">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-tight">Online Store Sales</p>
                                                    <p className="text-[9px] text-slate-400">Direct Checkout</p>
                                                </div>
                                                <span className="font-black text-[#009E49]">+৳523.10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-tight">Delivery Express</p>
                                                    <p className="text-[9px] text-slate-400">Courier Charge</p>
                                                </div>
                                                <span className="font-black text-[#E2231A]">-৳600.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 1: SMART PRODUCTS & INVENTORY ────────────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-slate-100">
                                        <div className="w-7 h-7 rounded-xl bg-red-50 text-[#E2231A] flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-[#E2231A] leading-tight">Low Stock Alert</p>
                                            <p className="text-[11px] font-black text-slate-800">3 Items Remaining</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3 h-3" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">New Product</p>
                                            <p className="text-[10px] font-black text-slate-800 leading-tight">Added to Catalog</p>
                                        </div>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-[#009E49]" />
                                                <p className="text-xs font-black text-slate-900">Inventory Status</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-50 text-[#009E49] px-2 py-0.5 rounded-full border border-emerald-100">
                                                98.4% In Stock
                                            </span>
                                        </div>

                                        {/* Products list */}
                                        <div className="space-y-2 my-2.5">
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#009E49] flex items-center justify-center font-bold text-xs">
                                                        👕
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-slate-800 leading-tight">Premium Polo Shirt</p>
                                                        <p className="text-[9px] text-slate-400">48 units available</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-[#009E49]">৳1,250</span>
                                            </div>

                                            <div className="p-2 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-red-100 text-[#E2231A] flex items-center justify-center font-bold text-xs">
                                                        🎒
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-slate-800 leading-tight">Leather Backpack</p>
                                                        <p className="text-[9px] text-[#E2231A] font-bold">Only 2 left in stock</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-[#E2231A]">৳3,400</span>
                                            </div>

                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        🎧
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-slate-800 leading-tight">Wireless Earbuds</p>
                                                        <p className="text-[9px] text-slate-400">85 units available</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-[#009E49]">৳2,100</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>Total SKUs: <strong>140+</strong></span>
                                            <span className="text-[#009E49] font-bold">All Categories Active ✓</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 2: REAL-TIME ORDERS & FAST DISPATCH ──────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-slate-100">
                                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Truck className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Courier Assigned</p>
                                            <p className="text-[11px] font-black text-blue-600">SteadFast Express</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-[#E2231A]/10 text-[#E2231A] flex items-center justify-center shrink-0">
                                            <ShoppingBag className="w-3 h-3" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-[#E2231A] leading-tight">New Order Placed</p>
                                            <p className="text-[10px] font-black text-slate-800 leading-tight">#CM-9483 (৳6,200)</p>
                                        </div>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400">Live Orders Today</p>
                                                <p className="text-base font-black text-slate-900">142 Orders <span className="text-xs text-[#009E49] font-bold">+18%</span></p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-[#E2231A] text-white px-2 py-0.5 rounded-full shadow-xs">
                                                LIVE FEED
                                            </span>
                                        </div>

                                        {/* Orders pipeline */}
                                        <div className="space-y-2 my-2">
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 leading-tight">#CM-9482 · Tanvir A.</p>
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Processing</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">৳4,500</span>
                                            </div>

                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 leading-tight">#CM-9481 · Sabrina K.</p>
                                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Out for Delivery</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">৳2,850</span>
                                            </div>

                                            <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 leading-tight">#CM-9480 · Rakib H.</p>
                                                    <span className="text-[9px] font-bold text-[#009E49] bg-emerald-100 px-1.5 py-0.5 rounded">Delivered ✓</span>
                                                </div>
                                                <span className="text-xs font-black text-[#009E49]">৳1,990</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>Auto-sync enabled</span>
                                            <span className="text-[#009E49] font-bold">1-Click Invoice Print</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 3: CUSTOMER LOYALTY & REVIEWS ────────────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-slate-100">
                                        <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                            <Award className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">VIP Customer</p>
                                            <p className="text-[11px] font-black text-amber-600">15+ Orders Placed</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-700">"Super Quality!"</span>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400">Customer Satisfaction</p>
                                                <p className="text-base font-black text-slate-900 flex items-center gap-1">
                                                    4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-[10px] text-slate-400 font-medium">(1,240 Reviews)</span>
                                                </p>
                                            </div>
                                            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Users className="w-3.5 h-3.5" />
                                            </div>
                                        </div>

                                        {/* Metrics Progress */}
                                        <div className="space-y-2.5 my-2.5">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                                                    <span>Repeat Buyer Rate</span>
                                                    <span className="text-[#009E49]">74.2%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full bg-[#009E49] rounded-full transition-all duration-700" style={{ width: '74.2%' }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                                                    <span>Order Fulfillment Success</span>
                                                    <span className="text-[#009E49]">99.1%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: '99.1%' }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                                                    <span>On-Time Courier Delivery</span>
                                                    <span className="text-blue-600">96.8%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: '96.8%' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>Active Customers: <strong>3,800+</strong></span>
                                            <span className="text-[#009E49] font-bold">Growing Daily ↑</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. Bottom: Dynamic Sliding Headline & Interactive Pagination Dots */}
                    <div className="relative z-10 text-center space-y-3 pt-2">
                        <div className="overflow-hidden w-full">
                            <div 
                                className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {slidesMeta.map((s, idx) => (
                                    <div key={idx} className="w-full shrink-0 text-center px-3">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                                            {s.title}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-emerald-100/90 max-w-sm mx-auto leading-relaxed mt-1.5">
                                            {s.subtitle}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* 4-Dot Interactive Slider Indicator */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                            {[...Array(totalSlides)].map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`transition-all duration-400 cursor-pointer border-none p-0 ${
                                        currentSlide === idx 
                                            ? 'w-7 h-2 bg-white rounded-full shadow-xs' 
                                            : 'w-2 h-2 bg-white/40 hover:bg-white/75 rounded-full'
                                    }`}
                                    title={`Slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Bottom-left decorative dot matrix */}
                    <div className="absolute bottom-6 left-6 grid grid-cols-4 gap-1.5 opacity-20 pointer-events-none">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                        ))}
                    </div>

                </div>

                {/* ── RIGHT LOGIN FORM PANEL ──────────────────────────────────── */}
                <div className="lg:col-span-6 p-8 sm:p-12 md:p-16 flex flex-col justify-between bg-white">
                    
                    <div className="max-w-[420px] w-full mx-auto my-auto space-y-7">
                        
                        {/* Title & Subtitle */}
                        <div className="space-y-2 text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#009E49] text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#009E49]" />
                                <span>ChutirMart Control Panel</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Sign in to your account
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Welcome back! Enter your administrator credentials below.
                            </p>
                        </div>

                        {/* Quick Demo Login Preset Button (Themed) */}
                        <button
                            type="button"
                            onClick={handleFillDemo}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-slate-700 hover:text-[#009E49] text-xs font-bold transition-all duration-200 cursor-pointer group shadow-2xs"
                        >
                            <Sparkles className="w-4 h-4 text-[#E2231A] group-hover:scale-110 transition-transform" />
                            <span>1-Click Fill Demo Credentials (<code className="font-mono text-[11px] font-semibold text-[#009E49]">admin@chutirmart.com</code>)</span>
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-slate-200 w-full" />
                            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                Or with email
                            </span>
                            <div className="border-t border-slate-200 w-full" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="email"
                                        placeholder="admin@chutirmart.com"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                        className={`w-full h-12 px-4 rounded-xl border ${
                                            errors.email ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-[#E2231A] text-xs font-semibold mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                        className={`w-full h-12 px-4 pr-11 rounded-xl border ${
                                            errors.password ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 border-none bg-transparent cursor-pointer"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[#E2231A] text-xs font-semibold mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#009E49] border-slate-300 focus:ring-[#009E49]/20 cursor-pointer"
                                    />
                                    <span className="text-xs font-medium text-slate-600">Remember me for 30 days</span>
                                </label>
                            </div>

                            {/* Submit Button in Brand Green Gradient */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-gradient-to-r from-[#009E49] to-[#008A40] hover:from-[#008A40] hover:to-[#007536] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-[0_6px_20px_rgba(0,158,73,0.3)] hover:shadow-[0_8px_25px_rgba(0,158,73,0.4)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                        </form>

                    </div>

                    {/* Bottom Footer Credits & Legal */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 max-w-[420px] w-full mx-auto">
                        <a href={route('terms') + '#privacy'} className="hover:text-slate-600 transition-colors no-underline">
                            Privacy Policy
                        </a>
                        <span>
                            Copyright © {new Date().getFullYear()} {store_settings?.site_name || 'ChutirMart'}
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Login;
