import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from '@/lib/gtm';

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
    updateQuantity: (index: number, quantity: number) => void;
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

    // Save cart to localStorage
    const saveCart = (items: CartItem[]) => {
        setCartItems(items);
        localStorage.setItem('chutirmart_cart', JSON.stringify(items));
    };

    const addToCart = (product: any, quantity: number, variant: any = null, openDrawer: boolean = true) => {
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

        if (existingIndex > -1) {
            newCart[existingIndex].quantity += quantity;
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
        }

        saveCart(newCart);

        // Dispatch GTM & Meta AddToCart event
        trackAddToCart(product, quantity, variant);

        if (openDrawer) {
            setIsCartOpen(true);
        }
    };

    const removeFromCart = (index: number) => {
        const newCart = cartItems.filter((_, i) => i !== index);
        saveCart(newCart);
    };

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(index);
            return;
        }
        let newCart = [...cartItems];
        newCart[index].quantity = quantity;
        saveCart(newCart);
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
    const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
