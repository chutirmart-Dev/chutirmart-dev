import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { CartProvider } from './context/CartContext';
import { trackPageView } from './lib/gtm';

const appName = import.meta.env.VITE_APP_NAME || 'ChutirMart';

// Track virtual page views across Inertia SPA transitions
router.on('navigate', () => {
    trackPageView(window.location.pathname, document.title);
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CartProvider>
                <App {...props} />
            </CartProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
