import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Minus, CreditCard, Truck, ShoppingBag, ChevronDown, CheckCircle2, User, Phone, MapPin, Building2, Navigation } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { toast } from 'sonner';
import { trackInitiateCheckout } from '@/lib/gtm';
import { 
    getDistrictLabel, 
    getDistrictSearchKeywords, 
    getThanaLabel, 
    getThanaSearchKeywords,
    DISTRICT_BANGLA_MAP,
    COMMON_THANA_BANGLA_MAP
} from '@/lib/bangladeshLocations';

interface CheckoutProps {
    districts: Array<{ id: number; name: string; delivery_charge: number | null }>;
    thanasByDistrict?: Record<string | number, Array<{ id: number; district_id: number; name: string }>>;
    defaultInsideDhaka: number;
    defaultOutsideDhaka: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ districts, thanasByDistrict, defaultInsideDhaka, defaultOutsideDhaka }) => {
    const { auth } = usePage().props as any;
    const authUser = auth?.user;

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
    const [isLoadingThanas, setIsLoadingThanas] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(defaultOutsideDhaka);

    const originalButtonRef = useRef<HTMLDivElement>(null);
    const [isOriginalButtonVisible, setIsOriginalButtonVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsOriginalButtonVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (originalButtonRef.current) {
            observer.observe(originalButtonRef.current);
        }

        return () => observer.disconnect();
    }, [cartItems]);

    useEffect(() => {
        setIsCartOpen(false);
        if (cartItems.length > 0) {
            trackInitiateCheckout(cartItems, cartSubtotal);
        }
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: authUser?.name || '',
        mobile: authUser?.phone || '',
        email: authUser?.email || '',
        district: '',
        thana: '',
        address: '',
        items: [] as any[],
        coupon_code: '',
        special_notes: '',
        agree: true,
    });

    useEffect(() => {
        if (authUser) {
            if (!data.customer_name && authUser.name) setData('customer_name', authUser.name);
            if (!data.mobile && authUser.phone) setData('mobile', authUser.phone);
            if (!data.email && authUser.email) setData('email', authUser.email);
        }
    }, [authUser]);

    // Populate items in form data whenever cartItems changes
    useEffect(() => {
        setData('items', cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            variant_info: item.variant_info
        })));
    }, [cartItems]);

    // Helper to automatically update the address input when district / thana is selected
    const updateAddressWithLocation = (
        currentAddress: string,
        newDistrict: string,
        newThana: string,
        prevDistrict: string,
        prevThana: string
    ): string => {
        const distBn = newDistrict ? (DISTRICT_BANGLA_MAP[newDistrict]?.bn || newDistrict) : '';
        const thanaBn = newThana ? (COMMON_THANA_BANGLA_MAP[newThana] || newThana) : '';
        
        // Target location string in standard format: "থানা, জেলা" or just "জেলা"
        const newLocation = [thanaBn, distBn].filter(Boolean).join(', ');
        if (!newLocation) return currentAddress;

        const prevDistBn = prevDistrict ? (DISTRICT_BANGLA_MAP[prevDistrict]?.bn || prevDistrict) : '';
        const prevThanaBn = prevThana ? (COMMON_THANA_BANGLA_MAP[prevThana] || prevThana) : '';

        // All previous auto-inserted tokens to match and replace cleanly
        const prevPatterns = [
            [prevThanaBn, prevDistBn].filter(Boolean).join(', '),
            [prevThana, prevDistrict].filter(Boolean).join(', '),
            prevThanaBn,
            prevDistBn,
            prevThana,
            prevDistrict,
        ].filter(Boolean);

        let cleanAddress = (currentAddress || '').trim();

        // If current address is empty, or equals any previous auto-generated pattern
        if (!cleanAddress || prevPatterns.some(p => cleanAddress === p)) {
            return newLocation;
        }

        // If user already typed custom parts (e.g. "বাসা ১২, রোড ৪, পূর্বেরথানা, পূর্বেরজেলা")
        for (const p of prevPatterns) {
            if (p && cleanAddress.includes(p)) {
                cleanAddress = cleanAddress.replace(p, '').replace(/,\s*,/g, ',').replace(/^[\s,]+|[\s,]+$/g, '').trim();
                break;
            }
        }

        if (cleanAddress) {
            return `${cleanAddress}, ${newLocation}`;
        }

        return newLocation;
    };

    // Handle district change for delivery charges, AJAX thanas, and auto-filling address
    const handleDistrictChange = async (districtName: string) => {
        const newAddress = updateAddressWithLocation(data.address, districtName, '', data.district, data.thana);
        setData(prev => ({
            ...prev,
            district: districtName,
            thana: '',
            address: newAddress
        }));
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

            // Check if thanas are pre-loaded in Inertia props for zero-latency response
            const preloaded = thanasByDistrict && (thanasByDistrict[selected.id] || (thanasByDistrict as any)[String(selected.id)]);
            if (preloaded && preloaded.length > 0) {
                setThanas(preloaded);
                return;
            }

            // Fallback: Fetch Thanas via AJAX
            setIsLoadingThanas(true);
            try {
                const response = await axios.get(route('api.thanas', { district_id: selected.id }));
                setThanas(response.data);
            } catch (e) {
                console.error("Failed to load thanas", e);
            } finally {
                setIsLoadingThanas(false);
            }
        }
    };

    // Handle thana change and automatically update address field
    const handleThanaChange = (thanaName: string) => {
        const newAddress = updateAddressWithLocation(data.address, data.district, thanaName, data.district, data.thana);
        setData(prev => ({
            ...prev,
            thana: thanaName,
            address: newAddress
        }));
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 flex items-center gap-2 font-bangla">
                        <span>🛒</span> চেকআউট
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#009E49] text-xs sm:text-sm font-bold w-fit shadow-2xs font-bangla">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#009E49]" />
                        <span>অ্যাকাউন্ট ছাড়াই সরাসরি অর্ডার কনফার্ম করুন</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 md:pb-0">
                    
                    {/* Left Column: Product Overview and Delivery Address */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Ordered Products List Card */}
                        <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] space-y-3.5 sm:space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <div className="w-1 h-4 sm:h-5 bg-[#009E49] rounded-full" />
                                    <h2 className="text-base sm:text-lg font-extrabold text-gray-950 font-bangla">
                                        অর্ডারকৃত পণ্যসমূহ
                                    </h2>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-gray-500 font-latin bg-gray-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0">
                                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                            <div className="space-y-2.5 sm:space-y-3">
                                {cartItems.map((item, index) => (
                                    <div 
                                        key={`${item.id}-${index}`} 
                                        className="bg-white hover:bg-gray-50/50 border border-gray-200/85 rounded-xl p-2.5 sm:p-3.5 flex gap-2.5 sm:gap-3.5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative"
                                    >
                                        {/* Product Image */}
                                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg border border-gray-150 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center self-start">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover" 
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                                }}
                                            />
                                        </div>

                                        {/* Details & Controls */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5 sm:gap-2">
                                            {/* Top Row: Product Title & Delete Button */}
                                            <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                                <div className="min-w-0 flex-1 pr-1">
                                                    <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-snug font-bangla" title={item.name}>
                                                        {item.name}
                                                    </h4>
                                                    {item.variant_info && (
                                                        <span className="text-[10px] sm:text-xs text-[#009E49] font-bold inline-block mt-0.5 bg-emerald-50 px-1.5 py-0.5 rounded font-bangla">
                                                            {item.variant_info.label || item.variant_info.value || 'Variant selected'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Delete button: modern, clean, non-intrusive */}
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFromCart(index)} 
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-90"
                                                    title="পণ্যটি মুছে ফেলুন"
                                                    aria-label="Remove Item"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                            </div>

                                            {/* Bottom row: Stepper on Left, Total Price on Right */}
                                            <div className="flex items-center justify-between gap-2 font-latin pt-0.5">
                                                {/* Stepper with compact mobile footprint */}
                                                <div className="inline-flex items-center bg-gray-100/90 hover:bg-gray-100 border border-gray-200/80 rounded-full p-0.5 h-7 sm:h-8 shrink-0">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => updateQuantity(index, item.quantity - 1)} 
                                                        className="w-6 sm:w-7 h-full flex items-center justify-center rounded-full bg-white shadow-2xs hover:bg-gray-50 active:scale-90 text-gray-700 text-xs font-black transition-transform cursor-pointer"
                                                        title="Decrease"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-3 h-3 stroke-[2.5]" />
                                                    </button>
                                                    <span className="px-1.5 sm:px-2 text-xs sm:text-sm font-black text-gray-900 min-w-[18px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => updateQuantity(index, item.quantity + 1)} 
                                                        className="w-6 sm:w-7 h-full flex items-center justify-center rounded-full bg-white shadow-2xs hover:bg-gray-50 active:scale-90 text-[#009E49] text-xs font-black transition-transform cursor-pointer"
                                                        title="Increase"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-3 h-3 stroke-[2.5]" />
                                                    </button>
                                                </div>

                                                {/* Total Price & Unit calculation */}
                                                <div className="text-right shrink-0 flex flex-col items-end justify-center">
                                                    <span className="text-xs xs:text-sm sm:text-base font-black text-[#009E49] whitespace-nowrap block leading-tight">
                                                        ৳{Number((item.price * item.quantity).toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-[10px] sm:text-xs text-gray-400 block font-medium whitespace-nowrap leading-none mt-0.5">
                                                            (৳{Number(item.price.toFixed(2)).toLocaleString('en-US')} × {item.quantity})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Delivery Address Card (Modern & Clean Design) */}
                        <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 sm:space-y-5">
                            {/* Header with vertical accent bar */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-1.5 h-6 bg-[#009E49] rounded-full" />
                                    <h2 className="text-lg sm:text-xl font-black text-gray-950 font-bangla tracking-tight">
                                        ডেলিভারি ঠিকানা
                                    </h2>
                                </div>
                                <span className="text-xs sm:text-[13px] font-semibold text-[#009E49] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md font-bangla flex items-center gap-1">
                                    <span>সঠিক তথ্য দিন</span>
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Row 1: Name and Mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    {/* Name Input */}
                                    <div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-gray-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input 
                                                id="customer_name" 
                                                placeholder="আপনার নাম *" 
                                                value={data.customer_name} 
                                                onChange={e => setData('customer_name', e.target.value)} 
                                                className={`w-full h-13 sm:h-14 pl-11 sm:pl-12 pr-4 rounded-lg border ${errors.customer_name ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/10' : 'border-gray-300 bg-white hover:border-gray-400'} text-base sm:text-[16.5px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/12 transition-all font-bangla shadow-xs`}
                                                required
                                            />
                                        </div>
                                        {errors.customer_name && <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-bangla">{errors.customer_name}</p>}
                                    </div>

                                    {/* Mobile Input with 88 Prefix */}
                                    <div>
                                        <div className={`flex rounded-lg border ${errors.mobile ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/10' : 'border-gray-300 bg-white hover:border-gray-400'} overflow-hidden h-13 sm:h-14 focus-within:border-[#009E49] focus-within:ring-4 focus-within:ring-[#009E49]/12 transition-all shadow-xs`}>
                                            <div className="px-3.5 sm:px-4 bg-gray-50/90 border-r border-gray-200/90 flex items-center justify-center gap-1.5 text-base sm:text-[16.5px] font-bold text-gray-700 font-latin select-none shrink-0">
                                                <Phone className="w-4.5 h-4.5 text-gray-400" />
                                                <span>88</span>
                                            </div>
                                            <input 
                                                id="mobile" 
                                                placeholder="আপনার মোবাইল নম্বর *" 
                                                value={data.mobile} 
                                                onChange={e => setData('mobile', e.target.value)} 
                                                className="flex-1 px-3.5 sm:px-4 h-full border-none bg-transparent text-base sm:text-[16.5px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none font-bangla"
                                                type="tel"
                                                required
                                            />
                                        </div>
                                        {errors.mobile && <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-bangla">{errors.mobile}</p>}
                                    </div>
                                </div>

                                {/* Row 2: Full Detailed Address */}
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-gray-400">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <input 
                                            id="address" 
                                            placeholder="জেলা, থানা, বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা *" 
                                            value={data.address} 
                                            onChange={e => setData('address', e.target.value)} 
                                            className={`w-full h-13 sm:h-14 pl-11 sm:pl-12 pr-4 rounded-lg border ${errors.address ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/10' : 'border-gray-300 bg-white hover:border-gray-400'} text-base sm:text-[16.5px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/12 transition-all font-bangla shadow-xs`}
                                            required
                                        />
                                    </div>
                                    {errors.address && <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-bangla">{errors.address}</p>}
                                </div>

                                {/* Row 3: District and Thana searchable dropdowns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    {/* District Searchable Dropdown */}
                                    <div>
                                        <SearchableSelect
                                            options={districts.map(d => ({
                                                value: d.name,
                                                label: getDistrictLabel(d.name),
                                                searchTerms: getDistrictSearchKeywords(d.name)
                                            }))}
                                            value={data.district}
                                            onChange={handleDistrictChange}
                                            placeholder="জেলা সিলেক্ট করুন *"
                                            searchPlaceholder="জেলা খুঁজুন (যেমন: ঢাকা, Mymensingh)..."
                                            error={errors.district}
                                            icon={<Building2 className="w-5 h-5 text-gray-400" />}
                                        />
                                        {errors.district && <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-bangla">{errors.district}</p>}
                                    </div>

                                    {/* Thana Searchable Dropdown */}
                                    <div>
                                        <SearchableSelect
                                            options={thanas.map(t => ({
                                                value: t.name,
                                                label: getThanaLabel(t.name),
                                                searchTerms: getThanaSearchKeywords(t.name)
                                            }))}
                                            value={data.thana}
                                            onChange={handleThanaChange}
                                            placeholder={
                                                isLoadingThanas 
                                                    ? "থানা লোড হচ্ছে..." 
                                                    : data.district 
                                                        ? "থানা সিলেক্ট করুন (ঐচ্ছিক)" 
                                                        : "থানা সিলেক্ট করুন (প্রথমে জেলা নির্বাচন করুন)"
                                            }
                                            searchPlaceholder="থানা খুঁজুন (যেমন: ত্রিশাল, Trishal)..."
                                            disabled={!data.district || isLoadingThanas}
                                            allowCustom={true}
                                            icon={<Navigation className="w-5 h-5 text-gray-400" />}
                                            onDisabledClick={() => {
                                                if (!data.district) {
                                                    toast.info('অনুগ্রহ করে প্রথমে আপনার জেলা নির্বাচন করুন।');
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Order Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* 1. Payment Method radio cards */}
                        <div className="bg-white border border-gray-200/90 rounded-lg p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                <div className="w-1 h-5 bg-[#009E49] rounded-full" />
                                <h2 className="text-base sm:text-lg font-extrabold text-gray-950 font-bangla">
                                    পেমেন্ট পদ্ধতি
                                </h2>
                            </div>
                            <div className="space-y-3 font-bangla">
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                                    {/* Cash on Delivery */}
                                    <div className="border-2 border-[#009E49] bg-emerald-50/40 rounded-md p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all shadow-2xs">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-4.5 h-4.5 rounded-full border-2 border-[#009E49] flex items-center justify-center shrink-0">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#009E49]" />
                                            </div>
                                            <span className="text-sm sm:text-base font-bold text-gray-950">ক্যাশ অন ডেলিভারি</span>
                                        </div>
                                        <span className="text-[#009E49] font-black text-sm">✔</span>
                                    </div>

                                    {/* Online Payment */}
                                    <div className="border border-gray-200 opacity-60 rounded-md p-3.5 sm:p-4 flex items-center gap-2.5 bg-gray-50/50 cursor-not-allowed">
                                        <div className="w-4.5 h-4.5 rounded-full border border-gray-300 shrink-0" />
                                        <span className="text-sm sm:text-base font-bold text-gray-600">অনলাইন পেমেন্ট</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Coupon Validation & Order Summary */}
                        <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                <div className="w-1 h-5 bg-[#009E49] rounded-full" />
                                <h2 className="text-base sm:text-lg font-extrabold text-gray-950 font-bangla">
                                    অর্ডার বিবরণ ও সামারি
                                </h2>
                            </div>

                            {/* Coupon field */}
                            {coupon ? (
                                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md p-3 px-4">
                                    <div>
                                        <span className="text-xs sm:text-sm text-gray-500 font-bangla">প্রযুক্ত কুপন:</span>
                                        <span className="text-sm sm:text-base font-black text-[#009E49] block font-latin">{coupon.code} (-৳{coupon.discount})</span>
                                    </div>
                                    <Button type="button" size="sm" variant="ghost" onClick={handleRemoveCoupon} className="text-red-500 hover:bg-red-50 border-none font-bold text-xs sm:text-sm rounded-md">মুছুন</Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="কুপন কোড লিখুন" 
                                            value={couponCode} 
                                            onChange={e => setCouponCode(e.target.value)} 
                                            className="h-12 text-[15px] sm:text-base font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal border-gray-300 rounded-md focus-visible:ring-[#009E49]/15 focus-visible:border-[#009E49] font-bangla"
                                        />
                                        <Button type="button" onClick={handleApplyCoupon} disabled={isValidatingCoupon} className="bg-[#009E49] hover:bg-[#007F3B] text-white font-bold h-12 px-5 border-none rounded-md font-bangla shrink-0 cursor-pointer text-sm sm:text-base">
                                            প্রয়োগ করুন
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {couponError && <p className="text-red-500 text-xs sm:text-sm mt-1 font-bangla">{couponError}</p>}
                            {couponSuccess && <p className="text-green-600 text-xs sm:text-sm mt-1 font-bangla">{couponSuccess}</p>}

                            {/* Cost Lines */}
                            <div className="space-y-3 pt-2 text-sm sm:text-base text-gray-700 border-t border-gray-100 font-bangla">
                                <div className="flex justify-between font-medium">
                                    <span>সাবটোটাল</span>
                                    <span className="text-gray-900 font-bold font-latin">৳{cartSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>ডেলিভারি চার্জ</span>
                                    <span className="text-gray-900 font-bold font-latin">৳{deliveryCharge}</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between font-semibold text-[#009E49]">
                                        <span>কুপন ডিসকাউন্ট</span>
                                        <span className="font-bold font-latin">-৳{coupon.discount}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-base sm:text-lg md:text-xl font-black text-gray-950 border-t border-dashed border-gray-200 pt-3.5 mt-2">
                                    <span>সর্বমোট</span>
                                    <span className="text-[#009E49] font-latin">৳{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Special notes */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[#009E49] rounded-full" />
                                    <Label htmlFor="special_notes" className="text-sm sm:text-base font-bold text-gray-900 font-bangla">
                                        বিশেষ নির্দেশনা <span className="text-xs sm:text-sm font-normal text-gray-500">(ঐচ্ছিক)</span>
                                    </Label>
                                </div>
                                <Textarea 
                                    id="special_notes" 
                                    placeholder="ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..." 
                                    value={data.special_notes} 
                                    onChange={e => setData('special_notes', e.target.value)} 
                                    className="min-h-[75px] text-[15px] sm:text-base font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal border-gray-300 rounded-md focus-visible:ring-[#009E49]/15 focus-visible:border-[#009E49] font-bangla"
                                />
                            </div>

                            {/* Terms & conditions check */}
                            <div className="flex items-start gap-2.5 pt-2">
                                <Checkbox 
                                    id="agree" 
                                    checked={data.agree} 
                                    onCheckedChange={checked => setData('agree', !!checked)} 
                                    className="border-gray-400 data-[state=checked]:bg-[#009E49] data-[state=checked]:border-[#009E49] w-4.5 h-4.5 mt-0.5 rounded cursor-pointer shrink-0"
                                />
                                <Label htmlFor="agree" className="text-sm text-gray-800 leading-relaxed cursor-pointer font-medium font-bangla select-none">
                                    আমি টার্মস & কন্ডিশনস, প্রাইভেসি পলিসি এবং রিফান্ড পলিসি পড়েছি এবং সম্মত আছি।
                                </Label>
                            </div>

                            {/* Original In-Place Order Button (Visible in summary card on both mobile & desktop) */}
                            <div ref={originalButtonRef}>
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="w-full bg-[#009E49] hover:bg-[#007F3B] active:scale-[0.98] text-white h-12 sm:h-14 text-sm sm:text-base md:text-lg font-extrabold rounded-lg shadow-[0_4px_16px_rgba(0,158,73,0.3)] border-none flex items-center justify-center gap-2 transition-all font-bangla uppercase tracking-wide cursor-pointer px-3"
                                >
                                    <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="truncate">{processing ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন 🛍️'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Floating Order Button (Smoothly hides when original button is scrolled into view) */}
                    <div 
                        className={`fixed left-0 right-0 z-40 md:hidden px-3.5 py-2 pointer-events-none transition-all duration-300 ease-in-out ${
                            isOriginalButtonVisible 
                                ? 'opacity-0 translate-y-8 pointer-events-none' 
                                : 'opacity-100 translate-y-0'
                        }`}
                        style={{ bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
                    >
                        <Button 
                            type="submit" 
                            form="checkout-form" 
                            disabled={processing || isOriginalButtonVisible} 
                            onClick={handleSubmit} 
                            className="w-full bg-[#009E49] hover:bg-[#007F3B] active:scale-[0.98] text-white h-12 sm:h-14 text-sm sm:text-base font-extrabold rounded-lg shadow-[0_4px_20px_rgba(0,158,73,0.35)] border-none flex items-center justify-center gap-2 transition-all font-bangla uppercase tracking-wide cursor-pointer pointer-events-auto px-3"
                        >
                            <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
                            <span className="truncate">{processing ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন 🛍️'}</span>
                        </Button>
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
