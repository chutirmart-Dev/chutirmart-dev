import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart, Search, Heart, User, Box, ChevronDown, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LiveSearchBar } from '@/components/LiveSearchBar';

export const Header: React.FC = () => {
    const { store_settings, auth } = usePage().props as any;
    const { cartCount, setIsCartOpen } = useCart();
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
        <header className="bg-white shadow-sm sticky top-0 z-40">
            {/* Top Bar / Brand section */}
            <div className="container py-3 md:py-4 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href={route('home')} className="flex items-center shrink-0 select-none no-underline">
                    {store_settings?.site_logo ? (
                        <img 
                            src={store_settings.site_logo} 
                            alt={store_settings.site_name || "ChutirMart"} 
                            className="h-10 md:h-12 w-auto object-contain" 
                            onError={e => {
                                (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-start leading-none gap-0.5">
                            <div className="text-xl md:text-2xl font-black tracking-tight flex items-center">
                                <span className="text-primary font-bangla">ছুটির</span>
                                <span className="text-destructive font-bangla">মার্ট</span>
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wider font-latin">chutirmart</span>
                        </div>
                    )}
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-lg hidden md:block">
                    <LiveSearchBar />
                </div>

                {/* Utility Icons */}
                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Track Order */}
                    <button 
                        onClick={() => setIsTrackOpen(true)}
                        className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-primary group transition-colors focus:outline-none"
                    >
                        <Box className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                        <span className="text-[9px] font-semibold text-gray-500 group-hover:text-primary transition-colors">Track Order</span>
                    </button>

                    {/* Sign In / Admin */}
                    {auth?.user ? (
                        <Link 
                            href={route('admin.dashboard')} 
                            className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-primary group transition-colors"
                        >
                            <User className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-semibold text-gray-500 group-hover:text-primary transition-colors">Admin</span>
                        </Link>
                    ) : (
                        <Link 
                            href={route('admin.login')} 
                            className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-primary group transition-colors"
                        >
                            <User className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-semibold text-gray-500 group-hover:text-primary transition-colors">Sign In</span>
                        </Link>
                    )}

                    {/* Wishlist */}
                    <Link 
                        href={route('shop')} 
                        className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-primary group transition-colors"
                    >
                        <Heart className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                        <span className="text-[9px] font-semibold text-gray-500 group-hover:text-primary transition-colors">Wishlist</span>
                    </Link>

                    {/* Cart Trigger */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-primary group relative transition-colors focus:outline-none"
                    >
                        <div className="relative">
                            <ShoppingCart className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] font-semibold text-gray-500 group-hover:text-primary transition-colors">Cart</span>
                    </button>

                    {/* More Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-primary group transition-colors focus:outline-none">
                            <Menu className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-semibold text-gray-500 group-hover:text-primary transition-colors flex items-center gap-0.5">
                                More <ChevronDown className="w-2.5 h-2.5" />
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href={route('about')} className="w-full h-full block">আমাদের সম্পর্কে</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href={route('terms')} className="w-full h-full block">শর্তাবলী ও পলিসি</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                <div className="container relative z-10 flex justify-between">
                    {/* Left category section links */}
                    <div className="flex flex-1 justify-start gap-4 py-2">
                        <Link href={route('shop')} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            All Products
                        </Link>
                        <Link href={route('shop', {category: 'home-kitchen'})} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            Home & kitchen
                        </Link>
                        <Link href={route('shop', {category: 'smart-gadgets'})} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            Smart Gadget
                        </Link>
                        <Link href={route('shop', {category: 'offer-products'})} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            Offer Products
                        </Link>
                    </div>

                    {/* Right promotion section links */}
                    <div className="flex justify-end gap-4 py-2">
                        <Link href={route('shop', {category: 'summer-products'})} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            Summer Products
                        </Link>
                        <Link href={route('shop', {category: 'featured-products'})} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            Feature Products
                        </Link>
                        <Link href={route('shop', {category: 'flash-products'})} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
                            Flash Products
                        </Link>
                        <Link href={route('about')} prefetch className="text-white hover:text-white/90 text-xs font-medium font-latin">
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
        </header>
    );
};
