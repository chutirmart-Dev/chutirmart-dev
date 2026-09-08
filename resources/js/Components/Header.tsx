import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart, ShoppingBag, Search, Heart, User, Box, ChevronDown, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LiveSearchBar } from '@/components/LiveSearchBar';
import { MobileMenu } from '@/components/MobileMenu';

export const Header: React.FC = () => {
    const { store_settings, auth } = usePage().props as any;
    const { cartCount, setIsCartOpen } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTrackOpen, setIsTrackOpen] = useState(false);
    const [trackOrderNum, setTrackOrderNum] = useState('');
    const [trackMobile, setTrackMobile] = useState('');

    const handleTrackOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackOrderNum.trim() && trackMobile.trim()) {
            setIsTrackOpen(false);
            router.post(route('order.track'), {
                order_number: trackOrderNum,
                mobile: trackMobile
            });
        }
    };

    return (
        <header className="bg-white sticky top-0 z-40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border-b border-gray-100/80 transition-shadow">
            {/* Top Bar / Brand section */}
            <div className="container py-2 sm:py-3 md:py-4 flex items-center justify-between gap-1.5 xs:gap-2.5 sm:gap-4">
                {/* Left Section: Mobile Hamburger Button + Logo */}
                <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
                    {/* Modern Clean Hamburger Button (Mobile Only) */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-1.5 xs:p-2 border border-gray-200 hover:border-[#009E49] rounded-lg text-gray-800 hover:text-[#009E49] transition-all duration-150 focus:outline-none cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                        aria-label="Open mobile menu"
                    >
                        <Menu className="w-4.5 h-4.5 xs:w-5 xs:h-5 stroke-[2]" />
                    </button>

                    {/* Logo */}
                    <Link href={route('home')} className="flex items-center shrink-0 select-none no-underline">
                        {store_settings?.site_logo ? (
                            <img 
                                src={store_settings.site_logo} 
                                alt={store_settings.site_name || "ChutirMart"} 
                                className="h-8 xs:h-9 sm:h-10 md:h-12 w-auto object-contain" 
                                onError={e => {
                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="text-lg xs:text-xl md:text-2xl font-black tracking-tight flex items-center">
                                    <span className="text-primary font-bangla">ছুটির</span>
                                    <span className="text-destructive font-bangla">মার্ট</span>
                                </div>
                                <span className="text-[9px] xs:text-[10px] md:text-xs font-bold text-gray-500 tracking-wider font-latin">chutirmart</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Search Bar - Cleanly centered with proportional width on wider container */}
                <div className="w-full max-w-[500px] lg:max-w-[560px] xl:max-w-[620px] hidden md:block mx-auto">
                    <LiveSearchBar />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-4.5 lg:gap-5 shrink-0">
                    {/* Order Inquiry & Big Bold Phone Number (Desktop Only) */}
                    <a 
                        href="tel:+8801705105889" 
                        className="hidden md:flex flex-col items-start leading-tight hover:opacity-90 transition-opacity shrink-0 select-none no-underline"
                        title="Call for Order Inquiry"
                    >
                        <span className="text-[11px] sm:text-[12px] font-bold text-[#009E49] mb-0.5">Order Inquiry</span>
                        <span className="text-[17px] sm:text-[18px] lg:text-[20px] font-black text-gray-900 font-latin tracking-tight leading-none">
                            +880 1705-105889
                        </span>
                    </a>

                    {/* Wishlist Icon with Badge */}
                    <Link 
                        href={route('shop')} 
                        className="relative p-1 text-gray-800 hover:text-[#009E49] transition-colors focus:outline-none shrink-0"
                        title="Wishlist"
                    >
                        <Heart className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 stroke-[1.8]" />
                        <span className="absolute -top-0.5 -right-0.5 bg-[#009E49] text-white text-[9px] font-black w-4 h-4 xs:w-4.5 xs:h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs font-latin">
                            0
                        </span>
                    </Link>

                    {/* Cart Icon with Badge */}
                    <button 
                        type="button"
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-1 text-gray-800 hover:text-[#009E49] transition-colors focus:outline-none cursor-pointer shrink-0"
                        title="Cart"
                    >
                        <ShoppingBag className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 stroke-[1.8]" />
                        <span className="absolute -top-0.5 -right-0.5 bg-[#009E49] text-white text-[9px] font-black w-4 h-4 xs:w-4.5 xs:h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs font-latin">
                            {cartCount}
                        </span>
                    </button>

                    {/* Mobile User Icon (Replacing pill button on mobile) */}
                    <div className="md:hidden flex items-center shrink-0">
                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="p-1 text-gray-800 hover:text-[#009E49] transition-colors focus:outline-none cursor-pointer shrink-0">
                                    <User className="w-5 h-5 xs:w-5.5 xs:h-5.5 stroke-[1.8]" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.04)] border border-gray-200/90 p-1.5 min-w-[150px]">
                                    <div className="px-3 py-1.5 border-b border-gray-100 text-xs font-semibold text-gray-700">
                                        {auth.user.name}
                                    </div>
                                    <DropdownMenuItem className="cursor-pointer rounded-md font-medium">
                                        <Link href={route('dashboard')} className="w-full h-full block py-0.5">My Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer rounded-md font-medium">
                                        <Link href={route('logout')} method="post" as="button" className="w-full text-left text-red-600 py-0.5">
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link 
                                href={route('login')} 
                                className="p-1 text-gray-800 hover:text-[#009E49] transition-colors focus:outline-none shrink-0"
                                title="Login / Register"
                            >
                                <User className="w-5 h-5 xs:w-5.5 xs:h-5.5 stroke-[1.8]" />
                            </Link>
                        )}
                    </div>

                    {/* Desktop Login/Register Button matching Search Button's rounded corners */}
                    <div className="hidden md:flex items-center shrink-0">
                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="bg-[#009E49] hover:bg-[#007F3B] text-white px-4 sm:px-5 py-2.5 rounded-md text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 focus:outline-none">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="max-w-[90px] truncate">{auth.user.name}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white rounded-lg shadow-lg border border-gray-100 p-1.5 min-w-[150px]">
                                    <DropdownMenuItem className="cursor-pointer rounded-md font-medium">
                                        <Link href={route('dashboard')} className="w-full h-full block py-0.5">My Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer rounded-md font-medium">
                                        <Link href={route('logout')} method="post" as="button" className="w-full text-left text-red-600 py-0.5">
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link 
                                href={route('login')} 
                                className="bg-[#009E49] hover:bg-[#007F3B] text-white px-4 sm:px-5 py-2.5 rounded-md text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0 select-none no-underline cursor-pointer"
                            >
                                <User className="w-3.5 h-3.5" />
                                <span>Login/Register</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar Row */}
            <div className="container pb-3 md:hidden">
                <LiveSearchBar mobileMode />
            </div>

            {/* Navigation Bar (Dual-Tone accent strip) */}
            <nav className="relative overflow-hidden hidden md:block">
                {/* Background dual block wrapper */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-[#1E8A3C]" />
                    <div className="w-1/2 bg-[#D62828]" />
                </div>
                
                {/* Real nav items */}
                <div className="container relative z-10 flex items-center justify-between">
                    {/* Left category section links */}
                    <div className="w-1/2 flex items-center justify-start gap-4 lg:gap-7 xl:gap-8 py-2.5">
                        <Link href={route('shop')} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            All Products
                        </Link>
                        <Link href={route('shop', {category: 'home-kitchen'})} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            Home & kitchen
                        </Link>
                        <Link href={route('shop', {category: 'smart-gadgets'})} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            Smart Gadget
                        </Link>
                        <Link href={route('shop', {category: 'offer-products'})} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            Offer Products
                        </Link>
                    </div>

                    {/* Right promotion section links */}
                    <div className="w-1/2 flex items-center justify-end gap-4 lg:gap-7 xl:gap-8 py-2.5">
                        <Link href={route('shop', {category: 'summer-products'})} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            Summer Products
                        </Link>
                        <Link href={route('shop', {category: 'featured-products'})} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            Feature Products
                        </Link>
                        <Link href={route('shop', {category: 'flash-products'})} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            Flash Products
                        </Link>
                        <Link href={route('about')} prefetch className="text-white/95 hover:text-white text-xs lg:text-[13px] font-medium font-latin whitespace-nowrap transition-colors">
                            About Us
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Track Order Modal */}
            <Dialog open={isTrackOpen} onOpenChange={setIsTrackOpen}>
                <DialogContent className="bg-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-center">আপনার অর্ডার ট্র্যাক করুন</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTrackOrder} className="space-y-4 pt-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">অর্ডার নম্বর (যেমন: CHU-10245)</label>
                            <Input 
                                placeholder="অর্ডার নম্বর" 
                                value={trackOrderNum}
                                onChange={e => setTrackOrderNum(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">মোবাইল নম্বর</label>
                            <Input 
                                placeholder="মোবাইল নম্বর" 
                                value={trackMobile}
                                onChange={e => setTrackMobile(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white">
                            ট্র্যাক করুন →
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Mobile Menu Drawer */}
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
                onOpenTrackOrder={() => setIsTrackOpen(true)} 
            />
        </header>
    );
};
