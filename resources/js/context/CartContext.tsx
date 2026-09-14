import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { trackAddToCart } from '@/lib/gtm';
import { Check } from 'lucide-react';

export interface CartItem {
    id: number;
    product_id: number;
    name: string;
    image: string;
    quantity: number;
    price: number;
    variant_info?: {
        // New dynamic variation system
        id?: number;
        label?: string;
        options?: Record<number, number>;
        // Old format (backward compat)
        attribute?: string;
        value?: string;
        color_hex?: string;
    } | null;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartSubtotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (product: any, quantity: number, variant?: any, openDrawer?: boolean) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, quantity: number, showToast?: boolean) => void;
    clearCart: () => void;
    coupon: { code: string; discount: number } | null;
    applyCoupon: (code: string, discount: number) => void;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [cartToast, setCartToast] = useState<{ id: number; name: string; quantity: number } | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load cart from localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('chutirmart_cart');
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart data", e);
            }
        }
        const storedCoupon = localStorage.getItem('chutirmart_coupon');
        if (storedCoupon) {
            try {
                setCoupon(JSON.parse(storedCoupon));
            } catch (e) {}
        }
    }, []);

    // Cleanup toast timer on unmount
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    // Save cart to localStorage
    const saveCart = (items: CartItem[]) => {
        setCartItems(items);
        localStorage.setItem('chutirmart_cart', JSON.stringify(items));
    };

    // Clean top toast notification showing quantity
    const showCartToast = (productName: string, qty: number) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setCartToast({ id: Date.now(), name: productName, quantity: qty });
        toastTimerRef.current = setTimeout(() => {
            setCartToast(null);
        }, 3000);
    };

    const addToCart = (product: any, quantity: number, variant: any = null, openDrawer: boolean = false) => {
        const existingIndex = cartItems.findIndex(item =>
            item.product_id === product.id &&
            (
                // No variant selected — match items with no variant
                (!variant && !item.variant_info) ||
                // New system: match by variation id
                (variant?.id !== undefined && item.variant_info?.id === variant.id) ||
                // Old system: match by value string
                (variant?.value !== undefined && item.variant_info?.value === variant.value)
            )
        );

        // Calculate price: variation effective_price / price takes precedence
        let resolvedPrice = product.discounted_price || product.price;
        if (variant?.effective_price !== undefined && variant?.effective_price !== null) {
            resolvedPrice = variant.effective_price;
        } else if (variant?.price !== undefined && variant?.price !== null) {
            resolvedPrice = variant.price;
        }

        const image = variant?.image || variant?.image_path || product.images?.[0]?.image_path || '/storage/defaults/default-product.svg';

        let newCart = [...cartItems];
        let finalQuantity = quantity;

        if (existingIndex > -1) {
            newCart[existingIndex].quantity += quantity;
            finalQuantity = newCart[existingIndex].quantity;
        } else {
            newCart.push({
                id: Date.now() + Math.random(), // Unique item key
                product_id: product.id,
                name: product.name,
                image: image,
                quantity: quantity,
                price: parseFloat(resolvedPrice),
                variant_info: variant
            });
            finalQuantity = quantity;
        }

        saveCart(newCart);

        // Dispatch GTM & Meta AddToCart event
        trackAddToCart(product, quantity, variant);

        // Show clean top toast with quantity
        showCartToast(product.name, finalQuantity);

        if (openDrawer) {
            setIsCartOpen(true);
        }
    };

    const removeFromCart = (index: number) => {
        const newCart = cartItems.filter((_, i) => i !== index);
        saveCart(newCart);
    };

    const updateQuantity = (index: number, quantity: number, showToast: boolean = true) => {
        if (quantity <= 0) {
            removeFromCart(index);
            return;
        }
        let newCart = [...cartItems];
        newCart[index].quantity = quantity;
        saveCart(newCart);

        const item = newCart[index];
        if (item && showToast) {
            showCartToast(item.name, quantity);
        }
    };

    const clearCart = () => {
        saveCart([]);
        removeCoupon();
    };

    const applyCoupon = (code: string, discount: number) => {
        const couponData = { code, discount };
        setCoupon(couponData);
        localStorage.setItem('chutirmart_coupon', JSON.stringify(couponData));
    };

    const removeCoupon = () => {
        setCoupon(null);
        localStorage.removeItem('chutirmart_coupon');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartSubtotal = Number(cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2));

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            cartSubtotal,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            coupon,
            applyCoupon,
            removeCoupon
        }}>
            {children}

            {/* Custom Modern Floating Cart Toast (100% Dead Center, Crisp, Larger Font & Beautiful Padding) */}
            {cartToast && (
                <div 
                    key={cartToast.id}
                    onClick={() => setCartToast(null)}
                    className="fixed top-3 xs:top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] max-w-[440px] bg-[#ECFDF5] border border-emerald-400/90 text-emerald-950 rounded-2xl p-3 xs:p-3.5 shadow-[0_14px_40px_rgba(0,158,73,0.22),0_4px_16px_rgba(0,0,0,0.08)] flex items-center gap-3 cursor-pointer pointer-events-auto select-none animate-in fade-in slide-in-from-top-3 duration-300"
                    title="Click to dismiss"
                >
                    {/* Left: Checkmark Icon */}
                    <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#009E49] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-5 h-5 stroke-[3]" />
                    </div>

                    {/* Middle: Title & Product Name */}
                    <div className="flex-1 min-w-0 pr-1">
                        <h4 className="font-black text-[#009E49] text-[15px] xs:text-[17px] leading-tight font-latin tracking-tight">
                            Added to cart!
                        </h4>
                        <p className="text-xs xs:text-[13.5px] font-semibold text-emerald-950 mt-0.5 line-clamp-1 leading-snug font-bangla">
                            {cartToast.name}
                        </p>
                    </div>

                    {/* Right: Modern Clean Counter Box (Dedicated Side Column) */}
                    <div className="shrink-0 flex items-center justify-center bg-white border border-emerald-300 rounded-xl px-2.5 xs:px-3 py-1.5 shadow-xs">
                        <span className="text-xs xs:text-sm font-black text-[#009E49] font-bangla whitespace-nowrap">
                            {cartToast.quantity} টি
                        </span>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
