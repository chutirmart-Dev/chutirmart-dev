import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    X, 
    PhoneCall, 
    ShoppingBag, 
    Heart, 
    User, 
    Box, 
    ChevronRight, 
    Home, 
    Sparkles, 
    Flame, 
    Info, 
    LogOut,
    Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTrackOrder: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    onOpenTrackOrder
}) => {
    const { store_settings, auth } = usePage().props as any;
    const { cartCount, setIsCartOpen } = useCart();

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const navLinks = [
        { name: 'All Products', href: route('shop'), icon: Tag },
        { name: 'Home & Kitchen', href: route('shop', { category: 'home-kitchen' }), icon: Sparkles },
        { name: 'Smart Gadget', href: route('shop', { category: 'smart-gadgets' }), icon: Sparkles },
        { name: 'Offer Products', href: route('shop', { category: 'offer-products' }), icon: Flame },
        { name: 'Summer Products', href: route('shop', { category: 'summer-products' }), icon: Flame },
        { name: 'Feature Products', href: route('shop', { category: 'feature-products' }), icon: Sparkles },
        { name: 'Flash Products', href: route('shop', { category: 'flash-products' }), icon: Flame },
        { name: 'About Us', href: route('about'), icon: Info },
    ];

    return (
        <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sidebar Drawer Container */}
            <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <Link href={route('home')} onClick={onClose} className="flex items-center">
                        {store_settings?.site_logo ? (
                            <img 
                                src={store_settings.site_logo} 
                                alt={store_settings.site_name || "ChutirMart"} 
                                className="h-9 w-auto object-contain" 
                                onError={e => {
                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="text-xl font-black tracking-tight flex items-center">
                                    <span className="text-primary font-bangla">ছুটির</span>
                                    <span className="text-destructive font-bangla">মার্ট</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 tracking-wider font-latin">chutirmart</span>
                            </div>
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {/* Order Inquiry Card */}
                    <a
                        href="tel:+8801705105889"
                        className="flex items-center gap-3 p-3 bg-emerald-50/80 border border-[#009E49]/20 rounded-xl hover:bg-emerald-100/70 transition-colors select-none no-underline"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#009E49] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <PhoneCall className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block text-[11px] font-semibold text-[#009E49] leading-none mb-1">
                                Order Inquiry / অর্ডার হেল্পলাইন
                            </span>
                            <span className="block text-[15px] font-black text-gray-900 tracking-tight leading-none font-latin">
                                +880 1705-105889
                            </span>
                        </div>
                    </a>

                    {/* Quick Access Badges (Wishlist, Cart, Track Order) */}
                    <div className="grid grid-cols-3 gap-2">
                        <Link
                            href={route('shop')}
                            onClick={onClose}
                            className="flex flex-col items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors relative"
                        >
                            <div className="relative mb-1">
                                <Heart className="w-5 h-5 stroke-[1.8]" />
                                <span className="absolute -top-1.5 -right-2 bg-[#009E49] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    0
                                </span>
                            </div>
                            <span className="text-[11px] font-medium">Wishlist</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                setIsCartOpen(true);
                            }}
                            className="flex flex-col items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors relative cursor-pointer"
                        >
                            <div className="relative mb-1">
                                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                                <span className="absolute -top-1.5 -right-2 bg-[#009E49] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </div>
                            <span className="text-[11px] font-medium">Cart</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenTrackOrder();
                            }}
                            className="flex flex-col items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors cursor-pointer"
                        >
                            <Box className="w-5 h-5 stroke-[1.8] mb-1 text-gray-700" />
                            <span className="text-[11px] font-medium">Track</span>
                        </button>
                    </div>

                    {/* Navigation Categories */}
                    <div className="pt-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">
                            Navigation / ক্যাটাগরি সমূহ
                        </div>
                        <div className="space-y-1">
                            {navLinks.map((link, idx) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        onClick={onClose}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-gray-700 hover:text-[#009E49] hover:bg-emerald-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#009E49]" />
                                            <span>{link.name}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer / Account Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/80">
                    {auth?.user ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5 px-1 py-1">
                                <div className="w-8 h-8 rounded-full bg-[#009E49] text-white flex items-center justify-center font-bold text-xs">
                                    {auth.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{auth.user.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{auth.user.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    href={route('admin.dashboard')}
                                    onClick={onClose}
                                    className="text-center py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-[#009E49] hover:text-[#009E49] transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={onClose}
                                    className="text-center py-2 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href={route('login')}
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 bg-[#009E49] hover:bg-[#007F3B] text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-98"
                        >
                            <User className="w-4 h-4" />
                            <span>Login / Register</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
