import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, Plus, Minus, ShoppingBag, Percent, X, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { router } from '@inertiajs/react';
import axios from 'axios';

export const CartSheet: React.FC = () => {
    const { 
        cartItems, 
        cartCount, 
        cartSubtotal, 
        isCartOpen, 
        setIsCartOpen, 
        updateQuantity, 
        removeFromCart,
        coupon,
        applyCoupon,
        removeCoupon
    } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setCouponError('');
        setCouponSuccess('');
        setIsValidating(true);

        try {
            const response = await axios.post(route('cart.validate-coupon'), {
                code: couponCode,
                subtotal: cartSubtotal
            });

            if (response.data.valid) {
                applyCoupon(response.data.code, parseFloat(response.data.discount));
                setCouponSuccess(response.data.message);
                setCouponCode('');
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'কুপনটি সঠিক নয়!');
        } finally {
            setIsValidating(false);
        }
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.visit(route('checkout'));
    };

    const discountAmount = coupon ? coupon.discount : 0;
    const finalTotal = Math.max(0, cartSubtotal - discountAmount);

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent 
                className="w-full sm:w-[420px] sm:max-w-md max-w-full flex flex-col h-full bg-[#FAFAFA] p-0 border-none sm:border-l sm:border-gray-200 shadow-2xl [&>button]:hidden focus:outline-none"
            >
                {/* Mobile drag handle indicator */}
                <div className="sm:hidden flex justify-center pt-2 pb-0.5 bg-white">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Modern App Header */}
                <SheetHeader className="px-4 py-3 sm:py-3.5 bg-white border-b border-gray-100 flex flex-row items-center justify-between shadow-sm gap-2">
                    <SheetTitle className="text-base sm:text-lg font-black flex items-center gap-2.5 font-latin m-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-red-50 text-[#E2231A] flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-900 tracking-tight">Shopping Cart</span>
                            <span className="text-[11px] bg-red-50 text-[#E2231A] border border-red-100 font-bold px-2 py-0.5 rounded-full font-latin">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </SheetTitle>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shrink-0"
                        title="Close cart"
                        aria-label="Close cart"
                    >
                        <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                </SheetHeader>

                {/* Reassurance Banner */}
                <div className="bg-emerald-50/90 border-b border-emerald-100/80 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800 font-bangla shrink-0">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#009E49] shrink-0" />
                        <span className="truncate">ক্যাশ অন ডেলিভারি ও দ্রুত শিপিং সুবিধা! 🚀</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-white/90 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 font-latin shrink-0 ml-2">
                        COD
                    </span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 font-bangla">আপনার কার্টটি বর্তমানে খালি!</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6 font-bangla max-w-xs leading-relaxed">পছন্দের পণ্যটি কার্টে যোগ করতে এখনই কেনাকাটা চালিয়ে যান।</p>
                        <Button 
                            onClick={() => setIsCartOpen(false)} 
                            className="bg-[#E2231A] hover:bg-[#c61e16] text-white font-bangla font-bold rounded-md px-6 h-12 text-sm sm:text-base cursor-pointer shadow-[0_4px_14px_rgba(226,35,26,0.25)]"
                        >
                            কেনাকাটা শুরু করুন
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Line Items List (Card-based, spacious, mobile-perfect) */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3 bg-[#F8F9FA]">
                            {cartItems.map((item, index) => (
                                <div 
                                    key={`${item.id}-${index}`} 
                                    className="bg-white border border-gray-200/80 rounded-lg p-3 sm:p-3.5 flex items-center gap-3 relative shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow"
                                >
                                    {/* Product Thumbnail */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md border border-gray-100 shrink-0 bg-gray-50 overflow-hidden flex items-center justify-center">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover rounded-md" 
                                            onError={e => {
                                                (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                            }}
                                        />
                                    </div>

                                    {/* Product Info & Quantity Row */}
                                    <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                                        <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug font-bangla">
                                            {item.name}
                                        </h4>
                                        {item.variant_info && (
                                            <span className="text-xs text-[#009E49] font-bold mt-0.5 inline-block w-fit bg-emerald-50 px-2 py-0.5 rounded font-bangla">
                                                {item.variant_info.label || item.variant_info.value || 'Variant selected'}
                                            </span>
                                        )}
                                        <div className="flex items-center justify-between gap-2 mt-2 font-latin">
                                            {/* Quantity Stepper */}
                                            <div className="inline-flex items-center bg-gray-100 border border-gray-200/80 rounded-full p-0.5 h-8 sm:h-9">
                                                <button 
                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                    className="w-7 sm:w-8 h-full flex items-center justify-center rounded-full bg-white shadow-2xs hover:bg-gray-50 active:scale-90 text-gray-700 text-xs sm:text-sm font-black transition-transform cursor-pointer"
                                                    title="Decrease"
                                                    type="button"
                                                >
                                                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </button>
                                                <span className="px-2 text-sm font-black text-gray-900 min-w-[22px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                    className="w-7 sm:w-8 h-full flex items-center justify-center rounded-full bg-white shadow-2xs hover:bg-gray-50 active:scale-90 text-[#009E49] text-xs sm:text-sm font-black transition-transform cursor-pointer"
                                                    title="Increase"
                                                    type="button"
                                                >
                                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </button>
                                            </div>

                                            {/* Price info: ৳490 */}
                                            <span className="font-black text-[#009E49] text-sm sm:text-base whitespace-nowrap">
                                                ৳{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Delete button */}
                                    <button 
                                        onClick={() => removeFromCart(index)}
                                        className="self-start sm:self-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                        title="Remove Item"
                                        type="button"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Modern App Sticky Footer */}
                        <div 
                            className="border-t border-gray-100 p-4 sm:p-5 bg-white space-y-3.5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] shrink-0"
                            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 16px))' }}
                        >
                            {/* Coupon Code Accordion */}
                            <Accordion className="w-full border-none">
                                <AccordionItem value="coupon" className="border-none">
                                    <AccordionTrigger className="py-1 text-xs sm:text-sm font-bold text-gray-600 hover:no-underline flex gap-1.5 justify-start font-latin hover:text-gray-900">
                                        <Percent className="w-4 h-4 text-[#E2231A]" />
                                        Have a coupon code?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2">
                                        {coupon ? (
                                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md p-2.5 px-3">
                                                <div>
                                                    <span className="text-xs text-gray-500 font-latin">Applied Coupon:</span>
                                                    <span className="text-sm font-black text-[#009E49] block font-latin">{coupon.code} (-৳{coupon.discount})</span>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={removeCoupon}
                                                    className="text-red-500 hover:bg-red-50 text-xs sm:text-sm font-bold rounded-md"
                                                    type="button"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                                <Input 
                                                    placeholder="Enter Coupon Code" 
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value)}
                                                    className="h-11 text-sm rounded-md border-gray-300"
                                                />
                                                <Button 
                                                    size="sm" 
                                                    type="submit" 
                                                    disabled={isValidating}
                                                    className="bg-[#E2231A] hover:bg-[#c61e16] active:scale-95 text-white text-xs sm:text-sm font-black px-4 h-11 rounded-md border-none cursor-pointer"
                                                >
                                                    {isValidating ? 'Checking...' : 'Apply'}
                                                </Button>
                                            </form>
                                        )}
                                        {couponError && <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-bangla">{couponError}</p>}
                                        {couponSuccess && <p className="text-green-600 text-xs sm:text-sm mt-1.5 font-bangla">{couponSuccess}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Summary Totals */}
                            <div className="space-y-1.5 pt-0.5 text-sm sm:text-base font-latin">
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-bold">৳{cartSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg font-black text-gray-900 border-t border-gray-100 pt-2.5">
                                    <span>Total</span>
                                    <span className="text-xl sm:text-2xl font-black text-[#E2231A]">৳{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Checkout Action Button */}
                            <Button 
                                onClick={handleCheckout} 
                                className="w-full bg-[#E2231A] hover:bg-[#c61e16] active:scale-[0.98] text-white h-13 sm:h-14 text-base font-extrabold rounded-md shadow-[0_4px_16px_rgba(226,35,26,0.3)] border-none flex items-center justify-between px-5 transition-all font-latin cursor-pointer"
                                type="button"
                            >
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>Proceed to Checkout</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded text-sm sm:text-base font-black">
                                    <span>৳{finalTotal.toLocaleString()}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Button>

                            {/* Trust Badge */}
                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-bangla pt-0.5 font-medium">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>নিরাপদ চেকআউট • দ্রুত ডেলিভারি • সহজ রিটার্ন</span>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
