/**
 * Google Tag Manager (GTM) & Meta Pixel DataLayer Dispatcher
 * Provides type-safe helpers for standard eCommerce and funnel tracking.
 */

declare global {
    interface Window {
        dataLayer: any[];
    }
}

export const pushToDataLayer = (payload: Record<string, any>): void => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
};

/**
 * Track virtual page views for Inertia SPA navigation
 */
export const trackPageView = (path: string, title?: string): void => {
    pushToDataLayer({
        event: 'page_view',
        page_path: path,
        page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    });
};

/**
 * Track product view (ViewContent / view_item)
 */
export const trackViewContent = (product: any): void => {
    if (!product || !product.id) return;

    const price = parseFloat(product.discounted_price || product.price || 0);
    const productId = String(product.product_code || product.id);

    pushToDataLayer({
        event: 'view_item',
        ecommerce: {
            currency: 'BDT',
            value: price,
            items: [
                {
                    item_id: productId,
                    item_name: product.name,
                    price: price,
                    quantity: 1,
                },
            ],
        },
        // Meta standard parameters
        content_name: product.name,
        content_ids: [productId],
        content_type: 'product',
        value: price,
        currency: 'BDT',
    });
};

/**
 * Track Add to Cart (AddToCart / add_to_cart)
 */
export const trackAddToCart = (product: any, quantity: number = 1, variant?: any): void => {
    if (!product || !product.id) return;

    const unitPrice = parseFloat(product.discounted_price || product.price || 0);
    const totalPrice = unitPrice * quantity;
    const productId = String(product.product_code || product.id);

    pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
            currency: 'BDT',
            value: totalPrice,
            items: [
                {
                    item_id: productId,
                    item_name: product.name,
                    price: unitPrice,
                    quantity: quantity,
                    item_variant: variant?.value || undefined,
                },
            ],
        },
        // Meta standard parameters
        content_name: product.name,
        content_ids: [productId],
        content_type: 'product',
        value: totalPrice,
        currency: 'BDT',
    });
};

/**
 * Track Initiate Checkout (InitiateCheckout / begin_checkout)
 */
export const trackInitiateCheckout = (items: any[], subtotal: number): void => {
    if (!items || items.length === 0) return;

    const formattedItems = items.map((item) => ({
        item_id: String(item.product_id || item.id),
        item_name: item.name,
        price: parseFloat(item.price || 0),
        quantity: item.quantity || 1,
    }));

    const totalQty = items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

    pushToDataLayer({
        event: 'begin_checkout',
        ecommerce: {
            currency: 'BDT',
            value: parseFloat(String(subtotal)),
            items: formattedItems,
        },
        // Meta standard parameters
        content_ids: formattedItems.map((i) => i.item_id),
        content_type: 'product',
        value: parseFloat(String(subtotal)),
        currency: 'BDT',
        num_items: totalQty,
    });
};

/**
 * Track Product Search (Search / search)
 */
export const trackSearch = (searchQuery: string): void => {
    const trimmed = searchQuery?.trim();
    if (!trimmed) return;

    pushToDataLayer({
        event: 'search',
        search_term: trimmed,
        // Meta parameter
        search_string: trimmed,
    });
};
