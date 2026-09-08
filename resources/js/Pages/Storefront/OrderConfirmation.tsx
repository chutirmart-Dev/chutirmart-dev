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

            <div className="container px-3 xs:px-4 py-4 sm:py-8 max-w-xl">
                <div className="bg-white border border-[#E3E0D8] rounded-lg p-4 xs:p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] space-y-5 sm:space-y-6 text-center">
                    
                    {/* Success animation checkmark */}
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-13 h-13 xs:w-16 xs:h-16 text-primary animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-xl xs:text-2xl md:text-3xl font-black text-gray-900">অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! 🎉</h1>
                        <p className="text-sm xs:text-base md:text-lg text-gray-700 font-medium leading-relaxed px-1">
                            অর্ডারটি নিশ্চিত করার জন্য আমাদের প্রতিনিধি খুব শীঘ্রই আপনাকে কল করবেন। অনুগ্রহ করে কল রিসিভ করুন।
                        </p>
                    </div>

                    {/* Order Number Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-mono text-sm xs:text-base md:text-lg font-bold px-4 xs:px-5 py-2.5 rounded-full font-latin max-w-full truncate">
                        <span>Order Number:</span>
                        <span className="truncate">{order.order_number}</span>
                    </div>

                    {/* Order Details Summary Card */}
                    <div className="text-left bg-gray-50 rounded-md p-4 sm:p-5 border border-gray-100 space-y-3.5 font-latin">
                        <h3 className="text-sm sm:text-base font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200/80 pb-2.5">
                            <ShoppingBag className="w-4.5 h-4.5 text-primary" /> Order Details
                        </h3>
                        
                        <div className="divide-y divide-gray-200/60">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="py-2.5 flex justify-between items-center gap-2 text-sm sm:text-base">
                                    <span className="text-gray-800 line-clamp-1 font-medium">{item.product_name} <strong className="text-gray-900 font-bold">× {item.quantity}</strong></span>
                                    <span className="font-bold text-gray-900 shrink-0">৳{item.total_price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200/80 pt-3 space-y-2 text-sm sm:text-base text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-semibold text-gray-900">৳{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Delivery Charge</span>
                                <span className="font-semibold text-gray-900">৳{order.delivery_charge}</span>
                            </div>
                            {parseFloat(order.coupon_discount) > 0 && (
                                <div className="flex justify-between text-green-700 font-semibold">
                                    <span>Coupon Discount</span>
                                    <span>-৳{order.coupon_discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base xs:text-lg sm:text-xl font-black text-gray-950 border-t border-gray-200 pt-2.5">
                                <span>Total</span>
                                <span>৳{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="text-left bg-gray-50 rounded-md p-4 sm:p-5 border border-gray-100 space-y-3.5 font-latin">
                        <h3 className="text-sm sm:text-base font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200/80 pb-2.5">
                            <MapPin className="w-4.5 h-4.5 text-primary" /> Delivery Address
                        </h3>
                        <div className="space-y-1.5 text-sm sm:text-base text-gray-700 font-medium break-words leading-relaxed">
                            <p><strong className="text-gray-900 font-bold">Name:</strong> {order.customer_name}</p>
                            <p><strong className="text-gray-900 font-bold">Mobile:</strong> {order.mobile}</p>
                            <p><strong className="text-gray-900 font-bold">Address:</strong> <span className="font-bangla">{order.address}</span>, {order.thana ? `${order.thana}, ` : ''}{order.district}</p>
                        </div>

                        {/* Estimated delivery banner */}
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-start gap-2.5 mt-2.5">
                            <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs xs:text-sm font-bold text-primary block">Delivery Timeline</span>
                                <span className="text-xs xs:text-sm text-gray-600 font-medium block mt-0.5 leading-relaxed">
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
                            <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 text-sm sm:text-base rounded-md border-none font-latin shadow-sm">
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
