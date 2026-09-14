import React from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from '@inertiajs/react';

interface ProductCardProps {
    product: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { cartItems, addToCart, updateQuantity } = useCart();

    const currentPrice = product.discounted_price || product.price;
    const originalPrice = product.compare_at_price;
    const image = product.images?.[0]?.image_path || '/storage/defaults/default-product.svg';
    const isNew = new Date(product.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Calculate discount percentage based on compare_at_price
    const discountPercentage = originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice)
        ? Math.round(((parseFloat(originalPrice) - parseFloat(currentPrice)) / parseFloat(originalPrice)) * 100)
        : 0;

    // Cart details
    const cartItemIndex = cartItems.findIndex(item => item.product_id === product.id);
    const isInCart = cartItemIndex > -1;
    const currentQuantity = isInCart ? cartItems[cartItemIndex].quantity : 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    return (
        <div 
            className="group flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] hover:border-gray-300/90 transition-all duration-300 ease-out relative select-none [transform:translateZ(0)] isolate"
        >
            {/* Image box with badges - click navigates to product single */}
            <Link 
                href={route('product.show', { slug: product.slug })}
                prefetch
                className="block relative aspect-square overflow-hidden rounded-t-lg bg-[#FAFDFB] w-full shrink-0 [transform:translateZ(0)]"
            >
                {/* Discount % badge */}
                {discountPercentage > 0 ? (
                    <div className="absolute top-2.5 right-2.5 xs:top-3 xs:right-3 z-10 bg-[#F7F5FF] text-[#5B47FB] border border-dashed border-[#5B47FB] font-bold text-[11px] xs:text-xs sm:text-[12.5px] px-2.5 py-1 xs:px-3 xs:py-1 rounded-md sm:rounded-lg inline-flex items-center justify-center leading-none font-latin shadow-2xs">
                        -{discountPercentage}%
                    </div>
                ) : (
                    isNew && (
                        <div className="absolute top-2.5 right-2.5 xs:top-3 xs:right-3 z-10 bg-[#FFF1F2] text-[#E2231A] border border-dashed border-[#E2231A] font-bold text-[11px] xs:text-xs sm:text-[12.5px] px-2.5 py-1 xs:px-3 xs:py-1 rounded-md sm:rounded-lg inline-flex items-center justify-center leading-none font-latin shadow-2xs">
                            NEW
                        </div>
                    )
                )}
                
                <img 
                    src={image} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
                    loading="lazy"
                    onError={e => {
                        (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                    }}
                />
            </Link>

            {/* Product Details */}
            <div className="p-2.5 xs:p-3 sm:p-3.5 flex flex-col flex-grow justify-between border-t border-gray-100/90">
                {/* Product Name and Price grouped with fixed height title so all 2-column cards align symmetrically */}
                <div>
                    <Link 
                        href={route('product.show', { slug: product.slug })}
                        prefetch
                        className="block focus:outline-none"
                    >
                        <h3 
                            className="text-[14px] xs:text-[15px] sm:text-[15px] font-medium text-gray-900 leading-snug line-clamp-2 h-[2.7em] group-hover:text-[#009E49] transition-colors font-bangla"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                            title={product.name}
                        >
                            {product.name}
                        </h3>
                    </Link>
                    
                    <div className="mt-1.5 xs:mt-2 flex flex-wrap items-baseline gap-1.5 font-latin">
                        <span className="text-[16px] xs:text-[17px] sm:text-lg font-black text-[#E2231A] leading-none">
                            ৳{Number(currentPrice).toLocaleString()}
                        </span>
                        {originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice) && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                                ৳{Number(originalPrice).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Inline Quantity Stepper or Add To Cart Button */}
                <div className="mt-2 xs:mt-2.5">
                    {isInCart ? (
                        <div 
                            className="w-full h-10 xs:h-11 sm:h-11 rounded-lg bg-gradient-to-r from-[#E2231A] via-[#EA2E24] to-[#E2231A] text-white p-1 xs:p-1.5 grid grid-cols-3 gap-1 xs:gap-1.5 shadow-[0_2px_8px_rgba(226,35,26,0.22)] border border-red-500/20 select-none transition-all duration-200"
                        >
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(cartItemIndex, currentQuantity - 1);
                                }}
                                className="w-full h-full rounded-md bg-white/20 hover:bg-white/30 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border-none"
                                type="button"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="w-4 h-4 stroke-[2.8]" />
                            </button>

                            <div className="w-full h-full bg-white rounded-md flex items-center justify-center shadow-xs">
                                <span className="text-sm xs:text-base font-black text-[#E2231A] font-latin leading-none">
                                    {currentQuantity}
                                </span>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(cartItemIndex, currentQuantity + 1);
                                }}
                                className="w-full h-full rounded-md bg-white/20 hover:bg-white/30 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border-none"
                                type="button"
                                aria-label="Increase quantity"
                            >
                                <Plus className="w-4 h-4 stroke-[2.8]" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleAdd}
                            type="button"
                            className="w-full h-10 xs:h-11 sm:h-11 rounded-lg bg-gradient-to-r from-[#E2231A] via-[#EA2E24] to-[#E2231A] hover:brightness-105 active:scale-[0.98] text-white font-extrabold text-xs xs:text-[13px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(226,35,26,0.22)] hover:shadow-[0_4px_14px_rgba(226,35,26,0.32)] border border-red-500/20 cursor-pointer group/btn select-none"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4] transition-transform duration-200 group-hover/btn:scale-110" />
                            <span className="font-latin tracking-wide leading-none">Add To Cart</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
