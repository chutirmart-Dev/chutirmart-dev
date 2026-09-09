/**
 * Google Tag Manager (GTM) & Meta Pixel DataLayer Dispatcher
 * Provides type-safe helpers for standard eCommerce and funnel tracking with direct Meta fbq integration.
 */

declare global {
    interface Window {
        dataLayer: any[];
        fbq?: (...args: any[]) => void;
        fbTestEventCode?: string;
    }
}

export const pushToDataLayer = (payload: Record<string, any>): void => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
};

export const pushToFbq = (
    action: string,
    eventName: string,
    params?: Record<string, any>,
    options?: Record<string, any>
): void => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    try {
        const mergedOptions = {
            ...(window.fbTestEventCode ? { test_event_code: window.fbTestEventCode } : {}),
            ...(options || {}),
        };

        if (Object.keys(mergedOptions).length > 0) {
            window.fbq(action, eventName, params || {}, mergedOptions);
        } else if (params) {
            window.fbq(action, eventName, params);
        } else {
            window.fbq(action, eventName);
        }
    } catch (err) {
        console.warn('Meta Pixel dispatch error:', err);
    }
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

    pushToFbq('track', 'PageView');
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

    pushToFbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [productId],
        content_type: 'product',
        value: price,
        currency: 'BDT',
        contents: [
            {
                id: productId,
                quantity: 1,
                item_price: price,
            },
        ],
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

    pushToFbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [productId],
        content_type: 'product',
        value: totalPrice,
        currency: 'BDT',
        contents: [
            {
                id: productId,
                quantity: quantity,
                item_price: unitPrice,
            },
        ],
    });
};

/**
 * Track Initiate Checkout (InitiateCheckout / begin_checkout)
 */
export const trackInitiateCheckout = (items: any[], subtotal: number): void => {
    if (!items || items.length === 0) return;

    const formattedItems = items.map((item) => ({
        item_id: String(item.product_code || item.product?.product_code || item.product_id || item.id),
        item_name: item.product_name || item.name,
        price: parseFloat(item.unit_price || item.price || 0),
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

    pushToFbq('track', 'InitiateCheckout', {
        content_ids: formattedItems.map((i) => i.item_id),
        contents: formattedItems.map((i) => ({
            id: i.item_id,
            quantity: i.quantity,
            item_price: i.price,
        })),
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

    pushToFbq('track', 'Search', {
        search_string: trimmed,
    });
};

/**
 * Track Purchase (Purchase / purchase) with Deduplication eventID
 */
export const trackPurchase = (order: any, eventId?: string): void => {
    if (!order || !order.order_number) return;

    const total = parseFloat(order.total || 0);
    const items = (order.items || []).map((item: any) => ({
        item_id: String(item.product?.product_code || item.product_code || item.product_id || item.id),
        item_name: item.product_name || item.product?.name || item.name,
        price: parseFloat(item.unit_price || item.price || 0),
        quantity: item.quantity || 1,
    }));

    const totalQty = items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0);

    pushToDataLayer({
        event: 'purchase',
        ecommerce: {
            transaction_id: order.order_number,
            value: total,
            currency: 'BDT',
            tax: 0,
            shipping: parseFloat(order.delivery_charge || 0),
            coupon: order.coupon_code || undefined,
            items: items,
        },
        order_id: order.order_number,
        value: total,
        currency: 'BDT',
        content_type: 'product',
        content_ids: items.map((i: any) => i.item_id),
        num_items: totalQty,
    });

    const fbPayload = {
        content_type: 'product',
        content_ids: items.map((i: any) => i.item_id),
        contents: items.map((i: any) => ({
            id: i.item_id,
            quantity: i.quantity,
            item_price: i.price,
        })),
        value: total,
        currency: 'BDT',
        num_items: totalQty,
        order_id: order.order_number,
    };

    if (eventId) {
        pushToFbq('track', 'Purchase', fbPayload, { eventID: eventId });
    } else {
        pushToFbq('track', 'Purchase', fbPayload);
    }
};
