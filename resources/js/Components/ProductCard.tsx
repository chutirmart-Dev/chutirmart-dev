import React from 'react';
import { ShoppingCart } from 'lucide-react';
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
            className="group flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] hover:border-gray-300/90 transition-all duration-300 ease-out relative select-none [transform:translateZ(0)] isolate"
        >
            {/* Image box with badges - click navigates to product single */}
            <Link 
                href={route('product.show', { slug: product.slug })}
                prefetch
                className="block relative aspect-square overflow-hidden rounded-t-lg bg-[#FAFDFB] w-full shrink-0 [transform:translateZ(0)]"
            >
                {/* Discount % badge */}
                {discountPercentage > 0 ? (
                    <div className="absolute top-2 left-2 z-10 bg-[#009E49] text-white font-black text-[10.5px] xs:text-[11.5px] sm:text-xs px-2 py-0.5 rounded-md leading-none shadow-2xs font-latin">
                        Save {discountPercentage}%
                    </div>
                ) : (
                    isNew && (
                        <div className="absolute top-2 left-2 z-10 bg-[#E2231A] text-white font-black text-[10.5px] xs:text-[11.5px] sm:text-xs px-2 py-0.5 rounded-md leading-none shadow-2xs font-latin">
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
            <div className="p-2 xs:p-2.5 sm:p-3 flex flex-col flex-grow justify-between border-t border-gray-100/90">
                {/* Product Name and Price grouped with fixed height title so all 2-column cards align symmetrically */}
                <div>
                    <Link 
                        href={route('product.show', { slug: product.slug })}
                        prefetch
                        className="block focus:outline-none"
                    >
                        <h3 className="text-[13px] xs:text-[14px] sm:text-[15px] font-bold text-gray-900 line-clamp-2 leading-tight h-[2.4rem] xs:h-[2.6rem] sm:h-[2.8rem] group-hover:text-[#009E49] transition-colors break-words font-bangla">
                            {product.name}
                        </h3>
                    </Link>
                    
                    <div className="mt-1 xs:mt-1.5 flex flex-wrap items-baseline gap-1.5 font-latin">
                        <span className="text-[15px] xs:text-[16px] sm:text-lg font-black text-[#E2231A] leading-none">
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
                            className="w-full flex items-center justify-between border border-[#E2231A] bg-[#E2231A]/5 rounded-md overflow-hidden h-9 xs:h-10 sm:h-10 select-none shadow-2xs"
                        >
                            <button
                                onClick={() => updateQuantity(cartItemIndex, currentQuantity - 1)}
                                className="w-9 xs:w-10 sm:w-10 h-full bg-[#E2231A] text-white flex items-center justify-center font-black text-sm sm:text-base hover:bg-[#c61e16] active:scale-90 border-none cursor-pointer transition-transform"
                                type="button"
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <span className="flex-1 text-center text-sm sm:text-base font-black text-gray-900 font-latin">
                                {currentQuantity}
                            </span>
                            <button
                                onClick={() => updateQuantity(cartItemIndex, currentQuantity + 1)}
                                className="w-9 xs:w-10 sm:w-10 h-full bg-[#E2231A] text-white flex items-center justify-center font-black text-sm sm:text-base hover:bg-[#c61e16] active:scale-90 border-none cursor-pointer transition-transform"
                                type="button"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleAdd}
                            type="button"
                            className="w-full border border-[#E2231A] text-[#E2231A] hover:bg-[#E2231A] hover:text-white rounded-md h-9 xs:h-10 sm:h-10 font-bold text-xs xs:text-[13px] sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-300 ease-out hover:shadow-[0_4px_12px_rgba(226,35,26,0.2)] active:scale-95 bg-white cursor-pointer shadow-2xs"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.2]" />
                            <span className="leading-none truncate">Add To Cart</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
