import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, Plus, Minus, ShoppingBag, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link, router } from '@inertiajs/react';
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
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white p-0 [&>button]:hidden">
                <SheetHeader className="px-4 py-4 border-b border-gray-100 flex flex-row items-center justify-between">
                    <SheetTitle className="text-base md:text-lg font-black flex items-center gap-2 font-latin">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        Shopping Cart
                        <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{cartCount} items</span>
                    </SheetTitle>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="bg-destructive hover:bg-destructive/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-0.5 transition-colors focus:outline-none"
                    >
                        Close →
                    </button>
                </SheetHeader>

                {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-base font-semibold text-gray-700 mb-1 font-bangla">আপনার কার্টটি খালি!</h3>
                        <p className="text-sm text-gray-500 mb-6 font-bangla">কার্টে পণ্য যোগ করতে কেনাকাটা চালিয়ে যান।</p>
                        <Button onClick={() => setIsCartOpen(false)} className="bg-primary hover:bg-primary/95 text-white font-bangla">
                            পণ্য খুঁজতে যান
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Line Items List */}
                        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-gray-100">
                            {cartItems.map((item, index) => (
                                <div key={item.id} className="py-4 flex gap-3 items-center">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-16 h-16 rounded-md object-cover border border-gray-100 shrink-0"
                                        onError={e => {
                                            (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 leading-snug">{item.name}</h4>
                                        {item.variant_info && (
                                            <p className="text-xs text-[#009E49] font-medium mt-0.5">
                                                {item.variant_info.label || item.variant_info.value || 'Variant selected'}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            {/* Quantity Stepper */}
                                            <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-2xs overflow-hidden h-8">
                                                <button 
                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                    className="w-7 h-full flex items-center justify-center hover:bg-slate-100 text-gray-700 text-sm font-black transition-colors"
                                                    title="Decrease"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2.5 text-xs sm:text-sm font-black text-gray-900 min-w-[24px] text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                    className="w-7 h-full flex items-center justify-center hover:bg-slate-100 text-gray-700 text-sm font-black transition-colors"
                                                    title="Increase"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {/* Price info format */}
                                            <span className="text-xs sm:text-sm text-gray-600 font-semibold font-latin">
                                                × ৳{item.price} = <span className="font-bold text-[#E2231A]">৳{item.price * item.quantity}</span>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Delete block button */}
                                    <button 
                                        onClick={() => removeFromCart(index)}
                                        className="bg-destructive hover:bg-destructive/90 text-white p-2 rounded-lg transition-colors flex items-center justify-center w-8 h-8 shrink-0 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer Summary & Coupon */}
                        <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
                            {/* Coupon Code Accordion */}
                            <Accordion className="w-full border-none">
                                <AccordionItem value="coupon" className="border-none">
                                    <AccordionTrigger className="py-1 text-xs font-semibold text-gray-500 hover:no-underline flex gap-1 justify-start font-latin">
                                        Have a coupon code?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2">
                                        {coupon ? (
                                            <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-2 px-3">
                                                <div>
                                                    <span className="text-[10px] text-gray-500">Applied Coupon:</span>
                                                    <span className="text-xs font-bold text-primary block">{coupon.code} (-৳{coupon.discount})</span>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={removeCoupon}
                                                    className="text-red-500 hover:bg-red-50 text-xs"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                                <Input 
                                                    placeholder="Enter Coupon" 
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value)}
                                                    className="h-9 text-xs"
                                                />
                                                <Button 
                                                    size="sm" 
                                                    type="submit" 
                                                    disabled={isValidating}
                                                    className="bg-[#D62828] hover:bg-[#b22222] text-white text-xs font-bold px-4 border-none"
                                                >
                                                    Apply
                                                </Button>
                                            </form>
                                        )}
                                        {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
                                        {couponSuccess && <p className="text-green-600 text-xs mt-1.5">{couponSuccess}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Summary Totals */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-xs text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>৳ {cartSubtotal}</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between text-xs text-green-600 font-medium">
                                        <span>Discount</span>
                                        <span>-৳ {coupon.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-800 border-t border-gray-200/80 pt-2 font-latin">
                                    <span>Total</span>
                                    <span>৳ {finalTotal}</span>
                                </div>
                            </div>

                            {/* Checkout Actions */}
                            <Button 
                                onClick={handleCheckout} 
                                className="w-full bg-[#D62828] hover:bg-[#b22222] text-white py-6 text-base font-extrabold rounded-xl shadow-md border-none flex items-center justify-center gap-1.5 transition-all font-latin"
                            >
                                Proceed to Checkout →
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
