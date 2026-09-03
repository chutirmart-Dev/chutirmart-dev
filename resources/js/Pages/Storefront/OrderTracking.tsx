import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Box, CheckCircle2, Circle, Truck, Clock, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';

interface OrderTrackingProps {
    order: any;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order }) => {
    const statuses = ['processing', 'on_hold', 'complete'];
    const currentIdx = statuses.indexOf(order.status);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'processing': return 'অর্ডার প্রসেসিং';
            case 'on_hold': return 'প্যাকেজিং ও শিপিং';
            case 'complete': return 'ডেলিভারি সম্পন্ন';
            case 'cancelled': return 'বাতিল করা হয়েছে';
            default: return 'অর্ডার পেন্ডিং';
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('ট্র্যাকিং কোড কপি করা হয়েছে! 📋');
    };

    const hasCourier = Boolean(order.courier_tracking_code || order.consignment_id);
    const trackingCode = order.courier_tracking_code || order.consignment_id;

    return (
        <StorefrontLayout>
            <Toaster position="top-center" richColors />
            <Head title="অর্ডার ট্র্যাকিং - ChutirMart" />

            <div className="container py-8 max-w-xl">
                <div className="bg-white border border-[#E3E0D8] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#009E49] flex items-center justify-center mx-auto mb-3">
                            <Truck className="w-7 h-7" />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-gray-900">অর্ডার ট্র্যাকিং</h1>
                        <p className="text-xs text-gray-400 font-mono mt-1">অর্ডার নং: #{order.order_number}</p>
                    </div>

                    {/* Courier Live Tracking Card */}
                    {hasCourier && (
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span className="text-xs font-black uppercase text-emerald-900">
                                        {order.courier_name || 'Courier'} ট্র্যাকিং
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                                    {order.courier_status || 'ইন ট্রানজিট'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                                <div>
                                    <span className="text-[10px] text-gray-400 font-bold block">ট্র্যাকিং / কনসাইনমেন্ট নম্বর:</span>
                                    <span className="text-sm font-mono font-black text-gray-800">{trackingCode}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(trackingCode)}
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer"
                                        title="Copy Tracking Number"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    {order.tracking_url && (
                                        <a
                                            href={order.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-lg bg-[#009E49] text-white text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-[#007F3B] transition-colors"
                                        >
                                            <span>লাইভ ট্র্যাক</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Status Timeline */}
                    {order.status === 'cancelled' ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl p-4 text-center">
                            ❌ দুঃখিত, আপনার এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।
                        </div>
                    ) : (
                        <div className="space-y-6 py-4 px-2">
                            {/* Step 1: Processing */}
                            <div className="flex items-start gap-4 relative">
                                <div className="absolute left-[13px] top-6 bottom-[-24px] w-0.5 bg-[#009E49]/20" />
                                <div className="z-10 bg-white">
                                    {currentIdx >= 0 ? (
                                        <CheckCircle2 className="w-7 h-7 text-[#009E49] fill-[#009E49]/10" />
                                    ) : (
                                        <Circle className="w-7 h-7 text-gray-300" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold text-gray-800">অর্ডার রিসিভ করা হয়েছে</h4>
                                    <p className="text-xs text-gray-500">আমরা আপনার অর্ডারটি পেয়েছি এবং প্রক্রিয়া শুরু করেছি।</p>
                                </div>
                            </div>

                            {/* Step 2: Packaging/On Hold */}
                            <div className="flex items-start gap-4 relative">
                                <div className="absolute left-[13px] top-6 bottom-[-24px] w-0.5 bg-[#009E49]/20" />
                                <div className="z-10 bg-white">
                                    {currentIdx >= 1 ? (
                                        <CheckCircle2 className="w-7 h-7 text-[#009E49] fill-[#009E49]/10" />
                                    ) : currentIdx === 0 ? (
                                        <Clock className="w-7 h-7 text-[#009E49] fill-[#009E49]/10 animate-pulse" />
                                    ) : (
                                        <Circle className="w-7 h-7 text-gray-300" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold text-gray-800">প্যাকেজিং ও কুরিয়ারে পাঠানো হয়েছে</h4>
                                    <p className="text-xs text-gray-500">পণ্যটি প্যাকেজ করা হচ্ছে অথবা শিপিংয়ের জন্য প্রস্তুত করা হয়েছে।</p>
                                </div>
                            </div>

                            {/* Step 3: Complete */}
                            <div className="flex items-start gap-4">
                                <div className="z-10 bg-white">
                                    {order.status === 'complete' ? (
                                        <CheckCircle2 className="w-7 h-7 text-[#009E49] fill-[#009E49]/10" />
                                    ) : (
                                        <Circle className="w-7 h-7 text-gray-300" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold text-gray-800">ডেলিভারি সম্পন্ন</h4>
                                    <p className="text-xs text-gray-500">কুরিয়ার প্রতিনিধি আপনার ঠিকানায় পণ্যটি পৌঁছে দিয়েছেন।</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Info */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs md:text-sm text-gray-600 font-medium">
                        <p><strong className="text-gray-800 font-bold">গ্রাহকের নাম:</strong> {order.customer_name}</p>
                        <p><strong className="text-gray-800 font-bold">বর্তমান স্ট্যাটাস:</strong> <span className="text-[#009E49] font-bold">{getStatusLabel(order.status)}</span></p>
                        <p><strong className="text-gray-800 font-bold">সর্বমোট মূল্য:</strong> ৳{order.total}</p>
                    </div>

                    <div className="pt-2">
                        <Link href={route('home')}>
                            <Button className="w-full bg-[#009E49] hover:bg-[#007F3B] text-white font-bold h-12 rounded-xl border-none">
                                কেনাকাটা চালিয়ে যান
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default OrderTracking;
