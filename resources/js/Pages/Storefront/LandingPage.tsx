import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { trackViewContent } from '@/lib/gtm';
import { 
    ShoppingCart, Phone, MessageCircle, Truck, ShieldCheck, 
    RotateCcw, CheckCircle2, Star, Plus, Minus, ArrowDown, 
    Sparkles, Flame, Check, HelpCircle, ExternalLink, 
    ChevronRight, Heart, Share2, Award
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface LandingPageProps {
    landingPage: {
        id: number;
        title: string;
        slug: string;
        hero_headline?: string;
        hero_subtext?: string;
        hero_image_path?: string;
        cta_button_text?: string;
        sections?: any[];
        status: string;
        product?: any;
    };
    districts: Array<{
        id: number;
        name: string;
        delivery_charge: number | null;
    }>;
    defaultInsideDhaka: number;
    defaultOutsideDhaka: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
    landingPage,
    districts = [],
    defaultInsideDhaka = 80,
    defaultOutsideDhaka = 130,
}) => {
    const product = landingPage.product || {};
    const orderFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (product && product.id) {
            trackViewContent(product);
        }
    }, [product?.id]);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(product.variants?.[0] || null);
    const [selectedImage, setSelectedImage] = useState<string>(
        landingPage.hero_image_path || 
        product.images?.[0]?.image_path || 
        '/storage/defaults/default-product.svg'
    );
    const [deliveryCharge, setDeliveryCharge] = useState(defaultOutsideDhaka);

    // Pricing calculation
    const unitPrice = parseFloat(selectedVariant?.price || product.discounted_price || product.price || 0);
    const originalPrice = parseFloat(selectedVariant?.compare_at_price || product.compare_at_price || 0);
    const subtotal = unitPrice * quantity;
    const grandTotal = subtotal + deliveryCharge;
    const discountPercentage = originalPrice > unitPrice 
        ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100) 
        : 0;

    // Contact numbers
    const callNumber = "01700-000000";
    const whatsAppNumber = "880170000000";
    const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(`আমি ${landingPage.title || product.name} অর্ডার করতে চাই। মোট মূল্য: ৳${grandTotal}`)}`;

    // Direct Checkout Form
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
    });

    const scrollToOrderForm = () => {
        if (orderFormRef.current) {
            orderFormRef.current.scrollIntoView({ behavior: 'smooth' });
        } else {
            const formEl = document.getElementById('order-form');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDistrictChange = (districtName: string) => {
        setData('district', districtName);
        const selected = districts.find(d => d.name === districtName);
        if (selected) {
            if (selected.delivery_charge !== null) {
                setDeliveryCharge(selected.delivery_charge);
            } else {
                const insideDhaka = ['Dhaka', 'Narayanganj', 'Gazipur', 'ঢাকা'];
                setDeliveryCharge(insideDhaka.includes(districtName) ? defaultInsideDhaka : defaultOutsideDhaka);
            }
        }
    };

    const handleSubmitOrder = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.customer_name.trim()) {
            toast.error('অনুগ্রহ করে আপনার নাম লিখুন।');
            return;
        }
        if (!data.mobile.trim()) {
            toast.error('অনুগ্রহ করে আপনার সঠিক মোবাইল নম্বর দিন।');
            return;
        }
        if (!data.district) {
            toast.error('অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।');
            return;
        }
        if (!data.address.trim()) {
            toast.error('অনুগ্রহ করে আপনার বিস্তারিত ঠিকানা লিখুন।');
            return;
        }

        const itemsPayload = [{
            product_id: product.id,
            quantity: quantity,
            variant_info: selectedVariant ? {
                id: selectedVariant.id,
                name: selectedVariant.name,
                price: selectedVariant.price
            } : null
        }];

        data.items = itemsPayload;

        post(route('checkout.place-order'), {
            preserveScroll: true,
            onError: (errs) => {
                const first = Object.values(errs)[0];
                if (first) toast.error(String(first));
            }
        });
    };

    const getSectionGridClass = (layout = '1-col', gap = 'md') => {
        const gapClass = gap === 'none' ? 'gap-0' : gap === 'sm' ? 'gap-3' : gap === 'lg' ? 'gap-8' : 'gap-6';

        switch (layout) {
            case '2-col':
                return `grid grid-cols-1 md:grid-cols-2 ${gapClass}`;
            case '3-col':
                return `grid grid-cols-1 md:grid-cols-3 ${gapClass}`;
            case '4-col':
                return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 ${gapClass}`;
            case 'left-sidebar':
                return `grid grid-cols-1 md:grid-cols-3 ${gapClass} md:[&>*:first-child]:col-span-1 md:[&>*:last-child]:col-span-2`;
            case 'right-sidebar':
                return `grid grid-cols-1 md:grid-cols-3 ${gapClass} md:[&>*:first-child]:col-span-2 md:[&>*:last-child]:col-span-1`;
            default:
                return 'space-y-6';
        }
    };

    const hasStructuredSections = Array.isArray(landingPage.sections) && landingPage.sections.length > 0;

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#1E293B] font-sans antialiased selection:bg-[#009E49] selection:text-white pb-20 md:pb-8">
            <Toaster position="top-center" richColors />

            <Head title={`${landingPage.title} - ChutirMart`}>
                <meta name="description" content={landingPage.hero_subtext || product.short_description || landingPage.title} />
                <meta property="og:title" content={landingPage.title} />
                <meta property="og:description" content={landingPage.hero_subtext || product.short_description || landingPage.title} />
                <meta property="og:image" content={selectedImage} />
            </Head>

            {/* Top Urgency Header Bar */}
            <div className="bg-[#E2231A] text-white py-2.5 px-4 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
                <Flame className="w-4 h-4 animate-bounce shrink-0" />
                <span>🔥 সীমিত সময়ের স্পেশাল অফার! স্টক শেষ হওয়ার আগেই অর্ডার কনফার্ম করুন</span>
            </div>

            {/* Sticky Minimal Navbar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
                <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img 
                            src="/storage/defaults/default-logo.svg" 
                            alt="ChutirMart" 
                            className="h-8 md:h-10 object-contain"
                            onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span className="text-xl md:text-2xl font-black tracking-tight text-[#009E49]">
                            ছুটির<span className="text-[#E2231A]">মার্ট</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <a 
                            href={`tel:${callNumber}`} 
                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5 text-[#009E49]" />
                            <span>{callNumber}</span>
                        </a>

                        <button
                            type="button"
                            onClick={scrollToOrderForm}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009E49] hover:bg-[#007F3B] text-white text-xs md:text-sm font-black shadow-[0_4px_14px_rgba(0,158,73,0.3)] transition-transform active:scale-95 border-none cursor-pointer"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>{landingPage.cta_button_text || 'এখনই অর্ডার করুন'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-10">

                {/* ── Dynamic Sections Renderer (From Builder Sections) ── */}
                {hasStructuredSections ? (
                    <div className="space-y-8">
                        {landingPage.sections!.map((sec: any) => {
                            const gridClass = getSectionGridClass(sec.settings?.layout, sec.settings?.gap);
                            const radiusClass = sec.settings?.borderRadius || 'rounded-3xl';
                            const shadowClass = sec.settings?.shadow || 'shadow-sm';

                            return (
                                <section
                                    key={sec.id}
                                    className={`p-6 md:p-10 border border-[#E3E0D8] transition-all ${radiusClass} ${shadowClass} ${sec.settings?.paddingY || 'py-8'}`}
                                    style={{ 
                                        backgroundColor: sec.settings?.background || '#ffffff',
                                        borderColor: sec.settings?.borderColor || '#E3E0D8',
                                        borderWidth: sec.settings?.borderWidth || '1px'
                                    }}
                                >
                                    <div className={`mx-auto ${
                                        sec.settings?.containerWidth === 'narrow' ? 'max-w-xl' : sec.settings?.containerWidth === 'wide' ? 'max-w-5xl' : sec.settings?.containerWidth === 'full' ? 'w-full' : 'max-w-3xl'
                                    }`}>
                                        <div className={gridClass}>
                                            {sec.children?.map((el: any) => (
                                                <div key={el.id}>
                                            
                                            {/* Heading Widget */}
                                            {el.type === 'heading' && (
                                                <div className={`${el.style?.textAlign || 'text-center'}`}>
                                                    <h2 
                                                        className={`${el.style?.fontSize || 'text-2xl md:text-3xl'} ${el.style?.fontWeight || 'font-black'} leading-tight`}
                                                        style={{ color: el.style?.color || '#111827' }}
                                                    >
                                                        {el.content?.text}
                                                    </h2>
                                                </div>
                                            )}

                                            {/* Text Widget */}
                                            {el.type === 'text' && (
                                                <div className={`${el.style?.textAlign || 'text-left'} leading-relaxed text-sm md:text-base`} style={{ color: el.style?.color || '#4B5563' }}>
                                                    <p>{el.content?.text}</p>
                                                </div>
                                            )}

                                            {/* Image Widget */}
                                            {el.type === 'image' && (
                                                <div className={`flex justify-${el.style?.align === 'left' ? 'start' : el.style?.align === 'right' ? 'end' : 'center'}`}>
                                                    <img
                                                        src={el.content?.url || selectedImage}
                                                        alt={el.content?.alt || product.name || ''}
                                                        className={`max-w-full ${el.style?.maxWidth || 'max-w-xl'} ${el.style?.radius || 'rounded-2xl'} ${el.style?.shadow || 'shadow-md'} object-cover`}
                                                    />
                                                </div>
                                            )}

                                            {/* Video Widget */}
                                            {el.type === 'video' && el.content?.url && (
                                                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200 shadow-md">
                                                    <iframe
                                                        src={el.content.url.replace('watch?v=', 'embed/')}
                                                        className="w-full h-full"
                                                        title="Video Demo"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            )}

                                            {/* Custom Button */}
                                            {el.type === 'button' && (
                                                <div className={`flex justify-${el.style?.align === 'left' ? 'start' : el.style?.align === 'right' ? 'end' : 'center'}`}>
                                                    <a
                                                        href={el.content?.link || '#order-form'}
                                                        onClick={(e) => {
                                                            if (el.content?.link === '#order-form' || !el.content?.link) {
                                                                e.preventDefault();
                                                                scrollToOrderForm();
                                                            }
                                                        }}
                                                        className="inline-flex items-center justify-center px-8 py-4 font-black rounded-xl shadow-lg transition-transform active:scale-95 text-base"
                                                        style={{ backgroundColor: el.style?.bg || '#009E49', color: el.style?.color || '#ffffff' }}
                                                    >
                                                        {el.content?.text || 'এখনই অর্ডার করুন'}
                                                    </a>
                                                </div>
                                            )}

                                            {/* Trust Badges */}
                                            {el.type === 'trust-badges' && (
                                                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-600 my-4">
                                                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                                        <Truck className="w-6 h-6 text-[#009E49] mb-1.5" />
                                                        <span>ক্যাশ অন ডেলিভারি</span>
                                                    </div>
                                                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                                        <ShieldCheck className="w-6 h-6 text-[#009E49] mb-1.5" />
                                                        <span>১০০% আসল পণ্য</span>
                                                    </div>
                                                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                                        <RotateCcw className="w-6 h-6 text-[#009E49] mb-1.5" />
                                                        <span>৭ দিনে সহজ রিটার্ন</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Dynamic Product Title */}
                                            {el.type === 'product-title' && (
                                                <div className={`${el.style?.textAlign || 'text-center'}`}>
                                                    <h1 className={`${el.style?.fontSize || 'text-2xl md:text-4xl'} ${el.style?.fontWeight || 'font-black'} text-gray-900 leading-tight`}>
                                                        {product.name || landingPage.title}
                                                    </h1>
                                                </div>
                                            )}

                                            {/* Dynamic Product Price */}
                                            {el.type === 'product-price' && (
                                                <div className="flex items-baseline justify-center gap-3 my-4">
                                                    <span className="text-3xl md:text-4xl font-black text-[#E2231A]">
                                                        ৳{unitPrice}
                                                    </span>
                                                    {originalPrice > unitPrice && (
                                                        <span className="text-lg md:text-xl font-bold text-gray-400 line-through">
                                                            ৳{originalPrice}
                                                        </span>
                                                    )}
                                                    {discountPercentage > 0 && (
                                                        <span className="text-xs font-bold text-[#009E49] bg-emerald-100 px-2.5 py-1 rounded-md">
                                                            ৳{originalPrice - unitPrice} সাশ্রয় ({discountPercentage}% ছাড়)
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Dynamic Product Main Image & Gallery */}
                                            {(el.type === 'product-image' || el.type === 'product-gallery') && (
                                                <div className="space-y-4">
                                                    <div className="aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner relative">
                                                        {discountPercentage > 0 && (
                                                            <div className="absolute top-3 right-3 z-10 bg-[#E2231A] text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md">
                                                                {discountPercentage}% ছাড়
                                                            </div>
                                                        )}
                                                        <img src={selectedImage} alt={product.name || ''} className="w-full h-full object-cover" />
                                                    </div>
                                                    {product.images && product.images.length > 1 && (
                                                        <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                                                            {product.images.map((img: any) => (
                                                                <button
                                                                    key={img.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedImage(img.image_path)}
                                                                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                                                        selectedImage === img.image_path ? 'border-[#009E49] scale-95 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                >
                                                                    <img src={img.image_path} alt="" className="w-full h-full object-cover" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Dynamic Product Description */}
                                            {el.type === 'product-description' && (
                                                <div 
                                                    className="prose max-w-none text-gray-700 text-sm md:text-base leading-relaxed p-6 bg-[#FAFDFB] rounded-2xl border border-[#D1F2DE]"
                                                    dangerouslySetInnerHTML={{ __html: product.description || product.short_description || '' }}
                                                />
                                            )}

                                            {/* Dynamic Product CTA Button */}
                                            {el.type === 'product-cta' && (
                                                <div className="flex flex-col items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={scrollToOrderForm}
                                                        className="w-full max-w-md h-14 rounded-2xl bg-[#009E49] hover:bg-[#007F3B] text-white text-base md:text-lg font-black flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,158,73,0.35)] transition-all active:scale-98 border-none cursor-pointer"
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                        <span>{el.content?.text || landingPage.cta_button_text || 'অর্ডার করতে নিচে ক্লিক করুন'}</span>
                                                        <ArrowDown className="w-5 h-5 animate-bounce" />
                                                    </button>
                                                    <a 
                                                        href={whatsappUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full max-w-md h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba56] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                                                    >
                                                        <MessageCircle className="w-5 h-5 fill-white border-none" />
                                                        <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন</span>
                                                    </a>
                                                </div>
                                            )}

                                            {/* DIRECT COD CHECKOUT FORM WIDGET */}
                                            {el.type === 'checkout-form' && (
                                                <div id="order-form" ref={orderFormRef} className="bg-white rounded-3xl p-6 md:p-10 border-2 border-[#009E49] shadow-xl relative overflow-hidden my-6">
                                                    <div className="bg-[#009E49] text-white -mx-6 -mt-6 md:-mx-10 md:-mt-10 p-5 md:p-6 text-center mb-8">
                                                        <h2 className="text-xl md:text-2xl font-black">
                                                            {el.content?.title || 'অর্ডার করতে নিচের ফর্মটি সঠিকভাবে পূরণ করুন'}
                                                        </h2>
                                                        <p className="text-xs md:text-sm text-emerald-100 mt-1">
                                                            পণ্য হাতে পেয়ে মূল্য পরিশোধ করার সুবিধা (Cash On Delivery)
                                                        </p>
                                                    </div>

                                                    <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        {/* Left: Customer info */}
                                                        <div className="space-y-4">
                                                            <h3 className="text-base font-black text-gray-900 border-b pb-2">
                                                                আপনার ঠিকানা ও তথ্য
                                                            </h3>

                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-bangla">
                                                                    আপনার পুরো নাম <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="যেমন: মোঃ করিম হোসেন"
                                                                    value={data.customer_name}
                                                                    onChange={e => setData('customer_name', e.target.value)}
                                                                    required
                                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-gray-900 placeholder:text-gray-600 focus:border-[#009E49] focus:outline-none focus:ring-2 focus:ring-[#009E49]/15 transition-all font-bangla"
                                                                />
                                                                {errors.customer_name && <p className="text-xs text-red-500 mt-1 font-bangla">{errors.customer_name}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-bangla">
                                                                    মোবাইল নম্বর <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="tel"
                                                                    placeholder="017XXXXXXXX"
                                                                    value={data.mobile}
                                                                    onChange={e => setData('mobile', e.target.value)}
                                                                    required
                                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-gray-900 placeholder:text-gray-600 focus:border-[#009E49] focus:outline-none focus:ring-2 focus:ring-[#009E49]/15 transition-all font-bangla"
                                                                />
                                                                {errors.mobile && <p className="text-xs text-red-500 mt-1 font-bangla">{errors.mobile}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-bangla">
                                                                    জেলা নির্বাচন করুন <span className="text-red-500">*</span>
                                                                </label>
                                                                <select
                                                                    value={data.district}
                                                                    onChange={e => handleDistrictChange(e.target.value)}
                                                                    required
                                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-gray-900 focus:border-[#009E49] focus:outline-none focus:ring-2 focus:ring-[#009E49]/15 transition-all font-bangla"
                                                                >
                                                                    <option value="" className="text-gray-600">জেলা সিলেক্ট করুন</option>
                                                                    {districts.map(d => (
                                                                        <option key={d.id} value={d.name}>{d.name}</option>
                                                                    ))}
                                                                </select>
                                                                {errors.district && <p className="text-xs text-red-500 mt-1 font-bangla">{errors.district}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-bangla">
                                                                    সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                                                                </label>
                                                                <textarea
                                                                    placeholder="গ্রাম / এলাকা, রোড নং, বাসা নং ইত্যাদি"
                                                                    value={data.address}
                                                                    onChange={e => setData('address', e.target.value)}
                                                                    rows={3}
                                                                    required
                                                                    className="w-full p-3.5 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-gray-900 placeholder:text-gray-600 focus:border-[#009E49] focus:outline-none focus:ring-2 focus:ring-[#009E49]/15 transition-all font-bangla"
                                                                />
                                                                {errors.address && <p className="text-xs text-red-500 mt-1 font-bangla">{errors.address}</p>}
                                                            </div>
                                                        </div>

                                                        {/* Right: Order details */}
                                                        <div className="space-y-6 flex flex-col justify-between">
                                                            <div className="space-y-4">
                                                                <h3 className="text-base font-black text-gray-900 border-b pb-2">
                                                                    অর্ডার বিবরণী
                                                                </h3>

                                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                                                                    <img 
                                                                        src={selectedImage} 
                                                                        alt={product.name} 
                                                                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0" 
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name || landingPage.title}</h4>
                                                                        <p className="text-xs font-bold text-[#E2231A] mt-0.5">৳{unitPrice} / পিস</p>
                                                                    </div>
                                                                </div>

                                                                {product.variants && product.variants.length > 0 && (
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">ভ্যারিয়েন্ট সিলেক্ট করুন</label>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {product.variants.map((v: any) => (
                                                                                <button
                                                                                    key={v.id}
                                                                                    type="button"
                                                                                    onClick={() => setSelectedVariant(v)}
                                                                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                                                                        selectedVariant?.id === v.id ? 'bg-[#009E49] text-white border-[#009E49]' : 'bg-white border-gray-300 text-gray-700'
                                                                                    }`}
                                                                                >
                                                                                    {v.name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">পরিমাণ (Quantity)</label>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-xs">
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                                                className="p-2 px-3 text-gray-600 hover:bg-gray-100 rounded-l-xl border-none cursor-pointer"
                                                                            >
                                                                                <Minus className="w-4 h-4" />
                                                                            </button>
                                                                            <span className="px-4 text-base font-black text-gray-800">{quantity}</span>
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => setQuantity(q => q + 1)}
                                                                                className="p-2 px-3 text-gray-600 hover:bg-gray-100 rounded-r-xl border-none cursor-pointer"
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 font-semibold">পিস সিলেক্ট করুন</span>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-[#FAFDFB] p-4 rounded-2xl border border-[#D1F2DE] space-y-2 text-sm">
                                                                    <div className="flex justify-between text-gray-600">
                                                                        <span>সাব-টোটাল ({quantity} টি)</span>
                                                                        <span className="font-bold text-gray-900">৳{subtotal}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-gray-600">
                                                                        <span>ডেলিভারি চার্জ</span>
                                                                        <span className="font-bold text-gray-900">৳{deliveryCharge}</span>
                                                                    </div>
                                                                    <div className="border-t border-[#D1F2DE] pt-2 flex justify-between text-base font-black text-gray-900">
                                                                        <span>সর্বমোট পরিশোধ</span>
                                                                        <span className="text-xl text-[#E2231A]">৳{grandTotal}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <button
                                                                    type="submit"
                                                                    disabled={processing}
                                                                    className="w-full h-14 rounded-2xl bg-[#E2231A] hover:bg-[#c61e16] text-white text-base md:text-lg font-black flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(226,35,26,0.35)] transition-transform active:scale-98 border-none cursor-pointer disabled:opacity-75"
                                                                >
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                    <span>{processing ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন (৳' + grandTotal + ')'}</span>
                                                                </button>
                                                                <p className="text-center text-[11px] text-gray-500 font-semibold">
                                                                    🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে।
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    /* Fallback default layout if no sections */
                    <div className="space-y-8">
                        {/* Hero */}
                        <section className="bg-white rounded-3xl p-6 md:p-10 border border-[#E3E0D8] shadow-sm">
                            <div className="text-center max-w-3xl mx-auto mb-8">
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
                                    {landingPage.hero_headline || landingPage.title}
                                </h1>
                                {landingPage.hero_subtext && (
                                    <p className="text-sm md:text-base text-gray-600 mt-3 leading-relaxed">
                                        {landingPage.hero_subtext}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                    <img src={selectedImage} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl sm:text-2xl font-medium text-gray-900">{product.name || landingPage.title}</h3>
                                    <div className="flex items-baseline gap-3 my-4">
                                        <span className="text-3xl font-black text-[#E2231A]">৳{unitPrice}</span>
                                        {originalPrice > unitPrice && (
                                            <span className="text-lg font-bold text-gray-400 line-through">৳{originalPrice}</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={scrollToOrderForm}
                                        className="w-full h-14 rounded-2xl bg-[#009E49] text-white text-base font-black flex items-center justify-center gap-2 shadow-lg border-none cursor-pointer"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>{landingPage.cta_button_text || 'এখনই অর্ডার করুন'}</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Reviews Social Proof */}
                {product.reviews && product.reviews.length > 0 && (
                    <section className="bg-white rounded-3xl p-6 md:p-10 border border-[#E3E0D8] shadow-sm">
                        <div className="text-center max-w-xl mx-auto mb-8">
                            <h2 className="text-xl md:text-2xl font-black text-gray-900">গ্রাহকদের চমৎকার মতামত</h2>
                            <p className="text-xs text-gray-500 mt-1">আমাদের সম্মানিত কাস্টমারদের রিভিউ ও অভিজ্ঞতা</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.reviews.map((r: any) => (
                                <div key={r.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-gray-800">{r.customer_name}</h4>
                                        <div className="flex text-amber-400">
                                            {[...Array(r.rating || 5)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            {/* Mobile Fixed Bottom Quick-Order Bar */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 px-4 flex items-center justify-between gap-3 md:hidden shadow-lg">
                <div>
                    <span className="text-[10px] text-gray-500 block font-bold">অর্ডার প্রাইস:</span>
                    <span className="text-lg font-black text-[#E2231A]">৳{grandTotal}</span>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs"
                    >
                        <MessageCircle className="w-5 h-5 fill-white" />
                    </a>
                    <button
                        type="button"
                        onClick={scrollToOrderForm}
                        className="px-5 h-11 rounded-xl bg-[#009E49] text-white text-xs font-black flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>অর্ডার করুন</span>
                    </button>
                </div>
            </div>

            {/* Storefront Footer */}
            <footer className="border-t border-gray-200 mt-12 bg-white py-8 text-center text-xs text-gray-500 space-y-2">
                <p className="font-bold text-gray-700">ChutirMart - আপনার বিশ্বস্ত অনলাইন শপ</p>
                <p>হটলাইন: {callNumber} | ইমেইল: info@chutirmart.com</p>
                <p className="text-[11px] text-gray-400">© 2026 ChutirMart. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
