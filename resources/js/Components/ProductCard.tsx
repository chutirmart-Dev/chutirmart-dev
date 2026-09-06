import React from 'react';
import { Button } from '@/components/ui/button';
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
        <Link 
            href={route('product.show', { slug: product.slug })}
            prefetch
            className="group flex flex-col h-full bg-white rounded-lg overflow-hidden border border-[#E3E0D8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0px_18px_50px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 transition-all duration-300"
        >
            {/* Image box */}
            <div className="relative aspect-square overflow-hidden bg-[#FAFDFB] w-full shrink-0">
                {/* Save % badge at top-right */}
                {discountPercentage > 0 ? (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-[#009E49] text-white font-bold text-[9px] px-2 py-0.5 rounded leading-relaxed select-none">
                        Save {discountPercentage}%
                    </div>
                ) : (
                    isNew && (
                        <div className="absolute top-2.5 right-2.5 z-10 bg-[#E2231A] text-white font-bold text-[9px] px-2 py-0.5 rounded leading-relaxed select-none">
                            NEW
                        </div>
                    )
                )}
                
                <img 
                    src={image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={e => {
                        (e.target as HTMLImageElement).src = '/storage/defaults/default-product.svg';
                    }}
                />
            </div>

            {/* Product Details */}
            <div className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-grow justify-between border-t border-gray-100">
                {/* Product Name and Price grouped together tightly */}
                <div>
                    <h3 className="text-[12.5px] sm:text-[13.5px] md:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#009E49] transition-colors duration-200">
                        {product.name}
                    </h3>
                    
                    <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-[14px] sm:text-base md:text-lg font-black text-[#E2231A]">৳{currentPrice}</span>
                        {originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice) && (
                            <span className="text-[11px] sm:text-xs text-gray-400 line-through">৳{originalPrice}</span>
                        )}
                    </div>
                </div>

                {/* Inline Quantity Selector or Add To Cart Button */}
                <div className="mt-2 sm:mt-2.5">
                    {isInCart ? (
                        <div 
                            className="w-full flex items-center justify-between border border-[#E2231A] rounded-md overflow-hidden h-10 sm:h-11 select-none bg-white shadow-xs"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <button
                                onClick={() => updateQuantity(cartItemIndex, currentQuantity - 1)}
                                className="w-9 sm:w-11 h-full bg-[#E2231A] text-white flex items-center justify-center font-bold text-base hover:bg-[#c61e16] border-none cursor-pointer transition-colors"
                            >
                                -
                            </button>
                            <span className="flex-1 text-center text-xs sm:text-sm font-black text-gray-900">
                                {currentQuantity}
                            </span>
                            <button
                                onClick={() => updateQuantity(cartItemIndex, currentQuantity + 1)}
                                className="w-9 sm:w-11 h-full bg-[#E2231A] text-white flex items-center justify-center font-bold text-base hover:bg-[#c61e16] border-none cursor-pointer transition-colors"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleAdd}
                            variant="outline" 
                            className="w-full border border-[#E2231A] text-[#E2231A] hover:bg-[#E2231A] hover:text-white rounded-md h-10 sm:h-11 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-98 bg-white cursor-pointer shadow-xs"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.2]" />
                            <span className="leading-none">Add To Cart</span>
                        </Button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
