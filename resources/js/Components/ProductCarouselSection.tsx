import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/ProductCard';

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

    if (!products || products.length === 0) {
        return null;
    }

    const canSlide = products.length > 1;

    return (
        <section className="container py-6">
            {/* Header with Title & View All */}
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    <span>{title}</span>
                </h2>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-xs md:text-sm font-semibold text-[#E2231A] hover:text-[#c61e16] hover:underline flex items-center gap-1 transition-colors"
                    >
                        <span>সবগুলো দেখুন</span>
                        <span>→</span>
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
                    <CarouselContent className="-ml-3 md:-ml-4">
                        {products.map(product => (
                            <CarouselItem
                                key={product.id}
                                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-3 md:pl-4 flex"
                            >
                                <div className="w-full h-full">
                                    <ProductCard product={product} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Side navigation arrows */}
                    {canSlide && (
                        <>
                            <CarouselPrevious className="-left-2 md:-left-4 z-20 bg-[#E2231A] hover:bg-[#c61e16] text-white border-none shadow-md w-8 h-8 md:w-9 md:h-9 rounded-full cursor-pointer hover:scale-105 transition-all flex items-center justify-center top-1/2 -translate-y-1/2 disabled:opacity-0" />
                            <CarouselNext className="-right-2 md:-right-4 z-20 bg-[#E2231A] hover:bg-[#c61e16] text-white border-none shadow-md w-8 h-8 md:w-9 md:h-9 rounded-full cursor-pointer hover:scale-105 transition-all flex items-center justify-center top-1/2 -translate-y-1/2 disabled:opacity-0" />
                        </>
                    )}
                </Carousel>

                {/* Bottom slider dots (matching reference image) */}
                {scrollSnaps.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 select-none">
                        {scrollSnaps.map((_, index) => {
                            const isActive = selectedIndex === index;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => api?.scrollTo(index)}
                                    className={`transition-all duration-300 cursor-pointer rounded-full p-0 outline-none ${
                                        isActive
                                            ? 'w-2.5 h-2.5 bg-[#E2231A] border-[1.5px] border-[#E2231A] shadow-xs scale-110'
                                            : 'w-2.5 h-2.5 bg-white border-[1.5px] border-[#E2231A]/40 hover:border-[#E2231A] hover:bg-[#E2231A]/10'
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
