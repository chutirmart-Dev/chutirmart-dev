import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Minus, CreditCard, Truck, ShoppingBag, ChevronDown } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { toast } from 'sonner';

interface CheckoutProps {
    districts: Array<{ id: number; name: string; delivery_charge: number | null }>;
    defaultInsideDhaka: number;
    defaultOutsideDhaka: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ districts, defaultInsideDhaka, defaultOutsideDhaka }) => {
    const { 
        cartItems, 
        cartCount, 
        cartSubtotal, 
        updateQuantity, 
        removeFromCart,
        coupon,
        applyCoupon,
        removeCoupon,
        clearCart,
        setIsCartOpen
    } = useCart();

    const [thanas, setThanas] = useState<Array<{ id: number; name: string }>>([]);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(defaultOutsideDhaka);

    useEffect(() => {
        setIsCartOpen(false);
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        mobile: '',
        email: '',
        district: '',
        thana: '',
        address: '',
        items: [] as any[],
        coupon_code: '',
        special_notes: '',
        agree: false,
    });

    // Populate items in form data whenever cartItems changes
    useEffect(() => {
        setData('items', cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            variant_info: item.variant_info
        })));
    }, [cartItems]);

    // Handle district change for delivery charges and AJAX thanas
    const handleDistrictChange = async (districtName: string) => {
        setData('district', districtName);
        setData('thana', '');
        setThanas([]);

        // Calculate delivery charge
        const selected = districts.find(d => d.name === districtName);
        if (selected) {
            if (selected.delivery_charge !== null) {
                setDeliveryCharge(selected.delivery_charge);
            } else {
                const insideDhaka = ['Dhaka', 'Narayanganj', 'Gazipur'];
                setDeliveryCharge(insideDhaka.includes(districtName) ? defaultInsideDhaka : defaultOutsideDhaka);
            }

            // Fetch Thanas via AJAX
            try {
                const response = await axios.get(route('api.thanas', { district_id: selected.id }));
                setThanas(response.data);
            } catch (e) {
                console.error("Failed to load thanas", e);
            }
        }
    };

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setCouponError('');
        setCouponSuccess('');
        setIsValidatingCoupon(true);

        try {
            const response = await axios.post(route('cart.validate-coupon'), {
                code: couponCode,
                subtotal: cartSubtotal
            });

            if (response.data.valid) {
                applyCoupon(response.data.code, parseFloat(response.data.discount));
                setData('coupon_code', response.data.code);
                setCouponSuccess(response.data.message);
                setCouponCode('');
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'কুপনটি সঠিক নয়!');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setData('coupon_code', '');
        setCouponSuccess('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            toast.error('আপনার কার্ট খালি!');
            return;
        }

        if (!data.agree) {
            toast.error('অর্ডার করতে শর্তাবলীতে টিক দিন।');
            return;
        }

        post(route('checkout.place-order'), {
            onSuccess: () => {
                clearCart();
                toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! 🎉');
            },
            onError: () => {
                toast.error('অনুগ্রহ করে সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন।');
            }
        });
    };

    const discountAmount = coupon ? coupon.discount : 0;
    const finalTotal = Math.max(0, (cartSubtotal + deliveryCharge) - discountAmount);

    if (cartItems.length === 0) {
        return (
            <StorefrontLayout>
                <div className="container py-12 flex flex-col items-center justify-center text-center font-latin">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 font-bangla">চেকআউট কার্ট খালি!</h2>
                    <p className="text-sm text-gray-500 mt-1 mb-6 font-bangla">চেকআউট করতে প্রথমে কার্টে প্রোডাক্ট যোগ করুন।</p>
                    <Link href={route('home')}>
                        <Button className="bg-primary hover:bg-primary/95 text-white font-bold font-bangla">হোমে ফিরে যান</Button>
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout>
            <Head title="চেকআউট" />

            <div className="container py-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 font-bangla">
                    <span>🛒</span> চেকআউট
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Product Overview and Delivery Address */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Ordered Products List Card */}
                        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                <div className="w-1 h-5 bg-[#009E49] rounded-full" />
                                <h2 className="text-base font-bold text-gray-900 font-bangla">
                                    অর্ডারকৃত পণ্যসমূহ
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {cartItems.map((item, index) => (
                                    <div key={item.id} className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-200 shrink-0 bg-white" 
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 leading-snug">{item.name}</h4>
                                                {item.variant_info && (
                                                    <span className="text-[11px] text-gray-500 font-medium block mt-0.5">ভ্যারিয়েন্ট: {item.variant_info.value}</span>
                                                )}
                                                <span className="text-xs text-gray-500 font-semibold block sm:hidden mt-1 font-latin">৳{item.price} × {item.quantity}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-latin">
                                            {/* Quantity edit */}
                                            <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-2xs overflow-hidden h-8 sm:h-9">
                                                <button 
                                                    type="button" 
                                                    onClick={() => updateQuantity(index, item.quantity - 1)} 
                                                    className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-slate-100 text-gray-700 text-sm font-black transition-colors"
                                                    title="Decrease"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2.5 sm:px-3 text-xs sm:text-sm font-black text-gray-900 min-w-[24px] text-center">{item.quantity}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => updateQuantity(index, item.quantity + 1)} 
                                                    className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-slate-100 text-gray-700 text-sm font-black transition-colors"
                                                    title="Increase"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-xs sm:text-sm font-black text-gray-900 min-w-[65px] text-right">৳{item.price * item.quantity}</span>
                                            
                                            {/* Red delete box button */}
                                            <button 
                                                type="button" 
                                                onClick={() => removeFromCart(index)} 
                                                className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all flex items-center justify-center w-8 h-8 shrink-0 border border-red-200 hover:border-red-500 cursor-pointer shadow-2xs"
                                                title="Remove Item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Delivery Address Card (Modern & Clean Design) */}
                        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
                            {/* Header with vertical accent bar */}
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
                                <div className="w-1 h-5 bg-[#009E49] rounded-full" />
                                <h2 className="text-base font-bold text-gray-900 font-bangla">
                                    ডেলিভারি ঠিকানা
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Row 1: Name and Mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name Input */}
                                    <div>
                                        <input 
                                            id="customer_name" 
                                            placeholder="আপনার নাম *" 
                                            value={data.customer_name} 
                                            onChange={e => setData('customer_name', e.target.value)} 
                                            className={`w-full h-12 px-4 rounded-xl border ${errors.customer_name ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'} text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all font-bangla`}
                                            required
                                        />
                                        {errors.customer_name && <p className="text-red-500 text-xs mt-1 font-bangla">{errors.customer_name}</p>}
                                    </div>

                                    {/* Mobile Input with 88 Prefix */}
                                    <div>
                                        <div className={`flex rounded-xl border ${errors.mobile ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'} overflow-hidden h-12 focus-within:border-[#009E49] focus-within:ring-2 focus-within:ring-[#009E49]/10 transition-all`}>
                                            <div className="px-4 bg-gray-50/80 border-r border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 font-latin select-none">
                                                88
                                            </div>
                                            <input 
                                                id="mobile" 
                                                placeholder="আপনার মোবাইল নম্বর *" 
                                                value={data.mobile} 
                                                onChange={e => setData('mobile', e.target.value)} 
                                                className="flex-1 px-4 h-full border-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-bangla"
                                                type="tel"
                                                required
                                            />
                                        </div>
                                        {errors.mobile && <p className="text-red-500 text-xs mt-1 font-bangla">{errors.mobile}</p>}
                                    </div>
                                </div>

                                {/* Row 2: Full Detailed Address */}
                                <div>
                                    <input 
                                        id="address" 
                                        placeholder="জেলা, থানা, বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা *" 
                                        value={data.address} 
                                        onChange={e => setData('address', e.target.value)} 
                                        className={`w-full h-12 px-4 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'} text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all font-bangla`}
                                        required
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1 font-bangla">{errors.address}</p>}
                                </div>

                                {/* Row 3: District and Thana searchable dropdowns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* District Searchable Dropdown */}
                                    <div>
                                        <SearchableSelect
                                            options={districts.map(d => ({ value: d.name, label: d.name }))}
                                            value={data.district}
                                            onChange={handleDistrictChange}
                                            placeholder="জেলা সিলেক্ট করুন *"
                                            searchPlaceholder="Type to search..."
                                            error={errors.district}
                                        />
                                        {errors.district && <p className="text-red-500 text-xs mt-1 font-bangla">{errors.district}</p>}
                                    </div>

                                    {/* Thana Searchable Dropdown */}
                                    <div>
                                        <SearchableSelect
                                            options={thanas.map(t => ({ value: t.name, label: t.name }))}
                                            value={data.thana}
                                            onChange={(val) => setData('thana', val)}
                                            placeholder="থানা সিলেক্ট করুন (ঐচ্ছিক)"
                                            searchPlaceholder="Type to search..."
                                            disabled={!data.district}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Order Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* 1. Payment Method radio cards */}
                        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                <div className="w-1 h-5 bg-[#009E49] rounded-full" />
                                <h2 className="text-base font-bold text-gray-900 font-bangla">
                                    পেমেন্ট পদ্ধতি
                                </h2>
                            </div>
                            <div className="space-y-3 font-bangla">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Cash on Delivery */}
                                    <div className="border-2 border-[#009E49] bg-emerald-50/40 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-4 h-4 rounded-full border-2 border-[#009E49] flex items-center justify-center shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-[#009E49]" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">ক্যাশ অন ডেলিভারি</span>
                                        </div>
                                        <span className="text-[#009E49] font-black text-xs">✔</span>
                                    </div>

                                    {/* Online Payment */}
                                    <div className="border border-gray-200 opacity-60 rounded-xl p-3.5 flex items-center gap-2.5 bg-gray-50/50 cursor-not-allowed">
                                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                                        <span className="text-xs font-bold text-gray-600">অনলাইন পেমেন্ট</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Coupon Validation & Order Summary */}
                        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                <div className="w-1 h-5 bg-[#009E49] rounded-full" />
                                <h2 className="text-base font-bold text-gray-900 font-bangla">
                                    অর্ডার বিবরণ ও সামারি
                                </h2>
                            </div>

                            {/* Coupon field */}
                            {coupon ? (
                                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 px-4">
                                    <div>
                                        <span className="text-xs text-gray-500 font-bangla">প্রযুক্ত কুপন:</span>
                                        <span className="text-sm font-black text-[#009E49] block font-latin">{coupon.code} (-৳{coupon.discount})</span>
                                    </div>
                                    <Button type="button" size="sm" variant="ghost" onClick={handleRemoveCoupon} className="text-red-500 hover:bg-red-50 border-none font-bold text-xs">মুছুন</Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="কুপন কোড লিখুন" 
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value)}
                                            className="h-11 text-sm border-gray-300 rounded-xl focus-visible:ring-[#009E49] font-bangla"
                                        />
                                        <Button type="button" onClick={handleApplyCoupon} disabled={isValidatingCoupon} className="bg-[#009E49] hover:bg-[#007F3B] text-white font-bold h-11 px-5 border-none rounded-xl font-bangla shrink-0">
                                            প্রয়োগ করুন
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {couponError && <p className="text-red-500 text-xs mt-1 font-bangla">{couponError}</p>}
                            {couponSuccess && <p className="text-green-600 text-xs mt-1 font-bangla">{couponSuccess}</p>}

                            {/* Cost Lines */}
                            <div className="space-y-3 pt-2 text-sm text-gray-600 border-t border-gray-100 font-bangla">
                                <div className="flex justify-between font-semibold">
                                    <span>সাবটোটাল</span>
                                    <span className="text-gray-900 font-bold font-latin">৳{cartSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>ডেলিভারি চার্জ</span>
                                    <span className="text-gray-900 font-bold font-latin">৳{deliveryCharge}</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between font-semibold text-[#009E49]">
                                        <span>কুপন ডিসকাউন্ট</span>
                                        <span className="font-bold font-latin">-৳{coupon.discount}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-base sm:text-lg font-black text-gray-900 border-t border-dashed border-gray-200 pt-3.5 mt-2">
                                    <span>সর্বমোট</span>
                                    <span className="text-[#009E49] font-latin">৳{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Special notes */}
                            <div className="space-y-1.5 pt-2">
                                <Label htmlFor="special_notes" className="text-xs font-bold text-gray-600 font-bangla">অতিরিক্ত নির্দেশনা বা নোট (ঐচ্ছিক)</Label>
                                <Textarea 
                                    id="special_notes" 
                                    placeholder="ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..." 
                                    value={data.special_notes} 
                                    onChange={e => setData('special_notes', e.target.value)} 
                                    className="min-h-[70px] text-sm border-gray-300 rounded-xl font-bangla"
                                />
                            </div>

                            {/* Terms & conditions check */}
                            <div className="flex items-start gap-2.5 pt-2">
                                <Checkbox 
                                    id="agree" 
                                    checked={data.agree}
                                    onCheckedChange={checked => setData('agree', !!checked)}
                                    className="border-gray-300 accent-[#009E49] w-4.5 h-4.5 mt-0.5"
                                />
                                <Label htmlFor="agree" className="text-xs text-gray-600 leading-normal cursor-pointer font-medium font-bangla">
                                    আমি টার্মস & কন্ডিশনস, প্রাইভেসি পলিসি এবং রিফান্ড পলিসি পড়েছি এবং সম্মত আছি।
                                </Label>
                            </div>

                            {/* Place order button */}
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="w-full bg-[#009E49] hover:bg-[#007F3B] text-white h-14 text-base font-extrabold rounded-xl shadow-lg border-none flex items-center justify-center gap-2 transition-all font-bangla uppercase tracking-wide cursor-pointer"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {processing ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন 🛍️'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </StorefrontLayout>
    );
};

// Helper Empty state Icon component
const ShoppingBagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

export default Checkout;
