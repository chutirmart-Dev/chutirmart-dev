import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { trackViewContent } from '@/lib/gtm';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, ShoppingCart, MessageCircle, Phone, Heart, Share2, Star, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductSingleProps {
    product: any;
    attributeGroups: any[];
    variations: any[];
    relatedProducts: any[];
}

export const ProductSingle: React.FC<ProductSingleProps> = ({ product, attributeGroups, variations, relatedProducts }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedImage, setSelectedImage] = useState(product.images?.[0]?.image_path || '/storage/defaults/default-product.svg');
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>(() => {
        const initial: Record<number, number> = {};
        if (attributeGroups && attributeGroups.length > 0) {
            attributeGroups.forEach(g => {
                if (g.options && g.options.length > 0) {
                    initial[g.id] = g.options[0].id;
                }
            });
        }
        return initial;
    }); // {attrId: optionId}
    const [activeTab, setActiveTab] = useState<'details' | 'video' | 'reviews'>('details');

    // Find matching variation for the current selection
    const selectedOptionIds = Object.values(selectedOptions).sort();
    const hasAllAttributesSelected = attributeGroups.length > 0 && attributeGroups.every(g => selectedOptions[g.id]);
    const matchedVariation = hasAllAttributesSelected
        ? variations.find(v => {
            const vOptionIds = [...v.option_ids].sort();
            return (
                vOptionIds.length === selectedOptionIds.length &&
                vOptionIds.every((id: number, i: number) => id === selectedOptionIds[i])
            );
        }) ?? null
        : null;

    const currentPrice = matchedVariation?.effective_price ?? (product.discounted_price || product.price);
    const originalPrice = matchedVariation?.price ?? product.compare_at_price;
    const currentStock = matchedVariation ? matchedVariation.stock_quantity : product.stock_quantity;
    const isOutOfStock = matchedVariation ? matchedVariation.stock_status === 'out_of_stock' : product.stock_quantity <= 0;

    const selectedVariant = matchedVariation
        ? {
            id: matchedVariation.id,
            label: selectedOptionIds
                .map((id: number) => {
                    for (const g of attributeGroups) {
                        const opt = g.options.find((o: any) => o.id === id);
                        if (opt) return `${g.name}: ${opt.value}`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join(', '),
            options: selectedOptions,
            price: matchedVariation.price,
            effective_price: matchedVariation.effective_price,
            image: matchedVariation.image_path || matchedVariation.image,
            sku: matchedVariation.sku,
        }
        : null;

    useEffect(() => {
        const varImg = matchedVariation?.image_path || (matchedVariation as any)?.image;
        if (varImg) {
            setSelectedImage(varImg);
        }
    }, [matchedVariation?.id]);

    useEffect(() => {
        if (product && product.id) {
            trackViewContent(product);
        }
    }, [product?.id]);

    const whatsAppNumber = "8801700000000"; // default fallback or from settings
    const callNumber = "01700-000000";

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'dec' && quantity > 1) {
            setQuantity(quantity - 1);
        } else if (type === 'inc' && quantity < currentStock) {
            setQuantity(quantity + 1);
        }
    };

    const handleSelectOption = (attrId: number, optionId: number) => {
        setSelectedOptions(prev => ({ ...prev, [attrId]: optionId }));
    };

    const handleAddToCart = () => {
        if (attributeGroups.length > 0 && !hasAllAttributesSelected) {
            toast.error('দয়া করে সব ভ্যারিয়েন্ট অপশন নির্বাচন করুন');
            return;
        }
        if (isOutOfStock) {
            toast.error('দুঃখিত, এই পণ্যটি স্টক আউট');
            return;
        }
        addToCart(product, quantity, selectedVariant, true);
        toast.success('পণ্যটি কার্টে যোগ করা হয়েছে! 🛒');
    };

    const handleBuyNow = () => {
        if (attributeGroups.length > 0 && !hasAllAttributesSelected) {
            toast.error('দয়া করে সব ভ্যারিয়েন্ট অপশন নির্বাচন করুন');
            return;
        }
        if (isOutOfStock) {
            toast.error('দুঃখিত, এই পণ্যটি স্টক আউট');
            return;
        }
        setIsCartOpen(false);
        addToCart(product, quantity, selectedVariant, false);
        router.visit(route('checkout'));
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const encodedText = encodeURIComponent(`আমি এই প্রোডাক্টটি কিনতে চাই: ${product.name} - ৳${currentPrice} (${shareUrl})`);
    const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodedText}`;

    return (
        <StorefrontLayout>
            <Head title={`${product.name} - ChutirMart`}>
                <meta name="description" content={product.short_description || product.description?.substring(0, 160) || product.name} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.short_description || product.description?.substring(0, 160) || product.name} />
                <meta property="og:image" content={selectedImage} />
                <meta property="og:type" content="product" />
                <meta property="product:price:amount" content={String(currentPrice)} />
                <meta property="product:price:currency" content="BDT" />
            </Head>

            <div className="container py-4 sm:py-6 pb-28 md:pb-6">
                {/* Breadcrumb */}
                <div className="text-sm sm:text-base text-gray-500 mb-6 bg-white p-3 px-4 rounded-md border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] font-bangla">
                    <Link href={route('home')} className="hover:text-[#009E49]">হোম</Link> › <Link href={route('shop')} className="hover:text-[#009E49]">শপ</Link> › <span className="text-gray-800 font-medium">{product.name}</span>
                </div>

                {/* Product Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-[#E3E0D8] p-5 md:p-8 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    {/* Left: Product Images Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            <img 
                                src={selectedImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={e => {
                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                }}
                            />
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto pb-1">
                                {product.images.map((img: any, idx: number) => (
                                    <button 
                                        key={img.id}
                                        onClick={() => setSelectedImage(img.image_path)}
                                        className={`w-16 h-16 rounded-md overflow-hidden bg-gray-50 border-2 shrink-0 ${selectedImage === img.image_path ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <img 
                                            src={img.image_path} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover"
                                            onError={e => {
                                                (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Buy Panel */}
                    <div className="space-y-5">
                        {/* Title & Brand */}
                        <div className="space-y-2">
                            {product.brand && (
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">{product.brand.name}</span>
                            )}
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug font-bangla">{product.name}</h1>
                            <div className="flex items-center gap-2 text-sm sm:text-base">
                                <div className="flex text-yellow-400">
                                    <Star className="w-4.5 h-4.5 fill-current" />
                                    <Star className="w-4.5 h-4.5 fill-current" />
                                    <Star className="w-4.5 h-4.5 fill-current" />
                                    <Star className="w-4.5 h-4.5 fill-current" />
                                    <Star className="w-4.5 h-4.5 fill-current" />
                                </div>
                                <span className="text-gray-600 font-semibold font-bangla">({product.reviews?.length || 2} টি রিভিউ)</span>
                            </div>
                        </div>

                        {/* Prices */}
                        <div className="bg-gray-50 rounded-md p-4 sm:p-5 flex items-center justify-between font-latin">
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-destructive">৳{currentPrice}</span>
                                {originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice) && (
                                    <span className="text-base sm:text-lg md:text-xl text-gray-400 line-through">৳{originalPrice}</span>
                                )}
                            </div>
                            {product.discount_percentage > 0 && (
                                <Badge className="bg-destructive text-white border-none py-1 px-3 font-bold rounded-md text-xs sm:text-sm font-bangla">
                                    {product.discount_percentage}% ছাড়
                                </Badge>
                            )}
                        </div>

                        {/* Short Description */}
                        {product.short_description && (
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed bg-gray-50/50 p-3.5 rounded-md border border-dashed border-gray-200 font-bangla">
                                {product.short_description}
                            </p>
                        )}

                        {/* Attribute Selector — Dynamic Options */}
                        {attributeGroups && attributeGroups.length > 0 && (
                            <div className="space-y-3.5">
                                {attributeGroups.map(group => (
                                    <div key={group.id}>
                                        <div className="text-sm font-bold text-gray-800 mb-2 font-bangla">
                                            {group.name}:{' '}
                                            {selectedOptions[group.id] && (
                                                <span className="font-bold text-[#009E49]">
                                                    {group.options.find((o: any) => o.id === selectedOptions[group.id])?.value}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {group.options.map((option: any) => {
                                                const isSelected = selectedOptions[group.id] === option.id;
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => handleSelectOption(group.id, option.id)}
                                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-bold cursor-pointer transition-all font-bangla ${
                                                            isSelected
                                                                ? 'bg-[#009E49] text-white border-[#009E49] shadow-sm'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#009E49]/50'
                                                        }`}
                                                    >
                                                        {group.type === 'color' && option.color_hex && (
                                                            <span
                                                                style={{ backgroundColor: option.color_hex }}
                                                                className={`w-4 h-4 rounded-full border ${
                                                                    isSelected ? 'border-white/50' : 'border-black/10'
                                                                }`}
                                                            />
                                                        )}
                                                        {option.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Variation mismatch warning */}
                                {hasAllAttributesSelected && !matchedVariation && (
                                    <p className="text-sm text-orange-600 bg-orange-50 px-3.5 py-2.5 rounded-lg border border-orange-200 font-bangla">
                                        ⚠️ এই combination-এ পণ্যটি পাওয়া যাচ্ছে না।
                                    </p>
                                )}

                                {/* Out of stock warning for matched variation */}
                                {matchedVariation && isOutOfStock && (
                                    <p className="text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-lg border border-red-200 font-bangla">
                                        ❌ এই ভ্যারিয়েশনে স্টক নেই।
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quantity Stepper */}
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-gray-700 block font-bangla">পরিমাণ</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                    <button 
                                        onClick={() => handleQuantityChange('dec')}
                                        className="p-2.5 px-3.5 hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 text-base sm:text-lg font-black text-gray-900 font-latin">{quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange('inc')}
                                        className="p-2.5 px-3.5 hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500 font-bangla font-medium">
                                    {isOutOfStock ? (
                                        <span className="text-red-500 font-bold">স্টক শেষ</span>
                                    ) : (
                                        `স্টক আছে: ${currentStock} টি`
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="bg-primary hover:bg-primary/95 disabled:opacity-60 disabled:cursor-not-allowed text-white h-14 text-base sm:text-lg font-bold rounded-md flex items-center justify-center gap-2 border-none font-bangla"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isOutOfStock ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
                            </Button>

                            <Button
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className="bg-[#E2231A] hover:bg-[#c61e16] disabled:opacity-60 disabled:cursor-not-allowed text-white h-14 text-base sm:text-lg font-bold rounded-md flex items-center justify-center gap-2 border-none font-bangla"
                            >
                                {isOutOfStock ? 'পণ্য নেই' : 'এখনই অর্ডার করুন 🛍️'}
                            </Button>
                        </div>

                        {/* Call/WhatsApp Order Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <a 
                                href={whatsappUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full h-14 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white rounded-md text-base sm:text-lg font-bold shadow-sm transition-colors font-bangla"
                            >
                                <MessageCircle className="w-5 h-5 fill-white border-none" />
                                হোয়াটসঅ্যাপে অর্ডার
                            </a>
                            <a 
                                href={`tel:${callNumber}`} 
                                className="w-full h-14 inline-flex items-center justify-center gap-2 bg-[#009E49] hover:bg-[#007F3B] text-white rounded-md text-base sm:text-lg font-bold shadow-sm transition-colors font-bangla"
                            >
                                <Phone className="w-5 h-5" />
                                ফোনে অর্ডার: {callNumber}
                            </a>
                        </div>

                        {/* Trust Badges */}
                        <div className="border-t border-gray-100 pt-4 flex justify-between gap-2 text-center text-xs sm:text-sm text-gray-700 font-bold font-bangla">
                            <div className="flex-1 flex flex-col items-center p-2.5 bg-gray-50 rounded-md">
                                <Truck className="w-5.5 h-5.5 text-primary mb-1.5" />
                                <span>ক্যাশ অন ডেলিভারি</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center p-2.5 bg-gray-50 rounded-md">
                                <ShieldCheck className="w-5.5 h-5.5 text-primary mb-1.5" />
                                <span>১-৩ দিনে ডেলিভারি</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center p-2.5 bg-gray-50 rounded-md">
                                <Headphones className="w-5.5 h-5.5 text-primary mb-1.5" />
                                <span>২৪/৭ সাপোর্ট</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description, Video, and Review Custom Tabs Section */}
                <div className="mt-8">
                    {/* Floating Tab Buttons Bar */}
                    <div className="flex flex-wrap gap-2.5 mb-4 select-none">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-md border shadow-xs cursor-pointer transition-all font-latin ${activeTab === 'details' ? 'bg-[#009E49] text-white border-transparent' : 'bg-[#FAFDFB]/80 border-gray-200/80 text-gray-700 hover:bg-gray-100/50'}`}
                        >
                            Description
                        </button>
                        <button 
                            onClick={() => setActiveTab('video')}
                            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-md border shadow-xs cursor-pointer transition-all font-latin ${activeTab === 'video' ? 'bg-[#009E49] text-white border-transparent' : 'bg-[#FAFDFB]/80 border-gray-200/80 text-gray-700 hover:bg-gray-100/50'}`}
                        >
                            Product Video
                        </button>
                        <button 
                            onClick={() => setActiveTab('reviews')}
                            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-md border shadow-xs cursor-pointer transition-all font-latin ${activeTab === 'reviews' ? 'bg-[#009E49] text-white border-transparent' : 'bg-[#FAFDFB]/80 border-gray-200/80 text-gray-700 hover:bg-gray-100/50'}`}
                        >
                            Customer Reviews ({product.reviews?.length || 2})
                        </button>
                    </div>

                    {/* Active Content Card Panel */}
                    <div className="bg-white border border-[#E3E0D8] rounded-lg p-5 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                        {activeTab === 'details' && (
                            <div>
                                <div className="relative pb-3 mb-6 border-b border-gray-100/60">
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-wide font-latin">Product Details</h3>
                                    <div className="w-10 h-0.5 bg-[#E2231A] mt-1.5 rounded-full" />
                                </div>
                                <div 
                                    className="prose max-w-none text-sm sm:text-base text-gray-700 leading-relaxed font-normal font-bangla"
                                    dangerouslySetInnerHTML={{ __html: product.description || 'কোনো বিবরণ নেই।' }}
                                />
                            </div>
                        )}

                        {activeTab === 'video' && (
                            <div>
                                <div className="relative pb-3 mb-6 border-b border-gray-100/60">
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-wide font-latin">Product Video</h3>
                                    <div className="w-10 h-0.5 bg-[#E2231A] mt-1.5 rounded-full" />
                                </div>
                                {product.youtube_url ? (
                                    <div className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden border">
                                        <iframe 
                                            className="w-full h-full"
                                            src={product.youtube_url.replace("watch?v=", "embed/")}
                                            title="Product Video"
                                            frameBorder="0"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm sm:text-base text-gray-500 text-center py-6 font-bangla">কোনো ভিডিও উপলব্ধ নেই।</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <div className="relative pb-3 mb-6 border-b border-gray-100/60">
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-wide font-latin">Customer Reviews</h3>
                                    <div className="w-10 h-0.5 bg-[#E2231A] mt-1.5 rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    {product.reviews && product.reviews.length > 0 ? (
                                        product.reviews.map((rev: any) => (
                                            <div key={rev.id} className="border-b border-gray-150 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold text-gray-900 font-bangla">{rev.customer_name}</span>
                                                    <span className="text-xs text-gray-400 font-latin">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex text-yellow-400 mb-2">
                                                    {[...Array(rev.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-current" />
                                                    ))}
                                                </div>
                                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-bangla">{rev.review_text}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-sm sm:text-base text-gray-500 font-semibold font-bangla">
                                            এই প্রোডাক্টের জন্য এখনো কোনো রিভিউ দেওয়া হয়নি।
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2 font-bangla">
                            <span>🔗</span> মিলসম্পন্ন অন্যান্য পণ্য
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                            {relatedProducts.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Sticky Add To Cart Bar (Native App Style) */}
            <div 
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/90 p-2.5 px-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex items-center gap-2.5 select-none" 
                style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 10px))' }}
            >
                {/* Quick WhatsApp Contact Icon */}
                <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-12 h-12 rounded-md bg-[#25D366] hover:bg-[#20ba56] text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform shadow-xs cursor-pointer"
                    title="Order via WhatsApp"
                    aria-label="Order via WhatsApp"
                >
                    <MessageCircle className="w-5.5 h-5.5 fill-white stroke-none" />
                </a>

                {/* Add to Cart Button */}
                <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    type="button"
                    className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 rounded-md text-sm font-bold border border-gray-200/70 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bangla"
                >
                    <ShoppingCart className="w-4.5 h-4.5 text-[#009E49] shrink-0 stroke-[2.2]" />
                    <span>কার্টে যোগ</span>
                </button>

                {/* Buy Now Primary CTA Button */}
                <button 
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    type="button"
                    className="flex-[1.4] h-12 bg-[#E2231A] hover:bg-[#c61e16] disabled:opacity-50 text-white rounded-md text-sm font-extrabold border-none shadow-[0_4px_14px_rgba(226,35,26,0.25)] active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer font-bangla"
                >
                    <span>{isOutOfStock ? 'স্টক শেষ' : 'এখনই অর্ডার 🛍️'}</span>
                </button>
            </div>
        </StorefrontLayout>
    );
};

export default ProductSingle;
