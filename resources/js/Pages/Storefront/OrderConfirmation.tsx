import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { CheckCircle2, ShoppingBag, MapPin, Truck, PhoneCall, ArrowRight, Copy, Check, Headphones, Sparkles } from 'lucide-react';
import { FireworksCelebration } from '@/components/FireworksCelebration';
import { toast } from 'sonner';
import { trackPurchase } from '@/lib/gtm';

interface OrderConfirmationProps {
    order: any;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
    const { store_settings } = usePage<any>().props;
    const [copied, setCopied] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [fireworksKey, setFireworksKey] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const hasTrackedPurchase = useRef(false);
    const isInsideDhaka = ['Dhaka', 'Narayanganj', 'Gazipur'].includes(order.district);

    const purchaseTrigger = store_settings?.facebook_purchase_trigger || 'admin_confirmed';

    useEffect(() => {
        if (!hasTrackedPurchase.current && order && order.order_number) {
            hasTrackedPurchase.current = true;
            // Only fire browser Purchase event if instant_checkout mode is enabled
            if (purchaseTrigger === 'instant_checkout') {
                trackPurchase(order, order.meta_purchase_event_id);
            }
        }
    }, [order?.order_number, purchaseTrigger]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollBottom = window.innerHeight + window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            if (scrollBottom >= docHeight - 80) {
                setIsAtBottom(true);
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsAtBottom(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.1,
            }
        );

        if (bottomRef.current) {
            observer.observe(bottomRef.current);
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleCopyOrderNumber = () => {
        if (order?.order_number) {
            navigator.clipboard.writeText(order.order_number);
            setCopied(true);
            toast.success('অর্ডার নম্বর কপি করা হয়েছে!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const supportPhone = store_settings?.contact_phone || '01700000000';

    return (
        <StorefrontLayout>
            <Head title="অর্ডার সফল হয়েছে! - ছুটির মার্ট" />

            {/* Celebratory Fireworks & Sparkles Animation */}
            <FireworksCelebration triggerKey={fireworksKey} />

            <div className="flex items-center justify-center px-2.5 xs:px-3 sm:px-4 pt-3 sm:pt-6 pb-6 sm:pb-8">
                <div className="w-full max-w-[580px] space-y-3.5 sm:space-y-5 text-center">
                    
                    {/* Header Card (App-Style) */}
                    <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-7 shadow-2xs space-y-3 sm:space-y-3.5 relative overflow-hidden">
                        {/* Background Sparkle Accents */}
                        <div className="absolute top-2 right-3 opacity-20 pointer-events-none">
                            <Sparkles className="w-12 h-12 text-amber-500 animate-pulse" />
                        </div>
                        <div className="absolute bottom-2 left-3 opacity-20 pointer-events-none">
                            <Sparkles className="w-10 h-10 text-emerald-500 animate-pulse" />
                        </div>

                        {/* Top Celebration Icon with Re-burst click */}
                        <div className="flex justify-center">
                            <div 
                                onClick={() => {
                                    setFireworksKey(k => k + 1);
                                    toast.success('🎉 অভিনন্দন!', { duration: 2000 });
                                }}
                                className="relative cursor-pointer group select-none"
                                title="আতশবাজি ও স্পার্কলস আবার দেখতে ক্লিক করুন"
                            >
                                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-emerald-100/80 border-2 border-emerald-200/80 group-hover:scale-105 group-active:scale-95 transition-transform flex items-center justify-center shadow-[0_4px_20px_rgba(0,158,73,0.18)]">
                                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#009E49] stroke-[2.3]" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 text-lg sm:text-2xl group-hover:rotate-12 transition-transform">🎉</span>
                            </div>
                        </div>

                        {/* Headline & Congratulatory Badge */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setFireworksKey(k => k + 1);
                                    toast.success('🎉 অভিনন্দন!', { duration: 2000 });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 hover:bg-amber-100 active:scale-95 border border-amber-200 text-amber-900 rounded-lg text-xs sm:text-sm font-bold font-bangla shadow-2xs transition-all cursor-pointer select-none"
                                title="আতশবাজি আবার দেখতে ক্লিক করুন"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                                <span>অভিনন্দন! (Congratulations!)</span>
                                <span className="text-sm">✨</span>
                            </button>
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight font-bangla leading-tight">
                                আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
                            </h1>
                        </div>

                        {/* Urgent Phone Confirmation Alert */}
                        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-200/90 rounded-lg p-3 sm:p-4 text-left flex items-start gap-2.5 sm:gap-3 shadow-2xs mt-2">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#009E49] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                <PhoneCall className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs sm:text-sm md:text-[15px] font-bold text-gray-900 font-bangla flex items-center gap-1.5">
                                    অর্ডার নিশ্চিতকরণ কল
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#009E49] text-white">জরুরী</span>
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed font-bangla">
                                    অর্ডারটি কনফার্ম করার জন্য আমাদের প্রতিনিধি খুব শীঘ্রই আপনাকে কল করবেন। অনুগ্রহ করে কলটি রিসিভ করুন।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Number & Payment Method Card */}
                    <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-left">
                        <div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-500 block font-bangla">অর্ডার নম্বর (Order ID)</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-[#009E49] tracking-wider">#{order.order_number}</span>
                                <button 
                                    onClick={handleCopyOrderNumber}
                                    type="button"
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                    title="কপি করুন"
                                    aria-label="Copy order number"
                                >
                                    {copied ? <Check className="w-4.5 h-4.5 text-[#009E49]" /> : <Copy className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-xs sm:text-sm font-semibold text-gray-500 block font-bangla">পেমেন্ট মেথড</span>
                            <span className="inline-block mt-0.5 text-[11px] sm:text-sm font-bold text-gray-800 bg-gray-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border border-gray-200 shadow-2xs font-bangla">
                                {order.payment_method === 'cod' ? '💵 ক্যাশ অন ডেলিভারি' : '💳 অনলাইন পেমেন্ট'}
                            </span>
                        </div>
                    </div>

                    {/* Order Items Section (App-Style Cards) */}
                    <div className="space-y-2.5 sm:space-y-3 text-left font-bangla">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-50 text-[#009E49] flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                </div>
                                <h3 className="text-sm sm:text-lg font-bold text-gray-900">
                                    অর্ডারকৃত পণ্যসমূহ
                                </h3>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md border border-emerald-200/70">
                                {order.items?.length || 0} টি পণ্য
                            </span>
                        </div>

                        {/* Individual Product Cards */}
                        <div className="space-y-2 sm:space-y-2.5">
                            {order.items?.map((item: any) => {
                                const imgUrl = item.product?.images?.[0]?.image_path || '/storage/defaults/default-product.svg';
                                return (
                                    <div 
                                        key={item.id} 
                                        className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-[#009E49]/40 transition-all flex items-center justify-between gap-2.5 sm:gap-4"
                                    >
                                        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                                            <img 
                                                src={imgUrl} 
                                                alt={item.product_name} 
                                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg object-cover bg-gray-50 border border-gray-200 shrink-0 shadow-2xs"
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                }}
                                            />
                                            <div className="min-w-0 space-y-0.5 sm:space-y-1">
                                                <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2" title={item.product_name}>
                                                    {item.product_name}
                                                </h4>
                                                {item.variant_info && (
                                                    <div className="text-xs text-gray-500">
                                                        {typeof item.variant_info === 'string' ? item.variant_info : JSON.stringify(item.variant_info)}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                                                    <span className="text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 px-2 sm:px-2.5 py-0.5 rounded-md">
                                                        পরিমাণ: {item.quantity}
                                                    </span>
                                                    <span className="text-[11px] sm:text-xs text-gray-500 font-mono font-medium">
                                                        @ ৳{item.unit_price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 pl-1.5 sm:pl-2">
                                            <span className="text-[11px] sm:text-xs text-gray-400 block font-bangla mb-0.5">মোট</span>
                                            <span className="text-sm sm:text-lg font-black text-gray-950 font-latin">৳{item.total_price}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cost Breakdown Card */}
                    <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-200/90 shadow-2xs space-y-2.5 sm:space-y-3 font-bangla text-left">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 border-b border-gray-150 pb-2">
                            হিসাব বিবরণী (Payment Breakdown)
                        </h4>
                        <div className="space-y-2 text-xs sm:text-base text-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600">সাবটোটাল</span>
                                <span className="font-bold text-gray-900 font-latin">৳{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600">ডেলিভারি চার্জ</span>
                                <span className="font-bold text-gray-900 font-latin">৳{order.delivery_charge}</span>
                            </div>
                            {parseFloat(order.coupon_discount) > 0 && (
                                <div className="flex justify-between items-center text-emerald-700 font-bold">
                                    <span>কুপন ডিসকাউন্ট</span>
                                    <span className="font-latin">-৳{order.coupon_discount}</span>
                                </div>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/60 border-2 border-emerald-300/80 rounded-xl p-3.5 sm:p-5 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3 text-gray-950 mt-2.5 shadow-xs">
                            <div>
                                <span className="font-bangla text-sm sm:text-xl font-extrabold block text-gray-900">
                                    সর্বমোট প্রদেয় (Grand Total):
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] sm:text-sm font-bold text-emerald-800 bg-white/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border border-emerald-200 shadow-2xs font-bangla mt-1">
                                    <span>💵</span> ক্যাশ অন ডেলিভারি
                                </span>
                            </div>
                            <div className="xs:text-right">
                                <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-[#009E49] font-latin tracking-tight block leading-none">
                                    ৳{Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-200/90 shadow-2xs text-left space-y-2.5 sm:space-y-3 font-bangla">
                        <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-50 text-[#009E49] flex items-center justify-center">
                                <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </div>
                            <h3 className="text-sm sm:text-lg font-bold text-gray-900">
                                ডেলিভারি ঠিকানা
                            </h3>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-base text-gray-800">
                            <div className="flex items-start gap-2">
                                <span className="text-gray-500 font-medium min-w-[55px] sm:min-w-[70px]">নাম:</span>
                                <span className="font-bold text-gray-950">{order.customer_name}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-gray-500 font-medium min-w-[55px] sm:min-w-[70px]">মোবাইল:</span>
                                <span className="font-mono font-bold text-gray-950">{order.mobile}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-gray-500 font-medium min-w-[55px] sm:min-w-[70px]">ঠিকানা:</span>
                                <span className="font-medium text-gray-800 leading-relaxed">
                                    {order.address}{order.thana ? `, ${order.thana}` : ''}, {order.district}
                                </span>
                            </div>
                        </div>

                        {/* Estimated delivery banner */}
                        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-2.5 sm:p-3 flex items-start gap-2 sm:gap-2.5 mt-2">
                            <Truck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#009E49] shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#009E49] block">আনুমানিক ডেলিভারি সময়</span>
                                <span className="text-xs sm:text-sm text-gray-700 font-medium block mt-0.5 leading-relaxed">
                                    {isInsideDhaka 
                                        ? 'ঢাকার ভিতরে: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে নিরাপদ ডেলিভারি।' 
                                        : 'ঢাকার বাইরে: ২ থেকে ৩ কার্যদিবসের মধ্যে দ্রুত ডেলিভারি।'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions button */}
                    <div ref={bottomRef} className="pt-2 space-y-2.5 sm:space-y-3">
                        <Link href={route('home')} className="block">
                            <button 
                                type="button"
                                className="w-full min-h-[46px] sm:h-12 py-2.5 px-3 sm:px-5 bg-[#009E49] hover:bg-[#00893f] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 border border-[#00873e] font-bangla shadow-[0_4px_16px_rgba(0,158,73,0.25)] hover:shadow-[0_6px_20px_rgba(0,158,73,0.35)] transition-all cursor-pointer select-none"
                            >
                                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2] shrink-0" />
                                <span className="hidden sm:inline">আরও কেনাকাটা করুন (Continue Shopping)</span>
                                <span className="sm:hidden">আরও কেনাকাটা করুন</span>
                                <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                            </button>
                        </Link>

                        {/* Support Line */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-500 font-bangla text-center pt-1">
                            <span className="inline-flex items-center gap-1">
                                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#009E49] shrink-0" />
                                <span>যেকোনো প্রয়োজনে যোগাযোগ:</span>
                            </span>
                            <a href={`tel:${supportPhone}`} className="font-bold text-gray-800 hover:text-[#009E49] transition-colors font-mono">
                                {supportPhone}
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* Floating Sticky Bottom Bar (Elevated Floating App Dock) */}
            <div 
                className={`fixed bottom-2.5 sm:bottom-5 left-2.5 sm:left-4 right-2.5 sm:right-4 z-40 max-w-[580px] mx-auto transition-all duration-300 ease-out ${
                    isAtBottom ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
                }`}
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-xl sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] p-2.5 sm:p-4 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Total Price display */}
                    <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide block font-bangla leading-none">
                            সর্বমোট (Total)
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xl xs:text-2xl sm:text-3xl font-black text-[#009E49] font-latin leading-tight tracking-tight">
                                ৳{Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200/60 font-bangla whitespace-nowrap -mt-0.5">
                            💵 ক্যাশ অন ডেলিভারি
                        </span>
                    </div>

                    {/* Continue Shopping CTA Button */}
                    <Link href={route('home')} className="shrink-0">
                        <button 
                            type="button"
                            className="h-10 sm:h-12 px-3.5 sm:px-6 bg-gradient-to-r from-[#009E49] to-[#00873e] hover:from-[#00873e] hover:to-[#007335] active:scale-95 text-white font-black text-xs sm:text-sm md:text-base rounded-lg flex items-center gap-1 sm:gap-2 border border-[#00873e] font-bangla shadow-[0_4px_16px_rgba(0,158,73,0.35)] hover:shadow-[0_6px_22px_rgba(0,158,73,0.45)] transition-all cursor-pointer whitespace-nowrap"
                        >
                            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.3] shrink-0" />
                            <span>আরও কেনাকাটা</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        </button>
                    </Link>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default OrderConfirmation;
