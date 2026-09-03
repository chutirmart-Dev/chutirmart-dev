import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, MessageCircle, ShieldCheck, Truck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeProps {
    banners: any[];
    sliderBanners?: any[];
    sideBanner?: any;
    categories: any[];
    topSelling: any[];
    allProducts: any[];
    reviews: any[];
    urgencyBanner: {
        text: string;
        product: any;
    };
    whatsappNumber: string;
    phone: string;
}

export const Home: React.FC<HomeProps> = ({
    banners,
    sliderBanners,
    sideBanner,
    categories,
    topSelling,
    allProducts,
    reviews,
    urgencyBanner,
    whatsappNumber,
    phone
}) => {
    // If sliderBanners provided, use them; otherwise use banners
    const activeSliders = sliderBanners && sliderBanners.length > 0
        ? sliderBanners
        : (banners && banners.length > 0 ? banners : []);

    const activeSideBanner = sideBanner || (banners && banners.length > 1 ? banners[1] : null);

    return (
        <StorefrontLayout>
            <Head title="বাংলাদেশের সেরা অনলাইন শপ" />

            {/* Hero Banner Section */}
            <section className="container py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left: Larger Carousel Banner */}
                    <div className="md:col-span-2 relative overflow-hidden bg-gray-100 rounded-2xl border border-[#E3E0D8]">
                        <Carousel opts={{ loop: true }} className="w-full">
                            <CarouselContent>
                                {activeSliders.length > 0 ? activeSliders.map((banner, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative h-[200px] sm:h-[300px] md:h-[380px] w-full">
                                            <img 
                                                src={banner.image_path || '/storage/defaults/default-banner.svg'} 
                                                alt={banner.title || 'Banner'} 
                                                className="w-full h-full object-cover"
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                fetchPriority={index === 0 ? 'high' : 'auto'}
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-banner.svg';
                                                }}
                                            />
                                            {banner.link_url && (
                                                <Link href={banner.link_url} className="absolute inset-0" />
                                            )}
                                        </div>
                                    </CarouselItem>
                                )) : (
                                    <CarouselItem>
                                        <div className="relative h-[200px] sm:h-[300px] md:h-[380px] w-full bg-gray-300 flex items-center justify-center">
                                            <img src="/storage/defaults/default-banner.svg" className="w-full h-full object-cover absolute" alt="Default Banner" />
                                            <div className="relative z-10 text-center text-white bg-black/30 p-6 rounded-xl">
                                                <h1 className="text-2xl md:text-3xl font-extrabold font-bangla">ছুটির মার্ট ই-কমার্স</h1>
                                                <p className="text-sm md:text-base mt-2 font-bangla">সেরা মূল্যে আকর্ষণীয় লাইফস্টাইল পণ্য</p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                )}
                            </CarouselContent>
                            <CarouselPrevious className="left-4 hidden md:inline-flex" />
                            <CarouselNext className="right-4 hidden md:inline-flex" />
                        </Carousel>
                    </div>

                    {/* Right: Smaller Side Promotion Banner */}
                    <div className="hidden md:block relative h-[200px] sm:h-[300px] md:h-[380px] rounded-2xl overflow-hidden border border-[#E3E0D8] shadow-sm bg-gray-100">
                        {activeSideBanner ? (
                            <>
                                <img 
                                    src={activeSideBanner.image_path || '/storage/defaults/default-banner.svg'} 
                                    alt={activeSideBanner.title || "Promotion Banner"} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={e => {
                                        (e.target as HTMLImageElement).src = '/storage/defaults/default-banner.svg';
                                    }}
                                />
                                {activeSideBanner.link_url ? (
                                    <Link href={activeSideBanner.link_url} className="absolute inset-0" />
                                ) : (
                                    <Link href={route('shop')} className="absolute inset-0" />
                                )}
                            </>
                        ) : (
                            <img 
                                src="/storage/defaults/default-banner.svg" 
                                alt="Promotion Banner" 
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Categories Row */}
            <section className="container py-8 select-none">
                <div className="text-center mb-8 relative">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-wide uppercase">ক্যাটাগরি সমূহ</h2>
                    <div className="w-12 h-1 bg-[#E2231A] mx-auto mt-2 rounded-full" />
                </div>

                <Carousel opts={{ align: 'start', loop: false }} className="w-full relative px-6 md:px-0">
                    <CarouselContent className="-ml-3 md:ml-0 flex justify-start md:justify-between w-full">
                        {categories.map(cat => (
                            <CarouselItem key={cat.id} className="pl-3 md:pl-0 basis-1/3 sm:basis-1/4 md:basis-auto shrink-0 grow-0">
                                <Link 
                                    href={route('shop', { category: cat.slug })}
                                    className="flex flex-col items-center justify-center group"
                                >
                                    {/* White Rounded Square Card for Icon */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl border border-gray-150 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center justify-center hover:shadow-[0_8px_30px_rgba(0,158,73,0.08)] hover:border-[#009E49]/30 transition-all duration-300 transform group-hover:scale-105">
                                        <span className="text-3xl md:text-4xl transform group-hover:rotate-12 transition-transform duration-300">
                                            {cat.icon || '📦'}
                                        </span>
                                    </div>
                                    
                                    {/* Category Name Centered BELOW the Card */}
                                    <span className="text-[11px] md:text-xs font-semibold text-gray-700 text-center line-clamp-1 mt-3 group-hover:text-[#009E49] transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    {/* Orange/Red Circular Navigation Buttons */}
                    <CarouselPrevious className="-left-1.5 md:-left-4 z-20 bg-[#E2231A] hover:bg-[#c61e16] text-white border-none shadow-md w-9 h-9 rounded-full cursor-pointer hover:scale-105 transition-all flex items-center justify-center top-10 md:top-12 bottom-auto my-0 -translate-y-1/2" />
                    <CarouselNext className="-right-1.5 md:-right-4 z-20 bg-[#E2231A] hover:bg-[#c61e16] text-white border-none shadow-md w-9 h-9 rounded-full cursor-pointer hover:scale-105 transition-all flex items-center justify-center top-10 md:top-12 bottom-auto my-0 -translate-y-1/2" />
                </Carousel>
            </section>

            {/* Top Selling Products Grid */}
            <section className="container py-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>🔥</span> সর্বাধিক বিক্রিত পণ্য
                    </h2>
                    <Link href={route('shop', { sort: 'best_selling' })} className="text-xs md:text-sm font-semibold text-primary hover:underline">
                        সবগুলো দেখুন →
                    </Link>
                </div>
                {topSelling.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">কোনো পণ্য পাওয়া যায়নি।</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {topSelling.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* All Products Section */}
            <section className="container py-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>✨</span> নতুন পণ্য সমূহ
                    </h2>
                    <Link href={route('shop')} className="text-xs md:text-sm font-semibold text-primary hover:underline">
                        সবগুলো দেখুন →
                    </Link>
                </div>
                {allProducts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">কোনো পণ্য পাওয়া যায়নি।</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Customer Reviews Section */}
            <section className="container py-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>💬</span> গ্রাহকদের মতামত ও রিভিউ
                </h2>
                {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">কোনো রিভিউ নেই।</p>
                ) : (
                    <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                        <CarouselContent>
                            {reviews.map(review => (
                                <CarouselItem key={review.id} className="sm:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <div className="bg-white border border-[#E3E0D8] rounded-2xl p-5 shadow-sm space-y-3 min-h-[160px]">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800">{review.customer_name}</h4>
                                                    <span className="inline-flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium mt-1">
                                                        ✓ ভেরিফাইড ক্রেতা
                                                    </span>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed italic">
                                                "{review.review_text}"
                                            </p>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex justify-end gap-2 mt-4">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </Carousel>
                )}
            </section>

            {/* Trust Badges */}
            <section className="container py-8 border-t border-gray-200/50 mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center p-4 bg-white border border-[#E3E0D8] rounded-2xl">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">১০০% আসল প্রোডাক্ট</h4>
                        <p className="text-xs text-gray-500 mt-1">সবচেয়ে সেরা ও গুণগত মানসম্পন্ন পণ্য সরবরাহের নিশ্চয়তা</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white border border-[#E3E0D8] rounded-2xl">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">ক্যাশ অন ডেলিভারি</h4>
                        <p className="text-xs text-gray-500 mt-1">সারা বাংলাদেশে ২৪-৭২ ঘন্টায় দ্রুত ক্যাশ অন ডেলিভারি সুবিধা</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white border border-[#E3E0D8] rounded-2xl">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">২৪/৭ কাস্টমার সাপোর্ট</h4>
                        <p className="text-xs text-gray-500 mt-1">যেকোনো প্রশ্ন বা অর্ডারের জন্য সরাসরি আমাদের কল করুন</p>
                    </div>
                </div>
            </section>

            {/* Urgency CTA Banner */}
            <section className="container py-8">
                <div className="bg-gradient-to-r from-[#1E8A3C] to-[#D62828] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-black">{urgencyBanner.text}</h3>
                        <p className="text-sm text-white/80">অর্ডার কনফার্ম করতে আমাদের কল করুন অথবা সরাসরি এখনই কিনুন বাটনে ক্লিক করুন।</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {urgencyBanner.product && (
                            <Link href={route('product.show', { slug: urgencyBanner.product.slug })}>
                                <Button className="bg-white text-destructive hover:bg-white/95 font-bold px-6 h-12 rounded-xl border-none">
                                    এখনই কিনুন 🛍️
                                </Button>
                            </Link>
                        )}
                        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#25D366] hover:bg-[#20ba56] text-white font-bold px-6 h-12 rounded-xl border-none">
                                হোয়াটসঅ্যাপে অর্ডার
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
};

export default Home;
