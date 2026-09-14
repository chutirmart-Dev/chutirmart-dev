import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { ProductCarouselSection } from '@/components/ProductCarouselSection';
import { Star, MessageCircle, ShieldCheck, Truck, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeProps {
    banners: any[];
    sliderBanners?: any[];
    sideBanner?: any;
    categories: any[];
    topSelling: any[];
    allProducts: any[];
    justForYou?: any[];
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
    justForYou,
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

    // Carousel API state & Smooth Autoplay
    const [sliderApi, setSliderApi] = useState<CarouselApi>();
    const [categoryApi, setCategoryApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideCount, setSlideCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!sliderApi) return;

        setSlideCount(sliderApi.scrollSnapList().length);
        setCurrentSlide(sliderApi.selectedScrollSnap());

        const onSelect = () => {
            setCurrentSlide(sliderApi.selectedScrollSnap());
        };

        sliderApi.on('select', onSelect);
        sliderApi.on('reInit', () => {
            setSlideCount(sliderApi.scrollSnapList().length);
            setCurrentSlide(sliderApi.selectedScrollSnap());
        });

        return () => {
            sliderApi.off('select', onSelect);
        };
    }, [sliderApi]);

    // Smooth automatic sliding every 4.5s with pause on user hover
    useEffect(() => {
        if (!sliderApi || isHovered || activeSliders.length <= 1) return;

        const timer = setInterval(() => {
            sliderApi.scrollNext();
        }, 4500);

        return () => clearInterval(timer);
    }, [sliderApi, isHovered, activeSliders.length]);

    return (
        <StorefrontLayout>
            <Head title="বাংলাদেশের সেরা অনলাইন শপ" />

            {/* Hero Banner Section with Optimized Responsive Height */}
            <section className="container pt-2.5 pb-3 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 items-stretch">
                    {/* Left: Main Carousel Banner - Full width on Mobile & Tablet (< lg), 8 cols on Desktop (lg+) */}
                    <div 
                        className="col-span-1 lg:col-span-8 relative overflow-hidden bg-gray-100 rounded-lg border border-[#E3E0D8] shadow-[0_2px_10px_rgba(0,0,0,0.04)] group"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Carousel 
                            setApi={setSliderApi}
                            opts={{ 
                                loop: true, 
                                duration: 40 
                            }} 
                            className="w-full h-full"
                        >
                            <CarouselContent wrapperClassName="w-full h-full overflow-hidden" className="-ml-0">
                                {activeSliders.length > 0 ? activeSliders.map((banner, index) => (
                                    <CarouselItem key={index} className="pl-0 basis-full min-w-0 shrink-0 grow-0">
                                        <div className="relative h-[150px] xs:h-[180px] sm:h-[240px] md:h-[290px] lg:h-[340px] xl:h-[360px] w-full overflow-hidden">
                                            <img 
                                                src={banner.image_path || '/storage/defaults/default-banner.svg'} 
                                                alt={banner.title || 'Banner'} 
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                fetchPriority={index === 0 ? 'high' : 'auto'}
                                                onError={e => {
                                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-banner.svg';
                                                }}
                                            />
                                            {banner.link_url && (
                                                <Link href={banner.link_url} className="absolute inset-0 z-10" />
                                            )}
                                        </div>
                                    </CarouselItem>
                                )) : (
                                    <CarouselItem className="pl-0 basis-full min-w-0 shrink-0 grow-0">
                                        <div className="relative h-[150px] xs:h-[180px] sm:h-[240px] md:h-[290px] lg:h-[340px] xl:h-[360px] w-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                            <img src="/storage/defaults/default-banner.svg" className="w-full h-full object-cover absolute" alt="Default Banner" />
                                            <div className="relative z-10 text-center text-white bg-black/30 p-6 rounded-md">
                                                <h1 className="text-2xl md:text-3xl font-extrabold font-bangla">ছুটির মার্ট ই-কমার্স</h1>
                                                <p className="text-sm md:text-base mt-2 font-bangla">সেরা মূল্যে আকর্ষণীয় লাইফস্টাইল পণ্য</p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                )}
                            </CarouselContent>
                            
                            {/* Smooth Navigation Controls */}
                            {activeSliders.length > 1 && (
                                <>
                                    <CarouselPrevious className="flex left-2 xs:left-3 sm:left-4 z-20 w-7.5 h-7.5 xs:w-8.5 xs:h-8.5 sm:w-9 sm:h-9 bg-white/90 hover:bg-white text-gray-800 border border-black/10 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 inset-y-auto bottom-auto my-0 top-1/2 -translate-y-1/2 [&_svg]:size-3.5 xs:[&_svg]:size-4 [&_svg]:stroke-[2.5]" />
                                    <CarouselNext className="flex right-2 xs:right-3 sm:right-4 z-20 w-7.5 h-7.5 xs:w-8.5 xs:h-8.5 sm:w-9 sm:h-9 bg-white/90 hover:bg-white text-gray-800 border border-black/10 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 inset-y-auto bottom-auto my-0 top-1/2 -translate-y-1/2 [&_svg]:size-3.5 xs:[&_svg]:size-4 [&_svg]:stroke-[2.5]" />

                                    {/* Smooth Slider Pagination Dots */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md">
                                        {Array.from({ length: slideCount }).map((_, dotIdx) => (
                                            <button
                                                key={dotIdx}
                                                type="button"
                                                onClick={() => sliderApi?.scrollTo(dotIdx)}
                                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none p-0 ${
                                                    currentSlide === dotIdx
                                                        ? 'w-5 sm:w-6 bg-white shadow-xs'
                                                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                                                }`}
                                                aria-label={`Go to slide ${dotIdx + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </Carousel>
                    </div>

                    {/* Right: Companion Side Promotion Banner on Desktop (lg+) */}
                    <div className="hidden lg:block lg:col-span-4 relative h-[340px] xl:h-[360px] rounded-lg overflow-hidden border border-[#E3E0D8] shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-gray-100 group">
                        {activeSideBanner ? (
                            <>
                                <img 
                                    src={activeSideBanner.image_path || '/storage/defaults/default-banner.svg'} 
                                    alt={activeSideBanner.title || "Promotion Banner"} 
                                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                    loading="lazy"
                                    onError={e => {
                                        (e.target as HTMLImageElement).src = '/storage/defaults/default-banner.svg';
                                    }}
                                />
                                {activeSideBanner.link_url ? (
                                    <Link href={activeSideBanner.link_url} className="absolute inset-0 z-10" />
                                ) : (
                                    <Link href={route('shop')} className="absolute inset-0 z-10" />
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
            <section className="container py-3 sm:py-6 select-none">
                {/* Header with Title and View All */}
                <div className="relative border-b border-gray-200/90 pb-2 sm:pb-3 mb-3.5 sm:mb-6 flex items-center justify-between gap-y-1.5 gap-x-2">
                    <div className="relative">
                        <h2 className="text-base xs:text-[17px] sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 tracking-tight font-bangla">
                            <span className="text-sm sm:text-lg">🛍️</span>
                            <span>ক্যাটাগরি সমূহ</span>
                        </h2>
                        {/* Brand Color Underline Accent */}
                        <div className="absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3 left-0 h-[2.5px] sm:h-[3px] w-8 sm:w-12 bg-[#009E49] rounded-full" />
                    </div>

                    <Link 
                        href={route('shop')}
                        className="text-[11px] xs:text-xs sm:text-[13px] font-bold text-[#009E49] hover:text-[#008038] tracking-wide flex items-center gap-1 sm:gap-1.5 transition-colors group font-bangla ml-auto"
                    >
                        <span>সবগুলো দেখুন</span>
                        <span className="text-xs sm:text-base transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                <div className="relative px-6 xs:px-7 sm:px-10 md:px-12">
                    <Carousel 
                        setApi={setCategoryApi}
                        opts={{ align: 'start', loop: categories.length > 3 }} 
                        className="w-full"
                    >
                        <CarouselContent 
                            wrapperClassName="overflow-hidden py-1.5 -my-1.5 px-1 -mx-1"
                            className="-ml-1.5 sm:-ml-3 md:-ml-4 flex items-center"
                        >
                            {categories.map(cat => (
                                <CarouselItem key={cat.id} className="pl-1.5 sm:pl-3 md:pl-4 basis-1/3 sm:basis-1/5 md:basis-1/6 shrink-0">
                                    <Link 
                                        href={route('shop', { category: cat.slug })}
                                        className="flex flex-col items-center justify-center group select-none w-full"
                                    >
                                        {/* Rounded Square Card for Icon */}
                                        <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white rounded-2xl border border-gray-150 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center hover:shadow-[0_8px_24px_rgba(0,158,73,0.12)] hover:border-[#009E49]/40 transition-all duration-300 transform group-hover:scale-105 active:scale-95">
                                            <span className="text-xl xs:text-3xl md:text-3xl transform group-hover:rotate-12 transition-transform duration-300">
                                                {cat.icon || '📦'}
                                            </span>
                                        </div>
                                        
                                        {/* Category Name Centered BELOW the Card - Single line & smaller font */}
                                        <span 
                                            className="text-[10px] xs:text-[11.5px] sm:text-xs md:text-sm font-bold text-gray-800 text-center truncate whitespace-nowrap w-full mt-1.5 group-hover:text-[#009E49] transition-colors font-bangla leading-tight px-0.5"
                                            title={cat.name}
                                        >
                                            {cat.name}
                                        </span>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {/* Navigation Buttons: Perfectly centered with icon cards in side gutters, never clipping or overlapping */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-14 xs:h-16 sm:h-18 md:h-20 flex items-center justify-between z-20">
                        <button
                            type="button"
                            onClick={() => categoryApi?.scrollPrev()}
                            className="pointer-events-auto ml-0.5 xs:ml-1 sm:ml-1.5 md:ml-2 z-20 bg-[#009E49] hover:bg-[#008038] text-white border-2 border-white shadow-[0_3px_10px_rgba(0,158,73,0.35)] w-7 h-7 xs:w-8 xs:h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.6]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => categoryApi?.scrollNext()}
                            className="pointer-events-auto mr-0.5 xs:mr-1 sm:mr-1.5 md:mr-2 z-20 bg-[#009E49] hover:bg-[#008038] text-white border-2 border-white shadow-[0_3px_10px_rgba(0,158,73,0.35)] w-7 h-7 xs:w-8 xs:h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            aria-label="Next categories"
                        >
                            <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.6]" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Top Selling Products Carousel */}
            {topSelling && topSelling.length > 0 && (
                <ProductCarouselSection
                    title="সর্বাধিক বিক্রিত পণ্য"
                    icon="🔥"
                    viewAllHref={route('shop', { sort: 'best_selling' })}
                    products={topSelling}
                    autoPlayInterval={3800}
                />
            )}

            {/* New Arrival Products Carousel */}
            {allProducts && allProducts.length > 0 && (
                <ProductCarouselSection
                    title="নতুন পণ্য সমূহ"
                    icon="✨"
                    viewAllHref={route('shop')}
                    products={allProducts}
                    autoPlayInterval={3400}
                />
            )}

            {/* Multi-Row Product Grid: Just For You / আপনার জন্য পণ্য */}
            {justForYou && justForYou.length > 0 && (
                <section className="container py-3 sm:py-8">
                    {/* Header matching Reference Image 2 */}
                    <div className="relative border-b border-gray-200/90 pb-2 sm:pb-3 mb-3.5 sm:mb-6 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2">
                        <div className="relative min-w-0">
                            <h2 className="text-base xs:text-[17px] sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 tracking-tight truncate font-bangla">
                                <span className="text-sm sm:text-lg">⚡</span>
                                <span>আপনার জন্য পণ্য</span>
                            </h2>
                            {/* Brand Color Underline Accent */}
                            <div className="absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3 left-0 h-[2.5px] sm:h-[3px] w-8 sm:w-12 bg-[#009E49] rounded-full" />
                        </div>
                        <Link
                            href={route('shop')}
                            className="text-[11px] xs:text-xs sm:text-[13px] font-bold text-[#009E49] hover:text-[#008038] tracking-wide uppercase flex items-center gap-1 sm:gap-1.5 transition-colors group shrink-0 whitespace-nowrap font-latin ml-auto"
                        >
                            <span>VIEW ALL PRODUCTS</span>
                            <span className="text-xs sm:text-base transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </Link>
                    </div>

                    {/* Multi-row Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 xs:gap-2.5 sm:gap-4 lg:gap-5">
                        {justForYou.map(product => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* View All CTA Button */}
                    <div className="text-center mt-4 sm:mt-10">
                        <Link
                            href={route('shop')}
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-8 sm:py-3.5 bg-white text-[#009E49] font-black text-sm sm:text-lg rounded-md border-2 border-[#009E49] hover:bg-[#009E49] hover:text-white shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer font-bangla"
                        >
                            <span>সবগুলো পণ্য দেখুন (View All Products)</span>
                            <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </section>
            )}

            {/* Customer Reviews Section (Reference Design, 4 Columns on Desktop, Moderate Rounded Corners) */}
            <section className="container py-4 sm:py-8">
                {/* Header matching Reference Image */}
                <div className="relative border-b border-gray-200/90 pb-2.5 sm:pb-3 mb-4 sm:mb-6 flex items-center justify-between">
                    <div className="relative">
                        <h2 className="text-base xs:text-[17px] sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 tracking-tight font-bangla">
                            <span className="text-base sm:text-lg">💬</span>
                            <span>গ্রাহকদের মতামত ও রিভিউ</span>
                        </h2>
                        <div className="absolute -bottom-2.5 sm:-bottom-3 left-0 h-[3px] w-10 sm:w-12 bg-[#009E49] rounded-full" />
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="bg-white border border-[#E3E0D8] rounded-xl p-8 text-center shadow-xs">
                        <Star className="w-10 h-10 text-amber-400/40 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-700 font-bangla">শীঘ্রই গ্রাহকদের রিভিউ যুক্ত করা হবে।</p>
                    </div>
                ) : (
                    <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                        <CarouselContent className="-ml-2 sm:-ml-4">
                            {reviews.map(review => {
                                const initials = review.customer_name 
                                    ? review.customer_name.slice(0, 2).toUpperCase() 
                                    : 'CM';
                                
                                const avatarSrc = review.avatar_url || (
                                    review.customer_avatar 
                                        ? (review.customer_avatar.startsWith('http') || review.customer_avatar.startsWith('/storage') 
                                            ? review.customer_avatar 
                                            : `/storage/${review.customer_avatar}`)
                                        : null
                                );

                                return (
                                    <CarouselItem key={review.id} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex">
                                        <div className="py-1 w-full flex">
                                            <div className="bg-white border border-[#E3E0D8] rounded-xl p-4.5 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.07)] hover:border-[#009E49]/40 transition-all duration-300 w-full flex flex-col justify-between group">
                                                {/* Top row: Rating Stars on Left, Decorative Quote on Right */}
                                                <div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-0.5 text-amber-400">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star 
                                                                    key={i} 
                                                                    className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                                                                />
                                                            ))}
                                                        </div>
                                                        {/* Decorative Quotation Mark */}
                                                        <svg className="w-6 h-6 text-[#009E49]/20 group-hover:text-[#009E49]/35 transition-colors shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                                        </svg>
                                                    </div>

                                                    {/* Middle row: Review Text */}
                                                    <p className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed font-bangla line-clamp-3 min-h-[3.8rem] mt-3 italic">
                                                        "{review.review_text}"
                                                    </p>
                                                </div>

                                                {/* Bottom section: Divider & Reviewer Info */}
                                                <div>
                                                    <div className="w-full border-t border-gray-100 my-3.5" />
                                                    <div className="flex items-center gap-3">
                                                        {/* Circular Avatar */}
                                                        {avatarSrc ? (
                                                            <img 
                                                                src={avatarSrc} 
                                                                alt={review.customer_name} 
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0" 
                                                                onError={(e) => {
                                                                    (e.target as HTMLElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#009E49] to-[#007F3B] text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 select-none">
                                                                {initials}
                                                            </div>
                                                        )}

                                                        {/* Name and Designation / Location */}
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-[13.5px] sm:text-sm font-bold text-gray-900 leading-snug truncate font-bangla">
                                                                {review.customer_name}
                                                            </h4>
                                                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 font-bangla">
                                                                {review.verified !== false && (
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#009E49] shrink-0" />
                                                                )}
                                                                <span className="truncate">{review.customer_designation || 'ভেরিফাইড ক্রেতা'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>
                        
                        {/* Carousel Prev / Next Controls */}
                        <div className="flex justify-end gap-2 mt-3 sm:mt-4">
                            <CarouselPrevious className="static translate-y-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white hover:bg-[#009E49] hover:text-white hover:border-[#009E49] shadow-2xs transition-colors cursor-pointer" />
                            <CarouselNext className="static translate-y-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white hover:bg-[#009E49] hover:text-white hover:border-[#009E49] shadow-2xs transition-colors cursor-pointer" />
                        </div>
                    </Carousel>
                )}
            </section>

            {/* Trust Badges */}
            <section className="container py-3.5 sm:py-8 border-t border-gray-200/50 mt-4 sm:mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-8 text-center">
                    <div className="flex flex-col items-center p-3.5 sm:p-5 md:p-6 bg-white border border-[#E3E0D8] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[#009E49]/30 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-13 sm:h-13 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3.5">
                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">১০০% আসল প্রোডাক্ট</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">সবচেয়ে সেরা ও গুণগত মানসম্পন্ন পণ্য সরবরাহের নিশ্চয়তা</p>
                    </div>
                    <div className="flex flex-col items-center p-3.5 sm:p-5 md:p-6 bg-white border border-[#E3E0D8] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[#009E49]/30 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-13 sm:h-13 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3.5">
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">ক্যাশ অন ডেলিভারি</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">সারা বাংলাদেশে ২৪-৭২ ঘন্টায় দ্রুত ক্যাশ অন ডেলিভারি সুবিধা</p>
                    </div>
                    <div className="flex flex-col items-center p-3.5 sm:p-5 md:p-6 bg-white border border-[#E3E0D8] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[#009E49]/30 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-13 sm:h-13 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3.5">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">২৪/৭ কাস্টমার সাপোর্ট</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">যেকোনো প্রশ্ন বা অর্ডারের জন্য সরাসরি আমাদের কল করুন</p>
                    </div>
                </div>
            </section>

            {/* Urgency CTA Banner */}
            <section className="container py-3 sm:py-8">
                <div className="bg-gradient-to-r from-[#1E8A3C] to-[#D62828] text-white rounded-lg p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black">{urgencyBanner.text}</h3>
                        <p className="text-xs sm:text-sm text-white/80">অর্ডার কনফার্ম করতে আমাদের কল করুন অথবা সরাসরি এখনই কিনুন বাটনে ক্লিক করুন।</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                        {urgencyBanner.product && (
                            <Link href={route('product.show', { slug: urgencyBanner.product.slug })}>
                                <Button className="bg-white text-destructive hover:bg-white/95 font-bold px-4 sm:px-6 h-10 sm:h-12 rounded-md border-none text-xs sm:text-sm">
                                    এখনই কিনুন 🛍️
                                </Button>
                            </Link>
                        )}
                        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#25D366] hover:bg-[#20ba56] text-white font-bold px-4 sm:px-6 h-10 sm:h-12 rounded-md border-none text-xs sm:text-sm">
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
