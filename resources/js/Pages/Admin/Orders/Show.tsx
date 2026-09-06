import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, SaveBtn, AdminSelect, AdminTextarea, FieldLabel, StatusPill } from '@/components/admin/ui';
import { CourierSelect } from '@/components/admin/CourierSelect';
import { 
    ArrowLeft, Printer, Truck, MapPin, User, CheckCircle, 
    Save, Phone, MessageCircle, Calendar, Clock, CreditCard, 
    ShoppingBag, Package, FileText, Sparkles, Send, RefreshCw, 
    Copy, ExternalLink, ShieldCheck, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface ShowProps {
    order: any;
    couriers?: Array<{
        id: string;
        name: string;
        is_enabled: boolean;
        is_default: boolean;
    }>;
}

export const Show: React.FC<ShowProps> = ({ order, couriers = [] }) => {
    const [selectedCourier, setSelectedCourier] = useState<string>(
        order.courier_name || (couriers.find(c => c.is_default)?.id || 'steadfast')
    );
    const [isSendingCourier, setIsSendingCourier] = useState(false);
    const [isTrackingCourier, setIsTrackingCourier] = useState(false);

    const { data, setData, put, processing } = useForm({
        status: order.status,
        payment_status: order.payment_status,
        internal_notes: order.internal_notes || '',
    });

    const handleStatusSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.orders.update', { id: order.id }), {
            onSuccess: () => toast.success('Order updated successfully! 🎉'),
            onError: () => toast.error('Failed to update order status.')
        });
    };

    const handleSendToCourier = () => {
        setIsSendingCourier(true);
        router.post(route('admin.orders.courier.send', { id: order.id }), {
            courier_name: selectedCourier
        }, {
            onSuccess: () => {
                setIsSendingCourier(false);
                toast.success(`Order successfully dispatched to ${selectedCourier.toUpperCase()}! 📦`);
            },
            onError: (err) => {
                setIsSendingCourier(false);
                toast.error(String(Object.values(err)[0] || 'Failed to dispatch order to courier.'));
            }
        });
    };

    const handleTrackCourier = () => {
        setIsTrackingCourier(true);
        router.post(route('admin.orders.courier.track', { id: order.id }), {}, {
            onSuccess: () => {
                setIsTrackingCourier(false);
                toast.success('Courier tracking status updated! 🔄');
            },
            onError: () => {
                setIsTrackingCourier(false);
                toast.error('Failed to retrieve courier tracking status.');
            }
        });
    };

    const handleCopyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard! 📋`);
    };

    const handlePrint = () => {
        window.print();
    };

    const cleanPhone = order.mobile ? order.mobile.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone}?text=${encodeURIComponent(`Hello ${order.customer_name}, regarding your order #${order.order_number} at ChutirMart:`)}` 
        : '#';

    const hasCourier = Boolean(order.courier_tracking_code || order.consignment_id);

    return (
        <AdminLayout>
            <Toaster position="top-center" richColors />
            <Head title={`Order #${order.order_number} | ChutirMart Admin`} />

            <div className="w-full max-w-full space-y-6 pb-12">
                {/* Print hiding styles */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        .admin-layout aside,
                        .admin-layout header,
                        .no-print {
                            display: none !important;
                        }
                        .admin-layout md\\:pl-60 {
                            padding-left: 0 !important;
                        }
                        .admin-layout main {
                            padding: 0 !important;
                        }
                        .print-full {
                            width: 100% !important;
                            border: none !important;
                            box-shadow: none !important;
                        }
                    }
                `}} />

                {/* Top Header & Actions Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-[0_2px_12px_rgba(0,158,73,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                    <div className="flex items-center gap-3.5">
                        <Link href={route('admin.orders.index')}>
                            <button 
                                className="w-10 h-10 rounded-xl bg-[#FAFDFB] border border-[#E6F5EC] flex items-center justify-center text-[#009E49] hover:bg-[#009E49] hover:text-white transition-all shadow-2xs cursor-pointer"
                                title="Back to Orders List"
                            >
                                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl md:text-2xl font-black text-[#1A1A2E] tracking-tight">
                                    Order #{order.order_number}
                                </h1>
                                <StatusPill status={order.status} />
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    order.payment_status === 'paid' 
                                        ? 'bg-emerald-50 text-[#009E49] border-emerald-200' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {order.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#9096B0] font-semibold mt-1">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start md:self-auto">
                        {order.mobile && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                title="Chat with customer on WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4 fill-current" />
                                <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                        )}
                        <button 
                            onClick={handlePrint} 
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-[#1A1A2E] hover:border-[#009E49] hover:text-[#009E49] transition-all shadow-2xs cursor-pointer"
                        >
                            <Printer className="w-4 h-4 stroke-[2]" />
                            Print Invoice
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column (8 cols): Order Items & Customer Delivery */}
                    <div className="lg:col-span-8 space-y-6 print-full">
                        
                        {/* 1. Invoice Items Table Card */}
                        <AdminCard className="overflow-hidden print-full border border-slate-200/80">
                            <div className="px-6 py-4.5 border-b border-slate-100 bg-[#FAFDFB] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#E6F5EC] flex items-center justify-center text-[#009E49]">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-black text-[#1A1A2E]">Ordered Items (অর্ডারকৃত পণ্যসমূহ)</h2>
                                        <p className="text-[11px] text-[#9096B0] font-medium">Total {order.items?.length || 0} items in this order</p>
                                    </div>
                                </div>
                            </div>

                            {/* Table of items */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-[#9096B0] uppercase tracking-wider">
                                            <th className="py-3 px-6">Product</th>
                                            <th className="py-3 px-4 text-center">Unit Price</th>
                                            <th className="py-3 px-4 text-center">Quantity</th>
                                            <th className="py-3 px-6 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.items?.map((item: any, idx: number) => (
                                            <tr key={item.id || idx} className="hover:bg-[#FAFDFB]/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 bg-[#FAFDFB] flex items-center justify-center no-print shadow-2xs">
                                                            <img
                                                                src={item.product?.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                                onError={e => {
                                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                                }}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[13px] font-bold text-[#1A1A2E] block leading-snug">
                                                                {item.product_name}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {item.product?.product_code && (
                                                                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                        Code: {item.product.product_code}
                                                                    </span>
                                                                )}
                                                                {item.variant_info && (
                                                                    <span className="text-[10px] font-bold text-[#009E49] bg-[#E6F5EC] px-2 py-0.5 rounded">
                                                                        {item.variant_info.label || item.variant_info.value || item.variant_info.name || 'Variant'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-[13px] font-bold text-[#4A5068]">
                                                    ৳{item.unit_price}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-[12px] font-black text-[#1A1A2E]">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right text-[13.5px] font-black text-[#1A1A2E]">
                                                    ৳{item.total_price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Calculation */}
                            <div className="p-6 bg-[#FAFDFB] border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
                                <div className="space-y-2">
                                    {order.special_notes && (
                                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 max-w-sm">
                                            <span className="font-bold block mb-0.5">Customer Note:</span>
                                            {order.special_notes}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full sm:w-72 space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal:</span>
                                        <span className="font-bold text-gray-900">৳{order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Charge:</span>
                                        <span className="font-bold text-gray-900">৳{order.delivery_charge}</span>
                                    </div>
                                    {order.coupon_discount > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-bold">
                                            <span>Coupon Discount:</span>
                                            <span>-৳{order.coupon_discount}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-gray-900">
                                        <span>Grand Total:</span>
                                        <span className="text-[#E2231A]">৳{order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </AdminCard>

                        {/* 2. Customer & Address Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <AdminCard className="p-6 border border-slate-200/80">
                                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 text-[#009E49] flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-black text-[#1A1A2E]">Customer Info</h3>
                                        <p className="text-[11px] text-[#9096B0]">Buyer profile details</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-start justify-between py-1 border-b border-dashed border-slate-100">
                                        <span className="text-[#9096B0] font-semibold">Name:</span>
                                        <span className="font-bold text-[#1A1A2E] text-right">{order.customer_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                                        <span className="text-[#9096B0] font-semibold">Phone:</span>
                                        <div className="flex items-center gap-2">
                                            <a href={`tel:${order.mobile}`} className="font-bold text-[#009E49] hover:underline flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {order.mobile}
                                            </a>
                                        </div>
                                    </div>
                                    {order.customer_email && (
                                        <div className="flex items-start justify-between py-1">
                                            <span className="text-[#9096B0] font-semibold">Email:</span>
                                            <span className="font-bold text-[#1A1A2E] text-right">{order.customer_email}</span>
                                        </div>
                                    )}
                                </div>
                            </AdminCard>

                            <AdminCard className="p-6 border border-slate-200/80">
                                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 text-[#009E49] flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-black text-[#1A1A2E]">Shipping Address</h3>
                                        <p className="text-[11px] text-[#9096B0]">Destination location</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-start justify-between py-1 border-b border-dashed border-slate-100">
                                        <span className="text-[#9096B0] font-semibold">District:</span>
                                        <span className="font-bold text-[#009E49] bg-[#E6F5EC] px-2 py-0.5 rounded text-[11px]">
                                            {order.district}
                                        </span>
                                    </div>
                                    {order.thana && (
                                        <div className="flex items-start justify-between py-1 border-b border-dashed border-slate-100">
                                            <span className="text-[#9096B0] font-semibold">Thana / Upazila:</span>
                                            <span className="font-bold text-[#1A1A2E] text-right">{order.thana}</span>
                                        </div>
                                    )}
                                    <div className="pt-1">
                                        <span className="text-[#9096B0] font-semibold block mb-1">Full Address:</span>
                                        <p className="font-bold text-[#1A1A2E] bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                                            {order.address}
                                        </p>
                                    </div>
                                </div>
                            </AdminCard>
                        </div>
                    </div>

                    {/* Right Column (4 cols): Courier Shipping & Status */}
                    <div className="lg:col-span-4 space-y-6 no-print">
                        
                        {/* ── COURIER & LOGISTICS CARD ── */}
                        <AdminCard className="p-6 border-2 border-emerald-500/20 bg-gradient-to-b from-white to-[#F9FDFB] shadow-sm">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6F5EC]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#009E49] text-white flex items-center justify-center shadow-xs">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-black text-[#1A1A2E]">Courier Shipping</h3>
                                        <p className="text-[11px] text-[#9096B0]">Automated parcel dispatch</p>
                                    </div>
                                </div>

                                {hasCourier && (
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        {order.courier_name || 'Dispatched'}
                                    </span>
                                )}
                            </div>

                            {hasCourier ? (
                                <div className="space-y-4">
                                    <div className="p-3.5 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-semibold">Courier Partner:</span>
                                            <span className="font-black text-gray-900 uppercase">{order.courier_name}</span>
                                        </div>

                                        {order.consignment_id && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-semibold">Consignment ID:</span>
                                                <div className="flex items-center gap-1 font-mono font-bold text-gray-800">
                                                    <span>{order.consignment_id}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyText(order.consignment_id, 'Consignment ID')}
                                                        className="text-gray-400 hover:text-emerald-600 border-none bg-transparent cursor-pointer p-0.5"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {order.courier_tracking_code && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-semibold">Tracking Code:</span>
                                                <div className="flex items-center gap-1 font-mono font-bold text-emerald-700">
                                                    <span>{order.courier_tracking_code}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyText(order.courier_tracking_code, 'Tracking Code')}
                                                        className="text-gray-400 hover:text-emerald-600 border-none bg-transparent cursor-pointer p-0.5"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-semibold">Live Status:</span>
                                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                                {order.courier_status || 'In Transit'}
                                            </span>
                                        </div>

                                        {order.courier_sent_at && (
                                            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-dashed">
                                                <span>Dispatched At:</span>
                                                <span>{new Date(order.courier_sent_at).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleTrackCourier}
                                            disabled={isTrackingCourier}
                                            className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border-none cursor-pointer"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${isTrackingCourier ? 'animate-spin' : ''}`} />
                                            <span>Refresh Status</span>
                                        </button>

                                        {order.tracking_url && (
                                            <a
                                                href={order.tracking_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2.5 rounded-xl bg-[#009E49] hover:bg-[#007F3B] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>Portal</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <FieldLabel>Select Courier Partner</FieldLabel>
                                        <div className="mt-1">
                                            <CourierSelect
                                                value={selectedCourier}
                                                onChange={val => setSelectedCourier(val)}
                                                showLabel={false}
                                                className="w-full"
                                                dropdownAlign="left"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendToCourier}
                                        disabled={isSendingCourier}
                                        className="w-full py-3 rounded-xl bg-[#009E49] hover:bg-[#007F3B] text-white text-xs font-black shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{isSendingCourier ? 'Sending to Courier...' : 'Dispatch to ' + selectedCourier.toUpperCase()}</span>
                                    </button>
                                </div>
                            )}
                        </AdminCard>

                        {/* Status Manager Form */}
                        <AdminCard className="p-6 border border-slate-200/80">
                            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 text-[#009E49] flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-black text-[#1A1A2E]">Update Order Status</h3>
                                    <p className="text-[11px] text-[#9096B0]">Change fulfillment & payment</p>
                                </div>
                            </div>

                            <form onSubmit={handleStatusSubmit} className="space-y-4.5">
                                <div>
                                    <FieldLabel>Order Status (অর্ডার স্ট্যাটাস)</FieldLabel>
                                    <AdminSelect value={data.status} onChange={e => setData('status', e.target.value)}>
                                        <option value="processing">Processing (প্রক্রিয়াধীন)</option>
                                        <option value="on_hold">On Hold (হোল্ড)</option>
                                        <option value="complete">Completed (সম্পন্ন)</option>
                                        <option value="cancelled">Cancelled (বাতিল)</option>
                                        <option value="trash">Trash (মুছে ফেলা)</option>
                                    </AdminSelect>
                                </div>

                                <div>
                                    <FieldLabel>Payment Status (পেমেন্ট স্ট্যাটাস)</FieldLabel>
                                    <AdminSelect value={data.payment_status} onChange={e => setData('payment_status', e.target.value)}>
                                        <option value="pending">Pending (বাকি / ক্যাশ অন ডেলিভারি)</option>
                                        <option value="paid">Paid (পরিশোধিত)</option>
                                    </AdminSelect>
                                </div>

                                <div>
                                    <FieldLabel>Internal Notes (স্টাফ নোট)</FieldLabel>
                                    <AdminTextarea 
                                        placeholder="Add internal notes for staff reference..."
                                        value={data.internal_notes}
                                        onChange={e => setData('internal_notes', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <SaveBtn type="submit" disabled={processing} className="w-full py-3">
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Updating...' : 'Save Order Changes'}
                                </SaveBtn>
                            </form>
                        </AdminCard>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
};

export default Show;
