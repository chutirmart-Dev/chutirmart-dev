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
        <section className="container py-4 sm:py-8">
            {/* Header matching Reference Image with full-width line & branding color active bar */}
            <div className="relative border-b border-gray-200/90 pb-2 sm:pb-3 mb-3.5 sm:mb-6 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2">
                <div className="relative">
                    <h2 className="text-base xs:text-[17px] sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 tracking-tight font-bangla">
                        {icon && <span className="text-sm sm:text-lg">{icon}</span>}
                        <span>{title}</span>
                    </h2>
                    {/* Brand Color Underline Accent */}
                    <div className="absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3 left-0 h-[2.5px] sm:h-[3px] w-8 sm:w-12 bg-[#009E49] rounded-full" />
                </div>
                
                <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
                    {/* Prev/Next arrows in header — Clean and never blocks product cards */}
                    {canSlide && (
                        <div className="hidden md:flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white hover:bg-[#009E49] hover:text-white hover:border-[#009E49] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 text-gray-700"
                                aria-label="Previous products"
                            >
                                <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white hover:bg-[#009E49] hover:text-white hover:border-[#009E49] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 text-gray-700"
                                aria-label="Next products"
                            >
                                <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                            </button>
                        </div>
                    )}

                    {viewAllHref && (
                        <Link
                            href={viewAllHref}
                            className="text-[11px] xs:text-xs sm:text-[13px] font-bold text-[#009E49] hover:text-[#008038] tracking-wide uppercase flex items-center gap-1 sm:gap-1.5 transition-colors group font-latin"
                        >
                            <span>VIEW ALL PRODUCTS</span>
                            <span className="text-xs sm:text-base transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </Link>
                    )}
                </div>
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
                    <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4 py-1.5 sm:py-2 -my-1.5 sm:-my-2">
                        {products.map(product => (
                            <CarouselItem
                                key={product.id}
                                className="basis-[48%] xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2 sm:pl-3 md:pl-4 flex"
                            >
                                <div className="w-full h-full py-0.5 pb-2 sm:pb-4">
                                    <ProductCard product={product} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Bottom slider dots in Branding Color */}
                {scrollSnaps.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2.5 sm:mt-6 select-none">
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
