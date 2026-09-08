import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselSectionProps {
    title: string;
    icon?: string;
    viewAllHref?: string;
    products: any[];
    autoPlayInterval?: number;
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
    title,
    icon = '✨',
    viewAllHref,
    products,
    autoPlayInterval = 3500,
}) => {
    const [api, setApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Sync snap points and active slide index with Embla
    const onSelect = useCallback((emblaApi: CarouselApi) => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    const onReInit = useCallback((emblaApi: CarouselApi) => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!api) return;

        setScrollSnaps(api.scrollSnapList());
        setSelectedIndex(api.selectedScrollSnap());

        api.on('select', onSelect);
        api.on('reInit', onReInit);

        return () => {
            api.off('select', onSelect);
            api.off('reInit', onReInit);
        };
    }, [api, onSelect, onReInit]);

    // Auto-slide effect, pauses smoothly on user hover
    useEffect(() => {
        if (!api || isPaused || products.length <= 1) return;

        const timer = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                api.scrollTo(0);
            }
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [api, isPaused, products.length, autoPlayInterval]);

    const handlePrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!api) return;
        if (api.canScrollPrev()) {
            api.scrollPrev();
        } else {
            api.scrollTo(products.length - 1);
        }
    }, [api, products.length]);

    const handleNext = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!api) return;
        if (api.canScrollNext()) {
            api.scrollNext();
        } else {
            api.scrollTo(0);
        }
    }, [api]);

    if (!products || products.length === 0) {
        return null;
    }

    const canSlide = products.length > 1;

    return (
        <section className="container py-6">
            {/* Header matching Reference Image with full-width line & branding color active bar */}
            <div className="relative border-b border-gray-200/90 pb-3 mb-6 flex items-center justify-between">
                <div className="relative">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2 tracking-tight font-bangla">
                        {icon && <span className="text-xl sm:text-2xl">{icon}</span>}
                        <span>{title}</span>
                    </h2>
                    {/* Brand Color Underline Accent (Matching Reference Image) */}
                    <div className="absolute -bottom-3 left-0 h-[3.5px] w-14 sm:w-16 bg-[#009E49] rounded-full" />
                </div>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-xs sm:text-sm md:text-base font-extrabold text-[#009E49] hover:text-[#008038] tracking-wider uppercase flex items-center gap-1.5 transition-colors group font-latin"
                    >
                        <span>VIEW ALL PRODUCTS</span>
                        <span className="text-base sm:text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>
                )}
            </div>

            {/* Carousel Container */}
            <div
                className="relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: 'start',
                        loop: canSlide,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4 py-2 -my-2">
                        {products.map(product => (
                            <CarouselItem
                                key={product.id}
                                className="basis-[48%] xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2 sm:pl-3 md:pl-4 flex"
                            >
                                <div className="w-full h-full py-1 pb-4">
                                    <ProductCard product={product} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Side navigation arrows in Branding Color (Desktop Only - Mobile swipes natively) */}
                    {canSlide && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="hidden md:flex absolute -left-2 sm:-left-3 md:-left-4 lg:-left-5 top-[35%] -translate-y-1/2 z-30 bg-[#009E49] hover:bg-[#008038] active:scale-90 text-white border-2 border-white shadow-md hover:shadow-lg w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full cursor-pointer transition-all items-center justify-center touch-manipulation select-none"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="hidden md:flex absolute -right-2 sm:-right-3 md:-right-4 lg:-right-5 top-[35%] -translate-y-1/2 z-30 bg-[#009E49] hover:bg-[#008038] active:scale-90 text-white border-2 border-white shadow-md hover:shadow-lg w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full cursor-pointer transition-all items-center justify-center touch-manipulation select-none"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                            </button>
                        </>
                    )}
                </Carousel>

                {/* Bottom slider dots in Branding Color */}
                {scrollSnaps.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6 select-none">
                        {scrollSnaps.map((_, index) => {
                            const isActive = selectedIndex === index;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => api?.scrollTo(index)}
                                    className={`transition-all duration-300 cursor-pointer rounded-full p-0 outline-none border-none ${
                                        isActive
                                            ? 'w-5 h-1.5 bg-[#009E49] shadow-xs'
                                            : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    title={`Slide ${index + 1}`}
                                    aria-label={`Slide ${index + 1}`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductCarouselSection;
