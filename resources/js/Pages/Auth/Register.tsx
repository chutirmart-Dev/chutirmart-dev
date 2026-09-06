import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, 
    Sparkles, ShoppingBag, Package, Truck, Star, ChevronLeft, ChevronRight, 
    ArrowLeft, User, Zap, Clock, Phone
} from 'lucide-react';

export default function Register() {
    const { store_settings } = usePage().props as any;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
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
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const slidesMeta = [
        {
            title: "সবার সেরা অনলাইন শপিং",
            subtitle: `${store_settings?.site_name || 'ChutirMart'}-এ পাচ্ছেন অথেনটিক পণ্য, দ্রুত ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন সুবিধা।`
        },
        {
            title: "অ্যাকাউন্ট ছাড়াই সহজ কেনাকাটা",
            subtitle: "কোনো জটিল রেজিস্ট্রেশন ছাড়াই আপনার নাম ও ঠিকানা দিয়ে যেকোনো পণ্য সরাসরি অর্ডার করতে পারবেন।"
        },
        {
            title: "১০০% নিরাপদ কেনাকাটা",
            subtitle: "সারা বাংলাদেশে বিশ্বস্ত ডেলিভারি এবং সার্বক্ষণিক ডেডিকেটেড কাস্টমার কেয়ার সাপোর্ট।"
        },
        {
            title: "লাইভ অর্ডার ট্র্যাকিং",
            subtitle: "প্যাকেজ ডিসপ্যাচ থেকে শুরু করে আপনার হাত পর্যন্ত রিয়েল-টাইম ডেলিভারি আপডেট জানুন।"
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#F2F5F3] flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans antialiased selection:bg-[#009E49] selection:text-white">
            <Head title={`Register - ${store_settings?.site_name || 'ChutirMart'}`} />

            {/* Main Split Container Card */}
            <div className="w-full max-w-[1240px] min-h-[740px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,158,73,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100">
                
                {/* ── LEFT HERO BRAND PANEL (CAROUSEL SHOWCASE) ───────── */}
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
                        <Link 
                            href={route('home')} 
                            className="group inline-flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer no-underline select-none"
                            title="ছুটির মার্ট স্টোর ভিজিট করুন (Visit Store)"
                        >
                            {store_settings?.site_logo ? (
                                <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-white/20 flex items-center gap-2 group-hover:shadow-md transition-shadow">
                                    <img 
                                        src={store_settings.site_logo} 
                                        alt={store_settings?.site_name || "ChutirMart"} 
                                        className="h-8 w-auto object-contain" 
                                        onError={e => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#009E49] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                        স্টোরে যান →
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-white px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 group-hover:shadow-lg transition-shadow">
                                    <div className="w-7 h-7 rounded-xl bg-[#009E49] flex items-center justify-center text-white shadow-xs">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center text-xl font-black font-bangla tracking-tight">
                                        <span className="text-[#009E49]">ছুটির</span>
                                        <span className="text-[#E2231A] ml-0.5">মার্ট</span>
                                    </div>
                                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#009E49] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                        স্টোরে যান →
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Carousel Navigation Arrows */}
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
                    <div className="my-6 md:my-8 relative z-10 overflow-hidden w-full min-h-[350px] flex items-center">
                        <div 
                            className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            
                            {/* ── SLIDE 0: FAST DOORSTEP DELIVERY ──────────────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-slate-100">
                                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#009E49] flex items-center justify-center shrink-0">
                                            <Truck className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Order Status</p>
                                            <p className="text-[11px] font-black text-[#009E49]">Out for Delivery</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100 min-w-[125px]">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Payment Method</p>
                                            <p className="text-[10px] font-black text-slate-900">Cash on Delivery</p>
                                        </div>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400">Delivery Speed</p>
                                                <p className="text-base font-black text-slate-900 tracking-tight">Express Doorstep</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-50 text-[#009E49] px-2.5 py-0.5 rounded-full border border-emerald-100">
                                                Active Courier
                                            </span>
                                        </div>

                                        {/* Progress Line */}
                                        <div className="space-y-2.5 my-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-[#009E49]" />
                                                <span>অর্ডার কনফার্ম সম্পন্ন</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-[#009E49]" />
                                                <span>প্যাকেজিং ও ডিসপ্যাচ</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-[#009E49]">
                                                <div className="w-4 h-4 rounded-full border-2 border-[#009E49] flex items-center justify-center animate-pulse">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#009E49]" />
                                                </div>
                                                <span>রাইডার ডেলিভারির পথে</span>
                                            </div>
                                        </div>

                                        <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>সারা বাংলাদেশে ডেলিভারি</span>
                                            <span className="text-[#009E49] font-bold">২৪-৪৮ ঘণ্টার মধ্যে</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 1: SMART DISCOUNTS & EXCLUSIVE OFFERS ────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-slate-100">
                                        <div className="w-7 h-7 rounded-xl bg-red-50 text-[#E2231A] flex items-center justify-center shrink-0">
                                            <Zap className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-[#E2231A] leading-tight">Flash Sale</p>
                                            <p className="text-[11px] font-black text-slate-800">Up to 50% OFF</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3 h-3" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Special Coupon</p>
                                            <p className="text-[10px] font-black text-slate-800 leading-tight">Extra Discount</p>
                                        </div>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4 text-[#009E49]" />
                                                <p className="text-xs font-black text-slate-900">Trending Products</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-50 text-[#009E49] px-2 py-0.5 rounded-full border border-emerald-100">
                                                Top Rated
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
                                                        <p className="text-[9px] text-slate-400">Save 25% Today</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-[#009E49]">৳850</span>
                                            </div>

                                            <div className="p-2 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-red-100 text-[#E2231A] flex items-center justify-center font-bold text-xs">
                                                        🎧
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-slate-800 leading-tight">Wireless Earbuds</p>
                                                        <p className="text-[9px] text-[#E2231A] font-bold">Limited Offer</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-[#E2231A]">৳1,200</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>প্রতিটি অর্ডারে লয়ালটি পয়েন্ট</span>
                                            <span className="text-[#009E49] font-bold">✓ ভেরিফাইড</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 2: 100% AUTHENTIC & SAFE SHOPPING ───────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Quality Checked</p>
                                            <p className="text-[11px] font-black text-slate-900">100% Genuine</p>
                                        </div>
                                    </div>

                                    {/* Floating Card Left */}
                                    <div className="absolute top-28 -left-4 sm:-left-6 z-30 bg-white text-slate-800 rounded-2xl p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.18)] flex items-center gap-1.5 border border-slate-100">
                                        <div className="flex text-yellow-400">
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700">4.9 / 5.0</span>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#009E49] font-bold text-sm flex items-center justify-center shrink-0">
                                                AR
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 leading-tight">আরিফুর রহমান</p>
                                                <p className="text-[10px] text-emerald-600 font-medium">✓ ভেরিফাইড ক্রেতা</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 italic leading-relaxed mb-3">
                                            "পণ্যটি খুব দ্রুত ডেলিভারি পেয়েছি। কোয়ালিটি যেমন চেয়েছিলাম ঠিক তেমনই পেয়েছি। ছুটির মার্ট সত্যিই সেরা!"
                                        </p>

                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>১০,০০০+ সন্তুষ্ট গ্রাহক</span>
                                            <span className="text-[#009E49] font-bold">★ ট্রাস্টেড স্টোর</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 3: LIVE ORDER TRACKING & UPDATES ─────────────── */}
                            <div className="w-full shrink-0 flex items-center justify-center px-4">
                                <div className="relative w-full max-w-[360px]">
                                    {/* Floating Card Top-Right */}
                                    <div className="absolute -top-5 -right-3 sm:-right-4 z-30 bg-white text-slate-800 rounded-2xl px-3.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.18)] flex items-center gap-2 border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009E49] flex items-center justify-center shrink-0">
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">Instant Updates</p>
                                            <p className="text-[11px] font-black text-slate-900">SMS & WhatsApp</p>
                                        </div>
                                    </div>

                                    {/* Main Card */}
                                    <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-white/60 relative z-20">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400">Order ID</p>
                                                <p className="text-sm font-black text-slate-900">#CM-84920</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-50 text-[#009E49] px-2 py-0.5 rounded-full border border-emerald-100">
                                                On The Way
                                            </span>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-3 space-y-1">
                                            <p className="text-xs font-bold text-slate-800">Smart Watch T800 Ultra</p>
                                            <p className="text-[10px] text-slate-500">কালার: ব্ল্যাক | পরিমাণ: ১টি</p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                            <span>সহজ ট্র্যাকিং পোর্টাল</span>
                                            <span className="text-[#009E49] font-bold">লাইভ স্ট্যাটাস</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. Bottom: Slide Info & Animated Dots */}
                    <div className="relative z-10 pt-4 flex flex-col gap-4">
                        <div className="min-h-[64px] text-left">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-white">
                                {slidesMeta[currentSlide].title}
                            </h2>
                            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed line-clamp-2">
                                {slidesMeta[currentSlide].subtitle}
                            </p>
                        </div>

                        {/* Carousel Pagination Indicator Dots */}
                        <div className="flex items-center gap-2">
                            {slidesMeta.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setCurrentSlide(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer p-0 ${
                                        currentSlide === i 
                                            ? 'w-7 bg-white shadow-xs' 
                                            : 'w-2 bg-white/40 hover:bg-white/70'
                                    }`}
                                    title={`Slide ${i + 1}`}
                                    aria-label={`Go to slide ${i + 1}`}
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

                {/* ── RIGHT REGISTER FORM PANEL ───────────────────────────────── */}
                <div className="lg:col-span-6 p-6 sm:p-10 md:p-14 flex flex-col justify-between bg-white">
                    
                    <div className="max-w-[420px] w-full mx-auto my-auto space-y-5">
                        
                        {/* Mobile Brand Header linking to Store */}
                        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-100">
                            <Link href={route('home')} className="flex items-center gap-2 select-none" title="স্টোর ভিজিট করুন">
                                {store_settings?.site_logo ? (
                                    <img 
                                        src={store_settings.site_logo} 
                                        alt={store_settings?.site_name || "ChutirMart"} 
                                        className="h-8 w-auto object-contain" 
                                    />
                                ) : (
                                    <div className="flex items-center text-lg font-black font-bangla">
                                        <span className="text-[#009E49]">ছুটির</span>
                                        <span className="text-[#E2231A] ml-0.5">মার্ট</span>
                                    </div>
                                )}
                            </Link>
                            <Link 
                                href={route('home')}
                                className="text-xs font-bold text-[#009E49] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors no-underline"
                            >
                                <span>স্টোর ভিজিট</span>
                                <span>→</span>
                            </Link>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-1.5 text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#009E49] text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#009E49]" />
                                <span>New Customer Registration</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Create your account
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Join ChutirMart for faster checkout, order tracking, and exclusive deals.
                            </p>
                        </div>

                        {/* Guest Shopping Reassurance Banner */}
                        <div className="p-3.5 bg-gradient-to-r from-emerald-50/70 via-[#FAFDFB] to-emerald-50/50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 text-[#009E49] flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 leading-tight font-bangla">
                                        অ্যাকাউন্ট ছাড়াই কিনতে চান?
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate font-bangla">
                                        রেজিস্ট্রেশন ছাড়াও সরাসরি যেকোনো পণ্য কিনতে পারবেন
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href={route('home')}
                                className="shrink-0 text-xs font-bold text-white bg-[#009E49] hover:bg-[#007F3B] active:scale-95 px-3 py-1.5 rounded-xl shadow-xs transition-all no-underline flex items-center gap-1 cursor-pointer font-bangla"
                            >
                                <span>স্টোরে যান</span>
                                <span>→</span>
                            </Link>
                        </div>

                        {/* Google Sign Up Button */}
                        <a
                            href={route('auth.google')}
                            className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/90 active:scale-[0.99] text-slate-700 font-bold text-sm shadow-xs transition-all no-underline"
                        >
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Sign up with Google</span>
                        </a>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-2">
                            <div className="border-t border-slate-200 w-full" />
                            <span className="bg-white px-3 text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase shrink-0">
                                OR WITH MOBILE & EMAIL
                            </span>
                            <div className="border-t border-slate-200 w-full" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            
                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Full Name
                                </label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        autoFocus
                                        className={`w-full h-11 pl-10 pr-4 rounded-xl border ${
                                            errors.name ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                                </div>
                                {errors.name && (
                                    <p className="text-[#E2231A] text-xs font-semibold mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Mobile Number */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Mobile Number
                                    </label>
                                    <span className="text-[10px] text-[#009E49] font-bold">Required</span>
                                </div>
                                <div className="relative flex items-center">
                                    <input 
                                        type="tel"
                                        placeholder="01XXXXXXXXX"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        required
                                        className={`w-full h-11 pl-10 pr-4 rounded-xl border ${
                                            errors.phone ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                                </div>
                                {errors.phone && (
                                    <p className="text-[#E2231A] text-xs font-semibold mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Email Address
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                                </div>
                                <div className="relative flex items-center">
                                    <input 
                                        type="email"
                                        placeholder="name@example.com"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className={`w-full h-11 pl-10 pr-4 rounded-xl border ${
                                            errors.email ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                                </div>
                                {errors.email && (
                                    <p className="text-[#E2231A] text-xs font-semibold mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                        className={`w-full h-11 pl-10 pr-11 rounded-xl border ${
                                            errors.password ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
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

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    Confirm Password
                                </label>
                                <div className="relative flex items-center">
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        required
                                        className={`w-full h-11 pl-10 pr-11 rounded-xl border ${
                                            errors.password_confirmation ? 'border-[#E2231A] ring-2 ring-red-100' : 'border-slate-200'
                                        } bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/10 transition-all`}
                                    />
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 border-none bg-transparent cursor-pointer"
                                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-[#E2231A] text-xs font-semibold mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Submit Button in Brand Green Gradient */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-gradient-to-r from-[#009E49] to-[#008A40] hover:from-[#008A40] hover:to-[#007536] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-[0_6px_20px_rgba(0,158,73,0.3)] hover:shadow-[0_8px_25px_rgba(0,158,73,0.4)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                        </form>

                        {/* Switch to Login */}
                        <div className="pt-2 text-center text-xs text-slate-600">
                            Already have an account?{' '}
                            <Link 
                                href={route('login')} 
                                className="font-bold text-[#009E49] hover:underline"
                            >
                                Sign in
                            </Link>
                        </div>

                        {/* Back to Home Link */}
                        <div className="text-center pt-2">
                            <Link 
                                href={route('home')} 
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#009E49] bg-slate-50 hover:bg-emerald-50/60 px-4 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all shadow-2xs font-bangla"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 text-[#009E49]" />
                                <span>স্টোরে ফিরে যান (Shop Without Account)</span>
                            </Link>
                        </div>

                    </div>

                    {/* Bottom Footer Credits & Legal */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 max-w-[420px] w-full mx-auto">
                        <Link href={route('terms') + '#privacy'} className="hover:text-slate-600 transition-colors no-underline">
                            Privacy Policy
                        </Link>
                        <span>
                            Copyright © {new Date().getFullYear()} {store_settings?.site_name || 'ChutirMart'}
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
}
