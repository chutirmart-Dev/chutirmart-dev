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
            className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#E3E0D8] hover:border-gray-300 hover:shadow-[0_8px_30px_rgba(0,158,73,0.05)] transition-all duration-300"
        >
            {/* Image box */}
            <div className="relative aspect-square overflow-hidden bg-[#FAFDFB] w-full shrink-0">
                {/* Save % badge at top-right */}
                {discountPercentage > 0 ? (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-[#009E49] text-white font-bold text-[9px] px-2 py-0.5 rounded-md leading-relaxed select-none">
                        Save {discountPercentage}%
                    </div>
                ) : (
                    isNew && (
                        <div className="absolute top-2.5 right-2.5 z-10 bg-[#E2231A] text-white font-bold text-[9px] px-2 py-0.5 rounded-md leading-relaxed select-none">
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
            <div className="p-3 md:p-4 flex flex-col flex-grow justify-between border-t border-[#FAFDFB]">
                <div className="h-10 md:h-12 overflow-hidden flex items-start">
                    <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight md:leading-normal group-hover:text-[#009E49] transition-colors duration-200">
                        {product.name}
                    </h3>
                </div>
                
                <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm md:text-base font-black text-[#E2231A]">৳{currentPrice}</span>
                        {originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice) && (
                            <span className="text-[10px] md:text-xs text-gray-400 line-through">৳{originalPrice}</span>
                        )}
                    </div>

                    {/* Inline Quantity Selector or Add To Cart Button */}
                    {isInCart ? (
                        <div 
                            className="w-full mt-3 flex items-center justify-between border border-[#E2231A] rounded-lg overflow-hidden h-9 md:h-11 select-none bg-white shadow-sm"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <button
                                onClick={() => updateQuantity(cartItemIndex, currentQuantity - 1)}
                                className="w-8 md:w-10 h-full bg-[#E2231A] text-white flex items-center justify-center font-bold text-sm md:text-lg hover:bg-[#c61e16] border-none cursor-pointer transition-colors"
                            >
                                -
                            </button>
                            <span className="flex-1 text-center text-[10px] md:text-xs font-black text-gray-800">
                                {currentQuantity}
                            </span>
                            <button
                                onClick={() => updateQuantity(cartItemIndex, currentQuantity + 1)}
                                className="w-8 md:w-10 h-full bg-[#E2231A] text-white flex items-center justify-center font-bold text-sm md:text-lg hover:bg-[#c61e16] border-none cursor-pointer transition-colors"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleAdd}
                            variant="outline" 
                            className="w-full mt-3 border-[#E2231A] text-[#E2231A] hover:bg-[#E2231A] hover:text-white rounded-lg h-9 md:h-11 font-bold text-[10px] md:text-xs flex items-center justify-center gap-1 md:gap-1.5 transition-all duration-300 bg-white cursor-pointer shadow-sm"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 md:w-4 h-4" />
                            Add To Cart
                        </Button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
