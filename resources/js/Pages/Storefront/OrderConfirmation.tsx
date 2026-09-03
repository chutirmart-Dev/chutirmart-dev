import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { CheckCircle2, ShoppingBag, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderConfirmationProps {
    order: any;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
    const isInsideDhaka = ['Dhaka', 'Narayanganj', 'Gazipur'].includes(order.district);

    return (
        <StorefrontLayout>
            <Head title="অর্ডার সফল হয়েছে!" />

            <div className="container py-8 max-w-xl">
                <div className="bg-white border border-[#E3E0D8] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-center">
                    
                    {/* Success animation checkmark */}
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-primary animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-xl md:text-2xl font-black text-gray-800">অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! 🎉</h1>
                        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                            অর্ডারটি নিশ্চিত করার জন্য আমাদের প্রতিনিধি খুব শীঘ্রই আপনাকে কল করবেন। অনুগ্রহ করে কল রিসিভ করুন।
                        </p>
                    </div>

                    {/* Order Number Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-mono text-sm md:text-base font-extrabold px-5 py-2.5 rounded-full font-latin">
                        <span>Order Number:</span>
                        <span>{order.order_number}</span>
                    </div>

                    {/* Order Details Summary Card */}
                    <div className="text-left bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 space-y-3.5 font-latin">
                        <h3 className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2">
                            <ShoppingBag className="w-4 h-4 text-primary" /> Order Details
                        </h3>
                        
                        <div className="divide-y divide-gray-200/50">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="py-2.5 flex justify-between gap-3 text-xs md:text-sm">
                                    <span className="text-gray-600 line-clamp-1">{item.product_name} <strong className="text-gray-800 font-bold">× {item.quantity}</strong></span>
                                    <span className="font-bold text-gray-800">৳{item.total_price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200/80 pt-3 space-y-1.5 text-xs md:text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-800">৳{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charge</span>
                                <span className="font-semibold text-gray-800">৳{order.delivery_charge}</span>
                            </div>
                            {parseFloat(order.coupon_discount) > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Coupon Discount</span>
                                    <span>-৳{order.coupon_discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm md:text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                                <span>Total</span>
                                <span>৳{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="text-left bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 space-y-3.5 font-latin">
                        <h3 className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2">
                            <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                        </h3>
                        <div className="space-y-1 text-xs md:text-sm text-gray-600 font-medium">
                            <p><strong className="text-gray-800 font-bold">Name:</strong> {order.customer_name}</p>
                            <p><strong className="text-gray-800 font-bold">Mobile:</strong> {order.mobile}</p>
                            <p><strong className="text-gray-800 font-bold">Address:</strong> <span className="font-bangla">{order.address}</span>, {order.thana ? `${order.thana}, ` : ''}{order.district}</p>
                        </div>

                        {/* Estimated delivery banner */}
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5 mt-2">
                            <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs font-bold text-primary block">Delivery Timeline</span>
                                <span className="text-[10px] md:text-xs text-gray-500 block mt-0.5">
                                    {isInsideDhaka 
                                        ? 'Inside Dhaka: Delivery within 24 hours.' 
                                        : 'Outside Dhaka: Delivery within 2-3 business days.'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions button */}
                    <div className="pt-2">
                        <Link href={route('home')}>
                            <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 text-sm md:text-base rounded-xl border-none font-latin">
                                Continue Shopping →
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
        </StorefrontLayout>
    );
};

export default OrderConfirmation;
